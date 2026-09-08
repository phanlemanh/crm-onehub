import ast
import asyncio
import logging
import re
import tempfile
import unittest
from dataclasses import dataclass
from pathlib import Path

import listing_crawl.__main__ as bo_cao
from listing_crawl.__main__ import gieo_va_cao, main, new_ledger

HO_SO = (Path(__file__).resolve().parent / "fixtures" / "profile.html").read_text(
    encoding="utf-8"
)
MOI_TRANG = 3


@dataclass
class Trang:
    success: bool
    html: str
    error_message: str = ""


def the_danh_ba(dau: int, so_luong: int) -> str:
    return "".join(
        f'<div class="cwnfqzr"><div class="absz92k">'
        f'<a href="/moi-gioi-{dau + thu}"><h2>x</h2></a></div></div>'
        for thu in range(so_luong)
    )


class DanhBaGia:
    def __init__(self, tong_trang, hong=(), lap=(), rong_tu=None):
        self.tong_trang = tong_trang
        self.hong = set(hong)
        self.lap = set(lap)
        self.rong_tu = rong_tu
        self.ledger = new_ledger()

    async def fetch(self, url, run, kind):
        self.ledger["lan_thu"] += 1
        self.ledger[f"lan_thu_{kind}"] += 1
        if kind != "danh_ba":
            return Trang(True, HO_SO)
        so = int(url.rsplit("=", 1)[1])
        if so in self.hong or so > self.tong_trang:
            self.ledger["lan_thu_hong"] += 1
            return Trang(False, "", "bị chặn")
        if self.rong_tu is not None and so >= self.rong_tu:
            return Trang(True, "<html><body></body></html>")
        nguon = so - 1 if so in self.lap else so
        return Trang(True, f"<html><body>{the_danh_ba((nguon - 1) * MOI_TRANG, MOI_TRANG)}</body></html>")


class DuongChayThat(unittest.TestCase):
    def chay(self, danh_ba, tran):
        cai_dat = {
            "profile_prefix": "/moi-gioi-",
            "sitemap": "https://vi-du/sitemap.xml",
            "directory": "https://vi-du/danh-ba",
            "directory_max_pages": tran,
            "directory_stop_after_empty": 3,
            "phone_reveal_cap": 200,
            "phone_reveal_tiers": ["cao", "vua", "thap", "ngu"],
        }

        async def gia_live_run(limit):
            return await gieo_va_cao(
                danh_ba.fetch, None, cai_dat, limit, danh_ba.ledger
            )

        that = bo_cao.live_run
        bo_cao.live_run = gia_live_run
        try:
            with tempfile.TemporaryDirectory() as thu_muc:
                ra = Path(thu_muc) / "lo.json"
                with self.assertLogs("listing_crawl", level=logging.INFO) as ghi:
                    ma = main(["--dry-run", "--out", str(ra)])
        finally:
            bo_cao.live_run = that

        dong = [d for d in ghi.output if "lượt chạy:" in d]
        self.assertEqual(ma, 0, "lệnh phải thoát 0")
        self.assertEqual(len(dong), 1)
        chuoi = re.search(r"lượt chạy: (\{.*\})", dong[0])
        self.assertIsNotNone(chuoi, "dòng bản tổng kết không đọc lại được thành dữ liệu")
        return ast.literal_eval(chuoi.group(1))

    def test_cham_tran_khi_danh_ba_con_nguoi_thi_dong_in_ra_bao_BAT(self):
        bao = self.chay(DanhBaGia(tong_trang=99), tran=4)

        self.assertTrue(
            bao["bi_tran_cat"],
            "lệnh chạy hết trần với danh bạ còn người mà dòng in ra báo cờ TẮT",
        )
        self.assertEqual(bao["trang_danh_ba_doc"], 4)
        self.assertEqual(bao["trang_danh_ba_rong"], 0)
        self.assertEqual(bao["trang_danh_ba_hong"], 0)
        self.assertEqual(bao["gieo"], 4 * MOI_TRANG)

    def test_trang_cuoi_trong_tran_toan_dia_chi_trung_van_bao_BAT(self):
        bao = self.chay(DanhBaGia(tong_trang=99, lap={4}), tran=4)

        self.assertTrue(
            bao["bi_tran_cat"],
            "trang cuối trong trần chỉ toàn địa chỉ trùng làm cờ TẮT sai — danh bạ vẫn còn người",
        )
        self.assertEqual(bao["trang_danh_ba_doc"], 4)

    def test_danh_ba_can_that_thi_dong_in_ra_bao_TAT(self):
        bao = self.chay(DanhBaGia(tong_trang=99, rong_tu=4), tran=20)

        self.assertFalse(bao["bi_tran_cat"], "danh bạ cạn thật mà dòng in ra báo cờ BẬT")
        self.assertEqual(bao["trang_danh_ba_doc"], 3)
        self.assertEqual(bao["trang_danh_ba_rong"], 3)
        self.assertEqual(bao["gieo"], 3 * MOI_TRANG)

    def test_trang_hong_hien_dung_so_tren_dong_in_ra(self):
        bao = self.chay(DanhBaGia(tong_trang=99, hong={2, 4}), tran=5)

        self.assertEqual(bao["trang_danh_ba_hong"], 2)
        self.assertEqual(bao["trang_danh_ba_doc"], 3)
        self.assertEqual(bao["gieo"], 3 * MOI_TRANG)

    def test_khong_doc_duoc_trang_nao_thi_dong_in_ra_bao_TAT(self):
        danh_ba = DanhBaGia(tong_trang=99, hong=set(range(1, 6)))

        cai_dat_rong = self.chay_rong(danh_ba)

        self.assertFalse(cai_dat_rong)

    def chay_rong(self, danh_ba):
        cai_dat = {
            "profile_prefix": "/moi-gioi-",
            "sitemap": "https://vi-du/sitemap.xml",
            "directory": "https://vi-du/danh-ba",
            "directory_max_pages": 5,
            "directory_stop_after_empty": 3,
            "phone_reveal_cap": 200,
            "phone_reveal_tiers": ["cao"],
        }
        items, counts = asyncio.run(
            gieo_va_cao(danh_ba.fetch, None, cai_dat, None, danh_ba.ledger)
        )
        self.assertEqual(items, [])
        self.assertEqual(counts["trang_danh_ba_hong"], 5)
        return counts["bi_tran_cat"]
