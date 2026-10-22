---
schema_version: 2
feature_slug: don-ho-so-cu
verdict: REJECT
failed_evals: ["E2","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bfd2164a183582e07df07608415f265fd13fba9e
human_signoff:
---

# Evidence Report: don-ho-so-cu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | FAIL |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | FAIL |

Lệnh fail không gắn eval: không có. Hai lệnh fail đều gắn eval: `bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs` (E2) và `bun _acceptance/don-ho-so-cu/rang/cong-gop.mjs` (E9).

## Evidence

- eval: E1
  run_id: minted-don-ho-so-cu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_kiem_ke
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E2
  run_id: minted-don-ho-so-cu-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dhc_lo
  verified_at: 2026-10-21T23:53:49Z
  output: |
    lo 1: 4 ho so, uoc 79.7′
    lo 2: 8 ho so, uoc 77.2′
    KET LUAN: do — thua: ba-ho-so-do-san; thua: tat-preview-agent-okr

- eval: E3
  run_id: minted-don-ho-so-cu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_doi_chieu
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E4
  run_id: minted-don-ho-so-cu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_so_xu_ly
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E5
  run_id: minted-don-ho-so-cu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_sua_thuoc
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E6
  run_id: minted-don-ho-so-cu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_cay_ho_so
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E7
  run_id: minted-don-ho-so-cu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_ca_goi_ten
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E8
  run_id: minted-don-ho-so-cu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhc_lan_chu
  verified_at: 2026-10-21T23:53:49Z
  output: |
    KET LUAN: xanh

- eval: E9
  run_id: minted-don-ho-so-cu-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.dhc_cong_gop
  verified_at: 2026-10-21T23:53:49Z
  output: |
    HEAD: pre-merge-check: 1 violation(s) — merge blocked
    HEAD khong clean: pre-merge-check: 1 violation(s) — merge blocked
    KET LUAN: do

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-don-ho-so-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bun run lint:slop
  run_id: minted-don-ho-so-cu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

- cmd: bunx turbo run build --force
  run_id: minted-don-ho-so-cu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T23:53:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả hai phía: mọi eval feature đều n-a trên baseline (eval mới, tệp chưa có ở merge-base), nên chưa có eval nào được đo là đỏ trên code cũ. Xem mục «Baseline khong do».

Baseline khong do:
- bun _acceptance/don-ho-so-cu/rang/kiem-ke.mjs --tu-kiem: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/kiem-lo.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/doi-chieu.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/doi-chieu.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/so-xu-ly.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/cay-ho-so.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/cay-ho-so.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/ca-goi-ten.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/ca-goi-ten.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs --lan-chu: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/sua-thuoc.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/don-ho-so-cu/rang/cong-gop.mjs: bo qua baseline: tep _acceptance/don-ho-so-cu/rang/cong-gop.mjs co o cay dang kiem nhung chua co o merge-base c9e4ce60578069c49f9155215f7bb5f5d1e188a4 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định)

## Iterations

Round 1: E2, E9 failed — E2: lo.json còn liệt kê ba-ho-so-do-san và tat-preview-agent-okr, hai slug mà xu-ly.json nay xếp «chờ làn chủ», nên tập lô lệch tập mong đợi của AC-2; E9: pre-merge-check trên HEAD còn một vi phạm nên cổng gộp chưa sạch. Returned to implementation.
