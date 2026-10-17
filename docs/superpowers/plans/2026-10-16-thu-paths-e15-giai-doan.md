# thu-paths-e15-giai-doan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Khai `paths` đúng bằng tệp được đọc ở E15 của `giai-doan-thoa-thuan` và ở eval judgment của các hồ sơ không bị kéo ghim lại, kèm răng đo chứng điều đó trên đúng bộ lọc `staleByPaths` của `pre-merge-check`.

**Architecture:** Ba răng Node dưới `_acceptance/thu-paths-e15-giai-doan/rang/` gọi thẳng `lib/evidence-core.cjs` (`staleByPaths`, `evalListsOf`, `evalPathsOf`, `pathGlobToRe`, `dungCayPaths`) và `lib/eval-yaml.cjs` của kho, không chép luật. Dữ liệu sửa là chữ trong `_acceptance/*/evals.yaml`, ghi bằng chính răng `them-paths.mjs --ghi` (một nguồn với bên kiểm). Danh sách hồ sơ ở một tệp `danh-sach.txt`.

**Tech Stack:** Node 26 ESM (`.mjs`), git CLI, bash `scripts/pre-merge-check.sh`.

**Spec:** `docs/superpowers/specs/2026-10-16-thu-paths-e15-giai-doan-design.md`; hợp đồng `_acceptance/thu-paths-e15-giai-doan/contract.md` (approved 2026-10-16T05:50:40Z), `evals.yaml` (E1–E8).

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Không sửa `lib/evidence-core.cjs` hay bất kỳ tệp nào dưới `lib/` (tệp của kit).
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của đợt); khoá mới tiền tố `tpe_` dưới `executors.script`.
- `evals.yaml` của hồ sơ khác: chỉ THÊM khối `paths` (và E15 của `giai-doan-thoa-thuan` thay đúng một dòng); không đổi dòng nào khác.
- Không thêm `paths` cho eval khai `not-run`, eval không có `inputs`, eval có input không còn trong cây.
- Đường gốc kho suy từ vị trí script (`join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..")`), cho phép đè bằng `GOC_KHO`.
- Hai hồ sơ `thu-haiku-tro-ly-okr`, `ghim-thuoc-soi-xem-okr` chỉ chạm sau khi P0 gộp #436 và PR thu-haiku; không thoả luật chọn thì dừng hỏi chủ kho.

## Review Focus

- Input khai tương đối thư mục hồ sơ có tên trùng một tệp ở gốc kho (`contract.md`): bộ giải phải lấy gốc kho trước rồi mới thư mục hồ sơ, và `chi-them-paths` phải chứng paths bằng đúng quy đổi ấy — Task 1 (ca `tieng-viet-cho-crm#E12`), Task 2.
- `inputs` viết dạng dòng chảy `[a, b]` (okr-loai-hoc-tap) và dạng khối: chèn `paths` phải đứng sau trọn khối inputs, cùng thụt — Task 1 bước kiểm đọc lại bằng `evalListsOf` sau khi chèn.
- Tên tệp có `[slug]`, `(app)`: glob coi ngoặc là chữ thường (đã đo: `pathGlobToRe` thoát `[`); ma trận E1 chạy trên tệp thật dưới `(app)/[slug]` — Task 1.
- Worktree tạm của `dot-bien` và `pmc-truoc-sau` bị ngắt giữa chừng: phải gỡ (`git worktree remove --force` trong `finally` và trên SIGINT/SIGTERM) — Task 3, Task 4.
- `onehub` dời giữa lúc dựng: danh sách tính lại sau mỗi lần gộp `origin/onehub`; E3 `--kiem-danh-sach` bắt lệch — Task 5.

---

### Task 1: Răng `them-paths.mjs` và `hoa-cu-theo-paths.mjs`, khoá `tpe_*`

`independent: false` · phục vụ E1, E2, E3, E5, E6

**Files:**
- Create: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs` (từ bản mẫu scratchpad `f31/them-paths.mjs`)
- Create: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs` (từ bản mẫu `f31/hoa-cu-theo-paths.mjs`)
- Modify: `_acceptance/config.yaml` — thêm dưới `executors.script`:

