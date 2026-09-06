import json
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker

SCHEMA = Path(__file__).resolve().parent.parent / "schemas" / "listing-ingest.schema.json"

SOURCE = "nhatot"


class PostFailed(Exception):
    def __init__(self, status: int | None, detail: str) -> None:
        super().__init__(f"{status if status is not None else 'không nối được'} — {detail}")
        self.status = status
        self.detail = detail


def schema() -> dict:
    return json.loads(SCHEMA.read_text(encoding="utf-8"))


def schema_max_items() -> int:
    return int(schema()["properties"]["items"]["maxItems"])


def crawled_at() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def build_batch(items: list[dict]) -> dict:
    return {"source": SOURCE, "crawledAt": crawled_at(), "items": items}


def payload_of(batch: dict) -> bytes:
    return json.dumps(batch, ensure_ascii=False).encode("utf-8")


def batch_size_of(configured: int) -> int:
    if configured < 1:
        raise ValueError(f"batch_size phải ≥ 1, đang là {configured}")
    return min(configured, schema_max_items())


def split_items(items: list[dict], batch_size: int, body_limit_bytes: int) -> list[list[dict]]:
    size = batch_size_of(batch_size)
    if body_limit_bytes < 1:
        raise ValueError(f"body_limit_bytes phải ≥ 1, đang là {body_limit_bytes}")

    chunks: list[list[dict]] = []
    for start in range(0, len(items), size):
        chunks.extend(_fitting(items[start : start + size], body_limit_bytes))
    return chunks


def _fitting(chunk: list[dict], body_limit_bytes: int) -> list[list[dict]]:
    if not chunk:
        return []
    if len(payload_of(build_batch(chunk))) <= body_limit_bytes:
        return [chunk]
    if len(chunk) == 1:
        raise ValueError(
            f"một mục vượt trần thân yêu cầu {body_limit_bytes} byte: {chunk[0].get('url')}"
        )
    middle = len(chunk) // 2
    return _fitting(chunk[:middle], body_limit_bytes) + _fitting(chunk[middle:], body_limit_bytes)


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
    payload = payload_of(batch)
    request = urllib.request.Request(
        url,
        data=payload,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {secret}",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", "replace").strip()[:300] or error.reason
        raise PostFailed(error.code, str(detail)) from error
    except urllib.error.URLError as error:
        raise PostFailed(None, str(error.reason)) from error
    except OSError as error:
        raise PostFailed(None, str(error)) from error
