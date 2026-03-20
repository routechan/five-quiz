import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms/[code]/spectate - 観戦者として参加
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

    // 既存プレイヤー確認（既に参加済みならそのまま返す）
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
        isSpectator: existingPlayer.is_spectator,
      });
    }

    // 観戦者として作成（position なし、is_spectator = true）
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname,
        session_id: sessionId,
        is_host: false,
        is_spectator: true,
        position: null,
      })
      .select()
      .single();

    if (error) throw error;

    // rooms を touch して Realtime 通知をトリガー
    await supabase
      .from('rooms')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', room.id);

    return NextResponse.json({
      roomId: room.id,
      playerId: player.id,
      isSpectator: true,
    });
  } catch (error) {
    console.error('Spectate room error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
