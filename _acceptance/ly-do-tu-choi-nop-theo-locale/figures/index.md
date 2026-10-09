# Hình tại điểm quyết định — ly-do-tu-choi-nop-theo-locale (Cổng 1)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 bỏ quét độ phủ | dưới ngưỡng: 1 bước | — |
| d-…-2 bỏ design-pass | dưới ngưỡng: 1 bước | — |
| d-…-3 giữ nguyên giá trị chuỗi của mã | dưới ngưỡng: 1 bước | — |
| d-…-4 bên ghi chặt, bên đọc lỏng | 4 bước nối tiếp + 2 nhánh (mã đã biết / lạ hay rỗng) | duong-ly-do.html |
| d-…-5 thước ranh giới tự tìm merge | 2 nhánh (đã lên onehub / nhánh còn mở) | neo-ranh-gioi.html |

## Đề bài duong-ly-do

- Loại hình: luồng trái sang phải, bốn chặng rồi rẽ hai nhánh.
- Nút: «Kara nộp, máy chủ từ chối» → «Agent ghi kết quả: lý do là một trong bảy mã, hoặc rỗng (mã lạ bị chặn ngay ở agent)» → «Lưu vào cuộc trò chuyện» → «Trang soạn đọc kết quả: lý do có trong bảy mã?» — CÓ: «Dòng hệ thống: Kara nộp bản nháp chưa được — <câu theo ngôn ngữ trang>» · KHÔNG (lạ hay rỗng): «Dòng hệ thống: Kara nộp bản nháp chưa được» (không lý do, không lộ chuỗi).
- Dải ví dụ dưới hình: tiếng Việt «… — chu kỳ đã rời pha «Lập kế hoạch»» · tiếng Anh «… — the cycle has left Planning» · trước khi sửa «… — chu ky khong o pha lap ke hoach».
- Chú thích nhỏ: bảy mã khai một chỗ (`LY_DO_TU_CHOI_NOP`, packages/validation); giá trị chuỗi giữ nguyên nên cuộc cũ mở lại vẫn ra câu.
- AC liên quan: AC-1, AC-2, AC-3, AC-4, AC-5.

## Đề bài neo-ranh-gioi

- Loại hình: quyết định một câu hỏi, hai nhánh.
- Nút: «Thước ranh giới K2c chạy» → «Hồ sơ đã lên onehub?» — CÓ: «Tìm merge đưa hồ sơ lên, đo diff của chính merge đó» · KHÔNG: «Đo từ điểm rẽ khỏi onehub tới đỉnh nhánh» → cả hai về «Mọi tệp đổi phải nằm trong ranh giới hàng hoặc danh sách đã duyệt».
- Dải ghi chú: vì sao — thước chỉ neo điểm rẽ tự hết hạn khi hồ sơ lên onehub (E13b của K2 đỏ khi ghim lại 08/10).
- AC liên quan: AC-8.
