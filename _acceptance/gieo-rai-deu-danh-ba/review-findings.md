# Phát hiện — làn phản biện

Soi hàm `sample_across`, vòng `seed_urls`, `directory_urls`, `config.toml`, bộ
kiểm `test_seed.py` và hai commit `7418483` · `7645026`. Mọi phát hiện đều chạy
thật bằng `./.venv/bin/python`, không suy luận suông.

Chín phát hiện. Sáu đã đóng ngay trong vòng — hai khuyết tật mã, hai chỗ lệch
trong hồ sơ, một chỗ lệch tài liệu, và một mục được lượt chấm vòng 3 phân xử lại.
Lượt chấm tự dựng lại ca của làn phản biện để xác minh, không tin lời khai. Ba
mục còn mở đều nằm ngoài phạm vi đã duyệt ở Cổng 1.

Mục nặng nhất còn mở là **Ngoài-1**: ở `directory_max_pages = 8` đang ship, cả
danh bạ chỉ ra khoảng 98 hồ sơ, nên `--limit 200` của lệnh chạy thật lấy hết và
không rải gì. Vòng sửa này đúng, nhưng một mình nó chưa đổi được số nào trên màn
hình của đội tiếp thị.

## Đã xử trong vòng này

Giữ nguyên văn phát hiện, thêm dòng cách đóng. Thẻ cổng không hỏi lại các mục này.

- **Vòng đọc trang vẫn còn một cú dừng sớm — AC-6 chưa đứng**
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: high
  Người dùng thấy gì: nếu danh bạ trả về một trang giữa chừng trùng y hệt trang
  trước — chuyện thường gặp khi phân trang của sàn bị lặp — lượt cào bỏ luôn mọi
  trang còn lại và mẫu quay về đúng phần đầu bảng như trước khi sửa. Người đọc
  bản tổng kết không thấy dấu hiệu gì: số hồ sơ vẫn đủ trần đã xin.
  Đề xuất: sửa ngay
  Bằng chứng: dựng danh bạ 8 trang trong đó trang 3 lặp lại trang 2, chạy
  `seed_urls(..., limit=20)` → chỉ đọc **3/8** trang, mẫu trả về là chỉ số 0..19,
  tức trọn hai trang đầu. AC-6 ghi «vẫn đọc tới hết `directory_max_pages` chứ
  không dừng sớm». Bài `test_doc_het_tran_trang_khong_dung_som` không bắt được vì
  bộ dựng sẵn (`test_seed.py:98-109`) sinh địa chỉ mới cho mọi trang.
  **Đã sửa** ở `4d3f5b6`: nhánh `not fresh` nay ghi cảnh báo rồi `continue`.
  Bài mới `test_mot_trang_lap_giua_chung_khong_cat_luot_doc` bắt được khuôn cũ
  («3 != 8 : một trang danh bạ lặp lại giữa chừng đã cắt cụt lượt đọc»). Lượt chấm
  vòng 3 tự dựng lại ca: nay đọc đủ 8/8 trang, mẫu chạm chỉ số 91 trên dải 0..95.

- **AC-3 «không địa chỉ nào lặp lại» không đứng khi một trang danh bạ liệt trùng thẻ**
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Người dùng thấy gì: cùng một môi giới bị tải về hai lần, tốn hai lượt gọi mạng
  cho một người, và lô gửi lên cổng có hai dòng trùng nhau. Trần `--limit` đếm cả
  bản trùng, nên số người thật thu được ít hơn số đã xin mà không có cảnh báo nào.
  Đề xuất: sửa ngay
  Bằng chứng: `directory_urls` không lọc trùng trong cùng một trang, và phép lọc
  `fresh` chỉ so với các trang **trước**. Dựng danh bạ mỗi trang liệt mỗi hồ sơ hai
  thẻ, `seed_urls(..., limit=8)` → trả 8 địa chỉ nhưng chỉ **4 địa chỉ khác nhau**.
  Gọi thẳng `sample_across(['/a','/a','/b','/b',...], 4)` cũng trả bản trùng khi
  dải lệch nặng. Bài `test_dung_so_luong_khong_lap` chỉ nạp dải toàn địa chỉ khác
  nhau, nên phép «không lặp» nó chứng là tính chất của **đầu vào**, không phải của
  hàm.
  **Đã sửa** ở `4d3f5b6`: vòng thêm lọc `if url in seen: continue`. Bài mới
  `test_the_trung_trong_cung_mot_trang_chi_gieo_mot_lan` bắt được khuôn cũ
  («80 != 40»). Vòng 3 dựng lại: trang `a,b,a,c,b` nay cho đúng `a,b,c`. Nhận xét
  «`sample_across` tự nó vẫn trả bản trùng» giữ nguyên hiệu lực và đã vào Known
  limits của báo cáo — AC-3 đứng nhờ vòng gọi lọc trước, không nhờ hàm.

