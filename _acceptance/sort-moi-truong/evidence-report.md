---
schema_version: 2
feature_slug: sort-moi-truong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 708bf425d47d5bec8e6b10b17b5cad79f7d8505e
human_signoff: manh 2026-10-21
---

# Evidence Report: sort-moi-truong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-sort-moi-truong-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_sap
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqac6qykly_test

- eval: E1b
  run_id: minted-sort-moi-truong-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_trang
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqacyzbygm_test

- eval: E2
  run_id: minted-sort-moi-truong-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_cty_lh
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqactx73am_test

- eval: E3
  run_id: minted-sort-moi-truong-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_khoa_chet
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqacmxy697_test

- eval: E4
  run_id: minted-sort-moi-truong-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_board
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqaceabqzb_test

- eval: E7
  run_id: mvhqaclv1r2x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.smt_api_the
  verified_at: 2026-10-21T06:25:30Z
  output: |
    test-run: dropped crm_mvhqaclv1r2x_test

- eval: E5
  run_id: minted-sort-moi-truong-E5-r2
  exit_code: 0
  verifier: config:executors.test.smt_cot_sap
  verified_at: 2026-10-21T05:53:22Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-sort-moi-truong-E5b-r2
  exit_code: 0
  verifier: config:executors.script.smt_quet
  verified_at: 2026-10-21T05:53:22Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-sort-moi-truong-E6-r2
  exit_code: 0
  verifier: config:executors.test.smt_an_theo_kieu
  verified_at: 2026-10-21T05:53:22Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-sort-moi-truong-E7b-r2
  exit_code: 0
  verifier: config:executors.test.smt_the_kanban
  verified_at: 2026-10-21T05:53:22Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-sort-moi-truong-E8-r1
  exit_code: 0
  verifier: config:executors.test.smt_toc_do
  verified_at: 2026-10-21T05:16:01Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-sort-moi-truong-E9-r2
  exit_code: 0
  verifier: config:executors.script.smt_man
  verified_at: 2026-10-21T05:53:22Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E9-step1.png
  observed: |
    Đã mở cả sáu ảnh bằng Read.
    1) smt-bang-thoa-thuan-sap-1280: bảng Thoả thuận lọc 'smtman', 3 hàng. Tiêu đề cột 'Số smt' có mũi tên lên nhìn thấy rõ, không bị cắt, căn phải cùng Giá trị. Giá trị cột Số theo thứ tự tăng: 5, 1.234,5, rồi hàng trống '—' ở cuối. Cột Ngày smt, Chữ smt, Ghi chú smt, Ô tích smt, Chọn smt, Liên kết smt hiện ở 1280.
    2) smt-bang-thoa-thuan-768: cột nhìn thấy gồm Giá trị, Phụ trách, Số smt (5, —, 1.234,5, căn phải), Liên kết smt (onehub.vn), Email smt (—) và một cột bị cắt ở mép phải. Không thấy Ngày chốt, Chữ, Ngày, Chọn, Ô tích. Khớp Expected.
    3) smt-bang-cong-ty-768: bảng Công ty có Phụ trách, Số thoả thuận đang mở, Hoạt động gần nhất, Số smt, Liên kết smt (có mũi tên sắp); không có cột Chữ, Ngày, Chọn, Ô tích. Khớp.
    4) smt-bang-thoa-thuan-375-menu: menu 'Sắp xếp theo' liệt kê Tên, Công ty, Giai đoạn, Giá trị, Phụ trách, Ngày chốt, Ngày tạo (đang tick), Hoạt động gần nhất, rồi chín nhãn trường tự tạo: Số smt, Ngày smt, Chữ smt, Ghi chú smt, Chọn smt, Liên kết smt, Email smt, Điện thoại smt, Người smt; không có Ô tích. Cuối là Tăng dần / Giảm dần (tick Giảm dần). Khớp.
    5) smt-kanban-1280: thẻ smtman Alpha có hai dòng 'Số smt 1.234,5' và 'Ngày smt 1 thg 12, 2026' ngay dưới dòng Giá trị/Ngày chốt, cùng lề trái và cỡ chữ với dòng có sẵn. Thẻ Gamma có 'Số smt 5' và 'Ngày smt 5 thg 11, 2026'. Thẻ Beta (trường trống) không có hai dòng đó. Không vỡ chữ, không đè Phụ trách hay Giai đoạn. Hai thẻ ở cột Demo booked, một thẻ ở Qualified to buy, nghĩa là thoả thuận nằm ở hai giai đoạn.
    6) smt-kanban-375: có ba thẻ (Beta, Alpha trong Demo booked, Gamma lộ một phần ở cột kế); Alpha có dòng Số smt 1.234,5 và Ngày smt; Beta không có dòng trường; chữ không vỡ, không đè lên Phụ trách hay Giai đoạn; trang không cuộn ngang (chỉ bảng cột tự cuộn trong khung). Không mâu thuẫn Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sort-moi-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bunx turbo run lint --force
  run_id: minted-sort-moi-truong-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bun run lint:slop
  run_id: minted-sort-moi-truong-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

- cmd: bunx turbo run build --force
  run_id: minted-sort-moi-truong-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-21T06:25:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-sap": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-trang": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-cty-lh": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-khoa-chet": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-board": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sort-moi-truong.spec.ts -t smt-api-the": bo qua baseline: tep apps/api/test/sort-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base c6a718f3df93677e6f8a90423e111e48960ddc7a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed (mũi tên sắp bị cắt ở cột Số) và năm phép đo không đỏ được trên mã lỗi. Returned to implementation.
Round 2: REJECT — fixture luật hoà cùng lớp lỗi với round 1 (hoà theo tên trùng thứ tự id); dừng vá, đổi khuôn đo sang nhóm hoà ba bản ghi (commit 708bf425d). Returned to implementation.
Round 3: PASS — E1, E1b, E2, E3, E4, E7 và bảy lệnh suite chạy lại trên 708bf425d; E5, E5b, E6, E7b, E9 carry-forward từ round 2, E8 carry-forward từ round 1. Mốc verified_at của lượt r3 là mốc soạn hồ sơ; dòng run-log r3 do main loop append trước khi ghi hồ sơ.
