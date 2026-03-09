'use client';

import type { Answer, Player } from '@/types';

interface Props {
  position: number;
  player?: Player;
  answer?: Answer;
  correctChar?: string;
  isCurrentUser?: boolean;
  showImage?: boolean;
}

export function AnswerSlot({
  position,
  player,
  answer,
  correctChar,
  isCurrentUser = false,
  showImage = false,
}: Props) {
  const getBorderStyle = () => {
    if (answer?.isCorrect === true) return { border: '3px solid var(--color-primary)', background: 'rgba(196, 41, 30, 0.08)' };
    if (answer?.isCorrect === false) return { border: '3px solid #093CF4', background: 'rgba(9, 60, 244, 0.08)' };
    if (isCurrentUser) return { border: '3px solid var(--color-canvas)', background: 'white' };
    return { border: '3px solid var(--color-secondary)', background: 'white' };
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="position-badge text-xs">{position}</div>
      <div
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center overflow-hidden"
        style={getBorderStyle()}
      >
        {showImage && answer?.drawingData?.startsWith('dummy:') ? (
          <span className="text-2xl font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            {answer.drawingData.replace('dummy:', '')}
          </span>
        ) : showImage && answer?.drawingData ? (
          <img
            src={answer.drawingData}
            alt={`${player?.nickname}の回答`}
            className="w-full h-full object-contain"
          />
        ) : answer && !showImage ? (
          <span className="text-lg" style={{ color: 'var(--color-success)' }}>✓</span>
        ) : correctChar ? (
          <span className="text-lg font-extrabold" style={{ color: 'var(--color-text-primary)' }}>
            {correctChar}
          </span>
        ) : (
          <span className="text-lg font-bold" style={{ color: 'var(--color-secondary)' }}>?</span>
        )}
      </div>
      <span
        className="text-xs font-bold truncate max-w-15"
        style={{ color: isCurrentUser ? 'var(--color-canvas)' : 'var(--color-text-muted)' }}
      >
        {player?.nickname || '--'}
      </span>
    </div>
  );
}
