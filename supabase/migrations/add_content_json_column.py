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
        
        print("Running documents content_json migration...")
        
        cur.execute("""
            ALTER TABLE documents ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT '{}'::jsonb;
            NOTIFY pgrst, 'reload schema';
        """)
        
        conn.commit()
        print("Migration successful: Added content_json column to documents table and reloaded PostgREST schema cache!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
