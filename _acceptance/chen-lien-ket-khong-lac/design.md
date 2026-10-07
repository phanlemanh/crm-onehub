# chen-lien-ket-khong-lac — design

Hàng F14 của đợt `sau-14-10`, dãy P4. Hạng T2. Đã thu hẹp theo lựa chọn (a) của anh (`tra-loi/P4-2.json`).

## Tiền đề cũ và số đo

Hàng ban đầu khẳng định bài «Esc» đỏ ở 9/12 lượt CI hỏng. Số đo 07/10: 0/31 lượt CI hỏng từ 30/09 có bài
`chen-lien-ket` đỏ. Dòng `TypeError … commandManager` được in ra ở mọi lượt chạy tệp (tại chỗ 6–7 dòng/lượt, 3/3
lượt), không làm bài đỏ. Bản khảo sát đã đếm dòng đó.

## Gốc

`FocusScope` (Radix) trả focus khi gỡ qua `setTimeout(0)` → `onCloseAutoFocus` của `NutLienKetTrang` →
`editor?.commands.focus()`. Gỡ cả trình soạn lúc hộp đang mở thì editor bị huỷ trước hẹn giờ đó; tiptap 3.31
đặt `commandManager` về `null` khi huỷ → `TypeError`. jsdom bắt nó qua sự kiện `error` của `window`.

Thử tại chỗ: gỡ trình soạn lúc hộp mở rồi chờ một `setTimeout(0)` xếp SAU lần gỡ → `window` nhận đúng 1 lỗi
`TypeError … commandManager`. Hàng đợi hẹn giờ cùng độ trễ chạy theo thứ tự xếp, nên chờ như vậy là chờ có
điều kiện (hẹn giờ của Radix đã chạy), không phải chờ theo thời gian.

## Cách sửa

- Thành phần: `if (editor && !editor.isDestroyed) editor.commands.focus();` — giữ `e.preventDefault()`.
- Bài mới, trong một `describe("chen-lien-ket-go")` riêng ở CUỐI tệp DOM: lắng `error` trên `window`, đẩy
  CHUỖI thông điệp (`String(e.error?.message ?? e.message)`, không đẩy đối tượng sự kiện — so đối tượng DOM làm
  bun treo), mở hộp, gỡ trình soạn, chờ một nhịp `setTimeout(0)`, đòi `toEqual([])`. Phần còn lại của tệp
  không đổi một byte.
- Bài «Esc» không đổi.

## Đo

Bản sao ở `.acceptance-runs/chen-lien-ket-khong-lac/sao-*` gồm tệp kiểm và hai thành phần, import nối vào bản
sao. Chiều xanh: thành phần HEAD → cả tệp xanh, 0 dòng `commandManager`, khối bài Esc trùng byte với bản ghim.
Chiều đỏ: gỡ lớp chặn → đúng bài mới đỏ, đầu ra có `commandManager`.
