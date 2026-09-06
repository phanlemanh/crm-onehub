import unittest
from pathlib import Path

from listing_crawl.parse import (
    next_data_of,
    parse_directory,
    parse_profile,
)

FIXTURES = Path(__file__).parent / "fixtures"

KNOWN = {
    "profile.html": {
        "url": "https://nhatot.com/moi-gioi-mau-1",
        "shopName": "Chuyên trang mẫu",
        "isCompany": True,
        "hasLicense": False,
        "districts": ["Quận 12", "Quận Gò Vấp", "Quận Tân Bình"],
        "city": "Tp Hồ Chí Minh",
        "listingsTotal": 436,
        "listingsNew30d": 436,
        "tier": "cao",
        "phone": "0900000000",
    },
    "profile-b.html": {
        "url": "https://nhatot.com/moi-gioi-mau-2",
        "shopName": "Chuyên trang mẫu hai",
        "isCompany": True,
        "hasLicense": True,
        "districts": ["Quận 7", "Huyện Nhà Bè"],
        "city": "Tp Hồ Chí Minh",
        "listingsTotal": 164,
        "listingsNew30d": 164,
        "tier": "cao",
        "personName": "Trần Thị Mẫu",
        "phone": "0900000001",
    },
}


def read(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


def parse(name: str) -> dict:
    html = read(name)
    return parse_profile(html, next_data_of(html))


class RoundTripTuBanChup(unittest.TestCase):
    def test_moi_mau_ra_dung_gia_tri_da_biet(self):
        for name, expected in KNOWN.items():
            with self.subTest(mau=name):
                self.assertEqual(parse(name), expected)

    def test_hai_mau_khac_nhau_o_ca_hai_con_so(self):
        first = parse("profile.html")
        second = parse("profile-b.html")

        self.assertNotEqual(first["listingsTotal"], second["listingsTotal"])
        self.assertNotEqual(first["listingsNew30d"], second["listingsNew30d"])

    def test_the_danh_ba_va_trang_ho_so_bao_cung_mot_tong_tin(self):
        rows = {row["url"]: row for row in parse_directory(read("directory.html"))}

        for name in KNOWN:
            with self.subTest(mau=name):
                item = parse(name)
                self.assertEqual(rows[item["url"]]["listingsTotal"], item["listingsTotal"])

    def test_nhatot_chi_cong_bo_mot_con_so_cho_ca_hai_truong(self):
        for name in KNOWN:
            with self.subTest(mau=name):
                item = parse(name)
                self.assertEqual(
                    item["listingsTotal"],
                    item["listingsNew30d"],
                    "sàn đã tách hai con số — đọc lại giới hạn đã khai ở README",
                )

    def test_dia_chi_ho_so_lay_tu_duong_dan_that_khong_phai_alias(self):
        shop = next_data_of(read("profile.html"))["props"]["initialState"]["shop"]["info"]

        self.assertNotEqual(shop["alias"], shop["urls"][0]["url"])
        self.assertEqual(parse("profile.html")["url"], "https://nhatot.com/moi-gioi-mau-1")
        self.assertNotIn(shop["alias"], parse("profile.html")["url"])


class MauBiPha(unittest.TestCase):
    def broken(self, name: str, old: str, new: str) -> str:
        html = read(name)
        self.assertIn(old, html)
        return html.replace(old, new)

    def test_xoa_so_tin_moi_thi_bao_loi_goi_ten_truong(self):
        html = self.broken("profile.html", "436<!-- --> tin mới", " tin mới")

        with self.assertRaises(ValueError) as raised:
            parse_profile(html, next_data_of(html))

        self.assertIn("listingsNew30d", str(raised.exception))

    def test_xoa_o_tin_hien_co_thi_bao_loi_goi_ten_truong(self):
        html = self.broken("profile.html", ">Tin hiện có<", ">Tin<")

        with self.assertRaises(ValueError) as raised:
            parse_profile(html, next_data_of(html))

        self.assertIn("listingsTotal", str(raised.exception))
        self.assertIn("Tin hiện có", str(raised.exception))

    def test_tong_tin_tren_man_lech_du_lieu_nhung_thi_bao_loi_neu_ca_hai_so(self):
        html = self.broken("profile.html", ">436 tin<", ">999 tin<")

        with self.assertRaises(ValueError) as raised:
            parse_profile(html, next_data_of(html))

        self.assertEqual(
            str(raised.exception),
            "listingsTotal: ô «Tin hiện có» ghi 999, dữ liệu nhúng ghi 436",
        )

    def test_mat_duong_dan_that_thi_bao_loi_goi_ten_truong(self):
        html = self.broken("profile.html", '"url": "mau-1"', '"url": ""')

        with self.assertRaises(ValueError) as raised:
            parse_profile(html, next_data_of(html))

        self.assertIn("url", str(raised.exception))
        self.assertIn("dữ liệu nhúng", str(raised.exception))


class ParseDirectory(unittest.TestCase):
    def test_boc_tong_tin_va_chung_chi_tu_the(self):
        rows = parse_directory(read("directory.html"))

        self.assertEqual(
            [(row["url"], row["listingsTotal"], row["hasLicense"]) for row in rows],
            [
                ("https://nhatot.com/moi-gioi-mau-1", 436, False),
                ("https://nhatot.com/moi-gioi-mau-2", 164, True),
            ],
        )

    def test_the_mat_so_tin_thi_bao_loi_goi_ten_truong(self):
        html = read("directory.html").replace("Xem 436 tin đăng", "Xem tin đăng")

        with self.assertRaises(ValueError) as raised:
            parse_directory(html)

        self.assertIn("listingsTotal", str(raised.exception))
