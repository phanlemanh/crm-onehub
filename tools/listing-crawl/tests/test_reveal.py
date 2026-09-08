import unittest
from dataclasses import dataclass

from listing_crawl.__main__ import reveal_phones

BON_MUC = ("cao", "vua", "thap", "ngu")


@dataclass
class Trang:
    success: bool
    html: str


class Run:
    def clone(self, **_):
        return self


def ho_so(so: int, tang: str) -> dict:
    return {"url": f"/moi-gioi-{so}", "tier": tang}


class LoSoTheoTang(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.da_goi = []

    async def fetch(self, url, run, kind):
        self.da_goi.append(url)
        return Trang(False, "")

    async def test_du_bon_muc_thi_ca_bon_muc_duoc_lo(self):
        items = [ho_so(i, tang) for i, tang in enumerate(BON_MUC)]

        await reveal_phones(self.fetch, Run(), items, 200, BON_MUC)

        self.assertEqual(len(self.da_goi), 4)

    async def test_chi_muc_cao_thi_dung_mot_ho_so(self):
        items = [ho_so(i, tang) for i, tang in enumerate(BON_MUC)]

        await reveal_phones(self.fetch, Run(), items, 200, ("cao",))

        self.assertEqual(self.da_goi, ["/moi-gioi-0"])

    async def test_vuot_tran_thi_cat_dung_tran_va_khong_bo_muc_thap(self):
        items = [ho_so(i, "cao") for i in range(200)]
        items += [ho_so(200 + i, "thap") for i in range(100)]
        items += [ho_so(300 + i, "ngu") for i in range(100)]

        await reveal_phones(self.fetch, Run(), items, 200, BON_MUC)

        duoi = [u for u in self.da_goi if int(u.rsplit("-", 1)[1]) >= 200]
        self.assertEqual(len(self.da_goi), 200)
        self.assertGreater(
            len(duoi),
            0,
            "lấy phần đầu lô — không hồ sơ mức thấp hay ngủ nào được lộ số",
        )

    async def test_ho_so_da_co_so_thi_khong_goi_lai(self):
        items = [ho_so(0, "cao"), ho_so(1, "cao")]
        items[0]["phone"] = "0900000000"

        await reveal_phones(self.fetch, Run(), items, 200, BON_MUC)

        self.assertEqual(self.da_goi, ["/moi-gioi-1"])

    async def test_tran_khong_duong_thi_khong_goi_lan_nao(self):
        items = [ho_so(i, "cao") for i in range(5)]

        await reveal_phones(self.fetch, Run(), items, 0, BON_MUC)

        self.assertEqual(self.da_goi, [])
