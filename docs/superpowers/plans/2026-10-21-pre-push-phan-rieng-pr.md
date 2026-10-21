# Kế hoạch thi công — pre-push-phan-rieng-pr

Hợp đồng `_acceptance/pre-push-phan-rieng-pr/contract.md` (duyệt 21/10, Manh Phan). Design doc
`docs/superpowers/specs/2026-10-21-pre-push-phan-rieng-pr-design.md`. Các task chạy tuần tự: task sau dùng mã của
task trước.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Lần đẩy chỉ mang mã onehub đi nhẹ, có dòng nói vì sao | `scripts/pre-push-t1.mjs` | AC-1 (tập xét), AC-2 (dòng stderr), AC-3 (luật cũ giữ nguyên) |
| Bài kiểm có 16 ca gộp, 4 ca dòng chữ, 3 ca đẩy thật | `packages/ui/test/pre-push-t1.spec.ts` | AC-1, AC-2, AC-4 (hook trong kho tạm) |
| Bản khai cổng giải thích đúng luật mới | `.githooks/gate-shape.json` | AC-8 (khai không nói sai) |
| Hồ sơ cũ ghi lời hứa ca 6 đã đổi | `_acceptance/pre-push-t1/` | AC-7 (lời hứa đã ký) |
| Có bằng chứng trên cây thật và lịch sử thật | `_acceptance/pre-push-phan-rieng-pr/rang/` | AC-5, AC-6, AC-7, AC-9 |

## Task 1 — bộ phân loại

- Files: `scripts/pre-push-t1.mjs`.
- `tepDay` trả `{ tep, cuaNen }`: với dòng có sha từ xa dùng được và có `<remote>/onehub`, tính `nền`, `tăng`,
  `riêng_sau`, `riêng_trước`, `S`; tệp của onehub = tăng − S, trừ mọi tệp thuộc tập xét của dòng khác.
- Một hàm diff duy nhất mang `"--no-renames", ` (neo đột biến `bo-no-renames` của `pre-push-t1`).
- `phanLoaiDay`: tập xét rỗng mà có tệp của onehub → `lyDo: "chi-cua-nen"`, bỏ `t1Only.skip`; giữ nguyên dòng
  `return { boQua: kq.nang ? [] : boQua, tep, lyDo: kq.lyDo };` và `const kq = quyetDinh({ ...NHU_PR_SAN_SANG, tep,
  laT1: (t) => t1.has(t) });`.
- `chay`: ba khuôn dòng stderr khi có tệp của onehub; không có thì như cũ từng byte.
- Verify: `cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t phan-loai`.
- Phục vụ E1, E2, E3. `independent: false`.

## Task 2 — bài kiểm

- Files: `packages/ui/test/pre-push-t1.spec.ts`.
- Ca 6 của mảng `CA`: kỳ vọng mới (`test build`, dòng «rỗng» k=1). Thêm `CA_GOP` 16 ca G1–G16, đếm = 16; describe
  `dong-gop` 4 ca; `day-gop` 3 ca; `hinh-gop`.
- Verify: `bun test … -t "gop-onehub|dong-gop|day-gop|hinh-gop|phan-loai"`.
- Phục vụ E1–E4, E8. `independent: false`.

## Task 3 — bản khai và hồ sơ cũ

- Files: `.githooks/gate-shape.json` (`t1Only.vi_sao`), `_acceptance/pre-push-t1/evals.yaml` (dòng 6 của E1),
  `_acceptance/pre-push-t1/contract.md` (Notes).
- Verify: `-t hinh-gop`, `-t khai`.
- Phục vụ E7, E8, E9. `independent: false`.

## Task 4 — răng

- Files: `_acceptance/pre-push-phan-rieng-pr/rang/{day-gop-that,lich-su,ho-so-cu,dot-bien}.mjs`.
- Mỗi răng có chiều đỏ trong cùng lượt (đối chứng dương + phá thử), theo khuôn đo-mới-sinh.
- Verify: chạy từng răng, mã 0; `dot-bien` in «BAT» đủ sáu ca.
- Phục vụ E5, E6, E7, E10. `independent: false`.
