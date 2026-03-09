# ファイブリーグ風クイズゲーム DB設計書

## 1. 概要

Supabase（PostgreSQL）を使用したデータベース設計。
リアルタイム機能はSupabase Realtimeを活用。

---

## 2. ER図

```
┌─────────────────┐       ┌─────────────────┐
│     quizzes     │       │      rooms      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ question        │       │ room_code       │
│ answer          │       │ host_player_id  │◄──┐
│ created_at      │       │ status          │   │
└─────────────────┘       │ current_quiz_id │───┼──┐
                          │ correct_count   │   │  │
                          │ question_count  │   │  │
                          │ created_at      │   │  │
                          └────────┬────────┘   │  │
                                   │            │  │
                                   │ 1:N        │  │
                                   ▼            │  │
                          ┌─────────────────┐   │  │
                          │    players      │   │  │
                          ├─────────────────┤   │  │
                          │ id (PK)         │───┘  │
                          │ room_id (FK)    │◄─────┤
                          │ nickname        │      │
                          │ position        │      │
                          │ session_id      │      │
                          │ is_host         │      │
                          │ created_at      │      │
                          └────────┬────────┘      │
                                   │               │
                                   │ 1:N           │
                                   ▼               │
                          ┌─────────────────┐      │
                          │    answers      │      │
                          ├─────────────────┤      │
                          │ id (PK)         │      │
                          │ room_id (FK)    │◄─────┤
                          │ quiz_id (FK)    │◄─────┘
                          │ player_id (FK)  │
                          │ drawing_data    │
                          │ is_correct      │
                          │ created_at      │
                          └─────────────────┘

┌─────────────────┐
│  used_quizzes   │  (出題済みクイズ管理)
├─────────────────┤
│ id (PK)         │
│ room_id (FK)    │
│ quiz_id (FK)    │
│ created_at      │
└─────────────────┘
```

---

## 3. テーブル定義

### 3.1 quizzes（クイズマスタ）

事前登録されるクイズデータ。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 主キー |
| question | TEXT | NOT NULL | - | 問題文 |
| answer | VARCHAR(5) | NOT NULL | - | 正解（5文字固定） |
| created_at | TIMESTAMPTZ | NOT NULL | now() | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)

**制約**:
- CHECK (char_length(answer) = 5)

```sql
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer VARCHAR(5) NOT NULL CHECK (char_length(answer) = 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.2 rooms（ルーム）

ゲームルームの管理。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 主キー |
| room_code | VARCHAR(8) | NOT NULL | - | 共有用ルームコード |
| host_player_id | UUID | NULL | - | ホストプレイヤーID |
| status | VARCHAR(20) | NOT NULL | 'waiting' | ルーム状態 |
| current_quiz_id | UUID | NULL | - | 現在出題中のクイズID |
| correct_count | INTEGER | NOT NULL | 0 | チーム正解数 |
| question_count | INTEGER | NOT NULL | 0 | 出題数 |
| created_at | TIMESTAMPTZ | NOT NULL | now() | 作成日時 |

**status の値**:
- `waiting`: 待機中（プレイヤー募集中）
- `playing`: ゲーム中
- `answering`: 回答入力中
- `judging`: 判定中
- `finished`: ゲーム終了

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE (room_code)

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) NOT NULL UNIQUE,
  host_player_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'answering', 'judging', 'finished')),
  current_quiz_id UUID REFERENCES quizzes(id),
  correct_count INTEGER NOT NULL DEFAULT 0,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 3.3 players（プレイヤー）

ルームに参加しているプレイヤー。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 主キー |
| room_id | UUID | NOT NULL | - | 所属ルームID |
| nickname | VARCHAR(10) | NOT NULL | - | ニックネーム |
| position | INTEGER | NULL | - | 担当位置（1-5） |
| session_id | VARCHAR(255) | NOT NULL | - | ブラウザセッションID |
| is_host | BOOLEAN | NOT NULL | false | ホストかどうか |
| created_at | TIMESTAMPTZ | NOT NULL | now() | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX (room_id)
- UNIQUE (room_id, position) WHERE position IS NOT NULL
- UNIQUE (room_id, session_id)

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(10) NOT NULL,
  position INTEGER CHECK (position >= 1 AND position <= 5),
  session_id VARCHAR(255) NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, session_id)
);

CREATE UNIQUE INDEX idx_players_room_position 
  ON players (room_id, position) 
  WHERE position IS NOT NULL;
```

---

### 3.4 answers（回答）

各プレイヤーの回答データ。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 主キー |
| room_id | UUID | NOT NULL | - | ルームID |
| quiz_id | UUID | NOT NULL | - | クイズID |
| player_id | UUID | NOT NULL | - | プレイヤーID |
| drawing_data | TEXT | NOT NULL | - | 手書きデータ（Base64 PNG） |
| is_correct | BOOLEAN | NULL | - | 正誤判定（NULL=未判定） |
| created_at | TIMESTAMPTZ | NOT NULL | now() | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE (room_id, quiz_id, player_id)
- INDEX (room_id, quiz_id)

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  drawing_data TEXT NOT NULL,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, quiz_id, player_id)
);

