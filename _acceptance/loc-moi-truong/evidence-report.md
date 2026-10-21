---
schema_version: 2
feature_slug: loc-moi-truong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f48c2ba4cbfdc1c7809dcbcdd590c4651eb57a62
human_signoff: manh 2026-10-22
---

# Evidence Report: loc-moi-truong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | script | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-loc-moi-truong-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_chu
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuvvg3lyl_test

- eval: E2
  run_id: minted-loc-moi-truong-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_so
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuvg4asxk_test

- eval: E3
  run_id: minted-loc-moi-truong-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_ngay_tich
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuv88tsvk_test

- eval: E4
  run_id: minted-loc-moi-truong-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_trong
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuw0kd8rb_test

- eval: E5
  run_id: minted-loc-moi-truong-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_cty_lh_bang
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuv3phoh5_test

- eval: E5b
  run_id: minted-loc-moi-truong-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_toc_do
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuuiqz1fe_test

- eval: E6
  run_id: minted-loc-moi-truong-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_khoa_chet
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuuxu59oj_test

- eval: E6b
  run_id: minted-loc-moi-truong-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmt_quet
  verified_at: 2026-10-21T19:45:07Z
  output: |
    lmt quet: dat 4 tep, pha thu 10 o

- eval: E6c
  run_id: minted-loc-moi-truong-E6c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_cai_dat
  verified_at: 2026-10-21T19:45:07Z
  output: |
    Ran 1 test across 1 file. [1178.00ms]

- eval: E7
  run_id: minted-loc-moi-truong-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_api_da_luu
  verified_at: 2026-10-21T19:45:07Z
  output: |
    test-run: dropped crm_mviiuuz3it14_test

- eval: E8
  run_id: minted-loc-moi-truong-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_duong_dan
  verified_at: 2026-10-21T19:45:07Z
  output: |
    Ran 1 test across 1 file. [1335.00ms]

- eval: E9
  run_id: minted-loc-moi-truong-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmt_luu_thoa_thuan
  verified_at: 2026-10-21T19:45:07Z
  output: |
    Ran 1 test across 1 file. [1336.00ms]

- eval: E10
  run_id: minted-loc-moi-truong-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmt_man
  verified_at: 2026-10-21T19:45:07Z
  screenshot: evidence/lmt-menu-chu-1280.png
  observed: |
    1) lmt-menu-chu-1280: bảng 8 thoả thuận 'lmtman' ở khổ 1280; menu Lọc mở, mục 'Ghi chú lmt' mở menu con có ô 'Chứa…' (không bị cắt chữ) và lựa chọn 'Trống' kèm số đếm 2. Khớp Expected.
    2) lmt-menu-khoang-1280: menu con trường 'Số cần lmt' có hai ô cạnh nhau, ô 'Từ' chứa '1.234,5' (đã gõ, nên placeholder 'Từ' bị che) và ô 'Đến' hiện placeholder; dưới có 'Bỏ chọn' và 'Trống 1'. Nút hiện 'Lọc (1)', bảng còn 3 hàng. Chữ không bị cắt. Nhãn 'Từ' chỉ thấy gián tiếp qua giá trị đã gõ; rang đã xác nhận url mang gte:1234.5. Khớp.
    3) lmt-so-sai-1280: gõ 'abc' vào ô 'Từ', viền ô đỏ, dưới ô có chữ đỏ 'Ô này nhận số, ví dụ 1.234,5'; bảng giữ nguyên 3 hàng. Khớp.
    4) lmt-menu-moc-375: ở 375 menu con 'Ngày ký lmt' có năm mục: Đã qua 6, Trong tháng này 5, Tháng sau 0, Muộn hơn 1, Trống 1, đều có số đếm; menu con nằm trong khung, không tràn; nhãn trường không vỡ dòng xấu; không cuộn ngang (rang đã assert). Menu con Ô tích Có/Không do rang assert, không có trong khung. Khớp.
    5) lmt-dang-bat-1280: nút 'Lọc (4)', bảng đúng 2 hàng khớp (Số cần lmt 2.400 và 1.500, Ngày ký 19 thg 10, Đã ký Có), chân bảng '2 thoả thuận'. Khớp.
    6) lmt-luu-375: ở 375 sau khi tải lại và áp bộ lọc đã lưu, hiện 'Lọc (4)', chân trang '2 thoả thuận', bảng 2 hàng (lmtman Chi, lmtman An). Khớp. Tên 'Lmt thử' không thấy trong khung vì menu đã đóng; rang bấm được mục 'Lmt thử' trong menu Bảng xem nên tên tồn tại.
  network_observed: n-a (driver)
  output: |
    Dùng capture riêng của rang (puppeteer), không dùng ui:capture. Không có E10-step*.png vì rang tự ghi sáu ảnh tên lmt-*.png vào thư mục evidence (lmt-menu-chu-1280, lmt-menu-khoang-1280, lmt-so-sai-1280, lmt-menu-moc-375, lmt-dang-bat-1280, lmt-luu-375).
    Network: driver là rang script, không có công cụ đọc network nên không có E10-network.txt. Server do phiên đo tự dựng và dọn.
    Hạn chế đã biết của bước đo: ý «chữ người gõ không bị trình duyệt dịch» (translate="no") không có assertion của rang và không kiểm bằng mắt được qua ảnh; không tìm thấy thuộc tính này trong các tệp lọc có liên quan, nên chưa xác nhận ở eval này.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-moi-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-moi-truong-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bun run lint:slop
  run_id: minted-loc-moi-truong-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-moi-truong-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-21T19:45:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào được đo xanh trên cả baseline lẫn nhánh (không có eval không-phân-biệt); mọi eval feature đều là eval mới nên baseline không đo được (n-a), xem mục dưới. E10 là ui-check, không có lệnh baseline.

