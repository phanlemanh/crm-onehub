# Review findings: tro-ly-okr-tom-tat (round 3)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): thước «beginResearch thật giữ 3 phút» tự nhận việc với đúng 3 phút nó định đo**
  Người dùng thấy gì: Bài kiểm tra tự đặt sẵn đáp án 3 phút nên không chứng minh được hệ thống thật tự rút xuống 3 phút. Nếu phần đó hỏng, việc tóm tắt bị đứt sẽ chậm được chạy lại mà không ai thấy.
  file: `apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo nguyên liệu thay đầu ra): «model tóm tắt kẹp 8.000» đo middleware rời, không đo MO_HINH_TOM_TAT mà agent thật dùng**
  Người dùng thấy gì: Nếu model dùng cho việc tóm tắt bị cấu hình nhầm trần đầu ra, bản tóm tắt có thể bị cắt cụt hay hỏng mà các bài kiểm tra vẫn xanh. Người dùng chỉ thấy tóm tắt kém hoặc bị bỏ câu.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): lối thật của agent ở step.started chỉ được thử ca trả null**
  Người dùng thấy gì: Nếu đường chọn model riêng cho việc tóm tắt hỏng im lặng, việc tóm tắt sẽ chạy bằng model với trần nhỏ hơn dự định mà không có cảnh báo. Hệ quả là tóm tắt ngắn hoặc bị cắt hơn mong đợi.
  file: `apps/agent/test/tro-ly-okr-cach-ly.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **CardTitle (a div) replaced section headings, so these sections are no longer headings and no longer match the h2 headings next to them**
  Người dùng thấy gì: Người dùng đọc màn hình sẽ không nhảy tới được khối «Trợ lý OKR» và hai tiêu đề con trong thẻ tóm tắt quản trị bằng phím tắt tiêu đề, dù chữ vẫn hiển thị bình thường cho mọi người.
  file: `apps/app/app/(app)/[slug]/settings/notifications/khoi-kenh.tsx`
  severity: low
  Đề xuất: known-limits

- **Ca «beginResearch thật giữ việc tóm tắt 3 phút» không thể đỏ khi beginResearch thôi gia hạn**
  Người dùng thấy gì: Nếu sau này ai đó bỏ bước rút ngắn thời gian giữ việc tóm tắt xuống 3 phút, không bài kiểm tra nào báo đỏ. Khi đó một việc tóm tắt bị đứt giữa chừng sẽ phải chờ lâu hơn nhiều mới được chạy lại.
  file: `apps/agent/test/tro-ly-okr-tom-tat-duong-do.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, thiếu ma trận ghim trước): số ca tự kiểm đọc từ chính thước, ma trận sáu khoá chép tay không ghim vào bảng nguồn**
  Người dùng thấy gì: Nếu sau này thêm một đơn vị tiền mới hoặc xoá bớt ca tự kiểm của thước đo số lệch, bài kiểm tra vẫn xanh. Thước đo có thể lặng lẽ bỏ sót một cách viết số mà người dùng sẽ nhập.
  file: `apps/api/test/tro-ly-okr-tom-tat-thuoc.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
