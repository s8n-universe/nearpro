import sys
from pathlib import Path

# Add sync folder to path so we can import category_mapping
sys.path.append(str(Path(__file__).parent.parent / "sync"))
from category_mapping import get_parent_category

def test_healthcare_mapping():
    assert get_parent_category("Dental Clinic") == "Healthcare"
    assert get_parent_category("Orthopedic surgeon") == "Healthcare"
    assert get_parent_category("Diagnostic Center") == "Healthcare"

def test_beauty_mapping():
    assert get_parent_category("Hair Salon") == "Beauty & Wellness"
    assert get_parent_category("Beauty Spa") == "Beauty & Wellness"
    assert get_parent_category("Yoga studio") == "Beauty & Wellness"

def test_real_estate_mapping():
    assert get_parent_category("Real estate developer") == "Real Estate"
    assert get_parent_category("Interior Designer") == "Real Estate"

def test_finance_legal_mapping():
    assert get_parent_category("Chartered Accountant") == "Finance & Legal"
    assert get_parent_category("Law Firm") == "Finance & Legal"

def test_other_fallback():
    assert get_parent_category(None) == "Other"
    assert get_parent_category("") == "Other"
    assert get_parent_category("Arbitrary Unmapped Name") == "Other"
