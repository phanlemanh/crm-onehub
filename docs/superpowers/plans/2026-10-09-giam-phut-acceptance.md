# Giảm phút Acceptance — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `acceptance.yml` thôi chạy test agent-okr khi push, huỷ lượt cũ của PR, gộp ba job nhỏ thành một mà PR vẫn chạy đủ lệnh kiểm cũ.

**Architecture:** Một tệp workflow đổi; năm script đo trong `_acceptance/giam-phut-acceptance/rang/` dùng chung một bộ đánh giá luồng (`luong.mjs`) để biết job và bước nào chạy với mỗi sự kiện.

**Tech Stack:** GitHub Actions YAML, Bun (`Bun.YAML`), `gh api`, git.

**Spec:** `_acceptance/giam-phut-acceptance/design.md`, hợp đồng `_acceptance/giam-phut-acceptance/contract.md` (duyệt 16:33Z).

## Global Constraints

- Ranh giới tệp: `.github/workflows/acceptance.yml`, `_acceptance/giam-phut-acceptance/**`, `_acceptance/config.yaml` (chỉ thêm khoá), `PRODUCT-MAP.md`, `LO-TRINH.html`, tệp kế hoạch này.
- Không chú thích trong mã. Script đo đọc YAML bằng `Bun.YAML`, gốc kho suy từ `import.meta.dirname`.
- Tên hiển thị của job gộp: «acceptance gate». Không chạm `ci.yml`.
- Không sửa thước nào của hồ sơ đã ký.

## Review Focus

- Phép đo văn bản của hồ sơ đã ký: `luat-kho-vong-doi/rang/ci.mjs` xoá dòng `      - run: node scripts/luat-kho/do-cay.mjs --du-luat\n` và bỏ `env.DATABASE_URL` bằng regex neo ở `\n  luat-kho:`; `dieu-phoi-va-bien/rang/cong.mjs` xoá dòng `      - run: bun run test:dieu-phoi\n`. Bản sao sau khi xoá phải còn là YAML hợp lệ — Task 1 bước 3.
- Hai push gộp sát nhau lên `onehub` không được huỷ hay bỏ chờ nhau — Task 2 (ô d của E1).
- Biểu thức GitHub lạ trong `if` phải làm script đo thoát 2, không đoán — Task 2.
- Lượt bị huỷ không được kéo trung vị phút — Task 4.
- `onehub` không có luật nhánh: 404 «Branch not protected» là trạng thái hợp lệ, không phải lỗi — Task 5.

---

### Task 1: Sửa `acceptance.yml`

**Files:** Modify: `.github/workflows/acceptance.yml` · **Evals:** E1, E2, E3 · **independent:** false

Khuôn job gộp — khoá `luat-kho` (để regex của `luat-kho-vong-doi` neo được), tên «acceptance gate», `env` mở đầu bằng `DATABASE_URL`, thứ tự bước: checkout (`fetch-depth: 0`) → setup-node 24 → setup-bun → `bun install --frozen-lockfile` → luật kho (không `if`) → `test:dieu-phoi` → Product map → Pre-merge check; ba bước sau luật kho có `if: ${{ !cancelled() }}` ở dòng SAU dòng `- run:` (hoặc sau `name:`). Bước điều phối đứng ngay sau luật kho: khi phép đo của `dieu-phoi-va-bien` xoá dòng `- run:` của nó, dòng `if:` còn lại gắn vào bước luật kho (chưa có `if`), YAML vẫn hợp lệ.

- [ ] Bước 1: thêm khối `concurrency` cấp workflow (`group: acceptance-${{ github.event.pull_request.number || github.sha }}`, `cancel-in-progress: ${{ github.event_name == 'pull_request' }}`).
- [ ] Bước 2: thay ba job `acceptance`, `dieu-phoi`, `luat-kho` bằng job gộp; thêm `if: github.event_name == 'pull_request'` vào `agent-okr-node24`; `build` giữ nguyên.
- [ ] Bước 3: chạy năm script đã ký: `bun _acceptance/luat-kho-vong-doi/rang/ci.mjs`, `bun _acceptance/dieu-phoi-va-bien/rang/cong.mjs`, `bun _acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs`, `bun _acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs khong-noi-tran`, `node _acceptance/sua-paths-e5-soan-okr/rang/loc-paths.mjs --phan chon` — tất cả thoát 0, mọi chiều đỏ «DO dung cho».
- [ ] Bước 4: commit.

### Task 2: `luong.mjs` + E1 `hinh.mjs`

