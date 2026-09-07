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

    def test_moi_phan_tu_dai_deu_gop_mau(self):
        urls = [f"/moi-gioi-{number}" for number in range(200)]

        lay = set(sample_across(urls, 20))

        for thu in range(4):
            phan = set(urls[thu * 50 : (thu + 1) * 50])
            self.assertEqual(
                len(phan & lay),
                5,
                f"phần tư thứ {thu + 1} của dải không góp đúng 5 địa chỉ — mẫu dồn về một phía",
            )

    def test_khoang_cach_giua_hai_mau_lien_nhau_khong_lech_qua_mot(self):
        urls = [f"/moi-gioi-{number}" for number in range(97)]

        lay = sample_across(urls, 30)
        cho = [urls.index(url) for url in lay]
        buoc = [sau - truoc for truoc, sau in zip(cho, cho[1:])]

        self.assertLessEqual(
            max(buoc) - min(buoc),
            1,
            f"bước rải không đều: {sorted(set(buoc))}",
        )

    def test_tran_khong_duong_thi_bao_loi_chu_khong_no(self):
        urls = ["/a", "/b", "/c"]

        for tran in (0, -1):
            with self.subTest(tran=tran):
                with self.assertRaises(ValueError):
                    sample_across(urls, tran)

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
        self.lap = None
        self.nhan_doi = False

    async def fetch(self, url, run, kind):
        self.da_doc.append(url)
        if kind == "so_do":
            return Trang(False, "")
        so_trang = int(url.rsplit("=", 1)[1])
        if self.lap is not None and so_trang == self.lap:
            so_trang -= 1
        dau = (so_trang - 1) * self.SETTINGS["moi_trang"]
        thu_tu = list(range(self.SETTINGS["moi_trang"]))
        if self.nhan_doi:
            thu_tu = [thu // 2 for thu in thu_tu]
        the = "".join(
            f'<div class="cwnfqzr"><div class="absz92k">'
            f'<a href="/moi-gioi-{dau + thu}"><h2>x</h2></a></div></div>'
            for thu in thu_tu
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

    async def test_mot_trang_lap_giua_chung_khong_cat_luot_doc(self):
        self.lap = 3

        lay = await seed_urls(self.fetch, None, self.SETTINGS, 20)

        danh_ba = [url for url in self.da_doc if "danh-ba" in url]
        self.assertEqual(
            len(danh_ba),
            self.SETTINGS["directory_max_pages"],
            "một trang danh bạ lặp lại giữa chừng đã cắt cụt lượt đọc",
        )
        cuoi = self.SETTINGS["directory_max_pages"] * self.SETTINGS["moi_trang"]
        trang_cuoi = {f"/moi-gioi-{so}" for so in range(cuoi - 10, cuoi)}
        self.assertTrue(trang_cuoi & set(lay))

    async def test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan(self):
        self.nhan_doi = True

        lay = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(
            len(lay),
            len(set(lay)),
            "một người bị gieo hai lần vì thẻ trùng trong cùng một trang",
        )

    async def test_khong_tran_thi_tra_het(self):
        lay = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(len(lay), 80)
