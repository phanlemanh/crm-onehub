---
schema_version: 2
feature_slug: push-ghim-lai-t1
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d2b2df27137418d19cd152a8f616bd3cd314abab
human_signoff: manh 2026-10-18 — ký Cổng 2 trên verdict PASS 8/8 eval + 7 suite (S4 round 1, wf_25d58746-88d). Ngoài-1, 2, 5 ghi Known limits; Ngoài-3, 4 chấp nhận, không sửa; đồng ý phần cắt; phê hết các quyết định Treo.
---

# Evidence Report: push-ghim-lai-t1

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-push-ghim-lai-t1-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_tach
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-tach
    Ran 14 tests across 1 file. [231.00ms]

- eval: E2
  run_id: minted-push-ghim-lai-t1-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_ci
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-ci
    Ran 9 tests across 1 file. [5.87s]

- eval: E3
  run_id: minted-push-ghim-lai-t1-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_day
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-day
    Ran 4 tests across 1 file. [4.92s]

- eval: E4
  run_id: minted-push-ghim-lai-t1-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_sau
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-sau
    Ran 9 tests across 1 file. [99.00ms]

- eval: E5
  run_id: minted-push-ghim-lai-t1-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_doc
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-doc
    Ran 4 tests across 1 file. [369.00ms]

- eval: E6
  run_id: minted-push-ghim-lai-t1-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pglt_cong
  verified_at: 2026-10-18T15:31:06Z
  output: |
    bun _acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs
    dat cong-van-do

- eval: E7
  run_id: minted-push-ghim-lai-t1-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.pglt_job
  verified_at: 2026-10-18T15:31:06Z
  output: |
    cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-job
    Ran 10 tests across 1 file. [21.00ms]

- eval: E8
  run_id: minted-push-ghim-lai-t1-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pglt_dot_bien
  verified_at: 2026-10-18T15:31:06Z
  output: |
    node _acceptance/push-ghim-lai-t1/rang/dot-bien.mjs
    BAT cong-loc-duong

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-push-ghim-lai-t1-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-push-ghim-lai-t1-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-push-ghim-lai-t1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-push-ghim-lai-t1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-push-ghim-lai-t1-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bun run lint:slop
  run_id: minted-push-ghim-lai-t1-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

- cmd: bunx turbo run build --force
  run_id: minted-push-ghim-lai-t1-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-18T15:31:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả HEAD lẫn baseline: cả tám eval feature đều có baseline n-a (eval mới, không chạy được trên code cũ; lý do ở mục dưới).

### Baseline khong do

- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-tach: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-ci: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-day: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-sau: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-doc: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs: bo qua baseline: tep _acceptance/push-ghim-lai-t1/rang/cong-van-do.mjs co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 120000 ./test/push-ghim-lai-t1.spec.ts -t pglt-job: bo qua baseline: tep packages/ui/test/push-ghim-lai-t1.spec.ts co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/push-ghim-lai-t1/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/push-ghim-lai-t1/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 5a7b0fe76e1d3b731fb1b1d32f917fe52fbe511f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E8 và bảy lệnh suite đều đạt trên một lượt chạy; không eval nào thất bại, không mục nào chờ người chốt.
