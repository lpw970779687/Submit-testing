#!/usr/bin/env python3
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TESTING_DIR = ROOT / "testing"
OUTPUT_FILE = TESTING_DIR / "index.json"


def to_iso_utc(path: Path) -> str:
    return datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat()


def build_manifest() -> dict:
    records = []
    if TESTING_DIR.exists():
        for file_path in sorted(TESTING_DIR.rglob("*.md")):
            if file_path.name == "index.json":
                continue
            records.append(
                {
                    "name": file_path.stem,
                    "path": file_path.relative_to(ROOT).as_posix(),
                    "updatedAt": to_iso_utc(file_path),
                }
            )

    records.sort(key=lambda item: item["path"])
    return {"records": records}


def main() -> None:
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest()
    OUTPUT_FILE.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
