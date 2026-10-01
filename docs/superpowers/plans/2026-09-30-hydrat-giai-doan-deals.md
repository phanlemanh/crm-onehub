# Kế hoạch: hydrat-giai-doan-deals

Hồ sơ `_acceptance/hydrat-giai-doan-deals/` · T2 · thiết kế ở
`docs/superpowers/specs/2026-09-30-hydrat-giai-doan-deals-design.md`.

Các task chạy tuần tự trong vòng chính: mọi phép đo màn dùng phiên đo riêng và đỏ giả khi
nhiều phiên cùng chạy, nên không tách song song.

## T1 — Test DOM đỏ trước khi sửa

- Files: `apps/app/test/deals-giai-doan-hydrat.dom.tsx` (mới)
- Ca: `e0` (đối chứng bộ nghe: lệch chữ, lệch `data-tone`), `e1`…`e5` theo evals.
- Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/deals-giai-doan-hydrat.dom.tsx` — trên mã hiện tại e1–e4 đỏ đúng thông điệp ghim, e0, e5 xanh.
- Phục vụ: E1–E5 · independent: false

## T2 — Sửa ngăn tạo deal

- Files: `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx`
- `CreateDealForm` giữ mở/đóng, nháp, lệnh tạo; `CreateDealBody` (trong `SheetContent`) giữ bốn truy vấn, giá trị suy ra, form, chân ngăn.
- Verify: test T1 xanh cả sáu ca; `tien-te-chua-tai.dom.tsx`, `o-so-tien.dom.tsx`, `khung-tao-okr.dom.tsx` xanh; `bun run check-types`.
- Phục vụ: E1–E5, E9 · independent: false

## T3 — Chiều đỏ tự động của test DOM

- Files: `_acceptance/hydrat-giai-doan-deals/rang/chieu-do-dom.mjs`
- Verify: chạy script → `DO DUNG GHIM: e1 e2 e3 e4`, exit 0.
- Phục vụ: E1d · independent: false

## T4 — Phép đo màn thật

- Files: `_acceptance/hydrat-giai-doan-deals/rang/man-deals.mjs`
- Verify: `PHIEN_DO_TEN_CAY=hgd-man bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hydrat-giai-doan-deals/rang/man-deals.mjs"` exit 0; `--chieu-do` in `DO DUNG GHIM`.
- Phục vụ: E6, E6d · independent: false

## T5 — Gỡ lớp bọc E17 của khung-tao-okr-nhu-deal

- Files: `_acceptance/config.yaml` (`kto_man_giu`), xoá `_acceptance/khung-tao-okr-nhu-deal/rang/giu-cho-han-che.mjs`, `_acceptance/khung-tao-okr-nhu-deal/evals.yaml` (E17), `_acceptance/khung-tao-okr-nhu-deal/contract.md` (Notes), `_acceptance/hydrat-giai-doan-deals/rang/go-boc.mjs` (mới).
- Verify: `bun _acceptance/hydrat-giai-doan-deals/rang/go-boc.mjs` exit 0; chiều đỏ `--goc` trên bản 6e431a01 exit 1; lệnh `kto_man_giu` chạy thật exit 0.
- Phục vụ: E7, E8 · independent: false

## T6 — Bộ kiểm của kho

- Verify: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.
- Phục vụ: E9 · independent: false
