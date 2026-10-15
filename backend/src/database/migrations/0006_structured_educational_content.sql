-- Up
-- Drug Path Visualiser: Migration 0006
-- Structured Educational Content, Plain-Language Explanations & Review Traceability

ALTER TABLE node_content
ADD COLUMN IF NOT EXISTS key_takeaway TEXT,
ADD COLUMN IF NOT EXISTS defined_terms JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS references_list TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS review_status VARCHAR(64) DEFAULT 'FLAGGED_FOR_SCIENTIFIC_REVIEW';

-- Down
ALTER TABLE node_content
DROP COLUMN IF EXISTS review_status,
DROP COLUMN IF EXISTS references_list,
DROP COLUMN IF EXISTS defined_terms,
DROP COLUMN IF EXISTS key_takeaway;
