import getpass
import json
import os
from pathlib import Path

config_path = Path(__file__).with_name("appsettings.Local.json")
if config_path.exists():
    config = json.loads(config_path.read_text())
else:
    config = {}

google = config.setdefault("Authentication", {}).setdefault("Google", {})
client_id = input("Google OAuth Client ID: ").strip()
client_secret = getpass.getpass("Google OAuth Client Secret (hidden): ").strip()
if not client_id or not client_secret:
    raise SystemExit("Client ID and Client Secret are required; no changes saved.")

google["ClientId"] = client_id
google["ClientSecret"] = client_secret
google.setdefault("AllowedReturnUrls", [
    "https://tms.emal.com.ua",
    "https://localhost:5173",
    "http://localhost:5174",
])
config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
os.chmod(config_path, 0o600)
print(f"Saved locally to {config_path}; this file should be gitignored.")
