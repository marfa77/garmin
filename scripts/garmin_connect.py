#!/usr/bin/env python3
"""One-shot Garmin login; outputs token bundle as JSON on stdout."""

from __future__ import annotations

import base64
import json
import os
import sys
import tempfile
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")


def main() -> int:
    email = os.getenv("GARMIN_EMAIL") or (sys.argv[1] if len(sys.argv) > 1 else None)
    password = os.getenv("GARMIN_PASSWORD") or (sys.argv[2] if len(sys.argv) > 2 else None)

    if not email or not password:
        print(json.dumps({"ok": False, "error": "Missing Garmin email or password"}))
        return 1

    try:
        from garminconnect import Garmin
    except ImportError:
        print(json.dumps({"ok": False, "error": "garminconnect not installed"}))
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

    print(json.dumps({"ok": True, "email": email, "files": files}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
