# Review findings: menu-con-loc-dien-thoai (round 1)

## Trong hợp đồng

- **khong-cham-noi-goi.mjs does not check lines inside a multi-line DropdownMenuSubContent tag, though E7 says it does**
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs:30`
  severity: medium
  AC: AC-7
  source: conventions
  detail: E7 in evals.yaml promises to count added lines that "chua 'DropdownMenuSubContent' hoac nam trong the DropdownMenuSubContent" (contain the name, or sit inside the tag). `dongThemCham` only flags a `+` line when `dong.includes(DAU)` is true, and it reads a `git diff -U0`, so there are no context lines to tell it that a line sits inside an open tag. A real call site already opens the tag on its own line: apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx:201-202 has `<DropdownMenuSubContent` on line 201 and `className="w-64 p-0"` on line 202. If someone edits only that className line (for example adds `-translate-x-40`), the diff line does not contain the name, the guard prints "0 dong them o noi goi" and exits 0, and the eval reports PASS. That is exactly the call-site override that docs/design.md forbids ("Do not override component styles with className") and that AC-7 is meant to catch. The `--tu-thu` self-test only uses a single-line diff, so it cannot show this gap. Either track the open tag across lines (with enough diff context, for example -U on the whole file, or by parsing HEAD's file at the changed line numbers), or narrow E7's expected text to what the script actually checks. Memory rule «Luật đo phải chạm lời hứa» (a measurement must check the promise it makes) applies.

- **khong-cham-noi-goi.mjs misses className edits inside a multi-line DropdownMenuSubContent tag, so E7 can pass when it should fail**
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs:32`
  severity: medium
  AC: AC-7
  source: bugs
  detail: The E7 contract (evals.yaml lines 135-141) promises to count added lines under apps/ that either contain "DropdownMenuSubContent" or sit inside a DropdownMenuSubContent tag. `dongThemCham` only does the first. It flags a `+` line only when that line itself contains the text `DropdownMenuSubContent`, and the diff is read with `git diff -U0`, so the script has no context to tell that a line is inside an open tag. One real call site already uses the multi-line form: apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx lines 201-203 open `<DropdownMenuSubContent` on one line and put `className="w-64 p-0"` on the next. If someone changes that line to `className="w-64 p-0 -translate-x-40"`, the diff's only added line is the className line. It does not contain DAU, so the script prints "DUNG 0 dong them o noi goi" and exits 0. That is exactly the call-site position override AC-7 is meant to forbid. The `--tu-thu` self-test does not catch this gap because its fake diff (DIFF_GIA) only covers the single-line form. To fix it, track whether each added line is still inside an open `<DropdownMenuSubContent` tag, up to the closing `>`, using diff context (for example `-U` with enough lines, or reading the file at HEAD). Also add a multi-line case to DIFF_GIA.

- **Hình dạng 5 — tuyên quét LỚP «dòng thêm chứa hoặc nằm trong thẻ DropdownMenuSubContent» nhưng chỉ bắt điểm-case thẻ một dòng**
  file: `_acceptance/menu-con-loc-dien-thoai/rang/khong-cham-noi-goi.mjs:31`
  severity: high
  AC: AC-7
  source: measurement
  detail: Expected của E7 hứa đếm dòng THÊM «chứa "DropdownMenuSubContent" HOẶC nằm trong thẻ DropdownMenuSubContent». Nhưng dongThemCham chỉ giữ dòng thoả `dong.startsWith("+") && dong.includes(DAU)` (dòng 31), đọc trên `git diff -U0` (dòng 41). Vì vậy không có nhánh nào xét dòng nằm bên trong thẻ. Kho đã có sẵn một nơi gọi viết thẻ nhiều dòng: apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx:201-202, với `<DropdownMenuSubContent` ở một dòng và `className="w-64 p-0"` ở dòng sau. Sửa dòng đó thành `className="w-64 p-0 -translate-x-40"` sẽ cho ra dòng diff `+ className=...` không chứa DAU, nên răng vẫn in «0 dong them o noi goi» và thoát 0, dù AC-7 bị vi phạm. Đối chứng duy nhất (--tu-thu, DIFF_GIA ở dòng 9) chỉ có một ca: className nằm cùng dòng với tên thẻ trong bulk-actions.tsx. Không có ma trận viết trước gồm hai ca «cùng dòng» và «dòng sau trong thẻ», nên lớp lỗi «nằm trong thẻ» được tuyên mà không có mã và không có ca kiểm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — assertion âm tính một mình: lệnh E7 chạy khong-cham-noi-goi không kèm --tu-thu**
  Người dùng thấy gì: Phép kiểm cuối cùng xác nhận không ai tự ý dịch vị trí menu con ở nơi gọi chỉ cho kết quả xanh hoặc đỏ, không tự chứng minh nó còn bắt được lỗi thật. Nếu bộ lọc của nó hỏng lặng lẽ, người duyệt vẫn thấy xanh và có thể tin nhầm.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» cho lớp dịch phía trái, trong khi lời hứa là quan hệ dịch theo phần tràn**
  Người dùng thấy gì: Trên điện thoại, nếu menu cha nằm sát mép phải và menu con bị lật sang trái mà vẫn thiếu chỗ, chưa có phép đo nào xác nhận menu con thật sự dịch vào trong màn. Ca này hiếm và đã được ghi nhận là chưa đo.
  file: `packages/ui/test/menu-con-dich-vao.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
