---
schema_version: 1
slug: khung-chung-ngan-ban-ghi
feature: "Người phụ trách KR mở ngăn KR hay ngăn Số KR và gặp đúng khung của ngăn deal: cùng đầu ngăn, chờ tải bằng khung xương, lỗi tải nói đúng lý do và có nút thử lại"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: BK1
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng BK1 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29` — chưa có trang: trang nền, trang đợt ban-do-khuon-3010
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Người phụ trách KR mở ngăn KR hay ngăn Số KR và gặp đúng khung của ngăn deal: cùng đầu ngăn, chờ tải bằng khung xương, lỗi tải nói đúng lý do và có nút thử lại

Vì sao: Đo trên onehub 16604ce3f (30/10): ngăn deal, liên hệ, công ty, kế hoạch, mục tiêu dựng RecordSheetFrame (apps/app/components/crm/record-sheet/record-parts.tsx:102); kr-sheet.tsx và so-kr-sheet.tsx đi vòng qua nó, tự dựng đầu ngăn, chờ tải, báo lỗi và «không thấy». Khung có từ 31/07, ngăn KR dựng 28/09 vẫn thoát khung: có mẫu chưa đủ, phải có thứ buộc ngăn dùng mẫu. Tri thức: crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mở bảy loại ngăn (deal, liên hệ, công ty, kế hoạch, mục tiêu, KR, Số KR) ở ba trạng thái — đang tải, lỗi tải, đủ dữ liệu: cùng đầu ngăn, cùng khung xương, cùng một thành phần lỗi; bỏ khe chờ tải hay lỗi khỏi một ngăn thì check-types đỏ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mở bảy loại ngăn (deal, liên hệ, công ty, kế hoạch, mục tiêu, KR, Số KR) ở ba trạng thái — đang tải, lỗi tải, đủ dữ liệu: cùng đầu ngăn, cùng khung xương, cùng một thành phần lỗi; bỏ khe chờ tải hay lỗi khỏi một ngăn thì check-types đỏ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mở bảy loại ngăn (deal, liên hệ, công ty, kế hoạch, mục tiêu, KR, Số KR) ở ba trạng thái — đang tải, lỗi tải, đủ dữ liệu: cùng đầu ngăn, cùng khung xương, cùng một thành phần lỗi; bỏ khe chờ tải hay lỗi khỏi một ngăn thì check-types đỏ» khi hết timebox
- Timebox: …
