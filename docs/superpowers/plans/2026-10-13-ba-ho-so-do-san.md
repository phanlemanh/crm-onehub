# Hồ sơ đã ký không còn đỏ sẵn — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (vòng feature-loop T2, phiên chính tự làm tuần tự). Steps use checkbox (`- [ ]`) syntax.

**Goal:** 19 hồ sơ đã ký trong danh sách đóng hết đỏ sẵn — không còn mục `paths` chết, eval P8-4 xanh hoặc miễn đo có lý do — và 18 hồ sơ bị chạm được ghim lại xanh một lượt.

**Architecture:** Một danh sách đóng (`danh-sach.json`) là vật trung tâm; năm răng đọc nó: `paths-song` (tĩnh), `danh-sach` (khép tập + ngoài vòng), `khai-du` (mọi đổi có dòng), `chieu-do` (răng sửa còn bắt lỗi), `ghim-xanh` (hành vi). Một mô-đun `chung.mjs` giữ mốc nền, gốc kho, nạp thư viện kit qua `scripts/resolve-plugin.mjs`. Sửa thật nằm ở `evals.yaml` của 17 hồ sơ và răng `ld_ba_noi_deu_chay`.

**Tech Stack:** Bun chạy `.mjs`; thư viện kit `lib/evidence-core.cjs`, `lib/eval-yaml.cjs`; `git` qua `execFileSync`; `Bun.YAML` để parse `config.yaml`, `ci.yml`.

**Spec:** `docs/superpowers/specs/2026-10-13-ba-ho-so-do-san-design.md` · hợp đồng `_acceptance/ba-ho-so-do-san/contract.md` · `evals.yaml` · sổ `decisions.jsonl` (đã niêm Cổng Phạm vi 13/10).

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Mốc nền là sha cố định `3a2783409894908bc8dd1ee3893b88f990d1aebe`, không `merge-base`, không `HEAD`.
- Gốc kho suy từ vị trí script (`dirname(fileURLToPath(import.meta.url))/../../..`), không hardcode.
- Hàm phân loại `paths` lấy từ bản acceptance-gate do `node scripts/resolve-plugin.mjs --plugin acceptance-gate --require lib/evidence-core.cjs --require lib/eval-yaml.cjs` trả; không giải được → thoát 2 có tên.
- `_acceptance/config.yaml` chỉ thêm khoá (luật 7); tệp của hồ sơ khác chỉ trong danh sách P7-3 đã duyệt.
- Năm giá trị `xu_ly`: `tro-duong-moi` (kèm `moi`: đường mới, hoặc `null` = bỏ riêng mục chết, ô vẫn chạy) · `bo-paths` (chỉ ô `not-run`) · `khai-not-run` · `sua-rang` · `tu-het`. Luật chọn: sổ `d-20261013T005215Z-15`.
- Thông điệp răng viết không dấu, khoá đỏ viết HOA như hợp đồng (`THIEU`, `THUA`, `KHONG_KHAI`, …).

## Review Focus

1. Một ô đang chạy bị bỏ trọn `paths` (thay vì một mục) → bộ lọc tắt mới — `paths-song` phải đỏ `BO_LOC_TAT_MOI` (Task 3, đối chứng).
2. Tệp `evals.yaml` có mục `paths` khai dạng chuỗi một dòng `[a, b]` lẫn dạng danh sách — bộ sửa phải giữ nguyên khuôn khác của tệp (Task 5 dùng thay chuỗi đúng một dòng, đếm số lần thay = số dòng danh sách).
3. Kiểm chéo mới hơn ngày ghi trong `ngoai_vong` xuất hiện giữa vòng — `danh-sach` đọc đúng ngày đã ghi, không đọc tệp mới nhất lúc chạy (Task 2).
4. Lượt ghim lại chạy trên cây có commit mới của `onehub` gộp vào sau khi sửa — `ghim-xanh` phải đỏ `GHIM_CU` nếu commit cuối chạm hồ sơ không là tổ tiên sha ghim (Task 8).
5. `can_cu` dạng `tệp:dòng` mà dòng vượt số dòng tệp — `khai-du` đỏ `CAN_CU_HONG` (Task 6).

---

### Task 1: mô-đun chung và danh sách đóng

