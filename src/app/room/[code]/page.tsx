'use client';

import { useEffect } from 'react';
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
  const { room, players, answers, currentQuiz, loading, error } = useRoom(code);

  // 現在のプレイヤー
  const currentPlayer = players.find((p) => {
    const storedPlayerId = typeof window !== 'undefined' ? sessionStorage.getItem('playerId') : null;
    return p.id === storedPlayerId;
  });

  const isHost = currentPlayer?.isHost ?? false;
  const isSpectator = currentPlayer?.isSpectator ?? false;

  // 未参加ならニックネーム入力へ
  useEffect(() => {
    if (!loading && !error && room && sessionId && !currentPlayer) {
      router.push(`/room/${code}/nickname`);
    }
  }, [loading, error, room, sessionId, currentPlayer, router, code]);


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
    </div>
  );
}
