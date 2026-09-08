import unittest

from listing_crawl.tiers import config, tier_of


class CauHinhDangShip(unittest.TestCase):
    def test_tran_trang_va_nguong_dung_khai(self):
        crawl = config()["crawl"]

        self.assertEqual(crawl["directory_max_pages"], 120)
        self.assertEqual(crawl["directory_stop_after_empty"], 3)

    def test_lo_so_khai_du_bon_muc(self):
        muc = {tier_of(so) for so in (100, 30, 5, 0)}

        self.assertEqual(set(config()["crawl"]["phone_reveal_tiers"]), muc)
        self.assertEqual(len(muc), 4)
