---
schema_version: 2
feature_slug: luat-kho-vong-doi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b97d1ac255b610c18a20ac01ea594a1833e68550
human_signoff:
---

# Evidence Report: luat-kho-vong-doi

Vòng 1. Cả bốn eval máy chạy xong và đạt. Verdict tổng là REJECT vì bước review tìm ra hai phát hiện trong hợp đồng, cùng chỉ về AC-8: job `luat-kho` trong `.github/workflows/acceptance.yml` chạy `bun install --frozen-lockfile` mà không đặt `DATABASE_URL`, nên bước cài đỏ trước khi tới lệnh thước. Chi tiết nằm trong review-findings.md.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-5, AC-6, AC-7 | script | PASS |
| E2 | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 | script | PASS |
| E3 | AC-8 | script | PASS |
| E4 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luat-kho-vong-doi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.luat_kho_cay_du
  verified_at: 2026-10-09T08:10:20Z
  output: |
    KET LUAN: cay xanh (7/7 luat ap dung xanh, 0 khong ap dung, doi du luat), chieu do 39/39 — ma thoat 0

- eval: E2
  run_id: minted-luat-kho-vong-doi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_pha
  verified_at: 2026-10-09T08:10:20Z
  output: |
    pha: 15/15 o dat, cay noi goi lenh khong doi

- eval: E3
  run_id: minted-luat-kho-vong-doi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_ci
  verified_at: 2026-10-09T08:10:20Z
  output: |
    ci: .github/workflows/acceptance.yml co job chay `node scripts/luat-kho/do-cay.mjs --du-luat` sau `bun install --frozen-lockfile`, chan khi do; ba chieu do dung cho

- eval: E4
  run_id: minted-luat-kho-vong-doi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lkv_thoi_gian
  verified_at: 2026-10-09T08:10:20Z
  output: |
    thoi-gian: trung vi goc 7.4 s, HEAD 8.6 s, chenh 1.2 s (tran 120 s)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bunx turbo run lint --force
  run_id: minted-luat-kho-vong-doi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bun run lint:slop
  run_id: minted-luat-kho-vong-doi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

- cmd: bunx turbo run build --force
  run_id: minted-luat-kho-vong-doi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T08:10:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh phần khung đo chứ không chứng minh tính năng; viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1 — `node scripts/luat-kho/do-cay.mjs --du-luat`: baseline green. Đây là thước đo cây thật. Nó xanh trên cả hai phía vì cây vốn không có vi phạm vòng đời; phần phân biệt hành vi do E2 gánh (baseline red).

Không có eval nào khai judgment, nên không có panel judge. Mọi eval là script, không có mục nào chờ human_override.

## Variance

none — every multi-run eval is uniform (cả bốn eval chạy một lượt, deterministic, không có pass_rate).

## Iterations

Round 1: không eval máy nào đỏ, nhưng review tìm hai phát hiện trong hợp đồng cho AC-8 (job `luat-kho` thiếu `DATABASE_URL` nên bước `bun install` đỏ ở postinstall `prisma generate` trước khi chạy thước; E3 chỉ kiểm hình dạng YAML nên không bắt được). Verdict REJECT, trả về implementation.
