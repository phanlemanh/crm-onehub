---
schema_version: 2
feature_slug: thuoc-mot-cho-khai-quet-man
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bac2d6d87778af265951d70af935bd05684a9d72
human_signoff: Phan Le Manh 2026-10-10
---

# Evidence Report: thuoc-mot-cho-khai-quet-man

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_lanh
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E2
  run_id: minted-thuoc-mot-cho-khai-quet-man-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_khai_trung
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E3
  run_id: minted-thuoc-mot-cho-khai-quet-man-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_goc_rong
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E4
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_mot_cho
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-thuoc-mot-cho-khai-quet-man-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_k2b_giu
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-thuoc-mot-cho-khai-quet-man-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2d_ranh_gioi
  verified_at: 2026-10-10T01:36:10Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-mot-cho-khai-quet-man-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T01:36:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5, E6 passed; all seven suite commands passed. No eval failed, no return to implementation.
