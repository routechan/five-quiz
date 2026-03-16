import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/start - ゲーム開始
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId } = await request.json();

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

    // 5人確認（観戦者を除く）
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('is_spectator', false);

    if (!players || players.length < 5) {
      return NextResponse.json(
        { error: { code: 'NOT_ENOUGH_PLAYERS', message: '5人揃っていません' } },
        { status: 400 }
      );
    }

    // 全員のポジション確認
    const allPositioned = players.every((p: { position: number | null }) => p.position !== null);
    if (!allPositioned) {
      return NextResponse.json(
        { error: { code: 'POSITIONS_NOT_SET', message: '全員の順番が設定されていません' } },
        { status: 400 }
      );
    }

    // ランダムクイズ取得
    const { data: quizData } = await supabase.rpc('get_random_quiz', {
      p_room_id: room.id,
    });

    if (!quizData || quizData.length === 0) {
      return NextResponse.json(
        { error: { code: 'NO_QUIZ_AVAILABLE', message: '出題可能なクイズがありません' } },
        { status: 404 }
      );
    }

    const quiz = quizData[0];

    // 出題済みに登録
    await supabase.from('used_quizzes').insert({
      room_id: room.id,
      quiz_id: quiz.id,
    });

    // ルーム状態更新
    await supabase
      .from('rooms')
      .update({
        status: 'playing',
        current_quiz_id: quiz.id,
        question_count: room.question_count + 1,
      })
      .eq('id', room.id);

    return NextResponse.json({
      success: true,
      quiz: { id: quiz.id, question: quiz.question },
    });
  } catch (error) {
    console.error('Start game error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
