import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

const DUMMY_NAMES = ["ジュン", "タイゾウ", "ケン", "オサム"];

// POST /api/rooms/[code]/dev-fill - ダミープレイヤーで5人まで埋める
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
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

    // 現在のプレイヤー数
    const { data: players } = await supabase
      .from("players")
      .select("position")
      .eq("room_id", room.id);

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
        nickname: DUMMY_NAMES[i] || `テスト${i + 2}`,
        session_id: `dev-dummy-${crypto.randomUUID()}`,
        is_host: false,
        position: availablePositions[i],
      });
    }

    await supabase.from("players").insert(inserts);

    return NextResponse.json({ success: true, added: needed });
  } catch (error) {
    console.error("Dev fill error:", error);
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
