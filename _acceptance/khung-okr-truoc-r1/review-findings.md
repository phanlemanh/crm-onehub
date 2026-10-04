# Review findings — khung-okr-truoc-r1 (round 3)

## Trong hợp đồng

- **The r2 fix stops the remount, but on a phone the scroll still jumps to a new container, so the Kara chip still does not scroll to the Kara area**
  AC: AC-10
  file: `apps/app/components/crm/record-sheet/record-parts.tsx:58`
  severity: medium
  source: bugs
  detail: Commit 5f8974a43 keeps one wrapper div so the frame no longer remounts. The scroll container still changes after the first render, though. useIsMobile() returns false on the first render, because the state starts as undefined and only becomes true in an effect. RecordSheetFrame mounts fresh each time an objective sheet opens, so its first commit uses the desktop layout. In that layout DetailSheetBody, with the class 'min-h-0 flex-1 overflow-y-auto', is the scroll container. The anchor effect in TabKr (objective-sheet.tsx:492-504) is a child effect, so it runs before the useIsMobile effect of the parent RecordSheetFrame. When the objective and the góp-ý list are already cached (gopY.daTai is true on the first render) and neo is set by the «Kara · N góp ý» chip, the effect calls vung.current.scrollIntoView() on DetailSheetBody and then setNeo(null). Next, setIsMobile(true) re-renders the sheet with cuon=true. DetailSheetBody loses its overflow (detail-sheet.tsx:276), and the outer div[data-cuon-ca-khung] becomes the scroll container at scrollTop 0. With the default smooth behaviour, the animation that is still running is cancelled. neo is already null, so nothing scrolls again. The result is that the AC-10 scenario the r1 finding described still fails on a phone for an objective that was opened before: the sheet stays at the top and does not show the Kara area. The fix must also hold the anchor until the mobile/desktop layout is settled. Two ways: compute cuon from a value that is known on the first render, or make the effect depend on the CuonCaKhungContext value and retry the scroll after it changes.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assertion âm tính một mình): «nút bật thường không có nhãn chế độ ẩn» xanh dù sản phẩm sai, vì chỗ nhãn đó có thể hiện không bao giờ được mở**
  Người dùng thấy gì: Một phép kiểm tự động của nút soạn nháp sẽ không bắt được lỗi nếu sau này nhãn «chế độ ẩn» hiện nhầm trong hộp thông tin của nút đang bật. Hôm nay người dùng không thấy lỗi gì; chỉ là tấm lưới an toàn ở chỗ này còn hở.
  file: `apps/app/test/soan-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **After choosing «stay» in the discard prompt, the dialog's X button jumps to the Căn chỉnh tab (r2)**
  Người dùng thấy gì: Sau khi chọn «ở lại» ở câu hỏi «Bỏ thay đổi?», nếu người dùng bấm nút X để đóng hộp «Mức hiển thị» thì khung lại nhảy sang tab Căn chỉnh thay vì chỉ đóng hộp, khiến họ bị đưa đến chỗ không định đến.
  file: `apps/app/components/crm/record-sheet/objective-hien-thi.tsx`
  severity: medium
  Đề xuất: new-contract

- **An error from soanSanSang leaves the drafting button locked with no message (r2)**
  Người dùng thấy gì: Nếu việc kiểm tra khả năng soạn OKR bị lỗi (mất mạng hoặc máy chủ lỗi), nút «Soạn OKR cùng Trợ lý» cứ bị khoá mãi, không có thông báo hay cách thử lại, người dùng không biết vì sao không bấm được.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, hand-written fixture: LoiTrpc copies the shape the reader expects, and its code is typed by hand (r2)**
  Người dùng thấy gì: Bài kiểm tra việc nút «Mở tab Căn chỉnh» hiện khi máy chủ từ chối dùng lỗi giả dựng tay, nên nếu cách máy chủ báo lỗi đổi đi thì bài vẫn xanh trong khi màn thật có thể không hiện nút.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4, focus-return assertion is satisfied by the test itself: activeElement === «i» after Esc (r2)**
  Người dùng thấy gì: Phép kiểm tra việc nhấn Esc trả focus về nút «i» tự đặt focus sẵn nên không phát hiện được nếu popover thôi trả focus; người dùng bàn phím có thể bị mất vị trí mà bài kiểm tra vẫn xanh.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4, standalone negative that cannot fail: text chuaCauHinh absent from the page (r2)**
  Người dùng thấy gì: Phép kiểm tra rằng người không phải quản trị không thấy câu «chưa được bật» luôn xanh vì câu đó vốn ẩn trong popover đóng, nên nếu câu này lộ nhầm cho người sai vai thì bài kiểm tra có thể không bắt được.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3, relation turns into pass-when-absent: table vs. «Vì sao lúc này» text in E1 (r2)**
  Người dùng thấy gì: Phép đo độ thẳng hàng của bảng với khu «Vì sao lúc này» bỏ qua im lặng khi khu đó không có, nên có thể báo đạt ở những tab mà thật ra chưa được đo.
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5, the 6-form matrix is missing the 'outside the popover' leg for mo-co-cuoc (r2)**
  Người dùng thấy gì: Với dạng nút có cuộc đang soạn, chưa có bài kiểm tra riêng rằng chữ phụ không còn nằm trên thanh; nếu chữ lọt lại ra ngoài popover thì bài kiểm tra có thể không bắt được.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 5, matrix counts printed as constants instead of counted (r2)**
  Người dùng thấy gì: Báo cáo đo ghi sẵn «đủ số dạng, đủ số ca» mà không đếm thật, nên nếu một ca bị bỏ sót thì báo cáo vẫn trông như đã chạy đủ.
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4, no positive control that the Objective sheet actually rendered: E15 accepts the error state as 'screen opened' (r2)**
  Người dùng thấy gì: Phép kiểm tra không tràn ngang của khung Mục tiêu có thể chấm đạt trên một khung báo lỗi nhỏ thay vì khung thật, nên chưa chắc đã đo đúng khung người dùng thấy.
  file: `_acceptance/khung-okr-truoc-r1/rang/bon-vai.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 1, decorative assertions check the message catalog instead of the rendered output (r2)**
  Người dùng thấy gì: Hai dòng kiểm tra chỉ xem câu chữ có tồn tại trong danh mục, không so với chữ hiện trên màn nên luôn xanh; chỉ làm số kiểm trông nhiều hơn thực tế, không ảnh hưởng người dùng.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Lỗi của truy vấn soanSanSang bị nuốt: nhóm soạn kẹt mãi ở nút khoá «đang tải» (r1)**
  Người dùng thấy gì: Nếu máy chủ hoặc mạng trục trặc đúng lúc mở trang Theo đơn vị, quản trị sẽ thấy nút Soạn bị khoá mãi như đang tải, không có thông báo lỗi và không có cách thử lại cho tới khi tải lại trang.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **DetailSheetHeader đi vòng qua responsive-sheet: tự gọi useIsMobile và nhập thẳng DrawerHeader (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác trên màn hình; chỉ là việc chọn giữa ngăn kéo và khung bên được quyết định ở hai chỗ, nên sau này đổi một chỗ dễ quên chỗ kia.
  file: `apps/app/components/detail-sheet.tsx`
  severity: low
  Đề xuất: wont-fix

- **Cờ sangCanChinh còn bật sau khi người huỷ hộp hỏi lại; đóng bằng nút X về sau lại nhảy sang tab Căn chỉnh (r1)**
  Người dùng thấy gì: Trong một chuỗi thao tác hiếm (bấm Mở tab Căn chỉnh, chọn tiếp tục sửa, rồi đóng hộp bằng nút X và xác nhận bỏ), người chỉ muốn đóng hộp lại bị chuyển sang tab Căn chỉnh.
  file: `apps/app/components/crm/record-sheet/objective-hien-thi.tsx`
  severity: medium
  Đề xuất: known-limits

- **soanSanSang lỗi (retry: false) thì nút soạn kẹt ở dạng «đang tải» khoá mãi, lỗi bị nuốt (r1)**
  Người dùng thấy gì: Khi tải dữ liệu nút soạn lỗi, quản trị chỉ thấy nút Soạn khoá mãi không có giải thích. Ở một số trạng thái, nút khoá hiện thoáng lúc đang tải rồi biến mất khi dữ liệu về.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — bài DOM của Badge và DrawerHeader kiểm chuỗi lớp Tailwind thay cho kiểu tính ra (r1)**
  Người dùng thấy gì: Một bài kiểm tự động phụ chỉ so tên lớp trang trí chứ không đo kết quả hiển thị thật; kết quả hiển thị đã có phép đo khác trong trình duyệt kiểm tra, nên người dùng không bị ảnh hưởng.
  file: `packages/ui/test/khung-okr-badge-drawer.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
