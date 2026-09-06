import argparse
import json
import sys
from pathlib import Path

from lxml import html as lxml_html

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from listing_crawl.parse import NEXT_DATA, SELECTORS, TOTAL_LABEL  # noqa: E402

FIXTURES = ROOT / "tests" / "fixtures"

FAKE_SHOP = ("Chuyên trang mẫu", "Chuyên trang mẫu hai")
FAKE_PERSON = ("Nguyễn Văn Mẫu", "Trần Thị Mẫu")
FAKE_SLUG = ("moi-gioi-mau-1", "moi-gioi-mau-2")
FAKE_ALIAS = ("aaaaaaaaaaaaaaa", "bbbbbbbbbbbbbbb")
FAKE_PHONE = ("0900000000", "0900000001")
FAKE_LICENSE = "HCM-0000000"
FAKE_ADDRESS = "Địa chỉ mẫu"

KEEP_AD_KEYS = (
    "account_id",
    "ad_id",
    "area_name",
    "bigCate",
    "category",
    "company_ad",
    "date",
    "list_id",
    "name",
    "region_name",
    "shop_alias",
    "subject",
    "type",
)


DROP_TAGS = ("svg", "img", "picture", "source", "noscript")
DROP_ATTRS = ("style", "src", "srcset", "sizes", "loading", "decoding")


def strip_media(node):
    for tag in DROP_TAGS:
        for found in node.iter(tag):
            parent = found.getparent()
            if parent is not None:
                parent.remove(found)
    for element in node.iter():
        for attribute in DROP_ATTRS:
            element.attrib.pop(attribute, None)
    return node


def node_html(node) -> str:
    return lxml_html.tostring(
        strip_media(node), encoding="unicode", pretty_print=True
    ).strip()


def keep_profile_nodes(tree) -> list[str]:
    kept: list[str] = []

    stats = tree.cssselect(SELECTORS["profile_stat"])
    if not stats:
        raise SystemExit("bản chụp không có ô thống kê — chụp lại trang hồ sơ")
    kept.extend(node_html(node) for node in stats)

    summaries = [
        node
        for node in tree.cssselect(SELECTORS["profile_summary"])
        if node.cssselect(SELECTORS["profile_summary_label"])
    ]
    if not any(TOTAL_LABEL in node.text_content() for node in summaries):
        raise SystemExit(f"bản chụp không có ô «{TOTAL_LABEL}» — chụp lại trang hồ sơ")
    kept.extend(node_html(node) for node in summaries)

    kept.extend(node_html(node) for node in tree.cssselect(SELECTORS["profile_license"]))
    kept.extend(node_html(node) for node in tree.cssselect(SELECTORS["profile_areas"]))

    return kept


def trim_ad(ad: dict) -> dict:
    info = ad.get("info")
    if not isinstance(info, dict):
        return {}
    return {"info": {key: info[key] for key in KEEP_AD_KEYS if key in info}}


def trim_next_data(payload: dict) -> dict:
    state = payload["props"]["initialState"]
    shop = state["shop"]["info"]
    ads = state["ads"]
    latest = ads.get("lastestAdInfo", {})

    return {
        "props": {
            "appProps": {"pathname": payload["props"]["appProps"]["pathname"]},
            "initialState": {
                "shop": {
                    "info": {
                        key: shop[key]
                        for key in (
                            "id",
                            "alias",
                            "name",
                            "contactName",
                            "address",
                            "workingAreasDisplay",
                            "workingAreas",
                            "urls",
                            "brokerLicense",
                            "phoneNumber",
                            "type",
                            "service_type",
                        )
                        if key in shop
                    }
                },
                "ads": {
                    "totalAdsCount": ads["totalAdsCount"],
                    "lastestAdInfo": {
                        "ads": [trim_ad(ad) for ad in latest.get("ads", [])[:2]],
                        "counting": latest.get("counting"),
                        "paging": latest.get("paging"),
                        "total": latest.get("total"),
                    },
                },
            },
        }
    }


def scrub_map(payload: dict, slot: int) -> dict[str, str]:
    shop = payload["props"]["initialState"]["shop"]["info"]
    swaps: dict[str, str] = {}

    def add(real, fake):
        if isinstance(real, str) and real.strip():
            swaps[real] = fake

    add(shop.get("name"), FAKE_SHOP[slot])
    add(shop.get("contactName"), FAKE_PERSON[slot])
    add(shop.get("address"), FAKE_ADDRESS)
    add(shop.get("alias"), FAKE_ALIAS[slot])
    add(shop.get("phoneNumber"), FAKE_PHONE[slot])
    add(shop.get("additionalPhone1"), FAKE_PHONE[slot])
    add(shop.get("additionalPhone2"), FAKE_PHONE[slot])

    license_block = shop.get("brokerLicense")
    if isinstance(license_block, dict):
        add(license_block.get("name"), FAKE_PERSON[slot])
        add(license_block.get("license_number"), FAKE_LICENSE)

    urls = shop.get("urls")
    if isinstance(urls, list):
        for entry in urls:
            if isinstance(entry, dict):
                add(entry.get("url"), FAKE_SLUG[slot].removeprefix("moi-gioi-"))

    for ad in payload["props"]["initialState"]["ads"]["lastestAdInfo"]["ads"]:
        info = ad.get("info", {})
        add(info.get("name"), FAKE_PERSON[slot])
        add(info.get("subject"), "Tin đăng mẫu")
        add(info.get("shop_alias"), FAKE_SLUG[slot].removeprefix("moi-gioi-"))

    return swaps


