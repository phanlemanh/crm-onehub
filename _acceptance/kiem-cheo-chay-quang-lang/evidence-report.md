---
schema_version: 2
feature_slug: kiem-cheo-chay-quang-lang
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7bb5ddf7065198da2c89f69d75dde64c1fc76ebd
human_signoff:
---

# Evidence Report: kiem-cheo-chay-quang-lang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2, AC-3, AC-5 | script | PASS |
| E3 | AC-2, AC-3, AC-4, AC-5, AC-7 | script | PASS |
| E4 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-kiem-cheo-chay-quang-lang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_lich
  verified_at: 2026-10-10T04:05:53Z
  output: |
    node --test scripts/dieu-phoi/test/lich.test.mjs
    ℹ duration_ms 59.735875

- eval: E2
  run_id: minted-kiem-cheo-chay-quang-lang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_tien_do
  verified_at: 2026-10-10T04:05:53Z
  output: |
    node --test scripts/kiem-cheo/test/tien-do.test.mjs
    ℹ duration_ms 56.083917

- eval: E3
  run_id: minted-kiem-cheo-chay-quang-lang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_hai_dem
  verified_at: 2026-10-10T04:05:53Z
  output: |
    node --test scripts/kiem-cheo/test/dem.test.mjs
    ℹ duration_ms 21144.174042

- eval: E4
  run_id: minted-kiem-cheo-chay-quang-lang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_noi_f9
  verified_at: 2026-10-10T04:05:53Z
  output: |
    node _acceptance/kiem-cheo-chay-quang-lang/rang/noi-f9.mjs
    noi-f9: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bun run lint:slop
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

- cmd: bunx turbo run build --force
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-10T04:05:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (xanh tren ca code moi lan baseline cuoi cua round 1; chung minh harness chu chua chung minh feature, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- E1 (node --test scripts/dieu-phoi/test/lich.test.mjs)
- E3 (node --test scripts/kiem-cheo/test/dem.test.mjs)

Cac lenh suite xanh tren ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — moi eval chay mot lan, deterministic, khong eval nao co pass_rate hon hop.

## Judge

Khong co eval judgment nao trong hop dong nay (ca bon eval E1 den E4 deu la executor script), nen khong co hoi dong judge va khong co muc nao cho human_override.

## Iterations

Round 1: E2, E3 REJECT — t4, t5 trong AC-2 (phan loai tung ho so khi lan cham tran, vuot tran van phai luu tien do; tran lan phai nho hon tran luot). Returned to implementation (commit 774922da5: phan loai tung ho so, vuot tran van luu tien do, lan tran 60 phut, doc suite chay lai).
Round 2: E1, E2, E3, E4 PASS va bay lenh suite xanh tren cay 7bb5ddf7.
