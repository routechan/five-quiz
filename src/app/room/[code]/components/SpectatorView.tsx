'use client';

import { useRouter } from 'next/navigation';
import { AnswerSlot } from '@/components/AnswerSlot';
import type { Room, Player, Answer } from '@/types';

interface Props {
  room: Room;
  players: Player[];
  spectators: Player[];
  answers: Answer[];
  currentQuiz: { id: string; question: string; answer?: string } | null;
}

export function SpectatorView({ room, players, spectators, answers, currentQuiz }: Props) {
  const router = useRouter();

  const sortedPlayers = [...players].sort(
    (a, b) => (a.position ?? 99) - (b.position ?? 99)
  );

  const answerChars = currentQuiz?.answer ? [...currentQuiz.answer] : [];

  const submittedIds = new Set(answers.map((a) => a.playerId));

  const judgedCount = answers.filter(
    (a) => a.isCorrect !== null && a.isCorrect !== undefined
  ).length;
  const allJudged = judgedCount === players.length && players.length > 0;
  const teamCorrect = allJudged && answers.every((a) => a.isCorrect === true);

  return (
    <div className="space-y-5 animate-float-in">
      {/* 観戦バッジ */}
      <div className="text-center">
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-canvas)', color: 'var(--color-canvas)' }}
        >
          観戦中
          {spectators.length > 1 && (
            <span style={{ color: 'var(--color-text-muted)' }}>
              ({spectators.length}人)
            </span>
          )}
        </span>
      </div>

      {/* ステータスごとの表示 */}
      {room.status === 'waiting' && (
        <div className="space-y-4">
          <div className="quiz-card-primary p-5 text-center">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>
              ルームコード
            </p>
            <p
              className="text-3xl tracking-[0.3em]"
              style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
            >
              {room.roomCode}
            </p>
          </div>

          <div className="quiz-card p-5">
            <h2 className="font-extrabold text-lg mb-4" style={{ color: 'var(--color-text-primary)' }}>
              参加者 {players.length} / 5
            </h2>
            <div className="space-y-2">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--color-bg-card)', border: '2px solid var(--color-secondary)' }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'var(--color-canvas)' }}
                  >
                    {player.position}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {player.nickname}
                  </span>
                  {player.isHost && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: 'var(--color-primary)', color: 'white' }}>
                      ホスト
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center font-bold animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
            ゲーム開始を待っています...
          </p>
        </div>
      )}

      {(room.status === 'playing' || room.status === 'answering') && currentQuiz && (
        <div className="space-y-5">
          {/* ヘッダー */}
          <div className="flex justify-between items-center">
            <span
              className="font-extrabold text-lg"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
            >
              Q.{room.questionCount}
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

          {/* 問題文 */}
          <div className="question-panel p-5">
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-canvas-light)' }}>
              Q.{room.questionCount}
            </p>
            <p className="font-extrabold text-lg text-white">{currentQuiz.question}</p>
          </div>

          {/* 回答状況 */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {sortedPlayers.map((player) => {
              const hasSubmitted = submittedIds.has(player.id);
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
                </div>
              );
            })}
          </div>

          <p className="text-center font-bold" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="text-lg" style={{ color: 'var(--color-primary)' }}>{answers.length}</span>
            <span style={{ color: 'var(--color-text-muted)' }}>/{players.length} 提出済み</span>
          </p>
        </div>
      )}

      {room.status === 'answered' && currentQuiz && (
        <div className="space-y-5 text-center">
          <div className="question-panel p-5">
            <p className="font-extrabold text-lg text-white">{currentQuiz.question}</p>
          </div>
          <h2 className="text-xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
            全員の回答が揃いました！
          </h2>
          <p className="font-bold animate-pulse" style={{ color: 'var(--color-text-muted)' }}>
            ホストが回答を表示するのを待っています...
          </p>
        </div>
      )}

      {room.status === 'judging' && currentQuiz && (
        <div className="space-y-5">
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
                  isCurrentUser={false}
                  showImage
                />
              );
            })}
          </div>

          {/* 判定状況 */}
          <p className="text-center text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
            判定状況: <span style={{ color: 'var(--color-primary)' }}>{judgedCount}</span>/{players.length} 完了
          </p>

          {allJudged && (
            <div className="text-center py-3">
              <span
                className="text-2xl font-extrabold"
                style={{ color: teamCorrect ? 'var(--color-success)' : 'var(--color-error)' }}
              >
                {teamCorrect ? 'チーム正解！' : 'チーム不正解...'}
              </span>
            </div>
          )}
        </div>
      )}

      {room.status === 'finished' && (
        <div className="space-y-6 text-center">
          <h2
            className="text-4xl animate-pop-in"
            style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
          >
            ゲーム終了！
          </h2>
          <div className="quiz-card-primary p-8 space-y-5">
            <div>
              <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>
                チーム正解数
              </p>
              <p>
                <span
                  className="text-6xl font-extrabold"
                  style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-quiz-title)' }}
                >
                  {room.correctCount}
                </span>
                <span className="text-xl font-bold ml-1" style={{ color: 'var(--color-text-muted)' }}>問</span>
              </p>
            </div>
            <div className="flex justify-center gap-8">
              <div className="quiz-card p-4 min-w-[100px]">
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>出題数</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                  {room.questionCount}問
                </p>
              </div>
              <div className="quiz-card p-4 min-w-[100px]">
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>正解率</p>
                <p className="text-lg font-extrabold" style={{ color: 'var(--color-canvas)' }}>
                  {room.questionCount > 0 ? Math.round((room.correctCount / room.questionCount) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full py-4 text-xl cursor-pointer"
          >
            トップに戻る
          </button>
        </div>
      )}
    </div>
  );
}
