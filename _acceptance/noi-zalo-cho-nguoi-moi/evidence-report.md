---
schema_version: 2
feature_slug: noi-zalo-cho-nguoi-moi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 43f0c84cbb8a1547d530381408a71d546a2b74e8
human_signoff: Phan Le Manh 2026-09-24
---

# Evidence Report: noi-zalo-cho-nguoi-moi

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
| E9 | AC-6 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | test | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-10 | test | PASS |
| E16 | AC-11 | test | PASS |
| E17 | AC-12 | test | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-14 | ui-check | PASS |
| E20 | AC-14 | test | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-15 | script | PASS |
| E23 | AC-1 | test | PASS |
| E24 | AC-14 | script | PASS |
| E25 | AC-16 | test | PASS |
| E26 | AC-17 | test | PASS |
| E27 | AC-18 | test | PASS |

## Evidence

- eval: E1
  run_id: muf90elffaew
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_luu_bot
  verified_at: 2026-09-24T07:31:57Z
  output: |
    13 expect() calls
    Ran 3 tests across 1 file. [543.00ms]
    test-run: dropped crm_muf90elffaew_test

- eval: E2
  run_id: muf90df54nrx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_luu_bot_api
  verified_at: 2026-09-24T07:31:57Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [901.00ms]
    test-run: dropped crm_muf90df54nrx_test

- eval: E3
  run_id: muf90dqa6hv2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_token_sai_api
  verified_at: 2026-09-24T07:31:57Z
  output: |
    11 expect() calls
    Ran 4 tests across 1 file. [868.00ms]
    test-run: dropped crm_muf90dqa6hv2_test

- eval: E4
  run_id: muf90dlgw9in
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_token_sai
  verified_at: 2026-09-24T07:31:57Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [502.00ms]
    test-run: dropped crm_muf90dlgw9in_test

- eval: E5
  run_id: muf90dp3zyrk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_can_https
  verified_at: 2026-09-24T07:31:57Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [451.00ms]
    test-run: dropped crm_muf90dp3zyrk_test

- eval: E6
  run_id: muf90crssf55
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_quyen_api
  verified_at: 2026-09-24T07:31:57Z
  output: |
    5 expect() calls
    Ran 2 tests across 1 file. [1453.00ms]
    test-run: dropped crm_muf90crssf55_test

- eval: E7
  run_id: muf90ddn2p5s
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_quyen_cau
  verified_at: 2026-09-24T07:31:57Z
  output: |
    12 expect() calls
    Ran 2 tests across 1 file. [528.00ms]
    test-run: dropped crm_muf90ddn2p5s_test

- eval: E8
  run_id: muf90d3hz0zg
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_nguon_token
  verified_at: 2026-09-24T07:31:57Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [2.16s]
    test-run: dropped crm_muf90d3hz0zg_test

- eval: E9
  run_id: muf90e77z55o
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_trang_thai_webhook
  verified_at: 2026-09-24T07:31:57Z
  output: |
    11 expect() calls
    Ran 6 tests across 1 file. [820.00ms]
    test-run: dropped crm_muf90e77z55o_test

- eval: E10
  run_id: muf90d92cukc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_xuong_webhook
  verified_at: 2026-09-24T07:31:57Z
  output: |
    2 expect() calls
    Ran 2 tests across 1 file. [1003.00ms]
    test-run: dropped crm_muf90d92cukc_test

- eval: E11
  run_id: muf90dz7s45h
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_db_loi
  verified_at: 2026-09-24T07:31:57Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [495.00ms]
    test-run: dropped crm_muf90dz7s45h_test

- eval: E12
  run_id: minted-noi-zalo-cho-nguoi-moi-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_gui_hong
  verified_at: 2026-09-24T07:31:57Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [329.00ms]
    test-run: dropped crm_muf90m8akiws_test

- eval: E13
  run_id: muf90qd7rw0t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_da_noi_roi
  verified_at: 2026-09-24T07:31:57Z
  output: |
    8 expect() calls
    Ran 2 tests across 1 file. [400.00ms]
    test-run: dropped crm_muf90qd7rw0t_test

