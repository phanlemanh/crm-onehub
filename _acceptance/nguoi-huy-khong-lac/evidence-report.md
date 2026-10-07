---
schema_version: 2
feature_slug: nguoi-huy-khong-lac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 999190744e2722f0ec618652e5ec979bb44073ec
human_signoff: Phan Le Manh 2026-10-07 — ký Cổng Bằng chứng trên vòng chấm 1 (E1, E2, E3 đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng). Ngoài-1, Ngoài-2 ghi Known limits. Phạm vi cắt/hoãn đồng ý như đã khai.
---

# Evidence Report: nguoi-huy-khong-lac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nguoi-huy-khong-lac-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nhkl_duong_cham
  verified_at: 2026-10-07T06:04:24Z
  output: |
    cmd: bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-khong-tru-luot.spec.ts -t khong-lac-duong-cham"
    runs: 1, passes: 1
    test-run: dropped crm_muxpe46wtecg_test

- eval: E2
  run_id: minted-nguoi-huy-khong-lac-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nhkl_fetch_gia
  verified_at: 2026-10-07T06:04:24Z
  output: |
    cmd: bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-khong-tru-luot.spec.ts -t fetch-gia-theo-that"
    runs: 1, passes: 1
    test-run: dropped crm_muxpe5jowgfa_test

- eval: E3
  run_id: minted-nguoi-huy-khong-lac-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1h_huy
  verified_at: 2026-10-07T06:04:24Z
  output: |
    cmd: bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-khong-tru-luot.spec.ts -t nguoi-huy"
    runs: 1, passes: 1
    (khong co dong ket thuc nao khac tu runner)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nguoi-huy-khong-lac-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nguoi-huy-khong-lac-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nguoi-huy-khong-lac-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nguoi-huy-khong-lac-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-nguoi-huy-khong-lac-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bun run lint:slop
  run_id: minted-nguoi-huy-khong-lac-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

- cmd: bunx turbo run build --force
  run_id: minted-nguoi-huy-khong-lac-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T06:04:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

E3 (lệnh `bun run test -- "cd apps/app && export TZ=Asia/Ho_Chi_Minh && bun test ./test/soan-okr-khong-tru-luot.spec.ts -t nguoi-huy"`) xanh trên cả HEAD lẫn baseline: baseline green, nên eval này không phân biệt được code mới với code cũ. Đây là regression-guard có chủ ý cho hành vi người dùng huỷ (AC-3) đã có từ vòng soan-okr-khong-tru-luot; phần mới của vòng này (chiều thước ghim fixture dùng chung với E1) vẫn được E1 và E2 chứng minh vì cả hai đều red trên baseline.

## Variance

none — every multi-run eval is uniform (không eval nào chạy nhiều lần; cả ba eval deterministic với runs: 1)

## Iterations

Round 1: E1, E2, E3 đều đạt, 7 lệnh suite hồi quy xanh. Không có eval nào hỏng; chuyển sang Gate 2.
