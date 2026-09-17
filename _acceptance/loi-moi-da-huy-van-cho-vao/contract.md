---
schema_version: 1
feature: Lời mời đã huỷ hoặc từ chối thì thôi cho vào — phép kiểm cho phép theo danh sách trắng, không theo một chuỗi cấm
slug: loi-moi-da-huy-van-cho-vao
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: draft
approved_by:
approved_at:
---

# Acceptance Contract: loi-moi-da-huy-van-cho-vao

## Context

`decideSignIn` cho qua mọi dòng lời mời có `status !== "cancelled"`. Đó là phép
kiểm **theo danh sách cấm**, trong khi một danh sách cho phép phải kiểm **theo
danh sách trắng**: cho vào khi trạng thái nằm trong tập đã biết là còn hiệu lực,
chứ không phải khi nó khác một chuỗi.

Bảng `invitation` thuộc plugin organization của better-auth, và **chính nó** ghi
trạng thái. Bản mà `packages/auth` THẬT SỰ nạp là **1.6.25**, và nó xuất ra kiểu
`InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"` — `canceled`
**một chữ L**. (Cây còn một bản 1.4.22 nhưng đó chỉ là phụ thuộc bắc cầu của
`@better-auth/cli`, không phải bản mã nạp; bản nháp đầu của hợp đồng này đo nhầm
vào đó.) Mã kho so với `"cancelled"` hai chữ L, nên hai trạng thái kết thúc do
gói ghi **không bao giờ khớp**: người bị thu hồi qua lộ trình của gói, hoặc tự từ
chối lời mời, vẫn được cho vào với đúng vai ghi trong dòng.

Chiều ngược lại cũng thật, và nặng hơn: `revokeAllowance` của kho ghi
`"cancelled"` — một giá trị **không nằm trong** `InvitationStatus`. Hai vế ghi và
đọc của kho khớp nhau nên nút thu hồi của kho đang chặn đúng; nhưng bất kỳ bản
sửa nào chuyển vế đọc sang từ vựng của gói mà viết luật theo kiểu «chặn khi thuộc
tập kết thúc» sẽ cho vào lại **mọi người từng bị thu hồi qua giao diện kho**. Đó
là lý do AC-3 đòi chứng bằng một giá trị rác: luật phải fail-closed theo cấu
trúc, không theo việc liệt kê đủ các giá trị xấu.

Cột `status` trong Prisma là `String` trần, không enum, không ràng buộc — nên
không có lớp nào khác chặn một giá trị lạ.

Phát hiện ở khối Ngoài hợp đồng của `man-xin-quyen-co-rang`, người quyết «mở hợp
đồng mới» ở Cổng 2 ngày 17/09.

## Criteria

- AC-1: Given một lời mời đã bị huỷ qua chính lộ trình của better-auth (trạng thái `canceled`), When người đó đăng nhập, Then hệ thống TỪ CHỐI cho vào, và không tạo dòng thành viên nào.
- AC-2: Given một lời mời đã bị từ chối (trạng thái `rejected`), When người đó đăng nhập, Then hệ thống TỪ CHỐI cho vào.
- AC-3: Given phép kiểm cho phép, When nó quyết, Then nó cho vào CHỈ KHI trạng thái nằm trong tập đã khai là còn hiệu lực. Một trạng thái lạ chưa từng thấy phải dẫn tới TỪ CHỐI, không phải cho vào. Phép đo phải chứng điều này bằng một giá trị rác, không chỉ bằng hai chuỗi đã biết.
- AC-4: Given `status` đi qua ranh giới đọc từ cơ sở dữ liệu, When nó vào mã quyết định, Then nó được PHÂN TÍCH thành kiểu miền tại chỗ đọc, không phải ép kiểu bằng `as`. Giá trị không phân tích được là một lỗi có tên, không phải một mặc định im lặng.
- AC-5: Given tập trạng thái còn hiệu lực mà kho khai, When so với tập trạng thái mà better-auth thật sự ghi, Then hai tập khớp nhau — và có một phép đo ĐỌC TỪ GÓI ĐÃ CÀI để khẳng định điều đó, chứ không chép tay danh sách vào một hằng rồi tin nó.
- AC-6: Given màn quản trị thành viên, When một lời mời ở trạng thái `canceled` hoặc `rejected`, Then nó KHÔNG hiện như đang chờ. Hiện sai trạng thái là tiêu chí đỏ.

## Coverage

- **A — nguồn ghi trạng thái:** lộ trình better-auth · mã của kho · dữ liệu cũ đã có sẵn trong bảng  [thước CE: `node_modules` của gói đã cài, đếm được từng chuỗi]
- **B — trạng thái:** `pending` · `accepted` · `canceled` · `rejected` · giá trị lạ  [thước CE: bốn chuỗi đếm được trong gói, cộng một ô rác cố ý]
- **C — hệ quả:** cho vào · từ chối · vai được cấp · màn quản trị hiển thị  [thước CE: `decideSignIn`, `ensureWorkspaceMembership`, `toStatus`]

`[GIẢ ĐỊNH]` Dữ liệu đang có trong bảng `invitation` của các bản cài thật chưa
được khảo sát — có thể đã tồn tại dòng `canceled` đang cho người ta vào ngay lúc
này. Cần người xác nhận ở Cổng 1 xem có phải đi kèm một lượt khảo sát dữ liệu không.

## Out of scope

- **Đổi bảng `invitation` sang enum ở tầng cơ sở dữ liệu.** Bảng do plugin ngoài sở hữu; ràng buộc thêm vào có thể vỡ khi gói nâng cấp. Vòng này chặn ở tầng đọc.
- **Gỡ thành viên đã vào rồi.** Việc đó nằm ở hồ sơ `go-thanh-vien-phai-giu-duoc`.

## Known limits

- Hợp đồng này chặn **đường vào**. Người đã có dòng thành viên từ trước không bị ảnh hưởng — đó là chủ ý, và là ranh giới với hồ sơ gỡ-thành-viên.
