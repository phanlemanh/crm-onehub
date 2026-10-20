---
schema_version: 2
feature_slug: chu-may-sinh-ten-moi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: da883542e7248732f1fb35d5d1e3ad9eea003fe2
human_signoff:
---

# Evidence Report: chu-may-sinh-ten-moi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward từ round 1) |
| E6 | AC-6 | test | PASS (carry-forward từ round 1) |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | script | PASS (carry-forward từ round 1) |

## Evidence

- eval: E1
  run_id: mvg4cyvpctv8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T03:23:41Z
  output: |
    test-run: dropped crm_mvg4cyvpctv8_test

- eval: E2
  run_id: mvg4cyvpctv8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T03:23:41Z
  output: |
    test-run: dropped crm_mvg4cyvpctv8_test

- eval: E3
  run_id: mvg4cyvpctv8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_loi
  verified_at: 2026-10-20T03:23:41Z
  output: |
    test-run: dropped crm_mvg4cyvpctv8_test

- eval: E4
  run_id: minted-chu-may-sinh-ten-moi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_goc
  verified_at: 2026-10-20T03:23:41Z
  output: |
    test-run: dropped crm_mvg4cysg8asz_test

- eval: E5
  run_id: mvg3ga8j9ssx
  exit_code: 0
  verifier: config:executors.test.cmst_nhac
  verified_at: 2026-10-20T02:58:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-chu-may-sinh-ten-moi-E6-r1
  exit_code: 0
  verifier: config:executors.test.cmst_loi_dan
  verified_at: 2026-10-20T02:58:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-chu-may-sinh-ten-moi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_so_eval_soan
  verified_at: 2026-10-20T03:23:41Z
  output: |
    so-eval-soan: khong tut so voi nen

- eval: E8
  run_id: minted-chu-may-sinh-ten-moi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_so_eval_soan_do
  verified_at: 2026-10-20T03:23:41Z
  output: |
    so-eval-soan-do: 23 ca dung, demChuCu bat dung 2/3 ban ghi

- eval: E9
  run_id: minted-chu-may-sinh-ten-moi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmst_luat
  verified_at: 2026-10-20T03:23:41Z
  output: |
    Ran 4 tests across 1 file. [14.00ms]

- eval: E10
  run_id: minted-chu-may-sinh-ten-moi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_kiem_ke
  verified_at: 2026-10-20T03:23:41Z
  output: |
    kiem-ke: 51 muc o 13 tep (quet 5 vung), khop moc 37dc2da8d, khong con chu cu (dai nhanh-mo 15 commit)

- eval: E11
  run_id: minted-chu-may-sinh-ten-moi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmst_khong_go_bai
  verified_at: 2026-10-20T03:23:41Z
  output: |
    khong-go-bai: 11 tep doi, 0 vi pham (dai nhanh-mo 15 commit)

- eval: E12
  run_id: minted-chu-may-sinh-ten-moi-E12-r1
  exit_code: 0
  verifier: config:executors.script.cmst_thuoc_da_ky
  verified_at: 2026-10-20T02:58:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bunx turbo run lint --force
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bun run lint:slop
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

- cmd: bunx turbo run build --force
  run_id: minted-chu-may-sinh-ten-moi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T03:23:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào pass trên cả HEAD lẫn baseline: mọi eval feature đều là eval mới, baseline n-a (xem mục dưới); các lệnh suite xanh hai phía là regression-guard bình thường.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi.spec.ts": bo qua baseline: tep apps/api/test/chu-may-sinh-ten-moi.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/chu-may-sinh-ten-moi-goc.spec.ts && bun test test/okr-hoi-y.spec.ts -t do-phu && bun test test/okr-khep.spec.ts -t \"sang-cham|cham-va-nhin-lai\" && bun test test/okr-khep-xuat.spec.ts && cd ../agent-okr && bun test test/chu-may-sinh-ten-moi.spec.ts -t cmst-goc-hoi": bo qua baseline: tep apps/api/test/chu-may-sinh-ten-moi-goc.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/so-eval-soan-do.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- cd packages/validation && bun test test/ten-cu-okr.spec.ts -t cmst-luat: bo qua baseline: tep packages/validation/test/ten-cu-okr.spec.ts co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/kiem-ke.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-may-sinh-ten-moi/rang/khong-go-bai.mjs: bo qua baseline: tep _acceptance/chu-may-sinh-ten-moi/rang/khong-go-bai.mjs co o cay dang kiem nhung chua co o merge-base a0b110b06936aec8274c93facfa51755efa200c3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 17 mục trả về, không eval nào đỏ, verdict PASS; sáu finding ngoài hợp đồng đều đề xuất known-limits.
Round 2: sau commit da883542e (siết thước theo bảy mục ngoài hợp đồng của S4 vòng 1) chạy lại E1-E4, E7-E11 và bảy lệnh suite, tất cả xanh; E5, E6, E12 carry-forward từ round 1 vì delta không chạm paths của chúng. Mốc verified_at của các eval chạy lại ở vòng 2 là mốc xấp xỉ do harness không truyền giờ chạy; run_id đối chiếu theo run-log.
