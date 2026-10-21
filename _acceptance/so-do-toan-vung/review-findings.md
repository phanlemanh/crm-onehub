# Review findings: so-do-toan-vung (round 1)

## Trong hợp đồng

- **Below md the Map screen's lists get cut off and cannot be scrolled (company-wide and objective-centred)**
  file: `apps/app/app/(app)/[slug]/okr/soan/khung-trang-okr.tsx:11`
  severity: medium
  AC: AC-7
  source: bugs
  detail: KhungTrangOkr now wraps every laDuongSoDo route in `<PageShell contained width="full">`, which makes `main[data-slot=page-shell-scroll]` `min-h-0 overflow-hidden` inside the fixed `h-svh` app column. On the Map screen, ManSoDo, SoDoDonVi (lop="toan-vung") and QuanhMucTieuNoiDung add only `flex min-h-0 flex-1 flex-col`. None of them adds an `overflow-y-auto`. That works for the canvas at md and above, but below md (`hep`) the same components render the stacked list `[data-so-do-danh-sach]` (one card per unit) or the four groups of `[data-quanh-danh-sach]`. Anything past the bottom of the viewport is clipped by overflow-hidden and the user cannot reach it. Before this change, /okr/so-do and /okr/quanh-muc-tieu/<id> used a non-contained PageShell (`overflow-y-auto`), so this is a regression. The measurement capture `.acceptance-runs/so-do-toan-vung/man/hep-ca-cong-ty-390.png` shows the list running past the bottom edge at 390x844 with 23 units. man.mjs checks only horizontal scrolling at 390, not whether the last item can be reached. AC-7 requires the same data to appear as a list on narrow screens.
  Căn cứ phân loại: AC-7 đòi cùng dữ liệu hiện thành danh sách ở khổ hẹp, mà danh sách bị cắt cụt và không cuộn tới được thì dữ liệu không hiện đủ.

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5): giu-ho-so.mjs bỏ mọi tệp _acceptance/ và docs/ khỏi tập tệp đổi, nên eval đã ký có paths trỏ đúng tệp đo mà vòng này sửa không được chạy lại**
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs:27`
  severity: high
  AC: AC-10
  source: measurement
  detail: Expected E11 (a) hứa liệt «mọi hồ sơ đã ký có eval ... paths khớp một tệp vòng này sửa (diff so với merge-base onehub)». Nhưng `GIU.boTepDoi` (dòng 27–32) lọc bỏ `^_acceptance\/` và `^docs\/` ở tepDoiCuaVong (dòng 277). Vòng này lại sửa đúng các tệp thước của hồ sơ đã ký: doi-nhan-khu-muc-tieu/kiem-ke.json, dat-okr-trong-crm/rang/man-okr.mjs, toan-canh-okr/rang/man-toan-canh.mjs và docs/design.md. Mô phỏng bằng chính các hàm khop/nhacChuoiBo của script cho thấy các eval còn sống sau không được liệt và không được chạy: doi-nhan-khu-muc-tieu#E8 (script dnk_kiem_ke, paths chỉ gồm kiem-ke.json, tệp bị xoá 39 dòng); dat-okr-trong-crm#E13, E16, E21 và ve-sinh-do-san-onehub#E16 (script dok_man_chrome; lệnh này không xuất hiện trong --liet-ke); toan-canh-okr#E3, E28 (script); toan-canh-okr#E17, E21 và dat-okr-trong-crm#E15 (ui-check, không có dòng UI KHOP PATHS); thanh-ben-khu-dung-chung#E11 (judgment, paths docs/design.md). Đối chứng dương kiemDuong không phát hiện được lỗ này, vì cả hai mục đều khớp qua đường apps/app.
  Căn cứ phân loại: AC-10 đòi mọi eval đã ký có paths khớp tệp vòng này sửa phải được xử lý, mà công cụ bỏ sót đúng các eval như vậy.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **SoDoDonVi và QuanhMucTieuNoiDung còn giữ nhánh lop="trang" không route nào dùng, và chép đôi bộ lọc ToggleGroup**
  Người dùng thấy gì: Trong mã còn sót một kiểu hiển thị cũ không màn nào dùng nữa. Người dùng không thấy gì khác, chỉ khiến việc bảo trì sau này rườm rà hơn.
  Căn cứ: Không ảnh hưởng gì trên màn của người dùng, dọn lúc nào cũng được và không mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx`
  severity: medium
  Đề xuất: known-limits

