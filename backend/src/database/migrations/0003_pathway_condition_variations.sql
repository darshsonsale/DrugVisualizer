-- Up

-- 1. PATHWAY_VARIATIONS TABLE (Condition-level pathway metadata)
CREATE TABLE IF NOT EXISTS pathway_variations (
    id VARCHAR(64) PRIMARY KEY,
    pathway_id VARCHAR(64) NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
    condition VARCHAR(32) NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pathway_variations_condition CHECK (condition IN ('BEFORE_FOOD', 'AFTER_FOOD')),
    CONSTRAINT uq_pathway_variations_pathway_condition UNIQUE (pathway_id, condition)
);

CREATE TRIGGER trg_pathway_variations_updated_at
BEFORE UPDATE ON pathway_variations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 2. NODE_VARIATIONS TABLE (Node-level condition transit modifiers & observations)
CREATE TABLE IF NOT EXISTS node_variations (
    id VARCHAR(64) PRIMARY KEY,
    node_id VARCHAR(64) NOT NULL REFERENCES pathway_nodes(id) ON DELETE CASCADE,
    condition VARCHAR(32) NOT NULL,
    transit_time_modifier_pct NUMERIC(6, 2) NOT NULL DEFAULT 0,
    absorption_modifier_pct NUMERIC(6, 2) NOT NULL DEFAULT 0,
    clinical_observation TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_node_variations_condition CHECK (condition IN ('BEFORE_FOOD', 'AFTER_FOOD')),
    CONSTRAINT uq_node_variations_node_condition UNIQUE (node_id, condition),
    CONSTRAINT chk_transit_modifier_range CHECK (transit_time_modifier_pct >= -100)
);

CREATE TRIGGER trg_node_variations_updated_at
BEFORE UPDATE ON node_variations
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Down

DROP TRIGGER IF EXISTS trg_node_variations_updated_at ON node_variations;
DROP TABLE IF EXISTS node_variations;

DROP TRIGGER IF EXISTS trg_pathway_variations_updated_at ON pathway_variations;
DROP TABLE IF EXISTS pathway_variations;
