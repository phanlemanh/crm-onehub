---
schema_version: 2
feature_slug: bo-dung-chung-nhan-chuoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 088078c7bb8c3851bb8a4268ed00b96765a3d867
human_signoff:
---

# Evidence Report: bo-dung-chung-nhan-chuoi

_Vòng chấm 6 (hồ sơ tieu-de-cot-doc-tron, vòng 2) — thêm eval E11 (`rang/cat-ba-cham.mjs`) đo trực tiếp hành vi cắt chữ ba chấm trên trang thật cho AC-7, giữ E7 làm bài kiểm hồi quy cấp component. Chấm lại toàn bộ 10 eval hợp đồng (E1-E10) và E11, cộng 4 lệnh suite, trên commit đã ghim `088078c7`. E10 (judgment) giữ nguyên panel PASS từ round 5 vì inputs không đổi._

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | PASS |
| E11 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E2
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E3
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E4
  run_id: minted-bo-dung-chung-nhan-chuoi-E4-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goc_ngon_ngu
  verified_at: 2026-09-23T03:00:23Z
  output: |
    -- chiều đỏ: gieo một dòng nhập ngược thì phép đo phải bắt
        gieo thì bắt, gỡ thì im
    rang-goc-ngon-ngu khong-nhap-nguoc: hai chiều đúng

- eval: E5
  run_id: minted-bo-dung-chung-nhan-chuoi-E5-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goi_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    0 fail
    231 expect() calls
    Ran 117 tests across 9 files. [3.71s]

- eval: E6
  run_id: minted-bo-dung-chung-nhan-chuoi-E6-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_goi_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    0 fail
    231 expect() calls
    Ran 117 tests across 9 files. [3.71s]

- eval: E7
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E8
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E9
  run_id: mudi9wpghn7y
  exit_code: 0
  baseline: green
  verifier: config:executors.script.bdc_bo_dung_ui
  verified_at: 2026-09-23T03:00:23Z
  output: |
    Time:    2.947s

    test-run: dropped crm_mudi9wpghn7y_test

- eval: E11
  run_id: minted-bo-dung-chung-nhan-chuoi-E11-r6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bdc_cat_ba_cham
  verified_at: 2026-09-23T03:00:23Z
  output: |
    dat  deals@768/vi cat=true line-clamp=2 title=«Phụ trách»
    dat  deals@768/en cat=true line-clamp=2 title=«Owner»
    khang-dinh=4/4
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

### Judgment — E10

- eval: E10
  criterion: AC-10
  executor: judgment
  judged_by: judge panel (3 lens, fresh context)
  panel_verdict: PASS
  panel giữ nguyên từ round 5 — inputs không đổi, không chấm lại; rationale xem round đó.

- domain-correctness: PASS (r5)
- operational-feasibility: PASS (r5)
- spec-alignment: PASS (r5)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mudi9wfe6o9t
  exit_code: 0
  verified_at: 2026-09-23T03:00:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-09-23T03:00:23Z

- cmd: bun run lint:slop
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bun_run_lint_slop-r6
  exit_code: 0
  verified_at: 2026-09-23T03:00:23Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-dung-chung-nhan-chuoi-SUITE-bunx_turbo_run_build_force-r6
  exit_code: 0
  verified_at: 2026-09-23T03:00:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Chín eval máy gốc của tính năng này (E1-E9) tiếp tục xanh trên CẢ HEAD lẫn baseline (diffBase) round này — không có eval nào trong nhóm đó đỏ trên code cũ, nên xét riêng lẻ chúng không phân biệt được tính năng khỏi trạng thái trước khi làm:

- `bun run test --filter=@crm/ui` (E1, E2, E3, E7, E8, E9): baseline green.
- `bash _acceptance/bo-dung-chung-nhan-chuoi/rang-goc-ngon-ngu.sh --chan mot-goc && --chan khong-nhap-nguoc` (E4): baseline green.
- `cd packages/ui && bun run test` (E5, E6): baseline green.

E11 không nằm trong danh sách này — baseline của nó là `n-a` (kịch bản `cat-ba-cham.mjs` mới thêm ở round này, không có bản trên diffBase để so), nên nó vẫn là eval phân biệt được cho AC-7 dù chỉ trên chiều "đã sửa vs. chưa sửa" đã chạy tại quyết định d-20260923T024743Z-3, không phải trên chiều A/B của round này.

Xem thêm review-findings.md § "Ngoài hợp đồng" (7 phát hiện mới của round này, phần lớn nằm trong file bằng chứng chưa bộ đo nào phủ) — người ký Cổng 2 nên coi nhóm eval không phân biệt ở trên là tín hiệu cân nhắc riêng, không phải một khối với các phát hiện ngoài hợp đồng.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1–4 (2026-09-01): bốn vòng chấm ngữ cảnh sạch, báo cáo dạng kể chuyện; ký Cổng 2 — Manh Phan 2026-09-01. Sau chữ ký có một vòng người lạ lái thử, ghi vào cùng báo cáo. Bản kể chuyện đó còn nguyên trong lịch sử git (lần sửa cuối 75e5daf8), được thay bằng báo cáo khuôn máy này theo d-20260923T024743Z-4.
Round 5 (2026-09-23, mở lại theo hồ sơ tieu-de-cot-doc-tron, d-20260923T010721Z-25 của hồ sơ đó): chuyển E1–E9 sang khuôn máy với lệnh ở config; chấm trên a1e9d9e5 — PASS; phát hiện ngoài hợp đồng ghi ở review-findings.md vòng đó, chưa ký. Returned to implementation: vòng chấm này lộ phép đo mũi tên rỗng và nút tiêu đề tự đè kiểu Button ở hồ sơ tieu-de-cot-doc-tron.
Round 6 (round này): thêm E11 (`rang/cat-ba-cham.mjs`) đo cắt ba chấm và `title` trên trang thật cho AC-7, hai chiều đỏ đã chạy (evidence/cat-ba-cham-chieu-do.txt); E7 giữ làm hồi quy component. Chấm lại trọn E1–E9, E11 và bốn lệnh suite trên 088078c7 — PASS; E10 mang panel PASS từ round 5 vì đầu vào không đổi. Chờ người ký Cổng 2.
