---
schema_version: 2
feature_slug: tran-mot-lan-uy-thac
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e27489fa5f1a1483f03ad740a488ad427f048387
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
  run_id: minted-tran-mot-lan-uy-thac-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_khong_quyen_chan_lan_hai
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [62.00ms]

- eval: E2
  run_id: minted-tran-mot-lan-uy-thac-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_co_quyen_khong_hoi_quy
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [148.00ms]

- eval: E3
  run_id: minted-tran-mot-lan-uy-thac-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_lan_mot_van_lot
  verified_at: 2026-09-09T10:10:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 3 tests across 1 file. [53.00ms]

- eval: E4
  run_id: minted-tran-mot-lan-uy-thac-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_lap_callid
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [58.00ms]

- eval: E5
  run_id: minted-tran-mot-lan-uy-thac-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_luot_moi
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [49.00ms]

- eval: E6
  run_id: minted-tran-mot-lan-uy-thac-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_ngoai_kenh_builder
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     7 expect() calls
    Ran 1 test across 1 file. [66.00ms]

- eval: E7
  run_id: minted-tran-mot-lan-uy-thac-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_cung_mot_batch
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [52.00ms]

- eval: E8
  run_id: minted-tran-mot-lan-uy-thac-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_mot_cau_thong_diep
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [56.00ms]

- eval: E9
  run_id: minted-tran-mot-lan-uy-thac-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tr_khong_co_loi_goi
  verified_at: 2026-09-09T10:10:00Z
  output: |
     0 fail
     11 expect() calls
    Ran 3 tests across 1 file. [54.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mttie12oielf
  exit_code: 0
  verified_at: 2026-09-09T10:10:00Z
  output: |
      Time:    28.068s

    test-run: dropped crm_mttie12oielf_test

- cmd: bunx turbo run check-types --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_check_types_force-r3
  exit_code: 0
  verified_at: 2026-09-09T10:10:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    5.968s

- cmd: bunx turbo run lint --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-09T10:10:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    291ms

- cmd: bun run lint:slop
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-09T10:10:00Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 389ms on 949 files with 9 rules using 18 threads.

- cmd: bunx turbo run build --force
  run_id: minted-tran-mot-lan-uy-thac-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-09T10:10:00Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    9.075s

## Known limits

## Ngoài hợp đồng

## Analyst

none — every feature eval is red on baseline (discriminates)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: AC-9 (E9) sai fixture — bài chiều đỏ gọi thẳng `goiBuilder` thay vì đọc từ `HINH_DANG_KHONG_GOI`, không đo được nhánh đúng của hook. Trả về implementation, sửa lại ở commit 8485487.
Round 2: Cả 9 eval E1-E9 pass qua `bun test` (`apps/agent/test/tran-uy-thac.spec.ts`), suite `bun run test` xanh (257 tests). `bunx turbo run check-types --force` thất bại (exit 2, `app#check-types`: `.next/types/cache-life.d.ts` / `validator.ts` not found) — lỗi này không gắn eval nào nhưng chặn cổng Bằng chứng. Verdict: REJECT.
Round 3: Cả 9 eval E1-E9 pass, suite `bun run test` xanh, và `bunx turbo run check-types --force` nay pass (exit 0, 13/13 tasks) sau khi sửa lỗi `.next/types` từ round 2. `lint`, `lint:slop`, `build` đều xanh. Verdict: PASS.
