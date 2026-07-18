"""
Comprehensive database audit for NearPro v3 migration planning.
Checks every table, column, constraint, policy, trigger, and function
before any migration is executed.
"""
import psycopg2
import json

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

print("=" * 70)
print("NEARPRO DATABASE FULL AUDIT")
print("=" * 70)

# 1. All public tables
cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
""")
tables = [r[0] for r in cur.fetchall()]
print(f"\n1. PUBLIC TABLES ({len(tables)}):")
for t in tables:
    cur.execute(f"SELECT count(*) FROM public.{t}")
    count = cur.fetchone()[0]
    print(f"   - {t} ({count} rows)")

# 2. Detailed column info for each table
print("\n2. COLUMN DETAILS:")
for t in tables:
    cur.execute("""
        SELECT column_name, data_type, column_default, is_nullable,
               character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = %s AND table_schema = 'public'
        ORDER BY ordinal_position
    """, (t,))
    cols = cur.fetchall()
    print(f"\n   TABLE: {t}")
    for c in cols:
        default_str = f" DEFAULT {c[2]}" if c[2] else ""
        nullable = " NOT NULL" if c[3] == 'NO' else ""
        print(f"     {c[0]:30s} {c[1]:25s}{nullable}{default_str}")

# 3. All constraints (PK, FK, UNIQUE, CHECK)
print("\n3. CONSTRAINTS:")
cur.execute("""
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type,
           kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_column
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type
""")
for r in cur.fetchall():
    ref = f" -> {r[4]}.{r[5]}" if r[4] and r[4] != r[0] else ""
    print(f"   {r[0]:20s} {r[2]:12s} {r[1]:40s} col={r[3]}{ref}")

# 4. Indexes
print("\n4. INDEXES:")
cur.execute("""
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
""")
for r in cur.fetchall():
    print(f"   {r[0]:20s} {r[1]}")

# 5. RLS policies
print("\n5. RLS POLICIES:")
cur.execute("""
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
""")
for r in cur.fetchall():
    print(f"   {r[1]:20s} {r[2]:45s} cmd={r[5]:8s} roles={r[4]}")
    if r[6]:
        print(f"                        USING: {r[6][:80]}")
    if r[7]:
        print(f"                        CHECK: {r[7][:80]}")

# 6. RLS status per table
print("\n6. RLS STATUS:")
cur.execute("""
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relnamespace = 'public'::regnamespace AND relkind = 'r'
    ORDER BY relname
""")
for r in cur.fetchall():
    print(f"   {r[0]:20s} RLS={'ENABLED' if r[1] else 'DISABLED'}")

# 7. Triggers
print("\n7. TRIGGERS:")
cur.execute("""
    SELECT trigger_name, event_manipulation, event_object_table, action_statement
    FROM information_schema.triggers 
    WHERE trigger_schema = 'public' OR event_object_schema = 'public'
    ORDER BY event_object_table
""")
triggers = cur.fetchall()
if triggers:
    for r in triggers:
        print(f"   {r[2]:20s} {r[0]:30s} ON {r[1]}")
        print(f"                        {r[3][:80]}")
else:
    # Also check auth schema triggers
    cur.execute("""
        SELECT tgname, tgrelid::regclass, pg_get_triggerdef(oid)
        FROM pg_trigger 
        WHERE NOT tgisinternal
        AND tgrelid::regclass::text LIKE '%users%' OR tgrelid::regclass::text LIKE '%profiles%'
    """)
    for r in cur.fetchall():
        print(f"   {r[1]:20s} {r[0]}")
        print(f"                        {r[2][:120]}")

# 8. Custom functions (excluding pg_trgm internals)
print("\n8. CUSTOM FUNCTIONS:")
cur.execute("""
    SELECT p.proname, pg_get_function_result(p.oid) as return_type,
           pg_get_function_arguments(p.oid) as args,
           p.prosecdef as security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname NOT LIKE '%trgm%' 
    AND p.proname NOT LIKE '%similarity%'
    AND p.proname NOT LIKE 'set_limit%'
    AND p.proname NOT LIKE 'show_limit%'
    AND p.proname NOT LIKE 'show_trgm%'
    AND p.proname NOT LIKE 'gtrgm%'
    AND p.proname NOT LIKE 'gin_%'
    AND p.proname NOT LIKE 'rls_%'
    ORDER BY p.proname
""")
funcs = cur.fetchall()
for f in funcs:
    sec = " SECURITY DEFINER" if f[3] else ""
    print(f"   {f[0]}({f[2][:60]})")
    print(f"      RETURNS {f[1]}{sec}")

# 9. Get full function source for custom functions
print("\n9. FUNCTION SOURCE CODE:")
for f in funcs:
    cur.execute("""
        SELECT pg_get_functiondef(p.oid) 
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = %s
    """, (f[0],))
    src = cur.fetchone()
    if src:
        print(f"\n   --- {f[0]} ---")
        for line in src[0].split('\n'):
            print(f"   {line}")

# 10. Check if anonymous_trials exists
print("\n10. ANONYMOUS_TRIALS TABLE EXISTS:", "anonymous_trials" in tables)

# 11. Sample data from profiles to understand current state
cur.execute("SELECT count(*) FROM profiles")
profile_count = cur.fetchone()[0]
print(f"\n11. PROFILES: {profile_count} total")
if profile_count > 0:
    cur.execute("SELECT id, email, is_premium, created_at FROM profiles LIMIT 3")
    for r in cur.fetchall():
        print(f"    id={r[0]}, email={r[1]}, is_premium={r[2]}, created_at={r[3]}")

# 12. Check extensions
print("\n12. EXTENSIONS:")
cur.execute("SELECT extname, extversion FROM pg_extension ORDER BY extname")
for r in cur.fetchall():
    print(f"   {r[0]:30s} v{r[1]}")

conn.close()
print("\n" + "=" * 70)
print("AUDIT COMPLETE")
print("=" * 70)
