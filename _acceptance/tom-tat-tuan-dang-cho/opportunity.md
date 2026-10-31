---
schema_version: 1
slug: tom-tat-tuan-dang-cho
feature: Trưởng phòng ban mở Họp tuần của phòng đã bật Tóm tắt tuần nhưng chưa có bản, và thấy bản đầu tiên tới lúc nào
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-22T05:52:18Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT4 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng — 26/10/2026.

Trưởng phòng ban mở Họp tuần của phòng đã bật Tóm tắt tuần nhưng chưa có bản, và thấy bản đầu tiên tới lúc nào

Vì sao: Đo 22/10 trên phiên đo: bật nấc «bật» cho một phòng bằng okr.setProgram thì okr.troLyTomTat vẫn trả ban: null, dangSoan: false, chuaCapNhat: false và khối trả null (khoi-tom-tat.tsx:346) — trưởng phòng không biết tính năng đã bật.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Phòng ở nấc bật mà chưa có bản thì Họp tuần hiện một dòng nêu ngày giờ bản đầu tiên; nấc tắt và chế độ ẩn vẫn không hiện gì» chưa?
- Kết quả nào là SỐNG: Phòng ở nấc bật mà chưa có bản thì Họp tuần hiện một dòng nêu ngày giờ bản đầu tiên; nấc tắt và chế độ ẩn vẫn không hiện gì
- Kết quả nào là CHẾT: chưa đạt «Phòng ở nấc bật mà chưa có bản thì Họp tuần hiện một dòng nêu ngày giờ bản đầu tiên; nấc tắt và chế độ ẩn vẫn không hiện gì» khi hết timebox
- Timebox: 2026-11-14 — lùi theo B7 (chủ kho đồng ý 31/10): một phiên nghiệm thu chung sau khi BK và SV gộp. Hạn cũ: 2026-10-26 (mốc Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng)

Cổng Đáng: chủ kho đồng ý gộp đợt cắt okr-hop-tuan-2210 và giao mở phiên thợ cho HT1–HT5 (bình luận PR #543, 2026-10-22T05:52:18Z).
