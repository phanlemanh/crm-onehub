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

### Task 4 (independent: false): chọn chế độ — song song chỉ khi `CI=true` hoặc cờ `--song-song` (AC-7)
- Không đối số, không CI, không cờ → một lượt `test-run.ts` argv rỗng, không dựng trước, không nhóm (như trước vòng này).
- Biến bật nằm ở `CHAY_TEST.batSongSong`; bộ kiểm đặt `CI` tường minh cho mọi ca CLI để không phụ thuộc máy chạy.
- Verify: ô (m) của E1 — tại chỗ 1 lượt argv rỗng, 0 dựng trước; CI=true → bốn nhóm; `--song-song 1` → bốn nhóm; phá-thử: bỏ nhánh chọn chế độ → ô (m) đỏ ghim thông điệp. Phục vụ E1.

### Task 5 (independent: true): trần chờ mỗi ca 15 s ở 11 `package.json` (AC-8) — đã làm ở S3 lượt trước (8bf0f205f)
- `CHAY_TEST.tranMoiCaMs`, `lenhThieuTran`, ô (f)(g) của `ctd-ham`. Phục vụ E1.
