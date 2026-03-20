import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// GET /api/rooms/[code] - ルーム情報取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const supabase = createServerSupabase();
  const { code } = await params;

  try {
    // ルーム取得
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: { code: 'ROOM_NOT_FOUND', message: '指定されたルームが見つかりません' } },
        { status: 404 }
      );
    }

    // プレイヤー・回答・クイズを直列取得（コネクションプール節約）
    const { data: players } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .order('position', { ascending: true, nullsFirst: false });

    const needsAnswers = room.current_quiz_id && !['waiting', 'playing'].includes(room.status);
    const answerColumns = room.status === 'judging'
      ? 'id, room_id, quiz_id, player_id, drawing_data, is_correct'
      : 'id, room_id, quiz_id, player_id, is_correct';

    const answers: unknown[] = needsAnswers
      ? (await supabase
          .from('answers')
          .select(answerColumns)
          .eq('room_id', room.id)
          .eq('quiz_id', room.current_quiz_id)).data || []
      : [];

    const quiz = room.current_quiz_id
      ? (await supabase
          .from('quizzes')
          .select('id, question, answer')
          .eq('id', room.current_quiz_id)
          .single()).data
      : null;
    const currentQuiz = quiz
      ? {
          id: quiz.id,
          question: quiz.question,
          ...(room.status === 'judging' ? { answer: quiz.answer } : {}),
        }
      : null;

    return NextResponse.json({
      room: {
        id: room.id,
        roomCode: room.room_code,
        status: room.status,
        currentQuizId: room.current_quiz_id,
        correctCount: room.correct_count,
        questionCount: room.question_count,
      },
      players: (players || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        roomId: p.room_id,
        nickname: p.nickname,
        position: p.position,
        isHost: p.is_host,
        isBot: p.is_bot ?? false,
        isSpectator: p.is_spectator ?? false,
      })),
      answers: (answers as Record<string, unknown>[]).map((a) => ({
        id: a.id,
        roomId: a.room_id,
        quizId: a.quiz_id,
        playerId: a.player_id,
        ...(a.drawing_data !== undefined ? { drawingData: a.drawing_data } : {}),
        isCorrect: a.is_correct,
      })),
      currentQuiz,
    });
  } catch (error) {
    console.error('Room fetch error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'サーバーエラーが発生しました' } },
      { status: 500 }
    );
  }
}
