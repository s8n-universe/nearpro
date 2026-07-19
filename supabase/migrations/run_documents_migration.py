"""
NearPro v3 Documents Library Database Migration Runner
Executes the PDF brochures table and bucket creation scripts on the live PostgreSQL instance.
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
    sql_path = Path(__file__).parent / "v3_migration_04_documents.sql"
    if not sql_path.exists():
        print(f"ERROR: Migration file not found: {sql_path}")
        sys.exit(1)

    sql_content = sql_path.read_text(encoding="utf-8")
    
    conn = get_connection()
    conn.autocommit = False  # Transactional integrity
    cur = conn.cursor()

    print("=" * 70)
    print("NEARPRO DOCUMENTS LIBRARY DATABASE MIGRATION")
    print("=" * 70)

    try:
        print("\n--- Executing migration SQL ---")
        cur.execute(sql_content)
        print("SQL executed successfully!")
        
        # Verify documents table creation
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'documents'
        """)
        table_exists = cur.fetchone()
        if table_exists:
            print("Verification: 'documents' table successfully verified in database!")
        else:
            raise Exception("Verification failed: 'documents' table missing after execution.")

        # Verify storage bucket existence
        cur.execute("SELECT id, name, public FROM storage.buckets WHERE id = 'documents'")
        bucket = cur.fetchone()
        if bucket:
            print(f"Verification: Storage bucket '{bucket[0]}' verified! Name: {bucket[1]}, Public: {bucket[2]}")
        else:
            raise Exception("Verification failed: 'documents' storage bucket missing after execution.")

        # Commit transaction
        conn.commit()
        print("\nMIGRATION COMPLETED & COMMITTED SUCCESSFULLY!")
    except Exception as e:
        print(f"\nERROR during migration: {e}")
        conn.rollback()
        print("ROLLED BACK. No database changes were applied.")
        conn.close()
        sys.exit(1)

    print("=" * 70)
    conn.close()

if __name__ == "__main__":
    run_migration()
