---
slug: onboarding-giong-deals
at: 2026-09-22T14:23:01Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-4 đi qua máy chủ mà thiếu (cross-layer); E5 chỉ đọc đầu vào gửi cho tRPC giả; vế «menu Sắp xếp chọn Ngày» chưa có khẳng định | Máy chủ bỏ qua dir với startedAt: mũi tên báo giảm dần mà thứ tự không đổi, E5 vẫn xanh | Gắn (cross-layer); eval backend-effect gieo 3 kế hoạch, so ba lượt gọi; E5 thêm aria-checked | fixed: AC-4 gắn (cross-layer), thêm E16 (backend-effect, sap-hai-chieu), E5 thêm ca menu Sắp xếp |
| P1 | contract | Trạng thái chưa có kế hoạch, không khớp, chưa có khuôn không có AC dù lượt sửa chạm đúng chỗ đó | Nút đầu trang chỉ hiện khi có hàng: người dùng mới không tạo được kế hoạch nào, mọi eval xanh | Thêm AC và eval dom 3 ca, mỗi ca ghim thông điệp | fixed: thêm AC-14 và E17 (trang-thai-trong, 6 khẳng định) |
| P1 | evals | Fixture E8, E12 viết tay đúng khuôn bên đọc, không qua schema của bên ghi [ke-hoach-la-mot-ban-ghi#F1] [dieu-phoi-30-ngay-dau#F1] | createFromTemplate thật trả id khác chỗ: mở plan:undefined mà E12 vẫn xanh | Giá trị giả đi qua danhMucOutput.parse và planOutput.parse; so id với biến đã parse | fixed: E8, E12, E17 dựng dữ liệu qua schema đầu ra thật; E12 so với id của giá trị đã parse |
| P2 | evals | Ma trận E11 chỉ một bộ lọc; E6 thiếu thanh công cụ, dấu tải, trạng thái giả «không kết quả» | Người cầm vẫn kèm « · 3» mà E11 xanh; lần tải đầu nhấp nháy «không kết quả» mà E6 xanh | E11 3×2 = 6; E6 7 khẳng định ghim | fixed: E11 3 bộ lọc × 2 ca; E6 7 khẳng định viết trước |
| P2 | evals | Thước man-danh-muc.mjs không ghim ma trận 30 ô / 80 khẳng định; th không đọc được nhãn bị coi là không cắt | CHI_MAN sót trong môi trường cho 30/30 thoát 0; nhãn ra ngoài span.truncate thì AC-3 xanh dù chữ bị cắt | Hằng O_MONG, KY_MONG; CHI_MAN dưới cổng thoát 2; nhãn không đọc được báo hỏng; đo thêm th.scrollWidth | fixed: thêm O_MONG=30, KY_MONG=80, DUOI_CONG chặn CHI_MAN, báo «khong doc duoc nhan», đo th.scrollWidth |
