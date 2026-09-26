# Review Findings: toan-canh-okr (round 2)

## Trong hợp đồng

- **A confidence drop disappears from the weekly-meeting board once the KR is updated a second time in the same week**
  file: `apps/api/src/okr/hop-tuan.ts:69`
  severity: high
  AC: AC-7

  `lyDoCua` compares the latest check-in with `kr.lan.at(-2)`, which is the previous check-in, not the previous week's last check-in. `guiCapNhat` (okr-cap-nhat.service.ts) inserts a new `okrCheckIn` row on every submission and has no one-per-week guard, so several check-ins in one week are normal. Example: last week the KR was Cao; on Monday the owner submits Vừa and the KR correctly shows as dropped (tụt). On Wednesday the owner or the head submits again with Vừa, for example to change only the value. Now `truoc` is Monday's Vừa, `bac` is 0, and the drop reason is gone. The KR falls out of «Đáng bàn» on the weekly board (`xepHopTuan`). It also no longer counts toward the row's «đáng bàn» sentence on Toàn cảnh (`soTuanCuaNhom.dangBan`). The same thing happens if the owner first submits Thấp by mistake and corrects it to Vừa: the Cao→Vừa drop is not shown. AC-7 asks for the drop compared with last week. The comparison should be against the latest check-in whose `tuan` is before the current week, e.g. `moiNhatDenTuan(kr, congTuan(tuan, -1))`.

- **The unit tree can't be reached with Tab when the selected unit is not a tree node (one person's OKR page)**
  file: `packages/ui/src/components/tree-nav.tsx:86`
  severity: medium
  AC: AC-3

  `initialState.focusedItem` is set to `selectedId` without checking that the id exists in the tree. `CayDonVi` passes `selectedId={chon}`, which is `nguoi:<id>` when viewing one person (`donOkr=nguoi:…`), or an unknown `bp:`/`pb:` id in the `DonKhongThay` case. The tree has no node for these. In `@headless-tree/core` 1.7.0, `isFocused` is `focusedItem === itemId || (focusedItem === null && index === 0)`. With an unknown non-null `focusedItem`, no item is focused, so every treeitem gets `tabIndex=-1` and a keyboard user cannot Tab into the tree on these pages. AC-3 requires exactly one tree element in the Tab order. The fix is to fall back to `nodes[0]` when `selectedId` is not in the node index (`bang`).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The Theo đơn vị page preloads the list without the confidence filter, so the preloaded data is never used**
  Người dùng thấy gì: Khi mở trang Theo đơn vị, người dùng có thể thấy một nhịp tải phụ trước khi danh sách hiện ra, dù dữ liệu cuối cùng hiển thị vẫn đúng.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Second config module for the OKR area (okr-xem.config.ts) repeats time units and an error message**
  Người dùng thấy gì: Thông báo báo lỗi khi không tìm thấy một chỉ số then chốt (KR) có thể hiện khác chữ tuỳ theo màn đang xem, dễ gây khó hiểu.
  file: `apps/api/src/okr/okr-xem.config.ts`
  severity: medium
  Đề xuất: known-limits

- **Types written by hand next to the schemas and enums they copy**
  Người dùng thấy gì: Nếu sau này sản phẩm thêm một mức tự tin hay một nhịp mới, một vài nơi trên màn có thể không nhận ra giá trị mới đó và hiện trống, dù nơi khác trong hệ thống đã cập nhật đúng.
  file: `apps/api/src/okr/hop-tuan.ts`
  severity: low
  Đề xuất: known-limits

- **New OKR tables write their own cell padding instead of using the existing CELL constant, and weekly-meeting rows are taller**
  Người dùng thấy gì: Bảng họp tuần có khoảng cách giữa các dòng hơi khác so với các bảng OKR khác trong cùng khu vực, có thể trông không đồng bộ khi đặt cạnh nhau.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: low
  Đề xuất: known-limits

