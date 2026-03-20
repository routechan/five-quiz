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

    // プレイヤー全員取得（既存確認 + 人数確認 + position確認を1回で）
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id, session_id, position, is_bot, is_spectator')
      .eq('room_id', room.id);

    // 既存プレイヤー確認
    const existingPlayer = (allPlayers || []).find(
      (p: { session_id: string }) => p.session_id === sessionId
    );

    if (existingPlayer) {
      return NextResponse.json({
        roomId: room.id,
        playerId: existingPlayer.id,
      });
    }

    // 参加人数確認（観戦者を除く）
    const activePlayers = (allPlayers || []).filter(
      (p: { is_spectator: boolean }) => !p.is_spectator
    );

    // 満員かつBOTがいれば1体削除して空きを作る
    if (activePlayers.length >= 5) {
      const bot = activePlayers.find((p: { is_bot: boolean }) => p.is_bot);
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
      // 初回はメモリ上のデータを使い、リトライ時のみ再取得
      let usedPositions: (number | null)[];
      if (attempt === 0) {
        usedPositions = activePlayers.map((p: { position: number | null }) => p.position);
      } else {
        const { data: retryPlayers } = await supabase
          .from('players')
          .select('position')
          .eq('room_id', room.id)
          .eq('is_spectator', false);
        usedPositions = (retryPlayers || []).map((p: { position: number | null }) => p.position);
      }

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
