"""
NearPro v6 Waterfall Enrichment Database Migration Runner
Executes the waterfall enrichment migration against the live Supabase PostgreSQL database.
"""
import psycopg2
import sys
from pathlib import Path

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def get_connection():
    return psycopg2.connect(**DB_CONFIG)

def run_migration():
    sql_path = Path(__file__).parent / "v6_waterfall_enrichment.sql"
    if not sql_path.exists():
        print(f"ERROR: Migration file not found: {sql_path}")
        sys.exit(1)

    sql_content = sql_path.read_text(encoding="utf-8")
    
    conn = get_connection()
    conn.autocommit = False  # Use transaction
    cur = conn.cursor()

    print("=" * 70)
    print("NEARPRO WATERFALL ENRICHMENT DATABASE MIGRATION")
    print("=" * 70)

    print("\n--- Executing migration SQL ---")
    try:
        cur.execute(sql_content)
        conn.commit()
        print("SQL executed and committed successfully!")
    except Exception as e:
        print(f"\nERROR during migration: {e}")
        conn.rollback()
        print("ROLLED BACK. No changes applied.")
        conn.close()
        sys.exit(1)

    # Verification
    print("\n--- Verifying results ---")
    try:
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('enrichment_providers', 'user_enrichment_keys', 'enrichment_jobs', 'enrichment_results', 'enrichment_credit_ledger');
        """)
        tables = cur.fetchall()
        print(f"Created tables in database: {[t[0] for t in tables]}")
    except Exception as e:
        print(f"Verification query failed: {e}")

    conn.close()
    print("\nMigration completed successfully!")

if __name__ == "__main__":
    run_migration()
