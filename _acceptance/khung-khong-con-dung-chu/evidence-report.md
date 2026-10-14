---
schema_version: 2
feature_slug: khung-khong-con-dung-chu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2f53f8fa28f633002b9c72035a1aca35f7481ab4
human_signoff: Phan Le Manh 2026-10-10
---

# Evidence Report: khung-khong-con-dung-chu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-khong-con-dung-chu-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kkc_chu
  verified_at: 2026-10-09T21:56:12Z
  output: |
    Ran 8 tests across 1 file. [355.00ms]

- eval: E2
  run_id: minted-khung-khong-con-dung-chu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.klg_khong_con
  verified_at: 2026-10-09T21:56:12Z
  output: |
    Ran 1 test across 1 file. [1328.00ms]

- eval: E3
  run_id: minted-khung-khong-con-dung-chu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.klg_en
  verified_at: 2026-10-09T21:56:12Z
  output: |
    Ran 1 test across 1 file. [1086.00ms]

- eval: E4
  run_id: minted-khung-khong-con-dung-chu-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kkc_hoi_quy
  verified_at: 2026-10-09T21:56:12Z
  output: |
    Ran 1 test across 1 file. [1232.00ms]

- eval: E5
  run_id: minted-khung-khong-con-dung-chu-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kkc_canh_chu
  verified_at: 2026-10-09T21:56:12Z
  output: |
    Ran 134 tests across 1 file. [1327.00ms]

- eval: E6
  run_id: minted-khung-khong-con-dung-chu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.klg_man
  verified_at: 2026-10-09T21:56:12Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (1440x900, nen toi): ngan ben phai (tu x~460) hien tieu de «Cá nhân» voi avatar «?» va nut X dong. Giua ngan co mot khung vien bo goc, trong khung theo thu tu: tieu de «Bản ghi này không còn», cau mo ta «Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.» (nam tron tren mot dong trong khung, khong tran ngang) va nut «Đóng». Khop Expected.
    E6-step2.png (390x844): ngan dang drawer day len tu duoi, cung tieu de «Cá nhân», avatar «?», nut X. Khung o giua gom «Bản ghi này không còn», cau mo ta «Có thể bản ghi đã bị xoá, hoặc đường dẫn không đúng.» (xuong vua sat mep nhung nam tron trong khung, khong tran ngang trang) va nut «Đóng» nam trong khung. Khop Expected.
    Hai anh deu dung mo ta Expected; khong co mau thuan.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-khung-khong-con-dung-chu-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.klg_ma_that
  verified_at: 2026-10-09T21:56:12Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-khong-con-dung-chu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-khong-con-dung-chu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-khong-con-dung-chu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-khong-con-dung-chu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-khong-con-dung-chu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bun run lint:slop
  run_id: minted-khung-khong-con-dung-chu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-khong-con-dung-chu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-09T21:56:12Z

## Known limits

## Ngoài hợp đồng

## Analyst

Các eval xanh trên CẢ HEAD lẫn baseline (không phân biệt, chứng minh harness chứ không chứng minh feature; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- E2 (AC-1): bài klg-khong-con của hồ sơ K4b, chạy lại không sửa. Baseline green.
- E3 (AC-2): bài klg-en của hồ sơ K4b, chạy lại không sửa. Baseline green.
- E4 (AC-3): chạy lại toàn tệp K4b và bài khung-loi của K4, kèm kiểm không sửa kỳ vọng. Baseline green.
- E5 (AC-4): messages-guard.spec.ts không thêm khoá miền. Baseline green.
- E7 (AC-1): phép đo mã thật của hồ sơ K4b, chạy lại không sửa. Baseline green.

E2, E3, E4, E5 và E7 là regression-guard có chủ ý (hợp đồng yêu cầu chạy lại bài cũ không sửa). Chỉ E1 là eval red trên baseline, tức có phân biệt; E6 không chạy được trên baseline (n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all evals passed (E1-E7) and all suite commands passed. No return to implementation.

### Re-pin lần 1 — 2026-10-14, do sau gộp #389 kara-mot-ten (2f53f8fa2): chữ Kara đổi vật mà hai hồ sơ đo
run_id: repin-20261014T094316Z-30187
sha: 2f53f8fa28f633002b9c72035a1aca35f7481ab4 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E6 · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-5 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
