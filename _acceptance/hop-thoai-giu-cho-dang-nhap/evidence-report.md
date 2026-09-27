---
schema_version: 2
feature_slug: hop-thoai-giu-cho-dang-nhap
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5d05ae308d410b85854e64675e64c9be78bc9435
human_signoff:
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

## Evidence

- eval: E1
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E1-r1
  exit_code: 0
  verifier: config:executors.test.hg_bam_ngoai
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E2
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E2-r1
  exit_code: 0
  verifier: config:executors.test.hg_hoi_lai
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E3
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E3-r1
  exit_code: 0
  verifier: config:executors.test.hg_sheet
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E4
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E4-r1
  exit_code: 0
  verifier: config:executors.test.hg_drawer
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E5
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E5-r1
  exit_code: 0
  verifier: config:executors.test.hg_may_dong
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E6
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E6-r1
  exit_code: 0
  verifier: config:executors.test.hg_lop_con
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

- eval: E7
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hg_tu_khai
  verified_at: 2026-09-27T04:15:46Z
  output: |
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [532.00ms]

- eval: E8
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hg_confirm_chung
  verified_at: 2026-09-27T04:15:46Z
  output: |
     0 fail
     590 expect() calls
    Ran 101 tests across 1 file. [496.00ms]

- eval: E9
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hg_huy_qua_nut_dong
  verified_at: 2026-09-27T04:15:46Z
  output: |
    huy: 26/26 tep, 0 vi pham, 27 nut qua nut dong
    huy: khai tay 1 tep ngoai bo rut may
    huy: phan hien trong ngan apps/app/components/detail-sheet.tsx: 0 vi pham, 1 nut qua nut dong

- eval: E10
  run_id: crm_compassionate_hofstadter_928035_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hg_man_that
  verified_at: 2026-09-27T04:15:46Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/compassionate-hofstadter-928035/.acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/hg-kr-giu.png
  observed: |
    Đọc trực tiếp cả 8 file ảnh vừa lưu bằng Read, đối chiếu Expected:
    - hg-kr-giu.png: hộp "Thêm KR" còn mở, ô "Tên KR" hiển thị đúng chữ đã gõ «Buổi gặp khách hàng mới» (KHÔNG lạc sang ô Đơn vị đo như lần chấm trước), không có alertdialog. Khớp Expected bước 1 — xác nhận bug selector round 1 đã được sửa.
    - hg-hoi-lai-1440.png: alertdialog đúng chữ «Bỏ những gì vừa nhập?» / phụ đề «Những gì bạn vừa nhập trong hộp này sẽ mất.» / hai nút «Tiếp tục sửa» và «Bỏ» (viền xanh + nút đỏ). Khớp Expected bước 2.
    - hg-deal-huy.png: cùng alertdialog «Bỏ những gì vừa nhập?» hiện ra sau khi bấm «Huỷ» trên ngăn «Tạo thoả thuận» đã gõ tên. Khớp Expected bước 3.
    - hg-drawer-390.png (khổ 390): alertdialog dạng bottom-sheet mobile «Bỏ những gì vừa nhập?» với «Bỏ» (đỏ, trên) và «Tiếp tục sửa» (viền xanh, dưới) hiện sau Esc trong drawer «Trao đổi». Khớp Expected bước 4.
    - hg-drawer-vuot-390.png: PIXEL GIỐNG HỆT hg-drawer-390.png (MD5 trùng) — cùng alertdialog hiện ra sau khi kéo tay nắm drawer 320px bằng touchscreen thật rồi thả. Đây là kết quả hợp lý: bộ giữ chặn drag-to-close, kéo về đúng vị trí nghỉ trước khi hỏi lại, nên ảnh cuối giống bước 4. Các khẳng định vị trí/nội dung/khả năng bấm được (vitri trong viewport, giá trị textarea còn, elementFromPoint đúng ô) được script tự kiểm bằng JS evaluate độc lập với ảnh và đều qua (buoc 5: dat). Khớp Expected bước 5.
    - hg-kr-chi-doi-o-chon.png: hộp «Sửa KR» còn mở sau khi bấm ra ngoài; ô «Kiểu» đã đổi sang «Giảm xuống» (khác giá trị ban đầu), hộp vẫn giữ giá trị mới đó (kèm cảnh báo hợp lệ phụ vì đích>khởi điểm — không phải lỗi của bộ giữ). Khớp Expected bước 6 (ca 1/3).
    - hg-muc-tieu-chi-doi-o-chon.png: hộp «Sửa mục tiêu» còn mở, ô «Loại» đổi sang «Tham vọng». Khớp Expected bước 6 (ca 2/3).
    - hg-don-vi-chi-doi-o-chon.png: hộp «Chuyển Phòng Kinh doanh … sang» còn mở, ô chọn đơn vị đích giữ giá trị đã chọn. Khớp Expected bước 6 (ca 3/3).
    Log lệnh in đủ «buoc 1: dat» … «buoc 6: dat», dòng cuối «man-giu-cho: dat» rồi «phien-do: xong — mã 0»; không có dòng «loi console app» (script tự theo dõi pageerror/console.error nội bộ, không phát hiện lỗi nào).
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hg_san_thiet_ke
  verified_at: 2026-09-27T04:15:46Z
  output: |
     0 fail
     38 expect() calls
    Ran 17 tests across 2 files. [104.00ms]

- eval: E12
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E12-r1
  exit_code: 0
  verifier: config:executors.test.hg_o_loc
  verified_at: 2026-09-27T03:47:29Z
  carried_from_round: 1
  note: carry-forward từ round 1 — delta không chạm paths của eval

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-27T04:15:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-27T04:15:46Z

- cmd: bun run lint:slop
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-27T04:15:46Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-27T04:15:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline không đo lại round này

none — danh sách "không phân biệt" trống; baseline không đo lại ở round này (mọi eval máy ghi baseline: n-a), nên không có eval nào bị xếp loại green-on-both round này. Lệnh suite (test/lint/lint:slop/build) xanh cả hai phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — nút X trên hộp "Sửa KR" đóng thẳng không qua bộ giữ (không hỏi lại), và bug selector khiến bước gõ tên lạc sang ô "Đơn vị đo". Returned to implementation.
Round 2: E7, E8, E9, E11 chạy lại và E10 đo lại trên màn thật đều đạt (bug nút X và bug selector đã sửa); E1–E6, E12 carry-forward từ round 1 (delta không chạm paths của các eval đó); toàn bộ lệnh suite (test/lint/lint:slop/build) xanh. Verdict: PASS.