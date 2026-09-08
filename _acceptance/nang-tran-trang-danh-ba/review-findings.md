## Trong hợp đồng

### `bi_tran_cat` tắt nhầm khi trang cuối trong trần chỉ toàn địa chỉ trùng
file: `tools/listing-crawl/listing_crawl/__main__.py:289`
severity: low
source: conventions
AC: AC-4

Cờ tính bằng `het_tran and rong_lien_tiep == 0 and doc > 0`. Vế `rong_lien_tiep == 0` đòi trang đọc cuối cùng phải có địa chỉ MỚI.

Kịch bản hỏng: `directory_max_pages = 120`, danh bạ sâu hơn 120 trang, nhưng trang 120 rơi vào ca phân trang lặp — trả đúng bộ thẻ của trang 119 (chính là ca mà `test_mot_trang_lap_giua_chung_khong_cat_luot_doc` dựng ra ở giữa chừng). `fresh` rỗng → `rong_lien_tiep = 1` → vòng lặp hết trần, `het_tran` vẫn True, nhưng cờ trả False. Lượt chạy bị trần cắt cụt mà báo cáo khai là danh bạ đã cạn — đúng tín hiệu ngược mà AC-4 sinh ra để chặn.

Điều kiện dừng-vì-cạn là `rong_lien_tiep >= nguong_rong` (dòng 274) và nó đã đặt `het_tran = False` rồi; nên vế `rong_lien_tiep == 0` ở dòng 289 không thêm gì ngoài ca sai này.

### Cờ bị-trần-cắt TẮT sai khi trang cuối trùng lặp — AC-4 mất tín hiệu
file: `tools/listing-crawl/listing_crawl/__main__.py:289`
severity: high
source: bugs
AC: AC-4

`"bi_tran_cat": het_tran and rong_lien_tiep == 0 and doc > 0` gắn thêm điều kiện `rong_lien_tiep == 0`. `rong_lien_tiep` đếm trang KHÔNG RA NGƯỜI MỚI, và chính AC-1 đã khai rằng một trang như vậy KHÔNG phải bằng chứng danh bạ cạn (trang 44 rỗng, trang 45 đủ 11 thẻ). Nên chỉ cần 1 hoặc 2 trang trùng/rỗng rơi đúng vào sát trần là vòng đọc chạm trần với danh bạ còn nguyên người mà cờ vẫn báo TẮT.

Tái hiện (đã chạy, `directory_max_pages=5`, `directory_stop_after_empty=3`, trang 1–4 ra người mới, trang 5 lặp lại nội dung trang 4):

```
so ho so: 40
suc khoe: {'trang_danh_ba_doc': 5, 'trang_danh_ba_rong': 0, 'trang_danh_ba_hong': 0, 'bi_tran_cat': False}
```

Đọc hết 5/5 trang, không hề break sớm (`het_tran` vẫn True), danh bạ vẫn còn — đúng tình huống AC-4 mô tả — nhưng bản tổng kết in ra `bi_tran_cat: False`, tức nói ngược: «danh bạ đã cạn trong trần». Đây là lớp lỗi mà chính hợp đồng gọi tên: «đắt mà im». Ở trần 120 thật, hậu quả là không ai biết cần nâng trần.

Điều kiện đúng chỉ cần `het_tran and doc > 0`; trường hợp cạn thật đã được `het_tran = False` ở nhánh break lo trọn. Bộ test hiện có không bắt được vì `test_cham_tran_khi_danh_ba_con_thi_bat_co` dùng danh bạ không có trang trùng nào ở sát trần.

### Hình dạng 3 — bài đo lệnh thật assert kiểu/hằng số thay vì quan hệ số in ra với số đo được
file: `tools/listing-crawl/tests/test_cli.py:50`
severity: high
source: measurement
AC: AC-4, AC-7

AC-4 hứa «bản tổng kết mà lệnh IN RA mang cờ bị-trần-cắt BẬT», AC-7 hứa bản in ra «khai đúng số trang danh bạ đã đọc, số trang hỏng». Bài duy nhất chạy lệnh thật là test_cli.py, và nó chạy `main(["--fixtures", "--dry-run", ...])` — đường `fixture_run()` ở listing_crawl/__main__.py:123-126 trả về HẰNG SỐ viết cứng `"trang_danh_ba_doc": 0, "trang_danh_ba_rong": 0, "trang_danh_ba_hong": 0, "bi_tran_cat": False`. Hệ quả: `assertIsInstance(bao_cao["bi_tran_cat"], bool)` (dòng 50) KHÔNG THỂ đỏ — giá trị là literal False; và `assertEqual(bao_cao["trang_danh_ba_doc"] + bao_cao["trang_danh_ba_rong"], 0)` (dòng 52) chỉ khẳng định lại chính hai literal đó. Mối nối thật — `live_run` ghép `**suc_khoe` của `seed_urls` vào counts rồi `summary()` in ra (__main__.py:186-193) — không bài nào chạm: `grep -rn "live_run\|fixture_run" tests/` trả về rỗng. Đây đúng hình dạng 3: lời hứa là QUAN HỆ (số in ra bằng số vòng đọc đo được, cờ BẬT khi thật sự chạm trần), phép đo lại chỉ khẳng định tên khoá có mặt (dòng 34) và kiểu/hằng. Chiều đỏ không tồn tại: bỏ `**suc_khoe` khỏi dict trả về của `live_run`, hoặc đảo cờ ở __main__.py:289, toàn bộ E7b vẫn xanh.

