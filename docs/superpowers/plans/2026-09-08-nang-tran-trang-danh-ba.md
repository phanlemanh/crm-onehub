# Nâng trần trang danh bạ — kế hoạch thi công

> **Cho người thi công:** dùng `superpowers:executing-plans` chạy từng việc. Bước đánh dấu `- [ ]`.

**Goal:** Bộ cào đọc danh bạ tới khi cạn thay vì tới một trần đoán, lộ số điện thoại theo danh sách tầng khai trong cấu hình, và khai sức khoẻ của mẫu trên bản tổng kết.

**Architecture:** Ba chỗ đổi trong `listing_crawl/__main__.py` cộng ba khoá cấu hình. `seed_urls` đổi kiểu trả về từ `list[str]` sang `tuple[list[str], dict]` — vế thứ hai là ba số sức khoẻ, chảy qua `live_run` vào `counts` rồi tự hiện trên bản tổng kết nhờ `summary` đã trải `**counts`. `reveal_phones` nhận thêm danh sách tầng và dùng lại `sample_across` của vòng trước khi lô lớn hơn trần.

**Tech Stack:** Python 3.13, `unittest` (chạy bằng `./.venv/bin/python -m unittest discover -s tests`), crawl4ai 0.9.2, `tomllib`.

**Spec:** `docs/superpowers/specs/2026-09-08-nang-tran-trang-danh-ba-design.md`
**Hợp đồng:** `_acceptance/nang-tran-trang-danh-ba/contract.md`

## Global Constraints

- **Không viết chú thích trong mã.** Không cho mã mới, không cho mã sửa.
- Mọi đường dẫn dưới đây tương đối với `tools/listing-crawl/`.
- Mỗi phép đo mới phải đi kèm cặp hai chiều trên CÙNG một bộ dựng sẵn: vật lành thì xanh, phá vật thì đỏ với thông điệp ghim tên. Thiếu cặp là việc CHƯA xong.
- Tên khoá cấu hình ghim nguyên văn: `directory_max_pages`, `directory_stop_after_empty`, `phone_reveal_tiers`, `phone_reveal_cap`.
- Tên trường bản tổng kết ghim nguyên văn: `trang_danh_ba_doc`, `trang_danh_ba_hong`, `bi_tran_cat`, `phan_bo_tang`.
- Bộ dựng sẵn `tests/fixtures/phan-bo-danh-ba.json` đã có sẵn, không sinh lại.

## File Structure

| File | Trách nhiệm |
| --- | --- |
| `config.toml` | Ba khoá mới hoặc đổi giá trị. Không đụng khoá khác. |
| `listing_crawl/__main__.py` | `seed_urls` (vòng đọc + sức khoẻ) · `reveal_phones` (tầng + rải) · `summary` (bảng đếm mức) · `fixture_run` và `live_run` (chảy ba số qua) |
| `tests/test_seed.py` | Vòng đọc, sức khoẻ, và AC-9 trên bộ dựng sẵn thật |
| `tests/test_reveal.py` | **Mới.** Lộ số theo tầng và theo trần |
| `tests/test_cau_hinh.py` | **Mới.** Cấu hình đang ship khớp hợp đồng |
| `tests/test_cli.py` | **Mới.** Chạy lệnh thật, đọc dòng bản tổng kết lệnh in ra |

---

### Việc 1: Ba khoá cấu hình

**Files:** Modify `config.toml` · Create `tests/test_cau_hinh.py`

**Interfaces:**
- Produces: `[crawl] directory_max_pages = 120` · `directory_stop_after_empty = 3` · `phone_reveal_tiers = ["cao", "vua", "thap", "ngu"]`

- [ ] **Bước 1: viết bài kiểm đỏ** — `tests/test_cau_hinh.py`

```python
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
```

- [ ] **Bước 2: chạy, phải đỏ** — `./.venv/bin/python -m unittest tests.test_cau_hinh -v` → `KeyError: 'directory_stop_after_empty'`
- [ ] **Bước 3: sửa `config.toml`** — trong `[crawl]`: `directory_max_pages = 8` thành `120`; thêm hai dòng `directory_stop_after_empty = 3` và `phone_reveal_tiers = ["cao", "vua", "thap", "ngu"]`. `config()` có `lru_cache` nên đừng đọc lại trong cùng tiến trình sau khi sửa file.
- [ ] **Bước 4: chạy, phải xanh**
- [ ] **Bước 5: commit** — `git add config.toml tests/test_cau_hinh.py && git commit -m "feat(crawl): khai trần 120, ngưỡng dừng 3, và bốn mức lộ số"`

