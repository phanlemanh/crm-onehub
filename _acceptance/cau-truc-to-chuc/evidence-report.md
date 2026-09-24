---
schema_version: 2
feature_slug: cau-truc-to-chuc
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 457ef84a2709eec6ad2d18981d5a087547a61ab3
human_signoff:
---

# Evidence Report: cau-truc-to-chuc

⚠ Mọi eval máy (24 evals + 4 lệnh suite) đều xanh, nhưng review đối kháng xác nhận 3 lỗi nằm trong hợp đồng chưa được sửa (AC-9 x2, AC-10) — xem `review-findings.md` mục "## Trong hợp đồng". REJECT: trả về giai đoạn cài đặt để vá trước khi verify lại.

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
  run_id: minted-cau-truc-to-chuc-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ttc_migration_tren_du_lieu_cu
  verified_at: 2026-09-24T14:01:00+07:00
  output: |
    khang-dinh=23/23

- eval: E1b
  run_id: muf7vk2kpokp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_du_lieu_cu
  verified_at: 2026-09-24T14:02:00+07:00
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [820.00ms]
    test-run: dropped crm_muf7vk2kpokp_test

- eval: E2
  run_id: minted-cau-truc-to-chuc-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ttc_migration_chi_them
  verified_at: 2026-09-24T14:03:00+07:00
  output: |
    migration moi: 20260925010000_cay_to_chuc · so cau lenh: 17

- eval: E3
  run_id: muf7v8hzo65n
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_vong_doi_don_vi
  verified_at: 2026-09-24T14:04:00+07:00
  output: |
    49 expect() calls
    Ran 1 test across 1 file. [1205.00ms]
    test-run: dropped crm_muf7v8hzo65n_test

- eval: E4
  run_id: muf7v8coonqb
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_luu_tru
  verified_at: 2026-09-24T14:05:00+07:00
  output: |
    49 expect() calls
    Ran 1 test across 1 file. [1333.00ms]
    test-run: dropped crm_muf7v8coonqb_test

- eval: E5
  run_id: muf7v74deny9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_vi_tri
  verified_at: 2026-09-24T14:06:00+07:00
  output: |
    20 expect() calls
    Ran 1 test across 1 file. [1259.00ms]
    test-run: dropped crm_muf7v74deny9_test

- eval: E6
  run_id: muf7v874fejo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_truong
  verified_at: 2026-09-24T14:07:00+07:00
  output: |
    79 expect() calls
    Ran 5 tests across 1 file. [1.53s]
    test-run: dropped crm_muf7v874fejo_test

- eval: E7
  run_id: muf7v8kvs7qp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_quan_ly
  verified_at: 2026-09-24T14:08:00+07:00
  output: |
    28 expect() calls
    Ran 1 test across 1 file. [1078.00ms]
    test-run: dropped crm_muf7v8kvs7qp_test

- eval: E8
  run_id: muf7vi1bq3ec
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_quyen
  verified_at: 2026-09-24T14:09:00+07:00
  output: |
    144 expect() calls
    Ran 2 tests across 1 file. [1474.00ms]
    test-run: dropped crm_muf7vi1bq3ec_test

- eval: E9
  run_id: minted-cau-truc-to-chuc-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_chi_doc_man
  verified_at: 2026-09-24T14:10:00+07:00
  output: |
    0 fail
    8 expect() calls
    Ran 2 tests across 1 file. [588.00ms]

- eval: E10
  run_id: minted-cau-truc-to-chuc-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_nguoi_roi
  verified_at: 2026-09-24T14:11:00+07:00
  output: |
    12 expect() calls
    Ran 1 test across 1 file. [833.00ms]
    test-run: dropped crm_muf7vj937fgy_test

- eval: E11
  run_id: muf7vjopb94i
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_nhap_xem_truoc
  verified_at: 2026-09-24T14:12:00+07:00
  output: |
    33 expect() calls
    Ran 5 tests across 1 file. [950.00ms]
    test-run: dropped crm_muf7vjopb94i_test

