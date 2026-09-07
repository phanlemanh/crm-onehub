import unittest
from dataclasses import dataclass

from listing_crawl.__main__ import seed_urls
from listing_crawl.seed import sample_across


@dataclass
class Trang:
    success: bool
    html: str


class RaiDeu(unittest.TestCase):
    def test_mau_trai_khap_dai(self):
        urls = [f"/moi-gioi-{number}" for number in range(200)]

        lay = sample_across(urls, 20)

        cuoi_dai = urls[150:]
        self.assertTrue(
            any(url in cuoi_dai for url in lay),
            "mẫu không chạm phần tư cuối dải — vẫn đang cắt đầu bảng",
        )

    def test_it_hon_tran_thi_tra_nguyen(self):
        urls = ["/a", "/b", "/c", "/d", "/e"]

        self.assertEqual(sample_across(urls, 20), urls)

    def test_bang_dung_tran_thi_tra_nguyen(self):
        urls = ["/a", "/b", "/c"]

        self.assertEqual(sample_across(urls, 3), urls)

    def test_dung_so_luong_khong_lap(self):
        for tong, tran in ((200, 20), (97, 30), (11, 10), (1000, 1)):
            with self.subTest(tong=tong, tran=tran):
                urls = [f"/moi-gioi-{number}" for number in range(tong)]

                lay = sample_across(urls, tran)

                self.assertEqual(len(lay), tran)
                self.assertEqual(len(set(lay)), tran)

    def test_hai_luot_cho_cung_ket_qua(self):
        urls = [f"/moi-gioi-{number}" for number in range(200)]

        self.assertEqual(sample_across(urls, 20), sample_across(urls, 20))

    def test_khong_tran_thi_tra_het(self):
        urls = [f"/moi-gioi-{number}" for number in range(200)]

        self.assertEqual(sample_across(urls, None), urls)

    def test_dai_rong_thi_tra_rong(self):
        self.assertEqual(sample_across([], 20), [])


class GieoTuDanhBa(unittest.IsolatedAsyncioTestCase):
    SETTINGS = {
        "profile_prefix": "/moi-gioi-",
        "sitemap": "https://vi-du/sitemap.xml",
        "directory": "https://vi-du/danh-ba",
        "directory_max_pages": 8,
        "moi_trang": 10,
    }

    def setUp(self):
        self.da_doc = []

    async def fetch(self, url, run, kind):
        self.da_doc.append(url)
        if kind == "so_do":
            return Trang(False, "")
        so_trang = int(url.rsplit("=", 1)[1])
        dau = (so_trang - 1) * self.SETTINGS["moi_trang"]
        the = "".join(
            f'<div class="cwnfqzr"><div class="absz92k">'
            f'<a href="/moi-gioi-{dau + thu}"><h2>x</h2></a></div></div>'
            for thu in range(self.SETTINGS["moi_trang"])
        )
        return Trang(True, f"<html><body>{the}</body></html>")

    async def test_doc_het_tran_trang_khong_dung_som(self):
        await seed_urls(self.fetch, None, self.SETTINGS, 20)

        danh_ba = [url for url in self.da_doc if "danh-ba" in url]
        self.assertEqual(len(danh_ba), self.SETTINGS["directory_max_pages"])

    async def test_mau_cham_ca_trang_cuoi(self):
        lay = await seed_urls(self.fetch, None, self.SETTINGS, 20)

        cuoi = self.SETTINGS["directory_max_pages"] * self.SETTINGS["moi_trang"]
        trang_cuoi = {f"/moi-gioi-{so}" for so in range(cuoi - 10, cuoi)}
        self.assertEqual(len(lay), 20)
        self.assertTrue(
            trang_cuoi & set(lay),
            "không địa chỉ nào của trang danh bạ cuối lọt vào mẫu",
        )

    async def test_khong_tran_thi_tra_het(self):
        lay = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(len(lay), 80)
