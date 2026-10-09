---
schema_version: 2
feature_slug: thuoc-khong-tu-het-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4f8033154895582c30ce1265461190eff2f90ff8
human_signoff:
---

# Evidence Report: thuoc-khong-tu-het-han

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3, AC-6 | script | PASS |
| E4 | AC-4, AC-6 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thuoc-khong-tu-het-han-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_paths_chet
  verified_at: 2026-10-09T18:46:38Z
  output: |
    paths-chet: XANH — 0 eval co glob chet trong 20 eval cua danh sach

- eval: E2
  run_id: minted-thuoc-khong-tu-het-han-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_chi_paths
  verified_at: 2026-10-09T18:46:38Z
  output: |
    chi-paths: XANH — chi paths doi, dung 20 eval cua danh sach, dung nhu danh sach ghi

- eval: E3
  run_id: minted-thuoc-khong-tu-het-han-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_e7
  verified_at: 2026-10-09T18:46:38Z
  output: |
    hai-thuoc: XANH

- eval: E4
  run_id: minted-thuoc-khong-tu-het-han-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_e10
  verified_at: 2026-10-09T18:46:38Z
  output: |
    hai-thuoc: XANH

- eval: E5
  run_id: minted-thuoc-khong-tu-het-han-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tkh_kiem_ke
  verified_at: 2026-10-09T18:46:38Z
  output: |
    kiem-ke: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T18:46:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 va bay lenh suite deu xanh tren cay 4f8033154895582c30ce1265461190eff2f90ff8; khong eval nao fail. Review con bon muc nhe/trung (chi tiet trong review-findings.md), khong muc nao chan hop dong.
