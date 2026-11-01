---
schema_version: 1
feature: "Một dấu hiệu vẽ tay của docs/design.md trong tệp mới của apps/app làm lint:slop đỏ và gọi đúng tên tệp; nợ cũ nằm trong một danh sách của chính luật"
slug: rang-dau-hieu-ve-tay
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
design_doc: docs/superpowers/specs/2026-11-01-rang-dau-hieu-ve-tay-design.md
veto_state: mo
veto_opened_at: 2026-11-01T07:50:00Z
---

# Acceptance Contract: rang-dau-hieu-ve-tay

## Context

Hàng BK5 của `docs/plan/lo-trinh-okr.json` (gộp SN3), đợt `don-dep-3110`, dãy K, đứng trên BK2 (#612). Ô cơ hội ký
`build` ngày 31/10. Bảng «Dấu hiệu vẽ tay» của `docs/design.md` hứa thành luật `anti-slop` mà chưa có; đo trên
`ac0be9406` có 79 chỗ trên 51 cặp (tệp, dấu hiệu). Vòng này thêm một luật oxlint, một danh sách nợ cạnh luật và một bài
kiểm danh sách. Hạng T2.

Source input: hàng BK5 (`cau_giao`, `bat_khi`, `ghi_chu`) · `opportunity.md` · `docs/design.md` mục «Dấu hiệu vẽ tay» ·
`docs/plan/don-dep-3110.md` §5 · design doc.

Thuật ngữ: **luật** = `onehub/khong-ve-tay`. **Danh sách nợ** = `tools/oxlint/onehub/rules/khong-ve-tay-no-cu.json`.
**Bài** = `apps/app/test/dau-hieu-ve-tay.spec.ts`. **Bảy dấu hiệu** = `table`, `clipboard`, `tieu-de` (`h1`–`h4` có
`className`), `divide-y`, `cham` (`size-2` + `rounded-full`), `chip-dinh` (`ToggleGroup spacing={0}`), `alert-dialog`.
**Chỗ mới** = một dấu hiệu trong tệp `.ts`/`.tsx` dưới `apps/app` mà cặp (tệp, dấu hiệu) không có dòng nợ. **Giá trị
`className`** = mọi chuỗi viết trong thuộc tính (chuỗi trần, đối số `cn(…)`, phần tĩnh template literal, hai nhánh ba
ngôi, hằng `const` cùng tệp mà thuộc tính trỏ); lớp so theo từ.

## Criteria

- AC-1: Given một tệp mới dưới `apps/app/components/`, When tiêm từng ca của ma trận mười lăm ca (bảy dấu hiệu;
  `tieu-de` cả `h2` và `h4`; `divide-y` và `cham` mỗi mã năm dạng giá trị `className`; một hằng cùng tệp) rồi chạy đúng
  lệnh script `lint:slop`, Then mỗi ca đỏ đúng một dòng `onehub(khong-ve-tay)` gọi `<tệp>:<dòng>` và thành phần thay của
  dấu hiệu ấy.
- AC-2: Given cùng tệp, When tiêm dạng gần — `<h2>` không `className`, `ToggleGroup` không `spacing`, `spacing={1}`,
  `className="size-2"` không `rounded-full`, `size-2.5 rounded-full`, `divide-y-0`, `divide-x`, `<Table>`,
  `navigator.share`, nhập `ConfirmDialog`, hằng nhập từ tệp khác — Then không dòng `khong-ve-tay` nào.
- AC-3: Given chín ca của AC-1, When đặt dưới `apps/app/app/proto/`, `apps/app/test/`, `packages/ui/src/` hay `docs/`,
  Then không dòng `khong-ve-tay` nào.
- AC-4: Given một tệp có dòng nợ (tệp, dấu hiệu, `so` = N), When tệp có đúng N chỗ, Then im; When thêm một chỗ, Then mọi
  chỗ của dấu hiệu ấy trong tệp đỏ kèm «vượt nợ cũ»; When bớt một chỗ, Then một dòng đỏ «nợ cũ khai N, còn N-1»; When
  thêm một dấu hiệu khác mà tệp không khai nợ, Then đúng một dòng đỏ như chỗ mới, không chứa «vượt nợ cũ».
- AC-5: Given bài, When một dòng nợ trỏ tệp không có, mang dấu hiệu ngoài bảy mã, `so` không phải số nguyên dương, `ly_do`
  rỗng, hay trùng cặp với dòng khác, Then bài đỏ gọi tên tệp, dấu hiệu và lỗi.
- AC-6: Given cây ở đỉnh đang xét, When chạy `bun run lint:slop`, Then không dòng `khong-ve-tay` nào; danh sách nợ có
  đúng 51 dòng và tổng `so` theo dấu hiệu bằng bảng đo của design doc (tieu-de 38, chip-dinh 10, alert-dialog 11,
  clipboard 8, divide-y 9, cham 2, table 1).
- AC-7: Given luật, Then thông điệp của mỗi dấu hiệu nêu thành phần thay lấy từ cột «Dùng» của **đúng hàng** ứng với
  dấu hiệu ấy trong bảng «Dấu hiệu vẽ tay» của `docs/design.md`; đổi chuỗi thay của hai dấu hiệu cho nhau thì phép đo
  đỏ.
- AC-8: Given bài, When chạy `bun test` của script `test` trong `apps/app`, Then bài chạy (tên đầy đủ có describe của bài,
  ít nhất một ca pass).

## Coverage

Quét bảy dấu hiệu × ba vị trí (tệp mới trong `apps/app` · thư mục im · tệp nợ) × ba trạng thái nợ (bằng · vượt · thiếu)
× năm lỗi khai báo danh sách. Thước CE: bảng «Dấu hiệu vẽ tay» của `docs/design.md` và `bat_khi` của hàng BK5
[SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json]; số chỗ ở design doc mục «Vấn đề». `SECTION_TITLE`, `NhomDaBo`, nút tự ghép
là Never vòng này (không dấu hiệu cú pháp).

## Đường đo

- Ngưỡng SỐNG của ô cơ hội: số đến từ đầu ra của `lint:slop` (dòng `onehub(khong-ve-tay)`) và của bài. AC-1 chiều đỏ;
  AC-3 tệp proto im; AC-4 tệp nợ im; AC-6 danh sách khớp số đếm.

## Out of scope

- Sửa 79 chỗ nợ — hàng chạm tệp nợ thì sửa luôn.
- `SECTION_TITLE`, nhóm gập `NhomDaBo`, nút tự ghép làm thanh lọc, `className` đổi màu trên thành phần `@crm/ui`.
- `className` dựng từ hằng nhập từ tệp khác hay biến tính lúc chạy.

## Notes

- `tieu-de` 38 chỗ khác kiểm kê 31/10 (34): kiểm kê đếm chuỗi `className="…"`; luật đếm mọi thuộc tính `className`.
