---
schema_version: 2
feature_slug: ca-chap-chon-con-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d5abe9ec87b9d80ffa3a0ab21fd2d312ee15fe91
human_signoff: Phan Le Manh 2026-10-09
---

# Evidence Report: ca-chap-chon-con-lai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-2 | script | PASS |
| E8 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: mv0qn49xowky
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ccl_khoi_tasks
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'a limited lock subquery'"
    runs: 1, passes: 1
    test-run: dropped crm_mv0qn49xowky_test

- eval: E2
  run_id: minted-ca-chap-chon-con-lai-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ccl_dot_bien
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun _acceptance/ca-chap-chon-con-lai/rang/dot-bien.mjs
    runs: 1, passes: 1
    DOT BIEN: 6/6 cap dat

- eval: E3
  run_id: mv0qn5bl6jpu
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ccl_ca_that
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'still (retires|claims) exactly the limit'"
    runs: 1, passes: 1
    test-run: dropped crm_mv0qn5bl6jpu_test

- eval: E4
  run_id: minted-ca-chap-chon-con-lai-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ccl_ma
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun _acceptance/ca-chap-chon-con-lai/rang/ma.ts
    runs: 1, passes: 1
    MA: 3 moc, 30000 chuoi, 0 chu so

- eval: E5
  run_id: mv0qn5q5z4mu
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ccl_goi_dong_ho
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test --preload ../../_acceptance/ca-chap-chon-con-lai/rang/dong-ho-26.ts test/goi-soan.integration.spec.ts -t goiKiemTu"
    runs: 1, passes: 1
    test-run: dropped crm_mv0qn5q5z4mu_test

- eval: E6
  run_id: minted-ca-chap-chon-con-lai-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ccl_pham_vi
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun _acceptance/ca-chap-chon-con-lai/rang/pham-vi.mjs
    runs: 1, passes: 1
    PHAM VI: 20 tep, 0 ngoai ranh gioi

- eval: E7
  run_id: minted-ca-chap-chon-con-lai-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ccl_lap
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun _acceptance/ca-chap-chon-con-lai/rang/lap.mjs
    runs: 1, passes: 1
    LAP: tasks 20/20, goiKiemTu 20/20

- eval: E8
  run_id: mv0qn5fgw1pv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ccl_id_trong_goi
  verified_at: 2026-10-09T09:03:08Z
  output: |
    cmd: bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/goi-soan.integration.spec.ts -t id-trong-goi"
    runs: 1, passes: 1
    test-run: dropped crm_mv0qn5fgw1pv_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ca-chap-chon-con-lai-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ca-chap-chon-con-lai-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ca-chap-chon-con-lai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ca-chap-chon-con-lai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-ca-chap-chon-con-lai-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bun run lint:slop
  run_id: minted-ca-chap-chon-con-lai-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

- cmd: bunx turbo run build --force
  run_id: minted-ca-chap-chon-con-lai-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T09:03:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline diffBase, nghĩa là chúng chứng minh harness chứ không chứng minh feature; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- E1 (cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'a limited lock subquery'"): baseline green. Chiều đỏ của AC-1 do cặp (c) và (d) của E2 gánh, không do E1 tự nó.
- E3 (cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tasks.integration.spec.ts -t 'still (retires|claims) exactly the limit'"): baseline green. Đây là regression-guard có chủ ý cho AC-3 (hai ca thật không đổi); E6 đo thêm rằng các dòng expect của hai ca này không bị bỏ.

Các eval còn lại (E2, E4, E5, E6, E7, E8) đều red trên baseline, nghĩa là có phân biệt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đến E8 đều xanh, bảy lệnh suite xanh. Không eval nào fail.

### Re-pin lần 1 — 2026-10-09, do sửa bốn phát hiện trong hợp đồng sau S4 r1 và gộp onehub
run_id: repin-20261009T105400Z-30595
sha: d5abe9ec87b9d80ffa3a0ab21fd2d312ee15fe91 · suites: 7 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
