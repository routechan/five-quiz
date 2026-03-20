-- ランダムクイズ取得（LEFT JOIN で未使用クイズを効率的に取得）
CREATE OR REPLACE FUNCTION get_random_quiz(p_room_id UUID)
RETURNS TABLE (id UUID, question TEXT, answer VARCHAR(5))
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT q.id, q.question, q.answer
  FROM quizzes q
  LEFT JOIN used_quizzes uq ON q.id = uq.quiz_id AND uq.room_id = p_room_id
  WHERE uq.id IS NULL
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

-- プレイヤーの position を一括更新（トランザクション内で安全に実行）
CREATE OR REPLACE FUNCTION update_positions(p_room_id UUID, p_positions JSONB)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  item JSONB;
BEGIN
  -- 一旦全員の position を null に
  UPDATE players SET position = NULL WHERE room_id = p_room_id;

  -- 各プレイヤーの position を更新
  FOR item IN SELECT * FROM jsonb_array_elements(p_positions)
  LOOP
    UPDATE players
    SET position = (item->>'position')::int
    WHERE id = (item->>'player_id')::uuid
      AND room_id = p_room_id;
  END LOOP;
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
