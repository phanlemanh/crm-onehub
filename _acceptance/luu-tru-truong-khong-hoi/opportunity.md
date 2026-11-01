---
schema_version: 1
slug: luu-tru-truong-khong-hoi
feature: Lưu trữ một trường thôi hỏi lại và có «Hoàn tác» như mọi chỗ lưu trữ khác
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: V2b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng V2b của «OKR» (`docs/plan/lo-trinh-okr.json`).

Lưu trữ một trường thôi hỏi lại và có «Hoàn tác» như mọi chỗ lưu trữ khác

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, quản trị lưu trữ một trường có hiểu trường chỉ được cất và tự lấy lại được bằng «Hoàn tác» khi lỡ tay, không cần hộp hỏi lại không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người quản trị lưu trữ một trường rồi lấy lại, ít nhất 2 trên 3 người tự bấm «Hoàn tác» không cần gợi ý và nói trường được cất chứ không bị xoá, và trong timebox có 0 báo mất trường vì lưu trữ nhầm.
- Kết quả nào là CHẾT: Quá nửa người trong phiên nghĩ trường đã bị xoá hoặc không thấy «Hoàn tác», hoặc có ít nhất 1 báo mất trường không lấy lại được.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
