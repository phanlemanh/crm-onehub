---
schema_version: 2
feature_slug: zalo-cau-thu-hai-lien-ket
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 42a86fcd17b9e9a14c5013ee2478dc2c0a2b857e
human_signoff: manh 2026-10-20 — ký Cổng Bằng chứng trên S4 vòng 2 (PASS, 0 finding trong hợp đồng; lượt đo eve thật 6/8 người đủ điều kiện, 12 câu sau nhận đúng câu trả lời). Ngoài-1–6 và Ngoài-8 ghi Known limits; Ngoài-7 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: zalo-cau-thu-hai-lien-ket

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-zalo-cau-thu-hai-lien-ket-E1-r1
  exit_code: 0
  verifier: config:executors.test.zch_lien_ket
  verified_at: 2026-10-19T17:28:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-zalo-cau-thu-hai-lien-ket-E2-r1
  exit_code: 0
  verifier: config:executors.test.zch_lien_ket
  verified_at: 2026-10-19T17:28:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-zalo-cau-thu-hai-lien-ket-E3-r1
  exit_code: 0
  verifier: config:executors.test.zch_lien_ket
  verified_at: 2026-10-19T17:28:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: mvfj5ls17zsb
  exit_code: 0
  verifier: config:executors.test.zch_chi_dan
  verified_at: 2026-10-19T17:28:17Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-zalo-cau-thu-hai-lien-ket-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.zch_so_do
  verified_at: 2026-10-19T22:01:10Z
  output: |
    DAT: 14/14 ca pha deu do

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bunx turbo run lint --force
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bun run lint:slop
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

- cmd: bunx turbo run build --force
  run_id: minted-zalo-cau-thu-hai-lien-ket-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-19T22:01:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline không đo
- bun _acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts: bo qua baseline: tep _acceptance/zalo-cau-thu-hai-lien-ket/rang/so-do.ts co o cay dang kiem nhung chua co o merge-base 17c3a1fb8ea24f7e02600567f84949dc5e729517 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E5 PASS; ghi nhận 4 finding trong hợp đồng ở AC-5 (rang/do.ts, rang/so-do.ts), đưa về sửa.
Round 2: E5 chạy lại trên cây 42a86fcd17b9e9a14c5013ee2478dc2c0a2b857e, 14/14 ca phá đều đỏ; E1–E4 carry-forward từ round 1; bảy lệnh suite chạy lại, tất cả xanh.
