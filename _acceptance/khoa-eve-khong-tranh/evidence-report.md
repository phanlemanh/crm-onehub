---
schema_version: 2
feature_slug: khoa-eve-khong-tranh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6f63334506063486d13c5e0b738bdb94c27d2b03
human_signoff: Phan Le Manh 2026-10-09
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

Vòng 2: mười eval máy đều xanh trên cây đã ghim. Không có eval judgment nên không có hội đồng chấm.

## Evidence

- eval: E1
  run_id: minted-khoa-eve-khong-tranh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kekt_ghi_tron
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 1 test across 1 file. [76.00ms]

- eval: E2
  run_id: minted-khoa-eve-khong-tranh-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kekt_hai_luot
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 1 test across 1 file. [3.54s]

- eval: E3
  run_id: minted-khoa-eve-khong-tranh-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kekt_mot_luot
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 1 test across 1 file. [454.00ms]

- eval: E4
  run_id: minted-khoa-eve-khong-tranh-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cccl_mo_coi
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 2 tests across 1 file. [596.00ms]

- eval: E5
  run_id: minted-khoa-eve-khong-tranh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cccl_ngoai_khoa
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 2 tests across 1 file. [1.54s]

- eval: E6
  run_id: minted-khoa-eve-khong-tranh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kekt_doi_chu
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 1 test across 1 file. [239.00ms]

- eval: E7
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kekt_pham_vi
  verified_at: 2026-10-09T08:44:45Z
  output: |
    PHAM VI: 19 tep, 0 ngoai ranh gioi

- eval: E8
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kekt_dot_bien
  verified_at: 2026-10-09T08:44:45Z
  output: |
    DOT BIEN: 8/8 cap dat

- eval: E9
  run_id: minted-khoa-eve-khong-tranh-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kekt_dau
  verified_at: 2026-10-09T08:44:45Z
  output: |
    Ran 1 test across 1 file. [54.00ms]

- eval: E10
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kekt_lap
  verified_at: 2026-10-09T08:44:45Z
  output: |
    DOT BIEN: 3/3 cap dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bunx turbo run lint --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bun run lint:slop
  run_id: minted-khoa-eve-khong-tranh-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

- cmd: bunx turbo run build --force
  run_id: minted-khoa-eve-khong-tranh-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-09T08:44:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không phân biệt (xanh cả trên mã cũ lẫn mã mới, nên chứng minh bộ thử chứ không chứng minh tính năng). Cả hai là hồi quy có chủ ý, giữ nguyên hai ca F11 không sửa để chứng tỏ khoi-dong.ts mới không làm hỏng hành vi cũ:
- E4 (cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t mo-coi) — regression-guard của AC-3
- E5 (cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t ngoai-khoa) — regression-guard của AC-3

## Variance

none — không eval nào chạy nhiều lượt, mọi eval đều xác định.

## Iterations

Round 1: REJECT — E1..E10 đều xanh nhưng vòng review có một phát hiện trong hợp đồng, mức cao, trên AC-6: ma trận so-dau không cô lập phần ino của dấu khoá. Quay lại triển khai.
Round 2: PASS — ma trận so-dau rút dấu từ khoá thật, dòng (6) chỉ khác ino (a362b47a1); mười eval máy và bảy lệnh suite xanh trên cây ghim 6f6333450.
