import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <h1
        className="text-6xl mb-4"
        style={{ fontFamily: 'var(--font-quiz-title)', color: 'var(--color-primary)' }}
      >
        404
      </h1>
      <p
        className="text-lg font-bold mb-8"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        ページが見つかりませんでした
      </p>
      <Link href="/" className="btn-primary px-8 py-3 text-lg">
        トップに戻る
      </Link>
    </div>
  );
}
