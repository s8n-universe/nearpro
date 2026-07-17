# Known Mumbai areas used for parsing address neighborhood details.

MUMBAI_AREAS = [
    "Bandra West", "Bandra East", "Bandra",
    "Andheri West", "Andheri East", "Andheri",
    "Borivali West", "Borivali East", "Borivali",
    "Malad West", "Malad East", "Malad",
    "Goregaon West", "Goregaon East", "Goregaon",
    "Kandivali West", "Kandivali East", "Kandivali",
    "Powai", "Vikhroli", "Ghatkopar West", "Ghatkopar East", "Ghatkopar",
    "Kurla", "Chembur", "Govandi", "Mankhurd",
    "Worli", "Lower Parel", "Prabhadevi", "Dadar", "Matunga",
    "BKC", "Bandra Kurla Complex", "Dharavi",
    "Juhu", "Versova", "Lokhandwala",
    "Thane", "Navi Mumbai", "Vashi", "Kharghar", "Belapur",
    "Mulund", "Bhandup",
    "Colaba", "Churchgate", "Fort", "CST", "Nariman Point",
    "Malabar Hill", "Walkeshwar", "Peddar Road",
    "Grant Road", "Nana Chowk", "Marine Lines",
    "Santacruz West", "Santacruz East", "Santacruz",
    "Khar West", "Khar East", "Khar",
    "Vile Parle West", "Vile Parle East", "Vile Parle",
    "Jogeshwari West", "Jogeshwari East", "Jogeshwari",
    "Dahisar", "Mira Road", "Bhayander",
    "Dombivli", "Kalyan", "Ulhasnagar", "Ambernath",
    "Dindoshi", "Kalbadevi", "Sion", "Mazgaon", "Byculla",
    "Parel", "Sewri", "Charni Road", "Kemps Corner", "Mahalaxmi"
]

def extract_area(address: str | None) -> str:
    """
    Extracts the neighborhood/suburb from a Google Maps address string.
    Priority: longer matches first to avoid "Bandra" matching before "Bandra West".
    Normalizes compound names like "Bandra West" -> "Bandra".
    """
    if not address:
        return "Mumbai"
    
    # Sort by length descending (longer = more specific)
    sorted_areas = sorted(MUMBAI_AREAS, key=len, reverse=True)
    
    address_lower = address.lower()
    for area in sorted_areas:
        if area.lower() in address_lower:
            # Normalize compound names (e.g., "Bandra West" -> "Bandra")
            area_clean = area.replace(" West", "").replace(" East", "")
            return area_clean
            
    return "Mumbai"  # Fallback
