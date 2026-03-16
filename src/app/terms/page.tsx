import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 - ファイブクイズ",
  description: "ファイブクイズの利用規約について",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
      <div className="max-w-2xl w-full py-12 space-y-8">
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-bold hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            &larr; トップページに戻る
          </Link>
          <h1
            className="text-3xl mt-4"
            style={{ fontFamily: "var(--font-quiz-title)" }}
          >
            利用規約
          </h1>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第1条（適用）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              本利用規約（以下「本規約」）は、ファイブクイズ（以下「当サイト」）が提供するすべてのサービスの利用条件を定めるものです。ユーザーは本規約に同意の上、当サイトをご利用ください。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第2条（サービス内容）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトは、5人1組で楽しむ協力型クイズゲームを提供するWebサービスです。ユーザーはブラウザを通じて無料でゲームをプレイできます。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第3条（利用条件）
            </h2>
            <ul
              className="text-sm leading-relaxed list-disc list-inside space-y-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>動画配信・実況・商用利用など、どなたでもご自由にお使いいただけます。</li>
              <li>事前の許可や連絡は不要です。</li>
              <li>利用にあたり、アカウント登録は不要です。</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第4条（禁止事項）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ユーザーは、以下の行為を行ってはなりません。
            </p>
            <ul
              className="text-sm leading-relaxed list-disc list-inside space-y-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>サーバーに過度な負荷をかける行為</li>
              <li>不正アクセスやサービスの妨害行為</li>
              <li>他のユーザーに不快感を与える行為</li>
              <li>法令または公序良俗に反する行為</li>
              <li>当サイトの運営を妨害する行為</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第5条（免責事項）
            </h2>
            <ul
              className="text-sm leading-relaxed list-disc list-inside space-y-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>当サイトは、サービスの中断・停止・終了について、事前の通知なく行う場合があります。</li>
              <li>当サイトの利用により生じた損害について、運営者は一切の責任を負いません。</li>
              <li>当サイトのコンテンツの正確性・完全性について保証するものではありません。</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第6条（広告について）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトでは、第三者配信の広告サービス（Google
              AdSense等）を利用しています。広告配信事業者はユーザーの興味に応じた広告を表示するために、Cookieを使用することがあります。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第7条（知的財産権）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトに掲載されているコンテンツ（テキスト、画像、プログラム等）の著作権は、当サイト運営者に帰属します。ただし、ゲームプレイの配信・実況・紹介等の利用は自由に行うことができます。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第8条（規約の変更）
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトは、必要に応じて本規約を変更することがあります。変更後の規約は、当ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <p
            className="text-xs text-right"
            style={{ color: "var(--color-text-muted)" }}
          >
            制定日: 2026年3月16日
          </p>
        </div>
      </div>
    </div>
  );
}
