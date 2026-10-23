---
schema_version: 2
feature_slug: trang-bo-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 52e720120c11b9d18919da4903f82e369d2a544c
human_signoff:
---

# Evidence Report: trang-bo-okr

Round 4. Cả 18 eval máy (kể cả E14 kiểm bằng mắt) và 7 lệnh suite đều xanh trên cây đã ghim.

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
| E16 | AC-6 | test | PASS |
| E17 | AC-11 | script | PASS |
| E18 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-bo-okr-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_hang
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang"
    test-run: dropped crm_mvku4fk6zjry_test
    lệnh kết thúc mã 0

- eval: E2
  run_id: minted-trang-bo-okr-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-trang-bo-okr-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_co
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co"
    test-run: dropped crm_mvku4hihcwvd_test
    lệnh kết thúc mã 0

- eval: E4
  run_id: minted-trang-bo-okr-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-trang-bo-okr-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-trang-bo-okr-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_the
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the
    Ran 7 tests across 1 file. [1399.00ms]
    lệnh kết thúc mã 0

- eval: E7
  run_id: minted-trang-bo-okr-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-trang-bo-okr-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_viec
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec"
    test-run: dropped crm_mvku4h99p7j7_test
    lệnh kết thúc mã 0

- eval: E9
  run_id: minted-trang-bo-okr-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-trang-bo-okr-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E11
  run_id: minted-trang-bo-okr-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_lien_ket
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket
    Ran 16 tests across 1 file. [1213.00ms]
    lệnh kết thúc mã 0

- eval: E12
  run_id: minted-trang-bo-okr-E12-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/trang-bo-okr/rang/man-bo-okr.mjs"
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-trang-bo-okr-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_tai
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai
    Ran 3 tests across 1 file. [930.00ms]
    lệnh kết thúc mã 0

- eval: E14
  run_id: s4-r4-e14
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T10:36:08Z
  screenshot: evidence/tbo-danh-sach-1440-sang.png
  observed: |
    tbo-danh-sach-1440-sang.png: nền sáng, thanh bên khu (Bộ OKR đang chọn), tiêu đề «Mục tiêu», mô tả, nhãn «Bộ OKR», ba chip lọc «Tất cả 14 / Tôi dẫn 1 / Đang theo dõi 1» ngay trên bảng; bảng 5 cột, 14 hàng thụt theo cấp (OneHub Center > Khối > phòng ban); chỉ có nút phụ «Hỏi Kara» ở đầu trang, không nút chính. Chữ và viền rõ. tbo-danh-sach-1440-toi.png: cùng bố cục trên nền đen, chữ trắng, viền bảng và chip thấy rõ, không chìm. tbo-danh-sach-375-sang.png: thanh điều hướng ngang, danh sách thẻ (OneHub Center, Khối Kinh doanh, Kinh doanh miền Bắc…) mỗi thẻ «trưởng · Mục tiêu n · Tiến độ x%», không bảng, không tràn ngang. tbo-mot-bo-1440-sang.png: tiêu đề «Mục tiêu», vết «Bộ OKR › Kinh doanh miền Bắc» («Bộ OKR» màu muted là liên kết), hàng thẻ con OKR (đậm, gạch chân) · Họp tuần · Việc · Sơ đồ góp vào ngay dưới vết, rồi ô chọn đơn vị + chip Tất cả 2/Cần bàn 2/Chưa góp vào đâu 0 + Lọc/Sắp xếp/Cột, bảng 2 mục tiêu; không có ô chuyển kiểu xem; nút «Thêm mục tiêu» xanh (giống bản mẫu có nút thêm). tbo-mot-bo-1440-toi.png: giống bản sáng trên nền đen, thẻ OKR trắng + gạch chân, viền ô/chip/bảng thấy rõ. tbo-mot-bo-375-sang.png: vết, hàng thẻ con gạch chân, ô chọn đơn vị và nút Lọc xếp dọc, mục tiêu dạng thẻ có thanh tiến độ, không tràn ngang. Phóng to crop 1440 sáng/tối: chữ vết, thẻ và chip đọc rõ. Không có thẻ Chấm điểm (Quý 4 chưa ở pha chấm — nằm trong chỗ lệch được phép). Mọi điều khớp Expected.
  network_observed: n-a (driver)
  output: |
    10. Tương phản sáng/tối: phóng to vùng vết/thẻ/chip lọc, chữ và viền đều đọc được, không chìm nền; thẻ không mở màu xám nhạt nhưng rõ: PASS.
    Network: không có công cụ đọc network (driver là script chụp) → n-a (driver). Server do tien-de.mjs tự dựng và tự dọn.

- eval: E15
  run_id: minted-trang-bo-okr-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 1/3
    KET LUAN khong-doi-hinh: dat

- eval: E16
  run_id: minted-trang-bo-okr-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_viec
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-viec-ten
    Ran 2 tests across 1 file. [1194.00ms]
    lệnh kết thúc mã 0

- eval: E17
  run_id: minted-trang-bo-okr-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh_2
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 2/3
    KET LUAN khong-doi-hinh: dat

- eval: E18
  run_id: minted-trang-bo-okr-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh_3
  verified_at: 2026-10-23T10:36:08Z
  output: |
    cmd: bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 3/3
    KET LUAN khong-doi-hinh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bun run lint:slop
  run_id: minted-trang-bo-okr-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-23T10:36:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-viec-ten: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 1/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 2/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 3/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 0e34c4302fec574224b99217d7209f6731c1ea71 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 BLOCKED — lệnh khong-doi-hinh.mjs vượt trần thời gian mặc định vì evals.yaml không khai long_running cho E15; 14 eval còn lại và 7 lệnh suite xanh. Cách gỡ: khai long_running cho E15 rồi chạy lại.
Round 2: cả 15 eval và 7 lệnh suite xanh (E15 chạy xong, đạt). REJECT vì bốn phát hiện trong hợp đồng chưa xử lý: tiêu đề việc rỗng ở thẻ Việc khi việc liên kết bị xoá hoặc ẩn quyền (AC-6, hai mục), danh sách hồ sơ của E15 viết tay bỏ sót hồ sơ đã ký thuộc lớp (AC-11), và vai «danh-sach» của tbo-lien-ket chỉ khớp chuỗi chứ không đọc href (AC-7). Trả về implementation.
Round 3: E15 và E17 đỏ (phép quét không-đổi-hình báo lỗi AC-11 trên các hồ sơ cũ đã ký) và E14 đỏ (trang một bộ giữ tiêu đề «Mục tiêu» không đặt tên đơn vị làm tiêu đề); hai lệnh suite đỏ ngoài eval (mot-nut-tao-muc-tieu.dom.tsx và lint:slop ở okr-danh-sach-bo.spec.ts). Chuyển lên người, REJECT.
Round 4: cả 18 eval (E15, E17, E18 là ba phần của phép quét không-đổi-hình) và 7 lệnh suite xanh trên cây 52e720120c11b9d18919da4903f82e369d2a544c; E14 xem lại bằng mắt, khớp Expected.

