---
schema_version: 2
feature_slug: lam-moi-goi-y-ke-hoach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cef0d8c28f21ba18ea1d2a56ea080297921826ad
human_signoff:
---

# Evidence Report: lam-moi-goi-y-ke-hoach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-1 | test | PASS |
| E9 | AC-3 | test | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-lam-moi-goi-y-ke-hoach-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_stepper
  verified_at: 2026-10-18T09:29:44Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-stepper
    Ran 1 test across 1 file. [1028.00ms]

- eval: E2
  run_id: minted-lam-moi-goi-y-ke-hoach-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_menu
  verified_at: 2026-10-18T09:29:44Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-menu
    Ran 1 test across 1 file. [1133.00ms]

- eval: E3
  run_id: minted-lam-moi-goi-y-ke-hoach-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_roi
  verified_at: 2026-10-18T09:29:44Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-roi
    Ran 2 tests across 1 file. [1412.00ms]

- eval: E4
  run_id: minted-lam-moi-goi-y-ke-hoach-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lmgy_cache
  verified_at: 2026-10-18T09:29:44Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-cache
    Ran 1 test across 1 file. [956.00ms]

- eval: E5
  run_id: minted-lam-moi-goi-y-ke-hoach-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_dot_bien
  verified_at: 2026-10-18T09:29:44Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs
    dot-bien: 4/4 cap dat

- eval: E6
  run_id: minted-lam-moi-goi-y-ke-hoach-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_man
  verified_at: 2026-10-18T09:29:44Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/charming-kalam-8e7593/.acceptance-runs/lam-moi-goi-y-ke-hoach/evidence/E6-sau-thang-1280.png
  observed: |
    E6-sau-thang-1280.png: sheet deal «Hợp đồng làm mới thật kdmkjlw» (công ty «Công ty Làm Mới Gợi Ý thật kdmkjlw») mở ở 1280; badge trạng thái đầu sheet «Closed won»; NGAY ĐẦU SHEET, dưới tiêu đề, có thẻ gợi ý «Deal đã thắng — mở kế hoạch 30 ngày cho Công ty Làm Mới Gợi Ý thật kdmkjlw?» kèm nút «Mở kế hoạch» và «Bỏ qua»; thanh GIAI ĐOẠN có 5 cột, cột cuối «Closed won» (chấm xanh) đang được chọn; toast «Đã đổi giai đoạn». Khớp Expected (thẻ ở đầu sheet, thanh giai đoạn ở cột thắng).
    E6-sau-roi-thang-1280.png: cùng sheet deal «Hợp đồng làm mới thật kdmkjlw» (cùng deal, sheet không dựng lại); KHÔNG có thẻ gợi ý nào giữa tiêu đề và hàng số liệu (Giá trị / Ngày dự kiến chốt / Ở giai đoạn); thanh GIAI ĐOẠN có cột đầu «Demo booked» sáng (cột mở), không còn ở Closed won; mục «Đã chốt» biến mất khỏi «Đang tới đâu»; toast «Đã đổi giai đoạn». Khớp Expected (không có thẻ). Lưu ý: sheet ở khung này lệch phải/bị cắt mép (nhiều khả năng đang giữa chuyển động), không ảnh hưởng tiêu chí.
  network_observed: n-a (driver)
  output: |
    5. [PASS] «E6 sheet khong dung lai: DAT — sau roi thang»
    6. Doi chung truoc khi thang: khong co dong «E6 truoc khi thang: KHONG DO DUOC»; «lam-moi-goi-y-ke-hoach man: dat».
    Frame da luu: .acceptance-runs/lam-moi-goi-y-ke-hoach/evidence/E6-sau-thang-1280.png va E6-sau-roi-thang-1280.png; ban sao _acceptance/lam-moi-goi-y-ke-hoach/evidence/E6-step1.png, E6-step2.png; E6-network.txt (driver puppeteer khong co duong doc network).

- eval: E7
  run_id: minted-lam-moi-goi-y-ke-hoach-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_hoi_quy
  verified_at: 2026-10-18T09:29:44Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)" && bun run check-types
    (duoi dau ra trong sau lenh cuoi check-types)

- eval: E8
  run_id: minted-lam-moi-goi-y-ke-hoach-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gymk_sinh
  verified_at: 2026-10-18T09:29:44Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-sinh"
    test-run: dropped crm_mvdmjxxuv90e_test

- eval: E9
  run_id: minted-lam-moi-goi-y-ke-hoach-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.gymk_xu_ly
  verified_at: 2026-10-18T09:29:44Z
  output: |
    bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-xu-ly"
    test-run: dropped crm_mvdmjyvvrly8_test

- eval: E10
  run_id: minted-lam-moi-goi-y-ke-hoach-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lmgy_duong
  verified_at: 2026-10-18T09:29:44Z
  output: |
    node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs
    duong-doi-giai-doan: da kiem 4/4 noi, 0 loi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bun run lint:slop
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

- cmd: bunx turbo run build --force
  run_id: minted-lam-moi-goi-y-ke-hoach-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-18T09:29:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline; chứng minh phần tiền đề máy chủ đã có từ trước, không phải tính năng mới). Cả hai là bài kiểm đã ký của goi-y-mo-ke-hoach chạy lại nguyên trạng để làm tiền đề máy chủ cho AC-1 và AC-3, nên đây là regression-guard có chủ ý:
- E8 (AC-1): -t gy-sinh của apps/api/test/goi-y-mo-ke-hoach.spec.ts, xanh trên baseline.
- E9 (AC-3): -t gy-xu-ly của apps/api/test/goi-y-mo-ke-hoach.spec.ts, xanh trên baseline.

Baseline khong do
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-stepper: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-menu: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-roi: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-goi-y-ke-hoach.dom.tsx -t gy-lm-cache: bo qua baseline: tep apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)" && bun run check-types: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs --tu-thu && node _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs: bo qua baseline: tep _acceptance/lam-moi-goi-y-ke-hoach/rang/duong-doi-giai-doan.mjs co o cay dang kiem nhung chua co o merge-base 3a39a4b6b851d736ab2f1664c35c91d5b84ef49c — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E10 đều đạt (mọi eval xanh, bảy lệnh suite xanh). Không có eval hỏng, không có mục chờ người chấm.
