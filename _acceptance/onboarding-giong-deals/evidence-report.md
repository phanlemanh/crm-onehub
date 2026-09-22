---
schema_version: 2
feature_slug: onboarding-giong-deals
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 448e60f92faccf569618b4d2470d2202923c8931
human_signoff:
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
  run_id: minted-onboarding-giong-deals-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ogd_man_danh_muc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    o=30 khang-dinh=70/70
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-onboarding-giong-deals-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ogd_man_danh_muc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    o=30 khang-dinh=70/70
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-onboarding-giong-deals-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nut_dau_trang
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [485.00ms]

- eval: E3
  run_id: minted-onboarding-giong-deals-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nut_mo_va_khoa
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [649.00ms]

- eval: E5
  run_id: minted-onboarding-giong-deals-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_sap_mac_dinh
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [664.00ms]

- eval: E6
  run_id: minted-onboarding-giong-deals-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_dang_tai
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [542.00ms]

- eval: E7
  run_id: minted-onboarding-giong-deals-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_loi
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [470.00ms]

- eval: E8
  run_id: minted-onboarding-giong-deals-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_o_trong_va_so
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [546.00ms]

- eval: E9
  run_id: minted-onboarding-giong-deals-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_doi_tac_khong_an
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [586.00ms]

- eval: E10
  run_id: minted-onboarding-giong-deals-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_o_chu_mot_dong
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [491.00ms]

- eval: E11
  run_id: minted-onboarding-giong-deals-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_nhan_bo_loc
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [725.00ms]

- eval: E12
  run_id: minted-onboarding-giong-deals-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_tao_xong_mo
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [876.00ms]

- eval: E13
  run_id: mucse2jjihc6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_tao_tra_id
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [314.00ms]
    test-run: dropped crm_mucse2jjihc6_test

- eval: E16
  run_id: minted-onboarding-giong-deals-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_sap_hai_chieu
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [348.00ms]
    test-run: dropped crm_mucse2x2zpv4_test

- eval: E17
  run_id: minted-onboarding-giong-deals-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ogd_trang_thai_trong
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [714.00ms]

- eval: E15
  run_id: design-gate-bd7218edab
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ogd_san_thiet_ke
  verified_at: 2026-09-22T09:00:00+07:00
  output: |
    • khung-tao.tsx: PASS

    All files passed static design verification with 0 P0 findings.

- eval: E14
  run_id: E14-onboarding-giong-deals
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:00:00+07:00
  screenshot: evidence/E14-onboarding-1440-sang.png
  observed: |
    6/6 frame đã mở bằng Read và đối chiếu Expected:

    E14-onboarding-1440-sang.png (light, 1440x900, /crm/onboarding): tiêu đề "30 ngày đầu", nút xanh lá đặc "+ Kế hoạch mới" ở góc phải đầu trang, cùng hàng với tiêu đề. Cách xem đang chọn là "Bảng" (nút "Bảng" viền xanh active). Tiêu đề cột: Đối tác, Tác ở, Im lặng, Bước, Ngày, Bộ phận — không cột nào có dấu ba chấm.

    E14-deals-1440-sang.png (light, 1440x900, /crm/deals): tiêu đề "Thoả thuận", nút xanh lá đặc "+ Thoả thuận mới" ở đúng cùng vị trí góc phải đầu trang, cùng kích thước/padding, cùng icon "+" đặt trước chữ, cùng sắc xanh (#006B4F) như nút onboarding.

    E14-onboarding-1440-toi.png (dark, 1440x900, /crm/onboarding): nền đen, nút "+ Kế hoạch mới" vẫn giữ nguyên nền xanh lá đặc (không đổi theo theme, đúng luật --primary bất biến 2 theme), vị trí và icon giống hệt bản sáng. Tiêu đề cột 30-ngày-đầu vẫn không có dấu ba chấm.

    E14-deals-1440-toi.png (dark, 1440x900, /crm/deals): nút "+ Thoả thuận mới" cùng nền xanh lá đặc, cùng vị trí góc phải đầu trang như bản onboarding tối — khớp màu, khớp icon, khớp cỡ.

    E14-onboarding-375-sang.png (light, 375x812, /crm/onboarding): nút "+ Kế hoạch mới" (nền xanh, chữ trắng) hiện rõ ngay trên màn hình ở góc phải đầu trang, tách biệt hoàn toàn với hàng "Lọc" nằm riêng bên dưới thanh tìm kiếm — nút không nằm lồng trong ô Lọc. Cách xem vẫn là bảng (đúng yêu cầu "onboarding ở cách xem bảng"). Cột "Đối tác/Tác ở/Im lặng" hiển thị, không có dấu ba chấm.

    E14-deals-375-sang.png (light, 375x812, /crm/deals): nút "+ Thoả thuận mới" cũng hiện rõ ngay góc phải đầu trang, tách biệt khỏi hàng "Lọc" riêng bên dưới — cùng cách bố trí như onboarding 375. Vị trí, màu, icon khớp nút onboarding.

    Đối chiếu code (không suy từ ký ức): apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx (component DanhMucHanhDong/TaoKeHoach, dauTrang=true) và apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx (AddButton) đều dùng chung packages/ui Button mặc định (variant primary), cùng Icon Add carbon "inline-start", và cả hai trang page.tsx đặt component trong PageShellActions bên trong PageShellHeader — cùng một khuôn layout nguồn, không phải hai implementation lệch nhau.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mucsdp3eagms
  exit_code: 0
  verified_at: 2026-09-22T09:10:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-onboarding-giong-deals-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:15:00+07:00

- cmd: bun run lint:slop
  run_id: minted-onboarding-giong-deals-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T09:20:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-onboarding-giong-deals-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:25:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E17 và bốn lệnh suite đều PASS trên lượt verify đầu tiên; không cần vòng thứ hai.