import type { Metadata } from "next";
import Link from "next/link";
import AdSense from "@/components/AdSense";

export const metadata: Metadata = {
  title: "配信・実況ガイド - ファイブクイズ",
  description:
    "ファイブクイズを配信や実況で使う方法を解説。セットアップ方法や盛り上げるためのコツを紹介します。",
};

export default function StreamingPage() {
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
            配信・実況ガイド
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            ファイブクイズを配信で盛り上げるためのガイドです。
          </p>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            配信での利用について
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <p>
              ファイブクイズは、動画配信・実況・録画・スクリーンショットなど、あらゆる形態での利用が可能です。以下のプラットフォームで自由にお使いいただけます。
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>YouTube / YouTube Live</li>
              <li>Twitch</li>
              <li>ニコニコ動画 / ニコニコ生放送</li>
              <li>TikTok / TikTok LIVE</li>
              <li>ミルダム</li>
              <li>ツイキャス</li>
              <li>その他すべての配信プラットフォーム</li>
            </ul>
            <p>
              事前の許可や連絡は不要です。個人・法人を問わず、商用利用も含めて自由にお使いいただけます。
            </p>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            配信セットアップ方法
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <h3 className="font-extrabold" style={{ color: "var(--color-text-primary)" }}>
              基本的なセットアップ
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                配信者がファイブクイズのルームを作成します。
              </li>
              <li>
                招待リンクを共演者（コラボ相手）に共有します。Discordなどの通話アプリで共有するのが便利です。
              </li>
              <li>
                OBSなどの配信ソフトで、ファイブクイズの画面をキャプチャします。ブラウザのウィンドウキャプチャまたは画面キャプチャが使えます。
              </li>
              <li>
                5人が集まったらゲーム開始！配信者がホストとなってゲームを進行します。
              </li>
            </ol>

            <h3 className="font-extrabold mt-4" style={{ color: "var(--color-text-primary)" }}>
              観戦モードの活用
            </h3>
            <p>
              視聴者が観戦モードで参加することもできます。招待リンクを配信の概要欄やチャットに貼ることで、視聴者もリアルタイムで問題や回答の様子を自分の画面で確認できます。
            </p>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            配信を盛り上げるコツ
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>回答中は無言タイムを作る</strong>
                ：回答中に答えを言ってしまわないよう、「回答中は無言」のルールを設けると、答え合わせの瞬間がより盛り上がります。
              </li>
              <li>
                <strong>答え合わせの前に予想タイムを設ける</strong>
                ：全員の回答が出揃ったら、公開前に「みんな何て書いたと思う？」と予想する時間を作ると、視聴者も一緒に楽しめます。
              </li>
              <li>
                <strong>手書き文字にツッコむ</strong>
                ：手書き文字の面白さはファイブクイズの醍醐味です。「この字は読めない！」「意外とうまい！」といったリアクションが盛り上がりにつながります。
              </li>
              <li>
                <strong>判定の議論を楽しむ</strong>
                ：微妙な文字の判定で「正解でいいでしょ！」「いや、不正解！」と議論するのも面白いポイントです。視聴者のコメントも取り入れてみましょう。
              </li>
              <li>
                <strong>連続正解チャレンジ</strong>
                ：「何問連続で正解できるか」を目標にすると、緊張感が生まれて盛り上がります。
              </li>
            </ul>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            配信時の注意点
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>ルームコードの扱い</strong>
                ：ルームコードや招待リンクが配信画面に映る場合、意図しない参加者が入る可能性があります。プレイヤーは5人までなので、6人目以降は自動的に観戦モードになりますが、気になる場合は画面上のルームコード部分を隠しましょう。
              </li>
              <li>
                <strong>ニックネーム</strong>
                ：配信で使うニックネームには、個人情報が含まれないようにしましょう。配信名やキャラクター名を使うのがおすすめです。
              </li>
              <li>
                <strong>ネットワーク環境</strong>
                ：リアルタイム通信を使用するため、安定したインターネット接続をおすすめします。Wi-Fiよりも有線接続の方が安定します。
              </li>
            </ul>
          </div>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            コラボ配信での活用
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <p>
              ファイブクイズはコラボ配信のコンテンツとして特におすすめです。5人で遊ぶゲームなので、コラボ相手が多いほど盛り上がります。
            </p>
            <p>
              DiscordやLINEで通話しながら遊ぶのが一般的です。回答中は答えを言わないルールを設けつつ、答え合わせのときは全員でリアクションしましょう。
            </p>
            <p>
              各配信者が自分の画面をキャプチャすれば、それぞれの視点からゲームを配信できます。視聴者は好きな配信者の視点から楽しめるので、マルチ視点の配信も人気があります。
            </p>
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
              href="/faq"
              className="text-xs hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              よくある質問
            </Link>
            <Link
              href="/about"
              className="text-xs hover:underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              ファイブクイズについて
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
