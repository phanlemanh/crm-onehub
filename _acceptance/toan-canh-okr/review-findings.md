## Trong hợp đồng

(Không có finding nào ánh xạ được vào AC ở vòng 3.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — assertion chỉ đo nhánh dự phòng, không có đối chứng dương cho nhánh mục đang chọn có trong cây**
  Người dùng thấy gì: Bộ kiểm thử hiện chưa xác nhận rằng khi mở cây và mục đang chọn nằm trong cây, tiêu điểm bàn phím phải rơi đúng vào mục đó; nếu một thay đổi sau này vô tình làm mất hành vi ấy, người dùng có thể phải dò lại từ mục đầu cây mỗi lần mở mà không ai được cảnh báo trước khi phát hành.
  file: `packages/ui/test/tree-nav.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **The Theo đơn vị page preloads the list without the confidence filter, so the preloaded data is never used (r2)**
  Người dùng thấy gì: Khi mở trang Theo đơn vị, người dùng có thể thấy một nhịp tải phụ trước khi danh sách hiện ra, dù dữ liệu cuối cùng hiển thị vẫn đúng.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Second config module for the OKR area (okr-xem.config.ts) repeats time units and an error message (r2)**
  Người dùng thấy gì: Thông báo báo lỗi khi không tìm thấy một chỉ số then chốt (KR) có thể hiện khác chữ tuỳ theo màn đang xem, dễ gây khó hiểu.
  file: `apps/api/src/okr/okr-xem.config.ts`
  severity: medium
  Đề xuất: known-limits

- **New OKR tables write their own cell padding instead of using the existing CELL constant, and weekly-meeting rows are taller (r2)**
  Người dùng thấy gì: Bảng họp tuần có khoảng cách giữa các dòng hơi khác so với các bảng OKR khác trong cùng khu vực, có thể trông không đồng bộ khi đặt cạnh nhau.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: low
  Đề xuất: known-limits

- **Numbers someone may want to change are defined next to their first use, not in the area config (r2)**
  Người dùng thấy gì: Không ảnh hưởng đến những gì người dùng thấy ngay bây giờ; chỉ khiến việc chỉnh vài con số hiển thị (như số tên đơn vị liệt kê trước khi rút gọn, hay chiều cao biểu đồ) sau này mất công tìm hơn.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`
  severity: low
  Đề xuất: known-limits

- **Server prefetch of danhSach leaves out loc.tuTin, so the prefetched data is never used by the client (r2)**
  Người dùng thấy gì: Mỗi lần mở trang Theo đơn vị, danh sách có thể phải tải lại một lần nữa ở trình duyệt dù máy chủ đã từng tải trước, gây thêm một nhịp chờ ngắn.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **The owner filter shows a raw user id as the label for a selected person who has zero matches (r2)**
  Người dùng thấy gì: Khi bộ lọc theo người phụ trách không còn ai khớp, ô chọn có thể hiện một mã nội bộ khó đọc thay vì tên người đó.
  file: `apps/app/app/(app)/[slug]/okr/loc-okr.tsx`
  severity: low
  Đề xuất: known-limits

- **The «OKR của bạn» card disappears with no message when the cycles query fails (r2)**
  Người dùng thấy gì: Nếu việc tải danh sách chu kỳ OKR gặp lỗi, khối «OKR của bạn» có thể biến mất khỏi màn hình mà không có thông báo hay cách thử lại.
  file: `apps/app/app/(app)/[slug]/okr/khoi-kr-cua-toi.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên ma trận nhưng số assert ít hơn): E8 hứa 7 hàng × 6 trường = 42 và tongQuan.donViCongBo/tongDonVi, bài API chỉ kiểm 6 hàng (r2)**
  Người dùng thấy gì: Số liệu của hàng gốc và hai chỉ số tổng quan (đơn vị đã công bố, tổng số đơn vị) trên màn Toàn cảnh chưa được phép kiểm tự động xác nhận qua đường thật, nên một sai sót ở đó có thể chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt thay cho quan hệ): nhãn đích của TargetLineChart chỉ kiểm có chữ, không kiểm nằm trong khung (r2)**
  Người dùng thấy gì: Phép kiểm nhãn đích trên biểu đồ diễn biến chỉ xác nhận có chữ, không xác nhận chữ đó nằm gọn trong khung, nên một nhãn bị cắt vẫn có thể báo đạt.
  file: `packages/ui/test/target-line-chart.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm có mặt thay cho quan hệ): Heatmap hứa scrollLeft > 0 khi khung hẹp, bài chỉ đọc chữ của cột data-current (r2)**
  Người dùng thấy gì: Phép kiểm việc bảng nhiệt tự cuộn tới tuần hiện tại khi khung hẹp chưa thực sự xác nhận có cuộn, nên hành vi cuộn có thể hỏng mà chưa bị phát hiện.
  file: `packages/ui/test/heatmap.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (đếm thay cho so giá trị): E16 (b) hứa API okr.dienBien «cùng số» với hàm thuần, bài chỉ kiểm độ dài 10 (r2)**
  Người dùng thấy gì: Phép kiểm dữ liệu Diễn biến qua đường thật chỉ đếm số điểm chứ chưa so từng giá trị, nên một sai lệch về giá trị, kỳ vọng hay mức tự tin có thể chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): hop-tuan-xep kiểm «không có khoá người» bằng regex hẹp, không đối chứng dương; API không được kiểm thứ tự (r2)**
  Người dùng thấy gì: Phép kiểm 'không hiện danh sách người' trên bảng họp tuần dùng quy tắc dò hẹp và chưa có ca thử chứng minh nó bắt được lỗi, nên tên người vẫn có thể lọt ra màn dưới dạng khác mà chưa bị phát hiện.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): soi-ma dò chữ tình trạng tự map không có chiều đỏ (r2)**
  Người dùng thấy gì: Công cụ dò chữ trạng thái tự ghép cứng trên màn chưa có ca thử chứng minh nó hoạt động, nên hiện tại chưa chắc nó bắt được lỗi loại này nếu có.
  file: `_acceptance/toan-canh-okr/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay theo khuôn bên đọc): mock okr.danhSach ở okr-theo-don-vi.dom thiếu trường bắt buộc và khoá gieo lệch khoá thật (r2)**
  Người dùng thấy gì: Dữ liệu giả lập dùng để kiểm màn Theo đơn vị không khớp đúng hình dạng dữ liệu thật, nên bài kiểm có thể bỏ sót một số lỗi khi dữ liệu thật thay đổi.
  file: `apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert không đo gì): hai phép so id luôn đúng (r2)**
  Người dùng thấy gì: Hai phép so sánh trong bộ kiểm tra luôn cho kết quả đúng bất kể hệ thống hoạt động thế nào, nên chúng không thực sự bảo vệ chống lại lỗi ở phần đó.
  file: `apps/api/test/okr-toan-canh.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(Không có mục nào.)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
