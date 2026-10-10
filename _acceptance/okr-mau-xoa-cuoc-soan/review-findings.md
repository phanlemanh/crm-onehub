## Trong hợp đồng

- **Hình dạng 5 (tuyên quét LỚP, chỉ có điểm-case): vế cycleId của bộ chọn cuộc soạn không có ca riêng và không có cặp đột biến**
  AC: AC-1
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts:150`
  severity: medium
  source: measurement
  detail: Bộ chọn trong nap.ts tapMau có bốn vế: OR [{cycleId: tien}, {divisionId: tien}, {departmentId: tien}, {nguoiMoUserId in nguoi}]. AC-1 hứa «mỗi vế có ca riêng», nhưng spec chỉ dựng ba cuộc một vế: vePb (dòng ~150, chỉ departmentId), veBp (chỉ divisionId), veNguoi (chỉ nguoiMoUserId). Không có cuộc nào mà chỉ cycleId trỏ bộ mẫu. Cuộc `chinh`, cuộc mồ côi (omx-mo-coi) và cuộc `cu` (omx-nap-lai) đều mang cùng lúc departmentId mẫu và người mẫu, nên vế cycleId luôn bị một vế khác che. Hệ quả: xoá dòng `{ cycleId: tien },` khỏi nap.ts thì cả bốn lượt omx-xoa, omx-mo-coi, omx-nap-lai, omx-dang-giu vẫn xanh. Đây đúng là ca có thật: CAP_CUOC có level "onehub", với divisionId và departmentId đều null (packages/db/src/okr-cuoc-soan.ts:91,110). Một cuộc cấp onehub do người ngoài bộ mẫu mở trên chu kỳ mẫu chỉ bị bắt nhờ vế cycleId. Ma trận đột biến trong rang/dot-bien.mjs (CAP, 7 cặp) cũng có cùng lỗ: có (f) bỏ departmentId và (g) bỏ nguoiMoUserId, nhưng không có cặp bỏ cycleId hay bỏ divisionId. Ma trận không được viết trước theo đủ bốn phần tử của lớp, nên số ca không bằng số vế.
  rationale: AC-1 hứa mỗi vế chọn cuộc (gồm cycleId) có ca riêng, mà không có cuộc nào chỉ trỏ bộ mẫu qua chu kỳ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **afterAll copies the body of the existing donSoan() helper instead of calling it**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Bài kiểm tự dọn bằng bản sao đoạn mã dọn chung; nếu sau này cách dọn đổi, bài kiểm này có thể để sót dữ liệu cho bài kiểm kế tiếp.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **nguoiMoUserId is matched against the current sample users, not by prefix as docs/setup.md says**
  Người dùng thấy gì: Nếu một cuộc soạn OKR sót lại từ lần xoá trước mà chỉ còn dính bộ mẫu qua người đã mở nó, lệnh gỡ bộ mẫu có thể bỏ sót và báo kho không có bộ mẫu nào. Trường hợp này hiếm.
  file: `apps/api/scripts/okr-mau/nap.ts`
  severity: low
  Đề xuất: known-limits

- **E6 says the month total comes from chiTieuKhung over the UTC month; the test reads chiTieuThang over the Vietnam-time month**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Lời mô tả phép kiểm tổng chi phí AI trong tháng ghi khác cách bài kiểm thật đo, có thể làm người rà soát hiểu nhầm.
  file: `_acceptance/okr-mau-xoa-cuoc-soan/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP, chỉ có điểm-case): đề xuất soạn «mọi trạng thái» nhưng chỉ gieo chờ và bác**
  Người dùng thấy gì: Khi gỡ bộ mẫu, đề xuất soạn ở trạng thái chờ và đã bác được kiểm; các trạng thái nhận, sửa và bị loại chưa có bài kiểm riêng, dù cách xoá hiện nay không phân biệt trạng thái.
  file: `apps/api/test/okr-mau-cuoc-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
