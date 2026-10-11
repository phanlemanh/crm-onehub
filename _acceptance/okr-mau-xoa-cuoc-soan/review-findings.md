# Review findings: okr-mau-xoa-cuoc-soan (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **afterAll copies the body of the existing donSoan() helper instead of calling it (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Bài kiểm tự dọn bằng bản sao đoạn mã dọn chung; nếu sau này cách dọn đổi, bài kiểm này có thể để sót dữ liệu cho bài kiểm kế tiếp.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **nguoiMoUserId is matched against the current sample users, not by prefix as docs/setup.md says (r1)**
  Người dùng thấy gì: Nếu một cuộc soạn OKR sót lại từ lần xoá trước mà chỉ còn dính bộ mẫu qua người đã mở nó, lệnh gỡ bộ mẫu có thể bỏ sót và báo kho không có bộ mẫu nào. Trường hợp này hiếm.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **E6 says the month total comes from chiTieuKhung over the UTC month; the test reads chiTieuThang over the Vietnam-time month (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Lời mô tả phép kiểm tổng chi phí AI trong tháng ghi khác cách bài kiểm thật đo, có thể làm người rà soát hiểu nhầm.
  file: `_acceptance/okr-mau-xoa-cuoc-soan/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP, chỉ có điểm-case): đề xuất soạn «mọi trạng thái» nhưng chỉ gieo chờ và bác (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi gỡ bộ mẫu, đề xuất soạn ở trạng thái chờ và đã bác được kiểm; các trạng thái nhận, sửa và bị loại chưa có bài kiểm riêng, dù cách xoá hiện nay không phân biệt trạng thái.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
