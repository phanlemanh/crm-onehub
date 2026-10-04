---
schema_version: 2
feature_slug: tro-ly-kho-dung-phien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7ddbcff56a4588b9076259995bd647b0da3dc582
human_signoff: Phan Le Manh 2026-10-05 — ký Cổng 2 trên verdict PASS 7/7 eval máy (S4 round 2, wf_e6feeefb-20e). Ngoài-1 mở hợp đồng mới; Ngoài-2 tới Ngoài-7 ghi Known limits; đồng ý phần cắt/hoãn; phê cả hai quyết định Treo-1, Treo-2.
---

# Evidence Report: tro-ly-kho-dung-phien

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-kho-dung-phien-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_gui
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-gui"
    ca kd-gui pass: tin gui phien goc la `Câu hỏi kho ${hoiId}.`, khong lo cau hoi, auth.attributes dung purpose kho / hoiId / userId.

- eval: E2
  run_id: minted-tro-ly-kho-dung-phien-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_loi_dan
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-loi-dan"
    test-run: dropped crm_muu2lmd2iq98_test

- eval: E3
  run_id: minted-tro-ly-kho-dung-phien-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_zdr
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-zdr"
    ca kd-zdr pass: phien goc kho mang zeroDataRetention, bay purpose khac tra null.

- eval: E4
  run_id: minted-tro-ly-kho-dung-phien-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_cam_goi
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-cam-goi"
    test-run: dropped crm_muu2lj76exyb_test

- eval: E5
  run_id: minted-tro-ly-kho-dung-phien-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_tu_choi
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-dung-phien.integration.spec.ts -t kd-tu-choi"
    test-run: dropped crm_muu2ljldx5hu_test

- eval: E6
  run_id: minted-tro-ly-kho-dung-phien-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_hoi_cu
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "cd apps/agent && bun test test/tro-ly-kho-nop.spec.ts && TZ=Asia/Ho_Chi_Minh bun test test/tro-ly-kho-zalo.integration.spec.ts"
    cac ca tlk-kiem, tlk-tu-choi, tlk-qua-han va tro-ly-kho-zalo chay lai khong ca nao do.

- eval: E7
  run_id: minted-tro-ly-kho-dung-phien-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4b_dem
  verified_at: 2026-10-04T17:03:39Z
  output: |
    bun run test -- "bun test _acceptance/tro-ly-kho-dung-phien/rang/dem-sai-phien.spec.ts"
    test-run: dropped crm_muu2lkfz2aoi_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-kho-dung-phien-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T17:03:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

Eval khong-phan-biet (pass tren ca HEAD lan baseline round 1, chung minh harness chu khong phai feature): E6. E6 la regression-guard co chu y: chay lai cac ca tlk-kiem, tlk-tu-choi, tlk-qua-han va tro-ly-kho-zalo cua tro-ly-doc-kho, de xac nhan hanh vi cu khong bi pha. Cac lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — moi eval la deterministic (runs: 1), khong eval nao co pass_rate hon hop.

## Iterations

Round 1: REJECT — mot lenh suite lane agent do, mot phat hien high trong hop dong (AC-3: model ZDR cua phien goc kho bi bo khi chay that vi session.started tra ve model song), kem cac phat hien do-bo-phan ve bai kiem. Quay lai implementation.
Round 2: PASS — E1 den E7 deu xanh tai verified_commit 7ddbcff56a4588b9076259995bd647b0da3dc582 (fix 03815cc: phien goc kho giu ZDR khi chay that; 7ddbcff: kd-zdr parse lua chon model bang zod), bay lenh suite xanh, khong eval nao khai judgment nen khong co panel can cham.
