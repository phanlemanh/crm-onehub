---
schema_version: 2
feature_slug: bam-kr-mo-chi-tiet-kr
verdict: REJECT
failed_evals: [E6]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d21f9e6a2e44f81bbe6ef7ed6c960201042130fe
human_signoff:
---

# Evidence Report: bam-kr-mo-chi-tiet-kr

Vòng 2. Một eval hỏng: E6 (AC-6). Bảy eval còn lại xanh: E1, E3, E7 chạy lại vòng này; E2, E2b, E4, E5 mang từ vòng 1. Lệnh hỏng không gắn eval: không có, lệnh hỏng duy nhất là lệnh của E6.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS (carry-forward từ vòng 1) |
| E2b | AC-2 | test | PASS (carry-forward từ vòng 1) |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS (carry-forward từ vòng 1) |
| E5 | AC-5 | test | PASS (carry-forward từ vòng 1) |
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bam-kr-mo-chi-tiet-kr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_kr_phu_trach
  verified_at: 2026-10-24T12:57:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-kr-phu-trach
    Ran 1 test across 1 file. [931.00ms]

- eval: E2
  run_id: minted-bam-kr-mo-chi-tiet-kr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_cay
  verified_at: 2026-10-24T12:16:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-bam-kr-mo-chi-tiet-kr-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_cay_api
  verified_at: 2026-10-24T12:16:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-bam-kr-mo-chi-tiet-kr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_viec
  verified_at: 2026-10-24T12:57:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/bam-kr-mo-chi-tiet-kr.dom.tsx -t bkr-viec
    Ran 1 test across 1 file. [882.00ms]

- eval: E4
  run_id: minted-bam-kr-mo-chi-tiet-kr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_bang_kr
  verified_at: 2026-10-24T12:16:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-bam-kr-mo-chi-tiet-kr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_chu
  verified_at: 2026-10-24T12:16:06Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-bam-kr-mo-chi-tiet-kr-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.bkr_khong_doi_hinh
  verified_at: 2026-10-24T12:57:16Z
  output: |
    bun _acceptance/bam-kr-mo-chi-tiet-kr/rang/khong-doi-hinh.mjs
    DO SAN TREN NEN cay-can-chinh-co-ly-do#E12
    DO SAN TREN NEN cay-can-chinh-co-ly-do#E13
    DO SAN TREN NEN ngan-kr-mot-cho#E1
    DO SAN TREN NEN cap-nhat-tuan-okr#E7
    DO SAN TREN NEN cap-nhat-tuan-okr#E14
    DO SAN TREN NEN cap-nhat-tuan-okr#E19
    DO SAN TREN NEN chu-may-sinh-ten-moi#E12
    SAI AC-6: canh-kr-okr#E12 nen 0, cay 1
    SAI AC-6: canh-kr-okr#E15 nen 0, cay 1
    SAI AC-6: canh-kr-okr#E17 nen 0, cay 1
    DO SAN TREN NEN so-okr-tu-chay#E12
    DO SAN TREN NEN so-okr-tu-chay#E14
    KET LUAN khong-doi-hinh: 3 SAI

- eval: E7
  run_id: minted-bam-kr-mo-chi-tiet-kr-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bkr_quet_mo
  verified_at: 2026-10-24T12:57:16Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 ./test/bam-kr-mo-chi-tiet-kr.spec.ts -t bkr-quet-mo
    Ran 2 tests across 1 file. [292.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bun run lint:slop
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

- cmd: bunx turbo run build --force
  run_id: minted-bam-kr-mo-chi-tiet-kr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-24T12:57:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Field baseline cua moi block ghi n-a vi round nay khong do.

none — khong co eval nao duoc liet ke la khong-phan-biet.

## Variance

none — moi eval chay mot lan (runs: 1), deterministic, khong co pass_rate hon hop.

## Iterations

Round 1: bảy eval và các lệnh suite xanh; bốn phát hiện về AC-6 được sửa trong vòng (E6 đọc sổ ở đúng cây, đối chiếu chủ bài, bỏ data-mo-muc-tieu trên nút mở KR).
Round 2: E6 hỏng — chạy lại trên cây hiện tại, quét lớp AC-6 thấy ba eval của hồ sơ canh-kr-okr (E12, E15, E17) xanh trên nền nhưng đỏ trên cây, nên in «SAI AC-6». Trả về cho khâu sửa.
