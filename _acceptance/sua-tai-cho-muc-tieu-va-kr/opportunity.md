---
schema_version: 1
slug: sua-tai-cho-muc-tieu-va-kr
feature: Trưởng đơn vị sửa tên, mô tả hay người phụ trách của một mục tiêu hoặc KR ngay trong ngăn đang xem, không mở ngăn sửa nào chồng lên
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV9
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SV9 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/vong-tin-hieu-1410.md#bd4284d162e34f4bda36aa1d253212ad6d660d42` — chưa có trang: trang nền, trang đợt okr-ghi-trong-ngan-3010
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Trưởng đơn vị sửa tên, mô tả hay người phụ trách của một mục tiêu hoặc KR ngay trong ngăn đang xem, không mở ngăn sửa nào chồng lên

Vì sao: Bản soát 30/10 (tri thức chu-de/ghi-trong-ngan): Deal, Liên hệ, Công ty sửa trường tại chỗ bằng InlineField (apps/app/components/crm/inline-field.tsx); mục tiêu và KR mở HopThoaiMucTieu, HopThoaiKr thành Sheet chồng lên ngăn qua NganOkr (apps/app/components/crm/record-sheet/objective-sheet.tsx:443-484). docs/design.md mục «Ghi vào bản ghi: ngay trong ngăn» ghi chỗ này là nợ.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở ngăn mục tiêu và ngăn KR, sửa tên, mô tả, người phụ trách: lưu khi rời ô hay Enter, Esc huỷ, không Sheet hay Dialog nào mở chồng lên ngăn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở ngăn mục tiêu và ngăn KR, sửa tên, mô tả, người phụ trách: lưu khi rời ô hay Enter, Esc huỷ, không Sheet hay Dialog nào mở chồng lên ngăn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở ngăn mục tiêu và ngăn KR, sửa tên, mô tả, người phụ trách: lưu khi rời ô hay Enter, Esc huỷ, không Sheet hay Dialog nào mở chồng lên ngăn» khi hết timebox
- Timebox: …
