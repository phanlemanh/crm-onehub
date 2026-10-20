---
schema_version: 2
feature_slug: chu-may-sinh-ten-moi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3c5950f7a0b958e5b58e2a4ca967bc578dce333c
human_signoff:
---

# Evidence Report: chu-may-sinh-ten-moi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | script | PASS |

## Evidence

Mốc verified_at suy từ mã thời gian nằm trong tên cơ sở dữ liệu thử của từng lượt chạy (cùng ngày 2026-10-20, giờ UTC); các lệnh script không mang mã thời gian lấy mốc ngay sau lượt test đầu.

- eval: E1
  run_id: minted-chu-may-sinh-ten-moi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T02:58:06Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi.spec.ts"
    test-run: dropped crm_mvg3g8vvqsfr_test

- eval: E2
  run_id: minted-chu-may-sinh-ten-moi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T02:58:06Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi.spec.ts"
    test-run: dropped crm_mvg3g8vvqsfr_test

- eval: E3
  run_id: minted-chu-may-sinh-ten-moi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T02:58:06Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi.spec.ts"
    test-run: dropped crm_mvg3g8vvqsfr_test

- eval: E4
  run_id: minted-chu-may-sinh-ten-moi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_goc
  verified_at: 2026-10-20T02:58:06Z
  output: |
    test-run: dropped crm_mvg3g9vbb4yp_test

- eval: E5
  run_id: mvg3ga8j9ssx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_nhac
  verified_at: 2026-10-20T02:58:06Z
  output: |
    test-run: dropped crm_mvg3ga8j9ssx_test

- eval: E6
  run_id: minted-chu-may-sinh-ten-moi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi_dan
  verified_at: 2026-10-20T02:58:06Z
  output: |
    Ran 3 tests across 1 file. [1412.00ms]

- eval: E7
  run_id: minted-chu-may-sinh-ten-moi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_so_eval_soan
  verified_at: 2026-10-20T02:58:06Z
  output: |
    so-eval-soan: khong tut so voi nen

- eval: E8
  run_id: minted-chu-may-sinh-ten-moi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_so_eval_soan_do
  verified_at: 2026-10-20T02:58:06Z
  output: |
    so-eval-soan-do: 17 ca dung

- eval: E9
  run_id: minted-chu-may-sinh-ten-moi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_luat
  verified_at: 2026-10-20T02:58:06Z
  output: |
    Ran 4 tests across 1 file. [14.00ms]

- eval: E10
  run_id: minted-chu-may-sinh-ten-moi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_kiem_ke
  verified_at: 2026-10-20T02:58:06Z
  output: |
    kiem-ke: 51 muc o 13 tep (quet 5 vung), khop moc 37dc2da8d, khong con chu cu (dai nhanh-mo 13 commit)

- eval: E11
  run_id: minted-chu-may-sinh-ten-moi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_khong_go_bai
  verified_at: 2026-10-20T02:58:06Z
  output: |
    khong-go-bai: 11 tep doi, 0 vi pham (dai nhanh-mo 13 commit)

- eval: E12
  run_id: minted-chu-may-sinh-ten-moi-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_thuoc_da_ky
  verified_at: 2026-10-20T02:58:06Z
  output: |
    thuoc-da-ky: 25 tep _acceptance doi; thuoc gioi-han 2 dong, ban chup 4 dong chi thay chu (dai nhanh-mo 13 commit)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bun run lint:slop
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

- cmd: bunx turbo run build --force
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T02:58:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh ở cả HEAD lẫn baseline; mười lệnh eval đều mới nên baseline là n-a (lý do ở dưới), không có eval nào bị đánh dấu không-phân-biệt.

Baseline khong do
- bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi.spec.ts": bo qua baseline: tep apps/api/test/chu-may-sinh-ten-moi.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi-goc.spec.ts && bun test test/okr-hoi-y.spec.ts -t do-phu && bun test test/okr-khep.spec.ts -t \"sang-cham|cham-va-nhin-lai\" && bun test test/okr-khep-xuat.spec.ts && cd ../agent-okr && bun test test/chu-may-sinh-ten-moi.spec.ts -t cmst-goc-hoi": bo qua baseline: tep apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/chu-may-sinh-ten-moi.spec.ts -t cmst-nhac && CRM_TELEMETRY_DISABLED=1 bun test test/okr-nhac.integration.spec.ts -t hoi-y && TZ=Asia/Ho_Chi_Minh bun test test/thong-bao-ghi.integration.spec.ts -t htb-kenh": bo qua baseline: tep apps/agent/test/chu-may-sinh-ten-moi.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/agent-okr && bun test test/chu-may-sinh-ten-moi.spec.ts -t cmst-loi-dan: bo qua baseline: tep apps/agent-okr/test/chu-may-sinh-ten-moi.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- cd packages/validation && bun test test/ten-cu-okr.spec.ts -t cmst-luat: bo qua baseline: tep packages/validation/test/ten-cu-okr.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/kiem-ke.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/khong-go-bai.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/khong-go-bai.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/thuoc-da-ky.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/thuoc-da-ky.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval ngẫu nhiên nào)

## Iterations

Round 1: 12 eval (E1 đến E12) đều đạt, 7 lệnh suite hồi quy đều xanh; không eval nào hỏng, không mục chờ người ở phía máy. Chuyển Cổng 2.
