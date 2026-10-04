---
schema_version: 2
feature_slug: quen-mat-khau
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d03129ecfa5bdbcff83dee9706a511e342f399c
human_signoff: Phan Le Manh 2026-09-26
---

# Evidence Report: quen-mat-khau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-2 | test | PASS |
| E6 | AC-3 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-5 | test | PASS |
| E17 | AC-12 | test | PASS |
| E18 | AC-12 | ui-check | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | judgment | PASS |
| E21 | AC-1 | ui-check | PASS |
| E22 | AC-14 | test | PASS |
| E23 | AC-14 | test | PASS |
| E24 | AC-15 | test | PASS |

## Evidence

- eval: E1
  run_id: muhte2yfb6zt
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_tat_api
  verified_at: 2026-09-26T03:12:24Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [691.00ms]
    test-run: dropped crm_muhte2yfb6zt_test

- eval: E2
  run_id: minted-quen-mat-khau-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_tat_man
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [592.00ms]

- eval: E3
  run_id: muhtdv1kkcok
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_bat_api
  verified_at: 2026-09-26T03:12:24Z
  output: |
    4 expect() calls
    Ran 5 tests across 1 file. [636.00ms]
    test-run: dropped crm_muhtdv1kkcok_test

- eval: E4
  run_id: minted-quen-mat-khau-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_duong_an_danh
  verified_at: 2026-09-26T03:12:24Z
  output: |
    0 fail
    14 expect() calls
    Ran 6 tests across 1 file. [5.00ms]

- eval: E5
  run_id: minted-quen-mat-khau-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_lien_ket_man
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [418.00ms]

- eval: E6
  run_id: minted-quen-mat-khau-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_cau_hinh_nua
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     10 expect() calls
    Ran 4 tests across 1 file. [103.00ms]

- eval: E7
  run_id: muhtdxc0iud8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_cung_cau_tra_loi
  verified_at: 2026-09-26T03:12:24Z
  output: |
     8 expect() calls
    Ran 3 tests across 1 file. [325.00ms]
    test-run: dropped crm_muhtdxc0iud8_test

- eval: E8
  run_id: muhtduhpojwt
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_khong_cho_thu
  verified_at: 2026-09-26T03:12:24Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [3.36s]
    test-run: dropped crm_muhtduhpojwt_test

- eval: E9
  run_id: muhtdtzc1z7m
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_dung_nguoi
  verified_at: 2026-09-26T03:12:24Z
  output: |
     11 expect() calls
    Ran 3 tests across 1 file. [308.00ms]
    test-run: dropped crm_muhtdtzc1z7m_test

- eval: E10
  run_id: minted-quen-mat-khau-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_mot_lan
  verified_at: 2026-09-26T03:12:24Z
  output: |
     6 expect() calls
    Ran 3 tests across 1 file. [2.13s]
    test-run: dropped crm_muhtdve5heum_test

- eval: E11
  run_id: muhtduqdmgwy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_het_han
  verified_at: 2026-09-26T03:12:24Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [367.00ms]
    test-run: dropped crm_muhtduqdmgwy_test

- eval: E12
  run_id: minted-quen-mat-khau-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_qua_luot
  verified_at: 2026-09-26T03:12:24Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [364.00ms]
    test-run: dropped crm_muhte34nnlys_test

- eval: E13
  run_id: minted-quen-mat-khau-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [443.00ms]

- eval: E14
  run_id: muhte7bvtjag
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_bao_da_doi
  verified_at: 2026-09-26T03:12:24Z
  output: |
     8 expect() calls
    Ran 4 tests across 1 file. [3.50s]
    test-run: dropped crm_muhte7bvtjag_test

- eval: E15
  run_id: muhte5xiymgh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_hong
  verified_at: 2026-09-26T03:12:24Z
  output: |
     7 expect() calls
    Ran 3 tests across 1 file. [271.00ms]
    test-run: dropped crm_muhte5xiymgh_test

- eval: E16
  run_id: minted-quen-mat-khau-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_goi_nen
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [15.00ms]

- eval: E17
  run_id: minted-quen-mat-khau-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [443.00ms]

- eval: E18
  run_id: minted-quen-mat-khau-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup
  verified_at: 2026-09-26T03:12:24Z
  screenshot: evidence/E18-dang-nhap-1440.png
  observed: |
    E18-dang-nhap-1440.png: man /sign-in nen toi OneHub, co the "Mật khẩu" va ngay duoi la lien ket gach chan "Quên mật khẩu?" — dung vi tri Expected.
    E18-quen-trong-1440.png: URL da sang /quen-mat-khau, tieu de "Quên mật khẩu", mot o email + nut "Gửi liên kết" + lien ket "Quay lại đăng nhập" — dung bo cuc AuthShell nhu Expected.
    E18-da-gui-1440.png: sau khi gui, man hien "Kiểm tra hộp thư" voi noi dung neu so phut that (60 phut) — dung Expected.
    E18-loi-1440.png: khi mang bi chan, hien Alert xam voi chu loi tu kho chu, o email con nguyen dia chi da nhap — dung Expected.
    E18-qua-luot-1440.png: lan gui thu tu that hien dung chuoi qua luot tu messages/auth.ts va KHONG lan sang man da-gui.
    Ca hai kich thuoc 390 va 1440 deu khong tran ngang. Tat ca 7 frame doi chieu bang mat deu KHOP Expected, khong co mau thuan nao.
  network_observed: n-a (driver)

