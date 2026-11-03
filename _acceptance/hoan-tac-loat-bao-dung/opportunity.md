---
schema_version: 1
slug: hoan-tac-loat-bao-dung
feature: "Lưu trữ và hoàn tác hàng loạt báo đúng: lỗi máy chủ không hiện thành «bị bỏ qua», hoàn tác khi mọi bản đã về không báo «chưa hoàn tác được», lỗi từng bản ghi có dòng log"
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: V2f
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng V2f của «OKR» (`docs/plan/lo-trinh-okr.json`).

Lưu trữ và hoàn tác hàng loạt báo đúng: lỗi máy chủ không hiện thành «bị bỏ qua», hoàn tác khi mọi bản đã về không báo «chưa hoàn tác được», lỗi từng bản ghi có dòng log

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Khi lưu trữ hay hoàn tác hàng loạt, người dùng có hiểu đúng toast, không tưởng lỗi máy chủ là bản «bị bỏ qua» và không hoảng vì «chưa hoàn tác được» khi bản đã về, còn người vận hành có lần ra bản ghi lỗi không?
- Kết quả nào là SỐNG: Trong 2 tuần sau bật, mọi lô có errored lớn hơn 0 đều có dòng log lỗi kèm recordId trong nhật ký production, và trong phiên nghiệm thu ít nhất 2 trên 3 người xem toast «3 bản đã được khôi phục từ trước.» hiểu bản ghi vẫn ở danh sách mà không đi tìm lỗi.
- Kết quả nào là CHẾT: Có lô lỗi máy chủ mà nhật ký production không có dòng log kèm recordId, hoặc trong phiên nghiệm thu quá 1 trên 3 người hiểu toast là đã có lỗi.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
