## Trong hợp đồng

- **Nhận góp ý viết lại của Kara cho mục tiêu hay KR vừa gõ trong phiên: dòng không đổi chữ, và lần lưu sau lặng lẽ ghi đè chữ Kara**
  AC: AC-5
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/tai-lieu-bo.tsx:164`
  severity: high
  source: bugs
  detail: Mục tiêu hay KR tạo trong phiên mà còn Nháp có id nằm trong `luuDong.daLuu`. Vì vậy `mucTieuCoHien` và `krCoHien` giấu bản của máy chủ, và dòng được vẽ bằng `KhoiMucTieuMoi` / `DongKrMoi`, lấy chữ thẳng từ `banNhap` (`mt.ten`, `kr.ten`). Khi nhận một góp ý `viet-lai`, `docLai` chỉ ghi `theoKara` và gọi `boChuDaGo`, mà `boChuDaGo` chỉ xoá `tenCo`/`krCo`. `theoKara` chỉ được đọc trong `mtTheoKara`/`krTheoKara`, tức là chỉ ở `KhoiMucTieuDoc`/`DongKrDoc`. Kết quả: cơ sở dữ liệu đã mang chữ Kara, nhưng tài liệu vẫn hiện chữ cũ và không có dấu «đổi theo Kara» (AC-5 hứa dòng đổi ngay). Khối Chất lượng (`krMoiCua`, `mucTieuMoiConNhap`) cũng chấm trên chữ cũ. Tệ hơn, chỉ cần người soạn sửa một ô khác rồi rời ô (sửa Vì sao của mục tiêu, sửa đích của KR), `luuMucTieu`/`luuKr` (use-ghi-ban-nhap.ts:139/177) sẽ gửi `title` lấy từ `banNhap`. Gói gửi khác `dau` đã gửi, nên `updateObjective`/`updateKeyResult` ghi chữ cũ đè lên chữ Kara đã nhận mà không báo gì. Gặp đúng lối chính: gõ mới một bộ, «Nhờ Kara đọc bộ», rồi nhận góp ý.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Save errors are sorted by regex on the server's message text instead of a structured error shape**
  Người dùng thấy gì: Hiện nay nhập sai số vẫn được nhắc đúng câu «Ô này nhận số». Nếu sau này ai đổi cách viết thông báo lỗi ở phía máy chủ, người dùng sẽ chỉ thấy câu lỗi chung chung thay vì lời nhắc cụ thể.
  Căn cứ: Hôm nay người dùng chưa gặp gì; nếu về sau gặp thì chỉ mất lời nhắc cụ thể, chữ đã gõ vẫn còn và không mất dữ liệu, sửa sau không đắt.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: medium
  Đề xuất: known-limits
- **Production code ships a 16-flag context whose only consumer is the test file**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là mã giao cho người dùng mang thêm các công tắc chỉ bài kiểm mới dùng, làm mã khó đọc hơn cho người bảo trì.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu; dọn lại tốn công lớn vì mọi thành phần của khung soạn đều đang dựa vào nó, mà lợi ích chỉ là gọn mã.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/phu-thuoc.ts`
  severity: low
  Đề xuất: wont-fix
- **Status colours are mixed in this change: some use toneTheoNghia, others set tone literals directly**
  Người dùng thấy gì: Một vài chấm trạng thái trong khung Soạn được đặt màu tay thay vì theo bảng chung. Màu hiện ra đúng nghĩa, nhưng sau này đổi bảng màu chung thì các chấm này sẽ không đổi theo.
  Căn cứ: Người dùng hiện thấy màu đúng và không mất gì; chỉ gây lệch khi đổi bảng màu chung về sau, sửa sau rẻ.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khoi-chat-luong.tsx`
  severity: low
  Đề xuất: known-limits
- **Lối «thêm KR» từ góp ý Kara không làm gì với mục tiêu Nháp vừa tạo trong phiên**
  Người dùng thấy gì: Khi Kara đề xuất thêm một KR cho mục tiêu vừa gõ trong lần soạn này, bấm nhận không thấy dòng KR mới hiện ra, người dùng tưởng nút hỏng. Họ vẫn tự thêm KR bằng tay được.
  Căn cứ: Không mất dữ liệu và người dùng có lối thay thế là tự thêm KR, nhưng gây khó hiểu ngay ở lối soạn chính cùng Kara; nên làm cùng chỗ sửa lỗi nhận góp ý.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khung-soan-bo.tsx`
  severity: medium
  Đề xuất: new-contract
