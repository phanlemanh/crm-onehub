# Răng dấu hiệu vẽ tay (BK5 · `rang-dau-hieu-ve-tay`)

Hàng BK5 của `docs/plan/lo-trinh-okr.json`, đợt `don-dep-3110`, dãy K, đứng trên BK2 (#612, onehub `ac0be9406`). Gộp SN3
`luat-ve-tay-thanh-lint`. Ô cơ hội ký `build` ngày 31/10.

## Vấn đề, đo trên cây `ac0be9406`

Bảng «Dấu hiệu vẽ tay» của `docs/design.md` tự hứa «sẽ thành một luật `anti-slop` trong `tools/oxlint`», nhưng tới nay
chỉ được kiểm bằng mắt ở review. Đo bằng cây cú pháp TypeScript trên mọi tệp `.ts`, `.tsx` dưới `apps/app` (trừ
`apps/app/app/proto/**` và tệp kiểm):

| Dấu hiệu | Chỗ / tệp | Kiểm kê 31/10 (`docs/plan/don-dep-3110.md` §5) |
| --- | --- | --- |
| `<h1>`–`<h4>` có `className` | 38 / 24 | 34 / 23 — kiểm kê đếm chuỗi `className="…"` bằng `git grep`; cây cú pháp đếm cả `className={…}` |
| `ToggleGroup spacing={0}` | 10 / 7 | 10 / 7 |
| `AlertDialog` ráp tay (nhập từ `alert-dialog`) | 11 / 11 | 11 tệp |
| `navigator.clipboard` | 8 / 7 | 7 tệp |
| `divide-y` trong `className` | 9 / 9 | phiên design-floor đếm thêm, không ghi số |
| chấm `size-2` + `rounded-full` trong `className` | 2 / 2 | như trên |
| `<table>` | 1 / 1 | như trên |

Tổng 79 chỗ trên 51 cặp (tệp, dấu hiệu). `SECTION_TITLE` và nhóm gập `NhomDaBo` của kiểm kê không có dấu hiệu cú pháp
đủ chắc — không vào luật vòng này.

## Thiết kế

1. **Luật `onehub/khong-ve-tay`** (`tools/oxlint/onehub/rules/khong-ve-tay.ts`), bật trong `.oxlintrc.json` cho
   `apps/app/**`, tắt cho `apps/app/app/proto/**` và tệp kiểm (`**/test/**`, `*.spec.*`, `*.dom.tsx`). Bảy dấu hiệu, mỗi
   dấu hiệu một thành phần thay lấy từ bảng của `docs/design.md`:

   | Mã | Dấu hiệu cú pháp | Thay |
   | --- | --- | --- |
   | `table` | thẻ JSX `table` | `DataTable` hay `SimpleTable` |
   | `clipboard` | biểu thức `navigator.clipboard` | `CopyValue` |
   | `tieu-de` | thẻ `h1`–`h4` có thuộc tính `className` | `PageShellTitle`, `CardTitle` hay `SectionHeading` |
   | `divide-y` | một lớp `divide-y` (đúng từ, không `divide-y-0`) trong giá trị `className` | `Item`, hộp nội dung là `Card` với `CardContent` |
   | `cham` | giá trị `className` có cả lớp `size-2` và `rounded-full` (có thể ở hai chuỗi) | `StatusIndicator` |
   | `chip-dinh` | `ToggleGroup` có `spacing={0}` | chip của mục «Hàng công cụ» |
   | `alert-dialog` | câu nhập từ module `…/alert-dialog` | `ConfirmDialog` |

   «Giá trị `className`» = mọi chuỗi viết trong thuộc tính: chuỗi trần, đối số của `cn(…)`, phần tĩnh của template
   literal, hai nhánh của biểu thức ba ngôi, và chuỗi của một hằng `const` khai **trong cùng tệp** mà thuộc tính trỏ tên.
   Lớp so theo từ (tách khoảng trắng). Chuỗi thay lấy từ cột «Dùng» của hàng tương ứng trong bảng «Dấu hiệu vẽ tay»
   của `docs/design.md`. Thông điệp: tệp, dấu hiệu, thành phần thay, và đường khai nợ.
2. **Danh sách nợ cũ nằm trong luật**: `tools/oxlint/onehub/rules/khong-ve-tay-no-cu.json`, một dòng một cặp (tệp, dấu
   hiệu): `{ "tep", "dau_hieu", "so", "ly_do" }`. Đếm theo cặp (tệp, dấu hiệu), không miễn cả tệp: tệp nợ `table` thêm
   `navigator.clipboard` thì đỏ như chỗ mới. Luật đếm chỗ của mỗi dấu hiệu trong tệp đang xét: `so` bằng số thật →
   im; số thật vượt `so` → mọi chỗ của dấu hiệu ấy trong tệp đỏ «vượt nợ cũ»; số thật thấp hơn `so` → một dòng đỏ ở đầu
   tệp «nợ cũ khai N, còn M — sửa danh sách». Hàng chạm tệp nợ mà sửa luôn thì hạ `so` hay xoá dòng.
3. **Bài kiểm danh sách** `apps/app/test/dau-hieu-ve-tay.spec.ts`: mỗi dòng trỏ tệp có thật, dấu hiệu thuộc bảy mã, `so`
   là số nguyên dương, `ly_do` khác rỗng, không trùng cặp. Bộ đọc danh sách dùng chung với luật
   (`tools/oxlint/onehub/shared/no-ve-tay.ts`).
4. Mã dấu hiệu và thành phần thay sống trong mã luật (bảng ở trên là chính luật); danh sách nợ sống trong tệp JSON cạnh
   luật — «nợ cũ nằm trong một danh sách của chính luật».

## Hai chiều

Răng `_acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs` chạy đúng lệnh script `lint:slop` trong bản sao tạm
(`.oxlintrc.json`, `package.json`, `tools/oxlint`, `packages/db/src/giai-doan.ts`, `design/patterns`, `apps/app` không
`node_modules`):

- chiều đỏ: ma trận viết trước mười lăm ca tiêm vào một tệp mới dưới `apps/app/components/` → mỗi ca đúng một dòng
  `khong-ve-tay` gọi tệp:dòng và chuỗi thay ghim sẵn bằng chữ: `table`, `clipboard`, `tieu-de` (`h2`, `h4`),
  `chip-dinh`, `alert-dialog`, và `divide-y`, `cham` mỗi mã năm dạng giá trị (chuỗi trần · `cn` một đối số · `cn` hai
  đối số chia lớp · template literal · ba ngôi), cộng `hang-cung-tep` (hằng `const` cùng tệp mang `divide-y`);
- đối chứng gần dạng → im: `<h2>` không `className`, `ToggleGroup` không `spacing` và `spacing={1}`, `size-2` không
  `rounded-full`, `size-2.5 rounded-full`, `divide-y-0`, `divide-x`, `<Table>`, `navigator.share`, nhập `ConfirmDialog`,
  hằng nhập từ tệp khác;
- chiều im: cùng chín ca dưới `apps/app/app/proto/`, `apps/app/test/`, `packages/ui/src/`, `docs/`;
- nợ: tệp nợ thêm một chỗ → đỏ «vượt nợ cũ»; bớt một chỗ → đỏ «nợ cũ khai N, còn M»; thêm dấu hiệu khác → đỏ như
  chỗ mới;
- tự kiểm: tắt luật trong bản sao thì ca đỏ không còn dòng;
- đối chứng dương: `bun run lint:slop` trên cây thật → 0 dòng `khong-ve-tay`; tổng `so` theo dấu hiệu bằng bảng đo trên.

## Lựa chọn và căn cứ

- Luật trong `tools/oxlint/onehub`, chạy bằng `lint:slop`: câu giao của hàng nói «làm `lint:slop` đỏ».
- Nợ cũ là JSON cạnh luật (câu giao «nợ cũ nằm trong một danh sách của chính luật»), đếm theo cặp (tệp, dấu hiệu) với
  số chỗ, vượt thì đỏ, thiếu thì đỏ: theo nếp bảng ngoại lệ của BK6 (`_acceptance/rang-hang-cong-cu/contract.md` AC-6).
- Không sửa nợ: ghi chú hàng «Hàng nào sau này chạm tệp trong danh sách nợ cũ thì sửa luôn».
- Bỏ design-pass: vòng không đổi màn nào.

## Ngoài vòng

- `SECTION_TITLE`, nhóm gập `NhomDaBo`, nút tự ghép làm thanh lọc, `className` đổi màu trên thành phần `@crm/ui`: không
  dấu hiệu cú pháp đủ chắc.
- `className` dựng từ hằng nhập từ tệp khác (`SECTION_TITLE` của `detail-sheet.tsx`) hay từ biến tính lúc chạy.
- Sửa 79 chỗ nợ.
