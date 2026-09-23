# Review Findings: tieu-de-cot-doc-tron

## Trong hợp đồng

(không có phát hiện nào ánh xạ được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chup.mjs opens app screens without the canhCay tree guard**
  Người dùng thấy gì: Ảnh chụp minh chứng có thể vô tình được lấy từ một máy chủ thử nghiệm khác đang chạy song song, khiến người xem đánh giá nhầm giao diện không phải của bản này.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **chup.mjs ignores an empty-table timeout and still takes the screenshot**
  Người dùng thấy gì: Nếu bảng dữ liệu chưa tải xong hoặc trang bị chuyển hướng, hệ thống vẫn lưu lại ảnh chụp như thể đo thành công, khiến người xem tưởng màn hình đã đúng trong khi thực ra chưa đo được gì.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **chup.mjs swallows the table-load timeout and still writes the E9 evidence screenshot**
  Người dùng thấy gì: Khi trang không tải được bảng đúng cách (đang tải, trống dữ liệu, hoặc bị chuyển hướng), bộ ảnh minh chứng vẫn được tạo ra như bình thường, nên người xem có thể đang chấm điểm một màn hình không phản ánh đúng tính năng.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Stale-lock recovery in mot-luot.sh has a race: two waiters can both break the lock and run at the same time**
  Người dùng thấy gì: Trong trường hợp hiếm hai lượt đo tự động chạy chồng lên nhau, dữ liệu thử nghiệm dùng chung có thể bị xáo trộn, khiến một kết quả đo ngẫu nhiên báo sai mà không ai biết vì sao.
  file: `_acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng số assert không bị ghim): khoá tdc_tieu_de_cot thiếu DUOI_CONG=1, nên chốt đếm 50 ô / 276 khẳng định bị bỏ qua được**
  Người dùng thấy gì: Nếu môi trường máy chạy có sót lại một cờ cũ, phép đo có thể chỉ thực sự kiểm tra một phần bảng tiêu đề rồi vẫn báo đạt toàn bộ, khiến người xem tưởng cả 50 ô đã được kiểm kỹ trong khi chưa chắc vậy.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình, không ghim thông điệp): nhánh cắt dọc (scrollHeight) mới thêm vào man-danh-muc.mjs chưa từng làm E8 đỏ**
  Người dùng thấy gì: Chưa có bằng chứng nào cho thấy phép đo thực sự bắt được lỗi tiêu đề bị cắt xuống dòng ở màn Kế hoạch 30 ngày, nên nếu lỗi đó xảy ra sau này, phép đo có thể vẫn báo đạt như không có chuyện gì.
  file: `_acceptance/onboarding-giong-deals/rang/man-danh-muc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E10 bảo quét «hai tệp bị sửa» trong khi diff sửa bốn tệp UI**
  Người dùng thấy gì: Việc rà soát thiết kế bỏ sót hai tệp giao diện thực sự đã bị sửa, nên nếu hai tệp đó có vấn đề về thiết kế thì sẽ không được phát hiện ở lượt kiểm này.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 7/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tieu-de-cot-doc-tron/rang/chup.mjs, _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh, _acceptance/config.yaml, _acceptance/onboarding-giong-deals/rang/man-danh-muc.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.