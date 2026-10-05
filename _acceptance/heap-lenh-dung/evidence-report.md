---
schema_version: 2
feature_slug: heap-lenh-dung
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d4f3fcab27cbefa671353bb8bf3d7b92047f9075
human_signoff:
---

# Evidence Report: heap-lenh-dung

Vòng 1. Eval E1 xanh, nhưng một lệnh suite (`bun run lint:slop`) không gắn eval nào đã đỏ, nên verdict tổng là REJECT. Lệnh đỏ không thuộc eval nào: lỗi nằm ở chính tệp đo của tính năng (`_acceptance/heap-lenh-dung/rang/build-heap.mjs` dòng 37, luật `anti-slop(no-runtime-typeof)`).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-heap-lenh-dung-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hld_build_heap
  verified_at: 2026-10-05T05:35:12Z
  output: |
    XANH: heap 6144 MB · dung app ma 0 · app:build qua pha type-check

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-heap-lenh-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-heap-lenh-dung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

- cmd: bun run lint:slop
  run_id: minted-heap-lenh-dung-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-05T05:35:12Z
  note: lệnh này không gắn eval nào. oxlint báo một lỗi `anti-slop(no-runtime-typeof)` tại `_acceptance/heap-lenh-dung/rang/build-heap.mjs:37` (`typeof nodeOptions === "string"`), tệp đo do chính tính năng này thêm.

- cmd: bunx turbo run build --force
  run_id: minted-heap-lenh-dung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-05T05:35:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất

## Iterations

Round 1: không eval nào đỏ, nhưng `bun run lint:slop` đỏ ở tệp đo `build-heap.mjs` dòng 37 (luật no-runtime-typeof). Trả về bước cài đặt để sửa tệp đo.
