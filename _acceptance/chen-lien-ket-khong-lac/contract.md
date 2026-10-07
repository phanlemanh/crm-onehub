---
schema_version: 1
feature: Hộp chèn liên kết tới trang không trả focus về trình soạn đã bị huỷ — hết lỗi chưa bắt khi gỡ trình soạn lúc hộp đang mở
slug: chen-lien-ket-khong-lac
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: []
status: draft
approved_by:
approved_at:
design_doc: _acceptance/chen-lien-ket-khong-lac/design.md
---

# Acceptance Contract: chen-lien-ket-khong-lac

## Context

Tiền đề ban đầu của hàng F14 SAI. Tiền đề đó nói bài `chen-lien-ket` › «Esc đóng hộp và trả focus về trình soạn» của
`packages/ui` đỏ ở 9 trên 12 lượt CI hỏng gần nhất. Đo lại 07/10 trên 31 lượt CI hỏng từ 30/09
(`gh run view --log-failed`): **0** dòng `(fail) chen-lien-ket`, và mọi lượt có chạy tệp DOM này đều báo
«xanh». Con số 9/12 là đếm nhầm dòng `TypeError: null is not an object (evaluating
'this.commandManager.commands')`. Dòng này được in ra ở 3 lượt hỏng vì `app#test` / `agent#test`, và tại chỗ thì in
ra 6–7 lần ở MỌI lượt (5 pass, 0 fail, exit 0). Anh chọn thu hẹp hàng (`tra-loi/P4-2.json`, 07/10 20:44Z).

Lỗi thật: `onCloseAutoFocus` của `NutLienKetTrang` (`packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`)
gọi `editor?.commands.focus()`. Khi `FocusScope` của Radix gỡ, nó trả focus qua một `setTimeout(0)`. Nếu trình
soạn đã bị huỷ trước hẹn giờ đó (gỡ trang, đóng ngăn, hay `afterEach` của bài kiểm), editor không còn
`commandManager`, nên lời gọi văng `TypeError`. jsdom báo lỗi qua sự kiện `error` của `window` rồi in ra console.
Trên sản phẩm, đây là một lỗi console khi người dùng rời trình soạn lúc hộp đang mở.

## Criteria

- AC-1: Given tệp `packages/ui/test/trinh-soan-lien-ket.dom.tsx` ở HEAD, When chạy cả tệp, Then mọi bài xanh, 0 fail.
- AC-2: Given trình soạn mở hộp chèn liên kết, When gỡ cả trình soạn lúc hộp còn mở rồi chờ tới khi hẹn giờ trả focus của hộp đã chạy (một nhịp `setTimeout(0)` xếp SAU lần gỡ), Then `window` không nhận sự kiện `error` nào (bài ghi thông điệp lỗi dạng chuỗi, đòi danh sách rỗng).
- AC-3: Given cùng bài AC-2 chạy trên bản sao mà thành phần mất lớp chặn (trả focus không xét editor đã huỷ), When chạy bài đó, Then bài đỏ, với lỗi bắt được mang chữ `commandManager` — chứng thước AC-2 thật sự thấy lỗi cũ.
- AC-4: Given hộp đang mở trên trình soạn còn sống, When nhấn Esc, Then hộp đóng và focus về lại trình soạn — bài «Esc đóng hộp và trả focus về trình soạn», cùng mọi hàm trợ giúp và `afterEach` của tệp, giữ nguyên từng byte (bài mới nằm trong một khối riêng ở cuối tệp).
- AC-5: Given chạy cả tệp DOM ở HEAD, When đếm dòng `commandManager` trong đầu ra, Then bằng 0.

## Coverage

- Trục A — trạng thái trình soạn lúc hộp trả focus: còn sống | đã huỷ [thước CE: hai nhánh của lớp chặn `editor.isDestroyed`]
- Trục B — cách hộp đóng: Esc | chọn một trang | gỡ cả trình soạn (gỡ trang, đóng ngăn, `afterEach`) [thước CE: ba đường dẫn tới `onCloseAutoFocus` — `onOpenChange` của Radix và lần gỡ của `FocusScope`]
- Core → AC: đã huỷ × gỡ cả trình soạn → AC-2 (chiều xanh) + AC-3 (chiều đỏ); còn sống × Esc → AC-4; còn sống × chọn trang → các bài có sẵn trong tệp (AC-1); mọi ô của tệp không in lỗi → AC-5.
- Ô «đã huỷ × Esc» và «đã huỷ × chọn trang» không tồn tại: đã huỷ thì không còn hộp để nhấn hay chọn.

## Out of scope

- Bài «Esc» chờ một nhịp 20 ms cố định: đo 0/31 lượt CI đỏ, nên không đổi (tiền đề cũ sai).
- Ghim lại các hồ sơ đã ký đo theo glob `packages/ui/**` (khoảng 30 hồ sơ): lưới gộp chỉ soi hồ sơ trong diff; bộ suite `@crm/ui` của S4 chạy lại mọi bài kiểm của gói.
- Đổi cách Radix trả focus hay nâng phiên bản Radix/tiptap.

## Notes

- Tiền đề cũ của hàng (9/12 lượt CI đỏ) sai; số đo thật nằm trong Context. Cổng Đáng vẫn `build` (luật 16 của đợt).
