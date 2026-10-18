---
slug: ve-sinh-do-san-onehub
at: 2026-10-15T21:56:45.644Z
sha: f46c0bbda445631d9bb8e9dbb170e92948906140
nen: do
cong_cu: xanh
suite: do
luoi: xanh
engine: do
---

## Dòng đỏ

- nen suite: DO SAN executors.test.suite_okr_goi ma 1
- nen suite: DO SAN executors.script.build_khong_cache ma 1
- nen engine: LECH scripts/pre-merge-check.sh (vendored ≠ dang-chay)
- nen engine: LECH scripts/product-map.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/khong-can-nguoi.mjs (vendored ≠ dang-chay)
- nen engine: LECH lib/out-of-contract.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/ho-so-tom-tat.cjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/tin-hieu.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/cat-luot.mjs (vendored ≠ dang-chay)
- nen engine: LECH scripts/co-hop-dong.cjs (vendored ≠ dang-chay)

## Đọc dòng đỏ (máy, 2026-10-15T22:05Z)

Đường nền chạy trong một `git worktree add --detach` tạm ở `f46c0bbda` (cây làm việc của vòng đã có cherry-pick),
`node_modules` symlink về cây thật. Hai chân suite đỏ là tạo tác của cách dựng đó, không phải đỏ sẵn của onehub:

- `build_khong_cache` mã 1: `TurbopackInternalError: Symlink [project]/apps/app/node_modules is invalid, it points out
  of the filesystem root` — Turbopack từ chối `node_modules` là symlink ra ngoài gốc dự án. Chân build chạy lại trong
  suite của S4 trên cây thật.
- `suite_okr_goi` mã 1: duy nhất `@crm/validation` › `l4-luat > mucTinCanChinh: ba mức, và một hàm duy nhất` —
  bài so đồng nhất hàm (`mucTinApi !== mucTinCanChinh`) qua hai đường import; symlink làm hai đường thành hai bản
  module. Chạy lại `bun test test/ly-do-can-chinh.spec.ts` ở cây thật: 3 pass, 0 fail.
- `engine` LECH: tệp vendored của kit trong kho lệch bản đang chạy 2.30.0 — đã biết (Điều phối M5), «không đọc được ở
  đây»; không chặn.
