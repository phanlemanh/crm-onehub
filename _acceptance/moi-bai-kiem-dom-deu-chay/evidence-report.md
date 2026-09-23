---
schema_version: 2
feature_slug: moi-bai-kiem-dom-deu-chay
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 41b7b5981c8fc04964711de25d51481c3127f3a5
human_signoff: Manh Phan 2026-09-23
---

# Evidence Report: moi-bai-kiem-dom-deu-chay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-moi-bai-kiem-dom-deu-chay-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_du_tep_app
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    app: 16 tep tren dia, 16 tep da chay, ma 0
    khang-dinh: 19 (= 2 tep ghim + 16 tep + 1 ma thoat)

- eval: E2
  run_id: minted-moi-bai-kiem-dom-deu-chay-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_du_tep_ui
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    ui: 1 tep tren dia, 1 tep da chay, ma 0
    khang-dinh: 4 (= 1 tep ghim + 1 tep + 1 ma thoat + 1 luot spec (9 tep))

- eval: E3
  run_id: minted-moi-bai-kiem-dom-deu-chay-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_tep_moi
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    khang-dinh: 6 (= 2 goi x 3)

- eval: E4
  run_id: minted-moi-bai-kiem-dom-deu-chay-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_tep_do
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    khang-dinh: 4 (= 2 goi x 2)

- eval: E5
  run_id: minted-moi-bai-kiem-dom-deu-chay-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_cach_ly
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    khang-dinh: 18 (= 1 + 16 luot + 1)

- eval: E6
  run_id: minted-moi-bai-kiem-dom-deu-chay-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_mui_gio
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    khang-dinh: 2

- eval: E7
  run_id: minted-moi-bai-kiem-dom-deu-chay-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_goc
  verified_at: 2026-09-23T22:08:00+07:00
  output: |
    khang-dinh: 8 (= 2 goi x 4)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue8nfm6puw3
  exit_code: 0
  verified_at: 2026-09-23T22:08:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-moi-bai-kiem-dom-deu-chay-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-23T22:08:00+07:00

- cmd: bun run lint:slop
  run_id: minted-moi-bai-kiem-dom-deu-chay-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-23T22:08:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-moi-bai-kiem-dom-deu-chay-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-23T22:08:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào runs > 1 trong round này (không có phương sai)

## Iterations

Round 1: 7 eval script (E1-E7) và ba lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop) đều chạy thật và xanh, nhưng lệnh thứ năm `bunx turbo run build --force` không có kết quả — agent phụ trách bị skip/chết trước khi lệnh chạy xong. Verdict BLOCKED vì thiếu bằng chứng của lệnh build, không phải vì có eval nào đỏ.
Round 2: chạy lại đủ cả năm lệnh của bộ chứng (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) cùng cả 7 eval script; tất cả xanh, mã thoát 0, có bằng chứng đầy đủ. Verdict PASS.

### Re-pin lần 1 — 2026-09-23, do kéo onehub mới (#97) vào nhánh
run_id: repin-20260923T153324Z-22396
sha: 41b7b5981c8fc04964711de25d51481c3127f3a5 · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng
