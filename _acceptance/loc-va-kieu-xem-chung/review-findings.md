# Review findings: loc-va-kieu-xem-chung (round 1)

## Trong hợp đồng

- **The desktop «Lọc» button in DataTableFacetMenu still fades its count with opacity-60, which breaks AC-1 and design.md**
  AC: AC-1
  file: `packages/ui/src/components/data-table.tsx:400`
  severity: high
  source: conventions
  detail: This round changed `FacetCount` and the mobile filter button (line ~549, `activeFilterCount`) to `text-muted-foreground tabular-nums`. The other «Lọc» button, in the exported `DataTableFacetMenu`, was not changed and still renders `<span className="tabular-nums opacity-60">({activeCount})</span>`. That component is the filter button DataTable uses from `sm` up (line 619), and Thoả thuận (deals-table.tsx:286), Onboarding (danh-muc-table.tsx:332), OKR (loc-okr.tsx:170) and Lộ trình call it directly. AC-1 in the signed contract says the active-filter count on the «Bộ lọc» button uses `text-muted-foreground`, not `opacity-*`. design.md («Chip lọc và chuyển kiểu xem») says the same: counts are secondary text, never `opacity-*`. The same file has two more counts still on `opacity-60`: the selected count in `FacetSubmenu` (line 282) and the visible-column count (line 681). The lkx tests appear to check only the mobile button, so the eval misses this. Fix: change the `opacity-60` count at line 400, and the one at line 282, to `text-muted-foreground tabular-nums`.
  rationale: AC-1 nói rõ số bộ lọc đang bật trên nút «Bộ lọc» của DataTable phải dùng text-muted-foreground, không opacity-*; nút Lọc của DataTableFacetMenu vẫn dùng opacity-60 nên AC-1 chưa đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rows in Tài liệu › Trang open a page by finding the <a> in the DOM and calling .click() instead of navigating**
  Người dùng thấy gì: Bấm vào một hàng trong danh sách trang tài liệu vẫn mở đúng trang. Nhưng cách mở dựa vào liên kết đầu tiên trong hàng, nên sau này thêm một liên kết khác vào hàng thì hàng có thể mở nhầm chỗ mà không báo lỗi.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Bộ lọc Tài liệu ghi đường dẫn bằng history replace: nút lùi không còn đi qua từng lần đổi bộ lọc hay sang trang**
  Người dùng thấy gì: Ở màn Tài liệu, sau khi đổi bộ lọc hay sang trang khác, bấm nút lùi của trình duyệt sẽ rời hẳn màn Tài liệu thay vì quay về bộ lọc hay trang trước đó.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-loc.ts`
  severity: medium
  Đề xuất: known-limits

- **Mỗi lần đổi bộ lọc hay trang ở Tài liệu, cả thanh lọc biến mất, thay bằng khung xương**
  Người dùng thấy gì: Ở màn Tài liệu, mỗi lần bấm đổi bộ lọc hay sang trang, cả thanh lọc chớp biến mất một lúc rồi mới hiện lại. Người dùng bàn phím mất vị trí đang đứng và bị đưa về đầu trang.
  file: `apps/app/app/(app)/[slug]/tai-lieu/danh-sach-trang.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bước 1b của chup-loc.mjs đo «không tải lại trang» bằng một chỉ số không bao giờ tăng, nên phép kiểm này không bao giờ đỏ**
  Người dùng thấy gì: Phép kiểm tự động xác nhận bấm chip ở Tài liệu không tải lại trang thực ra không bao giờ báo lỗi được. Nếu sau này có người làm màn tải lại cả trang thì phép kiểm vẫn báo đạt.
  file: `_acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 + 1: lời hứa về đường dẫn của 4 thẻ trang con chỉ đo một thẻ, phần còn lại đo bằng grep mã nguồn**
  Người dùng thấy gì: Bài kiểm tự động chỉ thử đường dẫn của một trong bốn thẻ trang con ở Tài liệu. Nếu một thẻ khác bị dựng sai đường dẫn khi giữ bộ lọc thì bài kiểm không phát hiện.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: quan hệ với bộ đọc máy chủ khai cho cả 7 hành động nhưng chỉ assert 3**
  Người dùng thấy gì: Bài kiểm tự động chỉ xác nhận ba trong bảy thao tác lọc ở Tài liệu cho ra đúng giá trị khi mở lại bằng đường dẫn. Nếu chọn đơn vị, chủ trang hay lưu trữ ghi sai đường dẫn thì bài kiểm vẫn báo đạt.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: ô «ô chọn» của ma trận 3×2 chỉ đo có mặt, không đo quan hệ giá trị như tên bài hứa**
  Người dùng thấy gì: Trên điện thoại, bài kiểm tự động chỉ xác nhận ô chọn kiểu xem có hiện, chưa kiểm chọn một giá trị thì đường dẫn có đổi đúng không.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: «đối chứng trang 2 trước khi bấm» đọc lại chính chuỗi gieo vào, nên không bao giờ đỏ**
  Người dùng thấy gì: Bài kiểm tự động xác nhận đổi bộ lọc đưa về trang 1 nhưng không thật sự chứng minh màn đang đứng ở trang 2 trước khi bấm, nên bài kiểm có thể báo đạt dù màn chưa đúng.
  file: `apps/app/test/loc-va-kieu-xem.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
