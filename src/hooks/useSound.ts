'use client';

import { useCallback } from 'react';

function playAudio(src: string) {
  const audio = new Audio(src);
  audio.play().catch(() => {
    // ユーザー操作前の自動再生がブロックされた場合は無視
  });
}

export function useSound() {
  const playCorrect = useCallback(() => {
    playAudio('/sounds/クイズ正解1.mp3');
  }, []);

  const playIncorrect = useCallback(() => {
    playAudio('/sounds/クイズ不正解1.mp3');
  }, []);

  const playReveal = useCallback(() => {
    playAudio('/sounds/決定ボタンを押す24.mp3');
  }, []);

  const playQuestion = useCallback(() => {
    playAudio('/sounds/出題.mp3');
  }, []);

  return { playCorrect, playIncorrect, playReveal, playQuestion };
}
