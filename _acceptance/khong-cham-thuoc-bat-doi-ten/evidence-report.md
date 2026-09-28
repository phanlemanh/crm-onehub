---
schema_version: 2
feature_slug: khong-cham-thuoc-bat-doi-ten
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a831f519f7ab792b1411655cbc78cbcf0ed20097
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: khong-cham-thuoc-bat-doi-ten

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khong-cham-thuoc-bat-doi-ten-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kct_doi_ten_commit
  verified_at: 2026-09-28T14:20:17Z
  output: |
    node _acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs --ca C1,C2

    __EXIT=0

- eval: E2
  run_id: minted-khong-cham-thuoc-bat-doi-ten-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kct_doi_ten_stage
  verified_at: 2026-09-28T14:20:17Z
  output: |
    node _acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs --ca C3
    C3: dat

    __EXIT=0

- eval: E3
  run_id: minted-khong-cham-thuoc-bat-doi-ten-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kct_khong_hoi_quy
  verified_at: 2026-09-28T14:20:17Z
  output: |
    node _acceptance/khong-cham-thuoc-bat-doi-ten/rang/doi-ten.mjs --ca C4,C5,C6
    C6: dat

    __EXIT=0

- eval: E4
  run_id: minted-khong-cham-thuoc-bat-doi-ten-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bclkt_khong_cham_thuoc
  verified_at: 2026-09-28T14:20:17Z
  output: |
    node _acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs

    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-khong-cham-thuoc-bat-doi-ten-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T14:20:17Z

- cmd: bunx turbo run lint --force
  run_id: minted-khong-cham-thuoc-bat-doi-ten-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T14:20:17Z

- cmd: bun run lint:slop
  run_id: minted-khong-cham-thuoc-bat-doi-ten-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T14:20:17Z

- cmd: bunx turbo run build --force
  run_id: minted-khong-cham-thuoc-bat-doi-ten-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T14:20:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

E4 (cmd: `node _acceptance/bo-chu-lap-keo-tha/rang/khong-cham-thuoc.mjs`) — pass trên cả HEAD lẫn baseline diffBase (baseline: green). Đây là regression-guard có chủ ý: E4 chạy nguyên văn eval E5b của hồ sơ bo-chu-lap-keo-tha để xác nhận nhánh khong-cham-thuoc-bat-doi-ten không làm hồi quy thước đã ký trước đó, không phải một khẳng định hành vi mới của tính năng này — E1, E2, E3 (các eval thật sự khẳng định hành vi mới) đều đỏ trên baseline (phân biệt được).

## Variance

none — không eval nào có runs > 1 (mọi eval trong round này là deterministic, runs=1); không có kết quả flaky giữa các lần chạy.

## Iterations

Round 1: E1, E2, E3, E4 cùng bốn lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều pass ngay từ lần chạy đầu (exit 0); không có vòng sửa lại nào trước round này.

### Re-pin lần 1 — 2026-09-28, do gộp onehub sau #197 làm hai hồ sơ hoá cũ
run_id: repin-20260928T150205Z-95412
sha: d396c87d065ff5bb77bb79882c1bb576b46bc30a · suites: 4 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-28, do gộp onehub sau #198 làm hai hồ sơ hoá cũ
run_id: repin-20260928T153556Z-55843
sha: a831f519f7ab792b1411655cbc78cbcf0ed20097 · suites: 4 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng
