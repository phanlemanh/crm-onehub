# Review Findings: hop-thoai-giu-cho-dang-nhap

## Trong hợp đồng

- **The record sheet's X button calls onClose directly and skips the guard: the half-typed conversation box is closed without asking**
  AC: AC-9
  file: `apps/app/components/detail-sheet.tsx:143`
  severity: medium
  Detail: The contract/spec includes 'the record sheet with a conversation box' and the state table says 'X mark → ask'. DetailSheetHeader draws its own X button, `<Button onClick={onClose}>` (record-parts.tsx:62 and so-kr-sheet.tsx:424 pass closeAll, which sets the URL param → open=false), and SheetContent is called with showCloseButton={false}. That path never goes through onOpenChange of the Sheet/Drawer, so the guard never sees it: with text typed in the conversation box, pressing X closes and loses the text with no prompt, while Esc does ask. The static check in soi-giu.mjs (soiNut) only scans Buttons that sit lexically inside DialogContent/SheetContent in the same file, so it misses this button (it lives in a separate component rendered inside SheetContent at runtime).
  Rationale: AC-9 yêu cầu rõ 'không nút nào nằm bên trong DialogContent, SheetContent hay DrawerContent gọi thẳng hàm đóng'; nút X của ngăn bản ghi render bên trong SheetContent và gọi thẳng onClose (bỏ qua DialogClose/SheetClose), nên làm AC-9 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The 'typed' flag never resets while a dialog stays open, so after save-and-keep-open in the KR dialog, Esc, X and overlay still hold the box and ask to discard**
  Người dùng thấy gì: Sau khi lưu một Kết quả then chốt mà hộp vẫn mở để sửa tiếp, bấm ra ngoài hộp có thể không phản hồi, còn nhấn Esc hoặc bấm dấu X vẫn hỏi lại như thể có chữ chưa lưu, dù dữ liệu đã lưu xong.
  file: `packages/ui/src/components/giu-thay-doi.tsx`
  severity: medium
  Đề xuất: known-limits

- **The keeper is on by default for every Sheet/Drawer, including the record sheet, so fields that save on blur and chat messages already sent get a false 'what you typed will be lost' prompt**
  Người dùng thấy gì: Trong ngăn xem chi tiết một bản ghi, sau khi một ô đã tự lưu xong (hoặc một tin nhắn trao đổi đã gửi), bấm ra ngoài có thể không đóng được ngăn nữa, và Esc hay dấu X vẫn hỏi lại rằng dữ liệu sẽ mất dù mọi thứ đã lưu.
  file: `apps/app/components/detail-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **KR dialog: after 'save and keep open' (spreadsheet source), Esc and X still ask 'Discard what you typed?' even though everything is saved**
  Người dùng thấy gì: Ở hộp thoại Kết quả then chốt lấy từ bảng tính, sau khi lưu xong mà hộp vẫn mở để sửa tiếp, nhấn Esc hoặc bấm dấu X vẫn hỏi lại xác nhận bỏ dữ liệu, dù không còn gì chưa lưu.
  file: `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Record sheets with inline auto-save fields stay 'dirty' after the save: Esc asks to discard and clicking outside no longer closes**
  Người dùng thấy gì: Ở các ngăn xem chi tiết bản ghi (liên hệ, thương vụ, công ty…) có ô tự lưu khi rời ô, sau khi một ô đã lưu xong, Esc vẫn hỏi lại 'bỏ những gì vừa nhập' và bấm ra ngoài không đóng được ngăn, dù dữ liệu đã lưu.
  file: `packages/ui/src/components/giu-thay-doi.tsx`
  severity: medium
  Đề xuất: known-limits

- **soi-giu.mjs: process.exit inside try/finally skips the finally, leaving temp directories behind on every red-direction run**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm — đây là tệp tạm sinh ra trong lúc chạy kiểm thử nội bộ, có thể tồn đọng trên máy chạy kiểm thử theo thời gian.
  file: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/soi-giu.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — E10 bước 6 hứa «hộp còn mở VỚI giá trị vừa chọn» nhưng chỉ đo hộp còn có mặt**
  Người dùng thấy gì: Bước đo tự động cho việc giữ giá trị vừa chọn khi bấm ra ngoài hộp có thể báo đạt ngay cả khi giá trị đã chọn bị mất, vì chỉ kiểm hộp còn mở mà chưa kiểm giá trị bên trong.
  file: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — messages-guard vừa thêm đệ quy vào nhóm lồng nhau nhưng chỉ có khẳng định danh sách rỗng, không có đối chứng dương**
  Người dùng thấy gì: Phép kiểm tự động cho phần chữ tiếng Việt của hộp hỏi lại ở các mục lồng nhau có thể báo đạt dù phép kiểm chưa thực sự quét tới các mục đó.
  file: `packages/ui/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — E10 bước 2 «số KR trong DB không đổi» là khẳng định âm tính đứng một mình**
  Người dùng thấy gì: Phép đo tự động về việc không tạo dữ liệu thừa khi bấm Bỏ có thể báo đạt ngay cả khi phép đo không thực sự chạm đúng dữ liệu cần kiểm.
  file: `_acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
