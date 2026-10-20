# Kế hoạch — Đổi nhãn khu Mục tiêu (VK4)

Thiết kế: `docs/superpowers/specs/2026-10-19-doi-nhan-khu-muc-tieu-design.md` · hợp đồng và evals:
`_acceptance/doi-nhan-khu-muc-tieu/`. Kiểm kê đã ghim ở commit `3b72132fb` (trước mọi commit chạm `apps/**`).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Bài kiểm đỏ khi tên cũ còn hay quay lại | `apps/app/test/doi-nhan-khu-muc-tieu*.ts` | AC-6 (luật một tên) |
| Mọi chữ của khu dùng ba tên mới ở hai thứ tiếng | `apps/app/lib/messages/okr*.ts`, `tro-ly-okr.ts`, `to-chuc.ts`, `packages/ui/src/lib/messages.ts` | AC-1, AC-2, AC-4, AC-5 (chữ mới) |
| Hàng gốc bảng độ phủ mang tên không gian làm việc | `okr/hoi-y/khoi-do-phu.tsx` | AC-3 (tên gốc ba màn) |
| Bài cũ khẳng định chữ mới, không bài nào bị gỡ | `apps/app/test/*.dom.tsx`, `messages-guard.spec.ts` | AC-7 (bài cũ đổi theo) |
| Phép đo của vòng neo đúng dải commit | `_acceptance/doi-nhan-khu-muc-tieu/rang/*`, `_acceptance/config.yaml` | AC-6, AC-7, AC-8 |
| Hai phép đo màn đã ký khẳng định chữ mới | `_acceptance/dat-okr-trong-crm/rang/man-okr.mjs`, `_acceptance/toan-canh-okr/rang/man-toan-canh.mjs` | AC-8 (thước đã ký) |
| Ảnh ba màn ở tiếng Việt và hai ảnh tiếng Anh | `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs` | AC-2, AC-3 (ảnh màn) |

## Task 1 — Luật và bài kiểm chữ (đỏ trước)

- Files: `apps/app/test/doi-nhan-khu-muc-tieu-luat.ts`, `apps/app/test/doi-nhan-khu-muc-tieu.spec.ts`
- Verify: `cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts` đỏ trên chữ cũ ở các ca dnk-gop-vao, dnk-goc,
  dnk-lay-y-kien, dnk-luat (a); ca dnk-luat (b) chiều đỏ xanh ngay.
- Phục vụ E1, E2, E4, E5, E6 · independent: false

## Task 2 — Đổi chữ theo kiểm kê

- Files: bảy tệp chữ ở bảng trên.
- Verify: `cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts` xanh.
- Phục vụ E1, E2, E4, E5, E6 · independent: false (sau Task 1)

## Task 3 — Tên gốc ở bảng độ phủ và bài DOM

- Files: `apps/app/app/(app)/[slug]/okr/hoi-y/khoi-do-phu.tsx`, `apps/app/test/doi-nhan-khu-muc-tieu.dom.tsx`
- Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-khu-muc-tieu.dom.tsx`
- Phục vụ E3 · independent: true

## Task 4 — Bài cũ đổi theo

- Files: `okr-cua-toi-ba-phan.dom.tsx`, `okr-sheet.dom.tsx`, `okr-tai-co-cau.dom.tsx`, `messages-guard.spec.ts` và bài nào
  khác đỏ vì chữ.
- Verify: lệnh của E11.
- Phục vụ E10, E11 · independent: false (sau Task 2)

## Task 5 — Răng của vòng và khoá lệnh

- Files: `rang/dai.mjs`, `kiem-ke.mjs`, `dot-bien.mjs`, `proto.mjs`, `khong-go-bai.mjs`, `bang-chu.mjs`, `thuoc-da-ky.mjs`;
  dòng `dnk_*` thêm vào `_acceptance/config.yaml` (chỉ thêm dòng).
- Verify: từng răng chạy xanh trên cây, và lượt phá-thử của nó đỏ với thông điệp ghim.
- Phục vụ E7, E8, E9, E10, E12, E13 · independent: false

## Task 6 — Thước hai hồ sơ đã ký

- Files: hai răng màn và `decisions.jsonl` của hai hồ sơ (một dòng `fix` mỗi hồ sơ).
- Verify: `node _acceptance/doi-nhan-khu-muc-tieu/rang/thuoc-da-ky.mjs`
- Phục vụ E12 · independent: true

## Task 7 — Răng chụp màn

- Files: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs`
- Verify: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs"` in KET LUAN 0 SAI.
- Phục vụ E15 · independent: true

## Task 8 — Năm lệnh chứng của kho

- Verify: `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`; `bun run test` để S4.
