---
schema_version: 2
feature_slug: ke-hoach-la-mot-ban-ghi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dec1d667e3d2dd9c745d2aad72ce7e86ab8c0660
human_signoff: Phan Le Manh 2026-09-22 — ký Cổng Bằng chứng trên verdict PASS của vòng chấm 1 (20/20 phép đo và 4 lệnh suite mã thoát 0), với TÁM giới hạn đã khai và một mục mở hợp đồng mới (Ngoài-5, kế hoạch trống không thêm được bước đầu). Chín mục ngoài hợp đồng đã được định đoạt từng mục ở lượt ký này; phạm vi cắt/hoãn đồng ý như đã khai; các quyết định ghi sau Cổng Phạm vi được phê toàn bộ.
---

# Evidence Report: ke-hoach-la-mot-ban-ghi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | test | PASS |
| E17 | AC-15 | ui-check | PASS |
| E18 | AC-15 | test | PASS |
| E19 | AC-5 | test | PASS |
| E20 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: muc9z2yg6ips
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_giao_buoc
  verified_at: 2026-09-22T08:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [329.00ms]
    test-run: dropped crm_muc9z2yg6ips_test

- eval: E2
  run_id: minted-ke-hoach-la-mot-ban-ghi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_xong_lam_song_danh_muc
  verified_at: 2026-09-22T08:00:00Z
  output: |
    11 expect() calls
    Ran 1 test across 1 file. [379.00ms]
    test-run: dropped crm_muc9z3frvj2a_test

- eval: E3
  run_id: muc9z2z26r0z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_doi_han
  verified_at: 2026-09-22T08:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [309.00ms]
    test-run: dropped crm_muc9z2z26r0z_test

- eval: E4
  run_id: muc9z2hienuw
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_them_bo_buoc
  verified_at: 2026-09-22T08:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [814.00ms]
    test-run: dropped crm_muc9z2hienuw_test

- eval: E5
  run_id: muc9z2sppdpi
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_sap_lai
  verified_at: 2026-09-22T08:00:00Z
  output: |
    7 expect() calls
    Ran 1 test across 1 file. [298.00ms]
    test-run: dropped crm_muc9z2sppdpi_test

- eval: E6
  run_id: muc9z2xf00rn
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_doi_cam_trich
  verified_at: 2026-09-22T08:00:00Z
  output: |
    5 expect() calls
    Ran 1 test across 1 file. [320.00ms]
    test-run: dropped crm_muc9z2xf00rn_test

- eval: E7
  run_id: muc9z34luhc4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_thao_tac_rong
  verified_at: 2026-09-22T08:00:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [322.00ms]
    test-run: dropped crm_muc9z34luhc4_test

- eval: E8
  run_id: muc9z37qbx61
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_dong_la_chi_doc
  verified_at: 2026-09-22T08:00:00Z
  output: |
    17 expect() calls
    Ran 1 test across 1 file. [332.00ms]
    test-run: dropped crm_muc9z37qbx61_test

- eval: E9
  run_id: muc9z35o4xth
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_ghi_chu_hai_dong_thoi_gian
  verified_at: 2026-09-22T08:00:00Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [338.00ms]
    test-run: dropped crm_muc9z35o4xth_test

- eval: E10
  run_id: muc9z36v0cau
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_xoa_day_chuyen
  verified_at: 2026-09-22T08:00:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [335.00ms]
    test-run: dropped crm_muc9z36v0cau_test

- eval: E11
  run_id: minted-ke-hoach-la-mot-ban-ghi-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_mo_nhu_thoa_thuan
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [566.00ms]

- eval: E12
  run_id: minted-ke-hoach-la-mot-ban-ghi-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_duong_cu_chuyen_huong
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [4.00ms]

- eval: E13
  run_id: minted-ke-hoach-la-mot-ban-ghi-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_go_dung_nguoi_man
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    4 expect() calls
    Ran 1 test across 1 file. [506.00ms]

- eval: E14
  run_id: muc9zj5txb4t
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_go_dung_nguoi_db
  verified_at: 2026-09-22T08:00:00Z
  output: |
    3 expect() calls
    Ran 1 test across 1 file. [316.00ms]
    test-run: dropped crm_muc9zj5txb4t_test

- eval: E15
  run_id: minted-ke-hoach-la-mot-ban-ghi-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_qua_han_theo_ngay
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [6.00ms]

- eval: E16
  run_id: minted-ke-hoach-la-mot-ban-ghi-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_ve_vet_ke_hoach
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    42 expect() calls
    Ran 2 tests across 1 file. [423.00ms]

