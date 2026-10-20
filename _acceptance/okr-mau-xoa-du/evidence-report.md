---
schema_version: 2
feature_slug: okr-mau-xoa-du
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d311ab46e4f301800699ced0a0163fad3b9582b
human_signoff:
---

# Evidence Report: okr-mau-xoa-du

Round 1 bị từ chối vì một lệnh suite đỏ không gắn eval nào: `bun run test -- --filter=api` (2 bài không tên đỏ, xem mục Lệnh suite). Cả bảy eval của tính năng đều xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-mau-xoa-du-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.okx_viec
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-viec"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmx9nd2do_test

- eval: E2
  run_id: minted-okr-mau-xoa-du-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.okx_tin_hieu
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-tin-hieu"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmwstr865_test

- eval: E3
  run_id: minted-okr-mau-xoa-du-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.okx_ngoai_giu
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-ngoai-giu"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmvx1p3gu_test

- eval: E4
  run_id: minted-okr-mau-xoa-du-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.okx_ten_giu
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-ten-giu"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmxcju3mp_test

- eval: E5
  run_id: minted-okr-mau-xoa-du-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_luoi
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau-khoa-nguoi.spec.ts -t okx-luoi"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmxj9h7t7_test

- eval: E6
  run_id: minted-okr-mau-xoa-du-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.okx_man_canh_kr
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: EVAL=E12,E15,E17 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/canh-kr-okr/rang/man-canh-kr.mjs"
    runs: 1, passes: 1
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-okr-mau-xoa-du-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.okx_da_ky
  verified_at: 2026-10-20T14:43:00Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t xoa-mau"
    runs: 1, passes: 1
    test-run: dropped crm_mvgsmwa1m8vq_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-20T14:43:00Z
  output: |
    1985 pass, 6 skip, 2 fail; Ran 1993 tests across 246 files
    2 tests failed: (fail) (unnamed) [10.10ms] và (fail) (unnamed) [3.44ms]
    Failed: api#test
    Lệnh không gắn eval nào. Nguyên nhân hai bài đỏ: chưa rõ, đuôi đầu ra không nêu tên bài, tệp hay thông điệp lỗi.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-mau-xoa-du-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

- cmd: bun run lint:slop
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-mau-xoa-du-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T14:43:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline):

- E7 (`bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t xoa-mau"`): xanh trên code cũ. Đây là bảo vệ hồi quy có chủ ý cho ba ca đã ký (AC-7: không sửa assert nào của chúng), không đo hành vi mới.

Baseline không đo:

- bun run test -- "cd apps/api && bun test test/okr-mau-khoa-nguoi.spec.ts -t okx-luoi": bo qua baseline: tep apps/api/test/okr-mau-khoa-nguoi.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi

Lệnh không gắn eval: `bun run test -- --filter=api` đỏ (2 bài không tên). Lệnh này không thuộc AC nào nên không vào danh sách eval hỏng, nhưng vẫn làm vòng này bị từ chối vì hồi quy suite API. Nguyên nhân chưa rõ, đuôi log lưu lại không có tên bài.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bảy eval E1..E7 đều xanh; lệnh suite `bun run test -- --filter=api` đỏ với 2 bài không tên (nguyên nhân chưa rõ). Returned to implementation.

