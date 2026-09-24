---
schema_version: 2
feature_slug: cau-truc-to-chuc
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 954eccaf8c7e0e58f6163c1a82a7ee29d5232376
human_signoff:
---

# Evidence Report: cau-truc-to-chuc

> REJECT không phát sinh từ eval máy (`failed_evals` rỗng — 24 eval + 4 lệnh suite hồi quy đều thoát mã 0) mà từ hai phát hiện review đã map vào hợp đồng ở `review-findings.md`, mục "## Trong hợp đồng": một lỗi phụ thuộc thứ tự dòng trái với AC-9 (nhập lô, loại lỗi "phòng ban hai bộ phận") và một ô hiển thị tên người thiếu `translate="no"` trái với AC-14. Xem review-findings.md để tái hiện.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-4 | test | PASS |
| E19 | AC-6 | test | PASS |
| E20 | AC-14 | ui-check | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-2 | ui-check | PASS |
| E23 | AC-12 | test | PASS |
| E24 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cau-truc-to-chuc-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_migration_tren_du_lieu_cu
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    khang-dinh=23/23

- eval: E1b
  run_id: muf8y15cgqek
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_du_lieu_cu
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     15 expect() calls
    Ran 1 test across 1 file. [1125.00ms]
    test-run: dropped crm_muf8y15cgqek_test

- eval: E2
  run_id: minted-cau-truc-to-chuc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_migration_chi_them
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    migration moi: 20260925010000_cay_to_chuc · so cau lenh: 17

- eval: E3
  run_id: muf8y0j5lgg8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vong_doi_don_vi
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     49 expect() calls
    Ran 1 test across 1 file. [1329.00ms]
    test-run: dropped crm_muf8y0j5lgg8_test

- eval: E4
  run_id: muf8ybsvnouy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_luu_tru
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    Ran 1 test across 1 file. [1104.00ms]
    test-run: dropped crm_muf8ybsvnouy_test
    EXIT_CODE=0

- eval: E5
  run_id: muf8y1wmfq2x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vi_tri
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    Ran 1 test across 1 file. [1030.00ms]
    test-run: dropped crm_muf8y1wmfq2x_test

- eval: E6
  run_id: minted-cau-truc-to-chuc-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_truong
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     79 expect() calls
    Ran 5 tests across 1 file. [1.81s]

- eval: E7
  run_id: muf8y1vhqome
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_quan_ly
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     28 expect() calls
    Ran 1 test across 1 file. [1068.00ms]
    test-run: dropped crm_muf8y1vhqome_test

- eval: E8
  run_id: minted-cau-truc-to-chuc-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_quyen
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     144 expect() calls
    Ran 2 tests across 1 file. [1.52s]
    test-run: dropped crm_muf8y2t4z15s_test

- eval: E9
  run_id: minted-cau-truc-to-chuc-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_chi_doc_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     8 expect() calls
    Ran 2 tests across 1 file. [628.00ms]

- eval: E10
  run_id: muf8y1qv19gd
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nguoi_roi
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     12 expect() calls
    Ran 1 test across 1 file. [1021.00ms]
    test-run: dropped crm_muf8y1qv19gd_test

- eval: E11
  run_id: muf8ycxdddgd
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_xem_truoc
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    36 expect() calls
    Ran 6 tests across 1 file. [988.00ms]
    test-run: dropped crm_muf8ycxdddgd_test

- eval: E12
  run_id: muf8yoibairp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_ghi
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    Ran 5 tests across 1 file. [1128.00ms]
    test-run: dropped crm_muf8yoibairp_test
    EXIT_CODE=0

- eval: E13
  run_id: minted-cau-truc-to-chuc-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [676.00ms]

- eval: E14
  run_id: muf8yijpwncg
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_do_phu
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     32 expect() calls
    Ran 2 tests across 1 file. [943.00ms]
    test-run: dropped crm_muf8yijpwncg_test

- eval: E15
  run_id: muf8ykqw7t6w
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_loc_bo_phan
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     19 expect() calls
    Ran 1 test across 1 file. [883.00ms]
    test-run: dropped crm_muf8ykqw7t6w_test

- eval: E16
  run_id: minted-cau-truc-to-chuc-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhan_dieu_phoi
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [707.00ms]

- eval: E17
  run_id: minted-cau-truc-to-chuc-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_thoi_luong
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [662.00ms]

- eval: E18
  run_id: minted-cau-truc-to-chuc-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_cay_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [556.00ms]

- eval: E19
  run_id: minted-cau-truc-to-chuc-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vi_tri_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [698.00ms]