- **Con số đánh đổi trong mục Notes tả một cấu hình không tồn tại**
  file: `_acceptance/gieo-rai-deu-danh-ba/contract.md`
  severity: low
  Người dùng thấy gì: người ký cổng đọc «trần 30 trang, nhịp 1,5 giây, thêm khoảng
  40 giây mỗi lượt» rồi cân nhắc trên con số đó. Không con số nào trong câu ấy là
  con số đang chạy.
  Đề xuất: hợp đồng mới
  Bằng chứng: `config.toml` khai `directory_max_pages = 8`, không phải 30 — và
  chính hợp đồng để việc đổi số đó ngoài phạm vi, nên trần 30 là cấu hình hợp đồng
  tự cấm với tới. Mỗi lượt tải một trang tốn `request_delay_seconds = 1.5` cộng
  `render_wait_seconds = 4.0` (`delay_before_return_html`), tức ~5,5 giây chứ không
  phải 1,5 giây. Chi phí thật của `--limit 50` là khoảng ba trang thêm ≈ 17 giây.
  **Đã sửa** ở `94e447e`: mục Notes nay ghi trần 8 trang đang ship và phần thêm
  thật là 6 lượt tải danh bạ.

- **AC-3 nói «ĐÚNG số lượng bằng trần» không kèm điều kiện, nhưng phần lớn thời
  gian điều đó sai**
  file: `_acceptance/gieo-rai-deu-danh-ba/contract.md`
  severity: low
  Người dùng thấy gì: đọc riêng AC-3, người ta hiểu mỗi lượt gieo luôn trả đúng số
  địa chỉ đã xin. Thực tế ở cấu hình đang ship, xin 200 thì nhận 98 — và đó mới là
  đường đi thường ngày.
  Đề xuất: hợp đồng mới
  Bằng chứng: AC-3 đọc trần vô điều kiện, còn AC-2 lại nói nhánh «ít hơn trần» trả
  nguyên. Bài `test_dung_so_luong_khong_lap` chỉ chạy bốn cặp mà dải luôn lớn hơn
  trần (200/20, 97/30, 11/10, 1000/1), nên nhánh mà người dùng thật rơi vào không
  có bài nào canh cho lời của AC-3.
  **Đã sửa** ở commit này: AC-3 nay đọc «Given một trần NHỎ HƠN số địa chỉ tìm
  được», và ghi rõ nhánh trần-lớn-hơn thuộc AC-2.

- **AC-4 là tiêu chí không có khuôn hỏng nào làm đỏ được**
  file: `tools/listing-crawl/tests/test_seed.py`
  severity: low
  Người dùng thấy gì: một trong sáu tiêu chí của hồ sơ không hề canh cửa nào cả,
  nên «sáu tiêu chí đều xanh» đọc ra rộng hơn thứ thật sự đã được chứng.
  Đề xuất: known-limits
  Bằng chứng: `test_hai_luot_cho_cung_ket_qua` gọi cùng một hàm thuần hai lần trên
  cùng đầu vào. Hàm không đọc `random`, không đọc đồng hồ, không lặp trên `set`
  nào — mọi khuôn cắt danh sách viết được đều qua bài này. Bản báo cáo đã ghi E4
  xanh trên cả hai khuôn giả nhưng gọi nó là «rào hồi quy hợp lệ»; nó không phải
  rào, nó là một mệnh đề luôn đúng.
  **Đã phân xử** ở vòng chấm 3, nghiêng về làn phản biện một nửa. Làn phản biện
  đúng trong họ khuôn cắt danh sách: cả bốn khuôn giả của hồ sơ đều để bài này
  xanh. Nhưng «không khuôn hỏng nào» là lời quá rộng — lượt chấm dựng khuôn thứ
  năm `sorted(random.sample(urls, limit), key=urls.index)`, đúng nhánh thiết kế mà
  Out of scope loại bỏ, và bài báo đỏ. Kết luận ghi vào báo cáo: AC-4 là rào MỘT
  TRỤC HẸP — hợp lệ, làm đỏ được, yếu hơn hẳn E1/E3/E6 — chứ không phải mệnh đề
  luôn đúng. Người đọc «sáu tiêu chí đều xanh» cần nhớ sức nặng nằm ở ba phép đo.

- **README khai hành vi cũ, không ai sửa theo vòng này**
  file: `tools/listing-crawl/README.md`
  severity: low
  Người dùng thấy gì: người mở tài liệu đọc được rằng bộ gieo lật trang danh bạ
  «cho đủ `--limit`», tức vẫn tin là nó dừng khi đủ. Hiểu sai đó dẫn thẳng tới ước
  lượng sai thời gian một lượt cào và sai kỳ vọng về mẫu.
  Đề xuất: sửa ngay
  Bằng chứng: README dòng 95-96 giữ nguyên từ trước `7418483`; hai commit của vòng
  sửa không chạm tệp này. Mục «Tuân thủ» cũng không nhắc lượt cào nay luôn tải hết
  trần trang, tức luôn phơi thêm lượt tải trước Cloudflare kể cả ở lệnh khói
  `--limit 50 --dry-run` mà README dòng 27 đề nghị.
  **Đã sửa** ở `94e447e`: README nay tả bộ gieo đọc hết trần trang rồi rải mẫu,
  và nói thẳng chỗ nó chưa có tác dụng ở trần 8 trang.

