---
schema_version: 2
feature_slug: sua-luu-tru-dieu-phoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 70776c91ed7b3c29c44fdcd1863f171659aa4346
human_signoff: Phan Le Manh 2026-09-22
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
| E29 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-luu-tru-dieu-phoi-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_doi_ten_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 3 tests across 1 file. [737.00ms]

- eval: E2
  run_id: minted-sua-luu-tru-dieu-phoi-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     23 expect() calls
    Ran 1 test across 1 file. [790.00ms]
    test-run: dropped crm_mubxbehhfwvt_test

- eval: E3
  run_id: minted-sua-luu-tru-dieu-phoi-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_sap_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 1 test across 1 file. [718.00ms]

- eval: E4
  run_id: minted-sua-luu-tru-dieu-phoi-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     23 expect() calls
    Ran 1 test across 1 file. [790.00ms]
    test-run: dropped crm_mubxbehhfwvt_test

- eval: E5
  run_id: minted-sua-luu-tru-dieu-phoi-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_luu_tru_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [759.00ms]

- eval: E6
  run_id: minted-sua-luu-tru-dieu-phoi-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_bi_chan_luu_tru
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [558.00ms]

- eval: E7
  run_id: minted-sua-luu-tru-dieu-phoi-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_chan_luu_tru
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     14 expect() calls
    Ran 1 test across 1 file. [715.00ms]
    test-run: dropped crm_mubxbe0yzezx_test

- eval: E8
  run_id: minted-sua-luu-tru-dieu-phoi-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_sua_khuon
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [668.00ms]

- eval: E9
  run_id: mubxbdswtj9z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [856.00ms]
    test-run: dropped crm_mubxbdswtj9z_test

- eval: E10
  run_id: minted-sua-luu-tru-dieu-phoi-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_luu_tru_khuon
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [627.00ms]

- eval: E11
  run_id: mubxbdswtj9z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [856.00ms]
    test-run: dropped crm_mubxbdswtj9z_test

- eval: E12
  run_id: minted-sua-luu-tru-dieu-phoi-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_khoi_phuc
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [602.00ms]

- eval: E13
  run_id: mubxbdswtj9z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_khuon
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     35 expect() calls
    Ran 3 tests across 1 file. [856.00ms]
    test-run: dropped crm_mubxbdswtj9z_test

- eval: E14
  run_id: minted-sua-luu-tru-dieu-phoi-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_xoa_vinh_vien
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 1 test across 1 file. [602.00ms]

- eval: E15
  run_id: mubxbr63ea4h
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_xoa_vinh_vien
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
    29 expect() calls
    Ran 1 test across 1 file. [777.00ms]
    test-run: dropped crm_mubxbr63ea4h_test

- eval: E16
  run_id: minted-sua-luu-tru-dieu-phoi-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_khoa_theo_quyen
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     20 expect() calls
    Ran 2 tests across 1 file. [558.00ms]

- eval: E17
  run_id: mubxc3zbgym7
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_quyen
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     29 expect() calls
    Ran 1 test across 1 file. [782.00ms]
    test-run: dropped crm_mubxc3zbgym7_test

- eval: E18
  run_id: minted-sua-luu-tru-dieu-phoi-E18-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_dong_mo_ke_hoach
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [524.00ms]

- eval: E19
  run_id: mubxbrxqd38a
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_dong_mo
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
    13 expect() calls
    Ran 1 test across 1 file. [674.00ms]
    test-run: dropped crm_mubxbrxqd38a_test

- eval: E20
  run_id: minted-sua-luu-tru-dieu-phoi-E20-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_danh_dau_bac
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 1 test across 1 file. [537.00ms]

- eval: E21
  run_id: minted-sua-luu-tru-dieu-phoi-E21-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bac
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [655.00ms]
    test-run: dropped crm_mubxbyl4z5vz_test

- eval: E22
  run_id: mubxc2yb8bch
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_ngay
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     29 expect() calls
    Ran 1 test across 1 file. [682.00ms]
    test-run: dropped crm_mubxc2yb8bch_test

- eval: E23
  run_id: minted-sua-luu-tru-dieu-phoi-E23-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_da_trong_pheu
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [553.00ms]

- eval: E24
  run_id: minted-sua-luu-tru-dieu-phoi-E24-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_trung_pheu
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     7 expect() calls
    Ran 1 test across 1 file. [692.00ms]
    test-run: dropped crm_mubxc3aqpzrc_test

- eval: E25
  run_id: minted-sua-luu-tru-dieu-phoi-E25-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_loi_va_mot_lan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     44 expect() calls
    Ran 1 test across 1 file. [1.69s]

