---
schema_version: 2
feature_slug: lo-trinh-nhieu-san-pham
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 343161e33ebefa1c0b02a43b990da9f19e227e00
human_signoff:
---

# Evidence Report: lo-trinh-nhieu-san-pham

Verdict REJECT dù cả 18 eval của hồ sơ đều xanh: bốn lệnh suite hồi quy `bun run test -- --filter=...` đỏ và không gắn với eval nào (chi tiết ở mục «Lệnh suite (hồi quy)» và «Iterations»). Không có eval nào đỏ nên `failed_evals` để trống.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | ui-check | PASS |
| E15 | AC-8 | script | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-9 | script | PASS |
| E18 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: mvfwcapqbbq1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_lay_dau
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcapqbbq1_test

- eval: E2
  run_id: minted-lo-trinh-nhieu-san-pham-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_doc_du
  verified_at: 2026-10-19T23:38:55Z
  output: |
    Ran 2 tests across 1 file. [1440.00ms]

- eval: E3
  run_id: mvfwcb6o14f1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_nhip
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcb6o14f1_test

- eval: E4
  run_id: minted-lo-trinh-nhieu-san-pham-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_hong
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcc24ve0b_test

- eval: E5
  run_id: minted-lo-trinh-nhieu-san-pham-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_cau_trang_thai
  verified_at: 2026-10-19T23:38:55Z
  output: |
    Ran 3 tests across 2 files. [2.29s]

- eval: E6
  run_id: minted-lo-trinh-nhieu-san-pham-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_may_chu
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcbzhikrp_test

- eval: E7
  run_id: minted-lo-trinh-nhieu-san-pham-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_quyen_trang
  verified_at: 2026-10-19T23:38:55Z
  output: |
    Ran 3 tests across 1 file. [1476.00ms]

- eval: E8
  run_id: minted-lo-trinh-nhieu-san-pham-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_may_chu
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcclqrv8m_test

- eval: E9
  run_id: minted-lo-trinh-nhieu-san-pham-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_danh_ba_trang
  verified_at: 2026-10-19T23:38:55Z
  output: |
    Ran 4 tests across 1 file. [926.00ms]

- eval: E10
  run_id: minted-lo-trinh-nhieu-san-pham-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_may_chu
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcbwlfyg9_test

- eval: E11
  run_id: minted-lo-trinh-nhieu-san-pham-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_vong_doi_trang
  verified_at: 2026-10-19T23:38:55Z
  output: |
    Ran 2 tests across 1 file. [783.00ms]

- eval: E12
  run_id: mvfwclfeyytx
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khuon
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwclfeyytx_test

- eval: E13
  run_id: minted-lo-trinh-nhieu-san-pham-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-19T23:38:55Z
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở cả 16 khung (E13-step1..16). Trang Lộ trình ở 375 và 1280, vi/en, sáng/tối: bộ chọn «Kit nghiệm thu» nằm dưới mô tả ở 375 và ngang hàng tiêu đề ở 1280, không đè tiêu đề; có dòng nguồn «Lấy từ phanlemanh/acceptance-gate-kit · main» kèm giờ lấy; mốc 2.26.0 và 2.27.0 cùng nhãn «Đã giao»/«Shipped» đọc rõ ở nền tối, không tràn ngang.
    Cài đặt › Sản phẩm: ba hàng CRM (khai trong mã), Kit nghiệm thu (chấm xanh, chữ «Đã lấy»/«Fetched», khuôn bản 2) và Kho hỏng (chấm đỏ, chữ «Không thấy tệp lộ trình ở nhánh này»); trạng thái có chữ ở cả nền sáng và tối. Tham số URL thật là ?sanPham=kit-nghiem-thu (mã sản phẩm «kit-nghiem-thu»), không phải ?san-pham=kit nguyên văn như Expected; phép đo kiểm «giữ sau tải lại» và cho đúng, nên tinh thần Expected được đáp ứng. Không thấy mâu thuẫn với Expected.
    Kết quả script: 44 dòng đúng, 0 sai.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-lo-trinh-nhieu-san-pham-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_do_man
  verified_at: 2026-10-19T23:38:55Z
  screenshot: evidence/E14-step1.png
  observed: |
    E14-step1: Lộ trình 1280 vi sáng, bộ chọn «Kit nghiệm thu» ở góc phải tiêu đề, dòng «Lấy từ phanlemanh/acceptance-gate-kit · main», chip «Chưa xong 2 / Đã giao 54 / Xếp lại sau 0 / Tất cả 56» khớp tien_do của fixture, chế độ Mốc hiện 2.26.0 và 2.27.0 cùng các việc «Đã giao» có chữ trạng thái; trang đầy nội dung, cùng bố cục với trang CRM, không ô trống.
    E14-step2: ngăn hồ sơ mở bên phải với tiêu đề việc, trạng thái «Đã giao», tab Tổng quan/Số liệu. E14-step3: Cài đặt › Sản phẩm, hàng «Kit nghiệm thu» ghi kho, nhánh, tệp, giờ lấy và khuôn bản 2 kèm nhãn «Đã lấy»; hàng «Kho hỏng» nhãn đỏ «Không thấy tệp lộ trình ở nhánh này». Khớp Expected.
  network_observed: n-a (driver)

- eval: E15
  run_id: design-gate-9c49ce9949, design-gate-73906951d2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltsp_thiet_ke
  verified_at: 2026-10-19T23:38:55Z
  output: |
    design-gate --mode static chạy trên từng tệp tsx mới hoặc sửa của trang Lộ trình và Cài đặt › Sản phẩm, không tệp nào bị chặn

