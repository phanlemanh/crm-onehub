---
schema_version: 2
feature_slug: nang-kit-3-1-1
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2150e2111b334c0b83eb025df1eddd42ff75df38
human_signoff: Phan Le Manh 2026-11-25
---

# Evidence Report: nang-kit-3-1-1

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E5b | AC-5 | script | PASS |
| E5c | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nang-kit-3-1-1-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E2
  run_id: minted-nang-kit-3-1-1-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E3
  run_id: minted-nang-kit-3-1-1-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E4
  run_id: minted-nang-kit-3-1-1-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E5
  run_id: minted-nang-kit-3-1-1-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/rang/doi-chung.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    doi-chung: HEAD 2150e211 --recheck-all lớp chép của HEAD — 368 hồ sơ OK (đủ 368 của nền), VIOLATION ngoài vòng 0, của vòng 1

- eval: E5b
  run_id: minted-nang-kit-3-1-1-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E5c
  run_id: minted-nang-kit-3-1-1-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/rang/luoi-pr.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    luoi-pr: HEAD 2150e211 base 4aebb767 — mã 1, VIOLATION khác vòng 0, của vòng 1

- eval: E6
  run_id: minted-nang-kit-3-1-1-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E7
  run_id: minted-nang-kit-3-1-1-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    node --test _acceptance/nang-kit-3-1-1/thu/nang-kit.test.mjs
    ℹ duration_ms 3989.85875

- eval: E7b
  run_id: minted-nang-kit-3-1-1-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: scripts/product-map.mjs
  verified_at: 2026-11-24T17:03:58Z
  output: |
    LO-TRINH.html khớp tệp ý định và hồ sơ.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nang-kit-3-1-1-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nang-kit-3-1-1-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nang-kit-3-1-1-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nang-kit-3-1-1-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-nang-kit-3-1-1-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bun run lint:slop
  run_id: minted-nang-kit-3-1-1-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

- cmd: bunx turbo run build --force
  run_id: minted-nang-kit-3-1-1-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-11-24T17:03:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong-phan-biet (xanh ca hai phia, la regression-guard co chu y hoac harness): E7b (node scripts/product-map.mjs --root . --check).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — 10/10 eval đạt nhưng lint:slop đỏ ở rang/phan-loai.mjs; sửa ở commit 2150e2111.
Round 2: PASS — 10/10 eval và bảy lệnh suite đều xanh trên 2150e2111.
