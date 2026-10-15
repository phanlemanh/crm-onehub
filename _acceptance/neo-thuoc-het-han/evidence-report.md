---
schema_version: 2
feature_slug: neo-thuoc-het-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5e50f1918b99206257eb749539ecfec34f24dbb7
human_signoff:
---

# Evidence Report: neo-thuoc-het-han

Round 3. Sáu eval của hợp đồng (E1 đến E6) đều đạt; E3 mang từ round 1 vì delta không chạm paths của nó. Bảy lệnh suite không gắn eval đều xanh ở round này.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | script | PASS |
| E5 | AC-6 | script | PASS |
| E6 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-neo-thuoc-het-han-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chay_o_dinh
  verified_at: 2026-10-15T08:42:55Z
  output: |
    chay-o-dinh: dat

- eval: E2
  run_id: minted-neo-thuoc-het-han-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_hai_ref
  verified_at: 2026-10-15T08:42:55Z
  output: |
    hai-ref: dat

- eval: E3
  run_id: minted-neo-thuoc-het-han-E3-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.lmcv_loi_khong_lam_moi
  verified_at: 2026-10-15T06:22:43Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-neo-thuoc-het-han-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_chieu_do
  verified_at: 2026-10-15T08:42:55Z
  output: |
    chieu-do: 5/5 bi bat

- eval: E5
  run_id: minted-neo-thuoc-het-han-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_pham_vi
  verified_at: 2026-10-15T08:42:55Z
  output: |
    pham-vi: dat

- eval: E6
  run_id: repin-20261015T061648Z-91798
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nth_ghim_xanh
  verified_at: 2026-10-15T08:42:55Z
  output: |
    ghim-xanh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bunx turbo run lint --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bun run lint:slop
  run_id: minted-neo-thuoc-het-han-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

- cmd: bunx turbo run build --force
  run_id: minted-neo-thuoc-het-han-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-15T08:42:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval o tren la n-a.

Eval không phân biệt (xanh ở cả HEAD lẫn baseline): E3, lệnh `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-chuyen-viec.dom.tsx -t loi-khong-lam-moi`. Nó chứng minh harness và là regression-guard có chủ ý cho hồ sơ lam-moi-chuyen-viec-qua-loi-chung; muốn nó đo hành vi mới thì phải viết lại để assert thứ chỉ vòng này thêm.

Không có lệnh nào ngoài eval bị đỏ ở round này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ (E1 đến E6 đạt); lệnh suite `bun run test -- --filter=agent-okr ...` đỏ ở `app-rieng > chạy cạnh apps/agent` (quá 5000ms, ConnectionRefused), nên verdict là REJECT. Trả về giai đoạn cài đặt.
Round 2: E1, E2, E4, E5, E6 chạy lại và đạt, E3 mang từ round 1; cả bảy lệnh suite xanh, kể cả lệnh `agent-okr`. Còn một phát hiện trong hợp đồng về đối chứng hai-ref (so bản sao răng ở cây tạm với răng gốc), đã sửa ở commit 67dde775b.
Round 3: E1, E2, E4, E5, E6 chạy lại ở 5e50f1918 và đạt (E2 nay so cùng bản sao trước và sau commit giả), E3 mang từ round 1; cả bảy lệnh suite xanh. Verdict PASS.
