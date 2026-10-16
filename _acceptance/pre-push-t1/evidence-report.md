---
schema_version: 2
feature_slug: pre-push-t1
verdict: REJECT
failed_evals: [E10]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: df5884f6318736f2eb1c562cddc3a95d6e56de1a
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
| E10 | AC-9 | script | FAIL |

Round 1 co mot eval do: E10 (AC-9). Lenh cua E10 la lenh duy nhat fail, va no da gan eval nen khong co lenh fail nao khong gan eval.

## Evidence

- eval: E1
  run_id: minted-pre-push-t1-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ppt_phan_loai
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t phan-loai
    Ran 19 tests across 1 file. [16.46s]

- eval: E2
  run_id: minted-pre-push-t1-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppt_mot_nguon
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t mot-nguon && cd ../.. && node _acceptance/pre-push-t1/rang/mot-nguon.mjs
    BAT bo-qua-viet-tay

- eval: E3
  run_id: minted-pre-push-t1-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ppt_day_t1
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t day-t1
    Ran 3 tests across 1 file. [10.14s]

- eval: E4
  run_id: minted-pre-push-t1-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ppt_day_nang
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t day-nang
    Ran 5 tests across 1 file. [12.09s]

- eval: E5
  run_id: minted-pre-push-t1-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ppt_verify
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t verify
    Ran 7 tests across 1 file. [9.90s]

- eval: E6
  run_id: minted-pre-push-t1-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ppt_khai
  verified_at: 2026-10-16T16:53:38Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t khai
    Ran 6 tests across 1 file. [9.67s]

- eval: E7
  run_id: minted-pre-push-t1-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppt_dot_bien
  verified_at: 2026-10-16T16:53:38Z
  output: |
    node _acceptance/pre-push-t1/rang/dot-bien.mjs
    BAT hook-viet-tay: mot-nguon (c): khai chi bo build thi hook chay test

- eval: E8
  run_id: minted-pre-push-t1-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppt_rang_cu
  verified_at: 2026-10-16T16:53:38Z
  output: |
    node _acceptance/pre-push-t1/rang/rang-cu.mjs
    dat rang_hook_loi_thoat

- eval: E9
  run_id: minted-pre-push-t1-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppt_day_that
  verified_at: 2026-10-16T16:53:38Z
  output: |
    node _acceptance/pre-push-t1/rang/day-that.mjs
    dat day-that

- eval: E10
  run_id: minted-pre-push-t1-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.rang_hook_ep_chay
  verified_at: 2026-10-16T16:53:38Z
  output: |
    bash _acceptance/luoi-day-do-that/rang-hook.sh --chan ep-chay
    agent:build: [BUILD] built output at apps/agent/.output
      Tasks:    5 successful, 5 total
     Cached:    0 cached, 5 total
      The gate no longer matches .githooks/gate-shape.json.
      - checker 'check-types' left no run summary, so nothing proves it ran at all
      - checker 'lint' left no run summary, so nothing proves it ran at all
      Fix the gate, or change the declaration and say why in the same commit.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-pre-push-t1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bunx turbo run lint --force
  run_id: minted-pre-push-t1-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bun run lint:slop
  run_id: minted-pre-push-t1-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

- cmd: bunx turbo run build --force
  run_id: minted-pre-push-t1-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T16:53:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Luu y: khong eval nao do duoc baseline (tat ca la n-a), nen "red tren baseline" chua duoc kiem chung bang so sanh voi code cu; xem muc ngay dưới.

### Baseline khong do

- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t phan-loai: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t mot-nguon && cd ../.. && node _acceptance/pre-push-t1/rang/mot-nguon.mjs: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t day-t1: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t day-nang: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t verify: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t khai: bo qua baseline: tep packages/ui/test/pre-push-t1.spec.ts co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-t1/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/pre-push-t1/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-t1/rang/rang-cu.mjs: bo qua baseline: tep _acceptance/pre-push-t1/rang/rang-cu.mjs co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-t1/rang/day-that.mjs: bo qua baseline: tep _acceptance/pre-push-t1/rang/day-that.mjs co o cay dang kiem nhung chua co o merge-base d5e01c5a37c8958971d84d3d460d1e82328eeb6e — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/luoi-day-do-that/rang-hook.sh --chan ep-chay: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — moi eval nhieu lan chay deu dong nhat (moi eval chay mot lan, deterministic)

## Iterations

Round 1: E10 failed — rang hook ep-chay chay du nam tac vu qua turbo nhung buoc doi chieu gate-shape bao checker 'check-types' va 'lint' khong de lai run summary nao. Returned to implementation.
