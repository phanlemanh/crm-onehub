import argparse
import asyncio
import logging
import os
import re
import sys
from pathlib import Path
from statistics import quantiles

from listing_crawl.emit import build_batch, post_batch, validate_batch, write_batch
from listing_crawl.parse import directory_urls, next_data_of, parse_profile
from listing_crawl.tiers import config

LOGGER = logging.getLogger("listing_crawl")

FIXTURES = Path(__file__).resolve().parent.parent / "tests" / "fixtures"
PROFILE_FIXTURES = ("profile.html", "profile-b.html")

SITEMAP_LOC = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>")

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


def spread(values: list[int]) -> dict[str, int]:
    if not values:
        return {}
    ordered = sorted(values)
    if len(ordered) < 4:
        return {"min": ordered[0], "max": ordered[-1]}
    q1, q2, q3 = (round(part) for part in quantiles(ordered, n=4))
    return {"min": ordered[0], "q1": q1, "trung_vi": q2, "q3": q3, "max": ordered[-1]}


def new_ledger() -> dict[str, int]:
    return {
        "lan_thu": 0,
        "lan_thu_hong": 0,
        "lan_thu_so_do": 0,
        "lan_thu_danh_ba": 0,
        "lan_thu_ho_so": 0,
        "lan_thu_lo_so": 0,
    }


def fixture_run(limit: int | None) -> tuple[list[dict], dict]:
    names = list(PROFILE_FIXTURES)
    if limit is not None:
        names = names[:limit]

    ledger = new_ledger()
    items: list[dict] = []
    blocked = 0
    for name in names:
        ledger["lan_thu"] += 1
        ledger["lan_thu_ho_so"] += 1
        html = (FIXTURES / name).read_text(encoding="utf-8")
        try:
            items.append(parse_profile(html, next_data_of(html)))
        except ValueError as error:
            blocked += 1
            ledger["lan_thu_hong"] += 1
            LOGGER.warning("bỏ qua %s: %s", name, error)

    return items, {"gieo": len(names), "lay_duoc": len(items), "bi_chan": blocked, **ledger}


def paced_fetch(crawler, delay: float, ledger: dict[str, int]):
    seen_one = False

    async def fetch(url: str, run, kind: str):
        nonlocal seen_one
        if seen_one:
            await asyncio.sleep(delay)
        seen_one = True
        ledger["lan_thu"] += 1
        ledger[f"lan_thu_{kind}"] += 1
        result = await crawler.arun(url=url, config=run)
        if not result.success or not result.html:
            ledger["lan_thu_hong"] += 1
        return result

    return fetch


async def live_run(limit: int | None) -> tuple[list[dict], dict]:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

    settings = config()["crawl"]
    delay = float(settings["request_delay_seconds"])
    ledger = new_ledger()
    run = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        check_robots_txt=bool(settings["respect_robots"]),
        page_timeout=60_000,
        delay_before_return_html=float(settings["render_wait_seconds"]),
    )
    browser = BrowserConfig(headless=True, enable_stealth=bool(settings["stealth"]))

    async with AsyncWebCrawler(config=browser) as crawler:
        fetch = paced_fetch(crawler, delay, ledger)
        seeds = await seed_urls(fetch, run, settings, limit)
        if not seeds:
            return [], {"gieo": 0, "lay_duoc": 0, "bi_chan": 0, **ledger}

        items: list[dict] = []
        blocked = 0
        for url in seeds:
            result = await fetch(url, run, "ho_so")
            if not result.success or not result.html:
                blocked += 1
                LOGGER.warning("bỏ qua %s: %s", url, result.error_message)
                continue
            try:
                items.append(parse_profile(result.html, next_data_of(result.html)))
            except ValueError as error:
                blocked += 1
                LOGGER.warning("bỏ qua %s: %s", url, error)

        await reveal_phones(fetch, run, items, int(settings["phone_reveal_cap"]))
        return items, {
            "gieo": len(seeds),
            "lay_duoc": len(items),
            "bi_chan": blocked,
            **ledger,
        }


async def seed_urls(fetch, run, settings: dict, limit: int | None) -> list[str]:
    prefix = settings["profile_prefix"]
    found: list[str] = []
    seen: set[str] = set()

    index = await fetch(settings["sitemap"], run, "so_do")
    children = SITEMAP_LOC.findall(index.html or "") if index.success else []
    for child in children:
        if limit is not None and len(found) >= limit:
            break
        page = await fetch(child, run, "so_do")
        if not page.success:
            continue
        for url in SITEMAP_LOC.findall(page.html or ""):
            if prefix in url and url not in seen:
                seen.add(url)
                found.append(url)

    if found:
        return found[:limit] if limit is not None else found

    LOGGER.warning(
        "sơ đồ site không có địa chỉ %s — gieo từ trang danh bạ %s",
        prefix,
        settings["directory"],
    )

    for number in range(1, int(settings["directory_max_pages"]) + 1):
        if limit is not None and len(found) >= limit:
            break
        page = await fetch(f"{settings['directory']}?page={number}", run, "danh_ba")
        if not page.success or not page.html:
            LOGGER.warning("trang danh bạ %s không tải được", number)
            continue
        try:
            urls = directory_urls(page.html)
        except ValueError as error:
            LOGGER.warning("trang danh bạ %s: %s", number, error)
            continue
        fresh = [url for url in urls if url not in seen]
        if not fresh:
            break
        for url in fresh:
            seen.add(url)
            found.append(url)

    return found[:limit] if limit is not None else found


async def reveal_phones(fetch, run, items: list[dict], cap: int) -> None:
    targets = [item for item in items if item["tier"] == "cao" and "phone" not in item][:cap]
    if not targets:
        return
    reveal = run.clone(js_code=PHONE_REVEAL_JS)
    for item in targets:
        result = await fetch(item["url"], reveal, "lo_so")
        if not result.success or not result.html:
            continue
        try:
            revealed = parse_profile(result.html, next_data_of(result.html))
        except ValueError:
            continue
        if "phone" in revealed:
            item["phone"] = revealed["phone"]


def summary(items: list[dict], counts: dict) -> dict:
    same = sum(1 for item in items if item["listingsTotal"] == item["listingsNew30d"])
    return {
        **counts,
        "co_so_dien_thoai": sum(1 for item in items if "phone" in item),
        "tong_bang_tin_moi": same,
        "tong_khac_tin_moi": len(items) - same,
        "tin_dang": spread([item["listingsTotal"] for item in items]),
        "tin_moi_30_ngay": spread([item["listingsNew30d"] for item in items]),
    }


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
        LOGGER.error("không có địa chỉ nào — %s", counts)
        return EXIT_NO_SEED

    report = summary(items, counts)
    LOGGER.info("lượt chạy: %s", report)
    if report["tong_bang_tin_moi"]:
        LOGGER.warning(
            "%s/%s hồ sơ có tổng tin bằng tin mới 30 ngày — sàn chỉ công bố một con số",
            report["tong_bang_tin_moi"],
            len(items),
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
