import json
import unittest
from pathlib import Path

from listing_crawl.parse import parse_directory, parse_profile

FIXTURES = Path(__file__).parent / "fixtures"


class ParseProfile(unittest.TestCase):
    def setUp(self):
        self.html = (FIXTURES / "profile.html").read_text(encoding="utf-8")
        self.next_data = json.loads(
            (FIXTURES / "profile-next-data.json").read_text(encoding="utf-8")
        )

    def test_boc_dung_tam_gia_tri(self):
        item = parse_profile(self.html, self.next_data)

        self.assertEqual(item["shopName"], "Chuyên trang mẫu")
        self.assertEqual(item["personName"], "Nguyễn Văn Mẫu")
        self.assertEqual(item["listingsNew30d"], 164)
        self.assertEqual(item["districts"], ["Quận 7", "Huyện Nhà Bè"])
        self.assertTrue(item["hasLicense"])
        self.assertFalse(item["isCompany"])
        self.assertEqual(item["tier"], "cao")

    def test_mau_bi_pha_thi_bao_loi_goi_ten_truong(self):
        broken = self.html.replace("164", "").replace("tin mới", "")

        with self.assertRaises(ValueError) as raised:
            parse_profile(broken, self.next_data)

        self.assertIn("listingsNew30d", str(raised.exception))


class ParseDirectory(unittest.TestCase):
    def test_boc_tong_tin_tu_the(self):
        html = (FIXTURES / "directory.html").read_text(encoding="utf-8")
        rows = parse_directory(html)

        self.assertGreaterEqual(len(rows), 1)
        self.assertEqual(rows[0]["listingsTotal"], 436)
