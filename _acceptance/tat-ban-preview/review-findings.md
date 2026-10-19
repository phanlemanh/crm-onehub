# Review findings: tat-ban-preview (round 2)

## Trong hợp đồng

(không có finding nào ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

(không có mục mới ở vòng này; các mục mang sang từ round 1 do máy chèn)

- **vercel-production.mjs không in mốc «BI-THAY» như E9 hứa và như pattern của hồ sơ tat-preview-agent-okr (r1)**
  Người dùng thấy gì: Khi bản Production bị huỷ vì có commit mới hơn, báo cáo kiểm tra chỉ nói chung chung là không đọc được, không ghi rõ lý do bị thay. Người đọc phải tự suy ra nguyên nhân, nhưng kết luận đúng sai của việc tắt Preview không đổi.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **cronCuaTep không kiểm dữ liệu ở biên: thiếu `crons` hoặc JSON hỏng thành «LOI-API» mã 2, che một ca đỏ thật (r1)**
  Người dùng thấy gì: Nếu tệp cấu hình của api bị mất danh sách cron hoặc hỏng, báo cáo sẽ ghi là lỗi hệ thống thay vì lỗi cấu hình. Người đọc có thể đi tìm nhầm hướng, nhưng kiểm tra vẫn không báo xanh.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

- **Lệnh đếm lại 23/10 (dem-preview.mjs) sẽ đỏ vì các nhánh tách trước lúc gộp, không phải vì vật (r1)**
  Người dùng thấy gì: Lần đếm lại ngày 23/10 có thể báo đỏ chỉ vì ai đó đẩy nhánh cũ chưa cập nhật cấu hình mới, dù việc tắt Preview đã đúng. Cần đọc kết quả kèm xem nhánh nào gây ra.
  file: `_acceptance/tat-ban-preview/rang/dem-preview.mjs`
  severity: medium
  Đề xuất: known-limits

- **E9 hứa in nhãn "BI-THAY" nhưng vercel-production.mjs không bao giờ in chuỗi đó (r1)**
  Người dùng thấy gì: Báo cáo kiểm tra Production không in đúng nhãn mà mô tả kiểm tra đã hứa khi bản bị thay. Người đọc phải mở chi tiết lý do để biết vì sao, kết luận chính không đổi.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): chiều đỏ E10 trả 0 cho MỌI trạng thái khác READY, không ghim CANCELED hay dpl mốc (r1)**
  Người dùng thấy gì: Phép thử chứng minh bộ kiểm tra Production biết báo đỏ chưa đủ chặt: nó chỉ cho thấy báo đỏ được khi bản không READY, chưa chứng minh đã đọc đúng bản và đúng trạng thái. Độ tin vào bộ kiểm tra này thấp hơn vẻ ngoài.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
