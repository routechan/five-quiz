import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/end - ゲーム終了
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

    await supabase
      .from('rooms')
      .update({ status: 'finished' })
      .eq('id', room.id);

    return NextResponse.json({
      success: true,
      result: {
        correctCount: room.correct_count,
        questionCount: room.question_count,
      },
    });
  } catch (error) {
    console.error('End game error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
