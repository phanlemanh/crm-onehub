---
schema_version: 2
feature_slug: pre-push-cau-va-nhan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 310f75a2645c81715ac7acbfe681b263fc6602f7
human_signoff: Manh Phan 2026-10-23 — ký Cổng Bằng chứng trên vòng chấm 1 (10/10 eval đạt, hội đồng E1 đạt). Ngoài-1, Ngoài-2 ghi Known limits; đồng ý phần cắt/hoãn đã khai; phê hết các quyết định ghi sau Cổng Phạm vi.
---

# Evidence Report: pre-push-cau-va-nhan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | judgment | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-2 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-3 | script | PASS |
| E8 | AC-4 | script | PASS |
| E9 | AC-4 | script | PASS |
| E10 | AC-4 | script | PASS |

## Evidence

- eval: E2
  run_id: minted-pre-push-cau-va-nhan-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.pcn_hinh
  verified_at: 2026-10-22T03:45:54Z
  output: |
    Ran 2 tests across 1 file. [12.00ms]

- eval: E3
  run_id: minted-pre-push-cau-va-nhan-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ppr_gop
  verified_at: 2026-10-22T03:45:54Z
  output: |
    Ran 17 tests across 1 file. [8.65s]

- eval: E4
  run_id: minted-pre-push-cau-va-nhan-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ppr_dong
  verified_at: 2026-10-22T03:45:54Z
  output: |
    Ran 4 tests across 1 file. [2.12s]

- eval: E5
  run_id: minted-pre-push-cau-va-nhan-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pcn_doi_chieu
  verified_at: 2026-10-22T03:45:54Z
  output: |
    BAT ds-ngoai-t1: gop-onehub: G14

- eval: E6
  run_id: minted-pre-push-cau-va-nhan-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pcn_lich_su_sap
  verified_at: 2026-10-22T03:45:54Z
  output: |
    dat lich-su-sap

- eval: E7
  run_id: minted-pre-push-cau-va-nhan-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ppr_lich_su
  verified_at: 2026-10-22T03:45:54Z
  output: |
    dat lich-su

- eval: E8
  run_id: minted-pre-push-cau-va-nhan-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ppr_ho_so_cu
  verified_at: 2026-10-22T03:45:54Z
  output: |
    dat ho-so-cu

- eval: E9
  run_id: minted-pre-push-cau-va-nhan-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ppr_dot_bien
  verified_at: 2026-10-22T03:45:54Z
  output: |
    BAT tang-tu-cha-dau: gop-onehub: G16

- eval: E10
  run_id: minted-pre-push-cau-va-nhan-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pcn_neo
  verified_at: 2026-10-22T03:45:54Z
  output: |
    dat chieu-do: neo lap: if (rieng.has(t)) tep.add(t);

### Judgment

- eval: E1
  judged_by: judge-panel (3 lens, fresh context) — de xuat PASS
  verdict: PASS
  rationale: Câu vi_sao của t1Only nói đủ bốn ý của mục «Luật mới» và không có câu nào nói sai so với design doc; ba lens cùng PASS.
  votes:
    - domain-correctness: PASS — Câu vi_sao của t1Only nói đủ bốn ý của mục «Luật mới» và không có câu nào nói sai so với design doc. (1) Lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm. (2) Phần còn lại rỗng hoặc chỉ T1 thì được bỏ. (3) Tệp mã, tệp t1_ma_doc và .github/** trong phần PR tự thêm, cùng đẩy rỗng hoặc phân loại hỏng, đều chạy đủ. (4) Về số ở đầu nhánh từ xa, câu viết đúng diff(merge-base(nền, sha từ xa), sha từ xa), so với bản onehub mà đầu từ xa đứng trên, không so với nền.
    - operational-feasibility: PASS — Câu vi_sao của t1Only nói đủ bốn ý: chỉ xét phần PR tự thêm khi có commit mới của onehub, phần còn lại rỗng thì bỏ, tệp t1_ma_doc/.github/mã trong phần tự thêm thì chạy đủ, và ở đầu từ xa so bằng diff(merge-base(nền, sha từ xa), sha từ xa) với bản onehub mà đầu từ xa đứng trên, không so với nền. Tôi không thấy câu nào lệch với mục «Luật mới» của design doc.
    - spec-alignment: PASS — Câu vi_sao của t1Only có đủ bốn ý và khớp mục «Luật mới» của design doc. (1) Lần đẩy mang commit mới của onehub chỉ xét phần PR tự thêm, tệp của onehub không tính vì đã qua CI của PR đưa nó vào. (2) Phần còn lại rỗng hoặc chỉ T1 thì được bỏ, còn đẩy rỗng thật vẫn chạy đủ, đúng với design. (3) Phần tự thêm có tệp mã, t1_ma_doc hoặc .github/** thì chạy đủ. (4) Ở đầu nhánh từ xa, tệp không nằm trong diff(merge-base(nền, sha từ xa), sha từ xa), so với bản onehub mà đầu từ xa đang đứng trên chứ không so với nền. Tôi không thấy câu nào nói sai so với design doc.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-pre-push-cau-va-nhan-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-pre-push-cau-va-nhan-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-pre-push-cau-va-nhan-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-pre-push-cau-va-nhan-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-pre-push-cau-va-nhan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bun run lint:slop
  run_id: minted-pre-push-cau-va-nhan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

- cmd: bunx turbo run build --force
  run_id: minted-pre-push-cau-va-nhan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T03:45:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả ở HEAD lẫn baseline; chứng minh harness, không chứng minh feature — viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E2: cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t hinh-gop
- E3: cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t gop-onehub
- E4: cd packages/ui && bun test --timeout 120000 ./test/pre-push-t1.spec.ts -t dong-gop
- E7: node _acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs
- E8: node _acceptance/pre-push-phan-rieng-pr/rang/ho-so-cu.mjs
- E9: node _acceptance/pre-push-phan-rieng-pr/rang/dot-bien.mjs

Baseline khong do:

- node _acceptance/pre-push-cau-va-nhan/rang/doi-chieu.mjs: bo qua baseline: tep _acceptance/pre-push-cau-va-nhan/rang/doi-chieu.mjs co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-cau-va-nhan/rang/lich-su-sap.mjs: bo qua baseline: tep _acceptance/pre-push-cau-va-nhan/rang/lich-su-sap.mjs co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/pre-push-cau-va-nhan/rang/neo.mjs: bo qua baseline: tep _acceptance/pre-push-cau-va-nhan/rang/neo.mjs co o cay dang kiem nhung chua co o merge-base 4830de27d1334340469caf06dfc4b3f247f4dce3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt; verdict PASS.
