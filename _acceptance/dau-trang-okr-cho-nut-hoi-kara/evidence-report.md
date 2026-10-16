---
schema_version: 2
feature_slug: dau-trang-okr-cho-nut-hoi-kara
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9725c17514fd25fe773db040a6bb83daa3cc5c79
human_signoff:
---

# Evidence Report: dau-trang-okr-cho-nut-hoi-kara

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kmc_man_do
  verified_at: 2026-10-16T01:14:23Z
  output: |
    lệnh: KHO_TAI_LIEU_BLOB_TOKEN= bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/khung-man-chung/rang/chup-man.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dto_cho
  verified_at: 2026-10-16T01:14:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dau-trang-okr-cho.dom.tsx -t dto-cho
    Ran 3 tests across 1 file. [942.00ms]

- eval: E3
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dto_bam
  verified_at: 2026-10-16T01:14:23Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dau-trang-okr-cho.dom.tsx -t dto-bam
    Ran 3 tests across 1 file. [898.00ms]

- eval: E4
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dto_hoi_quy
  verified_at: 2026-10-16T01:14:23Z
  output: |
    node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs
    khong-sua: dat

- eval: E5
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man
  verified_at: 2026-10-16T01:14:23Z
  screenshot: evidence/E5-step1.png
  observed: |
    Ảnh 375: tiêu đề «Toàn cảnh OKR» 3 dòng và mô tả 4 dòng ở cả khung đang tải lẫn khung xong; nút «Hỏi Kara» có ở cả hai, cùng hàng với ô chọn quý (lệch ngang khoảng 6px do ô «Quý 4 · mẫu» thật rộng hơn khung xương).
    Ảnh 1280: tiêu đề và mô tả một dòng, cùng chỗ ở hai khung; nút «Hỏi Kara» bên phải, cùng hàng; khung xong có đủ thanh thẻ, 4 ô số và bảng Theo đơn vị. Khớp expected.
  network_observed: n-a (driver)
  output: |
    Assertion 4 «do toancanh 375»: tiêu đề 64/96 trước và sau giống hệt: PASS.
    Assertion 5 đối chiếu bằng mắt hai cặp ảnh (đã mở từng ảnh bằng Read): PASS.
    Frame đã lưu: E5-step1.png (dangtai-375), E5-step2.png (xong-375), E5-step3.png (dangtai-1280), E5-step4.png (xong-1280).

- eval: E6
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dto_dot_bien
  verified_at: 2026-10-16T01:14:23Z
  output: |
    node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/dot-bien.mjs
    dto dot-bien: 1/1 cắn

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bun run lint:slop
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

- cmd: bunx turbo run build --force
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T01:14:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả hai phía: E1 red trên baseline (có phân biệt); E2, E3, E4, E6 baseline n-a vì là eval mới (xem dưới).

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dau-trang-okr-cho.dom.tsx -t dto-cho: bo qua baseline: tep apps/app/test/dau-trang-okr-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base 725537a8ce96ad005139b8d3390a1cf3e4895a35 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dau-trang-okr-cho.dom.tsx -t dto-bam: bo qua baseline: tep apps/app/test/dau-trang-okr-cho.dom.tsx co o cay dang kiem nhung chua co o merge-base 725537a8ce96ad005139b8d3390a1cf3e4895a35 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs: bo qua baseline: tep _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs co o cay dang kiem nhung chua co o merge-base 725537a8ce96ad005139b8d3390a1cf3e4895a35 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 725537a8ce96ad005139b8d3390a1cf3e4895a35 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval E1 đến E6 và bảy lệnh suite đều đạt; không có eval hỏng.
