---
schema_version: 1
slug: kara-mot-ten
feature: "Mọi chỗ AI nói đều mang tên Kara: tab bản ghi, tóm tắt tuần, Soạn OKR, Cài đặt, Tài liệu, Zalo"
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: K6a
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng K6a của «OKR» (`docs/plan/lo-trinh-okr.json`).

Mọi chỗ AI nói đều mang tên Kara: tab bản ghi, tóm tắt tuần, Soạn OKR, Cài đặt, Tài liệu, Zalo

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng có nhận ra và gọi AI của sản phẩm bằng một tên Kara ở mọi bề mặt, thay vì lẫn «Trợ lý», «tác nhân», «máy soạn» không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu, ít nhất 2 trên 3 người được hỏi «ai đã làm việc này» ở ba bề mặt (tóm tắt tuần, Soạn OKR, Tài liệu) đều trả lời là Kara, và luật máy «một tên AI» xanh trên onehub suốt timebox.
- Kết quả nào là CHẾT: Dưới 2 trên 3 người gọi AI là Kara ở cả ba bề mặt, hoặc người dùng còn gặp một chuỗi gọi AI bằng tên khác trên màn thật.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
