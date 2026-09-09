Findings này chia theo kết quả SCOPE-TRIAGE của review round 3 cho feature nang-tran-trang-danh-ba.

## Trong hợp đồng



## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **README của bộ cào khai sai sau khi nới tầng lộ số — mục Tuân thủ vẫn nói chỉ lộ số mức «Cao»**
  Người dùng thấy gì: Tài liệu hướng dẫn công cụ cào vẫn nói chỉ lấy số điện thoại của nhóm khách hàng tiềm năng hạng cao, trong khi hệ thống thực tế đã lấy số cho cả bốn nhóm — người đọc tài liệu để hiểu phạm vi xử lý dữ liệu cá nhân sẽ bị hiểu sai.
  file: `tools/listing-crawl/README.md`
  severity: high
  Đề xuất: known-limits

- **`phone_reveal_tiers` đi thẳng từ TOML xuống `reveal_phones` — không phân tích ở biên, tên mức sai thì im lặng lộ số bằng không**
  Người dùng thấy gì: Nếu tên nhóm khách hàng trong cấu hình bị gõ sai hoặc để trống, hệ thống sẽ lặng lẽ không lấy số điện thoại của ai cả, trong khi lượt chạy vẫn báo hoàn tất bình thường.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: new-contract

- **`directory_scan` nuốt lặng thẻ mất địa chỉ — ngược pattern báo lỗi của chính `parse.py`**
  Người dùng thấy gì: Nếu giao diện trang danh bạ đổi khiến chỉ một phần thông tin liên hệ đọc được trên mỗi trang, hệ thống vẫn báo trang đó bình thường và không cảnh báo — số người thực tế thu được có thể thấp hơn nhiều so với báo cáo mà không ai biết.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: medium
  Đề xuất: new-contract

- **`TEN_TANG` viết cứng bốn tên mức — bản sao thứ ba của cùng bộ từ vựng, cạnh nguồn thật là `tier_of`**
  Người dùng thấy gì: Nếu sau này ai đó đổi tên một nhóm khách hàng tiềm năng, bảng phân bố theo nhóm trong báo cáo cuối lượt có thể lặng lẽ đếm sai mà không có cảnh báo.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **`directory_stop_after_empty` đọc bằng `.get` với số 3 viết cứng — lệch pattern đọc cấu hình của chính hàm**
  Người dùng thấy gì: Nếu dòng cấu hình về số trang trống liên tiếp để dừng bị xoá nhầm, hệ thống vẫn chạy theo một giá trị mặc định ẩn mà không ai khai ra trong cấu hình.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **`directory_urls` thành mã chết, trùng chức năng với `directory_scan` vừa thêm**
  Người dùng thấy gì: Không có tác động trực tiếp tới người dùng cuối; đây là phần mã thừa trong công cụ nội bộ, chỉ có thể gây nhầm lẫn cho người bảo trì sau này.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng «sức khoẻ danh bạ» khai bằng dict literal ở ba chỗ, không module nào sở hữu**
  Người dùng thấy gì: Nếu sau này có người thêm một số liệu sức khoẻ mới vào báo cáo mà quên cập nhật đủ mọi nhánh chạy, báo cáo cuối lượt có thể thiếu số liệu tuỳ theo cách lượt đó được gọi.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **`sample_across` khai `list[str]` nhưng đường lộ số truyền `list[dict]` vào**
  Người dùng thấy gì: Không có tác động tới người dùng — đây là chú thích kiểu dữ liệu trong mã chưa cập nhật, không làm sai kết quả rải mẫu.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: low
  Đề xuất: known-limits

- **Mất phần lớn link trong trang danh bạ vẫn được đếm là trang ĐỌC ĐƯỢC**
  Người dùng thấy gì: Nếu sàn đổi giao diện khiến chỉ một phần thẻ trong mỗi trang danh bạ còn đọc được, báo cáo cuối lượt vẫn ghi nhận các trang đó bình thường và không hỏng — số người tiềm năng thu về có thể thấp hơn thực tế rất nhiều mà không có cảnh báo nào để nhận ra.
  file: `tools/listing-crawl/listing_crawl/parse.py`
  severity: high
  Đề xuất: new-contract

- **Cờ bị_tran_cat vẫn BẬT khi đuôi lượt chạy bị chặn sạch**
  Người dùng thấy gì: Khi phần cuối lượt cào bị chặn liên tục, hệ thống có thể báo nhầm rằng đã chạm giới hạn số trang và cần nâng giới hạn, trong khi thực chất là bị chặn — nâng giới hạn trong trường hợp đó sẽ không giải quyết được gì.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: new-contract

- **reveal_phones nuốt trọn lỗi lộ số, không log không đếm**
  Người dùng thấy gì: Khi việc lấy số điện thoại của một người thất bại (ví dụ trang web đổi giao diện), hệ thống bỏ qua âm thầm mà không ghi lại lý do — khó phân biệt giữa 'sàn không công bố số' và 'công cụ lấy số đang lỗi'.
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo sai bề mặt: E7b chạy tệp KHÁC với tệp nó khai làm bằng chứng**
  Người dùng thấy gì: Phần kiểm tra tự động cho báo cáo cuối lượt cào hiện chưa thực sự chạy đúng bài kiểm tra được khai — nếu báo cáo có lỗi ở phần số liệu này, quy trình kiểm tra hiện tại sẽ không phát hiện ra.
  file: `_acceptance/nang-tran-trang-danh-ba/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc, không round-trip từ bên ghi**
  Người dùng thấy gì: Bằng chứng cho thấy việc rải mẫu chạm được tới nhóm khách hàng tiềm năng thấp nhất chưa thực sự được kiểm chứng trên dữ liệu do chính hệ thống sinh ra theo đúng thứ tự khi chạy thật — kết luận 'mẫu chạm đáy' có thể không đúng ngoài môi trường kiểm thử.
  file: `tools/listing-crawl/tests/fixtures/phan-bo-danh-ba.json`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)



⚠ Cụm ngoài vùng phủ: 5/13 lỗi rơi vào file không bộ đo nào phủ (tools/listing-crawl/README.md, tools/listing-crawl/listing_crawl/parse.py, _acceptance/nang-tran-trang-danh-ba/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.