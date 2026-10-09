# Review findings: soan-okr-trong-khung (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cột Kara vẫn mang hai tên cùng lúc: đầu dock đã đổi sang «Kara đang soạn…» nhưng lượt đang chạy trong thân vẫn là «Trợ lý OKR đang soạn…»**
  Người dùng thấy gì: Khi Kara đang soạn, đầu cột ghi «Kara đang soạn…» nhưng ngay bên dưới, trong phần trò chuyện, vẫn ghi «Trợ lý OKR đang soạn…». Người dùng thấy hai tên khác nhau cho cùng một trợ lý AI trong cùng một cột.
  file: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx`
  severity: medium
  Đề xuất: new-contract

- **The "one name: Kara" fix only covers the column header; the conversation line still says "Trợ lý OKR"**
  Người dùng thấy gì: Trong cùng một cột, đầu cột gọi trợ lý là «Kara» còn dòng trò chuyện đang chạy gọi là «Trợ lý OKR». Người dùng có thể tưởng là hai trợ lý khác nhau.
  file: `apps/app/app/(app)/[slug]/okr/soan/hoi-thoai-soan.tsx`
  severity: medium
  Đề xuất: new-contract

- **The new sk-dau test checks only the header for "Trợ lý", so the same column passes while it still shows "Trợ lý OKR"**
  Người dùng thấy gì: Bài kiểm tra tự động chỉ nhìn đầu cột Kara nên vẫn báo xanh dù phần trò chuyện bên dưới còn gọi trợ lý là «Trợ lý OKR». Lỗi hiển thị tên đó có thể lọt qua mà không ai được báo.
  file: `apps/app/test/soan-okr-trong-khung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **E11/E12 evidence mixes captures from before and after the label fix; the E12 judgment image still shows the old header**
  Người dùng thấy gì: Một vài ảnh minh chứng cho người duyệt được chụp trước lần sửa nhãn cuối, nên còn hiện chữ «Trợ lý OKR» ở đầu cột. Người duyệt có thể xem một ảnh cũ mà tưởng đó là giao diện hiện tại.
  file: `_acceptance/soan-okr-trong-khung/evidence/E11-ST-khung-rong-dang-soan-1440-dark.png`
  severity: medium
  Đề xuất: known-limits

- **TabsList/Tabs restyled with className at the call site instead of adding a packages/ui variant (r1)**
  Người dùng thấy gì: Thanh tab Trò chuyện/Bản nháp trên khổ hẹp được chỉnh kiểu tại chỗ thay vì thành một kiểu dùng chung. Người dùng không thấy khác biệt, nhưng sau này sửa giao diện thanh tab phải sửa ở hai nơi.
  file: `apps/app/app/(app)/[slug]/okr/soan/khung-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Old-link redirect builds the query string by hand and calls router.replace instead of the nuqs/record-stack setter (r1)**
  Người dùng thấy gì: Mở một link soạn OKR cũ trong lúc địa chỉ đang mang thêm lựa chọn của bản ghi khác (tab, luồng trao đổi) thì các lựa chọn đó có thể bị áp nhầm sang khung soạn. Gặp hiếm vì link cũ thường mở từ ngoài vào.
  file: `apps/app/app/(app)/[slug]/okr/soan/chuyen-link-cu.ts`
  severity: medium
  Đề xuất: known-limits

- **Legacy /okr/soan/[cuocSoanId] redirect page departs from the repo's record-redirect pattern (r1)**
  Người dùng thấy gì: Mở đường dẫn soạn OKR cũ có thể thoáng thấy khung trang trước khi được chuyển sang Theo đơn vị, thay vì chuyển ngay. Đích đến vẫn đúng.
  file: `apps/app/app/(app)/[slug]/okr/soan/[cuocSoanId]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **duongTrangSoan is now an unused export; donViCua is re-exported from a second module (r1)**
  Người dùng thấy gì: Còn sót một hàm không ai dùng và một hàm có thể nhập từ hai nơi. Người dùng không thấy gì; chỉ làm mã khó đọc hơn một chút.
  file: `apps/app/app/(app)/[slug]/okr/soan/luat-ban-nhap.ts`
  severity: low
  Đề xuất: wont-fix

- **Khung soạn mất phần chặn liên kết của GiuTrangSoan: liên kết trong khung điều hướng đi khi Kara đang soạn mà không hỏi (r1)**
  Người dùng thấy gì: Khi Kara đang soạn hoặc anh chị đã gõ dở, bấm vào một liên kết trong khung (ví dụ «Tới Kho tài liệu») sẽ rời khung ngay mà không hỏi, và chữ đang gõ bị mất.
  file: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx`
  severity: medium
  Đề xuất: new-contract

- **Tham số tabSoan sót trên URL sau khi đóng khung, lần mở cuộc sau ở khổ hẹp rơi vào tab Bản nháp (r1)**
  Người dùng thấy gì: Trên màn hình hẹp, nếu anh chị đóng khung khi đang ở tab Bản nháp thì lần mở cuộc soạn sau, kể cả cuộc mới chưa có bản nháp, sẽ mở thẳng tab Bản nháp thay vì Trò chuyện.
  file: `apps/app/components/crm/record-sheet/record-stack.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): mục 2 grep định nghĩa biến thể trong dock.tsx, không xem cột Kara của khu soạn thực sự dùng biến thể nào (r1)**
  Người dùng thấy gì: Một kiểm tra phụ chỉ xem bảng kích thước có khai đủ, không xem khung soạn có dùng đúng kích thước đó; kích thước thật vẫn được đo riêng bằng trình duyệt.
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «không gõ gì: rời trang đi ngay» chỉ kiểm không có hộp hỏi, trong khi bộ dựng thử không thể đóng (r1)**
  Người dùng thấy gì: Một bài thử cũ về việc rời màn soạn khi chưa gõ gì chỉ kiểm không có hộp hỏi, nên không phát hiện được nếu nút đóng ngừng hoạt động.
  file: `apps/app/test/soan-okr.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «không khai thì đóng ngay, không hộp» chỉ kiểm không có alertdialog (r1)**
  Người dùng thấy gì: Một bài thử của thành phần khung dùng chung chỉ kiểm không có hộp hỏi chứ không kiểm khung thật sự đóng, nên không bắt được lỗi nút đóng bị kẹt.
  file: `packages/ui/test/giu-thay-doi-loi-hoi.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
