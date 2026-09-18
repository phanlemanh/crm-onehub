---
schema_version: 2
feature_slug: loi-moi-da-huy-van-cho-vao
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c6415336c5b6ccf6404e89def2add54228021443
human_signoff:
---

# Evidence Report: loi-moi-da-huy-van-cho-vao

⚠ Verdict REJECT dù toàn bộ 9 eval máy đều exit 0 (bảng dưới): adversarial review (xem `review-findings.md`, mục "Trong hợp đồng", tid t10/t13/t14) xác nhận rằng thước đo của E5 (regex `[a-z]+` bỏ sót trạng thái có gạch/số/hoa nên "hai tập khớp nhau" có thể sai) và ma trận của E8 (đo `conHieuLuc` thuần chứ không đo `decideSignIn`, nên đổi luật danh sách trắng sang danh sách cấm ở hàm quyết định thật vẫn xanh hết) không thực sự chứng minh điều AC-5 và AC-3 đòi hỏi. Bằng chứng máy xanh không đủ để ký hai AC này ở round này — trả về S3 để sửa thước đo trước khi verify lại.

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
  run_id: mu675nvo2h30
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_huy_qua_goi
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [47.00ms]
    test-run: dropped crm_mu675nvo2h30_test

- eval: E2
  run_id: mu675nysp4dh
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_tu_choi_loi_moi
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [41.00ms]
    test-run: dropped crm_mu675nysp4dh_test

- eval: E3
  run_id: mu675onnymxb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_gia_tri_la
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [40.00ms]
    test-run: dropped crm_mu675onnymxb_test

- eval: E4
  run_id: minted-loi-moi-da-huy-van-cho-vao-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_du_lieu_cu
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [42.00ms]
    test-run: dropped crm_mu675obbq38q_test

- eval: E5
  run_id: minted-loi-moi-da-huy-van-cho-vao-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lm_tu_vung_goi
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
    tap goi: ["accepted","canceled","pending","rejected"]
    tap kho: ["accepted","canceled","pending","rejected"]
    DAT: hai tap bang nhau, 4 trang thai

- eval: E6
  run_id: minted-loi-moi-da-huy-van-cho-vao-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_ranh_gioi_doc
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [45.00ms]
    test-run: dropped crm_mu675phavvk1_test

- eval: E7
  run_id: minted-loi-moi-da-huy-van-cho-vao-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_trang_thai_that
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [197.00ms]
    test-run: dropped crm_mu675ocn6pva_test

- eval: E8
  run_id: minted-loi-moi-da-huy-van-cho-vao-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_ma_tran_trang_thai
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [45.00ms]
    test-run: dropped crm_mu675qdjwdz9_test

- eval: E9
  run_id: mu675patibq9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lm_khong_sinh_thanh_vien
  verified_at: 2026-09-18T07:01:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [192.00ms]
    test-run: dropped crm_mu675patibq9_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu675oc0r4om
  exit_code: 0
  verified_at: 2026-09-18T07:01:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-18T07:01:00+07:00

- cmd: bun run lint:slop
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-18T07:01:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-loi-moi-da-huy-van-cho-vao-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-18T07:01:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 9/9 eval máy PASS (exit 0), 4/4 lệnh suite PASS, nhưng REJECT — adversarial review xác nhận E5 (regex `[a-z]+` bỏ sót trạng thái có gạch/số/hoa, tid t13) và E8 (ma trận đo `conHieuLuc` thay vì `decideSignIn`, tid t14) không thực chứng minh AC-5/AC-3; trả về S3 để sửa thước đo trước khi verify lại.
