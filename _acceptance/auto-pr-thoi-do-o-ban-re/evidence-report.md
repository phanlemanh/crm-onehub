---
schema_version: 2
feature_slug: auto-pr-thoi-do-o-ban-re
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 185b7a2d6ca65e7357b68d3bb3b2fca7829f711d
human_signoff:
---

# Evidence Report: auto-pr-thoi-do-o-ban-re

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-auto-pr-thoi-do-o-ban-re-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_chay_that
  verified_at: 2026-09-07T09:00:00Z
  output: |
    XANH [chay-that]: tai c042478 check-run `Open a pull request into main` ket luan `skipped`; c042478 la to tien cua HEAD va .github/workflows/auto-pr.yml khong doi tu do den nay

- eval: E2
  run_id: minted-auto-pr-thoi-do-o-ban-re-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_khoa
  verified_at: 2026-09-07T09:00:00Z
  output: |
    XANH [khoa]: job `open` co dung 1 dong `if` = `github.repository == 'trycompai/crm'`; kho tai cho rut tu remote la `phanlemanh/crm-onehub`, khac `trycompai/crm`

- eval: E3
  run_id: minted-auto-pr-thoi-do-o-ban-re-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_mot_dong
  verified_at: 2026-09-07T09:00:00Z
  output: |
    XANH [lech-mot-dong]: .github/workflows/auto-pr.yml lech `origin/release` dung +1/-0, dong them vao dung la dong khoa o tang job va khop ca `upstream/HEAD`

- eval: E4
  run_id: minted-auto-pr-thoi-do-o-ban-re-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_mot_tep
  verified_at: 2026-09-07T09:00:00Z
  output: |
    XANH [mot-tep]: 9 tep doi so voi `origin/onehub`, tat ca nam trong danh sach cho phep, va .github/workflows/auto-pr.yml co mat

- eval: E5
  run_id: minted-auto-pr-thoi-do-o-ban-re-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-07T09:00:00Z
  output: |
    Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    6.077s

- eval: E6
  run_id: minted-auto-pr-thoi-do-o-ban-re-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-07T09:00:00Z
  output: |
    Tasks: 9 successful, 9 total
    Cached: 0 cached, 9 total
    Time: 374ms

- eval: E7
  run_id: minted-auto-pr-thoi-do-o-ban-re-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-07T09:00:00Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 506ms on 910 files with 9 rules using 14 threads.

- eval: E8
  run_id: mtql6wmwlbw6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-07T09:00:00Z
  output: |
    app:test:  0 fail
    app:test:  836 expect() calls
    app:test: Ran 257 tests across 22 files. [709.00ms]

## Known limits

## Ngoài hợp đồng

## Analyst

E6, E7 — cả hai xanh trên nhánh và xanh trên baseline (diffBase). Đây là
regression-guard của kho (`lint`, `lint:slop`), không phải chân đo hành vi
riêng của tính năng này — chúng không phân biệt bản vá với code cũ. Giữ
nguyên như regression-guard có chủ ý, không cần viết lại.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 8/8 eval máy xanh (E1–E8, cả bốn chân hành vi E1–E4 đều đỏ trên
baseline nên có phân biệt), nhưng review phát hiện nhiều lỗi trong hợp đồng —
fallback `upstream/HEAD` là mã chết nên máy thiếu remote `upstream` sẽ trả mã
2 thay vì xanh-có-ghi-chú (AC-3), allowlist chân `mot-tep` thiếu
`PRODUCT-MAP.md` nên tự mâu thuẫn với cổng CI của kho (AC-4), chân `mot-tep`
đo bằng git diff hai chấm nên mù với tệp chưa commit (AC-4), và E2 chỉ đăng
ký được 1 lượt chạy thực thi cho ma trận 4+1 lượt mà AC-2 hứa (AC-2). Verdict
REJECT, quay lại implementation.
