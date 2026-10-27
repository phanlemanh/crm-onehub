---
schema_version: 2
feature_slug: bo-okr-co-so
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 298be550dd57f0381e2326ea68eaa272028f415f
human_signoff:
---

# Evidence Report: bo-okr-co-so

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | ui-check | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-1 | test | PASS |

Mọi eval máy đều xanh, nhưng tổng kết là REJECT: review tìm ra các phát hiện nằm trong hợp đồng (AC-1, AC-3, AC-5, AC-7, AC-9) chưa được xử lý. Chi tiết ở review-findings.md.

## Evidence

- eval: E1
  run_id: minted-bo-okr-co-so-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-26T20:19:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-bo-okr-co-so-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_o_so
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-o-so
    Ran 2 tests across 1 file. [1.55s]

- eval: E3
  run_id: minted-bo-okr-co-so-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_bien
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-bien
    Ran 2 tests across 1 file. [1106.00ms]

- eval: E4
  run_id: minted-bo-okr-co-so-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_the
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-the
    Ran 2 tests across 1 file. [2.22s]

- eval: E5
  run_id: minted-bo-okr-co-so-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cd packages/ui && bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/data-table-mo-san.dom.tsx
    Ran 6 tests across 1 file. [779.00ms]

- eval: E6
  run_id: minted-bo-okr-co-so-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cùng lần chạy với E1 (tien-de.mjs --chay man-bo-okr-co-so.mjs)
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-bo-okr-co-so-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cùng lệnh với E5 (data-table-mo-san.dom.tsx)
    Ran 6 tests across 1 file. [779.00ms]

- eval: E8
  run_id: minted-bo-okr-co-so-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cùng lần chạy với E1 (tien-de.mjs --chay man-bo-okr-co-so.mjs)
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-bo-okr-co-so-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cùng lệnh với E5 (data-table-mo-san.dom.tsx)
    Ran 6 tests across 1 file. [779.00ms]

- eval: E10
  run_id: minted-bo-okr-co-so-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_tai
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-tai
    Ran 2 tests across 1 file. [1342.00ms]

- eval: E11
  run_id: minted-bo-okr-co-so-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-26T20:19:02Z
  output: |
    cùng lần chạy với E1 (tien-de.mjs --chay man-bo-okr-co-so.mjs)
    phien-do: xong — mã 0

- eval: E12
  run_id: minted-bo-okr-co-so-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-26T20:19:02Z
  screenshot: evidence/E12-step1.png
  observed: |
    bco-1440-sang.png: dưới hàng thẻ con (OKR · Họp tuần · Việc · Sơ đồ góp vào) có một khối viền ngoài bốn ô một hàng — «Ngày còn lại 55 / đến 20-12», «Tiến độ 31% / Lẽ ra đã tới 40%», «KR đã cập nhật tuần này 4/4», «KR tự tin thấp 2» — có đường chia dọc giữa các ô; bên dưới mới tới hàng công cụ (ô chọn đơn vị, chip Tất cả 3 / Cần bàn 2 / Chưa góp vào đâu 1, Lọc, Sắp xếp, Cột (4), nút «Gập tất cả» nhìn thấy ngay) rồi bảng mục tiêu đã mở sẵn, hiện KR1–KR3 dưới mục tiêu đầu. bco-1440-toi.png: cùng bố cục ở chế độ tối; viền ngoài, đường chia ô, nhãn xám sáng, số trắng đều rõ trên nền đen; riêng «2,9 tỷ đồng» ở KR1 xanh sẫm hơi mờ nhưng đọc được. bco-375-sang.png: bốn ô thành hai cột hai hàng (Ngày còn lại / Tiến độ; KR đã cập nhật tuần này / KR tự tin thấp), nhãn «KR đã cập nhật tuần này» xuống dòng đủ chữ, không cắt; nút «Gập tất cả» hiện ngay trên hàng công cụ phía dưới khối số, trước ô chọn đơn vị và nút Lọc (không phải mở Lọc); không thấy tràn ngang. bco-375-toi.png: giống bản sáng, viền và chữ đủ tương phản trên nền đen. Ảnh đối chiếu bco-toan-canh-1440-sang.png: hàng 5 ô Toàn cảnh cùng viền ngoài mảnh, đường chia dọc, nhãn xám cỡ ~13-14px, giá trị lớn ~32px, đệm trái 24px, chữ phụ xám nhỏ — ghép cạnh với crop 1440 của BCO thì khớp nếp (viền, chia ô, màu/cỡ nhãn, cỡ giá trị, đệm). bco-toan-canh-375-sang.png: hai cột, nhãn xuống dòng đủ chữ, cùng nếp với bản 375 của BCO. Tất cả khớp Expected.
  network_observed: n-a (driver)
  output: |
    Đã mở và đọc từng ảnh; ghép cạnh crop 1440 BCO với Toàn cảnh: cùng khung viền ngoài, đường chia ô, cỡ/màu nhãn, cỡ giá trị, đệm 24px.
    Network: driver là script đo (không có browser tool đọc network) nên n-a (driver).
    Ghi chú nhỏ: ở chế độ tối 1440, giá trị nguồn KR1 «2,9 tỷ đồng» màu xanh lục sẫm trên nền đen mờ hơn chữ khác (~3,7:1 ước lượng) nhưng vẫn đọc rõ; đó là ô của bảng KR có sẵn, không thuộc bốn ô số.

- eval: E13
  run_id: minted-bo-okr-co-so-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_thuoc_da_ky
  verified_at: 2026-10-26T20:19:02Z
  output: |
    bun _acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs --chi-quet
    MUC vo-khu-muc-tieu#E14

- eval: E14
  run_id: minted-bo-okr-co-so-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_api_so_bo
  verified_at: 2026-10-26T20:19:02Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-so-bo.spec.ts -t bco-so-bo"
    test-run: dropped crm_mvppa2aqbdwh_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-okr-co-so-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bun run lint:slop
  run_id: minted-bo-okr-co-so-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-okr-co-so-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-26T20:19:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-o-so: bo qua baseline: tep apps/app/test/bo-okr-co-so.dom.tsx co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-bien: bo qua baseline: tep apps/app/test/bo-okr-co-so.dom.tsx co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-the: bo qua baseline: tep apps/app/test/bo-okr-co-so.dom.tsx co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/data-table-mo-san.dom.tsx: bo qua baseline: tep packages/ui/test/data-table-mo-san.dom.tsx co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-tai: bo qua baseline: tep apps/app/test/bo-okr-co-so.dom.tsx co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs --chi-quet: bo qua baseline: tep _acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-bo.spec.ts -t bco-so-bo": bo qua baseline: tep apps/api/test/okr-so-bo.spec.ts co o cay dang kiem nhung chua co o merge-base a827cdde2b3c070f36d0af42efba6ac8170a3b45 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ (14/14 xanh, bảy lệnh suite xanh); tổng kết REJECT vì review còn sáu phát hiện trong hợp đồng chưa xử lý (okr.soBo dùng phạm vi so-gop lệch bảng ở bộ cá nhân AC-1; soát đổi thước AC-9 chỉ tìm một từ khoá được phép và danh sách tay không đem so với kết quả quét; chiều đỏ của E4, E7, E9, E10 không thử đường đọc thật). Trả về bước triển khai.
