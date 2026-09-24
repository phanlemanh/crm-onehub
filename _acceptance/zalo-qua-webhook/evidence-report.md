---
schema_version: 2
feature_slug: zalo-qua-webhook
verdict: PENDING-JUDGMENT
triage_failed: true
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 66bd2987adecd32a7054ed6ff272941de2ed15de
human_signoff:
---

# Evidence Report: zalo-qua-webhook
⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào được máy tự sửa, danh sách đầy đủ nằm trong review-findings.md, người xem lại toàn bộ trước khi ký.

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
  run_id: mueuh2z5ofk5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_noi
  verified_at: 2026-09-24T01:18:09Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [512.00ms]
    test-run: dropped crm_mueuh2z5ofk5_test

- eval: E2
  run_id: minted-zalo-qua-webhook-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_khoa
  verified_at: 2026-09-24T01:18:09Z
  output: |
    33 expect() calls
    Ran 7 tests across 1 file. [551.00ms]
    test-run: dropped crm_mueuh360fyjy_test

- eval: E3
  run_id: mueuh1zkg51v
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_tat
  verified_at: 2026-09-24T01:18:09Z
  output: |
    6 expect() calls
    Ran 2 tests across 1 file. [581.00ms]
    test-run: dropped crm_mueuh1zkg51v_test

- eval: E4
  run_id: mueuh3zxux38
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_trung
  verified_at: 2026-09-24T01:18:09Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [697.00ms]
    test-run: dropped crm_mueuh3zxux38_test

- eval: E5
  run_id: mueuh37vqu2d
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_bo_qua
  verified_at: 2026-09-24T01:18:09Z
  output: |
    22 expect() calls
    Ran 1 test across 1 file. [450.00ms]
    test-run: dropped crm_mueuh37vqu2d_test

- eval: E6
  run_id: mueuh4hsad1b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_webhook_luat_ma
  verified_at: 2026-09-24T01:18:09Z
  output: |
    10 expect() calls
    Ran 1 test across 1 file. [345.00ms]
    test-run: dropped crm_mueuh4hsad1b_test

- eval: E7
  run_id: mueuh44akfxv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_kiem_bot
  verified_at: 2026-09-24T01:18:09Z
  output: |
    9 expect() calls
    Ran 3 tests across 1 file. [727.00ms]
    test-run: dropped crm_mueuh44akfxv_test

- eval: E8
  run_id: mueuh2e7vfwz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_giao_khi_mo
  verified_at: 2026-09-24T01:18:09Z
  output: |
    6 expect() calls
    Ran 4 tests across 1 file. [504.00ms]
    test-run: dropped crm_mueuh2e7vfwz_test

- eval: E9
  run_id: mueuh3jsibsj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_lenh_webhook
  verified_at: 2026-09-24T01:18:09Z
  output: |
    17 expect() calls
    Ran 7 tests across 1 file. [756.00ms]
    test-run: dropped crm_mueuh3jsibsj_test

- eval: E10
  run_id: mueuh34b54sz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_khai_bien
  verified_at: 2026-09-24T01:18:09Z
  output: |
    8 expect() calls
    Ran 4 tests across 1 file. [445.00ms]
    test-run: dropped crm_mueuh34b54sz_test

- eval: E11
  run_id: mueuhem5mi7g
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.zqw_kenh_route
  verified_at: 2026-09-24T01:18:09Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [319.00ms]
    test-run: dropped crm_mueuhem5mi7g_test

- eval: E12
  run_id: mueuhg92tomh
  exit_code: 0
  baseline: green
  verifier: config:executors.script.zqw_giu_nqz
  verified_at: 2026-09-24T01:18:09Z
  output: |
    77 expect() calls
    Ran 34 tests across 1 file. [1.56s]
    test-run: dropped crm_mueuhg92tomh_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-zalo-qua-webhook-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-24T01:18:09Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-qua-webhook-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T01:18:09Z

- cmd: bun run lint:slop
  run_id: minted-zalo-qua-webhook-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T01:18:09Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-qua-webhook-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T01:18:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 — pass trên cả HEAD lẫn baseline (diffBase onehub), nên bài test này tự nó không phân biệt được feature khỏi code cũ; đây là regression-guard có chủ ý (giữ nguyên spec đã ký của nhac-qua-zalo để bảo vệ hành vi cronjob cũ khi thêm đường webhook), không phải một chỗ thiếu assert của feature.

## Variance

none — không có eval nào chạy nhiều lần (mọi eval đều runs=1, deterministic).

## Iterations

Round 1: toàn bộ 12 eval máy (E1–E12) đều PASS và bốn lệnh suite hồi quy (bun run test, turbo lint, lint:slop, turbo build) đều xanh; verdict tổng là PENDING-JUDGMENT vì bước phân loại phạm vi (scope-triage) không chạy được ở vòng này — xem review-findings.md mục "Chưa phân loại (triage-failed)".
