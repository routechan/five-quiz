import type { Metadata } from "next";
import Link from "next/link";
import AdSense from "@/components/AdSense";

export const metadata: Metadata = {
  title: "遊び方ガイド - ファイブクイズ",
  description:
    "ファイブクイズの詳しい遊び方を解説。ルーム作成から回答・判定まで、初めてでもすぐに遊べるガイドです。",
};

export default function GuidePage() {
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
            遊び方ガイド
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            初めてでもすぐに遊べる！ファイブクイズの詳しいルールを解説します。
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
            ファイブクイズとは？
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ファイブクイズは、5人1組のチームで協力して遊ぶクイズゲームです。出題される問題に対して、5文字の答えを1人1文字ずつ手書きで回答します。全員の文字が揃って初めて答えが完成するため、チームワークと推理力が試されます。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            アカウント登録不要、ブラウザだけで遊べるので、友達と気軽に楽しめます。配信や実況での利用も大歓迎です。
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
            ステップ1：ルームを作成する
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            トップページの「ルームを作成する」ボタンを押し、ニックネーム（最大10文字）を入力します。ルームが作成されると、4桁のルームコードと招待リンクが発行されます。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            招待リンクを友達に共有して、メンバーを集めましょう。LINEやX（Twitter）で共有すると便利です。
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
            ステップ2：メンバーが集まったらゲーム開始
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            5人が揃ったら、ホスト（ルーム作成者）が「ゲーム開始」ボタンを押してスタートします。各プレイヤーには1番〜5番のポジションがランダムに割り振られます。このポジションが、答えの何文字目を担当するかを決めます。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            5人集まらない場合は、BOTを追加して遊ぶこともできます。BOTはランダムな文字を回答します。
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
            ステップ3：問題を見て1文字を手書き
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            問題が出題されたら、5文字の答えを推測して、自分の担当する位置の1文字を手書きで描きます。例えば、答えが「さくらもち」で自分が3番なら「ら」を手書きで入力します。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            手書き入力は指やマウスで画面上に直接描けます。描き直しも可能なので、納得いくまで書き直しましょう。他のメンバーが何を書いたかは、全員が提出するまで分かりません。
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
            ステップ4：全員の回答を見て判定
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            全員が回答を提出すると、正解と全員の手書き文字が一覧表示されます。各プレイヤーは自分の文字が正解と合っているかを自己判定します。「正解」か「不正解」のボタンを押して判定しましょう。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            手書き文字なので、正しい文字を書いていても読みづらい場合があります。判定はチームメンバー全員の合意で決めるのがおすすめです。
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
            ステップ5：次の問題へ、または終了
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            判定が終わったら、ホストが「次の問題」または「ゲーム終了」を選択します。ゲーム終了時にはチームの正解数や正答率が表示され、結果をXやLINEでシェアすることもできます。
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            問題数に制限はないので、好きなだけ続けられます。チームで何問連続正解できるかチャレンジしてみましょう！
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
            観戦モード
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            ゲームに参加せず、観戦だけすることもできます。ルームが満員（5人）の場合や、ゲーム開始後に参加した場合は自動的に観戦モードになります。観戦者は問題や回答の様子をリアルタイムで見ることができますが、回答や判定には参加できません。
          </p>
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
