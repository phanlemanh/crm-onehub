---
schema_version: 2
feature_slug: ly-do-tu-choi-nop-theo-locale
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 58a3cd1e0ed8f90dafc2c52608e3cccaa9bc4bc1
human_signoff:
---

# Evidence Report: ly-do-tu-choi-nop-theo-locale

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2c_vi
  verified_at: 2026-10-09T02:52:19Z
  output: |
    Ran 1 test across 1 file. [2.04s]

- eval: E2
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2c_en
  verified_at: 2026-10-09T02:52:19Z
  output: |
    Ran 1 test across 1 file. [2.06s]

- eval: E3
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2c_ngoai
  verified_at: 2026-10-09T02:52:19Z
  output: |
    Ran 4 tests across 1 file. [1.65s]

- eval: E4
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2c_mot_nguon
  verified_at: 2026-10-09T02:52:19Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2c_gia_tri
  verified_at: 2026-10-09T02:52:19Z
  output: |
    KET LUAN: 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2c_ban_do
  verified_at: 2026-10-09T02:52:19Z
  output: |
    Ran 134 tests across 1 file. [1219.00ms]

- eval: E7
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2c_dot_bien
  verified_at: 2026-10-09T02:52:19Z
  output: |
    dot-bien: 5/5 vet bi bat, tep tra lai nguyen

- eval: E8
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2c_ranh_gioi
  verified_at: 2026-10-09T02:52:19Z
  output: |
    ranh-gioi: 44 tep, 0 ngoai (neo nhanh-mo)

- eval: E9
  run_id: minted-ly-do-tu-choi-nop-theo-locale-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2c_man
  verified_at: 2026-10-09T02:52:19Z
  screenshot: evidence/E9-tu-choi-vi-390.png
  observed: |
    Đã mở từng ảnh bằng Read. Ba khổ vi-390, vi-1440, en-1440 và bản tải lại của mỗi khổ đều có dòng hệ thống tu-choi đúng ngôn ngữ: vi "Kara nộp bản nháp chưa được — chu kỳ đã rời pha «Lập kế hoạch»", en "Kara could not submit the draft — the cycle has left Planning"; không lộ tên mã hay giá trị mã.
    Dòng vi giữ y hệt sau tải lại (transcript đọc từ bản lưu); ảnh chiều đỏ ở thư mục chạy riêng hiển thị tên mã thô, đúng lỗi cần bắt. Tất cả khớp Expected, không có mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    6 ảnh trong evidence/ (vi-390, vi-1440, en-1440 và bản tải lại); mỗi lượt đạt; chiều đỏ bắt được lỗ mã máy, tệp trả lại nguyên.
    Driver là puppeteer trong man.mjs, không đọc được network; ghi chú ở evidence/E9-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bunx turbo run lint --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bun run lint:slop
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

- cmd: bunx turbo run build --force
  run_id: minted-ly-do-tu-choi-nop-theo-locale-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T02:52:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E9 đều đạt, bảy lệnh suite hồi quy xanh. Chuyển sang Cổng Bằng chứng.
