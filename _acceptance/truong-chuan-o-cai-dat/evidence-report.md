---
schema_version: 2
feature_slug: truong-chuan-o-cai-dat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0dc533ccf69e76319d6112703f5cdc8f14f19b35
human_signoff: manh 2026-10-22
---

# Evidence Report: truong-chuan-o-cai-dat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-truong-chuan-o-cai-dat-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_danh_muc
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 2 tests across 1 file. [2.20s]
    __EXIT=0

- eval: E1b
  run_id: minted-truong-chuan-o-cai-dat-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcc_quet
  verified_at: 2026-10-21T15:05:06Z
  output: |
    tcc quet: dat
    __EXIT=0

- eval: E2
  run_id: minted-truong-chuan-o-cai-dat-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_sap_lai
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1.82s]
    __EXIT=0

- eval: E2b
  run_id: minted-truong-chuan-o-cai-dat-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_sap_lai
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vbrmsmtp_test
    __EXIT=0

- eval: E2c
  run_id: minted-truong-chuan-o-cai-dat-E2c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_phieu_thu_tu
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1467.00ms]
    __EXIT=0

- eval: E3
  run_id: minted-truong-chuan-o-cai-dat-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_an
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 3 tests across 1 file. [1.78s]
    __EXIT=0

- eval: E3b
  run_id: minted-truong-chuan-o-cai-dat-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_an
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vazsz6m0_test
    __EXIT=0

- eval: E4
  run_id: minted-truong-chuan-o-cai-dat-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_chuan_bat_buoc
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1.64s]
    __EXIT=0

- eval: E4b
  run_id: minted-truong-chuan-o-cai-dat-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_chuan_bat_buoc
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vakcxj8i_test
    __EXIT=0

- eval: E5
  run_id: minted-truong-chuan-o-cai-dat-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_bat_buoc
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 2 tests across 1 file. [2.05s]
    __EXIT=0

- eval: E5b
  run_id: minted-truong-chuan-o-cai-dat-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_bat_buoc
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vaujq8qd_test
    __EXIT=0

- eval: E6
  run_id: minted-truong-chuan-o-cai-dat-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_bat_buoc_hien
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1.56s]
    __EXIT=0

- eval: E6b
  run_id: minted-truong-chuan-o-cai-dat-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_bat_buoc_hien
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vb2okq6i_test
    __EXIT=0

- eval: E7
  run_id: minted-truong-chuan-o-cai-dat-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_mac_dinh
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8vb3pnb6d_test
    __EXIT=0

- eval: E7b
  run_id: minted-truong-chuan-o-cai-dat-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_phieu_chua_tai
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1085.00ms]
    __EXIT=0

- eval: E7c
  run_id: minted-truong-chuan-o-cai-dat-E7c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcc_migration
  verified_at: 2026-10-21T15:05:06Z
  output: |
    tcc migration: dat 20261021054942_truong_chuan_bo_tri
    __EXIT=0

- eval: E8
  run_id: minted-truong-chuan-o-cai-dat-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_api_quyen
  verified_at: 2026-10-21T15:05:06Z
  output: |
    test-run: dropped crm_mvi8viuvw3x3_test
    __EXIT=0

- eval: E8b
  run_id: minted-truong-chuan-o-cai-dat-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcc_khong_quyen
  verified_at: 2026-10-21T15:05:06Z
  output: |
    Ran 1 test across 1 file. [1014.00ms]
    __EXIT=0

- eval: E9
  run_id: minted-truong-chuan-o-cai-dat-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcc_man
  verified_at: 2026-10-21T15:05:06Z
  screenshot: evidence/tcc-cai-dat-thoa-thuan-1280.png
  observed: |
    tcc-cai-dat-thoa-thuan-1280 (da mo bang Read): mot danh sach duy nhat duoi tab Cong ty / Ca nhan / Thoa thuan, khong khoi gap; bay hang Ten, Gia tri, Tien te, Hang doi tac (Chi nhap tay), Ngay chot, Cong ty, Phu trach cung khuon (tay keo, nhan, dong phu, huy hieu kieu, cong tac); Hang doi tac dung ngay tren Ngay chot; hang bat buoc co cong tac khoa mau xam.
    tcc-phieu-cong-ty-1280 (da mo bang Read): muc CHI TIET gom Ten, Ten mien, Website, Dien thoai, Email, Quoc gia, Phu trach, Account type...; khong co hang Thanh pho (thanh pho chi o dong phu tieu de, Da Nang). Cac frame con lai (cai-dat cong-ty 1280, 375 cac man, phieu thoa-thuan 1280) do-man.mjs doi chieu DOM va bao khop: Thanh pho tat sau khi bam chuot, phieu thoa-thuan co Hang doi tac ngay tren Ngay chot, 375 khong tran ngang. Tat ca khop Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bun run lint:slop
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-chuan-o-cai-dat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T15:05:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào green trên cả hai phía; mọi eval feature đều là eval mới, baseline không đo được (xem «Baseline khong do»), nên không có eval nào bị đánh dấu không phân biệt.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-danh-muc: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/truong-chuan-o-cai-dat/rang/quet.mjs: bo qua baseline: tep _acceptance/truong-chuan-o-cai-dat/rang/quet.mjs co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-sap-lai: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-sap-lai": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-phieu-thu-tu: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-an: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-an": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-chuan-bat-buoc: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-chuan-bat-buoc": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-bat-buoc-luu: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-bat-buoc-luu": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-bat-buoc-hien: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-bat-buoc-hien": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-mac-dinh": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-phieu-chua-tai: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/truong-chuan-o-cai-dat/rang/migration-chi-them.mjs: bo qua baseline: tep _acceptance/truong-chuan-o-cai-dat/rang/migration-chi-them.mjs co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/truong-chuan-cai-dat.spec.ts -t tcc-api-quyen": bo qua baseline: tep apps/api/test/truong-chuan-cai-dat.spec.ts co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-chuan-cai-dat.dom.tsx -t tcc-khong-quyen: bo qua baseline: tep apps/app/test/truong-chuan-cai-dat.dom.tsx co o cay dang kiem nhung chua co o merge-base 1271524de3981e480a368dd5cdc569f8d7c059b2 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào hỏng — 19 eval và 7 lệnh suite xanh; không có mục cần người chấm, không có lệnh hỏng ngoài eval.
