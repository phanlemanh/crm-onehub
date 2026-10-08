---
schema_version: 2
feature_slug: eval-model-that-dung-luc
verdict: REJECT
failed_evals: [E8]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 43b50a319b83f723c339f55f70ba38d4a4187c2f
human_signoff:
---

# Evidence Report: eval-model-that-dung-luc

Round 2. Mười hai eval máy đạt; E8 không đạt: lượt 1 của phép đo kép đo đầy đủ trong phiên đo riêng nhưng có một câu lỗi (c33), nên script dừng đúng như hợp đồng khai («KHONG DO DUOC») và lượt 2 chưa chạy được. Lệnh script không gắn eval nào ngoài E8 thì không có. Trả lại cho bước cài đặt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | FAIL |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-eval-model-that-dung-luc-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhan_loi
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 4 tests across 1 file. [92.00ms]

- eval: E2
  run_id: minted-eval-model-that-dung-luc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhat_ky
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 2 tests across 1 file. [89.00ms]

- eval: E3
  run_id: minted-eval-model-that-dung-luc-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_bam
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 2 tests across 1 file. [124.00ms]

- eval: E4
  run_id: minted-eval-model-that-dung-luc-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_dung_lai
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 3 tests across 1 file. [426.00ms]

- eval: E5
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_doi_dau_vao
  verified_at: 2026-10-08T09:03:57Z
  output: |
    SAU: DO MOI: bam doi (31a7d58a81d62b9f -> 911efc107bf1bc4c)

- eval: E6
  run_id: minted-eval-model-that-dung-luc-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_vung_xam
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 5 tests across 1 file. [521.00ms]

- eval: E7
  run_id: minted-eval-model-that-dung-luc-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_gop
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 3 tests across 1 file. [100.00ms]

- eval: E8
  run_id: minted-eval-model-that-dung-luc-E8-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.emtdl_luot_kep
  verified_at: 2026-10-08T09:03:57Z
  output: |
    luot-1 c30 chuyen
    luot-1 c31 khong-chuyen
    luot-1 c33 loi
    luot-1 c40 khong-chuyen
    eve eval tro-ly-kho/cham-bo-do: ma thoat 0 (luot-1)
    KHONG DO DUOC: 1 cau loi (c33)
    demHoiKho cua cua so chay: traLoi 48, tuChoi 12, loi 0, tiLe 80.0%
    SO LOI GOI MODEL: 72
    phien-do: xong

- eval: E11
  run_id: minted-eval-model-that-dung-luc-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_ghi_ban_ghi
  verified_at: 2026-10-08T09:03:57Z
  output: |
    KET LUOT: dat in GHI BAN GHI, khong dat khong in

- eval: E12
  run_id: minted-eval-model-that-dung-luc-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_do_model
  verified_at: 2026-10-08T09:03:57Z
  output: |
    Ran 3 tests across 1 file. [99.00ms]

- eval: E13
  run_id: minted-eval-model-that-dung-luc-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_cham_lai
  verified_at: 2026-10-08T09:03:57Z
  output: |
    XAM: 18/24 -> CAN HOI LAI: dungTrang (24 cau)

- eval: E9
  run_id: minted-eval-model-that-dung-luc-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_giu_nguong
  verified_at: 2026-10-08T09:03:57Z
  output: |
    PHAM VI: 25 tep, 0 ngoai pham vi

- eval: E10
  run_id: minted-eval-model-that-dung-luc-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_dot_bien
  verified_at: 2026-10-08T09:03:57Z
  output: |
    h cham-lai xanh=0 do=1 ghim=ok

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bun run lint:slop
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

- cmd: bunx turbo run build --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T09:03:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Field baseline cua tung eval ghi n-a. Khong co eval khong-phan-biet nao duoc liet ke; lenh suite xanh o ca hai phia la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co pass_rate hon hop)

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì review có ba phát hiện mức high nằm trong hợp đồng — hỏi lại vùng xám bỏ sót câu khi hai chỉ số chồng id (AC-6, hai phát hiện cùng gốc) và hàng ZaloHoi kết thúc ở trạng thái lỗi bị tính là model trả lời sai thay vì `loi` (AC-1). Trả lại cho bước cài đặt.

Round 2: E8 không đạt — lượt 1 của phép đo kép đo đầy đủ nhưng có một câu lỗi (c33), script dừng với «KHONG DO DUOC: 1 cau loi (c33)» nên lượt 2 (dùng lại, hai lời dò) chưa chạy. Mười hai eval máy còn lại và bảy lệnh suite đạt. Review còn hai phát hiện nằm trong hợp đồng (AC-6, AC-1) — xem `review-findings.md`. Trả lại cho bước cài đặt.

