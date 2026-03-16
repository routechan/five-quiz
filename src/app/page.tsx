"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { api } from "@/lib/api";

export default function TopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    if (nickname.length > 10) {
      setError("ニックネームは10文字以内で入力してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { roomCode, playerId } = await api.createRoom(nickname.trim());
      sessionStorage.setItem("playerId", playerId);
      router.push(`/room/${roomCode}`);
    } catch {
      setError("ルームの作成に失敗しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[250px] h-[250px] rounded-full opacity-10"
          style={{ background: "var(--color-canvas)" }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[150px] h-[150px] rounded-full opacity-5"
          style={{ background: "var(--color-primary)" }}
        />
      </div>

      <div className="text-center max-w-md w-full relative z-10 pt-24">
        {/* Logo area */}
        <div className="mb-10 animate-float-in">
          <h1
            className="text-5xl mb-3 quiz-title-shine"
            style={{ fontFamily: "var(--font-quiz-title)" }}
          >
            ファイブクイズ
          </h1>
          <p
            className="text-lg font-bold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            5人で挑む文字当てクイズ！
          </p>
        </div>

        {!showInput ? (
          <div className="animate-slide-up">
            <button
              onClick={() => setShowInput(true)}
              className="btn-primary w-full py-5 px-8 text-xl cursor-pointer"
            >
              ルームを作成する
            </button>
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              招待リンクで友達を呼ぼう
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-pop-in">
            <div className="quiz-card p-6">
              <label
                className="block text-sm font-bold mb-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                ニックネームを入力
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError("");
                }}
                maxLength={10}
                placeholder="最大10文字"
                className="w-full px-4 py-3 rounded-xl text-center text-lg font-bold
                  focus:outline-none focus:ring-3 transition-all"
                style={{
                  border: "3px solid var(--color-secondary)",
                  color: "var(--color-text-primary)",
                  caretColor: "var(--color-text-primary)",
                  background: "var(--color-bg-card)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-secondary)")
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <p
                className="text-xs mt-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {nickname.length}/10文字
              </p>
            </div>

            {error && (
              <p
                className="text-sm font-bold"
                style={{ color: "var(--color-error)" }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary w-full py-5 px-8 text-xl cursor-pointer"
            >
              {loading ? "作成中..." : "ルームを作成"}
            </button>
          </div>
        )}
      </div>

      {/* ゲーム説明セクション */}
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full relative z-10 mt-16 mb-12 space-y-8">
        {/* ゲームの概要 */}
        <div className="quiz-card p-6 space-y-3">
          <h2
            className="text-xl font-extrabold text-center"
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
            5人1組のチームで挑む協力型クイズゲームです。
            出題されるヒントをもとに、5文字の答えを1人1文字ずつ手書きで回答します。
            全員の文字が揃って初めて正解になるチームワークが試されるゲームです！
          </p>
        </div>

        {/* 遊び方 */}
        <div className="quiz-card p-6 space-y-4">
          <h2
            className="text-xl font-extrabold text-center"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            遊び方
          </h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <span
                className="position-badge shrink-0"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                }}
              >
                1
              </span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  ルームを作成
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  ホストがルームを作成し、招待リンクを友達にシェアします。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span
                className="position-badge shrink-0"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                }}
              >
                2
              </span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  5人が集まったらスタート
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  各プレイヤーに1番〜5番のポジションが割り当てられます。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span
                className="position-badge shrink-0"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                }}
              >
                3
              </span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  問題を見て1文字を手書き
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  出題された問題の答えを推測し、自分の担当する1文字を手書きで描いて提出します。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span
                className="position-badge shrink-0"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                }}
              >
                4
              </span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  みんなで正誤を判定
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  全員の回答が出揃ったら、正解と見比べてそれぞれの文字が合っているか全員で判定します。
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <span
                className="position-badge shrink-0"
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  width: "28px",
                  height: "28px",
                  fontSize: "14px",
                }}
              >
                5
              </span>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  5文字全問正解でチーム正解！
                </p>
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  全員の文字が正解と判定されればチーム正解。何問正解できるかチャレンジしよう！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 利用について */}
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full relative z-10 mb-12">
        <div className="quiz-card p-6 space-y-3">
          <h2
            className="text-xl font-extrabold text-center"
            style={{
              color: "var(--color-primary)",
              fontFamily: "var(--font-quiz-title)",
            }}
          >
            ご利用について
          </h2>
          <p
            className="text-sm leading-relaxed text-center"
            style={{ color: "var(--color-text-secondary)" }}
          >
            動画配信・実況・商用利用など、どなたでもご自由にお使いいただけます。
            <br />
            事前の許可や連絡は不要です。ぜひお楽しみください！
          </p>
        </div>
      </div>

      {/* フッター */}
      <footer className="w-full py-6 mt-auto relative z-10 text-center space-y-2">
        <div className="flex justify-center gap-4">
          <Link
            href="/privacy"
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/terms"
            className="text-xs hover:underline"
            style={{ color: "var(--color-text-muted)" }}
          >
            利用規約
          </Link>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          &copy; ファイブクイズ
        </p>
      </footer>
    </div>
  );
}
