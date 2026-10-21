---
schema_version: 2
feature_slug: truong-mot-cach-cu-xu
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: abb2eed7bd23238b7d553645be3e8caa0cc6da9b
human_signoff:
---

# Evidence Report: truong-mot-cach-cu-xu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-truong-mot-cach-cu-xu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmc_quet
  verified_at: 2026-10-21T01:39:58Z
  output: |
    tmc quet: dat — 10 tep, 1 ngoai tru co ten

- eval: E2
  run_id: minted-truong-mot-cach-cu-xu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_doc_so
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 2 tests across 1 file. [45.00ms]

- eval: E2b
  run_id: minted-truong-mot-cach-cu-xu-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_phieu_so
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 1 test across 1 file. [7.51s]

- eval: E2c
  run_id: minted-truong-mot-cach-cu-xu-E2c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_api_so
  verified_at: 2026-10-21T01:39:58Z
  output: |
    test-run: dropped crm_mvhg6dqaxau8_test

- eval: E3
  run_id: minted-truong-mot-cach-cu-xu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_loi_nhap
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 2 tests across 1 file. [7.30s]

- eval: E3b
  run_id: minted-truong-mot-cach-cu-xu-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_loi_may_chu
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 1 test across 1 file. [8.42s]

- eval: E3c
  run_id: minted-truong-mot-cach-cu-xu-E3c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_api_tu_choi
  verified_at: 2026-10-21T01:39:58Z
  output: |
    test-run: dropped crm_mvhg6dcc7a1u_test

- eval: E4
  run_id: minted-truong-mot-cach-cu-xu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_o_tich
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 1 test across 1 file. [5.34s]

- eval: E5
  run_id: minted-truong-mot-cach-cu-xu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_lien_ket
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 3 tests across 1 file. [6.06s]

- eval: E6
  run_id: minted-truong-mot-cach-cu-xu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_truong_chuan
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 2 tests across 1 file. [6.30s]

- eval: E7
  run_id: minted-truong-mot-cach-cu-xu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_o_bang
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 2 tests across 1 file. [6.74s]

- eval: E8
  run_id: minted-truong-mot-cach-cu-xu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tmc_ten_goi
  verified_at: 2026-10-21T01:39:58Z
  output: |
    Ran 1 test across 1 file. [401.00ms]

