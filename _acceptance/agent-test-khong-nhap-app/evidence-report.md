---
schema_version: 2
feature_slug: agent-test-khong-nhap-app
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e7c40b9e53402c7df9153d9c06a3109f222d0270
human_signoff: Phan Le Manh 2026-10-09
---

# Evidence Report: agent-test-khong-nhap-app

Round 2. Cả năm eval máy đều đạt trên cây đã ghim ở `verified_commit`, bảy lệnh suite hồi quy đều xanh, không có mục judgment nào nên không có gì chờ người chốt. Lỗi mức cao trong hợp đồng của round 1 (AC-4, phép kiểm mất-trường của E4) đã được sửa ở round này; không còn phát hiện nào nằm trong hợp đồng.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-agent-test-khong-nhap-app-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.atk_luat_kho
  verified_at: 2026-10-09T00:47:02Z
  output: |
    cmd: bun _acceptance/agent-test-khong-nhap-app/rang/luat-kho.mjs
    luat kho thoat 0 · DO cach-ly-hai-agent: 0 · chieu do 32/32

- eval: E2
  run_id: minted-agent-test-khong-nhap-app-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.atk_parse
  verified_at: 2026-10-09T00:47:02Z
  output: |
    cmd: cd packages/validation && bun test test/deal-list.spec.ts
    Ran 4 tests across 1 file. [17.00ms]

- eval: E3
  run_id: minted-agent-test-khong-nhap-app-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.atk_app_dung_goi
  verified_at: 2026-10-09T00:47:02Z
  output: |
    cmd: bun _acceptance/agent-test-khong-nhap-app/rang/app-dung-goi.mjs --tu-thu && bun _acceptance/agent-test-khong-nhap-app/rang/app-dung-goi.mjs
    agent-results.spec.ts thoat 0 · 13 pass

- eval: E4
  run_id: mv08ws6taaws
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.atk_agent
  verified_at: 2026-10-09T00:47:02Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/giai-doan-agent.integration.spec.ts -t stage-id"
    test-run: dropped crm_mv08ws6taaws_test

- eval: E5
  run_id: minted-agent-test-khong-nhap-app-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.atk_ghim
  verified_at: 2026-10-09T00:47:02Z
  output: |
    cmd: bun _acceptance/agent-test-khong-nhap-app/rang/ghim.mjs
    luoi thoat 1 · 3 ho so kiem

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-agent-test-khong-nhap-app-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-agent-test-khong-nhap-app-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-agent-test-khong-nhap-app-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-agent-test-khong-nhap-app-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-agent-test-khong-nhap-app-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bun run lint:slop
  run_id: minted-agent-test-khong-nhap-app-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

- cmd: bunx turbo run build --force
  run_id: minted-agent-test-khong-nhap-app-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T00:47:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, carried từ round 1, chứng minh harness hơn là tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E4 — `bun run test -- "cd apps/agent && bun test test/giai-doan-agent.integration.spec.ts -t stage-id"`

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4 gặp lỗi mức cao trong hợp đồng (AC-4) — phép kiểm mất-trường chỉ lặp trên khoá schema đã khai nên ca đỏ "schema bỏ trường currency" không đỏ được. Trả về triển khai.
Round 2: đã sửa (so trường theo hợp của schema và trường bộ đọc app đã khai); cả năm eval máy và bảy lệnh suite đều đạt, không còn phát hiện trong hợp đồng.

### Re-pin lần 1 — 2026-10-09, do gộp onehub e86cf730 sau chữ ký; ghim.mjs sửa vòng tự tham chiếu
run_id: repin-20261009T023915Z-67771
sha: 1d35649d7a9a185a50cb67678cd9f083610d84f3 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-09, do dòng đo ngưỡng sau gộp kéo hồ sơ vào nhánh E1b; gộp onehub ecbce631
run_id: repin-20261009T070547Z-31779
sha: b201a7280cdc43bffd596d4588a7d34148923843 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-09, do gộp onehub 8439acad (#335 sửa scripts/luat-kho) vào PR #336
run_id: repin-20261009T104727Z-35687
sha: e7c40b9e53402c7df9153d9c06a3109f222d0270 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
