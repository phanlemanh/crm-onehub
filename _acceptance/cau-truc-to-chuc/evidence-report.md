---
schema_version: 2
feature_slug: cau-truc-to-chuc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e7ce10a3c802b132528a6424414258aa60302bc6
human_signoff:
---

# Evidence Report: cau-truc-to-chuc

> PASS: toàn bộ 24 eval + 4 lệnh suite hồi quy thoát mã 0 (không có lệnh nào không gắn eval bị fail, không có review nào bị bỏ sót). review-findings.md ghi 1 phát hiện đã map vào hợp đồng (mục "## Trong hợp đồng", AC-10 — hiệu năng nhập lô) và các phát hiện ngoài-hợp-đồng (mới + carried từ round 1-2) chờ người quyết ở Cổng Bằng chứng.

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
  run_id: minted-cau-truc-to-chuc-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_migration_tren_du_lieu_cu
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
    khang-dinh=23/23

- eval: E1b
  run_id: mufa1gjsikdf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_du_lieu_cu
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     15 expect() calls
    Ran 1 test across 1 file. [1316.00ms]
    test-run: dropped crm_mufa1gjsikdf_test

- eval: E2
  run_id: minted-cau-truc-to-chuc-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_migration_chi_them
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
    migration moi: 20260925010000_cay_to_chuc · so cau lenh: 17

- eval: E3
  run_id: mufa1hcqcp70
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vong_doi_don_vi
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     49 expect() calls
    Ran 1 test across 1 file. [1.55s]
    test-run: dropped crm_mufa1hcqcp70_test

- eval: E4
  run_id: mufa1hc3h9y0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_luu_tru
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
    49 expect() calls
    Ran 1 test across 1 file. [1.72s]
    test-run: dropped crm_mufa1hc3h9y0_test

- eval: E5
  run_id: mufa1h8v6nmx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vi_tri
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     20 expect() calls
    Ran 1 test across 1 file. [1290.00ms]
    test-run: dropped crm_mufa1h8v6nmx_test

- eval: E6
  run_id: mufa1h89gt00
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_truong
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     79 expect() calls
    Ran 5 tests across 1 file. [2.05s]
    test-run: dropped crm_mufa1h89gt00_test

- eval: E7
  run_id: mufa1h2dtvlw
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_quan_ly
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     28 expect() calls
    Ran 1 test across 1 file. [1319.00ms]
    test-run: dropped crm_mufa1h2dtvlw_test

- eval: E8
  run_id: mufa1jdojsm0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_quyen
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     144 expect() calls
    Ran 2 tests across 1 file. [1391.00ms]
    test-run: dropped crm_mufa1jdojsm0_test

- eval: E9
  run_id: minted-cau-truc-to-chuc-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_chi_doc_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     8 expect() calls
    Ran 2 tests across 1 file. [1256.00ms]

- eval: E10
  run_id: mufa1hbctpgk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nguoi_roi
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     12 expect() calls
    Ran 1 test across 1 file. [1178.00ms]
    test-run: dropped crm_mufa1hbctpgk_test

- eval: E11
  run_id: mufa1rwk89a6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_xem_truoc
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     36 expect() calls
    Ran 6 tests across 1 file. [936.00ms]
    test-run: dropped crm_mufa1rwk89a6_test

- eval: E12
  run_id: mufa1v39d73r
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_ghi
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     68 expect() calls
    Ran 6 tests across 1 file. [1270.00ms]
    test-run: dropped crm_mufa1v39d73r_test

- eval: E13
  run_id: minted-cau-truc-to-chuc-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhap_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [719.00ms]

- eval: E14
  run_id: mufa21rnkwma
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_do_phu
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     32 expect() calls
    Ran 2 tests across 1 file. [1068.00ms]
    test-run: dropped crm_mufa21rnkwma_test

- eval: E15
  run_id: mufa227ax7nf
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_loc_bo_phan
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     19 expect() calls
    Ran 1 test across 1 file. [1029.00ms]
    test-run: dropped crm_mufa227ax7nf_test

- eval: E16
  run_id: minted-cau-truc-to-chuc-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_nhan_dieu_phoi
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [734.00ms]

- eval: E17
  run_id: minted-cau-truc-to-chuc-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_thoi_luong
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [615.00ms]

- eval: E18
  run_id: minted-cau-truc-to-chuc-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_cay_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [652.00ms]

- eval: E19
  run_id: minted-cau-truc-to-chuc-E19-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_vi_tri_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [665.00ms]

