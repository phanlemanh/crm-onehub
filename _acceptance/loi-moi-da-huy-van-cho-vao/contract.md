---
schema_version: 1
feature: Lời mời đã huỷ hoặc từ chối thì thôi cho vào — phép kiểm cho phép theo danh sách trắng, không theo một chuỗi cấm
slug: loi-moi-da-huy-van-cho-vao
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-09-18
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
- AC-7: Given mã ghi trạng thái kết thúc vào cơ sở dữ liệu, When nó chọn giá trị, Then nó neo vào một hằng CÓ TÊN mang đúng chuỗi, không neo vào VỊ TRÍ trong danh sách. Phép đo phải ghim chuỗi thật, không được khẳng định bằng chính biểu thức mà mã dùng để ghi — hai vế cùng một biểu thức là đúng vòng vo và không thấy được một lượt đảo thứ tự.
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

- **Nâng phạm vi ở Cổng 2 ngày 18/09.** Bốn mục ngoài hợp đồng hạng nặng cùng một gốc — mã ghi trạng thái huỷ bằng chỉ số mảng — được chủ kho quyết «nâng phạm vi sửa ngay» thay vì ghi vào đây. AC-7 và phép đo E10 sinh ra từ quyết định đó.
**Mười bốn mục ngoài hợp đồng, chủ kho quyết ghi giới hạn ở Cổng 2 ngày 18/09:**

- **Ngoài-1 (high).** Khi một thành viên bị gỡ, lời mời cũ của họ có thể vẫn còn hiệu lực, nên người vừa bị gỡ có nguy cơ đăng nhập lại được.
- **Ngoài-2 (high).** Một bài kiểm tra tự động vẫn dùng dữ liệu kiểu cũ, nên phép đo liên quan không còn phản ánh đúng cách hệ thống hoạt động hiện tại dù kết quả cuối vẫn hiện đạt.
- **Ngoài-3 (medium).** Tài liệu mô tả phép đo ghi nhầm một số nội dung không khớp với bài kiểm tra thật, có thể khiến người đọc hiểu sai mức đã được kiểm chứng.
- **Ngoài-4 (medium).** Danh sách trạng thái hiển thị cho màn thành viên được chép tay ở một nơi riêng, nên nếu sau này có thêm một trạng thái mới, cả màn danh sách thành viên có thể lỗi không tải được.
- **Ngoài-5 (medium).** Một bước xử lý khi lời mời được chấp nhận vẫn viết trạng thái bằng chữ tay, nên nếu sau này từ vựng trạng thái đổi, lời mời có thể bị kẹt ở trạng thái chờ thay vì chuyển thành thành viên.
- **Ngoài-6 (low).** Một đoạn kiểm tra kỹ thuật nội bộ dùng cách viết riêng biệt so với phần còn lại của mã nguồn; điều này không ảnh hưởng tới người dùng cuối.
- **Ngoài-7 (high).** Trang bằng chứng liên kết từ thẻ quyết định vẫn hiển thị kết quả cũ là đạt toàn phần, trong khi báo cáo mới nhất thực ra là từ chối, nên người đọc có thể thấy thông tin đã lỗi thời.
- **Ngoài-8 (high).** Thẻ tóm tắt gửi cho người ký ghi rằng mọi phép kiểm đều đạt và không có lỗi, trong khi hồ sơ thực tế đang bị từ chối, có thể khiến người ký nhầm mà duyệt một hồ sơ chưa đạt.
- **Ngoài-9 (medium).** Danh sách trạng thái hiển thị cho màn thành viên được chép tay riêng, nên nếu sau này better-auth thêm một trạng thái mới, cả màn danh sách thành viên có thể lỗi không tải được thay vì chỉ hiện sai một dòng.
- **Ngoài-10 (medium).** Dữ liệu trạng thái cũ còn sót lại sẽ khiến nhật ký hệ thống ghi lỗi lặp lại mỗi lần người liên quan đăng nhập hoặc admin mở màn thành viên, dù quyết định cho vào hay từ chối vẫn đúng.
- **Ngoài-11 (low).** Một bài kiểm tra tự động vẫn dùng giá trị trạng thái cũ mà hệ thống không còn tạo ra, nên phép đo liên quan không còn phản ánh đúng cách ghi dữ liệu hiện tại dù kết quả vẫn hiện đạt.
- **Ngoài-12 (low).** Khi gỡ một thành viên hoặc mời lại một địa chỉ đã có lời mời, hệ thống dùng một danh sách trạng thái viết tay riêng, nên người vừa bị gỡ có nguy cơ vẫn đăng nhập lại được.
- **Ngoài-13 (high).** Bài kiểm tự động cho trường hợp lời mời bị từ chối không thực sự đối chiếu với chuỗi thật do gói bên ngoài ghi ra, nên một lỗi đúng chỗ này có thể trôi qua mà không ai phát hiện, dù hệ thống hiện vẫn hoạt động đúng.
- **Ngoài-14 (high).** Bài kiểm tự động cho dữ liệu cũ đã huỷ không thực sự đối chiếu với chuỗi từng được ghi trước đây, nên một lỗi đúng chỗ này có thể trôi qua mà không ai phát hiện, dù hệ thống hiện vẫn hoạt động đúng.

- Hợp đồng này chặn **đường vào**. Người đã có dòng thành viên từ trước không bị ảnh hưởng — đó là chủ ý, và là ranh giới với hồ sơ gỡ-thành-viên.
