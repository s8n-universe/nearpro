"""
One time backfill script to compute and update conversion_score and 
conversion_score_breakdown for all existing professionals in the Supabase database.
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

HIGH_FIT_NICHES = [
    "dentist", "salon", "clinic", "spa", "gym", "restaurant",
    "cafe", "lawyer", "doctor", "coaching", "ca", "architect", "interior"
]

def compute_conversion_score(lead: dict) -> tuple:
    no_or_bad_site = 25 if not lead.get("website") else 0
    
    reviews = lead.get("review_count") or 0
    review_volume = min(20, round(reviews / 5))
    
    rating_val = lead.get("rating") or 0
    rating = 15 if rating_val >= 4 else (8 if rating_val >= 3.5 else 0)
    
    recency = 10 if reviews > 20 else (5 if reviews > 5 else 0)
    
    reachable = (5 if lead.get("phone") else 0) + \
                (5 if lead.get("website") else 0) + \
                (5 if lead.get("email") else 0)
                
    category_lower = (lead.get("category") or "").lower()
    industry_fit = 15 if any(n in category_lower for n in HIGH_FIT_NICHES) else 8
    
    total = no_or_bad_site + review_volume + rating + recency + reachable + industry_fit
    score = min(100, total)
    
    breakdown = {
        "noOrBadSite": no_or_bad_site,
        "reviewVolume": review_volume,
        "rating": rating,
        "recency": recency,
        "reachable": reachable,
        "industryFit": industry_fit
    }
    return score, breakdown

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    print("Fetching all professionals...")
    cur.execute("SELECT id, name, category, website, phone, email, rating, review_count FROM professionals")
    rows = cur.fetchall()
    print(f"Found {len(rows)} records. Starting computation and update...")
    
    updated_count = 0
    for r in rows:
        lead = {
            "id": r[0],
            "name": r[1],
            "category": r[2],
            "website": r[3],
            "phone": r[4],
            "email": r[5],
            "rating": r[6],
            "review_count": r[7]
        }
        score, breakdown = compute_conversion_score(lead)
        
        cur.execute(
            "UPDATE professionals SET conversion_score = %s, conversion_score_breakdown = %s WHERE id = %s",
            (score, json.dumps(breakdown), lead["id"])
        )
        updated_count += 1
        if updated_count % 500 == 0:
            print(f"Processed {updated_count}/{len(rows)} leads...")
            conn.commit()
            
    conn.commit()
    print(f"Successfully backfilled conversion scores for {updated_count} records!")
    
    # Run a quick check
    cur.execute("SELECT count(*) FROM professionals WHERE conversion_score IS NULL")
    null_count = cur.fetchone()[0]
    print(f"Remaining professionals with NULL conversion_score: {null_count}")
    
    conn.close()

if __name__ == "__main__":
    main()
