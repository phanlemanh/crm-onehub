---
schema_version: 1
slug: moi-kr-ca-cong-ty
feature: Ban lãnh đạo bấm ô Trượt ở Báo cáo › Sức khoẻ và đọc mọi KR đang trượt của cả công ty trong một danh sách lọc được theo đơn vị và người
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-19T11:09:20Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: VK11
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng VK11 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR — 26/10/2026.

Ban lãnh đạo bấm ô Trượt ở Báo cáo › Sức khoẻ và đọc mọi KR đang trượt của cả công ty trong một danh sách lọc được theo đơn vị và người

Vì sao: Hôm nay không có lối thẳng tới mọi KR đang trượt — phải đi từng đơn vị; ô số ở Toàn cảnh không bấm được. Tability: All data › Key Results, ô Off track trên trang chủ dẫn thẳng tới đó.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Từ Sức khoẻ tới danh sách KR trượt trong 1 bấm; bộ lọc ghi trên đường dẫn» chưa?
- Kết quả nào là SỐNG: Từ Sức khoẻ tới danh sách KR trượt trong 1 bấm; bộ lọc ghi trên đường dẫn
- Kết quả nào là CHẾT: chưa đạt «Từ Sức khoẻ tới danh sách KR trượt trong 1 bấm; bộ lọc ghi trên đường dẫn» khi hết timebox
- Timebox: 2026-10-26 (mốc Vỏ khu Mục tiêu — thanh bên khu, Bộ OKR, đổi tên, ngăn KR)
