-- BOTフラグカラムを追加
ALTER TABLE players ADD COLUMN is_bot BOOLEAN NOT NULL DEFAULT false;
