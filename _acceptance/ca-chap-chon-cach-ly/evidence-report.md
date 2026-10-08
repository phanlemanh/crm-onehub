---
schema_version: 2
feature_slug: ca-chap-chon-cach-ly
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 997978d25a8dc45811f09e91931b0e27ee803c72
human_signoff:
---

# Evidence Report: ca-chap-chon-cach-ly

Round 1. Cả chín eval máy đều chạy xong và đạt. Báo cáo REJECT vì review có một phát hiện mức cao nằm trong hợp đồng (AC-5, eval E6); chi tiết ở review-findings.md.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ca-chap-chon-cach-ly-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cccl_mo_coi
  verified_at: 2026-10-08T01:33:01Z
  output: |
    cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t mo-coi
    Ran 2 tests across 1 file. [609.00ms]

- eval: E2
  run_id: minted-ca-chap-chon-cach-ly-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cccl_ngoai_khoa
  verified_at: 2026-10-08T01:33:01Z
  output: |
    cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t ngoai-khoa
    (bai chay xong, khong co ca do)

- eval: E3
  run_id: minted-ca-chap-chon-cach-ly-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.cccl_cho_route
  verified_at: 2026-10-08T01:33:01Z
  output: |
    cd apps/agent-okr && bun test test/khoi-dong-don.spec.ts -t cho-route
    (bai chay xong, khong co ca do)

- eval: E4
  run_id: minted-ca-chap-chon-cach-ly-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cccl_mo_coi_xanh
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun _acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs xanh
    LUOT 3: xanh

- eval: E5
  run_id: minted-ca-chap-chon-cach-ly-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cccl_mo_coi_do
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun _acceptance/ca-chap-chon-cach-ly/rang/mo-coi.mjs do
    DO DUNG: eve mo coi chan luot sau

- eval: E6
  run_id: minted-ca-chap-chon-cach-ly-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cccl_tai_lieu
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun run test -- "cd apps/api && bun test test/tai-lieu-khong-ro.spec.ts test/tai-lieu-thay-trang.spec.ts"
    (bai chay xong, khong co ca do)

- eval: E7
  run_id: minted-ca-chap-chon-cach-ly-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cccl_dot_bien
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun _acceptance/ca-chap-chon-cach-ly/rang/dot-bien.mjs
    f pham vi xanh=0 do=1 ghim=ok

- eval: E8
  run_id: minted-ca-chap-chon-cach-ly-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cccl_cong_tac
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun _acceptance/ca-chap-chon-cach-ly/rang/cong-tac.mjs
    TAT: chay ca

- eval: E9
  run_id: minted-ca-chap-chon-cach-ly-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cccl_pham_vi
  verified_at: 2026-10-08T01:33:01Z
  output: |
    bun _acceptance/ca-chap-chon-cach-ly/rang/pham-vi.mjs
    PHAM VI: 20 tep, 0 ma san pham

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bun run lint:slop
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

- cmd: bunx turbo run build --force
  run_id: minted-ca-chap-chon-cach-ly-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T01:33:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ không chứng minh feature):

- E6 (lệnh `bun run test -- "cd apps/api && bun test test/tai-lieu-khong-ro.spec.ts test/tai-lieu-thay-trang.spec.ts"`): baseline green. Đây là eval hồi quy cho hai spec tài liệu; lời hứa «số (pass) ≥ số ca ở merge-base» chưa có máy nào so (xem review-findings.md, mục Trong hợp đồng, AC-5). Cần viết lại để khẳng định quan hệ đó hoặc xác nhận là regression-guard có chủ ý.

Tám eval còn lại đều đỏ trên baseline (có phân biệt). Không có eval judgment nên không có hội đồng chấm; không khai input nào cần hội đồng.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, tất định, không có phương sai)

## Iterations

Round 1: chín eval máy và bảy lệnh suite đều đạt; REJECT vì review nêu một phát hiện mức cao trong hợp đồng ở AC-5 (E6 chưa ràng được số ca so với merge-base). Chuyển về triển khai/hợp đồng để người quyết.

