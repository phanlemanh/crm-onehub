---
schema_version: 2
feature_slug: rang-giu-khung-ngan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a7d0be5468241b6898311a6d8927a836e11bc533
human_signoff:
---

# Evidence Report: rang-giu-khung-ngan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-rang-giu-khung-ngan-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E2
  run_id: minted-rang-giu-khung-ngan-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E3
  run_id: minted-rang-giu-khung-ngan-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E3b
  run_id: minted-rang-giu-khung-ngan-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E4
  run_id: minted-rang-giu-khung-ngan-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E5
  run_id: minted-rang-giu-khung-ngan-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E6
  run_id: minted-rang-giu-khung-ngan-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E7
  run_id: minted-rang-giu-khung-ngan-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E8
  run_id: minted-rang-giu-khung-ngan-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E9
  run_id: minted-rang-giu-khung-ngan-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E10
  run_id: minted-rang-giu-khung-ngan-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk2_luat
  verified_at: 2026-11-01T06:00:06Z
  output: |
    node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs
    DAT tat ca

- eval: E11
  run_id: minted-rang-giu-khung-ngan-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E12
  run_id: minted-rang-giu-khung-ngan-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E13
  run_id: minted-rang-giu-khung-ngan-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk2_quet
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test ./test/khung-ngan.spec.ts
    Ran 21 tests across 1 file. [589.00ms]

- eval: E14
  run_id: minted-rang-giu-khung-ngan-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bk2_app_test
  verified_at: 2026-11-01T06:00:06Z
  output: |
    cd apps/app && bun test -t 'khung-ngan proto-mau'
    Ran 1 test across 108 files. [4.59s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-rang-giu-khung-ngan-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-rang-giu-khung-ngan-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-rang-giu-khung-ngan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-rang-giu-khung-ngan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-rang-giu-khung-ngan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bun run lint:slop
  run_id: minted-rang-giu-khung-ngan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

- cmd: bunx turbo run build --force
  run_id: minted-rang-giu-khung-ngan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-01T06:00:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- node _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs: bo qua baseline: tep _acceptance/rang-giu-khung-ngan/rang/luat-lint.mjs co o cay dang kiem nhung chua co o merge-base b65feb17538cae2ba510400a3fbb7c0b9785fc5a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/khung-ngan.spec.ts: bo qua baseline: tep apps/app/test/khung-ngan.spec.ts co o cay dang kiem nhung chua co o merge-base b65feb17538cae2ba510400a3fbb7c0b9785fc5a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval deu dat, khong eval nao rot; khong co muc judgment cho nguoi. Chuyen toi Cong 2.
