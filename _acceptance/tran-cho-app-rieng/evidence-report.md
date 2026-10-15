---
schema_version: 2
feature_slug: tran-cho-app-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1c6cdc4018dfdedadec3dd45fc6349286d5941ac
human_signoff:
---

# Evidence Report: tran-cho-app-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: mv8va64t93up
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tca_cham_health
  verified_at: 2026-10-15T01:35:22Z
  output: |
    bun run test -- "bun _acceptance/tran-cho-app-rieng/rang/cham-health.mjs"
    test-run: dropped crm_mv8va64t93up_test

- eval: E2
  run_id: mv8va64t93up
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tca_cham_health
  verified_at: 2026-10-15T01:35:22Z
  output: |
    bun run test -- "bun _acceptance/tran-cho-app-rieng/rang/cham-health.mjs"
    test-run: dropped crm_mv8va64t93up_test

- eval: E3
  run_id: minted-tran-cho-app-rieng-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tca_pham_vi
  verified_at: 2026-10-15T01:35:22Z
  output: |
    bun _acceptance/tran-cho-app-rieng/rang/cham-health.mjs --pham-vi
    DAT

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tran-cho-app-rieng-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tran-cho-app-rieng-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tran-cho-app-rieng-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tran-cho-app-rieng-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bunx turbo run lint --force
  run_id: minted-tran-cho-app-rieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bun run lint:slop
  run_id: minted-tran-cho-app-rieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-cho-app-rieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T01:35:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- bun _acceptance/tran-cho-app-rieng/rang/cham-health.mjs --pham-vi: bo qua baseline: tep _acceptance/tran-cho-app-rieng/rang/cham-health.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 passed and every suite command passed. No failed eval, no judgment item pending.
