---
schema_version: 1
slug: paths-chet-chin-ho-so
feature: Chín hồ sơ đã ký thôi bị đòi ghim lại sau mọi PR chỉ vì một mục paths trỏ vào tệp đã đổi tên
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: F38
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng F38 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` — chưa có trang: trang nền, mã F38
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Chín hồ sơ đã ký thôi bị đòi ghim lại sau mọi PR chỉ vì một mục paths trỏ vào tệp đã đổi tên

Vì sao: Một mục paths chết tắt bộ lọc hoá cũ của cả hồ sơ (staleByPaths đóng mặc định). Đo 31/10: 9 hồ sơ, 10 mục — cay-can-chinh-co-ly-do (2), cho-tac-nhan-lau, goi-y-mo-ke-hoach, hoi-dap-okr, kara-gop-y-luot-2, ngan-kr-mot-cho, quyet-gop-y-noi-dung-ly-do, toan-canh-okr, tro-ly-okr-nen.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mỗi mục paths của chín hồ sơ khớp ít nhất một tệp của git ls-files; mỗi mục đo hai chiều (một PR chạm tệp được trỏ làm hồ sơ hoá cũ, một PR không chạm thì không); pre-merge-check trên một PR chỉ đổi tài liệu không còn gọi tên chín hồ sơ này» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mỗi mục paths của chín hồ sơ khớp ít nhất một tệp của git ls-files; mỗi mục đo hai chiều (một PR chạm tệp được trỏ làm hồ sơ hoá cũ, một PR không chạm thì không); pre-merge-check trên một PR chỉ đổi tài liệu không còn gọi tên chín hồ sơ này
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mỗi mục paths của chín hồ sơ khớp ít nhất một tệp của git ls-files; mỗi mục đo hai chiều (một PR chạm tệp được trỏ làm hồ sơ hoá cũ, một PR không chạm thì không); pre-merge-check trên một PR chỉ đổi tài liệu không còn gọi tên chín hồ sơ này» khi hết timebox
- Timebox: …
