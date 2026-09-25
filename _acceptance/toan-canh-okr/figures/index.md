# Hình tại điểm quyết định — toan-canh-okr (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Đếm «trưởng mở bảng họp tuần» qua bảng vết OKR (sổ d-20260925T211204Z-2, giả định Coverage) | 5 bước nối tiếp: trưởng mở bảng → okr.hopTuan → một dòng vết mỗi tuần → câu SQL → ngưỡng 23/11 | cần hình: `duong-do-mo-hop-tuan` |
| Hai nhịp trên một nhánh (sổ d-20260925T211204Z-6) | 4 bước nối tiếp + 1 rẽ: nhịp 1 → lượt 4 và vòng bốn điểm gộp → gộp onehub → nhịp 2 → S4 | cần hình: `hai-nhip` |
| Họp tuần đặt ở đâu (hướng A/B, giả định Coverage) | 2 nhánh rẽ | dưới ngưỡng: đã có trên bản mẫu (ST-hoptuan-codulieu / ST-hoptuan-tabrieng) |
| Sức khoẻ đặt ở đâu (hướng A/B, giả định Coverage) | 2 nhánh rẽ | dưới ngưỡng: đã có trên bản mẫu (ST-suckhoe-codulieu / ST-suckhoe-caidat) |
| «Trang cá nhân» = trang OKR của một người (sổ -7) | 1 bước | dưới ngưỡng: 1 |
| «KR thiếu khởi điểm» = KR của mục tiêu nháp (giả định Coverage) | 1 bước | dưới ngưỡng: 1 |
| Cây dùng @reui/tree (sổ -3) | 1 bước | dưới ngưỡng: 1 |
| Để sau năm biến thể Nhóm 2 (sổ -4) | 1 bước | dưới ngưỡng: 1 |
| okr.danhSach mới thay mở rộng byUnit (sổ -5) | 1 bước | dưới ngưỡng: 1 |
| Chạy design-pass không đồng bộ (sổ -1) | 1 bước | dưới ngưỡng: 1 |

## Đề bài hình

### duong-do-mo-hop-tuan

- Loại: luồng dữ liệu (data flow), trái sang phải.
- Nút: «Trưởng đơn vị mở Họp tuần» → «okr.hopTuan (máy chủ)» → «Bảng vết OKR: một dòng mo-hop-tuan mỗi trưởng × đơn vị × tuần, after = {donVi, tuan: "YYYY-MM-DD"}» → «Câu đếm ty-le-mo-hop-tuan.sql» → «Ngưỡng: ≥ 60% đơn vị có trưởng mở, tuần 16/11, đọc 23/11».
- Nhánh bị loại (nét đứt, gạch): «Telemetry — ẩn danh theo bản cài, gửi ra ngoài» và «Bảng mới — chạm prisma, thành T3».
- Chú thích: «thành viên thường mở: không ghi dòng».
- AC: AC-7, AC-8.

### hai-nhip

- Loại: dòng thời gian / luồng.
- Nút: «Nhịp 1 (ngay): packages/ui, danhSach, cây bàn phím, toàn cảnh tiến độ, sức khoẻ phần có sẵn» → «Chờ: lượt 4 lên onehub · vòng Sửa bốn điểm lên onehub» → «Gộp origin/onehub vào feat/toan-canh-okr» → «Nhịp 2: họp tuần + đếm mở bảng, heatmap, lọc tự tin, diễn biến, phần OKR của bạn, chọn chu kỳ, sức khoẻ phần cập nhật» → «implemented → năm lệnh chứng → báo phiên điều phối mở S4».
- AC nhịp 2: AC-6, AC-7, AC-9, AC-10, AC-12 và vế nhịp 2 của AC-1, AC-11.
