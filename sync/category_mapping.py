import re

# Exhaustive category mapping from raw Google Maps categories to NearPro parent groups.

PARENT_CATEGORIES = {
    "Healthcare": {
        "icon": "🏥",
        "keywords": [
            "doctor", "physician", "clinic", "hospital", "dentist", "dental",
            "pharmacy", "chemist", "medical", "health", "surgeon", "specialist",
            "ophthalmologist", "dermatologist", "cardiologist", "neurologist",
            "physiotherapist", "physiotherapy", "orthopedic", "gynecologist", "pediatrician",
            "psychiatrist", "psychologist", "therapist", "dietitian", "nutritionist",
            "laboratory", "diagnostic", "pathology", "radiology", "nursing home",
            "eye care", "blood testing"
        ]
    },
    "Beauty & Wellness": {
        "icon": "💄",
        "keywords": [
            "salon", "spa", "beauty", "parlour", "parlor", "hair", "makeup",
            "nail", "waxing", "threading", "mehndi", "tattoo", "skin care",
            "aesthetic", "cosmetic", "facial", "massage", "wellness", "yoga",
            "gym", "fitness", "pilates", "zumba", "meditation"
        ]
    },
    "Real Estate": {
        "icon": "🏗️",
        "keywords": [
            "real estate", "property", "builder", "developer", "constructor",
            "architect", "interior", "design", "decorator", "renovation", "contractor",
            "civil engineer", "housing", "flat", "apartment", "villa", "commercial property"
        ]
    },
    "Education": {
        "icon": "📚",
        "keywords": [
            "school", "college", "university", "institute", "academy", "tutor",
            "coaching", "training", "course", "class", "teacher", "education",
            "educational", "nursery", "kindergarten", "preschool", "playschool", "library"
        ]
    },
    "Food & Dining": {
        "icon": "🍽️",
        "keywords": [
            "restaurant", "cafe", "hotel", "bakery", "sweet", "mithai", "dhaba",
            "food", "catering", "tiffin", "mess", "canteen", "bar", "pub",
            "cloud kitchen", "delivery", "fast food", "pizza", "burger", "biryani"
        ]
    },
    "Finance & Legal": {
        "icon": "⚖️",
        "keywords": [
            "chartered accountant", "ca firm", "lawyer", "law", "advocate", "legal",
            "solicitor", "financial", "insurance", "investment", "bank", "loan",
            "tax", "audit", "compliance", "consultant", "advisory", "wealth",
            "certified public accountant"
        ]
    },
    "Technology": {
        "icon": "💻",
        "keywords": [
            "software", "it company", "web", "app", "technology", "digital",
            "computer", "laptop", "mobile", "repair", "data", "cybersecurity",
            "cloud", "ai", "artificial intelligence", "machine learning", "developer",
            "programmer", "seo", "marketing agency", "branding"
        ]
    },
    "Daily Services": {
        "icon": "🔧",
        "keywords": [
            "plumber", "electrician", "carpenter", "painter", "cleaner",
            "laundry", "dry clean", "tailor", "cobbler", "pest control",
            "security", "driver", "movers", "packers", "courier", "delivery"
        ]
    },
    "Retail & Shopping": {
        "icon": "🛍️",
        "keywords": [
            "shop", "store", "showroom", "outlet", "market", "mall", "supermarket",
            "grocery", "clothing", "garments", "electronics", "furniture",
            "hardware", "stationery", "gift", "jewellery", "jewelry", "watches"
        ]
    },
    "Events & Entertainment": {
        "icon": "🎉",
        "keywords": [
            "event", "wedding", "photographer", "videographer", "decorator",
            "caterer", "venue", "banquet", "hall", "party", "entertainment",
            "music", "band", "dj", "theatre", "cinema", "sports", "travel", "tour"
        ]
    },
    "Other": {
        "icon": "📌",
        "keywords": []  # Catch-all for uncategorized
    }
}

def get_parent_category(raw_category: str) -> str:
    """
    Maps a raw Google Maps category string to a NearPro parent category.
    Case-insensitive word boundary regex matching. First match wins.
    Falls through to "Other" if no match found.
    """
    if not raw_category:
        return "Other"
    
    category_lower = raw_category.lower()
    
    for parent_name, config in PARENT_CATEGORIES.items():
        if parent_name == "Other":
            continue
        for keyword in config["keywords"]:
            # Use regex to match full words/phrases instead of arbitrary substrings
            # This prevents "unmapped" matching "app"
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, category_lower):
                return parent_name
    
    return "Other"

