---
schema_version: 1
slug: rang-khung-trang-mo
feature: Mọi page.tsx của ứng dụng, kể cả trang sinh sau ngày dựng bài kiểm, đều bị soát hình theo màn; trang lệch không có trong bảng ngoại lệ kèm lý do thì bài kiểm đỏ
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: BK3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng BK3 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: chưa có trang: trang nền, trang đợt ban-do-khuon-3010, mã BK3
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Mọi page.tsx của ứng dụng, kể cả trang sinh sau ngày dựng bài kiểm, đều bị soát hình theo màn; trang lệch không có trong bảng ngoại lệ kèm lý do thì bài kiểm đỏ

Vì sao: Phần «hình theo màn» của apps/app/test/khung-man-chung.spec.ts neo vào bảng 39 tệp (apps/app/test/fixtures/khung-man-chung-hinh.json) ở một commit gốc: trang sinh sau 13/10 không bị soát.

## Ngưỡng chết / ngưỡng UAT

Không đo được — việc nền, không có người dùng cuối: kết quả là một bài kiểm của kho, chứng bằng chiều đỏ (thêm một trang mới dựng đầu trang ngoài khung chung thì bài kiểm đỏ và nêu tệp), chiều im (chỉ sửa tài liệu thì im) và đối chứng dương (mọi trang hiện có xanh hoặc nằm trong bảng ngoại lệ có lý do) ở Cổng Bằng chứng; không có phiên nghiệm thu.

## Bối cảnh

- Đợt `ban-do-khuon-3010`, bản phạm vi `docs/plan/pham-vi-ban-do-khuon-3010.md` (chủ kho duyệt 30/10, «Duyệt và đẩy»).
- Không đụng tệp với BK1, BK2 hay các hàng SV8–SV10 đang chờ: chỉ chạm `apps/app/test/khung-man-chung.spec.ts` và tệp bảng đi kèm.
- Không gộp vào NM1 «Khung màn chung»: NM1 dọn nợ cũ, BK3 chặn nợ mới; bảng ngoại lệ của BK3 liệt chính nợ NM1 sẽ dọn.
