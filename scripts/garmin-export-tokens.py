#!/usr/bin/env python3
"""Log in to Garmin locally and print a token bundle JSON for the web app (no password sent to server)."""

from __future__ import annotations

import base64
import json
import os
import sys
import tempfile
from getpass import getpass
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


def main() -> int:
    email = os.getenv("GARMIN_EMAIL") or input("Garmin email: ").strip()
    password = os.getenv("GARMIN_PASSWORD") or getpass("Garmin password (hidden, stays on this computer): ")

    if not email or not password:
        print("Missing email or password.", file=sys.stderr)
        return 1

    try:
        from garminconnect import Garmin
    except ImportError:
        print("Install: pip install garminconnect python-dotenv", file=sys.stderr)
        return 1

    api = Garmin(email, password)
    try:
        api.login()
    except Exception as exc:
        print(json.dumps({"ok": False, "error": str(exc), "mfa_required": "mfa" in str(exc).lower()}))
        return 1

    with tempfile.TemporaryDirectory() as tmp:
        token_dir = Path(tmp)
        api.garth.dump(str(token_dir))
        files = {
            p.name: base64.b64encode(p.read_bytes()).decode("ascii")
            for p in token_dir.iterdir()
            if p.is_file()
        }

    bundle = {"v": 1, "files": files, "email": email}
    print(json.dumps(bundle))
    print("\n# Copy the JSON line above into Garmin Wellness → Connect", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
