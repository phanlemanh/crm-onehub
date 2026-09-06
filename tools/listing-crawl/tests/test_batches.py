import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from listing_crawl import __main__ as entry
from listing_crawl.emit import (
    PostFailed,
    build_batch,
    payload_of,
    schema_max_items,
    split_items,
)

BODY_LIMIT = 2 * 1024 * 1024


def item(n: int, districts: int = 3) -> dict:
    return {
        "url": f"https://nhatot.com/moi-gioi-mau-{n}",
        "shopName": f"Chuyên trang mẫu {n}",
        "personName": f"Môi giới mẫu {n}",
        "isCompany": False,
        "hasLicense": True,
        "districts": [f"Quận {index}" for index in range(districts)],
        "city": "Tp Hồ Chí Minh",
        "listingsTotal": 100 + n,
        "listingsNew30d": 100 + n,
        "tier": "cao",
        "phone": "0900000000",
    }


class ChiaLo(unittest.TestCase):
    def test_batch_size_nho_ra_dung_so_lo(self):
        chunks = split_items([item(n) for n in range(450)], 100, BODY_LIMIT)

        self.assertEqual([len(chunk) for chunk in chunks], [100, 100, 100, 100, 50])
        for chunk in chunks:
            self.assertLessEqual(len(chunk), 100)

    def test_tran_lo_khong_vuot_tran_luoc_do(self):
        chunks = split_items([item(n) for n in range(1200)], 5000, BODY_LIMIT)

        self.assertEqual(schema_max_items(), 500)
        self.assertEqual([len(chunk) for chunk in chunks], [500, 500, 200])
        for chunk in chunks:
            self.assertLessEqual(len(chunk), schema_max_items())

    def test_khong_lo_nao_vuot_tran_than_yeu_cau(self):
        beo = [item(n, districts=30) for n in range(500)]
        cap = 100_000

        self.assertGreater(len(payload_of(build_batch(beo))), cap)

        chunks = split_items(beo, 500, cap)

        self.assertGreater(len(chunks), 1)
        self.assertEqual(sum(len(chunk) for chunk in chunks), 500)
        for chunk in chunks:
            self.assertLessEqual(len(payload_of(build_batch(chunk))), cap)

    def test_mot_muc_qua_kho_bao_ten_dia_chi(self):
        with self.assertRaises(ValueError) as caught:
            split_items([item(1, districts=30)], 500, 200)

        self.assertIn("moi-gioi-mau-1", str(caught.exception))

    def test_batch_size_khong_hop_le_bi_tu_choi(self):
        with self.assertRaises(ValueError):
            split_items([item(1)], 0, BODY_LIMIT)


class KhongMatDuLieu(unittest.TestCase):
    def setUp(self) -> None:
        self.folder = tempfile.TemporaryDirectory()
        self.addCleanup(self.folder.cleanup)
        self.base = Path(self.folder.name) / "lo.json"

        moi = dict(os.environ, LISTING_INGEST_SECRET="bi-mat-cua-luot-chay-nay")
        patched = mock.patch.dict(os.environ, moi, clear=True)
        patched.start()
        self.addCleanup(patched.stop)

    def cai_dat(self, batch_size: int) -> dict:
        return {
            "ingest": {
                "url": "http://localhost:3001/internal/listings/ingest",
                "batch_size": batch_size,
                "body_limit_bytes": BODY_LIMIT,
            }
        }

    def test_lo_gui_hong_van_nam_tren_dia_va_bao_ten_tep(self):
        hong = PostFailed(403, "Forbidden")

        with mock.patch.object(entry, "config", return_value=self.cai_dat(1)):
            with mock.patch.object(entry, "post_batch", side_effect=hong):
                with self.assertLogs("listing_crawl", level="ERROR") as ghi:
                    code = entry.main(["--fixtures", "--out", str(self.base)])

        mot = self.base.with_name("lo-001.json")
        hai = self.base.with_name("lo-002.json")

        self.assertEqual(code, 1)
        self.assertTrue(mot.exists())
        self.assertTrue(hai.exists())
        self.assertEqual(len(json.loads(mot.read_text(encoding="utf-8"))["items"]), 1)
        self.assertEqual(len(json.loads(hai.read_text(encoding="utf-8"))["items"]), 1)

        noi_dung = "\n".join(ghi.output)
        self.assertIn(str(mot), noi_dung)
        self.assertIn(str(hai), noi_dung)
        self.assertIn("403", noi_dung)

    def test_ghi_dia_xong_truoc_khi_gui(self):
        thay = []

        def bat(batch, url, secret):
            thay.append(self.base.with_name("lo-001.json").exists())
            raise PostFailed(500, "Internal Server Error")

        with mock.patch.object(entry, "config", return_value=self.cai_dat(1)):
            with mock.patch.object(entry, "post_batch", side_effect=bat):
                with self.assertLogs("listing_crawl", level="ERROR"):
                    entry.main(["--fixtures", "--out", str(self.base)])

        self.assertTrue(thay)
        self.assertTrue(all(thay))

    def test_gui_duoc_het_thi_thoat_khong(self):
        with mock.patch.object(entry, "config", return_value=self.cai_dat(1)):
            with mock.patch.object(entry, "post_batch", return_value=201):
                code = entry.main(["--fixtures", "--out", str(self.base)])

        self.assertEqual(code, 0)
        self.assertTrue(self.base.with_name("lo-001.json").exists())
        self.assertTrue(self.base.with_name("lo-002.json").exists())


if __name__ == "__main__":
    unittest.main()
