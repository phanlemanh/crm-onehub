---
schema_version: 2
feature_slug: neo-thuoc-het-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1e6e28d4e37f54d8b41dfddd90baa556db01d63d
human_signoff: Phan Le Manh 2026-10-15
---

# Evidence Report: neo-thuoc-het-han

Round 4. Năm eval của hợp đồng (E1, E3, E4, E5, E6) đều đạt; E3 mang từ round 1 vì delta không chạm paths của nó. Bảy lệnh suite không gắn eval đều xanh ở round này.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-3 | script | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | script | PASS |
| E5 | AC-6 | script | PASS |
| E6 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-neo-thuoc-het-han-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chay_o_dinh
  verified_at: 2026-10-15T11:02:04Z
  output: |
    chay-o-dinh: dat

- eval: E3
  run_id: minted-neo-thuoc-het-han-E3-r1
  exit_code: 0
  verifier: config:executors.test.lmcv_loi_khong_lam_moi
  verified_at: 2026-10-15T06:22:43Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-neo-thuoc-het-han-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chieu_do
  verified_at: 2026-10-15T11:02:04Z
  output: |
    chieu-do: 3/3 bi bat

- eval: E5
  run_id: minted-neo-thuoc-het-han-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_pham_vi
  verified_at: 2026-10-15T11:02:04Z
  output: |
    pham-vi: dat

- eval: E6
  run_id: repin-20261015T090245Z-78462
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_ghim_xanh
  verified_at: 2026-10-15T11:02:04Z
  output: |
    ghim-xanh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bunx turbo run lint --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bun run lint:slop
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

- cmd: bunx turbo run build --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-15T11:02:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không có eval nào xanh ở cả hai phía; bốn eval mới của vòng (E1, E4, E5, E6) đều không đo được baseline (n-a), lý do ở mục dưới.

Baseline khong do
- bun _acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs co o cay dang kiem nhung chua co o merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base eb5ab4269cdbd393b6087ae461ca6814b767724d — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần (deterministic), không eval nào có pass_rate lẫn.

## Iterations

Round 1-2: round 1 REJECT vì lệnh suite `bun run test -- --filter=agent-okr ...` đỏ ở `app-rieng > chạy cạnh apps/agent` (quá 5000ms, ConnectionRefused); round 2 chạy lại, cả bảy lệnh suite xanh, còn một phát hiện trong hợp đồng về đối chứng hai-ref, đã sửa ở commit 67dde775b.
Round 3: eval chạy lại ở 5e50f1918 và đạt, E3 mang từ round 1; cả bảy lệnh suite xanh. Verdict PASS.
Round 4: phạm vi đổi sau S4 r3 («F8: b1», hoàn lại so-okr-tu-chay về bản onehub); chạy lại E1, E4, E5, E6 ở 1e6e28d4e và đạt, E3 mang từ round 1; cả bảy lệnh suite xanh. Verdict PASS.
