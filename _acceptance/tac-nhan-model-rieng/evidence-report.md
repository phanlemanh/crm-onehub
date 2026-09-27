---
schema_version: 2
feature_slug: tac-nhan-model-rieng
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 05fff5fd3ded8eaf950c2bd95cfe0335421917b6
human_signoff: Manh Phan 2026-09-27
---

# Evidence Report: tac-nhan-model-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: mujj2izxvalt
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_khuon_di_dong
  verified_at: 2026-09-27T07:21:11Z
  output: |
    20 expect() calls
    Ran 3 tests across 1 file. [201.00ms]
    test-run: dropped crm_mujj2izxvalt_test

- eval: E2
  run_id: minted-tac-nhan-model-rieng-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tnm_goi_that
  verified_at: 2026-09-27T07:21:11Z
  output: |
    google/gemini-3.8-flash ok
    zai/glm-5.2-fast ok
    openai/gpt-5-mini ok

- eval: E3
  run_id: mujj2j92mvae
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_ket_qua_phang
  verified_at: 2026-09-27T07:21:11Z
  output: |
    12 expect() calls
    Ran 4 tests across 1 file. [81.00ms]
    test-run: dropped crm_mujj2j92mvae_test

- eval: E4
  run_id: mujj2is5frls
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_bao_loi
  verified_at: 2026-09-27T07:21:11Z
  output: |
    29 expect() calls
    Ran 4 tests across 1 file. [481.00ms]
    test-run: dropped crm_mujj2is5frls_test

- eval: E5
  run_id: mujj2j7bcxsx
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_chua_nop
  verified_at: 2026-09-27T07:21:11Z
  output: |
    9 expect() calls
    Ran 3 tests across 1 file. [312.00ms]
    test-run: dropped crm_mujj2j7bcxsx_test

- eval: E6
  run_id: mujj2j289r4o
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_doi_sau_khi_dung
  verified_at: 2026-09-27T07:21:11Z
  output: |
    7 expect() calls
    Ran 3 tests across 1 file. [382.00ms]
    test-run: dropped crm_mujj2j289r4o_test

- eval: E7
  run_id: mujj2jj0xsvm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tnm_bon_phien
  verified_at: 2026-09-27T07:21:11Z
  output: |
    18 expect() calls
    Ran 2 tests across 1 file. [329.00ms]
    test-run: dropped crm_mujj2jj0xsvm_test

- eval: E8
  run_id: minted-tac-nhan-model-rieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tnm_tai_lieu
  verified_at: 2026-09-27T07:21:11Z
  output: |
    merge-base dieu 1: khong dat (dung)
    merge-base dieu 2: khong dat (dung)
    merge-base dieu 4: khong dat (dung)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mujj2hpqixch
  exit_code: 0
  verified_at: 2026-09-27T07:21:11Z

- cmd: bunx turbo run lint --force
  run_id: minted-tac-nhan-model-rieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-27T07:21:11Z

- cmd: bun run lint:slop
  run_id: minted-tac-nhan-model-rieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-27T07:21:11Z

- cmd: bunx turbo run build --force
  run_id: minted-tac-nhan-model-rieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-27T07:21:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: All evals passed (E1-E8) plus regression suite (bun run test, turbo lint, lint:slop, turbo build) — no returns to implementation.