- **Numbers someone may want to change are defined next to their first use, not in the area config**
  Người dùng thấy gì: Không ảnh hưởng đến những gì người dùng thấy ngay bây giờ; chỉ khiến việc chỉnh vài con số hiển thị (như số tên đơn vị liệt kê trước khi rút gọn, hay chiều cao biểu đồ) sau này mất công tìm hơn.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`
  severity: low
  Đề xuất: known-limits

- **Server prefetch of danhSach leaves out loc.tuTin, so the prefetched data is never used by the client**
  Người dùng thấy gì: Mỗi lần mở trang Theo đơn vị, danh sách có thể phải tải lại một lần nữa ở trình duyệt dù máy chủ đã từng tải trước, gây thêm một nhịp chờ ngắn.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **The owner filter shows a raw user id as the label for a selected person who has zero matches**
  Người dùng thấy gì: Khi bộ lọc theo người phụ trách không còn ai khớp, ô chọn có thể hiện một mã nội bộ khó đọc thay vì tên người đó.
  file: `apps/app/app/(app)/[slug]/okr/loc-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **The «OKR của bạn» card disappears with no message when the cycles query fails**
  Người dùng thấy gì: Nếu việc tải danh sách chu kỳ OKR gặp lỗi, khối «OKR của bạn» có thể biến mất khỏi màn hình mà không có thông báo hay cách thử lại.
  file: `apps/app/app/(app)/[slug]/okr/khoi-kr-cua-toi.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, đúng trống rỗng): E29 với okr.toanCanh dùng every() trên tập có thể rỗng**
  Người dùng thấy gì: Phép kiểm tự động cho màn Toàn cảnh có thể báo đạt ngay cả khi trang không thực sự gọi đúng dữ liệu chu kỳ, vì thiếu một phép đối chứng cho trường hợp có gọi thật.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E5 ArrowLeft/ArrowRight chỉ kiểm tiêu điểm khác null**
  Người dùng thấy gì: Phép kiểm phím mũi tên trái/phải trên cây điều hướng có thể báo đạt ngay cả khi phím không thực sự di chuyển tiêu điểm tới đúng chỗ.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng số assert ít hơn): E8 hứa 7 hàng × 6 trường = 42 và tongQuan.donViCongBo/tongDonVi, bài API chỉ kiểm 6 hàng**
  Người dùng thấy gì: Số liệu của hàng gốc và hai chỉ số tổng quan (đơn vị đã công bố, tổng số đơn vị) trên màn Toàn cảnh chưa được phép kiểm tự động xác nhận qua đường thật, nên một sai sót ở đó có thể chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt thay cho quan hệ): nhãn đích của TargetLineChart chỉ kiểm có chữ, không kiểm nằm trong khung**
  Người dùng thấy gì: Phép kiểm nhãn đích trên biểu đồ diễn biến chỉ xác nhận có chữ, không xác nhận chữ đó nằm gọn trong khung, nên một nhãn bị cắt vẫn có thể báo đạt.
  file: `packages/ui/test/target-line-chart.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm có mặt thay cho quan hệ): Heatmap hứa scrollLeft > 0 khi khung hẹp, bài chỉ đọc chữ của cột data-current**
  Người dùng thấy gì: Phép kiểm việc bảng nhiệt tự cuộn tới tuần hiện tại khi khung hẹp chưa thực sự xác nhận có cuộn, nên hành vi cuộn có thể hỏng mà chưa bị phát hiện.
  file: `packages/ui/test/heatmap.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đếm thay cho so giá trị): E16 (b) hứa API okr.dienBien «cùng số» với hàm thuần, bài chỉ kiểm độ dài 10**
  Người dùng thấy gì: Phép kiểm dữ liệu Diễn biến qua đường thật chỉ đếm số điểm chứ chưa so từng giá trị, nên một sai lệch về giá trị, kỳ vọng hay mức tự tin có thể chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hop-tuan-xep kiểm «không có khoá người» bằng regex hẹp, không đối chứng dương; API không được kiểm thứ tự**
  Người dùng thấy gì: Phép kiểm 'không hiện danh sách người' trên bảng họp tuần dùng quy tắc dò hẹp và chưa có ca thử chứng minh nó bắt được lỗi, nên tên người vẫn có thể lọt ra màn dưới dạng khác mà chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ một điểm): E3 hứa «sau mỗi đổi lọc có đúng một lời gọi okr.danhSach», script kiểm một lần đổi bằng some()**
  Người dùng thấy gì: Phép kiểm 'mỗi lần đổi bộ lọc chỉ gọi máy chủ đúng một lần' chỉ xác nhận có ít nhất một lần gọi và bỏ sót trường hợp đổi lọc qua đường dẫn, nên việc gọi thừa hay thiếu có thể chưa bị phát hiện.
  file: `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): soi-ma dò chữ tình trạng tự map không có chiều đỏ**
  Người dùng thấy gì: Công cụ dò chữ trạng thái tự ghép cứng trên màn chưa có ca thử chứng minh nó hoạt động, nên hiện tại chưa chắc nó bắt được lỗi loại này nếu có.
  file: `_acceptance/toan-canh-okr/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): mock okr.danhSach ở okr-theo-don-vi.dom thiếu trường bắt buộc và khoá gieo lệch khoá thật**
  Người dùng thấy gì: Dữ liệu giả lập dùng để kiểm màn Theo đơn vị không khớp đúng hình dạng dữ liệu thật, nên bài kiểm có thể bỏ sót một số lỗi khi dữ liệu thật thay đổi.
  file: `apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert không đo gì): hai phép so id luôn đúng**
  Người dùng thấy gì: Hai phép so sánh trong bộ kiểm tra luôn cho kết quả đúng bất kể hệ thống hoạt động thế nào, nên chúng không thực sự bảo vệ chống lại lỗi ở phần đó.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
