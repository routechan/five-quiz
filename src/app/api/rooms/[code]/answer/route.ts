import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/answer - 回答提出
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId, drawingData } = await request.json();

    if (!drawingData) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: '描画データが空です' } },
        { status: 400 }
      );
    }

    const { data: room } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (!room) {
      return NextResponse.json(
        { error: { code: 'ROOM_NOT_FOUND', message: 'ルームが見つかりません' } },
        { status: 404 }
      );
    }

    // プレイヤー全員取得（自分の確認 + ダミー判定を1回で）
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id, session_id, position, is_spectator')
      .eq('room_id', room.id);

    const player = (allPlayers || []).find(
      (p: { session_id: string }) => p.session_id === sessionId
    );

    if (!player) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'プレイヤーが見つかりません' } },
        { status: 404 }
      );
    }

    // 回答保存（upsert で重複時は無視 → 既提出チェック不要）
    const { data: answer, error } = await supabase
      .from('answers')
      .upsert(
        {
          room_id: room.id,
          quiz_id: room.current_quiz_id,
          player_id: player.id,
          drawing_data: drawingData,
        },
        { onConflict: 'room_id,quiz_id,player_id', ignoreDuplicates: true }
      )
      .select()
      .single();

    if (error) throw error;

    // ダミープレイヤーの回答を自動投入（正解の文字を保存）
    const dummyPlayers = (allPlayers || []).filter(
      (p: { session_id: string }) => p.session_id.startsWith('dev-dummy-') || p.session_id.startsWith('bot-')
    );

    if (dummyPlayers.length > 0 && room.current_quiz_id) {
      // クイズの正解を取得
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('answer')
        .eq('id', room.current_quiz_id)
        .single();

      const answerChars = quiz?.answer ? [...quiz.answer] : [];

      // ダミーの回答を一括 upsert（重複は無視）
      const newAnswers = dummyPlayers
        .map((dummy: { id: string; position: number | null }) => ({
          room_id: room.id,
          quiz_id: room.current_quiz_id,
          player_id: dummy.id,
          drawing_data: `dummy:${answerChars[(dummy.position ?? 1) - 1] || '?'}`,
        }));

      if (newAnswers.length > 0) {
        await supabase
          .from('answers')
          .upsert(newAnswers, { onConflict: 'room_id,quiz_id,player_id', ignoreDuplicates: true });
      }
    }

    // 全員提出したか確認（並列で取得）
    const activePlayerCount = (allPlayers || []).filter(
      (p: { is_spectator: boolean }) => !p.is_spectator
    ).length;

    const { count } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('quiz_id', room.current_quiz_id);

    const playerCount = activePlayerCount;

    // 全員提出完了 → answered状態へ（ホストが回答表示するまで待機）
    if (count === playerCount) {
      await supabase
        .from('rooms')
        .update({ status: 'answered' })
        .eq('id', room.id);
    } else if (room.status === 'playing') {
      // playing → answering へ
      await supabase
        .from('rooms')
        .update({ status: 'answering' })
        .eq('id', room.id);
    }

    return NextResponse.json({
      success: true,
      answerId: answer.id,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
