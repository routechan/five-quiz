'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Props {
  onSubmit: (dataUrl: string) => void;
  disabled?: boolean;
}

export function DrawingCanvas({ onSubmit, disabled = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 高DPI対応
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // 背景白
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 線のスタイル
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // Safari対策: ネイティブイベントリスナーを { passive: false } で登録
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };

    const onTouchStart = (e: TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawingRef.current = true;
      setHasDrawn(true);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDrawingRef.current || disabled) return;
      e.preventDefault();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled]);

  const getCoordinates = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      isDrawingRef.current = true;
      setHasDrawn(true);
    },
    [disabled, getCoordinates]
  );

  const draw = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawingRef.current || disabled) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [disabled, getCoordinates]
  );

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 線のスタイルを再設定
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setHasDrawn(false);
  }, []);

  const handleSubmit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSubmit(dataUrl);
  }, [onSubmit]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '4px solid var(--color-canvas)',
          boxShadow: '0 4px 16px rgba(30, 144, 255, 0.2)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none"
          style={{ backgroundColor: 'white', width: 300, height: 300 }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleClear}
          disabled={disabled}
          className="btn-secondary px-6 py-3 min-w-[120px] cursor-pointer"
        >
          クリア
        </button>
        <button
          onClick={handleSubmit}
          disabled={disabled || !hasDrawn}
          className="btn-primary px-6 py-3 min-w-[120px] cursor-pointer"
        >
          提出する
        </button>
      </div>
    </div>
  );
}