---

### Việc 2: Vòng đọc danh bạ tách trang hỏng khỏi trang rỗng

**Files:** Modify `listing_crawl/__main__.py` (`seed_urls`, `live_run`, `fixture_run`) · Modify `tests/test_seed.py`

**Interfaces:**
- Consumes: `sample_across(urls, limit)` từ `listing_crawl.seed`
- Produces: `seed_urls(fetch, run, settings, limit) -> tuple[list[str], dict]`. Vế hai đúng ba khoá: `{"trang_danh_ba_doc": int, "trang_danh_ba_hong": int, "bi_tran_cat": bool}`.
  `trang_danh_ba_doc` đếm trang TẢI ĐƯỢC và đọc được thẻ. `trang_danh_ba_hong` đếm trang không tải được HOẶC không đọc được. `bi_tran_cat` bật khi vòng thoát vì hết `range` chứ không vì đủ chuỗi rỗng.

- [ ] **Bước 1: viết bốn bài kiểm đỏ** vào `tests/test_seed.py`, lớp `GieoTuDanhBa` (đã có `self.lap`, `self.nhan_doi`; thêm `self.hong = set()` và `self.het_tu = None` vào `setUp`, và trong `fetch` trả `Trang(False, "")` khi `so_trang in self.hong`, trả trang 0 thẻ khi `self.het_tu is not None and so_trang >= self.het_tu`)

```python
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
        self.assertFalse(suc_khoe["bi_tran_cat"], "danh bạ cạn thật thì cờ bị-trần-cắt phải TẮT")

    async def test_cham_tran_khi_danh_ba_con_thi_bat_co(self):
        self.SETTINGS["directory_max_pages"] = 4

        _, suc_khoe = await seed_urls(self.fetch, None, self.SETTINGS, None)

        self.assertTrue(suc_khoe["bi_tran_cat"], "chạm trần khi danh bạ còn người mà cờ không bật")
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
```

Sửa mọi bài cũ của lớp đó cho khớp kiểu trả về mới: `lay = await seed_urls(...)` thành `lay, _ = await seed_urls(...)`.

- [ ] **Bước 2: chạy, phải đỏ** — `ValueError: too many values to unpack`
- [ ] **Bước 3: sửa `seed_urls`.** Vòng danh bạ thành:

```python
    doc = 0
    hong = 0
    rong_lien_tiep = 0
    bi_tran_cat = False
    nguong_rong = int(settings.get("directory_stop_after_empty", 3))
    tran = int(settings["directory_max_pages"])

    for number in range(1, tran + 1):
        page = await fetch(f"{settings['directory']}?page={number}", run, "danh_ba")
        if not page.success or not page.html:
            hong += 1
            LOGGER.warning("trang danh bạ %s không tải được", number)
            continue
        try:
            urls = directory_urls(page.html)
        except ValueError as error:
            hong += 1
            LOGGER.warning("trang danh bạ %s: %s", number, error)
            continue
        doc += 1
        fresh = [url for url in urls if url not in seen]
        if not fresh:
            rong_lien_tiep += 1
            LOGGER.warning("trang danh bạ %s không có địa chỉ mới", number)
            if rong_lien_tiep >= nguong_rong:
                break
            continue
        rong_lien_tiep = 0
        for url in fresh:
            if url in seen:
                continue
            seen.add(url)
            found.append(url)
    else:
        bi_tran_cat = True

    return sample_across(found, limit), {
        "trang_danh_ba_doc": doc,
        "trang_danh_ba_hong": hong,
        "bi_tran_cat": bi_tran_cat,
    }
```

Nhánh sơ đồ site trả về sớm cũng phải trả tuple: `return found[:limit] if limit is not None else found` thành `return (found[:limit] if limit is not None else found), {"trang_danh_ba_doc": 0, "trang_danh_ba_hong": 0, "bi_tran_cat": False}`.

