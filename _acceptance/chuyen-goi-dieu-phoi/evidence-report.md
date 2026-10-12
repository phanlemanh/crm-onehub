---
schema_version: 2
feature_slug: chuyen-goi-dieu-phoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: efb35a7d57ca6e75c530fb7af99a3a97f6be7aa4
human_signoff: "Phan Le Manh 2026-10-12 — ký Cổng Bằng chứng trên vòng chấm 3 (10/10 eval đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng). Ngoài-2, 4, 5, 7, 15, 16, 19, 20 ghi Known limits; Ngoài-3, 18 mở hợp đồng mới; Ngoài-1, 6, 8–14, 17, 21, 22 chấp nhận, không sửa; đồng ý cắt; Treo phê hết"
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
  run_id: minted-chuyen-goi-dieu-phoi-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_kiem_chuyen
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E2
  run_id: minted-chuyen-goi-dieu-phoi-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_mo_dun
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E3
  run_id: minted-chuyen-goi-dieu-phoi-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_hook
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E4
  run_id: minted-chuyen-goi-dieu-phoi-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_cong
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E5
  run_id: minted-chuyen-goi-dieu-phoi-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_kiem_cheo
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E6
  run_id: minted-chuyen-goi-dieu-phoi-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_goi_vang
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E7
  run_id: minted-chuyen-goi-dieu-phoi-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_luot_kho
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E8
  run_id: minted-chuyen-goi-dieu-phoi-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_goi_dot
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E9
  run_id: minted-chuyen-goi-dieu-phoi-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_thay_boi
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

- eval: E10
  run_id: minted-chuyen-goi-dieu-phoi-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cgdp_khong_do_them
  verified_at: 2026-10-12T10:29:14Z
  output: |
    KET LUAN: xanh
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bun run lint:slop
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

- cmd: bunx turbo run build --force
  run_id: minted-chuyen-goi-dieu-phoi-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-12T10:29:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không eval nào chạy nhiều lượt (mọi eval chạy một lượt, xác định), nên không có pass_rate lẫn lộn

## Iterations

Round 1: E1 đến E10 và 7 lệnh suite đều xanh trên cây 1aa6be864f26094e17dfeb569de915e4c188d356. Ba phát hiện trong hợp đồng về độ phủ của thước (E3, E6, E9) được sửa trong thước ở d12a31ceb, không phải ở mã tính năng.
Round 2: E1 đến E10 và 7 lệnh suite đều xanh trên cây 95910b71b025b6988e946cfe597905d12e02c014, sau khi thước E3, E6, E9 được sửa; mọi eval tính năng đều đỏ trên baseline. Không có eval đỏ, không cần quay lại implementation.
Round 3: E1 đến E10 và 7 lệnh suite đều xanh trên cây 9b8bedcee819f5688b543ffe08f534c50890a186, sau khi thước được mở rộng phủ đủ 110 dòng eval nhắc bộ cũ và neo merge-base được tính lúc đo (neoVong) thay cho sha cố định; mọi eval tính năng vẫn đỏ trên baseline. Không có eval đỏ, không cần quay lại implementation.

### Re-pin lần 1 — 2026-10-12, do chuyen-goi-dieu-phoi: ghim lại sau khi gỡ scripts/dieu-phoi và nhận kit 2.28.0
run_id: repin-20261012T222532Z-81286
sha: efb35a7d57ca6e75c530fb7af99a3a97f6be7aa4 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
