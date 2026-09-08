import json
import re
from typing import Any

from lxml import html as lxml_html

from listing_crawl.tiers import tier_of

PROFILE_URL_PREFIX = "https://nhatot.com/moi-gioi-"

SELECTORS = {
    "directory_card": "div.cwnfqzr",
    "directory_link": "div.absz92k a[href]",
    "directory_name": "div.absz92k a h2",
    "directory_license": "div.b1tg7f37",
    "directory_areas": "div.atx2bm7 span",
    "directory_total": "div.f1wbnxee div.r1b53g1 p",
    "profile_stat": "div.stat-item",
    "profile_stat_value": "span.stat-value",
    "profile_summary": "div.sqlk7f7",
    "profile_summary_label": "div.s2n0vny",
    "profile_summary_value": "div.sc6snot",
    "profile_license": "span.sfxtd9i",
    "profile_areas": "div.f1hs14pk",
    "directory_blurb": "div.a16wvwrq",
}

NEW_30D_LABEL = "Trong 30 ngày"
TOTAL_LABEL = "Tin hiện có"
LICENSE_LABEL = "Chứng chỉ môi giới"
AREAS_PREFIX = "Khu vực:"

DIGITS = re.compile(r"\d+")
AREAS_SHAPE = re.compile(r"^(?P<districts>[^()]+?)\s*(?:\((?P<city>[^()]+)\))?$")
NEXT_DATA = re.compile(
    r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>',
    re.DOTALL,
)


def _text(node) -> str:
    return re.sub(r"\s+", " ", node.text_content()).strip()


def _missing(field: str, where: str) -> ValueError:
    return ValueError(f"{field}: không bóc được từ {where}")


def _first_int(text: str, field: str, where: str) -> int:
    found = DIGITS.search(text.replace(".", "").replace(",", ""))
    if not found:
        raise _missing(field, where)
    return int(found.group())


def _split_areas(text: str, field: str, where: str) -> tuple[list[str], str | None]:
    body = text.removeprefix(AREAS_PREFIX).strip()
    shape = AREAS_SHAPE.match(body)
    if not shape:
        raise _missing(field, where)
    districts = [part.strip() for part in shape.group("districts").split(",") if part.strip()]
    if not districts:
        raise _missing(field, where)
    city = shape.group("city")
    return districts, city.strip() if city else None


def _dig(payload: Any, *path: str) -> Any:
    node = payload
    for key in path:
        if not isinstance(node, dict) or key not in node:
            return None
        node = node[key]
    return node


def next_data_of(html: str) -> dict:
    found = NEXT_DATA.search(html)
    if not found:
        raise ValueError("__NEXT_DATA__: không có trong trang hồ sơ")
    return json.loads(found.group(1))


def parse_directory(html: str) -> list[dict]:
    tree = lxml_html.fromstring(html)
    rows: list[dict] = []

    for card in tree.cssselect(SELECTORS["directory_card"]):
        link = card.cssselect(SELECTORS["directory_link"])
        if not link:
            raise _missing("url", "thẻ danh bạ")
        name = card.cssselect(SELECTORS["directory_name"])
        if not name:
            raise _missing("shopName", "thẻ danh bạ")
        total = card.cssselect(SELECTORS["directory_total"])
        if not total:
            raise _missing("listingsTotal", "thẻ danh bạ")
        areas = card.cssselect(SELECTORS["directory_areas"])
        if not areas:
            raise _missing("districts", "thẻ danh bạ")

        districts, city = _split_areas(_text(areas[0]), "districts", "thẻ danh bạ")
        rows.append(
            {
                "url": link[0].get("href"),
                "shopName": _text(name[0]),
                "districts": districts,
                "city": city,
                "listingsTotal": _first_int(_text(total[0]), "listingsTotal", "thẻ danh bạ"),
                "hasLicense": bool(card.cssselect(SELECTORS["directory_license"])),
            }
        )

    return rows


def directory_scan(html: str) -> tuple[list[str], int]:
    try:
        tree = lxml_html.fromstring(html)
    except Exception as error:
        raise ValueError(f"trang danh bạ không phân tích được: {error}") from error
    cards = tree.cssselect(SELECTORS["directory_card"])
    found: list[str] = []
    for card in cards:
        link = card.cssselect(SELECTORS["directory_link"])
        if link and link[0].get("href"):
            found.append(link[0].get("href"))
    return found, len(cards)


def directory_urls(html: str) -> list[str]:
    tree = lxml_html.fromstring(html)
    found: list[str] = []
    for card in tree.cssselect(SELECTORS["directory_card"]):
        link = card.cssselect(SELECTORS["directory_link"])
        if not link:
            continue
        href = link[0].get("href")
        if href:
            found.append(href)
    if not found:
        raise _missing("url", "trang danh bạ")
    return found