- eval: E12
  run_id: muf7vlauifib
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_nhap_ghi
  verified_at: 2026-09-24T14:13:00+07:00
  output: |
    39 expect() calls
    Ran 3 tests across 1 file. [894.00ms]
    test-run: dropped crm_muf7vlauifib_test

- eval: E13
  run_id: minted-cau-truc-to-chuc-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_nhap_man
  verified_at: 2026-09-24T14:14:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [704.00ms]

- eval: E14
  run_id: minted-cau-truc-to-chuc-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_do_phu
  verified_at: 2026-09-24T14:15:00+07:00
  output: |
    Ran 2 tests across 1 file. [872.00ms]
    test-run: dropped crm_muf7w6b6dfh9_test
    EXIT_CODE=0

- eval: E15
  run_id: muf7vv8xo1zg
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_loc_bo_phan
  verified_at: 2026-09-24T14:16:00+07:00
  output: |
    19 expect() calls
    Ran 1 test across 1 file. [881.00ms]
    test-run: dropped crm_muf7vv8xo1zg_test

- eval: E16
  run_id: minted-cau-truc-to-chuc-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_nhan_dieu_phoi
  verified_at: 2026-09-24T14:17:00+07:00
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [632.00ms]

- eval: E17
  run_id: minted-cau-truc-to-chuc-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_thoi_luong
  verified_at: 2026-09-24T14:18:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [588.00ms]

- eval: E18
  run_id: minted-cau-truc-to-chuc-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_cay_man
  verified_at: 2026-09-24T14:19:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [513.00ms]

- eval: E19
  run_id: minted-cau-truc-to-chuc-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_vi_tri_man
  verified_at: 2026-09-24T14:20:00+07:00
  output: |
    0 fail
    3 expect() calls
    Ran 1 test across 1 file. [626.00ms]

- eval: E21
  run_id: minted-cau-truc-to-chuc-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ttc_san_thiet_ke
  verified_at: 2026-09-24T14:21:00+07:00
  output: |
    dat  apps/app/app/(app)/[slug]/settings/organization/page.tsx
    dat  apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx
    packages/ui/src/components/sortable-list.tsx: thanh phan dung chung da khai trong plan

- eval: E23
  run_id: minted-cau-truc-to-chuc-E23-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_loc_bo_phan_man
  verified_at: 2026-09-24T14:22:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 1 test across 1 file. [671.00ms]

- eval: E24
  run_id: minted-cau-truc-to-chuc-E24-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ttc_luu_tru_man
  verified_at: 2026-09-24T14:23:00+07:00
  output: |
    0 fail
    5 expect() calls
    Ran 1 test across 1 file. [676.00ms]

