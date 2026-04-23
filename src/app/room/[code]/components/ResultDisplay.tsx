'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AnswerSlot } from '@/components/AnswerSlot';
import { api } from '@/lib/api';
import { useSound } from '@/hooks/useSound';
import type { Room, Player, Answer } from '@/types';

// 全員の回答を1枚の画像にまとめてダウンロードする
async function downloadAllAnswers(
  question: string,
  answerChars: string[],
  players: Player[],
  answerMap: Map<string, Answer>,
) {
  const SLOT = 110;      // 1人分の幅
  const IMG_SIZE = 72;   // 手書き画像の正方形サイズ
  const PAD = 16;
  const HEADER_H = 100;  // 問題文・正解エリア
  const FOOTER_H = 28;   // クレジット
  const SLOT_H = IMG_SIZE + 40; // 画像 + 名前 + 正解文字
  const W = Math.max(SLOT * players.length + PAD * 2, 300);
  const H = HEADER_H + SLOT_H + PAD + FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 背景
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#C4291E');
  grad.addColorStop(1, '#9B1F16');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // タイトルバー
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 0, W, 36);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ファイブクイズ', W / 2, 24);

  // 問題文（折り返し）
  ctx.font = 'bold 15px sans-serif';
  ctx.fillStyle = '#ffe4e1';
  ctx.textAlign = 'center';
  const maxWidth = W - PAD * 2;
  let line = '';
  let qy = 58;
  for (const ch of [...question]) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, W / 2, qy);
      line = ch;
      qy += 20;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, W / 2, qy);

  // 正解（文字ごとに金色ボックス風）
  if (answerChars.length > 0) {
    const answer = answerChars.join('');
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(`正解: ${answer}`, W / 2, HEADER_H - 8);
  }

  // 区切り線
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, HEADER_H);
  ctx.lineTo(W - PAD, HEADER_H);
  ctx.stroke();

  // 各プレイヤーの回答を横並び
  const sorted = [...players].sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  const totalW = SLOT * sorted.length;
  const startX = (W - totalW) / 2;

  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];
    const answer = answerMap.get(player.id);
    const cx = startX + SLOT * i + SLOT / 2;
    const imgX = cx - IMG_SIZE / 2;
    const imgY = HEADER_H + PAD;

    // 白い背景の枠
    const isCorrect = answer?.isCorrect;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(imgX - 3, imgY - 3, IMG_SIZE + 6, IMG_SIZE + 6, 8);
    ctx.fill();

    // 正誤に応じた枠色
    if (isCorrect === true) {
      ctx.strokeStyle = '#C4291E';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (isCorrect === false) {
      ctx.strokeStyle = '#093CF4';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 手書き画像 or テキスト
    const drawingData = answer?.drawingData ?? '';
    if (drawingData.startsWith('dummy:')) {
      const ch = drawingData.replace('dummy:', '');
      ctx.font = `bold ${IMG_SIZE * 0.65}px sans-serif`;
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ch, cx, imgY + IMG_SIZE / 2);
      ctx.textBaseline = 'alphabetic';
    } else if (drawingData) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, imgX, imgY, IMG_SIZE, IMG_SIZE); resolve(); };
        img.onerror = () => resolve();
        img.src = drawingData;
      });
    } else {
      ctx.font = `bold ${IMG_SIZE * 0.5}px sans-serif`;
      ctx.fillStyle = '#999999';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', cx, imgY + IMG_SIZE / 2);
      ctx.textBaseline = 'alphabetic';
    }

    // 正解文字（担当）
    const correctChar = answerChars[(player.position ?? 1) - 1] ?? '';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText(correctChar, cx, imgY + IMG_SIZE + 20);

    // ニックネーム
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(player.nickname, cx, imgY + IMG_SIZE + 36);
  }

  // クレジット
  ctx.font = '11px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('five-quiz.vercel.app', W / 2, H - 8);

  const link = document.createElement('a');
  link.download = `five-quiz-result.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

const DUMMY_NAMES = ['BOT', 'ジュン', 'タイゾウ', 'ケン', 'オサム'];

interface Props {
  room: Room;
  players: Player[];
  answers: Answer[];
  currentPlayer: Player;
  currentQuiz: { id: string; question: string; answer?: string };
  isHost: boolean;
  roomCode: string;
  onRefetch?: () => void;
}

export function ResultDisplay({
  room,
  players,
  answers,
  currentPlayer,
  currentQuiz,
  isHost,
  roomCode,
  onRefetch,
}: Props) {
  const [judging, setJudging] = useState(false);
  const [judgedLocal, setJudgedLocal] = useState<boolean | null>(null); // 送信済みの判定結果（再フェッチ前のUI即反映用）
  const [loading, setLoading] = useState(false);
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

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)),
    [players]
  );

  const answerChars = useMemo(
    () => currentQuiz.answer ? [...currentQuiz.answer] : [],
    [currentQuiz.answer]
  );

  // O(1) lookup 用 Map（answers.find の O(n²) を解消）
  const answerMap = useMemo(
    () => new Map(answers.map((a) => [a.playerId, a])),
    [answers]
  );

  const myAnswer = answerMap.get(currentPlayer.id);
  const hasJudged = judgedLocal !== null || (myAnswer?.isCorrect !== null && myAnswer?.isCorrect !== undefined);
  const judgedResult = judgedLocal ?? myAnswer?.isCorrect ?? null;

  // 1回のイテレーションで判定数とチーム正解を計算
  const { judgedCount, allCorrect } = useMemo(() => {
    let judged = 0;
    let correct = true;
    for (const a of answers) {
      if (a.isCorrect !== null && a.isCorrect !== undefined) {
        judged++;
        if (!a.isCorrect) correct = false;
      } else {
        correct = false;
      }
    }
    return { judgedCount: judged, allCorrect: correct };
  }, [answers]);

  // 全員判定完了時にSEを再生
  const allJudged = judgedCount === players.length && players.length > 0;
  const teamCorrect = allJudged && allCorrect;

  // 未判定の人間プレイヤー（キック対象）
  const unjudgedHumans = useMemo(() => {
    if (!isHost || allJudged) return [];
    return sortedPlayers.filter((p) => {
      const ans = answerMap.get(p.id);
      const notJudged = !ans || ans.isCorrect === null || ans.isCorrect === undefined;
      return notJudged && !p.isHost && !DUMMY_NAMES.includes(p.nickname);
    });
  }, [isHost, allJudged, sortedPlayers, answerMap]);

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
    if (judging) return;
    setJudging(true);
    setError('');
    try {
      await api.judgeAnswer(roomCode, isCorrect);
      setJudgedLocal(isCorrect);
      onRefetch?.();
    } catch {
      setError('判定に失敗しました');
    } finally {
      setJudging(false);
    }
  };

  const handleNext = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await api.nextQuiz(roomCode);
      onRefetch?.();
    } catch (err: unknown) {
      const apiErr = err as { error?: { code?: string } };
      if (apiErr?.error?.code === 'NO_QUIZ_AVAILABLE') {
        setError('出題可能なクイズがありません');
      }
      setLoading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  const handleDownloadAll = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    await downloadAllAnswers(currentQuiz.question, answerChars, sortedPlayers, answerMap);
    setDownloading(false);
  }, [downloading, currentQuiz.question, answerChars, sortedPlayers, answerMap]);

  const [ending, setEnding] = useState(false);

  const handleEnd = async () => {
    if (ending) return;
    setEnding(true);
    try {
      await api.endGame(roomCode);
      onRefetch?.();
    } catch {
      setError('ゲーム終了に失敗しました');
      setEnding(false);
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
          const playerAnswer = answerMap.get(player.id);
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

      {/* 全員の回答をまとめて保存 */}
      {allJudged && (
        <div className="flex justify-center">
          <button
            onClick={handleDownloadAll}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white cursor-pointer transition-opacity disabled:opacity-40 hover:opacity-90 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.45)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 16l-6-6h4V4h4v6h4l-6 6zm-7 4h14v-2H5v2z"/>
            </svg>
            {downloading ? '保存中...' : 'この問題の回答を保存'}
          </button>
        </div>
      )}

      {/* 自己判定 */}
      {!hasJudged ? (
        <div className="quiz-card-primary p-5 space-y-3">
          <p className="font-extrabold text-center" style={{ color: 'var(--color-text-primary)' }}>
            あなたの文字は合っている？
          </p>
          {/* 自分の担当文字と正解文字を並べて表示 */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>あなたの回答</span>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  border: '3px solid var(--color-canvas)',
                  background: 'white',
                }}
              >
                {myAnswer?.drawingData?.startsWith('dummy:') ? (
                  <span className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
                    {myAnswer.drawingData.replace('dummy:', '')}
                  </span>
                ) : myAnswer?.drawingData ? (
                  <img src={myAnswer.drawingData} alt="あなたの回答" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-lg font-bold" style={{ color: 'var(--color-secondary)' }}>?</span>
                )}
              </div>
            </div>
            <span className="text-2xl font-extrabold" style={{ color: 'var(--color-text-muted)' }}>→</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
                正解（{currentPlayer.position}文字目）
              </span>
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  border: '3px solid var(--color-gold)',
                  background: 'rgba(255, 215, 0, 0.1)',
                }}
              >
                <span className="text-2xl font-extrabold" style={{ color: 'var(--color-gold)' }}>
                  {answerChars[((currentPlayer.position ?? 1) - 1)] ?? '?'}
                </span>
              </div>
            </div>
          </div>
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
            判定済み: {judgedResult ? (
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
      {unjudgedHumans.length > 0 && (
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
      )}

      {error && (
        <p className="text-sm text-center font-bold" style={{ color: 'var(--color-error)' }}>{error}</p>
      )}

      {/* ホスト操作 */}
      {isHost && (
        <div className="flex gap-4">
          <button
            onClick={handleNext}
            disabled={loading || ending}
            className="btn-canvas flex-1 py-3 text-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? '読み込み中...' : '次の問題へ'}
          </button>
          <button
            onClick={handleEnd}
            disabled={loading || ending}
            className="btn-secondary flex-1 py-3 text-lg cursor-pointer disabled:opacity-50"
          >
            {ending ? '終了中...' : 'ゲーム終了'}
          </button>
        </div>
      )}
    </div>
  );
}
