---
schema_version: 2
feature_slug: deal-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 86c1bf66643d1430bf6cd73e330e93f9195d450b
human_signoff:
---

# Evidence Report: deal-va

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-deal-va-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_khoa
  verified_at: 2026-10-08T16:36:06Z
  output: |
    Ran 3 tests across 1 file. [16.00ms]

- eval: E2
  run_id: muzre2vt0abe
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_rollup
  verified_at: 2026-10-08T16:36:06Z
  output: |
    test-run: dropped crm_muzre2vt0abe_test

- eval: E3
  run_id: minted-deal-va-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_tai_lieu
  verified_at: 2026-10-08T16:36:06Z
  output: |
    Ran 1 test across 1 file. [16.00ms]

- eval: E4
  run_id: muzre2orqsj5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_agent
  verified_at: 2026-10-08T16:36:06Z
  output: |
    test-run: dropped crm_muzre2orqsj5_test

- eval: E5
  run_id: minted-deal-va-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_ban_ghi
  verified_at: 2026-10-08T16:36:06Z
  output: |
    Ran 3 tests across 1 file. [75.00ms]

- eval: E6
  run_id: minted-deal-va-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_cham_mau
  verified_at: 2026-10-08T16:36:06Z
  output: |
    Ran 2 tests across 1 file. [1457.00ms]

- eval: E7
  run_id: minted-deal-va-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dva_hoi_quy
  verified_at: 2026-10-08T16:36:06Z
  output: |
    Ran 65 tests across 5 files. [12.35s]

- eval: E8
  run_id: design-gate-063fa74c21
  exit_code: 0
  baseline: green
  verifier: config:executors.script.dva_san_thiet_ke
  verified_at: 2026-10-08T16:36:06Z
  output: |
    design-gate static tren deal-list-result.tsx: lenh thoat sach, khong P0.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-deal-va-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-deal-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-deal-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-deal-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-deal-va-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bun run lint:slop
  run_id: minted-deal-va-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

- cmd: bunx turbo run build --force
  run_id: minted-deal-va-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T16:36:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

E8 (design-gate static tren apps/app/components/agent-builder/deal-list-result.tsx): baseline green. Eval pass tren ca HEAD lan code cu, nen no chung minh harness thiet ke chu khong phai hanh vi moi cua feature. Day la regression-guard co chu y cho AC-8 (khong them P0 ve thiet ke); nhung E1 den E7 deu red tren baseline (co phan biet) mo ta hanh vi moi.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong eval nao ngau nhien)

## Iterations

Round 1: E1 den E8 va bay lenh suite deu xanh; verdict PASS.
