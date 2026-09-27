# Quét độ phủ — hop-thoai-giu-cho-dang-nhap

Preset `test-matrix`, chạy tự lái 2026-09-27. Câu cần người quyết thành `[GIẢ ĐỊNH]` có mặc định, gom về mục Coverage của hợp đồng để gạch một lượt ở Cổng Phạm vi.

## Ngữ cảnh

- Sản phẩm: OneHub Center (CRM nội bộ của OneHub, bản rẽ từ trycompai/crm) — chân sản phẩm: đào repo (kho chưa có mục Product Context) · chân ngành: Apple Human Interface Guidelines (Sheets — trang có thay đổi chưa lưu không cho vuốt đóng, hỏi xác nhận), Material Design (Dialogs — hộp xác nhận «Discard draft?»), Radix UI Dialog (sự kiện `onInteractOutside` / `onEscapeKeyDown` chặn được bằng `preventDefault`), Linear và GitHub (bấm ngoài khi đang nhập không đóng; đóng cố ý thì hỏi bỏ thay đổi).
- Khung dùng chung: `Dialog`, `Sheet` dựng trên Radix Dialog; `Drawer` dựng trên vaul [SUY-TỪ-REPO: packages/ui/src/components/dialog.tsx, sheet.tsx, drawer.tsx]. Ngăn bản ghi đổi Sheet ↔ Drawer theo khổ [SUY-TỪ-REPO: apps/app/components/responsive-sheet.tsx].
- 25 hộp thoại và ngăn trượt có ô nhập trong `apps/app` (không kể `/proto`): 8 có nút Huỷ đi qua nút đóng của khung, 14 gọi thẳng hàm đóng, 3 không có nút Huỷ [SUY-TỪ-REPO: quét `DialogContent|SheetContent` + ô nhập, 2026-09-27].
- Hộp hỏi lại có sẵn ở `settings/members/confirm-dialog.tsx`, 13 tệp mượn [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx].

## Trục

- **Trục A — người đóng bằng đường nào:** bấm ra ngoài | Esc | dấu X | nút Huỷ | vuốt xuống (drawer)  [thước CE: Radix Dialog có đúng ba đường tự đóng — bấm ngoài, Esc, `Close`; vaul thêm vuốt; nút Huỷ là đường thứ năm do chỗ gọi tự dựng — NGÀNH: Radix UI Dialog, vaul]
- **Trục B — trạng thái bên trong:** sạch | đã gõ chữ | đã đổi ô không gõ (chọn, ngày, bật tắt) | gõ rồi xoá về như cũ  [thước CE: loại ô nhập đang có trong 25 chỗ — Input, Textarea, InputGroupInput, Combobox, Select, DatePicker, ToggleGroup — SUY-TỪ-REPO: quét ở trên]
- **Trục C — khung:** Dialog | Sheet | Drawer điện thoại  [thước CE: ba khung trong packages/ui có ô nhập bên trong — SUY-TỪ-REPO]
- **Trục D — trả lời hộp hỏi lại:** Tiếp tục sửa | Bỏ | Esc trên hộp hỏi  [thước CE: AlertDialog có đúng hai nút và Esc — NGÀNH: Material Design Dialogs]

Đường máy đóng (lưu thành công, cha tự đóng khi điều hướng) không phải lựa chọn của người nên đứng riêng làm lớp cross-cutting «không bao giờ hỏi».

Không gian: 5 × 4 × 3 = 60 ô, bỏ 20 ô vô nghĩa (vuốt chỉ có ở Drawer) → 40 ô có nghĩa, cộng 3 ô của trục D.

## Core (8/43 ô ≈ 19%)

1. Dialog · đã gõ chữ · bấm ra ngoài → không đóng, chữ còn nguyên — đúng lỗi chủ kho gặp.
2. Dialog · sạch · bấm ra ngoài → đóng như cũ — đối chứng, giữ đường tắt nhanh cho hộp chỉ xem.
3. Dialog · đã gõ chữ · Esc hoặc dấu X → hỏi «Bỏ những gì vừa nhập?»; Tiếp tục sửa hoặc Esc trên hộp hỏi → chữ còn, con trỏ về ô đang gõ; Bỏ → đóng.
4. Dialog · đã gõ chữ · nút Huỷ → hỏi như ô 3, ở cả 14 chỗ đang gọi thẳng hàm đóng (sau khi nút Huỷ đi qua nút đóng của khung).
5. Sheet · đã gõ chữ · bốn đường bấm ngoài, Esc, X, Huỷ → như Dialog (ngăn tạo thoả thuận, liên hệ, công ty, chiến dịch, khoá API, SSO, mở chu kỳ; ngăn bản ghi có ô trao đổi).
6. Drawer · đã gõ chữ · vuốt xuống → hỏi, drawer giữ nguyên chỗ; sạch → đóng như cũ.
7. Đã gõ chữ · lưu thành công → đóng, không hỏi — lớp máy đóng.
8. Hộp thoại bẩn đang mở một ô chọn con (Select, Combobox, lịch) · Esc → chỉ đóng ô chọn con, không hỏi, không đóng hộp.

## Later

- Đã đổi ô không gõ (chọn, ngày, bật tắt) mà chưa gõ chữ → khung tự nhận không bắt được mọi loại ô; chỗ gọi tự khai «có thay đổi» khi cần. `[GIẢ ĐỊNH: lượt này chỗ gọi hộp thoại KR, mục tiêu, đơn vị tự khai; các chỗ khác chỉ được giữ khi có gõ chữ]`
- Gõ rồi xoá về như cũ → vẫn hỏi một lần. `[GIẢ ĐỊNH: chấp nhận hỏi thừa một lần thay vì so giá trị từng ô]`
- Cha tự đóng hay điều hướng trang khi hộp đang bẩn (bấm link ở thanh bên, đóng tab) → không chặn lượt này.
- Hộp hiện khoá API một lần (không có ô gõ, đóng là mất khoá) → cùng họ «mất thứ chưa giữ» nhưng không phải chữ người gõ.

## Never

- Bấm ra ngoài khi đang nhập thì hỏi lại — lỡ tay không đáng một câu hỏi; theo Linear, GitHub, Apple HIG.
- Tự lưu nháp để mở lại lần sau — là một tính năng khác (nháp), không phải giữ chữ trong lần đang mở.
- Hộp thoại dưới `/proto` — bản mẫu, không phải màn thật.

## Cross-cutting áp mọi ô Core

- Chữ hộp hỏi lại có vi và en khác nhau, sống trong `packages/ui/src/lib/messages.ts`.
- Hộp hỏi lại là `ConfirmDialog` chuyển vào `packages/ui`; 13 chỗ cũ nhập từ bản mới.
- Mọi nút Huỷ trong 25 chỗ đi qua nút đóng của khung (`DialogClose`/`SheetClose`), có phép soát tĩnh bắt chỗ mới quên.
- Lớp máy đóng không bao giờ hỏi.
- Con trỏ quay về hộp đang sửa sau Tiếp tục sửa; khổ 1440 và 390.
