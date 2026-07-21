import psycopg2

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def migrate():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print("Running profiles quota migration...")
        
        cur.execute("""
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_call_scripts_used INTEGER DEFAULT 0;
            ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_proposals_used INTEGER DEFAULT 0;
        """)
        
        conn.commit()
        print("Migration successful: Added monthly_call_scripts_used and monthly_proposals_used columns to profiles!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
