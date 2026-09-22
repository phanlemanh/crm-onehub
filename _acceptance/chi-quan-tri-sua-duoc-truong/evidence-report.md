---
schema_version: 2
feature_slug: chi-quan-tri-sua-duoc-truong
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 18ddded26be1c1a204d4e2df661aa27669700a88
human_signoff: Phan Le Manh 2026-09-22
---

# Evidence Report: chi-quan-tri-sua-duoc-truong

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
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chi-quan-tri-sua-duoc-truong-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_ham_quyen
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 5 tests across 1 file. [143.00ms]

- eval: E2
  run_id: muc2nerrgvp1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_member_bi_chan
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     46 expect() calls
    Ran 1 test across 1 file. [799.00ms]
    test-run: dropped crm_muc2nerrgvp1_test

- eval: E3
  run_id: minted-chi-quan-tri-sua-duoc-truong-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_quan_tri_lam_duoc
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     46 expect() calls
    Ran 1 test across 1 file. [991.00ms]
    test-run: dropped crm_muc2ndnfoye6_test

- eval: E4
  run_id: muc2ner4832v
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_member_doc_duoc
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     7 expect() calls
    Ran 1 test across 1 file. [582.00ms]
    test-run: dropped crm_muc2ner4832v_test

- eval: E5
  run_id: muc2ndhc7zxv
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_access
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     9 expect() calls
    Ran 1 test across 1 file. [618.00ms]
    test-run: dropped crm_muc2ndhc7zxv_test

- eval: E6
  run_id: minted-chi-quan-tri-sua-duoc-truong-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_man_khoa
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     0 fail
     9 expect() calls
    Ran 3 tests across 1 file. [571.00ms]

- eval: E7
  run_id: minted-chi-quan-tri-sua-duoc-truong-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cqt_sheet_khoa
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     0 fail
     6 expect() calls
    Ran 1 test across 1 file. [496.00ms]

- eval: E8
  run_id: muc2ndzfh3np
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cqt_fields_hoi_quy
  verified_at: 2026-09-22T09:15:00+07:00
  output: |
     53 expect() calls
    Ran 23 tests across 1 file. [511.00ms]

- eval: E9
  run_id: minted-chi-quan-tri-sua-duoc-truong-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:15:00+07:00
  screenshot: _acceptance/chi-quan-tri-sua-duoc-truong/evidence/E9-admin-1440.png
  observed: |
    Đọc trực tiếp 6 frame PNG bằng Read + kiểm DOM qua Claude_Browser (không đoán từ trí nhớ):
    E9-admin-1440.png: trang Cài đặt > Trường, avatar "E" (admin), KHÔNG có dòng khoá; nút
    "Trường mới" màu xanh sáng, chữ trắng đậm. E9-member-1440.png: cùng trang, avatar "M"
    (member); CÓ dòng "Cần quyền quản trị để đổi trường của cả đội." ngay dưới tab Công
    ty/Cá nhân/Thoả thuận; nút "Trường mới" màu xanh mờ/nhạt, chữ xám — khác hẳn màu sáng
    của bản admin. E9-admin-768.png / E9-member-768.png: cùng nội dung tương ứng ở khổ 768,
    không thấy thanh cuộn ngang hay nội dung tràn khỏi viền màn hình. E9-bảng-admin-1440.png
    / E9-bảng-member-1440.png: bảng Trường mở từ hồ sơ công ty — bản admin không có dòng
    khoá + nút sáng; bản member có dòng khoá + nút mờ. Bổ sung DOM assertion qua
    Claude_Browser: nút "Trường mới" member disabled=true, admin disabled=false; khổ 768
    document.documentElement.scrollWidth === clientWidth === 768 cho cả hai vai — không
    tràn ngang. Cả 6 frame đều đọc được, không frame nào thiếu hay trắng.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-chi-quan-tri-sua-duoc-truong-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-22T09:15:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-chi-quan-tri-sua-duoc-truong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:15:00+07:00

- cmd: bun run lint:slop
  run_id: minted-chi-quan-tri-sua-duoc-truong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T09:15:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-chi-quan-tri-sua-duoc-truong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:15:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E8 — pass trên cả HEAD lẫn baseline (chạy toàn bộ `apps/api/test/fields.spec.ts` sau khi
đổi lời gọi sang dạng có `actingUserId`; bài kiểm cũ đã chứng ở vòng trường-tự-tạo-ở-cài-đặt
trước đây, không đặc trưng cho khoá quyền của vòng này). Giữ như regression-guard có chủ ý
cho hồi quy của bộ trường tự tạo, không cần viết lại — hành vi khoá quyền mới đã được E1–E7
kiểm riêng và đều đỏ trên baseline (có phân biệt).

## Variance

none — không có eval nào khai `runs` > 1; toàn bộ deterministic và đồng nhất qua các lần chạy.

## Iterations

Round 1: E1–E9 đều PASS ngay vòng đầu, cùng bốn lệnh suite (test/lint/lint:slop/build) đều
exit 0; không có sửa lại giữa các vòng.

### Re-pin lần 1 — 2026-09-22, do lượt ke-hoach-la-mot-ban-ghi sửa bài kiểm của hồ sơ (d-21, d-23) và dời màn hồ sơ kế hoạch sang PlanSheet
run_id: repin-20260922T065429Z-21311
sha: 2b389d3c924a29785f9250584bbae77718359592 · suites: 4 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 2 — 2026-09-22, do CI đỏ vì mock next/navigation của E12 sống sang tệp đăng nhập; sửa bài kiểm ở 18ddded2
run_id: repin-20260922T070657Z-92620
sha: 18ddded26be1c1a204d4e2df661aa27669700a88 · suites: 4 lệnh exit 0 · evals: 8/8 eval máy đạt kỳ vọng · ngoài làn máy: E9 · AC không có chốt máy: AC-9