- eval: E14
  run_id: muf90qbp4wrl
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_gui_thu
  verified_at: 2026-09-24T07:31:57Z
  output: |
    10 expect() calls
    Ran 1 test across 1 file. [360.00ms]
    test-run: dropped crm_muf90qbp4wrl_test

- eval: E15
  run_id: muf90rbqquv6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_gui_thu_api
  verified_at: 2026-09-24T07:31:57Z
  output: |
    8 expect() calls
    Ran 3 tests across 1 file. [786.00ms]
    test-run: dropped crm_muf90rbqquv6_test

- eval: E16
  run_id: minted-noi-zalo-cho-nguoi-moi-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_go_thanh_vien
  verified_at: 2026-09-24T07:31:57Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [684.00ms]
    test-run: dropped crm_muf90sho81k7_test

- eval: E17
  run_id: minted-noi-zalo-cho-nguoi-moi-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_ten_bot
  verified_at: 2026-09-24T07:31:57Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [423.00ms]
    test-run: dropped crm_muf90rhgfvg7_test

- eval: E18
  run_id: minted-noi-zalo-cho-nguoi-moi-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_o_token
  verified_at: 2026-09-24T07:31:57Z
  output: |
    0 fail
    12 expect() calls
    Ran 5 tests across 1 file. [826.00ms]

- eval: E19
  run_id: E19-independent-verify-20260924
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-24T07:31:57Z
  screenshot: _acceptance/noi-zalo-cho-nguoi-moi/evidence/E19-chua-noi-1440.png
  observed: |
    Đọc trực tiếp cả 11 file .png vừa lưu (Read, ảnh thật) đối chiếu Expected:
    - E19-chua-noi-1440.png: "Thông báo của bạn" > "Zalo của bạn", 3 bước đánh số dọc 1/2/3; bước 1 "Mở Zalo, tìm Bot OneHub" chứa "Bot OneHub"; bước 2 "Lấy mã nối" có nút xanh lá "Nối Zalo". PASS.
    - E19-ma-cho-1440.png: bước 1,2 tích check, bước 3 "Nhận mã cho bot" mở, khối viền hiện mã 6 số "115 238" + nút viền "Chép mã", dòng "Hết hạn lúc 15:36". PASS.
    - E19-da-noi-1440.png: dòng trạng thái xanh "Đã nối · E19 Quản trị Zalo", nút viền "Gửi thử nhắc ngay" và nút viền "Gỡ" (không nút nào tô đặc/đỏ). PASS.
    - E19-song-1440.png: header "Bot OneHub · trả lời lần cuối lúc 15:21 24-09" (chấm xanh); dòng "Nhận tin qua webhook" xanh; Bot Token "••••-anh"; danh sách 12 thành viên có "Đã nối"/"Chưa nối". PASS.
    - E19-can-https-1440.png: cảnh báo cam "Tin nhắn tới bot chưa về CRM ... nên Zalo không giao tin về được. Khi thử tại máy, chạy `bun run --filter=agent zalo:poll`." — chứa "https" và "zalo:poll" dạng lệnh. PASS.
    - E19-chua-bat-1440.png: 3 bước "Tạo bot trong Zalo" nhắc OA «Zalo Bot Manager»; bước 2 "Token có dạng 1234567890:AbC… — không phải Secret Token"; không có ".env", không có "bot.zaloplatforms.com"; ô Bot Token placeholder "1234567890:AbC…" + nút tô đặc xanh "Lưu" (nút tô đặc duy nhất trong ảnh). PASS.
    - E19-chua-webhook-1440.png: cảnh báo cam "Zalo chưa giao tin nhắn về CRM" + nút viền "Đăng ký lại"; KHÔNG còn dòng "Nhận tin qua webhook". PASS.
    - E19-thanh-vien-1440.png: KHÔNG có ô Bot Token nào; thay bằng "Chỉ quản trị viên thay được bot."; dòng "Nhận tin qua webhook" vẫn hiện (bot sống, không phụ thuộc quyền). PASS.
    - E19-chua-noi-375.png: dựng dọc gọn ở 375px, 3 bước như bản 1440, không tràn ngang, nút xanh "Nối Zalo". PASS.
    - E19-ma-cho-375.png: mã "258 863", dòng "Hết hạn lúc 15:40" đọc trọn 1 dòng, KHÔNG có dấu "…". PASS.
    - E19-song-375.png (đã cuộn khối main): nhiều dòng "Chưa nối"/"Đã nối" đọc trọn không bị cắt, ví dụ "Ada Okafor ... Chưa nối", "E19 Ban A ... Đã nối". PASS.
    Không ảnh nào chứa "Zalo: Zalo", "Slack: Slack" hay "bot.uipSwwnr". Mỗi ảnh nhiều nhất một nút tô đặc màu primary; "Gỡ" ở da-noi-1440 là nút viền, không tô đỏ. Tất cả 11/11 assertion PASS.
  network_observed: clean

