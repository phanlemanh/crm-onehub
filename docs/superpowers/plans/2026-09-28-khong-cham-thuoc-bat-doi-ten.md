# Thước «không chạm thước đã ký» bắt được đổi tên — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thước `khong-cham-thuoc.mjs` của hồ sơ `bo-chu-lap-keo-tha` đỏ khi một tệp đã ký bị đổi tên hoặc dời ra khỏi vùng cấm.

**Architecture:** Thêm `--no-renames` vào hai lời gọi `git diff` của thước. Phép đo mới `doi-ten.mjs` dựng worktree tạm từ HEAD, tạo từng tình huống rồi chạy chính thước trong đó.

**Tech Stack:** Node (chỉ thư viện chuẩn), git worktree.

**Spec:** `docs/superpowers/specs/2026-09-28-khong-cham-thuoc-bat-doi-ten-design.md` · hợp đồng `_acceptance/khong-cham-thuoc-bat-doi-ten/contract.md`

## Global Constraints

- Không chú thích trong mã.
- Không sửa evals, hợp đồng hay bằng chứng đã ký của `bo-chu-lap-keo-tha`; chỉ phần ghim lại do `repin-lane.mjs` sinh.
- Thước đo bản ĐÃ COMMIT (worktree tạm từ HEAD): commit trước khi chạy phép đo.
- Ghim lại `bo-chu-lap-keo-tha` là bước cuối, ở đỉnh nhánh, sau khi gộp `origin/onehub`.

## Review Focus

- Máy không có cấu hình git toàn cục → commit trong worktree hỏng; phép đo phải ra mã 2, không «lệch».
- Ba eval chạy song song ở S4 → worktree phải riêng từng lượt, không xoá của nhau, không sót đăng ký.
- Gỡ cờ làm vỡ cú pháp thước → chiều đỏ phải báo «HONG DOT BIEN», không «DO DUNG GHIM».
- Thước in danh sách bị chạm có cả đường mới lẫn cũ → khẳng định xanh so đúng [đường cũ], không «có chứa».
- Sau khi gộp vào `onehub`, điểm rẽ trùng HEAD → C4 vẫn xanh, E4 vẫn xanh.

---

### Task 1: Phép đo đổi tên, rồi vá thước (E1, E2, E3)

`independent: false`

**Files:**
- Create: `_acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs`
- Modify: `_acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs:49,59`

- [ ] **Step 1:** Commit `doi-ten.mjs` (thước còn bản cũ). Chạy `node _acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs` → C1, C2, C3 «lệch» (thước mã 0), C4, C5, C6 «dat»; mã 1.
- [ ] **Step 2:** Thêm `"--no-renames", ` vào hai lời gọi `git diff`, định dạng bằng biome, commit.
- [ ] **Step 3:** Chạy lại → sáu ca «dat», mã 0. `--chieu-do` → «thuoc bo sot doi ten: C1..C3», «chieu do: DO DUNG GHIM», mã 0.
- [ ] **Step 4:** Chiều đỏ của E3: bản sao `doi-ten.mjs` đổi C4 thành mong mã 1 → «C4: lech», mã 1.
- [ ] **Step 5:** Chạy song song ba lệnh `kct_*` với `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1`; cả ba mã 0; `git worktree list` trước = sau.
- [ ] **Step 6:** `node _acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs` → mã 0 (E4).

### Task 2: Năm lệnh chứng và ghim lại hồ sơ gốc

`independent: false`

- [ ] **Step 1:** `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → mã 0.
- [ ] **Step 2:** contract `status: implemented`, vẽ lại bản đồ, commit; S4.
- [ ] **Step 3 (sau Cổng Bằng chứng):** gộp `origin/onehub`, `repin-lane.mjs --slug bo-chu-lap-keo-tha --reason "vá --no-renames ở thước khong-cham-thuoc" --write`, `pre-merge-check.sh --base origin/onehub` không `--slug`.
