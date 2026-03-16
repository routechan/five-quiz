-- 観戦者カラムを追加
ALTER TABLE players ADD COLUMN is_spectator BOOLEAN NOT NULL DEFAULT false;
