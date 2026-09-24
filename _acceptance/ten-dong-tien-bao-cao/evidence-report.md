---
schema_version: 2
feature_slug: ten-dong-tien-bao-cao
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d3911564da114e9b2f61ebe02d24e13039f5d81d
human_signoff: Manh Phan 2026-09-24
---

# Evidence Report: ten-dong-tien-bao-cao

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ten-dong-tien-bao-cao-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdb_tao_hai_tieng
  verified_at: 2026-09-24T08:32:35Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [841.00ms]

- eval: E2
  run_id: minted-ten-dong-tien-bao-cao-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdb_quet_chu
  verified_at: 2026-09-24T08:32:35Z
  output: |
    quet-chu: 483 tep, 18/18 khang dinh, 0 lech

- eval: E3
  run_id: minted-ten-dong-tien-bao-cao-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdb_quet_chu
  verified_at: 2026-09-24T08:32:35Z
  output: |
    quet-chu: 483 tep, 18/18 khang dinh, 0 lech (cùng lần chạy với E2)

- eval: E6
  run_id: minted-ten-dong-tien-bao-cao-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdb_quet_chu
  verified_at: 2026-09-24T08:32:35Z
  output: |
    quet-chu: 483 tep, 18/18 khang dinh, 0 lech (cùng lần chạy với E2)

- eval: E4
  run_id: minted-ten-dong-tien-bao-cao-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T08:32:35Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/beautiful-thompson-16c095/.acceptance-runs/tien-te-chua-tai-khong-doan/evidence/tao-loi-truoc-khi-chon.png
  observed: |
    Đọc trực tiếp file evidence/tao-loi-truoc-khi-chon.png (đã Read, ảnh mở được): panel "Thoả thuận mới" (form#create-deal), ô "Giá trị" đang focus với nội dung "150.000.000" đã gõ, dòng aria-live ngay dưới ô ghi đúng nguyên văn "Không tải được đồng tiền báo cáo — chọn đồng tiền bên cạnh để nhập số tiền." — khớp 100% với Expected. Ô chọn đồng tiền bên cạnh còn hiện nhãn "Tiền tệ" (chưa chọn currency nào, không phải mã USD hay mã nào khác) — đúng thiết kế "chưa tải, chưa đoán".
  network_observed: n-a (driver)

- eval: E5
  run_id: repin-20260924T083614Z-54689
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdb_lan_hai_ho_so
  verified_at: 2026-09-24T08:32:35Z
  output: |
    [lane] LÀN XANH — run_id repin-20260924T083614Z-54689 (chưa ghi: thêm --write)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-ten-dong-tien-bao-cao-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-24T08:32:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-ten-dong-tien-bao-cao-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T08:32:35Z

- cmd: bun run lint:slop
  run_id: minted-ten-dong-tien-bao-cao-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T08:32:35Z

- cmd: bunx turbo run build --force
  run_id: minted-ten-dong-tien-bao-cao-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T08:32:35Z

## Known limits

## Ngoài hợp đồng

5 finding ngoài hợp đồng; chi tiết và đề xuất ở `review-findings.md`.

- medium · `_acceptance/ten-dong-tien-bao-cao/evals.yaml` — E4 tells the reviewer to look at an old screenshot, and its new screenshot lands in another project's run folder
- medium · `_acceptance/ten-dong-tien-bao-cao/evals.yaml` — This change touches screen checks of two signed-off projects, but AC-5/E5 only re-run the automated checks
- medium · `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs` — Hình dạng 5 (ma trận P105 chỉ trên danh nghĩa): phép so số khẳng định 18 trong quet-chu.mjs không bao giờ đỏ
- medium · `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs` — Hình dạng 4 (khẳng định âm không có đối chứng dương trên cùng đường đọc): lượt quét cụm cũ và phép kiểm có mặt đọc tệp theo hai đường khác nhau
- low · `_acceptance/ten-dong-tien-bao-cao/rang/quet-chu.mjs` — Hình dạng 3 (kiểm «có mặt» trong khi lời hứa là quan hệ): mục từ điển chỉ được kiểm là có hai chữ «Cài đặt» và «Tiền tệ» ở bất kỳ đâu

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt); E4 và E5 baseline n-a (không đo được trên code cũ, không phải green). Bốn lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — không có eval nào mang `runs` > 1 hay `pass_rate` lệch round này; toàn bộ 6 eval (E1–E6) đều deterministic (runs: 1).

## Iterations

Round 1: toàn bộ 6 eval (E1–E6) và cả bốn lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều pass ngay từ lần chạy đầu — verdict PASS.

### Re-pin lần 1 — 2026-09-24, do hoá cũ do gộp origin/onehub (51 commit) vào nhánh trước khi gộp PR #114
run_id: repin-20260924T090705Z-75556
sha: d3911564da114e9b2f61ebe02d24e13039f5d81d · suites: 4 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E4 · AC không có chốt máy: AC-4
