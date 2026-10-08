---
schema_version: 2
feature_slug: dong-thoi-gian-loi-dung-luot
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3ad30171053b328e11642e95d81724d8c90db14f
human_signoff:
---

# Evidence Report: dong-thoi-gian-loi-dung-luot

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dong-thoi-gian-loi-dung-luot-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_lam_moi_roi_xem_cu
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 1 test across 1 file. [1127.00ms]

- eval: E2
  run_id: minted-dong-thoi-gian-loi-dung-luot-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_xem_cu_roi_lam_moi
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 1 test across 1 file. [1001.00ms]

- eval: E3
  run_id: minted-dong-thoi-gian-loi-dung-luot-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_thu_lai_lam_moi
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 1 test across 1 file. [967.00ms]

- eval: E4
  run_id: minted-dong-thoi-gian-loi-dung-luot-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_doi_tab
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 1 test across 1 file. [1.72s]

- eval: E5
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_hoi_quy_k6c
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 4 tests across 1 file. [1.61s]

- eval: E6
  run_id: minted-dong-thoi-gian-loi-dung-luot-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_dong_thoi_gian
  verified_at: 2026-10-08T18:28:44Z
  output: |
    Ran 1 test across 1 file. [1200.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: ""__ab9404
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bunx turbo run lint --force
  run_id: ""__128f7f
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bun run lint:slop
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

- cmd: bunx turbo run build --force
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T18:28:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a vi round nay khong do.

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline): không có eval nào được liệt kê. Lệnh suite xanh cả hai phía là regression-guard thông thường, không liệt kê.

Ghi chú máy: mã run_id của E5 và phần đầu mã của hai lệnh suite (app/@crm/ui và turbo lint) do bộ máy tính ra rỗng, được chép nguyên văn từ bản đồ mã, không tự đặt lại.

## Variance

none — every multi-run eval is uniform (mọi eval chạy 1 lần, deterministic, không có pass_rate hỗn hợp)

## Iterations

Round 1: E1-E6 đều xanh, bảy lệnh suite hồi quy xanh; verdict PASS, chờ người ký ở Cổng Bằng chứng.
