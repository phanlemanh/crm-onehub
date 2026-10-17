---
schema_version: 2
feature_slug: dieu-phoi-va
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 735c996977a6fa3e0aad9753f5b27adaea04267c
human_signoff: Phan Le Manh 2026-10-10
---

# Evidence Report: dieu-phoi-va

Vòng 3. Mọi eval của tính năng (E1, E1c, E1b, E2, E3, E4, E5, E6b, E6, E7, E7b, E8, E9, E10, E11) đều qua, và cả bảy lệnh suite hồi quy đều qua trên cây 407e555ab. Không có mục judgment nào cần người chốt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-4 | ui-check | PASS |
| E11 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: mv22pcaio4xh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_ma_lech
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pcaio4xh_test

- eval: E1c
  run_id: mv22pckrrpkh
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_mach_lien
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pckrrpkh_test

- eval: E1b
  run_id: minted-dieu-phoi-va-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_nhan_lo
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pc94lodq_test

- eval: E2
  run_id: mv22pd8vbi1p
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_khong_trung
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pd8vbi1p_test

- eval: E3
  run_id: mv22pcmg0fue
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_dong_som
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pcmg0fue_test

- eval: E4
  run_id: minted-dieu-phoi-va-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T07:28:43Z
  output: |
    Ran 6 tests across 1 file. [1434.00ms]

- eval: E5
  run_id: minted-dieu-phoi-va-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T07:28:43Z
  output: |
    Ran 6 tests across 1 file. [1434.00ms]

- eval: E6b
  run_id: minted-dieu-phoi-va-E6b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T07:28:43Z
  output: |
    Ran 6 tests across 1 file. [1434.00ms]

- eval: E6
  run_id: mv22pd5d46nq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_bo_phan_hong
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pd5d46nq_test

- eval: E7
  run_id: mv22pcqson52
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_dem_qua_han
  verified_at: 2026-10-10T07:28:43Z
  output: |
    test-run: dropped crm_mv22pcqson52_test

- eval: E7b
  run_id: minted-dieu-phoi-va-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_the_qua_han_dom
  verified_at: 2026-10-10T07:28:43Z
  output: |
    Ran 4 tests across 1 file. [817.00ms]

- eval: E8
  run_id: minted-dieu-phoi-va-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dpv_the_qua_han_dom
  verified_at: 2026-10-10T07:28:43Z
  output: |
    Ran 4 tests across 1 file. [817.00ms]

- eval: E9
  run_id: `
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dpv_hoi_quy
  verified_at: 2026-10-10T07:28:43Z
  output: |
    khong-xoa-expect --tu-thu và --moc d0ccad984 thoát sạch; các tệp test của kho và check-types thoát sạch.

- eval: E10
  run_id: dpv-E10-verify-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dpv_man
  verified_at: 2026-10-10T07:28:43Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã Read cả 8 ảnh (sheet bản ghi kế hoạch, nền tối, tiếng Việt): kế hoạch rỗng hiện «Kế hoạch chưa có bước nào» cùng nút «+ Thêm bước»; form thêm bước có ô chọn phòng ban, ô tên, ô ngày, nút «Thêm» và «Thôi".
    Kế hoạch đã có bước: nhóm «BỘ PHẬN ĐO A» kèm nút thêm ở phòng ban khác, danh sách chỉ liệt kê phòng ban chưa có nhóm; kế hoạch đã đóng hiện chip «Đã đóng» và dòng «Kế hoạch đã đóng — mở lại để sửa.», không có nút thêm bước. Cả hai khổ 1440 và 390 đúng bố cục, không tràn ngang.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-dieu-phoi-va-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dpv_man
  verified_at: 2026-10-10T07:28:43Z
  screenshot: evidence/E11-step1.png
  observed: |
    Đã Read cả 4 ảnh. Trạng thái đủ (1440 và 390): thẻ «Việc quá hạn» có 3 dòng việc và không có dòng «nữa» bên dưới; ở 1440 mô tả ghi «3 việc quá hạn», ở 390 mô tả ẩn đúng như thiết kế.
    Trạng thái còn sót: mô tả ghi «43 việc quá hạn» ở 1440 và dưới thẻ có dòng «và 23 việc quá hạn nữa» ở cả hai khổ (23 là 43 trừ 20 dòng đang hiện); tổng 43 thay vì 40 vì máy đo có sẵn 3 việc quá hạn của dữ liệu mẫu.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-va-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-va-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-va-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-10T07:28:43Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần đo baseline cuối). Field baseline của từng block ghi n-a. Không có eval nào bị liệt kê là không-phân-biệt.

Không có.

## Variance

none — mọi eval chạy một lần và đều xanh; không eval nào có pass_rate lẫn.

## Iterations

Round 1: REJECT — xem review-findings của vòng đó; đã sửa ở S4 r1 (commit 036e94c82) và trả về triển khai.
Round 2: REJECT — mọi eval của tính năng qua, nhưng lệnh suite hồi quy `bun run test -- --filter=app --filter=@crm/ui` đỏ ở `apps/app/test/doi-nhan-phong-ban.dom.tsx:265`; đã sửa nhãn dùng «phòng ban» ở S4 r2 (commit 407e555ab) và trả về triển khai.
Round 3: PASS — mọi eval của tính năng và cả bảy lệnh suite đều qua trên cây 407e555ab.

### Re-pin lần 1 — 2026-10-14, do gộp onehub aac0975b5 (DA2, l3b), dời migration chep_viec_can_lam sang 20261014060147, sửa đua upsert ở dem-qua-han
run_id: repin-20261014T063030Z-77767
sha: e0cc19b2b60e10ec4cb16988205c2f8c04d52658 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E11 · diff chạm vật đo ngoài làn máy: E10, E11 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-16, do lan-dem-16-10: gộp onehub ngày 16/10 (#434…#453)
run_id: repin-20261016T233032Z-31285
sha: 735c996977a6fa3e0aad9753f5b27adaea04267c · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10, E11 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