- **Chip góp ý bị ẩn khi người xem không ở quyền «soan»: góp ý của mục tiêu cá nhân và của người chỉ sửa KR không còn lối nào để xem**
  Người dùng thấy gì: Chủ một mục tiêu cá nhân, hoặc người chỉ được sửa KR, có góp ý Kara đang chờ nhưng không thấy chip nào để mở ra xem. Góp ý của họ thành không với tới được.
  Căn cứ: Không mất dữ liệu, nhưng nhóm người này mất hẳn lối xem góp ý mà trước đây có; cần chủ kho chốt ai được thấy chip trước khi sửa.
  file: `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  severity: medium
  Đề xuất: new-contract
- **Nút «Nhờ Kara đọc bộ» ở cột bên khi bộ trống bấm được nhưng không làm gì**
  Người dùng thấy gì: Khi bộ chưa có mục tiêu nào, nút «Nhờ Kara đọc bộ» vẫn bấm được nhưng không có gì xảy ra. Người dùng có thể tưởng Kara bị treo.
  Căn cứ: Chỉ gây khó hiểu nhẹ ở bộ trống, không mất dữ liệu; người dùng đã có lối «Nhờ Kara soạn nháp» riêng cho trường hợp này.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/khoi-gop-y.tsx`
  severity: low
  Đề xuất: known-limits
- **Trạng thái «loi» của dòng có sẵn bị kẹt khi người dùng trả giá trị về như cũ**
  Người dùng thấy gì: Sau một lần lưu lỗi, nếu người dùng sửa ô về đúng giá trị ban đầu thì câu lỗi vẫn còn hiện và khi đóng khung vẫn bị hỏi «Bỏ dòng chưa lưu?» dù không còn gì để lưu.
  Căn cứ: Chỉ là cảnh báo sai trong một ca hiếm, không mất dữ liệu, và người dùng tự thoát được bằng cách xác nhận hoặc tải lại.
  file: `apps/app/app/(app)/[slug]/okr/soan-bo/use-luu-dong.ts`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 4 (âm-tính-một-mình): «không có [data-vung-kara]/[data-de-xuat-neo]» đo bộ chọn mà mã thật không bao giờ dựng; đối chứng dương tự cắm thuộc tính**
  Người dùng thấy gì: Người dùng hiện không thấy gì sai. Chỉ là bài kiểm tự động «khung chi tiết không còn khối Kara» sẽ không bắt được nếu sau này khối đó vô tình được gắn lại.
  Căn cứ: Không ảnh hưởng người dùng lúc này; rủi ro chỉ là một lỗi quay lại trong tương lai có thể lọt qua kiểm tự động.
  file: `apps/app/test/che-do-soan-bo-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 1 (đo hiện vật thay vì đầu ra của lượt): «ANH 10/10» của E16 chỉ kiểm tệp có mặt và khác rỗng, trên chính các PNG đã commit**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng. Chỉ là phép kiểm «đủ 10 ảnh» có thể báo xanh dù lượt này không chụp lại ảnh, nên người ký phải tự xem ảnh để chắc.
  Căn cứ: Không đụng tới sản phẩm hay dữ liệu, và người ký vốn xem ảnh bằng mắt ở Cổng Bằng chứng nên rủi ro thấp; siết thêm tốn công mà lợi ít.
  file: `_acceptance/che-do-soan-bo-okr/rang/man-soan-do.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
