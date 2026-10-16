# Review findings: tat-ban-preview (round 1)

## Trong hợp đồng

- **Hình dạng 4 (âm-tính-một-mình): vế commit status «Vercel – crm-onehub-*» của E7 không có chiều đỏ. E8 không chạy bộ lọc status**
  AC: AC-5
  file: `_acceptance/tat-ban-preview/rang/vercel-preview.mjs:98`
  severity: medium
  source: measurement
  detail: AC-5 hứa hai điều: 0 deployment VÀ không có status «Vercel – crm-onehub-*». Ở chế độ xanh (dòng 81), E7 chỉ xanh khi `kq.status === 0`, tức số status lọc bằng `s.context.startsWith("Vercel – crm-onehub-")` (dòng 36-38, có gạch en-dash U+2013, đọc từ `/commits/<sha>/statuses` ở vercel-doc.mjs:117-123). Chiều đỏ E8 (`doChieuDo`, dòng 96-103) có gọi `doMotSha` trên sha mốc 1723dca25, nhưng `du` chỉ xét các dòng `${duAn} co deployment cho ...: dpl_`. Nó bỏ qua `kq.status` và không ghim dòng `status Vercel – ... cho 1723dca25` nào. Có ba khả năng làm bộ đọc status luôn ra 0: tiền tố sai (gạch thường thay vì en-dash, hoặc tên context khác), Vercel báo bằng check-run chứ không bằng commit status, hoặc endpoint trả rỗng. Khi đó vế status của E7 xanh theo cấu tạo, và không phép đo nào trong vòng phân biệt được trường hợp này với «thật sự không có status». Đây là phép đo chỉ có chiều âm: không có đối chứng dương nào chứng minh bộ lọc từng khớp một status thật.
  rationale: AC-5 đòi rõ không có commit status «Vercel – crm-onehub-*»; vế này đo mà chưa từng chứng minh bộ lọc khớp được một status thật nên có thể xanh theo cấu tạo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **vercel-production.mjs không in mốc «BI-THAY» như E9 hứa và như pattern của hồ sơ tat-preview-agent-okr**
  Người dùng thấy gì: Khi bản Production bị huỷ vì có commit mới hơn, báo cáo kiểm tra chỉ nói chung chung là không đọc được, không ghi rõ lý do bị thay. Người đọc phải tự suy ra nguyên nhân, nhưng kết luận đúng sai của việc tắt Preview không đổi.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: medium
  Đề xuất: known-limits

- **cronCuaTep không kiểm dữ liệu ở biên: thiếu `crons` hoặc JSON hỏng thành «LOI-API» mã 2, che một ca đỏ thật**
  Người dùng thấy gì: Nếu tệp cấu hình của api bị mất danh sách cron hoặc hỏng, báo cáo sẽ ghi là lỗi hệ thống thay vì lỗi cấu hình. Người đọc có thể đi tìm nhầm hướng, nhưng kiểm tra vẫn không báo xanh.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

- **Lệnh đếm lại 23/10 (dem-preview.mjs) sẽ đỏ vì các nhánh tách trước lúc gộp, không phải vì vật**
  Người dùng thấy gì: Lần đếm lại ngày 23/10 có thể báo đỏ chỉ vì ai đó đẩy nhánh cũ chưa cập nhật cấu hình mới, dù việc tắt Preview đã đúng. Cần đọc kết quả kèm xem nhánh nào gây ra.
  file: `_acceptance/tat-ban-preview/rang/dem-preview.mjs`
  severity: medium
  Đề xuất: known-limits

- **E9 hứa in nhãn "BI-THAY" nhưng vercel-production.mjs không bao giờ in chuỗi đó**
  Người dùng thấy gì: Báo cáo kiểm tra Production không in đúng nhãn mà mô tả kiểm tra đã hứa khi bản bị thay. Người đọc phải mở chi tiết lý do để biết vì sao, kết luận chính không đổi.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): chiều đỏ E10 trả 0 cho MỌI trạng thái khác READY, không ghim CANCELED hay dpl mốc**
  Người dùng thấy gì: Phép thử chứng minh bộ kiểm tra Production biết báo đỏ chưa đủ chặt: nó chỉ cho thấy báo đỏ được khi bản không READY, chưa chứng minh đã đọc đúng bản và đúng trạng thái. Độ tin vào bộ kiểm tra này thấp hơn vẻ ngoài.
  file: `_acceptance/tat-ban-preview/rang/vercel-production.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
