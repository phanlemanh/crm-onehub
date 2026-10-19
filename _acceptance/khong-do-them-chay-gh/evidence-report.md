---
schema_version: 2
feature_slug: khong-do-them-chay-gh
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bc3ed744aa54726970478361f546b2d1d8c4e964
human_signoff:
---

# Evidence Report: khong-do-them-chay-gh

Round 1. Cả bảy lệnh của eval chạy xong và ra kết luận xanh. Phán quyết là REJECT vì phản biện context sạch tìm ra một lỗi trong hợp đồng (AC-6, eval E6). Bản sao mà thước dung-lai-cay dựng cho các phép phá-thử thiếu `scripts/resolve-plugin.mjs`, nên cả bốn ca B1 đến B4 đều đỏ ở mọi bản sao. Các dòng `BAT <manh>` vì thế không chứng minh được rằng bỏ mảnh mã nào làm đúng ca đó đỏ. Chi tiết ở mục Analyst và ở `review-findings.md`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-khong-do-them-chay-gh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_ban_gh
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E2
  run_id: minted-khong-do-them-chay-gh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_ban_gh_nguon
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E3
  run_id: minted-khong-do-them-chay-gh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_lenh_gh
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E4
  run_id: minted-khong-do-them-chay-gh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_ban_do
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E5
  run_id: minted-khong-do-them-chay-gh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_chi
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E6
  run_id: minted-khong-do-them-chay-gh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kdtg_dung_lai_cay
  verified_at: 2026-10-19T14:27:17Z
  output: |
    KET LUAN: xanh

- eval: E7
  run_id: minted-khong-do-them-chay-gh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kcs_don_vi
  verified_at: 2026-10-19T14:27:17Z
  output: |
    duration_ms 39812.538084

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bunx turbo run lint --force
  run_id: minted-khong-do-them-chay-gh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bun run lint:slop
  run_id: minted-khong-do-them-chay-gh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

- cmd: bunx turbo run build --force
  run_id: minted-khong-do-them-chay-gh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T14:27:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): E7 (`node --test "scripts/kiem-cheo/test/*.test.mjs"`). Đây là bài kiểm đơn vị đã có sẵn, xanh cả hai phía, nên đóng vai bảo vệ hồi quy chứ không chứng minh tính năng mới. Cần xác nhận đó là ý định.

Phát hiện trong hợp đồng làm phán quyết là REJECT: E6 (AC-6). Bản sao của `rang/dung-lai-cay.mjs` chỉ chép `scripts/kiem-cheo` và `lib`, thiếu `scripts/resolve-plugin.mjs` mà `napGoiDieuPhoi` luôn nạp. Một bản sao không đổi gì, chạy hai ca B1 và B4, cho cả hai ca đỏ; chép thêm tệp đó vào thì hai ca xanh. Hệ quả là mọi dòng `BAT <manh>` và mọi dòng «bảo đảm có chiều đo» in ra bất kể mảnh mã nào bị bỏ, nên phần «bỏ mảnh mã làm đúng ca đó đỏ» của AC-6 chưa được đo thật. Kết luận xanh của E6 do máy ghi nhận không đủ để tin ở điểm này.

Baseline không đo:
- bun _acceptance/khong-do-them-chay-gh/rang/ban-gh.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/ban-gh.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-do-them-chay-gh/rang/ban-gh.mjs --nguon: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/ban-gh.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-do-them-chay-gh/rang/lenh-gh.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/lenh-gh.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-do-them-chay-gh/rang/ban-do-that.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/ban-do-that.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-do-them-chay-gh/rang/chi.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/chi.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/khong-do-them-chay-gh/rang/dung-lai-cay.mjs: bo qua baseline: tep _acceptance/khong-do-them-chay-gh/rang/dung-lai-cay.mjs co o cay dang kiem nhung chua co o merge-base e0213f2d8e00055c080ab19ca38c35c77c55d9f8 — eval moi, chay tren code cu khong phan biet gi

## Judge panels

Không có eval judgment trong hồ sơ này, nên không có panel nào được đề xuất và không có mục nào chờ human_override.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (không eval nào có runs lớn hơn 1).

## Iterations

Round 1: phản biện tìm ra một lỗi trong hợp đồng ở E6 (AC-6): bản sao dùng cho các phép phá-thử thiếu `scripts/resolve-plugin.mjs`, nên cả bốn ca đều đỏ ở mọi bản sao và các dòng `BAT` không chứng minh được gì. Trả lại cho khâu dựng.
