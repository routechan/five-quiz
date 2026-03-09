'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1
        className="text-5xl mb-4"
        style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
      >
        エラー
      </h1>
      <p
        className="text-lg font-bold mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        予期しないエラーが発生しました
      </p>
      <button
        onClick={reset}
        className="btn-primary px-8 py-3 text-lg cursor-pointer"
      >
        もう一度試す
      </button>
    </div>
  );
}
