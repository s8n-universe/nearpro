import os
import sys
import json
import time
import duckdb
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client, Client

# Add parent directory to path so we can import sibling files easily
sys.path.append(str(Path(__file__).parent))
import category_mapping
import geo_utils

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL = os.getenv("NEARPRO_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEARPRO_SUPABASE_SERVICE_KEY")
DB_PATH_ENV = os.getenv("NEARPRO_DB_PATH", "../../.harvest/harvest.db")

# Path to the actual harvest.db relative to this script
DB_PATH = Path(__file__).parent / DB_PATH_ENV

# Sync state file to keep track of the last synced timestamp
STATE_FILE = Path(__file__).parent / ".sync_state"

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("NEARPRO_SUPABASE_URL or NEARPRO_SUPABASE_SERVICE_KEY not set in .env")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_last_sync_time() -> datetime:
    """Reads the last sync timestamp from local state file."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE, "r") as f:
                data = json.load(f)
                ts = data.get("last_sync_time")
                if ts:
                    return datetime.fromisoformat(ts)
        except Exception as e:
            print(f"Warning: Could not parse .sync_state file: {e}")
    # Return epoch if no sync state exists
    return datetime(1970, 1, 1, tzinfo=timezone.utc)

def save_last_sync_time(dt: datetime):
    """Saves the last sync timestamp to local state file."""
    try:
        with open(STATE_FILE, "w") as f:
            json.dump({"last_sync_time": dt.isoformat()}, f)
    except Exception as e:
        print(f"Error: Could not save .sync_state: {e}")

def get_duckdb_connection(db_path: Path, max_retries: int = 5, initial_delay: float = 2.0) -> duckdb.DuckDBPyConnection:
    """
    Connects to DuckDB in read-only mode with exponential backoff retries
    to mitigate database locking if the scraper is running simultaneously.
    """
    delay = initial_delay
    for attempt in range(max_retries):
        try:
            conn = duckdb.connect(str(db_path), read_only=True)
            return conn
        except duckdb.IOException as io_err:
            if "File is already open" in str(io_err) or "lock" in str(io_err).lower():
                print(f"DuckDB lock detected (attempt {attempt + 1}/{max_retries}). Scraper might be running. Retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2
            else:
                raise
        except Exception as e:
            raise
    
    raise TimeoutError(f"Could not connect to DuckDB at {db_path} after {max_retries} attempts due to write locks.")

def compute_completeness_score(lead: dict) -> int:
    """Computes a score from 0-5 based on presence of key fields."""
    score = 0
    if lead.get("phone"):
        score += 1
    if lead.get("website"):
        score += 1
    if lead.get("email"):
        score += 1
    
    # Check if hours data exists and is populated
    hours = lead.get("hours")
    if hours:
        if isinstance(hours, dict) and len(hours) > 0:
            score += 1
        elif isinstance(hours, str):
            try:
                h_dict = json.loads(hours)
                if h_dict and len(h_dict) > 0:
                    score += 1
            except json.JSONDecodeError:
                if hours.strip() and hours.strip() != "{}":
                    score += 1
                    
    if lead.get("latitude") is not None and lead.get("longitude") is not None:
        score += 1
        
    return score

def parse_db_hours(hours_raw) -> dict:
    """Safely converts DuckDB hours (string or JSON) to a Python dict."""
    if not hours_raw:
        return {}
    if isinstance(hours_raw, dict):
        return hours_raw
    if isinstance(hours_raw, str):
        try:
            return json.loads(hours_raw)
        except json.JSONDecodeError:
            # If it's a raw unparsed string, return a structured format or raw text
            return {"raw": hours_raw}
    return {}

def parse_db_raw_data(raw_data_raw) -> dict:
    """Safely converts raw_data payload to a Python dict."""
    if not raw_data_raw:
        return {}
    if isinstance(raw_data_raw, dict):
        return raw_data_raw
    if isinstance(raw_data_raw, str):
        try:
            return json.loads(raw_data_raw)
        except json.JSONDecodeError:
            return {}
    return {}

def sync():
    start_time = datetime.now(timezone.utc)
    print(f"[{start_time.isoformat()}] Starting NearPro sync to Supabase...")
    
    if not DB_PATH.exists():
        print(f"Error: DuckDB file not found at {DB_PATH.absolute()}. Run the Harvest scraper first.")
        sys.exit(1)
        
    # Get last sync timestamp
    last_sync = get_last_sync_time()
    print(f"Syncing records scraped since: {last_sync.isoformat()}")

    # 1. Connect to local DuckDB (read-only with retry)
    try:
        conn = get_duckdb_connection(DB_PATH)
    except Exception as e:
        print(f"Error connecting to DuckDB: {e}")
        sys.exit(1)

    # 2. Query new leads
    try:
        # We query the SQLite-compatible table 'leads'
        # Fetching scraped_at as timestamp
        query = """
            SELECT id, job_id, name, category, address, phone, website, email,
                   rating, review_count, hours, latitude, longitude,
                   source, source_url, scraped_at, raw_data, dedup_hash
            FROM leads
            WHERE scraped_at > ?
            ORDER BY scraped_at ASC
        """
        # Execute query passing the timestamp
        # Convert datetime to string for DuckDB query parameter
        cursor = conn.execute(query, [last_sync.replace(tzinfo=None)])
        rows = cursor.fetchall()
        
        # Get column names
        cols = [desc[0] for desc in cursor.description]
        
    except Exception as e:
        print(f"Error querying DuckDB: {e}")
        conn.close()
        sys.exit(1)
        
    conn.close()
    
    total_leads = len(rows)
    print(f"Found {total_leads} new leads in DuckDB to sync.")
    
    if total_leads == 0:
        print("Database is already up to date. Sync complete.")
        # Update last sync time anyway to current start time
        save_last_sync_time(start_time)
        return

    # Initialize Supabase client
    try:
        supabase = get_supabase_client()
    except Exception as e:
        print(f"Error initializing Supabase: {e}")
        sys.exit(1)

    # 3. Transform and Prepare Batches
    prepared_leads = []
    unmapped_categories = {}
    mumbai_fallbacks = 0
    max_scraped_at = last_sync

    for r in rows:
        lead = dict(zip(cols, r))
        
        # Data Quality check: Skip empty name records
        if not lead.get("name") or not lead.get("name").strip():
            continue
            
        # Parse fields
        hours_dict = parse_db_hours(lead.get("hours"))
        raw_data_dict = parse_db_raw_data(lead.get("raw_data"))
        
        # Category Mapping
        raw_cat = lead.get("category") or ""
        parent_cat = category_mapping.get_parent_category(raw_cat)
        if parent_cat == "Other" and raw_cat:
            unmapped_categories[raw_cat] = unmapped_categories.get(raw_cat, 0) + 1
            
        # Geo utility parsing
        raw_address = lead.get("address")
        area = geo_utils.extract_area(raw_address)
        if area == "Mumbai":
            mumbai_fallbacks += 1

        # Track the latest scraped_at timestamp
        scraped_dt = lead.get("scraped_at")
        # Ensure it has timezone info
        if scraped_dt.tzinfo is None:
            scraped_dt = scraped_dt.replace(tzinfo=timezone.utc)
        if scraped_dt > max_scraped_at:
            max_scraped_at = scraped_dt

        # Format record for Supabase
        prepared_lead = {
            "harvest_id": lead.get("id"),
            "dedup_hash": lead.get("dedup_hash") or lead.get("id"), # fallback to ID if no dedup_hash
            "name": lead.get("name").strip(),
            "category": raw_cat,
            "parent_category": parent_cat,
            "address": raw_address,
            "area": area,
            "phone": lead.get("phone"),
            "website": lead.get("website"),
            "email": lead.get("email"),
            "rating": lead.get("rating"),
            "review_count": lead.get("review_count"),
            "hours": hours_dict,
            "latitude": lead.get("latitude"),
            "longitude": lead.get("longitude"),
            "source": lead.get("source") or "google_maps",
            "source_url": lead.get("source_url"),
            "scraped_at": scraped_dt.isoformat(),
            "raw_data": raw_data_dict
        }
        
        # Compute completeness score
        prepared_lead["completeness_score"] = compute_completeness_score(prepared_lead)
        
        prepared_leads.append(prepared_lead)

    # 4. Batch Upload to Supabase (500 rows per batch)
    batch_size = 500
    synced_count = 0
    errors_count = 0
    
    print(f"Uploading prepared leads in batches of {batch_size}...")
    for i in range(0, len(prepared_leads), batch_size):
        batch = prepared_leads[i:i + batch_size]
        try:
            # Perform upsert using dedup_hash as conflict resolution
            # PostgREST uses the ON CONFLICT clause automatically based on the primary key or unique index
            res = supabase.table("professionals").upsert(
                batch,
                on_conflict="dedup_hash"
            ).execute()
            
            synced_count += len(batch)
            print(f"Successfully synced batch {i // batch_size + 1} ({synced_count}/{len(prepared_leads)} leads).")
        except Exception as e:
            print(f"Error syncing batch {i // batch_size + 1}: {e}")
            errors_count += len(batch)

    # Logging and metrics
    print("\n=== SYNC SUMMARY ===")
    print(f"Total processed from DuckDB: {len(rows)}")
    print(f"Successfully upserted: {synced_count}")
    print(f"Failed to upsert: {errors_count}")
    print(f"Mumbai address fallbacks: {mumbai_fallbacks} ({int(mumbai_fallbacks / len(prepared_leads) * 100) if prepared_leads else 0}%)")
    
    if unmapped_categories:
        print("\nTop unmapped raw categories (mapped to 'Other'):")
        sorted_unmapped = sorted(unmapped_categories.items(), key=lambda x: x[1], reverse=True)[:5]
        for cat, cnt in sorted_unmapped:
            print(f"  - '{cat}': {cnt} times")

    # Update sync state to max scraped_at timestamp processed
    if synced_count > 0:
        save_last_sync_time(max_scraped_at)
        print(f"\nNext sync starting point timestamp updated to: {max_scraped_at.isoformat()}")
    else:
        save_last_sync_time(start_time)
        
    print("Sync process completed.")

if __name__ == "__main__":
    sync()
