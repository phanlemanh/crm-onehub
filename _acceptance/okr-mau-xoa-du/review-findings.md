# Review findings: okr-mau-xoa-du (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chanKeoNgoai chỉ chặn việc con và phụ thuộc; các liên kết khác từ dữ liệu ngoài vào việc của người mẫu bị xoá hoặc gỡ trong im lặng**
  Người dùng thấy gì: Nếu người thật đã gắn việc của người mẫu vào mốc dự án, kế hoạch onboarding hoặc một deal, lệnh xoá bộ mẫu sẽ gỡ các liên kết đó mà không báo trước.
  Căn cứ: Chỉ xảy ra khi dữ liệu thật đã dính vào việc của người mẫu, vốn là dữ liệu dùng thử; mất là mất một liên kết, không mất bản ghi chính, và ít khi gặp.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: medium
  Đề xuất: known-limits

- **Câu báo dừng mã 5 có hai bản: một bản nằm trong config, một bản viết thẳng ở trongGiaoDich**
  Người dùng thấy gì: Người dùng không thấy khác biệt gì ngay; về sau hai câu báo dừng có thể lệch lời nhau nếu chỉ sửa một nơi.
  Căn cứ: Không ảnh hưởng dữ liệu hay hành vi hiện tại, chỉ là nợ gọn mã nhỏ nên không đáng mở việc riêng.
  file: `apps/api/scripts/okr-mau/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Số việc và tín hiệu đã xoá bị bỏ đi, không vào DemBoMau như các bước dọn cùng loại**
  Người dùng thấy gì: Sau khi xoá bộ mẫu, dòng tóm tắt không cho biết đã dọn bao nhiêu việc chung và tín hiệu, và con số việc hiện ra có thể bị hiểu nhầm.
  Căn cứ: Dữ liệu vẫn được dọn đúng, chỉ thiếu con số báo lại; người dùng không mất gì và sửa sau cũng rẻ.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Câu truy vấn catalog khoá chặn bị chép nguyên vào bài kiểm thay vì dùng chung một hàm**
  Người dùng thấy gì: Nếu sau này đổi cách dò khoá chặn ở lệnh xoá, bài kiểm có thể vẫn xanh trong khi lệnh đã dò khác đi.
  Căn cứ: Chỉ là rủi ro bảo trì của bài kiểm, không ảnh hưởng người dùng hôm nay và tự lộ khi đổi lược đồ.
  file: `apps/api/test/okr-mau-khoa-nguoi.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Việc mẫu nằm trong dự án hay mốc của người ngoài bị xoá mà lệnh không dừng**
  Người dùng thấy gì: Một việc mẫu đã nằm trong dự án hay mốc của người thật sẽ bị gỡ khỏi đó khi xoá bộ mẫu, và lệnh vẫn báo thành công.
  Căn cứ: Thiệt hại chỉ là mất liên kết của việc dùng thử trong môi trường mẫu, hiếm gặp và người dùng gắn lại được bằng tay.
  file: `apps/api/scripts/okr-mau/xoa-viec.ts`
  severity: low
  Đề xuất: known-limits

- **Số việc và tín hiệu đã xoá bị bỏ đi, không có trong tóm tắt in ra**
  Người dùng thấy gì: Lệnh xoá hoặc nạp lại bộ mẫu dọn cả việc chung và tín hiệu mà không báo đã dọn bao nhiêu, kể cả việc đang giao cho người thật.
  Căn cứ: Dữ liệu được dọn đúng như hợp đồng, chỉ thiếu dòng báo lại số lượng nên hậu quả nhẹ.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): okx-viec khẳng định viecTheoDoi bằng 0 mà không đếm trước**
  Người dùng thấy gì: Bài kiểm có thể báo xanh dù việc người theo dõi chưa từng được tạo, nên chưa chắc đã chứng minh phần dọn người theo dõi.
  Căn cứ: Không làm sai hành vi của lệnh, chỉ làm bằng chứng yếu hơn; thêm một phép đếm trước là sửa rẻ khi có dịp.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay vì đo quan hệ): okx-ngoai-giu-phu-thuoc khớp 'viecPhuThuoc' từ một nhánh khác**
  Người dùng thấy gì: Nếu ai đó vô tình bỏ hai nhánh dò phụ thuộc theo từng chiều, bài kiểm vẫn xanh nên lỗi có thể lọt không bị bắt.
  Căn cứ: Lệnh hiện chạy đúng; rủi ro chỉ là hồi quy sau này không bị bài kiểm chặn, và bổ sung ca kiểm sau cũng rẻ.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cho mọi ca nhưng chỉ đo một ca): okx-ten-giu chỉ kiểm '(User)' ở ca đầu, và dongGiu lọc bỏ dòng lạ khuôn**
  Người dùng thấy gì: Thông điệp dừng có thể vô tình quay lại in chữ trần kiểu «(User)» ở một số ca mà bài kiểm không bắt được.
  Căn cứ: Hành vi hiện tại đúng ở ca đã đo; nếu hồi quy thì chỉ là thông điệp khó đọc, không mất dữ liệu.
  file: `apps/api/test/okr-mau.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