CREATE INDEX idx_answers_room_quiz ON answers (room_id, quiz_id);
```

---

### 3.5 used_quizzes（出題済みクイズ）

同一ルームでの重複出題を防ぐ。

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|----------|----------|------|------------|------|
| id | UUID | NOT NULL | gen_random_uuid() | 主キー |
| room_id | UUID | NOT NULL | - | ルームID |
| quiz_id | UUID | NOT NULL | - | クイズID |
| created_at | TIMESTAMPTZ | NOT NULL | now() | 出題日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE (room_id, quiz_id)

```sql
CREATE TABLE used_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, quiz_id)
);
```

---

## 4. Supabase Realtime 設定

リアルタイム同期が必要なテーブル:

```sql
-- Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
```

### 購読するイベント

| テーブル | イベント | 用途 |
|----------|----------|------|
| rooms | UPDATE | ルーム状態変更の同期 |
| players | INSERT, DELETE | プレイヤー入退室の同期 |
| players | UPDATE | 順番変更の同期 |
| answers | INSERT | 回答提出の同期 |
| answers | UPDATE | 正誤判定の同期 |

---

## 5. Row Level Security (RLS)

### 5.1 quizzes

```sql
-- 読み取りのみ許可
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT
  USING (true);
```

### 5.2 rooms

```sql
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能
CREATE POLICY "Anyone can read rooms"
  ON rooms FOR SELECT
  USING (true);

-- 誰でも作成可能
CREATE POLICY "Anyone can create rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

-- ホストのみ更新可能（session_idで検証）
CREATE POLICY "Host can update room"
  ON rooms FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.room_id = rooms.id
        AND players.is_host = true
        AND players.session_id = current_setting('app.session_id', true)
    )
  );
```

### 5.3 players

```sql
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 同じルームのプレイヤーは読み取り可能
CREATE POLICY "Room members can read players"
  ON players FOR SELECT
  USING (true);

-- 誰でも参加可能
CREATE POLICY "Anyone can join room"
  ON players FOR INSERT
  WITH CHECK (true);

-- 自分自身またはホストのみ削除可能
CREATE POLICY "Self or host can delete player"
  ON players FOR DELETE
  USING (
    session_id = current_setting('app.session_id', true)
    OR EXISTS (
      SELECT 1 FROM players AS host
      WHERE host.room_id = players.room_id
        AND host.is_host = true
        AND host.session_id = current_setting('app.session_id', true)
    )
  );
```

### 5.4 answers

```sql
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 同じルームのメンバーは読み取り可能
CREATE POLICY "Room members can read answers"
  ON answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.room_id = answers.room_id
        AND players.session_id = current_setting('app.session_id', true)
    )
  );

-- 自分の回答のみ作成可能
CREATE POLICY "Players can submit own answer"
  ON answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = answers.player_id
        AND players.session_id = current_setting('app.session_id', true)
    )
  );

-- 自分の回答のみ更新可能（正誤判定）
CREATE POLICY "Players can judge own answer"
  ON answers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.id = answers.player_id
        AND players.session_id = current_setting('app.session_id', true)
    )
  );
```

---

## 6. 初期データ（クイズサンプル）

```sql
INSERT INTO quizzes (question, answer) VALUES
  ('南アジアに位置する国、ブータンの首都は？', 'ティンブー'),
  ('日本で一番高い山は？', 'ふじさん'),
  ('太陽系で一番大きい惑星は？', 'もくせい'),
  ('「千と千尋の神隠し」の監督は？', 'みやざき'),
  ('世界で一番長い川は？', 'ナイルがわ'),
  ('日本の首都は？', 'とうきょう'),
  ('一年で一番日が長い日を何という？', 'げしのひ'),
  ('人間の体で一番大きい臓器は？', 'かんぞう'),
  ('ピカソの出身国は？', 'スペイン'),
  ('「ドラえもん」の作者は？', 'ふじこふじ');
```

---

## 7. データベース関数

### 7.1 ランダムクイズ取得

```sql
CREATE OR REPLACE FUNCTION get_random_quiz(p_room_id UUID)
RETURNS TABLE (id UUID, question TEXT, answer VARCHAR(5))
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question, q.answer
  FROM quizzes q
  WHERE q.id NOT IN (
    SELECT uq.quiz_id FROM used_quizzes uq WHERE uq.room_id = p_room_id
  )
  ORDER BY random()
  LIMIT 1;
END;
$$;
```

### 7.2 ルームコード生成

```sql
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(8)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;
```

---

## 8. クリーンアップ

古いルームの自動削除（1時間以上前のルーム）:

```sql
-- 定期実行用の関数
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < now() - interval '1 hour'
    AND status = 'finished';
  
  DELETE FROM rooms
  WHERE created_at < now() - interval '3 hours';
END;
$$;
```

※ Supabase の cron 機能または外部スケジューラで定期実行
