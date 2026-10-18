---
schema_version: 2
feature_slug: hop-thoai-giu-cho-dang-nhap
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6e3d4c62116ca1cc0a4db4d18851f873814b448a
human_signoff: Manh Phan 2026-09-27
---

# Evidence Report: hop-thoai-giu-cho-dang-nhap

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-14 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_bam_ngoai
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [564.00ms]

- eval: E2
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_hoi_lai
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    14 expect() calls
    Ran 8 tests across 1 file. [790.00ms]

- eval: E3
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_sheet
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [766.00ms]

- eval: E4
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_drawer
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    10 expect() calls
    Ran 9 tests across 1 file. [5.33s]

- eval: E5
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_may_dong
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    7 expect() calls
    Ran 7 tests across 1 file. [759.00ms]

- eval: E6
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_lop_con
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    6 expect() calls
    Ran 3 tests across 1 file. [732.00ms]

- eval: E7
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_tu_khai
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    3 expect() calls
    Ran 3 tests across 1 file. [596.00ms]

- eval: E8
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E8-r2
  exit_code: 0
  verifier: config:executors.script.hg_confirm_chung
  verified_at: 2026-09-27T04:15:46Z
  carried_from_round: 2
  carry-forward tu round 2 — delta khong cham paths cua eval.

- eval: E9
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hg_huy_qua_nut_dong
  verified_at: 2026-09-27T06:02:12Z
  output: |
    huy: 26/26 tep, 0 vi pham, 27 nut qua nut dong
    huy: khai tay 1 tep ngoai bo rut may
    huy: phan hien trong ngan apps/app/components/detail-sheet.tsx: 0 vi pham, 1 nut qua nut dong

- eval: E10
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E10-r3
  exit_code: 0
  verifier: config:executors.script.hg_man_that
  verified_at: 2026-09-27T06:02:12Z
  screenshot: .acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/hg-kr-giu.png
  observed: |
    Đọc trực tiếp 8 file PNG vừa ghi (mtime 13:05–13:06 hôm nay) trong .acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/:
    - hg-kr-giu.png: hộp "Thêm KR" 1440px còn mở, ô Tên KR còn chữ "Buổi gặp khách hàng mới" sau khi bấm góc lớp phủ — khớp Expected bước 1.
    - hg-hoi-lai-1440.png: alertdialog "Bỏ những gì vừa nhập?" / "Những gì bạn vừa nhập trong hộp này sẽ mất." với hai nút "Tiếp tục sửa" và "Bỏ" (đỏ) — đúng cả ba cụm chữ Expected.
    - hg-deal-huy.png: cùng alertdialog "Bỏ những gì vừa nhập?" hiện sau khi bấm Huỷ ở ngăn Thoả thuận mới — khớp bước 3.
    - hg-drawer-390.png: khổ 390 (mobile, nút xếp dọc), alertdialog "Bỏ những gì vừa nhập?" hiện trên drawer sau Esc — khớp bước 4.
    - hg-drawer-vuot-390.png: cùng alertdialog, cùng bố cục pixel-for-pixel với hg-drawer-390.png (md5 giống hệt) — nhất quán vì dialog xác nhận luôn render đè kín ở cùng vị trí bất kể kéo Esc hay kéo tay nắm 320px; assertion DOM (getBoundingClientRect nằm trong viewport, giá trị ô trao đổi còn, elementFromPoint bấm lại được) đã tự kiểm bên trong script và đều đạt — không mâu thuẫn với Expected.
    - hg-kr-chi-doi-o-chon.png: hộp "Sửa KR" còn mở sau khi đổi Kiểu sang "Giảm xuống" rồi bấm ra ngoài (chỉ đổi một ô chọn, có lỗi validate phụ "Đích phải nhỏ hơn khởi điểm" do đổi chiều KR — không phải lỗi test).
    - hg-muc-tieu-chi-doi-o-chon.png: hộp "Sửa mục tiêu" còn mở sau khi đổi Loại sang "Tham vọng".
    - hg-don-vi-chi-doi-o-chon.png: hộp "Chuyển Phòng Kinh doanh … sang" còn mở, ô chọn giữ giá trị "Khối Kinh doanh …" mới.
    Tất cả khớp Expected, không frame nào mâu thuẫn.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hg_san_thiet_ke
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    38 expect() calls
    Ran 17 tests across 2 files. [109.00ms]

- eval: E12
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_o_loc
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    10 expect() calls
    Ran 10 tests across 1 file. [919.00ms]

- eval: E13
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_da_luu
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    5 expect() calls
    Ran 5 tests across 1 file. [572.00ms]

- eval: E14
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_ngan_ban_ghi
  verified_at: 2026-09-27T06:02:12Z
  output: |
    0 fail
    10 expect() calls
    Ran 5 tests across 1 file. [1100.00ms]

