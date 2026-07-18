"""Simple manual test executor."""
import sys
from pathlib import Path

# Add tests path
sys.path.append(str(Path(__file__).parent))
import test_sync

def main():
    print("Running sync tests manually...")
    try:
        test_sync.test_completeness_score()
        print("[OK] test_completeness_score passed")
        
        test_sync.test_parse_db_hours()
        print("[OK] test_parse_db_hours passed")
        
        test_sync.test_conversion_score()
        print("[OK] test_conversion_score passed")
        
        print("\nAll tests completed successfully!")
    except AssertionError as e:
        print(f"\nAssertionError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