- eval: E20
  run_id: minted-cau-truc-to-chuc-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T09:00:00+07:00
  screenshot: evidence/to-chuc-320-vi.png
  observed: |
    To-chuc-320-vi/en: cây tổ chức render đủ, thẻ trạng thái "Đang tra cứu 8"/"Enriching 8" ở góc phải trên, huy hiệu "Trưởng bộ phận"/"Division head" và "Trưởng phòng ban"/"Department head" hiện trên đúng dòng người được gán trưởng; tên bộ phận bị CSS ellipsis cắt hiển thị ở 320px nhưng DOM textContent vẫn đầy đủ (đúng cái script kiểm — presence, không phải đọc được bằng mắt); không thấy scrollbar ngang, ảnh full-page không có phần bị cắt lởm. to-chuc-375-vi/en: cùng cây nhưng đủ rộng để hiện tên bộ phận đầy đủ ("Kinh doanh", "Vận hành", "Tài chính" + MA prefix), 3 tên bộ phận đều thấy được, không tràn ngang. to-chuc-768-vi/en và 1024-vi/en: sidebar cài đặt đầy đủ menu bên trái ("Tổ chức" đang chọn), nội dung cây nằm hết trong viewport, không có scrollbar ngang. to-chuc-1440-vi: cây đầy đủ 3 bộ phận (Kinh doanh, Vận hành, Tài chính) + nhóm "Chưa xếp vào bộ phận" (Pháp chế), badge trưởng hiện rõ trên An/Bình/Chi/Khánh/Giang. to-chuc-1440-en: giống vi nhưng đã có thêm bộ phận "ttcmanmuf92waw Mới" (0 departments) — đúng vì bước E22 (thêm bộ phận) xảy ra ở lượt tieng=vi trước, rồi màn en của cùng rộng 1440 mới chụp nên state đã cập nhật; không phải lỗi. vi-tri-1440.png và vi-tri-375.png: hộp thoại "Vị trí trong tổ chức — An/Khánh ttcmanmuf92waw" mở giữa màn hình, đủ 3 khối (Phòng ban chính / Phòng ban phụ / Quản lý trực tiếp) + nút Huỷ/Lưu, không tràn ngang ở cả hai độ rộng (ở 375 các nút xếp full-width theo cột dọc, vẫn nằm trong viewport). nhap-xem-truoc-1440.png và -375.png: hộp thoại "Nhập từ bảng tính" hiện đúng "3 dòng hợp lệ · 2 dòng hỏng", đúng 2 dòng lỗi liệt kê rõ câu chữ (Dòng 4: email chưa là thành viên; Dòng 5: phòng ban đang thuộc bộ phận khác) — khớp yêu cầu "dán lố 5 dòng có 2 dòng hỏng"; bảng preview không tràn ngang ở cả 2 độ rộng. ban-phim.png: hộp thoại vị trí của "Khánh ttcmanmuf92waw" đã mở, ô "Phòng ban chính" có viền focus xanh — đúng luồng Tab/Enter mở phòng ban rồi Enter trên người mở hộp thoại, không dùng chuột.
  network_observed: n-a (driver)

- eval: E21
  run_id: minted-cau-truc-to-chuc-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_san_thiet_ke
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
    dat  apps/app/app/(app)/[slug]/settings/organization/page.tsx
    dat  apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx
    packages/ui/src/components/sortable-list.tsx: thanh phan dung chung da khai trong plan

- eval: E22
  run_id: minted-cau-truc-to-chuc-E22-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T09:00:00+07:00
  screenshot: evidence/ten-trung.png
  observed: |
    Đọc trực tiếp file evidence/ten-trung.png (mới ghi ở 15:07, cùng lượt chạy này, không phải ảnh cũ): hộp thoại 'Thêm bộ phận' đang mở, ô 'Tên bộ phận' viền đỏ chứa chuỗi trùng tên đã viết hoa (dạng '<MA> MỚI' viết hoa toàn bộ — MA là mã lượt chạy sinh động ttcmanmuf90jka), ngay dưới ô là dòng chữ đỏ 'Đã có «<MA> MỚI» ở cấp này.' — đúng câu lỗi kỳ vọng. Không thấy bộ phận nào bị thêm/đổi trong hộp thoại (soTruoc==soSau đã được script xác nhận bằng DOM trước khi chụp). Khớp Expected: tên trùng hiện câu lỗi dưới ô, cây không đổi.
  network_observed: n-a (driver)

- eval: E23
  run_id: minted-cau-truc-to-chuc-E23-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_loc_bo_phan_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [757.00ms]

- eval: E24
  run_id: minted-cau-truc-to-chuc-E24-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_luu_tru_man
  verified_at: 2026-09-24T09:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [735.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-24T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Không có eval nào được liệt kê "không-phân-biệt" ở round này (danh sách rỗng).

## Variance

none — không có eval nào khai `runs > 1` ở round này (mọi eval là deterministic, runs=1, không mixed pass_rate).

## Iterations

Round 1: baseline (diffBase) và các finding ngoài-hợp-đồng carried được chốt trước round này — xem "Carried từ round 1" trong review-findings.md; không có dữ liệu chi tiết round 1 khác được truyền vào round này.
Round 2: 24 eval + 4 lệnh suite hồi quy đều exit 0 (không eval nào fail máy); verdict tổng REJECT vì 2 finding "Trong hợp đồng" xác nhận vi phạm AC-9 (order-dependency của nhập lô, loại lỗi "phòng ban hai bộ phận") và AC-14 (thiếu translate="no" cho ô hiển thị tên người) — xem review-findings.md.