---
schema_version: 2
feature_slug: sua-paths-e5-soan-okr
verdict: REJECT
failed_evals: [E5]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cf0658e6ad87589659f244f819e7d559bd2ddb9a
human_signoff:
---

# Evidence Report: sua-paths-e5-soan-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | FAIL |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-paths-e5-soan-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_loc_bat
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E2
  run_id: minted-sua-paths-e5-soan-okr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_loc_chon
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E3
  run_id: minted-sua-paths-e5-soan-okr-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_chi_doi
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E4
  run_id: repin-20261008T102122Z-39920
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_ghim
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-sua-paths-e5-soan-okr-E5-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.f19_pre_merge
  verified_at: 2026-10-08T10:38:23Z
  output: |
    HEAD cf0658e6ad87589659f244f819e7d559bd2ddb9a · origin/onehub 591bc8fb63a6505a888f80ccde43fc498e4eed2a
    dau ra: .acceptance-runs/sua-paths-e5-soan-okr/pre-merge.txt
    ma-thoat:1
    KET LUAN: 1 SAI — ma thoat 1

- eval: E6
  run_id: minted-sua-paths-e5-soan-okr-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_ranh_gioi
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E7
  run_id: minted-sua-paths-e5-soan-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.f19_luoi_that
  verified_at: 2026-10-08T10:38:23Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bun run lint:slop
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-paths-e5-soan-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T10:38:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E5 failed — pre-merge.mjs đòi pre-merge-check.sh thoát thành công toàn cục, nhưng ở S4 hồ sơ của chính vòng này (trạng thái implemented) chưa có evidence-report.md nên lưới luôn báo thiếu báo cáo cho slug của vòng; hồ sơ soan-okr-cung-tro-ly thì không có vi phạm. Không có lệnh fail nào không gắn eval. Returned to implementation.
