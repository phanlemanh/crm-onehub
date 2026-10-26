# Kế hoạch thi công — chi-tiet-cong-ty-hai-cot

Hồ sơ `_acceptance/chi-tiet-cong-ty-hai-cot` (Cổng Phạm vi duyệt 23/10, Manh Phan) · thiết kế
`docs/superpowers/specs/2026-10-23-chi-tiet-cong-ty-hai-cot-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Phiếu Công ty: Giới thiệu đầu, Chi tiết hai cột trải hết bề ngang, ô Tệp trọn hàng | `company-sheet.tsx`, `detail-sheet.tsx` | AC-1 (thứ tự, hai cột) · AC-2 (ô Tệp rộng) · AC-6 (không mô tả) |
| Vùng kéo thả đặt chữ xuống dưới nút khi hẹp, giữ cùng hàng khi rộng | `packages/ui/src/components/nguon-keo-tha.tsx` | AC-3 (điện thoại) · AC-5, AC-7 (chỗ rộng không đổi) |
| Có bộ đo màn thật chứng ba khổ, kèm 13 lần phá thử | `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs` | E1–E8 |

## Task 1 — Phiếu Công ty một cột dọc, Chi tiết hai cột

- Files: `apps/app/components/crm/record-sheet/company-sheet.tsx`, `apps/app/components/detail-sheet.tsx`
- Làm: bỏ `DetailSheetSplit`/`Main`/`Rail` ở tab Tổng quan; thứ tự CompanyAbout → Chi tiết (`DetailSheetProperties` mặc
  định hai cột) → `DetailSheetPending` → Liên kết → `WebsiteActivity`. Gỡ ba export không còn ai gọi khỏi `detail-sheet.tsx`.
- Verify: `bun run check-types` (gói app) và `git grep -n "DetailSheetRail\|DetailSheetSplit\|DetailSheetMain"` rỗng.
- Phục vụ: E1, E2, E4, E6.
- independent: true (không chung tệp với Task 2).

## Task 2 — Vùng kéo thả xuống dòng khi hẹp

- Files: `packages/ui/src/components/nguon-keo-tha.tsx`
- Làm: khối chữ `flex min-w-0 flex-1 flex-col gap-0.5` thêm `basis-48` để `flex-wrap` đẩy cả khối xuống dưới nút khi
  phần còn lại < 192px.
- Verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-keo-tha.dom.tsx ./test/nguon-canh-nhau.dom.tsx`.
- Phục vụ: E2, E3, E5, E8.
- independent: true.

## Task 3 — Bộ đo màn thật và chiều đỏ

- Files: `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs`
- Làm: phiên đo qua `tien-de.mjs`; API của phiên khởi lại với kho Blob giả (`_acceptance/truong-tep/rang/blob-gia.mjs`,
  `nap-blob-gia.mjs`); gieo qua API thật (fields.create, companies/contacts/deals.create, fieldFiles.*); bảy bước đo theo
  E1–E6, E8; `--chi-do` chạy 13 chiều đỏ qua `chieuDo` của `_acceptance/kho-tai-lieu/rang/man-lib.mjs`, mỗi cặp
  (chiều, bước) ghim đúng thông điệp.
- Verify: chạy đủ một lượt trên cây lành (mã 0) và ít nhất một chiều đỏ (mã 1 đúng ghim) trước khi tính xong — theo
  khuôn «một phép đo mới kèm cặp hai chiều».
- Phục vụ: E1–E8.
- independent: false (cần Task 1, 2 để xanh).

Thứ tự: Task 1 → Task 2 → Task 3, tuần tự trong phiên chính (xem sổ quyết định S2).
