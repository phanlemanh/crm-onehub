---
schema_version: 2
feature_slug: tom-tat-tuan-dang-cho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb086916bd4595c75d5d8737732209bfc5593dba
human_signoff:
---

# Evidence Report: tom-tat-tuan-dang-cho

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-tom-tat-tuan-dang-cho-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_khoi_cho
  verified_at: 2026-10-23T15:47:03Z
  output: |
    Ran 4 tests across 1 file. [1186.00ms]

- eval: E2
  run_id: minted-tom-tat-tuan-dang-cho-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_api_cho
  verified_at: 2026-10-23T15:47:03Z
  output: |
    test-run: dropped crm_mvl58bskam44_test

- eval: E3
  run_id: mvl58ckxeafc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_luat_gio
  verified_at: 2026-10-23T15:47:03Z
  output: |
    test-run: dropped crm_mvl58ckxeafc_test

- eval: E4
  run_id: minted-tom-tat-tuan-dang-cho-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_mot_luat
  verified_at: 2026-10-23T15:47:03Z
  output: |
    test-run: dropped crm_mvl58c8qmsta_test

- eval: E5
  run_id: minted-tom-tat-tuan-dang-cho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_dang_xep
  verified_at: 2026-10-23T15:47:03Z
  output: |
    Ran 1 test across 1 file. [679.00ms]

- eval: E6
  run_id: minted-tom-tat-tuan-dang-cho-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_tam_dung
  verified_at: 2026-10-23T15:47:03Z
  output: |
    Ran 3 tests across 1 file. [982.00ms]

- eval: E7
  run_id: minted-tom-tat-tuan-dang-cho-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_khong_doi
  verified_at: 2026-10-23T15:47:03Z
  output: |
    Ran 1 test across 1 file. [779.00ms]

- eval: E8
  run_id: minted-tom-tat-tuan-dang-cho-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ttdc_mui_gio
  verified_at: 2026-10-23T15:47:03Z
  output: |
    Ran 4 tests across 1 file. [686.00ms]

- eval: E9
  run_id: minted-tom-tat-tuan-dang-cho-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttdc_man
  verified_at: 2026-10-23T15:47:03Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1.png (1440): Mở Hop tuan của "Kinh doanh miền Bắc" (đăng nhập NT, Quý 4 · mẫu). Thẻ "Tóm tắt tuần của Kara" nằm ngay đầu Họp tuần, dưới hàng chọn phòng và các nút Danh sách, Sơ đồ góp vào, Họp tuần. Trong thẻ có dòng "Kara gửi bản tóm tắt đầu tiên vào khoảng 06:00 thứ Ba, 27/10 — sáng hôm sau ngày cập nhật thứ Hai." Dòng nằm trên một hàng, đọc trọn, không bị cắt, không tràn ngang. Bên dưới là "Đáng bàn tuần này" với 1 KR, "Tuần 19/10 · đã cập nhật 4/4 KR".
    E9-step2.png (375): Cùng màn trên khổ điện thoại. Thẻ "Tóm tắt tuần của Kara" ở đầu Họp tuần, dòng chờ ngắt thành 3 hàng: "Kara gửi bản tóm tắt đầu tiên vào khoảng 06:00 / thứ Ba, 27/10 — sáng hôm sau ngày cập nhật / thứ Hai." Đủ chữ, không cắt, không tràn ngang trang, không thanh cuộn ngang. Phần bên dưới "Đáng bàn tuần này" hiện bình thường. Nút tròn nổi ở góc dưới đè lên một phần chữ bảng KR bên dưới (phần của công cụ dev), không liên quan thẻ tóm tắt. Cả hai khung khớp Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bun run lint:slop
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

- cmd: bunx turbo run build --force
  run_id: minted-tom-tat-tuan-dang-cho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-23T15:47:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-khoi-cho: bo qua baseline: tep apps/app/test/tom-tat-tuan-dang-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-api-cho": bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=UTC TTDC_CAN_TZ=1 CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-luat-gio && TZ=America/Los_Angeles TTDC_CAN_TZ=1 CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-luat-gio": bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-mot-luat": bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-dang-xep" && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-dang-xep: bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-tam-dung" && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-tam-dung: bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/tom-tat-tuan-dang-cho.spec.ts -t ttdc-khong-doi" && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-khong-doi: bo qua baseline: tep apps/api/test/tom-tat-tuan-dang-cho.spec.ts co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=UTC bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-mui-gio && TZ=America/Los_Angeles bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tom-tat-tuan-dang-cho.dom.tsx -t ttdc-mui-gio: bo qua baseline: tep apps/app/test/tom-tat-tuan-dang-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base e6fd8405fb8af6655ce6bafc1c0ace6bd6a295bf — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all 9 evals (E1-E9) passed, no failed eval, no judgment item pending. Verdict PASS.