## Trong hợp đồng

Không có.

## Ngoài hợp đồng

- **Ở cấu hình đang ship, vòng sửa không đổi một địa chỉ nào cho lệnh chạy thật**
  file: `tools/listing-crawl/config.toml`
  severity: high
  Người dùng thấy gì: lượt cào sản xuất vẫn cho ra đúng bộ hồ sơ cũ, hai mức
  «Thấp» và «Ngủ» của trục Sản lượng vẫn rỗng, thước «phân khúc này so phần còn
  lại» vẫn chỉ chia được Cao với Vừa. Ai đọc hồ sơ nghiệm thu này rồi chạy lại bộ
  cào sẽ tưởng vấn đề đã chữa, mà số trên màn hình không nhúc nhích.
  Đề xuất: hợp đồng mới
  Bằng chứng: `directory_max_pages = 8` cho ra 98 hồ sơ (đúng con số hợp đồng nêu
  ở mục Context). README dòng 28 khai lệnh chạy thật là `--limit 200`. Chạy đối
  chiếu khuôn cũ (`found[:limit]` cộng dừng sớm) với khuôn mới trên dải 98 địa chỉ:
  `--limit 200` → cũ 98, mới 98, **giống hệt nhau**; `--limit 98` → cũng giống hệt.
  Chỉ `--limit 50` mới khác. Nghĩa là cú cắt `found[:limit]` mà mục Context đổ lỗi
  chưa từng nổ trên lượt sinh ra bộ 98 hồ sơ đó — nguyên nhân thật là
  `directory_max_pages = 8`, mà hợp đồng lại để số đó **ngoài phạm vi**.
  Xếp lại từ «trong hợp đồng» sang đây, kèm lý do: cách chữa duy nhất là nâng
  `directory_max_pages`, mà hợp đồng để đúng số đó ngoài phạm vi. Người thi công
  không tự nâng. Lượt chấm vòng 3 đo lại và xác nhận: dải 98, trần 200 → cũ 98 /
  mới 98 giống hệt từng địa chỉ; trần 98 cũng giống hệt; chỉ trần 50 mới khác
  (cũ 50 cao · 0 vừa · 0 thấp, mới 37 · 10 · 3). Đây là việc người quyết ở Cổng
  Giá trị, và nó kéo theo chi phí: mỗi trang thêm tốn khoảng 5,5 giây và một lượt
  phơi trước Cloudflare.

- **Danh bạ bị chặn giữa chừng thì mẫu tụt về đầu bảng, và bản tổng kết không nói**
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Người dùng thấy gì: Cloudflare chặn vài trang giữa lượt cào là chuyện đã đo được
  ở kho này. Khi đó lượt cào vẫn trả đủ số hồ sơ đã xin, dòng tổng kết vẫn in
  `gieo: 20` như một lượt khoẻ, nhưng toàn bộ mẫu lại là phần đầu bảng — đúng thứ
  vòng này định bỏ. Người đọc số không có cách nào biết mẫu đã hỏng.
  Đề xuất: known-limits
  Bằng chứng: chặn trang 3..8, `seed_urls(..., limit=20)` trả 20 địa chỉ chỉ số
  0..19; không chặn thì trả chỉ số 0..76. Hai lượt cho cùng một `gieo: 20`. Có tín
  hiệu gián tiếp (`lan_thu_hong` tăng, mỗi trang hỏng ghi một dòng cảnh báo), nhưng
  không con số nào trong bản tổng kết nói «mẫu không trải hết dải».

- **Số điện thoại trong lô gửi lên cổng sẽ giảm mạnh sau vòng này**
  file: `tools/listing-crawl/listing_crawl/__main__.py`
  severity: medium
  Người dùng thấy gì: đội tiếp thị nhận được nhiều môi giới hơn ở các mức sản lượng
  thấp, nhưng phần lớn hồ sơ mới đó **không có số điện thoại**, nên không gọi được.
  Cột `co_so_dien_thoai` của bản tổng kết tụt xuống mà không ai khai trước.
  Đề xuất: known-limits
  Bằng chứng: `reveal_phones` chỉ lộ số cho hồ sơ mức `cao` (`__main__.py:231`).
  Giả lập một danh bạ 200 hồ sơ xếp giảm dần với ngưỡng thật
  (`cao=60, vua=20, thap=1`): khuôn cắt-đầu ở `--limit 50` cho 50 hồ sơ mức `cao`;
  khuôn rải đều cho 16 `cao` · 10 `vua` · 24 `thap`. Số lượt lộ số rơi từ 50 xuống
  16. Trần `phone_reveal_cap = 200` không phải chỗ vướng — bộ lọc theo mức mới là.
