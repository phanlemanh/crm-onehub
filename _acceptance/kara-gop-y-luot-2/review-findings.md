# Review findings: kara-gop-y-luot-2 (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New KR-edit permission check bypasses OkrAccessService.ghiDuocKr and duplicates the rule with a raw Prisma count**
  Người dùng thấy gì: Hiện nay nút Nhờ Kara và quyền thật ở máy chủ khớp nhau. Nếu sau này quy tắc ai được sửa KR mở rộng (ví dụ thêm người được ủy quyền), nút vẫn hiện nhưng bấm vào sẽ báo bị cấm.
  file: `apps/api/src/okr/tro-ly.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Undo of an accepted alignment guesses the created alignment id by diffing the client cache; the server drops the id it created**
  Người dùng thấy gì: Trong vài ca hiếm, ví dụ mạng chập chờn đúng lúc nhận một góp ý Căn chỉnh, biên nhận sẽ không có nút Hoàn tác dù liên kết đã được tạo.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: known-limits

- **Background tracking loop silently swallows fetch errors and stops for good**
  Người dùng thấy gì: Nếu mạng chập chờn một lần trong lúc Kara đang đọc và khung đã đóng, số góp ý chờ trên danh sách có thể đứng yên ở số cũ cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: low
  Đề xuất: known-limits

- **neoGopYKr URL parser written inline twice instead of named next to parseAsNeoGopY**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào; chỉ là về sau muốn đổi cách đọc liên kết dẫn tới góp ý thì phải sửa hai chỗ.
  file: `apps/app/app/(app)/[slug]/okr/dong-dan-gop-y.tsx`
  severity: low
  Đề xuất: wont-fix

- **After accepting an alignment suggestion, the row disappears and comes back while the caches refetch**
  Người dùng thấy gì: Khi nhận một góp ý Căn chỉnh, dòng góp ý có thể biến mất một thoáng rồi mới hiện biên nhận. Nếu đó là góp ý cuối, vùng Kara nháy sang trạng thái rỗng và con trỏ bàn phím bị mất vị trí.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: known-limits

- **Every error code other than NOT_FOUND and CONFLICT becomes "Thử lại sau ít phút", which hides the server's real reason for failures a retry cannot fix**
  Người dùng thấy gì: Khi một góp ý không thể nhận được vì lý do cố định (ví dụ Mục tiêu đích chưa công bố hoặc đã được liên kết), người dùng vẫn chỉ thấy câu thử lại sau ít phút và thử mãi cũng không được, không biết lý do thật.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: medium
  Đề xuất: new-contract

- **Background polling after closing the sheet stops on the first failed fetch, so the chip and "Của tôi" keep the old count**
  Người dùng thấy gì: Nếu một lần tải lỗi trong lúc Kara đang đọc sau khi đóng khung, số góp ý chờ trên chip và mục Của tôi giữ nguyên số cũ dù Kara đã đọc xong.
  file: `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình): k3-tat đếm «Thử lại xám» === 0 trong khi trạng thái off không bao giờ dựng nút Thử lại**
  Người dùng thấy gì: Phép kiểm xác nhận không có nút Thử lại bị xám không lời giải thích thực ra không thể bắt được lỗi đó, nên nếu sau này nút xám quay lại thì kiểm tra vẫn báo xanh.
  file: `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): lời hứa «giờ Việt Nam» của AC-14 chỉ được đo bằng grep mã nguồn; mọi phép đo đầu ra đều chạy khi TZ đã là Asia/Ho_Chi_Minh**
  Người dùng thấy gì: Việc giờ hiển thị luôn là giờ Việt Nam chỉ được kiểm bằng cách đọc mã, chưa thử trên máy đặt múi giờ khác. Nếu sau này có chỗ định dạng theo giờ máy, kiểm tra vẫn xanh.
  file: `_acceptance/kara-gop-y-luot-2/rang/ngay-gio.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp đã khai): vết (g) ghim 'neo sai: kr' chứ không phải 'focus roi ve body' như E13/E15 khai; nhánh kiểm body không bao giờ được chứng minh là đỏ**
  Người dùng thấy gì: Một phép kiểm việc con trỏ bàn phím rơi về trang khi bấm Xem góp ý chưa được chứng minh là bắt được lỗi; người dùng không thấy hậu quả gì cho tới khi lỗi đó thật sự xảy ra.
  file: `_acceptance/kara-gop-y-luot-2/rang/dot-bien.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
