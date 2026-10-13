# Hạt giống — «Chuyển việc 30 ngày» không làm mới Việc và Tổng quan

Gốc: `_acceptance/viec-chung/` (DA1), S4 lượt 1 ngày 13/10/2026, mục Ngoài-2 (nửa chuyển việc) và Ngoài-6.
Hạt giống là SỔ, không phải ô: mở thành ô khi có neo — một người dùng thật kêu số liệu cũ sau khi chuyển
việc, hoặc một hàng lộ trình sau đụng tới hộp «Chuyển việc 30 ngày».

## Lỗ

Từ DA1, `transferWork` chuyển cả việc đang mở người rời thực hiện hay giao. Hộp «Chuyển việc 30 ngày» vẫn
chỉ gọi `cache.workTransferred()`, làm mới đúng ba khoá `onboarding.manDanhMuc`, `onboarding.bangCot`,
`onboarding.transferPreview`. Màn «Việc của tôi», khối Việc trên thẻ bản ghi và Tổng quan của người nhận
(thường chính quản trị vừa bấm) hiện người thực hiện và số việc quá hạn cũ tới hết `staleTime` (~30 giây).
Tải lại trang là thấy đúng.

## Vì sao chưa sửa ở DA1

Hồ sơ đã ký `lam-moi-chuyen-viec-qua-loi-chung` AC-1 ghim «`invalidateQueries` được gọi đúng ba lần với
đúng ba khoá … (không khoá nào khác)». Thêm khoá `viec.*` hay `dashboard.summary` vào `workTransferred` là
mở lại tiêu chí đã ký đó, không phải việc của DA1 (ruling S3 trong `_acceptance/viec-chung/decisions.jsonl`).

## Hướng

Mở một hợp đồng nhỏ sửa AC-1 của hồ sơ kia: `workTransferred` làm mới thêm `viec.cuaToi`, `viec.cuaBanGhi`,
`viec.get`, `viec.lichSu` và `dashboard.summary`, theo luật «một truy vấn màn đọc thì vào danh sách mà lệnh
ghi làm mới» của `docs/api.md` mục «Freshness». Cặp ca hai chiều trên cùng fixture: sau chuyển, khoá Việc
bị đánh dấu cũ; query không liên quan vẫn không.
