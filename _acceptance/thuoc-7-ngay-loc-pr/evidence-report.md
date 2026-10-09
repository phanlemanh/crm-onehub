---
schema_version: 2
feature_slug: thuoc-7-ngay-loc-pr
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1e7bfbd33713420604688f717d4172802c7f325b
human_signoff:
---

# Evidence Report: thuoc-7-ngay-loc-pr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4, AC-5 | script | PASS |
| E2 | AC-1, AC-2, AC-3, AC-6 | script | PASS |
| E3 | AC-4, AC-5 | script | PASS |
| E4 | AC-2, AC-7 | script | PASS |
| E5 | AC-8 | script | PASS |
| E6 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-7-ngay-loc-pr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_don_vi
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node --test _acceptance/thuoc-7-ngay-loc-pr/rang/do-7-ngay.test.mjs
    ℹ duration_ms 58.405959

- eval: E2
  run_id: minted-thuoc-7-ngay-loc-pr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_cua_so_cu
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node _acceptance/thuoc-7-ngay-loc-pr/rang/cua-so-cu.mjs
    cua-so-cu: XANH

- eval: E3
  run_id: minted-thuoc-7-ngay-loc-pr-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_mac_dinh
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node _acceptance/thuoc-7-ngay-loc-pr/rang/mac-dinh.mjs
    mac-dinh: XANH

- eval: E4
  run_id: minted-thuoc-7-ngay-loc-pr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_loi_gh
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node _acceptance/thuoc-7-ngay-loc-pr/rang/gh-gia.mjs
    gh-gia: XANH

- eval: E5
  run_id: minted-thuoc-7-ngay-loc-pr-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_phan_trang
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node _acceptance/thuoc-7-ngay-loc-pr/rang/phan-trang.mjs
    phan-trang: XANH

- eval: E6
  run_id: minted-thuoc-7-ngay-loc-pr-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.t7n_noi_f21
  verified_at: 2026-10-09T11:01:37Z
  output: |
    cmd: node _acceptance/thuoc-7-ngay-loc-pr/rang/noi-f21.mjs
    noi-f21: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bunx turbo run lint --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-7-ngay-loc-pr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T11:01:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (cả sáu eval là deterministic, một lần chạy)

## Iterations

Round 1: E1, E2, E3, E4, E5, E6 đều xanh trên cây 1e7bfbd33713420604688f717d4172802c7f325b, bảy lệnh suite hồi quy xanh; không có mục judgment. Verdict PASS.