**Files:**
- Create: `_acceptance/ba-ho-so-do-san/rang/chung.mjs`
- Create: `_acceptance/ba-ho-so-do-san/rang/lap-danh-sach.mjs`
- Create: `_acceptance/ba-ho-so-do-san/danh-sach.json`

**Interfaces (Produces):**
- `GOC: string`, `SLUG = "ba-ho-so-do-san"`, `MOC_NEN: string` (40 hex)
- `git(...args): string` (cwd GOC, maxBuffer 256 MiB)
- `kit(): { core, Y }` — `core.phanLoaiMucPaths`, `core.dungCayPaths`, `core.staleByPaths`, `core.evalPathsOf`, `Y.parseEvals`
- `cayTai(ref: string|null): Cay` — `null` = `git ls-files`, khác = `git ls-tree -r --name-only <ref>`
- `evalsTai(ref: string|null, slug): string|null` — `null` = đọc đĩa, khác = `git show <ref>:_acceptance/<slug>/evals.yaml`
- `hoSoDaKyTai(ref): string[]` — hồ sơ `signed-off`/`machine-cleared` ở ref
- `quetMucChet(ref): Array<{ho_so, eval, muc, ma}>` — mọi mục bị từ chối với mã `paths-khong-tro-toi-tep`/`dang-khai-la`
- `P8_4: Array<{ho_so, eval}>` — ba ca khai cứng
- `docDanhSach(duong?): DanhSach` — parse + kiểm khuôn tối thiểu; `khoaDong(d) = "<ho_so>:<eval>:<muc|->"`

- [ ] Step 1: viết `chung.mjs`; chạy `bun -e 'import("./_acceptance/ba-ho-so-do-san/rang/chung.mjs").then(m=>console.log(m.quetMucChet(m.MOC_NEN).length))'` → in số mục chết ở mốc nền (> 0, khớp quét S0: 17 hồ sơ).
- [ ] Step 2: viết `lap-danh-sach.mjs` (bên ghi): dựng khung `danh-sach.json` từ `quetMucChet(MOC_NEN)` + `P8_4`, mỗi dòng `xu_ly: null`; giữ nguyên `xu_ly`/`ly_do`/`can_cu`/`moi`/`dot_bien` của dòng đã có khi chạy lại.
- [ ] Step 3: điền từng dòng theo luật chọn (sổ d-15), tra `git log --diff-filter=DR` cho `can_cu`; ca P8-4: `khoa-con-bat-xa-tran:E4` khai-not-run (can_cu `_acceptance/tro-ly-okr-nen/decisions.jsonl:28`), `lenh-dung-do-khong-ai-thay:E5` sua-rang (tep răng, dot_bien), `do-man-tren-kho-rieng:<eval>` tu-het.
- [ ] Step 4: mục `ngoai_vong`: đọc `.acceptance-runs/kiem-cheo/2026-10-13.json` qua `git rev-parse --git-common-dir`, lấy hồ sơ ngoài danh sách đóng; gửi `yeu-cau hang-moi` cho giám sát, ghi mã vào `ngoai_vong.yeu_cau`.
- [ ] Step 5: commit.

Phục vụ: E2, E7 (vật đo). independent: false (mọi task sau đọc `chung.mjs`).

### Task 2: răng `danh-sach.mjs` (E2, E7)

**Files:** Create `_acceptance/ba-ho-so-do-san/rang/danh-sach.mjs`

**Interfaces:** Consumes `quetMucChet`, `P8_4`, `docDanhSach`, `khoaDong`. Produces `kiemDanhSach(d, tapNen, kiemCheo): { loi: string[], dat: string[] }` (thuần, dùng cho tự kiểm).

- [ ] Step 1: tự kiểm viết TRƯỚC: bản sao `d` bỏ một dòng → `loi` có `THIEU <khoá>`; thêm dòng bịa → `THUA <khoá>`; `xu_ly` lạ → `XU_LY_LA`; bỏ một hồ sơ khỏi `ngoai_vong` → `NGOAI_VONG_THIEU <hồ sơ>`; xoá `yeu_cau` → `NGOAI_VONG_KHONG_MA`. Tự kiểm không bắt → in `HONG tu kiem …`, exit 1.
- [ ] Step 2: chạy trên `danh-sach.json` thật; tệp kiểm chéo vắng → exit 2 gọi tên đường.
- [ ] Step 3: dòng cuối `danh-sach: <n> dòng, khớp tập quét ở mốc nền <sha>` + `ngoai_vong: <n> hồ sơ từ kiem-cheo/<ngày>.json, yêu cầu <mã>`; commit.

