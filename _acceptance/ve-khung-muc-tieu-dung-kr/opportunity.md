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

- Câu hỏi phép đo trả lời: Trưởng đơn vị đi ‹ › qua KR của nhiều mục tiêu trong buổi Họp tuần có quay về đúng mục tiêu của KR đang xem mà không phải đóng ngăn và mở lại không?
- Kết quả nào là SỐNG: Trong buổi Họp tuần thật đầu tiên sau khi bật, quan sát ít nhất 2 trưởng đơn vị đi ‹ › qua KR của từ hai mục tiêu trở lên, mọi lần bấm «Về khung mục tiêu» hay tên mục tiêu ở dòng phụ đề đều mở đúng mục tiêu và không ai phải đóng ngăn mở lại.
- Kết quả nào là CHẾT: Trong buổi Họp tuần quan sát có ít nhất một lần nút về hay tên mục tiêu mở nhầm mục tiêu hoặc chồng thêm khung, hoặc người chủ trì phải đóng ngăn để tìm lại mục tiêu.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
