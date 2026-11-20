---
schema_version: 2
feature_slug: sua-bom-gio-test-api
verdict: BLOCKED
failed_evals: []
reason: "bun _acceptance/sua-bom-gio-test-api/rang/ci-api.mjs (E14) ket thuc voi ma 1 va in 'CI API DANG CHAY: lan 136585019545 chua xong'. Day la trang thai chua xong cua lan chay CI (test (api) dang in_progress tu 2026-11-20T21:37:54Z), khong phai ket qua PASS/FAIL cua bai kiem. Khong co dau hieu tool timeout hay output bi cat. Khong chay lai de cho pass."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50bc4ee1fb48d292c2fbe815e6fa92783679cbd0
human_signoff:
---

# Evidence Report: sua-bom-gio-test-api

Round 4. Verdict BLOCKED: E14 chua do duoc vi lan chay CI cua test (api) chua xong. 13 eval con lai (E1 den E13) deu PASS.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-10 | script | BLOCKED |

## Evidence

- eval: E1
  run_id: minted-sua-bom-gio-test-api-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.suite_api
  verified_at: 2026-11-20T21:37:29Z
  output: |
    test-run: dropped crm_mwpi2q4bwc5d_test

- eval: E2
  run_id: minted-sua-bom-gio-test-api-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio
  verified_at: 2026-11-20T21:37:29Z
  output: |
    XANH bom-gio: cmst-goc, gop-y-dung-cho deu xanh khi chay sau du lieu sot cua tep khac

- eval: E3
  run_id: minted-sua-bom-gio-test-api-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_doi_chung
  verified_at: 2026-11-20T21:37:29Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d moi ca do dung dau (cmst-goc, gop-y-dung-cho) — thuoc bat duoc loi

- eval: E4
  run_id: minted-sua-bom-gio-test-api-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_pham_vi
  verified_at: 2026-11-20T21:37:29Z
  output: |
    PHAM VI XANH: moi tep vong doi nam trong danh sach tep kiem, ho so, tai lieu hoac ban do

- eval: E5
  run_id: minted-sua-bom-gio-test-api-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_khong_ha
  verified_at: 2026-11-20T21:37:29Z
  output: |
    KHONG HA XANH: cac tep kiem khong bot khang dinh nao, khong skip/todo/only, khong tep mau nao doi

- eval: E6
  run_id: minted-sua-bom-gio-test-api-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_viec_sot
  verified_at: 2026-11-20T21:37:29Z
  output: |
    test-run: dropped crm_mwpi2s0d9u3h_test

- eval: E7
  run_id: minted-sua-bom-gio-test-api-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_the_gioi_mau
  verified_at: 2026-11-20T21:37:29Z
  output: |
    XANH bom-gio: soan-okr-so-do, tra-lai-hang-sot deu xanh khi chay sau du lieu sot cua tep khac

- eval: E8
  run_id: minted-sua-bom-gio-test-api-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_the_gioi_mau_doi_chung
  verified_at: 2026-11-20T21:37:29Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d moi ca do dung dau (soan-okr-so-do) — thuoc bat duoc loi

- eval: E9
  run_id: minted-sua-bom-gio-test-api-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_ten_goc
  verified_at: 2026-11-20T21:37:29Z
  output: |
    XANH bom-gio: htmb-toan-canh, bkr-cay-api deu xanh khi chay sau du lieu sot cua tep khac

- eval: E10
  run_id: minted-sua-bom-gio-test-api-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_ten_goc_doi_chung
  verified_at: 2026-11-20T21:37:29Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d moi ca do dung dau (htmb-toan-canh, bkr-cay-api) — thuoc bat duoc loi

- eval: E11
  run_id: minted-sua-bom-gio-test-api-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_cvv
  verified_at: 2026-11-20T21:37:29Z
  output: |
    XANH bom-gio: cua-vao-va, nguoi-thu-sot deu xanh khi chay sau du lieu sot cua tep khac

- eval: E12
  run_id: minted-sua-bom-gio-test-api-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_cvv_doi_chung
  verified_at: 2026-11-20T21:37:29Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d moi ca do dung dau (cua-vao-va, nguoi-thu-sot) — thuoc bat duoc loi

- eval: E13
  run_id: minted-sua-bom-gio-test-api-E13-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bom_gio_thu_tu
  verified_at: 2026-11-20T21:37:29Z
  output: |
    test-run: dropped crm_mwpi2w1q66e5_test

- eval: E14
  run_id: minted-sua-bom-gio-test-api-E14-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bom_gio_ci
  verified_at: 2026-11-20T21:37:29Z
  output: |
    ci-api: 50bc4ee1f · test (api) · lan 136585019545 · in_progress · - · 2026-11-20T21:37:54Z → -
    CI API DANG CHAY: lan 136585019545 chua xong
    BLOCKED: lan chay chua xong, khong phai ket qua PASS hay FAIL cua bai kiem; khong chay lai de cho pass.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

- cmd: bun run lint:slop
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-11-20T21:37:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval khong phan biet (xanh tren ca HEAD lan baseline):
- E13: bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/okr-cay-ly-do.spec.ts" — baseline green; chung minh harness chu khong phai feature, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y.

Baseline khong do:
- bun run test -- --filter=api: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-2: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-2 --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs --khong-ha: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts gieo-le && cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts && cd ../.. && NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts ca-goi": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-6: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-6 --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-7: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-7 --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-8: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --nhom AC-8 --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/ci-api.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/ci-api.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 3: REJECT — mot phat hien trong hop dong (t3): ci-api.mjs thieu filter=all. Sua o commit 50bc4ee1f (ci-api doc moi lan chay, bang CI ghi dung lan chay lai).
Round 4: BLOCKED — E1 den E13 PASS; E14 chua do duoc vi lan chay CI test (api) 136585019545 con in_progress. Cho lan chay ket thuc roi chay lai E14, khong sua code.
