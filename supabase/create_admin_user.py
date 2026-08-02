import requests
import json
import sys

URL = "https://qlpopdudfomjuwagjizy.supabase.co"
# Service role key from parent .env
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscG9wZHVkZm9tanV3YWdqaXp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDI3NzA1MywiZXhwIjoyMDk5ODUzMDUzfQ.bhmTIRZWLMWJD2bw2l-evxfLoacKGE_VmvcY9O15yp0"

def create_admin():
    headers = {
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json"
    }

    email = "nearproadmin@gmail.com"
    password = "nearproadmin"

    print("=" * 60)
    print("CREATING/UPDATING ADMIN USER IN SUPABASE AUTH")
    print("=" * 60)

    # Step 1: Check if user already exists in auth
    # We can retrieve all users from the admin API
    list_url = f"{URL}/auth/v1/admin/users"
    print(f"Checking existing users via: {list_url}")
    
    try:
        res = requests.get(list_url, headers=headers)
        if res.status_code == 200:
            users = res.json().get("users", [])
            existing_user = next((u for u in users if u.get("email") == email), None)
            
            if existing_user:
                print(f"User '{email}' already exists. Updating password to '{password}'...")
                user_id = existing_user["id"]
                update_url = f"{URL}/auth/v1/admin/users/{user_id}"
                update_body = {
                    "password": password,
                    "email_confirm": True
                }
                res_up = requests.put(update_url, headers=headers, json=update_body)
                if res_up.status_code == 200:
                    print("Admin password updated successfully!")
                    sys.exit(0)
                else:
                    print(f"Failed to update password: HTTP {res_up.status_code} - {res_up.text}")
                    sys.exit(1)
        else:
            print(f"Warning: Could not fetch user list: HTTP {res.status_code} - {res.text}")
    except Exception as e:
        print(f"Network error during check: {e}")

    # Step 2: Create new user if not found
    create_body = {
        "email": email,
        "password": password,
        "email_confirm": True
    }
    
    print(f"Creating new admin user: {email}")
    try:
        res_create = requests.post(list_url, headers=headers, json=create_body)
        if res_create.status_code in (200, 201):
            print("Admin user created successfully with email confirmed!")
            sys.exit(0)
        else:
            print(f"Failed to create admin user: HTTP {res_create.status_code} - {res_create.text}")
            sys.exit(1)
    except Exception as e:
        print(f"Network error during creation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_admin()