Trong `live_run`: `seeds = await seed_urls(...)` thành `seeds, suc_khoe = await seed_urls(...)`, và cả hai chỗ `return` của nó thêm `**suc_khoe` vào dict đếm. Nhánh `if not seeds` cũng phải mang `**suc_khoe`.

Trong `fixture_run`: thêm `"trang_danh_ba_doc": 0, "trang_danh_ba_hong": 0, "bi_tran_cat": False` vào dict trả về, để bản tổng kết luôn có đủ trường.

- [ ] **Bước 4: chạy, phải xanh** — `./.venv/bin/python -m unittest discover -s tests`
- [ ] **Bước 5: kiểm chiều đỏ** — tạm gộp `hong += 1` thành `rong_lien_tiep += 1`, chạy lại: `test_trang_hong_khong_tinh_vao_phep_dem_dung` phải đỏ với thông điệp ghim. Khôi phục.
- [ ] **Bước 6: commit** — `git commit -m "feat(crawl): vòng đọc danh bạ tách trang hỏng khỏi trang rỗng, và khai ba số sức khoẻ"`

---

### Việc 3: Bảng đếm mức trên bản tổng kết

**Files:** Modify `listing_crawl/__main__.py` (`summary`) · Modify `tests/test_seed.py`

**Interfaces:**
- Produces: `summary(items, counts)` thêm khoá `phan_bo_tang: dict[str, int]` — đúng bốn khoá `cao`, `vua`, `thap`, `ngu`, tổng bằng `len(items)`.

- [ ] **Bước 1: viết bài kiểm đỏ**

```python
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
```

Nhập thêm ở đầu file: `from listing_crawl.__main__ import summary` và `from listing_crawl.tiers import tier_of`.

- [ ] **Bước 2: chạy, phải đỏ** — `KeyError: 'phan_bo_tang'`
- [ ] **Bước 3: sửa `summary`** — thêm vào dict trả về:

```python
        "phan_bo_tang": {
            ten: sum(1 for item in items if item["tier"] == ten)
            for ten in ("cao", "vua", "thap", "ngu")
        },
```

- [ ] **Bước 4: chạy, phải xanh**
- [ ] **Bước 5: commit** — `git commit -m "feat(crawl): bản tổng kết đếm hồ sơ theo bốn mức sản lượng"`

---

### Việc 4: Lộ số theo tầng, và rải khắp lô khi vượt trần

**Files:** Modify `listing_crawl/__main__.py` (`reveal_phones`, chỗ gọi trong `live_run`) · Create `tests/test_reveal.py`

**Interfaces:**
- Consumes: `sample_across(urls, limit)` từ `listing_crawl.seed`
- Produces: `reveal_phones(fetch, run, items, cap, tiers)` — `tiers` là `list[str]` hoặc `tuple[str, ...]`. Trả `None`, sửa `items` tại chỗ như cũ.

- [ ] **Bước 1: viết bài kiểm đỏ** — `tests/test_reveal.py`

```python
import asyncio
import unittest
from dataclasses import dataclass

from listing_crawl.__main__ import reveal_phones


@dataclass
class Trang:
    success: bool
    html: str


BON_MUC = ("cao", "vua", "thap", "ngu")


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


class Run:
    def clone(self, **_):
        return self
```

- [ ] **Bước 2: chạy, phải đỏ** — `TypeError: reveal_phones() takes 4 positional arguments but 5 were given`
- [ ] **Bước 3: sửa `reveal_phones`**

```python
async def reveal_phones(fetch, run, items: list[dict], cap: int, tiers) -> None:
    hop_le = [
        item for item in items if item["tier"] in tuple(tiers) and "phone" not in item
    ]
    targets = sample_across(hop_le, cap) if cap > 0 else []
    if not targets:
        return
```

Phần thân còn lại giữ nguyên. Chỗ gọi trong `live_run` đổi thành:

```python
        await reveal_phones(
            fetch,
            run,
            items,
            int(settings["phone_reveal_cap"]),
            settings["phone_reveal_tiers"],
        )
```

