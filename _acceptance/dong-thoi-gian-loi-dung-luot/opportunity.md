---
schema_version: 1
slug: dong-thoi-gian-loi-dung-luot
feature: «Thông báo lỗi của dòng thời gian theo đúng lượt tải đã hỏng, không theo lượt đang chạy»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T15:12:55Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-1, Ngoài-2 và Ngoài-5 của `dong-thoi-gian-giu-khi-loi`, Cổng 2 2026-10-08T15:12:55Z — anh chọn «mở hợp
đồng mới» cho cả ba (cùng một gốc), nên theo luật 26 của đợt `sau-14-10` đó là Cổng Đáng `build`. Giám sát xếp hàng
K6e, dãy P2, ưu tiên 2.3, sau K6c (#319, gộp 08/10 → onehub 9bc9e3d2a).

## Vấn đề & ai gặp

«Thông báo lỗi của dòng thời gian theo đúng lượt tải đã hỏng, không theo lượt đang chạy»

Người gặp: người dùng tab Hoạt động của ngăn bản ghi khi mạng chập chờn — đúng lúc họ cần biết phần nào đang là bản cũ.

K6c chọn thông báo theo cờ `isFetchNextPageError` / `isRefetchError` của TanStack Query. Khi đã có dữ liệu, trạng thái
lỗi được giữ qua các lượt tải sau, còn hai cờ đó suy theo hướng của lượt ĐANG chạy:

- **Làm mới hỏng rồi bấm «Xem cũ hơn»**: trong lúc trang kế đang tải đã hiện «Không tải được hoạt động cũ hơn.» và nút
  «Thử lại» bị tắt, dù trang kế chưa hỏng; cảnh báo «Không làm mới được» biến mất, và nếu trang kế tải được thì cảnh
  báo đó mất hẳn dù các trang đầu chưa bao giờ làm mới được.
- **«Xem cũ hơn» hỏng rồi danh sách tự làm mới** (quay lại cửa sổ, ghi một hoạt động): trong lúc làm mới đang chạy hiện
  «Không làm mới được hoạt động» dù chưa lượt làm mới nào hỏng, và thông báo «xem cũ» biến mất.

## Ngưỡng chết / ngưỡng UAT

- [đề xuất] Câu hỏi phép đo trả lời: khi lỗi «Xem cũ hơn» và lỗi làm mới chồng lên nhau, thông báo có luôn nói đúng lượt
  nào đã hỏng không — không báo lỗi khi lượt đang chạy, không tự tắt khi chưa có lượt làm mới nào thành công?
- [đề xuất] Kết quả nào là SỐNG: bài kiểm treo từng lượt tải giữa chừng ở cả hai thứ tự chồng lỗi, đếm 0 lần thông báo
  sai lượt hiện ra trong lúc đang tải; lái thử người lạ gây hai lỗi chồng nhau mà không thấy thông báo nhảy qua lại.
- [đề xuất] Kết quả nào là CHẾT: còn một thứ tự chồng lỗi mà thông báo hiện cho lượt chưa hỏng, hoặc cảnh báo làm mới
  biến mất trước khi một lượt làm mới thật sự thành công.
- [đề xuất] Timebox: 0,5 ngày máy.
