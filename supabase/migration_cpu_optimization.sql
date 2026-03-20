-- CPU負荷軽減マイグレーション
-- Supabase SQL Editor で実行してください
-- =============================================

-- 1. rooms.room_code のインデックス追加
--    全APIリクエストが room_code で検索するためフルスキャンを防ぐ
--    （UNIQUE制約はあるが明示的インデックスで確実にする）
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms (room_code);

-- 2. used_quizzes のインデックス追加
--    get_random_quiz の LEFT JOIN を高速化
CREATE INDEX IF NOT EXISTS idx_used_quizzes_room_quiz ON used_quizzes (room_id, quiz_id);

-- 3. rooms.created_at のインデックス追加
--    cleanup_old_rooms のフルスキャンを防ぐ
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms (created_at);

-- 4. rooms.status のインデックス追加
--    cleanup で status = 'finished' のフィルタを高速化
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms (status);

-- 5. Realtime 公開を rooms テーブルのみに絞る
--    players/answers はコード側で監視していないため無駄な負荷
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'players'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE players;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'answers'
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE answers;
  END IF;
END;
$$;

-- 6. get_random_quiz を NOT EXISTS パターンに書き換え（LEFT JOIN より効率的）
CREATE OR REPLACE FUNCTION get_random_quiz(p_room_id UUID)
RETURNS TABLE (id UUID, question TEXT, answer VARCHAR(5))
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question, q.answer
  FROM quizzes q
  WHERE NOT EXISTS (
    SELECT 1 FROM used_quizzes uq
    WHERE uq.quiz_id = q.id AND uq.room_id = p_room_id
  )
  ORDER BY random()
  LIMIT 1;
END;
$$;

-- 7. cleanup_old_rooms を最適化（インデックスを活用 + 1クエリに統合）
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM rooms
  WHERE (created_at < now() - interval '1 hour' AND status = 'finished')
     OR (created_at < now() - interval '3 hours');
END;
$$;
