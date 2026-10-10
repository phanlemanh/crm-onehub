---
schema_version: 2
feature_slug: moi-phia-deu-thay-ke-hoach
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 34ffea77b4165083c59a91377f8600f5bfbd6356
human_signoff:
---

# Evidence Report: moi-phia-deu-thay-ke-hoach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | ui-check | PASS |
| E18 | AC-13 | test | PASS |

## Evidence

- eval: E1
  run_id: mucfanumlle2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_chuyen_giao
  verified_at: 2026-09-22T10:00:00Z
  output: |
    13 expect() calls
    Ran 1 test across 1 file. [362.00ms]
    test-run: dropped crm_mucfanumlle2_test

- eval: E2
  run_id: mucfamlhcrdy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_chuyen_giao_chan
  verified_at: 2026-09-22T10:00:00Z
  output: |
    12 expect() calls
    Ran 1 test across 1 file. [442.00ms]
    test-run: dropped crm_mucfamlhcrdy_test

- eval: E3
  run_id: minted-moi-phia-deu-thay-ke-hoach-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_chuyen_giao_man
  verified_at: 2026-09-22T10:00:00Z
  output: |
    0 fail
    8 expect() calls
    Ran 3 tests across 1 file. [813.00ms]

- eval: E4
  run_id: mucfamoano0a
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_chuyen_giao_payload
  verified_at: 2026-09-22T10:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [433.00ms]
    test-run: dropped crm_mucfamoano0a_test

- eval: E5
  run_id: mucfammc76s2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_viec_cua_toi
  verified_at: 2026-09-22T10:00:00Z
  output: |
    19 expect() calls
    Ran 1 test across 1 file. [430.00ms]
    test-run: dropped crm_mucfammc76s2_test

- eval: E6
  run_id: minted-moi-phia-deu-thay-ke-hoach-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_the_tasks_man
  verified_at: 2026-09-22T10:00:00Z
  output: |
    0 fail
    8 expect() calls
    Ran 1 test across 1 file. [581.00ms]

- eval: E7
  run_id: mucfaljzveys
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_the_tasks_payload
  verified_at: 2026-09-22T10:00:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [332.00ms]
    test-run: dropped crm_mucfaljzveys_test

- eval: E8
  run_id: mucfanilh2kk
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_vet_giao_luc_xong
  verified_at: 2026-09-22T10:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [334.00ms]
    test-run: dropped crm_mucfanilh2kk_test

- eval: E9
  run_id: mucfam3aeyul
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_ke_hoach_cong_ty
  verified_at: 2026-09-22T10:00:00Z
  output: |
    Ran 2 tests across 1 file. [427.00ms]
    test-run: dropped crm_mucfam3aeyul_test

- eval: E10
  run_id: minted-moi-phia-deu-thay-ke-hoach-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_tab_cong_ty_man
  verified_at: 2026-09-22T10:00:00Z
  output: |
    0 fail
    6 expect() calls
    Ran 4 tests across 1 file. [922.00ms]

- eval: E11
  run_id: mucfaxxz7ypb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_ke_hoach_ca_nhan
  verified_at: 2026-09-22T10:00:00Z
  output: |
    Ran 1 test across 1 file. [301.00ms]
    test-run: dropped crm_mucfaxxz7ypb_test

- eval: E12
  run_id: minted-moi-phia-deu-thay-ke-hoach-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_muc_ca_nhan_man
  verified_at: 2026-09-22T10:00:00Z
  output: |
    0 fail
    7 expect() calls
    Ran 2 tests across 1 file. [682.00ms]

- eval: E13
  run_id: minted-moi-phia-deu-thay-ke-hoach-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_loc_nguoi_giao
  verified_at: 2026-09-22T10:00:00Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [367.00ms]
    test-run: dropped crm_mucfb018yv9i_test

- eval: E14
  run_id: minted-moi-phia-deu-thay-ke-hoach-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_loc_nguoi_giao_man
  verified_at: 2026-09-22T10:00:00Z
  output: |
    0 fail
    4 expect() calls
    Ran 1 test across 1 file. [768.00ms]

- eval: E15
  run_id: mucfb1gb7ddk
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_cot_nguoi_giao
  verified_at: 2026-09-22T10:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [338.00ms]
    test-run: dropped crm_mucfb1gb7ddk_test

