---
schema_version: 2
feature_slug: ngay-lich-test-tao-ke-hoach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2e908a3b22096847103de183cc6020bd359142b1
human_signoff:
---

# Evidence Report: ngay-lich-test-tao-ke-hoach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngay-lich-test-tao-ke-hoach-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nltk_ba_ngay
  verified_at: 2026-10-14T21:55:34Z
  cmd: bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs
  output: |
    DAT

- eval: E2
  run_id: minted-ngay-lich-test-tao-ke-hoach-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nltk_ba_ngay
  verified_at: 2026-10-14T21:55:34Z
  cmd: bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs
  output: |
    DAT

- eval: E3
  run_id: minted-ngay-lich-test-tao-ke-hoach-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nltk_pham_vi
  verified_at: 2026-10-14T21:55:34Z
  cmd: bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs --pham-vi
  output: |
    DAT

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bun run lint:slop
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

- cmd: bunx turbo run build --force
  run_id: minted-ngay-lich-test-tao-ke-hoach-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T21:55:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào green trên cả baseline lẫn HEAD; ba eval feature đều n-a trên baseline vì là eval mới (xem mục dưới), nên chưa có đối chiếu đỏ/xanh từ máy.

Baseline khong do:
- bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs: bo qua baseline: tep _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs --pham-vi: bo qua baseline: tep _acceptance/ngay-lich-test-tao-ke-hoach/rang/ba-ngay.mjs co o cay dang kiem nhung chua co o merge-base c1864a3a2e726d20c65fcd8f91596ae1966cd755 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 đều đạt; bảy lệnh suite hồi quy đều xanh. Không có eval hỏng, không có mục chờ người.