- eval: E20
  run_id: minted-noi-zalo-cho-nguoi-moi-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_chu_man
  verified_at: 2026-09-24T07:31:57Z
  output: |
    0 fail
    9 expect() calls
    Ran 4 tests across 1 file. [411.00ms]

- eval: E21
  run_id: muf90u2z2wyj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nzm_giu_da_ky
  verified_at: 2026-09-24T07:31:57Z
  output: |
    203 expect() calls
    Ran 66 tests across 2 files. [2.45s]
    test-run: dropped crm_muf90u2z2wyj_test

- eval: E22
  run_id: minted-noi-zalo-cho-nguoi-moi-E22-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nzm_tai_lieu
  verified_at: 2026-09-24T07:31:57Z
  output: |
    tai lieu du 4 dieu

- eval: E23
  run_id: muf90y6ei39p
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_cau_noi_that
  verified_at: 2026-09-24T07:31:57Z
  output: |
    4 expect() calls
    Ran 2 tests across 1 file. [622.00ms]
    test-run: dropped crm_muf90y6ei39p_test

- eval: E24
  run_id: design-gate-42d218c55f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nzm_san_thiet_ke
  verified_at: 2026-09-24T07:31:57Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E25
  run_id: muf910ac6ig4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_goi_nguoc
  verified_at: 2026-09-24T07:31:57Z
  output: |
    7 expect() calls
    Ran 3 tests across 1 file. [319.00ms]
    test-run: dropped crm_muf910ac6ig4_test

- eval: E26
  run_id: muf911c3w1wr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_dang_ky_hong
  verified_at: 2026-09-24T07:31:57Z
  output: |
    7 expect() calls
    Ran 2 tests across 1 file. [363.00ms]
    test-run: dropped crm_muf911c3w1wr_test

- eval: E27
  run_id: muf913bexvdm
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nzm_nhip_tron
  verified_at: 2026-09-24T07:31:57Z
  output: |
    1 expect() calls
    Ran 1 test across 1 file. [322.00ms]
    test-run: dropped crm_muf913bexvdm_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-noi-zalo-cho-nguoi-moi-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-24T07:31:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-noi-zalo-cho-nguoi-moi-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-24T07:31:57Z

- cmd: bun run lint:slop
  run_id: minted-noi-zalo-cho-nguoi-moi-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-24T07:31:57Z

- cmd: bunx turbo run build --force
  run_id: minted-noi-zalo-cho-nguoi-moi-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-24T07:31:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

- E21 — lenh giu-da-ky (script) xanh tren ca hai phia vi day la regression-guard co chu y (khoa hai tep spec da ky khong bi sua), khong phai dau hieu eval khong phan biet duoc feature.
- E24 — design-gate static tren hai trang xanh tren ca hai phia vi day la regression-guard co chu y (chan vi pham token/className), khong phai dau hieu eval khong phan biet duoc feature.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: hợp đồng khởi tạo cho noi-zalo-cho-nguoi-moi — 9 phát hiện ngoài hợp đồng ghi nhận, nay carried sang round này (xem review-findings.md).
Round 3 (hiện tại): 27 eval + 4 lệnh suite (test/lint/lint:slop/build) đều PASS trên commit 43f0c84c; hai sửa của vòng này (14d76573, c31f783d) trên nhánh xử lý xác minh webhook hỏng (zalo-bot-xuong.ts) sinh thêm 4 phát hiện mới ngoài hợp đồng (xem review-findings.md).