def scrub_payload(payload: dict, slot: int) -> None:
    shop = payload["props"]["initialState"]["shop"]["info"]
    slug = FAKE_SLUG[slot].removeprefix("moi-gioi-")

    def put(key, fake):
        if isinstance(shop.get(key), str) and shop[key].strip():
            shop[key] = fake

    put("name", FAKE_SHOP[slot])
    put("contactName", FAKE_PERSON[slot])
    put("address", FAKE_ADDRESS)
    put("alias", FAKE_ALIAS[slot])
    put("phoneNumber", FAKE_PHONE[slot])
    put("additionalPhone1", FAKE_PHONE[slot])
    put("additionalPhone2", FAKE_PHONE[slot])

    license_block = shop.get("brokerLicense")
    if isinstance(license_block, dict):
        if isinstance(license_block.get("name"), str):
            license_block["name"] = FAKE_PERSON[slot]
        if isinstance(license_block.get("license_number"), str):
            license_block["license_number"] = FAKE_LICENSE

    urls = shop.get("urls")
    if isinstance(urls, list):
        for entry in urls:
            if isinstance(entry, dict) and isinstance(entry.get("url"), str):
                entry["url"] = slug

    payload["props"]["appProps"]["pathname"] = f"/{FAKE_SLUG[slot]}"

    for ad in payload["props"]["initialState"]["ads"]["lastestAdInfo"]["ads"]:
        info = ad.get("info", {})
        for key, fake in (("name", FAKE_PERSON[slot]), ("subject", "Tin đăng mẫu"), ("shop_alias", slug)):
            if isinstance(info.get(key), str):
                info[key] = fake


def scrub(text: str, swaps: dict[str, str]) -> str:
    for real, fake in sorted(swaps.items(), key=lambda pair: -len(pair[0])):
        text = text.replace(real, fake)
    return text


def build_profile(capture: Path, slot: int) -> str:
    raw = capture.read_text(encoding="utf-8")
    found = NEXT_DATA.search(raw)
    if not found:
        raise SystemExit(f"{capture}: không có __NEXT_DATA__")

    payload = trim_next_data(json.loads(found.group(1)))
    swaps = scrub_map(payload, slot)
    scrub_payload(payload, slot)
    body = scrub("\n".join(keep_profile_nodes(lxml_html.fromstring(raw))), swaps)
    embedded = json.dumps(payload, ensure_ascii=False, indent=2)

    page = (
        '<!doctype html>\n<html lang="vi">\n<head><meta charset="utf-8"></head>\n<body>\n'
        f"{body}\n"
        f'<script id="__NEXT_DATA__" type="application/json">{embedded}</script>\n'
        "</body>\n</html>\n"
    )
    return page


def build_directory(capture: Path, cards: list[int]) -> str:
    tree = lxml_html.fromstring(capture.read_text(encoding="utf-8"))
    found = tree.cssselect(SELECTORS["directory_card"])
    if len(found) <= max(cards):
        raise SystemExit(f"{capture}: chỉ có {len(found)} thẻ danh bạ")
    kept = [found[index] for index in cards]

    for card in kept:
        for blurb in card.cssselect(SELECTORS["directory_blurb"]):
            blurb.text = "Lời giới thiệu mẫu."
            for child in list(blurb):
                blurb.remove(child)

    body = "\n".join(node_html(node) for node in kept)
    page = (
        '<!doctype html>\n<html lang="vi">\n<head><meta charset="utf-8"></head>\n<body>\n'
        f'<div class="list-wrapper">\n{body}\n</div>\n'
        "</body>\n</html>\n"
    )

    swaps: dict[str, str] = {}
    for slot, card in enumerate(kept):
        name = card.cssselect(SELECTORS["directory_name"])
        link = card.cssselect(SELECTORS["directory_link"])
        if name:
            swaps[name[0].text_content().strip()] = FAKE_SHOP[slot]
        if link:
            href = link[0].get("href") or ""
            swaps[href] = f"https://nhatot.com/{FAKE_SLUG[slot]}"

    return scrub(page, swaps)


def main() -> int:
    parser = argparse.ArgumentParser(prog="make_fixtures")
    parser.add_argument("--capture", type=Path, required=True)
    parser.add_argument("--directory", default="directory.html")
    parser.add_argument("--profiles", nargs=2, required=True)
    parser.add_argument("--cards", nargs=2, type=int, default=[0, 1])
    args = parser.parse_args()

    FIXTURES.mkdir(parents=True, exist_ok=True)
    (FIXTURES / "directory.html").write_text(
        build_directory(args.capture / args.directory, args.cards), encoding="utf-8"
    )
    for slot, name in enumerate(args.profiles):
        target = FIXTURES / ("profile.html" if slot == 0 else "profile-b.html")
        target.write_text(build_profile(args.capture / name, slot), encoding="utf-8")
        print(f"đã ghi {target}")
    print(f"đã ghi {FIXTURES / 'directory.html'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
