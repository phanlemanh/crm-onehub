# Review findings: okr-mau-xoa-du (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mô tả E1 nói demThamChieu đọc pg_constraint, nhưng hàm thật đọc information_schema.columns**
  Người dùng thấy gì: Thẻ bằng chứng mô tả sai cách bài kiểm đếm hàng còn sót, nên người đọc có thể hiểu lệch về bằng chứng. Sản phẩm chạy đúng và phép đo thực tế còn chặt hơn lời mô tả.
  Căn cứ: Chỉ lệch lời mô tả chứ không lệch kết quả, người dùng không mất gì và chỉ cần sửa một câu chữ khi tiện.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Câu SQL liệt khoá chặn tới bảng user bị chép hai nơi**
  Người dùng thấy gì: Hai chỗ trong mã cùng dùng một câu truy vấn chép riêng, sau này sửa một bên mà quên bên kia thì lưới bắt bảng mới có thể không còn khớp với lệnh xoá thật. Hiện tại hai bên vẫn giống nhau nên người dùng chưa gặp gì.
  Căn cứ: Rủi ro chỉ xảy ra trong tương lai nếu có người sửa lệch, không mất dữ liệu và sửa rẻ nhưng không gấp.
  file: `apps/api/test/okr-mau-khoa-nguoi.spec.ts`
  severity: low
  Đề xuất: known-limits

- **chanKeoNgoai không chặn các liên kết ngoài bộ mẫu bám vào việc của người mẫu (DuAnMocCho, OnboardingStep.viecId): xoaViecVaTinHieu xoá hoặc sửa chúng mà không báo**
  Người dùng thấy gì: Khi xoá bộ OKR mẫu, nếu một dự án hay một kế hoạch onboarding của người thật đang gắn vào việc của người mẫu thì điều kiện chờ đó bị mất hoặc bị bỏ trống mà lệnh vẫn báo xong, không cảnh báo.
  Căn cứ: Dữ liệu của người thật có thể bị đổi âm thầm và không khôi phục được, nhưng lệnh chỉ chạy trên máy dev và kiểm thử, chưa từng chạy trên production nên hậu quả thật còn nhỏ.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assertion âm tính không ghim đúng thông điệp): E6 đòi 'không dòng nào chứa "don dep"', nhưng thước in dòng 'don dep' cả khi xanh**
  Người dùng thấy gì: Bài kiểm đo màn dọn dữ liệu có thể báo đỏ nhầm dù việc xoá đã chạy tốt, hoặc nếu bỏ vế đó thì chỉ còn dựa vào một chuỗi kết quả. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm nhiễu kết quả nghiệm thu chứ không gây mất dữ liệu, người chấm tự nhận ra khi chạy lại và sửa là đổi một chuỗi chữ.
  file: `_acceptance/okr-mau-xoa-du/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không có đối chứng dương): okx-viec kiểm viecTheoDoi = 0 sau xoá mà không xác nhận trước đó có hàng**
  Người dùng thấy gì: Bài kiểm khẳng định không còn người theo dõi sau khi xoá nhưng chưa chứng minh lúc đầu có người theo dõi, nên nó có thể xanh mà chưa thật sự thử dọn gì. Tính năng xoá cho người dùng vẫn chạy đúng.
  Căn cứ: Chỉ làm bằng chứng yếu hơn mức lý tưởng, không ảnh hưởng dữ liệu và thêm một dòng kiểm là xong khi có dịp.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (khai cho mọi ca nhưng chỉ kiểm một điểm): '(User)' trần chỉ được kiểm ở ca thứ nhất của okx-ten-giu**
  Người dùng thấy gì: Thông điệp lỗi khi dừng được kiểm chặt ở một tình huống, còn hai tình huống kia chưa được kiểm riêng xem có lọt chữ chung chung hay không. Hiện chưa có dấu hiệu thông điệp sai.
  Căn cứ: Nếu có sai thì chỉ là thông điệp khó đọc hơn, không mất dữ liệu, người dùng thử lại hay đọc kỹ vẫn hiểu.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/okr-mau-xoa-du/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

