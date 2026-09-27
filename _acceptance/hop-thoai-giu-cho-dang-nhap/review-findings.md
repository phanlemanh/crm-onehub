## Trong hợp đồng

(Không có phát hiện nào ánh xạ được vào AC trong vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tuNhanThayDoi={false} on DetailSheet silently drops the field-editor form in FieldsSheetHost**
  Người dùng thấy gì: Khi đang tạo một trường dữ liệu tuỳ chỉnh mới và lỡ đóng ngăn giữa chừng (bấm ra ngoài, nhấn Esc, hoặc vuốt), nội dung vừa nhập có thể biến mất ngay mà không được hỏi lại trước khi mất.
  file: `apps/app/components/detail-sheet.tsx`
  severity: high
  Đề xuất: new-contract

- **Record-sheet inline forms (quick add contact/deal, add step) lost the close guard with no replacement**
  Người dùng thấy gì: Khi đang thêm nhanh một liên hệ mới, một thoả thuận mới, hoặc một bước mới rồi lỡ đóng ngăn giữa chừng, thông tin vừa nhập có thể biến mất ngay mà không được hỏi lại trước khi mất.
  file: `apps/app/components/crm/record-sheet/quick-add.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 — fixture VIẾT TAY chép cách khai của ô trao đổi, không dựng objective-trao-doi thật**
  Người dùng thấy gì: Phần kiểm tra tự động cho ô trao đổi chưa chắc phát hiện được nếu tính năng giữ chữ chưa gửi ở ô đó có lỗi, vì nó không kiểm trên chính ô trao đổi người dùng thật sự gõ vào.
  file: `apps/app/test/ngan-ban-ghi-giu.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — ca (5) khổ điện thoại chỉ có khẳng định âm, không đối chứng dương trên Drawer; lời hứa dismissible và vuốt không được kiểm**
  Người dùng thấy gì: Trên điện thoại, chưa có phép kiểm nào xác nhận ngăn thật sự giữ lại nội dung đang gõ khi đóng giữa chừng, hay việc vuốt để đóng ngăn hoạt động đúng như đã hứa.
  file: `apps/app/test/ngan-ban-ghi-giu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to scan a class, only a point case): PHAN_TRONG_NGAN hand-lists the one reported file instead of closing the blind spot for every component shown inside a dialog or sheet (r2)**
  Người dùng thấy gì: Nếu sau này có thêm một nút đóng nằm trong một thành phần dùng chung (ví dụ phần đầu hay chân trang) được hiển thị bên trong hộp thoại nhưng định nghĩa ở nơi khác, phép kiểm tự động của lượt này có thể không phát hiện ra, và người dùng có thể mất nội dung đang nhập mà không được hỏi lại trước khi mất.
  file: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs`
  severity: low
  Đề xuất: known-limits

- **KR dialog: after 'save and keep open' (spreadsheet source), Esc and X still ask 'Discard what you typed?' even though everything is saved (r1)**
  Người dùng thấy gì: Ở hộp thoại Kết quả then chốt lấy từ bảng tính, sau khi lưu xong mà hộp vẫn mở để sửa tiếp, nhấn Esc hoặc bấm dấu X vẫn hỏi lại xác nhận bỏ dữ liệu, dù không còn gì chưa lưu.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — messages-guard vừa thêm đệ quy vào nhóm lồng nhau nhưng chỉ có khẳng định danh sách rỗng, không có đối chứng dương (r1)**
  Người dùng thấy gì: Phép kiểm tự động cho phần chữ tiếng Việt của hộp hỏi lại ở các mục lồng nhau có thể báo đạt dù phép kiểm chưa thực sự quét tới các mục đó.
  file: `packages/ui/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
