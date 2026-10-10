---
schema_version: 2
feature_slug: lo-trinh-ten-va-build
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 43cd0534011a69741451ebf8054986ad05dd2337
human_signoff:
---

# Evidence Report: lo-trinh-ten-va-build

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lo-trinh-ten-va-build-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dtoc_quet_ten
  verified_at: 2026-10-10T10:37:39Z
  output: |
    bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs
    KET LUAN 22 DUNG, 0 SAI

- eval: E2
  run_id: minted-lo-trinh-ten-va-build-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.h6_dung_build
  verified_at: 2026-10-10T10:37:39Z
  output: |
    bash _acceptance/lo-trinh-ten-va-build/rang/dung-build.sh
    dung-build: DUNG — build xanh khi co symlink vong, ban dung gon va mang LO-TRINH.html

- eval: E3
  run_id: minted-lo-trinh-ten-va-build-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.h6_dung_build
  verified_at: 2026-10-10T10:37:39Z
  output: |
    bash _acceptance/lo-trinh-ten-va-build/rang/dung-build.sh (cung lenh voi E2)
    dung-build: DUNG — build xanh khi co symlink vong, ban dung gon va mang LO-TRINH.html

- eval: E4
  run_id: minted-lo-trinh-ten-va-build-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.h6_doc_tep
  verified_at: 2026-10-10T10:37:39Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-doc-tep.spec.ts ./test/lo-trinh.dom.tsx ./test/lo-trinh-ngay.spec.ts ./test/proxy-lo-trinh.spec.ts
    Ran 24 tests across 4 files. [3.84s]

- eval: E4b
  run_id: minted-lo-trinh-ten-va-build-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ltc_ban_dung
  verified_at: 2026-10-10T10:37:39Z
  output: |
    node _acceptance/trang-lo-trinh-trong-crm/rang/ban-dung.mjs
    DUNG ban sao chi gom tep cua ban dung doc ra khoi du lieu — /var/folders/9d/08v498213jd2lcnpvdlky46m0000gn/T/lo-trinh-ban-dung-vo5BqF/LO-TRINH.html

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-ten-va-build-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-ten-va-build-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-ten-va-build-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-ten-va-build-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-ten-va-build-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-ten-va-build-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-ten-va-build-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T10:37:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

Hai eval sau xanh ở cả code hiện tại lẫn baseline (không phân biệt), nên chúng chứng minh bộ đo chứ không chứng minh tính năng. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý:

- E4 (lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-doc-tep.spec.ts ./test/lo-trinh.dom.tsx ./test/lo-trinh-ngay.spec.ts ./test/proxy-lo-trinh.spec.ts) — baseline: green
- E4b (lệnh: node _acceptance/trang-lo-trinh-trong-crm/rang/ban-dung.mjs) — baseline: green

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval PASS (E1, E2, E3, E4, E4b); không eval nào hỏng, không mục judgment nào chờ người. Hợp đồng không khai eval judgment nên không có hội đồng chấm.
