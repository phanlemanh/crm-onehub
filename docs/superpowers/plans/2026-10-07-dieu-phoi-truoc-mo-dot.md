# dieu-phoi-truoc-mo-dot Implementation Plan

> Thực thi tuần tự trong phiên chính (feature-loop T2). Steps dùng checkbox.

**Goal:** Gỡ ba lỗ còn lại của bộ điều phối trước khi mở đợt sau-14-10.

**Architecture:** `scripts/dieu-phoi/` (không phụ thuộc gói, `node --test`) và `.githooks/pre-push`. Răng đo ở `_acceptance/dieu-phoi-truoc-mo-dot/rang/`.

**Spec:** `docs/superpowers/specs/2026-10-07-dieu-phoi-truoc-mo-dot-design.md` · hợp đồng `_acceptance/dieu-phoi-truoc-mo-dot/contract.md` · evals `_acceptance/dieu-phoi-truoc-mo-dot/evals.yaml`.

## Global Constraints

- Không chú thích trong mã; không chữ `crm`, `onehub`, `/Users/` dưới `scripts/dieu-phoi/` ngoài `test/`; hằng thời gian chỉ ở `cau-hinh.mjs`.
- Giữ nguyên mọi mốc đột biến của `dieu-phoi-hai-tang`, `dieu-phoi-va-bien` và các dòng mà răng `git-sach`, `cong` của `dieu-phoi-va-bien` neo vào `.githooks/pre-push`.
- Răng chạy git trong thư mục tạm luôn dùng môi trường đã gỡ `GIT_*`.

## Review Focus

1. Tệp trả lời là mảng hoặc `null` (JSON hợp lệ nhưng không phải object) → cách ly, không ném.
2. Hai yêu cầu gia hạn, chỉ một tệp trả lời hỏng → yêu cầu kia vẫn được áp trong cùng nhịp.
3. Pre-push gọi khi `$0` là đường tương đối hoặc qua symlink → so `realpath` vẫn đúng, không lặp.
4. Lệnh gốc rỗng hoặc chỉ khoảng trắng → hook không bao giờ chặn (không phải lệnh nặng), không ảnh hưởng.
5. README liệt kê khoá với dấu chấm cuối dòng hay backtick → răng đọc tập khoá không bị lệch vì dấu câu.

---

### Task 1: Tệp trả lời hỏng không làm đứng nhịp (AC-1, AC-2, AC-3)

**Files:** Modify `scripts/dieu-phoi/hinh-dang.mjs`, `scripts/dieu-phoi/phat-lich.mjs`; create `scripts/dieu-phoi/test/tra-loi.test.mjs`.
**Interfaces — Produces:** `KHOA_TRA_LOI` (mảng khoá cho phép), `kiemTraLoi(du)` (ném `Error('<trường> …')`), `docTraLoi(thuMuc, ten)` trong `phat-lich.mjs` (trả object hoặc `null`; tệp hỏng → `tra-loi/hong/<ten>.json` + sự kiện `tra-loi-hong`).
**Verify:** `node --test scripts/dieu-phoi/test/tra-loi.test.mjs` + `bun run test:dieu-phoi`. **Evals:** E1, E2, E3. **independent:** false.

- [ ] Viết test (ba ca của E1–E3 + Review Focus 1, 2) → đỏ.
- [ ] Cài `KHOA_TRA_LOI`, `kiemTraLoi`, `docTraLoi`; thay dòng đọc thô trong `apGiaHan` → xanh; commit.

### Task 2: Dòng lệnh bọc chạy được với mọi dạng lệnh (AC-4)

**Files:** Modify `scripts/dieu-phoi/hook-chan-s4.mjs`; test `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`.
**Verify:** `node --test scripts/dieu-phoi/test/hook-chan-s4.test.mjs`. **Evals:** E4. **independent:** false.

- [ ] Ca ma trận bảy dạng chạy thật bằng bash → đỏ ở dạng tiền tố biến.
- [ ] Bỏ `=` khỏi `KY_TU_AN_TOAN` → xanh; ca cũ «giữ khoá mà chạy nền…» vẫn xanh; commit.

### Task 3: Pre-push chạy cổng của chính cây đang đẩy (AC-5)

**Files:** Modify `.githooks/pre-push`; create `_acceptance/dieu-phoi-truoc-mo-dot/rang/hook-cay.mjs`.
**Verify:** `node _acceptance/dieu-phoi-truoc-mo-dot/rang/hook-cay.mjs` + `node _acceptance/dieu-phoi-va-bien/rang/git-sach.mjs` + `bun _acceptance/dieu-phoi-va-bien/rang/cong.mjs`. **Evals:** E5, E9, E10. **independent:** false.

- [ ] Viết răng bốn ca + hai chiều đỏ → đỏ trên pre-push hiện tại.
- [ ] Thêm khối chuyển hook ngay sau nhánh `CRM_SKIP_HOOKS` → xanh; hai răng của vòng trước vẫn xanh; commit.

### Task 4: Tài liệu, bộ đột biến, hồi quy (AC-6, AC-7)

**Files:** Modify `scripts/dieu-phoi/README.md`; create `_acceptance/dieu-phoi-truoc-mo-dot/rang/readme-khoa.mjs`, `rang/dot-bien.mjs`.
**Verify:** cả hai răng mới + `bun run test:dieu-phoi` + bộ đột biến hai vòng trước + `ranh-gioi.mjs`. **Evals:** E6–E8, E11–E14. **independent:** false.

- [ ] README mục «Trong đợt»: tệp trả lời hỏng → `tra-loi/hong/` + `tra-loi-hong`, yêu cầu coi như chưa trả lời, ghi lại tệp đúng; dòng «Khoá hợp lệ của tệp trả lời:».
- [ ] `readme-khoa.mjs` so tập khoá với `KHOA_TRA_LOI`, có chiều đỏ.
- [ ] `dot-bien.mjs` T1–T6; chạy mọi lệnh verify → xanh; commit.
