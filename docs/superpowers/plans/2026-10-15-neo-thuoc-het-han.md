# Neo thước tự hết hạn (F8) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native — phiên tự làm tuần tự; S4 là người chấm).

**Goal:** Hai hồ sơ đã ký `so-okr-tu-chay` và `lam-moi-chuyen-viec-qua-loi-chung` ghim lại xanh được, vì thước «vòng này» neo cặp sha gộp và bộ đọc evals dùng chung với kit.

**Architecture:** Sửa ba răng của hai hồ sơ đã ký (neo cặp gộp, đọc nội dung ở đỉnh cặp bằng `git show`, bộ đọc `lib/eval-yaml` của kit), sửa bộ ghi `invalidateQueries` trong một tệp test DOM, sửa `expected` của bốn eval; răng của hồ sơ này đo xanh ở đỉnh, bất biến theo ref, chiều đỏ, phạm vi, ghim.

**Tech Stack:** Bun 1.3.12, node:child_process, git, kit acceptance-gate 2.28.0 (`lib/eval-yaml.cjs`, `scripts/design-gate.mjs`, `scripts/recheck-evidence.cjs`).

**Spec:** `docs/superpowers/specs/2026-10-15-neo-thuoc-het-han-design.md` · hợp đồng `_acceptance/neo-thuoc-het-han/contract.md`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Kit giải qua `node scripts/resolve-plugin.mjs --plugin acceptance-gate --require <tệp>`, không glob cache.
- Cặp gộp: so-okr-tu-chay `f2acca7f1^1..f2acca7f1` (PR #162); lam-moi `100847e8a^1..100847e8a` (PR #145); trong mã ghi sha đầy đủ.
- `_acceptance/config.yaml` chỉ thêm khoá.
- Thông điệp ghim cũ giữ nguyên chữ: «KHONG DO DUOC: diff khong co tep giao dien», «khong co migration moi nao», «khong doc duoc», «khong lam moi khi loi».
- Cây tạm của răng nằm dưới `.acceptance-runs/neo-thuoc-het-han/` (để `node_modules` của gốc kho giải được), dọn trong `finally`.

## Review Focus

- Sha cặp gộp không có trong kho (clone nông) → «KHONG DO DUOC» mã 2, không stack trace (Task 3, đột biến ref-thieu ở Task 5).
- Tệp `.tsx` của cặp đã bị xoá hay dời ở HEAD → đọc ở đỉnh cặp vẫn đọc được (Task 1, đo bằng E1/E2).
- `design-gate.mjs` cần `--target` là tệp trên đĩa → nội dung ở đỉnh ghi ra tệp tạm có cùng tên gốc để dòng in không đổi giữa hai cây (Task 1).
- Lời gọi `invalidateQueries()` không đối số ở nhánh thành công làm lệch đối chứng dương của E3 → đối chứng chỉ đếm khoá cần có, không đòi danh sách bằng hệt (Task 4).
- Lượt ghim chạy cả bảy suite; ca `app-rieng` chập chờn → chạy lại một lần, đỏ hai lần thì chờ `tran-cho-app-rieng` (Task 7).

---

### Task 1: soi-ma.mjs neo cặp gộp, đọc ở đỉnh

**Files:** Modify `_acceptance/so-okr-tu-chay/rang/soi-ma.mjs` · **Evals:** E1, E2 · **independent:** true

- [ ] Thay `const MOC = "origin/onehub"` bằng `const CAP = { goc: "<sha f2acca7f1^1>", dinh: "f2acca7f1<sha đầy đủ>" }`; `git rev-parse --verify` cả hai, lỗi → `KHONG DO DUOC: khong giai duoc cap gop <sha>` mã 2.
- [ ] `tepDiff(loc)`: `git diff --name-only --no-renames --diff-filter=<loc> ${CAP.goc}...${CAP.dinh}`; điều kiện tồn tại đổi từ `existsSync(join(GOC,t))` sang `git cat-file -e ${CAP.dinh}:${t}`.
- [ ] Nội dung tệp: một hàm `docODinh(t)` ghi `git show ${CAP.dinh}:${t}` ra `<thư mục tạm>/<t>` giữ nguyên đường tương đối, trả đường đó; `caThietKe` dùng nó thay `join(GOC, t)` khi không có `thay`; `design-gate` chạy với `cwd` là thư mục tạm và `--target t` để dòng in giữ tên gốc.
- [ ] `dongThem`: so `git show ${CAP.goc}:${t}` với tệp ở đỉnh.
- [ ] Tệp cấu hình số `TEP_CAU_HINH_SO` import từ bản ở đỉnh trong thư mục tạm.
- [ ] Dòng in `dai so sanh: ${CAP.goc}...${CAP.dinh} (--no-renames)`.
- [ ] Verify: `bun _acceptance/so-okr-tu-chay/rang/soi-ma.mjs --ca thiet-ke` → mã 0; các ca tự kiểm sẵn có của script vẫn in OK.
- [ ] Commit `fix(neo-thuoc-het-han): soi-ma neo cặp gộp PR #162, đọc ở đỉnh`.

### Task 2: migration-chi-them.mjs neo cặp gộp

**Files:** Modify `_acceptance/so-okr-tu-chay/rang/migration-chi-them.mjs` · **Evals:** E1, E2 · **independent:** true

- [ ] `TRUOC` = sha `f2acca7f1^1`, thêm `DINH` = sha `f2acca7f1`; rev-parse lỗi → «KHONG DO DUOC» mã 2.
- [ ] `moi` = `git ls-tree --name-only ${DINH}:${THU_MUC}` trừ `cu`; `docSql(t)` = `git show ${DINH}:${THU_MUC}/${t}/migration.sql`; `schema` = `git show ${DINH}:${TEP_SCHEMA}` (cả ở soát tĩnh lẫn ca tự kiểm dòng 345).
- [ ] Dòng in `goc so sanh: ${TRUOC}..${DINH} · migration moi: …`; câu không có migration giữ chữ «khong co migration moi nao» và nêu cặp.
- [ ] Verify: `node _acceptance/so-okr-tu-chay/rang/migration-chi-them.mjs` → mã 0.
- [ ] Commit `fix(neo-thuoc-het-han): migration-chi-them neo cặp gộp PR #162`.

### Task 3: khong-hoi-quy.mjs dùng bộ đọc kit, neo cặp gộp

**Files:** Modify `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs` · **Evals:** E1, E4 · **independent:** true

- [ ] `docYaml`: giải `lib/eval-yaml.cjs` của kit qua `resolve-plugin.mjs`, đọc bằng hàm của nó; giữ thông điệp lỗi «KHONG DO DUOC: khong doc duoc <tệp> — …» mã 2. `config.yaml` đọc cùng bộ đọc nếu nó đọc được config, không thì giữ đường đọc config hiện có nhưng không qua `Bun.YAML`.
- [ ] `coSo` = sha `100847e8a^1`, `DINH` = sha `100847e8a`, rev-parse lỗi → «KHONG DO DUOC: khong giai duoc cap gop» mã 2 (bắt lỗi, không ném).
- [ ] `dThat` = `git diff --name-only ${coSo}..${DINH}` lọc như cũ; kiểm tệp ngoài vòng như cũ.
- [ ] HEAD chứa `DINH` (`merge-base --is-ancestor`) → sau đối chứng rut và in tập lệnh, in «vong da len onehub o <DINH8> — ve chay lai lenh cua ho so khac do luot kiem cheo dem kiem-cheo-sau-gop tra loi» và mã 0 (tiền lệ thuoc-khong-tu-het-han AC-6). HEAD chưa chứa `DINH` → chạy như cũ với gốc `coSo`.
- [ ] Bỏ mọi chỗ nhắc `origin/onehub` và `merge-base HEAD`.
- [ ] Verify: `bun _acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs` → mã 0.
- [ ] Commit `fix(neo-thuoc-het-han): khong-hoi-quy đọc evals bằng bộ đọc kit, neo cặp gộp PR #145`.

### Task 4: bộ ghi invalidateQueries ghi mọi lời gọi (Ngoài-3)

**Files:** Modify `apps/app/test/lam-moi-chuyen-viec.dom.tsx:64-68` · **Evals:** E3, E4 · **independent:** true

- [ ] Dòng 66: `daLamMoi.push(bo?.queryKey ?? "(khong khoa)")`.
- [ ] Kiểm ca thành công không bị lệch bởi dấu `(khong khoa)`; nếu lệch, đối chứng dương chỉ đòi khoá cần có xuất hiện.
- [ ] Verify: lệnh của `config:executors.test.lmcv_loi_khong_lam_moi` → xanh; bản sao dialog chèn `invalidateQueries()` vào nhánh lỗi (thử tay trong cây tạm) → đỏ «khong lam moi khi loi».
- [ ] Commit `test(neo-thuoc-het-han): bộ ghi invalidateQueries ghi cả lời gọi không khoá`.

### Task 5: expected của bốn eval

**Files:** Modify `_acceptance/so-okr-tu-chay/evals.yaml` (E23, E25), `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/evals.yaml` (E5, E3) · **Evals:** E5 · **independent:** false (sau Task 1–4)

- [ ] Chỉ sửa trường `expected`: nói mốc cố định (sha PR) thay cho `origin/onehub`/merge-base; E5 nói bộ đọc kit và vế chạy lại bỏ sau gộp; E3 nói bộ ghi ghi mọi lời gọi.
- [ ] Commit `fix(neo-thuoc-het-han): expected của E23, E25, E5, E3 theo mốc cố định`.

### Task 6: răng của hồ sơ này

**Files:** Create `_acceptance/neo-thuoc-het-han/rang/{chung,chay-o-dinh,hai-ref,chieu-do,pham-vi,ghim-xanh}.mjs` · **Evals:** E1, E2, E4, E5, E6 · **independent:** false

- [ ] `chung.mjs`: `GOC`, `SLUG`, `CAP_SOT`, `CAP_LMCV`, `MOC_NEN = aba7f6418…`, `kit(tep)` qua resolve-plugin, `giaiLenh(khoa)` đọc `_acceptance/config.yaml` bằng bộ đọc kit, `cayTam(ten)` tạo/dọn worktree dưới `.acceptance-runs/neo-thuoc-het-han/`, `chay(lenh, cwd)`.
- [ ] Mỗi răng làm đúng câu `expected` của eval tương ứng, kèm tự kiểm/đối chứng đã ghi; thông điệp ghim đúng chữ.
- [ ] Verify từng răng xanh ở HEAD; phá-thử: chạy `chieu-do.mjs` với một đột biến tắt (bỏ phép thay) phải in «HONG KHONG AP»; `pham-vi.mjs` tự kiểm bắt tệp giả.
- [ ] `bun run lint:slop` sạch.
- [ ] Commit `test(neo-thuoc-het-han): răng đo neo, bất biến ref, chiều đỏ, phạm vi, ghim`.

### Task 7: ghim lại hai hồ sơ (cuối S3, trước S4; ghim lần nữa ở tip trước gộp)

**Files:** `_acceptance/{so-okr-tu-chay,lam-moi-chuyen-viec-qua-loi-chung}/{run-log.jsonl,evidence-report.md}` · **Evals:** E6 · **independent:** false

- [ ] Xin lượt `ghim-lai`, chạy `repin-lane.mjs --slug so-okr-tu-chay --slug lam-moi-chuyen-viec-qua-loi-chung --reason "neo-thuoc-het-han: …" --write` qua `giu-nhip.mjs`; chập chờn `app-rieng` chạy lại một lần.
- [ ] `bun _acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs` → mã 0.
- [ ] Commit `chore(neo-thuoc-het-han): ghim lại hai hồ sơ ở đỉnh`.
