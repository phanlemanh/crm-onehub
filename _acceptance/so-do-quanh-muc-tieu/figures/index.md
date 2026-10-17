# Hình tại điểm quyết định — so-do-quanh-muc-tieu (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — lối vào: nút trong ngăn chi tiết hay liên kết ở hàng bảng | 2 nhánh rẽ | `hinh-1-loi-vao` |
| Luồng chính — ngăn → trang sơ đồ → bấm thẻ → ngăn của thẻ (đổi tâm) | 3 bước nối tiếp | `hinh-2-trang-quanh` |
| Hỏi-2 — bỏ hay giữ bản mẫu bấm được trước Cổng Phạm vi | 2 nhánh rẽ | `hinh-3-ban-mau` |
| Bảy lựa chọn máy đã quyết ở bước thiết kế (trang riêng, truy vấn mới, lên hết/xuống một bậc, dòng góp lên công ty, bấm mở ngăn, danh sách dưới md, tệp chữ mới) | mỗi lựa chọn 1 bước, 0 nhánh hở | dưới ngưỡng: 1 |

## Đề bài

### hinh-1-loi-vao (so sánh hai lối, dạng hai cột/nhánh)
- Gốc: «Trưởng đơn vị đang xem một mục tiêu».
- Nhánh A (máy khuyên): «Ngăn chi tiết mục tiêu» → nút «Xem quanh mục tiêu» → trang sơ đồ. Nhãn giá: «có ở mọi chỗ mở ngăn (Toàn cảnh, Của tôi, Theo đơn vị, sơ đồ đơn vị)» · «chạy lại 32 lệnh kiểm của 13 hồ sơ đã ký mỗi lượt chấm, ~25 phút máy (ước)».
- Nhánh B: «Hàng mục tiêu ở bảng Theo đơn vị» → chữ «góp vào n chỗ» thành liên kết → trang sơ đồ. Nhãn giá: «chỉ vào được từ bảng» · «lệch câu giao (lối vào từ ngăn chi tiết)» · «5 lệnh kiểm, ~4 phút máy (ước)».
- AC liên quan: AC-4, AC-12.

### hinh-2-trang-quanh (khung trang, dạng wireframe đơn giản)
- Đầu trang: «Sơ đồ quanh mục tiêu» + một câu mô tả.
- Dòng «Đang xem quanh: Sơ đồ · A1 góp mục tiêu khối A».
- Dòng nổi bật: «Góp lên công ty qua KR «Doanh thu năm…» của mục tiêu «…»» (đánh dấu: đây là câu trả lời cho ngưỡng 10 giây).
- Khung vẽ, từ trên xuống: thẻ mục tiêu công ty (nhãn «Công ty») → thẻ KR công ty (nhãn «Công ty») → thẻ mục tiêu bộ phận «Khối A» → thẻ TÂM (viền đậm) → hàng dưới: hai thẻ KR của tâm + một thẻ «mục tiêu góp vào nó».
- Chú thích bên lề: «rê chuột lên thẻ → đường qua thẻ sáng, phần khác mờ» · «bấm thẻ → mở ngăn chi tiết của thẻ đó, ngăn có nút đổi tâm» · «dưới 768px: danh sách bốn nhóm thay khung vẽ».
- AC liên quan: AC-1, AC-2, AC-5, AC-6, AC-7, AC-8.

### hinh-3-ban-mau (hai nhánh, dạng dòng thời gian ngắn)
- Nhánh A (máy khuyên — bỏ): Cổng Phạm vi duyệt bằng hình 2 + bảng trạng thái → dựng → Cổng Bằng chứng có 4 ảnh màn thật (ngăn→sơ đồ, góp hai chỗ, rê chuột, danh sách 390) → còn sửa được trước khi ký.
- Nhánh B (giữ): dựng bản mẫu ba phần mới (dòng góp lên công ty, nhóm «Góp vào nó», nút trong ngăn) ~1 giờ máy → Cổng Phạm vi duyệt trên bản bấm được → dựng.
- AC liên quan: AC-5, AC-11.
