# push-ghim-lai-t1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lần đẩy và PR chỉ ghim lại được xếp nhẹ (`chi-t1`), mà cổng nghiệm thu vẫn chạy và vẫn đỏ được.

**Architecture:** Thêm hai glob vào `risk_tiers.t1_skip_globs`; thêm luật số đoạn vào `tachT1` của
`.github/scripts/phan-loai.mjs` (hàm chung của CI, pre-push, bộ quét). Mọi ca kiểm mới ở một tệp
`packages/ui/test/push-ghim-lai-t1.spec.ts`; hai răng ngoài năm bước ở `_acceptance/push-ghim-lai-t1/rang/`.

**Tech Stack:** Node 24 ESM, bun test, bash `match_globs` của `scripts/pre-merge-check.sh` (không sửa).

**Spec:** `docs/superpowers/specs/2026-10-18-push-ghim-lai-t1-design.md`, hợp đồng `_acceptance/push-ghim-lai-t1/contract.md`,
evals `_acceptance/push-ghim-lai-t1/evals.yaml` (nguồn sự thật của từng ca và thông điệp ghim).

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không sửa `scripts/pre-merge-check.sh`, `match_globs`, `phan-loai.test.mjs`, `t1-ma-doc.spec.ts`, `pre-push-t1.mjs`.
- `phan-loai.mjs` không chứa chuỗi glob nào của `t1_skip_globs` (răng `mot-nguon` của pre-push-t1 soi `pre-push-t1.mjs`; giữ cùng nếp).
- Kho git tạm: `git init --template=`, config chép vào cây làm việc và KHÔNG commit (hook git-secrets hệ thống chặn commit config).
- Mọi thông điệp ghim chép đúng từ `evals.yaml`.

## Review Focus

- Tệp khớp hai glob, một glob có `**` một glob không: luật số đoạn chỉ loại glob lệch, glob kia vẫn tính — E4 ca 3.
- Glob trừ `!` dạng không có `**`: luật áp cho cả phía trừ — E4 ca 7.
- Tên tệp có dấu cách hay ký tự lạ trong diff: `khop` truyền qua stdin từng dòng, không đổi — giữ, không thêm ca.
- `38ecca3be` không với tới (clone nông ở CI): răng thoát 2, không xanh — E6.
- Bộ quét sau khi thêm glob tìm thấy bên đọc thật của sổ chạy trong kho: `quet-that` của t1-ma-doc đỏ — Task 1 bước 5 chạy nó.

---

### Task 1: Hai glob + luật số đoạn trong `tachT1` (AC-1, AC-4)

**Files:** Modify `_acceptance/config.yaml` (khối `t1_skip_globs`), `.github/scripts/phan-loai.mjs` (`tachT1`); Create `packages/ui/test/push-ghim-lai-t1.spec.ts`.

**Interfaces:** Produces `tachT1(globs: string[], tep: string[]) → { t1: Set, maDoc: Set }` (chữ ký không đổi). Spec export nội bộ các helper `git`, `ghi`, `envSach`, `khoTam` dùng lại ở Task 2–4.

- [ ] Viết `describe("pglt-tach")` (E1: (a) configList, (b) 11 ca `pglt-tach <so> <tep>`, (c) ca đỏ kho tạm xoá dòng run-log) và `describe("pglt-sau")` (E4: 7 ca `pglt-sau <so> <tep>` + (b) tập glob có ký tự đại diện thiếu `**`).
- [ ] Chạy `cd packages/ui && bun test ./test/push-ghim-lai-t1.spec.ts -t "pglt-tach|pglt-sau"` → đỏ (config chưa có glob; ca 6 E4 ra t1).
- [ ] Thêm hai dòng sau `"**/*.md"`… vào `t1_skip_globs` kèm một dòng giải thích dạng YAML comment như các khối cạnh: `"_acceptance/*/run-log.jsonl"`, `"_acceptance/*/decisions.jsonl"`.
- [ ] `tachT1`: hàm `soDoanKhop(globs, tep)` — gọi `khop(globs, tep)` như cũ, rồi với tệp khớp, loại tệp mà MỌI glob khớp nó đều là glob có `[*?[]` không có `**` và số đoạn khác số đoạn tệp. Cách làm: tách `globs` thành `chat` (có ký tự đại diện, không `**`) và `rong`; `khopRong = khop(rong, tep)`; với mỗi glob `chat` gọi `khop([g], tep.filter(t => soDoan(t) === soDoan(g)))`; hợp ba tập. Áp cho cả `duong` và `am`.
- [ ] Chạy lại lệnh trên → xanh; chạy `node --test .github/scripts/test/phan-loai.test.mjs` và `cd packages/ui && bun test ./test/t1-ma-doc.spec.ts ./test/pre-push-t1.spec.ts` → xanh (hồ sơ cũ không đổi); chạy `node .github/scripts/t1-ma-doc.mjs` → `sach:`; đỏ ở `thieu-khai` → khai đúng tệp vào `t1_ma_doc` và ghi một dòng sổ `fix`.
- [ ] Commit.

