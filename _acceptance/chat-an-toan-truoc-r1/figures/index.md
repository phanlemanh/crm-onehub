# Điểm quyết định Cổng Phạm vi — chat-an-toan-truoc-r1

| Điểm | Đếm | Hình |
|---|---|---|
| Cửa sổ cache 5 phút: chấp nhận ngoại lệ có tên hay thêm thử lại trong lượt (gap-probe P1-2, human-gate1) | 2 nhánh rẽ → cần hình | `cua-so-cache.html` / `.png` |
| Luật vai đặt ở @crm/validation, không đổi packages/auth | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Chặn mọi phiên không có người | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Danh mục không đọc được thì giữ model đã chọn | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Đường đo bằng AgentEvent, không migration | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |
| Bỏ design-pass | dưới ngưỡng: 1 lựa chọn, 0 nhánh | — |

## Đề bài hình `cua-so-cache`

- Loại hình: luồng có hai nhánh (flowchart), chữ tiếng Việt.
- Nút: «Gateway gỡ model đã chọn» → «Danh mục trong bộ nhớ còn hạn?» → nhánh «còn hạn (≤5 phút)»: «Lượt chat vẫn hỏng — ghi model.khong-tim-thay» ; nhánh «hết hạn»: «Đọc danh mục mới → thiếu id → lùi model mặc định — ghi model.bi-go-lui, Cài đặt hiện hộp báo».
- Hai lựa chọn của người, vẽ cạnh nhánh «còn hạn»: (A) «Chấp nhận cửa sổ 5 phút như ngoại lệ có tên» — rẻ, giao kịp 10/10; (B) «Thêm thử lại trong lượt bằng model mặc định» — bịt cửa sổ, thêm khoảng nửa ngày và một lớp bọc model ở bước.
- AC liên quan: AC-6, AC-7, AC-11.
