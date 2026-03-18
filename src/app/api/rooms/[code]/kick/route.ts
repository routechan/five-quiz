import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/kick - プレイヤーキック＆BOT置換
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId, targetPlayerId } = await request.json();

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

    // ホスト確認
    const { data: host } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .eq('is_host', true)
      .single();

    if (!host) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'ホストのみ実行できます' } },
        { status: 403 }
      );
    }

    // キック対象のプレイヤー情報を取得（position を保存するため）
    const { data: targetPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('id', targetPlayerId)
      .eq('room_id', room.id)
      .single();

    if (!targetPlayer) {
      return NextResponse.json(
        { error: { code: 'PLAYER_NOT_FOUND', message: 'プレイヤーが見つかりません' } },
        { status: 404 }
      );
    }

    // ホスト自身はキックできない
    if (targetPlayer.is_host) {
      return NextResponse.json(
        { error: { code: 'CANNOT_KICK_HOST', message: 'ホストはキックできません' } },
        { status: 400 }
      );
    }

    const targetPosition = targetPlayer.position;

    // プレイヤーを削除（CASCADE で answers も削除される）
    const { error: deleteError } = await supabase
      .from('players')
      .delete()
      .eq('id', targetPlayerId)
      .eq('room_id', room.id);

    if (deleteError) throw deleteError;

    // 待機中はBOT置換不要（プレイヤー削除のみ）
    if (room.status === 'waiting') {
      return NextResponse.json({ success: true });
    }

    // BOTプレイヤーを同じ position で挿入
    const { data: botPlayer, error: insertError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname: 'BOT',
        session_id: `dev-dummy-${crypto.randomUUID()}`,
        is_host: false,
        is_bot: true,
        position: targetPosition,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // ゲーム進行中の場合、BOTの回答を自動処理
    if (['playing', 'answering'].includes(room.status) && room.current_quiz_id) {
      // クイズの正解を取得
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('answer')
        .eq('id', room.current_quiz_id)
        .single();

      const answerChars = quiz?.answer ? [...quiz.answer] : [];
      const correctChar = answerChars[(targetPosition ?? 1) - 1] || '?';

      // BOTの回答を挿入
      await supabase.from('answers').insert({
        room_id: room.id,
        quiz_id: room.current_quiz_id,
        player_id: botPlayer.id,
        drawing_data: `dummy:${correctChar}`,
      });

      // 全員提出したか確認
      const { count: answerCount } = await supabase
        .from('answers')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('quiz_id', room.current_quiz_id);

      const { count: playerCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('is_spectator', false);

      if (answerCount === playerCount) {
        await supabase
          .from('rooms')
          .update({ status: 'answered' })
          .eq('id', room.id);
      }
    }

    // judging 状態の場合、BOTの回答を自動投入＆自動判定
    if (room.status === 'judging' && room.current_quiz_id) {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('answer')
        .eq('id', room.current_quiz_id)
        .single();

      const answerChars = quiz?.answer ? [...quiz.answer] : [];
      const correctChar = answerChars[(targetPosition ?? 1) - 1] || '?';

      await supabase.from('answers').insert({
        room_id: room.id,
        quiz_id: room.current_quiz_id,
        player_id: botPlayer.id,
        drawing_data: `dummy:${correctChar}`,
        is_correct: true,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kick player error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
