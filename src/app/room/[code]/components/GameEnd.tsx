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

  const shareText = `ファイブクイズで${room.questionCount}問中${room.correctCount}問正解しました！（正解率${rate}%）\nみんなも遊んでみよう！`;
  const siteUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : '';

  const shareToX = () => {
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToLine = () => {
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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

      {/* SNSシェアボタン */}
      <div className="space-y-3">
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-muted)' }}>
          結果をシェアしよう！
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={shareToX}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
            style={{ background: '#000000' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </button>
          <button
            onClick={shareToLine}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white cursor-pointer transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-95"
            style={{ background: '#06C755' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.864c.018-.256.048-.497.048-.745C19.413 5.174 15.096 2 12 2 8.904 2 4.588 5.174 4.588 9.119c0 3.194 2.798 5.882 6.628 6.764.322.07.76.216.872.496.1.254.066.652.032.908l-.14.874c-.042.27-.198 1.052.922.572 1.12-.48 6.044-3.56 8.244-6.098C22.36 11.28 22.94 10.208 19.365 9.864zM8.68 11.285H7.076a.399.399 0 01-.399-.399V8.27c0-.22.179-.399.399-.399.221 0 .399.179.399.399v2.217h1.205c.22 0 .399.18.399.399a.399.399 0 01-.399.399zm1.703-.399a.399.399 0 01-.798 0V8.27c0-.22.179-.399.399-.399.22 0 .399.179.399.399v2.616zm3.297 0a.399.399 0 01-.694.272l-1.675-2.282v2.01a.399.399 0 01-.798 0V8.27a.399.399 0 01.694-.271l1.675 2.282V8.27c0-.22.179-.399.399-.399.221 0 .399.179.399.399v2.616zm2.907-1.024a.399.399 0 010 .798h-1.205v.625h1.205a.399.399 0 010 .798H15.18a.399.399 0 01-.399-.399V8.27c0-.22.18-.399.399-.399h1.906a.399.399 0 010 .798h-1.205v.594h1.205c.221 0 .399.18.399.399z" />
            </svg>
            LINE
          </button>
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
