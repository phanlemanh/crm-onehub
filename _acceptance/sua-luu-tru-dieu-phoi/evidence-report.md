---
schema_version: 2
feature_slug: sua-luu-tru-dieu-phoi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6e2a167567033b457c5f104b4e03e915d32558c9
human_signoff:
---

# Evidence Report: sua-luu-tru-dieu-phoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-8 | test | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-9 | test | PASS |
| E18 | AC-10 | test | PASS |
| E19 | AC-10 | test | PASS |
| E20 | AC-11 | test | PASS |
| E21 | AC-11 | test | PASS |
| E22 | AC-12 | test | PASS |
| E23 | AC-13 | test | PASS |
| E24 | AC-13 | test | PASS |
| E25 | AC-14 | test | PASS |
| E26 | AC-15 | ui-check | PASS |
| E27 | AC-12 | test | PASS |
| E28 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-luu-tru-dieu-phoi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_doi_ten_bo_phan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 3 tests across 1 file. [583.00ms]

- eval: E2
  run_id: mubvrxqivnsm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bo_phan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     24 expect() calls
    Ran 1 test across 1 file. [770.00ms]
    test-run: dropped crm_mubvrxqivnsm_test

- eval: E3
  run_id: minted-sua-luu-tru-dieu-phoi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_sap_bo_phan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    Ran 1 test across 1 file. [831.00ms]

- eval: E4
  run_id: mubvrxqivnsm
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bo_phan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     24 expect() calls
    Ran 1 test across 1 file. [770.00ms]
    test-run: dropped crm_mubvrxqivnsm_test

- eval: E5
  run_id: minted-sua-luu-tru-dieu-phoi-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_luu_tru_bo_phan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [801.00ms]

- eval: E6
  run_id: minted-sua-luu-tru-dieu-phoi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_bi_chan_luu_tru
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [503.00ms]

- eval: E7
  run_id: mubvrym43kva
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_chan_luu_tru
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     14 expect() calls
    Ran 1 test across 1 file. [714.00ms]
    test-run: dropped crm_mubvrym43kva_test

- eval: E8
  run_id: minted-sua-luu-tru-dieu-phoi-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_sua_khuon
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [727.00ms]

- eval: E9
  run_id: minted-sua-luu-tru-dieu-phoi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [783.00ms]
    test-run: dropped crm_mubvrxxzidu6_test

- eval: E10
  run_id: minted-sua-luu-tru-dieu-phoi-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_luu_tru_khuon
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [821.00ms]

- eval: E11
  run_id: minted-sua-luu-tru-dieu-phoi-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [783.00ms]
    test-run: dropped crm_mubvrxxzidu6_test

- eval: E12
  run_id: minted-sua-luu-tru-dieu-phoi-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_khoi_phuc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [708.00ms]

- eval: E13
  run_id: minted-sua-luu-tru-dieu-phoi-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [783.00ms]
    test-run: dropped crm_mubvrxxzidu6_test

- eval: E14
  run_id: minted-sua-luu-tru-dieu-phoi-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_xoa_vinh_vien
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 1 test across 1 file. [557.00ms]

- eval: E15
  run_id: mubvsa93rfbg
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_xoa_vinh_vien
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     29 expect() calls
    Ran 1 test across 1 file. [760.00ms]
    test-run: dropped crm_mubvsa93rfbg_test

- eval: E16
  run_id: minted-sua-luu-tru-dieu-phoi-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_khoa_theo_quyen
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     20 expect() calls
    Ran 2 tests across 1 file. [657.00ms]

- eval: E17
  run_id: mubvs8nw5f66
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_quyen
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     29 expect() calls
    Ran 1 test across 1 file. [858.00ms]
    test-run: dropped crm_mubvs8nw5f66_test

- eval: E18
  run_id: minted-sua-luu-tru-dieu-phoi-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_dong_mo_ke_hoach
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [660.00ms]

- eval: E19
  run_id: mubvsme0e9v3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_dong_mo
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    test-run: dropped crm_mubvsme0e9v3_test
    EXIT_CODE=0

- eval: E20
  run_id: minted-sua-luu-tru-dieu-phoi-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_danh_dau_bac
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [791.00ms]

