---
schema_version: 2
feature_slug: luat-kho-vong-doi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1dda0fd83908c2316acaf479b407fc7fd23001f5
human_signoff: "Phan Le Manh 2026-10-09 — ký Cổng 2 trên verdict PASS 4/4 eval (S4 vòng 2, wf_cfada493-e8d); Ngoài 1, 2, 3, 5, 7, 8, 9, 10, 11 ghi Known limits, Ngoài 4 và 6 chấp nhận không sửa; đồng ý cắt; phê hết Treo"
---

# Evidence Report: luat-kho-vong-doi

Vòng 2. Cả bốn eval máy đạt và bảy lệnh suite hồi quy đều xanh trên tip 1dda0fd83. Hai phát hiện trong hợp đồng của vòng 1 (job `luat-kho` thiếu `DATABASE_URL`) đã được vá: E3 nay rút danh sách biến từ `packages/db/prisma.config.ts` và có chiều đỏ gỡ `DATABASE_URL`. Các phát hiện ngoài hợp đồng nằm ở review-findings.md để người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-5, AC-6, AC-7 | script | PASS |
| E2 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | script | PASS |
| E3 | AC-8 | script | PASS |
| E4 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luat-kho-vong-doi-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.luat_kho_cay_du
  verified_at: 2026-10-09T08:28:13Z
  output: |
    KET LUAN: cay xanh (7/7 luat ap dung xanh, 0 khong ap dung, doi du luat), chieu do 39/39 — ma thoat 0

- eval: E2
  run_id: minted-luat-kho-vong-doi-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_pha
  verified_at: 2026-10-09T08:28:13Z
  output: |
    pha: 15/15 o dat, cay noi goi lenh khong doi

- eval: E3
  run_id: minted-luat-kho-vong-doi-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_ci
  verified_at: 2026-10-09T08:28:13Z
  output: |
    ci: .github/workflows/acceptance.yml co job chay `node scripts/luat-kho/do-cay.mjs --du-luat` sau `bun install --frozen-lockfile`, chan khi do, du bien postinstall can; bon chieu do dung cho

- eval: E4
  run_id: minted-luat-kho-vong-doi-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_thoi_gian
  verified_at: 2026-10-09T08:28:13Z
  output: |
    thoi-gian: trung vi goc 7.6 s, HEAD 8.3 s, chenh 0.7 s (tran 120 s)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bunx turbo run lint --force
  run_id: minted-luat-kho-vong-doi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bun run lint:slop
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

- cmd: bunx turbo run build --force
  run_id: minted-luat-kho-vong-doi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T08:28:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline, chứng minh thước chứ không phải tính năng; viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1 (`node scripts/luat-kho/do-cay.mjs --du-luat`): pass trên cả HEAD và baseline. Đây là thước đo cây; hành vi mới của vòng đời được phân biệt ở E2 (red trên baseline).

## Variance

none — mọi eval đều xác định (runs: 1), không có eval nào có pass_rate lẫn lộn.

## Judge panels

Không có eval judgment trong vòng này; bốn eval đều là script, không có hội đồng chấm và không có mục chờ human_override.

## Iterations

Round 1: không eval máy nào đỏ, nhưng review tìm hai phát hiện trong hợp đồng cho AC-8 (job `luat-kho` thiếu `DATABASE_URL` nên bước `bun install` đỏ ở postinstall `prisma generate`; E3 chỉ kiểm hình dạng YAML nên không bắt được). Verdict REJECT, trả về implementation.
Round 2: bản vá (commit 1dda0fd83) khai `DATABASE_URL` cho job luật kho, E3 rút danh sách biến từ `prisma.config.ts` và thêm chiều đỏ gỡ biến. Cả bốn eval và bảy lệnh suite đạt, không còn phát hiện trong hợp đồng. Verdict PASS.
