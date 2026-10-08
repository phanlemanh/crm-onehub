---
schema_version: 2
feature_slug: da-luu-tru-tai-loi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a392df7f0082084b8c23bd2db691973e7f3701da
human_signoff: Phan Le Manh 2026-10-08
---

# Evidence Report: da-luu-tru-tai-loi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-da-luu-tru-tai-loi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_loi
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 2 tests across 1 file. [913.00ms]

- eval: E2
  run_id: minted-da-luu-tru-tai-loi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_thu_lai
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 1 test across 1 file. [580.00ms]

- eval: E3
  run_id: minted-da-luu-tru-tai-loi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_van_loi
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 1 test across 1 file. [847.00ms]

- eval: E4
  run_id: minted-da-luu-tru-tai-loi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_dang_tai
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 2 tests across 1 file. [967.00ms]

- eval: E5
  run_id: minted-da-luu-tru-tai-loi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_khong_quan_tri
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 1 test across 1 file. [504.00ms]

- eval: E6
  run_id: minted-da-luu-tru-tai-loi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlt_do_man
  verified_at: 2026-10-08T12:40:28Z
  screenshot: evidence/E6-step1.png
  observed: |
    loi-1440 (step1): trang Giai đoạn thoả thuận cuộn tới cuối, ba thẻ nhóm (Đang mở, Chốt được, Không thành) còn hiện; dưới cùng là khung viền liền "Không tải được danh sách giai đoạn đã lưu trữ / Kiểm tra kết nối rồi thử lại." với nút "Thử lại" bật, nằm trọn trong khổ 1440, không có biểu ngữ lỗi cả trang. loi-375 (step2): cùng khung lỗi ở khổ 375, khung và nút nằm trong 0..375, không tràn ngang.
    dang-thu-lai-1440 (step3): khung lỗi còn nguyên, nút "Thử lại" mờ đi (bị khoá), không có khung xương đang tải, ba thẻ vẫn hiện. thu-lai-1440 (step4): khung lỗi biến mất, dòng gập "Đã lưu trữ (1)" hiện ở cuối, ba thẻ nhóm vẫn hiện, trang không tải lại. Khớp với Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: design-gate-32cd6ca57f
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_hoi_quy
  verified_at: 2026-10-08T12:40:28Z
  output: |
    Ran 22 tests across 1 file. [2.04s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-da-luu-tru-tai-loi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-da-luu-tru-tai-loi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-da-luu-tru-tai-loi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-da-luu-tru-tai-loi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bunx turbo run lint --force
  run_id: minted-da-luu-tru-tai-loi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bun run lint:slop
  run_id: minted-da-luu-tru-tai-loi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

- cmd: bunx turbo run build --force
  run_id: minted-da-luu-tru-tai-loi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T12:40:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Không có eval không-phân-biệt được liệt kê: evals.yaml không đổi từ lần đo baseline cuối (round 1). Các lệnh suite xanh cả hai phía là lớp chắn hồi quy bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E7 đều đạt, không eval nào hỏng; các lệnh suite hồi quy đều xanh.
Round 2: E1-E7 đều đạt trên cây a392df7f sau khi gộp onehub; các lệnh suite hồi quy đều xanh; không eval nào hỏng.
