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

    // 参加人数確認（観戦者を除く）
    const { data: currentPlayers } = await supabase
      .from('players')
      .select('id, position, is_bot')
      .eq('room_id', room.id)
      .eq('is_spectator', false);

    const playerCount = currentPlayers?.length || 0;

    // 満員かつBOTがいれば1体削除して空きを作る
    if (playerCount >= 5) {
      const bot = (currentPlayers || []).find((p: { is_bot: boolean }) => p.is_bot);
      if (bot) {
        await supabase.from('players').delete().eq('id', bot.id);
      } else {
        return NextResponse.json(
          { error: { code: 'ROOM_FULL', message: 'ルームが満員です（観戦モードで参加できます）' } },
          { status: 409 }
        );
      }
    }

    // 空きポジションを見つけてプレイヤー作成（競合時リトライ）
    let player = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: players } = await supabase
        .from('players')
        .select('position')
        .eq('room_id', room.id)
        .eq('is_spectator', false);

      const usedPositions = (players || []).map((p: { position: number | null }) => p.position).filter(Boolean);
      let nextPosition = 1;
      for (let i = 1; i <= 5; i++) {
        if (!usedPositions.includes(i)) {
          nextPosition = i;
          break;
        }
      }

      const { data, error } = await supabase
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

      if (!error) {
        player = data;
        break;
      }

      // position の競合エラー以外はそのまま throw
      if (!error.message?.includes('idx_players_room_position')) {
        throw error;
      }
      // 競合の場合はリトライ
    }

    if (!player) {
      return NextResponse.json(
        { error: { code: 'ROOM_FULL', message: 'ルームが満員です' } },
        { status: 409 }
      );
    }

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
