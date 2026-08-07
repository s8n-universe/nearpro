"""
NearPro Database Onboarding Tracking Migration Runner
Executes the migration to add onboarding tracking columns to profiles.
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
    sql_path = Path(__file__).parent / "v15_onboarding_tracking.sql"
    if not sql_path.exists():
        print(f"ERROR: Migration file not found: {sql_path}")
        sys.exit(1)

    sql_content = sql_path.read_text(encoding="utf-8")
    
    conn = get_connection()
    conn.autocommit = False  # Use transaction
    cur = conn.cursor()

    print("=" * 70)
    print("NEARPRO ONBOARDING TRACKING DATABASE MIGRATION")
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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name IN ('onboarding_tasks_completed', 'onboarding_credits_awarded');
        """)
        cols = cur.fetchall()
        print("Columns status in public.profiles:")
        for col in cols:
            print(f"  - {col[0]}: {col[1]}")
    except Exception as e:
        print(f"Verification query failed: {e}")

    conn.close()
    print("\nMigration completed successfully!")

if __name__ == "__main__":
    run_migration()
