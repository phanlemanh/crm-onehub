---
schema_version: 2
feature_slug: da-gui-dem-dung-kr-cho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 317860ec7f7bde937c022082aeb6e1c36da4c174
human_signoff: Phan Le Manh 2026-10-04 — ký Cổng Bằng chứng trên vòng chấm 1 (6/6 eval máy đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng). Ba mục ngoài hợp đồng định đoạt ở lượt ký này — Ngoài-1, 2 ghi Known limits; Ngoài-3 chấp nhận không sửa. Phạm vi cắt/hoãn đồng ý như đã khai.
---

# Evidence Report: da-gui-dem-dung-kr-cho

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-da-gui-dem-dung-kr-cho-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_dg_da_gui_dom
  verified_at: 2026-10-04T12:13:11Z
  output: |
    Test DOM "da gui dem dung" trong okr-cap-nhat-tuan.dom.tsx: ma tran sau o, ba cot moi o, 18 khang dinh.
    Ran 1 test across 1 file. [729.00ms]

- eval: E2
  run_id: minted-da-gui-dem-dung-kr-cho-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_dg_da_gui_dom
  verified_at: 2026-10-04T12:13:11Z
  output: |
    Cung lan chay voi E1, o AC-2: tap id la KR con lai, tieu de daGui.title(1), khong co cau conCho.
    Ran 1 test across 1 file. [729.00ms]

- eval: E3
  run_id: minted-da-gui-dem-dung-kr-cho-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_dg_da_gui_dom
  verified_at: 2026-10-04T12:13:11Z
  output: |
    Cung lan chay voi E1, o AC-3: daGui.title(1) va dung daGui.conCho(1).
    Ran 1 test across 1 file. [729.00ms]

- eval: E4
  run_id: minted-da-gui-dem-dung-kr-cho-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_dg_da_gui_dom
  verified_at: 2026-10-04T12:13:11Z
  output: |
    Cung lan chay voi E1, o AC-4a (title(2), conCho(1)) va AC-4b (title(3), khong co cau conCho).
    Ran 1 test across 1 file. [729.00ms]

- eval: E5
  run_id: minted-da-gui-dem-dung-kr-cho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.r1c_dg_san_thiet_ke
  verified_at: 2026-10-04T12:13:11Z
  output: |
    design-gate --mode static tren cap-nhat-tuan.tsx: khong co loi P0.

- eval: E6
  run_id: minted-da-gui-dem-dung-kr-cho-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1c_dg_da_gui_dom
  verified_at: 2026-10-04T12:13:11Z
  output: |
    Cung lan chay voi E1, o AC-6: tap id la A va mot KR chua gui, daGui.title(2), dung daGui.conCho(1).
    Ran 1 test across 1 file. [729.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bunx turbo run lint --force
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bun run lint:slop
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

- cmd: bunx turbo run build --force
  run_id: minted-da-gui-dem-dung-kr-cho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T12:13:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt); riêng E5 là sàn thiết kế tĩnh, baseline n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đến E6 đều đạt, mọi lệnh suite đều xanh. Verdict PASS.

### Re-pin lần 1 — 2026-10-04, do gộp onehub da5455f4 sau Cổng 2 (#252, #253 đổi apps/api/workspace)
run_id: repin-20261004T140150Z-67039
sha: 317860ec7f7bde937c022082aeb6e1c36da4c174 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng
