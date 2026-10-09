---
schema_version: 2
feature_slug: chen-lien-ket-khong-lac
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dc037f0b18a206b79b2ebaa8a72f503b69ac352e
human_signoff: Phan Le Manh 2026-10-08
---

# Evidence Report: chen-lien-ket-khong-lac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-4, AC-6 | test | PASS |
| E2 | AC-2, AC-4, AC-5 | script | PASS |
| E3 | AC-3, AC-5 | script | PASS |
| E4 | AC-4, AC-6 | script | PASS |
| E5 | AC-4, AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chen-lien-ket-khong-lac-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tdk_chen_lien_ket_ui
  verified_at: 2026-10-08T02:00:18Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/trinh-soan-lien-ket.dom.tsx
    Ran 6 tests across 1 file. [3.03s]

- eval: E2
  run_id: minted-chen-lien-ket-khong-lac-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.clk_pha_chot_xanh
  verified_at: 2026-10-08T02:00:18Z
  output: |
    bun _acceptance/chen-lien-ket-khong-lac/rang/pha-chot.mjs xanh
    bun ma 0, 0 bai do, 0 dong commandManager

- eval: E3
  run_id: minted-chen-lien-ket-khong-lac-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.clk_pha_chot_do
  verified_at: 2026-10-08T02:00:18Z
  output: |
    bun _acceptance/chen-lien-ket-khong-lac/rang/pha-chot.mjs do
    commandManager trong khoi bai moi: 2, ngoai khoi: 8

- eval: E4
  run_id: minted-chen-lien-ket-khong-lac-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.clk_pha_chot_cham
  verified_at: 2026-10-08T02:00:18Z
  output: |
    bun _acceptance/chen-lien-ket-khong-lac/rang/pha-chot.mjs cham
    (khong co dong ket qua nao khac ngoai ma thoat hop le)

- eval: E5
  run_id: minted-chen-lien-ket-khong-lac-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.clk_pha_chot_mat
  verified_at: 2026-10-08T02:00:18Z
  output: |
    bun _acceptance/chen-lien-ket-khong-lac/rang/pha-chot.mjs mat
    bai Esc tren ban sao khong tra focus: do dung sau 2202.4ms

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bun run lint:slop
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

- cmd: bunx turbo run build --force
  run_id: minted-chen-lien-ket-khong-lac-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T02:00:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

E1 — lệnh `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/trinh-soan-lien-ket.dom.tsx` xanh trên cả HEAD lẫn baseline (baseline: green), nên tự nó không phân biệt được code mới với code cũ. Đây là bài giữ hồi quy có chủ ý: chiều đỏ của bài mới do E3 đảm nhiệm trên cùng bản sao (lớp chặn bị gỡ thì bài mới đỏ), còn E4 và E5 chứng minh bài Esc mới chờ đủ lâu và không nuốt lỗi «không trả focus».

Bốn eval E2–E5 đều đỏ trên baseline (baseline: red) — có phân biệt.

Judge panel: không có eval judgment nào trong vòng này, không có panel cần chấm.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, xác định; không eval nào có pass_rate lẫn).

## Iterations

Round 1: E1–E5 và bảy lệnh suite đều xanh. Không có lượt trả về triển khai.

