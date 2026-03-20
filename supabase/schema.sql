-- ファイブクイズ テーブル定義
-- Supabase SQL Editor で実行してください

-- 1. quizzes（クイズマスタ）
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer VARCHAR(5) NOT NULL CHECK (char_length(answer) = 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. rooms（ルーム）
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(8) NOT NULL UNIQUE,
  host_player_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'playing', 'answering', 'answered', 'judging', 'finished')),
  current_quiz_id UUID REFERENCES quizzes(id),
  correct_count INTEGER NOT NULL DEFAULT 0,
  question_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. players（プレイヤー）
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nickname VARCHAR(10) NOT NULL,
  position INTEGER CHECK (position >= 1 AND position <= 5),
  session_id VARCHAR(255) NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  is_spectator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, session_id)
);

CREATE UNIQUE INDEX idx_players_room_position
  ON players (room_id, position)
  WHERE position IS NOT NULL;

-- session_id 検索の高速化
CREATE INDEX idx_players_room_session
  ON players (room_id, session_id);

-- 4. answers（回答）
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

-- 5. used_quizzes（出題済みクイズ）
CREATE TABLE used_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, quiz_id)
);

-- Realtime を有効化
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;

-- RLS 設定
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read quizzes" ON quizzes FOR SELECT USING (true);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON rooms FOR UPDATE USING (true);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read players" ON players FOR SELECT USING (true);
CREATE POLICY "Anyone can join room" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON players FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete players" ON players FOR DELETE USING (true);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Anyone can submit answers" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update answers" ON answers FOR UPDATE USING (true);

ALTER TABLE used_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read used_quizzes" ON used_quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert used_quizzes" ON used_quizzes FOR INSERT WITH CHECK (true);
