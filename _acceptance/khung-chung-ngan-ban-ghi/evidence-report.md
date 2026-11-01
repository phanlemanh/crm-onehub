---
schema_version: 2
feature_slug: khung-chung-ngan-ban-ghi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb388f7e792b984a3ce50d7727e847c64988e59d
human_signoff:
---

# Evidence Report: khung-chung-ngan-ban-ghi

Round 2. Mọi eval của hợp đồng đều đạt, nhưng một lệnh suite không gắn eval nào đỏ (`bunx turbo run lint --force`, gói `app`), nên verdict tổng là REJECT.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-9 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-chung-ngan-ban-ghi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_quet
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs
    DAT tat ca

- eval: E2
  run_id: minted-khung-chung-ngan-ban-ghi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_quet
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs
    DAT tat ca

- eval: E3
  run_id: minted-khung-chung-ngan-ban-ghi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E4
  run_id: minted-khung-chung-ngan-ban-ghi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E5
  run_id: minted-khung-chung-ngan-ban-ghi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E6
  run_id: minted-khung-chung-ngan-ban-ghi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E7
  run_id: minted-khung-chung-ngan-ban-ghi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_kieu
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/kieu-bat-buoc.mjs
    DAT tat ca

- eval: E8
  run_id: minted-khung-chung-ngan-ban-ghi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_bai_cu
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/bai-cu.mjs
    DAT tat ca

- eval: E9
  run_id: minted-khung-chung-ngan-ban-ghi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E11
  run_id: minted-khung-chung-ngan-ban-ghi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-11-01T01:09:40Z
  output: |
    node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs
    DAT tat ca

- eval: E10
  run_id: minted-khung-chung-ngan-ban-ghi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_chup
  verified_at: 2026-11-01T01:09:40Z
  screenshot: evidence/E10-step1.png
  observed: |
    ST-kr-dang-tai desktop 1280: left "KR" and right "Deal" drawers both show title + X, two grey stat blocks, a bar and three line-pairs of skeleton; identical shape. ST-so-kr-loi desktop: left "Số KR" and right "Deal" show the same bordered error box with title, one sentence, one "Thử lại" button.
    ST-muc-tieu-du mobile 375: goal drawer has title, "Sửa" button, X, two stat cells, tab bar and body, same layout as the Deal drawer; no horizontal overflow. ST-kr-cu-moi-dang-tai desktop: left old self-built KR skeleton (shorter stat blocks, one thin bar, large block) visibly differs from right in-frame skeleton. ST-kr-loi mobile: "KR" error frame with title, one sentence, one "Về mục tiêu" button, same frame as the Deal error.
  network_observed: n-a (driver)
  output: |
    Step 4: head of drawer (title + close X, divider) same as the Deal cell on all 5 images: PASS. Loading skeleton same as Deal in ST-kr-dang-tai: PASS. Error frame same in ST-so-kr-loi and ST-kr-loi: PASS. ST-muc-tieu-du matches the Deal layout: PASS.
    Step 5: ST-kr-cu-moi-dang-tai: left (old self-built KR drawer) differs from the right skeleton: PASS (negative control differs).
    Network: driver has no network reader; not read.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 1
  verified_at: 2026-11-01T01:09:40Z
  output: |
    app:lint: components/crm/record-sheet/kr-sheet.tsx format
    app:lint:   × Formatter would have printed the following content:
    app:lint:      71     │ - import·{ → type·DauDuLieu, KhungNgan, KhungTaiLoi } from "./record-parts"; (nhiều dòng)
    app:lint:          71 │ + import·{·type·DauDuLieu,·KhungNgan,·KhungTaiLoi·}·from·"./record-parts";
    app:lint: Checked 1442 files in 673ms. No fixes applied.
    app:lint: Found 1 error.
    app:lint: Found 37 warnings.
    app:lint: Found 21 infos.
    Tasks: 10 successful, 11 total
    Failed: app#lint

- cmd: bun run lint:slop
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-11-01T01:09:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Lệnh không gắn eval đỏ: `bunx turbo run lint --force` (gói `app`, tệp `components/crm/record-sheet/kr-sheet.tsx`, lỗi định dạng của formatter, 1 lỗi). Đây là nguyên nhân verdict REJECT dù failed_evals rỗng.

Baseline khong do:
- node _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/kieu-bat-buoc.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/kieu-bat-buoc.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/bai-cu.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base 6dd20c52307e2a425800ea351ce1b3683696fc9f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử round trước nằm ở các bản ghi cũ của hồ sơ, không nạp lại vào vòng này.
Round 2: mọi eval E1-E11 đạt; `bunx turbo run lint --force` đỏ ở gói `app` (lỗi định dạng ở kr-sheet.tsx). Verdict REJECT, trả về để sửa định dạng rồi chạy lại.
