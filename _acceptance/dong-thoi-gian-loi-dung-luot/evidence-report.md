---
schema_version: 2
feature_slug: dong-thoi-gian-loi-dung-luot
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d4f6837cee3025dacf8ecd05cd454ae9ff916f4
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
  run_id: minted-dong-thoi-gian-loi-dung-luot-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_lam_moi_roi_xem_cu
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 1 test across 1 file. [914.00ms]

- eval: E2
  run_id: minted-dong-thoi-gian-loi-dung-luot-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_xem_cu_roi_lam_moi
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 1 test across 1 file. [1039.00ms]

- eval: E3
  run_id: minted-dong-thoi-gian-loi-dung-luot-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_thu_lai_lam_moi
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 1 test across 1 file. [1044.00ms]

- eval: E4
  run_id: minted-dong-thoi-gian-loi-dung-luot-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_doi_tab
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 1 test across 1 file. [1343.00ms]

- eval: E5
  run_id: minted-dong-thoi-gian-loi-dung-luot-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtl_hoi_quy_k6c
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 4 tests across 1 file. [1.52s]

- eval: E6
  run_id: minted-dong-thoi-gian-loi-dung-luot-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_dong_thoi_gian
  verified_at: 2026-10-08T19:00:55Z
  output: |
    Ran 1 test across 1 file. [1009.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bun run lint:slop
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

- cmd: bunx turbo run build --force
  run_id: minted-dong-thoi-gian-loi-dung-luot-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T19:00:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay.

none — khong co eval khong-phan-biet nao duoc liet ke; cac lenh suite xanh-ca-hai-phia la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS kèm hai phát hiện trong hợp đồng (AC-3, AC-4) — quay lại sửa: nhớ lỗi theo khoá tab qua QueryClient, E3/E4 thêm ô đổi tab và quay lại.
Round 2: PASS — sáu eval và bảy lệnh suite đều xanh trên commit đã ghim; không có phát hiện trong hợp đồng.
