---
schema_version: 2
feature_slug: tai-lieu-khoi-phuc-chap-chon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 87ab0c676d7d92d92d6bbcb427cedc8c8880cc17
human_signoff:
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
  baseline: green
  verifier: config:executors.test.tlkp_khoi_phuc
  verified_at: 2026-10-16T18:32:17Z
  cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t khoi-phuc:.de.xuat.khoi.phuc.duoc.duyet"
  output: |
    test-run: dropped crm_mvbb21gu3mp0_test

- eval: E2
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlkp_luu_tru
  verified_at: 2026-10-16T18:32:17Z
  cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t duyet-luu-tru:.ma.tran.nguoi.viet.truoc"
  output: |
    test-run: dropped crm_mvbb210v9mvf_test

- eval: E3
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlkp_dem
  verified_at: 2026-10-16T18:32:17Z
  cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t tlkp-dem"
  output: |
    test-run: dropped crm_mvbb211rkiyh_test

- eval: E4
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlkp_tinh
  verified_at: 2026-10-16T18:32:17Z
  cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts -t tlkp-tinh"
  output: |
    test-run: dropped crm_mvbb20parr97_test

- eval: E5
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlkp_tep
  verified_at: 2026-10-16T18:32:17Z
  cmd: bun run test -- "cd apps/api && bun test test/tai-lieu-luu-tru.spec.ts"
  output: |
    test-run: dropped crm_mvbb20zk9qz1_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bunx turbo run lint --force
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bun run lint:slop
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

- cmd: bunx turbo run build --force
  run_id: minted-tai-lieu-khoi-phuc-chap-chon-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T18:32:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase; chứng minh harness chứ không chứng minh tính năng — nên viết lại để khẳng định hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- E1 (AC-1): ca «khoi-phuc: de xuat khoi phuc duoc duyet» — baseline green. Chiều đo phân biệt nằm ở E3, không ở E1.
- E2 (AC-2): ca «duyet-luu-tru: ma tran nguoi viet truoc» — baseline green. Chiều đo phân biệt nằm ở E3, không ở E2.
- E5 (AC-5): cả tệp tai-lieu-luu-tru.spec.ts — baseline green; là regression-guard có chủ ý cho cả tệp.

E3 và E4 là baseline red: có phân biệt.

## Variance

none — mọi eval đều chạy một lượt, xác định, kết quả đồng nhất (E1–E5 mỗi eval 1/1).

## Iterations

Round 1: E1–E5 và bảy lệnh suite đều xanh. Không có eval thất bại, không có mục phán xét chờ người.
