---
schema_version: 2
feature_slug: pre-push-phan-rieng-pr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: aea13c2b91ce35d7e254a1f2c611de477c274ca0
human_signoff: Manh Phan 2026-10-22 — ký Cổng Bằng chứng trên vòng chấm 1 (10/10 eval đạt, hội đồng E9 đạt). Ngoài-1, Ngoài-2, Ngoài-3, Ngoài-4, Ngoài-5 ghi Known limits; đồng ý phần cắt/hoãn đã khai; phê hết các quyết định ghi sau Cổng Phạm vi.
---

# Evidence Report: pre-push-phan-rieng-pr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | judgment | PASS |
| E10 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-pre-push-phan-rieng-pr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ppr_gop
  verified_at: 2026-10-21T13:49:47Z
  output: |
    Ran 17 tests across 1 file. [11.91s]

- eval: E2
  run_id: minted-pre-push-phan-rieng-pr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ppr_dong
  verified_at: 2026-10-21T13:49:47Z
  output: |
    Ran 4 tests across 1 file. [3.30s]

- eval: E3
  run_id: minted-pre-push-phan-rieng-pr-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ppt_phan_loai
  verified_at: 2026-10-21T13:49:47Z
  output: |
    Ran 19 tests across 1 file. [7.08s]

- eval: E4
  run_id: minted-pre-push-phan-rieng-pr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ppr_day_gop
  verified_at: 2026-10-21T13:49:47Z
  output: |
    Ran 3 tests across 1 file. [6.80s]

- eval: E5
  run_id: minted-pre-push-phan-rieng-pr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppr_day_that
  verified_at: 2026-10-21T13:49:47Z
  output: |
    dat day-gop-that

- eval: E6
  run_id: minted-pre-push-phan-rieng-pr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppr_lich_su
  verified_at: 2026-10-21T13:49:47Z
  output: |
    dat lich-su

- eval: E7
  run_id: minted-pre-push-phan-rieng-pr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppr_ho_so_cu
  verified_at: 2026-10-21T13:49:47Z
  output: |
    dat ho-so-cu

- eval: E8
  run_id: minted-pre-push-phan-rieng-pr-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ppr_hinh
  verified_at: 2026-10-21T13:49:47Z
  output: |
    Ran 1 test across 1 file. [18.00ms]

- eval: E9
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Đề xuất PASS từ hội đồng ba góc nhìn. Câu vi_sao của t1Only trong gate-shape.json nói đủ ba ý của mục «Luật mới»: lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm và tệp của onehub không tính; phần còn lại rỗng hoặc chỉ T1 thì bỏ test, build; có tệp mã, tệp t1_ma_doc, .github/**, đẩy rỗng hay phân loại hỏng thì chạy đủ. Không câu nào nói sai so với design doc.
  panel:
    - domain-correctness: PASS — Câu vi_sao của t1Only nói đủ ba ý của mục «Luật mới». Một: lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm, tệp mà PR không khác merge-base(đỉnh, remote/onehub) ở cả hai đầu là của onehub và không tính. Hai: phần còn lại rỗng hoặc chỉ T1 thì bỏ test, build. Ba: có tệp mã, tệp t1_ma_doc, .github/**, đẩy rỗng hay phân loại hỏng thì chạy đủ. Không có câu nào nói sai so với design doc, và không có câu nào nói mọi lần đẩy có tệp mã đều chạy đủ.
    - operational-feasibility: PASS — Câu vi_sao của t1Only có đủ ba ý của mục «Luật mới». Một, lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm, và tệp của onehub không tính (tả đúng định nghĩa tệp của onehub). Hai, phần còn lại rỗng hoặc chỉ T1 thì bỏ test, build. Ba, tệp mã, t1_ma_doc, .github/**, đẩy rỗng hay phân loại hỏng đều chạy đủ. Không câu nào nói sai: câu mở đầu về tệp T1 chỉ tả luật cũ, và câu chốt nói rõ chỉ phần PR tự thêm có tệp mã mới chạy đủ.
    - spec-alignment: PASS — Câu vi_sao của t1Only có đủ ba ý của mục «Luật mới». Một: lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm, tệp của onehub không tính. Hai: phần còn lại rỗng hoặc chỉ T1 thì bỏ test và build. Ba: phần PR tự thêm có tệp mã, tệp t1_ma_doc, .github/**, hay đẩy rỗng, phân loại hỏng thì chạy đủ. Không câu nào nói sai: nó giữ rằng check-types, lint, lint:slop vẫn chạy, và không nói mọi lần đẩy có tệp mã đều chạy đủ. Có một chỗ nói gọn hơn design: câu vi_sao ghi «bản onehub tại merge-base(đỉnh, remote/onehub)» cho cả hai đầu, còn design tính đầu từ xa theo merge-base(nền, sha từ xa). Design cũng dùng cách nói gọn «ở cả hai đầu» ở dòng 47, nên không coi đây là câu sai.
  human_override:  # chi nguoi ghi

- eval: E10
  run_id: minted-pre-push-phan-rieng-pr-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ppr_dot_bien
  verified_at: 2026-10-21T13:49:47Z
  output: |
    BAT tang-tu-cha-dau: gop-onehub: G16

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bun run lint:slop
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

- cmd: bunx turbo run build --force
  run_id: minted-pre-push-phan-rieng-pr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T13:49:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả đầu nhánh lẫn baseline):

- cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t phan-loai (E3): regression-guard có chủ ý, bảng ca cũ của pre-push-t1 phải giữ nguyên trên luật mới.

Baseline khong do:

- node _acceptance/pre-push-phan-rieng-pr/rang/day-gop-that.mjs: bo qua baseline: tep _acceptance/pre-push-phan-rieng-pr/rang/day-gop-that.mjs co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs: bo qua baseline: tep _acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-phan-rieng-pr/rang/ho-so-cu.mjs: bo qua baseline: tep _acceptance/pre-push-phan-rieng-pr/rang/ho-so-cu.mjs co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-phan-rieng-pr/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/pre-push-phan-rieng-pr/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 1f6757ba03dd84779cf51d2755161b1e25fd4768 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 đến E10 đều đạt, không eval nào đỏ. Chờ người ký ở Cổng Bằng chứng.
