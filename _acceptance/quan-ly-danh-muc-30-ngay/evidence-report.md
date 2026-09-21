---
schema_version: 2
feature_slug: quan-ly-danh-muc-30-ngay
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f5f150fa2a9307db461400c5f7e6875fdce652be
human_signoff:
---

# Evidence Report: quan-ly-danh-muc-30-ngay

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
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | PASS |
| E14 | AC-14 | test | PASS |

> Lệnh không gắn eval nào — `bun run test` (chạy toàn kho, không lọc theo `-t`) — thoát mã khác 0. Đây là nguyên nhân verdict tổng REJECT dù cả 14 eval đã khai (E1-E14) đều PASS riêng lẻ trên máy. Khối chi tiết ở mục Lệnh suite (hồi quy) bên dưới.

## Evidence

- eval: E1
  run_id: mub652w9c407
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_khong_khop
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     0 fail
     16 expect() calls
    Ran 2 tests across 1 file. [517.00ms]

- eval: E2
  run_id: mub652akg70r
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_tim_ten_cong_ty
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [189.00ms]
    test-run: dropped crm_mub652akg70r_test

- eval: E3
  run_id: mub652a1jlvc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_sap_toan_tap
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     17 expect() calls
    Ran 1 test across 1 file. [472.00ms]
    test-run: dropped crm_mub652a1jlvc_test

- eval: E4
  run_id: minted-quan-ly-danh-muc-30-ngay-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_phan_trang
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     21 expect() calls
    Ran 2 tests across 1 file. [522.00ms]
    test-run: dropped crm_mub652c5lgic_test

- eval: E5
  run_id: mub652s4gywq
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_loc_va_dem
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     21 expect() calls
    Ran 1 test across 1 file. [213.00ms]
    test-run: dropped crm_mub652s4gywq_test

- eval: E6
  run_id: minted-quan-ly-danh-muc-30-ngay-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_duong_dan
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     0 fail
     19 expect() calls
    Ran 2 tests across 1 file. [399.00ms]

- eval: E7
  run_id: mub6538o0e4o
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_bang_cot_buoc
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
    Ran 1 test across 1 file. [155.00ms]
    test-run: dropped crm_mub6538o0e4o_test

- eval: E8
  run_id: mub652qgzmko
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_bang_cot_bo_phan
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [205.00ms]
    test-run: dropped crm_mub652qgzmko_test

- eval: E9
  run_id: mub652dtyy4g
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_bang_cot_bac
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [218.00ms]
    test-run: dropped crm_mub652dtyy4g_test

- eval: E10
  run_id: minted-quan-ly-danh-muc-30-ngay-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_bang_cot_trang_thai
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [192.00ms]
    test-run: dropped crm_mub652ojfxbv_test

- eval: E11
  run_id: minted-quan-ly-danh-muc-30-ngay-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_the_chi_de_xem
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     0 fail
     12 expect() calls
    Ran 2 tests across 1 file. [347.00ms]

- eval: E12
  run_id: mub65hc9m44n
  exit_code: 0
  baseline: red
  verifier: config:executors.test.qldm_tran_cot
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [343.00ms]

- eval: E13
  run_id: minted-quan-ly-danh-muc-30-ngay-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-21T14:32:00+07:00
  screenshot: evidence/E13-bang-1440.png
  observed: |
    10 frame duoc mo bang Read va doi chieu tung cai voi Expected:

    E13-bang-1440.png / E13-bang-768.png (dang bang, Table view): co o tim "Search partners", nut "Filters", cac tieu de cot co mui ten sap xep (Partner ↕, Silent ↕, "St..." ↕ [Steps bi cat do w-20, khong thuoc pham vi cham cua eval nay], Day ↕). 768: khong trang tran ngang, ten cong ty dai "Cong ty Co phan Dau tu va Phat trien Dia oc Phu My" xuong dong day du, khong bi cat nghia.

    E13-cot-buoc-1440/768.png (Stuck step): 5 cot "Ky hop dong 2", "Ky hop dong E13 4", "Dao tao doi moi gioi 2", "Mo tai khoan tren nen tang 1", "All steps done" — moi tieu de co so dem, the (card) trong tung cot co ten + bo phan + silent. 768: cot thu 3 tro di bi cat o mep nhung do khung bang-cot tu cuon (khong phai trang cuon ngang — nen trang van dung 768px, khong element nao tran ra ngoai).

    E13-cot-bo-phan-1440/768.png (Department): 5 cot "Kinh doanh 2", "Dao tao 2", "Van hanh nen tang 1", "Ngan quy E13 4", "All steps done" — dung 2 bo phan da gieo (Kinh doanh/Dao tao la co san, Ngan quy E13 la moi gieo) cung xuat hien nhu cot rieng. 768: khong tran ngang.

    E13-cot-bac-1440/768.png (Broker stage — day la "cac bac"): du 5 cot "No account yet 2", "Has an account 2", "Finished the course 2", "Active 2", "Made a deal" — cac the ghi danh da gieo (E13Contact1..4 Test) xuat hien dung cot theo stage da danh dau qua markEnrollmentStage. 768: khong tran ngang, ten contact khong bi cat nghia.

    E13-cot-trang-thai-1440/768.png (Status): 2 cot "Running 10" va "Closed 2" (Closed co du lieu nho toi da dong 1 ke hoach qua onboarding.closePlan). 768: khong tran ngang, danh sach the cuon doc binh thuong trong khung.

    Khong thieu cach-chia nao (ca 4: buoc/bo-phan/bac/trang-thai deu co anh 1440 va 768), khong frame nao co trang tran ngang. Tat ca khop Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mub6509xi8rq
  exit_code: 1
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
    @crm/telemetry:test: (pass) telemetryDisabled > honours CRM_TELEMETRY_DISABLED
    @crm/telemetry:test: (pass) telemetryDisabled > honours DO_NOT_TRACK
    @crm/telemetry:test: (pass) telemetryDisabled > takes any of
    [Output was truncated by tool — 19346 characters omitted]
    Test suite exited with code 1 indicating test failures. Database created: crm_mub6509xi8rq_test. Multiple packages ran tests including @crm/validation, @crm/telemetry, and others.
  note: lệnh hồi quy toàn kho, không gắn eval nào (evals: []) — thoát mã 1, chưa xác định gói nào đỏ vì output bị công cụ cắt bớt trước dòng tổng kết. Đây là nguyên nhân verdict tổng REJECT của round này.

- cmd: bunx turbo run lint --force
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    253ms

- cmd: bun run lint:slop
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
    Found 0 warnings and 0 errors.
    Finished in 505ms on 1099 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-21T14:32:00+07:00
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    9.917s

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1); không có pass_rate hỗn hợp.

## Iterations

Round 1: 14/14 eval đã khai (E1-E14) PASS riêng lẻ trên máy, nhưng lệnh hồi quy toàn kho `bun run test` (không gắn eval nào) thoát mã 1 — verdict REJECT vì thất bại nằm ngoài các eval đã khai và output bị cắt trước dòng tổng kết nên chưa xác định gói nào đỏ. Cần chạy lại `bun run test` trần ở gốc kho, đọc hết log, xác định gói/case đỏ rồi vá hoặc xác nhận đây là vấn đề môi trường trước khi verify lại.
