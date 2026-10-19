---
schema_version: 1
slug: thanh-ben-khu-dung-chung
feature: Thành viên mở Cài đặt hay Hội thoại và gặp cùng một thanh bên khu — cùng bề rộng, cùng nhãn nhóm, trên điện thoại thành một hàng cuộn ngang
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Thành viên mở Cài đặt hay Hội thoại và gặp cùng một thanh bên khu — cùng bề rộng, cùng nhãn nhóm, trên điện thoại thành một hàng cuộn ngang

Vì sao: Cài đặt dựng thanh bên 224px bằng NavGroup/NavItem/NavStrip, Hội thoại tự dựng vỏ riêng 213px: hai bản của một mẫu. Khu Mục tiêu sắp là nơi thứ ba dùng mẫu này, luật kho bắt chuyển vào packages/ui trước khi dùng lần hai.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Cài đặt và Hội thoại dùng chung một thành phần thanh bên khu trong packages/ui; docs/design.md có luật khi nào dùng thanh bên khu, khi nào dùng thẻ con» chưa?
- Kết quả nào là SỐNG: Cài đặt và Hội thoại dùng chung một thành phần thanh bên khu trong packages/ui; docs/design.md có luật khi nào dùng thanh bên khu, khi nào dùng thẻ con
- Kết quả nào là CHẾT: chưa đạt «Cài đặt và Hội thoại dùng chung một thành phần thanh bên khu trong packages/ui; docs/design.md có luật khi nào dùng thanh bên khu, khi nào dùng thẻ con» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
