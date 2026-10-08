---
schema_version: 1
slug: giai-doan-mac-dinh
feature: «Deal mới không rơi vào giai đoạn đã lưu trữ»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E4 của «OKR» (`docs/plan/lo-trinh-okr.json`). «Deal mới không rơi vào giai đoạn đã lưu trữ».

- **Ngoài-6 của `giai-doan-thoa-thuan`** (Cổng Bằng chứng 29/09, «mở hợp đồng mới»): cột `deal.stage` trong cơ sở
  dữ liệu có mặc định `"DEMO_BOOKED"` (`packages/db/prisma/schema.prisma`). Quản trị viên lưu trữ được giai đoạn
  Demo; một đường tạo thoả thuận nào quên truyền giai đoạn sẽ đặt thoả thuận vào giai đoạn đã cất mà không ai báo.
  Hôm nay đường tạo của API đã chọn giai đoạn Đang mở sống đầu tiên (`DealsService.create` → `giaiDoanMoDau`), nên
  người dùng chưa gặp — lỗ nằm ở mặc định của cơ sở dữ liệu và ở dữ liệu mẫu (`seed.ts` chọn thẳng bảy mã gốc).
- Người gặp: quản trị viên đã lưu trữ giai đoạn Demo, và người bán thấy thoả thuận mới «biến mất» khỏi bảng Kanban.

Cổng Đáng: build — chủ kho ký cho E3, E1, E4, E5, E6 lúc 2026-10-07T13:13:50Z (luật 16 của đợt sau-14-10).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] sau khi lưu trữ giai đoạn Demo, mọi thoả thuận tạo mới có luôn nằm ở một giai đoạn đang dùng không?
- Kết quả nào là SỐNG: [đề xuất] ở phiên nghiệm thu, người thử lưu trữ giai đoạn đầu của nhóm Đang mở rồi tạo thoả thuận mới: thoả thuận hiện ngay ở cột Đang mở đầu tiên còn lại của Kanban, 0 lần hỏi; không đường tạo nào trong mã còn dựa vào mặc định của cơ sở dữ liệu.
- Kết quả nào là CHẾT: [đề xuất] một thoả thuận mới nằm ở giai đoạn đã lưu trữ (không thấy trên Kanban).
- Timebox: [đề xuất] phiên nghiệm thu đầu tiên sau khi lên production, cùng phiên với `danh-sach-keo-chung`, chậm nhất 2026-10-21.