```yaml
    tpe_e15: "node _acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs --ho-so giai-doan-thoa-thuan --chi-eval E15 --ma-tran-chu"
    tpe_gd: "node _acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs --ho-so giai-doan-thoa-thuan --gia-dinh apps/app/lib/messages/tin-hieu.ts=bo,apps/app/lib/messages/settings.ts=giu"
    tpe_kiem: "node _acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs --kiem --ho-so @_acceptance/thu-paths-e15-giai-doan/danh-sach.txt --phai-co thu-haiku-tro-ly-okr,ghim-thuoc-soi-xem-okr --kiem-danh-sach"
    tpe_sach: "node _acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs --ho-so @_acceptance/thu-paths-e15-giai-doan/danh-sach.txt"
    tpe_bo_qua: "node _acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs --kiem-bo-qua okr-loai-hoc-tap#E14=input-vang,chu-mac-dinh-thu-vien-ngoai#E10=khong-co-inputs,dieu-phoi-hai-tang#E22=khai-not-run"
```

**Interfaces:**
- Produces (them-paths.mjs, export): `lapKeHoach(coTep?: Set<string>) → Array<{slug,id,tep,loai:"them"|"da-co"|"lech"|"bo-qua",muonCo?,paths?,lech?,ly_do?}>`; `chenPaths(chu: string, id: string, paths: string[]) → string`.
- Produces (hoa-cu-theo-paths.mjs, export): `hoaCuHoSo(slug: string) → {slug, vc: string|null, apply: boolean, reason: string|null, kept: string[], files: string[]}`; `tepDoiTuPin(vc: string) → string[]` (trừ `_acceptance/` và `t1_skip_globs`).
- CLI chung: `--ho-so a,b` hoặc `--ho-so @<tệp>` (mỗi dòng một slug, bỏ dòng trống và `#`).

- [ ] **Step 1:** Chép hai răng từ scratchpad vào `rang/`; bọc CLI của `hoa-cu-theo-paths.mjs` bằng `if (process.argv[1] === fileURLToPath(import.meta.url))`, tách `hoaCuHoSo`/`tepDoiTuPin` thành export.
- [ ] **Step 2:** Thêm `--ho-so @<tệp>` cho cả hai răng.
- [ ] **Step 3:** `hoa-cu-theo-paths.mjs --chi-eval <id>`: ở chế độ `--gia-dinh`, chỉ xét glob của eval đó (`L.evalPathsOf` + `L.pathGlobToRe`), không gọi `staleByPaths`.
- [ ] **Step 4:** `--ma-tran-chu` (đi cùng `--chi-eval`): tập phải giữ = mọi tên `x` trong `@/lib/messages/<x>` ở tệp `git ls-files` dưới `apps/app/app/(app)/[slug]/settings/giai-doan/` và `apps/app/app/(app)/[slug]/deals/`; lặp mọi `git ls-files apps/app/lib/messages/*.ts`; in `GIU <tệp>: <id>:<glob>` / `BO_QUA <tệp>` / `SAI_LOP <tệp>: mong <a>, thay <b>`; dòng cuối `ma tran: <n> tep · giu <k> · bo <n-k> · sai <s>`; tập suy rỗng hay `n < 20` → mã 2.
- [ ] **Step 5:** `them-paths.mjs --phai-co a,b` (in `CO_TEN`/`KHONG_CO_TEN`), `--kiem-danh-sach` (tính luật: với mỗi hồ sơ có eval `them`, chèn trong bộ nhớ rồi `staleByPaths` với tệp đổi từ pin qua `tepDoiTuPin`; chưa ghim hoặc `kept` rỗng → thuộc luật; so với danh sách, in `THIEU_TRONG_DANH_SACH`/`THUA_TRONG_DANH_SACH`), `--kiem-bo-qua <slug#id=lý do,...>` (in `BO_QUA`/`KHONG_BO_QUA <slug#id>: <loai> <ly_do>`); `--kiem` chỉ đỏ ở eval của hồ sơ trong danh sách.
- [ ] **Step 6:** Thêm năm khoá `tpe_*` vào `config.yaml` (chỉ thêm dòng).
- [ ] **Step 7: Chạy trên cây chưa sửa, phải đỏ đúng chỗ**

Run (lệnh của khoá `tpe_e15`, `tpe_bo_qua`):
`node _acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs --ho-so giai-doan-thoa-thuan --chi-eval E15 --ma-tran-chu`
Expected: mã 1, có `SAI_LOP apps/app/lib/messages/tin-hieu.ts: mong bo, thay giu`, `giu 3`.
`node _acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs --kiem-bo-qua okr-loai-hoc-tap#E14=input-vang,chu-mac-dinh-thu-vien-ngoai#E10=khong-co-inputs,dieu-phoi-hai-tang#E22=khai-not-run`
Expected: mã 0, ba dòng `BO_QUA`.
- [ ] **Step 8:** `bun run lint:slop` (răng mới nằm dưới `_acceptance/`), commit `feat(thu-paths-e15-giai-doan): răng them-paths, hoa-cu-theo-paths và khoá tpe_*`.

