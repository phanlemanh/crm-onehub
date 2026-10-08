---
schema_version: 2
feature_slug: kiem-cheo-sau-gop
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6a52e9b0f8b41e48f52f2f54095204fbc77665a0
human_signoff:
---

# Evidence Report: kiem-cheo-sau-gop

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4, AC-7, AC-9, AC-10 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-6, AC-8 | script | PASS |
| E4 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-kiem-cheo-sau-gop-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcs_don_vi
  verified_at: 2026-10-08T09:28:32Z
  output: |
    cmd: node --test "scripts/kiem-cheo/test/*.test.mjs"
    ℹ duration_ms 2279.736167

- eval: E2
  run_id: minted-kiem-cheo-sau-gop-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcs_lich
  verified_at: 2026-10-08T09:28:32Z
  output: |
    cmd: node --test scripts/dieu-phoi/test/lich.test.mjs
    ℹ duration_ms 54.50625

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcs_pha_thu
  verified_at: 2026-10-08T09:28:32Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs
    pha-thu: moi o dat

- eval: E4
  run_id: minted-kiem-cheo-sau-gop-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcs_ranh_gioi
  verified_at: 2026-10-08T09:28:32Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs
    ranh-gioi: ban that sach, ba chieu do do dung cho

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bun run lint:slop
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

- cmd: bunx turbo run build --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T09:28:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh cả trên bản hiện tại lẫn bản gốc của round 1; chứng minh bộ đo chứ không chứng minh tính năng — viết lại để khẳng định hành vi mới hoặc xác nhận là lớp chắn hồi quy có chủ ý):

- E1: `node --test "scripts/kiem-cheo/test/*.test.mjs"`
- E2: `node --test scripts/dieu-phoi/test/lich.test.mjs`

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: cả bốn eval máy (E1 đến E4) và bảy lệnh suite đều xanh; verdict REJECT vì bước review tìm thấy phát hiện trong hợp đồng mức cao (AC-1, AC-4, AC-8, AC-9) mà eval hiện có không bắt được. Trả về triển khai (S4 vòng 1 sửa: bộ đọc paths của kit, đơn xin khoá qua kiemDon, mã thoát làn, trần giữa lệnh dò, tệp ngày đủ khoá).
Round 2: cả bốn eval máy (E1 đến E4) và bảy lệnh suite đều xanh; verdict REJECT vì review tìm thêm một phát hiện trong hợp đồng mức cao (AC-1): hoSoTai chạy git archive _acceptance vượt maxBuffer mặc định 1 MiB nên mọi lượt đêm có gộp trên kho thật đều ra kết quả lỗi. Chi tiết ở review-findings.md. Trả về triển khai.
