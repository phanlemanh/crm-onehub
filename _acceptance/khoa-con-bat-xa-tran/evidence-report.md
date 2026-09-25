---
schema_version: 2
feature_slug: khoa-con-bat-xa-tran
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4c4f4fe6a39a43e9ba5a520bf3c084aa551d7226
human_signoff:
---

# Evidence Report: khoa-con-bat-xa-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: muhjl8wf8hz6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcb_thoi_gian
  verified_at: 2026-09-25T22:32:24Z
  output: |
    OK 10 seed doi mot khac nhau
    do-thoi-gian: 10/10 luot dat
    test-run: dropped crm_muhjl8wf8hz6_test

- eval: E2
  run_id: muhjl90to7v2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcb_lech_hang
  verified_at: 2026-09-25T22:32:24Z
  output: |
    OK dot bien rest-bo-dau: ma 1, co "ma tran REST song parallel lech danh sach duong"
    lech-hang: 4/4 khang dinh dat
    test-run: dropped crm_muhjl90to7v2_test

- eval: E3
  run_id: muhjl8m1opr1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcb_con_thanh_vien
  verified_at: 2026-09-25T22:32:24Z
  output: |
    OK dot bien con-thanh-vien: ma 1, co "tRPC: khoa con bat cua nguoi ngoai van qua duoc"
    con-thanh-vien: 2/2 khang dinh dat
    test-run: dropped crm_muhjl8m1opr1_test

- eval: E4
  run_id: minted-khoa-con-bat-xa-tran-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcb_khong_noi_tran
  verified_at: 2026-09-25T22:32:24Z
  output: |
    OK tu kiem spec: bat "test khoa-con-bat co tran rieng"
    OK tu kiem package.json: bat "apps/api/package.json script test co --timeout"
    khong-noi-tran: 25 dat, 0 hong, tu kiem 2/2

- eval: E5
  run_id: muhjl91kkzyl
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcb_tuan_tu
  verified_at: 2026-09-25T22:32:24Z
  output: |
    OK tu kiem doi-chung-thanh-vien: bat "doi-chung-thanh-vien goi ma tran song song"
    tuan-tu: 7 dat, 0 hong, tu kiem 1/1
    test-run: dropped crm_muhjl91kkzyl_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-25T22:32:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T22:32:24Z

- cmd: bun run lint:slop
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T22:32:24Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-con-bat-xa-tran-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T22:32:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào mang field runs > 1; toàn bộ E1–E5 và các lệnh suite đều deterministic (runs=1, không có pass_rate lẫn lộn).

## Iterations

Round 1: E1–E5 và bốn lệnh suite hồi quy (bun run test, turbo lint, lint:slop, turbo build) đều pass ngay từ lượt đầu tiên — không có vòng sửa nào trước đó.
