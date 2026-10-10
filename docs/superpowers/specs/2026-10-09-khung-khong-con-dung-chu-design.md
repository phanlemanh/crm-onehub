# Khung «Bản ghi này không còn» không nói chắc nguyên nhân — design (K4c `khung-khong-con-dung-chu`)

Ngày 2026-10-09 · làn P6 đợt sau-14-10 · hạng T2 · Cổng Đáng `build` theo luật 26 (Ngoài-2 của K4b, Cổng 2 2026-10-09T05:25:03Z).

## Bối cảnh

Khung lỗi «không còn» (K4b, `record-parts.tsx` đọc `karaBanGhiMessages().khung.khongCon`) hiện khi máy chủ trả NOT_FOUND. Câu mô tả cũ khẳng định có người đã xoá vĩnh viễn, nhưng NOT_FOUND còn đến từ Xoá thường và từ đường dẫn sai/cắt cụt.

## Thiết kế

Chỉ đổi chuỗi `khung.khongCon.moTa` trong `apps/app/lib/messages/kara-ban-ghi.ts` (anh chọn A, 2026-10-09):

- vi: «Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.»
- en: «It may have been deleted, or the link is wrong.»

Câu nêu khả năng, không khẳng định nguyên nhân, và gợi ý người đọc kiểm đường dẫn. «xoá» dùng đúng nghĩa trong `CONTEXT.md` (làm mất bản ghi), không nói «xoá vĩnh viễn». Tiêu đề, nút «Đóng», các khung khác (không có quyền, mất kết nối) giữ nguyên. Không đổi thành phần.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở liên kết tới bản ghi không còn (`?record=contact:<id>`) → ngăn hiện khung «Bản ghi này không còn» với câu mô tả mới → bấm «Đóng» (điểm ra: ngăn đóng).
- Biên: đường dẫn gõ sai hay bị cắt cụt hiện cùng khung, cùng câu — câu không còn nói sai.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung «không còn» trong ngăn bản ghi | báo bản ghi không mở được | liên kết bản ghi / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-khong-con | Ngăn bản ghi | tiêu đề «Bản ghi này không còn», câu «Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.», nút «Đóng» | kiểm đường dẫn hoặc đóng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi hành vi; chỉ đổi chữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Khung lỗi của `record-parts.tsx` | dùng | khung có sẵn từ K4b, chỉ đổi chữ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi khuôn — khung nằm trong ngăn chi tiết có sẵn.
<!-- UX-SPEC-TEMPLATE>>> -->
