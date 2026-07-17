import sys
from pathlib import Path

# Add sync folder to path so we can import geo_utils
sys.path.append(str(Path(__file__).parent.parent / "sync"))
from geo_utils import extract_area

def test_extract_bandra():
    assert extract_area("14 Linking Road, Bandra West, Mumbai 400050") == "Bandra"
    assert extract_area("Shop 2, Hill Road, Bandra, Mumbai") == "Bandra"

def test_extract_andheri():
    assert extract_area("Veera Desai Road, Andheri West, Mumbai") == "Andheri"
    assert extract_area("Saki Naka, Andheri East, Mumbai 400072") == "Andheri"

def test_longest_match_first():
    # "Bandra West" should be mapped to normalized "Bandra", not matching wrong substrings
    assert extract_area("Bandra Kurla Complex, Mumbai") == "Bandra Kurla Complex"

def test_fallback_mumbai():
    assert extract_area("Some Address, India") == "Mumbai"
    assert extract_area(None) == "Mumbai"
    assert extract_area("") == "Mumbai"
