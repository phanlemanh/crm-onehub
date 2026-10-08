---
schema_version: 1
slug: khung-loi-ban-ghi-dung-ly-do
feature: «Khung bản ghi tải lỗi nói đúng lý do: đã xoá, không có quyền, hay mất kết nối»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-08T02:23:55Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-4 của `khung-ban-ghi-kara` (K4, #306), anh chọn «mở hợp đồng mới» ở Cổng 2; anh ký `build` cho K4b lúc
2026-10-08T02:23:55Z («build K4b», luật 25 của đợt `sau-14-10`). Hàng K4b, dãy P2, ưu tiên 2.5.

## Vấn đề & ai gặp

«Khung bản ghi tải lỗi nói đúng lý do: đã xoá, không có quyền, hay mất kết nối»

Người gặp: người mở một bản ghi từ đường dẫn cũ (tin nhắn, Zalo, lịch sử trình duyệt), từ thông báo, hay từ danh sách
vừa có người khác xoá bản ghi.

`RecordSheetFrame` (`components/crm/record-sheet/record-parts.tsx`) chỉ nhận chuỗi lỗi và luôn vẽ `KhungTaiLoi`: «Không
tải được bản ghi này» + «Kiểm tra kết nối rồi thử lại.» + «Thử lại». Khi `contacts.byId` (hay công ty, thoả thuận, kế
hoạch) ném `NOT_FOUND` vì bản ghi đã bị xoá, hoặc `FORBIDDEN` vì người xem không thuộc workspace, người dùng được bảo
kiểm tra mạng và bấm «Thử lại» mãi không được. Ngăn kế hoạch (`plan-sheet.tsx`) còn không có nút «Thử lại» khi lỗi
mạng; mục «Kế hoạch» của công ty (`company-plans.tsx`) cùng một khung. Ngăn mục tiêu OKR (`objective-sheet.tsx`) đã
có cách đúng: đọc `error.data.code === "NOT_FOUND"` và hiện «không thấy» kèm nút đóng ngăn.

## Ngưỡng chết / ngưỡng UAT

- [đề xuất] Câu hỏi phép đo trả lời: khi một bản ghi mở ra không tải được, người dùng có biết ngay là bản ghi đã bị
  xoá, là mình không có quyền, hay là mạng chập — và có đúng một việc nên làm tiếp (đóng ngăn, hay thử lại) không?
- [đề xuất] Kết quả nào là SỐNG: lái thử người lạ mở đường dẫn tới một cá nhân đã xoá và gặp «không còn» kèm «Đóng»,
  không bấm «Thử lại» lần nào; bài kiểm đếm 0 khung lỗi «kiểm tra kết nối» cho lỗi NOT_FOUND hay FORBIDDEN ở bốn ngăn
  bản ghi.
- [đề xuất] Kết quả nào là CHẾT: còn một ngăn bản ghi bảo người dùng kiểm tra mạng khi bản ghi đã bị xoá hay khi họ
  không có quyền; hoặc lỗi mạng ở ngăn nào đó không có «Thử lại».
- [đề xuất] Timebox: 0,5 ngày máy.
