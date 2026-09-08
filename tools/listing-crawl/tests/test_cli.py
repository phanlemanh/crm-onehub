import logging
import tempfile
import unittest
from pathlib import Path

from listing_crawl.__main__ import main

KHOA = ("trang_danh_ba_doc", "trang_danh_ba_hong", "bi_tran_cat", "phan_bo_tang")


class LenhThatInBanTongKet(unittest.TestCase):
    def test_dong_luot_chay_mang_du_bon_khoa_moi(self):
        with tempfile.TemporaryDirectory() as thu_muc:
            ra = Path(thu_muc) / "lo.json"
            with self.assertLogs("listing_crawl", level=logging.INFO) as ghi:
                ma = main(["--fixtures", "--dry-run", "--out", str(ra)])

        self.assertEqual(ma, 0)
        dong = [d for d in ghi.output if "lượt chạy:" in d]
        self.assertEqual(len(dong), 1, "lệnh phải in đúng một dòng bản tổng kết")
        for khoa in KHOA:
            self.assertIn(
                khoa, dong[0], f"bản tổng kết lệnh in ra thiếu trường {khoa}"
            )
