import json
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
COMMITTED = Path(__file__).resolve().parents[1] / "schemas" / "listing-ingest.schema.json"


class SchemaRatchet(unittest.TestCase):
    def test_ban_commit_khop_ban_sinh_lai_tu_nguon(self):
        with tempfile.NamedTemporaryFile(suffix=".json") as handle:
            subprocess.run(
                ["bun", "run", "schema:listing-ingest", handle.name],
                cwd=ROOT / "packages" / "validation",
                check=True,
                capture_output=True,
            )
            fresh = json.loads(Path(handle.name).read_text(encoding="utf-8"))

        self.assertEqual(
            json.loads(COMMITTED.read_text(encoding="utf-8")),
            fresh,
            "Lược đồ đã đổi ở nguồn — chạy lại bun run schema:listing-ingest và commit tệp mới.",
        )
