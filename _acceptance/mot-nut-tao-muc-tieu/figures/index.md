# Hình tại điểm quyết định — mot-nut-tao-muc-tieu

Ngưỡng N5: từ ba bước nối tiếp hoặc từ hai nhánh rẽ thì cần hình.

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 hộp thoại thay menu xổ | 1 lựa chọn, không nhánh | dưới ngưỡng: 1 |
| d-…-2 Lấy ý kiến bỏ nút | 1 bước | dưới ngưỡng: 1 |
| d-…-3 Hỏi Kara ở lại | 1 bước | dưới ngưỡng: 1 |
| d-…-4 khoá kèm lý do thay vì ẩn | 2 nhánh (mở được · khoá) × 2 đường | luong-hop-chon |
| d-…-5 bỏ nút chéo trong ngăn | 1 bước | dưới ngưỡng: 1 |
| d-…-6 bấm dòng là đi luôn | 1 bước | dưới ngưỡng: 1 |
| d-…-7 Của tôi chuyển sang Bộ OKR | 4 nhánh từ hộp, 3 bước nối tiếp | luong-hop-chon |
| d-…-8 Mang sang ở lại màn chấm | 1 bước | dưới ngưỡng: 1 |
| d-…-9 Hỏi-1 thước 11 hồ sơ đã ký | 3 nhánh (superseded_by · sửa thước · hoãn) | ba-loi-ho-so-da-ky |
| d-…-10 bỏ design-pass (bị thay bởi d-…-11) | — | — |
| d-…-11 Hỏi-2 duyệt bằng hình hay dựng bản mẫu | 2 nhánh, giá mỗi nhánh ghi một dòng trên thẻ | luong-hop-chon (chính là hình duyệt bằng mắt) |
| d-…-12 Hỏi-3 hiện khoá hay ẩn (thay d-…-4) | 2 nhánh | luong-hop-chon (các dòng KHOÁ) |

## Đề bài hình

### luong-hop-chon

- Loại: sơ đồ luồng (flowchart), trái sang phải.
- Nút: hai điểm vào «Của tôi» và «Bộ OKR» → «Thêm mục tiêu» → «Hộp chọn: đơn vị đích» → bốn nhánh Tự viết · Từ mẫu · Từ bảng tính · Soạn cùng Kara → đích của từng nhánh (ngăn tạo · ngăn bước chọn mẫu · hộp nhập · khung bản ghi Kara). Từ Của tôi, ba nhánh đầu đi qua «sang Bộ OKR của đơn vị đích»; Soạn mở tại chỗ.
- Nhánh khoá: Từ mẫu khoá khi chưa có mẫu; Soạn khoá khi ngoài pha lập kế hoạch hay Kara bị khoá; «Tiếp cuộc đang soạn» khi có cuộc mở.
- Ghi chú bên: Lấy ý kiến · Sức khoẻ · Sơ đồ — không có nút tạo.
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7.

### ba-loi-ho-so-da-ky

- Loại: bảng so ba lối (quadrant hoặc ba cột).
- Lối A (khuyên): khai superseded_by ở eval gãy, trỏ AC VK9, ghim lại 11 hồ sơ — ~3–5 giờ máy, kịp mốc 26/10.
- Lối B: sửa thước như VK4, đo hai chiều từng hồ sơ — ~6–10 giờ máy.
- Lối C: giữ thước, «đỏ sẵn trên nền», hoãn PR tới kit K-A — lỡ mốc 26/10.
- AC liên quan: AC-1, AC-2, AC-4–AC-7.

## Ghi chú xuất ảnh

PNG chụp bằng Chrome headless từ tệp HTML cạnh nó; `export-diagram` không chạy vì máy thiếu Playwright cho Python.
