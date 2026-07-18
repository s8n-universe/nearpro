"""Post migration verification."""
import psycopg2

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

# 1. Verify the owner profile
cur.execute("SELECT id, email, is_premium, tier, subscription_tier, subscription_status FROM profiles")
p = cur.fetchone()
print(f"Owner profile: email={p[1]}, is_premium={p[2]}, tier={p[3]}, sub_tier={p[4]}, status={p[5]}")

# 2. Verify get_professionals_v2 returns data (no auth context = free tier)
cur.execute("""
    SELECT name, conversion_score 
    FROM get_professionals_v2('', NULL, NULL, NULL, NULL, FALSE, FALSE, FALSE, NULL, 'rating_desc', 0, 3, FALSE)
""")
print("\nget_professionals_v2 test (anonymous, free tier):")
for r in cur.fetchall():
    print(f"  Lead: {r[0][:35]:35s} conversion_score={r[1]} (should be NULL for free)")

# 3. Count all tables
cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name
""")
tables = [r[0] for r in cur.fetchall()]
print(f"\nTotal tables: {len(tables)}")
for t in tables:
    cur.execute(f"SELECT count(*) FROM {t}")
    print(f"  {t:25s} {cur.fetchone()[0]} rows")

# 4. Verify RLS policy count
cur.execute("SELECT count(*) FROM pg_policies WHERE schemaname = 'public'")
print(f"\nTotal RLS policies: {cur.fetchone()[0]}")

# 5. Verify handle_new_user includes new columns
cur.execute("""
    SELECT pg_get_functiondef(p.oid) 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
""")
src = cur.fetchone()[0]
has_sub_tier = "subscription_tier" in src
has_tier = "'free'" in src
print(f"\nhandle_new_user includes subscription_tier: {has_sub_tier}")
print(f"handle_new_user sets tier to 'free': {has_tier}")

# 6. Verify professionals has conversion_score column
cur.execute("""
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name IN ('conversion_score', 'conversion_score_breakdown', 'audit_cached')
""")
new_cols = [r[0] for r in cur.fetchall()]
print(f"\nProfessionals new columns present: {new_cols}")

# 7. Spot check professionals data integrity
cur.execute("SELECT count(*), avg(rating)::numeric(4,1), count(phone), count(website) FROM professionals")
r = cur.fetchone()
print(f"\nData integrity: {r[0]} pros, avg_rating={r[1]}, with_phone={r[2]}, with_website={r[3]}")

conn.close()
print("\n=== ALL VERIFICATION CHECKS COMPLETE ===")
