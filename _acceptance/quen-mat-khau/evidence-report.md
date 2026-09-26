---
schema_version: 2
feature_slug: quen-mat-khau
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 858d2330277c293b2f26b015509e39144f77c92b
human_signoff:
---

# Evidence Report: quen-mat-khau

Lệnh suite `bun run test` KHÔNG gắn được vào eval nào trong hợp đồng (regression không map được vào một AC cụ thể) — xem khối cuối mục Evidence, phần "Lệnh suite (hồi quy)". Đây là nguyên nhân duy nhất của verdict REJECT round này: toàn bộ 24 eval mục tiêu (E1–E24) đều xanh khi chạy tách riêng.

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
| E20 | AC-13 | judgment | PASS (panel, carried r2) |
| E21 | AC-1 | ui-check | PASS |
| E22 | AC-14 | test | PASS |
| E23 | AC-14 | test | PASS |
| E24 | AC-15 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-quen-mat-khau-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_tat_api
  verified_at: 2026-09-26T02:42:43Z
  output: |
     1 expect() calls
    Ran 1 test across 1 file. [1029.00ms]
    test-run: dropped crm_muhsc0et8sx3_test

- eval: E2
  run_id: minted-quen-mat-khau-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_tat_man
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [431.00ms]

- eval: E3
  run_id: muhsc32do9xk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_co_bat_api
  verified_at: 2026-09-26T02:42:43Z
  output: |
    Ran 5 tests across 1 file. [666.00ms]
    test-run: dropped crm_muhsc32do9xk_test

- eval: E4
  run_id: minted-quen-mat-khau-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_duong_an_danh
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     14 expect() calls
    Ran 6 tests across 1 file. [15.00ms]

- eval: E5
  run_id: minted-quen-mat-khau-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_lien_ket_man
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [783.00ms]

- eval: E6
  run_id: minted-quen-mat-khau-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_cau_hinh_nua
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     10 expect() calls
    Ran 4 tests across 1 file. [115.00ms]

- eval: E7
  run_id: muhsc0p7f7gs
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_cung_cau_tra_loi
  verified_at: 2026-09-26T02:42:43Z
  output: |
     8 expect() calls
    Ran 3 tests across 1 file. [355.00ms]
    test-run: dropped crm_muhsc0p7f7gs_test

- eval: E8
  run_id: minted-quen-mat-khau-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_khong_cho_thu
  verified_at: 2026-09-26T02:42:43Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [3.43s]
    test-run: dropped crm_muhsc24fhn33_test

- eval: E9
  run_id: muhsc1ohkogm
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_dung_nguoi
  verified_at: 2026-09-26T02:42:43Z
  output: |
     11 expect() calls
    Ran 3 tests across 1 file. [295.00ms]
    test-run: dropped crm_muhsc1ohkogm_test

- eval: E10
  run_id: minted-quen-mat-khau-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_mot_lan
  verified_at: 2026-09-26T02:42:43Z
  output: |
     6 expect() calls
    Ran 3 tests across 1 file. [2.10s]
    test-run: dropped crm_muhsc0e57gh3_test

- eval: E11
  run_id: muhsbya8oi7s
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_het_han
  verified_at: 2026-09-26T02:42:43Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [504.00ms]
    test-run: dropped crm_muhsbya8oi7s_test

- eval: E12
  run_id: muhsc90bcrjj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_qua_luot
  verified_at: 2026-09-26T02:42:43Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [363.00ms]
    test-run: dropped crm_muhsc90bcrjj_test

- eval: E13
  run_id: minted-quen-mat-khau-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [506.00ms]

- eval: E14
  run_id: muhscdq4ytw3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_bao_da_doi
  verified_at: 2026-09-26T02:42:43Z
  output: |
     8 expect() calls
    Ran 4 tests across 1 file. [3.58s]
    test-run: dropped crm_muhscdq4ytw3_test

- eval: E15
  run_id: muhscd8bo3yk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_thu_hong
  verified_at: 2026-09-26T02:42:43Z
  output: |
     7 expect() calls
    Ran 3 tests across 1 file. [387.00ms]
    test-run: dropped crm_muhscd8bo3yk_test

- eval: E16
  run_id: minted-quen-mat-khau-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_goi_nen
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [16.00ms]

- eval: E17
  run_id: minted-quen-mat-khau-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_form_trang_thai
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     13 expect() calls
    Ran 6 tests across 1 file. [506.00ms]

- eval: E18
  run_id: minted-quen-mat-khau-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup
  verified_at: 2026-09-26T02:42:43Z
  screenshot: evidence/E18-dang-nhap-1440.png
  observed: |
    1) E18-dang-nhap-1440.png: màn /sign-in 1440px, form OneHub (AuthShell 2 cột), có liên kết "Quên mật khẩu?" gạch chân nằm NGAY DƯỚI ô "Mật khẩu", trên nút "Đăng nhập". Khớp Expected.
    2) E18-dang-nhap-390.png: cùng màn ở 390px, "Quên mật khẩu?" vẫn nằm dưới ô mật khẩu, không thấy tràn ngang. Khớp Expected.
    3) E18-quen-trong-1440.png: /quen-mat-khau 1440px — tiêu đề "Quên mật khẩu", một ô "Địa chỉ email", một nút "Gửi liên kết", liên kết "Quay lại đăng nhập" — bố cục AuthShell giống /dat-mat-khau. Khớp Expected.
    4) E18-quen-trong-390.png: cùng form ở 390px, không tràn ngang. Khớp Expected.
    5) E18-da-gui-1440.png: sau khi gửi form — màn "Kiểm tra hộp thư" với nội dung nêu số phút thật (60), không phải placeholder. Khớp Expected.
    6) E18-loi-1440.png: khi chặn request-password-reset — hiện Alert lỗi "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại.", ô email vẫn giữ giá trị đã gõ. Khớp Expected.
    7) E18-qua-luot-1440.png: lần gửi thứ 4 (máy chủ thật, 429 thật) — Alert "Bạn đã xin quá nhiều lần. Chờ 1 phút rồi thử lại." lấy từ apps/app/lib/messages/auth.ts dòng 201, và không còn chữ "Kiểm tra hộp thư" nào trên trang. Khớp Expected.
    Tất cả 7 frame khớp Expected, không có mâu thuẫn nào.
  network_observed: n-a (driver)

