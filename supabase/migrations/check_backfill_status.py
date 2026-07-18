"""Check conversion score count."""
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
    cur.execute("SELECT count(*) FROM professionals WHERE conversion_score IS NOT NULL")
    count = cur.fetchone()[0]
    print(f"Professionals with populated conversion_score: {count}/5390")
    conn.close()

if __name__ == "__main__":
    main()
