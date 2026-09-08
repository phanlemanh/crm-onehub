import ast
import logging
import re
import tempfile
import unittest
from pathlib import Path

from listing_crawl.__main__ import main

KHOA = (
    "trang_danh_ba_doc",
    "trang_danh_ba_rong",
    "trang_danh_ba_hong",
    "bi_tran_cat",
    "phan_bo_tang",
)


class LenhThatInBanTongKet(unittest.TestCase):
    def chay(self):
        with tempfile.TemporaryDirectory() as thu_muc:
            ra = Path(thu_muc) / "lo.json"
            with self.assertLogs("listing_crawl", level=logging.INFO) as ghi:
                ma = main(["--fixtures", "--dry-run", "--out", str(ra)])
        dong = [d for d in ghi.output if "lượt chạy:" in d]
        self.assertEqual(ma, 0)
        self.assertEqual(len(dong), 1, "lệnh phải in đúng một dòng bản tổng kết")
        return dong[0]

    def test_dong_luot_chay_mang_du_khoa_suc_khoe(self):
        dong = self.chay()

        for khoa in KHOA:
            self.assertIn(
                khoa, dong, f"bản tổng kết lệnh in ra thiếu trường {khoa}"
            )

    def test_gia_tri_in_ra_doc_lai_duoc_va_khop_quan_he(self):
        dong = self.chay()
        chuoi = re.search(r"lượt chạy: (\{.*\})", dong)
        self.assertIsNotNone(chuoi, "dòng bản tổng kết không đọc lại được thành dữ liệu")
        bao_cao = ast.literal_eval(chuoi.group(1))

        self.assertEqual(
            sum(bao_cao["phan_bo_tang"].values()),
            bao_cao["lay_duoc"],
            "bảng đếm bốn mức không cộng lại bằng số hồ sơ lấy được",
        )
        self.assertEqual(set(bao_cao["phan_bo_tang"]), {"cao", "vua", "thap", "ngu"})
        self.assertIsInstance(bao_cao["bi_tran_cat"], bool)
        self.assertEqual(
            bao_cao["trang_danh_ba_doc"] + bao_cao["trang_danh_ba_rong"],
            0,
            "đường bộ dựng sẵn không đọc trang danh bạ nào nên hai số này phải bằng không",
        )
