---
schema_version: 2
feature_slug: eval-model-that-dung-luc
verdict: REJECT
failed_evals: ["E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50677169ef28cc58dec48bceb6fbf0ebe8beb7ce
human_signoff:
---

# Evidence Report: eval-model-that-dung-luc

Round 3. Mười hai eval máy đạt; E8 không đạt: lượt 1 của phép đo kép đo đầy đủ trong phiên đo riêng nhưng có một câu lỗi (c02), nên script dừng đúng như hợp đồng khai («KHONG DO DUOC: 1 cau loi (c02)») và lượt 2 chưa chạy được. Lệnh fail không gắn eval: không có (lệnh duy nhất đỏ là lệnh của E8). Bảy lệnh suite đạt. Review còn ba phát hiện nằm trong hợp đồng (AC-8 hai phát hiện cùng gốc, AC-6 một phát hiện) — xem `review-findings.md`. Trả lại cho bước cài đặt.

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
  run_id: minted-eval-model-that-dung-luc-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhan_loi
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 5 tests across 1 file. [116.00ms]

- eval: E2
  run_id: minted-eval-model-that-dung-luc-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_nhat_ky
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 2 tests across 1 file. [78.00ms]

- eval: E3
  run_id: minted-eval-model-that-dung-luc-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_bam
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 2 tests across 1 file. [90.00ms]

- eval: E4
  run_id: minted-eval-model-that-dung-luc-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_dung_lai
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 3 tests across 1 file. [232.00ms]

- eval: E5
  run_id: minted-eval-model-that-dung-luc-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_doi_dau_vao
  verified_at: 2026-10-09T17:34:23Z
  output: |
    SAU: DO MOI: bam doi (f56a24f013fadbdc -> c0812300e70414a8)

- eval: E6
  run_id: minted-eval-model-that-dung-luc-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_vung_xam
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 6 tests across 1 file. [103.00ms]

- eval: E7
  run_id: minted-eval-model-that-dung-luc-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_gop
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 3 tests across 1 file. [67.00ms]

- eval: E8
  run_id: minted-eval-model-that-dung-luc-E8-r3
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.emtdl_luot_kep
  verified_at: 2026-10-09T17:34:23Z
  output: |
    luot-1 c38 khong-chuyen
    luot-1 c39 khong-chuyen
    luot-1 c40 khong-chuyen
    eve eval tro-ly-kho/cham-bo-do: ma thoat 0 (luot-1)
    KHONG DO DUOC: 1 cau loi (c02)
    demHoiKho cua cua so chay: traLoi 47, tuChoi 12, loi 1, tiLe 79.7%
    SO LOI GOI MODEL: 72
    ghi .acceptance-runs/tro-ly-doc-kho/evidence/cham-bo-do.md
    phien-do: kho crm_okr_cua_toi_tach_theo_doi_do · app http://localhost:4773 · api http://localhost:4397
    phien-do: xong — mã 2

- eval: E11
  run_id: minted-eval-model-that-dung-luc-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_ghi_ban_ghi
  verified_at: 2026-10-09T17:34:23Z
  output: |
    KET LUOT: dat in GHI BAN GHI, khong dat khong in

- eval: E12
  run_id: minted-eval-model-that-dung-luc-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.emtdl_do_model
  verified_at: 2026-10-09T17:34:23Z
  output: |
    Ran 3 tests across 1 file. [82.00ms]

- eval: E13
  run_id: minted-eval-model-that-dung-luc-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_cham_lai
  verified_at: 2026-10-09T17:34:23Z
  output: |
    XAM: 18/24 -> CAN HOI LAI: dungTrang (24 cau)

- eval: E9
  run_id: minted-eval-model-that-dung-luc-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_giu_nguong
  verified_at: 2026-10-09T17:34:23Z
  output: |
    PHAM VI: 25 tep, 0 ngoai pham vi

- eval: E10
  run_id: minted-eval-model-that-dung-luc-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.emtdl_dot_bien
  verified_at: 2026-10-09T17:34:23Z
  output: |
    h cham-lai xanh=0 do=1 ghim=ok

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bun run lint:slop
  run_id: minted-eval-model-that-dung-luc-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

- cmd: bunx turbo run build --force
  run_id: minted-eval-model-that-dung-luc-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-09T17:34:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần đo baseline cuối); field baseline của từng eval ghi n-a vì round này không đo.

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): none. Lệnh suite xanh cả hai phía là lớp bảo vệ hồi quy thông thường, không liệt kê.

## Judge

Không eval nào có executor judgment ở round này nên không có hội đồng chấm và không có mục chờ người quyết. Không có human_override nào cần điền.

## Variance

none — mọi eval chạy một lượt (runs: 1), kết quả thống nhất.

## Iterations

Round 1: không eval máy nào đỏ; REJECT vì review có ba phát hiện mức high nằm trong hợp đồng — hỏi lại vùng xám bỏ sót câu khi hai chỉ số chồng id (AC-6, hai phát hiện cùng gốc) và hàng ZaloHoi kết thúc ở trạng thái lỗi bị tính là model trả lời sai thay vì `loi` (AC-1). Trả lại cho bước cài đặt.

Round 2: E8 không đạt — lượt 1 của phép đo kép đo đầy đủ nhưng có một câu lỗi (c33), script dừng với «KHONG DO DUOC: 1 cau loi (c33)» nên lượt 2 (dùng lại, hai lời dò) chưa chạy. Mười hai eval máy còn lại và bảy lệnh suite đạt. Review còn hai phát hiện nằm trong hợp đồng (AC-6, AC-1). Trả lại cho bước cài đặt.

Round 3: E8 không đạt — lượt 1 đo đầy đủ nhưng có một câu lỗi (c02), script dừng với «KHONG DO DUOC: 1 cau loi (c02)» nên lượt 2 chưa chạy; câu lỗi nằm ở phía model/hạ tầng chứ không phải ở logic nhãn (E1, E10 xanh). Mười hai eval máy còn lại và bảy lệnh suite đạt. Review còn ba phát hiện nằm trong hợp đồng: «SO LOI GOI MODEL» là hằng chữ in sẵn ở nhánh dùng lại (AC-8, hai phát hiện cùng gốc) và lượt hỏi lại bỏ qua ngưỡng 0 cho câu trích dẫn không kiểm được (AC-6). Trả lại cho bước cài đặt.