### Hình dạng 5 — trục bốn mức Sản lượng tuyên quét nhưng chỉ ghim một ô
file: `tools/listing-crawl/tests/test_seed.py:309`
severity: high
source: measurement
AC: AC-7

Trục B của contract khai bốn mức là một lớp ĐÓNG («CONTEXT.md mục Sản lượng khai đóng đúng bốn mức»), AC-7 hứa «bảng đếm hồ sơ theo bốn mức». Lớp bốn phần tử đòi ma trận toàn phần bốn assert (mẫu P105), nhưng class `BanTongKet` chỉ ghim MỘT ô: `self.assertEqual(bang["ngu"], 1)` (dòng 309) và `self.assertEqual(bang["ngu"], 0)` (dòng 316). Hai assert còn lại là `set(bang) == {bốn tên}` và `sum(bang.values()) == len(items)` — cả hai bất biến trước việc gán nhầm mức. Ba ô cao/vua/thấp không có assert nào. Đã tái lập: hoán vị cao↔vua trong phép đếm của `summary()` (__main__.py:296-299) rồi chạy `./.venv/bin/python -m unittest tests.test_seed.BanTongKet -v` — cả hai bài vẫn `ok`. Bảng bốn mức là đúng thứ contract để lại cho Cổng Giá trị đọc số («AC-7 in ra bảng đếm bốn mức để phiên đó có số mà đọc»), nên một bảng lệch ba trên bốn ô đi qua cổng mà không bài nào đỏ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **README của bộ cào khai sai sau khi nới tầng lộ số — mục Tuân thủ vẫn nói chỉ lộ số mức Cao**
  Người dùng thấy gì: Tài liệu hướng dẫn của bộ cào vẫn ghi rằng chỉ số điện thoại của nhóm khách tiềm năng lớn được tiết lộ, trong khi thực tế nay tiết lộ cả các nhóm nhỏ hơn — người đọc tài liệu có thể hiểu sai mức độ dữ liệu cá nhân đang được xử lý.
  file: `tools/listing-crawl/README.md`
  severity: high
  Đề xuất: new-contract

- **`phone_reveal_tiers` đọc từ config.toml mà không phân tích ở biên — tên mức sai thì lộ số im lặng bằng không**
  Người dùng thấy gì: Nếu sau này có ai gõ nhầm tên một nhóm khách hàng trong file cấu hình, hệ thống sẽ âm thầm không lấy được số điện thoại nào mà không hiện lỗi để biết mà sửa.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **Số 3 viết cứng làm giá trị dự phòng cho `directory_stop_after_empty`**
  Người dùng thấy gì: Nếu file cấu hình lỡ thiếu một dòng cài đặt, hệ thống vẫn tự chạy tiếp với một con số mặc định ẩn mà không ai biết để chỉnh.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **Bốn tên mức viết cứng trong `summary()`, thành bản sao thứ ba của cùng một bộ từ vựng**
  Người dùng thấy gì: Nếu sau này có người đổi tên một trong bốn nhóm khách hàng, bảng thống kê cuối lượt chạy có thể đếm thiếu một nhóm mà không có cảnh báo nào.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **`directory_urls` thành mã chết, trùng chức năng với `directory_scan` vừa thêm**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng — đây chỉ là một đoạn mã cũ không còn được dùng, có thể gây nhầm lẫn cho người sửa mã sau này.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: medium
  Đề xuất: wont-fix

- **`directory_scan` nuốt im thẻ mất địa chỉ khi chỉ MỘT PHẦN thẻ hỏng**
  Người dùng thấy gì: Nếu sàn web đổi giao diện một phần, một số người trong danh bạ có thể âm thầm biến mất khỏi kết quả mà báo cáo cuối lượt chạy vẫn hiện bình thường, không có cảnh báo gì.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: medium
  Đề xuất: new-contract

- **`sample_across` khai `list[str]` nhưng nhận `list[dict]` ở đường lộ số**
  Người dùng thấy gì: Không ảnh hưởng tới người dùng cuối — đây chỉ là ghi chú kỹ thuật trong mã nguồn chưa khớp với cách mã thực sự chạy.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: wont-fix

- **reveal_phones nuốt trọn lỗi phân tích: không log, không đếm**
  Người dùng thấy gì: Nếu trang hồ sơ tải về nhưng không đọc được số điện thoại, hệ thống bỏ qua trong im lặng; đây là hạn chế đã biết từ trước và cố ý chưa xử lý ở vòng này.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **directory_scan bỏ lặng thẻ mất địa chỉ khi chỉ MỘT PHẦN thẻ hỏng**
  Người dùng thấy gì: Nếu sàn web đổi giao diện một phần, một số người trong danh bạ có thể âm thầm biến mất khỏi mẫu mà báo cáo cuối lượt chạy vẫn hiện sức khoẻ hoàn hảo.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 4/13 lỗi rơi vào file không bộ đo nào phủ (tools/listing-crawl/README.md, tools/listing-crawl/listing_crawl/parse.py) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.