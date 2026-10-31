---
schema_version: 1
slug: ban-mau-okr
feature: Bản mẫu bốn màn khu OKR cho design-pass (Của tôi, Cập nhật tuần, Theo đơn vị, Toàn cảnh)
owner: phanlemanh@gmail.com
stage: archived              # discovery | decided | archived
decision:        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-09-24T06:35:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

# ban-mau-okr — hồ sơ design-pass, không phải một vòng

Thư mục này chỉ giữ một gói design-pass (`design-pass.md` và ảnh trong `evidence/design-pass/`),
không có hợp đồng, không có Cổng Đáng. Chủ kho duyệt cả gói ngày 2026-09-24 (mục «Duyệt» của
`design-pass.md`, commit `b1b757d8c`). Các vòng dựng theo bản mẫu này là `dat-okr-trong-crm`,
`cap-nhat-tuan-okr` và `toan-canh-okr`; mỗi vòng có hồ sơ riêng.

Tệp này chỉ ghi lại việc đã xong để `/start` và `PRODUCT-MAP.md` xếp thư mục vào ô «đã đóng có hồ
sơ». Trước đó cả hai coi nó là hồ sơ hỏng («không có contract.md lẫn opportunity.md»). Không có
quyết định mới nào ở đây, nên `decision` để trống.