- eval: E19
  run_id: design-gate-d81b707e0d,design-gate-df55704673,design-gate-828f4c94f9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_san_thiet_ke
  verified_at: 2026-09-26T02:42:43Z
  output: |
    "blocking": [],
    "hits": [],
    "findings": []

- eval: E21
  run_id: minted-quen-mat-khau-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_chup_tat
  verified_at: 2026-09-26T02:42:43Z
  screenshot: evidence/E21-dang-nhap-tat-1440.png
  observed: |
    Đọc E21-dang-nhap-tat-1440.png (2880x1800, viewport 1440 x2 DPR): trang /sign-in ở cấu hình thư "tắt" (không RESEND_API_KEY/MAIL_FROM) hiện panel đăng nhập OneHub "Mừng bạn quay lại" với hai ô "Địa chỉ email"/"Mật khẩu" và nút "Đăng nhập" — KHÔNG có bất kỳ liên kết "Quên mật khẩu?" nào ở dưới ô mật khẩu hay nơi khác. Khớp Expected: a[href="/quen-mat-khau"] = 0 tại /sign-in khi cấu hình thư tắt.
  network_observed: n-a (driver)

- eval: E22
  run_id: muhscep7f70u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_dia_chi_rieng
  verified_at: 2026-09-26T02:42:43Z
  output: |
     2 expect() calls
    Ran 2 tests across 1 file. [338.00ms]
    test-run: dropped crm_muhscep7f70u_test

- eval: E23
  run_id: minted-quen-mat-khau-E23-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_proxy_ky_dia_chi
  verified_at: 2026-09-26T02:42:43Z
  output: |
     0 fail
     5 expect() calls
    Ran 3 tests across 1 file. [11.00ms]

- eval: E24
  run_id: muhsci1sz70w
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qmk_ngat_giua_chung
  verified_at: 2026-09-26T02:42:43Z
  output: |
     2 expect() calls
    Ran 2 tests across 1 file. [1007.00ms]

- eval: E20
  judged_by: panel (carried từ round 2 — inputs không đổi, không chấm lại)
  proposal: PASS
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  rationale: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round đó.
  human_override:        # human fills "<name> <date>" nếu cần chốt tại Cổng 2

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-quen-mat-khau-SUITE-bun_run_test-r3
  exit_code: 1
  verified_at: 2026-09-26T02:42:43Z
  output: |
    app:test:  1 fail
    app:test:  1306 expect() calls
    app:test: Ran 380 tests across 45 files. [1435.00ms]
    app:test: error: script "test" exited with code 1
    app#test:  ERROR  command (/Users/manh-macmini/dev/crm/.claude/worktrees/wizardly-lumiere-e25e92/apps/app) /opt/homebrew/bin/bun run test exited (1)
     Tasks:    10 successful, 11 total
    Cached:    2 cached, 11 total
      Time:    1m19.812s
    Failed:    app#test
     ERROR  run failed: command  exited (1)

- cmd: bunx turbo run lint --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-26T02:42:43Z
  output: |
    Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    1.255s

- cmd: bun run lint:slop
  run_id: minted-quen-mat-khau-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-26T02:42:43Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 787ms on 1494 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-quen-mat-khau-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-26T02:42:43Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.921s

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay

E4 (cmd: `cd apps/app && bun test ./test/proxy-an-danh.spec.ts`) — non-discriminating trên baseline ở round trước; xem rationale ở round đó, không đo lại round này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 3 (lần 1): `bun run test` bị công cụ cắt trước dòng tổng kết — BLOCKED, 0 eval trượt, 0 phát hiện trong hợp đồng; chủ kho xác nhận hướng R, thử lại round 3 vì đây là sự cố hạ tầng (công cụ), không phải sản phẩm.
Round 3 (lần 2 — round này): `bun run test` chạy xong trọn vẹn, không bị cắt — app#test đỏ thật: 1 fail trong 1306 expect() calls, 380 tests / 45 tệp ở apps/app; 24 eval mục tiêu (E1–E24) đều xanh khi chạy tách riêng, ba lệnh suite còn lại (lint, lint:slop, build) đều xanh.
→ Sau round 3 (đã thử lại): verdict REJECT, escalate cho chủ kho quyết — lệnh fail (`bun run test`, exit 1) không gắn được vào eval nào vì mọi eval test mục tiêu đã chạy tách riêng đều xanh; cần định vị test nào trong 45 tệp của apps/app đang đỏ trước khi tiếp tục.
