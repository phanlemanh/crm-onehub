---
schema_version: 2
feature_slug: kiem-cheo-sau-gop
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 35f8c0046ea784b33793ce24e1e270c4ce4f2892
human_signoff:
---

# Evidence Report: kiem-cheo-sau-gop

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4, AC-7, AC-9, AC-10 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-6, AC-8 | script | PASS |
| E4 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-kiem-cheo-sau-gop-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kcs_don_vi
  verified_at: 2026-10-08T08:36:36Z
  output: |
    cmd: node --test "scripts/kiem-cheo/test/*.test.mjs"
    ℹ duration_ms 2032.042667

- eval: E2
  run_id: minted-kiem-cheo-sau-gop-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kcs_lich
  verified_at: 2026-10-08T08:36:36Z
  output: |
    cmd: node --test scripts/dieu-phoi/test/lich.test.mjs
    ℹ duration_ms 55.611584

- eval: E3
  run_id: minted-kiem-cheo-sau-gop-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcs_pha_thu
  verified_at: 2026-10-08T08:36:36Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs
    pha-thu: moi o dat

- eval: E4
  run_id: minted-kiem-cheo-sau-gop-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcs_ranh_gioi
  verified_at: 2026-10-08T08:36:36Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs
    ranh-gioi: ban that sach, ba chieu do do dung cho

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bun run lint:slop
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

- cmd: bunx turbo run build --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T08:36:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline diffBase, chứng minh harness chứ chưa chứng minh feature; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1 (`node --test "scripts/kiem-cheo/test/*.test.mjs"`): baseline green
- E2 (`node --test scripts/dieu-phoi/test/lich.test.mjs`): baseline green

E3 và E4 đều red trên baseline (có phân biệt). Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval đều chạy một lần và xác định (runs: 1), không có eval nào pass_rate lẫn.

## Iterations

Round 1: cả bốn eval máy (E1 đến E4) và bảy lệnh suite đều xanh; verdict REJECT vì bước review tìm thấy phát hiện trong hợp đồng mức cao (AC-1, AC-4, AC-8, AC-9) mà eval hiện có không bắt được. Chi tiết ở review-findings.md. Trả về triển khai.
