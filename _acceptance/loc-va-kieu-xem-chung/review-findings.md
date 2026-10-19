# Review findings: loc-va-kieu-xem-chung (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chup-loc.mjs now measures Onboarding only in the Board view, so the default Table view is no longer measured, and coGap on Onboarding silently does nothing**
  Người dùng thấy gì: Anh chup kiem tra man Onboarding hien chi con the hien kieu Bang cot, khong con kieu Bang mac dinh, nen phan loc va chuyen kieu xem o kieu Bang chua duoc do lai bang anh o khung dien thoai va may tinh. Man hinh van chay, nhung nguoi duyet khong co anh de tu xem kieu Bang cua Onboarding.
  file: `_acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Rows in Tài liệu › Trang open a page by finding the <a> in the DOM and calling .click() instead of navigating (r1)**
  Người dùng thấy gì: Bấm vào một hàng trong danh sách trang tài liệu vẫn mở đúng trang. Nhưng cách mở dựa vào liên kết đầu tiên trong hàng, nên sau này thêm một liên kết khác vào hàng thì hàng có thể mở nhầm chỗ mà không báo lỗi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Bộ lọc Tài liệu ghi đường dẫn bằng history replace: nút lùi không còn đi qua từng lần đổi bộ lọc hay sang trang (r1)**
  Người dùng thấy gì: Ở màn Tài liệu, sau khi đổi bộ lọc hay sang trang khác, bấm nút lùi của trình duyệt sẽ rời hẳn màn Tài liệu thay vì quay về bộ lọc hay trang trước đó.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-loc.ts`
  severity: medium
  Đề xuất: known-limits

- **Mỗi lần đổi bộ lọc hay trang ở Tài liệu, cả thanh lọc biến mất, thay bằng khung xương (r1)**
  Người dùng thấy gì: Ở màn Tài liệu, mỗi lần bấm đổi bộ lọc hay sang trang, cả thanh lọc chớp biến mất một lúc rồi mới hiện lại. Người dùng bàn phím mất vị trí đang đứng và bị đưa về đầu trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bước 1b của chup-loc.mjs đo «không tải lại trang» bằng một chỉ số không bao giờ tăng, nên phép kiểm này không bao giờ đỏ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm tự động xác nhận bấm chip ở Tài liệu không tải lại trang thực ra không bao giờ báo lỗi được. Nếu sau này có người làm màn tải lại cả trang thì phép kiểm vẫn báo đạt.
  file: `_acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 + 1: lời hứa về đường dẫn của 4 thẻ trang con chỉ đo một thẻ, phần còn lại đo bằng grep mã nguồn (r1)**
  Người dùng thấy gì: Bài kiểm tự động chỉ thử đường dẫn của một trong bốn thẻ trang con ở Tài liệu. Nếu một thẻ khác bị dựng sai đường dẫn khi giữ bộ lọc thì bài kiểm không phát hiện.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: quan hệ với bộ đọc máy chủ khai cho cả 7 hành động nhưng chỉ assert 3 (r1)**
  Người dùng thấy gì: Bài kiểm tự động chỉ xác nhận ba trong bảy thao tác lọc ở Tài liệu cho ra đúng giá trị khi mở lại bằng đường dẫn. Nếu chọn đơn vị, chủ trang hay lưu trữ ghi sai đường dẫn thì bài kiểm vẫn báo đạt.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: ô «ô chọn» của ma trận 3×2 chỉ đo có mặt, không đo quan hệ giá trị như tên bài hứa (r1)**
  Người dùng thấy gì: Trên điện thoại, bài kiểm tự động chỉ xác nhận ô chọn kiểu xem có hiện, chưa kiểm chọn một giá trị thì đường dẫn có đổi đúng không.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: «đối chứng trang 2 trước khi bấm» đọc lại chính chuỗi gieo vào, nên không bao giờ đỏ (r1)**
  Người dùng thấy gì: Bài kiểm tự động xác nhận đổi bộ lọc đưa về trang 1 nhưng không thật sự chứng minh màn đang đứng ở trang 2 trước khi bấm, nên bài kiểm có thể báo đạt dù màn chưa đúng.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
