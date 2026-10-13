---
schema_version: 1
slug: hoi-dap-okr
feature: Tôi hỏi về OKR trên web hoặc Zalo và nhận câu trả lời theo quyền của tôi
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: C
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng C của «OKR» (`docs/plan/lo-trinh-okr.json`).

Tôi hỏi về OKR trên web hoặc Zalo và nhận câu trả lời theo quyền của tôi

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» chưa?
- Kết quả nào là SỐNG: [đề xuất] Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được OKR» xanh trên production» khi hết timebox
- Timebox: [đề xuất] 2026-10-31 (mốc R2 lên production (tạm — chốt lại bằng số đo sau ba ngày đầu của đợt r2; trước đó 20/11))
