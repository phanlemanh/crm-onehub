---
schema_version: 2
feature_slug: sua-bom-gio-test-api
verdict: REJECT
failed_evals: [E6]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1dd2edb345726e13b4c78f2462f06203c6a2c6d0
human_signoff:
---

# Evidence Report: sua-bom-gio-test-api

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-sua-bom-gio-test-api-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.suite_api
  verified_at: 2026-11-20T10:25:35Z
  output: |
    test-run: dropped crm_mwou3gftgtcr_test

- eval: E2
  run_id: minted-sua-bom-gio-test-api-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio
  verified_at: 2026-11-20T10:25:35Z
  output: |
    XANH bom-gio: cmst-goc va gop-y-dung-cho deu xanh, ke ca khi co hang cau hinh gio that sot lai

- eval: E3
  run_id: minted-sua-bom-gio-test-api-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_doi_chung
  verified_at: 2026-11-20T10:25:35Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d ca hai tep do dung dau (don-vi-chua-bat, dem sai) — thuoc bat duoc bom gio

- eval: E4
  run_id: minted-sua-bom-gio-test-api-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_pham_vi
  verified_at: 2026-11-20T10:25:35Z
  output: |
    PHAM VI XANH: moi tep vong doi nam trong hai tep kiem, ho so, tai lieu hoac ban do

- eval: E5
  run_id: minted-sua-bom-gio-test-api-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_khong_ha
  verified_at: 2026-11-20T10:25:35Z
  output: |
    KHONG HA XANH: hai tep kiem chi them dong, khong bot khang dinh nao, khong skip/todo/only

- eval: E6
  run_id: minted-sua-bom-gio-test-api-E6-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vvc_ca_goi_api
  verified_at: 2026-11-20T10:25:35Z
  output: |
    so-dich-may-ghi: dong nhap mang dich = 1; KR mang vet soan-okr = 5; KR lech so nguoi go = 1
      dong nhap mang dich: doi-chung-so-dich-dong
    doi chung duong: thuoc do dung cho (vet KR ghi dich khac so nguoi go va dong nhap mang dich)
     2168 pass
     18 skip
     2 fail
    Ran 2188 tests across 279 files. [432.70s]
    test-run: dropped crm_mwou3icz7p25_test

Lệnh `bun run test -- "NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts gieo-le && cd apps/api && bun test && cd ../.. && NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts ca-goi"` gắn với E6 và thoát với mã 1 (đã khai ở khối E6). Không có lệnh fail nào không gắn eval.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

- cmd: bun run lint:slop
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-20T10:25:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet). Luu y: khong eval nao co baseline do duoc (tat ca n-a), nen khong co can cu A/B de khang dinh dieu nay; xem muc duoi.

Baseline khong do
- bun run test -- --filter=api: baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs --khong-ha: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts gieo-le && cd apps/api && bun test && cd ../.. && NODE_ENV=test bun _acceptance/test-api-khong-de-viec-vo-chu/rang/dem-sot.ts ca-goi": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 failed — thuoc dem-sot (ca-goi) cung lenh suite api that bai voi 2 bai kiem do trong cung luot (2168 pass, 18 skip, 2 fail), dau vet con lai: KR mang vet soan-okr = 5, KR lech so nguoi go = 1. Returned to implementation.