- [ ] **Bước 4: chạy, phải xanh**
- [ ] **Bước 5: kiểm chiều đỏ** — tạm đổi `sample_across(hop_le, cap)` thành `hop_le[:cap]`, chạy lại: `test_vuot_tran_thi_cat_dung_tran_va_khong_bo_muc_thap` phải đỏ với thông điệp ghim. Khôi phục.
- [ ] **Bước 6: commit** — `git commit -m "feat(crawl): lộ số theo danh sách tầng, và rải khắp lô khi vượt trần"`

---

### Việc 5: Mẫu chạm được người dưới ngưỡng vừa, đo trên danh bạ thật

**Files:** Modify `tests/test_seed.py`

**Interfaces:**
- Consumes: `tests/fixtures/phan-bo-danh-ba.json` — khoá `tin_hien_co` là danh sách 407 số nguyên, xếp theo thứ tự trang danh bạ (giảm dần).

- [ ] **Bước 1: viết bài kiểm**

```python
class ChamDuocDuoiNguongVua(unittest.TestCase):
    def setUp(self):
        duong = Path(__file__).resolve().parent / "fixtures" / "phan-bo-danh-ba.json"
        self.tin = json.loads(duong.read_text(encoding="utf-8"))["tin_hien_co"]

    def test_mau_chua_nguoi_khong_the_la_cao_hay_vua(self):
        mau = sample_across(self.tin, 200)

        self.assertTrue(
            any(tin < 20 for tin in mau),
            "mẫu không chạm được ai dưới ngưỡng vừa — vẫn dồn về đầu bảng",
        )

    def test_khuon_cat_dau_KHONG_thoa_tren_cung_bo_dung_san(self):
        cat_dau = self.tin[:200]

        self.assertFalse(any(tin < 20 for tin in cat_dau))
```

Nhập thêm: `import json` và `from pathlib import Path`.

- [ ] **Bước 2: chạy, phải xanh cả hai** — bài thứ hai là đối chứng chứng minh bộ dựng sẵn thật sự phân biệt được hai khuôn.
- [ ] **Bước 3: commit** — `git commit -m "test(crawl): mẫu chạm được người dưới ngưỡng vừa, đo trên phân bố danh bạ thật"`

---

### Việc 6: Lệnh thật in ra đủ bốn trường mới

**Files:** Create `tests/test_cli.py`

**Interfaces:**
- Consumes: `main(argv)` từ `listing_crawl.__main__`, chạy được ở chế độ `--fixtures --dry-run`.

- [ ] **Bước 1: viết bài kiểm đỏ**

```python
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
            self.assertIn(khoa, dong[0], f"bản tổng kết lệnh in ra thiếu trường {khoa}")
```

- [ ] **Bước 2: chạy, phải đỏ** — thiếu trường nào thì thông điệp ghim tên trường đó
- [ ] **Bước 3: nếu đỏ vì `fixture_run` chưa mang ba khoá** — quay lại việc 2 bước 3 bổ sung. Nếu đỏ vì `phan_bo_tang` — việc 3 chưa xong.
- [ ] **Bước 4: chạy, phải xanh**
- [ ] **Bước 5: commit** — `git commit -m "test(crawl): lệnh thật in ra đủ bốn trường sức khoẻ mẫu"`

---

## Tự soi

**Phủ hợp đồng:** AC-1 việc 2 (bài trang rỗng cũ đã có) · AC-2 việc 2 · AC-3 việc 2 · AC-4 việc 2 · AC-5 việc 4 · AC-6 việc 4 · AC-7 việc 3 và việc 6 · AC-8 việc 1 · AC-9 việc 5. Không AC nào không có việc.

**Chỗ dễ vấp:** `config()` có `lru_cache(maxsize=1)`, nên bài kiểm cấu hình chạy chung tiến trình với bài khác vẫn đọc cùng một bản — không sao vì không bài nào ghi lại `config.toml`. Nhánh `for ... else` chỉ chạy `else` khi vòng KHÔNG `break`, đó đúng là ngữ nghĩa «chạy hết trần». `Run` giả trong `test_reveal.py` phải có `clone` vì `reveal_phones` gọi `run.clone(js_code=...)`.

**Nhất quán tên:** `seed_urls` trả tuple ở CẢ hai nhánh (sơ đồ site và danh bạ) — bỏ sót nhánh nào là `TypeError` ở chỗ gọi. `reveal_phones` nhận `tiers` làm tham số vị trí thứ năm ở mọi chỗ gọi.
