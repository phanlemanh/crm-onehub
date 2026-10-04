---
schema_version: 2
feature_slug: chan-trung-khoa-ban-nhap
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 92206a5f9516f169e0e3cb22ddbcbd795b9821fa
human_signoff:
---

# Evidence Report: chan-trung-khoa-ban-nhap

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1, AC-2, AC-3, AC-4 | test | PASS |
| E2 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E3 | AC-7 | script | PASS |
| E4 | AC-7 | script | PASS |
| E5 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-chan-trung-khoa-ban-nhap-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctk_don_vi
  verified_at: 2026-10-04T04:52:23Z
  output: |
    cd packages/validation && bun test test/okr-cuoc-soan.spec.ts -t trung-khoa
    lệnh kết thúc thành công, mã thoát 0 theo run-log

- eval: E2
  run_id: minted-chan-trung-khoa-ban-nhap-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctk_tich_hop
  verified_at: 2026-10-04T04:52:23Z
  output: |
    bun run test -- "cd apps/agent-okr && CRM_TELEMETRY_DISABLED=1 bun test test/ban-nhap-trung-khoa.integration.spec.ts"
    test-run: dropped crm_mutchfvyv87x_test

- eval: E6
  run_id: minted-chan-trung-khoa-ban-nhap-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctk_tich_hop
  verified_at: 2026-10-04T04:52:23Z
  output: |
    cùng lệnh với E2 (kit gộp lệnh trùng, một lần chạy cho cả hai eval)
    test-run: dropped crm_mutchfvyv87x_test

- eval: E3
  run_id: minted-chan-trung-khoa-ban-nhap-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ctk_pha_thu_xanh
  verified_at: 2026-10-04T04:52:23Z
  output: |
    node _acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs xanh
    tich-hop: 2 pass, 0 fail

- eval: E4
  run_id: minted-chan-trung-khoa-ban-nhap-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ctk_pha_thu_do
  verified_at: 2026-10-04T04:52:23Z
  output: |
    node _acceptance/chan-trung-khoa-ban-nhap/rang/pha-thu.mjs do
    tich-hop: go superRefine do dung chu ky (2 fail, 0 pass)

- eval: E5
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Ba lens cùng chấm PASS cho AC-8; mô tả công cụ nop_ban_nhap nói rõ luật khoá, thông điệp lỗi chỉ đúng ô lặp, và nop-ban-nhap.ts không kiểm trùng khoaModel lần hai ở đầu vào.
  votes:
    - domain-correctness: PASS — (1) Mô tả nop_ban_nhap nói khoa là duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu, KR dưới hai Mục tiêu khác nhau được trùng khoa, khớp design doc. (2) chanTrungKhoa dùng lapLai nên báo mọi lần lặp (indexOf(k) < i), chạy trên giá trị đã trim bởi khoaNhap; mỗi issue mang path đúng ["mucTieu",i,"khoa"] hoặc ["mucTieu",i,"kr",j,"khoa"] và thông điệp "<nhãn BAN_NHAP_LOI>: <khoa>". (3) nop-ban-nhap.ts chỉ import kiểu BanNhap và laChoGiuPhien, không gọi banNhap.parse, không kiểm trùng khoaModel ở đầu vào; chỉ còn chanTrungKhoa cũ theo khoaDong, đúng design doc.
    - operational-feasibility: PASS — (1) Mô tả công cụ nói rõ khoa duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu, KR dưới hai Mục tiêu khác nhau được chung khoa. (2) chanKhoaTrung thêm issue tại đúng ô lặp với thông điệp "<nhãn>: <khoa>"; lapLai báo mọi lần lặp và chạy trên giá trị khoaNhap đã trim. (3) nop-ban-nhap.ts chỉ import type BanNhap, không gọi banNhap.parse, chanTrungKhoa vẫn chỉ kiểm khoaDong, đúng quyết định chỉ chặn ở biên trong design doc.
    - spec-alignment: PASS — (1) Mô tả nop_ban_nhap nói khoa duy nhất giữa các Mục tiêu và giữa các KR của một Mục tiêu, và cho phép KR dưới hai Mục tiêu khác nhau chung khoa. (2) Hai thông điệp trong BAN_NHAP_LOI cộng với issue đặt đúng ô và giá trị khoa trong thông điệp cho agent biết sửa dòng nào; lapLai báo mọi lần lặp, superRefine so trên dữ liệu đã qua khoaNhap (trim). (3) nop-ban-nhap.ts chỉ import kiểu BanNhap, không gọi lại banNhap.parse; chanTrungKhoa vẫn chỉ kiểm theo khoaDong, đúng quyết định chỉ chặn ở biên trong design doc.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bun run lint:slop
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

- cmd: bunx turbo run build --force
  run_id: minted-chan-trung-khoa-ban-nhap-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-04T04:52:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 xanh và red trên baseline, E5 do hội đồng chấm PASS; 7 lệnh suite xanh. Không có eval nào thất bại.
Round 2: E2 được tách thành E2 (AC-5) và E6 (AC-6) theo luật cặp cross-layer; E1, E2, E6, E3, E4 xanh và red trên baseline, E5 do hội đồng chấm PASS; 7 lệnh suite xanh. Không có eval nào thất bại.

### Re-pin lần 1 — 2026-10-04, do gộp onehub (#244, #246) sau S4 round 2
run_id: repin-20261004T050849Z-98376
sha: 92206a5f9516f169e0e3cb22ddbcbd795b9821fa · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E5 (E5 không khai paths) · AC không có chốt máy: AC-8
