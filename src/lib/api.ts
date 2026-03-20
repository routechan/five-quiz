import { getSessionId } from './session';

const BASE_URL = '/api';

// 同時リクエスト抑制: 同じパス+メソッドのリクエストが進行中なら待つ
const inflightRequests = new Map<string, Promise<unknown>>();

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const sessionId = getSessionId();
  const method = options.method || 'GET';
  const dedupeKey = `${method}:${path}`;

  // 同じリクエストが進行中ならそれを返す（GET/POST/PATCH全て）
  const inflight = inflightRequests.get(dedupeKey);
  if (inflight) return inflight as Promise<T>;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

  const promise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId,
          ...options.headers,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw data;
      }

      return data as T;
    } finally {
      clearTimeout(timeout);
      inflightRequests.delete(dedupeKey);
    }
  })();

  inflightRequests.set(dedupeKey, promise);

  return promise;
}

export const api = {
  // ルーム作成
  createRoom(nickname: string) {
    return request<{ roomCode: string; roomId: string; playerId: string }>(
      '/rooms',
      {
        method: 'POST',
        body: JSON.stringify({ nickname, sessionId: getSessionId() }),
      }
    );
  },

  // ルーム情報取得
  getRoom(code: string) {
    return request<{
      room: import('@/types').Room;
      players: import('@/types').Player[];
      answers: import('@/types').Answer[];
      currentQuiz?: { id: string; question: string; answer?: string };
    }>(`/rooms/${code}`);
  },

  // ルーム参加
  joinRoom(code: string, nickname: string) {
    return request<{ roomId: string; playerId: string }>(
      `/rooms/${code}/join`,
      {
        method: 'POST',
        body: JSON.stringify({ nickname, sessionId: getSessionId() }),
      }
    );
  },

  // 観戦参加
  spectateRoom(code: string, nickname: string) {
    return request<{ roomId: string; playerId: string; isSpectator: boolean }>(
      `/rooms/${code}/spectate`,
      {
        method: 'POST',
        body: JSON.stringify({ nickname, sessionId: getSessionId() }),
      }
    );
  },

  // ルーム退出
  leaveRoom(code: string) {
    return request<{ success: boolean; roomClosed: boolean }>(
      `/rooms/${code}/leave`,
      {
        method: 'POST',
        body: JSON.stringify({ sessionId: getSessionId() }),
      }
    );
  },

  // 順番変更
  updatePositions(
    code: string,
    positions: { playerId: string; position: number }[]
  ) {
    return request<{ success: boolean }>(`/rooms/${code}/positions`, {
      method: 'PATCH',
      body: JSON.stringify({ sessionId: getSessionId(), positions }),
    });
  },

  // ゲーム開始
  startGame(code: string) {
    return request<{
      success: boolean;
      quiz: { id: string; question: string };
    }>(`/rooms/${code}/start`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
  },

  // 次の問題
  nextQuiz(code: string) {
    return request<{
      success: boolean;
      quiz: { id: string; question: string };
    }>(`/rooms/${code}/next`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
  },

  // ゲーム終了
  endGame(code: string) {
    return request<{
      success: boolean;
      result: { correctCount: number; questionCount: number };
    }>(`/rooms/${code}/end`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
  },

  // 回答を表示（ホスト用）
  revealAnswers(code: string) {
    return request<{ success: boolean }>(`/rooms/${code}/reveal`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
  },

  // 回答提出
  submitAnswer(code: string, drawingData: string) {
    return request<{ success: boolean; answerId: string }>(
      `/rooms/${code}/answer`,
      {
        method: 'POST',
        body: JSON.stringify({ sessionId: getSessionId(), drawingData }),
      }
    );
  },

  // BOT追加
  addBot(code: string) {
    return request<{ success: boolean }>(`/rooms/${code}/add-bot`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId() }),
    });
  },

  // プレイヤーキック（BOT置換）
  kickPlayer(code: string, targetPlayerId: string) {
    return request<{ success: boolean }>(`/rooms/${code}/kick`, {
      method: 'POST',
      body: JSON.stringify({ sessionId: getSessionId(), targetPlayerId }),
    });
  },

  // 正誤判定
  judgeAnswer(code: string, isCorrect: boolean) {
    return request<{
      success: boolean;
      allJudged: boolean;
      teamCorrect: boolean | null;
    }>(`/rooms/${code}/judge`, {
      method: 'PATCH',
      body: JSON.stringify({ sessionId: getSessionId(), isCorrect }),
    });
  },
};
