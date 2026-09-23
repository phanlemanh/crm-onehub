---
schema_version: 2
feature_slug: moi-bai-kiem-dom-deu-chay
verdict: BLOCKED
failed_evals: []
reason: "bunx turbo run build --force — agent bị skip/chết, không có kết quả, không được tính là pass"
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6ea9cee7a934eb36169bcfc20f50e789bddb4c86
human_signoff:
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
  run_id: minted-moi-bai-kiem-dom-deu-chay-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_du_tep_app
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    app: 16 tep tren dia, 16 tep da chay, ma 0
    khang-dinh: 17 (= 16 tep + 1 ma thoat)

- eval: E2
  run_id: minted-moi-bai-kiem-dom-deu-chay-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_du_tep_ui
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    ui: 1 tep tren dia, 1 tep da chay, ma 0
    khang-dinh: 3 (= 1 tep + 1 ma thoat + 1 luot spec (9 tep))

- eval: E3
  run_id: minted-moi-bai-kiem-dom-deu-chay-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_tep_moi
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    khang-dinh: 4 (= 2 goi x 2)

- eval: E4
  run_id: minted-moi-bai-kiem-dom-deu-chay-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_tep_do
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    khang-dinh: 4 (= 2 goi x 2)

- eval: E5
  run_id: minted-moi-bai-kiem-dom-deu-chay-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_cach_ly
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    khang-dinh: 18 (= 1 + 16 luot + 1)

- eval: E6
  run_id: minted-moi-bai-kiem-dom-deu-chay-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_mui_gio
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    khang-dinh: 2

- eval: E7
  run_id: minted-moi-bai-kiem-dom-deu-chay-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.bkd_goc
  verified_at: 2026-09-23T09:40:00+07:00
  output: |
    khang-dinh: 6 (= 2 goi x 3)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mue7tr6c644g
  exit_code: 0
  verified_at: 2026-09-23T09:40:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-moi-bai-kiem-dom-deu-chay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-23T09:40:00+07:00

- cmd: bun run lint:slop
  run_id: minted-moi-bai-kiem-dom-deu-chay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-23T09:40:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 7 eval script (E1-E7) và ba lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop) đều chạy thật và xanh. Lệnh thứ năm của bộ chứng, `bunx turbo run build --force`, không có kết quả — agent phụ trách bị skip/chết trước khi lệnh chạy xong, nên không có exit code và không được tính là pass. Verdict tổng là BLOCKED vì thiếu bằng chứng của lệnh build, không phải vì có eval nào đỏ. Cần chạy lại `bunx turbo run build --force` một cách độc lập rồi mới tính lại verdict.
