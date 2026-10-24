---
schema_version: 2
feature_slug: bam-kr-mo-chi-tiet-kr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9704954fc9cc928621e9cff5f552a54163629883
human_signoff:
---

# Evidence Report: bam-kr-mo-chi-tiet-kr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bam-kr-mo-chi-tiet-kr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_kr_phu_trach
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ran 1 test across 1 file. [1288.00ms]

- eval: E2
  run_id: minted-bam-kr-mo-chi-tiet-kr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_cay
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ca bkr-cay chay xong, 1 lan chay, 1 lan qua; phan cuoi dau ra chi con dong trong.

- eval: E2b
  run_id: minted-bam-kr-mo-chi-tiet-kr-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_cay_api
  verified_at: 2026-10-24T12:16:06Z
  output: |
    test-run: dropped crm_mvmd4xv29ynp_test

- eval: E3
  run_id: minted-bam-kr-mo-chi-tiet-kr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_viec
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ran 1 test across 1 file. [1446.00ms]

- eval: E4
  run_id: minted-bam-kr-mo-chi-tiet-kr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_bang_kr
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ran 2 tests across 1 file. [2.22s]

- eval: E5
  run_id: minted-bam-kr-mo-chi-tiet-kr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_chu
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ran 5 tests across 1 file. [348.00ms]

- eval: E6
  run_id: minted-bam-kr-mo-chi-tiet-kr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bkr_khong_doi_hinh
  verified_at: 2026-10-24T12:16:06Z
  output: |
    KET LUAN khong-doi-hinh: dat

- eval: E7
  run_id: minted-bam-kr-mo-chi-tiet-kr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_quet_mo
  verified_at: 2026-10-24T12:16:06Z
  output: |
    Ran 2 tests across 1 file. [496.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bun run lint:slop
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

- cmd: bunx turbo run build --force
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-24T12:16:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-kr-phu-trach: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-cay: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-cay-api": bo qua baseline: tep apps/api/test/bam-kr-mo-chi-tiet-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-viec: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-bang-kr: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.dom.tsx co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-chu: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs: bo qua baseline: tep _acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-quet-mo: bo qua baseline: tep apps/app/test/bam-kr-mo-chi-tiet-kr.spec.ts co o cay dang kiem nhung chua co o merge-base 2854ab50cbca7787aa6ef18e49d870de544c0e54 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval (E1, E2, E2b, E3, E4, E5, E6, E7) va bay lenh suite deu xanh; khong eval nao hong, khong muc nao cho nguoi phan xu. Verdict PASS.
