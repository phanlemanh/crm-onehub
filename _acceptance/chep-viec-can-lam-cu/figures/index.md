# Hình tại điểm quyết định — chep-viec-can-lam-cu (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — chạy chép trên production bằng lệnh riêng (d-20261013T083952Z-1), cùng thứ tự lên và lùi | sáu bước nối tiếp (api migrate → đếm → chạy thử → chạy → đếm → dán #375) và hai nhánh rẽ (lùi chỉ dữ liệu · lùi cả mã) — vượt N5 | `luong-chep-production` |
| Hỏi-2 — người tạo không còn nhận được việc (d-20261013T084313Z-14) | một bảng 2×2, không bước nối tiếp | dưới ngưỡng: 0 bước, 0 nhánh rẽ (bảng trong design doc) |
| Hỏi-3 — đảo giữ bản đã đổi (d-20261013T083952Z-3) | một nhánh rẽ (có cờ / không cờ) — nằm trong nhánh «lùi» của hình trên | dưới ngưỡng: 1 nhánh |
| Hỏi-4 — bỏ thẻ «Sắp tới», «Đã xong» (d-20261013T083952Z-4) | không bước, không nhánh | dưới ngưỡng: 0 |
| Hỏi-5 — việc chưa chép chỉ đọc, bỏ activities.complete (d-20261013T084313Z-15) | một nhánh rẽ | dưới ngưỡng: 1 nhánh |
| Hỏi-6 — activities.create TASK trả 400 (d-20261013T084313Z-16) | một nhánh rẽ | dưới ngưỡng: 1 nhánh |

## Đề bài `luong-chep-production`

- Loại hình: luồng (flowchart) dọc, một làn chính + hai nhánh lùi.
- Nút làn chính: «Gộp vào onehub» → «api dựng xong, migration chạy (✓ schema matches)» → «Đếm: bun run viec:chep-cu» → «Chạy thử: --chay --thu --nguoi <quản trị> — loi phải rỗng» → «Chạy thật: --chay --nguoi <quản trị>» → «Đếm lại; dán hai bản in vào #375» → «Vế 1 của ngưỡng: banChep sau = taskTong trước».
- Nhánh A «Lùi chỉ dữ liệu»: «--dao» → «bản chép đã đổi còn lại, in ở giuLai» → «--dao --ca-ban-da-doi nếu muốn bỏ cả» → «việc cũ hiện lại chỉ đọc».
- Nhánh B «Lùi cả mã»: «--dao TRƯỚC» → «rồi mới lùi mã» ; nhãn cảnh báo: «lùi mã khi bản chép còn = một việc hiện hai lần».
- Một nút bên lề «Sau 14 ngày: --tu <ngày gộp> → taskTaoSau = 0 (vế 2)».
- AC liên quan: AC-1, AC-2, AC-4, AC-10, AC-12.
