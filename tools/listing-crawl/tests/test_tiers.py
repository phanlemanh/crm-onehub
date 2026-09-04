import unittest

from listing_crawl.tiers import tier_of


class TierBoundaries(unittest.TestCase):
    def test_bac_dung_tai_nguong(self):
        self.assertEqual(tier_of(60), "cao")
        self.assertEqual(tier_of(20), "vua")
        self.assertEqual(tier_of(1), "thap")
        self.assertEqual(tier_of(0), "ngu")

    def test_sat_duoi_nguong_khong_len_bac(self):
        self.assertEqual(tier_of(59), "vua")
        self.assertEqual(tier_of(19), "thap")
