---
schema_version: 2
feature_slug: quan-ly-danh-muc-30-ngay
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
human_signoff: Phan Le Manh 2026-09-21
verified_commit: 4a5860be42cb8935c2727d1e05ceaea9a655ac38
---

# Evidence Report: quan-ly-danh-muc-30-ngay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | ui-check | PASS |
| E14 | AC-14 | test | PASS |

## Evidence

- eval: E1
  run_id: mub77bef37en
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_khong_khop
  verified_at: 2026-09-21T00:00:00Z
  output: |
    Ran 2 tests across 1 file. [348.00ms]

    test-run: dropped crm_mub77bef37en_test

- eval: E2
  run_id: mub77alfj7oj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_tim_ten_cong_ty
  verified_at: 2026-09-21T00:00:00Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [231.00ms]
    test-run: dropped crm_mub77alfj7oj_test

- eval: E3
  run_id: mub77ab4qzax
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_sap_toan_tap
  verified_at: 2026-09-21T00:00:00Z
  output: |
     17 expect() calls
    Ran 1 test across 1 file. [465.00ms]
    test-run: dropped crm_mub77ab4qzax_test

- eval: E4
  run_id: mub77aohpkad
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_phan_trang
  verified_at: 2026-09-21T00:00:00Z
  output: |
     21 expect() calls
    Ran 2 tests across 1 file. [744.00ms]
    test-run: dropped crm_mub77aohpkad_test

- eval: E5
  run_id: mub77avebits
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_loc_va_dem
  verified_at: 2026-09-21T00:00:00Z
  output: |
     21 expect() calls
    Ran 1 test across 1 file. [331.00ms]
    test-run: dropped crm_mub77avebits_test

- eval: E6
  run_id: minted-quan-ly-danh-muc-30-ngay-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_duong_dan
  verified_at: 2026-09-21T00:00:00Z
  output: |
     0 fail
     19 expect() calls
    Ran 2 tests across 1 file. [451.00ms]

- eval: E7
  run_id: mub77arzp7tx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_bang_cot_buoc
  verified_at: 2026-09-21T00:00:00Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [237.00ms]

- eval: E8
  run_id: mub77a5skx87
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_bang_cot_bo_phan
  verified_at: 2026-09-21T00:00:00Z
  output: |
     3 expect() calls
    Ran 1 test across 1 file. [188.00ms]
    test-run: dropped crm_mub77a5skx87_test

- eval: E9
  run_id: mub77ahjeb8k
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_bang_cot_bac
  verified_at: 2026-09-21T00:00:00Z
  output: |
     10 expect() calls
    Ran 1 test across 1 file. [211.00ms]
    test-run: dropped crm_mub77ahjeb8k_test

- eval: E10
  run_id: mub779u4zcup
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_bang_cot_trang_thai
  verified_at: 2026-09-21T00:00:00Z
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [194.00ms]
    test-run: dropped crm_mub779u4zcup_test

- eval: E11
  run_id: minted-quan-ly-danh-muc-30-ngay-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_the_chi_de_xem
  verified_at: 2026-09-21T00:00:00Z
  output: |
     0 fail
     12 expect() calls
    Ran 2 tests across 1 file. [397.00ms]

- eval: E12
  run_id: minted-quan-ly-danh-muc-30-ngay-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_tran_cot
  verified_at: 2026-09-21T00:00:00Z
  output: |
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [323.00ms]

- eval: E13
  run_id: minted-quan-ly-danh-muc-30-ngay-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-21T00:00:00Z
  screenshot: _acceptance/quan-ly-danh-muc-30-ngay/evidence/E13-bang-1440.png
  observed: |
    Đọc từng frame đã lưu bằng Read (ảnh thật, không suy từ lệnh):
    E13-bang-1440.png: trang "First 30 days", có ô "Search partners", hai nút lọc trạng thái "Running 14"/"Closed 3", nút "Filters", "Sort", "Columns (6)", toggle "Table"/"Board" (Table đang chọn). Tiêu đề cột có mũi tên sắp xếp: "Partner ↑↓", "Stuck on", "Silent ↑↓", "St... ↑↓", "Day ↑↓", "Department". 14 hàng dữ liệu hiện đủ, gồm cả hàng vừa gieo (E13 Đối tác 1-4, E13v2 Doi tac 1-4).
    E13-bang-768.png: cùng dạng bảng, ảnh rộng đúng 768px (không tràn ngang) — cột "Partner" và "Stuck on" tự xuống dòng khi tên dài (vd "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ" xuống 4 dòng, không bị cắt "...").
    E13-cot-buoc-1440.png / -768.png: toggle "Board" chọn, tab "Stuck step" chọn. Cột có tiêu đề kèm số đếm: "Ky hop dong E13v2 (1)", "Ký hợp đồng (2)", "Ký hợp đồng E13 (4)", "Duyet ho so E13v2 (1)", "Đào tạo đội môi giới"... mỗi cột có thẻ tên đối tác + phụ đề bộ phận/silent.
    E13-cot-bo-phan-1440.png / -768.png: tab "Department" chọn. Cột: "Kinh doanh (2)", "Đào tạo (2)", "Vận hành nền tảng (1)", "Ngân quỹ E13 (4)", "Phap ly E13v2 (2)"... thẻ đầy trong từng cột.
    E13-cot-bac-1440.png / -768.png: tab "Broker stage" chọn. 5 cột đều có 3 thẻ: "No account yet (3)", "Has an account (3)", "Finished the course (3)", "Active (3)", "Made a deal (3)" — đúng 5 người gieo ở 5 bậc khác nhau.
    E13-cot-trang-thai-1440.png / -768.png: tab "Status" chọn. "Running (14)" và "Closed (3)" đều có thẻ (Closed có Monzo, E13v2 Doi tac 5, E13 Đối tác 5 — kế hoạch tôi đóng qua API nằm đúng cột).
    Tất cả ảnh -768 đều là file PNG rộng đúng 768px (kiểm bằng `file`), tức trang không tràn ngang; bảng-cột cuộn trong khung riêng có viền rõ (cột kế bị cắt bởi khung, không đẩy toàn trang rộng ra).
  network_observed: n-a (driver)

- eval: E14
  run_id: mub77lioxneu
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.qldm_bang_cot_khong_phan_trang
  verified_at: 2026-09-21T00:00:00Z
  output: |
    Ran 1 test across 1 file. [269.00ms]
    test-run: dropped crm_mub77lioxneu_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mub778udihkv
  exit_code: 0
  verified_at: 2026-09-21T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-21T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-21T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-quan-ly-danh-muc-30-ngay-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-21T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này

none — baseline không đo lại round này (n-a cho toàn bộ eval máy)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1) round này

## Iterations

Round 1: REJECT — sentinel cột "Đã xong mọi bước" (COT_XONG) bị gộp trùng với tên bước thật "xong", gây sai nhãn cột trên bảng. Quay lại triển khai.
Round 2: E1-E14 đều PASS; bốn lệnh suite (test, lint, lint:slop, build) đều xanh; verdict PASS.