- eval: E26
  run_id: minted-sua-luu-tru-dieu-phoi-E26-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:40:00+07:00
  screenshot: _acceptance/sua-luu-tru-dieu-phoi/evidence/E26-bo-phan-menu-1440.png
  observed: |
    Doc truc tiep tung file PNG da luu (14 file, 1440+768 cho 7 trang thai):
    1) E26-bo-phan-menu-{1440,768}.png: menu «…» cua bo phan "E26 Bo phan dang dung" mo, hien 2 muc "Rename" / "Archive". Khop expected (Doi ten/Luu tru).
    2) E26-khuon-menu-{1440,768}.png: menu «…» cua khuon "E26 Khuon hai buoc" mo, hien "Edit" / "Archive". Khop expected (Sua/Luu tru).
    3) E26-soan-khuon-sua-{1440,768}.png: hop "Edit plan template" mo dien san — ten khuon "E26 Khuon hai buoc", 2 buoc (Buoc 1 / Buoc 2) voi bo phan va so ngay da dien, nut Save/Cancel. Khop "hop Soan khuon dien san".
    4) E26-da-luu-tru-{1440,768}.png: muc "Archived (4)" mo rong, liet ke ca bo phan da luu tru ("E26 Bo phan chua dung") va khuon da luu tru ("E26 Khuon chua dung", cung 2 muc cu tu truoc), moi dong co nut "Restore" va "Delete forever". Khop "Da luu tru co Khoi phuc va Xoa vinh vien".
    5) E26-thanh-vien-khoa-{1440,768}.png: dang nhap thanh vien (khong quyen quan tri), trang Settings›Onboarding hien dong chu "You need admin rights to change the onboarding setup." va cac nut "…"/"New template"/"New department" o trang thai disabled (xam mo). Khop "man thanh vien... dong can quyen quan tri".
    6) E26-ke-hoach-dong-{1440,768}.png: ho so ke hoach ("First 30 days") sau khi bam Close plan + xac nhan, hien badge "Closed" va nut "Reopen". Khop "nhan Da dong va nut Mo lai".
    7) E26-o-bac-lich-{1440,768}.png: mot o bac (Has an account) da danh dau ngay, bam vao ngay mo Popover lich voi nut "Clear" o duoi. Khop "o bac mo lich co Bo danh dau".
    O ca 2 anh 768 (moi trang thai): khong thay thanh cuon ngang, noi dung cat gon bang ellipsis, khop "O kho 768 khong co gi tran ngang". Xac nhan them bang JS: tren /crm/settings/onboarding va /crm/onboarding/{planId} o vien 768, document.documentElement.scrollWidth === clientWidth === 768 (khong tran).
    Khong thieu trang thai nao trong 7 trang thai yeu cau.
  network_observed: clean

- eval: E27
  run_id: minted-sua-luu-tru-dieu-phoi-E27-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_ngay_tao_ke_hoach
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [538.00ms]

- eval: E28
  run_id: minted-sua-luu-tru-dieu-phoi-E28-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_quyen_don_vi
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 5 tests across 1 file. [134.00ms]

- eval: E29
  run_id: minted-sua-luu-tru-dieu-phoi-E29-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.slt_api_bo_phan
  verified_at: 2026-09-22T09:40:00+07:00
  output: |
     23 expect() calls
    Ran 1 test across 1 file. [790.00ms]
    test-run: dropped crm_mubxbehhfwvt_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-22T09:40:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:40:00+07:00

- cmd: bun run lint:slop
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-22T09:40:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-sua-luu-tru-dieu-phoi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-22T09:40:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS — 28 eval ban dau (chua co E29) va cac lenh suite deu xanh; da ky Cong 2 (Gate 2 signoff, doc-Cong-Bang-chung).
Round 2 (hien tai): them E29 (AC-3, phan luu tru bo phan qua HTTP) sau khi ha hop dong ve implemented de cham lai; toan bo 29 eval + 4 lenh suite deu PASS, khong hoi quy.

### Re-pin lần 1 — 2026-09-22, do lượt ke-hoach-la-mot-ban-ghi sửa bài kiểm của hồ sơ (d-21, d-23) và dời màn hồ sơ kế hoạch sang PlanSheet
run_id: repin-20260922T065429Z-21311
sha: 2b389d3c924a29785f9250584bbae77718359592 · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · diff chạm vật đo ngoài làn máy: E26 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 2 — 2026-09-22, do CI đỏ vì mock next/navigation của E12 sống sang tệp đăng nhập; sửa bài kiểm ở 18ddded2
run_id: repin-20260922T070657Z-92620
sha: 18ddded26be1c1a204d4e2df661aa27669700a88 · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · AC không có chốt máy: AC-15

### Re-pin lần 3 — 2026-09-22, do gộp onehub (#80) và sửa bản giả E27 trước PR lượt 3
run_id: repin-20260922T132144Z-13202
sha: a22b9eb1cfcb3dfdd762dac4cb2d2d0e3a86b471 · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · diff chạm vật đo ngoài làn máy: E26 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 4 — 2026-09-24, do hành vi phòng ban dời sang Cài đặt › Tổ chức (cau-truc-to-chuc AC-12)
run_id: repin-20260924T071819Z-86475
sha: ff81251be877f3cd4c53c7682150e2def52a09b0 · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · diff chạm vật đo ngoài làn máy: E26 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 5 — 2026-09-24, do sửa của cau-truc-to-chuc ở S4 và hai lần gộp onehub chạm vùng phòng ban
run_id: repin-20260924T092647Z-71437
sha: 7aa510c3404a0b01e5e523712f5cfc65906f3f3f · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · AC không có chốt máy: AC-15

### Re-pin lần 6 — 2026-09-24, do dời bài kiểm đã ký sang bố cục danh sách – chi tiết (to-chuc-danh-sach-chi-tiet), đổi câu lỗi nhập theo AC-8
run_id: repin-20260924T164220Z-99128
sha: ded515a9d79a9a0a729930d227b1fe7b5801e70b · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · diff chạm vật đo ngoài làn máy: E26 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 7 — 2026-09-24, do S4 vòng 2 của to-chuc-danh-sach-chi-tiet: bài nhap-man đổi dữ liệu gửi mong đợi (traTen), dòng người và bước 3 hộp nhập
run_id: repin-20260924T183547Z-84900
sha: 70776c91ed7b3c29c44fdcd1863f171659aa4346 · suites: 4 lệnh exit 0 · evals: 28/28 eval máy đạt kỳ vọng · ngoài làn máy: E26 · AC không có chốt máy: AC-15
