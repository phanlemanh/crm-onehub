# giam-phut-ci-nhap-t1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PR nháp và PR chỉ chạm tệp T1 bỏ job nặng của `ci.yml` và `acceptance.yml`; `ci-ok` xanh khi bỏ qua hợp lệ; push giữ nguyên.

**Architecture:** Một bộ phân loại Node không phụ thuộc (`.github/scripts/phan-loai.mjs`) đọc danh sách T1 bằng `configList` của `lib/workspace-record.cjs` và khớp glob bằng hai hàm bash rút từ `scripts/pre-merge-check.sh`. Mỗi workflow có job `phan-loai` chạy bộ phân loại; job nặng `needs` nó với `if: ${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' }}`. Phép đo sống ở `_acceptance/giam-phut-ci-nhap-t1/rang/`.

**Tech Stack:** GitHub Actions YAML, Node ≥ 20 (runner) / Bun 1.3.12 (máy), bash.

**Spec:** `_acceptance/giam-phut-ci-nhap-t1/design.md` + `contract.md` + `evals.yaml` (expected của từng eval là đặc tả phép đo).

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Sha ghim của vòng: `27d47de04725bc04d8d6deff870ac16751f3bf69`.
- Không sửa `scripts/pre-merge-check.sh`, `lib/*.cjs`, `scripts/recheck-evidence.cjs`, `scripts/product-map.mjs`.
- Bộ phân loại chạy trên Node của runner ubuntu-24.04: không dùng `import.meta.dirname`, không gói ngoài.
- Mọi lỗi của bộ phân loại → `nang=true`.
- Push không đổi lệnh nào.

## Review Focus

- PR nháp mà chạm `.github/**` → vẫn nhẹ (nháp thắng); chỉ PR sẵn sàng mới xét `.github` (Task 1 ma trận).
- Tệp mã đổi tên thành `.md` → nặng (`--no-renames`, Task 1 CLI).
- `NHAP` rỗng hay `false` → coi là sẵn sàng (Task 1).
- `sed` không rút được hàm (tệp pre-merge đổi khuôn) → nặng, không âm thầm coi mọi tệp không T1 (Task 1: `type match_globs` chặn).
- Push: job phân loại bị bỏ qua mà job nặng vẫn chạy nhờ `!cancelled()` (Task 3 mô phỏng).

---

### Task 1: Bộ phân loại + bài kiểm

**independent:** false (mọi task sau dùng API này) · **phục vụ:** E1, E2

**Files:**
- Create: `.github/scripts/phan-loai.mjs`
- Create: `.github/scripts/test/phan-loai.test.mjs`

**Interfaces — Produces:**
- `quyetDinh({ suKien: string, nhap: string, tep: string[], laT1: (t: string) => boolean }) → { nang: boolean, lyDo: string }`
- `docGlobT1(goc: string) → string[]` (ném lỗi khi config vắng)
- `tepT1(globs: string[], tep: string[]) → Set<string>` (ném lỗi khi bash hỏng hay không rút được `match_globs`)
- `tepThayDoi(goc: string) → string[]` (ném lỗi khi HEAD không đúng hai cha)
- `phanLoai({ goc, suKien, nhap }) → { nang, lyDo }` (không bao giờ ném; lỗi → nặng)
- CLI: `node .github/scripts/phan-loai.mjs [--goc <dir>]`, env `SU_KIEN`, `NHAP`, `GITHUB_OUTPUT`, `GITHUB_STEP_SUMMARY`; in và ghi `nang=<true|false>` + `ly_do=<một dòng>`; thoát 0.

- [ ] Step 1: viết `phan-loai.test.mjs` (node:test) — ma trận `quyetDinh` (12 ô của E1 lớp 1), `tepT1` trên glob thật (AGENTS.md, CLAUDE.md, docs/x.md là T1; apps/api/x.ts không), CLI trên kho git tạm dựng bằng mã (merge `--no-ff`) cho bốn ca: chỉ docs → nhẹ; đổi tên mã → nặng; HEAD một cha → nặng `loi:`; config vắng → nặng `loi:`.
- [ ] Step 2: `node --test .github/scripts/test/phan-loai.test.mjs` → FAIL (module chưa có).
- [ ] Step 3: viết `phan-loai.mjs`:

```js
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KHO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const THU_MUC_GITHUB = ".github/";
const RUT_HAM = `eval "$(sed -n '/^glob_variants() {/,/^}/p;/^match_globs() {/,/^}/p' "$1")"; type match_globs >/dev/null 2>&1 || exit 3; while IFS= read -r f; do [ -n "$f" ] || continue; if match_globs "$f" "$2"; then printf '%s\\n' "$f"; fi; done`;

export function quyetDinh({ suKien, nhap, tep, laT1 }) {
  if (suKien !== "pull_request") return { nang: true, lyDo: "khong-phai-pr" };
  if (nhap === "true") return { nang: false, lyDo: "nhap" };
  if (tep.length === 0) return { nang: true, lyDo: "khong-co-tep" };
  if (tep.some((t) => t.startsWith(THU_MUC_GITHUB))) return { nang: true, lyDo: "cham-github" };
  if (tep.every(laT1)) return { nang: false, lyDo: "chi-t1" };
  return { nang: true, lyDo: "co-tep-nang" };
}
```
(cộng `docGlobT1`, `tepT1`, `tepThayDoi`, `phanLoai`, CLI theo Interfaces).
- [ ] Step 4: chạy lại bài kiểm → PASS.
- [ ] Step 5: commit `feat(ci): bộ phân loại PR nặng/nhẹ theo nháp và T1`.

