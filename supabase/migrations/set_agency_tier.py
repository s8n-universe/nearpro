import psycopg2
import sys

DB_CONFIG = {
    "host": "db.qlpopdudfomjuwagjizy.supabase.co",
    "port": 5432,
    "dbname": "postgres",
    "user": "postgres",
    "password": "NearPro@210105",
}

target_email = "consulting.s8n@gmail.com"

def set_agency_tier():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print(f"Searching for user with email: {target_email}...")
        
        # 1. Find user ID from auth.users
        cur.execute("SELECT id, email FROM auth.users WHERE lower(email) = lower(%s);", (target_email,))
        user_row = cur.fetchone()
        
        if not user_row:
            print(f"[ERROR] User with email '{target_email}' not found in auth.users table.")
            print("Listing existing users in auth.users:")
            cur.execute("SELECT id, email FROM auth.users LIMIT 20;")
            users = cur.fetchall()
            for u in users:
                print(f" - {u[1]} (id: {u[0]})")
            cur.close()
            conn.close()
            return
            
        user_id, email = user_row
        print(f"[OK] Found user in auth.users: ID = {user_id}, Email = {email}")
        
        # 2. Check if profile exists in profiles table
        cur.execute("SELECT id, tier, subscription_tier, is_premium FROM profiles WHERE id = %s;", (user_id,))
        profile_row = cur.fetchone()
        
        if not profile_row:
            print(f"Creating profile record for user {user_id}...")
            cur.execute("""
                INSERT INTO profiles (id, tier, subscription_tier, subscription_status, is_premium, role, onboarding_completed)
                VALUES (%s, 'agency', 'agency', 'active', TRUE, 'agency', TRUE);
            """, (user_id,))
        else:
            print(f"Current profile state: tier={profile_row[1]}, subscription_tier={profile_row[2]}, is_premium={profile_row[3]}")
            cur.execute("""
                UPDATE profiles 
                SET tier = 'agency',
                    subscription_tier = 'agency',
                    subscription_status = 'active',
                    is_premium = TRUE,
                    role = 'agency',
                    onboarding_completed = TRUE,
                    monthly_export_rows_limit = 999999,
                    monthly_lead_unlocks_limit = 999999,
                    updated_at = NOW()
                WHERE id = %s;
            """, (user_id,))
            
        conn.commit()
        print(f"[SUCCESS] Updated account '{email}' ({user_id}) to AGENCY TIER!")
        
        # 3. Verify update
        cur.execute("SELECT id, tier, subscription_tier, is_premium, subscription_status FROM profiles WHERE id = %s;", (user_id,))
        updated_profile = cur.fetchone()
        print(f"Verified Profile State: tier={updated_profile[1]}, subscription_tier={updated_profile[2]}, is_premium={updated_profile[3]}, status={updated_profile[4]}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Execution error: {e}")

if __name__ == "__main__":
    set_agency_tier()
