---
schema_version: 2
feature_slug: loi-vao-dieu-phoi-30-ngay
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8dee0b0aa3a65052aa9abcb4d8f5e5511e65412e
human_signoff:
---

# Evidence Report: loi-vao-dieu-phoi-30-ngay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-loi-vao-dieu-phoi-30-ngay-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lv30_loi_vao_thanh_chinh
  verified_at: 2026-09-21T10:15:00Z
  output: |
    cd apps/app && bun test test/khung-dieu-huong.spec.ts -t loi-vao-30-ngay
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [4.00ms]

- eval: E2
  run_id: minted-loi-vao-dieu-phoi-30-ngay-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lv30_danh_dau_dang_mo
  verified_at: 2026-09-21T10:16:00Z
  output: |
    cd apps/app && bun test test/khung-dieu-huong.spec.ts -t danh-dau-dang-mo
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [4.00ms]

- eval: E3
  run_id: minted-loi-vao-dieu-phoi-30-ngay-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lv30_loi_vao_cai_dat
  verified_at: 2026-09-21T10:17:00Z
  output: |
    cd apps/app && bun test test/cai-dat-dieu-huong.spec.ts -t loi-vao-dieu-phoi
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [5.00ms]

- eval: E4
  run_id: minted-loi-vao-dieu-phoi-30-ngay-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lv30_nhan_hai_thu_tieng
  verified_at: 2026-09-21T10:18:00Z
  output: |
    cd apps/app && bun test test/khung-dieu-huong.spec.ts test/cai-dat-dieu-huong.spec.ts -t nhan-hai-thu-tieng
     0 fail
     27 expect() calls
    Ran 2 tests across 2 files. [5.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mub0wbwjuezq
  exit_code: 0
  verified_at: 2026-09-21T10:20:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-loi-vao-dieu-phoi-30-ngay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-21T10:21:00Z

- cmd: bun run lint:slop
  run_id: minted-loi-vao-dieu-phoi-30-ngay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-21T10:22:00Z

- cmd: bunx turbo run build --force
  run_id: minted-loi-vao-dieu-phoi-30-ngay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-21T10:23:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E4 va bon lenh suite (test/lint/lint:slop/build) deu xanh tu lan chay dau; khong co that bai, khong quay lai implementation.
