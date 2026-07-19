import sys
import json
from pathlib import Path

def selectHookType(rating, reviews, hasWebsite, hasEmail):
    r = rating if rating is not None else 0
    rv = reviews if reviews is not None else 0

    if r >= 4.5 and rv >= 50 and not hasWebsite:   return 'HIGH_RATING_NO_WEB'
    if r >= 4.5 and rv >= 50 and hasWebsite:     return 'STRONG_BRAND_GROWTH'
    if r >= 4.3 and rv < 20:                    return 'HIDDEN_GEM'
    if r < 4.0 and rv >= 20:                    return 'REPUTATION_OPPORTUNITY'
    if not hasWebsite and not hasEmail:               return 'ZERO_DIGITAL'
    if r >= 4.0 and rv >= 20 and not hasWebsite:   return 'HIGH_RATING_NO_WEB'
    if r >= 4.0 and rv >= 20 and hasWebsite:    return 'STRONG_BRAND_GROWTH'
    return 'STANDARD'

def test_hook_selection_matrix():
    # TEST 1: Sharma Dental Clinic: 4.7 rating, 312 reviews, No website, No email
    assert selectHookType(4.7, 312, False, False) == 'HIGH_RATING_NO_WEB'

    # TEST 2: Quick Fix Electricians: 3.6 rating, 45 reviews, Yes website, Yes email
    assert selectHookType(3.6, 45, True, True) == 'REPUTATION_OPPORTUNITY'

    # TEST 3: Malhotra Tailors: None rating, None reviews, No website, No email
    assert selectHookType(None, None, False, False) == 'ZERO_DIGITAL'

    # TEST 4: Oberoi Real Estate: 4.4 rating, 89 reviews, Yes website, Yes email
    assert selectHookType(4.4, 89, True, True) == 'STRONG_BRAND_GROWTH'

    # TEST 5: Gupta Sweets: 4.6 rating, 8 reviews, No website, No email
    assert selectHookType(4.6, 8, False, False) == 'HIDDEN_GEM'

    print("[OK] selectHookType Matrix matches all test specifications!")

def test_forbidden_outreach_rules():
    forbidden_phrases = [
        "hope this finds you well",
        "i wanted to reach out",
        "touching base",
        "following up",
        "please feel free to",
        "synergy",
        "leverage",
        "value-add",
        "dear sir",
        "dear madam",
        "to whom it may concern"
    ]

    # Test validator stub
    def validate_message(msg):
        # 1. No hyphens allowed
        if "-" in msg:
            raise ValueError("Hyphen constraint violation!")
        
        # 2. Check forbidden phrases
        lower_msg = msg.lower()
        for phrase in forbidden_phrases:
            if phrase in lower_msg:
                raise ValueError(f"Forbidden phrase found: '{phrase}'")
        
        # 3. First sentence cannot start with "I"
        first_word = msg.strip().split()[0].replace('"', '').replace("'", "")
        if first_word.lower() == "i":
            raise ValueError("First word cannot be 'I'")
        
        return True

    # Validate correct mock
    sample_correct = "Aapka 4.8 star rating and 300 reviews dekha Google profile par, patients support systems trust you. Website is missing, which means prospective clients choose competitors. Can we talk?"
    assert validate_message(sample_correct) is True
    print("[OK] Forbidden constraints validation test passes successfully!")

if __name__ == "__main__":
    test_hook_selection_matrix()
    test_forbidden_outreach_rules()
