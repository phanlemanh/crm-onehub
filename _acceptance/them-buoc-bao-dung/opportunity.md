---
schema_version: 1
slug: them-buoc-bao-dung
feature: "Thêm bước ở kế hoạch báo đúng: danh sách bộ phận không tải được thì nói lý do; số việc quá hạn đếm theo một ngày; bộ phận không có thật trả cùng một lỗi như mọi chỗ khác"
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E6b
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E6b của «OKR» (`docs/plan/lo-trinh-okr.json`).

Thêm bước ở kế hoạch báo đúng: danh sách bộ phận không tải được thì nói lý do; số việc quá hạn đếm theo một ngày; bộ phận không có thật trả cùng một lỗi như mọi chỗ khác

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người lập và theo dõi kế hoạch có biết vì sao không thêm được bước khi danh sách phòng ban tải lỗi, và có tin con số việc quá hạn trên Tổng quan khớp với danh sách bước của mình không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người quản lý kế hoạch, cả 3 xác nhận số «việc quá hạn» ở Tổng quan khớp danh sách bước của mình, và trong 2 tuần sau khi bật có 0 báo cáo «form thêm bước trống không biết vì sao» kể cả ngày có sự kiện api_error route /trpc/onboarding.listDepartments.
- Kết quả nào là CHẾT: Có ít nhất 1 người chỉ ra số việc quá hạn ở Tổng quan lệch danh sách bước, hoặc có báo cáo form thêm bước trống không lý do trong ngày có api_error route /trpc/onboarding.listDepartments.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
