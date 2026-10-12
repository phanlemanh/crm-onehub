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

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
