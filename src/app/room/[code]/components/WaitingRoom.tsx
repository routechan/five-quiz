'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { PlayerCard } from '@/components/PlayerCard';
import type { Room, Player } from '@/types';

interface Props {
  room: Room;
  players: Player[];
  spectators?: Player[];
  currentPlayer: Player;
  isHost: boolean;
  roomCode: string;
  onRefetch?: () => void;
}

export function WaitingRoom({ room, players, spectators = [], currentPlayer, isHost, roomCode, onRefetch }: Props) {
  const [starting, setStarting] = useState(false);
  const [addingBot, setAddingBot] = useState(false);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const touchStartY = useRef<number>(0);
  const touchCurrentElement = useRef<HTMLElement | null>(null);
  const playerListRef = useRef<HTMLDivElement>(null);

  const sortedPlayers = [...players].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}/nickname`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleKick = async (playerId: string) => {
    if (!confirm('このプレイヤーをキックしますか？')) return;
    setKickingId(playerId);
    try {
      await api.kickPlayer(roomCode, playerId);
      onRefetch?.();
    } catch {
      // エラー時はリセット
    } finally {
      setKickingId(null);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    setError('');
    try {
      await api.startGame(roomCode);
    } catch (err: unknown) {
      const apiErr = err as { error?: { message?: string } };
      setError(apiErr?.error?.message || 'ゲーム開始に失敗しました');
      setStarting(false);
    }
  };

  const applyReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newPlayers = [...sortedPlayers];
    const [moved] = newPlayers.splice(fromIndex, 1);
    newPlayers.splice(toIndex, 0, moved);
    const positions = newPlayers.map((p, i) => ({
      playerId: p.id,
      position: i + 1,
    }));
    await api.updatePositions(roomCode, positions);
  };

  // Drag handlers (desktop)
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (index: number) => {
    const from = dragItemRef.current;
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
    if (from !== null) {
      await applyReorder(from, index);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  // Touch handlers (mobile)
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!isHost) return;
    dragItemRef.current = index;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentElement.current = e.currentTarget as HTMLElement;
    setDragIndex(index);
  };

  useEffect(() => {
    const el = playerListRef.current;
    if (!el || !isHost) return;
    const onTouchMove = (e: TouchEvent) => {
      if (dragItemRef.current === null) return;
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const elements = document.querySelectorAll('[data-player-index]');
      for (const elem of elements) {
        const rect = elem.getBoundingClientRect();
        if (touchY >= rect.top && touchY <= rect.bottom) {
          const idx = parseInt(elem.getAttribute('data-player-index') || '-1');
          if (idx >= 0) setDragOverIndex(idx);
          break;
        }
      }
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [isHost]);

  const handleTouchEnd = async () => {
    const from = dragItemRef.current;
    const to = dragOverIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
    touchCurrentElement.current = null;
    if (from !== null && to !== null) {
      await applyReorder(from, to);
    }
  };

  return (
    <div className="space-y-6 animate-float-in">
      {/* ルーム情報 */}
      <div className="quiz-card-primary p-5 text-center">
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>
          ルームコード
        </p>
        <p
          className="text-3xl tracking-[0.3em] mb-3"
          style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
        >
          {room.roomCode}
        </p>
        <button
          onClick={handleCopyLink}
          className="btn-canvas px-5 py-2 text-sm cursor-pointer"
        >
          {copied ? '✓ コピーしました！' : '招待リンクをコピー'}
        </button>
      </div>

      {/* 参加者一覧 */}
      <div className="quiz-card p-5">
        <h2
          className="font-extrabold text-lg mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm"
            style={{ background: 'var(--color-canvas)' }}
          >
            {players.length}
          </span>
          参加者
          <span style={{ color: 'var(--color-text-muted)' }}>/ 5</span>
        </h2>

        <div ref={playerListRef} className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div
              key={player.id}
              data-player-index={index}
              draggable={isHost}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchEnd={handleTouchEnd}
              className="flex items-center gap-2 transition-all"
              style={{
                opacity: dragIndex === index ? 0.4 : 1,
                transform: dragOverIndex === index && dragIndex !== index ? 'scale(1.02)' : 'none',
                borderTop: dragOverIndex === index && dragIndex !== null && dragIndex > index
                  ? '3px solid var(--color-canvas)'
                  : '3px solid transparent',
                borderBottom: dragOverIndex === index && dragIndex !== null && dragIndex < index
                  ? '3px solid var(--color-canvas)'
                  : '3px solid transparent',
                cursor: isHost ? 'grab' : 'default',
              }}
            >
              {isHost && (
                <span
                  className="text-sm select-none flex-shrink-0"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  ☰
                </span>
              )}
              <PlayerCard
                player={player}
                isCurrentUser={player.id === currentPlayer.id}
              />
              {isHost && !player.isHost && !player.isBot && player.id !== currentPlayer.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleKick(player.id); }}
                  disabled={kickingId === player.id}
                  className="text-xs px-2 py-1 rounded cursor-pointer flex-shrink-0"
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
          ))}

          {/* 空きスロット */}
          {Array.from({ length: 5 - players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 p-3 rounded-xl opacity-50"
              style={{ background: 'var(--color-bg-card)', border: '2px dashed var(--color-secondary)' }}
            >
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
                待機中...
              </span>
            </div>
          ))}
        </div>

        {isHost && (
          <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
            ※ ドラッグで順番を変更できます
          </p>
        )}
      </div>

      {/* BOT追加 */}
      {isHost && players.length < 5 && (
        <button
          onClick={async () => {
            setAddingBot(true);
            setError('');
            try {
              await api.addBot(roomCode);
            } catch (err: unknown) {
              const apiErr = err as { error?: { message?: string } };
              setError(apiErr?.error?.message || 'BOT追加に失敗しました');
            } finally {
              setAddingBot(false);
            }
          }}
          disabled={addingBot}
          className="w-full py-3 font-bold rounded-xl transition-colors disabled:opacity-50 text-sm cursor-pointer"
          style={{ background: '#7C3AED', color: 'white' }}
        >
          {addingBot ? '追加中...' : `BOTを追加 (残り${5 - players.length}人)`}
        </button>
      )}

      {/* 観戦者 */}
      {spectators.length > 0 && (
        <div className="text-center py-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-canvas)', color: 'var(--color-canvas)' }}
          >
            観戦者: {spectators.length}人
          </span>
        </div>
      )}

      {/* ゲーム開始 */}
      {error && (
        <p className="text-sm text-center font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      {isHost ? (
        <button
          onClick={handleStart}
          disabled={players.length < 5 || starting}
          className={`btn-primary w-full py-4 text-xl cursor-pointer ${
            players.length >= 5 ? 'animate-pulse-glow' : ''
          }`}
        >
          {starting
            ? '開始中...'
            : `ゲームスタート (${players.length}/5)`}
        </button>
      ) : (
        <div className="text-center py-4">
          <p className="font-bold animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
            ホストがゲームを開始するのを待っています...
          </p>
        </div>
      )}
    </div>
  );
}
