---
schema_version: 2
feature_slug: ly-do-can-chinh-tu-soan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4ea95fa47733d7f27f17fb318e6172319b464e3f
human_signoff:
---

# Evidence Report: ly-do-can-chinh-tu-soan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-1 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-ly-do-can-chinh-tu-soan-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_dua_vao
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183fg1a3jr_test
    __EXIT=0

- eval: E2
  run_id: minted-ly-do-can-chinh-tu-soan-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_visao_rong
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183fjwd36x_test
    __EXIT=0

- eval: E3
  run_id: minted-ly-do-can-chinh-tu-soan-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_gan_tay
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183gae0bh7_test
    __EXIT=0

- eval: E4
  run_id: mv183gq92c4y
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ldcc_can_chinh_cu
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183gq92c4y_test
    __EXIT=0

- eval: E5
  run_id: minted-ly-do-can-chinh-tu-soan-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_muc_tin
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183gc4q2e6_test
    __EXIT=0

- eval: E6
  run_id: minted-ly-do-can-chinh-tu-soan-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_dien_lai
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183h8km5no_test
    __EXIT=0

- eval: E7
  run_id: minted-ly-do-can-chinh-tu-soan-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_quyen_xem
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183gp40p46_test
    __EXIT=0

- eval: E8
  run_id: minted-ly-do-can-chinh-tu-soan-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldcc_migration
  verified_at: 2026-10-09T17:11:52Z
  output: |
    MIGRATION: 4 cau, chi them
    __EXIT=0

- eval: E9
  run_id: minted-ly-do-can-chinh-tu-soan-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldcc_pham_vi
  verified_at: 2026-10-09T17:11:52Z
  output: |
    PHAM VI: 27 tep, 0 ngoai ranh gioi
    __EXIT=0

- eval: E10
  run_id: minted-ly-do-can-chinh-tu-soan-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldcc_dot_bien
  verified_at: 2026-10-09T17:11:52Z
  output: |
    DOT BIEN: 8/8 cap dat
    __EXIT=0

- eval: E11
  run_id: minted-ly-do-can-chinh-tu-soan-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldcc_do_nguong
  verified_at: 2026-10-09T17:11:52Z
  output: |
    test-run: dropped crm_mv183m71v2so_test
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bun run lint:slop
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

- cmd: bunx turbo run build --force
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T17:11:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

E4 (AC-3, lệnh `bun run test -- "cd apps/api && bun test test/okr-can-chinh.spec.ts"`) xanh cả trên code cũ lẫn bản này (baseline green). Đây là regression-guard có chủ ý: tệp chỉ được thêm bốn khoá lyDo, canCu, lyDoTuKara, mucTin vào dữ liệu giả và E9 đo rằng không dòng nào của ma trận bị đổi. Mọi eval tính năng khác đều red trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E11 và bảy lệnh suite đều đạt; không eval nào fail. Không có judgment item.
