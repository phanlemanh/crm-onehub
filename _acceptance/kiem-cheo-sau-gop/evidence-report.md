---
schema_version: 2
feature_slug: kiem-cheo-sau-gop
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b9acad6b77fde52541221e857cd2eb01d839e45f
human_signoff: Phan Le Manh 2026-10-09 — ký Cổng 2 trên verdict PASS 5/5 eval (S4 vòng 6, wf_686b6af2-c44). Ngoài-1..5, 7..9 (thẻ vòng 5) và Ngoài-1 (thẻ vòng 6) ghi Known limits; Ngoài-6 (vòng 5) và Ngoài-2 (vòng 6) chấp nhận, không sửa; Ngoài-10..12 (vòng 5) mở hợp đồng mới; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: kiem-cheo-sau-gop

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4, AC-7, AC-9, AC-10 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-6, AC-8 | script | PASS |
| E4 | AC-11 | script | PASS |
| E5 | AC-12, AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-kiem-cheo-sau-gop-E1-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcs_don_vi
  verified_at: 2026-10-08T17:52:48Z
  output: |
    cmd: node --test "scripts/kiem-cheo/test/*.test.mjs"
    runs: 1, passes: 1, variance: false
    ℹ duration_ms 3314.003125

- eval: E2
  run_id: minted-kiem-cheo-sau-gop-E2-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcs_lich
  verified_at: 2026-10-08T17:52:48Z
  output: |
    cmd: node --test scripts/dieu-phoi/test/lich.test.mjs
    runs: 1, passes: 1, variance: false
    ℹ duration_ms 65.280625

- eval: E3
  run_id: minted-kiem-cheo-sau-gop-E3-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcs_pha_thu
  verified_at: 2026-10-08T17:52:48Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs
    runs: 1, passes: 1, variance: false
    pha-thu: moi o dat

- eval: E4
  run_id: minted-kiem-cheo-sau-gop-E4-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcs_ranh_gioi
  verified_at: 2026-10-08T17:52:48Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs
    runs: 1, passes: 1, variance: false
    ranh-gioi: ban that sach, ba chieu do do dung cho

- eval: E5
  run_id: minted-kiem-cheo-sau-gop-E5-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcs_kho_that
  verified_at: 2026-10-08T17:52:48Z
  output: |
    cmd: node _acceptance/kiem-cheo-sau-gop/rang/kho-that.mjs
    runs: 1, passes: 1, variance: false
    kho-that: xanh — 3 lan gop, 98 ho so cham (mot dong: bo-xuong-kara,chu-cuoi-cung-tien-de,do-man-tren-kho-rieng,don-okr-nhap-sai,gop-y-dung-cho,hop-thoai-giu-cho-dang-nhap,khung-okr-truoc-r1,khung-tao-okr-nhu-deal,muc-tieu-va-kr,neo-dan-so

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_api-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_app_filter_crm_ui-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_filter_crm_aut-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_test_filter_agent_okr_filter_crm-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bun run lint:slop
  run_id: minted-kiem-cheo-sau-gop-SUITE-bun_run_lint_slop-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

- cmd: bunx turbo run build --force
  run_id: minted-kiem-cheo-sau-gop-SUITE-bunx_turbo_run_build_force-r6
  exit_code: 0
  verified_at: 2026-10-08T17:52:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 5 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Field baseline cua tung eval ghi n-a.

Eval khong phan biet (xanh tren ca HEAD lan baseline round 5, chung minh harness chu khong phai feature; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E1 — `node --test "scripts/kiem-cheo/test/*.test.mjs"`
- E2 — `node --test scripts/dieu-phoi/test/lich.test.mjs`

Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Variance

none — khong eval nao co runs > 1; moi eval deterministic (runs: 1) va deu dat.

## Iterations

Round 5: PASS — 12/12 lenh tra ve, khong bi chan (theo run-log).
Round 6: PASS — 5 eval (E1-E5) va 7 lenh suite deu dat tren verified_commit 924875d7f0f7302df3600bb27559b17092501b27; khong co eval nao khai judgment nen khong co panel.

### Re-pin lần 1 — 2026-10-10, do hoá cũ do kiem-cheo-chay-quang-lang (F26) chạm scripts/kiem-cheo, scripts/dieu-phoi; E2 chuyển superseded_by; ca (j) theo AC-2
run_id: repin-20261010T074739Z-98603
sha: 4834db21ae11577f931eb0e5ed449fdac675d702 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2 · thay bởi hồ sơ đã ký: E2→kiem-cheo-chay-quang-lang#AC-1 · AC không có chốt máy: AC-5 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-12, do chuyen-goi-dieu-phoi: ghim lại sau khi gỡ scripts/dieu-phoi và nhận kit 2.28.0
run_id: repin-20261012T222532Z-81286
sha: efb35a7d57ca6e75c530fb7af99a3a97f6be7aa4 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2, E5 · thay bởi hồ sơ đã ký: E2→chuyen-goi-dieu-phoi#AC-5, E5→chuyen-goi-dieu-phoi#AC-7 · AC không có chốt máy: AC-5, AC-12, AC-1 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-14, do F24 ba-ho-so-do-san: sửa thước chết và răng đỏ sẵn (phạm vi A, làn C 12 hồ sơ)
run_id: repin-20261014T001054Z-11514
sha: aeacc862fc3a28e5391c27772a4ad96e16ae3317 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2, E5 · thay bởi hồ sơ đã ký: E2→chuyen-goi-dieu-phoi#AC-5, E5→chuyen-goi-dieu-phoi#AC-7 · AC không có chốt máy: AC-5, AC-12, AC-1 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-15, do ghim ở đỉnh sau gộp onehub 3818ad4ec, ngay trước gộp #406 (làn X lần 2, 11 hồ sơ)
run_id: repin-20261014T231434Z-99400
sha: b9acad6b77fde52541221e857cd2eb01d839e45f · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2, E5 · thay bởi hồ sơ đã ký: E2→chuyen-goi-dieu-phoi#AC-5, E5→chuyen-goi-dieu-phoi#AC-7 · AC không có chốt máy: AC-5, AC-12, AC-1 · chập chờn (đỏ lần đầu, đạt khi chạy lại): lenh-dung-do-khong-ai-thay E8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
