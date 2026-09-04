# Điểm quyết định của Cổng 1 — cua-vao-noi-tieng-viet

Kê từ hồ sơ cuối S1, không hỏi người. Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai
nhánh rẽ thì cần hình.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Luật chọn tiếng (AC-9) — hai đầu vào, năm ô, có thứ tự ưu tiên | **5 nhánh** | `luat-chon-tieng` |
| Đổi `DEFAULT_LOCALE` sang `vi` | 2 nhánh (đổi / giữ) | dưới ngưỡng: 2 |
| Bỏ dòng chân Comp AI | 3 nhánh, nhưng người đã chọn ở lượt trước | dưới ngưỡng: đã chốt |
| Không dịch `DEFAULT_WORKSPACE_NAME` | 2 nhánh (dịch → T3 / không dịch → T2) | dưới ngưỡng: 2 |
| Chuỗi lỗi máy chủ ra ngoài phạm vi | 2 nhánh | dưới ngưỡng: 2 |
| Bỏ phiên design-pass | 2 nhánh | dưới ngưỡng: 2 |
| Dựng sổ khai sinh ngay vòng đầu | 2 nhánh | dưới ngưỡng: 2 |

Một điểm vượt ngưỡng.

## Đề bài hình `luat-chon-tieng`

- Loại: sơ đồ quyết định, đọc từ trên xuống.
- Nút: `Có cookie lang?` → nhánh có: `Giá trị hợp lệ?` (có → dùng chính nó ·
  không → mặc định) · nhánh không: `Có Accept-Language?` → có: `Khớp vi hay en?`
  (khớp → dùng cái khớp · không khớp → mặc định) · không: mặc định.
- Nhãn kết: `vi` · `en` · `mặc định = vi (đổi từ en, 04/09)`.
- Năm ô của trục C phải nhận ra được trên hình, mỗi ô một đường đi.
- Tiêu chí liên quan: AC-9, đo bởi E9 (hàm thuần, năm khẳng định) và E18 (máy chủ
  thật, ba lượt yêu cầu).
