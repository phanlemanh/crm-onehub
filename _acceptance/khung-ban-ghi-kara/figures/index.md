# Hình tại điểm quyết định — khung-ban-ghi-kara (Cổng Phạm vi)

Điểm quyết định kê từ sổ quyết định chờ seal (6 dòng), lệch spec gốc, `[GIẢ ĐỊNH]` trong Coverage (không có),
finding gap-probe xử lý `human-gate1` (không có).

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 Hoàn tác chỉ cho quyết định của người, qua thủ tục API mới | 4 bước nối tiếp (nhận → biên nhận → Hoàn tác → máy chủ kiểm) + 3 nhánh rẽ ở máy chủ (đã đổi sau đó · người khác · hợp lệ) | cần hình: `hoan-tac.html` |
| d-…-2 Giá trị cũ do màn gửi lên | gộp vào hình hoàn tác (cùng luồng) | trong `hoan-tac.html` |
| d-…-3 Giữ MessageScroller, không KaraTranscript | 1 lựa chọn, không chuỗi | dưới ngưỡng: 0 bước, 1 nhánh |
| d-…-4 Thay ba eval đã ký bằng superseded_by | 4 bước nối tiếp (K4 ký Cổng 2 → khai not-run + superseded_by → ghim lại 11 hồ sơ → gộp) | cần hình: `thay-eval.html` |
| d-…-5 Khung tải lỗi dùng Empty + KaraRetry | 1 lựa chọn | dưới ngưỡng: 0 bước, 1 nhánh |
| d-…-6 Chạy design-pass | 1 lựa chọn | dưới ngưỡng: 0 bước, 1 nhánh |

## Đề bài hình 1 — `hoan-tac`

- Loại: luồng (flowchart) có nhánh, hai làn «Màn» và «Máy chủ».
- Nút: Đề xuất chờ dưới trường → bấm «Thêm vào hồ sơ» → dòng «Đã thêm theo Kara · Hoàn tác» → bấm Hoàn tác (màn gửi giá trị cũ) → máy chủ kiểm: (a) người hoàn tác không phải người đã quyết → từ chối, không đổi gì; (b) trường đã bị sửa sau lần nhận → từ chối, biên nhận đổi thành «Trường này đã đổi sau khi nhận — không hoàn tác được»; (c) hợp lệ → trường về giá trị cũ, đề xuất chờ lại, các đề xuất bị thay ở đúng lần nhận đó trở lại.
- Nhãn bằng chữ tiếng Việt, AC liên quan: AC-7, AC-8, AC-9.

## Đề bài hình 2 — `thay-eval`

- Loại: dòng thời gian / tiến trình 4 bước, kèm bảng nhỏ ba eval cũ → AC mới.
- Nút: (1) anh ký Cổng Bằng chứng của K4 → (2) ba eval cũ khai `status: not-run` + `superseded_by` (the-gop-y-okr/E10 → AC-6, logo-onehub/E14 → AC-1, ca màn cũ nen-kara → AC-6) → (3) ghim lại 11 hồ sơ đã ký có paths chạm vùng sửa, dưới khoá ghim-lai → (4) giám sát gộp.
- Ghi chú: thứ tự bắt buộc vì lối superseded_by chỉ hợp lệ khi hồ sơ thay đã có chữ ký người.