### Task 2: Răng `chi-them-paths.mjs` (E4)

`independent: true` · phục vụ E4

**Files:**
- Create: `_acceptance/thu-paths-e15-giai-doan/rang/chi-them-paths.mjs`
- Modify: `_acceptance/config.yaml` (thêm `tpe_chi_them: "node _acceptance/thu-paths-e15-giai-doan/rang/chi-them-paths.mjs --ho-so @_acceptance/thu-paths-e15-giai-doan/danh-sach.txt"`)

**Interfaces:**
- Consumes: `lapKeHoach`-style giải input (dùng lại `giaiInput` export từ `them-paths.mjs`; export thêm nó ở Task 1 bước 1).
- Produces: CLI; mã 0/1/2.

- [ ] **Step 1:** Lấy `mb = git merge-base HEAD origin/onehub`; `mb === HEAD` → in `da gop, khong so`, mã 0.
- [ ] **Step 2:** `git diff --name-only mb HEAD -- '_acceptance/*/evals.yaml'`: tệp thuộc `_acceptance/thu-paths-e15-giai-doan/` → miễn (in `mien: _acceptance/thu-paths-e15-giai-doan/**` một lần); tệp `giai-doan-thoa-thuan` → so riêng E15; tệp của hồ sơ trong danh sách → so; còn lại → `NGOAI_DANH_SACH <slug>`.
- [ ] **Step 3:** So theo eval: tách khối từ `- id:` tới `- id:` kế ở bản `git show mb:<tệp>` và bản HEAD; bỏ khối `paths:` (dòng `paths:` và các dòng `- ` thụt sâu hơn ngay sau nó) ở cả hai; phần còn lại khác chữ → `DOI_TRUONG <slug>#<id>`. Eval mới có paths: judgment → paths phải bằng đúng inputs quy đổi (thứ tự, không thừa không thiếu) → lệch `PATHS_KHAC_INPUTS <slug>#<id>`. E15 giai-doan: paths cũ trừ `apps/app/lib/messages/**` cộng các tệp `apps/app/lib/messages/*.ts` phải bằng paths mới → lệch `PATHS_KHAC_INPUTS giai-doan-thoa-thuan#E15`.
- [ ] **Step 4:** `git diff --name-only mb HEAD -- lib/` khác rỗng → `CHAM_LIB <tệp>`.
- [ ] **Step 5:** Dòng cuối `chi-them: <n> eval them paths · E15 doi <k> dong · <l> lech`; mã 1 khi `l > 0`.
- [ ] **Step 6:** Chạy trên nhánh hiện tại (chưa sửa dữ liệu): mã 0, `0 eval them paths`. Commit.

### Task 3: Răng `pmc-truoc-sau.mjs` (E8)

`independent: true` · phục vụ E8

**Files:**
- Create: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
- Modify: `_acceptance/config.yaml` (thêm `tpe_pmc_that: "node _acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs --ho-so @_acceptance/thu-paths-e15-giai-doan/danh-sach.txt"`)

- [ ] **Step 1:** `mb === HEAD` → `da gop, khong so`, mã 0.
- [ ] **Step 2:** `git worktree add --detach <tmp> mb` (tmp dưới `os.tmpdir()`), gỡ trong `finally` và trên SIGINT/SIGTERM bằng `git worktree remove --force`.
- [ ] **Step 3:** Chạy `bash scripts/pre-merge-check.sh <cây>` trên tmp và trên gốc kho (spawnSync, maxBuffer lớn, không quan tâm mã thoát); gom `VIOLATION \[(.+?)\]: evidence is stale` và `NOTE \[(.+?)\]: bộ lọc paths không áp \(eval-ngoai-may-thieu-paths:(\w+)\)`.
- [ ] **Step 4:** Khẳng định (a)–(d) của E8; in `pmc: truoc <a> · sau <b> · roi <...> · moi <...>`; lỗi in `VAN_HOA_CU <slug>`, `MOI_HOA_CU <slug>`, `KHONG_AP_JUDGMENT <slug>#<id>`, mã 1. Executor của eval judgment đọc từ `evals.yaml` của cây HEAD.
- [ ] **Step 5:** Commit.

### Task 4: Sửa dữ liệu — E15 và danh sách

`independent: false` · phục vụ E1, E3, E4, E5, E6

**Files:**
- Modify: `_acceptance/giai-doan-thoa-thuan/evals.yaml` (E15: dòng `- "apps/app/lib/messages/**"` → ba dòng `settings.ts`, `deals.ts`, `crm.ts`)
- Create: `_acceptance/thu-paths-e15-giai-doan/danh-sach.txt`
- Modify: `_acceptance/<7 hồ sơ>/evals.yaml` (bằng `them-paths.mjs --ghi`)

