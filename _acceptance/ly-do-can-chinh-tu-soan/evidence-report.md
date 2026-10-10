---
schema_version: 2
feature_slug: ly-do-can-chinh-tu-soan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5f7dbc43980ad6df20f81c83aa4656ec124aad14
human_signoff: Phan Le Manh 2026-10-10
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
  run_id: minted-ly-do-can-chinh-tu-soan-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_dua_vao
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t dua-vao"
    test-run: dropped crm_mv1myoszdodf_test

- eval: E2
  run_id: minted-ly-do-can-chinh-tu-soan-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_visao_rong
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t visao-rong"
    test-run: dropped crm_mv1mypd0ms0z_test

- eval: E3
  run_id: minted-ly-do-can-chinh-tu-soan-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_gan_tay
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t gan-tay"
    test-run: dropped crm_mv1mypp1jwot_test

- eval: E4
  run_id: mv183gq92c4y
  exit_code: 0
  verifier: config:executors.test.ldcc_can_chinh_cu
  verified_at: 2026-10-09T17:11:52Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-ly-do-can-chinh-tu-soan-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_muc_tin
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t muc-tin"
    test-run: dropped crm_mv1myp5oydfb_test

- eval: E6
  run_id: minted-ly-do-can-chinh-tu-soan-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_dien_lai
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t dien-lai"
    test-run: dropped crm_mv1myps0vval_test

- eval: E7
  run_id: minted-ly-do-can-chinh-tu-soan-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_quyen_xem
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t quyen-xem"
    test-run: dropped crm_mv1mypv2hnqh_test

- eval: E8
  run_id: minted-ly-do-can-chinh-tu-soan-E8-r1
  exit_code: 0
  verifier: config:executors.script.ldcc_migration
  verified_at: 2026-10-09T17:11:52Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-ly-do-can-chinh-tu-soan-E9-r1
  exit_code: 0
  verifier: config:executors.script.ldcc_pham_vi
  verified_at: 2026-10-09T17:11:52Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-ly-do-can-chinh-tu-soan-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldcc_dot_bien
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun _acceptance/ly-do-can-chinh-tu-soan/rang/dot-bien.mjs
    DOT BIEN: 8/8 cap dat

- eval: E11
  run_id: minted-ly-do-can-chinh-tu-soan-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldcc_do_nguong
  verified_at: 2026-10-10T00:07:47Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-ly-do-can-chinh.spec.ts -t do-nguong"
    test-run: dropped crm_mv1myorhz99r_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bun run lint:slop
  run_id: minted-ly-do-can-chinh-tu-soan-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

- cmd: bunx turbo run build --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-10T00:07:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval xanh ở cả hai phía (không phân biệt, chứng minh harness chứ không phải feature): E4 (bun run test -- "cd apps/api && bun test test/okr-can-chinh.spec.ts"). Đây là regression-guard có chủ ý của ma trận căn chỉnh cũ; E9 đo rằng tệp chỉ có dòng thêm.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E11 và bảy lệnh suite đều đạt; không eval nào fail. Không có judgment item.
Round 2: E1, E2, E3, E5, E6, E7, E10, E11 và bảy lệnh suite chạy lại và đều đạt trên 5f7dbc43; E4, E8, E9 mang từ round 1 vì delta không chạm paths của chúng. Không eval nào fail, không có judgment item.
