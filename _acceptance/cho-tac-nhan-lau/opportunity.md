---
schema_version: 1
slug: cho-tac-nhan-lau
feature: Trải nghiệm chờ Tác nhân lâu hơn khoảng 200 giây — người dùng thấy tiến độ, hoặc rời đi và được báo khi xong
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-16T05:33:48Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K7
---

## Vấn đề & ai gặp

Hàng K7 của đợt r2 (dãy P7), câu giao theo lời chủ kho: «Vậy trải nghiệm lớn hơn 200s cần được thay đổi ux».

Người dùng ra lệnh cho Tác nhân (agent-builder) rồi ngồi chờ. Đo 15/10 (phiên P0): Tác nhân chạy trên GLM 5.3
mất 201 s và 200 s; trên GLM 5.2 Fast mất 86–96 s. Quá khoảng 200 giây, người dùng phải thấy tiến độ, hoặc được
rời đi và nhận báo khi xong.

Cổng Đáng: chủ kho gõ «MH3 build; MH4 build; K7 build» ở phiên P6 (local_8f9abee4-5f8d-4fe8-b637-424aec242e3a),
2026-10-16T05:33:48Z; giám sát xếp K7 vào hàng việc dãy P7 lúc 05:34Z.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
