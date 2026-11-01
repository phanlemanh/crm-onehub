---
schema_version: 2
feature_slug: paths-chet-chin-ho-so
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4211285b79d864da5950d9b516dd534c74284986
human_signoff:
---

# Evidence Report: paths-chet-chin-ho-so

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
  run_id: minted-paths-chet-chin-ho-so-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_chet
  verified_at: 2026-11-01T00:41:14Z
  output: |
    MUC CHET: 0

- eval: E2
  run_id: minted-paths-chet-chin-ho-so-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_hai_chieu
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38: 286 DUNG, 0 SAI

- eval: E3
  run_id: minted-paths-chet-chin-ho-so-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_hai_chieu
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38: 286 DUNG, 0 SAI

- eval: E4
  run_id: minted-paths-chet-chin-ho-so-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_chi_paths
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38 chi-paths: 18 DUNG, 0 SAI

- eval: E5
  run_id: minted-paths-chet-chin-ho-so-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_chi_paths
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38 chi-paths: 18 DUNG, 0 SAI

- eval: E6
  run_id: minted-paths-chet-chin-ho-so-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_so_hong
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38 so-hong: goc 4 dong hong, nay 0; 0 loi

- eval: E7
  run_id: minted-paths-chet-chin-ho-so-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.f38_ghim
  verified_at: 2026-11-01T00:41:14Z
  output: |
    KET LUAN F38 ghim: 10 DUNG, 0 SAI

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-paths-chet-chin-ho-so-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-paths-chet-chin-ho-so-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-paths-chet-chin-ho-so-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-paths-chet-chin-ho-so-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-paths-chet-chin-ho-so-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bun run lint:slop
  run_id: minted-paths-chet-chin-ho-so-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

- cmd: bunx turbo run build --force
  run_id: minted-paths-chet-chin-ho-so-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-01T00:41:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều không phân biệt được trên baseline vì baseline không đo (xem dưới); không eval nào được xác nhận là xanh trên cả hai phía.

Baseline khong do
- bun _acceptance/paths-chet-chin-ho-so/rang/chet.mjs: bo qua baseline: tep _acceptance/paths-chet-chin-ho-so/rang/chet.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/paths-chet-chin-ho-so/rang/hai-chieu.mjs: bo qua baseline: tep _acceptance/paths-chet-chin-ho-so/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/paths-chet-chin-ho-so/rang/chi-paths.mjs: bo qua baseline: tep _acceptance/paths-chet-chin-ho-so/rang/chi-paths.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/paths-chet-chin-ho-so/rang/so-hong.mjs: bo qua baseline: tep _acceptance/paths-chet-chin-ho-so/rang/so-hong.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/paths-chet-chin-ho-so/rang/ghim.mjs: bo qua baseline: tep _acceptance/paths-chet-chin-ho-so/rang/ghim.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E7 đều đạt, bảy lệnh suite đều xanh. Không cần vòng thêm.
