---
schema_version: 2
feature_slug: heap-lenh-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 293fc8e7a0e0e75bf5995998ce2b80bda15b146b
human_signoff:
---

# Evidence Report: heap-lenh-dung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-heap-lenh-dung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hld_build_heap
  verified_at: 2026-10-05T05:53:15Z
  output: |
    XANH: heap 6144 MB · dung app ma 0 · app:build qua pha type-check

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-heap-lenh-dung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bun run lint:slop
  run_id: minted-heap-lenh-dung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

- cmd: bunx turbo run build --force
  run_id: minted-heap-lenh-dung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-05T05:53:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

none — khong eval nao duoc liet ke la khong-phan-biet (baseline khong do lai round nay; cac lenh suite xanh o ca hai phia la regression-guard binh thuong).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lệnh suite lint:slop đỏ — trả về implementation.
Round 2: toàn bộ E1 và bảy lệnh suite xanh trên cây 293fc8e7a0e0e75bf5995998ce2b80bda15b146b — verdict PASS.
