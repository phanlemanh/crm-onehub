---
schema_version: 2
feature_slug: deal-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 67860795b1e1047e571d58a2d28667c9106bcfbe
human_signoff: Phan Le Manh 2026-10-08
---

# Evidence Report: deal-va

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-deal-va-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_khoa
  verified_at: 2026-10-08T16:53:55Z
  output: |
    Ran 3 tests across 1 file. [12.00ms]

- eval: E2
  run_id: muzs0dz3ew2x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_rollup
  verified_at: 2026-10-08T16:53:55Z
  output: |
    test-run: dropped crm_muzs0dz3ew2x_test

- eval: E3
  run_id: minted-deal-va-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_tai_lieu
  verified_at: 2026-10-08T16:53:55Z
  output: |
    Ran 1 test across 1 file. [11.00ms]

- eval: E4
  run_id: muzs0daleedk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_agent
  verified_at: 2026-10-08T16:53:55Z
  output: |
    test-run: dropped crm_muzs0daleedk_test

- eval: E5
  run_id: minted-deal-va-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_ban_ghi
  verified_at: 2026-10-08T16:53:55Z
  output: |
    Ran 3 tests across 1 file. [72.00ms]

- eval: E6
  run_id: minted-deal-va-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_cham_mau
  verified_at: 2026-10-08T16:53:55Z
  output: |
    Ran 2 tests across 1 file. [582.00ms]

- eval: E7
  run_id: minted-deal-va-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dva_hoi_quy
  verified_at: 2026-10-08T16:53:55Z
  output: |
    rang khong-xoa-expect (che do tu thu va che do that) va bon tep kiem san co deu xanh; chuoi lenh chay sach den cuoi.

- eval: E8
  run_id: design-gate-43b847480b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dva_san_thiet_ke
  verified_at: 2026-10-08T16:53:55Z
  output: |
    design-gate static tren deal-list-result.tsx: lenh chay sach, khong P0.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-deal-va-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-deal-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-deal-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-deal-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-deal-va-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bun run lint:slop
  run_id: minted-deal-va-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

- cmd: bunx turbo run build --force
  run_id: minted-deal-va-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T16:53:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

E8 (design-gate static tren apps/app/components/agent-builder/deal-list-result.tsx): pass tren ca HEAD lan baseline round 1, nen no chung minh harness thiet ke chu khong phai hanh vi moi cua feature. Day la regression-guard co chu y cho AC-8 (khong them P0 ve thiet ke); cac eval E1 den E7 mo ta hanh vi moi.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong eval nao ngau nhien)

## Iterations

Round 1: E1 den E8 va bay lenh suite deu xanh; verdict PASS.
Round 2: ban viet lai rang khong-xoa-expect (so cau expect nguyen cau thay vi dong diff) va bon lenh suite cung E1 den E8 deu xanh tren commit af387d3ab; verdict PASS.

### Re-pin lần 1 — 2026-10-09, do E1c gỡ nhập chéo app trong test agent (luật kho cach-ly-hai-agent)
run_id: repin-20261009T000523Z-85374
sha: 67860795b1e1047e571d58a2d28667c9106bcfbe · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
