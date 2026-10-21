---
schema_version: 2
feature_slug: model-theo-vai-do-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0e927311990f9045dbd66674e9e0d69a6f552621
human_signoff:
---

# Evidence Report: model-theo-vai-do-lai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-model-theo-vai-do-lai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E2
  run_id: minted-model-theo-vai-do-lai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E3
  run_id: minted-model-theo-vai-do-lai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E4
  run_id: minted-model-theo-vai-do-lai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E5
  run_id: minted-model-theo-vai-do-lai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E6
  run_id: minted-model-theo-vai-do-lai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_so
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts
    dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung

- eval: E7
  run_id: minted-model-theo-vai-do-lai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mtv_pham_vi
  verified_at: 2026-10-21T03:32:37Z
  output: |
    bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts --pham-vi
    pham vi: chi ho so, docs/model-theo-vai.md va dong them config.yaml; sua tam da tra; hai tep khai model OKR khong lech origin/onehub

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-model-theo-vai-do-lai-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-model-theo-vai-do-lai-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-model-theo-vai-do-lai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-model-theo-vai-do-lai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-model-theo-vai-do-lai-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bun run lint:slop
  run_id: minted-model-theo-vai-do-lai-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

- cmd: bunx turbo run build --force
  run_id: minted-model-theo-vai-do-lai-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-21T03:32:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào được đo là xanh ở cả hai phía; cả hai lệnh feature (E1–E6 và E7) đều baseline n-a vì là eval mới, xem mục dưới.

Baseline khong do
- bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts: bo qua baseline: tep _acceptance/model-theo-vai-do-lai/rang/so-do.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/model-theo-vai-do-lai/rang/so-do.ts --pham-vi: bo qua baseline: tep _acceptance/model-theo-vai-do-lai/rang/so-do.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — chi phi phan ung vien bo so hang doc cache nen lech AC-5; sua o commit 0e9273119.
Round 2: PASS — E1 đến E7 và bảy lệnh suite đều xanh trên 0e927311990f9045dbd66674e9e0d69a6f552621.

