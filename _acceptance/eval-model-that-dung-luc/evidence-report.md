---
schema_version: 2
feature_slug: eval-model-that-dung-luc
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9c147eb2252956782d9b26971ed09a3af55b9105
human_signoff:
---

# Evidence Report: eval-model-that-dung-luc

Round 1. Mọi eval máy đều chạy xong và đạt, không eval nào đỏ. Verdict REJECT đến từ review: ba phát hiện mức high nằm TRONG hợp đồng (AC-1, AC-6) — xem `review-findings.md`, mục «Trong hợp đồng». Trả lại cho bước cài đặt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-eval-model-that-dung-luc-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_nhan_loi
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 3 tests across 1 file. [91.00ms]

- eval: E2
  run_id: minted-eval-model-that-dung-luc-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_nhat_ky
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 2 tests across 1 file. [109.00ms]

- eval: E3
  run_id: minted-eval-model-that-dung-luc-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_bam
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 2 tests across 1 file. [136.00ms]

- eval: E4
  run_id: minted-eval-model-that-dung-luc-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_dung_lai
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 3 tests across 1 file. [257.00ms]

- eval: E5
  run_id: minted-eval-model-that-dung-luc-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_doi_dau_vao
  verified_at: 2026-10-08T08:15:08Z
  output: |
    SAU: DO MOI: bam doi (250d91389bee1cfe -> 33c47f8fa9739ed0)

- eval: E6
  run_id: minted-eval-model-that-dung-luc-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_vung_xam
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 4 tests across 1 file. [98.00ms]

- eval: E7
  run_id: minted-eval-model-that-dung-luc-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_gop
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 3 tests across 1 file. [108.00ms]

- eval: E8
  run_id: minted-eval-model-that-dung-luc-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_luot_kep
  verified_at: 2026-10-08T08:15:08Z
  output: |
    LUOT 2: DUNG LAI, ma 0, goi 2

- eval: E11
  run_id: minted-eval-model-that-dung-luc-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_ghi_ban_ghi
  verified_at: 2026-10-08T08:15:08Z
  output: |
    KET LUOT: dat in GHI BAN GHI, khong dat khong in

- eval: E12
  run_id: minted-eval-model-that-dung-luc-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.emtdl_do_model
  verified_at: 2026-10-08T08:15:08Z
  output: |
    Ran 3 tests across 1 file. [84.00ms]

- eval: E13
  run_id: minted-eval-model-that-dung-luc-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_cham_lai
  verified_at: 2026-10-08T08:15:08Z
  output: |
    XAM: 18/24 -> CAN HOI LAI: dungTrang (24 cau)

- eval: E9
  run_id: minted-eval-model-that-dung-luc-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_giu_nguong
  verified_at: 2026-10-08T08:15:08Z
  output: |
    PHAM VI: 21 tep, 0 ngoai pham vi

- eval: E10
  run_id: minted-eval-model-that-dung-luc-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.emtdl_dot_bien
  verified_at: 2026-10-08T08:15:08Z
  output: |
    h cham-lai xanh=0 do=1 ghim=ok

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bun run lint:slop
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

- cmd: bunx turbo run build --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T08:15:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Judge panels

Không có eval judgment nào trong vòng này — không có panel nào được đề xuất, không có mục nào cần human_override.

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì review có ba phát hiện mức high nằm trong hợp đồng — hỏi lại vùng xám bỏ sót câu khi hai chỉ số chồng id (AC-6, hai phát hiện cùng gốc) và hàng ZaloHoi kết thúc ở trạng thái lỗi bị tính là model trả lời sai thay vì `loi` (AC-1). Trả lại cho bước cài đặt.

