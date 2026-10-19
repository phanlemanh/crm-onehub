---
schema_version: 2
feature_slug: khong-do-them-chay-gh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: acf9fcff462b0c613029bf28f785fd5aeec4b873
human_signoff:
---

# Evidence Report: khong-do-them-chay-gh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E6
  run_id: minted-khong-do-them-chay-gh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_dung_lai_cay
  verified_at: 2026-10-19T14:54:05Z
  output: |
    KET LUAN: xanh

- eval: E1
  run_id: minted-khong-do-them-chay-gh-E1-r1
  exit_code: 0
  verifier: config:executors.script.kdtg_ban_gh
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-khong-do-them-chay-gh-E2-r1
  exit_code: 0
  verifier: config:executors.script.kdtg_ban_gh_nguon
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khong-do-them-chay-gh-E3-r1
  exit_code: 0
  verifier: config:executors.script.kdtg_lenh_gh
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khong-do-them-chay-gh-E4-r1
  exit_code: 0
  verifier: config:executors.script.kdtg_ban_do
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khong-do-them-chay-gh-E5-r1
  exit_code: 0
  verifier: config:executors.script.kdtg_chi
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khong-do-them-chay-gh-E7-r1
  exit_code: 0
  verifier: config:executors.test.kcs_don_vi
  verified_at: 2026-10-19T14:27:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bunx turbo run lint --force
  run_id: minted-khong-do-them-chay-gh-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bun run lint:slop
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

- cmd: bunx turbo run build --force
  run_id: minted-khong-do-them-chay-gh-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-19T14:54:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun _acceptance/khong-do-them-chay-gh/rang/dung-lai-cay.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/dung-lai-cay.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 do duoc nhung ban guong thieu scripts/resolve-plugin.mjs nen moi ca thu deu do va cac phep pha-thu bat ma khong do gi — REJECT, tra ve thi cong.
Round 2: E6 chep them scripts/resolve-plugin.mjs vao ban guong va them doi chung duong; E1-E5, E7 carry-forward tu round 1 (delta khong cham paths); bay lenh suite chay lai xanh — PASS.
