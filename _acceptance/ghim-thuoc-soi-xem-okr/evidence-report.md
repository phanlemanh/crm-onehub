---
schema_version: 2
feature_slug: ghim-thuoc-soi-xem-okr
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 70251da122d5f0170c2a6e14b56977e36f9f39fa
human_signoff:
---

# Evidence Report: ghim-thuoc-soi-xem-okr

Round 1. Mọi eval máy đều xanh. Eval E3 (judgment) chờ người: hội đồng ba judge đề xuất FAIL, cả ba phiếu cùng chiều, nên verdict tổng là PENDING-JUDGMENT và người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | judgment | UNCERTAIN (hội đồng đề xuất FAIL, chờ người quyết) |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6a | AC-6 | script | PASS |
| E6b | AC-6 | script | PASS |
| E6c | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ghim-thuoc-soi-xem-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ghd_soi_xem
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem
    XANH

- eval: E2
  run_id: minted-ghim-thuoc-soi-xem-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtsx_mien_hai_chieu
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/ghim-thuoc-soi-xem-okr/rang/mien-hai-chieu.mjs
    XANH 11/11 ca bat

- eval: E3
  judged_by: hội đồng ba judge (domain-correctness, operational-feasibility, spec-alignment), context sạch
  verdict: UNCERTAIN
  panel_proposal: FAIL
  rationale: Máy không tự chốt mục judgment. Hội đồng đề xuất FAIL với ba phiếu cùng chiều, người quyết ở Cổng 2. Hai chỗ nói quá so với bảng nguồn nằm ở lyDo của dòng congSuaCanChinh (bỏ ngoại lệ «trừ ca đua Ngoài-5») và của dòng xoaMucTieu okrObjective (thêm «và KR» trong khi bảng chỉ ghi đọc tiêu đề).
  votes:
    - domain-correctness: FAIL — Năm dòng khớp bảng. Dòng congSuaCanChinh (hàng 6 và 7) viết «đích giới hạn không có căn chỉnh» tuyệt đối, trong khi bảng ghi «mục tiêu giới hạn không căn chỉnh được (trừ ca đua Ngoài-5)», nên lyDo bỏ mất ngoại lệ của bảng. Dòng xoaMucTieu okrObjective thêm «và KR» trong khi bảng hàng 2 chỉ ghi đọc title của chính mt.id.
    - operational-feasibility: FAIL — Dòng 6 (congSuaCanChinh) nêu đúng hai người gọi và assertSuaMucTieu ngay sau, nhưng thêm câu «đích giới hạn không có căn chỉnh» không kèm ngoại lệ. Ghi chú #6/#7 của bảng chỉ cho phép nói «mục tiêu giới hạn không căn chỉnh được (trừ ca đua Ngoài-5)», nên câu này nói quá bảng. Dòng 2 (xoaMucTieu okrObjective) còn viết «đọc tiêu đề và KR», trong khi bảng #2 chỉ chứng «đọc title của chính mt.id».
    - spec-alignment: FAIL — Năm dòng khớp bảng (xoaMucTieu tho:okrKeyResult, lichSuMucTieu, mine, coKrSuaDuoc, suaLyDoCanChinh). Dòng congSuaCanChinh nêu đủ hai người gọi và assertSuaMucTieu, nhưng câu «đích giới hạn không có căn chỉnh» bỏ ngoại lệ «trừ ca đua Ngoài-5» của ghi chú #6/#7, nên nói quá bảng. Dòng xoaMucTieu okrObjective ghi «đọc tiêu đề và KR» trong khi hàng 2 chỉ ghi đọc title.
  required_evidence:
    - Sửa lyDo dòng congSuaCanChinh trong _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs (khoảng dòng 154-159): bỏ «đích giới hạn không có căn chỉnh», hoặc ghi kèm «trừ ca đua Ngoài-5» đúng như ghi chú #6/#7 của _acceptance/ghim-thuoc-soi-xem-okr/nguon/phan-loai-soi-xem.md. Mở lại mảng MIEN_XEM để xác nhận câu mới.
    - Sửa lyDo dòng xoaMucTieu okrObjective (soi-ma.mjs khoảng dòng 172-177) cho khớp hàng 2 của bảng (chỉ đọc tiêu đề), hoặc bổ sung vào phan-loai-soi-xem.md hàng 2 chứng cứ rằng okrObjective.findUniqueOrThrow ở okr.service.ts:1020 còn đọc KR. Mở lại hai tệp để xác nhận hai bên khớp.
  human_override:  # chi nguoi ghi

