# Review findings: kiem-cheo-chay-quang-lang (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đọc nhật ký làn khi chạm trần dựa vào dòng log cho người đọc của kit, lệch khuôn thì im lặng ra 0/N chứ không báo lỗi**
  Người dùng thấy gì: Nếu bộ kit sau này đổi cách ghi nhật ký, lượt kiểm chéo đêm có thể báo nhầm là chưa xong hồ sơ nào và đêm nào cũng chạy lại từ đầu mà không báo lỗi. Hiện chưa xảy ra, nhưng khi nó xảy ra sẽ khó nhận ra.
  file: `scripts/kiem-cheo/tien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Năm tệp vừa sửa không còn theo định dạng biome của kho; phần còn lại của scripts/kiem-cheo đã đúng định dạng**
  Người dùng thấy gì: Một số tệp của công cụ kiểm chéo chưa được căn lề theo chuẩn chung của kho. Không ảnh hưởng cách chạy, chỉ khiến lần định dạng tự động sau sinh ra thay đổi lạ.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ thấy chuỗi có mặt, lời hứa là quan hệ): ca thứ hai «khong mat ho so da do» không kiểm do-moi của a còn sống qua đêm**
  Người dùng thấy gì: Bài kiểm tự động chưa chắc bắt được trường hợp hồ sơ đã đo xong ở đêm đầu bị rơi mất khỏi kết luận đêm sau. Nếu có lỗi như vậy xuất hiện sau này, bài kiểm vẫn báo xanh.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ thấy giá trị có mặt, lời hứa là quan hệ): kiểm --tran-phut của làn bằng hằng của chính cấu hình, không kiểm trần làn < trần lượt**
  Người dùng thấy gì: Không có gì bảo đảm thời gian tối đa dành cho phần đo luôn ngắn hơn thời gian tối đa của cả lượt. Nếu ai đó chỉnh số này sai, phần phân loại cuối đêm có thể không còn chỗ chạy mà không có cảnh báo.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): suiteDoTrongNhatKy chỉ được thử trên dòng gõ tay, chưa chạy trên nhật ký thật có sẵn trong rang/mau**
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

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
