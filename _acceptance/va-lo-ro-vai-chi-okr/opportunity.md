---
schema_version: 1
slug: va-lo-ro-vai-chi-okr
feature: «Người vai chỉ OKR không được giao bước onboard và không nhận tên đối tác qua tin nhắc buổi sáng»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-12T04:11:35Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA0a
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA0a của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

«Người vai chỉ OKR không được giao bước onboard và không nhận tên đối tác qua tin nhắc buổi sáng»

Vì sao: Giao bước hiện chỉ kiểm có là thành viên; bộ gom nhắc không lọc vai và mang tên công ty qua Zalo/Slack. Gộp việc mà chưa vá là khuếch đại lỗ này.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Truy vấn production: không bước, kế hoạch hay lượt theo dõi đang mở nào thuộc người vai «chỉ OKR»» khi hết timebox
- Timebox: trước 14/10/2026 — ngày mọi phòng ban bắt đầu dùng thật.

## Nguồn quyết định Cổng Đáng

Chủ kho gõ «mở DA0a ngay» ở phiên `r2 · Giám sát` ngày 12/10/2026; giám sát chuyển lời sang phiên
`r2·P0 · DA0a`. `decided_at` là giờ phiên thợ ghi lại lời đó, không phải giờ chủ kho gõ.
