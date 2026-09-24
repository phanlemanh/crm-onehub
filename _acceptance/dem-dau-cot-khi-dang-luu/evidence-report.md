---
schema_version: 2
feature_slug: dem-dau-cot-khi-dang-luu
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e76c7501ff85aacdebb58911968c745669fbc3cc
human_signoff:
---

# Evidence Report: dem-dau-cot-khi-dang-luu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-9 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dem-dau-cot-khi-dang-luu-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_api_duoc_tinh
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
    Ran 1 test across 1 file. [819.00ms]
    test-run: dropped crm_muevah71euhb_test

- eval: E2
  run_id: minted-dem-dau-cot-khi-dang-luu-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E3
  run_id: minted-dem-dau-cot-khi-dang-luu-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E4
  run_id: minted-dem-dau-cot-khi-dang-luu-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E5
  run_id: minted-dem-dau-cot-khi-dang-luu-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_man_dang_luu
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     11 expect() calls
    Ran 2 tests across 1 file. [1071.00ms]

- eval: E6
  run_id: minted-dem-dau-cot-khi-dang-luu-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E7
  run_id: minted-dem-dau-cot-khi-dang-luu-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_man_loi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [1250.00ms]

- eval: E8
  run_id: minted-dem-dau-cot-khi-dang-luu-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E9
  run_id: minted-dem-dau-cot-khi-dang-luu-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

- eval: E10
  run_id: minted-dem-dau-cot-khi-dang-luu-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ddc_ham_doi
  verified_at: 2026-09-24T14:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [158.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muevahledyt9
  exit_code: 0
  verified_at: 2026-09-24T14:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-dem-dau-cot-khi-dang-luu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T14:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-dem-dau-cot-khi-dang-luu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T14:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-dem-dau-cot-khi-dang-luu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T14:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — không có eval multi-run nào trong round này (không eval nào khai `runs` > 1)

## Iterations

Round 1: cả 10 eval và 4 lệnh suite (test, lint, lint:slop, build) đều đạt ngay; không có vòng lặp trước đó.