def _new_30d(tree) -> int:
    for stat in tree.cssselect(SELECTORS["profile_stat"]):
        if NEW_30D_LABEL not in _text(stat):
            continue
        value = stat.cssselect(SELECTORS["profile_stat_value"])
        if not value:
            raise _missing("listingsNew30d", "trang hồ sơ")
        return _first_int(_text(value[0]), "listingsNew30d", "trang hồ sơ")
    raise _missing("listingsNew30d", "trang hồ sơ")


def _shown_total(tree) -> int:
    for block in tree.cssselect(SELECTORS["profile_summary"]):
        label = block.cssselect(SELECTORS["profile_summary_label"])
        if not label or TOTAL_LABEL not in _text(label[0]):
            continue
        value = block.cssselect(SELECTORS["profile_summary_value"])
        if not value:
            raise _missing("listingsTotal", f"ô «{TOTAL_LABEL}» của trang hồ sơ")
        return _first_int(
            _text(value[0]), "listingsTotal", f"ô «{TOTAL_LABEL}» của trang hồ sơ"
        )
    raise _missing("listingsTotal", f"ô «{TOTAL_LABEL}» của trang hồ sơ")


def _total(tree, next_data: dict) -> int:
    shown = _shown_total(tree)
    embedded = _dig(next_data, "props", "initialState", "ads", "totalAdsCount")
    if not isinstance(embedded, int):
        raise _missing("listingsTotal", "dữ liệu nhúng")
    if embedded != shown:
        raise ValueError(
            f"listingsTotal: ô «{TOTAL_LABEL}» ghi {shown}, dữ liệu nhúng ghi {embedded}"
        )
    return shown


def _profile_url(shop: dict) -> str:
    urls = shop.get("urls")
    if isinstance(urls, list):
        for entry in urls:
            slug = entry.get("url") if isinstance(entry, dict) else None
            if isinstance(slug, str) and slug.strip():
                return f"{PROFILE_URL_PREFIX}{slug.strip()}"
    direct = _dig(shop, "urls", "shop")
    if isinstance(direct, str) and direct.strip():
        return direct.strip()
    raise _missing("url", "dữ liệu nhúng")


def parse_profile(html: str, next_data: dict) -> dict:
    tree = lxml_html.fromstring(html)
    shop = _dig(next_data, "props", "initialState", "shop", "info")
    if not isinstance(shop, dict):
        raise _missing("shopName", "dữ liệu nhúng")

    shop_name = shop.get("name")
    if not isinstance(shop_name, str) or not shop_name.strip():
        raise _missing("shopName", "dữ liệu nhúng")

    url = _profile_url(shop)

    license_name = _dig(shop, "brokerLicense", "name")
    has_license = bool(
        (isinstance(license_name, str) and license_name.strip())
        or any(LICENSE_LABEL in _text(node) for node in tree.cssselect(SELECTORS["profile_license"]))
    )

    working_areas = shop.get("workingAreas")
    districts: list[str] = []
    city: str | None = None
    if isinstance(working_areas, list) and working_areas:
        for area in working_areas:
            area_name = area.get("areaName") if isinstance(area, dict) else None
            if isinstance(area_name, str) and area_name.strip():
                districts.append(area_name.strip())
            region = area.get("regionName") if isinstance(area, dict) else None
            if city is None and isinstance(region, str) and region.strip():
                city = region.strip()
    if not districts:
        areas_node = tree.cssselect(SELECTORS["profile_areas"])
        if not areas_node:
            raise _missing("districts", "trang hồ sơ")
        districts, city = _split_areas(_text(areas_node[0]), "districts", "trang hồ sơ")

    ads = _dig(next_data, "props", "initialState", "ads", "lastestAdInfo", "ads")
    company_flags = [
        _dig(ad, "info", "company_ad")
        for ad in ads or []
        if isinstance(_dig(ad, "info", "company_ad"), bool)
    ]
    if not company_flags:
        raise _missing("isCompany", "dữ liệu nhúng")

    total = _total(tree, next_data)
    new_30d = _new_30d(tree)

    item: dict = {
        "url": url,
        "shopName": shop_name.strip(),
        "isCompany": any(company_flags),
        "hasLicense": has_license,
        "districts": districts,
        "city": city,
        "listingsTotal": total,
        "listingsNew30d": new_30d,
        "tier": tier_of(new_30d),
    }

    if isinstance(license_name, str) and license_name.strip():
        item["personName"] = license_name.strip()

    phone = shop.get("phoneNumber")
    if isinstance(phone, str) and phone.strip():
        item["phone"] = phone.strip()

    return item
