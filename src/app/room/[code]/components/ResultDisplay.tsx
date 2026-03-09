'use client';

import { useState, useEffect, useRef } from 'react';
import { AnswerSlot } from '@/components/AnswerSlot';
import { api } from '@/lib/api';
import { useSound } from '@/hooks/useSound';
import type { Room, Player, Answer } from '@/types';

interface Props {
  room: Room;
  players: Player[];
  answers: Answer[];
  currentPlayer: Player;
  currentQuiz: { id: string; question: string; answer?: string };
  isHost: boolean;
  roomCode: string;
}

export function ResultDisplay({
  room,
  players,
  answers,
  currentPlayer,
  currentQuiz,
  isHost,
  roomCode,
}: Props) {
  const [judging, setJudging] = useState(false);
  const [error, setError] = useState('');
  const [kickingId, setKickingId] = useState<string | null>(null);
  const { playCorrect, playIncorrect, playReveal } = useSound();
  const hasPlayedSoundRef = useRef(false);
  const hasPlayedRevealRef = useRef(false);

  useEffect(() => {
    if (hasPlayedRevealRef.current) return;
    hasPlayedRevealRef.current = true;
    playReveal();
  }, [playReveal]);

  const sortedPlayers = [...players].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  const answerChars = currentQuiz.answer ? [...currentQuiz.answer] : [];

  const myAnswer = answers.find((a) => a.playerId === currentPlayer.id);
  const hasJudged = myAnswer?.isCorrect !== null && myAnswer?.isCorrect !== undefined;

  const judgedCount = answers.filter(
    (a) => a.isCorrect !== null && a.isCorrect !== undefined
  ).length;

  // 全員判定完了時にSEを再生
  const allJudged = judgedCount === players.length && players.length > 0;
  const teamCorrect = allJudged && answers.every((a) => a.isCorrect === true);

  useEffect(() => {
    if (!allJudged) {
      hasPlayedSoundRef.current = false;
      return;
    }
    if (hasPlayedSoundRef.current) return;
    hasPlayedSoundRef.current = true;

    if (teamCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
  }, [allJudged, teamCorrect, playCorrect, playIncorrect]);

  const handleJudge = async (isCorrect: boolean) => {
    setJudging(true);
    setError('');
    try {
      await api.judgeAnswer(roomCode, isCorrect);
    } catch {
      setError('判定に失敗しました');
      setJudging(false);
    }
  };

  const handleNext = async () => {
    try {
      await api.nextQuiz(roomCode);
    } catch (err: unknown) {
      const apiErr = err as { error?: { code?: string } };
      if (apiErr?.error?.code === 'NO_QUIZ_AVAILABLE') {
        setError('出題可能なクイズがありません');
      }
    }
  };

  const handleEnd = async () => {
    try {
      await api.endGame(roomCode);
    } catch {
      setError('ゲーム終了に失敗しました');
    }
  };

  return (
    <div className="space-y-5 animate-float-in">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <span
          className="font-extrabold text-lg"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
        >
          Q.{room.questionCount} 結果発表！
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>正解数</span>
          <span
            className="px-3 py-1 rounded-full font-extrabold text-white text-lg"
            style={{ background: 'var(--color-primary)' }}
          >
            {room.correctCount}
          </span>
        </div>
      </div>

      {/* 問題と正解 */}
      <div className="question-panel p-5 space-y-3">
        <p className="font-extrabold text-white text-lg">{currentQuiz.question}</p>
        {currentQuiz.answer && (
          <div className="flex items-center gap-2 justify-center">
            <span className="text-sm font-bold" style={{ color: 'var(--color-canvas-light)' }}>正解:</span>
            <div className="flex gap-1">
              {answerChars.map((char, i) => (
                <span
                  key={i}
                  className="font-extrabold text-lg px-3 py-1 rounded-lg"
                  style={{
                    background: 'rgba(255, 215, 0, 0.2)',
                    color: 'var(--color-gold)',
                    border: '2px solid var(--color-gold)',
                  }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 全員の回答 */}
      <div className="flex justify-center gap-2 sm:gap-4">
        {sortedPlayers.map((player) => {
          const playerAnswer = answers.find((a) => a.playerId === player.id);
          return (
            <AnswerSlot
              key={player.id}
              position={player.position ?? 0}
              player={player}
              answer={playerAnswer}
              correctChar={answerChars[((player.position ?? 1) - 1)]}
              isCurrentUser={player.id === currentPlayer.id}
              showImage
            />
          );
        })}
      </div>

      {/* 自己判定 */}
      {!hasJudged ? (
        <div className="quiz-card-primary p-5 space-y-3">
          <p className="font-extrabold text-center" style={{ color: 'var(--color-text-primary)' }}>
            あなたの判定:
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleJudge(true)}
              disabled={judging}
              className="px-8 py-4 font-extrabold rounded-xl text-lg transition-all
                disabled:opacity-50 active:scale-95 cursor-pointer text-white"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                boxShadow: '0 4px 12px rgba(196, 41, 30, 0.3)',
              }}
            >
              ⭕ 正解
            </button>
            <button
              onClick={() => handleJudge(false)}
              disabled={judging}
              className="px-8 py-4 font-extrabold rounded-xl text-lg transition-all
                disabled:opacity-50 active:scale-95 cursor-pointer text-white"
              style={{
                background: 'linear-gradient(135deg, var(--color-canvas), var(--color-canvas-light))',
                boxShadow: '0 4px 12px rgba(30, 144, 255, 0.3)',
              }}
            >
              ✕ 不正解
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <p className="font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            判定済み: {myAnswer?.isCorrect ? (
              <span className="font-extrabold marker-correct">⭕ 正解</span>
            ) : (
              <span className="font-extrabold marker-incorrect">✕ 不正解</span>
            )}
          </p>
        </div>
      )}

      {/* 判定状況 */}
      <p className="text-center text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
        判定状況: <span style={{ color: 'var(--color-primary)' }}>{judgedCount}</span>/{players.length} 完了
      </p>

      {/* ホスト用: 未判定プレイヤーのキック */}
      {isHost && !allJudged && (() => {
        const dummyNames = ['BOT', 'ジュン', 'タイゾウ', 'ケン', 'オサム'];
        const unjudgedHumans = sortedPlayers.filter((p) => {
          const ans = answers.find((a) => a.playerId === p.id);
          const notJudged = !ans || ans.isCorrect === null || ans.isCorrect === undefined;
          return notJudged && !p.isHost && !dummyNames.includes(p.nickname);
        });
        if (unjudgedHumans.length === 0) return null;
        return (
          <div className="flex flex-wrap justify-center gap-2">
            {unjudgedHumans.map((p) => (
              <button
                key={p.id}
                onClick={async () => {
                  if (!confirm(`${p.nickname} をキックしてBOTに置き換えますか？`)) return;
                  setKickingId(p.id);
                  try { await api.kickPlayer(roomCode, p.id); } catch { /* noop */ } finally { setKickingId(null); }
                }}
                disabled={kickingId === p.id}
                className="text-xs px-3 py-1 rounded font-bold cursor-pointer"
                style={{
                  background: 'var(--color-danger, #ef4444)',
                  color: 'white',
                  opacity: kickingId === p.id ? 0.5 : 1,
                }}
              >
                {kickingId === p.id ? '...' : `${p.nickname} をキック`}
              </button>
            ))}
          </div>
        );
      })()}

      {error && (
        <p className="text-sm text-center font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      {/* ホスト操作 */}
      {isHost && (
        <div className="flex gap-4">
          <button
            onClick={handleNext}
            className="btn-canvas flex-1 py-3 text-lg cursor-pointer"
          >
            次の問題へ
          </button>
          <button
            onClick={handleEnd}
            className="btn-secondary flex-1 py-3 text-lg cursor-pointer"
          >
            ゲーム終了
          </button>
        </div>
      )}
    </div>
  );
}
