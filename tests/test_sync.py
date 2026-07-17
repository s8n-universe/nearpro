import sys
import json
from pathlib import Path

# Add sync folder to path so we can import sync_to_supabase
sys.path.append(str(Path(__file__).parent.parent / "sync"))
from sync_to_supabase import compute_completeness_score, parse_db_hours

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
