# ci-test-duoi-tran Implementation Plan

**Goal:** `bun run test` chạy bốn nhóm song song, mỗi nhóm một CSDL riêng; job CI dưới 22 phút.
**Spec:** `design.md` · `contract.md` · `evals.yaml`

### Task 1 (independent: false): trình chạy `scripts/ci/test-song-song.mjs` + `cau-hinh.mjs` + bài kiểm `node --test`
- Bốn nhóm, tối đa min(số nhân, 4), nhóm dài trước; kiểm nhóm trước khi chạy; đối số → chuyển thẳng `test-run.ts`; bỏ `TEST_RUN_ID` khỏi môi trường nhóm.
- `package.json` gốc: `"test": "bun scripts/ci/test-song-song.mjs"`.
- Verify: 30/30; phá-thử (ketQua luôn 0 → 8 đỏ; bỏ kiểm nhóm → (g) đỏ; khối không xuống dòng → ô riêng đỏ; ghi rời → ô đầu ra lớn đỏ dưới bun). Phục vụ E1.

### Task 2 (independent: false): răng `chay-that.mjs`, `ci-thoi-gian.mjs`
- `chay-that`: chạy thật, đếm tóm tắt turbo TRƯỚC `verify-gate-shape` (bộ đó xoá tệp đã đọc).
- Verify: lượt 3 xanh — tường 227 s, tổng nhóm 714 s, 4 tóm tắt. `ci-thoi-gian` trả 2 khi chưa có CI. Phục vụ E2, E3.

### Task 3: PR nháp `--base onehub` để CI đo AC-6.