- eval: E16
  run_id: mvfwcl9fzrb9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ltsp_khoa
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcl9fzrb9_test

- eval: E17
  run_id: minted-lo-trinh-nhieu-san-pham-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltsp_khoa_quet
  verified_at: 2026-10-19T23:38:55Z
  output: |
    KET LUAN: DUNG

- eval: E18
  run_id: mvfwcn8zc6h4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ltsp_do
  verified_at: 2026-10-19T23:38:55Z
  output: |
    test-run: dropped crm_mvfwcn8zc6h4_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-19T23:38:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-19T23:38:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 1
  verified_at: 2026-10-19T23:38:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 1
  verified_at: 2026-10-19T23:38:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T23:38:55Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T23:38:55Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-nhieu-san-pham-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T23:38:55Z

Bốn lệnh suite đỏ, không gắn với eval nào. Tên bài đỏ theo đuôi kết quả máy:

- `--filter=api`: 1937 đạt, 6 bỏ qua, 2 đỏ, cả hai trong `vai-chi-okr`: «ma-tran-trpc: okr gọi được đúng tập khai, mọi thủ tục đối tác bị từ chối về phạm vi» và «ma-tran-khoa-rest: khoá API của okr và câu REST đi đúng ranh như phiên».
- `--filter=app --filter=@crm/ui`: 913 đạt, 4 đỏ: «hinh-theo-man > bảng hình bằng đúng tập tệp gốc và mỗi tệp dùng hình», «checkout-nong > thiếu commit gốc: bỏ phép số, chỉ một dòng ghi chú», «kho chuỗi của vòng ③a > san-pham: mỗi giá trị tiếng Việt mang dấu, trừ khoá đã khai», «kho chuỗi của vòng ③a > mỗi hàm ghép biến có khẳng định, và số hàm bằng số khẳng định».
- `--filter=agent --filter=@crm/auth --filter=@crm/db`: 1320 đạt, 1 bỏ qua, 1 đỏ: «the capability briefing > does not warn about missing sources when everything is on».
- `--filter=agent-okr ...`: 219 đạt, 1 đỏ không tên trong `app-rieng.integration.spec.ts`: bước biên dịch eve báo «Module not found» cho `agent/lib/lo-trinh-github.ts`, được nhập từ `agent/lib/lo-trinh-san-pham.ts` rồi `agent/schedules/dispatch.ts`.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả nhánh lẫn baseline): none — không eval nào xanh ở cả hai phía. Hai eval có baseline red (E15, E18) phân biệt được; các eval còn lại có baseline n-a (xem dưới).

Baseline khong do
- bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-lay-dau": bo qua baseline: tep apps/agent/test/lo-trinh-san-pham.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-san-pham.dom.tsx -t ltsp-doc-du: bo qua baseline: tep apps/app/test/lo-trinh-san-pham.dom.tsx co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-nhip": bo qua baseline: tep apps/agent/test/lo-trinh-san-pham.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-hong": bo qua baseline: tep apps/agent/test/lo-trinh-san-pham.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/san-pham-lo-trinh.dom.tsx ./test/lo-trinh-san-pham.dom.tsx -t ltsp-cau-trang-thai: bo qua baseline: tep apps/app/test/san-pham-lo-trinh.dom.tsx co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/san-pham-lo-trinh.spec.ts -t ltsp-quyen": bo qua baseline: tep apps/api/test/san-pham-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/lo-trinh-san-pham.spec.ts -t ltsp-quyen-trang && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-san-pham.dom.tsx -t ltsp-quyen-trang: bo qua baseline: tep apps/app/test/lo-trinh-san-pham.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/san-pham-lo-trinh.spec.ts -t ltsp-danh-ba && cd ../agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-danh-ba": bo qua baseline: tep apps/api/test/san-pham-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/san-pham-lo-trinh.dom.tsx -t ltsp-danh-ba-trang: bo qua baseline: tep apps/app/test/san-pham-lo-trinh.dom.tsx co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/san-pham-lo-trinh.spec.ts -t ltsp-vong-doi && cd ../agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-vong-doi": bo qua baseline: tep apps/api/test/san-pham-lo-trinh.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/san-pham-lo-trinh.dom.tsx -t ltsp-vong-doi-trang: bo qua baseline: tep apps/app/test/san-pham-lo-trinh.dom.tsx co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-san-pham.dom.tsx ./test/san-pham-lo-trinh.dom.tsx -t ltsp-khuon && cd ../.. && bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-khuon": bo qua baseline: tep apps/app/test/lo-trinh-san-pham.dom.tsx co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/lo-trinh-san-pham.spec.ts -t ltsp-khoa": bo qua baseline: tep apps/agent/test/lo-trinh-san-pham.spec.ts co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs: bo qua baseline: tep _acceptance/lo-trinh-nhieu-san-pham/rang/quet-khoa.mjs co o cay dang kiem nhung chua co o merge-base c689ed9576511708819429cf21b4c3a2b49910aa — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval đều chạy một lần, không có eval ngẫu nhiên nào.

## Iterations

Round 1: không eval nào đỏ (18 trên 18 xanh), nhưng bốn lệnh suite hồi quy đỏ và không gắn eval nào (`--filter=api`, `--filter=app --filter=@crm/ui`, `--filter=agent --filter=@crm/auth --filter=@crm/db`, `--filter=agent-okr ...`). Một trong hai bài đỏ của api là thủ tục `sanPhamLoTrinh.*` vào phạm vi chung mà bài ghim vai «chỉ OKR» chưa khai (xem review-findings.md). Quay lại thi công.
