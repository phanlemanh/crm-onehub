---
schema_version: 2
feature_slug: kho-mau-mang-dau-ngay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5bfb053aaaeb11aa4b61c1bb1d291c5e70cf36c6
human_signoff:
---

# Evidence Report: kho-mau-mang-dau-ngay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | judgment | PASS |

## Evidence

- eval: E1
  run_id: muxari86v2s1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmd_dau_dang_dung
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t dau-dang-dung
    test-run: dropped crm_muxari86v2s1_test

- eval: E2
  run_id: minted-kho-mau-mang-dau-ngay-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmd_giet_mang_dau
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t giet-mang-dau
    chay 1 lan, 1 lan dat

- eval: E3
  run_id: minted-kho-mau-mang-dau-ngay-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmd_giet_quet_gom
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t giet-quet-gom
    test-run: dropped crm_muxarhb7nd8s_test

- eval: E4
  run_id: minted-kho-mau-mang-dau-ngay-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmd_giet_dung_lai
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t giet-dung-lai
    test-run: dropped crm_muxarhdhs7vs_test

- eval: E5
  run_id: minted-kho-mau-mang-dau-ngay-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dmk_tao
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t tao
    test-run: dropped crm_muxargd8bawg_test

- eval: E6
  run_id: minted-kho-mau-mang-dau-ngay-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dmk_kho_mau
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t kho-mau
    test-run: dropped crm_muxargqlr7of_test

- eval: E7
  run_id: minted-kho-mau-mang-dau-ngay-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dmk_xoa
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t xoa
    test-run: dropped crm_muxarh786f3r_test

- eval: E8
  run_id: minted-kho-mau-mang-dau-ngay-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dmk_quet_mo_coi
  verified_at: 2026-10-06T23:14:15Z
  output: |
    bun test test/measure-database.spec.ts -t quet-mo-coi
    test-run: dropped crm_muxari9cichf_test

### Judgment

Panel đề xuất cho E9: PASS (ba lens, cả ba cùng bỏ phiếu PASS). Chưa có người chốt; human_override để trống cho người điền ở Cổng 2.

- eval: E9
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Mục setup.md nói đủ cả ba điều (kho mẫu mang dấu building ngay sau CREATE; kho mẫu bị giết được --quet xoá sau 12 giờ và --tao kế của cây dựng lại nó; kho không dấu từ trước 07/10/2026 phải xoá tay) và khớp với design; không câu nào trong mục mâu thuẫn câu khác.
  votes:
    - domain-correctness: PASS — Mục setup.md nói đủ cả ba điều và khớp với design. Kho mẫu mang dấu building ngay sau CREATE, trước migrate deploy và seed, rồi được ghi đè bằng dấu template. Kho mẫu bị giết vẫn mang dấu building, --quet xoá nó sau 12 giờ, và --tao kế của cây rebuild nó chứ không clone. Kho không dấu từ trước 07/10/2026 phải xoá tay bằng DROP DATABASE. Câu «từ lúc được tạo» đã được chính mục đó giới hạn bằng khoảng hở một lượt khứ hồi giữa CREATE và COMMENT, đúng như phần «Giới hạn còn lại» của design.
    - operational-feasibility: PASS — Mục setup.md nói đủ ba điều, khớp thiết kế. Kho mẫu mang dấu template-building ngay sau CREATE, trước migrate deploy và seed. Kho mẫu đang dựng bị giết vẫn có dấu nên --quet xoá sau 12 giờ (MEASURE_DATABASE.maxAgeMs, tính từ lúc tạo), và --tao kế của cây dựng lại nó thay vì clone. Kho không dấu từ các lượt trước 07/10/2026 hoặc bị giết giữa CREATE và COMMENT vẫn phải xoá tay bằng DROP DATABASE. Không có câu nào mâu thuẫn với câu khác trong mục.
    - spec-alignment: PASS — Mục setup.md (dòng 367-403) nói cả ba ý đúng với design. Kho mẫu mang dấu building ngay từ lúc tạo, trước migrate deploy và seed. --quet xoá kho mẫu bị giết khi quá 12 giờ và hết kết nối, và --tao kế của cây dựng lại nó, không clone. Kho không dấu (của lượt trước 07/10/2026, hoặc bị giết giữa CREATE và COMMENT) không bị sweep xoá, phải DROP DATABASE bằng tay. Các câu trong mục không mâu thuẫn nhau: câu «mang dấu từ lúc tạo» có kèm ngoại lệ một vòng khứ hồi, và câu «--tao cũng quét» có ngay điều kiện tuổi 12 giờ ở gạch đầu dòng kế trước.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bun run lint:slop
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

- cmd: bunx turbo run build --force
  run_id: minted-kho-mau-mang-dau-ngay-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-06T23:14:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline diffBase), nên chúng chứng minh bộ chạy chứ không chứng minh tính năng. Cả bốn là ca có sẵn của hồ sơ do-man-tren-kho-rieng, được vòng này giữ nguyên có chủ ý làm regression-guard cho AC-5 (hành vi cũ không đổi); không ca nào được viết lại:

- E5 — lệnh `-t tao` (baseline: green) — regression-guard có chủ ý
- E6 — lệnh `-t kho-mau` (baseline: green) — regression-guard có chủ ý
- E7 — lệnh `-t xoa` (baseline: green) — regression-guard có chủ ý
- E8 — lệnh `-t quet-mo-coi` (baseline: green) — regression-guard có chủ ý

Bốn eval của tính năng (E1, E2, E3, E4) đều baseline: red nên có phân biệt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E9 đều đạt, không eval nào hỏng; verdict PASS.
