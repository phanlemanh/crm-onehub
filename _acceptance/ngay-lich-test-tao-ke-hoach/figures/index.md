# Điểm quyết định ở Cổng Phạm vi — ngay-lich-test-tao-ke-hoach

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — cách tránh trùng ngày hôm nay (d-6 thay d-1) | 2 nhánh rẽ | cần hình: `hoi-1` |
| Quét hai trục ngày và giờ (d-7 thay d-2) | 1 lối | dưới ngưỡng: 1 |
| Dùng lại đường nền cùng sha (d-5) | 1 lối | dưới ngưỡng: 1 |
| Bỏ design-pass, bỏ đặc tả UX (d-3, d-4) | không màn | dưới ngưỡng: 0 |

## Đề bài hình `hoi-1`

- Loại: một câu hỏi, hai nhánh, mỗi nhánh một hệ quả.
- Nút gốc: «Hỏi-1: tránh trùng ngày hôm nay bằng cách nào?»
- Nhánh 1 «(khuyên) chọn ngày 16 khi hôm nay là 15» → «một dòng, kịp gộp trước 00:00Z, thước 8 ô đã xanh; còn rủi ro nếu lịch tô khác một ngày khác hôm nay».
- Nhánh 2 «ghim đồng hồ trong riêng bài tao-ke-hoach» → «bền với mọi ngày; phải viết lại phần chọn ngày và chạy lại thước, có thể lỡ 00:00Z».
- Nhãn tiếng Việt có dấu, chữ thường; AC liên quan: AC-1, AC-2.
