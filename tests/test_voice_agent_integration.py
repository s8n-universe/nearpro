import psycopg2
import sys

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def verify_integration():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    print("=" * 60)
    print("RUNNING VOICE AGENT INTEGRATION DB TESTS")
    print("=" * 60)

    # 1. Check tables exist
    expected_tables = ['voice_campaigns', 'global_dnc_suppression_list', 'voice_credit_ledger', 'call_audit_log']
    for table in expected_tables:
        cur.execute(f"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = %s);", (table,))
        exists = cur.fetchone()[0]
        print(f"Table '{table}': {'PASSED' if exists else 'FAILED'}")
        if not exists:
            sys.exit(1)

    # 2. Check profile column
    cur.execute("SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'voice_call_credits');")
    col_exists = cur.fetchone()[0]
    print(f"Profiles voice_call_credits column: {'PASSED' if col_exists else 'FAILED'}")
    if not col_exists:
        sys.exit(1)

    # 3. Check functions exist
    expected_funcs = ['decrement_credits', 'increment_campaign_dialed', 'increment_campaign_answered', 'increment_campaign_interested']
    for func in expected_funcs:
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 FROM pg_proc p 
                JOIN pg_namespace n ON p.pronamespace = n.oid 
                WHERE n.nspname = 'public' AND p.proname = %s
            );
        """, (func,))
        exists = cur.fetchone()[0]
        print(f"Function '{func}': {'PASSED' if exists else 'FAILED'}")
        if not exists:
            sys.exit(1)

    # 4. Check indexes exist
    expected_indexes = ['idx_call_audit_user', 'idx_call_audit_number', 'idx_call_audit_status', 'idx_call_transcript_fts']
    for idx in expected_indexes:
        cur.execute("SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = %s);", (idx,))
        exists = cur.fetchone()[0]
        print(f"Index '{idx}': {'PASSED' if exists else 'FAILED'}")
        if not exists:
            sys.exit(1)

    conn.close()
    print("=" * 60)
    print("ALL DB INTEGRATION VERIFICATIONS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    verify_integration()
