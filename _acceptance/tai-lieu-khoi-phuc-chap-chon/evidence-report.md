---
schema_version: 2
feature_slug: tai-lieu-khoi-phuc-chap-chon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 899b2e62fc86031d07682f12f95928bec4d4ada4
human_signoff: Phan Le Manh 2026-10-17
---

# Evidence Report: tai-lieu-khoi-phuc-chap-chon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlkp_khoi_phuc
  verified_at: 2026-10-16T18:54:24Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t khoi-phuc:.de.xuat.khoi.phuc.duoc.duyet"
    test-run: dropped crm_mvbbu88198fx_test

- eval: E2
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlkp_luu_tru
  verified_at: 2026-10-16T18:54:24Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t duyet-luu-tru:.ma.tran.nguoi.viet.truoc"
    test-run: dropped crm_mvbbu7pdr0du_test

- eval: E3
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlkp_dem
  verified_at: 2026-10-16T18:54:24Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t tlkp-dem"
    test-run: dropped crm_mvbbu6pvdwra_test

- eval: E4
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlkp_tinh
  verified_at: 2026-10-16T18:54:24Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t tlkp-tinh"
    test-run: dropped crm_mvbbu7xryynu_test

- eval: E5
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlkp_tep
  verified_at: 2026-10-16T18:54:24Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts"
    test-run: dropped crm_mvbbu7wjxetn_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bun run lint:slop
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

- cmd: bunx turbo run build --force
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T18:54:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: round nay khong do lai (evals.yaml khong doi tu lan baseline cuoi), moi eval ghi baseline n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline cu — chung minh harness, khong chung minh feature; viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E1 (AC-1): bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t khoi-phuc:.de.xuat.khoi.phuc.duoc.duyet"
- E2 (AC-2): bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t duyet-luu-tru:.ma.tran.nguoi.viet.truoc"
- E5 (AC-5): bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts"

Ba eval tren la regression-guard co chu y: chieu do cua E1 va E2 nam o E3 (cung du lieu gieo, cach dem theo moc gio cu dem nham), con E5 la ca tep. E3 va E4 phan biet duoc hanh vi moi.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 deu xanh, 7 lenh suite xanh; khong eval nao fail, khong judgment item, khong mau phuong sai.
