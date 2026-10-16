---
schema_version: 2
feature_slug: pre-push-t1
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c47de63371d4525e66a8f5e94f60a57d4d2571fb
human_signoff:
---

# Evidence Report: pre-push-t1

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-1 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | script | PASS |

Round 2 chạy lại E2 và E10 (hai eval có đường dẫn bị đụng bởi delta); tám eval còn lại mang sang từ round 1. Không có lệnh fail nào không gắn eval.

## Evidence

- eval: E1
  run_id: minted-pre-push-t1-E1-r1
  exit_code: 0
  verifier: config:executors.test.ppt_phan_loai
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-pre-push-t1-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppt_mot_nguon
  verified_at: 2026-10-16T17:15:32Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t mot-nguon && cd ../.. && node _acceptance/pre-push-t1/rang/mot-nguon.mjs
    BAT bo-qua-viet-tay

- eval: E3
  run_id: minted-pre-push-t1-E3-r1
  exit_code: 0
  verifier: config:executors.test.ppt_day_t1
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-pre-push-t1-E4-r1
  exit_code: 0
  verifier: config:executors.test.ppt_day_nang
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-pre-push-t1-E5-r1
  exit_code: 0
  verifier: config:executors.test.ppt_verify
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-pre-push-t1-E6-r1
  exit_code: 0
  verifier: config:executors.test.ppt_khai
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-pre-push-t1-E7-r1
  exit_code: 0
  verifier: config:executors.script.ppt_dot_bien
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-pre-push-t1-E8-r1
  exit_code: 0
  verifier: config:executors.script.ppt_rang_cu
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-pre-push-t1-E9-r1
  exit_code: 0
  verifier: config:executors.script.ppt_day_that
  verified_at: 2026-10-16T16:53:38Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-pre-push-t1-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.rang_hook_ep_chay
  verified_at: 2026-10-16T17:15:32Z
  output: |
    bash _acceptance/luoi-day-do-that/rang-hook.sh --chan ep-chay
    rang-hook ep-chay: du 5 tac vu duoc goi, 4 tac vu qua bo dung deu 0 doc tu dem

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-pre-push-t1-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bun run lint:slop
  run_id: minted-pre-push-t1-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

- cmd: bunx turbo run build --force
  run_id: minted-pre-push-t1-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-16T17:15:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t mot-nguon && cd ../.. && node _acceptance/pre-push-t1/rang/mot-nguon.mjs: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/luoi-day-do-that/rang-hook.sh --chan ep-chay: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — E10 chay dua voi E9 tren cung cay (S4 round 1 bi tu choi vi tranh chap). Returned to implementation; E9 va E10 duoc chay rieng.
Round 2: E2 va E10 chay lai, tam eval con lai mang sang tu round 1 vi delta khong cham paths cua chung. Moi eval va moi lenh suite deu xanh.
