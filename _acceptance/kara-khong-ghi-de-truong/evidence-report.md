---
schema_version: 2
feature_slug: kara-khong-ghi-de-truong
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d9dac628d040246c57c2be7171c3c45684717ae
human_signoff:
---

# Evidence Report: kara-khong-ghi-de-truong

Vòng 1. Tám eval máy của tính năng đều qua. Verdict REJECT vì một lệnh suite hồi quy, `bun run test -- --filter=api`, chạy đỏ và không gắn eval nào (xem mục Lệnh suite bên dưới).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8 | AC-8 | judgment | PASS (đề xuất của hội đồng, chờ người ở Cổng 2) |

## Evidence

- eval: E1
  run_id: mvgwa7lqsf0z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_dat
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa7lqsf0z_test

- eval: E2
  run_id: mvgwa6qjs6t2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_xoa
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa6qjs6t2_test

- eval: E3
  run_id: mvgwa7l6ybt7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_co_nguoi_thay
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa7l6ybt7_test

- eval: E4
  run_id: mvgwa7w0ikll
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_nen
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa7w0ikll_test

- eval: E5
  run_id: minted-kara-khong-ghi-de-truong-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_o_trong
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa6r041uo_test

- eval: E6
  run_id: mvgwa6wx885t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_dong_thoi
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa6wx885t_test

- eval: E7
  run_id: mvgwa6v3nbmk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_chi_tay
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa6v3nbmk_test

- eval: E8b
  run_id: mvgwa78v74gc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kgd_mo_ta
  verified_at: 2026-10-20T16:25:02Z
  output: |
    test-run: dropped crm_mvgwa78v74gc_test

### Judgment

- eval: E8
  judged_by: judge panel (fresh context): domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Đề xuất PASS từ cả ba lens. Mô tả công cụ và mô tả khoá `replace` nói đúng luật, `execute` lấy `unattended` từ `isAutomated(ctx.session)` chứ không từ đầu vào của model, docs/agent.md nêu đủ ba ý, và hai câu từ chối của `writeField` không mời đặt `replace: true` vô điều kiện.
  votes:
    - domain-correctness: PASS — (1) Phần description ở set_field_value.ts dòng 10 nói ô đã có giá trị thì không ghi. (2) Mô tả của `replace` nói chỉ đặt true khi người bán hàng đã bảo thay trong hội thoại này, và cấm đặt theo phát hiện của Kara. (3) execute truyền `unattended: isAutomated(ctx.session)` vào writeField, không lấy từ đầu vào của model. (4) Mục "Custom field values are never overwritten" trong docs/agent.md (dòng 790-808) nêu đủ ba ý: phiên nền không thay, phiên có người chỉ thay khi có `replace: true`, và phiên nền xác định bằng isAutomated. (5) Hai câu lý do từ chối của writeField (fields.ts dòng 98 và 110) không mời đặt `replace: true` vô điều kiện. Câu ở dòng 110 chỉ cho gọi lại với `replace: true` khi người đã bảo thay giá trị trong hội thoại.
    - operational-feasibility: PASS — (1) Mô tả công cụ nói ô đã có giá trị thì không ghi. (2) Mô tả `replace` nói chỉ đặt true khi người bán hàng đã bảo trong hội thoại này, và không bao giờ đặt theo phát hiện của Kara. (3) `execute` truyền `unattended: isAutomated(ctx.session)` vào `writeField`, không lấy từ đầu vào của model. (4) Mục «Custom field values are never overwritten» trong docs/agent.md nêu đủ ba ý: phiên nền không bao giờ thay, phiên có người chỉ thay khi có `replace: true`, và phiên nền xác định bằng `isAutomated`. (5) Câu từ chối của `writeField` chỉ nhắc `replace: true` kèm điều kiện «only if the rep asked you to in this conversation». Với phiên nền, câu từ chối bảo «leave it as is». Trong ba tệp không có chỗ nào mời đặt `replace: true` khi chưa có lời bảo của người.
    - spec-alignment: PASS — (1) Mô tả công cụ nói ô đã có giá trị thì không ghi. (2) Mô tả `replace` nói chỉ đặt true khi người bán hàng bảo trong hội thoại này và không đặt theo phát hiện của Kara. (3) `execute` truyền `unattended: isAutomated(ctx.session)`, không lấy từ đầu vào của model. (4) Mục «Custom field values are never overwritten» trong docs/agent.md (dòng 790–808) nêu đủ cả ba ý: phiên nền không bao giờ thay, phiên có người chỉ thay khi `replace: true`, phiên nền xác định bằng `isAutomated`. (5) Câu từ chối trong `writeField` (dòng 110) chỉ nhắc `replace: true` kèm điều kiện «only if the rep asked you to in this conversation». Câu từ chối cho phiên nền (dòng 98) bảo «leave it as is». Không có chỗ nào mời đặt `replace: true` vô điều kiện.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-20T16:25:02Z
  note: lệnh không gắn eval nào. 1973 bài qua, 6 bỏ qua, 1 bài đỏ là `l3-canh > l3-canh moi cho noi co mat trong cay co dung mot canh, gia tri bang okr.objective`. Chạy 1980 bài trên 245 tệp.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

- cmd: bun run lint:slop
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

- cmd: bunx turbo run build --force
  run_id: minted-kara-khong-ghi-de-truong-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T16:25:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Lệnh fail không gắn eval: `bun run test -- --filter=api` (một bài đỏ, `l3-canh`, xem khối suite ở trên). Máy không gắn lệnh này vào AC nào nên nó không nằm trong `failed_evals`, nhưng nó là lý do verdict là REJECT.

Baseline khong do
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-co-nguoi-dat": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-co-nguoi-xoa": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-co-nguoi-thay": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-nen": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-o-trong": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-dong-thoi": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-chi-tay": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/kara-khong-ghi-de-truong.integration.spec.ts -t kgd-mo-ta": bo qua baseline: tep apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts co o cay dang kiem nhung chua co o merge-base e6c0296a45fb97d477fb1b452f8519323aa68df9 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ, nhưng lệnh suite `bun run test -- --filter=api` đỏ ở một bài `l3-canh` (không gắn eval nào). Verdict REJECT, trả về cho bước triển khai.

