---
schema_version: 1
slug: rang-hang-cong-cu
feature: Một màn đặt lọc ngoài hàng công cụ duy nhất — chip trong Card, nhóm gập dưới bảng, ToggleGroup spacing={0} — làm bài kiểm đỏ và gọi tên tệp
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: BK6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng BK6 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08` · `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29` — chưa có trang: trang nền
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Một màn đặt lọc ngoài hàng công cụ duy nhất — chip trong Card, nhóm gập dưới bảng, ToggleGroup spacing={0} — làm bài kiểm đỏ và gọi tên tệp

Vì sao: Mục «Thứ tự một màn» và «Hàng công cụ» của docs/design.md (chủ kho 25/10) chưa có răng; răng khung trang BK3 chỉ soát đầu trang. Tri thức: crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md mục «Khoảng hở 2».

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Thêm một trang đặt chip lọc trong CardContent, hay nhóm gập «Đã bỏ (n)» dưới bảng, hay ToggleGroup spacing={0} thì bài kiểm đỏ và nêu tệp; lệch hiện có nằm trong bảng ngoại lệ có lý do; chỉ sửa docs/ thì im» chưa?
- Kết quả nào là SỐNG: [đề xuất] Thêm một trang đặt chip lọc trong CardContent, hay nhóm gập «Đã bỏ (n)» dưới bảng, hay ToggleGroup spacing={0} thì bài kiểm đỏ và nêu tệp; lệch hiện có nằm trong bảng ngoại lệ có lý do; chỉ sửa docs/ thì im
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Thêm một trang đặt chip lọc trong CardContent, hay nhóm gập «Đã bỏ (n)» dưới bảng, hay ToggleGroup spacing={0} thì bài kiểm đỏ và nêu tệp; lệch hiện có nằm trong bảng ngoại lệ có lý do; chỉ sửa docs/ thì im» khi hết timebox
- Timebox: …
