import type { Metadata } from "next";
import Link from "next/link";
import AdSense from "@/components/AdSense";

export const metadata: Metadata = {
  title: "ファイブクイズについて - 5人で挑む文字当てクイズ",
  description:
    "ファイブクイズは5人1組で協力して遊ぶ手書きクイズゲームです。ゲームの特徴や楽しみ方を紹介します。",
};

export default function AboutPage() {
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
            ファイブクイズについて
          </h1>
        </div>

        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            ゲームの特徴
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <p>
              ファイブクイズは、5人のプレイヤーがそれぞれ1文字ずつ担当し、チームで5文字の答えを完成させる協力型クイズゲームです。
            </p>
            <p>
              一般的なクイズゲームと違い、回答は手書きで入力します。キーボード入力ではなく、指やマウスで文字を描くことで、よりアナログな楽しさとドキドキ感を味わえます。
            </p>
            <p>
              誰がどの文字を担当するかはポジション順で決まるため、チームメンバー全員が同じ答えを思い浮かべていないと正解できません。知識だけでなく、チームの「あうんの呼吸」が試されるゲームです。
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
            こんな場面におすすめ
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>友達とのオンライン飲み会</strong>
                ：通話しながらワイワイ遊べます。答え合わせの瞬間はみんなで盛り上がること間違いなし。
              </li>
              <li>
                <strong>配信・実況のコンテンツとして</strong>
                ：視聴者も一緒に答えを考えられるので、参加型の配信にぴったりです。観戦モードもあるので、視聴者に画面を共有することもできます。
              </li>
              <li>
                <strong>学校や職場のレクリエーション</strong>
                ：チームビルディングやアイスブレイクとして活用できます。チームワークが自然と生まれるゲームデザインです。
              </li>
              <li>
                <strong>家族で遊ぶ</strong>
                ：年齢を問わず楽しめるシンプルなルールなので、家族みんなで遊べます。子どもの手書き文字も味があって盛り上がります。
              </li>
              <li>
                <strong>暇つぶしに</strong>
                ：1問あたり数分で遊べるので、ちょっとした空き時間にもぴったりです。BOTを入れれば少人数でも遊べます。
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
            手書きならではの面白さ
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <p>
              ファイブクイズでは、回答をキーボードではなく手書きで入力します。この手書き入力が、ゲームに独特の面白さを生み出しています。
            </p>
            <p>
              同じ文字でも、人によって書き方のクセが出るのが手書きの魅力です。「この字は何？」「読めない！」というやりとりが自然と生まれ、笑いが絶えません。
            </p>
            <p>
              また、正解の文字を知っていても、手書きで正確に表現するのは意外と難しいものです。頭では分かっているのに手がついていかない、そんなもどかしさも楽しみのひとつです。
            </p>
            <p>
              判定も人の目で行うため、「この字は正解でいいよね？」「いや、ちょっと違うんじゃ…」という議論が盛り上がります。厳しく判定するか、甘めに判定するかはチーム次第です。
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
            サービスの特徴
          </h2>
          <div
            className="space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>完全無料</strong>：課金要素は一切ありません。
              </li>
              <li>
                <strong>アカウント登録不要</strong>
                ：ニックネームを入力するだけですぐに遊べます。
              </li>
              <li>
                <strong>マルチデバイス対応</strong>
                ：スマホ、タブレット、PCのどれでも快適に遊べます。
              </li>
              <li>
                <strong>配信・商用利用OK</strong>
                ：事前の許可なく、自由に配信や実況に使えます。
              </li>
              <li>
                <strong>観戦モード</strong>
                ：ゲームに参加しなくても、リアルタイムで観戦できます。
              </li>
              <li>
                <strong>BOT機能</strong>
                ：5人揃わなくてもBOTを追加してプレイできます。
              </li>
            </ul>
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
