# ファイブリーグ風クイズゲーム API設計書

## 1. 概要

Next.js App Router の API Routes および Server Actions を使用。
リアルタイム通信は Supabase Realtime を使用。

---

## 2. API一覧

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| POST | /api/rooms | ルーム作成 |
| GET | /api/rooms/[code] | ルーム情報取得 |
| POST | /api/rooms/[code]/join | ルーム参加 |
| POST | /api/rooms/[code]/leave | ルーム退出 |
| POST | /api/rooms/[code]/kick | プレイヤーキック |
| PATCH | /api/rooms/[code]/positions | 順番変更 |
| POST | /api/rooms/[code]/start | ゲーム開始 |
| POST | /api/rooms/[code]/next | 次の問題 |
| POST | /api/rooms/[code]/end | ゲーム終了 |
| POST | /api/rooms/[code]/answer | 回答提出 |
| PATCH | /api/rooms/[code]/judge | 正誤判定 |

---

## 3. API詳細

### 3.1 ルーム作成

**POST /api/rooms**

新しいルームを作成し、作成者をホストとして登録。

**リクエスト**
```json
{
  "nickname": "太郎",
  "sessionId": "uuid-session-xxxxx"
}
```

**レスポンス（成功: 201）**
```json
{
  "roomCode": "ABC123",
  "roomId": "uuid-room-xxxxx",
  "playerId": "uuid-player-xxxxx"
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 400 | ニックネームが空 or 10文字超 |
| 500 | サーバーエラー |

---

### 3.2 ルーム情報取得

**GET /api/rooms/[code]**

ルームの現在の状態を取得。

**レスポンス（成功: 200）**
```json
{
  "room": {
    "id": "uuid-room-xxxxx",
    "roomCode": "ABC123",
    "status": "waiting",
    "currentQuiz": null,
    "correctCount": 0,
    "questionCount": 0
  },
  "players": [
    {
      "id": "uuid-player-xxxxx",
      "nickname": "太郎",
      "position": 1,
      "isHost": true
    },
    {
      "id": "uuid-player-yyyyy",
      "nickname": "花子",
      "position": 2,
      "isHost": false
    }
  ],
  "answers": []
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 404 | ルームが存在しない |

---

### 3.3 ルーム参加

**POST /api/rooms/[code]/join**

既存のルームに参加。

**リクエスト**
```json
{
  "nickname": "花子",
  "sessionId": "uuid-session-yyyyy"
}
```

**レスポンス（成功: 200）**
```json
{
  "roomId": "uuid-room-xxxxx",
  "playerId": "uuid-player-yyyyy"
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 400 | ニックネームが不正 |
| 404 | ルームが存在しない |
| 409 | ルームが満員（5人） |
| 409 | ゲーム開始済み |
| 409 | 同じセッションIDで既に参加済み |

---

### 3.4 ルーム退出

**POST /api/rooms/[code]/leave**

ルームから退出。ホストが退出するとルーム終了。

**リクエスト**
```json
{
  "sessionId": "uuid-session-yyyyy"
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "roomClosed": false
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 404 | プレイヤーが見つからない |

---

### 3.5 プレイヤーキック

**POST /api/rooms/[code]/kick**

ホストが特定のプレイヤーを退出させる。

**リクエスト**
```json
{
  "sessionId": "uuid-session-host",
  "targetPlayerId": "uuid-player-yyyyy"
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 403 | ホスト以外が実行 |
| 404 | 対象プレイヤーが見つからない |

---

### 3.6 順番変更

**PATCH /api/rooms/[code]/positions**

ホストがプレイヤーの担当順（1〜5文字目）を設定。

**リクエスト**
```json
{
  "sessionId": "uuid-session-host",
  "positions": [
    { "playerId": "uuid-player-1", "position": 1 },
    { "playerId": "uuid-player-2", "position": 2 },
    { "playerId": "uuid-player-3", "position": 3 },
    { "playerId": "uuid-player-4", "position": 4 },
    { "playerId": "uuid-player-5", "position": 5 }
  ]
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 400 | 位置が1〜5でない or 重複 |
| 403 | ホスト以外が実行 |

---

### 3.7 ゲーム開始

**POST /api/rooms/[code]/start**

ホストがゲームを開始。最初の問題を出題。

**リクエスト**
```json
{
  "sessionId": "uuid-session-host"
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "quiz": {
    "id": "uuid-quiz-xxxxx",
    "question": "ブータンの首都は？"
  }
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 400 | 5人揃っていない |
| 400 | 全員の順番が設定されていない |
| 403 | ホスト以外が実行 |
| 404 | 出題可能なクイズがない |

---

### 3.8 次の問題

**POST /api/rooms/[code]/next**

次の問題を出題。

**リクエスト**
```json
{
  "sessionId": "uuid-session-host"
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "quiz": {
    "id": "uuid-quiz-yyyyy",
    "question": "日本で一番高い山は？"
  }
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 403 | ホスト以外が実行 |
| 404 | 出題可能なクイズがない |

---

### 3.9 ゲーム終了

**POST /api/rooms/[code]/end**

ホストがゲームを終了。

**リクエスト**
```json
{
  "sessionId": "uuid-session-host"
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "result": {
    "correctCount": 7,
    "questionCount": 10
  }
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 403 | ホスト以外が実行 |

---

### 3.10 回答提出

**POST /api/rooms/[code]/answer**

プレイヤーが手書き回答を提出。

**リクエスト**
```json
{
  "sessionId": "uuid-session-xxxxx",
  "drawingData": "data:image/png;base64,iVBORw0KGgo..."
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "answerId": "uuid-answer-xxxxx"
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 400 | 描画データが空 |
| 400 | 既に提出済み |
| 404 | プレイヤーが見つからない |

---

### 3.11 正誤判定

**PATCH /api/rooms/[code]/judge**

プレイヤーが自分の回答の正誤を判定。

**リクエスト**
```json
{
  "sessionId": "uuid-session-xxxxx",
  "isCorrect": true
}
```

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "allJudged": false,
  "teamCorrect": null
}
```

**全員が判定完了した場合:**
```json
{
  "success": true,
  "allJudged": true,
  "teamCorrect": true
}
```

**エラー**
| ステータス | 理由 |
|------------|------|
| 404 | 回答が見つからない |

---

## 4. Supabase Realtime 設計

### 4.1 チャンネル構成

各ルームごとに専用チャンネルを作成:

```typescript
// チャンネル名: room:{roomCode}
const channel = supabase.channel(`room:${roomCode}`);
```

### 4.2 購読イベント

#### rooms テーブルの変更
```typescript
channel.on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'rooms',
    filter: `id=eq.${roomId}`
  },
  (payload) => {
    // ルーム状態更新（status, current_quiz_id, correct_count）
  }
);
```

#### players テーブルの変更
```typescript
channel.on(
  'postgres_changes',
  {
    event: '*',  // INSERT, UPDATE, DELETE
    schema: 'public',
    table: 'players',
    filter: `room_id=eq.${roomId}`
  },
  (payload) => {
    // プレイヤー入退室、順番変更
  }
);
```

#### answers テーブルの変更
```typescript
channel.on(
  'postgres_changes',
  {
    event: '*',  // INSERT, UPDATE
    schema: 'public',
    table: 'answers',
    filter: `room_id=eq.${roomId}`
  },
  (payload) => {
    // 回答提出、正誤判定
  }
);
```

### 4.3 状態管理フロー

```
[待機中]
  ↓ players INSERT/DELETE を監視
  ↓ 5人揃ったらゲーム開始可能

[ゲーム開始]
  ↓ rooms UPDATE (status: 'playing', current_quiz_id: xxx)
  ↓ 全員に問題を表示

[回答入力中]
  ↓ rooms UPDATE (status: 'answering')
  ↓ answers INSERT を監視（提出状況）
  ↓ 5人全員提出で次へ

[判定中]
  ↓ rooms UPDATE (status: 'judging')
  ↓ answers UPDATE を監視（is_correct）
  ↓ 全員判定完了で集計

[次の問題 or 終了]
  ↓ rooms UPDATE (status: 'playing' or 'finished')
```

---

## 5. セッション管理

### 5.1 セッションID生成

クライアント側でUUIDを生成し、localStorage に保存:

```typescript
// lib/session.ts
export function getSessionId(): string {
  const key = 'five-league-session';
  let sessionId = localStorage.getItem(key);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(key, sessionId);
  }
  
  return sessionId;
}
```

### 5.2 セッションIDの送信

全てのAPIリクエストにセッションIDを含める:

```typescript
// リクエストヘッダーまたはボディで送信
headers: {
  'X-Session-Id': sessionId
}
// または
body: {
  sessionId: sessionId,
  ...otherData
}
```

---

## 6. エラーハンドリング

### 6.1 共通エラーレスポンス形式

```json
{
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "指定されたルームが見つかりません"
  }
}
```

### 6.2 エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| INVALID_NICKNAME | 400 | ニックネームが不正 |
| INVALID_POSITION | 400 | 位置指定が不正 |
| ALREADY_SUBMITTED | 400 | 既に回答提出済み |
| NOT_ENOUGH_PLAYERS | 400 | プレイヤーが5人未満 |
| POSITIONS_NOT_SET | 400 | 順番が設定されていない |
| FORBIDDEN | 403 | 権限がない |
| ROOM_NOT_FOUND | 404 | ルームが見つからない |
| PLAYER_NOT_FOUND | 404 | プレイヤーが見つからない |
| NO_QUIZ_AVAILABLE | 404 | 出題可能なクイズがない |
| ROOM_FULL | 409 | ルームが満員 |
| GAME_ALREADY_STARTED | 409 | ゲーム開始済み |
| ALREADY_JOINED | 409 | 既に参加済み |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

---

## 7. 型定義

```typescript
// types/index.ts

