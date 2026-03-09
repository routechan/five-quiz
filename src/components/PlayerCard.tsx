"use client";

import type { Player } from "@/types";

interface Props {
  player: Player;
  isCurrentUser?: boolean;
  showPosition?: boolean;
}

export function PlayerCard({
  player,
  isCurrentUser = false,
  showPosition = true,
}: Props) {
  return (
    <div
      className="flex-1 flex items-center gap-3 p-3 rounded-xl transition-all"
      style={{
        background: isCurrentUser
          ? "rgba(30, 144, 255, 0.08)"
          : "var(--color-bg-card)",
        border: isCurrentUser
          ? "3px solid var(--color-canvas)"
          : "3px solid var(--color-secondary-light)",
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showPosition && player.position && (
          <div className="position-badge flex-shrink-0">{player.position}</div>
        )}
        <div className="min-w-0">
          <span
            className="text-sm font-extrabold block truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {player.nickname}
          </span>
          <div className="flex items-center gap-1">
            {player.isHost && (
              <span
                className="text-xs font-bold"
                style={{ color: "var(--color-primary)" }}
              >
                HOST
              </span>
            )}
            {isCurrentUser && (
              <span
                className="text-xs font-bold"
                style={{ color: "var(--color-canvas)" }}
              >
                あなた
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
