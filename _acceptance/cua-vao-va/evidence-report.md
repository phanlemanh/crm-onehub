---
schema_version: 2
feature_slug: cua-vao-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 77ca8466b8f4c1811411348d879271b9936b155c
human_signoff: Phan Le Manh 2026-10-05
---

# Evidence Report: cua-vao-va

Round 2. 16 eval máy đều xanh (14 test/script, 2 ui-check có ảnh chụp đã mở xem). 7 lệnh suite hồi quy đều xanh. Không có eval judgment nên không có hội đồng chấm.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | ui-check | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | script | PASS |
| E15 | AC-13 | script | PASS |
| E16 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cua-vao-va-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_doc_phien_api
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun run test -- "cd apps/api && bun test test/cua-vao-va.spec.ts -t doc-phien"
    test-run: dropped crm_muuh9aizeskc_test

- eval: E2
  run_id: minted-cua-vao-va-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_ba_lop_api
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun run test -- "cd apps/api && bun test test/cua-vao-va.spec.ts -t ba-lop"
    test-run: dropped crm_muuh9c0lu3nz_test

- eval: E3
  run_id: minted-cua-vao-va-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_cong_khai_api
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun run test -- "cd apps/api && bun test test/cua-vao-va.spec.ts -t cong-khai"
    test-run: dropped crm_muuh999b4f1z_test

- eval: E4
  run_id: minted-cua-vao-va-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_proxy_503
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && bun test ./test/onboarding-gate.spec.ts -t doc-503
    Ran 1 test across 1 file. [56.00ms]

- eval: E5
  run_id: minted-cua-vao-va-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_trang_loi_dom
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cua-vao-va.dom.tsx -t trang-loi
    chạy xong, mã thoát 0 (chung một lệnh với E6)

- eval: E6
  run_id: minted-cua-vao-va-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_trang_loi_dom
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cua-vao-va.dom.tsx -t trang-loi
    chạy xong, mã thoát 0 (chung một lệnh với E5)

- eval: E7
  run_id: minted-cua-vao-va-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1f_do_man
  verified_at: 2026-10-04T23:53:48Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-step1.png (375x812): nền đen, giữa màn hình có tiêu đề «Hệ thống đang trục trặc», câu «Phiên của bạn vẫn còn — bạn chưa bị đăng xuất...», nút xanh «Thử lại» nằm trong khung nhìn; không có header hay thanh điều hướng, không có chữ «Application error». Chỉ có huy hiệu dev của Next ở góc dưới trái, không thuộc nội dung trang.
    E7-step2.png (1440x900): cùng nội dung, tiêu đề, câu hai dòng và nút «Thử lại» căn giữa, không header. E7-step3.png (1440x900) sau khi gỡ lỗi và bấm Thử lại: khung ứng dụng đầy đủ (thanh bên icon, header trên cùng), tiêu đề «Chào bạn», không còn tiêu đề lỗi, nội dung đang tải. Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E8
  run_id: minted-cua-vao-va-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1f_do_man
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/cua-vao-va/rang/do-man.mjs"
    các dòng lớp API của lần đo (workspace.get, settings.researchKey, đối chứng trước khi gây lỗi) đều DUNG, mã thoát 0

- eval: E9
  run_id: minted-cua-vao-va-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1f_logo_dom
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cua-vao-va.dom.tsx -t logo
    Ran 1 test across 1 file. [419.00ms]

- eval: E10
  run_id: minted-cua-vao-va-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1f_do_man
  verified_at: 2026-10-04T23:53:48Z
  screenshot: evidence/E10-step1.png
  observed: |
    quen-mat-khau-375.png (nháp, 375x812): logo OneHub nằm ngay trên tiêu đề «Quên mật khẩu», trong khung, không có thanh cuộn ngang; bên dưới là mô tả, ô «Địa chỉ email», nút xanh «Gửi liên kết», liên kết «Quay lại đăng nhập».
    Ba ảnh còn lại: bản 1440 của trạng thái nháp có hai cột và logo ở cột phải trên tiêu đề; hai ảnh «đã gửi» (375 và 1440) có logo trên tiêu đề «Kiểm tra hộp thư», trong khung nhìn, không tràn ngang. Hai trạng thái khác nhau thật (tiêu đề đổi). Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-cua-vao-va-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1f_dang_xuat
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && bun test ./test/sign-out.spec.ts
    Ran 4 tests across 1 file. [6.00ms]

- eval: E12
  run_id: minted-cua-vao-va-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1f_messages_guard
  verified_at: 2026-10-04T23:53:48Z
  output: |
    cd apps/app && bun test test/messages-guard.spec.ts
    Ran 131 tests across 1 file. [1098.00ms]

- eval: E13
  run_id: minted-cua-vao-va-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1f_soi_ma_neo
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun _acceptance/cua-vao-va/rang/soi-ma-neo.mjs
    KET LUAN 6 DUNG, 0 SAI — mã thoát 0

- eval: E14
  run_id: minted-cua-vao-va-E14-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1f_thuoc_cu_xanh
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun _acceptance/cua-vao-va/rang/thuoc-cu-xanh.mjs
    KET LUAN 21 DUNG, 0 SAI — mã thoát 0

- eval: E15
  run_id: minted-cua-vao-va-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1f_san_thiet_ke
  verified_at: 2026-10-04T23:53:48Z
  output: |
    design-gate.mjs (static) trên sáu tệp, rồi rang/khong-ghi-de.mjs
    KET LUAN 10 DUNG, 0 SAI — mã thoát 0

- eval: E16
  run_id: minted-cua-vao-va-E16-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1f_noi_goi_dang_xuat
  verified_at: 2026-10-04T23:53:48Z
  output: |
    bun _acceptance/cua-vao-va/rang/noi-goi-dang-xuat.mjs
    KET LUAN 4 DUNG, 0 SAI — mã thoát 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cua-vao-va-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-cua-vao-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cua-vao-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cua-vao-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-va-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bun run lint:slop
  run_id: minted-cua-vao-va-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

- cmd: bunx turbo run build --force
  run_id: minted-cua-vao-va-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T23:53:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline diffBase, chứng minh bộ đo chứ chưa chứng minh tính năng): E11 (sign-out.spec.ts) và E12 (messages-guard.spec.ts). Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là răng hồi quy có chủ ý. Các eval còn lại đều đỏ trên baseline (có phân biệt) hoặc không có baseline chạy được (E7, E8, E10).

## Variance

none — every multi-run eval is uniform (mọi eval chỉ chạy một lần, không có eval ngẫu nhiên)

## Iterations

Round 1: E14 BLOCKED (thiếu gói zod trong worktree, lỗi môi trường chứ không phải lỗi code); 15 eval còn lại xanh; lệnh suite `--filter=api` đỏ 2 ca cũ về khoá API hỏng, không gắn eval. Returned to implementation: khoá API hỏng vẫn trả 401 và ba-lop đọc metadata router (commit 96892e969).
Round 2: 16/16 eval và 7/7 lệnh suite xanh, verdict PASS.

### Re-pin lần 1 — 2026-10-05, do gộp onehub e9f8ed2f (#260, #262) trước khi merge #261
run_id: repin-20261005T043446Z-73088
sha: 77ca8466b8f4c1811411348d879271b9936b155c · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E7, E10
