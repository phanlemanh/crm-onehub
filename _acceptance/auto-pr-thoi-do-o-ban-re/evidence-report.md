---
schema_version: 2
feature_slug: auto-pr-thoi-do-o-ban-re
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e035792ffcdce3bf3a8be2404a6c2c7cc639861c
human_signoff:
---

# Evidence Report: auto-pr-thoi-do-o-ban-re

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-auto-pr-thoi-do-o-ban-re-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.apr_check_run
  verified_at: 2026-09-07T09:35:00Z
  output: |
    Open a pull request into main = skipped

- eval: E2
  run_id: minted-auto-pr-thoi-do-o-ban-re-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_so_dong
  verified_at: 2026-09-07T09:35:00Z
  output: |
    Verification passed: .github/workflows/auto-pr.yml has exactly 1 line added, 0 lines removed vs origin/release.

- eval: E3
  run_id: minted-auto-pr-thoi-do-o-ban-re-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.apr_lech_noi_dung
  verified_at: 2026-09-07T09:35:00Z
  output: |
    (không có stdout — lệnh `grep -qxF` chạy im lặng theo thiết kế; exit 0 xác nhận dòng `+    if: github.repository == 'trycompai/crm'` khớp nguyên văn)

- eval: E4
  run_id: minted-auto-pr-thoi-do-o-ban-re-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-07T09:35:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    6.387s

- eval: E5
  run_id: minted-auto-pr-thoi-do-o-ban-re-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_khong_cache
  verified_at: 2026-09-07T09:35:00Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    572ms

- eval: E6
  run_id: minted-auto-pr-thoi-do-o-ban-re-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_slop
  verified_at: 2026-09-07T09:35:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 541ms on 909 files with 9 rules using 14 threads.

- eval: E7
  run_id: minted-auto-pr-thoi-do-o-ban-re-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-09-07T09:35:00Z
  output: |
      Time:    24.013s 

    test-run: dropped crm_mtqmq7bvgm4f_test

## Known limits

## Ngoài hợp đồng

## Analyst

E1, E5, E6 — cả ba xanh trên nhánh và xanh trên baseline (diffBase). E5
(`lint --force`) và E6 (`lint:slop`) là regression-guard của kho, có chủ ý:
chúng không phân biệt bản vá với code cũ và không cần viết lại. E1
(`apr_check_run`) khác loại: nó ghim cứng vào check-run của commit
`c042478` đã đẩy lên GitHub — baseline ở đây là "trước bản vá tại chỗ"
(`5ac85ef`, đo riêng ở AC-1, không nằm trong lệnh A/B tự động của round này)
nên bản thân lệnh trần không tự phân biệt được trên cây đang kiểm; đã có đối
chứng hai chiều thủ công cho AC-1 (xem evals.yaml E1, "Ca hai chieu DA CHAY
ngay 07/09"). Regression-guard bình thường (E5, E6) không liệt kê riêng
theo quy ước; E1 giữ ở đây vì nó không phải regression-guard mà là một chân
đo ghim ngoài cây — xem review-findings.md để người quyết ở Cổng 2.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E8 xanh trên bộ đo tự chế (`rang/khoa-auto-pr.mjs`), nhưng
review phát hiện năm lỗ trong hợp đồng và bộ đo — fallback `upstream/HEAD`
là mã chết, allowlist chân `mot-tep` thiếu `PRODUCT-MAP.md`, chân đó mù tệp
chưa commit, và E2 chỉ chạy 1/5 lượt ma trận mà AC-2 hứa. Verdict REJECT,
quay lại implementation.
Round 2 (S4-r2): chủ kho thu phạm vi — xoá bộ đo tự chế 260 dòng, hợp đồng
còn 3 AC, evals còn E1–E7 — rồi đo lại bằng lệnh trần `gh api` / `git diff`
/ `turbo` / `oxlint` / `bun test`. Cả 7/7 xanh trên cây mang bản vá, E2/E3
đỏ trên baseline (phân biệt được). Verdict PASS.
