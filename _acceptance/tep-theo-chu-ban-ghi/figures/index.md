# Hình tại điểm quyết định — tep-theo-chu-ban-ghi

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — URL đã cấp trước lúc đổi người phụ trách | 4 bước nối tiếp (A bấm Mở → URL 300 giây → Q đổi sang B → A vẫn tải được tới hết hạn) | `quyen-di-theo.png` |
| Hỏi-2 — ai xoá được tệp | 3 nhánh rẽ (khuyến nghị · lối a · lối b) | `ai-xoa-duoc.png` |
| Hỏi-5 — ngưỡng Đường đo | dưới ngưỡng: 1 bước, 0 nhánh | — |
| Hỏi-3 — bỏ design-pass | dưới ngưỡng: 1 bước, 0 nhánh | — |
| Hỏi-4 — người phụ trách đã rời nhóm, để sau | dưới ngưỡng: 1 bước, 0 nhánh | — |

## Đề bài `quyen-di-theo`

- Loại hình: dòng thời gian ngang, hai làn người (A, B) và một làn máy chủ.
- Nút: «A phụ trách — Mở bật» → «A bấm Mở, nhận URL (sống 300 giây)» → «Q đổi Phụ trách sang B» → «Lời gọi kế: A bị từ
  chối, B mở được» ; nhánh phụ dưới làn A: «URL A đã cầm vẫn tải được tới hết 300 giây (Hỏi-1, Known limits)».
- Nhãn bằng chữ tiếng Việt; tô nhẹ vùng «cửa hở ≤ 300 giây».
- AC liên quan: AC-1, AC-2, AC-7.

## Đề bài `ai-xoa-duoc`

- Loại hình: bảng ba cột lựa chọn (Khuyến nghị · Lối a · Lối b), mỗi cột một ô «Trước khi đổi» và «Sau khi đổi sang B».
- Nút: ba người Q (quản trị), A (phụ trách), B (nhân viên) × ba tệp fA, fB, fQ (người tải); ô ghi «xoá được» hay «không».
- Đáp án: Khuyến nghị — trước: Q ba, A ba, B chỉ fB; sau: Q ba, A chỉ fA, B ba. Lối a (luật DA19) — trước = sau: Q ba,
  A chỉ fA, B chỉ fB. Lối b — trước: Q ba, A ba, B không; sau: Q ba, A không, B ba.
- Chú thích dưới mỗi cột: giá của lối (một câu, lấy từ Hỏi-2 của design doc).
- AC liên quan: AC-4.
