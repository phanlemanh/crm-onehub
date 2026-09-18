---
schema_version: 2
feature_slug: loi-moi-da-huy-van-cho-vao
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 70eb1b7d9e986156524f2b4ac9cd093d12d96df0
human_signoff:
---

# Evidence Report: loi-moi-da-huy-van-cho-vao

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-3 | test | PASS |
| E9 | AC-1 | test | PASS |

## Evidence

- eval: E1
  run_id: mu687p7n2uc5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_huy_qua_goi
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [42.00ms]
    test-run: dropped crm_mu687p7n2uc5_test

- eval: E2
  run_id: mu687qam7kot
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_tu_choi_loi_moi
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [48.00ms]
    test-run: dropped crm_mu687qam7kot_test

- eval: E3
  run_id: mu687pwrvhni
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_gia_tri_la
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [45.00ms]
    test-run: dropped crm_mu687pwrvhni_test

- eval: E4
  run_id: minted-loi-moi-da-huy-van-cho-vao-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_du_lieu_cu
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [60.00ms]
    test-run: dropped crm_mu687qeub62g_test

- eval: E5
  run_id: minted-loi-moi-da-huy-van-cho-vao-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lm_tu_vung_goi
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
    tap goi: ["accepted","canceled","pending","rejected"]
    tap kho: ["accepted","canceled","pending","rejected"]
    DAT: hai tap bang nhau, 4 trang thai

- eval: E6
  run_id: mu687q1q5fs8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_ranh_gioi_doc
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [42.00ms]
    test-run: dropped crm_mu687q1q5fs8_test

- eval: E7
  run_id: minted-loi-moi-da-huy-van-cho-vao-E7-r1
  exit_code: 0
  verifier: config:executors.test.lm_trang_thai_that
  verified_at: 2026-09-18T00:01:32Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: mu687qk68ryg
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_ma_tran_trang_thai
  verified_at: 2026-09-18T07:50:00+07:00
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [55.00ms]
    test-run: dropped crm_mu687qk68ryg_test

- eval: E9
  run_id: mu675patibq9
  exit_code: 0
  verifier: config:executors.test.lm_khong_sinh_thanh_vien
  verified_at: 2026-09-18T00:01:32Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu687pjclok1
  exit_code: 0
  verified_at: 2026-09-18T07:50:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-18T07:50:00+07:00

- cmd: bun run lint:slop
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-18T07:50:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-18T07:50:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 9/9 eval máy PASS (exit 0), 4/4 lệnh suite PASS, nhưng REJECT — adversarial review xác nhận E5 (regex `[a-z]+` bỏ sót trạng thái có gạch/số/hoa, tid t13) và E8 (ma trận đo `conHieuLuc` thay vì `decideSignIn`, tid t14) không thực chứng minh AC-5/AC-3; trả về S3 để sửa thước đo trước khi verify lại.

Round 2: E1, E2, E3, E4, E6, E8 re-run cùng E5 (nay đọc tập của kho bằng `bun -e` + JSON qua `createRequire`, không còn regex trên `dist`) đều PASS và đỏ trên diffBase (discriminates); E8's `ma-tran-trang-thai` gọi thẳng `decideSignIn` thay vì `conHieuLuc`; E7, E9 carry-forward từ round 1 vì delta không chạm paths của hai eval đó; 4/4 lệnh suite (test/lint/lint:slop/build) PASS — verdict PASS.