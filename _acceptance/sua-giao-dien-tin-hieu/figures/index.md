# Điểm quyết định — Cổng Phạm vi của sua-giao-dien-tin-hieu

| Điểm | Đếm | Hình |
|---|---|---|
| Khai thay bốn ô đo của LT2 (d-1) | 4 bước nối tiếp: ô cũ khai không-chạy → AC mới đo lại → hồ sơ này có chữ ký người → ghim lại LT2 xanh; 2 nhánh rẽ (ô thứ năm đỏ → dừng) | cần hình: `thay-o-lt2` |
| Nút ⋮ 36 hay 44 (d-8, human-gate1) | 2 lối, 1 bước | dưới ngưỡng: 1 bước |
| Tên màn suy lúc hiện (d-3) | 1 bước | dưới ngưỡng: 1 bước |
| Gộp cột Màn và Gửi lúc (d-4) | 1 bước | dưới ngưỡng: 1 bước |
| Không báo quá trần trước lần gửi đầu (d-5) | 1 bước | dưới ngưỡng: 1 bước |
| Design-pass nấc 1, bỏ cảnh ngữ-cảnh (d-6, d-7) | 1 bước | dưới ngưỡng: 1 bước |

## Đề bài hình `thay-o-lt2`

- Loại hình: luồng (flowchart) trái → phải, một nhánh rẽ.
- Nút: «Bốn ô của LT2 nói điều cũ (đường dẫn trên hộp, lỗi dưới ô, dòng đã lấy về không có ⋮, ảnh hộp)» → «Khai không-chạy + trỏ AC-8, AC-2, AC-9, AC-10 của TH6» → «S3: chạy mọi eval của LT2 trên mã mới» → rẽ: «chỉ bốn ô đó đổi» → «Cổng Bằng chứng TH6: chủ kho ký» → «Ghim lại LT2 + TH4 cùng PR, xanh»; rẽ kia: «ô thứ năm đỏ» → «Dừng, trình chủ kho».
- Nhãn bằng chữ thường, tiếng Việt; ghi chú dưới: «Ô khai thay chỉ hợp lệ khi TH6 có chữ ký người — nên Cổng Bằng chứng là cổng người».
- AC liên quan: AC-2, AC-8, AC-9, AC-10, AC-11.
