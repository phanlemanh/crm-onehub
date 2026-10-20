## Trong hợp đồng

- **Picking a cycle equal to the current page's default clears kyOkr, so sidebar links do not keep the chosen cycle (breaks AC-2 between Lấy ý kiến and the other items)**
  file: `apps/app/app/(app)/[slug]/okr/chon-chu-ky.tsx:49`
  severity: medium
  AC: AC-2
  source: bugs
  detail: The cycle picker now sits at the top of the shared sidebar, and the sidebar only carries the `kyOkr` from the URL (thanh-ben-muc-tieu.tsx:159 `const duoi = ky ? ... : ""`). But `datKy` writes `null` when `id === macDinh`, and macDinh depends on the page: on /okr/lay-y-kien it is `kyMacDinhHoiY` (the cycle being planned), on every other page it is `cycles.currentId`. When a cycle in the PHA_HOI_Y phase exists, the two defaults differ, so: (a) on Lấy ý kiến the user picks the planning cycle P (= that page's default) -> kyOkr is cleared -> clicking 'Của tôi'/'Bộ OKR'/'Sức khoẻ' shows the current cycle C, not P; (b) on Của tôi the user picks C (= that page's default) while kyOkr=P was in the URL -> kyOkr is cleared -> clicking 'Lấy ý kiến' jumps to P. The picker at the top of the sidebar shows one cycle, and after a click the content shows a different one. This contradicts AC-2 ('chu kỳ vừa chọn ghi vào kyOkr ... bấm sang mục khác vẫn xem cùng chu kỳ'). The vkm-chu-ky test only picks c3, which is not a default, so it does not catch this. Fix: when the chosen cycle differs from the default of any item the link can reach, keep kyOkr (or drop the 'clear when equal to default' rule once the picker is shared).
  rationale: AC-2 đòi chu kỳ vừa chọn ghi vào kyOkr và mọi liên kết thanh bên mang theo, nên bấm sang mục khác vẫn xem cùng chu kỳ; finding chỉ ra ca chọn đúng chu kỳ mặc định của trang thì kyOkr bị xoá và đổi mục là sang chu kỳ khác.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **OKR route paths are hard-coded at each call site even though tab-okr.ts has a route map**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: mọi liên kết trong khu Mục tiêu đều mở đúng chỗ. Chỉ là lần đổi tên đường dẫn sau sẽ phải sửa nhiều nơi bằng tay.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chi phí dọn lớn hơn lợi ích tức thời, có thể làm khi có đợt đổi đường dẫn kế tiếp.
  file: `apps/app/app/(app)/[slug]/okr/tab-okr.ts`
  severity: low
  Đề xuất: wont-fix

- **The tab bar was removed but its leftovers stay as dead code kept alive only by tests**
  Người dùng thấy gì: Người dùng không gặp gì: thanh thẻ cũ đã biến mất khỏi mọi màn. Trong mã còn sót một ít thành phần không dùng.
  Căn cứ: Hoàn toàn vô hình với người dùng và không có rủi ro dữ liệu; dọn sau rẻ và an toàn, không cần chặn lần giao này.
  file: `apps/app/app/(app)/[slug]/okr/thanh-tab.tsx`
  severity: low
  Đề xuất: known-limits

- **English label for Sơ đồ is «Map», a term CONTEXT.md avoids**
  Người dùng thấy gì: Người dùng chọn giao diện tiếng Anh sẽ thấy mục Sơ đồ gọi là «Map», từ mà từ điển sản phẩm muốn tránh. Bản tiếng Việt không bị ảnh hưởng.
  Căn cứ: Chỉ là nhãn chữ ở bản tiếng Anh, vẫn hiểu được và không ảnh hưởng chức năng; đổi chữ sau rất rẻ.
  file: `apps/app/lib/messages/okr-vo-khu.ts`
  severity: low
  Đề xuất: known-limits

- **If okr.access fails on the server, the program section is hidden silently and the 'Sức khoẻ' button points to an anchor that does not exist**
  Người dùng thấy gì: Khi tải quyền bị lỗi mạng hoặc lỗi máy chủ, người quản lý chương trình thấy trang Sức khoẻ không có phần quản trị chương trình và không có thông báo lỗi. Nút dẫn tới phần đó có thể không làm gì.
  Căn cứ: Chỉ xảy ra khi tải quyền thất bại, hiếm gặp, không mất dữ liệu và người dùng tải lại trang là có lại phần quản trị.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): vkm-chu-ky kiểm 'không có ô chu kỳ trong HanhDongKhu' nhưng không bao giờ truyền ô chu kỳ vào, nên không thể đỏ**
  Người dùng thấy gì: Người dùng không thấy lỗi nào hôm nay: ô chu kỳ đã ở đầu thanh bên. Nhưng nếu sau này ô đó bị đặt lại vào hàng nút, bài kiểm này sẽ không báo.
  Căn cứ: Không ảnh hưởng người dùng lúc này; rủi ro chỉ là một hồi quy tương lai khó bị phát hiện sớm, và bàn đo màn vẫn kiểm chỗ này.
  file: `apps/app/test/vo-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
