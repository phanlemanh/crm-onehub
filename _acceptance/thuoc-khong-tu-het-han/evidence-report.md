---
schema_version: 2
feature_slug: thuoc-khong-tu-het-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0c2fbef3ae14586d75ad44e193cecfea12a309b4
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
  run_id: minted-thuoc-khong-tu-het-han-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tkh_paths_chet
  verified_at: 2026-10-09T19:04:08Z
  output: |
    paths-chet: XANH — 0 eval co glob chet trong 20 eval cua danh sach

- eval: E2
  run_id: minted-thuoc-khong-tu-het-han-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tkh_chi_paths
  verified_at: 2026-10-09T19:04:08Z
  output: |
    chi-paths: XANH — chi paths doi, dung 20 eval cua danh sach, dung nhu danh sach ghi

- eval: E3
  run_id: minted-thuoc-khong-tu-het-han-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tkh_e7
  verified_at: 2026-10-09T19:04:08Z
  output: |
    hai-thuoc: XANH

- eval: E4
  run_id: minted-thuoc-khong-tu-het-han-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tkh_e10
  verified_at: 2026-10-09T19:04:08Z
  output: |
    hai-thuoc: XANH

- eval: E5
  run_id: minted-thuoc-khong-tu-het-han-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tkh_kiem_ke
  verified_at: 2026-10-09T19:04:08Z
  output: |
    kiem-ke: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bun run lint:slop
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

- cmd: bunx turbo run build --force
  run_id: minted-thuoc-khong-tu-het-han-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T19:04:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

none — khong eval nao duoc ghi nhan la khong-phan-biet; cac lenh suite xanh-ca-hai-phia la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 va bay lenh suite deu xanh tren cay 4f8033154895582c30ce1265461190eff2f90ff8; khong eval nao fail. Review con bon muc nhe/trung trong hop dong (chi tiet trong review-findings.md), khong muc nao chan hop dong.
Round 2: E1-E5 va bay lenh suite deu xanh tren cay 0c2fbef3ae14586d75ad44e193cecfea12a309b4 (sau commit va ba cho ho S4 vong 1); khong eval nao fail, khong muc trong hop dong con lai.