Verify: `bun _acceptance/ba-ho-so-do-san/rang/danh-sach.mjs; echo $?` → 0. Phá-thử: xoá tạm một dòng của `danh-sach.json` (commit trước) → thoát 1 `THIEU`; `git checkout -- danh-sach.json`.

Phục vụ E2, E7. independent: true (sau Task 1).

### Task 3: răng `paths-song.mjs` (E1)

**Files:** Create `_acceptance/ba-ho-so-do-san/rang/paths-song.mjs`

**Interfaces:** Consumes `kit`, `cayTai`, `evalsTai`, `docDanhSach`. Produces `soiHoSo(slug, cay, evalsText, cayNen, evalsNen): { chet: string[], boLoc: {bat, lyDo}, tatMoi: string|null }`.

- [ ] Step 1: tự kiểm: chép `evals.yaml` của hồ sơ đầu danh sách vào bộ nhớ, cấy mục `khong/co/tep-nay.ts` vào eval đầu → phải có `<hồ sơ>:<eval>:khong/co/tep-nay.ts paths-khong-tro-toi-tep`; cấy thư mục có `/` cuối → `dang-khai-la`; bỏ `paths` của eval máy đang chạy → `BO_LOC_TAT_MOI … eval-may-thieu-paths:<eval>`.
- [ ] Step 2: thật: mỗi hồ sơ một dòng; tổng `paths-song: 19 hồ sơ, 0 mục chết`.
- [ ] Step 3: chạy ở mốc nền phải đỏ (`git stash`-tự do: chạy hàm với `cayTai(MOC_NEN)` + `evalsTai(MOC_NEN, …)` qua cờ `--tai <ref>`) → thoát 1 với 17 hồ sơ có mục chết. Commit.

Phục vụ E1. independent: true.

### Task 4: sửa `evals.yaml` của 17 hồ sơ

**Files:** Modify `_acceptance/<17 hồ sơ>/evals.yaml` (danh sách P7-3).

**Interfaces:** Consumes `danh-sach.json`. Produces `rang/ap-danh-sach.mjs` (bên ghi, chạy một lần): với mỗi dòng — `tro-duong-moi`: thay đúng mục trong dòng `paths` của eval (moi null → bỏ mục); `bo-paths`/`khai-not-run`: bỏ dòng `paths` của eval (khai-not-run thêm `status: not-run`, `ly_do:` theo khuôn các ô not-run có sẵn trong kho — xem `_acceptance/dieu-phoi-va-bien/evals.yaml` E1). Đếm số chỗ thay = số dòng; lệch → thoát 1, không ghi.

- [ ] Step 1: viết `ap-danh-sach.mjs`; chạy `--thu` (in diff, không ghi).
- [ ] Step 2: chạy thật; `bun _acceptance/ba-ho-so-do-san/rang/paths-song.mjs` → 0.
- [ ] Step 3: commit.

Phục vụ E1, E3. independent: false (cần Task 1, 3).

### Task 5: răng `ld_ba_noi_deu_chay` và `chieu-do.mjs` (E8)

**Files:**
- Create: `_acceptance/lenh-dung-do-khong-ai-thay/rang/dieu-ci.mjs` — `export function buocBuildCi(ciText): { dat: boolean, chu: string }` (Bun.YAML parse; ≥1 bước `run` khớp `\bbun run build\b` không `if`, không `continue-on-error: true`)
- Modify: `_acceptance/lenh-dung-do-khong-ai-thay/rang/ba-noi-deu-chay.mjs` — điều 2 gọi `buocBuildCi(doc(".github/workflows/ci.yml"))`; bỏ `SHA` và `git show`; `spawnSync(..., { maxBuffer: 256 * 1024 * 1024 })`
- Create: `_acceptance/ba-ho-so-do-san/rang/chieu-do.mjs`

