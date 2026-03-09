'use client';

import { useRouter } from 'next/navigation';
import type { Room } from '@/types';

interface Props {
  room: Room;
}

export function GameEnd({ room }: Props) {
  const router = useRouter();

  const rate =
    room.questionCount > 0
      ? Math.round((room.correctCount / room.questionCount) * 100)
      : 0;

  return (
    <div className="space-y-6 text-center animate-float-in">
      <h2
        className="text-4xl animate-pop-in"
        style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
      >
        ゲーム終了！
      </h2>

      <p className="text-lg font-bold" style={{ color: 'var(--color-text-secondary)' }}>
        お疲れ様でした！
      </p>

      {/* 結果 */}
      <div className="quiz-card-primary p-8 space-y-5">
        <div>
          <p className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>
            チーム正解数
          </p>
          <p className="animate-count-pop">
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
              {rate}%
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
  );
}
