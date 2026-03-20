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

    // プレイヤー確認
    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .single();

    if (!player) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'プレイヤーが見つかりません' } },
        { status: 404 }
      );
    }

    // 既に提出済みか確認
    const { data: existing } = await supabase
      .from('answers')
      .select('id')
      .eq('room_id', room.id)
      .eq('quiz_id', room.current_quiz_id)
      .eq('player_id', player.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: { code: 'ALREADY_SUBMITTED', message: '既に回答を提出しています' } },
        { status: 400 }
      );
    }

    // 回答保存
    const { data: answer, error } = await supabase
      .from('answers')
      .insert({
        room_id: room.id,
        quiz_id: room.current_quiz_id,
        player_id: player.id,
        drawing_data: drawingData,
      })
      .select()
      .single();

    if (error) throw error;

    // ダミープレイヤーの回答を自動投入（正解の文字を保存）
    {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, session_id, position')
        .eq('room_id', room.id);

      const dummyPlayers = (allPlayers || []).filter(
        (p: { session_id: string }) => p.session_id.startsWith('dev-dummy-') || p.session_id.startsWith('bot-')
      );

      if (dummyPlayers.length > 0) {
        // クイズの正解を取得
        const { data: quiz } = await supabase
          .from('quizzes')
          .select('answer')
          .eq('id', room.current_quiz_id)
          .single();

        const answerChars = quiz?.answer ? [...quiz.answer] : [];

        // 既に回答済みのダミーを一括取得
        const dummyIds = dummyPlayers.map((p: { id: string }) => p.id);
        const { data: existingAnswers } = await supabase
          .from('answers')
          .select('player_id')
          .eq('room_id', room.id)
          .eq('quiz_id', room.current_quiz_id)
          .in('player_id', dummyIds);

        const existingPlayerIds = new Set((existingAnswers || []).map((a: { player_id: string }) => a.player_id));

        // 未回答のダミーの回答を一括INSERT
        const newAnswers = dummyPlayers
          .filter((dummy: { id: string }) => !existingPlayerIds.has(dummy.id))
          .map((dummy: { id: string; position: number | null }) => ({
            room_id: room.id,
            quiz_id: room.current_quiz_id,
            player_id: dummy.id,
            drawing_data: `dummy:${answerChars[(dummy.position ?? 1) - 1] || '?'}`,
          }));

        if (newAnswers.length > 0) {
          await supabase.from('answers').insert(newAnswers);
        }
      }
    }

    // 全員提出したか確認
    const { count } = await supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('quiz_id', room.current_quiz_id);

    const { count: playerCount } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id)
      .eq('is_spectator', false);

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