- eval: E21
  run_id: minted-sua-luu-tru-dieu-phoi-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bac
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     8 expect() calls
    Ran 1 test across 1 file. [663.00ms]
    test-run: dropped crm_mubvsgg2fdii_test

- eval: E22
  run_id: mubvsj6tgos1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_ngay
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    29 expect() calls
    Ran 1 test across 1 file. [710.00ms]
    test-run: dropped crm_mubvsj6tgos1_test

- eval: E23
  run_id: minted-sua-luu-tru-dieu-phoi-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_da_trong_pheu
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [875.00ms]

- eval: E24
  run_id: mubvsmnvj6ew
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_trung_pheu
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     7 expect() calls
    Ran 1 test across 1 file. [771.00ms]
    test-run: dropped crm_mubvsmnvj6ew_test

- eval: E25
  run_id: minted-sua-luu-tru-dieu-phoi-E25-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_loi_va_mot_lan
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     44 expect() calls
    Ran 1 test across 1 file. [2.06s]

- eval: E26
  run_id: minted-sua-luu-tru-dieu-phoi-E26-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:00:00+07:00
  screenshot: _acceptance/sua-luu-tru-dieu-phoi/evidence/E26-bo-phan-menu-1440.png
  observed: |
    Doc truc tiep ca 14 file PNG da luu (7 trang thai x 2 kho) bang Read:
    - E26-bo-phan-menu-{1440,768}.png: menu "..." cua bo phan "Phong Dang Dung E26" mo, hien 2 muc "Rename" va "Archive" (= Doi ten/Luu tru).
    - E26-khuon-menu-{1440,768}.png: menu "..." cua khuon "Khuon Dang Dung E26" mo, hien 2 muc "Edit" va "Archive" (= Sua/Luu tru).
    - E26-soan-khuon-sua-{1440,768}.png: sheet "Edit plan template" mo o che do sua, dien san dung du lieu that: ten "Khuon Dang Dung E26", 2 buoc "Buoc 1"/"Buoc 2" voi bo phan "Phong Dang Dung E26" va so ngay 0/3, nut Save/Cancel.
    - E26-da-luu-tru-{1440,768}.png: khoi "Archived (2)" mo, liet ke ca "Phong Chua Dung E26" va "Khuon Chua Dung E26", moi dong co nut "Restore" va "Delete forever" (= Khoi phuc/Xoa vinh vien).
    - E26-ke-hoach-dong-{1440,768}.png: ho so ke hoach "First 30 days" hien badge "Closed" + nut "Reopen" (= Da dong/Mo lai) sau khi bam Close roi xac nhan trong AlertDialog那.
    - E26-o-bac-lich-{1440,768}.png: popover lich cho o bac "Has an account" cua Kofi Eriksen dang mo, ngay 22 duoc chon, co nut "Clear" o day (= Bo danh dau).
    - E26-thanh-vien-khoa-{1440,768}.png: dang nhap bang thanh vien (avatar "ML"), trang Onboarding hien dong chu "You need admin rights to change the onboarding setup." va cac nut "..." tren hai the deu o trang thai mo/disabled (khong the mo menu) — day la co che "khoa" thuc te trong code (khoa=true tu onboarding.access), khong phai mot bieu tuong o-khoa rieng: source (danh-sach-bo-phan.tsx, danh-sach-khuon.tsx, cai-dat-dieu-phoi.tsx) khong co icon Lock nao, chi co disabled + dong canQuyen. Ghi nhan sai lech nho ve tu ngu ("nut khoa") so voi co che that, nhung trang thai "bi khoa vi thieu quyen quan tri" van duoc chung minh day du bang anh.
    Ca 14 anh o kho 768 khong co thanh cuon ngang; kiem may bang scrollWidth==clientWidth (768==768) tren ca hai route (/crm/settings/onboarding va /crm/onboarding/{planId}).
  network_observed: n-a (driver)

- eval: E27
  run_id: minted-sua-luu-tru-dieu-phoi-E27-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_ngay_tao_ke_hoach
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [567.00ms]

- eval: E28
  run_id: minted-sua-luu-tru-dieu-phoi-E28-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_quyen_don_vi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 5 tests across 1 file. [218.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mubvrxb5g0pr
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E28 tat ca PASS ngay lan chay dau tien; ui-check E26 xac nhan qua 14 anh da luu (7 trang thai x 2 kho). Khong co vong quay lai implementation.