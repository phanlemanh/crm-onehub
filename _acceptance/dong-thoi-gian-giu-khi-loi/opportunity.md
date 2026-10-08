---
schema_version: 1
slug: dong-thoi-gian-giu-khi-loi
feature: «Dòng thời gian giữ các hoạt động đã tải khi «Xem cũ hơn» hay làm mới ngầm bị lỗi»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T07:13:17Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-1 và Ngoài-5 của `kara-trang-thai-toan-crm`, Cổng 2 2026-10-08T07:13:17Z — anh chọn «mở hợp đồng
mới» cho cả hai (cùng một lỗi), nên theo luật 26 của đợt `sau-14-10` đó là Cổng Đáng `build`. Giám sát xếp hàng K6c,
dãy P2, ưu tiên 2.2, sau K6b (#314, gộp 08/10 → onehub 591bc8fb).

## Vấn đề & ai gặp

«Dòng thời gian giữ các hoạt động đã tải khi «Xem cũ hơn» hay làm mới ngầm bị lỗi»

Người gặp: mọi người dùng mở tab Hoạt động của ngăn cá nhân, công ty, thoả thuận hay kế hoạch — nơi đọc lại lịch sử
liên lạc trước khi gọi khách.

K6b đưa khung «Không tải được hoạt động» vào dòng thời gian (`components/crm/timeline/timeline.tsx`), nhưng rẽ nhánh
theo `history.isError` trước khi xét dữ liệu đã có. Trong TanStack Query, `isError` cũng bật khi lượt «Xem cũ hơn»
(`fetchNextPage`) hay một lượt làm mới nền hỏng — dữ liệu cũ vẫn còn trong bộ nhớ, nhưng màn thay cả danh sách bằng
khung lỗi:

- **Xem cũ hơn lỗi** (Ngoài-1, Ngoài-5 của K6b): người dùng đang đọc ba ngày hoạt động, bấm «Xem cũ hơn», mạng chập →
  toàn bộ hoạt động biến mất, chỉ còn khung lỗi; mất chỗ đang đọc.
- **Thử lại tải lại từ đầu**: nút «Thử lại» của khung gọi `refetch()`, tải lại mọi trang thay vì chỉ trang còn thiếu.
- **Làm mới nền lỗi**: sau khi ghi một hoạt động, danh sách được làm mới; lượt làm mới đó hỏng thì danh sách đang đọc
  cũng bị thay bằng khung lỗi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khi «Xem cũ hơn» hay một lượt làm mới ngầm của dòng thời gian bị lỗi, người dùng có
  giữ được những hoạt động đang đọc và thử lại đúng phần bị hỏng không?
- Kết quả nào là SỐNG: lái thử người lạ chặn lượt «Xem cũ hơn» và lượt làm mới ở dòng thời gian, lần nào danh
  sách đang đọc cũng còn nguyên kèm thông báo và «Thử lại»; «Thử lại» sau lỗi «Xem cũ hơn» chỉ tải trang còn thiếu —
  bài kiểm đếm 0 lần trang đầu bị gọi lại.
- Kết quả nào là CHẾT: còn một lối lỗi xảy ra sau khi đã có dữ liệu mà làm danh sách biến mất hay bị thay bằng
  khung lỗi trọn vùng; hoặc «Thử lại» tải lại từ trang đầu.
- Timebox: 0,5 ngày máy.
