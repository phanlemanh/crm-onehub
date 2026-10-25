# Hình tại điểm quyết định — truong-chuan-o-cai-dat

| Điểm | Đếm | Hình |
|---|---|---|
| Thứ tự trộn trên một trục position (d-4) và Hỏi-1 lưu bố trí bằng bảng mới | 4 bước nối tiếp (Cài đặt kéo → fields.reorder → hai bảng → phiếu đọc fields.layout) + 2 nhánh (T3 bảng mới · T2 không lưu) | `thu-tu-tron.html` |
| Hỏi-2 «Bắt buộc» chỉ trường tự tạo | dưới ngưỡng: 2 lối, mỗi lối một câu, không bước nối tiếp | — |
| Hỏi-3 công tắc trên hàng | dưới ngưỡng: 2 lối trên cùng một màn | — |
| Hỏi-4 bắt buộc luôn hiện | dưới ngưỡng: 2 lối, một luật | — |
| Hỏi-5 danh sách = mục Chi tiết | dưới ngưỡng: 2 lối, một danh sách | — |
| Hỏi-6 ẩn chỉ mục Chi tiết | dưới ngưỡng: 2 lối, một luật | — |

## Đề bài `thu-tu-tron`

- Loại hình: sơ đồ luồng dữ liệu (data flow), trái sang phải, kèm một nhánh rẽ ở dưới.
- Nút: «Cài đặt › Trường — một danh sách trộn» → «fields.reorder {standard:key} | {custom:id}» → hai kho: «StandardFieldLayout (mới, migration chỉ thêm)» và «FieldDefinition.position» → «fields.layout» → «Phiếu: mục Chi tiết theo thứ tự, bỏ hàng ẩn».
- Ghi chú trục: chưa sắp lần nào thì trường chuẩn mang position âm (đứng trước), trường tự tạo ≥ 0.
- Nhánh Hỏi-1: lối khuyên «T3: bảng mới» (đường chính) · lối khác «T2: không lưu → sắp lại và ẩn sang hàng mới» (đường đứt, dừng ở Cài đặt chỉ đọc).
- AC liên quan: AC-2, AC-3, AC-7.
