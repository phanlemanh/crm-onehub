---
schema_version: 2
feature_slug: tai-lieu-diff-bo-myers-vo-ich
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5e5a0c32a8a798e95484ff0cac5e3ab32d13a2ef
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: tai-lieu-diff-bo-myers-vo-ich

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdm_ban_goc
  verified_at: 2026-09-28T14:12:34Z
  output: |
    Ran 7 tests across 1 file. [2.43s]

    __EXIT=0

- eval: E2
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdm_vong_myers
  verified_at: 2026-09-28T14:12:34Z
  output: |
    Ran 2 tests across 1 file. [889.00ms]

    __EXIT=0

- eval: E3
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdm_cat_thuoc
  verified_at: 2026-09-28T14:12:34Z
  output: |
    4/4 dot bien bat, lanh xanh

    __EXIT=0

- eval: E4
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdm_nhanh_hon_goc
  verified_at: 2026-09-28T14:12:34Z
  output: |

    __EXIT=0

- eval: E5
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdm_khong_noi_thuoc
  verified_at: 2026-09-28T14:12:34Z
  output: |
    kiem turbo: dat

    __EXIT=0

- eval: E6
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ktl_so_va_dat
  verified_at: 2026-09-28T14:12:34Z
  output: |

    __EXIT=0

- eval: E7
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ktl_diff
  verified_at: 2026-09-28T14:12:34Z
  output: |
    test-run: dropped crm_mulbv6i4pr8a_test

    __EXIT=0

- eval: E8
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tdm_luat_ma
  verified_at: 2026-09-28T14:12:34Z
  output: |

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T14:12:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T14:12:34Z

- cmd: bun run lint:slop
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T14:12:34Z

- cmd: bunx turbo run build --force
  run_id: minted-tai-lieu-diff-bo-myers-vo-ich-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T14:12:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

- E6 (`bun run test -- "cd apps/api && bun test test/tai-lieu.spec.ts -t so-va-dat"`) — xanh trên cả HEAD lẫn diffBase: đây là eval E6 của hồ sơ đã ký kho-tai-lieu chạy nguyên văn, không nằm trong diff của vòng này, nên nó xác nhận contract cũ vẫn đứng chứ không chứng minh gì về myers-vo-ich. Regression-guard có chủ ý, giữ nguyên.
- E7 (`cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/diff-trang.dom.tsx && cd ../.. && bun run test -- "cd apps/api && bun test test/tai-lieu.spec.ts -t diff-hash"`) — cũng xanh trên cả hai phía, là eval E13 của hồ sơ đã ký kho-tai-lieu chạy nguyên văn (diff-trang.dom.tsx + diffHash client===server); không phải hành vi mới của vòng này. Regression-guard có chủ ý, giữ nguyên.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E8 pass ngay từ lần chạy đầu (tất cả eval phân biệt đúng với baseline khai, trừ E6/E7 là regression-guard có chủ ý của hồ sơ kho-tai-lieu); bốn lệnh suite (test, lint, lint:slop, build) đều xanh. Không có vòng trước.

### Re-pin lần 1 — 2026-09-28, do hoá cũ do gộp onehub (#197) trước khi merge
run_id: repin-20260928T145743Z-47512
sha: 5e5a0c32a8a798e95484ff0cac5e3ab32d13a2ef · suites: 4 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng
