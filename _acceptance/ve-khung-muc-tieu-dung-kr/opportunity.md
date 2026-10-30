---
schema_version: 1
slug: ve-khung-muc-tieu-dung-kr
feature: Trưởng đơn vị đi ‹ › trong ngăn KR mở từ bảng Họp tuần sang một KR thuộc mục tiêu khác, bấm «Về khung mục tiêu» và mở đúng mục tiêu của KR đang xem
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-30T03:11:43Z
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT6 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: chưa có trang: trang nền, trang đợt okr-hop-tuan-2210
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Trưởng đơn vị đi ‹ › trong ngăn KR mở từ bảng Họp tuần sang một KR thuộc mục tiêu khác, bấm «Về khung mục tiêu» và mở đúng mục tiêu của KR đang xem

Vì sao: Ngoài-4 ở Cổng Bằng chứng của HT2 hop-tuan-tren-bang (28/10): đi ‹ › theo thứ tự bảng vẫn giữ mục tiêu của KR đầu bên dưới, nên nút về mở nhầm mục tiêu (apps/app/components/crm/record-sheet/kr-sheet.tsx). Chủ kho chọn «mở hợp đồng mới», sổ _acceptance/hop-tuan-tren-bang/decisions.jsonl d-20261028T114723Z-27.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở ngăn KR từ bảng Họp tuần, đi › sang KR của mục tiêu khác, bấm «Về khung mục tiêu»: khung mở đúng mục tiêu của KR đang xem» khi hết timebox
- Timebox: …
