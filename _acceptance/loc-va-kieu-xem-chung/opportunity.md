---
schema_version: 1
slug: loc-va-kieu-xem-chung
feature: Lọc và chuyển kiểu xem ở mọi danh sách trông và chạy như nhau, và gửi đường dẫn cho đồng nghiệp là giữ nguyên bộ lọc
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: NM2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng NM2 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Lọc và chuyển kiểu xem ở mọi danh sách trông và chạy như nhau, và gửi đường dẫn cho đồng nghiệp là giữ nguyên bộ lọc

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, đường dẫn danh sách có bộ lọc gửi cho đồng nghiệp có mở ra đúng bộ lọc và kiểu xem, và người dùng có lọc được ở danh sách thứ hai mà không phải học lại không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gửi cho người khác một đường dẫn có bộ lọc ở Thoả thuận, Onboarding hoặc Tài liệu, ít nhất 2 trên 3 đường dẫn mở ra đúng bộ lọc và kiểu xem, và ít nhất 2 trên 3 người lọc được ở màn thứ hai không cần hướng dẫn.
- Kết quả nào là CHẾT: Có ít nhất 1 đường dẫn gửi đi mở ra sai bộ lọc hay sai kiểu xem, hoặc quá nửa người phải hỏi cách lọc ở màn thứ hai.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
