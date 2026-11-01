---
schema_version: 2
feature_slug: khoa-rieng-dien-node
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d0c9c01179bff94bf64fb609993ace54132b66a
human_signoff: Phan Le Manh 2026-11-01 — ký Cổng 2 trong cửa veto (B8 dọn dẹp 31/10) trên verdict PASS 3/3 eval, ghim lại repin-20261101T062656Z-16061. Đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: khoa-rieng-dien-node

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-khoa-rieng-dien-node-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_mau_that
  verified_at: 2026-09-25T22:14:37Z
  output: |
    0 fail
    16 expect() calls
    Ran 4 tests across 1 file. [770.00ms]

- eval: E2
  run_id: minted-khoa-rieng-dien-node-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_ma_tran
  verified_at: 2026-09-25T22:14:37Z
  output: |
    0 fail
    44 expect() calls
    Ran 11 tests across 1 file. [449.00ms]

- eval: E3
  run_id: minted-khoa-rieng-dien-node-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_bo_bat
  verified_at: 2026-09-25T22:14:37Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [421.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhirmqmt05r
  exit_code: 0
  verified_at: 2026-09-25T22:14:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-rieng-dien-node-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-25T22:14:37Z

- cmd: bun run lint:slop
  run_id: minted-khoa-rieng-dien-node-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-25T22:14:37Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-rieng-dien-node-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-25T22:14:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — vòng này không có eval nào chạy nhiều lần (runs > 1); mọi eval đều runs: 1, deterministic, pass_rate không áp dụng

## Iterations

Round 1: E1–E4 và bốn lệnh suite đều chạy sạch (exit 0, không lệch baseline), nhưng review phát hiện hai lỗi Trong hợp đồng ở AC-4 (`_acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs`): bộ loại «quét lồng» đọc chữ trong mã nguồn thay vì hành vi lệnh nên loại nhầm một ca đang đỏ trên HEAD/xanh trên B, và các lệnh git ngoài try/finally thoát mã 1 giống một hồi quy thật — verdict REJECT.
Round 2: chủ kho quyết bỏ AC-4/E4 (răng không-hồi-quy của các hồ sơ đã ký khác) thay vì vá `khong-hoi-quy.mjs`, và sửa lại chữ mô tả E2 trong `evals.yaml` cho khớp ma trận/test thật (11 ca, 44 khẳng định); mã của E1–E3 không đổi so với round trước. E1–E3 cùng bốn lệnh suite chạy lại sạch, exit 0, không lệch baseline — verdict PASS.

### Re-pin lần 1 — 2026-09-26, do gộp onehub sau #144 trước khi merge
run_id: repin-20260926T002546Z-69866
sha: 9daa3223456892b4bd41704cee2b5376834f0292 · suites: 4 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-26, do gộp onehub sau #148 trước khi merge
run_id: repin-20260926T004149Z-87730
sha: da4783efd107b9ca1aaa77add22247ff0985b9a4 · suites: 4 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-11-01, do B8: ghim trên onehub b65feb175 sau sửa ba thước lệch, trước khi chủ kho ký cửa veto mở
run_id: repin-20261101T062656Z-16061
sha: 4d0c9c01179bff94bf64fb609993ace54132b66a · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
