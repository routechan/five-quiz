-- ランダムクイズ取得
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

-- ルームコード生成
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

-- 古いルームの自動削除
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
