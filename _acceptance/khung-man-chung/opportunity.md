---
schema_version: 1
slug: khung-man-chung
feature: Màn nào đang tải cũng giữ tiêu đề, lỗi tải ở đâu cũng một hình có nút thử lại, và đầu trang không có nút chính tắt mà không nói vì sao
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: NM1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng NM1 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Màn nào đang tải cũng giữ tiêu đề, lỗi tải ở đâu cũng một hình có nút thử lại, và đầu trang không có nút chính tắt mà không nói vì sao

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi bật, người đang chờ một màn tải hay gặp lỗi tải có luôn biết mình đang ở màn nào và tự gỡ được bằng «Thử lại» mà không phải hỏi ai không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu với ít nhất 3 người, mỗi người gặp ít nhất một màn đang tải và một lỗi tải dựng sẵn, ít nhất 2 trên 3 người gọi đúng tên màn lúc đang tải và tự bấm «Thử lại» để về nội dung, và 0 người hỏi vì sao một nút đầu trang bị tắt.
- Kết quả nào là CHẾT: Quá nửa người trong phiên không gọi được tên màn lúc đang tải hoặc không tìm ra cách thử lại khi lỗi, hoặc có người hỏi vì sao nút chính bị tắt ở Onboarding, Tổ chức hay SSO.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
