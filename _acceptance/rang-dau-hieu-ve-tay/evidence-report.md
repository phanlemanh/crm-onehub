---
schema_version: 2
feature_slug: rang-dau-hieu-ve-tay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5a177fbbaf3c88f543336ab41c8898d93b24919e
human_signoff:
---

# Evidence Report: rang-dau-hieu-ve-tay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-rang-dau-hieu-ve-tay-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E2
  run_id: minted-rang-dau-hieu-ve-tay-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E3
  run_id: minted-rang-dau-hieu-ve-tay-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E4
  run_id: minted-rang-dau-hieu-ve-tay-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E5
  run_id: minted-rang-dau-hieu-ve-tay-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk5_quet
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: cd apps/app && bun test ./test/dau-hieu-ve-tay.spec.ts
    Ran 6 tests across 1 file. [11.00ms]

- eval: E6
  run_id: minted-rang-dau-hieu-ve-tay-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E7
  run_id: minted-rang-dau-hieu-ve-tay-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bk5_quet
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: cd apps/app && bun test ./test/dau-hieu-ve-tay.spec.ts
    Ran 6 tests across 1 file. [11.00ms]

- eval: E8
  run_id: minted-rang-dau-hieu-ve-tay-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk5_luat
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs
    DAT tat ca

- eval: E9
  run_id: minted-rang-dau-hieu-ve-tay-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bk5_app_test
  verified_at: 2026-11-01T08:17:49Z
  output: |
    cmd: cd apps/app && bun test -t 'dau-hieu-ve-tay cay-that'
    Ran 1 test across 109 files. [3.93s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bun run lint:slop
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

- cmd: bunx turbo run build --force
  run_id: minted-rang-dau-hieu-ve-tay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-01T08:17:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- node _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs: bo qua baseline: tep _acceptance/rang-dau-hieu-ve-tay/rang/luat-lint.mjs co o cay dang kiem nhung chua co o merge-base ac0be9406cddb52d7118b54606464990f2dc17c1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/dau-hieu-ve-tay.spec.ts: bo qua baseline: tep apps/app/test/dau-hieu-ve-tay.spec.ts co o cay dang kiem nhung chua co o merge-base ac0be9406cddb52d7118b54606464990f2dc17c1 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 9 evals passed; no failures, no judgment items pending.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp onehub 9752bef05
run_id: repin-20261101T085716Z-63449
sha: 5a177fbbaf3c88f543336ab41c8898d93b24919e · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
