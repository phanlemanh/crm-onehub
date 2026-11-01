---
slug: nguong-gia-tri-mat-giao-dien
at: 2026-10-31T15:10:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | rang/ap-de-xuat.mjs, E2 | Viết lại khuôn làm mất ý cũ mà không thước nào bắt — bộ đọc khuôn coi chữ sai khuôn là ô trống | zalo mất hai vế SỐNG, the-gop-y-okr thêm ngưỡng mới, E2 vẫn xanh | Liệt vế cũ, đọc gốc bằng bộ đọc rộng | fixed: chuẩn hoá cơ học (docRong) chép nguyên văn, giữ nhãn; E2 đọc hai phía bằng docRong, dòng chuẩn-hoá phải bằng chữ cũ; đối chứng dương bắt mất vế b |
| P1 | sổ S1, E3 | Gắn lại [đề xuất] lên ngưỡng chủ kho đã duyệt 08/10 | Chốt xong ngưỡng đã khác lúc duyệt | Hỏi riêng; E3 chiều ngược | fixed: chuẩn hoá giữ nhãn cũ nên ô đã duyệt không mang [đề xuất]; E2 bắt «gắn lại [đề xuất] lên ô không đề xuất» |
| P1 | contract, bảng | Không AC nào đòi timebox còn hạn; 6 đã qua, 11 không ra ngày | Phiên nghiệm thu mở đã quá hạn | AC timebox + miễn trong sổ | fixed: AC-6, E6 (timebox.mjs) với miễn `mien_timebox`; Hỏi-4 cho 17 hồ sơ |
| P1 | bảng, E4 | 8 hồ sơ có ô do kit tự sinh đo tiêu chí dựng; E4 thiếu schema.prisma | Cổng Giá trị đọc eval máy thay số người dùng | E4 phủ cả ô ấy, thêm schema | fixed: máy soạn lại 8 hồ sơ (loại «thay đề xuất kit tự sinh»), E4 thêm schema.prisma và hỏi «đo giá trị, không phải tiêu chí dựng» |
| P1 | contract AC-1, Hỏi-1/2/3 | AC không rẽ nhánh theo câu trả lời ở Cổng Phạm vi | Chọn lối khác lời khuyên thì S4 REJECT | AC-1 theo nhánh, E1 đọc loại trừ | fixed: AC-1 nói chốt ở cổng nào cũng chấm sau chốt; E1 đọc `ngoai_ac1` mang tên người; bo-nhan.mjs là bước sau chốt |
