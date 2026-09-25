---
schema_version: 2
feature_slug: khoa-rieng-dien-node
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fcdf507266b9642029f60740e0919a1402de9a05
human_signoff:
---

# Evidence Report: khoa-rieng-dien-node

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khoa-rieng-dien-node-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_mau_that
  verified_at: 2026-09-25T21:31:26Z
  output: |
    0 fail
    16 expect() calls
    Ran 4 tests across 1 file. [584.00ms]

- eval: E2
  run_id: minted-khoa-rieng-dien-node-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_ma_tran
  verified_at: 2026-09-25T21:31:26Z
  output: |
    0 fail
    44 expect() calls
    Ran 11 tests across 1 file. [374.00ms]

- eval: E3
  run_id: minted-khoa-rieng-dien-node-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.krdn_bo_bat
  verified_at: 2026-09-25T21:31:26Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [385.00ms]

- eval: E4
  run_id: run_id
  exit_code: 0
  baseline: red
  verifier: config:executors.script.krdn_khong_hoi_quy
  verified_at: 2026-09-25T21:31:26Z
  output: |
    do san: 21 lenh
    khong lenh nao do them so voi 100847e8 — 21 lenh do san o ca hai cay

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muhhcun7qk7e
  exit_code: 0
  verified_at: 2026-09-25T21:31:26Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-rieng-dien-node-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T21:31:26Z

- cmd: bun run lint:slop
  run_id: minted-khoa-rieng-dien-node-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T21:31:26Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-rieng-dien-node-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T21:31:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — vòng này không có eval nào chạy nhiều lần (runs > 1); mọi eval đều runs: 1, deterministic, pass_rate không áp dụng

## Iterations

Round 1: E1–E4 và bốn lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều chạy sạch, exit 0, không lệch baseline — nhưng review xác nhận hai lỗi Trong hợp đồng ánh xạ vào AC-4 trong `_acceptance/khoa-rieng-dien-node/rang/khong-hoi-quy.mjs` (dòng 113: bộ loại «quét lồng» loại nhầm một lệnh đang đỏ trên HEAD/xanh trên B chỉ vì grep chữ trong mã nguồn tệp script, không xét hành vi thật; dòng 160: các lệnh git ngoài try/finally khiến lỗi hạ tầng thoát mã 1, cùng mã với một hồi quy thật) — verdict REJECT, chưa quay lại implementation ở vòng này vì đây là vòng tổng hợp báo cáo; cần sửa `khong-hoi-quy.mjs` (đưa lỗi hạ tầng về mã 2, sửa bộ loại quét-lồng để xét hành vi lệnh thay vì chữ trong mã nguồn) rồi đo lại ở vòng sau trước khi PASS có thể đứng vững.