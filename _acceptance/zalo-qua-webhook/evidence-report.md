---
schema_version: 2
feature_slug: zalo-qua-webhook
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d97b4eef5f75dc90fbe620ea58c5878eb4cc767
human_signoff: Phan Le Manh 2026-10-14
---

# Evidence Report: zalo-qua-webhook

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: muev5uz4s0d4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_noi
  verified_at: 2026-09-24T01:37:18Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [385.00ms]
    test-run: dropped crm_muev5uz4s0d4_test

- eval: E2
  run_id: muev5w9tj08j
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_khoa
  verified_at: 2026-09-24T01:37:18Z
  output: |
     33 expect() calls
    Ran 7 tests across 1 file. [791.00ms]
    test-run: dropped crm_muev5w9tj08j_test

- eval: E3
  run_id: muev5v8cvait
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_tat
  verified_at: 2026-09-24T01:37:18Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [479.00ms]
    test-run: dropped crm_muev5v8cvait_test

- eval: E4
  run_id: muev5vpl663z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_trung
  verified_at: 2026-09-24T01:37:18Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [458.00ms]
    test-run: dropped crm_muev5vpl663z_test

- eval: E5
  run_id: muev5vu3a2zq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_bo_qua
  verified_at: 2026-09-24T01:37:18Z
  output: |
     22 expect() calls
    Ran 1 test across 1 file. [471.00ms]
    test-run: dropped crm_muev5vu3a2zq_test

- eval: E6
  run_id: muev5wimcyxp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_webhook_luat_ma
  verified_at: 2026-09-24T01:37:18Z
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [833.00ms]
    test-run: dropped crm_muev5wimcyxp_test

- eval: E7
  run_id: muev5vx6isgp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_kiem_bot
  verified_at: 2026-09-24T01:37:18Z
  output: |
     9 expect() calls
    Ran 3 tests across 1 file. [476.00ms]
    test-run: dropped crm_muev5vx6isgp_test

- eval: E8
  run_id: muev5wgvghk0
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_giao_khi_mo
  verified_at: 2026-09-24T01:37:18Z
  output: |
    6 expect() calls
    Ran 4 tests across 1 file. [791.00ms]
    test-run: dropped crm_muev5wgvghk0_test

- eval: E9
  run_id: minted-zalo-qua-webhook-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_lenh_webhook
  verified_at: 2026-09-24T01:37:18Z
  output: |
     17 expect() calls
    Ran 7 tests across 1 file. [634.00ms]
    test-run: dropped crm_muev5vrsjklz_test

- eval: E10
  run_id: minted-zalo-qua-webhook-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_khai_bien
  verified_at: 2026-09-24T01:37:18Z
  output: |
     9 expect() calls
    Ran 4 tests across 1 file. [403.00ms]
    test-run: dropped crm_muev5vzc62sh_test

- eval: E11
  run_id: muev68i2smmz
  exit_code: 0
  baseline: red
  verifier: config:executors.test.zqw_kenh_route
  verified_at: 2026-09-24T01:37:18Z
  output: |
     4 expect() calls
    Ran 1 test across 1 file. [356.00ms]
    test-run: dropped crm_muev68i2smmz_test

- eval: E12
  run_id: muev69tcpudy
  exit_code: 0
  baseline: green
  verifier: config:executors.script.zqw_giu_nqz
  verified_at: 2026-09-24T01:37:18Z
  output: |
     77 expect() calls
    Ran 34 tests across 1 file. [1.60s]
    test-run: dropped crm_muev69tcpudy_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muev5t6s5yzo
  exit_code: 0
  verified_at: 2026-09-24T01:37:18Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-qua-webhook-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T01:37:18Z

- cmd: bun run lint:slop
  run_id: minted-zalo-qua-webhook-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T01:37:18Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-qua-webhook-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T01:37:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (`B=$(git merge-base HEAD origin/onehub) && { git diff --quiet "$B" -- apps/agent/test/nhac-qua-zalo.integration.spec.ts || { echo "spec da ky cua nhac-qua-zalo bi sua" >&2; exit 1; }; } && bun run test -- "cd apps/agent && bun test test/nhac-qua-zalo.integration.spec.ts"`) — pass trên cả HEAD lẫn baseline (diffBase). Đây là regression-guard có chủ ý cho tính năng nhắc-qua-zalo đã ký từ trước: bài kiểm giữ nguyên spec đã ký (phần 1 của lệnh chặn nếu ai sửa spec đó) rồi chạy trọn bộ test hiện có của nhắc-qua-zalo qua wrapper của kho. Nó không đo hành vi mới của zalo-qua-webhook nên xanh-cả-hai-phía là đúng dự kiến, không phải dấu hiệu thiếu phân biệt của feature này.

## Variance

none — every multi-run eval is uniform (không eval nào khai `runs` > 1 trong vòng này)

## Iterations

Round 1: đã sinh review-findings với 5 mục ngoài hợp đồng (carried sang round 2, xem review-findings.md); dữ liệu bàn giao cho vòng này không kèm bản ghi kết quả máy của round 1.
Round 2 (vòng hiện tại): chạy lại toàn bộ E1–E12 cùng bốn lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) — tất cả PASS, verdict PASS.
