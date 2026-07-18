"""Migration to add webhook integration columns to profiles table."""
import psycopg2

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    print("Running webhook columns migration...")
    cur.execute("""
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS n8n_webhook_url text NULL,
        ADD COLUMN IF NOT EXISTS google_sheets_webhook_url text NULL;
    """)
    
    conn.commit()
    print("Migration completed successfully!")
    conn.close()

if __name__ == "__main__":
    main()
