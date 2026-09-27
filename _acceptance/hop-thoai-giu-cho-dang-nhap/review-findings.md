## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 5 (claims to scan a class, only a point case): PHAN_TRONG_NGAN hand-lists the one reported file instead of closing the blind spot for every component shown inside a dialog or sheet**
  Người dùng thấy gì: Nếu sau này có thêm một nút đóng nằm trong một thành phần dùng chung (ví dụ phần đầu hay chân trang) được hiển thị bên trong hộp thoại nhưng định nghĩa ở nơi khác, phép kiểm tự động của lượt này có thể không phát hiện ra, và người dùng có thể mất nội dung đang nhập mà không được hỏi lại trước khi mất.
  file: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs`
  severity: low
  Đề xuất: known-limits

- **The 'typed' flag never resets while a dialog stays open, so after save-and-keep-open in the KR dialog, Esc, X and overlay still hold the box and ask to discard (r1)**
  Người dùng thấy gì: Sau khi lưu một Kết quả then chốt mà hộp vẫn mở để sửa tiếp, bấm ra ngoài hộp có thể không phản hồi, còn nhấn Esc hoặc bấm dấu X vẫn hỏi lại như thể có chữ chưa lưu, dù dữ liệu đã lưu xong.
  file: `packages/ui/src/components/giu-thay-doi.tsx`
  severity: medium
  Đề xuất: known-limits

- **KR dialog: after 'save and keep open' (spreadsheet source), Esc and X still ask 'Discard what you typed?' even though everything is saved (r1)**
  Người dùng thấy gì: Ở hộp thoại Kết quả then chốt lấy từ bảng tính, sau khi lưu xong mà hộp vẫn mở để sửa tiếp, nhấn Esc hoặc bấm dấu X vẫn hỏi lại xác nhận bỏ dữ liệu, dù không còn gì chưa lưu.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Record sheets with inline auto-save fields stay 'dirty' after the save: Esc asks to discard and clicking outside no longer closes (r1)**
  Người dùng thấy gì: Ở các ngăn xem chi tiết bản ghi (liên hệ, thương vụ, công ty…) có ô tự lưu khi rời ô, sau khi một ô đã lưu xong, Esc vẫn hỏi lại 'bỏ những gì vừa nhập' và bấm ra ngoài không đóng được ngăn, dù dữ liệu đã lưu.
  file: `packages/ui/src/components/giu-thay-doi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — messages-guard vừa thêm đệ quy vào nhóm lồng nhau nhưng chỉ có khẳng định danh sách rỗng, không có đối chứng dương (r1)**
  Người dùng thấy gì: Phép kiểm tự động cho phần chữ tiếng Việt của hộp hỏi lại ở các mục lồng nhau có thể báo đạt dù phép kiểm chưa thực sự quét tới các mục đó.
  file: `packages/ui/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).