- eval: E16
  run_id: minted-moi-phia-deu-thay-ke-hoach-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_ba_lech
  verified_at: 2026-09-22T10:00:00Z
  output: |
    Ran 3 tests across 1 file. [771.00ms]

- eval: E18
  run_id: design-gate-3ace88d6f4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh2_san_thiet_ke
  verified_at: 2026-09-22T10:00:00Z
  output: |
    "hits": [],
    "findings": []

- eval: E17
  run_id: minted-moi-phia-deu-thay-ke-hoach-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T10:00:00Z
  screenshot: _acceptance/moi-phia-deu-thay-ke-hoach/evidence/E17-cong-ty-1440.png
  observed: |
    5 frame da mo bang Read, doi chieu tung dong Expected:

    E17-cong-ty-1440.png: sheet "One Mount" (kho 1440) co hang tab Tong quan / Ca nhan 2 / Thoa thuan 1 / **30 ngay dau 1** / Hoat dong / Tac nhan — tab moi dung NGAY SAU "Thoa thuan", cung kieu nhan so dem (badge tron, cung vi tri) nhu "Thoa thuan". Bang duoi tab co du 5 cot dung ten: Ke hoach | Ngay | Buoc | Dang tac o | Cam trich, hang du lieu "E17 Onboarding One Mount, bat dau 15 thg 9, 2026 | 7/30 | 0/5 | Ky hop dong khung | manh.phan". -> Dong 1 THAY.

    E17-tong-quan-1440.png: the "Viec qua han" (Tasks) o kho 1440, da mo rong khoi cuon trong de thay het hang khi chup (khong doi hanh vi app, chi anh huong khung hinh luc chup). Thay hang "Ky hop dong khung / One Mount . Ke hoach 30 ngay / 15 thg 9, 202..." mang O VUONG DO (mau do, giong cac hang qua han khac cung cot); va hang "Duyet ngan sach quy 4 / One Mount . Ke hoach 30 ngay / 22 thg 9, 202..." mang O VUONG TRANG/XAM (khong do). Da zoom crop hai o danh dau, mau khac nhau ro rang. -> Dong 2 THAY.

    E17-chuyen-viec-1440.png: hop thoai "Chuyen viec 30 ngay cua manh.phan" mo tu "..." cua hang manh.phan trong /crm/settings/members, than hop thoai doc "manh.phan dang cam trich 1 ke hoach dang chay va co 1 buoc chua xong." -> so ke hoach (1) va so buoc (1) hien dung, khop voi API transferPreview {keHoach:1, buoc:1} doc truoc do. Dong 3 THAY.

    E17-cong-ty-375.png + E17-tong-quan-375.png: hai anh kho 375, khong thay thanh cuon ngang hay noi dung tran khoi vien man hinh; kiem bang JS document.documentElement.scrollWidth === window.innerWidth === 375 dung tren CA HAI trang (dashboard va company-sheet) — mot thanh tabs-list rieng co scrollWidth 539 (cuon ngang NOI BO cua rieng no, kieu tab-bar vuot ngang tren mobile, khong keo theo trang) nhung KHONG lam document tran. -> Dong 4 THAY.

    Ca 4 dong deu thay duoc tren anh, khong dong nao FAIL.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-moi-phia-deu-thay-ke-hoach-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-22T10:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-moi-phia-deu-thay-ke-hoach-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T10:00:00Z

- cmd: bun run lint:slop
  run_id: minted-moi-phia-deu-thay-ke-hoach-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T10:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-moi-phia-deu-thay-ke-hoach-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T10:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E18 đều PASS ngay lần chạy đầu (baseline red trên diffBase, riêng E17 ui-check là n-a vì không có baseline mã để so); bốn lệnh suite hồi quy (bun run test, turbo lint, lint:slop, turbo build) đều xanh. Không có thất bại, không cần vòng lặp lại.

### Re-pin lần 1 — 2026-09-22, do gộp onehub (kit 2.18.1) trước PR lượt 2
run_id: repin-20260922T094919Z-71145
sha: ef99904ce50e884b7b8a4c26b92d0af993582f38 · suites: 4 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E17

### Re-pin lần 2 — 2026-10-10, do E6 dieu-phoi-va them quaHan vao du lieu gia cua ba bai DOM (P3-81) va gop onehub
run_id: repin-20261010T083254Z-33269
sha: 34ffea77b4165083c59a91377f8600f5bfbd6356 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E17 · diff chạm vật đo ngoài làn máy: E17 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
