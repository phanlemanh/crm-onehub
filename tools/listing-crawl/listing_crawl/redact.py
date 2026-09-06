import argparse
import json
import re
import sys
from pathlib import Path

PROFILE_URL = re.compile(r"https?://(?:www\.)?nhatot\.com/moi-gioi-[A-Za-z0-9._-]+")
SLUG = re.compile(r"https?://(?:www\.)?nhatot\.com/moi-gioi-(?P<slug>[A-Za-z0-9._-]+)")
STAND_IN_SLUG = re.compile(r"mau-(\d+)")
PHONE = re.compile(r"(?<!\d)0\d{8,10}(?!\d)")

PHONE_STAND_IN = "09xxxxxxxx"


def _slug_of(url: str) -> str:
    found = SLUG.match(url.strip())
    return found.group("slug") if found else url.strip()


class Redactor:
    def __init__(self) -> None:
        self._slot: dict[str, int] = {}
        self._used: set[int] = set()
        self._names: dict[str, str] = {}

    @property
    def count(self) -> int:
        return len(self._slot)

    def index(self, url: str) -> int:
        slug = _slug_of(url)
        known = self._slot.get(slug)
        if known is not None:
            return known

        kept = STAND_IN_SLUG.fullmatch(slug)
        number = int(kept.group(1)) if kept else 0
        if number <= 0 or number in self._used:
            number = 1
            while number in self._used:
                number += 1

        self._slot[slug] = number
        self._used.add(number)
        return number

    def label(self, url: str) -> str:
        return f"{self.index(url):02d}"

    def url(self, url: str) -> str:
        return f"https://nhatot.com/moi-gioi-mau-{self.label(url)}"

    def person(self, url: str) -> str:
        return f"Môi giới {self.label(url)}"

    def shop(self, url: str) -> str:
        return f"Chuyên trang {self.label(url)}"

    def item(self, item: dict) -> dict:
        url = str(item.get("url", ""))
        out = dict(item)
        if "url" in out:
            out["url"] = self.url(url)
        if "shopName" in out:
            self._names[str(item["shopName"])] = self.shop(url)
            out["shopName"] = self.shop(url)
        if "personName" in out:
            self._names[str(item["personName"])] = self.person(url)
            out["personName"] = self.person(url)
        if "phone" in out:
            out["phone"] = PHONE_STAND_IN
        return out

    def batch(self, batch: dict) -> dict:
        return {**batch, "items": [self.item(item) for item in batch.get("items", [])]}

    def text(self, text: str) -> str:
        out = PROFILE_URL.sub(lambda found: self.url(found.group(0)), text)
        for real, stand_in in sorted(self._names.items(), key=lambda pair: -len(pair[0])):
            if real and stand_in:
                out = out.replace(real, stand_in)
        return PHONE.sub(PHONE_STAND_IN, out)


def redact_batch(batch: dict, redactor: Redactor | None = None) -> dict:
    return (redactor or Redactor()).batch(batch)


def redact_text(text: str, redactor: Redactor | None = None) -> str:
    return (redactor or Redactor()).text(text)


def _redact_file(path: Path, redactor: Redactor) -> str:
    raw = path.read_text(encoding="utf-8")
    if path.suffix == ".json":
        batch = redactor.batch(json.loads(raw))
        path.write_text(f"{json.dumps(batch, ensure_ascii=False, indent=2)}\n", encoding="utf-8")
        return f"{len(batch.get('items', []))} mục"
    done = redactor.text(raw)
    path.write_text(done, encoding="utf-8")
    return f"{len(PROFILE_URL.findall(raw))} địa chỉ hồ sơ"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="listing_crawl.redact")
    parser.add_argument("paths", nargs="+", type=Path)
    args = parser.parse_args(argv)

    redactor = Redactor()
    for path in args.paths:
        if not path.exists():
            print(f"khong co tep {path}", file=sys.stderr)
            return 2
        print(f"{path}: {_redact_file(path, redactor)}")

    print(f"tong: {redactor.count} danh tinh thay bang nhan gia")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
