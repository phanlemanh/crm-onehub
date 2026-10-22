---
schema_version: 2
feature_slug: trang-bo-okr
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3b9209797a5f5acd8fb7fec49778807ae77dcf25
human_signoff:
---

# Evidence Report: trang-bo-okr

Round 2. Verdict REJECT: cả 15 eval và 7 lệnh suite đều chạy xong và xanh, nhưng bốn phát hiện TRONG hợp đồng (AC-6 hai mục, AC-7 một mục, AC-11 một mục) chưa được xử lý, chi tiết ở review-findings.md. Không eval nào đỏ nên failed_evals để trống.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | ui-check | PASS |
| E15 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-bo-okr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_hang
  verified_at: 2026-10-22T10:39:02Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang"
    test-run: dropped crm_mvjet79foi50_test

- eval: E2
  run_id: minted-trang-bo-okr-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-trang-bo-okr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_co
  verified_at: 2026-10-22T10:39:02Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co"
    test-run: dropped crm_mvjet7i2n2rv_test

- eval: E4
  run_id: minted-trang-bo-okr-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-trang-bo-okr-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-trang-bo-okr-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_the
  verified_at: 2026-10-22T10:39:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the
    Ran 7 tests across 1 file. [1.68s]

- eval: E7
  run_id: minted-trang-bo-okr-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-trang-bo-okr-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_viec
  verified_at: 2026-10-22T10:39:02Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec"
    test-run: dropped crm_mvjet63r1n5r_test

- eval: E9
  run_id: minted-trang-bo-okr-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-trang-bo-okr-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E11
  run_id: minted-trang-bo-okr-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_lien_ket
  verified_at: 2026-10-22T10:39:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket
    Ran 9 tests across 1 file. [1.63s]

- eval: E12
  run_id: minted-trang-bo-okr-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-trang-bo-okr-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_tai
  verified_at: 2026-10-22T10:39:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai
    Ran 3 tests across 1 file. [1363.00ms]

- eval: E14
  run_id: trang-bo-okr-s4-r2-e14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T10:39:02Z
  screenshot: evidence/tbo-danh-sach-1440-sang.png
  observed: |
    tbo-danh-sach-1440-sang.png: nền sáng, tiêu đề «Mục tiêu», dòng «Bộ OKR», ba chip lọc «Tất cả 14 · Tôi dẫn 1 · Đang theo dõi 1» nằm trên bảng; bảng năm cột (Bộ OKR của · Trưởng · Mục tiêu · Tiến độ · KR tự tin thấp), 14 hàng thụt theo cấp OneHub Center > Khối > phòng ban; không có nút primary, chỉ nút Kara viền.
    tbo-danh-sach-1440-toi.png: cùng bố cục trên nền tối, chữ và viền bảng đọc được, chip đang chọn có viền xanh. tbo-danh-sach-375-sang.png: không bảng, 14 mục dạng thẻ, chip lọc ở trên, không tràn ngang.
    tbo-mot-bo-1440-sang.png và tbo-mot-bo-1440-toi.png: breadcrumb «Bộ OKR › Kinh doanh miền Bắc», hàng thẻ con gạch chân OKR / Họp tuần / Việc / Sơ đồ góp vào ngay dưới đầu trang, thẻ OKR đang mở rõ, ô chọn đơn vị là chỗ lệch được phép, không có ô chuyển kiểu xem. tbo-mot-bo-375-sang.png: bốn thẻ con nằm trọn khung, ô chọn đơn vị và nút Lọc xếp dọc, mục tiêu dạng thẻ, không cuộn ngang. Không có điểm nào mâu thuẫn với expected.
  network_observed: n-a (driver)
  output: |
    EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs" (config:executors.script.tbo_man), log .acceptance-runs/trang-bo-okr/s4-r2-e14.log
    KET LUAN tbo: 30 DUNG, 0 SAI
    phien-do: xong — mã 0
    Sáu ảnh do lệnh tự ghi ở _acceptance/trang-bo-okr/evidence/: tbo-danh-sach-1440-sang, tbo-danh-sach-1440-toi, tbo-danh-sach-375-sang, tbo-mot-bo-1440-sang, tbo-mot-bo-1440-toi, tbo-mot-bo-375-sang (không sao chép thành E14-stepN vì rào cấm tạo tệp trong kho).
    Danh sách 14 hàng, lọc tat-ca/toi-dan/theo-doi khớp 14/1/1 và ghi URL phamViBo; lọc rỗng có câu và nút Về Tất cả; mở bộ giữ kyOkr; bốn thẻ con mở đúng; khổ hẹp danh sách 14 item, không bảng, không cuộn ngang.
    Chỗ lệch bản mẫu chỉ gồm ô chọn đơn vị, khớp hợp đồng AC-3/AC-4.

- eval: E15
  run_id: minted-trang-bo-okr-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh
  verified_at: 2026-10-22T10:39:02Z
  output: |
    bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs
    KET LUAN khong-doi-hinh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bun run lint:slop
  run_id: minted-trang-bo-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T10:39:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline khong do:
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base eaa31c55def6716f0570f6ca3077ef64e39b1b10 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 BLOCKED — lệnh khong-doi-hinh.mjs vượt trần thời gian mặc định vì evals.yaml không khai long_running cho E15; 14 eval còn lại và 7 lệnh suite xanh. Cách gỡ: khai long_running cho E15 rồi chạy lại.
Round 2: cả 15 eval và 7 lệnh suite xanh (E15 chạy xong, đạt). REJECT vì bốn phát hiện trong hợp đồng chưa xử lý: tiêu đề việc rỗng ở thẻ Việc khi việc liên kết bị xoá hoặc ẩn quyền (AC-6, hai mục), danh sách hồ sơ của E15 viết tay bỏ sót hồ sơ đã ký thuộc lớp (AC-11), và vai «danh-sach» của tbo-lien-ket chỉ khớp chuỗi chứ không đọc href (AC-7). Trả về implementation.

