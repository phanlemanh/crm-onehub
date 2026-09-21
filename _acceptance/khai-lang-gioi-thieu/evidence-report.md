---
schema_version: 2
feature_slug: khai-lang-gioi-thieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 850cd9acc2cddead2946d9d443ad361a72762406
human_signoff:
---

# Evidence Report: khai-lang-gioi-thieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-khai-lang-gioi-thieu-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kl_foreign_text
  verified_at: 2026-09-22T00:00:00Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts test/khai-tieng.spec.tsx
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [239.00ms]

- eval: E2
  run_id: minted-khai-lang-gioi-thieu-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kl_metaline
  verified_at: 2026-09-22T00:00:00Z
  output: |
    cd apps/app && bun test test/khai-tieng-metaline.spec.tsx
     0 fail
     6 expect() calls
    Ran 3 tests across 1 file. [336.00ms]

- eval: E4
  run_id: minted-khai-lang-gioi-thieu-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kl_gioi_thieu
  verified_at: 2026-09-22T00:00:00Z
  output: |
    cd apps/app && bun test test/khai-tieng-metaline.spec.tsx -t "chieu d"
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [328.00ms]

- eval: E3
  run_id: minted-khai-lang-gioi-thieu-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kl_metaline
  verified_at: 2026-09-22T00:00:00Z
  output: |
    cd apps/app && bun test test/khai-tieng-metaline.spec.tsx -t "chieu d"
    (bai "chieu c" cung tep — xem E2 cho lenh day du)
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [328.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-khai-lang-gioi-thieu-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-22T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-khai-lang-gioi-thieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-khai-lang-gioi-thieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-khai-lang-gioi-thieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 đều pass ngay từ lần chạy đầu; không có vòng sửa lại.
