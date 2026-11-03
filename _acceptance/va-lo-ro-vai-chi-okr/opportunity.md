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

- Câu hỏi phép đo trả lời: Sau khi vá, người vai «chỉ OKR» có còn bị giao việc kế hoạch hay nhận tên đối tác trong tin nhắc buổi sáng, trong khi vẫn nhận nhắc về KR của mình không?
- Kết quả nào là SỐNG: Trong 2 tuần sau khi bật, thước ro-vai-chi-okr chạy trên production mỗi tuần đều ra 0 bước, kế hoạch hay lượt theo dõi đang mở thuộc người vai «chỉ OKR», không tin nhắc nào gửi tới họ có mục kế hoạch, và mỗi người vai đó có việc OKR đến hạn vẫn nhận ít nhất một tin nhắc.
- Kết quả nào là CHẾT: Trong 2 tuần sau khi bật, thước ra từ 1 vật đang mở trở lên thuộc người vai «chỉ OKR», hoặc có tin nhắc tới họ mang mục kế hoạch hay tên công ty, hoặc họ thôi nhận nhắc về KR.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)

## Nguồn quyết định Cổng Đáng

Chủ kho gõ «mở DA0a ngay» ở phiên `r2 · Giám sát` ngày 12/10/2026; giám sát chuyển lời sang phiên
`r2·P0 · DA0a`. `decided_at` là giờ phiên thợ ghi lại lời đó, không phải giờ chủ kho gõ.
