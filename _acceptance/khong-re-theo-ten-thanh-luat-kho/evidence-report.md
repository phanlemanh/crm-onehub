---
schema_version: 2
feature_slug: khong-re-theo-ten-thanh-luat-kho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9a9471523d6347c00bdf7b40b56a3e8c86e44b2e
human_signoff:
---

# Evidence Report: khong-re-theo-ten-thanh-luat-kho

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_ma_tran_luat
  verified_at: 2026-10-15T18:38:52Z
  output: |
    ma-tran-luat: 16/16 o dung

- eval: E2
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_ma_tran_luat
  verified_at: 2026-10-15T18:38:52Z
  output: |
    ma-tran-luat: 16/16 o dung

- eval: E3
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E3-r1
  exit_code: 0
  verifier: config:executors.script.lint_slop
  verified_at: 2026-10-15T18:08:26Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_e17_qua_luat
  verified_at: 2026-10-15T18:38:52Z
  output: |
    e17-qua-luat: dat

- eval: E5
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_chieu_do
  verified_at: 2026-10-15T18:38:52Z
  output: |
    chieu-do: 6/6 bi bat

- eval: E6
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_chon_ho_so
  verified_at: 2026-10-15T18:38:52Z
  output: |
    chon-ho-so: dat

- eval: E7
  run_id: repin-20261015T183248Z-35446
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_ghim_xanh
  verified_at: 2026-10-15T18:38:52Z
  output: |
    ghim-xanh: dat

- eval: E8
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.krtt_pham_vi
  verified_at: 2026-10-15T18:38:52Z
  output: |
    pham-vi: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bun run lint:slop
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

- cmd: bunx turbo run build --force
  run_id: minted-khong-re-theo-ten-thanh-luat-kho-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T18:38:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet). Luu y trung thuc: sau eval feature cua round 2 khong co baseline do duoc (tat ca n-a, vi tep moi chua co o merge-base), nen khong eval nao bi danh dau green-on-both. E3 (carry-forward tu round 1) la regression-guard co chu y: lint:slop xanh ca hai phia o round 1.

### Baseline khong do

- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ma-tran-luat.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ma-tran-luat.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/e17-qua-luat.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/chon-ho-so.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/chon-ho-so.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/khong-re-theo-ten-thanh-luat-kho/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval PASS nhung hai phat hien trong hop dong (AC-4) — E17 bo sot ignorePatterns va .eslintignore khi soat duong tat. Returned to implementation (commit cd8d8b789, so fix S4-r1, ghim lai 9a9471523).
Round 2: E1, E2, E4, E5, E6, E7, E8 chay lai va PASS; E3 carry-forward tu round 1 (delta khong cham paths cua eval); bay lenh suite PASS. Verdict PASS.
