---
schema_version: 2
feature_slug: hop-tuan-mo-dung-bo
verdict: REJECT
failed_evals: [E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5a3bd073e4eff2ce0918d229151fb0fb95066be0
human_signoff:
---

# Evidence Report: hop-tuan-mo-dung-bo

Lệnh fail không gắn eval: không có. Lệnh fail duy nhất là `node _acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`, và nó gắn với E12.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | ui-check | PASS |
| E12 | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-hop-tuan-mo-dung-bo-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.htmb_man_duong
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-mo-dung-bo/rang/man.mjs --phan duong"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-hop-tuan-mo-dung-bo-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_bo_api
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-bo"
    test-run: dropped crm_mvo6v7hz0o0a_test

- eval: E3
  run_id: minted-hop-tuan-mo-dung-bo-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_chuyen
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-chuyen
    Ran 4 tests across 1 file. [1339.00ms]

- eval: E4
  run_id: minted-hop-tuan-mo-dung-bo-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_thanh_ben
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-thanh-ben
    Ran 3 tests across 1 file. [1254.00ms]

- eval: E5
  run_id: minted-hop-tuan-mo-dung-bo-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_hang_so
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-hang-so
    Ran 3 tests across 1 file. [1.85s]

- eval: E6
  run_id: minted-hop-tuan-mo-dung-bo-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_o_so
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=UTC bun test ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-o-so && TZ=Asia/Ho_Chi_Minh bun test ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-o-so
    Ran 1 test across 1 file. [984.00ms]

- eval: E7
  run_id: minted-hop-tuan-mo-dung-bo-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_chua_kr
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-chua-kr
    Ran 1 test across 1 file. [1322.00ms]

- eval: E8
  run_id: minted-hop-tuan-mo-dung-bo-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_toan_canh_api
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-toan-canh"
    test-run: dropped crm_mvo6v77fu0yd_test

- eval: E9
  run_id: minted-hop-tuan-mo-dung-bo-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_ly_do
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-ly-do
    Ran 1 test across 1 file. [1252.00ms]

- eval: E10
  run_id: minted-hop-tuan-mo-dung-bo-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_tai
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-tai
    Ran 1 test across 1 file. [1492.00ms]

- eval: E11
  run_id: E11-htmb-anh-20261026
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htmb_man
  verified_at: 2026-10-25T18:56:15Z
  screenshot: evidence/E11-step1.png
  observed: |
    Đã mở từng ảnh trong 12 frame (E11-step1..12). Hàng bốn ô «Đã cập nhật 4/4», «Đang bàn 1», «Tự tin thấp 0», «Ngày còn lại 56» đọc trọn, không cắt; thanh bên/hàng cuộn ngang có «Bộ OKR» đang chọn và không có mục «Họp tuần»; sáng và tối đều đọc rõ, 375 là lưới hai cột hai hàng.
    Ảnh chưa có KR nêu tên bộ và kỳ, có liên kết «Xem mọi bộ OKR», không hàng số; ảnh danh sách đơn vị có câu «OneHub Center chưa có KR công bố…» và các mục «n KR · đã cập nhật m» đọc trọn. Khớp Expected, đủ 12 ảnh; bàn đo in 33 dòng DUNG, 0 SAI.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-hop-tuan-mo-dung-bo-E12-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.htmb_khong_doi_hinh
  verified_at: 2026-10-25T18:56:15Z
  output: |
    cmd: node _acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs
    SAI AC-10: HO SO khep-ky-okr#E14: cay 1 · nen 0
    SAI AC-10: HO SO tro-ly-okr-de-xuat#E24: cay 1 · nen 0
    KET LUAN khong-doi-hinh: 2 SAI
    (các hồ sơ khác trong lớp: «DO SAN TREN NEN» — đỏ sẵn trên nền origin/onehub, không tính SAI)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bun run lint:slop
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-25T18:56:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt: none — không eval nào xanh trên cả HEAD lẫn baseline. E1 đỏ trên baseline (có phân biệt); các eval còn lại không đo được baseline vì là eval mới (xem dưới).

Baseline khong do
- bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-bo": bo qua baseline: tep apps/api/test/hop-tuan-mo-dung-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-chuyen: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-thanh-ben: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.dom.tsx co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-hang-so: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.dom.tsx co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=UTC bun test ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-o-so && TZ=Asia/Ho_Chi_Minh bun test ./test/hop-tuan-mo-dung-bo.spec.ts -t htmb-o-so: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-chua-kr: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.dom.tsx co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-tuan-mo-dung-bo.spec.ts -t htmb-toan-canh": bo qua baseline: tep apps/api/test/hop-tuan-mo-dung-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-ly-do: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.dom.tsx co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-mo-dung-bo.dom.tsx -t htmb-tai: bo qua baseline: tep apps/app/test/hop-tuan-mo-dung-bo.dom.tsx co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs: bo qua baseline: tep _acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 485bdc710ae504f276bde58d37b3de4e55af5df4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E12 failed — khong-doi-hinh.mjs báo 2 mục «SAI AC-10»: hồ sơ khep-ky-okr (E14) và tro-ly-okr-de-xuat (E24) đỏ trên cây nhưng xanh trên nền origin/onehub, nghĩa là vòng này làm xấu đi hai eval của hồ sơ đã ký. Returned to implementation.
