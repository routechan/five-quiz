import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const BOT_NAMES = ["ジュン", "タイゾウ", "ケン", "オサム"];

// POST /api/rooms/[code]/add-bot - BOTで5人まで埋める
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    const { sessionId } = await request.json();

    const { data: room } = await supabase
      .from("rooms")
      .select("*")
      .eq("room_code", code)
      .single();

    if (!room) {
      return NextResponse.json(
        {
          error: { code: "ROOM_NOT_FOUND", message: "ルームが見つかりません" },
        },
        { status: 404 }
      );
    }

    // ホスト確認
    const { data: host } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", room.id)
      .eq("session_id", sessionId)
      .eq("is_host", true)
      .single();

    if (!host) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "ホストのみ実行できます" } },
        { status: 403 }
      );
    }

    // 待機中のみ追加可能
    if (room.status !== "waiting") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_STATUS",
            message: "待機中のみBOTを追加できます",
          },
        },
        { status: 400 }
      );
    }

    // 現在のプレイヤー数を確認（観戦者を除く）
    const { data: players } = await supabase
      .from("players")
      .select("position")
      .eq("room_id", room.id)
      .eq("is_spectator", false);

    const currentCount = players?.length || 0;
    const needed = 5 - currentCount;

    if (needed <= 0) {
      return NextResponse.json({ success: true, added: 0 });
    }

    const usedPositions = (players || [])
      .map((p: { position: number | null }) => p.position)
      .filter(Boolean) as number[];

    const availablePositions: number[] = [];
    for (let i = 1; i <= 5; i++) {
      if (!usedPositions.includes(i)) availablePositions.push(i);
    }

    const inserts = [];
    for (let i = 0; i < needed; i++) {
      inserts.push({
        room_id: room.id,
        nickname: BOT_NAMES[i] || `BOT${i + 1}`,
        session_id: `bot-${crypto.randomUUID()}`,
        is_host: false,
        position: availablePositions[i],
      });
    }

    const { error: insertError } = await supabase
      .from("players")
      .insert(inserts);
    if (insertError) throw insertError;

    return NextResponse.json({ success: true, added: needed });
  } catch (error) {
    console.error("Add bot error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "サーバーエラーが発生しました",
        },
      },
      { status: 500 }
    );
  }
}
