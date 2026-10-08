# Hình tại điểm quyết định — Cổng Phạm vi K6b

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 lưu trữ có Hoàn tác ở K6b (anh đã chọn (a)) — luồng lưu trữ → toast → Hoàn tác → khôi phục, nhánh hoàn tác hỏng | 4 bước nối tiếp, 2 nhánh | luu-tru-hoan-tac |
| d-…-2 bỏ design-pass | 1 lựa chọn có/không | dưới ngưỡng: 0 bước, 0 nhánh |
| d-…-3 một khung «không tải được» dùng chung | 1 lựa chọn | dưới ngưỡng: 1 bước |
| d-…-4 bước Kara «chưa lưu», không in lý do tiếng Anh | 1 lựa chọn | dưới ngưỡng: 1 bước |
| d-…-5 cắt phần V2/K4b | danh sách cắt | dưới ngưỡng: 0 bước |
| d-…-6 bỏ «kèm lý do» khỏi ngưỡng | 1 lựa chọn | dưới ngưỡng: 0 bước |
| Coverage: hai dòng [NGÀNH] (Material Snackbar, NN/g) chờ gạch | 2 dòng | dưới ngưỡng |

## Đề bài hình `luu-tru-hoan-tac`

- Loại hình: luồng (flowchart) ngang, một nhánh rẽ.
- Nút: «Ngăn bản ghi đang dùng» → «Chọn Lưu trữ trong menu ⋯» → «Toast: Đã lưu trữ <tên>. · Hoàn tác» → rẽ hai:
  (a) «Bấm Hoàn tác» → «Khôi phục (gọi một lần)» → «Toast: Đã khôi phục <tên>. · ngăn về đang dùng»;
  (b) «Khôi phục hỏng» → «Toast: Chưa hoàn tác được. Bản ghi vẫn ở mục Đã lưu trữ.» → «Khôi phục từ menu».
  Nhánh phụ: «Không bấm» → toast tự tắt, bản ghi ở «Đã lưu trữ».
- Nhãn bằng chữ tiếng Việt như trên; chú thích nhỏ: «không hỏi trước — docs/vong-doi.md».
- AC liên quan: AC-5, AC-6.
