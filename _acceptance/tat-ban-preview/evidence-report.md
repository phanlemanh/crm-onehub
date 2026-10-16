---
schema_version: 2
feature_slug: tat-ban-preview
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36c64c8281e5fac0bf651c3be0d58d2ca89af64c
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
  output: |
    Ran 1 test across 1 file. [21.00ms]

- eval: E2
  run_id: minted-tat-ban-preview-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbp_onehub
  verified_at: 2026-10-16T05:23:14Z
  output: |
    Ran 1 test across 1 file. [27.00ms]

- eval: E3
  run_id: minted-tat-ban-preview-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbp_nhanh_khac
  verified_at: 2026-10-16T05:23:14Z
  output: |
    Ran 2 tests across 1 file. [24.00ms]

- eval: E4
  run_id: minted-tat-ban-preview-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_pha_thu
  verified_at: 2026-10-16T05:23:14Z
  output: |
    khoa: ma 1, 1 pass, fail [hop-le, onehub-trien-khai, nhanh-khac-khong-trien-khai]

- eval: E5
  run_id: minted-tat-ban-preview-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_goc_du_an_xanh
  verified_at: 2026-10-16T05:23:14Z
  output: |
    khop: crm-onehub-api -> vercel.json (root trong)

- eval: E6
  run_id: minted-tat-ban-preview-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_goc_du_an_do
  verified_at: 2026-10-16T05:23:14Z
  output: |
    (khong in dong nao; ham bao lech dung nhu che do do doi yeu cau)

- eval: E7
  run_id: minted-tat-ban-preview-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_preview_xanh
  verified_at: 2026-10-16T05:23:14Z
  output: |
    crm-onehub-agent: 0 deployment cho 9e1336958

- eval: E8
  run_id: minted-tat-ban-preview-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_preview_do
  verified_at: 2026-10-16T05:23:14Z
  output: |
    status Vercel – crm-onehub-agent pending cho 1723dca25

- eval: E10
  run_id: minted-tat-ban-preview-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbp_vercel_production_do
  verified_at: 2026-10-16T05:23:14Z
  output: |
    agent-okr production dpl_7gzCfDYa3dzDcBe4jh36BLmKuTrd (git): CANCELED — The deployment was canceled because the Ignored Build Step command is configured to skip this build.

### Judgment

Panel de xuat cho E11 (3 judge, fresh context; human_override de trong cho nguoi dien o Cong 2).

- eval: E11
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ca ba lens deu cho PASS — tai lieu neu Preview tat o ca bon du an kem bang tep, moi cau ve Preview chay thuc deu dat o thi qua khu hoac dieu kien, co loi dan kiem Production Ready, va cam Ignored Build Step theo VERCEL_ENV.
  human_override:  # chi nguoi ghi

  Phieu cua tung judge:
  - domain-correctness: PASS — (1) production.md noi Preview tat o ca bon du an (16/10). Bang liet ke dung tep cua tung du an, api la vercel.json o goc kho. Cung doan do va setup.md deu noi apps/api/vercel.json khong tat duoc gi, chi mang nam cron; ba tep vercel.json o goc, apps/app va apps/agent khop loi tai lieu. (2) Moi cau ve Preview cua app/API/agent deu danh dau la qua khu («Truoc 16/10…», «Before that, previews shared…») hoac la dieu kien («Tu 16/10 khong ban Preview nao duoc dung»); khong thay cau nao ta Preview nhu dang chay. (3) va (4) Ca hai tai lieu deu dan kiem ban Production dung tu git la Ready chu khong phai Canceled sau khi doi vercel.json hoac cai dat build. Ca hai cung cam Ignored Build Step theo VERCEL_ENV va neu su co 04/10 lam bang chung.
  - operational-feasibility: PASS — Ca 4 cau deu dat. (1) production.md (muc Preview, bang Root Directory) va setup.md (muc Migrations) noi Preview tat o ca bon du an tu 16/10. Moi du an co tep rieng; api dung vercel.json o goc kho, con apps/api/vercel.json chi mang cron va «khong tat duoc gi». Hai tep app va agent trong input khop loi ta. (2) Moi cau nhac Preview chay that deu gan «Truoc 16/10», «Before that», «Tu 16/10 khong ban Preview nao duoc dung». Khong con cau nao ta Preview nhu dang chay. (3) Ca hai tai lieu dan sau moi lan doi vercel.json hay cai dat build phai kiem ban Production dung tu git la Ready, khong phai Canceled. (4) Khong cau nao khuyen dung Ignored Build Step theo VERCEL_ENV; ca hai neu no la bay ngay 04/10 va cam dung.
  - spec-alignment: PASS — Tai lieu neu ro Preview tat o ca bon du an voi bang tep tat tung du an (api dung vercel.json o goc kho; apps/api/vercel.json chi mang cron va khong tat duoc gi), va ba tep vercel.json da doc khop. Cac cau nhac Preview cua app/api/agent deu duoc danh dau la qua khu («Truoc 16/10…», «Before that…»). Ca production.md lan setup.md deu dan kiem ban Production Ready (khong Canceled) sau khi doi vercel.json hay cai dat build, va cam dung Ignored Build Step theo VERCEL_ENV.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tat-ban-preview-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-tat-ban-preview-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bun run lint:slop
  run_id: minted-tat-ban-preview-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

- cmd: bunx turbo run build --force
  run_id: minted-tat-ban-preview-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T05:23:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-preview-moi-du-an.spec.ts -t hop-le: bo qua baseline: tep apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-preview-moi-du-an.spec.ts -t onehub-trien-khai: bo qua baseline: tep apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/vercel-preview-moi-du-an.spec.ts -t "nhanh-khac-khong-trien-khai|bo-khop-bat-bay-sao": bo qua baseline: tep apps/agent-okr/test/vercel-preview-moi-du-an.spec.ts co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/pha-thu.mjs: bo qua baseline: tep _acceptance/tat-ban-preview/rang/pha-thu.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/goc-du-an.mjs xanh: bo qua baseline: tep _acceptance/tat-ban-preview/rang/goc-du-an.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/goc-du-an.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/goc-du-an.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-preview.mjs xanh: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-preview.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-preview.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-preview.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tat-ban-preview/rang/vercel-production.mjs do: bo qua baseline: tep _acceptance/tat-ban-preview/rang/vercel-production.mjs co o cay dang kiem nhung chua co o merge-base 34d31a8bfec1dbade4903cce2e00848bdf62ccd5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval may (E1-E8, E10) va 7 lenh suite deu xanh, E11 do hoi dong judge de xuat PASS; E9 khong chay theo ho so. Khong co eval that bai.
