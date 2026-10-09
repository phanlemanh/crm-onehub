# Review findings: soan-okr-trong-khung (round 2)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **luat.mjs --tu-thu now writes into real tracked source files in the shared worktree instead of a copy**
  Người dùng thấy gì: Khi chạy kiểm tra nghiệm thu, một bài phá-thử tạm sửa vài tệp thật rồi trả lại. Nếu bài này chạy cùng lúc với các bài đo màn khác, kết quả đo có thể đỏ giả, và nếu bị ngắt giữa chừng thì tệp sửa dở có thể còn sót lại. Người dùng cuối không bị ảnh hưởng, chỉ ảnh hưởng độ tin cậy của lượt kiểm.
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **E13 expected text in evals.yaml was not updated to match the new luat.mjs mục 5 check and red cases**
  Người dùng thấy gì: Phần chữ mô tả bài kiểm trong hồ sơ nghiệm thu còn nói bài kiểm đơn giản hơn thực tế. Người đọc hồ sơ sau này có thể không biết vì sao bài kiểm chặt hơn và có thêm ca thử. Tính năng cho người dùng không đổi.
  file: `_acceptance/soan-okr-trong-khung/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **luat.mjs --tu-thu now edits the real worktree files, but E10 says it works on a copy**
  Người dùng thấy gì: Bài phá-thử của kiểm tra nghiệm thu sửa thẳng tệp trong cây làm việc dù hồ sơ nói là chạy trên bản sao. Nếu bị ngắt giữa chừng, một tệp sản phẩm có thể còn dòng sửa dở. Đây là rủi ro cho người làm kho, không phải cho người dùng tính năng.
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): mục 5 vẫn đo «khung deal ở K5» chỉ bằng /K5/**
  Người dùng thấy gì: Bài kiểm tài liệu chỉ tìm chữ «K5» chứ chưa chắc câu đó thật sự hẹn dựng khung deal sau này. Nếu ai đó viết ngược nghĩa mà vẫn có chữ K5 thì bài kiểm vẫn qua. Người dùng cuối không thấy gì, nhưng lời hẹn trong tài liệu có thể sai mà không ai bắt được.
  file: `_acceptance/soan-okr-trong-khung/rang/luat.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): E14 đòi nút phòng không còn «Tiếp tục» nhưng chưa lần nào thấy bộ dò coTiep bật**
  Người dùng thấy gì: Bài kiểm nói nút của phòng không còn «Tiếp tục» sau khi đưa bộ OKR vào, nhưng chưa chứng minh được là nó sẽ báo đỏ nếu nút đó còn hiện. Nếu có lỗi nút «Tiếp tục» vẫn còn, bài kiểm có thể không thấy. Người dùng có thể gặp nút cũ mà không ai biết.
  file: `_acceptance/soan-okr-trong-khung/rang/man-dua-vao.mjs`
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
