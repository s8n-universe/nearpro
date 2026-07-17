"""One-command sync launcher for NearPro."""
import subprocess
import sys
from pathlib import Path

def main():
    script_path = Path(__file__).parent / "sync" / "sync_to_supabase.py"
    if not script_path.exists():
        print(f"Error: Sync script not found at {script_path.absolute()}")
        sys.exit(1)
        
    print(f"Launching NearPro sync: {script_path.name}...")
    
    # Run the sync process
    process = subprocess.Popen([
        sys.executable,
        str(script_path)
    ])
    
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()
        print("\nSync process interrupted by user.")
        sys.exit(1)

if __name__ == "__main__":
    main()