- **theo-don-vi/page.tsx để params tuỳ chọn chỉ để bài kiểm cũ gọi được; thiếu params thì lệnh chuyển đường cũ lặng lẽ không chạy**
  Người dùng thấy gì: Trang Theo đơn vị cho phép thiếu một tham số chỉ để chiều bài kiểm cũ. Khi chạy thật tham số luôn có nên người dùng không gặp lỗi.
  Căn cứ: Chạy thật không bao giờ rơi vào trường hợp thiếu, nên người dùng không bị ảnh hưởng; chỉ là nợ gọn gàng trong mã.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **duong-so-do.ts tự ghép chuỗi truy vấn bằng URLSearchParams, trong khi đã có soDoParsers và khuôn createSerializer**
  Người dùng thấy gì: Khi chuyển từ đường dẫn cũ sang Sơ đồ, nếu đường dẫn cũ mang một giá trị lọc sai thì giá trị sai đó được chép sang nguyên xi. Màn vẫn mở được, chỉ là bộ lọc có thể rơi về mặc định.
  Căn cứ: Chỉ xảy ra với đường dẫn cũ bị gõ sai, người dùng chỉ cần đổi lại bộ lọc trên màn là xong.
  file: `apps/app/app/(app)/[slug]/okr/so-do/duong-so-do.ts`
  severity: low
  Đề xuất: known-limits

- **Bỏ CayCanChinh nhưng để lại parser và khoá mucTinCay không còn ai dùng**
  Người dùng thấy gì: Còn sót vài khai báo bộ lọc mức tin cậy của cây cũ nhưng không màn nào dùng. Người dùng không thấy khác biệt.
  Căn cứ: Không có hậu quả nào với người dùng, dọn hay không cũng không đổi gì trên màn.
  file: `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`
  severity: low
  Đề xuất: wont-fix

- **Chuỗi giao diện không còn ai dùng sau khi bỏ ViewSwitch Bảng · Sơ đồ và đầu trang cũ**
  Người dùng thấy gì: Từ điển chữ còn vài câu của màn cũ không còn hiện ở đâu. Người dùng không nhìn thấy chúng.
  Căn cứ: Không hiện trên màn nên không gây nhầm lẫn, dọn sau cũng được.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: wont-fix

- **KhungSoDoCho là bản thứ ba của cùng một hộp xương rounded-lg border vẽ tay**
  Người dùng thấy gì: Khung chờ tải của màn Sơ đồ là một bản vẽ tay lặp lại giống các khung chờ khác. Người dùng vẫn thấy khung chờ bình thường.
  Căn cứ: Khung chờ hiển thị đúng, chỉ lệch nếp thiết kế chung; gom lại sau không mất gì.
  file: `apps/app/app/(app)/[slug]/okr/so-do/man-so-do.tsx`
  severity: low
  Đề xuất: known-limits

