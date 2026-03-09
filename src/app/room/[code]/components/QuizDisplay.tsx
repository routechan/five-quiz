'use client';

import { AnswerSlot } from '@/components/AnswerSlot';
import type { Room, Player } from '@/types';

interface Props {
  room: Room;
  players: Player[];
  currentPlayer: Player;
  currentQuiz: { id: string; question: string };
}

export function QuizDisplay({ room, players, currentPlayer, currentQuiz }: Props) {
  const sortedPlayers = [...players].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  return (
    <div className="space-y-6 text-center">
      {/* 問題番号 */}
      <div className="flex justify-between items-center">
        <span className="text-amber-400 font-bold text-lg">
          Q.{room.questionCount}
        </span>
        <span className="text-gray-400 text-sm">
          正解数: <span className="text-amber-400 font-bold">{room.correctCount}</span>
        </span>
      </div>

      {/* 問題文 */}
      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-white text-xl font-bold leading-relaxed">
          {currentQuiz.question}
        </p>
      </div>

      {/* 回答欄 */}
      <div className="flex justify-center gap-2 sm:gap-4">
        {sortedPlayers.map((player) => (
          <AnswerSlot
            key={player.id}
            position={player.position ?? 0}
            player={player}
            isCurrentUser={player.id === currentPlayer.id}
          />
        ))}
      </div>

      {/* 自動遷移メッセージ */}
      <p className="text-gray-400 text-sm animate-pulse">
        まもなく回答画面に切り替わります...
      </p>
    </div>
  );
}
