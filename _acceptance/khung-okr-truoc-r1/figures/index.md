# Điểm quyết định — khung-okr-truoc-r1 (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Chạy design-pass, gửi ảnh nấc 1 | dưới ngưỡng: 1 bước | — |
| KH1 bảng giữ viền, thêm lề 20 px | dưới ngưỡng: 1 bước | ảnh design-pass `ST-khung-kr` |
| KH2 chữ phụ vào popover, nhóm soạn cuối thanh + R1m-5 chưa cấu hình theo vai | cần hình: 8 dạng × 2 nhánh vai | `nut-soan.html` |
| KH4 cả khung cuộn, tab dính | cần hình: 3 bước nối tiếp (mở → cuộn → tab dính) | ảnh design-pass `ST-khung-dienthoai` + `-cuon` |
| Khung khác giữ đầu khung đứng yên (descope) | dưới ngưỡng: 1 bước | — |
| G1 chữ chip để sau (descope) | dưới ngưỡng: 1 bước | — |
| Không chạy lại eval hồ sơ khác (descope) | dưới ngưỡng: 1 bước | — |
| Liên kết chéo hỏi lại trước khi bỏ thay đổi | cần hình: 2 nhánh (ở lại / bỏ) + nhánh không thay đổi | `hoi-lai.html` |
| [GIẢ ĐỊNH] khổ 768 theo nhánh máy tính | dưới ngưỡng: 1 bước | — |

## Đề bài hình

### nut-soan
- Loại: sơ đồ quyết định (cây), trái → phải.
- Nút: «Theo đơn vị, pha lập kế hoạch» → nhánh «máy chủ đã cấu hình soạn?» → Có: bảy dạng (đang tải · mở được · có cuộc đang soạn · chế độ ẩn · hết cuộc · tạm nghỉ · chưa có khoá), mỗi dạng ghi nút chính hiện gì + popover «i» chứa gì; Không: nhánh vai → quản trị: nút khoá + «i» «chưa bật trên máy chủ này»; người khác: không có nút.
- Ghi chú chung: nhóm soạn luôn ở cuối thanh, thanh một hàng, không chữ phụ ngoài popover.
- AC: AC-2, AC-3, AC-4.

### hoi-lai
- Loại: sơ đồ luồng.
- Nút: hộp «Mức hiển thị» → chọn Giới hạn + thêm người xem → Lưu → máy chủ từ chối vì có căn chỉnh → nút «Mở tab Căn chỉnh» → có thay đổi chưa lưu? → Có: hộp hỏi «Bỏ thay đổi?» → «Ở lại» (hộp giữ nguyên, tab không đổi) / «Bỏ» (hộp đóng, sang tab Căn chỉnh); Không: sang tab Căn chỉnh ngay.
- Ghi so sánh: hôm nay nhánh «Có» đi thẳng và mất thay đổi.
- AC: AC-12.
