## Trong hợp đồng

Không có phát hiện mới ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Không có mục mới ở vòng này.

- **`tinHieu.daLuuTru` là thủ tục danh sách mới, không nhận listInput, mà không có ngoại lệ ghi tên (r1)**
  Người dùng thấy gì: Dạng xem «Đã lưu trữ» tải hết tín hiệu đã lưu trữ về trình duyệt rồi mới lọc và chia trang. Với số lượng hiện nay người dùng không thấy khác biệt, nhưng khi kho lưu trữ lớn dần thì trang sẽ chậm.
  Căn cứ: Nhẹ với người dùng hôm nay vì số tín hiệu lưu trữ còn ít, dữ liệu không mất hay lộ, và sửa sau không đụng gì đến thứ người dùng đã thấy.
  file: `apps/api/src/tin-hieu/tin-hieu.router.ts`
  severity: medium
  Đề xuất: known-limits

- **Ba con số chuyển từ trang máy chủ sang component client tự tính (r1)**
  Người dùng thấy gì: Ba ô số đầu thẻ hiển thị đúng như hợp đồng; chỉ là cách tính được đặt ở phía trình duyệt thay vì phía máy chủ. Người dùng không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng gì tới người dùng: số vẫn đúng, không mất hay lộ dữ liệu; chỉ là lệch nếp dựng nên có thể dọn sau.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Dạng xem «Đã lưu trữ» gắn trạng thái «Chưa lấy về» cho tín hiệu đã lưu trữ và đưa nó vào bộ lọc Trạng thái (r1)**
  Người dùng thấy gì: Ở dạng «Đã lưu trữ», ô lọc Trạng thái vẫn hiện và đề nghị lọc theo «Chưa lấy về» cho các tín hiệu đã lưu trữ, gây khó hiểu dù cột trạng thái đã ẩn.
  Căn cứ: Chỉ gây rối mắt ở một ô lọc phụ, không làm mất hay sai dữ liệu, người dùng bỏ qua hoặc bỏ lọc là xong; sửa sau rẻ.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: low
  Đề xuất: known-limits

- **Phép đo màn thiếu chặn kho riêng `_do` mà các phép đo cùng loại đều có, dù nó gọi kéo về thật (r1)**
  Người dùng thấy gì: Chạy phép đo màn theo cách trần (không qua lệnh chuẩn) có thể ghi vào kho dữ liệu chung và đóng dấu «đã lấy về» lên tín hiệu thật. Người dùng cuối không bị ảnh hưởng nếu cứ chạy bằng lệnh chuẩn.
  Căn cứ: Chỉ xảy ra khi người làm chạy sai cách một công cụ nội bộ; nhưng nếu xảy ra thì dấu đã lấy về không đảo được, nên cần ghi chú cảnh báo, sửa rẻ.
  file: `_acceptance/go-tin-hieu-rac/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **In the Archived view, archived signals show up as 'Not opened yet' (Chờ lấy về) in the status filter, and a status filter carried over from the main view can show the 'No archived signals' message when archived signals exist (r1)**
  Người dùng thấy gì: Nếu đang lọc theo một trạng thái ở bảng chính rồi chuyển sang «Đã lưu trữ», bảng có thể báo «Chưa lưu trữ tín hiệu nào» dù thực ra có tín hiệu đã lưu trữ. Ô lọc Trạng thái ở đó cũng ghi «Chưa lấy về» cho tín hiệu đã lưu trữ.
  Căn cứ: Gây hiểu nhầm tạm thời nhưng không mất dữ liệu; người dùng gỡ bộ lọc là thấy lại đủ tín hiệu, sửa sau không đắt.
  file: `apps/app/lib/tin-hieu/loc-tat-ca.ts`
  severity: medium
  Đề xuất: known-limits

- **The migration check (gtr_migration) fails after the PR merges, because it compares the schema against merge-base(HEAD, origin/onehub) (r1)**
  Người dùng thấy gì: Sau khi gộp, phép kiểm migration của hồ sơ này sẽ báo đỏ dù migration vẫn chỉ thêm và an toàn. Người dùng không thấy gì, chỉ người làm gặp báo đỏ giả ở lần ghim lại.
  Căn cứ: Không đụng dữ liệu hay màn hình người dùng; hậu quả là một lần đỏ giả cần giải thích khi ghim lại, đã gặp ở các hồ sơ trước và có cách xử lý biết sẵn.
  file: `_acceptance/go-tin-hieu-rac/rang/migration-chi-them.mjs`
  severity: medium
  Đề xuất: known-limits

- **Archiving or restoring a signal the sender has deleted shows 'try again in a moment' and leaves the row in place, so retrying can never succeed (r1)**
  Người dùng thấy gì: Nếu người gửi vừa xoá tín hiệu đúng lúc quản trị bấm Lưu trữ hay Khôi phục, quản trị thấy báo «thử lại sau» và dòng vẫn nằm đó; thử lại bao nhiêu lần cũng không được cho tới khi tải lại trang.
  Căn cứ: Hiếm gặp, không mất hay lộ dữ liệu, và người dùng tự gỡ được bằng cách tải lại trang; chỉ thông báo chưa nói đúng lý do.
  file: `apps/app/app/(app)/[slug]/tin-hieu/tat-ca/tat-ca-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): khong-ghi-de.mjs tuyên «không phần tử nào» nhưng bộ dò chỉ thấy một dạng cú pháp (r1)**
  Người dùng thấy gì: Phép kiểm tự động «không tô lại giao diện chung» bỏ sót một số kiểu viết, nên có thể để lọt một chỗ tô màu hay chỉnh góc sai nếp mà không báo. Người dùng cuối không thấy hậu quả ngay.
  Căn cứ: Chỉ làm lỏng một lưới kiểm về độ đồng nhất giao diện, không ảnh hưởng dữ liệu hay thao tác của người dùng; lệch nếp nếu có thì bắt được ở rà soát và sửa sau rẻ.
  file: `_acceptance/go-tin-hieu-rac/rang/khong-ghi-de.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
