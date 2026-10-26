# Kế hoạch — trang-bo-okr (VK3)

Thiết kế: `docs/superpowers/specs/2026-10-21-trang-bo-okr-design.md`. Hợp đồng: `_acceptance/trang-bo-okr/contract.md`.
Verify mỗi task theo luật kho: test của task + `bun run check-types` + `bun run lint` + `bun run lint:slop`.

## T1 — Hai thủ tục đọc trong module okr của API (independent: true)

Files: `apps/api/src/okr/okr-xem.contracts.ts`, `apps/api/src/okr/okr.router.ts`, service đọc của okr (cạnh
`toanCanh`), `apps/api/test/okr-danh-sach-bo.spec.ts`.
- `okr.danhSachBo({ cycleId })` → hàng mỗi bộ đơn vị (goc, bp, pb) với `don`, `ten`, `cap`, `cha`, `truong`,
  `soMucTieu`, `tienDo`, `tuTinThap`, `toiDan`, `dangTheoDoi`. Số dùng lại hàm của `countByUnit`/`toanCanh`.
- `okr.viecCuaBo({ cycleId, unit })` → nhóm theo KR có việc: `kr { id, ten, mucTieu }`, `viec[] { id, loai, tieuDe,
  nguoiLam, hanNgay, xong }`.
Verify: `bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts"`. Phục vụ E1, E3, E8.

## T2 — Tham số URL (independent: false, trước T3–T5)

Files: `packages/validation/src/okr-tham-so.ts` (thêm `viec` vào `CACH_XEM_OKR`), `apps/app/lib/search-param-keys.ts`
(`phamViBo`), `apps/app/app/(app)/[slug]/okr/okr-search-params.ts` (`parseAsDonOkr` ghi `goc`, parser `phamViBo`).
Phục vụ E4, E5, E11.

## T3 — Trang danh sách và luật chọn trang (independent: false)

Files: `okr/theo-don-vi/page.tsx` (danh sách khi không `donOkr` và không `xemOkr`; tiêu đề, mô tả, breadcrumb),
`okr/theo-don-vi/danh-sach-bo.tsx` (mới), tin nhắn `apps/app/lib/messages/okr-vo-khu.ts` (chỉ thêm khoá).
Phục vụ E2, E4, E10, E12, E13.

## T4 — Hàng thẻ con và thẻ Việc (independent: false)

Files: `okr/theo-don-vi/hang-cong-cu.tsx` (bỏ ViewSwitch), `okr/theo-don-vi/the-con.tsx` (mới, Tabs line + Link),
`okr/theo-don-vi/theo-don-vi.tsx` (nhánh `viec`, giữ ky/don), `okr/theo-don-vi/viec-cua-bo.tsx` (mới).
Phục vụ E6, E7, E9.

## T5 — Liên kết trong app tới bộ OneHub (independent: false)

Files: `toan-canh/toan-canh.tsx`, `cua-toi.tsx`, `theo-don-vi/don-vi-con.tsx`, `phan-don-vi-dan.tsx`,
`soan/luat-ban-nhap.ts` — bộ OneHub mang `donOkr=goc`. Phục vụ E11, E10.

## T6 — Bài kiểm DOM (independent: false)

File: `apps/app/test/trang-bo-okr.dom.tsx` — ca `tbo-the`, `tbo-lien-ket`, `tbo-tai` và chiều đỏ. Phục vụ E6, E11, E13.

## T7 — Thước màn (independent: false)

Files: `_acceptance/trang-bo-okr/rang/man-bo-okr.mjs`, `man-bo-okr-chieu-do.mjs`, `khong-doi-hinh.mjs`.
Phục vụ E2, E4, E5, E7, E9, E10, E12, E14, E15.

## T8 — Thước của hồ sơ đã ký bị chạm (independent: false, sau T3–T5)

Quét `_acceptance/*/rang` và `apps/app/test` tìm `/okr/bo-okr` trần, `theo-don-vi` không `donOkr`, bộ chọn
`ViewSwitch` của khu Mục tiêu; đổi đúng chuỗi; đo hai chiều từng hồ sơ; dòng sổ `fix` mang `decided_by` chủ kho
trong sổ của hồ sơ ấy. Phục vụ E15.