- [ ] **Step 1:** Sửa E15 bằng Edit (đúng một dòng thành ba).
- [ ] **Step 2:** Viết `danh-sach.txt` = đầu ra luật chọn (`them-paths.mjs --kiem-danh-sach` in `THIEU_TRONG_DANH_SACH` trên tệp rỗng → chép tên). Hôm nay: `ba-ho-so-do-san`, `bo-cau-hoi-mau`, `ngan-ho-so-trong-lo-trinh`, `tat-preview-agent-okr`, `cua-vao-noi-tieng-viet`, `thuoc-cua-lat-3a-co-rang`, `tieng-viet-cho-crm`.
- [ ] **Step 3:** `node _acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs --ghi --ho-so @_acceptance/thu-paths-e15-giai-doan/danh-sach.txt` → `da ghi 7 tep evals.yaml`.
- [ ] **Step 4: Xanh**: chạy năm khoá `tpe_e15`, `tpe_kiem` (chưa có hai hồ sơ P0 → `KHONG_CO_TEN` là đúng tới Task 6; tạm chạy không `--phai-co`), `tpe_chi_them`, `tpe_sach`, `tpe_bo_qua` → mã 0 (trừ `--phai-co`).
- [ ] **Step 5:** Commit `fix(thu-paths-e15-giai-doan): E15 theo tệp chữ của màn; paths = inputs cho 7 hồ sơ`.

### Task 5: Răng `dot-bien.mjs` (E7)

`independent: false` · phục vụ E7 (chiều đỏ của E1–E6, E8)

**Files:**
- Create: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
- Modify: `_acceptance/config.yaml` (thêm `tpe_dot_bien: "node _acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs"`)

- [ ] **Step 1:** Worktree tạm `--detach` tại HEAD; với mỗi cặp: chạy lệnh của eval với `GOC_KHO=<tmp>` trên bản lành (mã 0), áp đột biến (thay chuỗi gốc → chuỗi đột biến; chuỗi gốc vắng → `DOT_BIEN_LECH`, mã 2), với cặp cần diff thì `git -C tmp commit -qam`, chạy lại, so mã và dòng ghim, `git -C tmp reset --hard HEAD@{…}`/checkout về HEAD gốc trước cặp kế.
- [ ] **Step 2:** Bảng cặp đúng như «CHIỀU ĐỎ» của E1, E2, E3, E4, E5, E6, E8 trong `evals.yaml` (E2 cặp E17 chạy sau khi #427 có trên cây; trước đó cặp E2 in `CHO_F23` và không tính). E8 trong worktree tạm chạy `pmc-truoc-sau.mjs` với merge-base của cây tạm.
- [ ] **Step 3:** Ghi `git status --porcelain -- <các tệp đột biến>` của cây chính trước/sau, khác → mã 1.
- [ ] **Step 4:** Chạy, mọi cặp «bat». Commit.

### Task 6: Gộp onehub khi #427, #436, PR thu-haiku đã lên; thêm hai hồ sơ

`independent: false` · phục vụ E2, E3 (`--phai-co`), E5, E8

- [ ] **Step 1:** Chờ ba PR lên `onehub` (kiểm `gh pr view`); gộp `origin/onehub` bằng `sync_with_base_branch`; xung đột ở `LO-TRINH.html`/`PRODUCT-MAP.md` → vẽ lại.
- [ ] **Step 2:** `them-paths.mjs --kiem-danh-sach` với danh sách hiện tại: hai hồ sơ P0 thuộc luật → thêm vào `danh-sach.txt`, chạy `--ghi`; không thuộc → DỪNG, `yeu-cau can-nguoi` (ghim lại trong PR hay để lần ghim kế).
- [ ] **Step 3:** Chạy cả tám khoá `tpe_*` → mã 0. Commit, rồi S4.

## Self-review

- Spec coverage: AC-1 → Task 1+4 (E1); AC-2 → Task 1+6 (E2); AC-3 → Task 1+4+6 (E3); AC-4 → Task 2 (E4); AC-5 → Task 1+4 (E5); AC-6 → Task 1 (E6); AC-7 → Task 3 (E8); chiều đỏ → Task 5 (E7).
- Placeholder: không có «TBD»; các đầu ra in đều khai chuỗi.
- Tên dùng chung: `lapKeHoach`, `chenPaths`, `giaiInput`, `hoaCuHoSo`, `tepDoiTuPin` — khai ở Task 1, dùng ở Task 2, 5.
