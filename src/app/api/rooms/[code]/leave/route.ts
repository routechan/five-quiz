import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/leave - ルーム退出
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

    // ホストが退出 → ルーム終了
    if (player.is_host) {
      await supabase
        .from('rooms')
        .update({ status: 'finished' })
        .eq('id', room.id);

      return NextResponse.json({ success: true, roomClosed: true });
    }

    // 一般プレイヤー退出
    await supabase.from('players').delete().eq('id', player.id);

    // rooms を touch して Realtime 通知をトリガー
    await supabase
      .from('rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', room.id);

    return NextResponse.json({ success: true, roomClosed: false });
  } catch (error) {
    console.error('Leave room error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
