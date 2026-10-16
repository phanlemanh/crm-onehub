---
schema_version: 2
feature_slug: tat-ban-preview
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8cc8391b6634c7edf02b869c02ab5bf91bc7a095
human_signoff:
---

# Evidence Report: tat-ban-preview

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-1, AC-2, AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | judgment | PASS |

không chạy theo hồ sơ: E9

## Evidence

- eval: E1
  run_id: minted-tat-ban-preview-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbp_hop_le
  verified_at: 2026-10-16T05:23:14Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tat-ban-preview-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbp_onehub
  verified_at: 2026-10-16T05:23:14Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tat-ban-preview-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbp_nhanh_khac
  verified_at: 2026-10-16T05:23:14Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-tat-ban-preview-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_pha_thu
  verified_at: 2026-10-16T05:44:46Z
  output: |
    khoa: ma 1, 1 pass, fail [hop-le, onehub-trien-khai, nhanh-khac-khong-trien-khai]

- eval: E5
  run_id: minted-tat-ban-preview-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_goc_du_an_xanh
  verified_at: 2026-10-16T05:44:46Z
  output: |
    khop: crm-onehub-api -> vercel.json (root trong)

- eval: E6
  run_id: minted-tat-ban-preview-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_goc_du_an_do
  verified_at: 2026-10-16T05:44:46Z
  output: |
    lech: crm-onehub-api: Vercel doc vercel.json, bang ghi apps/api/vercel.json

- eval: E7
  run_id: minted-tat-ban-preview-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_preview_xanh
  verified_at: 2026-10-16T05:44:46Z
  output: |
    crm-onehub-agent: 0 deployment cho 9e1336958

- eval: E8
  run_id: minted-tat-ban-preview-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_preview_do
  verified_at: 2026-10-16T05:44:46Z
  output: |
    status Vercel – crm-onehub-agent pending cho 1723dca25

- eval: E10
  run_id: minted-tat-ban-preview-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_production_do
  verified_at: 2026-10-16T05:44:46Z
  output: |
    agent-okr production dpl_7gzCfDYa3dzDcBe4jh36BLmKuTrd (git): CANCELED — The deployment was canceled because the Ignored Build Step command is configured to skip this build.

- eval: E11
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Hội đồng đề xuất PASS, ba góc nhìn đồng thuận. Tài liệu (docs/production.md, setup.md) nói Preview tắt ở cả bốn dự án, chỉ ra tệp tắt của từng dự án (api là vercel.json ở gốc kho; apps/api/vercel.json chỉ mang cron), mọi câu nhắc Preview đang chạy của app/api/agent đều gắn nhãn lịch sử, dặn kiểm bản Production Ready sau khi đổi vercel.json hay cài đặt build, và cấm dùng Ignored Build Step theo VERCEL_ENV.
  panel_proposal:
    - domain-correctness: PASS — (1) production.md dòng 103–118 nói Preview tắt ở cả bốn dự án (16/10), có bảng Root Directory và tệp tắt của từng dự án; dòng 115 nói apps/api/vercel.json không tắt được gì, chỉ chứa cron; setup.md dòng 341–346 nói lại đúng như vậy; ba tệp app/agent/gốc đều có `"**": false, "onehub": true`. (2) Câu nào nói về Preview của app, API, agent đều đi kèm mốc «Trước 16/10», «Before that» hoặc «Từ 16/10 không bản Preview nào được dựng». (3) production.md dòng 385–386 và setup.md dòng 249–251 dặn kiểm bản Production dựng từ git là Ready, không phải Canceled. (4) Cả hai tài liệu cảnh báo không dùng Ignored Build Step theo VERCEL_ENV; bảng cài đặt ghi nó là «empty».
    - operational-feasibility: PASS — Tài liệu nêu rõ Preview tắt ở cả bốn dự án, chỉ ra tệp tắt của từng dự án (api là vercel.json ở gốc kho; apps/api/vercel.json chỉ mang cron, khớp nội dung tệp), và mọi câu nhắc Preview đang chạy của app/api/agent đều gắn nhãn lịch sử. Tài liệu dặn kiểm Production Ready (không Canceled) sau khi đổi vercel.json hay cài đặt build, và cấm dùng Ignored Build Step theo VERCEL_ENV.
    - spec-alignment: PASS — (1) production.md dòng 103 nói Preview tắt ở cả bốn dự án; bảng dòng 108-113 ghi từng tệp tắt, api là vercel.json ở gốc kho; dòng 115 nói rõ apps/api/vercel.json chỉ chứa cron và tệp đó đúng là chỉ có `crons`; ba tệp còn lại có `git.deploymentEnabled` `{"**": false, "onehub": true}`. (2) Mọi câu về Preview của app, API, agent đều đặt trong khung lịch sử hoặc đã tắt. (3) Kiểm Production là Ready chứ không phải Canceled có ở production.md dòng 383-386 và setup.md dòng 250-251. (4) Cả hai tài liệu cấm dùng Ignored Build Step `$VERCEL_ENV` và chỉ ra sự cố 04/10.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-tat-ban-preview-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bun run lint:slop
  run_id: minted-tat-ban-preview-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

- cmd: bunx turbo run build --force
  run_id: minted-tat-ban-preview-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-16T05:44:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- bun _acceptance/tat-ban-preview/rang/pha-thu.mjs: bo qua baseline: tep _acceptance/tat-ban-preview/rang/pha-thu.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/goc-du-an.mjs xanh: bo qua baseline: tep _acceptance/tat-ban-preview/rang/goc-du-an.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/goc-du-an.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/goc-du-an.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-preview.mjs xanh: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-preview.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-preview.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-preview.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-production.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-production.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 16/16 lệnh trả về, toàn bộ xanh; hồ sơ ghi 5 finding ngoài hợp đồng và 1 finding trong hợp đồng (AC-5, vế commit status của E7/E8).
Round 2: chạy lại E4, E5, E6, E7, E8, E10 và bảy lệnh suite, tất cả xanh; E1, E2, E3 mang sang từ round 1 vì delta không chạm paths của chúng. Ghi chú: payload không kèm giờ chạy của round 2 nên verified_at của round này lấy theo ngày 2026-10-16.
