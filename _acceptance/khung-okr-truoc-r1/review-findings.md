# Review findings: khung-okr-truoc-r1 (round 2)

## Trong hợp đồng

- **On a phone the cuonCaKhung branch remounts the whole sheet on first render, which can drop the scroll to the Kara area**
  file: `apps/app/components/crm/record-sheet/record-parts.tsx:730`
  severity: low
  AC: AC-10
  source: bugs
  detail: useIsMobile() always returns false on the first render (useState(undefined) → !!undefined) and becomes true only in an effect. RecordSheetFrame returns `khung` (a Fragment) in the first render, then `<CuonCaKhungContext.Provider><div>{khung}</div></Provider>`. The root element type changes, so React unmounts and remounts the header, tabs and tab contents every time an objective sheet opens on a phone. If the objective is already cached (it was opened before), TabKr's anchor effect runs in the first tree: it calls scrollIntoView and then setNeo(null). The remount creates a new scroll container at scrollTop 0 while neo is already null. As a result, tapping the «Kara · N góp ý» chip on a phone no longer scrolls to the Kara area (AC-10). Fix: keep one wrapper element in both branches and toggle only the class and the context value.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **After choosing «stay» in the discard prompt, the dialog's X button jumps to the Căn chỉnh tab**
  Người dùng thấy gì: Sau khi chọn «ở lại» ở câu hỏi «Bỏ thay đổi?», nếu người dùng bấm nút X để đóng hộp «Mức hiển thị» thì khung lại nhảy sang tab Căn chỉnh thay vì chỉ đóng hộp, khiến họ bị đưa đến chỗ không định đến.
  file: `apps/app/components/crm/record-sheet/objective-hien-thi.tsx`
  severity: medium
  Đề xuất: new-contract

- **An error from soanSanSang leaves the drafting button locked with no message**
  Người dùng thấy gì: Nếu việc kiểm tra khả năng soạn OKR bị lỗi (mất mạng hoặc máy chủ lỗi), nút «Soạn OKR cùng Trợ lý» cứ bị khoá mãi, không có thông báo hay cách thử lại, người dùng không biết vì sao không bấm được.
  file: `apps/app/app/(app)/[slug]/okr/soan/nut-soan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 2, hand-written fixture: LoiTrpc copies the shape the reader expects, and its code is typed by hand**
  Người dùng thấy gì: Bài kiểm tra việc nút «Mở tab Căn chỉnh» hiện khi máy chủ từ chối dùng lỗi giả dựng tay, nên nếu cách máy chủ báo lỗi đổi đi thì bài vẫn xanh trong khi màn thật có thể không hiện nút.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4, focus-return assertion is satisfied by the test itself: activeElement === «i» after Esc**
  Người dùng thấy gì: Phép kiểm tra việc nhấn Esc trả focus về nút «i» tự đặt focus sẵn nên không phát hiện được nếu popover thôi trả focus; người dùng bàn phím có thể bị mất vị trí mà bài kiểm tra vẫn xanh.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4, standalone negative that cannot fail: text chuaCauHinh absent from the page**
  Người dùng thấy gì: Phép kiểm tra rằng người không phải quản trị không thấy câu «chưa được bật» luôn xanh vì câu đó vốn ẩn trong popover đóng, nên nếu câu này lộ nhầm cho người sai vai thì bài kiểm tra có thể không bắt được.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 3, relation turns into pass-when-absent: table vs. «Vì sao lúc này» text in E1**
  Người dùng thấy gì: Phép đo độ thẳng hàng của bảng với khu «Vì sao lúc này» bỏ qua im lặng khi khu đó không có, nên có thể báo đạt ở những tab mà thật ra chưa được đo.
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5, the 6-form matrix is missing the 'outside the popover' leg for mo-co-cuoc**
  Người dùng thấy gì: Với dạng nút có cuộc đang soạn, chưa có bài kiểm tra riêng rằng chữ phụ không còn nằm trên thanh; nếu chữ lọt lại ra ngoài popover thì bài kiểm tra có thể không bắt được.
  file: `apps/app/test/khung-okr-truoc-r1.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 5, matrix counts printed as constants instead of counted**
  Người dùng thấy gì: Báo cáo đo ghi sẵn «đủ số dạng, đủ số ca» mà không đếm thật, nên nếu một ca bị bỏ sót thì báo cáo vẫn trông như đã chạy đủ.
  file: `_acceptance/khung-okr-truoc-r1/rang/man-khung.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 4, no positive control that the Objective sheet actually rendered: E15 accepts the error state as 'screen opened'**
  Người dùng thấy gì: Phép kiểm tra không tràn ngang của khung Mục tiêu có thể chấm đạt trên một khung báo lỗi nhỏ thay vì khung thật, nên chưa chắc đã đo đúng khung người dùng thấy.
  file: `_acceptance/khung-okr-truoc-r1/rang/bon-vai.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 1, decorative assertions check the message catalog instead of the rendered output**
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

- **Hai khoá thông điệp chết (tabVet, tienDoTu) được miễn trong messages-guard, trong khi các bài kiểm khác vẫn tìm tab bằng khoá chết (r1)**
  Người dùng thấy gì: Một vài bài kiểm tự động cũ tìm tab «Vết» bằng nhãn không còn hiện trên màn hình; chúng chỉ xanh vì bản tiếng Việt trùng chữ, nên khi chạy bằng tiếng Anh chúng sẽ không thấy tab. Người dùng không bị ảnh hưởng.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

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
