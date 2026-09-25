---
slug: zalo-gio-theo-mui-gio-xuong
at: 2026-09-25T02:56:36Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E3 không có chứng cứ tiến trình app chạy UTC thật; ghi lệnh đã gõ không phải đầu ra tiến trình. Việc trang truyền `NHAC.muiGio` chỉ E3 đo | `TZ=UTC` không vào được tiến trình app trên Mac ở VN; trang truyền múi giờ của tiến trình thay `NHAC.muiGio`; E1, E2 xanh và ảnh E3 vẫn in 05:27, trong khi Vercel vẫn in 22:27 | Đo `TZ` thật của tiến trình qua PID; hoặc chụp chiều đỏ ở sha gốc | fixed: E3 đọc `TZ` từ môi trường thật của PID app (`ps eww`), khác UTC thì thoát mã 2 không chụp; với tiến trình UTC, chỉ trang truyền `NHAC.muiGio` mới ra 05:27 |
| P1 | design, contract | Không ghi định dạng hiện hành của `ngayGio` và chuỗi `en`; AC ghim «00:00» cho en trong khi en dùng đồng hồ 12 giờ | Bản sửa đúng múi giờ ra «12:00 AM»; ô en đỏ, người làm lặng lẽ đổi định dạng ngoài phạm vi | Ghi nguyên văn 6 chuỗi mong đợi đo từ định dạng hiện hành | fixed: đo trước khi sửa (TZ=UTC); AC-1, AC-2, E1, E2 và design ghim nguyên văn 6 chuỗi (vi «05:27 25-09», «23:59 24-09», «00:00 25-09»; en «09/25, 05:27 AM», «09/24, 11:59 PM», «09/25, 12:00 AM») |
| P2 | evals | E3 gieo `zaloPolledAt` nhưng không chặn bên ghi thật (nhịp kiểm của tác tử) và không đọc lại | Tác tử của checkout khác ghi đè `zaloPolledAt` giữa lúc gieo và lúc chụp; ảnh in giờ hôm nay, E3 đỏ không vì lỗi của vòng | Ghi PID tác tử đang chạy; đọc lại `zaloPolledAt` sau mỗi ảnh | fixed: E3 kiểm cổng 2000 và ghi PID/cwd tác tử; đọc lại `zaloPolledAt` sau mỗi ảnh, lệch thì gieo lại một lần, vẫn lệch là BLOCKED hạ tầng |
| P2 | contract, design | Trục C «trình duyệt» không có AC hay dòng ngoài phạm vi; design không liệt kê chỗ gọi `ngayGio` | Có component client gọi `ngayGio`; tham số bắt buộc buộc import `@crm/db` ở client, `next build` lỗi | Design liệt kê đủ chỗ gọi; trục C ánh xạ tường minh | fixed: đo `git grep` — chỗ gọi duy nhất là `page.tsx` (máy chủ); Coverage ánh xạ «trình duyệt» sang ngoài phạm vi |