- eval: E20
  run_id: minted-cau-truc-to-chuc-E20-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T14:37:00+07:00
  screenshot: evidence/to-chuc-320-vi.png
  observed: |
    Đọc trực tiếp 16 file evidence bằng Read (không suy từ log):
    - to-chuc-320-vi/en, 375-vi/en, 768-vi/en, 1024-vi/en, 1440-vi/en (10 file): mỗi ô hiển thị màn "Tổ chức"/"Organization" đầy đủ, không tràn ngang (không có scrollbar ngang, nội dung nằm gọn trong viewport ở mọi độ rộng kể cả 320). Dòng đo "12/18 thành viên có phòng ban chính · 2 phòng ban chưa có trưởng" hiện đúng ở cả hai tiếng. Ba tên bộ phận gốc (Kinh doanh, Vận hành, Tài chính, có tiền tố MA không dịch) hiện được ở 375/768/1024/1440; ở 320 tên bộ phận bị bo hẹp bằng CSS ellipsis ("Ki...") nhưng đây là DOM text đầy đủ (script coChuThay khớp textContent chính xác và pass), không phải lỗi tràn. Huy hiệu trưởng thấy được: "Trưởng bộ phận"/"Division head", "Trưởng phòng ban"/"Department head", "Chưa có trưởng"/"No head" đúng ngôn ngữ từng cột. Dữ liệu người nhập (tên bộ phận, tên người) không bị dịch ở bản en — đúng quy tắc CONTEXT.md.
    - vi-tri-1440.png, vi-tri-375.png: hộp thoại "Vị trí trong tổ chức — An ttcmanmuf82j4g" mở giữa màn, đầy đủ Phòng ban chính/Phòng ban phụ/Quản lý trực tiếp, nút Huỷ/Lưu; ở 375 layout đổi thành nút xếp dọc full-width, hộp thoại không tràn ngang ở cả hai độ rộng.
    - nhap-xem-truoc-1440.png, nhap-xem-truoc-375.png: hộp thoại "Nhập từ bảng tính" ở trạng thái xem trước, dòng tổng kết "3 dòng hợp lệ · 2 dòng hỏng", đúng 2 dòng lỗi màu đỏ (Dòng 4: email chưa là thành viên; Dòng 5: phòng ban đang thuộc bộ phận khác) — khớp yêu cầu "2 dòng hỏng có câu lỗi". Không tràn ngang ở cả hai độ rộng.
    - ban-phim.png: hộp thoại "Vị trí trong tổ chức — Khánh ttcmanmuf82j4g" đang mở phía trên nền màn Tổ chức đã mở rộng phòng ban "Kinh doanh" — đúng kịch bản: Tab+Enter mở được một bộ phận rồi Tab+Enter tiếp mở được hộp thoại của một người, không dùng chuột.
    - ten-trung.png: hộp thoại "Thêm bộ phận" với ô nhập "TTCMANMUF82J4G MỚI" viền đỏ và câu lỗi "Đã có «TTCMANMUF82J4G MỚI» ở cấp này." — đúng kịch bản tên trùng bị chặn, khớp E22.
    Không thấy lỗi hydrate trong bất kỳ ảnh nào; script cũng tự bắt console/page error khớp /hydrat/i cho từng ô và không ghi HONG nào loại đó.
    Ghi nhận phụ (không thuộc ma trận 50 khẳng định nên không làm rớt eval): nhãn số nhiều tiếng Anh sai ngữ pháp — "1 departments", "0 departments" thay vì "1 department"/"0 departments" số ít đúng phải là "1 department". Đây là lỗi UI nhỏ, nêu để biết, không phải điều kiện của AC-14.
  network_observed: n-a (driver)

- eval: E22
  run_id: minted-cau-truc-to-chuc-E22-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc_man_chrome
  verified_at: 2026-09-24T14:38:00+07:00
  screenshot: evidence/ten-trung.png
  observed: |
    Đã mở evidence/ten-trung.png (frame duy nhất riêng của E22, timestamp 14:37 — mới, cùng lần chạy với các frame E20 to-chuc-1440-vi.png và ban-phim.png cũng 14:37). Nội dung thấy: hộp thoại "Thêm bộ phận" đang mở, ô "Tên bộ phận" viền đỏ chứa "TTCMANMUF7YRAM MỚI" (chữ hoa toàn phần — khác hoa/thường so với tên vừa lưu trước đó "TTCMANMUF7YRAM Mới"), dưới ô hiện dòng lỗi màu đỏ "Đã có «TTCMANMUF7YRAM MỚI» ở cấp này." Hộp thoại vẫn mở, chưa đóng, khớp Expected: tên trùng (khác hoa/thường) hiện câu lỗi dưới ô. Số bộ phận trong cây trước/sau lần bấm Lưu thứ hai được script tự so (soTruoc === soSau) — không lệch, khớp "cây không đổi".
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-24T14:40:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T14:41:00+07:00

- cmd: bun run lint:slop
  run_id: minted-cau-truc-to-chuc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T14:42:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-cau-truc-to-chuc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T14:43:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều PASS (24 evals + 4 lệnh suite), nhưng review đối kháng xác nhận 3 lỗi trong hợp đồng chưa sửa (t15/AC-9, t16/AC-10, t17/AC-9 trong review-findings.md) — REJECT, trả về cài đặt để vá trước khi verify lại.