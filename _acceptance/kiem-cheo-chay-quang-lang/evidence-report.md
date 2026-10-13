---
schema_version: 2
feature_slug: kiem-cheo-chay-quang-lang
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: efb35a7d57ca6e75c530fb7af99a3a97f6be7aa4
human_signoff: "Phan Le Manh 2026-10-10 — ký lại Cổng 2 trên verdict PASS 4/4 eval + 7 suite (S4 vòng 3, wf_cf3b810e-33c, sau bản sửa P4-67); Ngoài 1–6, 8–10 ghi Known limits, Ngoài 7 chấp nhận không sửa; đồng ý cắt; Treo phê hết"
---

# Evidence Report: kiem-cheo-chay-quang-lang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2, AC-3, AC-5 | script | PASS |
| E3 | AC-2, AC-3, AC-4, AC-5, AC-7 | script | PASS |
| E4 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_lich
  verified_at: 2026-10-10T05:20:05Z
  output: |
    node --test scripts/dieu-phoi/test/lich.test.mjs
    ℹ duration_ms 60.192542

- eval: E2
  run_id: minted-kiem-cheo-chay-quang-lang-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_tien_do
  verified_at: 2026-10-10T05:20:05Z
  output: |
    node --test scripts/kiem-cheo/test/tien-do.test.mjs
    ℹ duration_ms 67.401375

- eval: E3
  run_id: minted-kiem-cheo-chay-quang-lang-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_hai_dem
  verified_at: 2026-10-10T05:20:05Z
  output: |
    node --test scripts/kiem-cheo/test/dem.test.mjs
    ℹ duration_ms 22874.394416

- eval: E4
  run_id: minted-kiem-cheo-chay-quang-lang-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcq_noi_f9
  verified_at: 2026-10-10T05:20:05Z
  output: |
    node _acceptance/kiem-cheo-chay-quang-lang/rang/noi-f9.mjs
    noi-f9: XANH

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bunx turbo run lint --force
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bun run lint:slop
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

- cmd: bunx turbo run build --force
  run_id: minted-kiem-cheo-chay-quang-lang-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-10T05:20:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (xanh tren ca code moi lan baseline cuoi cua round 1; chung minh harness chu chua chung minh feature, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- E1 (node --test scripts/dieu-phoi/test/lich.test.mjs)
- E3 (node --test scripts/kiem-cheo/test/dem.test.mjs)

Cac lenh suite xanh tren ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — moi eval chay mot lan, deterministic, khong eval nao co pass_rate hon hop.

## Judge

Khong co eval judgment nao trong hop dong nay (ca bon eval E1 den E4 deu la executor script), nen khong co hoi dong judge va khong co muc nao cho human_override.

## Iterations

Round 1: E2, E3 REJECT — t4, t5 trong AC-2 (phan loai tung ho so khi lan cham tran, vuot tran van phai luu tien do; tran lan phai nho hon tran luot). Returned to implementation (commit 774922da5: phan loai tung ho so, vuot tran van luu tien do, lan tran 60 phut, doc suite chay lai).
Round 2: E1, E2, E3, E4 PASS va bay lenh suite xanh tren cay 7bb5ddf7.
Round 3: E1, E2, E3, E4 PASS va bay lenh suite xanh tren cay db99fd8bb sau ban sua phan loai vuot tran o duong ma 0/1 ve khong-chay-duoc (F9 AC-8); the Cong 2 va trang bang chung can ve lai truoc khi ky lai.

### Re-pin lần 1 — 2026-10-12, do chuyen-goi-dieu-phoi: ghim lại sau khi gỡ scripts/dieu-phoi và nhận kit 2.28.0
run_id: repin-20261012T222532Z-81286
sha: efb35a7d57ca6e75c530fb7af99a3a97f6be7aa4 · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E1, E4 · thay bởi hồ sơ đã ký: E1→chuyen-goi-dieu-phoi#AC-5, E4→chuyen-goi-dieu-phoi#AC-9 · AC không có chốt máy: AC-1, AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
