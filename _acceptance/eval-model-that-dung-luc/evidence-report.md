---
schema_version: 2
feature_slug: eval-model-that-dung-luc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 911e63150c9c40263ac3fa8d8feac9cb816ebc35
human_signoff:
---

# Evidence Report: eval-model-that-dung-luc

Round 4. Mười ba eval máy đều đạt, kể cả E8 (phép đo kép: lượt 2 dùng lại, hai lời dò) đã đỏ ở round 2 và round 3. Bảy lệnh suite đạt. Không có lệnh fail nào không gắn eval. Review không còn phát hiện nào nằm trong hợp đồng; các phát hiện ngoài hợp đồng nằm ở `review-findings.md` cho người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-eval-model-that-dung-luc-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhan_loi
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 5 tests across 1 file. [93.00ms]

- eval: E2
  run_id: minted-eval-model-that-dung-luc-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhat_ky
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 2 tests across 1 file. [83.00ms]

- eval: E3
  run_id: minted-eval-model-that-dung-luc-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_bam
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 2 tests across 1 file. [129.00ms]

- eval: E4
  run_id: minted-eval-model-that-dung-luc-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_dung_lai
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 3 tests across 1 file. [277.00ms]

- eval: E5
  run_id: minted-eval-model-that-dung-luc-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_doi_dau_vao
  verified_at: 2026-10-10T05:01:00Z
  output: |
    SAU: DO MOI: bam doi (e1d36015ad4bad25 -> dcd39c7601b173c0)

- eval: E6
  run_id: minted-eval-model-that-dung-luc-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_vung_xam
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 7 tests across 1 file. [86.00ms]

- eval: E7
  run_id: minted-eval-model-that-dung-luc-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_gop
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 3 tests across 1 file. [119.00ms]

- eval: E8
  run_id: minted-eval-model-that-dung-luc-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_luot_kep
  verified_at: 2026-10-10T05:01:00Z
  output: |
    LUOT 2: DUNG LAI, ma 0, goi 2

- eval: E11
  run_id: e1d36015ad4bad25
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_ghi_ban_ghi
  verified_at: 2026-10-10T05:01:00Z
  output: |
    KET LUOT: dat in GHI BAN GHI, khong dat khong in

- eval: E12
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_do_model
  verified_at: 2026-10-10T05:01:00Z
  output: |
    Ran 4 tests across 1 file. [83.00ms]

- eval: E13
  run_id: minted-eval-model-that-dung-luc-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_cham_lai
  verified_at: 2026-10-10T05:01:00Z
  output: |
    (không có dòng in thêm; script kết thúc sạch)

- eval: E9
  run_id: minted-eval-model-that-dung-luc-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_giu_nguong
  verified_at: 2026-10-10T05:01:00Z
  output: |
    PHAM VI: 25 tep, 0 ngoai pham vi

- eval: E10
  run_id: minted-eval-model-that-dung-luc-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_dot_bien
  verified_at: 2026-10-10T05:01:00Z
  output: |
    h cham-lai xanh=0 do=1 ghim=ok

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bun run lint:slop
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

- cmd: bunx turbo run build --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-10T05:01:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Khong co eval nao khong-phan-biet duoc liet ke; lenh suite xanh o ca hai phia la regression-guard binh thuong.

## Judge

Hợp đồng không có eval judgment nào; không có panel nào để chấm và không có mục nào chờ `human_override`.

## Variance

none — mọi eval chạy một lần, kết quả đồng nhất

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì review có ba phát hiện mức high nằm trong hợp đồng — hỏi lại vùng xám bỏ sót câu khi hai chỉ số chồng id (AC-6, hai phát hiện cùng gốc) và hàng ZaloHoi kết thúc ở trạng thái lỗi bị tính là model trả lời sai thay vì `loi` (AC-1). Trả lại cho bước cài đặt.

Round 2: E8 không đạt — lượt 1 của phép đo kép đo đầy đủ nhưng có một câu lỗi (c33), script dừng với «KHONG DO DUOC: 1 cau loi (c33)» nên lượt 2 (dùng lại, hai lời dò) chưa chạy. Mười hai eval máy còn lại và bảy lệnh suite đạt. Review còn hai phát hiện nằm trong hợp đồng (AC-6, AC-1). Trả lại cho bước cài đặt.

Round 3: E8 không đạt — lượt 1 đo đầy đủ nhưng có một câu lỗi (c02), script dừng với «KHONG DO DUOC: 1 cau loi (c02)» nên lượt 2 chưa chạy. Mười hai eval máy còn lại và bảy lệnh suite đạt. Review còn ba phát hiện nằm trong hợp đồng: «SO LOI GOI MODEL» là hằng chữ in sẵn ở nhánh dùng lại (AC-8, hai phát hiện cùng gốc) và lượt hỏi lại bỏ qua ngưỡng 0 cho câu trích dẫn không kiểm được (AC-6). Trả lại cho bước cài đặt.

Round 4: cả mười ba eval máy và bảy lệnh suite đạt, kể cả E8 (lượt 2 dùng lại, hai lời dò). Review không còn phát hiện nằm trong hợp đồng; mười bảy phát hiện ngoài hợp đồng chuyển cho người quyết ở Cổng 2.
