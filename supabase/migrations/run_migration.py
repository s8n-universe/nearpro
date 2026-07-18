"""
NearPro v3 Database Migration Runner
Executes the complete v3 migration against the live Supabase PostgreSQL database.
Runs each step with verification and rollback safety.
"""
import psycopg2
import sys
import os
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
    sql_path = Path(__file__).parent / "v3_complete_migration.sql"
    if not sql_path.exists():
        print(f"ERROR: Migration file not found: {sql_path}")
        sys.exit(1)

    sql_content = sql_path.read_text(encoding="utf-8")
    
    conn = get_connection()
    conn.autocommit = False  # Use transaction
    cur = conn.cursor()

    print("=" * 70)
    print("NEARPRO v3 DATABASE MIGRATION")
    print("=" * 70)

    # Pre migration snapshot
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    tables_before = [r[0] for r in cur.fetchall()]
    print(f"\nTables BEFORE migration: {tables_before}")

    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'profiles' ORDER BY ordinal_position
    """)
    profile_cols_before = [r[0] for r in cur.fetchall()]
    print(f"Profile columns BEFORE: {len(profile_cols_before)} columns")

    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'professionals' ORDER BY ordinal_position
    """)
    prof_cols_before = [r[0] for r in cur.fetchall()]
    print(f"Professionals columns BEFORE: {len(prof_cols_before)} columns")

    # Run the migration
    print("\n--- Executing migration SQL ---")
    try:
        cur.execute(sql_content)
        print("SQL executed successfully!")
    except Exception as e:
        print(f"\nERROR during migration: {e}")
        conn.rollback()
        print("ROLLED BACK. No changes applied.")
        conn.close()
        sys.exit(1)

    # Post migration verification
    print("\n--- Verifying results ---")

    # Check tables
    cur.execute("""
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    tables_after = [r[0] for r in cur.fetchall()]
    new_tables = [t for t in tables_after if t not in tables_before]
    print(f"\nTables AFTER migration: {tables_after}")
    print(f"NEW tables created: {new_tables}")

    expected_new = ['anonymous_trials', 'audit_cache', 'click_events', 
                    'data_requests', 'lead_lists', 'outreach_templates', 'saved_leads']
    missing = [t for t in expected_new if t not in tables_after]
    if missing:
        print(f"WARNING: Expected tables missing: {missing}")

    # Check profiles columns
    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'profiles' ORDER BY ordinal_position
    """)
    profile_cols_after = [r[0] for r in cur.fetchall()]
    new_cols = [c for c in profile_cols_after if c not in profile_cols_before]
    print(f"\nProfile columns AFTER: {len(profile_cols_after)} (added {len(new_cols)})")
    print(f"  New columns: {new_cols}")

    # Check professionals columns
    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'professionals' ORDER BY ordinal_position
    """)
    prof_cols_after = [r[0] for r in cur.fetchall()]
    new_prof_cols = [c for c in prof_cols_after if c not in prof_cols_before]
    print(f"\nProfessionals columns AFTER: {len(prof_cols_after)} (added {len(new_prof_cols)})")
    print(f"  New columns: {new_prof_cols}")

    # Check functions
    cur.execute("""
        SELECT p.proname FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname IN ('get_professionals_v2', 'get_dashboard_stats', 'get_crm_pipeline', 'handle_new_user')
        ORDER BY p.proname
    """)
    funcs = [r[0] for r in cur.fetchall()]
    print(f"\nKey functions present: {funcs}")

    # Check RLS on new tables
    cur.execute("""
        SELECT relname, relrowsecurity 
        FROM pg_class 
        WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
        ORDER BY relname
    """)
    print("\nRLS status:")
    for r in cur.fetchall():
        print(f"  {r[0]:25s} RLS={'ENABLED' if r[1] else 'DISABLED'}")

    # Verify existing data not damaged
    cur.execute("SELECT count(*) FROM professionals")
    prof_count = cur.fetchone()[0]
    print(f"\nProfessionals count: {prof_count} (should be 5390)")

    cur.execute("SELECT id, email, is_premium, tier, subscription_tier FROM profiles")
    profiles = cur.fetchall()
    print(f"Profiles count: {len(profiles)}")
    for p in profiles:
        print(f"  id={p[0]}, email={p[1]}, is_premium={p[2]}, tier={p[3]}, sub_tier={p[4]}")

    # Test get_professionals_v2 works
    try:
        cur.execute("""
            SELECT count(*) FROM get_professionals_v2(
                '', NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, NULL, 'rating_desc', 0, 5, FALSE
            )
        """)
        rpc_count = cur.fetchone()[0]
        print(f"\nget_professionals_v2 test: returned {rpc_count} rows (expected 5)")
    except Exception as e:
        print(f"\nWARNING: get_professionals_v2 test failed: {e}")

    # Test get_dashboard_stats works
    try:
        cur.execute("SELECT get_dashboard_stats('53991ba4-1d92-46b6-b5db-0010efe2948e')")
        stats = cur.fetchone()[0]
        print(f"get_dashboard_stats test: {stats}")
    except Exception as e:
        print(f"WARNING: get_dashboard_stats test failed: {e}")

    # All checks passed — commit
    print("\n" + "=" * 70)
    all_ok = (
        len(missing) == 0
        and 'get_professionals_v2' in funcs
        and 'get_dashboard_stats' in funcs
        and 'get_crm_pipeline' in funcs
        and prof_count == 5390
        and len(new_prof_cols) >= 3
    )
    
    if all_ok:
        conn.commit()
        print("ALL CHECKS PASSED — MIGRATION COMMITTED!")
    else:
        print("SOME CHECKS FAILED — Review output above.")
        response = input("Commit anyway? (yes/no): ").strip().lower()
        if response == 'yes':
            conn.commit()
            print("MIGRATION COMMITTED (with warnings).")
        else:
            conn.rollback()
            print("ROLLED BACK. No changes applied.")

    print("=" * 70)
    conn.close()


if __name__ == "__main__":
    run_migration()
