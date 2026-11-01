---
schema_version: 1
slug: rang-dau-hieu-ve-tay
feature: Một dấu hiệu vẽ tay của docs/design.md trong tệp mới của apps/app làm lint:slop đỏ và gọi đúng tên tệp; nợ cũ nằm trong một danh sách của chính luật
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: BK5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng BK5 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` · `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29` — chưa có trang: trang nền
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Một dấu hiệu vẽ tay của docs/design.md trong tệp mới của apps/app làm lint:slop đỏ và gọi đúng tên tệp; nợ cũ nằm trong một danh sách của chính luật

Vì sao: Bảng «Dấu hiệu vẽ tay» của docs/design.md tự hứa thành luật anti-slop trong tools/oxlint nhưng tới nay chỉ được kiểm bằng mắt ở review; đo 31/10 dấu hiệu vẽ tay có ở khoảng 60 tệp (34 thẻ <hN className>, 10 spacing={0}, 11 tệp AlertDialog, 7 tệp navigator.clipboard, 3 tệp SECTION_TITLE, NhomDaBo gập), gấp mười nợ hex. Tri thức: crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md mục «Khoảng hở 1».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tiêm từng dấu hiệu máy đọc được (<table>, navigator.clipboard, <h1>–<h4> tự đặt cỡ, divide-y tự dựng, size-2 rounded-full, ToggleGroup spacing={0}, AlertDialog ráp tay) vào một tệp mới của apps/app thì lint:slop đỏ, thông điệp nêu tệp và thành phần thay; tệp trong danh sách nợ cũ và tệp dưới apps/app/app/proto im; danh sách nợ cũ khớp số đếm của kiểm kê» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tiêm từng dấu hiệu máy đọc được (<table>, navigator.clipboard, <h1>–<h4> tự đặt cỡ, divide-y tự dựng, size-2 rounded-full, ToggleGroup spacing={0}, AlertDialog ráp tay) vào một tệp mới của apps/app thì lint:slop đỏ, thông điệp nêu tệp và thành phần thay; tệp trong danh sách nợ cũ và tệp dưới apps/app/app/proto im; danh sách nợ cũ khớp số đếm của kiểm kê
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tiêm từng dấu hiệu máy đọc được (<table>, navigator.clipboard, <h1>–<h4> tự đặt cỡ, divide-y tự dựng, size-2 rounded-full, ToggleGroup spacing={0}, AlertDialog ráp tay) vào một tệp mới của apps/app thì lint:slop đỏ, thông điệp nêu tệp và thành phần thay; tệp trong danh sách nợ cũ và tệp dưới apps/app/app/proto im; danh sách nợ cũ khớp số đếm của kiểm kê» khi hết timebox
- Timebox: …
