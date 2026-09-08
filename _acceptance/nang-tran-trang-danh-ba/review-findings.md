## Trong hợp đồng

- **Cờ bi_tran_cat bật cả khi không đọc được trang nào — chính lớp lỗi vòng này sinh ra để chữa**
  file: `tools/listing-crawl/listing_crawl/__main__.py:275`
  severity: high
  `for ... else: bi_tran_cat = True` bật cờ mỗi khi vòng chạy hết `range(directory_max_pages)` mà không `break`, bất kể có đọc được trang nào hay lấy được ai không. AC-4 định nghĩa cờ này là «danh bạ CÒN NGƯỜI khi đã chạm trần».

  Đã tái lập bằng `.venv/bin/python` với `directory_max_pages = 5`:
  - mọi trang trả `success=False` (đúng hình dạng chặn Cloudflare 100% đo ngày 2026-09-04) → `{'trang_danh_ba_doc': 0, 'trang_danh_ba_hong': 5, 'bi_tran_cat': True}`, `found = []`
  - mọi trang đọc được nhưng 0 thẻ (bộ chọn hỏng) → cùng bộ số, `bi_tran_cat: True`

  Hệ quả vận hành: lượt chạy bị chặn sạch hoặc bộ chọn hỏng vẫn in ra cờ đọc là «danh bạ sâu hơn trần, nâng 120 lên đi», tức người nhận đúng tín hiệu ngược. Contract nói thẳng đây là lớp lỗi cần chặn: «gộp hai thứ đó là tái tạo đúng lớp lỗi vòng này sinh ra để chữa, mà lần này im lặng hơn».

  Bài kiểm `test_trang_khong_the_nao_ngay_tu_dau_thi_tinh_la_hong` (tests/test_seed.py) chạy đúng kịch bản này nhưng chỉ khẳng định `doc`/`hong`, không đụng tới `bi_tran_cat`, nên chiều đỏ không tồn tại. Điều kiện đúng phải kèm ít nhất `doc > 0` và có người mới ở trang cuối cùng đọc được.
  AC: AC-4

- **Trang danh bạ không bóc được thẻ bị nuốt lỗi và đếm là "đã đọc" — bộ cào dừng sớm nhưng bản tổng kết vẫn báo khoẻ**
  file: `tools/listing-crawl/listing_crawl/__main__.py:252`
  severity: high
  Ở nhánh `except ValueError as error:` trong `seed_urls`, khi `doc > 0` thì code làm `urls = []` rồi `doc += 1` và KHÔNG log gì cả — biến `error` được bind nhưng không bao giờ dùng. Hệ quả: một trang trả HTTP 200 kèm HTML nhưng không bóc được thẻ nào (trang chặn bot mềm / captcha / interstitial / bộ chọn `div.cwnfqzr` đổi) bị xếp CÙNG LOẠI với trang rỗng thật: `trang_danh_ba_doc` tăng, `trang_danh_ba_hong` KHÔNG tăng, và log in ra "không có địa chỉ mới" — đúng câu dùng cho trang toàn thẻ trùng.

  Đã dựng lại bằng probe (fetch giả: trang 1 có 11 thẻ, từ trang 2 trở đi trả trang chặn HTTP 200):
  ```
  WARNING trang danh bạ 2 không có địa chỉ mới
  WARNING trang danh bạ 3 không có địa chỉ mới
  WARNING trang danh bạ 4 không có địa chỉ mới
  SEEDS: 11
  HEALTH: {'trang_danh_ba_doc': 4, 'trang_danh_ba_hong': 0, 'bi_tran_cat': False}
  ```
  Ba trang liên tiếp như vậy làm `rong_lien_tiep` chạm `directory_stop_after_empty` → `break` → `bi_tran_cat = False`, lệnh thoát 0, và bản tổng kết không phân biệt được với một danh bạ 1 trang cạn thật. Đây đúng lớp lỗi mà AC-3/AC-7 sinh ra để chặn ("đắt mà im"), nhưng lá chắn chỉ bật khi `doc == 0`, tức chỉ bắt được trường hợp hỏng ngay từ trang đầu; hỏng giữa lượt — đúng vùng sâu mà chính hợp đồng đo được 24% trang hỏng — đi qua lặng lẽ. Tối thiểu: log `error` ở nhánh này với thông điệp riêng, và tách trang-không-bóc-được-thẻ ra khỏi `trang_danh_ba_doc` (hoặc thêm một khoá đếm thứ ba) để bản tổng kết nói được nó là trang rỗng hay trang không đọc nổi.
  AC: AC-3

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **README của bộ cào khai sai chính sách lộ số điện thoại đang ship**
  Người dùng thấy gì: Tài liệu hướng dẫn của bộ cào hiện nói chỉ lộ số điện thoại cho hồ sơ mức Cao, trong khi hệ thống đang lộ số cho cả bốn mức — người đọc tài liệu sẽ hiểu sai về việc dữ liệu cá nhân nào đang bị truy cập.
  file: `tools/listing-crawl/README.md`
  severity: high
  Đề xuất: known-limits

- **Bộ ba trường sức khoẻ được viết tay lặp lại ở ba chỗ, không có nơi nào sở hữu hình dạng**
  Người dùng thấy gì: Nếu sau này cần thêm một chỉ số sức khoẻ mới cho lượt cào, người sửa dễ sót một trong ba chỗ đang lặp lại, khiến báo cáo cuối lượt chạy thiếu hoặc sai thông tin mà không ai nhận ra ngay.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **sample_across khai list[str] nhưng nay nhận list[dict]**
  Người dùng thấy gì: Đây là sai lệch trong khai báo kiểu dữ liệu nội bộ của bộ cào, không làm thay đổi kết quả mà người dùng nhận được khi chạy lệnh.
  file: `tools/listing-crawl/listing_crawl/seed.py`
  severity: medium
  Đề xuất: wont-fix

- **`except ValueError` không bắt `lxml.etree.ParserError` — HTML rỗng-trắng làm sập cả lượt chạy sau khi đã tải xong mọi trang**
  Người dùng thấy gì: Nếu một trang danh bạ trả về nội dung chỉ toàn khoảng trắng, cả lượt cào đang chạy có thể dừng đột ngột giữa chừng và mất luôn toàn bộ hồ sơ đã tải được của lượt đó, dù mọi thứ trước đó vẫn đang chạy tốt.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi có mặt" thay vì quan hệ giữa các giá trị (test_cli đo TÊN KHOÁ, không đo SỐ)**
  Người dùng thấy gì: Không có bài kiểm tự động nào thật sự xác nhận số trang đã đọc, số trang hỏng và cờ bị-trần-cắt in ra đúng với thực tế lượt cào — một lỗi ở đúng những con số này có thể lọt qua ở các lần sửa sau mà không ai nhận ra.
  file: `tools/listing-crawl/tests/test_cli.py`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét trục bốn mức nhưng chỉ ghim một ô (phan_bo_tang thiếu ma trận toàn phần)**
  Người dùng thấy gì: Bảng đếm hồ sơ theo bốn mức Sản lượng có thể tính sai ở ba trong bốn mức mà bài kiểm hiện tại vẫn báo xanh, nên người xem báo cáo cuối lượt có thể tin nhầm vào một bảng số sai.
  file: `tools/listing-crawl/tests/test_seed.py`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).