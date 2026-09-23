---
schema_version: 2
feature_slug: khoa-cu-khong-mo-khoa-moi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b161dc169076c0ee26ce33e1f04692097d632224
human_signoff:
---

# Evidence Report: khoa-cu-khong-mo-khoa-moi

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

## Evidence

- eval: E1
  run_id: minted-khoa-cu-khong-mo-khoa-moi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_header_tao
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [1486.00ms]
    test-run: dropped crm_mue9agarfqgj_test

- eval: E2
  run_id: mue9ai8smv0b
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_header_bat_lai
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [882.00ms]
    test-run: dropped crm_mue9ai8smv0b_test

- eval: E3
  run_id: mue9ahpgkkfv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_header_lan_cookie
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [1231.00ms]
    test-run: dropped crm_mue9ahpgkkfv_test

- eval: E4
  run_id: minted-khoa-cu-khong-mo-khoa-moi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_header_doi_chung
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [1183.00ms]
    test-run: dropped crm_mue9ahm6psn1_test

- eval: E5
  run_id: mue9ahlm1wlq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_don_mot_lan
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [1152.00ms]
    test-run: dropped crm_mue9ahlm1wlq_test

- eval: E6
  run_id: mue9ahkreeao
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_don_bang_rong
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [1083.00ms]
    test-run: dropped crm_mue9ahkreeao_test

- eval: E7
  run_id: mue9ahk4sjb5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gl_go_tat_khoa
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [1231.00ms]
    test-run: dropped crm_mue9ahk4sjb5_test

- eval: E8
  run_id: mue9ai3rzsk0
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gl_khoa_moi
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [1146.00ms]
    test-run: dropped crm_mue9ai3rzsk0_test

- eval: E9
  run_id: mue9ahrrjsit
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kcm_xem_truoc
  verified_at: 2026-09-23T10:00:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [1076.00ms]
    test-run: dropped crm_mue9ahrrjsit_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue9buuhnylj
  exit_code: 0
  verified_at: 2026-09-23T10:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-23T10:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-23T10:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-khoa-cu-khong-mo-khoa-moi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-23T10:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E7 (AC-7, `go-tat-khoa`) và E8 (AC-8, `khoa-moi`) pass trên cả HEAD lẫn baseline (diffBase) — không phân biệt được feature với code cũ trên riêng hai bài này:

- E7 — cmd: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t go-tat-khoa"`
- E8 — cmd: `bun run test -- "cd apps/api && bun test test/go-la-cat-quyen.spec.ts -t khoa-moi"`

Cả hai bài đã có vế siết thật (ví dụ E7 kiểm `verifyApiKey` trả 401/KEY_DISABLED) nên nhiều khả năng đây là regression-guard có chủ ý giữ đối chứng dương song song với vế mới, không phải bài rỗng — cần người xác nhận đúng ý đồ đó khi ký.

## Variance

none — every multi-run eval is uniform (không eval nào của round này có `runs` > 1)

## Iterations

Round 1: cả 9 eval (E1–E9) và 4 lệnh suite hồi quy đều pass ngay lượt đầu — không có round trước, không quay lại implementation.