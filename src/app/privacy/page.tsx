import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー - ファイブクイズ",
  description: "ファイブクイズのプライバシーポリシーについて",
};

export default function PrivacyPage() {
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
            プライバシーポリシー
          </h1>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              はじめに
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              ファイブクイズ（以下「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当サイトがどのような情報を収集し、どのように利用するかについて説明します。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              収集する情報
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトでは、以下の情報を収集する場合があります。
            </p>
            <ul
              className="text-sm leading-relaxed list-disc list-inside space-y-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>ニックネーム（ゲームプレイ時に入力されるもの）</li>
              <li>ゲームの回答データ（手書き文字の画像データ）</li>
              <li>アクセスログ（IPアドレス、ブラウザ情報、アクセス日時など）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              Google Analytics について
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトでは、アクセス解析のためにGoogle
              Analyticsを利用しています。Google
              Analyticsはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。この機能はCookieを無効にすることで収集を拒否することができます。詳しくは
              Google のプライバシーポリシーをご確認ください。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              Google AdSense について
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトでは、第三者配信の広告サービス「Google
              AdSense」を利用しています。Google
              AdSenseはユーザーの興味に応じた広告を配信するため、Cookieを使用することがあります。Cookieを使用することにより、ユーザーのコンピュータにアクセスし情報を収集しますが、個人を特定できる情報は含まれません。Cookieを無効にする方法やGoogle
              AdSenseに関する詳細は、Googleの広告に関するポリシーをご確認ください。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              情報の利用目的
            </h2>
            <ul
              className="text-sm leading-relaxed list-disc list-inside space-y-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <li>ゲームサービスの提供・運営</li>
              <li>サイトの利用状況の分析・改善</li>
              <li>広告の配信</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              第三者への提供
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトは、法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            </p>
          </section>

          <section className="space-y-2">
            <h2
              className="text-lg font-extrabold"
              style={{ color: "var(--color-primary)" }}
            >
              プライバシーポリシーの変更
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、当ページに掲載した時点から効力を生じるものとします。
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
