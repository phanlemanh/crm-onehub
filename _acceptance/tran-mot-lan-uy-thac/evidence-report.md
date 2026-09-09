---
schema_version: 2
feature_slug: tran-mot-lan-uy-thac
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 848548723e0cf0dd646f2b1dac54ed4241ab0a0f
human_signoff:
---

# Evidence Report: tran-mot-lan-uy-thac

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
  run_id: minted-tran-mot-lan-uy-thac-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_khong_quyen_chan_lan_hai
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [66.00ms]

- eval: E2
  run_id: minted-tran-mot-lan-uy-thac-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_co_quyen_khong_hoi_quy
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [58.00ms]

- eval: E3
  run_id: minted-tran-mot-lan-uy-thac-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_lan_mot_van_lot
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [68.00ms]

- eval: E4
  run_id: minted-tran-mot-lan-uy-thac-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_lap_callid
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [79.00ms]

- eval: E5
  run_id: minted-tran-mot-lan-uy-thac-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_luot_moi
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [87.00ms]

- eval: E6
  run_id: minted-tran-mot-lan-uy-thac-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_ngoai_kenh_builder
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    7 expect() calls
    Ran 1 test across 1 file. [57.00ms]

- eval: E7
  run_id: minted-tran-mot-lan-uy-thac-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_cung_mot_batch
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [89.00ms]

- eval: E8
  run_id: minted-tran-mot-lan-uy-thac-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_mot_cau_thong_diep
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [71.00ms]

- eval: E9
  run_id: minted-tran-mot-lan-uy-thac-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tr_khong_co_loi_goi
  verified_at: 2026-09-09T09:00:00Z
  output: |
    0 fail
    18 expect() calls
    Ran 3 tests across 1 file. [85.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mttgmpsblcw2
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 2
  verified_at: 2026-09-09T09:00:00Z
  output: |
    app:check-types: error TS6053: File '.../apps/app/.next/types/cache-life.d.ts' not found.
    app:check-types:   The file is in the program because:
    app:check-types:     Matched by include pattern '.next/types/**/*.ts' in '.../apps/app/tsconfig.json'
    app:check-types: error TS6053: File '.../apps/app/.next/types/validator.ts' not found.
    app#check-types:  ERROR  command (.../apps/app) /Users/manhphan/.local/bin/bun run check-types exited (2)
    Tasks:    10 successful, 13 total
    Failed:    app#check-types
    ERROR  run failed: command  exited (2)

- cmd: bunx turbo run lint --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-09T09:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round trước — baseline không đo lại round này

none — không có eval nào nằm trong danh sách không-phân-biệt (danh sách carried rỗng)

## Variance

none — every multi-run eval is uniform (không có eval nào khai runs > 1 ở round này)

## Iterations

Round 1: AC-9 (E9) sai fixture — bài chiều đỏ gọi thẳng `goiBuilder` thay vì đọc từ `HINH_DANG_KHONG_GOI`, không đo được nhánh đúng của hook. Trả về implementation, sửa lại ở commit 8485487.
Round 2: Cả 9 eval E1-E9 pass qua `bun test` (`apps/agent/test/tran-uy-thac.spec.ts`), suite `bun run test` xanh (257 tests). `bunx turbo run check-types --force` thất bại (exit 2, `app#check-types`: `.next/types/cache-life.d.ts` / `validator.ts` not found) — lỗi này không gắn eval nào nhưng chặn cổng Bằng chứng. Verdict: REJECT.