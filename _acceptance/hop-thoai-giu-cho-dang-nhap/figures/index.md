# Hình tại điểm quyết định — hop-thoai-giu-cho-dang-nhap

| Điểm | Đếm | Hình |
|---|---|---|
| Luồng đóng hộp theo trạng thái (d-…-1, d-…-2; AC-1, AC-2, AC-4, AC-5) | 2 nhánh (chưa / đã có thay đổi) rồi 2 nhánh (Tiếp tục sửa / Bỏ) | luong-dong-hop |
| Nút Huỷ nối qua nút đóng (d-…-4; AC-9) | dưới ngưỡng: 1 bước, không rẽ | — |
| Bỏ design-pass (d-…-3) | dưới ngưỡng: 1 lựa chọn | — |
| Bốn dòng [GIẢ ĐỊNH] của Coverage | dưới ngưỡng: mỗi dòng một có/không | — |
| Nền hạ tầng đỏ | dưới ngưỡng: danh sách | — |

## Đề bài: luong-dong-hop

- Loại hình: flowchart (một cửa vào, hai tầng rẽ nhánh).
- Nút: «Người đóng hộp» → rẽ theo đường: «Bấm ra ngoài» / «Esc · dấu X · nút Huỷ · vuốt» / «Lưu xong (máy đóng)».
- Mỗi đường rẽ tiếp theo «Chưa có thay đổi» (→ «Đóng như cũ») hoặc «Đã có thay đổi»: bấm ngoài → «Không làm gì, chữ còn»; Esc/X/Huỷ/vuốt → «Hỏi: Bỏ những gì vừa nhập?» → «Tiếp tục sửa → về ô đang gõ» hoặc «Bỏ → đóng». Lưu xong → «Đóng, không hỏi» bất kể trạng thái.
- Nhãn bằng chữ tiếng Việt như trên; ghi chú nhỏ: «Có thay đổi = đã gõ vào ô thường, hoặc chỗ gọi tự khai; ô tìm, ô lọc không tính».
- AC liên quan: AC-1, AC-2, AC-4, AC-5, AC-12.
