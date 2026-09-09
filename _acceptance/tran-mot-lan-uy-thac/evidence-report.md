---
schema_version: 2
feature_slug: tran-mot-lan-uy-thac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9700aea6095e857bd0850842fe347c0b3fb885af
human_signoff:
---

# Evidence Report: tran-mot-lan-uy-thac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tran-mot-lan-uy-thac-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_khong_quyen_chan_lan_hai
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [75.00ms]

- eval: E2
  run_id: minted-tran-mot-lan-uy-thac-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_co_quyen_khong_hoi_quy
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [59.00ms]

- eval: E3
  run_id: minted-tran-mot-lan-uy-thac-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_lan_mot_van_lot
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [56.00ms]

- eval: E4
  run_id: minted-tran-mot-lan-uy-thac-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_lap_callid
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [55.00ms]

- eval: E5
  run_id: minted-tran-mot-lan-uy-thac-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_luot_moi
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [58.00ms]

- eval: E6
  run_id: minted-tran-mot-lan-uy-thac-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_ngoai_kenh_builder
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     7 expect() calls
    Ran 1 test across 1 file. [78.00ms]

- eval: E7
  run_id: minted-tran-mot-lan-uy-thac-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_cung_mot_batch
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [59.00ms]

- eval: E8
  run_id: minted-tran-mot-lan-uy-thac-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_mot_cau_thong_diep
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [61.00ms]

- eval: E9
  run_id: minted-tran-mot-lan-uy-thac-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_khong_co_loi_goi
  verified_at: 2026-09-09T09:00:00Z
  output: |
     0 fail
     11 expect() calls
    Ran 2 tests across 1 file. [111.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_check_types_force-r1
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 9 evals (E1-E9) and 5 suite commands (test, check-types, lint, lint:slop, build) passed on first attempt — no failures, no BLOCKED runs.
