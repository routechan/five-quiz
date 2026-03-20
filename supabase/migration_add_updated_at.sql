-- rooms に updated_at カラム追加
-- players 変更時に rooms を touch して Realtime 通知をトリガーするため
-- Supabase SQL Editor で実行してください

ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
