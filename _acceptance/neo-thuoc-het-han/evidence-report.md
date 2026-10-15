---
schema_version: 2
feature_slug: neo-thuoc-het-han
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d5fb9f19b737f680f0d5de315d8fe31523273df0
human_signoff:
---

# Evidence Report: neo-thuoc-het-han

Round 1. Sáu eval của hợp đồng (E1 đến E6) đều đạt. Verdict là REJECT vì một lệnh suite không gắn eval nào (`bun run test -- --filter=agent-okr ...`) trả mã khác 0. Chi tiết ở khối suite và mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | script | PASS |
| E5 | AC-6 | script | PASS |
| E6 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-neo-thuoc-het-han-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chay_o_dinh
  verified_at: 2026-10-15T06:22:43Z
  output: |
    chay-o-dinh: dat

- eval: E2
  run_id: minted-neo-thuoc-het-han-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_hai_ref
  verified_at: 2026-10-15T06:22:43Z
  output: |
    hai-ref: dat

- eval: E3
  run_id: minted-neo-thuoc-het-han-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lmcv_loi_khong_lam_moi
  verified_at: 2026-10-15T06:22:43Z
  output: |
    Ran 1 test across 1 file. [686.00ms]

- eval: E4
  run_id: minted-neo-thuoc-het-han-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chieu_do
  verified_at: 2026-10-15T06:22:43Z
  output: |
    chieu-do: 5/5 bi bat

- eval: E5
  run_id: minted-neo-thuoc-het-han-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_pham_vi
  verified_at: 2026-10-15T06:22:43Z
  output: |
    pham-vi: dat

- eval: E6
  run_id: repin-20261015T061648Z-91798
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_ghim_xanh
  verified_at: 2026-10-15T06:22:43Z
  output: |
    ghim-xanh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

Lệnh suite dưới đây KHÔNG gắn eval nào và trả mã 1. Trích nguyên văn từ log: `(fail) app-rieng > chạy cạnh apps/agent: hai tiến trình, hai cổng, /eve/v1/health cả hai xanh [5002.06ms]` kèm `^ this test timed out after 5000ms.`; và ở `apps/agent-okr/test/app-rieng.integration.spec.ts:91` có `error: Unable to connect. Is the computer able to access the url?` với `path: "http://127.0.0.1:53564/health"`, `code: "ConnectionRefused"`. Tổng kết gói: `152 pass`, `1 fail`, `1 error`, `Ran 153 tests across 17 files`; turbo báo `Failed: agent-okr#test`. Liên hệ giữa lỗi này và thay đổi của tính năng: chưa rõ (log không nêu).

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 1
  verified_at: 2026-10-15T06:22:43Z

- cmd: bunx turbo run lint --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

- cmd: bun run lint:slop
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

- cmd: bunx turbo run build --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T06:22:43Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline): E3 (`lam-moi-chuyen-viec.dom.tsx -t loi-khong-lam-moi`). Nó chứng minh harness và là regression-guard có chủ ý cho hồ sơ lam-moi-chuyen-viec-qua-loi-chung; nếu muốn nó đo hành vi mới thì phải viết lại để assert thứ chỉ vòng này thêm.

Lệnh fail không gắn eval: `bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation` (xem khối suite ở trên). Đây là lý do duy nhất của verdict REJECT.

Baseline khong do
- bun _acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/chay-o-dinh.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/hai-ref.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/hai-ref.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/pham-vi.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/neo-thuoc-het-han/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base aba7f6418c0e68bb7c8aa988727e75d644767ae4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ (E1 đến E6 đạt); lệnh suite `bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation` đỏ ở `app-rieng > chạy cạnh apps/agent` (quá 5000ms, ConnectionRefused), nên verdict là REJECT. Trả về giai đoạn cài đặt để điều tra lỗi suite.
