import Link from "next/link";

// TODO: 以下のURLを実際のGoogleフォームのURLに差し替えてください
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
      <div className="max-w-2xl w-full pt-8 pb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-bold mb-6 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
        >
          ← トップに戻る
        </Link>

        <h1
          className="text-3xl mb-6 text-center"
          style={{
            fontFamily: "var(--font-quiz-title)",
            color: "var(--color-primary)",
          }}
        >
          お問い合わせ
        </h1>

        <div className="quiz-card overflow-hidden">
          <iframe
            src={GOOGLE_FORM_URL}
            width="100%"
            height="800"
            style={{ border: "none" }}
            title="お問い合わせフォーム"
          >
            読み込んでいます…
          </iframe>
        </div>
      </div>
    </div>
  );
}
