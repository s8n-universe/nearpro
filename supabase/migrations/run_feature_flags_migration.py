"""
NearPro v3 Feature Flags Database Migration Runner
Executes the feature flags migration against the live Supabase PostgreSQL database.
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
    sql_path = Path(__file__).parent / "v3_admin_feature_flags.sql"
    if not sql_path.exists():
        print(f"ERROR: Migration file not found: {sql_path}")
        sys.exit(1)

    sql_content = sql_path.read_text(encoding="utf-8")
    
    conn = get_connection()
    conn.autocommit = False  # Use transaction
    cur = conn.cursor()

    print("=" * 70)
    print("NEARPRO FEATURE FLAGS DATABASE MIGRATION")
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
        cur.execute("SELECT name, display_name, is_enabled FROM public.feature_flags;")
        flags = cur.fetchall()
        print(f"Found {len(flags)} feature flags in the database:")
        for name, display_name, is_enabled in flags:
            status = "ENABLED" if is_enabled else "DISABLED"
            print(f" - {name} ({display_name}): {status}")
    except Exception as e:
        print(f"Verification query failed: {e}")

    conn.close()
    print("\nMigration completed successfully!")

if __name__ == "__main__":
    run_migration()
