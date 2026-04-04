'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoom } from '@/hooks/useRoom';
import { useSession } from '@/hooks/useSession';
import { WaitingRoom } from './components/WaitingRoom';
import { AnswerInput } from './components/AnswerInput';
import { WaitingAnswer } from './components/WaitingAnswer';
import { ResultDisplay } from './components/ResultDisplay';
import { GameEnd } from './components/GameEnd';
import { SpectatorView } from './components/SpectatorView';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  const sessionId = useSession();
  const { room, players, answers, currentQuiz, loading, error, refetch } = useRoom(code);

  // sessionStorage.getItem は同期 O(1) なので useMemo 不要。
  // players に依存させると全プレイヤー変更で再レンダリングが走るため除去。
  const storedPlayerId =
    typeof window !== 'undefined' ? sessionStorage.getItem('playerId') : null;

  // 現在のプレイヤー
  const currentPlayer = players.find((p) => p.id === storedPlayerId);
  // 過去に currentPlayer が見つかったことがあるかを追跡
  const hasBeenPlayerRef = useRef(false);
  useEffect(() => {
    if (currentPlayer) {
      hasBeenPlayerRef.current = true;
    }
  }, [currentPlayer]);

  const isHost = currentPlayer?.isHost ?? false;
  const isSpectator = currentPlayer?.isSpectator ?? false;

  // 未参加ならニックネーム入力へ
  // ただし、一度プレイヤーとして認識された後に一時的に見つからなくなった場合は
  // リダイレクトせず refetch で復帰を試みる（Realtime再接続やネットワーク不安定対策）
  useEffect(() => {
    if (!loading && !error && room && sessionId && !currentPlayer) {
      if (hasBeenPlayerRef.current) {
        // 一時的な不整合 — リダイレクトせず再取得を試みる
        refetch();
        return;
      }
      router.push(`/room/${code}/nickname`);
    }
  }, [loading, error, room, sessionId, currentPlayer, router, code, refetch]);


  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p
            className="text-2xl mb-2"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
          >
            ファイブクイズ
          </p>
          <p className="text-lg font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-xl font-bold" style={{ color: 'var(--color-error)' }}>
          {error || 'ルームが見つかりません'}
        </div>
        <button
          onClick={() => router.push('/')}
          className="btn-primary px-8 py-3 text-lg cursor-pointer"
        >
          トップに戻る
        </button>
      </div>
    );
  }

  // プレイヤー一覧から観戦者を除外（ゲームロジック用）
  const activePlayers = players.filter((p) => !p.isSpectator);
  const spectators = players.filter((p) => p.isSpectator);

  // 自分が既に回答提出済みか
  const hasSubmitted = answers.some((a) => a.playerId === currentPlayer?.id);

  // 観戦者用の画面
  if (isSpectator) {
    return (
      <div className="min-h-screen bg-white">
        <div className="text-center pt-6 pb-2">
          <span
            className="text-2xl"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
          >
            ファイブクイズ
          </span>
        </div>
        <main className="max-w-2xl mx-auto px-4 py-4">
          <SpectatorView
            room={room}
            players={activePlayers}
            spectators={spectators}
            answers={answers}
            currentQuiz={currentQuiz}
          />
        </main>
      </div>
    );
  }

  // 画面の切り替え
  const renderContent = () => {
    switch (room.status) {
      case 'waiting':
        return (
          <WaitingRoom
            room={room}
            players={activePlayers}
            spectators={spectators}
            currentPlayer={currentPlayer!}
            isHost={isHost}
            roomCode={code}
            onRefetch={refetch}
          />
        );

      case 'playing':
        return (
          <AnswerInput
            room={room}
            players={activePlayers}
            currentPlayer={currentPlayer!}
            currentQuiz={currentQuiz!}
            roomCode={code}
            onRefetch={refetch}
          />
        );

      case 'answering':
        if (hasSubmitted) {
          return (
            <WaitingAnswer
              players={activePlayers}
              answers={answers}
              isHost={isHost}
              roomCode={code}
              allSubmitted={false}
              onRefetch={refetch}
            />
          );
        }
        return (
          <AnswerInput
            room={room}
            players={activePlayers}
            currentPlayer={currentPlayer!}
            currentQuiz={currentQuiz!}
            roomCode={code}
            onRefetch={refetch}
          />
        );

      case 'answered':
        return (
          <WaitingAnswer
            players={activePlayers}
            answers={answers}
            isHost={isHost}
            roomCode={code}
            allSubmitted={true}
            onRefetch={refetch}
          />
        );

      case 'judging':
        return (
          <ResultDisplay
            room={room}
            players={activePlayers}
            answers={answers}
            currentPlayer={currentPlayer!}
            currentQuiz={currentQuiz!}
            isHost={isHost}
            roomCode={code}
            onRefetch={refetch}
          />
        );

      case 'finished':
        return <GameEnd room={room} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ロゴ */}
      <div className="text-center pt-6 pb-2">
        <span
          className="text-2xl"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
        >
          ファイブクイズ
        </span>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {renderContent()}
      </main>

      {/* 観戦者数（常時表示） */}
      {spectators.length > 0 && room.status !== 'waiting' && (
        <div className="text-center py-2">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{
              background: 'var(--color-bg-card)',
              border: '2px solid var(--color-canvas)',
              color: 'var(--color-canvas)',
            }}
          >
            観戦者: {spectators.length}人
          </span>
        </div>
      )}
    </div>
  );
}
