-- Up
CREATE TABLE IF NOT EXISTS system_metadata (
    key VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_metadata (key, value)
VALUES ('schema_version', '0.0.1')
ON CONFLICT (key) DO NOTHING;

-- Down
DROP TABLE IF EXISTS system_metadata;