- eval: E17
  run_id: minted-ke-hoach-la-mot-ban-ghi-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T08:00:00Z
  screenshot: evidence/E17-ke-hoach-1440.png
  observed: |
    E17-ke-hoach-1440.png (plan sheet, 1440x900, Vietnamese locale): header row shows OM avatar + "One Mount" title + subtitle "Kế hoạch 30 ngày · khuôn E17 Onboarding One Mount · Hồ sơ công ty" + "..." and "X" buttons top-right. Below it a 4-cell band reads exactly "Ngày 7/30 | Bước 0/4 | Im lặng 0 ngày | Cầm trịch manh.phan". Tab bar reads "Bước 4 | Môi giới | Hoạt động" with Bước active. The Bước panel lists 4 rows grouped under "E17 KINH DOANH · ĐÃ XONG 0/2" and "E17 VAN HANH · ĐÃ XONG 0/2": each row has a checkbox, a "Chưa giao" dropdown (or "manh.phan" where assigned), and a due date; the two rows with past due dates ("Ky hop dong khung" 15 thg 9, "Cai dat tai khoan" 18 thg 9) carry a "Quá hạn" badge; the row due today ("Dao tao nen tang", 22 thg 9) shows assignee "manh.phan" instead of "Chưa giao" and carries no Quá hạn badge, confirming a genuinely assigned + non-overdue row alongside two genuinely overdue + unassigned rows.

    E17-thoa-thuan-1440.png (deal sheet, 1440x900): same header shape — OM avatar + title "One Mount - Trien khai nen tang" + subtitle "One Mount" + right-side "Demo booked" stage control, "...", "X". Same 4-cell band position/style directly below header: "Giá trị 500.000đ | Ngày dự kiến chốt — | Ở giai đoạn 5 phút trước | Phụ trách manh.phan". Same tab-bar component/position: "Tổng quan | Cá nhân | Hoạt động | Tác nhân". Confirms items 1-3 of AC-15 (same header layout, same 4-cell strip, same tab bar) match structurally between the two sheet types.

    E17-ke-hoach-375.png (plan sheet, 375x812, Vietnamese locale): same sheet content reflows to the narrow width — header, 4-cell band (labels/values truncate with ellipsis, e.g. "Cầm trị...", "m..."), tabs, and step rows (labels truncate, "Quá h..." abbreviated, dropdowns and dates still visible) all render fully inside the 375px frame with no content bleeding past the right edge and no visible horizontal scrollbar. A DOM check on the live page at 375x812 confirmed document.documentElement.scrollWidth === document.body.scrollWidth === window.innerWidth === 375, i.e. no horizontal overflow.

    All five Expected lines of AC-15 are visible and confirmed; none is missing.
  network_observed: clean

- eval: E18
  run_id: design-gate-47d82d352b design-gate-de158c0e80 design-gate-e773ec0118
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_san_thiet_ke
  verified_at: 2026-09-22T08:00:00Z
  output: |
    "hits": [],
    "findings": []
    }

- eval: E19
  run_id: minted-ke-hoach-la-mot-ban-ghi-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_noi_man_buoc
  verified_at: 2026-09-22T08:00:00Z
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [541.00ms]

- eval: E20
  run_id: muc9zixz593r
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kh1_noi_man_buoc_db
  verified_at: 2026-09-22T08:00:00Z
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [323.00ms]
    test-run: dropped crm_muc9zixz593r_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-ke-hoach-la-mot-ban-ghi-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-22T08:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-ke-hoach-la-mot-ban-ghi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T08:00:00Z

- cmd: bun run lint:slop
  run_id: minted-ke-hoach-la-mot-ban-ghi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T08:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-ke-hoach-la-mot-ban-ghi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T08:00:00Z

## Known limits

- Ngoài-1: thêm bước với bộ phận không có thật hoặc đã lưu trữ trả lỗi 500 thô.
- Ngoài-2: trang kế hoạch cũ không còn đường vào vẫn nằm trong mã, ba bài dom vòng một còn đo nó.
- Ngoài-3: meta PLAN_CHANGE không parse ở biên đọc của API; vết hỏng chỉ hiện câu dự phòng.
- Ngoài-4: kế hoạch quá 100 bước không sắp lại được.
- Ngoài-6: Lên / Xuống ở ranh hai bộ phận có thể không thấy đổi gì trên màn.
- Ngoài-7: E16 không đo quan hệ loại vết → câu.
- Ngoài-8: nhánh âm của E4 là khẳng định luôn đúng.
- Ngoài-9: đối chứng âm của E11 không bấm ra ngoài sheet.
- Ngoài-5 không ghi ở đây: mở hợp đồng mới (kế hoạch trống không thêm được bước đầu).

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — không eval nào có runs > 1; không phát sinh phương sai.

## Iterations

Round 1: tất cả 20 eval (E1–E20) và cả bốn lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) xanh ngay từ vòng đầu tiên — không có vòng sửa nào trước đó.

### Re-pin lần 1 — 2026-09-22, do CI đỏ vì mock next/navigation của E12 sống sang tệp đăng nhập; sửa bài kiểm ở 18ddded2
run_id: repin-20260922T070657Z-92620
sha: 18ddded26be1c1a204d4e2df661aa27669700a88 · suites: 4 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E17

### Re-pin lần 2 — 2026-09-22, do gộp onehub (kit 2.18.1) trước PR lượt 2
run_id: repin-20260922T094919Z-71145
sha: ef99904ce50e884b7b8a4c26b92d0af993582f38 · suites: 4 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E17 · diff chạm vật đo ngoài làn máy: E17 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-10-20, do ghim lại chung sau VK2 (Hỏi-1..5) và gộp onehub fb58ef972
run_id: repin-20261020T130437Z-49516
sha: dec1d667e3d2dd9c745d2aad72ce7e86ab8c0660 · suites: 7 lệnh exit 0 · evals: 19/19 eval máy đạt kỳ vọng · ngoài làn máy: E17 · diff chạm vật đo ngoài làn máy: E17 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
