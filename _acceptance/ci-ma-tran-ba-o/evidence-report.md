---
schema_version: 2
feature_slug: ci-ma-tran-ba-o
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 06d8b5620fe5ab0676d4dd72408dc9d2b6910884
human_signoff: Phan Le Manh 2026-10-09 — ký Cổng 2 trên verdict PASS 5/5 eval (S4 vòng 1, wf_776b90a1-496). Ngoài-1..4 (thước do-7-ngay.mjs) và hai phát hiện trong hợp đồng mức thấp gom vào hợp đồng mới; Ngoài-5, 6 ghi Known limits; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: ci-ma-tran-ba-o

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-3 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | script | PASS |
| E4 | AC-5 | script | PASS |
| E5 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ci-ma-tran-ba-o-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmtb_hinh
  verified_at: 2026-10-09T03:57:49Z
  output: |
    hinh: .github/workflows/ci.yml dung ba job, ma tran api · app-ui · con-lai, khong troi so voi onehub 0d045b94f, ci-ok dung 16/16 o; ba chieu do dung cho

- eval: E2
  run_id: minted-ci-ma-tran-ba-o-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmtb_phu_goi
  verified_at: 2026-10-09T03:57:49Z
  output: |
    phu-goi: 11 goi co test, moi goi dung mot o qua duong CI va qua log #323; ba chieu do dung cho

- eval: E3
  run_id: minted-ci-ma-tran-ba-o-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmtb_khop_323
  verified_at: 2026-10-09T03:57:49Z
  output: |
    khop-323: .github/workflows/ci.yml trung ban da do o #323 (blob c4c5f58e0) tren name, runs-on, strategy, services, env, steps, needs, if; chieu do dung cho

- eval: E5
  run_id: minted-ci-ma-tran-ba-o-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmtb_do_7_ngay
  verified_at: 2026-10-09T03:57:49Z
  output: |
    ket luan: chua du mau (2 < 10 luot xanh) — khong ket luan SONG

- eval: E4
  run_id: minted-ci-ma-tran-ba-o-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmtb_claude_md
  verified_at: 2026-10-09T03:57:49Z
  output: |
    claude-md: luat cu da bo, doan moi co nguyen van trong muc «Kho này là bản riêng»; chieu do dung cho

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ci-ma-tran-ba-o-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ci-ma-tran-ba-o-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: mv0g0apu6ty0
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ci-ma-tran-ba-o-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-ci-ma-tran-ba-o-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bun run lint:slop
  run_id: minted-ci-ma-tran-ba-o-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

- cmd: bunx turbo run build --force
  run_id: minted-ci-ma-tran-ba-o-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T03:57:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5 passed; all suite commands green. No iteration needed.
