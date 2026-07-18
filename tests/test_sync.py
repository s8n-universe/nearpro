import sys
import json
from pathlib import Path

# Add sync folder to path so we can import sync_to_supabase
sys.path.append(str(Path(__file__).parent.parent / "sync"))
from sync_to_supabase import compute_completeness_score, parse_db_hours, compute_conversion_score

def test_completeness_score():
    # Case 0: Empty lead
    assert compute_completeness_score({}) == 0
    
    # Case 1: Phone only
    assert compute_completeness_score({"phone": "+91-9876543210"}) == 1
    
    # Case 2: Phone + Website + Email
    assert compute_completeness_score({
        "phone": "+91-9876543210",
        "website": "https://example.com",
        "email": "test@example.com"
    }) == 3

    # Case 3: Fully complete (Phone + Website + Email + Hours + Coords)
    assert compute_completeness_score({
        "phone": "+91-9876543210",
        "website": "https://example.com",
        "email": "test@example.com",
        "hours": {"Mon": "9am-6pm"},
        "latitude": 19.0596,
        "longitude": 72.8295
    }) == 5

def test_parse_db_hours():
    # Dict returns as-is
    assert parse_db_hours({"Mon": "9am"}) == {"Mon": "9am"}
    
    # JSON string parses correctly
    assert parse_db_hours('{"Mon": "9am"}') == {"Mon": "9am"}
    
    # Invalid JSON string returns raw wrapper
    assert parse_db_hours('Open 24 hours') == {"raw": "Open 24 hours"}
    
    # None/Empty returns empty dict
    assert parse_db_hours(None) == {}
    assert parse_db_hours("") == {}

def test_conversion_score():
    # Case 1: Basic lead with no website (25 pts no site, 8 pts general fit) -> 33
    score, breakdown = compute_conversion_score({"category": "general"})
    assert score == 33
    assert breakdown["noOrBadSite"] == 25
    assert breakdown["industryFit"] == 8

    # Case 2: High fit dentist, has website (0 pts bad site, 15 pts industry fit, 15 pts rating, 10 recency, 4 review volume (20 reviews), 15 reachable) -> 59
    score, breakdown = compute_conversion_score({
        "category": "Dentist in Mumbai",
        "website": "https://dentist.com",
        "phone": "+91 98765 43210",
        "email": "info@dentist.com",
        "rating": 4.5,
        "review_count": 20
    })
    assert score == 54
    assert breakdown["noOrBadSite"] == 0
    assert breakdown["industryFit"] == 15
    assert breakdown["rating"] == 15
    assert breakdown["recency"] == 5  # 20 reviews is <= 20, so 5
    assert breakdown["reviewVolume"] == 4
    assert breakdown["reachable"] == 15

