---
schema_version: 1
slug: hop-tuan-mo-dung-bo
feature: Trưởng đơn vị bấm Họp tuần và vào thẳng bảng của bộ OKR mình dẫn, thấy hàng số của tuần ở đầu; bộ chưa có KR công bố hay chu kỳ chưa chạy thì màn nói đúng lý do và chỉ sang đơn vị có KR
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-22T05:57:32Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Mốc: Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng — 26/10/2026.

Trưởng đơn vị bấm Họp tuần và vào thẳng bảng của bộ OKR mình dẫn, thấy hàng số của tuần ở đầu; bộ chưa có KR công bố hay chu kỳ chưa chạy thì màn nói đúng lý do và chỉ sang đơn vị có KR

Vì sao: Production 22/10: bấm Họp tuần không kèm đơn vị thì bảng là của OneHub, cấp này không có KR công bố nên màn hiện «0/0 KR» và câu «Chưa có lần cập nhật nào để bàn» trong khi phòng của người xem đã cập nhật đủ (okr-xem.service.ts:160-161, :586). VK3 AC-7 vẫn giữ «xemOkr trần mở bộ OneHub»; VK8 AC-3 đặt hàng số chỉ ở thẻ OKR. Tability mở đúng plan của đội và có bốn ô số ở đầu plan.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Trưởng phòng mở Họp tuần từ thanh bên, từ thẻ con hay từ liên kết không kèm đơn vị đều tới bộ mình dẫn; không còn màn «0/0 KR» với câu «chưa có lần cập nhật» khi bộ của người xem đã có cập nhật» chưa?
- Kết quả nào là SỐNG: Trưởng phòng mở Họp tuần từ thanh bên, từ thẻ con hay từ liên kết không kèm đơn vị đều tới bộ mình dẫn; không còn màn «0/0 KR» với câu «chưa có lần cập nhật» khi bộ của người xem đã có cập nhật
- Kết quả nào là CHẾT: chưa đạt «Trưởng phòng mở Họp tuần từ thanh bên, từ thẻ con hay từ liên kết không kèm đơn vị đều tới bộ mình dẫn; không còn màn «0/0 KR» với câu «chưa có lần cập nhật» khi bộ của người xem đã có cập nhật» khi hết timebox
- Timebox: 2026-10-26 (mốc Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng)


Cổng Đáng: chủ kho duyệt đợt cắt Họp tuần okr-hop-tuan-2210 (PR #543) ngày 22/10, ghi ở nhật ký LUAT.md của đợt vo-khu-muc-tieu lúc 2026-10-22T05:57:32Z — cùng lệ với HT3, HT4 và các hàng VK của đợt.
