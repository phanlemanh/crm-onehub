---
schema_version: 2
feature_slug: zalo-bom-gio
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2421a627dd97b87fe40de08546e5c721b87f6836
human_signoff:
---

# Evidence Report: zalo-bom-gio

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: mv1s3rfnf1w6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.h5_zalo
  verified_at: 2026-10-10T02:32:02Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/zalo-qua-webhook.integration.spec.ts"
    test-run: dropped crm_mv1s3rfnf1w6_test
    __EXIT=0

- eval: E2
  run_id: minted-zalo-bom-gio-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.h5_hai_moc
  verified_at: 2026-10-10T02:32:02Z
  output: |
    cmd: bun run test -- "bash _acceptance/zalo-bom-gio/rang/hai-moc.sh"
    test-run: dropped crm_mv1s3r0emq0e_test
    __EXIT=0

- eval: E3
  run_id: minted-zalo-bom-gio-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.h5_chi_tep_kiem
  verified_at: 2026-10-10T02:32:02Z
  output: |
    apps/agent/test/zalo-qua-webhook.integration.spec.ts
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-zalo-bom-gio-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-zalo-bom-gio-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-zalo-bom-gio-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-zalo-bom-gio-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-bom-gio-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bun run lint:slop
  run_id: minted-zalo-bom-gio-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-bom-gio-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T02:32:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt), trừ E2 mà baseline là n-a (không chạy được trên mã cũ). Các lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 đều đạt, bảy lệnh suite xanh. Không có eval hỏng, không có mục chờ người quyết.
