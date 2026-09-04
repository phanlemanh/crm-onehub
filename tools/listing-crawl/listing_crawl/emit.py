import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

SCHEMA = Path(__file__).resolve().parent.parent / "schemas" / "listing-ingest.schema.json"

SOURCE = "nhatot"


def schema() -> dict:
    return json.loads(SCHEMA.read_text(encoding="utf-8"))


def crawled_at() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def build_batch(items: list[dict]) -> dict:
    return {"source": SOURCE, "crawledAt": crawled_at(), "items": items}


def validate_batch(batch: dict) -> None:
    validator = Draft202012Validator(schema(), format_checker=FormatChecker())
    errors = sorted(validator.iter_errors(batch), key=lambda error: list(error.absolute_path))
    if not errors:
        return
    lines = []
    for error in errors[:10]:
        where = ".".join(str(part) for part in error.absolute_path) or "lô"
        lines.append(f"{where}: {error.message}")
    raise ValueError("lô không hợp lược đồ — " + " · ".join(lines))


def write_batch(batch: dict, target: Path) -> Path:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(f"{json.dumps(batch, ensure_ascii=False, indent=2)}\n", encoding="utf-8")
    return target


def post_batch(batch: dict, url: str, secret: str) -> int:
    payload = json.dumps(batch, ensure_ascii=False).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {secret}",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.status
