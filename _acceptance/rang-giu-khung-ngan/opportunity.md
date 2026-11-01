---
schema_version: 1
slug: rang-giu-khung-ngan
feature: Một ngăn bản ghi dựng ngoài khung chung làm bài kiểm của kho đỏ và gọi đúng tên tệp, còn vòng chạm ngăn bản ghi có ảnh ngăn mới đặt cạnh ngăn deal
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-31T11:42:10Z        # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: BK2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng BK2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: `crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29` — chưa có trang: trang nền, trang đợt ban-do-khuon-3010
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Một ngăn bản ghi dựng ngoài khung chung làm bài kiểm của kho đỏ và gọi đúng tên tệp, còn vòng chạm ngăn bản ghi có ảnh ngăn mới đặt cạnh ngăn deal

Vì sao: Luật «Nếp màn trong app» của docs/design.md có và AGENTS.md nạp nó, nhưng răng máy chỉ có ở màu trạng thái và khung trang; ngăn KR thoát khung mà không bài nào đỏ. Không có răng thì mỗi lần dọn xong, ngăn OKR kế tiếp lại đẻ hàng nợ mới.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tiêm một ngăn gọi thẳng DetailSheetHeader thì lint và bài quét đỏ, thông điệp nêu tệp và khối cấm; chỉ sửa docs/ hay _acceptance/ thì im; mọi ngăn hiện có xanh sau BK1 (đối chứng dương); docs/proto.md có dòng màn mẫu ngăn deal mà design-pass đọc; Sheet hay Dialog dựng thô trong components/crm/record-sheet/ ngoài tệp khung làm lint đỏ, danh sách cấm đọc từ design/patterns/ngan-ban-ghi.md» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tiêm một ngăn gọi thẳng DetailSheetHeader thì lint và bài quét đỏ, thông điệp nêu tệp và khối cấm; chỉ sửa docs/ hay _acceptance/ thì im; mọi ngăn hiện có xanh sau BK1 (đối chứng dương); docs/proto.md có dòng màn mẫu ngăn deal mà design-pass đọc; Sheet hay Dialog dựng thô trong components/crm/record-sheet/ ngoài tệp khung làm lint đỏ, danh sách cấm đọc từ design/patterns/ngan-ban-ghi.md
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tiêm một ngăn gọi thẳng DetailSheetHeader thì lint và bài quét đỏ, thông điệp nêu tệp và khối cấm; chỉ sửa docs/ hay _acceptance/ thì im; mọi ngăn hiện có xanh sau BK1 (đối chứng dương); docs/proto.md có dòng màn mẫu ngăn deal mà design-pass đọc; Sheet hay Dialog dựng thô trong components/crm/record-sheet/ ngoài tệp khung làm lint đỏ, danh sách cấm đọc từ design/patterns/ngan-ban-ghi.md» khi hết timebox
- Timebox: …
