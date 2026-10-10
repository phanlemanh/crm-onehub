# Review findings: kiem-cheo-chay-quang-lang (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The signed Gate 2 card still says the exit 0/1 path saves progress, which HEAD has removed**
  Người dùng thấy gì: Thẻ duyệt đã ký còn mô tả rằng lượt kiểm chéo vượt giờ giữa chừng vẫn lưu tiến độ ở cả hai đường, trong khi bản mới không lưu ở đường kết thúc bình thường. Người duyệt đọc thẻ cũ sẽ tưởng hệ thống làm điều nó không còn làm, nên cần vẽ lại thẻ trước khi ký lại.
  file: `_acceptance/kiem-cheo-chay-quang-lang/card.html`
  severity: low
  Đề xuất: known-limits

- **The overrun reason always prints the config ceiling, even when the env var sets a different one**
  Người dùng thấy gì: Khi trần thời gian được đặt khác mặc định, tệp ngày vẫn ghi con số mặc định là lý do dừng. Người đọc tệp sẽ hiểu sai lượt đã dừng sau bao lâu, dù việc dừng và lưu tiến độ vẫn đúng.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: ca (j) trong pha-thu chỉ kiểm có tệp và có chữ, trong khi AC-2 hứa một quan hệ giữa các giá trị**
  Người dùng thấy gì: Một ca thử trong bộ kiểm tra chỉ xác nhận tiến độ có được ghi, chưa kiểm các giá trị bên trong đúng hay sai. Nếu sau này ai đó ghi sai nội dung tiến độ, ca này vẫn qua, nên phải trông vào ca thử khác để bắt.
  file: `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`
  severity: low
  Đề xuất: known-limits

- **Đọc nhật ký làn khi chạm trần dựa vào dòng log cho người đọc của kit, lệch khuôn thì im lặng ra 0/N chứ không báo lỗi (r2)**
  Người dùng thấy gì: Nếu bộ kit sau này đổi cách ghi nhật ký, lượt kiểm chéo đêm có thể báo nhầm là chưa xong hồ sơ nào và đêm nào cũng chạy lại từ đầu mà không báo lỗi. Hiện chưa xảy ra, nhưng khi nó xảy ra sẽ khó nhận ra.
  file: `scripts/kiem-cheo/tien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): suiteDoTrongNhatKy chỉ được thử trên dòng gõ tay, chưa chạy trên nhật ký thật có sẵn trong rang/mau (r2)**
  Người dùng thấy gì: Phần nhận biết bộ kiểm toàn kho đỏ mới chỉ được thử trên dòng nhật ký gõ tay, chưa thử trên nhật ký thật. Hôm nay hai bên khớp nhau, nhưng nếu lệch thì bài kiểm không báo.
  file: `scripts/kiem-cheo/test/tien-do.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Đột biến M1b của dph_dot_bien mất mỏ neo ở lich.mjs nên E25 của hồ sơ đã ký dieu-phoi-hai-tang thoát 2 (r1)**
  Người dùng thấy gì: Một phép thử an toàn của tính năng điều phối khác sẽ báo đỏ khi lượt kiểm chéo đêm chạy, dù thứ tự xếp hàng vẫn đúng. Cần một việc riêng để sửa lại phép thử đó.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: medium
  Đề xuất: new-contract

- **Trường `moc` trong đơn kiem-cheo không còn nơi nào đọc, nhưng dem.mjs vẫn tính canMoc và ghi nó vào đơn (r1)**
  Người dùng thấy gì: Hệ thống vẫn tính và ghi một thông tin không còn ảnh hưởng thứ tự xếp, gây tốn chút công và dễ làm người đọc hiểu nhầm, nhưng không làm sai kết quả.
  file: `scripts/dieu-phoi/lich.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (thiếu đối chứng): E1 khai một bản sao đột biến bỏ phần tử kiem-cheo khỏi khoá xếp, nhưng lich.test.mjs không có bản sao nào (r1)**
  Người dùng thấy gì: Phép thử chứng minh quy tắc xếp kiểm chéo sau thợ được mô tả là có thử với một bản sai, nhưng thực tế chưa chạy bản sai đó, nên độ tin cậy của phép thử thấp hơn lời ghi.
  file: `_acceptance/kiem-cheo-chay-quang-lang/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thiếu đối chứng): E3 khai bản sao «ghi đè tien-do thay vì hợp» nhưng dem.test.mjs không có ca đột biến (r1)**
  Người dùng thấy gì: Phép thử việc chạy tiếp qua nhiều đêm được mô tả là có đối chứng với bản ghi đè sai, nhưng đối chứng đó chưa thật sự chạy.
  file: `_acceptance/kiem-cheo-chay-quang-lang/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1/2: noi-f9 tự đưa CON_TRO hằng vào chungThayBoi, thay vì đo đường kiểm lại thật (notRunConflicts đọc superseded_by từ evals.yaml) (r1)**
  Người dùng thấy gì: Việc kiểm xem hồ sơ cũ có nhận con trỏ thay thế được kiểm bằng đầu vào tự đưa vào, chưa chạy qua đúng bộ kiểm lại bằng chứng thật, nên chưa chắc chắn hoàn toàn.
  file: `_acceptance/kiem-cheo-chay-quang-lang/rang/noi-f9.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/kiem-cheo-chay-quang-lang/card.html, _acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