**Files:** Create: `_acceptance/giam-phut-acceptance/rang/luong.mjs`, `rang/hinh.mjs`; Modify: `_acceptance/config.yaml` (thêm `gpa_hinh`) · **Evals:** E1 · **independent:** false (Task 3 dùng `luong.mjs`)

**Interfaces — `luong.mjs` (produces):**
- `danhGia(bieuThuc: string, nc: NguCanh): unknown` — bỏ `${{ }}`, nhận `github.event_name`, `github.event.pull_request.number`, `github.sha`, `github.ref`, chuỗi `'…'`, `==`, `||`, `!cancelled()`, `cancelled()`, `success()`, `always()`; lạ → `throw new BieuThucLa(...)`.
- `NguCanh = { event: "pull_request"|"push", nhanh: string, pr: number|null, sha: string, huy?: boolean }`.
- `kichHoat(wf, nc): boolean` — khối `on:` có kích hoạt ngữ cảnh không.
- `jobChay(job, nc): boolean`, `buocChay(buoc, nc): boolean` (vắng `if` → bước chạy khi các bước trước xanh).
- `lenhChay(wf, nc): { job: string, run: string }[]`.
- `docBanGoc(goc): object` — YAML của `acceptance.yml` ở `git merge-base HEAD origin/onehub`.

- [ ] Bước 1: viết `luong.mjs`, `hinh.mjs` với hàm `kiemHinh(wf, goc) → string[]` (ô a–d của E1) và năm chiều đỏ trên bản sao đối tượng (`structuredClone`) ghi YAML vào `.acceptance-runs/giam-phut-acceptance/`.
- [ ] Bước 2: chạy trên `acceptance.yml` của merge-base (trước Task 1) — phải đỏ ở ô a/b/c/d; chạy trên HEAD — xanh, năm dòng «BAT».
- [ ] Bước 3: commit.

### Task 3: E2 `khong-mat-lenh.mjs`

**Files:** Create: `rang/khong-mat-lenh.mjs`; Modify: `_acceptance/config.yaml` (`gpa_khong_mat_lenh`) · **Evals:** E2 · **independent:** false

- [ ] Bước 1: hai lớp lệnh (CHUẨN BỊ = bắt đầu `bun install`; KIỂM = còn lại); ba ngữ cảnh `pull_request`, push `onehub`, push `release`; so `on:`; PR so đa tập lớp KIỂM, tập lớp CHUẨN BỊ; push so đa tập lớp KIỂM với job merge-base trừ `agent-okr-node24`; năm chiều đỏ.
- [ ] Bước 2: chạy — xanh trên HEAD, đỏ khi so merge-base với chính nó đã xoá push.
- [ ] Bước 3: commit.

### Task 4: E4 `do-phut.mjs`

**Files:** Create: `rang/do-phut.mjs`; Modify: config (`gpa_do_phut`) · **Evals:** E4 · **independent:** true

- [ ] Bước 1: `gh api --paginate` lượt workflow `acceptance.yml` trong cửa sổ; jobs từng lượt; `phutCuaJob(ms) = Math.ceil(ms/60000)`; job `skipped` → 0; lượt `cancelled` đếm riêng; ngưỡng đọc từ dòng SỐNG của `opportunity.md`; `--du-lieu` cho dữ liệu giả; kiểm hàm làm tròn bằng bản sao dùng `Math.round`.
- [ ] Bước 2: chạy `--tu 2026-10-02 --ngay 7` — trung vị push > 8, các chiều đỏ bắt.
- [ ] Bước 3: commit.

### Task 5: E5 `nen-gop.mjs` + E3 `ho-so-cu.mjs`

**Files:** Create: `rang/nen-gop.mjs`, `rang/ho-so-cu.mjs`; Modify: config (`gpa_nen_gop`, `gpa_ho_so_cu`) · **Evals:** E3, E5 · **independent:** true

- [ ] Bước 1: `nen-gop.mjs` — rules + protection của `onehub` (404 = không có), tập check bắt buộc ⊆ tên job chạy khi PR; dòng thông tin số commit gộp lệch cây 7 ngày; `--rules` dữ liệu giả.
- [ ] Bước 2: `ho-so-cu.mjs` — rút hồ sơ đã ký có eval script chạm `acceptance.yml`, giải lệnh qua config, bỏ `hld_build_heap`, chạy từng lệnh; chiều đỏ trên bản `git archive` có job `luat-kho` mang `if`.
- [ ] Bước 3: chạy cả hai — xanh; commit.
