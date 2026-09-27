# Hộp thoại giữ chỗ đang nhập — thiết kế

Hồ sơ: `_acceptance/hop-thoai-giu-cho-dang-nhap` · hạng T2 · 2026-09-27

## 1. Vấn đề

Chủ kho nhập một KR trong hộp thoại, rê chuột ra ngoài, lỡ bấm: hộp đóng và mất hết chữ vừa gõ. Lỗi không riêng hộp thoại KR. Ba khung dùng chung trong `packages/ui` — `Dialog`, `Sheet` (cùng dựng trên Radix Dialog) và `Drawer` (vaul) — đóng ngay khi bấm ra ngoài, nhấn Esc, bấm dấu X hay vuốt xuống, và không biết bên trong có chữ chưa lưu. Có 25 hộp thoại và ngăn trượt chứa ô nhập trong `apps/app` (không kể `/proto`), cộng ngăn bản ghi có ô trao đổi; không chỗ nào chặn.

Hướng đã chốt với chủ kho trong phiên 27/09: sửa một lần ở thành phần dùng chung, không sửa từng hộp.

## 2. Hành vi

| Đường đóng | Chưa có thay đổi | Đã có thay đổi |
|---|---|---|
| Bấm ra ngoài | Đóng như cũ | Không làm gì, chữ còn nguyên |
| Esc | Đóng như cũ | Hỏi «Bỏ những gì vừa nhập?» |
| Dấu X | Đóng như cũ | Hỏi |
| Nút Huỷ | Đóng như cũ | Hỏi |
| Vuốt xuống (drawer điện thoại) | Đóng như cũ | Drawer giữ chỗ, hỏi |
| Lưu thành công, cha tự đóng | Đóng | Đóng, không hỏi |

Hộp hỏi lại có hai nút: «Tiếp tục sửa» (mặc định, cũng là Esc trên hộp hỏi) đưa con trỏ về hộp đang sửa; «Bỏ» đóng hộp và bỏ chữ.

Bấm ra ngoài khi đang nhập không hỏi mà im lặng giữ hộp, theo Linear, GitHub và Apple HIG: cú lỡ tay không đáng một câu hỏi, còn Esc, X, Huỷ, vuốt là cố ý đóng nên hỏi một lần là đủ.

## 3. Kiến trúc

**Một bộ giữ dùng chung cho ba khung.** Một mô-đun mới trong `packages/ui` (tên làm việc `giu-thay-doi`) cấp: ngữ cảnh «hộp này có thay đổi chưa», hàm đánh dấu, và lớp chặn `onOpenChange`. `Dialog`, `Sheet`, `Drawer` bọc gốc Radix/vaul bằng lớp đó; phần nội dung (`DialogContent`, `SheetContent`, `DrawerContent`) cắm bộ nhận.

- **Tự nhận có thay đổi.** Phần nội dung nghe sự kiện `input` nổi bọt (pha bắt) từ mọi ô gõ bên trong. Gõ một ký tự là đủ đánh dấu. Ô không gõ (Select, Combobox, lịch, bật tắt) không phát `input` nên không tự nhận được. Ô tìm và ô lọc — `input[type=search]` và ô `role=combobox` (ô lọc của `Combobox`, `CommandInput`) — bị bỏ qua: gõ để lọc không phải dữ liệu.
- **Tắt bộ giữ.** Gốc nhận `giuThayDoi?: boolean` (mặc định bật). Hộp mà ô gõ chỉ là công cụ (bảng lệnh, danh sách chọn) truyền `false`; `PickListDialog` đánh dấu ô tìm của nó là `type=search` nên không cần tắt.
- **Chỗ gọi tự khai.** Gốc nhận prop tuỳ chọn `coThayDoi?: boolean`; giá trị thật là tự nhận HOẶC tự khai. Hộp thoại KR, mục tiêu, đơn vị khai từ trạng thái form của chính nó, nên đổi một ô chọn cũng được giữ.
- **Chặn đóng.** Radix gọi `onOpenChange(false)` cho Esc và nút đóng; vaul gọi cho vuốt và Esc. Lớp gốc chặn lời gọi đó khi có thay đổi và mở hộp hỏi thay vì báo lên chỗ gọi. «Bỏ» mới báo `onOpenChange(false)` lên — đúng một lần. Bấm ra ngoài đi đường riêng: phần nội dung gọi `preventDefault` trên `onInteractOutside` khi có thay đổi, nên không có lời gọi đóng nào.
- **Gốc không kiểm soát.** Chỗ dùng `DialogTrigger` không truyền `open`: lớp gốc tự giữ trạng thái mở để chặn được.
- **Máy đóng không bị chặn.** Lưu xong, chỗ gọi đặt `open={false}` hay gỡ hộp — không đi qua `onOpenChange`, nên không hỏi. Hộp không kiểm soát thường lưu bằng nút bọc `DialogClose`; nút đó mang prop `dongNgay` để bỏ qua bộ giữ. Mở lại là trạng thái sạch.
- **Lớp con.** Esc khi một ô chọn con (Select, Combobox, lịch) đang mở do Radix xử ở lớp trên cùng trước, nên chỉ đóng ô con; bộ giữ không can thiệp.
- **Vuốt xuống.** Bộ giữ chặn `onOpenChange(false)` của vaul khi có thay đổi; drawer phải quay về vị trí mở, nằm trọn trong màn, và trang còn bấm được sau «Tiếp tục sửa». Cú vuốt thật chỉ đo được trên trình duyệt thật (E10 bước 5). Nếu vaul không trả drawer về chỗ, S3 dừng và trình người — không tự hạ lời hứa.

