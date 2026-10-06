# Kế hoạch: to-chuc-chi-tiet-cho-url

Thiết kế: `docs/superpowers/specs/2026-10-05-to-chuc-chi-tiet-cho-url-design.md` · Hồ sơ: `_acceptance/to-chuc-chi-tiet-cho-url/`

## Task 1 — Ba ca chờ URL trong `cho(...)`

- Files: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
- Làm: «chon-nut: bam tung loai nut…» và «o-so-man: o thu nhat…» thêm vế `&& url.get("don") === …` vào `cho` sẵn có; «nhap-ba-buoc: buoc dan…» chèn `await cho(() => khung() === "goc" && url.get("don") === "goc", …)` sau `doiDong()`. Không đổi câu `expect` nào.
- Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc-chi-tiet.dom.tsx --rerun-each 10` → 0 fail.
- Phục vụ: E1, E2, E3, E4 · independent: false

## Task 2 — Răng đo của hồ sơ

- Files: `_acceptance/to-chuc-chi-tiet-cho-url/rang/{cau-hinh,cay,chay,cho-truoc-doc,khang-dinh,tre-url,on-dinh}.mjs`, bốn khoá `tcu_*` trong `_acceptance/config.yaml`
- Verify: chạy từng răng → thoát 0, và mỗi răng in đủ các dòng chiều đỏ của nó (E1: 6, E2: 7, E3: đối chứng neo đỏ đúng ba ca, E4: đối chứng neo ≥ 1 lượt đỏ).
- Phục vụ: E1–E4 · independent: false (đọc tệp của Task 1)

## Task 3 — Đo tay dưới tải

- Dưới khoá `s4`: lặp tệp (`--rerun-each 20`) song song với `bun run test` toàn kho, ghi số lượt và số đỏ vào `_acceptance/to-chuc-chi-tiet-cho-url/evidence/do-duoi-tai.md`.
- Phục vụ: vế «dưới tải» của đề bài (sổ quyết định, descope số 5) · independent: false
