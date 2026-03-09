import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// POST /api/rooms - ルーム作成
export async function POST(request: NextRequest) {
  const supabase = createServerSupabase();

  try {
    const { nickname, sessionId } = await request.json();

    if (!nickname || nickname.length === 0 || nickname.length > 10) {
      return NextResponse.json(
        { error: { code: 'INVALID_NICKNAME', message: 'ニックネームは1〜10文字で入力してください' } },
        { status: 400 }
      );
    }

    // 古いルームを自動削除
    await supabase.rpc('cleanup_old_rooms');

    // ルームコード生成
    const { data: codeData } = await supabase.rpc('generate_room_code');
    const roomCode = codeData || Math.random().toString(36).substring(2, 8).toUpperCase();

    // ルーム作成
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({ room_code: roomCode })
      .select()
      .single();

    if (roomError) throw roomError;

    // ホストプレイヤー作成
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        room_id: room.id,
        nickname,
        session_id: sessionId,
        is_host: true,
        position: 1,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    // ルームにホストIDを設定
    await supabase
      .from('rooms')
      .update({ host_player_id: player.id })
      .eq('id', room.id);

    return NextResponse.json(
      { roomCode: room.room_code, roomId: room.id, playerId: player.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Room creation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
