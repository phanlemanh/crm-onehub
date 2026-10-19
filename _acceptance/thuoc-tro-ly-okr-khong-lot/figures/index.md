# Điểm quyết định ở Cổng Phạm vi — thuoc-tro-ly-okr-khong-lot

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — số đo độ trễ trên màn (d-1) | 2 nhánh | cần hình: `bon-cau-hoi` |
| Hỏi-3 — không đọc được số dư (d-9, thay d-8 và d-2) | 2 nhánh | cần hình: `bon-cau-hoi` |
| Hỏi-4 — kho của bo-ca-mau-quy-4 (d-10, thay d-7 và d-3) | 2 nhánh | cần hình: `bon-cau-hoi` |
| Hỏi-2 — bỏ đường nền (d-4) | 2 nhánh | cần hình: `bon-cau-hoi` |
| Bỏ design-pass, đặc tả UX (d-5, d-6) | không màn | dưới ngưỡng |

## Đề bài hình `bon-cau-hoi`

Bốn câu hỏi, mỗi câu hai nhánh, nhánh khuyên đánh dấu «(khuyên)», mỗi nhánh một dòng lợi và một dòng phí. Nhãn tiếng Việt có dấu, chữ thường.
- Hỏi-1 «số đo độ trễ trên màn có tính lượt hỏng?» → «(khuyên) giữ như cũ, tách hàng riêng» (lợi: không đụng mã sản phẩm · phí: màn vẫn báo nhanh khi trợ lý hỏng hết) · → «đổi cả màn lẫn thước» (lợi: số đúng nghĩa · phí: đụng mã sản phẩm, ghim lại thêm hồ sơ).
- Hỏi-3 «không đọc được số dư?» → «(khuyên) cảnh báo, đo tiếp» (lợi: không dừng khi lỗi tạm · phí: lượt rỗng chỉ bị bắt sau khi đo) · → «chặn luôn» (lợi: chắc hơn · phí: lỗi tạm làm mọi lượt dừng).
- Hỏi-4 «sửa kho ở đâu?» → «(khuyên) ở hàm tạo kho dùng chung» (lợi: chữa luôn bo-ca-mau-quy-4 · phí: ra ngoài phạm vi đã duyệt) · → «chỉ ở thước E22» (lợi: đúng phạm vi · phí: bo-ca-mau-quy-4 giữ lỗi).
- Hỏi-2 «đường nền trước khi duyệt?» → «(khuyên) bỏ, lượt chấm chạy trọn suite» (lợi: nhanh · phí: đỏ có sẵn chỉ lộ ở lượt chấm) · → «chạy trên bản sạch» (lợi: nền rõ · phí: thêm khoảng 15 phút).
