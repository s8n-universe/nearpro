# NearPro — Executable Build Roadmap

## Reference Architecture
[nearpro_v2_supabase_architecture.md](file:///d:/scrapeit/Documentation/Architecture/nearpro_v2_supabase_architecture.md)

---

## Data Pipeline Summary

```
Harvest Scraper (local) → harvest.db (DuckDB) → Sync Script → Supabase PostgreSQL → Vercel Frontend
```

---

## Known Vulnerabilities & Mitigations

These are real risks identified from the current system state and architecture. Each one has a mitigation built into the corresponding phase.

### V1: DuckDB Lock During Sync
**Risk**: The Harvest scraper holds a write lock on `harvest.db`. DuckDB does not support concurrent write connections. If the sync script tries to open a `read_only=True` connection while the scraper is actively writing, it will fail with `IOException: File is already open`.

**Mitigation**: 
- The sync script must retry with exponential backoff (wait 5s, 10s, 20s)
- Or: schedule sync to run during known scraper idle windows (between poll intervals)
- Or: sync from the Google Sheets `Scraped_Leads` tab instead of DuckDB as a fallback
- Document this clearly in the sync script with error handling

**Phase**: 1

---

### V2: Supabase Free Tier Pause
**Risk**: Supabase pauses free-tier projects after 7 days of inactivity. If no API requests hit the database for a week, the project goes to sleep. Next visitor sees a cold-start delay (~30-60 seconds) or connection error.

**Mitigation**:
- Set up a cron ping (free service like UptimeRobot or a GitHub Action that runs daily) to keep the project active
- The sync script running periodically also counts as activity
- Graceful frontend handling: show a "Loading data..." spinner, retry on timeout

**Phase**: 5 (Deploy)

---

### V3: ANON Key Exposure
**Risk**: The Supabase `ANON_KEY` is embedded in the frontend JavaScript (via `VITE_SUPABASE_ANON_KEY`). Anyone can inspect it. If RLS is not properly configured, a malicious user could read, modify, or delete data directly via the Supabase REST API.

**Mitigation**:
- RLS is mandatory. `SELECT` only for anon role. All writes require `service_role`.
- The `ANON_KEY` is designed to be public — this is by Supabase's design
- Never use `SERVICE_KEY` in frontend code — it stays in the `.env` of the sync script only
- Test RLS: attempt an `INSERT` from the frontend → must fail

**Phase**: 0

---

### V4: Category Mapping Gaps
**Risk**: Google Maps returns raw categories like "Real estate developer", "Dental clinic", "Hair Salon". The `category_mapping.py` file maps these to 11 parent groups using keyword matching. New/unexpected categories will fall to "Other", creating a large uncategorized bucket.

**Mitigation**:
- Log unmapped categories during sync with a count
- Run a monthly review: `SELECT category, COUNT(*) FROM professionals WHERE parent_category = 'Other' GROUP BY category ORDER BY COUNT(*) DESC`
- Update `category_mapping.py` with new keywords as they appear
- Start with exhaustive keyword lists (spec §5 already has ~200 keywords)

**Phase**: 1

---

### V5: Address Parsing Accuracy
**Risk**: `geo_utils.extract_area()` uses string matching against known Mumbai area names. Addresses like "Shop 14, Linking Road, Near McDonalds, Mumbai 400050" may not match any area if the area name isn't explicitly present. Some addresses may match wrong areas (e.g., "Bandra Reclamation" matching "Bandra" but meaning a specific micro-location).

**Mitigation**:
- Sort area list by length descending (longer = more specific match first)
- Normalize compound names ("Bandra West" → "Bandra")
- Fallback to "Mumbai" if no match — not a blank/null
- Add pin code → area mapping as a secondary fallback
- Track "Mumbai" fallback rate: if >30% of leads fall to generic "Mumbai", expand the area list

**Phase**: 1

---

### V6: Hours Parsing for "Open Now"
**Risk**: The `hours` field in DuckDB is stored as JSON with inconsistent formats. Some entries may have: `"Mon": "9 AM – 6 PM"`, others `"Monday": "9:00-18:00"`, others `"Mon": "Open 24 hours"`, others `"Mon": "Closed"`. The "Open Now" feature depends on reliably parsing these strings.

**Mitigation**:
- Support multiple time formats: `"9 am–6 pm"`, `"9:00 AM - 6:00 PM"`, `"9:00-18:00"`
- Handle special cases: "Open 24 hours" → always open, "Closed" → never open
- Handle Unicode dashes: `–` (en-dash), `—` (em-dash), `-` (hyphen)
- Handle narrow no-break space (`\u202f`) between number and AM/PM
- Return `(None, raw_string)` for unparseable formats → card shows hours text but no Open/Closed badge
- Compute "Open Now" in the frontend JS (client-side time), not during sync

**Phase**: 2 (frontend logic)

---

### V7: Supabase Upsert Batch Size
**Risk**: The Supabase Python client and REST API have practical limits on batch size. Trying to upsert 5,000+ rows in a single API call may timeout or exceed payload size limits.

**Mitigation**:
- Batch upserts in chunks of 500 rows
- Add progress logging: "Syncing batch 3/10 (1500/5000 leads)"
- Handle partial failures: if batch 5 fails, retry it without re-syncing batches 1-4
- Track synced count and compare against source count

**Phase**: 1

---

### V8: Supabase PostgREST Query Limits
**Risk**: Supabase's PostgREST has a default row limit of 1000. Complex queries with multiple filters may be slow on free-tier shared compute (500MB RAM).

**Mitigation**:
- Always use `.range(0, 23)` — never fetch unbounded result sets
- Use `count: 'estimated'` for large tables to avoid sequential scan
- Create proper indexes (already in schema.sql)
- For insights/aggregates, use RPC functions (pre-computed in PostgreSQL, fast)
- Cache category counts on the frontend (they don't change frequently)

**Phase**: 0, 2

---

### V9: No Data State (First Deploy)
**Risk**: When NearPro is first deployed, Supabase may have zero data (sync hasn't run yet). The frontend must not crash or show empty broken UI.

**Mitigation**:
- Every component must handle empty arrays/null responses gracefully
- Show designed empty states: "No professionals found. Data is being prepared."
- Stats page: show "0" with a message, not errors
- Map view: center on Mumbai with a "Zoom in as data arrives" message

**Phase**: 2

---

### V10: Scraper Data Quality
**Risk**: Some scraped leads have missing/empty names, null ratings, no phone, no address. The Harvest scraper's deduplication is fuzzy — some duplicate businesses with slightly different names may exist.

**Mitigation**:
- Sync script filters: skip leads where `name` is NULL or empty
- Completeness score (0-5) visually communicates data quality to users
- Frontend sorts by completeness + rating by default (best data first)
- Dedup hash in Supabase prevents duplicate syncs, but doesn't catch "Dr Sharma Clinic" vs "Dr. Sharma's Dental Clinic" — accept this for v1

**Phase**: 1

---

## Phase 0: Supabase Setup
**Goal**: Empty database ready to receive data, with security locked down.

| Step | Action | Output | Verify |
|---|---|---|---|
| 0.1 | Create Supabase project (free tier) | Project URL + keys | Dashboard accessible |
| 0.2 | Run `schema.sql` in SQL Editor | `professionals` table created | Table visible in Table Editor |
| 0.3 | Run `rpc_functions.sql` in SQL Editor | 3 RPC functions created | Functions visible in Database → Functions |
| 0.4 | Enable `pg_trgm` extension | Fuzzy search ready | `SELECT * FROM pg_extension WHERE extname = 'pg_trgm'` returns 1 row |
| 0.5 | Verify RLS policies | Public SELECT, no public INSERT | Test INSERT from JS console → fails |
| 0.6 | Save keys to `.env` | `SUPABASE_URL`, `ANON_KEY`, `SERVICE_KEY` | Keys match dashboard |

**Addresses vulnerabilities**: V3 (RLS), V8 (indexes)

**Files created**:
- `nearpro/supabase/schema.sql`
- `nearpro/supabase/rpc_functions.sql`
- `nearpro/.env.example`

**Gate**: Table exists, RLS active, RPC functions return empty results (no errors).

---

## Phase 1: Sync Script
**Goal**: Real data flows from local harvest.db into Supabase.

| Step | Action | Output | Verify |
|---|---|---|---|
| 1.1 | Create `sync/category_mapping.py` | 11 parent groups, ~200 keywords | Unit tests pass |
| 1.2 | Create `sync/geo_utils.py` | 60+ Mumbai areas | Unit tests pass |
| 1.3 | Create `sync/sync_to_supabase.py` | Main sync logic | — |
| 1.4 | Handle DuckDB lock (V1) | Retry with backoff | Test while scraper runs |
| 1.5 | Batch upserts (V7) | 500 rows per batch | No timeouts |
| 1.6 | Incremental sync | `.sync_state` file | Second run syncs only new leads |
| 1.7 | Category fallback logging (V4) | Log unmapped categories | Check "Other" count is <20% |
| 1.8 | Area fallback tracking (V5) | Log "Mumbai" fallbacks | Check fallback rate <30% |
| 1.9 | Data quality filter (V10) | Skip empty names | No null-name rows in Supabase |
| 1.10 | Create `pyproject.toml` + `start_sync.py` | One-command launcher | `python start_sync.py` works |
| 1.11 | Create test suite | `test_categories.py`, `test_geo.py`, `test_sync.py` | All pass |
| 1.12 | Run sync against real data | Data in Supabase | Dashboard shows rows |

**Addresses vulnerabilities**: V1 (lock), V4 (categories), V5 (areas), V7 (batch size), V10 (data quality)

**Files created**:
- `nearpro/sync/category_mapping.py`
- `nearpro/sync/geo_utils.py`
- `nearpro/sync/sync_to_supabase.py`
- `nearpro/start_sync.py`
- `nearpro/pyproject.toml`
- `nearpro/.env`
- `nearpro/tests/test_categories.py`
- `nearpro/tests/test_geo.py`
- `nearpro/tests/test_sync.py`

**Gate**: Supabase dashboard shows real professionals from harvest.db. `get_stats()` RPC returns real numbers. `get_category_groups()` returns grouped categories.

---

## Phase 2: Core Frontend (Marketing + Directory)
**Goal**: Deployed static site with landing page and browsable directory.

| Step | Action | Output | Verify |
|---|---|---|---|
| 2.1 | Scaffold Vite project | `index.html`, `vite.config.js`, `package.json` | `npm run dev` starts |
| 2.2 | Supabase client init | `js/supabase.js` with ANON key | Query returns data in console |
| 2.3 | CSS design system (S8N brand) | `style.css` — dark theme, gold-pink gradient, glass cards | Visual match with s8n.in |
| 2.4 | Layout CSS | `layout.css` — sidebar + grid, responsive | 3→2→1 column at breakpoints |
| 2.5 | Component CSS | `components.css` — cards, modals, badges, buttons | — |
| 2.6 | Marketing landing page | `MarketingHero.js`, `FeatureShowcase.js` | Hero renders, CTA buttons work |
| 2.7 | Marketing CSS | `marketing.css` — hero, features, testimonials | — |
| 2.8 | State management | `state.js` — global state + pub/sub | Filters update triggers re-render |
| 2.9 | Hash router | `router.js` — `#/`, `#/category/x`, `#/map`, `#/insights` | URL changes render correct view |
| 2.10 | Category sidebar | `CategorySidebar.js` — collapsible groups from Supabase | Groups render with counts |
| 2.11 | Professional cards | `ProfessionalCard.js` — completeness dots, rating stars, open badge | Cards render from Supabase data |
| 2.12 | Header + nav | `Header.js` — sticky nav, search bar, view toggle | — |
| 2.13 | Wire app.js | Main entry connects all components | Full flow works |
| 2.14 | Empty state handling (V9) | Designed empty states | Remove all data → graceful UI |
| 2.15 | Open Now logic (V6) | Client-side time parsing | Shows correct open/closed per IST |
| 2.16 | Pagination | "Load More" button, `.range()` queries | 24 cards per page, loads more |

**Addresses vulnerabilities**: V6 (hours parsing), V9 (empty state)

**Files created**:
- `nearpro/frontend/index.html`
- `nearpro/frontend/vite.config.js`
- `nearpro/frontend/package.json`
- `nearpro/frontend/css/style.css`
- `nearpro/frontend/css/layout.css`
- `nearpro/frontend/css/components.css`
- `nearpro/frontend/css/marketing.css`
- `nearpro/frontend/js/supabase.js`
- `nearpro/frontend/js/state.js`
- `nearpro/frontend/js/router.js`
- `nearpro/frontend/js/app.js`
- `nearpro/frontend/js/components/MarketingHero.js`
- `nearpro/frontend/js/components/FeatureShowcase.js`
- `nearpro/frontend/js/components/Header.js`
- `nearpro/frontend/js/components/CategorySidebar.js`
- `nearpro/frontend/js/components/ProfessionalCard.js`

**Gate**: Landing page renders with S8N dark theme → click "Browse Professionals" → category sidebar loads from Supabase → cards render with real data → pagination works → mobile responsive.

---

## Phase 3: Detail Modal + Map View
**Goal**: Full professional detail view and interactive map.

| Step | Action | Output | Verify |
|---|---|---|---|
| 3.1 | Professional detail modal | `ProfessionalModal.js` — hours table, all fields | Click card → modal opens with full data |
| 3.2 | Three CTAs | Call Now (`tel:`), Visit Website, Connect on MappCall | All links work |
| 3.3 | Mini-map in modal | Leaflet map pin showing exact location | Pin at correct lat/lng |
| 3.4 | Full map view | `MapView.js` — Leaflet + MarkerCluster | All professionals shown as pins |
| 3.5 | Category-colored pins | Different colors per parent category | Visual distinction on map |
| 3.6 | Pin popup → detail | Click pin → popup with name/rating → "Details" link | Opens modal from pin |
| 3.7 | Map CSS | `map.css` — Leaflet overrides, cluster styles | Styled pins and popups |
| 3.8 | View toggle | Grid/Map toggle in Header | Switches between views |

**Files created**:
- `nearpro/frontend/js/components/ProfessionalModal.js`
- `nearpro/frontend/js/components/MapView.js`
- `nearpro/frontend/css/map.css`

**Gate**: Click card → modal with hours table + mini-map + CTAs. Toggle to map → pins with clusters → click pin → popup → full details.

---

## Phase 4: Differentiator Features
**Goal**: The 8 features that make NearPro different from MappCall's directory.

| Step | Feature | Component | Verify |
|---|---|---|---|
| 4.1 | Search (standard) | `SearchBar.js` — debounced text filter via Supabase `.ilike()` | Type "sharma" → matching cards |
| 4.2 | Search (AI mode) | Sparkle icon, natural language → structured filters | "dentists in Bandra with 4+ stars" → correct results |
| 4.3 | Filter panel | `FilterPanel.js` — rating, open now, area dropdown, sort | Filter by 4+ stars → only 4+ cards |
| 4.4 | Compare | `CompareModal.js` — checkbox on cards, side-by-side | Select 2-3 → compare → aligned fields |
| 4.5 | Insights page | `InsightsPage.js` — Chart.js donut/bar, Leaflet choropleth | Charts render with real data |
| 4.6 | QR code | `QRCodeModal.js` — client-side qrcode.js | Scan QR → opens Google Maps URL |
| 4.7 | Export | `ExportButton.js` — multi-select, download CSV or webhook | CSV downloads with selected leads |
| 4.8 | Recently Added | Section showing last 7 days scraped | Cards sorted by scraped_at DESC |

**Files created**:
- `nearpro/frontend/js/components/SearchBar.js`
- `nearpro/frontend/js/components/FilterPanel.js`
- `nearpro/frontend/js/components/CompareModal.js`
- `nearpro/frontend/js/components/InsightsPage.js`
- `nearpro/frontend/js/components/QRCodeModal.js`
- `nearpro/frontend/js/components/ExportButton.js`

**Gate**: All 8 features functional. Search returns correct results. Filters stack correctly. Compare modal shows aligned data. Charts render. QR codes scan correctly.

---

## Phase 5: Polish + Deploy
**Goal**: Production-ready, deployed, live on the internet.

| Step | Action | Output | Verify |
|---|---|---|---|
| 5.1 | Dark mode (default, S8N brand) | CSS custom properties | Dark by default, toggle available |
| 5.2 | Loading skeletons | CSS shimmer animations | Skeleton cards while loading |
| 5.3 | Error states | API down, no results, timeout | Friendly error messages |
| 5.4 | Mobile responsive | Sidebar drawer at <860px | Works on phone viewport |
| 5.5 | `npm run build` | Vite outputs `frontend/dist/` | Build succeeds, no errors |
| 5.6 | Push to GitHub | Repository with nearpro/ | Repo exists |
| 5.7 | Connect Vercel | Import project, auto-detect Vite | Preview deploy works |
| 5.8 | Set env vars on Vercel | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Build uses correct keys |
| 5.9 | Custom domain | nearpro.in (if purchased) | Domain resolves |
| 5.10 | Keep-alive ping (V2) | UptimeRobot or GitHub Action cron | Supabase doesn't pause |
| 5.11 | Final verification | Full user flow on live URL | Everything works end-to-end |

**Addresses vulnerabilities**: V2 (Supabase pause)

**Gate**: Public URL serves the full NearPro app with live Supabase data. Landing page → Browse → cards → detail modal → map → search → filters → compare → insights → QR → export. All functional.

---

## Execution Timeline (Estimated)

| Phase | Duration | Dependency |
|---|---|---|
| **Phase 0**: Supabase Setup | ~30 min (manual in dashboard) | Supabase account |
| **Phase 1**: Sync Script | ~3-4 hours | Phase 0 complete + scraper idle window |
| **Phase 2**: Core Frontend | ~8-10 hours | Phase 1 complete (data in Supabase) |
| **Phase 3**: Detail + Map | ~4-5 hours | Phase 2 complete |
| **Phase 4**: Differentiators | ~6-8 hours | Phase 3 complete |
| **Phase 5**: Polish + Deploy | ~3-4 hours | Phase 4 complete + GitHub repo |
| **Total** | **~25-31 hours** | — |

---

## Vulnerability → Phase Mapping

| Vulnerability | Phase Addressed | Mitigation |
|---|---|---|
| V1: DuckDB Lock | Phase 1 | Retry with backoff, schedule during idle |
| V2: Supabase Pause | Phase 5 | Keep-alive cron ping |
| V3: ANON Key Exposure | Phase 0 | RLS policies, no SERVICE_KEY in frontend |
| V4: Category Gaps | Phase 1 | Exhaustive keywords + log unmapped |
| V5: Address Parsing | Phase 1 | Longest-match-first + pin code fallback |
| V6: Hours Parsing | Phase 2 | Multi-format parser, graceful fallback |
| V7: Batch Size | Phase 1 | 500-row chunks with progress logging |
| V8: Query Limits | Phase 0, 2 | Indexes + `.range()` + `count: 'estimated'` |
| V9: No Data State | Phase 2 | Designed empty states |
| V10: Data Quality | Phase 1 | Filter nulls, completeness score |

---

*End of Executable Roadmap — NearPro v2*
*Every vulnerability identified. Every mitigation assigned to a phase. Every step verifiable.*
