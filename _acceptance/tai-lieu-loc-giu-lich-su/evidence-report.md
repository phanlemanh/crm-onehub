---
schema_version: 2
feature_slug: tai-lieu-loc-giu-lich-su
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 387f57dc31da0a87c69384923db6e36e6f7fc3e6
human_signoff:
---

# Evidence Report: tai-lieu-loc-giu-lich-su

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E4m | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tai-lieu-loc-giu-lich-su-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_lich_su
  verified_at: 2026-10-15T19:20:29Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lich-su
    Ran 2 tests across 1 file. [3.68s]

- eval: E2
  run_id: minted-tai-lieu-loc-giu-lich-su-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_giu_loc
  verified_at: 2026-10-15T19:20:29Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t giu-loc
    Ran 3 tests across 1 file. [3.65s]

- eval: E3
  run_id: minted-tai-lieu-loc-giu-lich-su-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_lan_dau
  verified_at: 2026-10-15T19:20:29Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lan-dau
    Ran 1 test across 1 file. [2.67s]

- eval: E5
  run_id: minted-tai-lieu-loc-giu-lich-su-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_doi_loc_loi
  verified_at: 2026-10-15T19:20:29Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t doi-loc-loi
    Ran 1 test across 1 file. [1.84s]

- eval: E4m
  run_id: minted-tai-lieu-loc-giu-lich-su-E4m-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlg_man_do
  verified_at: 2026-10-15T19:20:29Z
  output: |
    cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tai-lieu-loc-giu-lich-su/rang/do-lich-su.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-tai-lieu-loc-giu-lich-su-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlg_man
  verified_at: 2026-10-15T19:20:29Z
  screenshot: evidence/E4-step2.png
  observed: |
    Chỉ có một khung được lưu (step 1 không có chụp trong steps). E4-step2.png (bản sao của tlg-cho-loc-1280.png, 1280x900, đã mở bằng Read): trang Tài liệu ở khổ 1280, tiêu đề Tài liệu, chip lọc loại hiển thị đủ (Tất cả 3, Quy định 1, Chính sách 1, Quy trình 1 đang có viền nổi bật là chip vừa bấm, Biểu mẫu 0, Chiến lược 0), kèm ô Mọi đơn vị, Mọi chủ trang, Đã lưu trữ, Bộ lọc. Thanh lọc vẫn còn nguyên, không bị gỡ. Bảng danh sách vẫn còn 3 hàng cũ (Quy trình mẫu, Chính sách mẫu, Quy định mẫu) hiển thị mờ chứ không trống, khớp với aria-busy=true và độ mờ 0.6 mà log ghi. Khớp Expected, không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Ba chiều đo (--chieu-do) thuộc eval E4m, không chạy trong E4 theo steps được giao.
    Driver là script puppeteer chạy qua mot-luot.sh, không có công cụ đọc network/console của trình duyệt nên không dump được E4-network.txt.
    Fallback ảnh: dùng được ảnh PNG thật do script chụp, không cần fallback .html.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bunx turbo run lint --force
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bun run lint:slop
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

- cmd: bunx turbo run build --force
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T19:20:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào green trên cả baseline lẫn HEAD (mọi eval feature đều baseline n-a, chưa đo được khả năng phân biệt; xem mục dưới).

Baseline khong do:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lich-su: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t giu-loc: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lan-dau: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t doi-loc-loi: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/tai-lieu-loc-giu-lich-su/rang/do-lich-su.mjs --chi-do": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — mọi eval đều chạy một lượt xác định, không eval nào chạy nhiều lần.

## Iterations

Round 1: mọi eval và lệnh suite đều xanh; không có eval fail. Verdict PASS.
