---
schema_version: 2
feature_slug: okr-mau-xoa-du
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d7ef660079a450d2992278446170f8b81cac956
human_signoff: Phan Le Manh 2026-10-21
---

# Evidence Report: okr-mau-xoa-du

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-mau-xoa-du-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_viec
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-viec"
    test-run: dropped crm_mvgv5t3wox1p_test

- eval: E2
  run_id: minted-okr-mau-xoa-du-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_tin_hieu
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-tin-hieu"
    test-run: dropped crm_mvgv5t32dcth_test

- eval: E3
  run_id: minted-okr-mau-xoa-du-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_ngoai_giu
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-ngoai-giu"
    test-run: dropped crm_mvgv5t8obmll_test

- eval: E4
  run_id: minted-okr-mau-xoa-du-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_ten_giu
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t okx-ten-giu"
    test-run: dropped crm_mvgv5sngjodt_test

- eval: E5
  run_id: minted-okr-mau-xoa-du-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_luoi
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau-khoa-nguoi.spec.ts -t okx-luoi"
    test-run: dropped crm_mvgv5tfradxc_test

- eval: E6
  run_id: minted-okr-mau-xoa-du-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.okx_man_canh_kr
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: EVAL=E12,E15,E17 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/canh-kr-okr/rang/man-canh-kr.mjs"
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-okr-mau-xoa-du-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.okx_da_ky
  verified_at: 2026-10-20T15:50:54Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t xoa-mau"
    test-run: dropped crm_mvgv5t7tgrvq_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-mau-xoa-du-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bun run lint:slop
  run_id: minted-okr-mau-xoa-du-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-mau-xoa-du-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-20T15:50:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi).

Eval khong phan biet (xanh ca tren HEAD lan baseline round 1, chung minh harness chu khong phai feature; ca da ky nen coi la regression-guard co chu y):

- E7 — bun run test -- "cd apps/api && bun test test/okr-mau.spec.ts -t xoa-mau" (AC-7: ba ca da ky giu nguyen, khong sua assert nao)

Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lenh suite `--filter=api` do; cac eval E1-E7 xanh; chi co phat hien ngoai hop dong. Returned to implementation.
Round 2: lenh suite `--filter=api` van do va them mot phat hien trong hop dong (AC-3: phu thuoc do nguoi ngoai tao giua hai viec cua nguoi mau bi xoa am tham). Returned to implementation.
Round 3: bay eval E1-E7 va bay lenh suite deu xanh tren commit 4d7ef660079a450d2992278446170f8b81cac956; khong con phat hien trong hop dong.
