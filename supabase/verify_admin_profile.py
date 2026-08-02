import psycopg2
import sys

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

def verify_profile():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    email = "nearproadmin@gmail.com"

    print("=" * 60)
    print("VERIFYING ADMIN PROFILE IN PUBLIC.PROFILES")
    print("=" * 60)

    # 1. Fetch user ID from auth.users
    cur.execute("SELECT id FROM auth.users WHERE email = %s;", (email,))
    user_row = cur.fetchone()
    if not user_row:
        print(f"ERROR: User '{email}' not found in auth.users!")
        conn.close()
        sys.exit(1)

    user_id = user_row[0]
    print(f"Found Auth User ID: {user_id}")

    # 2. Check if profile exists in public.profiles
    cur.execute("SELECT id, role, tier FROM public.profiles WHERE id = %s;", (user_id,))
    profile_row = cur.fetchone()

    if profile_row:
        print(f"Profile exists! Current Role: {profile_row[1]}, Tier: {profile_row[2]}")
        # Make sure role is set to 'agency' and tier is set to 'agency' for full admin features access!
        if profile_row[1] != 'agency' or profile_row[2] != 'agency':
            print("Updating role and tier to 'agency'...")
            cur.execute("""
                UPDATE public.profiles 
                SET role = 'agency', tier = 'agency', full_name = 'S8N Administrator' 
                WHERE id = %s;
            """, (user_id,))
            conn.commit()
            print("Profile updated successfully!")
    else:
        print("Profile not found. Creating a new profile row...")
        cur.execute("""
            INSERT INTO public.profiles (id, email, full_name, role, tier, voice_call_credits, enrichment_credits, monthly_research_used, monthly_research_limit)
            VALUES (%s, %s, 'S8N Administrator', 'agency', 'agency', 1000, 1000, 0, 500);
        """, (user_id, email))
        conn.commit()
        print("Profile created successfully!")

    conn.close()
    print("Verification completed successfully!")

if __name__ == "__main__":
    verify_profile()
