---
schema_version: 2
feature_slug: sua-bom-gio-test-api
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 319a76cd35d4612eb15ee91f4dbfd13418e4f927
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
| E6 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-bom-gio-test-api-E1-r1
  exit_code: 0
  carried_from_round: 1
  verifier: config:executors.test.suite_api
  verified_at: 2026-11-20T10:25:35Z
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-sua-bom-gio-test-api-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio
  verified_at: 2026-11-20T11:06:40Z
  output: |
    XANH bom-gio: cmst-goc va gop-y-dung-cho deu xanh, ke ca khi co hang cau hinh gio that sot lai

- eval: E3
  run_id: minted-sua-bom-gio-test-api-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_doi_chung
  verified_at: 2026-11-20T11:06:40Z
  output: |
    DOI CHUNG DUONG: o 74a29a68d ca hai tep do dung dau (don-vi-chua-bat, dem sai) — thuoc bat duoc bom gio

- eval: E4
  run_id: minted-sua-bom-gio-test-api-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_pham_vi
  verified_at: 2026-11-20T11:06:40Z
  output: |
    PHAM VI XANH: moi tep vong doi nam trong hai tep kiem, ho so, tai lieu hoac ban do

- eval: E5
  run_id: minted-sua-bom-gio-test-api-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bom_gio_khong_ha
  verified_at: 2026-11-20T11:06:40Z
  output: |
    KHONG HA XANH: hai tep kiem chi them dong, khong bot khang dinh nao, khong skip/todo/only

- eval: E6
  run_id: minted-sua-bom-gio-test-api-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bom_gio_viec_sot
  verified_at: 2026-11-20T11:06:40Z
  output: |
    test-run: dropped crm_mwovjolijjgf_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bun run lint:slop
  run_id: minted-sua-bom-gio-test-api-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-bom-gio-test-api-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-11-20T11:06:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs --doi-chung 74a29a68d: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/bom-gio.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs --khong-ha: bo qua baseline: tep _acceptance/sua-bom-gio-test-api/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 74a29a68d28df9a8a08daf9a5e94b8dab364dd96 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 failed — buoc dem dem-sot ca-goi khong chay vi lenh bun test tran lam auth.e2e va listing-body-limit doc .env va do; E1 den E5 xanh. Returned to implementation (commit 319a76cd3 sua thuoc E5 va E6, them khoa bom_gio_viec_sot nap ./test/setup.ts).
Round 2: E2, E3, E4, E5, E6 chay lai tren 319a76cd3 va xanh; E1 carry-forward tu round 1 (delta khong cham paths cua eval); bay lenh suite xanh. Verdict PASS.
