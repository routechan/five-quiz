'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function NicknamePage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;

  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSpectate, setShowSpectate] = useState(false);
  const [spectateOnly, setSpectateOnly] = useState(false);
  const [checking, setChecking] = useState(true);
  // ページ表示時に満室・ゲーム開始済みかチェック
  useEffect(() => {
    api.getRoom(code).then(({ room, players }) => {
      const activePlayers = players.filter(p => !p.isSpectator);
      const hasBotSlot = activePlayers.some(p => p.isBot);
      if (room.status !== 'waiting') {
        setShowSpectate(true);
        setSpectateOnly(true);
        setError('ゲームは既に開始されています');
      } else if (activePlayers.length >= 5 && !hasBotSlot) {
        setShowSpectate(true);
        setSpectateOnly(true);
        setError('ルームが満員です');
      }
    }).catch(() => {
      // ルームが見つからない場合などはjoin時にハンドル
    }).finally(() => {
      setChecking(false);
    });
  }, [code]);

  const handleJoin = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    if (nickname.length > 10) {
      setError('ニックネームは10文字以内で入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { playerId } = await api.joinRoom(code, nickname.trim());
      sessionStorage.setItem('playerId', playerId);
      router.push(`/room/${code}`);
    } catch (err: unknown) {
      const apiErr = err as { error?: { code?: string } };
      if (apiErr?.error?.code === 'ROOM_FULL') {
        setError('ルームが満員です');
        setShowSpectate(true);
      } else if (apiErr?.error?.code === 'GAME_ALREADY_STARTED') {
        setError('ゲームは既に開始されています');
        setShowSpectate(true);
      } else {
        setError('ルームへの参加に失敗しました');
      }
      setLoading(false);
    }
  };

  const handleSpectate = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }
    if (nickname.length > 10) {
      setError('ニックネームは10文字以内で入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { playerId } = await api.spectateRoom(code, nickname.trim());
      sessionStorage.setItem('playerId', playerId);
      router.push(`/room/${code}`);
    } catch {
      setError('観戦への参加に失敗しました');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-2xl mb-2" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}>
            ファイブクイズ
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // 満員またはゲーム開始済み → 観戦導線のみ表示
  if (spectateOnly) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md w-full animate-float-in">
          <h1
            className="text-3xl mb-2"
            style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
          >
            ファイブクイズ
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-secondary)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>ルーム</span>
            <span className="font-extrabold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>{code}</span>
          </div>

          <div className="space-y-4">
            <p className="text-lg font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>

            <div className="quiz-card p-6">
              <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                観戦するにはニックネームを入力
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (!spectateOnly) setError('');
                }}
                maxLength={10}
                placeholder="最大10文字"
                className="input-nickname w-full px-4 py-3 rounded-xl text-center text-lg font-bold
                  focus:outline-none focus:ring-3 transition-all"
                style={{
                  color: 'var(--color-text-primary)',
                  caretColor: 'var(--color-text-primary)',
                  background: 'var(--color-bg-card)',
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSpectate()}
                autoFocus
              />
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {nickname.length}/10文字
              </p>
            </div>

            <button
              onClick={handleSpectate}
              disabled={loading}
              className="w-full py-4 px-8 text-xl font-bold rounded-xl transition-colors cursor-pointer"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-canvas)',
                border: '3px solid var(--color-canvas)',
              }}
            >
              {loading ? '参加中...' : '観戦する'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full animate-float-in">
        <h1
          className="text-3xl mb-2"
          style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
        >
          ファイブクイズ
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-secondary)' }}>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>ルーム</span>
          <span className="font-extrabold tracking-widest" style={{ color: 'var(--color-text-primary)' }}>{code}</span>
        </div>

        <div className="space-y-4">
          <div className="quiz-card p-6">
            <label className="block text-sm font-bold mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              ニックネームを入力
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              maxLength={10}
              placeholder="最大10文字"
              className="input-nickname w-full px-4 py-3 rounded-xl text-center text-lg font-bold
                focus:outline-none focus:ring-3 transition-all"
              style={{
                color: 'var(--color-text-primary)',
                caretColor: 'var(--color-text-primary)',
                background: 'var(--color-bg-card)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {nickname.length}/10文字
            </p>
          </div>

          {error && (
            <p className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
          )}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="btn-primary w-full py-4 px-8 text-xl cursor-pointer"
          >
            {loading ? '参加中...' : '入室する'}
          </button>

          {showSpectate && (
            <button
              onClick={handleSpectate}
              disabled={loading}
              className="w-full py-3 px-8 text-lg font-bold rounded-xl transition-colors cursor-pointer"
              style={{
                background: 'var(--color-bg-card)',
                color: 'var(--color-canvas)',
                border: '3px solid var(--color-canvas)',
              }}
            >
              {loading ? '参加中...' : '観戦する'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
