import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/add-bot - 空きスロットにBOTを追加
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

    // 待機中のみ追加可能
    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATUS', message: '待機中のみBOTを追加できます' } },
        { status: 400 }
      );
    }

    // 現在のプレイヤー数を確認
    const { data: players } = await supabase
      .from('players')
      .select('position')
      .eq('room_id', room.id)
      .order('position', { ascending: true });

    if (!players || players.length >= 5) {
      return NextResponse.json(
        { error: { code: 'ROOM_FULL', message: 'ルームが満員です' } },
        { status: 400 }
      );
    }

    // 空いているポジションを探す
    const usedPositions = new Set(players.map(p => p.position));
    let nextPosition = 1;
    for (let i = 1; i <= 5; i++) {
      if (!usedPositions.has(i)) {
        nextPosition = i;
        break;
      }
    }

    // BOTプレイヤーを挿入
    const { error: insertError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname: 'BOT',
        session_id: `bot-${crypto.randomUUID()}`,
        is_host: false,
        position: nextPosition,
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add bot error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
