---
schema_version: 2
feature_slug: ci-test-het-do-co-dinh
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: de2290579a2d5eec211d38f5a3c8d9c9d5bca7a2
human_signoff:
---

# Evidence Report: ci-test-het-do-co-dinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ci-test-het-do-co-dinh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_phat_lai_ui
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs --chi-ui
    DAT tat ca

- eval: E2
  run_id: minted-ci-test-het-do-co-dinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_dong_ho_tran
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/dong-ho-va-tran.mjs
    DAT tat ca

- eval: E3
  run_id: minted-ci-test-het-do-co-dinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_dong_ho_tran
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/dong-ho-va-tran.mjs
    DAT tat ca

- eval: E4
  run_id: minted-ci-test-het-do-co-dinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_ro_ri
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs
    DAT tat ca

- eval: E5
  run_id: minted-ci-test-het-do-co-dinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_ro_ri
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs
    DAT tat ca

- eval: E6
  run_id: minted-ci-test-het-do-co-dinh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_ro_ri
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs
    DAT tat ca

- eval: E7
  run_id: minted-ci-test-het-do-co-dinh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_ro_ri
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs
    DAT tat ca

- eval: E8
  run_id: 41191965481
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_phat_lai_api
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs --chi-api
    DAT tat ca

- eval: E9
  run_id: minted-ci-test-het-do-co-dinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctd_rieng_ba_luot
  verified_at: 2026-10-31T13:40:02Z
  output: |
    node _acceptance/ci-test-het-do-co-dinh/rang/rieng-ba-luot.mjs
    DAT tat ca

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: mvwgm8e098il
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bun run lint:slop
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

- cmd: bunx turbo run build --force
  run_id: minted-ci-test-het-do-co-dinh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-31T13:40:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- node _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs --chi-ui: bo qua baseline: tep _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs co o cay dang kiem nhung chua co o merge-base ed4e85288fede8e72f5dfb3846d7bf18249d78c2 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ci-test-het-do-co-dinh/rang/dong-ho-va-tran.mjs: bo qua baseline: tep _acceptance/ci-test-het-do-co-dinh/rang/dong-ho-va-tran.mjs co o cay dang kiem nhung chua co o merge-base ed4e85288fede8e72f5dfb3846d7bf18249d78c2 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs: bo qua baseline: tep _acceptance/ci-test-het-do-co-dinh/rang/ro-ri.mjs co o cay dang kiem nhung chua co o merge-base ed4e85288fede8e72f5dfb3846d7bf18249d78c2 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs --chi-api: bo qua baseline: tep _acceptance/ci-test-het-do-co-dinh/rang/phat-lai-thu-tu.mjs co o cay dang kiem nhung chua co o merge-base ed4e85288fede8e72f5dfb3846d7bf18249d78c2 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ci-test-het-do-co-dinh/rang/rieng-ba-luot.mjs: bo qua baseline: tep _acceptance/ci-test-het-do-co-dinh/rang/rieng-ba-luot.mjs co o cay dang kiem nhung chua co o merge-base ed4e85288fede8e72f5dfb3846d7bf18249d78c2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E9 all passed, no failed evals. Verdict PASS.