- eval: E15
  run_id: crm_compassionate_hofstadter_928035_do (green, app :4317/api :4410) + crm_hg_chieu_do_do (red mutant, app :4341/api :4641)
  exit_code: 0
  verifier: config:executors.script.hg_man_ban_ghi
  verified_at: 2026-09-27T06:02:12Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/compassionate-hofstadter-928035/.acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/E15-step2-truoc-bam-ngoai.png
  observed: |
    Đã đọc trực tiếp cả hai frame đã lưu bằng Read (ảnh), đối chiếu Expected:
    - E15-step2-truoc-bam-ngoai.png (= hg-ngan-ban-ghi-tu-luu.png, chụp TRƯỚC khi bấm ngoài): ngăn chi tiết liên hệ "Lan gjezixn Võ" đang mở trên nền /contacts; ô "Chức danh" trong khối CHI TIẾT hiện giá trị đã sửa "Trưởng phòng mua hàng" (đúng TEN.chucDanh kịch bản gieo qua tRPC) — tức là đã bấm tên trên danh sách để mở ngăn, đã sửa ô tự lưu, rời ô và chờ lưu xong, đúng như Expected mô tả trước khi bấm góc lớp phủ.
    - E15-step2-sau-bam-ngoai.png (= hg-ngan-ban-ghi-da-dong.png, chụp SAU khi bấm góc lớp phủ): màn đã quay lại danh sách "Cá nhân" đầy đủ (bảng 1–25/53), ngăn chi tiết đã biến mất hoàn toàn, không có hộp thoại hỏi lại (alertdialog) nào che màn; hàng "Lan gjezixn Võ" trong bảng hiện cột "Chức danh" = "Trưởng phòng mua hàng", khớp giá trị đã lưu — xác nhận ngăn đóng ngay và giữ đúng thay đổi tự lưu, không mất dữ liệu, không hỏi lại. Hai frame khớp hoàn toàn với Expected, không mâu thuẫn.
    Log real-run (không phải suy diễn) in đúng "buoc 7: dat" và "man-giu-cho: dat", không có dòng "loi console app" (nghĩa là 0 lỗi console).
    Chiều đỏ (--chieu-do-ngan, bản sao worktree tạm có detail-sheet.tsx bị gỡ tuNhanThayDoi={false}) in đúng "buoc 7: ngan khong dong sau khi o tu luu (con=1, hoi=0)" rồi "man-giu-cho: hong 1", và chieuDo() kết luận ghim đúng dòng "buoc 7: ngan khong dong sau khi o tu luu" — xác nhận assertion bước 7 THẬT SỰ nhạy với hồi quy (không phải test rỗng). Worktree tạm của chiều đỏ đã được dọn sạch (git worktree prune đã chạy trong finally của script).
    MÔI TRƯỜNG DEV SERVER: không server nào được người verify tự khởi; toàn bộ app+api+DB do chính phien-do.mjs (qua tien-de.mjs) tự dựng trên cổng tự do và tự tắt khi xong — không server nào cần tắt tay, không chiếm cổng của ai khác.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mujewjvrv245
  exit_code: 0
  verified_at: 2026-09-27T06:02:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-27T06:02:12Z

- cmd: bun run lint:slop
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-27T06:02:12Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-27T06:02:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Bốn lệnh suite (test, lint, lint:slop, build) là regression-guard chạy mỗi vòng, không liệt kê ở đây.

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) trong vòng này; mọi eval là deterministic (runs=1, pass_rate không áp dụng).

## Iterations

Round 1: round-tally ghi REJECT (kỳ vọng 16, trả về 16, chặn 0) — bộ giữ dùng chung mới thêm chưa qua hết các đường đóng ở vòng triển khai đầu. Quay lại triển khai.
Round 2: round-tally ghi PASS (kỳ vọng 9, trả về 9) — toàn bộ eval khai ở vòng đó xanh; sau đó Cổng Bằng chứng của Manh Phan mở lại phạm vi thêm AC-13, AC-14 (contract Notes, sổ d-20260927T053525Z-16..18).
Round 3 (vòng này): E1-E9, E11-E15 xanh (E8 carry-forward từ round 2, delta không chạm paths của eval); bốn lệnh suite xanh; AC-13, AC-14 có phép đo mới (E13, E14, E15) và đạt.

### Re-pin lần 1 — 2026-09-27, do hoá cũ do gộp onehub (#169, #170) trước khi mở PR
run_id: repin-20260927T063135Z-87968
sha: d3e206a26c0905c77187dc45065ac746f555c3cc · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E15 · AC không có chốt máy: AC-10

### Re-pin lần 2 — 2026-09-27, do hoá cũ do gộp onehub (#168) sau khi mở PR
run_id: repin-20260927T064247Z-42463
sha: d6f32ed0324c03d6980771fe1c8d195322b50765 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E15 · AC không có chốt máy: AC-10

### Re-pin lần 3 — 2026-09-30, do vỏ Sheet của khung-tao-okr-nhu-deal và gộp onehub
run_id: repin-20260930T071334Z-96398
sha: 21b20e9fc9789a48272e69d636391a3544ec3e95 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E15 · diff chạm vật đo ngoài làn máy: E10, E15 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

### Re-pin lần 4 — 2026-09-30, do gộp onehub (#219) trước khi gộp PR #220
run_id: repin-20260930T092244Z-63714
sha: 097ed193fc1146aa3fc297ea4ac73d019ee57f78 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E15 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

### Re-pin lần 5 — 2026-10-18, do DA4 du-an-gantt: code Dự án, Lịch làm việc, răng HG đổi; 10 hồ sơ, trần 150′, bỏ DH2 (răng DH2 gãy sau gộp) theo Điều phối
run_id: repin-20261018T002421Z-44023
sha: 6e3d4c62116ca1cc0a4db4d18851f873814b448a · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E15 · diff chạm vật đo ngoài làn máy: E10, E15 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
