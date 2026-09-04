import argparse
import asyncio
import json
import logging
import os
import re
import sys
from pathlib import Path
from statistics import quantiles

from listing_crawl.emit import build_batch, post_batch, validate_batch, write_batch
from listing_crawl.parse import parse_directory, parse_profile
from listing_crawl.tiers import config

LOGGER = logging.getLogger("listing_crawl")

FIXTURES = Path(__file__).resolve().parent.parent / "tests" / "fixtures"

SITEMAP_LOC = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>")
NEXT_DATA = re.compile(
    r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',
    re.DOTALL,
)

PHONE_REVEAL_JS = """
const button = [...document.querySelectorAll('button, a')]
  .find((node) => /Gọi|Liên hệ ngay/i.test(node.textContent || ''));
if (button) { button.click(); await new Promise((done) => setTimeout(done, 1500)); }
"""

EXIT_NO_SEED = 2


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="listing_crawl")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--fixtures", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--out", type=Path, default=None)
    parser.add_argument("--log", type=Path, default=None)
    return parser.parse_args(argv)


def setup_logging(target: Path | None) -> None:
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stderr)]
    if target:
        target.parent.mkdir(parents=True, exist_ok=True)
        handlers.append(logging.FileHandler(target, encoding="utf-8"))
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        handlers=handlers,
        force=True,
    )


def next_data_of(html: str) -> dict:
    found = NEXT_DATA.search(html)
    if not found:
        raise ValueError("__NEXT_DATA__: không có trong trang hồ sơ")
    return json.loads(found.group(1))


def spread(values: list[int]) -> dict[str, int]:
    if not values:
        return {}
    ordered = sorted(values)
    if len(ordered) < 4:
        return {"min": ordered[0], "max": ordered[-1]}
    q1, q2, q3 = (round(part) for part in quantiles(ordered, n=4))
    return {"min": ordered[0], "q1": q1, "trung_vi": q2, "q3": q3, "max": ordered[-1]}


def fixture_run(limit: int | None) -> tuple[list[dict], dict]:
    directory = parse_directory((FIXTURES / "directory.html").read_text(encoding="utf-8"))
    seeds = [row["url"] for row in directory]
    if limit is not None:
        seeds = seeds[:limit]

    html = (FIXTURES / "profile.html").read_text(encoding="utf-8")
    next_data = json.loads((FIXTURES / "profile-next-data.json").read_text(encoding="utf-8"))

    items: list[dict] = []
    blocked = 0
    for url in seeds:
        item = parse_profile(html, next_data)
        item["url"] = url
        items.append(item)

    return items, {"gieo": len(seeds), "lay_duoc": len(items), "bi_chan": blocked}


async def live_run(limit: int | None) -> tuple[list[dict], dict]:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

    settings = config()["crawl"]
    delay = float(settings["request_delay_seconds"])
    run = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        check_robots_txt=bool(settings["respect_robots"]),
        mean_delay=delay,
        page_timeout=60_000,
    )

    async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as crawler:
        seeds = await seed_urls(crawler, run, settings, limit)
        if not seeds:
            return [], {"gieo": 0, "lay_duoc": 0, "bi_chan": 0}

        items: list[dict] = []
        blocked = 0
        for url in seeds:
            result = await crawler.arun(url=url, config=run)
            if not result.success or not result.html:
                blocked += 1
                LOGGER.warning("bỏ qua %s: %s", url, result.error_message)
                continue
            try:
                items.append(parse_profile(result.html, next_data_of(result.html)))
            except ValueError as error:
                blocked += 1
                LOGGER.warning("bỏ qua %s: %s", url, error)

        await reveal_phones(crawler, run, items, int(settings["phone_reveal_cap"]))
        return items, {"gieo": len(seeds), "lay_duoc": len(items), "bi_chan": blocked}


async def seed_urls(crawler, run, settings: dict, limit: int | None) -> list[str]:
    prefix = settings["profile_prefix"]
    found: list[str] = []
    seen: set[str] = set()

    index = await crawler.arun(url=settings["sitemap"], config=run)
    children = SITEMAP_LOC.findall(index.html or "") if index.success else []
    for child in children:
        if limit is not None and len(found) >= limit:
            break
        page = await crawler.arun(url=child, config=run)
        if not page.success:
            continue
        for url in SITEMAP_LOC.findall(page.html or ""):
            if prefix in url and url not in seen:
                seen.add(url)
                found.append(url)

    if not found:
        LOGGER.warning(
            "sơ đồ site không có địa chỉ %s — gieo từ trang danh bạ %s",
            prefix,
            settings["directory"],
        )
        page = await crawler.arun(url=settings["directory"], config=run)
        if page.success and page.html:
            for row in parse_directory(page.html):
                if row["url"] not in seen:
                    seen.add(row["url"])
                    found.append(row["url"])

    return found[:limit] if limit is not None else found


async def reveal_phones(crawler, run, items: list[dict], cap: int) -> None:
    targets = [item for item in items if item["tier"] == "cao" and "phone" not in item][:cap]
    if not targets:
        return
    reveal = run.clone(js_code=PHONE_REVEAL_JS)
    for item in targets:
        result = await crawler.arun(url=item["url"], config=reveal)
        if not result.success or not result.html:
            continue
        try:
            revealed = parse_profile(result.html, next_data_of(result.html))
        except ValueError:
            continue
        if "phone" in revealed:
            item["phone"] = revealed["phone"]


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    setup_logging(args.log)

    if args.limit is not None and args.limit <= 0:
        LOGGER.error("không có địa chỉ nào")
        return EXIT_NO_SEED

    if args.fixtures:
        items, counts = fixture_run(args.limit)
    else:
        items, counts = asyncio.run(live_run(args.limit))

    if not items:
        LOGGER.error("không có địa chỉ nào")
        return EXIT_NO_SEED

    LOGGER.info(
        "lượt chạy: %s",
        {
            **counts,
            "co_so_dien_thoai": sum(1 for item in items if "phone" in item),
            "tin_moi_30_ngay": spread([item["listingsNew30d"] for item in items]),
        },
    )

    batch = build_batch(items)
    validate_batch(batch)

    if args.dry_run or args.out:
        target = write_batch(batch, args.out or Path("batch.json"))
        LOGGER.info("đã ghi %s (%s mục)", target, len(items))
        return 0

    secret = os.environ.get("LISTING_INGEST_SECRET")
    if not secret:
        LOGGER.error("LISTING_INGEST_SECRET vắng — không gửi được lô")
        return 1

    status = post_batch(batch, config()["ingest"]["url"], secret)
    LOGGER.info("cổng tiếp nhận trả %s (%s mục)", status, len(items))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
