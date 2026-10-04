---
schema_version: 2
feature_slug: chan-trung-khoa-ban-nhap
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fe594fd1d85262619b6a1e6cdf08f970edd46632
human_signoff:
---

# Evidence Report: chan-trung-khoa-ban-nhap

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4 | test | PASS |
| E2 | AC-5, AC-6 | test | PASS |
| E3 | AC-7 | script | PASS |
| E4 | AC-7 | script | PASS |
| E5 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-chan-trung-khoa-ban-nhap-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctk_don_vi
  verified_at: 2026-10-04T04:34:25Z
  output: |
    cd packages/validation && bun test test/okr-cuoc-soan.spec.ts -t trung-khoa
     8 expect() calls
    Ran 7 tests across 1 file. [93.00ms]

- eval: E2
  run_id: minted-chan-trung-khoa-ban-nhap-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctk_tich_hop
  verified_at: 2026-10-04T04:34:25Z
  output: |
    bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/ban-nhap-trung-khoa.integration.spec.ts"
    test-run: dropped crm_mutbv11ev8uq_test

- eval: E3
  run_id: minted-chan-trung-khoa-ban-nhap-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ctk_pha_thu_xanh
  verified_at: 2026-10-04T04:34:25Z
  output: |
    node _acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs xanh
    tich-hop: 2 pass, 0 fail

- eval: E4
  run_id: minted-chan-trung-khoa-ban-nhap-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ctk_pha_thu_do
  verified_at: 2026-10-04T04:34:25Z
  output: |
    node _acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs do
    tich-hop: go superRefine do dung chu ky (2 fail, 0 pass)

- eval: E5
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Ba lens cùng chấm PASS cho AC-8; mô tả công cụ nop_ban_nhap nói rõ luật khoá, thông điệp lỗi chỉ đúng ô lặp, và nop-ban-nhap.ts không kiểm trùng lần hai.
  votes:
    - domain-correctness: PASS — (1) Mô tả công cụ nop_ban_nhap nói rõ khoá là duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu, và cho phép KR dưới hai Mục tiêu khác nhau trùng khoá. (2) Hai thông điệp trong BAN_NHAP_LOI, ghép với path ["mucTieu", i, "khoa"] hoặc ["mucTieu", i, "kr", j, "khoa"] và giá trị khoá, chỉ đúng dòng cần sửa. chanKhoaTrung duyệt hết bằng lapLai (indexOf < i) nên báo mọi lần lặp, và so trên giá trị đã qua khoaNhap (trim). (3) nop-ban-nhap.ts chỉ import type BanNhap, không gọi banNhap.parse và không tự kiểm trùng theo khoaModel, chỉ giữ chanTrungKhoa theo khoaDong như cũ, đúng với design doc.
    - operational-feasibility: PASS — (1) Mô tả công cụ nop_ban_nhap nói rõ khoa duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu, và nói KR dưới hai Mục tiêu khác nhau được dùng chung khoa. (2) Hai thông điệp trong BAN_NHAP_LOI ghép với khoa trùng và đường dẫn ["mucTieu", i, "khoa"] hoặc ["mucTieu", i, "kr", j, "khoa"] chỉ đúng ô lặp. Hàm lapLai (indexOf(k) < i) báo mọi lần lặp chứ không dừng ở chỗ đầu, và superRefine chạy sau khoaNhap đã trim nên so trên giá trị đã trim. (3) nop-ban-nhap.ts không gọi lại banNhap.parse và không tự kiểm trùng khoaModel; chanTrungKhoa vẫn chỉ kiểm khoaDong như design doc chọn.
    - spec-alignment: PASS — (1) The nop_ban_nhap description says each khoa is unique among the Mục tiêu and among the KR of one Mục tiêu, and that KR under two different Mục tiêu may share a khoa. (2) BAN_NHAP_LOI gives two messages, "khoa Mục tiêu trùng: <khoa>" and "khoa KR trùng trong cùng Mục tiêu: <khoa>", each at a path that names the repeated cell (["mucTieu", i, "khoa"] or ["mucTieu", i, "kr", j, "khoa"]). lapLai flags every later occurrence, not only the first, and the comparison runs on values already trimmed by khoaNhap. (3) nop-ban-nhap.ts never calls banNhap.parse and has no khoaModel duplicate check inside the draft. It imports only the BanNhap type, and its only duplicate guard is the existing chanTrungKhoa on khoaDong, so the check stays at the boundary as the design doc says.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bun run lint:slop
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

- cmd: bunx turbo run build --force
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T04:34:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 xanh và red trên baseline, E5 do hội đồng chấm PASS; 7 lệnh suite xanh. Không có eval nào thất bại.
