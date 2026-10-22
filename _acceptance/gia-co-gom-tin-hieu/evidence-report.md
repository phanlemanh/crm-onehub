---
schema_version: 2
feature_slug: gia-co-gom-tin-hieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cf8db0a81fa04bdf9a3cdc836adeeb4950df5f6d
human_signoff: Manh Phan 2026-10-22 — ký Cổng Bằng chứng trên S4 vòng 1 (PASS, 8/8 eval, 0 mục trong hợp đồng). Ngoài-1, 4–9 ghi Known limits; Ngoài-2, 3, 10 chấp nhận không sửa; cắt/hoãn đồng ý cắt; Treo phê hết.
---

# Evidence Report: gia-co-gom-tin-hieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-gia-co-gom-tin-hieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_moi_truong
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-moi-truong
    Ran 2 tests across 1 file. [10.90s]

- eval: E2
  run_id: minted-gia-co-gom-tin-hieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_loi_goi
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-loi-goi
    Ran 2 tests across 1 file. [17.81s]

- eval: E3
  run_id: minted-gia-co-gom-tin-hieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_chi_viec_gom
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-chi-viec-gom
    Ran 2 tests across 1 file. [23.38s]

- eval: E4
  run_id: minted-gia-co-gom-tin-hieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gcg_tep_lich
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun _acceptance/gia-co-gom-tin-hieu/rang/tep-lich.mjs --tu-kiem
    KET LUAN 0

- eval: E4b
  run_id: minted-gia-co-gom-tin-hieu-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_khong_tren_dia
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-khong-tren-dia
    Ran 4 tests across 1 file. [13.32s]

- eval: E5
  run_id: minted-gia-co-gom-tin-hieu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_token
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-token
    Ran 2 tests across 1 file. [20.53s]

- eval: E6
  run_id: minted-gia-co-gom-tin-hieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_sieu_du_lieu
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-sieu-du-lieu
    Ran 7 tests across 1 file. [27.49s]

- eval: E7
  run_id: minted-gia-co-gom-tin-hieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gcg_lot_khoa
  verified_at: 2026-10-21T23:29:36Z
  output: |
    bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-lot-khoa
    Ran 6 tests across 1 file. [23.89s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bun run lint:slop
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

- cmd: bunx turbo run build --force
  run_id: minted-gia-co-gom-tin-hieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:29:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả hai phía được đo (eval mới, baseline không đo được; xem mục dưới).

Baseline khong do:

- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-moi-truong: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-loi-goi: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-chi-viec-gom: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/gia-co-gom-tin-hieu/rang/tep-lich.mjs --tu-kiem: bo qua baseline: tep _acceptance/gia-co-gom-tin-hieu/rang/tep-lich.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-khong-tren-dia: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-token: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-sieu-du-lieu: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun test scripts/tin-hieu/test/gom-gia-co.test.ts -t gcg-lot-khoa: bo qua baseline: tep scripts/tin-hieu/test/gom-gia-co.test.ts co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định).

## Iterations

Round 1: tất cả tám eval đạt, bảy lệnh suite xanh; không eval nào hỏng, không mục nào cần người chốt.
