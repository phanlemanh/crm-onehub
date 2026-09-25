# Kế hoạch: okr-soat-anh-luot-3

Hợp đồng: `_acceptance/okr-soat-anh-luot-3/contract.md`. Thiết kế:
`docs/superpowers/specs/2026-09-25-okr-soat-anh-luot-3-design.md`.

Thứ tự: thước trước, chạy trên giao diện cũ để lấy ảnh «trước» và chiều đỏ, commit;
rồi sửa từng chỗ; rồi chạy lại thước lấy ảnh «sau».

## Task 1 — Bàn đo màn thật và soi mã (thước trước)

- Files: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`, `rang/soi-ma.mjs`,
  `rang/san-thiet-ke.mjs`
- Verify: bật `ban-do-osa-api` + `ban-do-osa-app`; `NHAN=truoc` chạy `osa_do_man` → mã 1 với
  đúng các dòng SAI của chiều đỏ trong evals (E1, E2, E3, E5, E8), ảnh vào `evidence/truoc/`;
  E15 dọn DUNG. `osa_soi_ma` trên cây cũ → SAI (chưa có thành phần mới).
- Phục vụ: E1, E2, E3, E5, E8, E9, E12, E13, E14, E15
- independent: false (mọi task sau đo bằng nó)

## Task 2 — `packages/ui`: cỡ hộp `table`, hàng `invalid`, `NavStrip`

- Files: `packages/ui/src/components/dialog.tsx`, `simple-table.tsx`, `nav-item.tsx`,
  `packages/ui/src/lib/row-accent.ts`, `packages/ui/test/nav-strip.dom.tsx`
- Verify: `osa_nav_strip` xanh 5 ca; phá-thử ba nhánh đỏ đúng thông điệp ghim.
- Phục vụ: E4, E13
- independent: false

## Task 3 — Hộp nhập dùng cỡ `table`, cột chữ dài xuống dòng, hàng hỏng đánh dấu

- Files: `apps/app/app/(app)/[slug]/okr/hop-thoai-nhap.tsx`
- Verify: `osa_do_man` các mã `nhap-*` DUNG.
- Phục vụ: E1, E2
- independent: false (cần Task 2)

## Task 4 — Khung Cài đặt dùng `NavStrip`

- Files: `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`
- Verify: `osa_do_man` các mã `caidat-390-*` DUNG; `osa_ktcd_khong_trinh_duyet` xanh.
- Phục vụ: E3, E11
- independent: false (cần Task 2)

## Task 5 — Nhãn loại chu kỳ và gợi ý tên

- Files: `apps/app/lib/okr-chu-ky-nhan.ts` (mới: `canNhanLoai`, `goiYChuKy`, `homNayVn`,
  hằng `OKR_CHU_KY.muiGio`), `apps/app/lib/messages/okr.ts`,
  `apps/app/app/(app)/[slug]/okr/chon-chu-ky.tsx`,
  `apps/app/app/(app)/[slug]/settings/okr/{page,bang-chu-ky,sheet-mo-chu-ky}.tsx`,
  `apps/app/test/okr-chu-ky-nhan.spec.ts`
- Verify: `osa_nhan_goi_y` xanh 20 assert; `osa_do_man` mã `chuky-*`, `goiy-*` DUNG;
  `osa_soi_ma` DUNG.
- Phục vụ: E5, E6, E7, E8, E9
- independent: true (so với Task 3, 4) — làm tuần tự vì nhỏ

## Task 6 — Chứng toàn phần

- Verify: năm lệnh ở gốc (`test`, `check-types`, `lint`, `lint:slop`, `build`) với Node 24;
  `osa_dok_man`; `NHAN=sau` `osa_do_man` → mã 0, ảnh `evidence/sau/`.
- Phục vụ: E10, E11, E12, E14