Baseline khong do
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-chu": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-so": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/loc-moi-truong.spec.ts -t lmt-api-ngay-tich": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-trong": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-cty-lh-bang": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && LMT_TOC_DO=1 bun test --timeout 600000 test/loc-moi-truong-toc-do.spec.ts -t lmt-toc-do": bo qua baseline: tep apps/api/test/loc-moi-truong-toc-do.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-khoa-chet": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/loc-moi-truong/rang/quet-bang-loc.mjs: bo qua baseline: tep _acceptance/loc-moi-truong/rang/quet-bang-loc.mjs co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-cai-dat: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/loc-moi-truong.spec.ts -t lmt-api-da-luu": bo qua baseline: tep apps/api/test/loc-moi-truong.spec.ts co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-duong-dan: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-moi-truong.dom.tsx -t lmt-luu-thoa-thuan: bo qua baseline: tep apps/app/test/loc-moi-truong.dom.tsx co o cay dang kiem nhung chua co o merge-base ab332d917956b8d1018c7956e128313acd19109e — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, không có phương sai)

## Iterations

Round 1: không eval máy nào đỏ (13 eval và 7 lệnh suite đều xanh); verdict REJECT vì bước duyệt phát hiện 7 mục TRONG hợp đồng chưa được xử lý (AC-3 mốc «Đã qua» tính cả hôm nay; AC-6 bài khoá-chết và máy quét không phân biệt được; AC-8 bước kiểm ở biên máy chủ và vòng lưu không chứng được; AC-9 vế (e) chỉ soi chữ trong mã; AC-10 bước «đang bật bốn bộ lọc» chỉ một bộ lọc phân biệt được). Returned to implementation.
Round 2: 13 eval và 7 lệnh suite đều xanh trên cây f48c2ba4c, sau bản sửa S4 r1 (máy chủ lọc theo kiểu, mốc Đã qua trước hôm nay, thước đo có sức phân biệt). Bước duyệt còn ghi 2 mục TRONG hợp đồng về AC-8 (bộ đọc đường dẫn máy chủ giữ khoá field: không có trong fields.filters, máy khách thì bỏ) và 2 mục ngoài hợp đồng; chi tiết ở review-findings.md để người xem ở Cổng 2.
