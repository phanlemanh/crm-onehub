---
schema_version: 2
feature_slug: onboarding-giong-deals
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b1101467ace5fb9057dd43fd7bf7254e06a5b132
human_signoff: Phan Le Manh 2026-09-22
---

# Evidence Report: onboarding-giong-deals

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-12 | ui-check | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-4 | test | PASS |
| E17 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-onboarding-giong-deals-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ogd_man_danh_muc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    o=30 khang-dinh=70/70
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-onboarding-giong-deals-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nut_dau_trang
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [738.00ms]

- eval: E3
  run_id: minted-onboarding-giong-deals-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nut_mo_va_khoa
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [636.00ms]

- eval: E4
  run_id: minted-onboarding-giong-deals-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ogd_man_danh_muc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    o=30 khang-dinh=70/70
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-onboarding-giong-deals-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_sap_mac_dinh
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [867.00ms]

- eval: E6
  run_id: minted-onboarding-giong-deals-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_dang_tai
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [774.00ms]

- eval: E7
  run_id: minted-onboarding-giong-deals-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_loi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    3 expect() calls
    Ran 2 tests across 1 file. [635.00ms]

- eval: E8
  run_id: minted-onboarding-giong-deals-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_o_trong_va_so
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [615.00ms]

- eval: E9
  run_id: minted-onboarding-giong-deals-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_doi_tac_khong_an
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [602.00ms]

- eval: E10
  run_id: minted-onboarding-giong-deals-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_o_chu_mot_dong
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [800.00ms]

- eval: E11
  run_id: minted-onboarding-giong-deals-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nhan_bo_loc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [890.00ms]

- eval: E12
  run_id: minted-onboarding-giong-deals-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_tao_xong_mo
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [834.00ms]

- eval: E13
  run_id: minted-onboarding-giong-deals-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_tao_tra_id
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [471.00ms]
    test-run: dropped crm_mucsyq1hi4u8_test

- eval: E14
  run_id: E14-onboarding-giong-deals-verify-2026-09-22
  exit_code: 0
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:00:00+07:00
  screenshot: _acceptance/onboarding-giong-deals/evidence/E14-onboarding-1440-sang.png
  observed: |
    Doc truc tiep tung file frame da luu bang Read:
    - E14-onboarding-1440-sang.png: nut xanh "+ Kế hoạch mới" o goc phai dau trang (canh vung data-slot=page-shell-actions). Tieu de cot bang 30-ngay-dau: "Đối tác", "Tác ở", "Im lặng", "Bước", "Ngày", "Bộ phận" — khong cot nao co dau "…".
    - E14-deals-1440-sang.png: nut xanh "+ Thoả thuận mới" o dung vi tri goc phai dau trang, cung mau xanh dam, cung icon dau cong voi nut ben onboarding.
    - E14-onboarding-1440-toi.png va E14-deals-1440-toi.png (theme toi, prefers-color-scheme=dark): hai nut van cung vi tri/mau/icon nhu ban sang; tieu de cot 30-ngay-dau van khong dau ba cham.
    - E14-onboarding-375-sang.png (mobile 375): nut "+ Kế hoạch mới" hien truc tiep canh o tim kiem/Loc, khong nam trong hop "Lọc" (hop Loc la mot dropdown rieng ben duoi).
    - E14-deals-375-sang.png (mobile 375): nut "+ Thoả thuận mới" cung hien truc tiep tren cung, cung kieu voi ban onboarding.
    Ca 3 dieu Expected deu khop: (1) nut giong nhau ca 1440/375, sang/toi — DAT; (2) khong tieu de cot nao cua bang 30-ngay-dau co dau ba cham — DAT; (3) o 375 nut tao hien truc tiep, khong nam trong o Loc — DAT.
  network_observed: n-a (driver)

- eval: E15
  run_id: design-gate-1daab6dccd
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ogd_san_thiet_ke
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    "hits": [],
    "findings": []

- eval: E16
  run_id: mucsypqi6x62
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_sap_hai_chieu
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [485.00ms]
    test-run: dropped crm_mucsypqi6x62_test

- eval: E17
  run_id: minted-onboarding-giong-deals-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_trang_thai_trong
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [590.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-onboarding-giong-deals-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-onboarding-giong-deals-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-onboarding-giong-deals-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-onboarding-giong-deals-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E15 — pass tren CA HEAD lan baseline diffBase (design-gate --mode static tren 5 file onboarding). Day la regression-guard co chu y (quet mau hex/vi pham thiet ke tinh), khong phai eval phan biet hanh vi tinh nang moi, nen khong can viet lai — no dung de bat hoi quy thiet ke chu khong do AC hanh vi.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval feature (E1-E17) xanh ngay ở lần chấm đầu; một finding ngoài hợp đồng bị ghi lại (noi-bon-nut.dom.tsx dựng fixture tự đo trên chính nó — xem review-findings, carried). Round 2: xác minh lại toàn bộ 17 eval + E15 + 4 lệnh suite trên tệp đã đổi kể từ round 1; không có eval nào đỏ, không cần quay lại implementation.

### Re-pin lần 1 — 2026-09-22, do hoa cu do merge origin/onehub (#84)
run_id: repin-20260922T152039Z-31450
sha: e1c3ff8a020a3667823dbb8f87058686559ed67d · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · AC không có chốt máy: AC-12

### Re-pin lần 2 — 2026-09-23, do DataTable doi nhan tieu de sang data-slot table-head-label, bo cuc auto (ho so tieu-de-cot-doc-tron)
run_id: repin-20260923T001940Z-55145
sha: e83bf65af354acd1a4f986baef7183405d2c0310 · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · AC không có chốt máy: AC-12

### Re-pin lần 3 — 2026-09-23, do hoa cu do nut tieu de xs-wrap va thuoc AC-3 cua tieu-de-cot-doc-tron vong 2
run_id: repin-20260923T030726Z-53798
sha: 496726d395354129d7b6495b47a940eeec4550a2 · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · AC không có chốt máy: AC-12

### Re-pin lần 4 — 2026-09-23, do hoa cu do hop nhat onehub (PR 86: apps/api/test)
run_id: repin-20260923T031737Z-62007
sha: b1101467ace5fb9057dd43fd7bf7254e06a5b132 · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · AC không có chốt máy: AC-12