- [ ] Step 1: `chieu-do.mjs` trước: với dòng `sua-rang` của `ld`, nhập `buocBuildCi`, chạy trên `ci.yml` thật (phải đạt) và trên hai bản đột biến khai ở `dot_bien` (bỏ bước build; gắn `if: false` lên bước build) → phải không đạt với thông điệp ghim; đột biến không áp được → `DOT_BIEN_LECH`, thoát 2. Chạy → đỏ vì `dieu-ci.mjs` chưa có.
- [ ] Step 2: viết `dieu-ci.mjs`, sửa răng; `bun _acceptance/ba-ho-so-do-san/rang/chieu-do.mjs` → 0.
- [ ] Step 3: commit.

Phục vụ E8, E4. independent: true (sau Task 1).

### Task 6: răng `khai-du.mjs` (E3)

**Files:** Create `_acceptance/ba-ho-so-do-san/rang/khai-du.mjs`

**Interfaces:** Produces `kiemKhai({ tepDoi, evalsCu, evalsMoi, danhSach, configCu, configMoi, tonTai }) → { loi, dat }` thuần.

- [ ] Step 1: tự kiểm năm cặp (hợp đồng E3): not-run không dòng → `KHONG_KHAI`; sha bịa → `CAN_CU_HONG`; `bo-paths` ở ô chạy → `BO_PATHS_O_DANG_CHAY`; đổi giá trị khoá cũ của config → `CONFIG_DOI_GIA_TRI`; tệp của hồ sơ `tu-het` → `TU_HET_BI_CHAM`; tệp đổi ngoài ba tệp không có dòng `sua-rang` nêu tệp → `TEP_KHONG_KHAI`.
- [ ] Step 2: thật trên `git diff --name-only MOC_NEN HEAD -- _acceptance` + tệp răng ngoài `_acceptance` mà executor của eval trong danh sách trỏ tới; thoát 0. Commit.

Phục vụ E3, E6. independent: true.

### Task 7: bảng trước/sau (E5)

**Files:** Create `_acceptance/ba-ho-so-do-san/rang/bang.mjs`, `_acceptance/ba-ho-so-do-san/bang-truoc-sau.md`

- [ ] Step 1: `bang.mjs` sinh bảng: mỗi dòng `khai-not-run`/`sua-rang`: eval trước/sau (khối YAML của eval ở mốc nền và HEAD), lý do, căn cứ; `khai-not-run` thêm `git show --stat --format=%h\ %s <can_cu>` (khi can_cu là sha) và `git ls-files <vật>` ở HEAD; `sua-rang` thêm diff răng `git diff MOC_NEN HEAD -- <tep>` và đầu ra `chieu-do.mjs`.
- [ ] Step 2: chạy, commit tệp sinh ra.

Phục vụ E5. independent: false (cần Task 4, 5).

### Task 8: răng `ghim-xanh.mjs` (E4) và lượt ghim lại

**Files:** Create `_acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs`; ghim lại sửa `run-log.jsonl` + `evidence-report.md` của 18 hồ sơ.

- [ ] Step 1: tự kiểm từ dòng repin THẬT (dòng `kind: repin` cuối của `_acceptance/khoa-con-bat-xa-tran/run-log.jsonl` ở mốc nền): đổi một `evals_exit` thành 1 → `DO`; bỏ dòng → `CHUA_GHIM`; sha về mốc nền → `GHIM_CU`; đếm eval đối chiếu = số eval test/script không `not-run` → lệch `DEM_LECH`.
- [ ] Step 2: chạy thật trước ghim → đỏ `CHUA_GHIM` cho 18 hồ sơ (chiều đỏ trên vật thật).
- [ ] Step 3: gộp `origin/onehub` mới nhất; xin lượt `ghim-lai`; `repin-lane.mjs --root . --slug <18 hồ sơ> --reason "F24 ba-ho-so-do-san: sửa thước chết" --write` qua lệnh bọc `giu-nhip.mjs`; nhả lượt; commit.
- [ ] Step 4: `ghim-xanh.mjs` → 0; `recheck-evidence.cjs` từng hồ sơ không VIOLATION.

Phục vụ E4. independent: false (cuối cùng).

### Tự soát

Mọi AC có task: AC-1 T3+T4 · AC-2 T1+T2 · AC-3 T6 · AC-4 T8 · AC-5 T7 · AC-6 (E6 dùng răng có sẵn) + T6 · AC-7 T1+T2 · AC-8 T5. Review Focus 1–5 có ở T3, T4, T2, T8, T6.
