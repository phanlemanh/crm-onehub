---
schema_version: 2
feature_slug: khoa-eve-khong-tranh
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7f5036805493b829b3a4a48b009ab1b82cb6ebc3
human_signoff:
---

# Evidence Report: khoa-eve-khong-tranh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-1 | script | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-2 | script | PASS |

Mười eval máy đều chạy xanh. Verdict tổng là REJECT vì vòng review có một phát hiện trong hợp đồng (mức cao) trên AC-6: ma trận của E9 không cô lập phần `ino` của dấu khoá, chi tiết ở `review-findings.md` mục «Trong hợp đồng».

## Evidence

- eval: E1
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kekt_ghi_tron
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 1 test across 1 file. [49.00ms]

- eval: E2
  run_id: minted-khoa-eve-khong-tranh-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kekt_hai_luot
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 1 test across 1 file. [3.48s]

- eval: E3
  run_id: minted-khoa-eve-khong-tranh-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kekt_mot_luot
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 1 test across 1 file. [461.00ms]

- eval: E4
  run_id: minted-khoa-eve-khong-tranh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cccl_mo_coi
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 2 tests across 1 file. [530.00ms]

- eval: E5
  run_id: minted-khoa-eve-khong-tranh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cccl_ngoai_khoa
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 2 tests across 1 file. [1489.00ms]

- eval: E6
  run_id: minted-khoa-eve-khong-tranh-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kekt_doi_chu
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 1 test across 1 file. [176.00ms]

- eval: E7
  run_id: minted-khoa-eve-khong-tranh-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kekt_pham_vi
  verified_at: 2026-10-09T05:42:23Z
  output: |
    PHAM VI: 16 tep, 0 ngoai ranh gioi

- eval: E8
  run_id: minted-khoa-eve-khong-tranh-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kekt_dot_bien
  verified_at: 2026-10-09T05:42:23Z
  output: |
    DOT BIEN: 8/8 cap dat

- eval: E9
  run_id: minted-khoa-eve-khong-tranh-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kekt_dau
  verified_at: 2026-10-09T05:42:23Z
  output: |
    Ran 1 test across 1 file. [43.00ms]

- eval: E10
  run_id: minted-khoa-eve-khong-tranh-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kekt_lap
  verified_at: 2026-10-09T05:42:23Z
  output: |
    DOT BIEN: 3/3 cap dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-khoa-eve-khong-tranh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bun run lint:slop
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-eve-khong-tranh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T05:42:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Hai eval không phân biệt (xanh cả trên code cũ lẫn code mới, chứng minh bộ đo chứ không chứng minh tính năng; đây là hai ca hồi quy có chủ ý của F11, chiều đỏ đã lập ở F11):

- E4 (`cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t mo-coi`): baseline green, regression-guard cho AC-3.
- E5 (`cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t ngoai-khoa`): baseline green, regression-guard cho AC-3.

Các eval còn lại đều red trên baseline (có phân biệt).

## Variance

none — mọi eval chạy một lần, xác định, không có pass_rate hỗn hợp.

## Iterations

Round 1: mười eval máy đều xanh, bảy lệnh suite xanh; verdict REJECT do một phát hiện trong hợp đồng (AC-6, E9 chưa cô lập phần `ino` của dấu khoá — xem `review-findings.md`). Quay lại bước thực thi để thêm dòng ma trận cô lập `ino` và một cặp đột biến bỏ `ino`.
