import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// PATCH /api/rooms/[code]/positions - 順番変更
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId, positions } = await request.json();

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

    // バリデーション
    const positionValues = positions.map((p: { position: number }) => p.position);
    const validPositions = [1, 2, 3, 4, 5];
    const isValid = positionValues.every((p: number) => validPositions.includes(p))
      && new Set(positionValues).size === positionValues.length;

    if (!isValid) {
      return NextResponse.json(
        { error: { code: 'INVALID_POSITION', message: '位置は1〜5の重複なしで指定してください' } },
        { status: 400 }
      );
    }

    // 一旦全員のpositionをnullに
    await supabase
      .from('players')
      .update({ position: null })
      .eq('room_id', room.id);

    // 順番更新
    for (const { playerId, position } of positions) {
      await supabase
        .from('players')
        .update({ position })
        .eq('id', playerId)
        .eq('room_id', room.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update positions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
