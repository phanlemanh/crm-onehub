# Điểm quyết định ở Cổng Phạm vi — tran-cho-app-rieng

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — trần riêng 30 s hay trần chung (d-7) | 2 nhánh rẽ | cần hình: `hai-cau-hoi` |
| Hỏi-2 — bỏ đường nền hay chạy trên bản sạch (d-9) | 2 nhánh rẽ | cần hình: `hai-cau-hoi` |
| Chỗ đặt hằng (d-6), cách làm chậm (d-8), bỏ design-pass và đặc tả UX (d-4, d-5) | 1 lối | dưới ngưỡng |

## Đề bài hình `hai-cau-hoi`

- Loại: hai câu hỏi, mỗi câu hai nhánh, mỗi nhánh một dòng lợi và một dòng phí.
- Hỏi-1 «trần chờ cho bài chạy cạnh apps/agent?» → «(khuyên) trần riêng 30 giây cho đúng bài này» (lợi: theo lời giao, bài khác giữ trần cũ để còn bắt chậm bất thường · phí: bài khác chậm tương tự vẫn đỏ) · → «trần chung cho cả tệp» (lợi: phủ mọi bài · phí: che chậm bất thường ở bài khác).
- Hỏi-2 «đường nền trước khi duyệt?» → «(khuyên) bỏ, để lượt chấm chạy trọn suite» (lợi: nhanh, gỡ chặn #406 sớm · phí: đỏ có sẵn trên onehub chỉ lộ ở lượt chấm) · → «chạy trên bản sạch của onehub» (lợi: nền rõ ràng · phí: thêm khoảng 15 phút và một lượt khoá).
- Nhãn tiếng Việt có dấu, chữ thường. AC liên quan: AC-1, AC-2 (Hỏi-1), mọi AC (Hỏi-2).
