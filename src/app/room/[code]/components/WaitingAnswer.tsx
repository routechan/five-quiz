'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { Player, Answer } from '@/types';

interface Props {
  players: Player[];
  answers: Answer[];
  isHost: boolean;
  roomCode: string;
  allSubmitted: boolean;
}

export function WaitingAnswer({ players, answers, isHost, roomCode, allSubmitted }: Props) {
  const [revealing, setRevealing] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);

  const sortedPlayers = [...players].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  const submittedIds = new Set(answers.map((a) => a.playerId));

  const handleReveal = async () => {
    setRevealing(true);
    try {
      await api.revealAnswers(roomCode);
    } catch {
      setRevealing(false);
    }
  };

  const handleKick = async (playerId: string) => {
    if (!confirm('このプレイヤーをキックしてBOTに置き換えますか？')) return;
    setKickingId(playerId);
    try {
      await api.kickPlayer(roomCode, playerId);
    } catch {
      // エラー時はリセット
    } finally {
      setKickingId(null);
    }
  };



  return (
    <div className="space-y-6 text-center animate-float-in">
      <h2
        className="text-xl font-extrabold"
        style={{ color: allSubmitted ? 'var(--color-primary)' : 'var(--color-text-primary)' }}
      >
        {allSubmitted ? '全員の回答が揃いました！' : '回答を待っています...'}
      </h2>

      {/* 各プレイヤーの提出状況 */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {sortedPlayers.map((player) => {
          const hasSubmitted = submittedIds.has(player.id);
          const canKick = isHost && !hasSubmitted && !player.isBot && !player.isHost;
          return (
            <div key={player.id} className="flex flex-col items-center gap-1">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center transition-all"
                style={{
                  border: `3px solid ${hasSubmitted ? 'var(--color-success)' : 'var(--color-secondary)'}`,
                  background: hasSubmitted ? 'rgba(34, 197, 94, 0.1)' : 'var(--color-bg-card)',
                }}
              >
                {hasSubmitted ? (
                  <span className="text-xl" style={{ color: 'var(--color-success)' }}>✓</span>
                ) : (
                  <span className="animate-pulse" style={{ color: 'var(--color-text-muted)' }}>...</span>
                )}
              </div>
              <span
                className="text-xs font-bold truncate max-w-[60px]"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {player.nickname}
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: hasSubmitted ? 'var(--color-success)' : 'var(--color-text-muted)' }}
              >
                {hasSubmitted ? '提出済み' : '入力中'}
              </span>
              {canKick && (
                <button
                  onClick={() => handleKick(player.id)}
                  disabled={kickingId === player.id}
                  className="text-xs px-2 py-0.5 rounded cursor-pointer"
                  style={{
                    background: 'var(--color-danger, #ef4444)',
                    color: 'white',
                    opacity: kickingId === player.id ? 0.5 : 1,
                  }}
                >
                  {kickingId === player.id ? '...' : 'キック'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>
        <span className="text-lg" style={{ color: 'var(--color-primary)' }}>{answers.length}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>/{players.length} 提出済み</span>
      </p>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {sortedPlayers.map((player) => (
          <div
            key={player.id}
            className={`w-3 h-3 rounded-full transition-all ${
              !submittedIds.has(player.id) ? 'animate-pulse' : ''
            }`}
            style={{
              background: submittedIds.has(player.id) ? 'var(--color-success)' : 'var(--color-secondary)',
            }}
          />
        ))}
      </div>

      {/* ホスト用: 回答を表示ボタン */}
      {allSubmitted && isHost && (
        <button
          onClick={handleReveal}
          disabled={revealing}
          className="btn-primary w-full py-4 text-xl cursor-pointer animate-pulse-glow"
        >
          {revealing ? '表示中...' : '回答を表示する'}
        </button>
      )}

      {allSubmitted && !isHost && (
        <p className="font-bold animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
          ホストが回答を表示するのを待っています...
        </p>
      )}
    </div>
  );
}
