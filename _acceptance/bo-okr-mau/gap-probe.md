---
slug: bo-okr-mau
at: 2026-09-28T04:45:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P1 | design, contract, evals | Chưa nói bộ mẫu ghi vào workspace nào, workspace thiếu thì sao; số chính xác của AC-1, AC-2, AC-14 chỉ đo trên kho sạch | Máy dev có sẵn 22 người, 2 phòng ban: cây và toàn cảnh lệch tệp mà E1, E2, E14 vẫn xanh vì đo kho sạch; kho _do có thể đẩy người mẫu về onboarding | Luật workspace đích; E1, E2 chạy thêm trên kho có hàng ngoài bộ mẫu; ca thiếu workspace; E14 khẳng định URL không phải onboarding | fixed: workspace đích là WORKSPACE_ID, thiếu thì thoát 4 bảo chạy db:seed, bộ nạp không đánh dấu onboard (design, AC-1); E1, E2 thêm lượt trên kho có sẵn người và phòng ban; E14 thêm bước URL không chứa /onboarding |
| P1 | evals | E7, E8 lấy danh sách bảng từ OKR_MAU.bang do chính bộ nạp khai; chưa thử xoá sau khi dịch vụ thật đã ghi lên thực thể mẫu | Một bảng quên khai thì còn hàng sau --xoa mà E8 xanh; sau khi mở họp tuần, dev:session, gửi Cập nhật tuần thì --xoa chết vì khoá ngoại hoặc để hàng mồ côi | Ma trận từ Prisma DMMF; chuỗi dùng rồi mới xoá; đối chứng dương | fixed: AC-8 và E8 viết lại — ma trận rút từ DMMF theo mã và cột *Id, chuỗi hopTuan → dev:session → gửi cập nhật → --xoa → nạp lại, ca hàng ngoài giữ người mẫu thoát 5 nêu bảng; design: xoá theo quan hệ, không theo tiền tố |
| P1 | contract, evals | AC-4 cho mọi người gửi cả tuần 6, AC-12 lại gửi thêm trong tuần 6 mà không nói hành vi | E12 đỏ hoặc kỳ vọng bị sửa sau duyệt; lượt 4, 8 không có người mẫu nào còn tuần hiện tại để gửi | Một người phụ trách chưa gửi tuần 6; E12 ghim weekStart, số lần trước/sau, submittedAt | fixed: kịch bản chua-gui (trưởng Pháp chế, năm tuần), AC-4 ghi ngoại lệ, AC-12 và E12 chạy trên người đó, ghim tuần T viết tay |
| P2 | evals | E4 chỉ thử một mốc; không khẳng định dấu thời gian không muộn hơn mốc | Nạp sáng thứ Hai hoặc tối Chủ nhật giờ VN: cập nhật tuần 6 nằm tương lai hoặc lệch tuần, mất KR tụt mà E4, E6 vẫn xanh | Bảng ba mốc viết trước, weekStart viết tay, mọi dấu thời gian ≤ mốc | fixed: E4 thành bảng ba mốc (thứ Hai 00:30, thứ Năm, Chủ nhật 23:30 giờ VN), weekStart viết tay, mọi createdAt, submittedAt, ngày chụp ≤ mốc; design: lần cập nhật đặt 09:00 thứ Hai, kẹp theo mốc |
| P2 | design, contract, evals | Design và contract lệch nhau về VERCEL_ENV; chưa thử VERCEL_ENV=development | Làm theo contract thì .env kéo từ Vercel làm máy dev bị từ chối; làm theo design thì E9 đỏ | Một câu chung; thêm ca development và rỗng | fixed: chặn VERCEL_ENV production và preview, cho development và rỗng khi máy chủ cục bộ — design, AC-9, E9 cùng câu; E9 thêm tiến trình con với VERCEL_ENV=development |
