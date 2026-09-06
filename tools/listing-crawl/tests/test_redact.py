import unittest

from listing_crawl.redact import Redactor

MOT = {
    "url": "https://nhatot.com/moi-gioi-giatotphumyhung",
    "shopName": "Minh Hiếu BĐS Phú Mỹ Hưng",
    "isCompany": True,
    "hasLicense": True,
    "districts": ["Quận 7", "Huyện Nhà Bè"],
    "city": "Tp Hồ Chí Minh",
    "listingsTotal": 164,
    "listingsNew30d": 164,
    "tier": "cao",
    "personName": "Trịnh Minh Hiếu",
    "phone": "0903187589",
}

HAI = {
    "url": "https://nhatot.com/moi-gioi-quyanbds",
    "shopName": "Quý Ân BĐS",
    "isCompany": True,
    "hasLicense": False,
    "districts": ["Quận 6"],
    "city": "Tp Hồ Chí Minh",
    "listingsTotal": 129,
    "listingsNew30d": 129,
    "tier": "cao",
    "phone": "0909198331",
}

LO = {"source": "nhatot", "crawledAt": "2026-09-04T17:12:04.249801Z", "items": [MOT, HAI]}


class CheDanhTinh(unittest.TestCase):
    def test_ten_va_so_dien_thoai_khong_con_trong_lo(self):
        che = Redactor().batch(LO)
        chu = str(che)
        for that in ("Minh Hiếu", "Trịnh Minh Hiếu", "Quý Ân BĐS", "0903187589", "0909198331"):
            self.assertNotIn(that, chu)
        self.assertEqual(che["items"][0]["personName"], "Môi giới 01")
        self.assertEqual(che["items"][0]["shopName"], "Chuyên trang 01")
        self.assertEqual(che["items"][0]["phone"], "09xxxxxxxx")
        self.assertEqual(che["items"][0]["url"], "https://nhatot.com/moi-gioi-mau-01")
        self.assertEqual(che["items"][1]["shopName"], "Chuyên trang 02")

    def test_giu_nguyen_gia_tri_thong_ke(self):
        che = Redactor().batch(LO)
        for goc, ra in zip(LO["items"], che["items"]):
            for khoa in (
                "isCompany",
                "hasLicense",
                "districts",
                "city",
                "listingsTotal",
                "listingsNew30d",
                "tier",
            ):
                self.assertEqual(ra[khoa], goc[khoa])
        self.assertEqual(che["source"], LO["source"])
        self.assertEqual(che["crawledAt"], LO["crawledAt"])

    def test_nhan_on_dinh_giua_lo_va_nhat_ky(self):
        che = Redactor()
        lo = che.batch(LO)
        dong = che.text(
            "  B tang hinh | https://nhatot.com/moi-gioi-quyanbds -> ok=True http=301 bytes=252224"
        )
        self.assertIn(lo["items"][1]["url"], dong)
        self.assertNotIn("quyanbds", dong)
        self.assertTrue(dong.endswith("-> ok=True http=301 bytes=252224"))

    def test_nhat_ky_giu_nguyen_dong_tong_ket(self):
        tong = (
            "2026-09-05 00:12:04,249 INFO lượt chạy: {'gieo': 50, 'lay_duoc': 49, "
            "'bi_chan': 1, 'tong_bang_tin_moi': 49, 'tong_khac_tin_moi': 0, "
            "'tin_dang': {'min': 37, 'q1': 43, 'trung_vi': 61, 'q3': 84, 'max': 436}}"
        )
        self.assertEqual(Redactor().text(tong), tong)

    def test_che_lai_lan_hai_khong_doi_nhan(self):
        mot = Redactor().batch(LO)
        hai = Redactor().batch(mot)
        self.assertEqual(hai, mot)

    def test_hai_muc_khac_nhau_khong_dung_chung_mot_nhan(self):
        che = Redactor().batch(LO)
        nhan = [muc["shopName"] for muc in che["items"]]
        self.assertEqual(len(set(nhan)), len(nhan))


if __name__ == "__main__":
    unittest.main()