- eval: E4
  run_id: minted-ghim-thuoc-soi-xem-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtsx_buoc_ci
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs
    bat doi-run

- eval: E5
  run_id: minted-ghim-thuoc-soi-xem-okr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtsx_buoc_ci_chay
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs --chay
    lenh cua buoc: bun _acceptance/gioi-han-duyet-cay-okr/rang/soi-ma.mjs --ca xem

- eval: E6a
  run_id: minted-ghim-thuoc-soi-xem-okr-E6a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lkv_ci
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/luat-kho-vong-doi/rang/ci.mjs
    ci: .github/workflows/acceptance.yml co job chay `node scripts/luat-kho/do-cay.mjs --du-luat` sau `bun install --frozen-lockfile`, chan khi do, du bien postinstall can; bon chieu do dung cho

- eval: E6b
  run_id: minted-ghim-thuoc-soi-xem-okr-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cgdp_cong
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/chuyen-goi-dieu-phoi/rang/cong.mjs
    KET LUAN: xanh

- eval: E6c
  run_id: minted-ghim-thuoc-soi-xem-okr-E6c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.kcb_khong_noi_tran
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs khong-noi-tran
    khong-noi-tran: 29 dat, 0 hong, tu kiem 7/7

- eval: E7
  run_id: minted-ghim-thuoc-soi-xem-okr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gtsx_tai_lieu
  verified_at: 2026-10-16T01:36:57Z
  output: |
    cmd: bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs --tai-lieu
    bat tai-lieu-thieu

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bun run lint:slop
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

- cmd: bunx turbo run build --force
  run_id: minted-ghim-thuoc-soi-xem-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-16T01:36:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline). Cả ba là thước tự mang chiều đỏ của hồ sơ khác, giữ như regression-guard có chủ ý cho AC-6, không chứng minh tính năng mới:

- E6a: bun _acceptance/luat-kho-vong-doi/rang/ci.mjs
- E6b: bun _acceptance/chuyen-goi-dieu-phoi/rang/cong.mjs
- E6c: bun _acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs khong-noi-tran

Phân biệt được: E1 đỏ trên baseline (thước cùng chữ báo lỗi ở nền trước vòng), nên E1 có phân biệt.

Baseline khong do:

- bun _acceptance/ghim-thuoc-soi-xem-okr/rang/mien-hai-chieu.mjs: bo qua baseline: tep _acceptance/ghim-thuoc-soi-xem-okr/rang/mien-hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 3ffded7b264c03f78cf45933a880b3b94d12241b — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs: bo qua baseline: tep _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs co o cay dang kiem nhung chua co o merge-base 3ffded7b264c03f78cf45933a880b3b94d12241b — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs --chay: bo qua baseline: tep _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs co o cay dang kiem nhung chua co o merge-base 3ffded7b264c03f78cf45933a880b3b94d12241b — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs --tai-lieu: bo qua baseline: tep _acceptance/ghim-thuoc-soi-xem-okr/rang/buoc-ci.mjs co o cay dang kiem nhung chua co o merge-base 3ffded7b264c03f78cf45933a880b3b94d12241b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần, xác định, đồng nhất.

## Iterations

Round 1: mọi eval máy xanh; E3 (judgment) hội đồng ba judge cùng đề xuất FAIL vì hai lyDo của MIEN_XEM nói quá bảng nguồn. Chuyển người quyết ở Cổng 2.
