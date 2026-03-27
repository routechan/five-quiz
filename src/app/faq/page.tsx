import type { Metadata } from "next";
import Link from "next/link";
import AdSense from "@/components/AdSense";

export const metadata: Metadata = {
  title: "よくある質問（FAQ） - ファイブクイズ",
  description:
    "ファイブクイズに関するよくある質問と回答。遊び方、対応環境、トラブルシューティングなど。",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4">
      <AdSense />
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
            よくある質問
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            ファイブクイズについてよく寄せられる質問にお答えします。
          </p>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            ゲームについて
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. ファイブクイズは無料で遊べますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                はい、完全無料で遊べます。アカウント登録も不要で、ブラウザからすぐにプレイできます。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 何人で遊べますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                5人で遊ぶゲームです。5人揃わない場合はBOTを追加してプレイすることもできます。BOTはランダムな文字を回答します。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 問題数に制限はありますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                制限はありません。ホストが「次の問題」を選び続ける限り、何問でも遊べます。好きなタイミングでゲームを終了できます。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 答えは必ず5文字ですか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                はい、すべての問題の答えは5文字です。ひらがな、カタカナ、漢字のいずれかで構成されています。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 正解・不正解の判定は誰がしますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                各プレイヤーが自分の書いた文字について自己判定します。手書き文字のため、自動判定ではなく人の目で判断する方式を採用しています。チーム全員で相談して判定するのがおすすめです。
              </p>
            </div>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            対応環境について
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. スマートフォンでも遊べますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                はい、スマートフォン、タブレット、パソコンのいずれでも遊べます。手書き入力はスマートフォンでは指で、パソコンではマウスやタッチパッドで行えます。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. どのブラウザに対応していますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A. Chrome、Safari、Firefox、Edgeなど、最新のモダンブラウザに対応しています。JavaScriptが有効になっていることを確認してください。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. アプリのインストールは必要ですか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                いいえ、アプリのインストールは不要です。Webブラウザからアクセスするだけで遊べます。
              </p>
            </div>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            トラブルシューティング
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. ルームに入れません
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                ルームが満員（5人）の場合は、プレイヤーとして参加できません。観戦モードでの参加が可能です。また、すでにゲームが開始されている場合も、途中参加はできず観戦モードになります。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 画面が固まってしまいました
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                ブラウザをリロード（再読み込み）してください。リロード後も同じルームに自動的に復帰できます。それでも解決しない場合は、一度ブラウザを閉じて招待リンクから再度アクセスしてみてください。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 手書きがうまく描けません
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                描画エリアをできるだけ大きく使って書いてみてください。スマートフォンの場合は、画面を横向きにすると描きやすくなることがあります。描き直しボタンで何度でもやり直せます。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 途中で接続が切れた場合はどうなりますか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                一時的な接続切れの場合は自動的に再接続されます。ブラウザを閉じてしまった場合でも、同じブラウザから招待リンクにアクセスすれば復帰できます。
              </p>
            </div>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-6">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            配信・利用について
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 動画配信や実況で使ってもいいですか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                はい、自由に使っていただけます。YouTube、Twitch、ニコニコ動画など、あらゆるプラットフォームでの配信・実況に対応しています。事前の許可や連絡は不要です。
              </p>
            </div>

            <div className="space-y-2">
              <h3
                className="text-sm font-extrabold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Q. 商用利用は可能ですか？
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-text-secondary)" }}
              >
                A.
                はい、商用利用も含め、どなたでも自由にお使いいただけます。詳しくは利用規約をご確認ください。
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="btn-primary inline-block py-4 px-8 text-lg"
          >
            さっそく遊んでみる
          </Link>
        </div>

        <footer className="text-center pt-4 space-y-2">
          <div className="flex justify-center gap-4">
            <Link
              href="/guide"
              className="text-xs hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              遊び方ガイド
            </Link>
            <Link
              href="/streaming"
              className="text-xs hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              配信ガイド
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
