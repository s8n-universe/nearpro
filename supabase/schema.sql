-- Enable trigram extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create professionals table
CREATE TABLE IF NOT EXISTS professionals (
    -- Identity
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    harvest_id      TEXT UNIQUE NOT NULL,     -- Original ID from harvest.db
    dedup_hash      TEXT UNIQUE NOT NULL,     -- For upsert conflict resolution
    
    -- Core Business Info
    name            TEXT NOT NULL,
    category        TEXT,                     -- Raw Google Maps category
    parent_category TEXT,                     -- Computed: "Healthcare", "Beauty", etc.
    address         TEXT,
    area            TEXT,                     -- Computed: "Bandra", "Andheri", etc.
    phone           TEXT,
    website         TEXT,
    email           TEXT,
    
    -- Quality Signals
    rating          REAL,
    review_count    INTEGER,
    completeness_score INTEGER DEFAULT 0,    -- 0-5 computed score
    
    -- Temporal
    hours           JSONB DEFAULT '{}'::jsonb, -- {"Mon": "9am-6pm", ...}
    
    -- Geospatial
    latitude        REAL,
    longitude       REAL,
    
    -- Source & Metadata
    source          TEXT NOT NULL DEFAULT 'google_maps',
    source_url      TEXT,
    scraped_at      TIMESTAMPTZ NOT NULL,
    synced_at       TIMESTAMPTZ DEFAULT NOW(),
    
    -- Raw payload (for future enrichment)
    raw_data        JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT unique_dedup UNIQUE (dedup_hash)
);

-- Performance indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_prof_category ON professionals(parent_category);
CREATE INDEX IF NOT EXISTS idx_prof_area ON professionals(area);
CREATE INDEX IF NOT EXISTS idx_prof_rating ON professionals(rating DESC);
CREATE INDEX IF NOT EXISTS idx_prof_scraped ON professionals(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_prof_completeness ON professionals(completeness_score DESC);
CREATE INDEX IF NOT EXISTS idx_prof_phone ON professionals(phone);
CREATE INDEX IF NOT EXISTS idx_prof_name_trgm ON professionals USING gin(name gin_trgm_ops);

-- Enable Row Level Security (RLS)
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access (anyone can browse the directory)
CREATE POLICY "Public read access" ON professionals
    FOR SELECT
    USING (true);

-- Policy: Service role write access (sync script uses service role key)
CREATE POLICY "Service role write access" ON professionals
    FOR ALL
    USING (auth.role() = 'service_role');