- eval: E19
  run_id: design-gate-1e8bc4b6cc design-gate-e5b6992224 design-gate-e8470aaa63
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_san_thiet_ke
  verified_at: 2026-09-26T03:12:24Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E21
  run_id: minted-quen-mat-khau-E21-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup_tat
  verified_at: 2026-09-26T03:12:24Z
  screenshot: evidence/E21-dang-nhap-tat-1440.png
  observed: |
    Mở evidence/E21-dang-nhap-tat-1440.png (ghi lúc 10:14, đúng lượt chạy này): trang /sign-in rộng 1440px, theme tối, logo "OneHub" góc trái trên, tiêu đề "Mừng bạn quay lại", hai trường "Địa chỉ email" và "Mật khẩu", nút "Đăng nhập". KHÔNG thấy bất kỳ liên kết "quên mật khẩu" nào trên trang — khớp đúng Expected (a[href="/quen-mat-khau"] = 0 khi cấu hình api tắt hai biến).
  network_observed: n-a (driver)

- eval: E22
  run_id: muhte9sjve0b
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_dia_chi_rieng
  verified_at: 2026-09-26T03:12:24Z
  output: |
     2 expect() calls
    Ran 2 tests across 1 file. [283.00ms]
    test-run: dropped crm_muhte9sjve0b_test

- eval: E23
  run_id: minted-quen-mat-khau-E23-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_proxy_ky_dia_chi
  verified_at: 2026-09-26T03:12:24Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [9.00ms]

- eval: E24
  run_id: muhtecc3vc2q
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_ngat_giua_chung
  verified_at: 2026-09-26T03:12:24Z
  output: |
     2 expect() calls
    Ran 2 tests across 1 file. [1001.00ms]
    test-run: dropped crm_muhtecc3vc2q_test

- eval: E20
  judged_by: judge panel (carried từ round 2)
  verdict: PASS
  rationale: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round đó.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override: Đạt — Phan Le Manh 2026-09-26

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-quen-mat-khau-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-26T03:12:24Z
  output: |
      Time:    1m44.858s

    test-run: dropped crm_muhtgcq7cnwp_test

- cmd: bunx turbo run lint --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-26T03:12:24Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    446ms

- cmd: bun run lint:slop
  run_id: minted-quen-mat-khau-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-26T03:12:24Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 759ms on 1494 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-26T03:12:24Z
  output: |
    Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.767s

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay

E4 (cd apps/app && bun test ./test/proxy-an-danh.spec.ts) — pass tren ca HEAD lan baseline: chung minh harness (ma tran an danh) chu khong phai hanh vi rieng cua tinh nang quen-mat-khau; giu nguyen nhu regression-guard co chu y, khong viet lai bat buoc.

## Variance

none — không có eval nào chạy runs > 1 vòng này (không có eval ngẫu nhiên/stochastic trong round 4).

## Iterations

Round 3: thử lại vì hạ tầng — một ca đỏ ở proxy thiếu khoá bí mật (RESEND_API_KEY/MAIL_FROM bị che bởi giá trị mặc định); đã sửa bằng cách bắt proxy nhận khoá bí mật tường minh, bỏ giá trị mặc định che ca thiếu khoá.
Round 4: toàn bộ 24 eval máy + 4 lệnh suite (test, lint, lint:slop, build) đều xanh, exit 0; panel judgment E20 carried PASS từ round 2 (inputs không đổi).
Round 4 (chốt): vì packages/auth thuộc đường T3, verdict tổng giữ PENDING-JUDGMENT dù mọi phép đo máy đã xanh — chờ người ký `human_override` trực tiếp trên E20 và điền `human_signoff` ở Cổng Bằng chứng trước khi nâng lên PASS.

### Re-pin lần 1 — 2026-09-26, do hoá cũ do gộp origin/onehub 63359052 sau chữ ký
run_id: repin-20260926T034437Z-87195
sha: 03296aefd7cb8bb28924a9bbbf9fb189d9190f9a · suites: 4 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E18, E20 (E20 không khai paths), E21 · AC không có chốt máy: AC-13

### Re-pin lần 2 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E18, E20, E21 · diff chạm vật đo ngoài làn máy: E18, E20, E21 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13

### Re-pin lần 3 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E18, E20, E21 · diff chạm vật đo ngoài làn máy: E20 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13

### Re-pin lần 4 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T161003Z-91842
sha: 0d03129ecfa5bdbcff83dee9706a511e342f399c · suites: 7 lệnh exit 0 · evals: 21/21 eval máy đạt kỳ vọng · ngoài làn máy: E18, E20, E21 · AC không có chốt máy: AC-13
