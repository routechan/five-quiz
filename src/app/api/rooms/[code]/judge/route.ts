import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// PATCH /api/rooms/[code]/judge - 正誤判定
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId, isCorrect } = await request.json();

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

    // 回答を更新
    const { error } = await supabase
      .from('answers')
      .update({ is_correct: isCorrect })
      .eq('room_id', room.id)
      .eq('quiz_id', room.current_quiz_id)
      .eq('player_id', player.id);

    if (error) throw error;

    // ダミープレイヤーの判定を自動で正解にする
    {
      const { data: allPlayers } = await supabase
        .from('players')
        .select('id, session_id')
        .eq('room_id', room.id);

      const dummyIds = (allPlayers || [])
        .filter((p: { session_id: string }) => p.session_id.startsWith('dev-dummy-') || p.session_id.startsWith('bot-'))
        .map((p: { id: string }) => p.id);

      if (dummyIds.length > 0) {
        for (const dummyId of dummyIds) {
          await supabase
            .from('answers')
            .update({ is_correct: true })
            .eq('room_id', room.id)
            .eq('quiz_id', room.current_quiz_id)
            .eq('player_id', dummyId)
            .is('is_correct', null);
        }
      }
    }

    // 全員判定完了か確認
    const { data: answers } = await supabase
      .from('answers')
      .select('is_correct')
      .eq('room_id', room.id)
      .eq('quiz_id', room.current_quiz_id);

    const allJudged = answers?.every(
      (a: { is_correct: boolean | null }) => a.is_correct !== null
    ) ?? false;

    let teamCorrect: boolean | null = null;

    if (allJudged && answers) {
      teamCorrect = answers.every(
        (a: { is_correct: boolean | null }) => a.is_correct === true
      );

      // チーム正解の場合、カウント増加
      if (teamCorrect) {
        await supabase
          .from('rooms')
          .update({ correct_count: room.correct_count + 1 })
          .eq('id', room.id);
      }
    }

    return NextResponse.json({
      success: true,
      allJudged,
      teamCorrect,
    });
  } catch (error) {
    console.error('Judge answer error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
