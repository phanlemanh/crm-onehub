import json
import unittest
from dataclasses import dataclass
from pathlib import Path

from listing_crawl.__main__ import seed_urls, summary
from listing_crawl.seed import sample_across
from listing_crawl.tiers import tier_of


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
    MAC_DINH = {
        "profile_prefix": "/moi-gioi-",
        "sitemap": "https://vi-du/sitemap.xml",
        "directory": "https://vi-du/danh-ba",
        "directory_max_pages": 8,
        "directory_stop_after_empty": 3,
        "moi_trang": 10,
    }

    def setUp(self):
        self.SETTINGS = dict(self.MAC_DINH)
        self.da_doc = []
        self.lap = None
        self.nhan_doi = False
        self.hong = set()
        self.het_tu = None

    async def fetch(self, url, run, kind):
        self.da_doc.append(url)
        if kind == "so_do":
            return Trang(False, "")
        so_trang = int(url.rsplit("=", 1)[1])
        if so_trang in self.hong:
            return Trang(False, "")
        if self.het_tu is not None and so_trang >= self.het_tu:
            return Trang(True, "<html><body></body></html>")
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
        _ = await seed_urls(self.fetch, None, self.SETTINGS, 20)

        danh_ba = [url for url in self.da_doc if "danh-ba" in url]
        self.assertEqual(len(danh_ba), self.SETTINGS["directory_max_pages"])

    async def test_mau_cham_ca_trang_cuoi(self):
        lay, _ = await seed_urls(self.fetch, None, self.SETTINGS, 20)

        cuoi = self.SETTINGS["directory_max_pages"] * self.SETTINGS["moi_trang"]
        trang_cuoi = {f"/moi-gioi-{so}" for so in range(cuoi - 10, cuoi)}
        self.assertEqual(len(lay), 20)
        self.assertTrue(
            trang_cuoi & set(lay),
            "không địa chỉ nào của trang danh bạ cuối lọt vào mẫu",
        )

    async def test_mot_trang_lap_giua_chung_khong_cat_luot_doc(self):
        self.lap = 3

        lay, _ = await seed_urls(self.fetch, None, self.SETTINGS, 20)

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

        lay, _ = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(
            len(lay),
            len(set(lay)),
            "một người bị gieo hai lần vì thẻ trùng trong cùng một trang",
        )

    async def test_khong_tran_thi_tra_het(self):
        lay, _ = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(len(lay), 80)

    async def test_trang_hong_khong_tinh_vao_phep_dem_dung(self):
        self.hong = {3, 4, 5}
        self.SETTINGS["directory_max_pages"] = 8

        lay, suc_khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertIn(
            "/moi-gioi-70",
            lay,
            "chuỗi trang HỎNG đã cắt cụt lượt đọc — trang hỏng không được tính vào phép đếm dừng",
        )
        self.assertEqual(suc_khoe["trang_danh_ba_hong"], 3)
        self.assertEqual(suc_khoe["trang_danh_ba_doc"], 5)

    async def test_ba_trang_rong_lien_tiep_thi_dung(self):
        self.het_tu = 6
        self.SETTINGS["directory_max_pages"] = 40

        _, suc_khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(suc_khoe["trang_danh_ba_doc"], 8)
        self.assertFalse(
            suc_khoe["bi_tran_cat"], "danh bạ cạn thật thì cờ bị-trần-cắt phải TẮT"
        )

    async def test_trang_khong_the_nao_ngay_tu_dau_thi_tinh_la_hong(self):
        self.het_tu = 1
        self.SETTINGS["directory_max_pages"] = 5

        lay, suc_khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(lay, [])
        self.assertEqual(
            suc_khoe["trang_danh_ba_hong"],
            5,
            "không trang nào đọc được thẻ mà vẫn tính là trang rỗng — bộ chọn hỏng sẽ đi qua lặng lẽ",
        )
        self.assertEqual(suc_khoe["trang_danh_ba_doc"], 0)

    async def test_cham_tran_khi_danh_ba_con_thi_bat_co(self):
        self.SETTINGS["directory_max_pages"] = 4

        _, suc_khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertTrue(
            suc_khoe["bi_tran_cat"], "chạm trần khi danh bạ còn người mà cờ không bật"
        )
        self.assertEqual(suc_khoe["trang_danh_ba_doc"], 4)

    async def test_hai_luot_khac_nhau_cho_hai_bo_so_khac_nhau(self):
        self.SETTINGS["directory_max_pages"] = 8
        _, khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.setUp()
        self.hong = {2, 5}
        _, om = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertEqual(khoe["trang_danh_ba_hong"], 0)
        self.assertEqual(om["trang_danh_ba_hong"], 2)
        self.assertNotEqual(khoe["trang_danh_ba_doc"], om["trang_danh_ba_doc"])


class BanTongKet(unittest.TestCase):
    def test_bang_dem_muc_du_bon_khoa_va_tong_dung(self):
        items = [
            {"listingsTotal": t, "listingsNew30d": n, "tier": tier_of(n)}
            for t, n in ((100, 80), (50, 30), (10, 5), (3, 0))
        ]

        bang = summary(items, {"gieo": 4})["phan_bo_tang"]

        self.assertEqual(set(bang), {"cao", "vua", "thap", "ngu"})
        self.assertEqual(sum(bang.values()), len(items))
        self.assertEqual(bang["ngu"], 1)

    def test_muc_rong_van_co_khoa_voi_gia_tri_khong(self):
        items = [{"listingsTotal": 100, "listingsNew30d": 80, "tier": "cao"}]

        bang = summary(items, {"gieo": 1})["phan_bo_tang"]

        self.assertEqual(bang["ngu"], 0, "mức rỗng phải hiện là 0, không được vắng khoá")
        self.assertEqual(set(bang), {"cao", "vua", "thap", "ngu"})


class ChamDuocDuoiNguongVua(unittest.TestCase):
    def setUp(self):
        duong = Path(__file__).resolve().parent / "fixtures" / "phan-bo-danh-ba.json"
        self.tin = json.loads(duong.read_text(encoding="utf-8"))["tin_hien_co"]

    def test_mau_cham_toi_day_dai(self):
        mau = sample_across(self.tin, 200)

        self.assertEqual(
            min(mau),
            min(self.tin),
            "mẫu không chạm tới đáy dải — vẫn dồn về đầu bảng",
        )

    def test_mau_chua_nguoi_khong_the_la_cao_hay_vua(self):
        mau = sample_across(self.tin, 200)

        self.assertTrue(
            any(tin < 20 for tin in mau),
            "mẫu không chạm được ai dưới ngưỡng vừa",
        )

    def test_khuon_cat_dau_KHONG_cham_day(self):
        cat_dau = self.tin[:200]

        self.assertGreater(
            min(cat_dau),
            min(self.tin),
            "bộ dựng sẵn không phân biệt được hai khuôn — bài đối chứng vô nghĩa",
        )