- **Breadcrumb tail stays a skeleton forever when the objective query fails or returns NOT_FOUND**
  Người dùng thấy gì: Khi mục tiêu không tải được hoặc không tìm thấy, thân màn báo lỗi đúng nhưng đoạn cuối của đường mảnh trên đầu vẫn hiện thanh chờ mãi. Người dùng có thể tưởng màn còn đang tải.
  Căn cứ: Thông báo lỗi chính vẫn rõ ràng ở thân màn và người dùng quay về sơ đồ cả công ty được, chỉ hơi gây khó hiểu ở đầu màn.
  file: `apps/app/app/(app)/[slug]/okr/so-do/dai-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **Global regex `.test` in a filter skips every other _acceptance path in giu-ho-so**
  Người dùng thấy gì: Công cụ kiểm hồ sơ đã ký có thể bỏ sót một số tệp khi dữ liệu thay đổi sau này. Hiện tại chưa làm lọt hồ sơ nào.
  Căn cứ: Hôm nay không có hậu quả đo được và đây là công cụ nội bộ, không ảnh hưởng người dùng cuối.
  file: `_acceptance/so-do-toan-vung/rang/giu-ho-so.mjs`
  severity: low
  Đề xuất: known-limits

- **dh4_cach_xem expected text still requires a dynamic import that the test now forbids**
  Người dùng thấy gì: Một câu mô tả trong hồ sơ nghiệm thu cũ tự mâu thuẫn với chính bài kiểm. Người dùng sản phẩm không bị ảnh hưởng, chỉ người đọc hồ sơ có thể bối rối.
  Căn cứ: Chỉ là chữ trong hồ sơ nội bộ, không ảnh hưởng người dùng và sửa câu chữ lúc nào cũng được.
  file: `_acceptance/so-do-can-chinh-don-vi/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): kiểm data-dang-mo !== "false" không bao giờ đỏ, và lời hứa «dòng lý do góp vào» không được đo (E3 ô (i), E6)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng mở thẻ đơn vị thì hiện đúng dòng lý do góp vào. Nếu sau này tính năng đó hỏng, bài kiểm vẫn báo xanh nên không ai biết.
  Căn cứ: Màn hiện chạy được nhưng sự an toàn khi sửa về sau thấp, vì lỗi có thể lọt mà không ai thấy; bổ sung bài kiểm là việc riêng, không mất dữ liệu.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5): E3 hứa ma trận 9 ô (a)–(i), bài thiếu ô (c), (d), (f) và không có assert đếm**
  Người dùng thấy gì: Một số thao tác như quay về sơ đồ cả công ty khi đang toàn màn hình, hoặc rê chuột lên khung nút, chưa có bài kiểm nào. Nếu chúng hỏng thì sẽ không được phát hiện sớm.
  Căn cứ: Chưa có bằng chứng hành vi đang sai, nhưng bài kiểm thiếu nên lỗi sau này dễ lọt; thêm ca kiểm là việc riêng.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5): E2 bước (3) thiếu ca «dựng lại vỏ thì về khung thường», bộ đếm buoc/lop đẩy vô điều kiện**
  Người dùng thấy gì: Việc tải lại trang thì trở về khung thường chưa được bài kiểm chứng minh chặt. Người dùng vẫn thấy hành vi đúng khi dùng thật nếu mã không đổi.
  Căn cứ: Không có dấu hiệu hành vi sai, chỉ là bằng chứng kiểm yếu; người dùng tải lại trang là tự khắc phục được.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng chỉ có điểm-case (hình 5): E7 hứa «bốn nhóm thứ tự [gop-vao, tam, kr, gop-vao-no]», nhưng phép lọc khiến nhóm thiếu vẫn qua**
  Người dùng thấy gì: Bài kiểm danh sách ở màn hẹp chưa bắt được trường hợp thiếu một nhóm. Hiện chưa có dấu hiệu nhóm nào bị thiếu.
  Căn cứ: Chưa có bằng chứng người dùng thấy thiếu nhóm; chỉ làm giảm độ tin cậy của bài kiểm.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): vk6-chu hứa tên đơn vị trên thẻ mang translate=no, nhưng nhánh cả công ty không kiểm, còn nhánh tâm thì không ghim số phần tử**
  Người dùng thấy gì: Chưa có bài kiểm chắc chắn rằng mọi tên đơn vị trên thẻ đều được đánh dấu để trình duyệt không tự dịch. Hiện chưa thấy tên nào bị dịch nhầm.
  Căn cứ: Chưa có bằng chứng lỗi thật; nếu có thì chỉ làm tên hiển thị sai chữ, không mất dữ liệu.
  file: `apps/app/test/okr-so-do-toan-vung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): dh4-cach-xem đổi thành chỉ kiểm vắng, không còn đối chứng dương rằng ToanCanh đã render**
  Người dùng thấy gì: Bài kiểm của màn Toàn cảnh cũ chỉ còn xác nhận cách xem sơ đồ đã biến mất, không xác nhận màn còn dựng đúng nội dung. Nếu màn trắng thì bài kiểm vẫn xanh.
  Căn cứ: Màn thật chưa thấy hỏng; chỉ là lưới an toàn mỏng đi, người dùng tải lại là thử lại được.
  file: `apps/app/test/okr-so-do-don-vi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA (hình 1): dh5-trang-thai kiểm tên hàm của fallback Suspense thay vì dải công cụ được render**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận khung chờ đúng tên, chưa xác nhận dải công cụ thật sự hiện trong lúc chờ. Người dùng nhìn thấy gì thì chưa được kiểm.
  Căn cứ: Chưa có bằng chứng dải công cụ không hiện; ảnh hưởng nhẹ và nhìn thấy ngay khi mở màn.
  file: `apps/app/test/okr-quanh-muc-tieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 3/18 lỗi rơi vào file không bộ đo nào phủ (_acceptance/so-do-can-chinh-don-vi/evals.yaml, apps/app/test/okr-so-do-don-vi.dom.tsx, apps/app/test/okr-quanh-muc-tieu.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