export type RoomStatus = 
  | 'waiting' 
  | 'playing' 
  | 'answering' 
  | 'judging' 
  | 'finished';

export interface Room {
  id: string;
  roomCode: string;
  status: RoomStatus;
  currentQuizId: string | null;
  correctCount: number;
  questionCount: number;
}

export interface Player {
  id: string;
  roomId: string;
  nickname: string;
  position: number | null;
  isHost: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  answer: string;  // 結果表示時のみ含む
}

export interface Answer {
  id: string;
  roomId: string;
  quizId: string;
  playerId: string;
  drawingData: string;  // Base64 PNG
  isCorrect: boolean | null;
}

// API Response Types
export interface CreateRoomResponse {
  roomCode: string;
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
}

export interface RoomStateResponse {
  room: Room;
  players: Player[];
  answers: Answer[];
  currentQuiz?: {
    id: string;
    question: string;
    answer?: string;  // judgingステータス時のみ
  };
}
```

---

## 8. フロントエンド実装ガイド

### 8.1 推奨ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx                    # トップページ
│   ├── room/
│   │   └── [code]/
│   │       ├── page.tsx            # ルームページ
│   │       └── components/
│   │           ├── WaitingRoom.tsx
│   │           ├── QuizDisplay.tsx
│   │           ├── AnswerInput.tsx
│   │           ├── WaitingAnswer.tsx
│   │           ├── ResultDisplay.tsx
│   │           └── GameEnd.tsx
│   └── api/
│       └── rooms/
│           ├── route.ts            # POST /api/rooms
│           └── [code]/
│               ├── route.ts        # GET /api/rooms/[code]
│               ├── join/route.ts
│               ├── leave/route.ts
│               ├── kick/route.ts
│               ├── positions/route.ts
│               ├── start/route.ts
│               ├── next/route.ts
│               ├── end/route.ts
│               ├── answer/route.ts
│               └── judge/route.ts
├── components/
│   ├── DrawingCanvas.tsx           # 手書きキャンバス
│   ├── PlayerCard.tsx
│   └── AnswerSlot.tsx
├── hooks/
│   ├── useRoom.ts                  # ルーム状態管理
│   └── useRealtime.ts              # Realtime購読
├── lib/
│   ├── supabase.ts                 # Supabaseクライアント
│   ├── session.ts                  # セッション管理
│   └── api.ts                      # APIクライアント
└── types/
    └── index.ts                    # 型定義
```

### 8.2 手書きキャンバス実装ヒント

```typescript
// components/DrawingCanvas.tsx
'use client';

import { useRef, useEffect, useState } from 'react';

interface Props {
  onSubmit: (dataUrl: string) => void;
}

export function DrawingCanvas({ onSubmit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // タッチ/マウスイベントの統一処理
  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current!;
    const dataUrl = canvas.toDataURL('image/png');
    onSubmit(dataUrl);
  };

  // ... 描画ロジック
}
```

---

## 9. 音声ファイル一覧

| ファイル名 | 用途 | 推奨形式 |
|-----------|------|---------|
| bgm_waiting.mp3 | 待機中BGM | MP3 |
| bgm_playing.mp3 | ゲーム中BGM | MP3 |
| se_correct.mp3 | 正解SE | MP3 |
| se_wrong.mp3 | 不正解SE | MP3 |
| se_submit.mp3 | 回答提出SE | MP3 |
| se_reveal.mp3 | 結果表示SE | MP3 |

配置先: `public/sounds/`