### Task 2: Hai đường phân loại (AC-2, AC-3)

**Files:** Modify `packages/ui/test/push-ghim-lai-t1.spec.ts`.

- [ ] `describe("pglt-ci")`: hằng `TEP_GHIM_LAI` = 16 tệp chép từ `git show --name-only --format= 38ecca3be` (đếm 16 → nếu lệch «so tep ghim lai lech»); kho tạm có commit gốc (16 tệp + tệp thêm ở dạng cũ), nhánh PR sửa đúng tập tệp, `git merge --no-ff` lên gốc; CLI `node .github/scripts/phan-loai.mjs --goc` với `SU_KIEN=pull_request NHAP=false`; 8 ca `pglt-ci <so> …` đúng bảng E2.
- [ ] `describe("pglt-day")`: dùng lại dựng kho remote trần + hook tạm như `t1-ma-doc.spec.ts` (`khoMau`/`dayNhanh`, chép vào spec mới, không import chéo); 3 ca `pglt-day <so> …` đúng E3.
- [ ] Chạy `-t "pglt-ci|pglt-day"` → xanh (Task 1 đã có luật); chép tạm config không glob vào kho mẫu thấy ca 1 đỏ (phá-thử tay, không commit).
- [ ] Commit.

### Task 3: Bộ quét bắt bên đọc sổ chạy (AC-5)

**Files:** Modify spec.

- [ ] `describe("pglt-doc")` 4 ca theo E5, dựng kho quét như `khoQuet` của t1-ma-doc (config chép, `git add -A`, không commit), gọi `quetDauVao(goc, { mien: {} })` và CLI `--goc --mien-rong`.
- [ ] Chạy `-t pglt-doc` → xanh; ca 4 (xoá glob) là chiều đỏ trong chính bảng.
- [ ] Commit.

### Task 4: Cổng nghiệm thu không bị lọc (AC-7)

**Files:** Modify spec.

**Interfaces:** `kiemJobCong(chu: string): string[]` trong spec; mỗi vi phạm bắt đầu bằng tên luật `on-loc-duong` · `on-types` · `job-needs` · `job-if` · `job-continue-on-error` · `buoc-continue-on-error` · `buoc-if` · `buoc-nhac-phan-loai`.

- [ ] `describe("pglt-job")` 9 ca theo E7; ca 2–9 sửa chuỗi tệp thật bằng `replace` có kiểm đã đổi.
- [ ] Chạy `-t pglt-job` → xanh. Commit.

### Task 5: Răng cổng trên commit thật (AC-6)

**Files:** Create `_acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs`; Modify `_acceptance/config.yaml` (khoá executor).

- [ ] Răng theo E6: `git cat-file -e 38ecca3be^{commit}` hỏng → «KHONG DO DUOC: thieu 38ecca3be», mã 2. Mỗi ca: `git clone -q --shared --no-checkout --template= <GOC> <tam>`, `checkout -q 38ecca3be^`, chép config, `update-ref refs/remotes/origin/onehub HEAD`, `checkout -q -b pr 38ecca3be` (+ commit ca), `checkout -q -` rồi `merge -q --no-ff --no-edit pr`. Kịch bản cổng: `Bun.YAML` không có trong node → răng chạy bằng `bun`. Ba ca (a)(b)(c); in «dat cong-van-do».
- [ ] Chạy `bun _acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs` → «dat cong-van-do», mã 0.
- [ ] Commit.

### Task 6: Răng đột biến (AC-8) + khoá executor

**Files:** Create `_acceptance/push-ghim-lai-t1/rang/dot-bien.mjs`; Modify `_acceptance/config.yaml`.

- [ ] Răng theo E8, khuôn của `_acceptance/t1-ma-doc/rang/dot-bien.mjs` (chỉ mục git riêng, `git archive`, `--template=`, liên kết `node_modules`): lượt lành rồi năm ca `go-glob-run-log`, `glob-rong-ho-so`, `bo-luat-so-doan`, `cong-phu-thuoc`, `cong-loc-duong`.
- [ ] Khoá executor dưới `executors.test`: `pglt_tach`, `pglt_ci`, `pglt_day`, `pglt_sau`, `pglt_doc`, `pglt_job` (= `cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t <nhóm>`); dưới `executors.script`: `pglt_cong: bun _acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs`, `pglt_dot_bien: node _acceptance/push-ghim-lai-t1/rang/dot-bien.mjs`. Cập nhật dòng lệnh E6 trong `evals.yaml` nếu chạy bằng `bun` (trước S4, không phải giữa hai lượt).
- [ ] Báo `cham-tep _acceptance/config.yaml` ở #375 trước commit config.
- [ ] Chạy `node _acceptance/push-ghim-lai-t1/rang/dot-bien.mjs` → năm «BAT», mã 0. Commit.

Sau Task 6: contract `status: implemented`, xin làn M5, S4.
