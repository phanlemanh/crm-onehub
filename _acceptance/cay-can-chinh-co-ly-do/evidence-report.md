---
schema_version: 2
feature_slug: cay-can-chinh-co-ly-do
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3a012d92e65bce7398ff37ac7b3e0cf36c703218
human_signoff:
---

# Evidence Report: cay-can-chinh-co-ly-do

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cay-can-chinh-co-ly-do-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_canh
  verified_at: 2026-10-13T09:52:16Z
  output: |
    test-run: dropped crm_mv6i5hobb33f_test

- eval: E2
  run_id: minted-cay-can-chinh-co-ly-do-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_quyen
  verified_at: 2026-10-13T09:52:16Z
  output: |
    test-run: dropped crm_mv6i5gjizupm_test

- eval: E3
  run_id: minted-cay-can-chinh-co-ly-do-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_nut
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 1 test across 1 file. [996.00ms]

- eval: E4
  run_id: minted-cay-can-chinh-co-ly-do-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_ba_muc
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 1 test across 1 file. [641.00ms]

- eval: E5
  run_id: minted-cay-can-chinh-co-ly-do-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_lap_lai
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 1 test across 1 file. [906.00ms]

- eval: E6
  run_id: minted-cay-can-chinh-co-ly-do-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_loc
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 1 test across 1 file. [970.00ms]

- eval: E7
  run_id: minted-cay-can-chinh-co-ly-do-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_dem
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 1 test across 1 file. [831.00ms]

- eval: E8
  run_id: minted-cay-can-chinh-co-ly-do-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_chu
  verified_at: 2026-10-13T09:52:16Z
  output: |
    Ran 140 tests across 1 file. [1.72s]

- eval: E9
  run_id: minted-cay-can-chinh-co-ly-do-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l3_man_doc_lai
  verified_at: 2026-10-13T09:52:16Z
  output: |
    test-run: dropped crm_mv6i5h47svxl_test

- eval: E10
  run_id: minted-cay-can-chinh-co-ly-do-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l3_man
  verified_at: 2026-10-13T09:52:16Z
  screenshot: evidence/tat-ca-1440.png
  observed: |
    tat-ca-1440.png: trang OKR theo đơn vị, thẻ Cây căn chỉnh, chip Tất cả 22 (đang chọn), Chưa có lý do 20, Đặt cược 1. Thấy "Giữ đà tăng trưởng bán lẻ miền Bắc" nhãn «Có số liệu» kèm dòng lý do đầy đủ hai dòng, không cắt chữ; "Mở rộng tệp đối tác bán lẻ miền Bắc" nhãn «Đặt cược» kèm dòng lý do; "Đối tác chỉ kể vấn đề một lần" nhãn «Chưa có lý do», không có dòng lý do. Không có chữ tràn ngang.
    tat-ca-390.png: cuộn trong khổ điện thoại; dòng lý do xuống dòng gọn ("mốc 48 tỷ của cả công ty..."), «Đặt cược» kèm lý do hai dòng, «Chưa có lý do» ở hai nút nam-2 trở lên không kèm lý do; không tràn ngang.
    chua-co-ly-do-1440.png: chip Chưa có lý do 20 đang chọn; cây chỉ còn các nút nhãn «Chưa có lý do» (Đối tác chỉ kể vấn đề một lần, Hàng lạnh Đông Nam Bộ thành mảng chủ lực...) cùng tổ tiên; không thấy «Có số liệu» (bac-1) và «Đặt cược» (bac-2); nam-2 (Hàng lạnh Đông Nam Bộ, Kinh doanh miền Nam) còn.
    chua-co-ly-do-390.png: cùng tập nút ở khổ 390, chip đang chọn Chưa có lý do 20, bố cục gọn, không tràn.
    dat-cuoc-1440.png: chip Đặt cược 1 đang chọn; chỉ còn chuỗi tổ tiên (mục tiêu OneHub, KR Doanh thu hợp đồng mới) và nút «Mở rộng tệp đối tác bán lẻ miền Bắc» nhãn «Đặt cược» kèm dòng lý do; bac-1 và nam-2 vắng.
    dat-cuoc-390.png: tương tự ở khổ 390, một nút Đặt cược kèm lý do, không tràn ngang.
    Cả sáu ảnh khớp Expected (3 trạng thái x 2 khổ), không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Ảnh đã lưu trong _acceptance/cay-can-chinh-co-ly-do/evidence/: tat-ca-1440.png, tat-ca-390.png, chua-co-ly-do-1440.png, chua-co-ly-do-390.png, dat-cuoc-1440.png, dat-cuoc-390.png.
    Console lỗi do script đo = 0. Máy chủ do phiên đo tự dựng đã dọn, không còn tiến trình.

- eval: E11
  run_id: minted-cay-can-chinh-co-ly-do-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l3_dot_bien
  verified_at: 2026-10-13T09:52:16Z
  output: |
    dot-bien: 6/6 vet bi bat, tep tra lai nguyen

- eval: E12
  run_id: minted-cay-can-chinh-co-ly-do-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l3_giu_ho_so
  verified_at: 2026-10-13T09:52:16Z
  output: |
    giu ho so dat

- eval: E13
  run_id: minted-cay-can-chinh-co-ly-do-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l3_ranh_gioi
  verified_at: 2026-10-13T09:52:16Z
  output: |
    ranh gioi dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bun run lint:slop
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

- cmd: bunx turbo run build --force
  run_id: minted-cay-can-chinh-co-ly-do-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T09:52:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả HEAD lẫn baseline; mọi eval feature là eval mới (tệp kiểm chưa có ở merge-base), nên baseline n-a, lý do ở mục dưới.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/okr-cay-ly-do.spec.ts -t l3-canh": bo qua baseline: tep apps/api/test/okr-cay-ly-do.spec.ts co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-cay-ly-do.spec.ts -t l3-quyen": bo qua baseline: tep apps/api/test/okr-cay-ly-do.spec.ts co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-nut: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-ba-muc: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-lap-lai: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-loc: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-dem: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cay-can-chinh-ly-do.dom.tsx -t l3-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/cay-can-chinh-ly-do.dom.tsx co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-cay-ly-do.spec.ts -t l3-man-doc-lai": bo qua baseline: tep apps/api/test/okr-cay-ly-do.spec.ts co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/cay-can-chinh-co-ly-do/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/cay-can-chinh-co-ly-do/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/cay-can-chinh-co-ly-do/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/cay-can-chinh-co-ly-do/rang/giu-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/cay-can-chinh-co-ly-do/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/cay-can-chinh-co-ly-do/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 2182d80af9729e930a364f825a9d6bdf6d708835 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đến E13 đều xanh, không eval nào đỏ. Chuyển sang Cổng Bằng chứng.
