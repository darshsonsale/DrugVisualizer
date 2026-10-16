-- Up
-- Drug Path Visualiser: Migration 0007
-- Support password authentication for regular users and dedicated administrator login

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE users
ALTER COLUMN google_id DROP NOT NULL;

-- Down
ALTER TABLE users
DROP COLUMN IF EXISTS password_hash;

ALTER TABLE users
ALTER COLUMN google_id SET NOT NULL;
