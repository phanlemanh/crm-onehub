---
schema_version: 2
feature_slug: chuyen-goi-dieu-phoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1aa6be864f26094e17dfeb569de915e4c188d356
human_signoff:
---

# Evidence Report: chuyen-goi-dieu-phoi

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
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chuyen-goi-dieu-phoi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_kiem_chuyen
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E2
  run_id: minted-chuyen-goi-dieu-phoi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_mo_dun
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E3
  run_id: minted-chuyen-goi-dieu-phoi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_hook
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E4
  run_id: minted-chuyen-goi-dieu-phoi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_cong
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E5
  run_id: minted-chuyen-goi-dieu-phoi-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_kiem_cheo
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E6
  run_id: minted-chuyen-goi-dieu-phoi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_goi_vang
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E7
  run_id: minted-chuyen-goi-dieu-phoi-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_luot_kho
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E8
  run_id: minted-chuyen-goi-dieu-phoi-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_goi_dot
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E9
  run_id: minted-chuyen-goi-dieu-phoi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_thay_boi
  verified_at: 2026-10-12T05:44:04Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E10
  run_id: minted-chuyen-goi-dieu-phoi-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_khong_do_them
  verified_at: 2026-10-12T05:44:04Z
  output: |
    EXIT=0
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bunx turbo run lint --force
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bun run lint:slop
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

- cmd: bunx turbo run build --force
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-12T05:44:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không eval nào chạy nhiều lượt (mọi eval chạy một lượt, xác định), nên không có pass_rate lẫn lộn

## Iterations

Round 1: E1 đến E10 và 7 lệnh suite đều xanh trên cây 1aa6be864f26094e17dfeb569de915e4c188d356. Không có eval đỏ, không cần quay lại implementation.
