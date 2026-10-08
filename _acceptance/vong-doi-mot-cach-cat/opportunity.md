---
schema_version: 1
slug: vong-doi-mot-cach-cat
feature: «Một cách cất, một bộ chữ» — lưu trữ ở ba bảng CRM luôn có Hoàn tác, bản ghi đã cất mở ra có dải báo và chỉ đọc, Kanban thoả thuận có «Đã lưu trữ», chữ đúng bộ chữ
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: đợt 2 của `docs/vong-doi.md` (chủ kho duyệt chuẩn vòng đời 2026-10-07). Anh ký `build` cho cả 16 hàng chưa ký của
đợt `sau-14-10`, trong đó có V2, lúc 2026-10-07T13:13:50Z («Ký build cả 16 hàng», luật 16). Hàng V2, dãy P2, ưu tiên 3,
sau K6b (#314) và E7 (#303).

## Vấn đề & ai gặp

«Một cách cất, một bộ chữ»

Người gặp: người bán và quản lý dọn danh sách cá nhân, công ty, thoả thuận — chọn nhiều dòng rồi lưu trữ, hay mở lại
một bản ghi đã cất từ đường dẫn cũ.

Đợt 1 đã chốt chuẩn: lưu trữ không hỏi nhưng toast luôn có «Hoàn tác»; mở bản đã cất thì có dải báo «Đã lưu trữ ngày
… · Khôi phục» và các ô chỉ đọc; nút xem thứ đã cất tên «Đã lưu trữ» và có ở mọi dạng xem; bước cuối tên «Xoá vĩnh
viễn». Hôm nay ba bảng CRM lệch chuẩn ở năm chỗ:

- Lưu trữ hàng loạt (`*-bulk-actions.tsx`) báo «Đã lưu trữ n …» qua `reportBulk`, không có «Hoàn tác» — lưu trữ nhầm
  20 dòng thì phải mở «Đã lưu trữ», chọn lại đúng 20 dòng, khôi phục. Lưu trữ từng bản ở menu ngăn đã có «Hoàn tác»
  (K6b, #314).
- Ngăn cá nhân, công ty, thoả thuận đã lưu trữ trông y như bản đang dùng: không báo, mọi ô vẫn sửa được.
- Kanban thoả thuận không có nút «Đã lưu trữ» — nút chỉ có ở dạng bảng (`deals-table.tsx`).
- Nút xem thứ đã cất ghi «Lưu trữ» trần ở cả ba bảng — đọc như một hành động.
- Hộp hỏi lại xoá vĩnh viễn hàng loạt có nút xác nhận ghi «Xoá» trần; chữ mô tả lưu trữ một trường ghi «ẩn ở mọi nơi».

## Ngưỡng chết / ngưỡng UAT

- [đề xuất] Câu hỏi phép đo trả lời: người dùng ba bảng CRM có dọn và lấy lại bản ghi theo đúng một cách không — lưu
  trữ nhầm thì «Hoàn tác» ngay ở toast, mở một bản đã cất thì biết ngay nó đã cất và khôi phục được tại chỗ, không sửa
  nhầm một bản đã cất?
- [đề xuất] Kết quả nào là SỐNG: lái thử người lạ lưu trữ nhầm ba cá nhân bằng thao tác hàng loạt rồi lấy lại bằng
  «Hoàn tác» mà không phải mở «Đã lưu trữ»; mở một thoả thuận đã lưu trữ từ đường dẫn, đọc được dải báo và khôi phục
  từ dải báo, không lần nào cố sửa một ô của bản đã cất. Bài kiểm đếm 0 đường lưu trữ thiếu «Hoàn tác» ở ba bảng, 0 nút
  xem ghi «Lưu trữ» trần, 0 hộp xác nhận xoá vĩnh viễn ghi «Xoá» trần.
- [đề xuất] Kết quả nào là CHẾT: còn một đường lưu trữ (một bản hay hàng loạt) ở ba bảng không có «Hoàn tác»; hoặc
  một bản ghi đã lưu trữ mở ra vẫn sửa được như bản đang dùng mà không báo gì.
- [đề xuất] Timebox: 1 ngày máy.

## Đường đo

- Thước: số chỗ gọi lưu trữ cá nhân, công ty, thoả thuận có «Hoàn tác» trên số chỗ gọi tìm thấy (hôm nay 4 chỗ phủ 6
  đường: menu ngăn và hàng loạt × ba loại) · số từ: script `rang/duong-luu-tru.mjs` và bài DOM
  `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`
- Thước: lái thử người lạ lấy lại bản lưu trữ nhầm không phải mở «Đã lưu trữ» · số từ: nhật ký vấp (khuôn
  `stranger-drive-template.md`) của `/acceptance-gate:uat-session`
- Thước: số lần người lạ cố sửa một ô của thoả thuận đã cất (mong 0) · số từ: nhật ký vấp của cùng lượt lái thử
