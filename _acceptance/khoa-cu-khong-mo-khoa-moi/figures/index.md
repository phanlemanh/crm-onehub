# Hình tại điểm quyết định — khoa-cu-khong-mo-khoa-moi (Cổng 1 + Cổng 1.5)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 phép kiểm là plugin đứng sau `apiKey()` | 4 bước nối tiếp (móc chung → móc plugin khoá → móc canh-khoa-api → endpoint) và 2 nhánh (cookie / header) | cần hình: `thu-tu-moc.html` |
| d-…-2 lượt dọn bằng `migration` có chốt bảng rỗng | 2 nhánh (bảng thành viên có người / rỗng) × 3 trạng thái khoá | cần hình: `luot-don.html` |
| d-…-7 lệnh xem trước chỉ-đọc | 3 bước nối tiếp (đọc migration → rút mệnh đề → đếm trong giao dịch chỉ-đọc) | gộp vào `luot-don.html` |
| d-…-3 siết E6/E7 tại chỗ | 1 bước | dưới ngưỡng: 1 bước, 0 nhánh |
| d-…-4, -5, -6, -8 bỏ bước có tên | 0 bước | dưới ngưỡng: 0 |

## Đề bài `thu-tu-moc`

- Loại: sơ đồ tuần tự (sequence), hai làn so sánh TRƯỚC vá / SAU vá.
- Nút: Lời gọi `POST /api/auth/api-key/create` (chỉ header `x-api-key`) · Móc chung `hooks.before` · Móc plugin khoá (dựng phiên từ header) · Phép kiểm tư cách · Endpoint tạo khoá.
- Trước vá: phép kiểm nằm trong móc chung → chạy TRƯỚC móc plugin khoá → thấy «chưa có phiên» → cho qua → endpoint ghi khoá (200, +1 dòng).
- Sau vá: phép kiểm là plugin đứng SAU plugin khoá → thấy phiên của chủ khoá → không có dòng member → 403 `NOT_A_MEMBER`, 0 dòng.
- AC: AC-1, AC-2, AC-3.

## Đề bài `luot-don`

- Loại: cây quyết định (flowchart) cho một dòng khoá.
- Rẽ 1: bảng thành viên rỗng? → có: giữ nguyên mọi khoá (AC-6).
- Rẽ 2: chủ khoá có dòng member? → có: giữ (AC-5).
- Rẽ 3: khoá đang `false`? → có: giữ, không đè thời điểm sửa; không (`true`/`null`): tắt (AC-5).
- Bên cạnh: «Xem trước» — đọc migration.sql → rút mệnh đề WHERE → đếm trong giao dịch chỉ-đọc → người ký thấy con số ở Cổng 2 (AC-9).
