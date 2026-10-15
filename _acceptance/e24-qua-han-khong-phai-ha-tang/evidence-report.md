---
schema_version: 2
feature_slug: e24-qua-han-khong-phai-ha-tang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d49983959997e414e1dd8e5d9f116a923cb54b5a
human_signoff:
---

# Evidence Report: e24-qua-han-khong-phai-ha-tang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-e24-qua-han-khong-phai-ha-tang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.eqh_qua_han
  verified_at: 2026-10-15T12:15:46Z
  output: |
    bun _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs
    DAT

- eval: E2
  run_id: minted-e24-qua-han-khong-phai-ha-tang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.eqh_phan_loai
  verified_at: 2026-10-15T12:15:46Z
  output: |
    bun test ./_acceptance/e24-qua-han-khong-phai-ha-tang/rang/kiem.test.ts -t eqh-phan-loai
    Ran 2 tests across 1 file. [76.00ms]

- eval: E3
  run_id: minted-e24-qua-han-khong-phai-ha-tang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.eqh_khong_qua_han
  verified_at: 2026-10-15T12:15:46Z
  output: |
    bun _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs --khong-qua-han
    DAT

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bun run lint:slop
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

- cmd: bunx turbo run build --force
  run_id: minted-e24-qua-han-khong-phai-ha-tang-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T12:15:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả HEAD lẫn baseline; cả ba eval feature đều baseline n-a (không đo được trên baseline), nên chưa có bằng chứng "không phân biệt".

Baseline khong do

- bun _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs: bo qua baseline: tep _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs co o cay dang kiem nhung chua co o merge-base 1be143a82d5332f8b63fbc78d38af9d179f3f342 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/e24-qua-han-khong-phai-ha-tang/rang/kiem.test.ts -t eqh-phan-loai: bo qua baseline: tep _acceptance/e24-qua-han-khong-phai-ha-tang/rang/kiem.test.ts co o cay dang kiem nhung chua co o merge-base 1be143a82d5332f8b63fbc78d38af9d179f3f342 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs --khong-qua-han: bo qua baseline: tep _acceptance/e24-qua-han-khong-phai-ha-tang/rang/qua-han.mjs co o cay dang kiem nhung chua co o merge-base 1be143a82d5332f8b63fbc78d38af9d179f3f342 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: E1, E2, E3 và bảy lệnh suite đều đạt. Không có eval hỏng.
