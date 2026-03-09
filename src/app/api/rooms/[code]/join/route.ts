import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/join - ルーム参加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { nickname, sessionId } = await request.json();

    if (!nickname || nickname.length === 0 || nickname.length > 10) {
      return NextResponse.json(
        { error: { code: 'INVALID_NICKNAME', message: 'ニックネームは1〜10文字で入力してください' } },
        { status: 400 }
      );
    }

    // ルーム取得
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

    if (room.status !== 'waiting') {
      return NextResponse.json(
        { error: { code: 'GAME_ALREADY_STARTED', message: 'ゲームは既に開始されています' } },
        { status: 409 }
      );
    }

    // 既存プレイヤー確認
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .eq('session_id', sessionId)
      .single();

    if (existingPlayer) {
      return NextResponse.json({
        roomId: room.id,
        playerId: existingPlayer.id,
      });
    }

    // 参加人数確認
    const { count } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);

    if ((count || 0) >= 5) {
      return NextResponse.json(
        { error: { code: 'ROOM_FULL', message: 'ルームが満員です' } },
        { status: 409 }
      );
    }

    // 次の空きポジション
    const { data: players } = await supabase
      .from('players')
      .select('position')
      .eq('room_id', room.id);

    const usedPositions = (players || []).map((p: { position: number | null }) => p.position).filter(Boolean);
    let nextPosition = 1;
    for (let i = 1; i <= 5; i++) {
      if (!usedPositions.includes(i)) {
        nextPosition = i;
        break;
      }
    }

    // プレイヤー作成
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname,
        session_id: sessionId,
        is_host: false,
        position: nextPosition,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      roomId: room.id,
      playerId: player.id,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
