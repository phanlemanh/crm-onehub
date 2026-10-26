# Hình tại điểm quyết định — ho-so-do-kiem-cheo (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 · bốn lỗi sản phẩm thật (d-20261022T104031Z-8) | 3 nhánh rẽ | `hoi-1-loi-san-pham.html` |
| Hỏi-2 · 11 ô «vòng này» theo nhánh trôi (d-20261022T104414Z-12) | 2 nhánh rẽ | `hoi-2-3-4-neo.html` (chung một hình với Hỏi-3, Hỏi-4) |
| Hỏi-3 · ghim lint cron-theo-ban-khai E7 (d-20261022T104414Z-13) | 3 nhánh rẽ | `hoi-2-3-4-neo.html` |
| Hỏi-4 · cron-theo-ban-khai E8 và Vercel (d-20261022T104414Z-14) | 2 nhánh rẽ | `hoi-2-3-4-neo.html` |

## Đề bài từng hình

### hoi-1-loi-san-pham
- Loại: cây quyết định (một câu hỏi, ba nhánh), mỗi nhánh có giá.
- Nút gốc: «73 ô đỏ ở mốc nền» → tách «69 ô: thước hỏng (vòng này sửa)» và «4 ô: sản phẩm hỏng thật» (8 bài test DOM khai lại kiểu ngôn ngữ · nhãn trường tự tạo thiếu đánh dấu không dịch · chữ Việt bị cắt 360px ở Cài đặt › Trường · nhãn giai đoạn ở Tổng quan).
- Ba nhánh của «4 ô»: (A, khuyên) hoàn lại 3 hồ sơ + 4 tín hiệu cho làn chủ, phần sửa răng ghi sẵn — giá: 3 hồ sơ còn đỏ tới khi hàng sửa gộp · (B) sửa luôn sản phẩm — giá: chạm vùng làn khác, vòng thành giao diện, +1/3 · (C) chỉ sửa 8 bài test DOM, hoàn lại 2 hồ sơ.
- AC: AC-7, AC-6.

### hoi-2-3-4-neo
- Loại: ba thẻ cạnh nhau, mỗi thẻ một câu hỏi, mỗi thẻ hai–ba lối, lối khuyên tô đậm.
- Hỏi-2 «11 ô đo phạm vi của vòng»: khuyên neo vào cặp gộp của từng hồ sơ (như F8) · lối khác khai not-run cả 11 (mất chốt ranh giới 9 hồ sơ).
- Hỏi-3 «ghim 3 cảnh báo lint, nay 36»: khuyên đo ở cặp gộp vòng cron · ghim lại 36 · dọn 33 cảnh báo.
- Hỏi-4 «cron thật trên production»: khuyên răng đòi bản production chứa cặp gộp + anh đăng nhập Vercel một lần · khai not-run (mất chốt).
- AC: AC-3, AC-4, AC-6.
