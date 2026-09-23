---
schema_version: 2
feature_slug: khoa-cu-khong-mo-khoa-moi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 60eff8b85f4170162c5b2c01342022348620534d
human_signoff: Manh Phan 2026-09-24
---

# Evidence Report: khoa-cu-khong-mo-khoa-moi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: mue9y137s98t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_header_tao
  verified_at: 2026-09-23T18:45:00Z
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [1385.00ms]
    test-run: dropped crm_mue9y137s98t_test

- eval: E2
  run_id: mue9y25p69km
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_header_bat_lai
  verified_at: 2026-09-23T18:45:00Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [966.00ms]
    test-run: dropped crm_mue9y25p69km_test

- eval: E3
  run_id: minted-khoa-cu-khong-mo-khoa-moi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_header_lan_cookie
  verified_at: 2026-09-23T18:45:00Z
  output: |
    Ran 1 test across 1 file. [891.00ms]
    test-run: dropped crm_mue9yg1jjmto_test
    EXIT_CODE_IS:0

- eval: E4
  run_id: mue9y2j8ykbc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_header_doi_chung
  verified_at: 2026-09-23T18:45:00Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [930.00ms]
    test-run: dropped crm_mue9y2j8ykbc_test

- eval: E5
  run_id: mue9y2dnu4o8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_don_mot_lan
  verified_at: 2026-09-23T18:45:00Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [924.00ms]
    test-run: dropped crm_mue9y2dnu4o8_test

- eval: E6
  run_id: mue9yf4yvipk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_don_bang_rong
  verified_at: 2026-09-23T18:45:00Z
  output: |
    Ran 1 test across 1 file. [1186.00ms]
    test-run: dropped crm_mue9yf4yvipk_test
    EXIT_CODE=0

- eval: E7
  run_id: mue9y1t8avrk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_go_tat_khoa
  verified_at: 2026-09-23T18:45:00Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [971.00ms]
    test-run: dropped crm_mue9y1t8avrk_test

- eval: E8
  run_id: mue9y230as8x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gl_khoa_moi
  verified_at: 2026-09-23T18:45:00Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [1168.00ms]
    test-run: dropped crm_mue9y230as8x_test

- eval: E9
  run_id: mue9y1ofyhea
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcm_xem_truoc
  verified_at: 2026-09-23T18:45:00Z
  output: |
     9 expect() calls
    Ran 2 tests across 1 file. [1058.00ms]
    test-run: dropped crm_mue9y1ofyhea_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue9z9yj322j
  exit_code: 0
  verified_at: 2026-09-23T18:45:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-23T18:45:00Z

- cmd: bun run lint:slop
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-23T18:45:00Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-23T18:45:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

- E7 (AC-7): bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t go-tat-khoa" — PASS trên cả HEAD lẫn baseline (non-discriminating, đã ghi từ round 1)
- E8 (AC-8): bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t khoa-moi" — PASS trên cả HEAD lẫn baseline (non-discriminating, đã ghi từ round 1)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E9 và bốn lệnh suite đều PASS (round-tally 13/13, verdict PASS) — bun run test khi đó chạy hết trong hạn thời gian.
Round 2: chín eval mục tiêu (E1–E9) PASS ngay từ đầu; lệnh suite `bun run test` lần chạy trước vượt quá 600 giây và bị tool cắt giữa chừng ở @crm/telemetry:test (verdict tạm BLOCKED, cần chạy lại với timeout dài hơn) — chạy lại, `bun run test` hoàn tất sạch trong 49.563s, cùng `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force` đều PASS — verdict PASS.