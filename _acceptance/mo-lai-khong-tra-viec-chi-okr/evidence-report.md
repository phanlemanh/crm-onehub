---
schema_version: 2
feature_slug: mo-lai-khong-tra-viec-chi-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d0dea2eb7ab019651c95634d8f8ad42cc63aaf8f
human_signoff: Phan Le Manh 2026-10-13 — ký Cổng Bằng chứng trên vòng chấm 1 (8/8 eval máy đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng; E9 hội đồng PASS). Ngoài-1, Ngoài-2 ghi Known limits. Phạm vi cắt/hoãn đồng ý như đã khai; quyết định ghi sau Cổng Phạm vi được phê hết.
---

# Evidence Report: mo-lai-khong-tra-viec-chi-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_mo_lai
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-mo-lai"
    test-run: dropped crm_mv60dxzfyq5v_test

- eval: E2
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_mo_lai
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-mo-lai"
    test-run: dropped crm_mv60dxzfyq5v_test

- eval: E3
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_mo_lai
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-mo-lai"
    test-run: dropped crm_mv60dxzfyq5v_test

- eval: E4
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_mo_lai
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-mo-lai"
    test-run: dropped crm_mv60dxzfyq5v_test

- eval: E5
  run_id: mv60dxdjxgg0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_bo_xong
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-bo-xong"
    chay xong, khong dong loi

- eval: E6
  run_id: mv60dxdjxgg0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_bo_xong
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-bo-xong"
    chay xong, khong dong loi

- eval: E7
  run_id: mv60dxmgsclk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mlk_thuoc
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-thuoc"
    chay xong, khong dong loi

- eval: E8
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mlk_dot_bien
  verified_at: 2026-10-13T01:33:34Z
  output: |
    cmd: node _acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs
    dot-bien: 6/6 cap dat

- eval: E9
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Ba thấu kính cùng thấy docs/api.md dòng 277-288 nêu đủ bốn điều (mở lại và bỏ «xong» đi qua cùng điều kiện nhận việc; bước chưa xong của người không nhận được việc thành chưa giao, lượt theo dõi bị gỡ; người cầm trịch bị thay bằng người bấm mở lại kèm vết; người bấm trượt thì 400, cả giao dịch lùi) và không có từ ghép tự đúc.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bun run lint:slop
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

- cmd: bunx turbo run build --force
  run_id: minted-mo-lai-khong-tra-viec-chi-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T01:33:34Z

### Hội đồng chấm E9 (đề xuất, human_override để trống cho người quyết ở Cổng 2)

Đề xuất: PASS.

- domain-correctness: PASS — docs/api.md dòng 277-288 nói đủ bốn điều, nối điều kiện nhận việc với kiemNguoiNhanViec; thuật ngữ đều có trong CONTEXT.md, «giao dịch» là từ thường.
- operational-feasibility: PASS — mở lại và bỏ «xong» qua cùng điều kiện nhận việc; mỗi đổi người có vết trong cùng giao dịch; người bấm trượt thì 400 và kế hoạch vẫn đóng; không có từ ghép tự đúc.
- spec-alignment: PASS — bốn điều khớp hợp đồng (điều kiện nhận việc docDuocDoiTac và docNguoiNhan, bước chưa giao, vết keHoach.doiCamTrich và buoc.giao, 400 lùi cả giao dịch); từ dùng đều có trong CONTEXT.md.

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: baseline của cả tám eval máy (E1 đến E8) là n-a, không phải red; lý do ở mục dưới. Không eval nào được đo là green-trên-cả-hai-phía.

Baseline khong do
- bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-mo-lai": bo qua baseline: tep apps/api/test/mo-lai-vai-chi-okr.spec.ts co o cay dang kiem nhung chua co o merge-base 3a2783409894908bc8dd1ee3893b88f990d1aebe — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-bo-xong": bo qua baseline: tep apps/api/test/mo-lai-vai-chi-okr.spec.ts co o cay dang kiem nhung chua co o merge-base 3a2783409894908bc8dd1ee3893b88f990d1aebe — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/mo-lai-vai-chi-okr.spec.ts -t mlk-thuoc": bo qua baseline: tep apps/api/test/mo-lai-vai-chi-okr.spec.ts co o cay dang kiem nhung chua co o merge-base 3a2783409894908bc8dd1ee3893b88f990d1aebe — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/mo-lai-khong-tra-viec-chi-okr/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 3a2783409894908bc8dd1ee3893b88f990d1aebe — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đến E8 xanh, E9 do hội đồng đề xuất PASS; không eval nào hỏng. Chưa cần quay lại bước làm.
