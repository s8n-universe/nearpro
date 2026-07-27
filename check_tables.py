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
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
tables = [r[0] for r in cur.fetchall()]
print("Public tables:", tables)

# Add applied_coupon column to profiles if not exists
cur.execute("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS applied_coupon text")
conn.commit()
print("Successfully added applied_coupon column to profiles table!")

cur.close()
conn.close()
