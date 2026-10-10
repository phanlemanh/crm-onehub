---
schema_version: 2
feature_slug: ban-gieo-gop-y-sau-nop
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 65484d3cda61b681e2aae56b9a965c9ff6ba3b71
human_signoff: Phan Le Manh 2026-10-10
---

# Evidence Report: ban-gieo-gop-y-sau-nop

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ban-gieo-gop-y-sau-nop-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3b_gieo_thu
  verified_at: 2026-10-09T19:18:55Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3b_kiem_nop
  verified_at: 2026-10-10T08:38:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3b_ba_ban_do
  verified_at: 2026-10-10T08:38:57Z
  output: |
    ba-ban-do: 3/3 lenh qua buoc gieo

- eval: E4
  run_id: minted-ban-gieo-gop-y-sau-nop-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3b_ranh_gioi
  verified_at: 2026-10-10T08:38:57Z
  output: |
    ranh-gioi: 22 tep, 0 ngoai (neo nhanh-mo)

- eval: E5
  run_id: minted-ban-gieo-gop-y-sau-nop-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k3b_dot_bien
  verified_at: 2026-10-10T08:38:57Z
  output: |
    dot-bien: 3/3 vet bi bat, tep that nguyen

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bun run lint:slop
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

- cmd: bunx turbo run build --force
  run_id: minted-ban-gieo-gop-y-sau-nop-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-10T08:38:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

none — khong co eval khong-phan-biet nao duoc liet ke; baseline round nay khong do lai (n-a), cac lenh suite xanh o ca hai phia la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 và toàn bộ lệnh suite đều qua; verdict PASS.
Round 2: delta chạy lại E3, E4, E5 và bảy lệnh suite, tất cả qua; E1 và E2 mang sang từ round 1 vì delta không chạm paths của chúng. Verdict PASS.
Round 3: delta chạy lại E3, E4, E5 và bảy lệnh suite, tất cả qua; E1 và E2 mang sang từ round 1 vì delta không chạm paths của chúng; baseline mang từ round 2, không đo lại. Verdict PASS.
