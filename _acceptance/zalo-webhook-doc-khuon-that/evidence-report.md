---
schema_version: 2
feature_slug: zalo-webhook-doc-khuon-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 866c87472ac923cc99cd386edc5e9cf11ea6c050
human_signoff: Phan Le Manh 2026-09-25
---

# Evidence Report: zalo-webhook-doc-khuon-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: mug5e2u6m026
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zwk_hai_khuon_noi
  verified_at: 2026-09-24T23:12:49Z
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [260.00ms]
    test-run: dropped crm_mug5e2u6m026_test

- eval: E2
  run_id: mug5e432fn97
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zwk_trung_hai_khuon
  verified_at: 2026-09-24T23:12:49Z
  output: |
    15 expect() calls
    Ran 4 tests across 1 file. [289.00ms]
    test-run: dropped crm_mug5e432fn97_test

- eval: E3
  run_id: mug5e3rtld4m
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zwk_sai_khuon_log
  verified_at: 2026-09-24T23:12:49Z
  output: |
    29 expect() calls
    Ran 2 tests across 1 file. [260.00ms]
    test-run: dropped crm_mug5e3rtld4m_test

- eval: E4
  run_id: mug5e48eq2ew
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zwk_gia_khuon_that
  verified_at: 2026-09-24T23:12:49Z
  output: |
    211 expect() calls
    Ran 60 tests across 2 files. [2.60s]
    test-run: dropped crm_mug5e48eq2ew_test

- eval: E5
  run_id: minted-zalo-webhook-doc-khuon-that-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zwk_tai_lieu
  verified_at: 2026-09-24T23:12:49Z
  output: |
    tai-lieu zalo-webhook-doc-khuon-that: xanh
    EXIT_CODE=0

- eval: E6
  run_id: minted-zalo-webhook-doc-khuon-that-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.zwk_giu_da_ky
  verified_at: 2026-09-24T23:12:49Z
  output: |
    giu-da-ky: xanh (moc 43ef79bd)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-zalo-webhook-doc-khuon-that-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-24T23:12:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-webhook-doc-khuon-that-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T23:12:49Z

- cmd: bun run lint:slop
  run_id: minted-zalo-webhook-doc-khuon-that-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T23:12:49Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-webhook-doc-khuon-that-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T23:12:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E6 và bốn lệnh suite (test, lint, lint:slop, build) đều pass ở lần chạy đầu tiên của round này; không có vòng sửa nào trước round 1.
