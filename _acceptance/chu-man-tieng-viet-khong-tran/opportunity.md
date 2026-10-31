---
schema_version: 1
slug: chu-man-tieng-viet-khong-tran
feature: Breadcrumb đọc tiếng Việt với trình đọc màn hình; mô tả kiểu trường ở Cài đặt › Trường không tràn ở khổ 360
owner: phanlemanh@gmail.com
stage: decided               # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T23:58:15Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: NM4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng NM4 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Breadcrumb đọc tiếng Việt với trình đọc màn hình; mô tả kiểu trường ở Cài đặt › Trường không tràn ở khổ 360

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người dùng trình đọc màn hình có nghe vùng điều hướng bằng tiếng Việt, và người mở Cài đặt › Trường trên điện thoại có đọc được kiểu của từng trường không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu, ít nhất 2 trên 3 người mở Cài đặt › Trường trên điện thoại đọc đúng kiểu của 3 trường chỉ định và không thấy nhãn kiểu tràn ô, và một lượt nghe bằng VoiceOver trên giao diện tiếng Việt đọc breadcrumb là «Vị trí trang».
- Kết quả nào là CHẾT: Có người trong phiên nghiệm thu gặp nhãn kiểu tràn ô hay đọc sai kiểu trường trên điện thoại, hoặc VoiceOver vẫn đọc «breadcrumb» tiếng Anh trên giao diện tiếng Việt.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