**Hộp hỏi lại là `ConfirmDialog`.** Chuyển từ `apps/app/.../settings/members/confirm-dialog.tsx` vào `packages/ui/src/components/confirm-dialog.tsx`, giữ nguyên API; 13 tệp đang mượn chuyển sang nhập từ `@crm/ui`; tệp cũ xoá. Đây là luật sẵn có của `docs/design.md`: thành phần tính năng được dùng lần thứ hai thì vào `packages/ui` trước.

**Nút Huỷ.** Radix chỉ biết nút đi qua `DialogClose`/`SheetClose`. 8 chỗ đã đi qua đó; 14 chỗ gọi thẳng hàm đóng (`onClick={dong}`) — bộ giữ không thấy được. Lượt này nối 14 nút đó qua `DialogClose asChild`; hàm đóng cũ vẫn chạy qua `onOpenChange` của chỗ gọi. Một phép soát tĩnh so danh sách 25 tệp viết trước với tập máy tự rút từ `apps/app`, và bắt mọi nút bên trong `DialogContent`/`SheetContent`/`DrawerContent` gọi thẳng hàm đóng. `docs/design.md` thêm một dòng vào bảng «Dấu hiệu vẽ tay».

**Chữ.** `packages/ui/src/lib/messages.ts` thêm `dialog.boThayDoi` (tiêu đề, thân, «Tiếp tục sửa», «Bỏ»), vi và en.

## 4. Ngoài phạm vi

Lưu nháp để mở lại lần sau · chặn điều hướng trang hay đóng tab khi hộp đang bẩn · so giá trị từng ô để biết «gõ rồi xoá về như cũ» · hộp hiện khoá API một lần · `/proto`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở «Thêm KR» → gõ tên → lỡ bấm ra ngoài → hộp vẫn mở, chữ còn → gõ tiếp → Lưu (điểm ra: hộp đóng, KR mới trong bảng).
- Biên: hộp chưa gõ gì → bấm ra ngoài đóng như cũ · đổi ô chọn mà chưa gõ → chỉ được giữ ở hộp có tự khai · Esc khi ô chọn con đang mở → chỉ đóng ô con.
- Lỗi & quay lại: cố ý đóng (Esc, X, Huỷ, vuốt) khi đã gõ → hộp hỏi lại → «Tiếp tục sửa» về đúng hộp và ô đang gõ; «Bỏ» đóng hộp.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp thoại có ô nhập (25 chỗ) | Nhập rồi lưu một thứ | Nút mở / Lưu hoặc Bỏ |
| Hộp hỏi lại «Bỏ những gì vừa nhập?» | Xác nhận bỏ chữ đang nhập | Esc, X, Huỷ, vuốt khi có thay đổi / về hộp hoặc đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-sach | Hộp thoại có ô nhập | Hộp như hiện nay | Bấm ngoài, Esc, X, Huỷ đều đóng ngay |
| ST-hop-ban | Hộp thoại có ô nhập | Hộp như hiện nay, không dấu hiệu thêm | Gõ tiếp; bấm ngoài không làm gì |
| ST-hop-hoi-lai | Hộp hỏi lại | Tiêu đề «Bỏ những gì vừa nhập?», thân «Những gì bạn vừa nhập trong hộp này sẽ mất.», nút «Tiếp tục sửa» và «Bỏ» (tô huỷ) | Chọn một trong hai; Esc = Tiếp tục sửa |
| ST-drawer-ban | Drawer điện thoại | Drawer giữ chỗ sau cú vuốt | Hộp hỏi lại hiện |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Focus: mở hộp hỏi lại → focus vào «Tiếp tục sửa»; đóng hộp hỏi bằng Tiếp tục sửa hoặc Esc → focus về ô đang gõ trước đó.
- Hộp hỏi lại nổi trên hộp đang sửa, không đóng hộp đó.
- Khổ 390: hộp hỏi lại vẫn là AlertDialog giữa màn, không đổi thành drawer.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog`, `Sheet`, `Drawer` (`packages/ui`) | mở rộng | Thêm bộ giữ vào gốc và phần nội dung, giữ nguyên API cũ |
| `ConfirmDialog` | dùng (chuyển vào `packages/ui`) | Đã có, 13 chỗ dùng; luật dùng-lần-hai của `docs/design.md` |
| `AlertDialog` (`packages/ui`) | dùng | Nền của `ConfirmDialog`, có sẵn vai trò alertdialog |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi khuôn của màn nào; chỉ thêm một hộp xác nhận nổi — luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Bằng chứng

Bài kiểm hành vi trong môi trường DOM giả (`packages/ui/test`, `setup-dom.ts`) cho ma trận đường đóng × trạng thái × khung; phép soát tĩnh nút Huỷ; màn thật ở 1440 và 390 qua phiên đo riêng (`tien-de.mjs`): hộp thoại KR, ngăn tạo thoả thuận, drawer ngăn bản ghi.
