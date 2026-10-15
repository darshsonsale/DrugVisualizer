-- Up

-- Helper trigger function to maintain updated_at automatically
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. DRUGS TABLE
CREATE TABLE IF NOT EXISTS drugs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE,
    brand_name VARCHAR(128),
    category VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    molecular_formula VARCHAR(64),
    half_life_hours NUMERIC(6, 2) CHECK (half_life_hours IS NULL OR half_life_hours >= 0),
    bioavailability_pct NUMERIC(5, 2) CHECK (bioavailability_pct IS NULL OR (bioavailability_pct >= 0 AND bioavailability_pct <= 100)),
    cmax_ug_ml NUMERIC(6, 2) CHECK (cmax_ug_ml IS NULL OR cmax_ug_ml >= 0),
    tmax_hours NUMERIC(6, 2) CHECK (tmax_hours IS NULL OR tmax_hours >= 0),
    form VARCHAR(64),
    dosage VARCHAR(64),
    indication TEXT,
    route VARCHAR(64) NOT NULL DEFAULT 'Oral Route',
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_drugs_updated_at
BEFORE UPDATE ON drugs
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 2. PATHWAYS TABLE
CREATE TABLE IF NOT EXISTS pathways (
    id VARCHAR(64) PRIMARY KEY,
    drug_id VARCHAR(64) NOT NULL REFERENCES drugs(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pathways_drug_name UNIQUE (drug_id, name)
);

CREATE TRIGGER trg_pathways_updated_at
BEFORE UPDATE ON pathways
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 3. PATHWAY_NODES TABLE
CREATE TABLE IF NOT EXISTS pathway_nodes (
    id VARCHAR(64) PRIMARY KEY,
    pathway_id VARCHAR(64) NOT NULL REFERENCES pathways(id) ON DELETE CASCADE,
    node_order INTEGER NOT NULL CHECK (node_order > 0),
    name VARCHAR(128) NOT NULL,
    anatomical_location VARCHAR(128) NOT NULL,
    organ_system VARCHAR(128) NOT NULL,
    estimated_time_minutes NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (estimated_time_minutes >= 0),
    camera_focus_x NUMERIC(8, 3),
    camera_focus_y NUMERIC(8, 3),
    camera_focus_z NUMERIC(8, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pathway_nodes_order UNIQUE (pathway_id, node_order),
    CONSTRAINT uq_pathway_nodes_pathway_id_id UNIQUE (pathway_id, id)
);

CREATE TRIGGER trg_pathway_nodes_updated_at
BEFORE UPDATE ON pathway_nodes
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 4. PATHWAY_EDGES TABLE (With composite foreign keys to guarantee nodes belong to same pathway)
CREATE TABLE IF NOT EXISTS pathway_edges (
    id VARCHAR(64) PRIMARY KEY,
    pathway_id VARCHAR(64) NOT NULL,
    from_node_id VARCHAR(64) NOT NULL,
    to_node_id VARCHAR(64) NOT NULL,
    transition_description TEXT,
    transition_duration_minutes NUMERIC(8, 2) CHECK (transition_duration_minutes IS NULL OR transition_duration_minutes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_pathway_edges_no_self_loops CHECK (from_node_id <> to_node_id),
    CONSTRAINT uq_pathway_edges_unique_directed UNIQUE (pathway_id, from_node_id, to_node_id),
    CONSTRAINT fk_pathway_edges_pathway FOREIGN KEY (pathway_id) REFERENCES pathways(id) ON DELETE CASCADE,
    CONSTRAINT fk_pathway_edges_from_node FOREIGN KEY (pathway_id, from_node_id) REFERENCES pathway_nodes(pathway_id, id) ON DELETE CASCADE,
    CONSTRAINT fk_pathway_edges_to_node FOREIGN KEY (pathway_id, to_node_id) REFERENCES pathway_nodes(pathway_id, id) ON DELETE CASCADE
);

-- Index for querying incoming edges to a node efficiently
CREATE INDEX IF NOT EXISTS idx_pathway_edges_incoming ON pathway_edges(pathway_id, to_node_id);

CREATE TRIGGER trg_pathway_edges_updated_at
BEFORE UPDATE ON pathway_edges
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 5. NODE_CONTENT TABLE (Separated 1:1 from graph topology)
CREATE TABLE IF NOT EXISTS node_content (
    id VARCHAR(64) PRIMARY KEY,
    node_id VARCHAR(64) NOT NULL UNIQUE REFERENCES pathway_nodes(id) ON DELETE CASCADE,
    general_description TEXT NOT NULL,
    physiological_role TEXT NOT NULL,
    key_cellular_mechanisms TEXT[] NOT NULL DEFAULT '{}',
    micro_environment_ph NUMERIC(4, 2) CHECK (micro_environment_ph IS NULL OR (micro_environment_ph >= 0 AND micro_environment_ph <= 14)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_node_content_updated_at
BEFORE UPDATE ON node_content
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Down

DROP TRIGGER IF EXISTS trg_node_content_updated_at ON node_content;
DROP TABLE IF EXISTS node_content;

DROP TRIGGER IF EXISTS trg_pathway_edges_updated_at ON pathway_edges;
DROP TABLE IF EXISTS pathway_edges;

DROP TRIGGER IF EXISTS trg_pathway_nodes_updated_at ON pathway_nodes;
DROP TABLE IF EXISTS pathway_nodes;

DROP TRIGGER IF EXISTS trg_pathways_updated_at ON pathways;
DROP TABLE IF EXISTS pathways;

DROP TRIGGER IF EXISTS trg_drugs_updated_at ON drugs;
DROP TABLE IF EXISTS drugs;

DROP FUNCTION IF EXISTS set_updated_at_timestamp();
