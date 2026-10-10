# thuoc-khong-tu-het-han — kế hoạch thi công

> Thực thi: Native, tuần tự trong vòng chính (feature-loop S3). Các bước dùng ô `- [ ]`.

**Goal:** sửa paths chết của 20 eval/14 hồ sơ đã ký, neo E7 và E10 vào cặp sha gộp, kiểm kê phần còn lại — mọi phép đo của vòng neo sha cố định.

**Architecture:** một module chung `rang/neo.mjs` (mốc gốc `a9e8bc75a`, mốc neo = commit gộp của vòng trên dãy cha-đầu `origin/onehub` nếu có, không thì `HEAD`; đọc tệp và danh sách tệp tại một sha bằng `git show`/`git ls-tree`). Danh sách 20 eval ghim ở `rang/danh-sach.json`. Mọi eval đọc vật tại sha, không đọc cây làm việc.

**Tech Stack:** Node ≥ 24, `node:test` không dùng — mỗi `rang/*.mjs` là thước tự có đối chứng, `globToRe` của bộ kit giải qua `resolve-plugin.mjs`, `lib/eval-yaml.cjs` của kho.

**Spec:** `design.md`, `contract.md`, `evals.yaml` (đã duyệt Cổng 1 09/10).

## Global Constraints

- Không chú thích trong mã.
- Sửa `evals.yaml` của hồ sơ đã ký: chỉ dòng `paths` (luật 34), trừ E7/E10 đổi `expected` theo AC-6.
- Đường dẫn suy từ `import.meta.dirname`; không hardcode gốc kho.
- Mốc gốc `a9e8bc75a`; PR #168 = `9dc1a037c`; PR #187 = `52e00cad2`.
- Ranh giới: `_acceptance/thuoc-khong-tu-het-han/**`, 14 hồ sơ của danh sách (chỉ `evals.yaml`), `_acceptance/ha-tran-thang-hoi-zalo/**`, `_acceptance/slack-thieu-quyen-email/**`, `_acceptance/config.yaml` (chỉ thêm `tkh_*`).

## Review Focus

1. Glob chết mà tệp đã xoá hẳn và không có chỗ mới — bỏ glob, eval còn glob khác; eval mất hết glob → báo, không bịa.
2. Glob ký tự đại diện (`tai-lieu-suc-khoe*.ts`) — tìm tệp thật khớp tiền tố trước khi kết luận chết.
3. Mốc neo khi vòng chưa gộp và khi đã gộp — `neo.mjs` phải cho cùng kết quả ở cả hai (ca thử bằng sha giả lập).
4. Clone `--shared` tạm phải dọn kể cả khi thước thoát giữa chừng (`try/finally`, không `process.exit` trong `try`).
5. Đọc `evals.yaml` tại sha bằng `git show <sha>:<tệp>` — tệp chưa có ở sha → lỗi có tên, không coi là rỗng.

---

### Task 1: Danh sách 20 eval và quyết định từng glob
**Files:** Create `rang/danh-sach.json` (hồ sơ, eval, glob cũ, glob mới hoặc `bo`, lý do).
**Verify:** `node -e` đọc JSON: 20 mục, 14 hồ sơ, khớp đúng 20 cặp của bản quét bằng `globToRe` ở `a9e8bc75a`.
**Phục vụ:** E1, E2. **independent:** false.

### Task 2: `neo.mjs` + E1 `paths-chet.mjs` + E2 `chi-paths.mjs`
**Files:** Create `rang/neo.mjs`, `rang/paths-chet.mjs`, `rang/chi-paths.mjs`.
**Verify:** trước khi sửa paths: E1 đỏ đúng 20 eval (đối chứng âm trên cây thật), đối chứng dương ở `a9e8bc75a` ra đúng 20; E2 đỏ «paths khong doi». Sau Task 5: cả hai xanh. Phá-thử từng chiều trong bản sao.
**Phục vụ:** E1, E2. **independent:** false.

### Task 3: Neo E7 và E10 + `hai-thuoc.mjs`
**Files:** Modify `_acceptance/ha-tran-thang-hoi-zalo/rang/khong-cham-da-ky.mjs`, `_acceptance/ha-tran-thang-hoi-zalo/evals.yaml` (E7 `expected`), `_acceptance/slack-thieu-quyen-email/rang/khong-sua-tep-hang.mjs`, `_acceptance/slack-thieu-quyen-email/evals.yaml` (E10 `expected`). Create `rang/hai-thuoc.mjs`.
**Verify:** `node rang/hai-thuoc.mjs --e7` và `--e10` thoát 0; bản cũ trên cây tạm thoát 1 đúng thông điệp.
**Phục vụ:** E3, E4. **independent:** false.

### Task 4: Kiểm kê
**Files:** Create `rang/kiem-ke.mjs`, `rang/mau-moc-troi/*` (mười tệp mẫu), `kiem-ke.md`.
**Verify:** `node rang/kiem-ke.mjs` thoát 0; sửa một số trong bản sao `kiem-ke.md` → thoát 1 gọi tên dòng.
**Phục vụ:** E5. **independent:** false.

### Task 5: Sửa paths 20 eval, khoá config, trạng thái
**Files:** Modify 14 `evals.yaml` (chỉ `paths`), `_acceptance/config.yaml` (thêm 5 khoá `tkh_*`).
**Verify:** E1–E5 xanh; `bun run lint:slop`; contract `status: implemented`.
**Phục vụ:** E1–E5. **independent:** false.