- eval: E20
  run_id: ttcmanmufa877n
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T16:00:00+07:00
  screenshot: evidence/to-chuc-320-vi.png
  observed: |
    Đọc trực tiếp 6 frame đại diện bằng Read (ảnh thật, không đoán từ log):
    - to-chuc-1440-vi.png: màn "Tổ chức" đủ 3 bộ phận (ttcmanmufa877n Kinh doanh/Vận hành/Tài chính), mỗi bộ phận có huy hiệu "Trưởng bộ phận"/"Trưởng phòng ban" thấy rõ, khối "Chưa xếp vào bộ phận" chứa phòng "Pháp chế" (1 phòng ban chưa xếp đúng khai), không tràn ngang.
    - to-chuc-320-en.png: ở 320px chữ dài bị truncate ("ttcmanmufa877n …") nhưng không đẩy tràn ngang, badge "Department h..."/"No division head" vẫn thấy được.
    - vi-tri-1440.png & vi-tri-375.png: hộp thoại "Vị trí trong tổ chức" mở giữa màn, nằm hoàn toàn trong viewport ở cả hai độ rộng, không tràn ngang.
    - nhap-xem-truoc-1440.png: hộp thoại "Nhập từ bảng tính" ở bước xem trước hiện đúng "3 dòng hợp lệ · 2 dòng hỏng", 2 dòng đỏ có câu lỗi cụ thể (dòng 4 "chưa là thành viên", dòng 5 "đang thuộc bộ phận khác"), không tràn ngang.
    - ten-trung.png: tạo bộ phận trùng tên (khác hoa/thường) hiện câu lỗi "Đã có «TTCMANMUFA877N MỚI» ở cấp này." ngay dưới ô, hộp thoại không đóng.
    - ban-phim.png: sau khi chỉ dùng Tab+Enter, một phòng ban đã mở (viền lấy nét xanh trên combo "ttcmanmufa877n Vùng 1") và hộp thoại vị trí của một người ("Khánh ttcmanmufa877n") đã mở — khớp bước 6.
    Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E21
  run_id: minted-cau-truc-to-chuc-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_san_thiet_ke
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
    dat  apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx
    dat  apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx
    packages/ui/src/components/sortable-list.tsx: thanh phan dung chung da khai trong plan

- eval: E22
  run_id: ttc_man_chrome-E22-2026-09-24T15:38
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T16:00:00+07:00
  screenshot: evidence/ten-trung.png
  observed: |
    evidence/ten-trung.png (fresh, timestamp 15:38, produced by my own run — not reused from a stale/other file): dialog "Thêm bộ phận" ở 1440px, tiếng Việt. Ô "Tên bộ phận" chứa "TTCMANMUFA53YU MỚI" (chữ hoa, trùng tên bộ phận vừa tạo ở bước lưu trước đó nhưng khác hoa/thường), viền ô đỏ (trạng thái lỗi), và ngay dưới ô hiện câu lỗi màu đỏ "Đã có «TTCMANMUFA53YU MỚI» ở cấp này." Khớp Expected: "ten trung khac hoa thuong -> cau loi duoi o". Assertion thứ hai (số bộ phận không đổi, soSau === soTruoc) và assertion đầu (bộ phận mới "TTCMANMUFA53YU MỚI" có mặt trong cây sau khi lưu, trước khi thử tên trùng) không có ảnh riêng — được kiểm bằng code trong chính script (kiem("E22: bo phan moi khong hien", coMoi) và kiem("E22: ten trung khong bao loi hoac cay doi", coLoi && soSau === soTruoc)) và cả hai đã PASS vì không có dòng "HONG E22:..." nào trong stdout và mã thoát bằng không. Server: không server nào do tôi start -> không server nào bị tắt. Cổng 3710/3711 vẫn để nguyên, đang chạy, dùng chung với các phiên chấm khác (kể cả E20).
  network_observed: n-a (driver)

- eval: E23
  run_id: minted-cau-truc-to-chuc-E23-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_loc_bo_phan_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [743.00ms]

- eval: E24
  run_id: minted-cau-truc-to-chuc-E24-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttc_luu_tru_man
  verified_at: 2026-09-24T16:00:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [703.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-24T16:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-24T16:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-24T16:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-24T16:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Không có eval nào được liệt kê "không-phân-biệt" ở round này (danh sách rỗng).

## Variance

none — every multi-run eval is uniform (không eval nào khai `runs > 1` ở round này; mọi eval là deterministic, runs=1, không mixed pass_rate).

## Iterations

Round 1: baseline (diffBase) và các finding ngoài-hợp-đồng carried được chốt trước round này — xem "Carried từ round 1" trong review-findings.md; không có dữ liệu chi tiết round 1 khác được truyền vào round này.
Round 2: 24 eval + 4 lệnh suite hồi quy đều exit 0 (không eval nào fail máy); verdict tổng REJECT vì 2 finding "Trong hợp đồng" xác nhận vi phạm AC-9 (order-dependency của nhập lô, loại lỗi "phòng ban hai bộ phận") và AC-14 (thiếu translate="no" cho ô hiển thị tên người) — xem review-findings.md.
Round 3: 24 eval + 4 lệnh suite hồi quy đều exit 0; 2 eval ui-check (E20, E22) đọc lại 6 frame ảnh bằng Read, không frame nào mâu thuẫn Expected. review-findings.md ghi 1 finding mới map vào hợp đồng dưới AC-10 (hiệu năng nhập lô, `to-chuc.service.ts:491`) cùng các finding ngoài-hợp-đồng mới + carried từ round 1-2 — verdict PASS.
