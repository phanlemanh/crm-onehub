---
schema_version: 2
feature_slug: thuoc-tro-ly-okr-khong-lot
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3068e12f964c898f99c5e8ed85e57a4e3ce542df
human_signoff:
---

# Evidence Report: thuoc-tro-ly-okr-khong-lot

Vòng 1. Cả năm eval của hợp đồng đều đạt, nhưng lệnh suite `bun run lint:slop` đỏ và không gắn eval nào, nên tổng thể là REJECT (xem mục «Lệnh fail không gắn eval»).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-tro-ly-okr-khong-lot-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlk_so_du
  verified_at: 2026-10-15T04:01:06Z
  output: |
    cmd: bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-so-du
    Ran 3 tests across 1 file. [25.00ms]

- eval: E1b
  run_id: minted-thuoc-tro-ly-okr-khong-lot-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_so_du_am
  verified_at: 2026-10-15T04:01:06Z
  output: |
    cmd: bun _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs --so-du-am
    DAT

- eval: E2
  run_id: minted-thuoc-tro-ly-okr-khong-lot-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlk_hong_het
  verified_at: 2026-10-15T04:01:06Z
  output: |
    cmd: bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-hong-het
    Ran 2 tests across 1 file. [30.00ms]

- eval: E3
  run_id: minted-thuoc-tro-ly-okr-khong-lot-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_khoa_sai
  verified_at: 2026-10-15T04:01:06Z
  output: |
    cmd: bun _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs
    DAT

- eval: E4
  run_id: minted-thuoc-tro-ly-okr-khong-lot-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlk_kho_theo_cay
  verified_at: 2026-10-15T04:01:06Z
  output: |
    cmd: bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-kho-theo-cay
    Ran 1 test across 1 file. [664.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-15T04:01:06Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-tro-ly-okr-khong-lot-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T04:01:06Z

### Lệnh fail không gắn eval

`bun run lint:slop` đỏ (mã thoát 1), không eval nào khai lệnh này. Hai lỗi, cùng luật `anti-slop(no-chained-type-assertions)`, cùng tệp `_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts`:

- dòng 33 đến 34, hàm `fetchVoiThan`: `(async () => new Response(than, { status })) as unknown as typeof fetch`.
- dòng 93 đến 96, biến `dem`: `(async () => { ... }) as unknown as typeof fetch`.

Lỗi nằm trong tệp bài kiểm của chính hồ sơ, không nằm trong mã sản phẩm. Hồ sơ này làm cổng `lint:slop` đỏ nên không thể ký nguyên trạng.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline khong do:

- bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-so-du: bo qua baseline: tep _acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts co o cay dang kiem nhung chua co o merge-base 38300b3c818662207cb640052f9f2f9de746a9f6 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs --so-du-am: bo qua baseline: tep _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs co o cay dang kiem nhung chua co o merge-base 38300b3c818662207cb640052f9f2f9de746a9f6 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-hong-het: bo qua baseline: tep _acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts co o cay dang kiem nhung chua co o merge-base 38300b3c818662207cb640052f9f2f9de746a9f6 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs: bo qua baseline: tep _acceptance/thuoc-tro-ly-okr-khong-lot/rang/khoa-sai.mjs co o cay dang kiem nhung chua co o merge-base 38300b3c818662207cb640052f9f2f9de746a9f6 — eval moi, chay tren code cu khong phan biet gi
- bun test ./_acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts -t tlk-kho-theo-cay: bo qua baseline: tep _acceptance/thuoc-tro-ly-okr-khong-lot/rang/kiem.test.ts co o cay dang kiem nhung chua co o merge-base 38300b3c818662207cb640052f9f2f9de746a9f6 — eval moi, chay tren code cu khong phan biet gi

Không có judgment item và không có panel nào cần chấm ở vòng này.

## Variance

none — mọi eval nhiều lượt đều đồng nhất (cả năm eval chạy một lượt, tất định)

## Iterations

Round 1: không eval nào đỏ; lệnh suite bun run lint:slop đỏ vì hai ép kiểu chuỗi `as unknown as typeof fetch` trong rang/kiem.test.ts (dòng 33 và 93), không gắn eval. Trả về bước thi công.
