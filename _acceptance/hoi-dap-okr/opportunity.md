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

- Câu hỏi phép đo trả lời: Người dùng có quay lại hỏi Kara về OKR trên web và thấy câu trả lời hữu ích không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, ít nhất 5 người khác nhau hỏi ít nhất một câu, ít nhất 3 người hỏi ở cả hai tuần, và trong các phản hồi đã bấm thì phần «không hữu ích» dưới 30%.
- Kết quả nào là CHẾT: Trong 2 tuần sau khi bật, không quá 2 người hỏi hay không ai hỏi lại ở tuần thứ hai, hoặc từ 50% phản hồi đã bấm trở lên là «không hữu ích».
- Timebox: 2026-10-31 (mốc R2 lên production (tạm — chốt lại bằng số đo sau ba ngày đầu của đợt r2; trước đó 20/11))
