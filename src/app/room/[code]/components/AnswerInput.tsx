'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const DrawingCanvas = dynamic(
  () => import('@/components/DrawingCanvas').then((mod) => mod.DrawingCanvas),
  { ssr: false, loading: () => <div className="w-75 h-75 mx-auto rounded-2xl" style={{ border: '4px solid var(--color-canvas)', background: 'white' }} /> }
);
import { AnswerSlot } from '@/components/AnswerSlot';
import { api } from '@/lib/api';
import { useSound } from '@/hooks/useSound';
import type { Room, Player } from '@/types';

interface Props {
  room: Room;
  players: Player[];
  currentPlayer: Player;
  currentQuiz: { id: string; question: string };
  roomCode: string;
}

export function AnswerInput({ room, players, currentPlayer, currentQuiz, roomCode }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { playQuestion } = useSound();

  useEffect(() => {
    playQuestion();
  }, [playQuestion]);

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    [players]
  );

  const handleSubmit = async (dataUrl: string) => {
    setError('');
    try {
      await api.submitAnswer(roomCode, dataUrl);
      setSubmitted(true);
    } catch {
      setError('回答の提出に失敗しました');
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center animate-pop-in py-12">
        <div
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl"
          style={{ background: 'var(--color-success)', color: 'white' }}
        >
          ✓
        </div>
        <p className="text-xl font-extrabold" style={{ color: 'var(--color-success)' }}>
          回答を提出しました！
        </p>
        <p className="font-bold" style={{ color: 'var(--color-text-muted)' }}>
          他のプレイヤーの回答を待っています...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-float-in">
      {/* 担当文字 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
          style={{ background: 'var(--color-canvas)', color: 'white' }}>
          <span className="font-extrabold text-lg">
            あなたは {currentPlayer.position}文字目 を担当
          </span>
        </div>
      </div>

      {/* 問題文 */}
      <div className="question-panel p-5">
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-canvas-light)' }}>
          Q.{room.questionCount}
        </p>
        <p className="font-extrabold text-lg text-white">{currentQuiz.question}</p>
      </div>

      {/* 回答欄プレビュー */}
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

      {/* 手書きキャンバス */}
      <DrawingCanvas onSubmit={handleSubmit} />

      {error && (
        <p className="text-sm text-center font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
    </div>
  );
}