- eval: E9
  run_id: minted-truong-mot-cach-cu-xu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tmc_man
  verified_at: 2026-10-21T01:39:58Z
  screenshot: evidence/tmc-phieu-thoa-thuan-1280.png
  observed: |
    tmc-phieu-thoa-thuan-1280.png: thẻ Chi tiết hai cột. Chuẩn (Tên, Giá trị, Tiền tệ, Ngày chốt, Công ty, Phụ trách...) và tự tạo (Chữ tmc "Hợp đồng khung", Ghi chú tmc, Số tmc "1.234,5", Ngày tmc "15 thg 11, 2026", Ô tích tmc có dấu tick, Chọn tmc "Vàng", Liên kết tmc "onehub.vn" có biểu tượng sửa, Email tmc "lienhe@onehub.vn", Điện thoại tmc "0901 234 567", Người tmc "Ada Okafor") nằm cùng lưới, cùng cột nhãn và cỡ chữ. Không có tiêu đề nhóm hay nhãn phụ tách chúng. Ô tích có nhãn bên trái như mọi hàng. Liên kết, Email, Điện thoại tự tạo có biểu tượng bút chì giống Website, Email, Điện thoại chuẩn ở phiếu công ty.
    tmc-phieu-cong-ty-1280.png: thẻ Chi tiết nằm cột phải, cột trái trống ở phần trong khung. Hàng chuẩn (Tên, Tên miền, Website, Điện thoại, Email, Thành phố, Phụ trách...) liền với Chữ tmc, Ghi chú tmc, Số tmc "1.234,5", Ngày tmc "15 thg 11, 2026", Ô tích tmc có tick. Một cột, cùng nhãn, cùng cỡ chữ, không tiêu đề tách. Phần dưới bị cắt bởi khung chụp 900px.
    tmc-phieu-lien-he-1280.png: thẻ Chi tiết hai cột. Chuẩn (Tên, Họ, Chức danh, Email, Điện thoại, LinkedIn, X, GitHub, Công ty, Phụ trách) liền với tự tạo (Chữ tmc, Ghi chú tmc, Số tmc "1.234,5", Ngày tmc, Ô tích tmc, Chọn tmc "Vàng", Liên kết tmc "onehub.vn", Email tmc, Điện thoại tmc "0901 234 567", Người tmc). Không phân cách, không tiêu đề. Liên kết, Email, Điện thoại tự tạo hiện như liên kết có biểu tượng sửa, giống Email và Điện thoại chuẩn.
    tmc-phieu-*-375.png (ba ảnh): phiếu một cột, nhãn trái, giá trị phải nhãn, không có thanh cuộn ngang. Thấy hàng chuẩn xen kẽ cùng cách vẽ. Ảnh chụp ở đầu phiếu nên các hàng tự tạo nằm dưới mép khung; việc không tràn ngang do rang đo (scrollWidth, 0px ở cả ba).
    tmc-bang-thoa-thuan/cong-ty/lien-he-1280.png: có cột Chữ tmc, Ghi chú tmc, Số tmc, Ngày tmc, Ô tích tmc, Chọn tmc, Liên kết tmc, Email tmc, Điện thoại tmc. Hàng tự tạo hiện "Hợp đ…", "Khách c…", "1.23…", "15 th…", "Có", "Vàng", "onehub.…", "lienhe…". Hàng khác hiện "—" ở mọi ô trống. Ô Ô tích hiện "Có". Số dùng span tabular-nums (rang xác nhận 1.234,5 trong DOM). Nội dung bị cắt bằng dấu chấm lửng vì cột hẹp.
    Hai điểm cần lưu ý nhưng không mâu thuẫn Expected: (1) hàng Ghi chú tmc (Chữ dài) cao hơn và giá trị thụt vào hơn một chút (khoảng 9px) so với các giá trị khác ở phiếu thoả thuận và liên hệ. Đây là dấu hiệu nhỏ có thể lộ hàng tự tạo khi che nhãn, nhưng Chữ dài chuẩn không có hàng đối chứng trong thẻ này vì Mô tả nằm ở mục riêng. (2) Ở bảng, cột Số tmc canh trái (chữ số tabular), khác cột số chuẩn như Giá trị canh phải. Tôi hiểu "căn chữ số" là chữ số đều bề rộng (tabular-nums), điều rang xác nhận. Nếu ý là canh phải thì đây là điểm lệch.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bun run lint:slop
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

- cmd: bunx turbo run build --force
  run_id: minted-truong-mot-cach-cu-xu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T01:39:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào green trên cả hai phía; mọi baseline đều n-a (xem «Baseline khong do» bên dưới), nên chưa có eval nào được chứng minh red trên baseline.

Baseline khong do:
- bun _acceptance/truong-mot-cach-cu-xu/rang/quet-vo-tay.mjs: bo qua baseline: tep _acceptance/truong-mot-cach-cu-xu/rang/quet-vo-tay.mjs co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/truong-mot-cach.spec.ts -t tmc-doc-so: bo qua baseline: tep apps/app/test/truong-mot-cach.spec.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-phieu-so: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-mot-cach.spec.ts -t tmc-api-so": bo qua baseline: tep apps/api/test/truong-mot-cach.spec.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-loi-nhap: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-loi-may-chu: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/truong-mot-cach.spec.ts -t tmc-api-tu-choi": bo qua baseline: tep apps/api/test/truong-mot-cach.spec.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-o-tich: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-lien-ket: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-truong-chuan: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/truong-mot-cach.dom.tsx -t tmc-o-bang: bo qua baseline: tep apps/app/test/truong-mot-cach.dom.tsx co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/truong-mot-cach.spec.ts -t tmc-ten-goi: bo qua baseline: tep apps/app/test/truong-mot-cach.spec.ts co o cay dang kiem nhung chua co o merge-base 9d4ab4c09dd1ca7d8a7a34ab822ed34983d09a8a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ (failed_evals rỗng); verdict REJECT đã tính sẵn bởi workflow, kèm ba finding trong hợp đồng ở review-findings.md (AC-3 hai mục, AC-7 một mục). Returned to implementation.