### Task 2: Hai workflow

**independent:** false (dùng CLI Task 1) · **phục vụ:** E3, E4, E5, E6, E11

**Files:** Modify `.github/workflows/ci.yml`, `.github/workflows/acceptance.yml`

Job thêm vào CẢ HAI tệp, giống từng ký tự:

```yaml
  phan-loai:
    name: phân loại PR
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    outputs:
      nang: ${{ steps.pl.outputs.nang }}
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 2
      - run: node --test .github/scripts/test/phan-loai.test.mjs
      - id: pl
        run: node .github/scripts/phan-loai.mjs
        env:
          SU_KIEN: ${{ github.event_name }}
          NHAP: ${{ github.event.pull_request.draft }}
```

`check`, `test`, `build`: thêm `needs: phan-loai` và `if: ${{ !cancelled() && needs.phan-loai.outputs.nang != 'false' }}`. `agent-okr-node24`: `needs: phan-loai`, `if: ${{ github.event_name == 'pull_request' && !cancelled() && needs.phan-loai.outputs.nang != 'false' }}`. `ci-ok`: `needs: [phan-loai, check, test]`, bước:

```yaml
      - run: |
          pl="${{ needs.phan-loai.result }}"
          nang="${{ needs.phan-loai.outputs.nang }}"
          check="${{ needs.check.result }}"
          kiem="${{ needs.test.result }}"
          echo "phân loại: $pl · nang: $nang · check: $check · test: $kiem"
          case "$pl" in success|skipped) ;; *) exit 1 ;; esac
          if [ "$check" = success ] && [ "$kiem" = success ]; then exit 0; fi
          if [ "$pl" = success ] && [ "$nang" = false ] && [ "$check" = skipped ] && [ "$kiem" = skipped ]; then exit 0; fi
          exit 1
```

- [ ] Step 1: sửa hai tệp. Step 2: `bun -e` parse lại cả hai bằng `Bun.YAML`. Step 3: commit `ci: job nặng chờ bộ phân loại; ci-ok nhận bỏ qua hợp lệ`.

### Task 3: Phép đo hình và luồng (rang)

**independent:** false · **phục vụ:** E1–E6

**Files:** Create `_acceptance/giam-phut-ci-nhap-t1/rang/{chung.mjs,phan-loai.mjs,mot-nguon.mjs,hinh.mjs,ci-ok.mjs,luong.mjs}`

`chung.mjs` export `GOC` (suy từ vị trí tệp), `SHA_GHIM`, `CHAY` (= `.acceptance-runs/giam-phut-ci-nhap-t1`), `docTep(sha, duong)`, `yamlTai(sha, duong)`, `dong(ok, nhan, ly)`. Mỗi rang làm đúng `expected` của eval tương ứng: ma trận viết trước, đếm assert, chiều đỏ trên bản sao trong `CHAY/dot-bien/`, in `BAT <ca>`, thoát 1 khi một ca không bắt.

- [ ] Viết, chạy từng rang (`bun <tệp>` → mã 0), commit `test(acceptance): rang hình, ci-ok, luồng, phân loại`.

### Task 4: Không đỏ thêm + thay bởi + CLAUDE.md

**independent:** false · **phục vụ:** E7, E8, E10

**Files:**
- Modify: `_acceptance/giam-phut-acceptance/evals.yaml` (E1, E2, E3: thêm hai dòng `status: not-run` + `superseded_by: giam-phut-ci-nhap-t1#AC-5|6|7` ngay sau `cmd:`)
- Modify: `_acceptance/ci-ma-tran-ba-o/evals.yaml` (E1 → `#AC-4`, E3 → `#AC-3`)
- Modify: `CLAUDE.md` (mục «PR mở ở dạng nháp»)
- Create: `rang/{khong-do-them.mjs,thay-boi.mjs,claude-md.mjs}`

- [ ] Sửa, chạy ba rang, commit.

### Task 5: Thước phút + lượt thật + mở PR nháp

**independent:** false · **phục vụ:** E9, E11

**Files:** Create `rang/{do-phut-ci.mjs,luot-that.mjs}`

- [ ] Viết `do-phut-ci.mjs` (import `phutCuaLuot` từ `giam-phut-acceptance/rang/do-phut.mjs`), chạy trên dữ liệu thật 02–08/10.
- [ ] Gộp `origin/onehub` nếu dời; đẩy nhánh; `gh pr create --draft --base onehub`; chờ hai workflow xong; chạy `luot-that.mjs` → mã 0.
- [ ] Contract `status: implemented`, commit, vào S4.
