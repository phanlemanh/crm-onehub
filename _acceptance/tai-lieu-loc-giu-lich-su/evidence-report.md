---
schema_version: 2
feature_slug: tai-lieu-loc-giu-lich-su
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 735c996977a6fa3e0aad9753f5b27adaea04267c
human_signoff: Phan Le Manh 2026-10-16
---

# Evidence Report: tai-lieu-loc-giu-lich-su

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E5 | AC-5 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E4m | AC-4 | script | PASS (carry-forward từ round 1) |

## Evidence

- eval: E1
  run_id: minted-tai-lieu-loc-giu-lich-su-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_lich_su
  verified_at: 2026-10-15T19:47:24Z
  output: |
    Ran 2 tests across 1 file. [3.52s]

- eval: E2
  run_id: minted-tai-lieu-loc-giu-lich-su-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_giu_loc
  verified_at: 2026-10-15T19:47:24Z
  output: |
    Ran 5 tests across 1 file. [3.98s]

- eval: E3
  run_id: minted-tai-lieu-loc-giu-lich-su-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_lan_dau
  verified_at: 2026-10-15T19:47:24Z
  output: |
    Ran 1 test across 1 file. [2.07s]

- eval: E5
  run_id: minted-tai-lieu-loc-giu-lich-su-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tlg_doi_loc_loi
  verified_at: 2026-10-15T19:47:24Z
  output: |
    Ran 1 test across 1 file. [1.76s]

- eval: E4
  run_id: minted-tai-lieu-loc-giu-lich-su-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlg_man
  verified_at: 2026-10-15T19:47:24Z
  screenshot: evidence/tlg-cho-loc-1280.png
  observed: |
    Đã mở bằng Read file tlg-cho-loc-1280.png (1280x900, chụp lúc đang chờ taiLieu.list bị trì hoãn). Trang Tài liệu của OneHub Center: tiêu đề và mô tả còn nguyên, các tab Trang/Chờ duyệt/Nguồn/Sức khoẻ/Hỏi. Thanh lọc vẫn hiện đủ, không bị gỡ: chip Tất cả 3, Quy định 1, Chính sách 1, Quy trình 1 (viền sáng, tức đang giữ tiêu điểm), Biểu mẫu 0, Chiến lược 0, cùng ô Mọi đơn vị, Mọi chủ trang, Đã lưu trữ, Bỏ lọc. Bảng bên dưới vẫn giữ dữ liệu cũ (3 hàng: Quy trình mẫu, Chính sách mẫu, Quy định mẫu) và mờ đi so với bình thường, khớp aria-busy true và độ mờ 0.6 trong log. Khớp Expected. E4-step2.png là bản sao cùng ảnh. Bước 1 không có bước chụp nên không có khung.
  network_observed: n-a (driver)

- eval: E4m
  run_id: minted-tai-lieu-loc-giu-lich-su-E4m-r1
  exit_code: 0
  verifier: config:executors.script.tlg_man_do
  verified_at: 2026-10-15T19:20:29Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bun run lint:slop
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

- cmd: bunx turbo run build --force
  run_id: minted-tai-lieu-loc-giu-lich-su-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T19:47:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lich-su: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t giu-loc: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t lan-dau: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-loc-giu-lich-su.dom.tsx -t doi-loc-loi: bo qua baseline: tep apps/app/test/tai-lieu-loc-giu-lich-su.dom.tsx co o cay dang kiem nhung chua co o merge-base f46c0bbda445631d9bb8e9dbb170e92948906140 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: eval máy đạt, một lỗi trong hợp đồng (AC-2): dữ liệu cũ giữ bằng placeholderData lọt vào nhánh KhoRong nên thanh lọc bị gỡ và màn kho trống chớp lên. Returned to implementation (sửa ở ed96d83f8).
Round 2: E1, E2, E3, E5 chạy lại và đạt; E4 chạy lại qua mot-luot.sh, khung chụp xác nhận thanh lọc giữ nguyên và hàng cũ mờ khi chờ; E4m carry-forward từ round 1; bảy lệnh suite đạt. Verdict PASS.

### Re-pin lần 1 — 2026-10-15, do làn trước chữ ký Cổng Bằng chứng; cây đã gộp onehub b7f3f1620
run_id: repin-20261015T221108Z-97059
sha: 8874241055eb4d72ba5aacd83e9d470caf028d85 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E4 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-16, do lan-dem-16-10: gộp onehub ngày 16/10 (#434…#453)
run_id: repin-20261016T233032Z-31285
sha: 735c996977a6fa3e0aad9753f5b27adaea04267c · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E4 · diff chạm vật đo ngoài làn máy: E4 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
