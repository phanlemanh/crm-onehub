---
schema_version: 2
feature_slug: okr-cua-toi-tach-theo-doi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d0ebd845b7b77d88d1667d2dcf3e811fd4c96e8c
human_signoff:
---

# Evidence Report: okr-cua-toi-tach-theo-doi

Round 1. Mọi eval của tính năng (E1 đến E15) đều xanh trên cây đã ghim. Verdict tổng là REJECT vì một lệnh suite hồi quy, `bun run test -- --filter=api`, đỏ và không gắn eval nào. Đuôi đầu ra chỉ có các dòng log khởi động Nest nên không xác định được ca nào đỏ; cần chạy lại riêng gói api để biết nguyên nhân trước khi ký.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-9 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-5 | ui-check | PASS |
| E12 | AC-9 | ui-check | PASS |
| E13 | AC-6 | ui-check | PASS |
| E14 | AC-5 | script | PASS |
| E15 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-okr-cua-toi-tach-theo-doi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_chia
  verified_at: 2026-10-07T10:53:25Z
  output: |
    cd apps/api && bun test test/okr-cua-toi-chia.spec.ts
    Ran 10 tests across 1 file. [24.00ms]

- eval: E2
  run_id: minted-okr-cua-toi-tach-theo-doi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_mine
  verified_at: 2026-10-07T10:53:25Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts -t mine-vai"
    lệnh kết thúc, không có ca đỏ

- eval: E3
  run_id: minted-okr-cua-toi-tach-theo-doi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_trung_vai
  verified_at: 2026-10-07T10:53:25Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts -t trung-vai"
    test-run: dropped crm_muxzq9bmyd0p_test

- eval: E4
  run_id: minted-okr-cua-toi-tach-theo-doi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_da_bo
  verified_at: 2026-10-07T10:53:25Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts -t da-bo"
    lệnh kết thúc, không có ca đỏ

- eval: E5
  run_id: minted-okr-cua-toi-tach-theo-doi-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_hien_thi
  verified_at: 2026-10-07T10:53:25Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts -t hien-thi"
    test-run: dropped crm_muxzqbr5i7jn_test

- eval: E6
  run_id: minted-okr-cua-toi-tach-theo-doi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_bo_theo_doi
  verified_at: 2026-10-07T10:53:25Z
  output: |
    bun run test -- "cd apps/api && bun test test/okr-cua-toi-theo-doi.spec.ts -t bo-theo-doi"
    Ran 1 test across 1 file. [1255.00ms]
    test-run: dropped crm_muxzq9mzgrit_test

- eval: E7
  run_id: minted-okr-cua-toi-tach-theo-doi-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-cua-toi-theo-doi.dom.tsx
    Ran 5 tests across 1 file. [1.57s]

- eval: E8
  run_id: minted-okr-cua-toi-tach-theo-doi-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  output: |
    cùng lệnh E7, ca (b)
    Ran 5 tests across 1 file. [1.57s]

- eval: E9
  run_id: minted-okr-cua-toi-tach-theo-doi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  output: |
    cùng lệnh E7, ca (c) và (d)
    Ran 5 tests across 1 file. [1.57s]

- eval: E10
  run_id: minted-okr-cua-toi-tach-theo-doi-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ctt_dom
  verified_at: 2026-10-07T10:53:25Z
  output: |
    cùng lệnh E7, ca (e)
    Ran 5 tests across 1 file. [1.57s]

- eval: E11
  run_id: minted-okr-cua-toi-tach-theo-doi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T10:53:25Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440, vi, cookie U): trang "OKR của tôi" tab Của tôi. Bảng chính có hai mục tiêu, "Tăng khách quay lại" (M1, người phụ trách Phan Minh Anh, KR1 gắn nhãn "Của tôi") và "Mở kênh đối tác mới" (M3, Lê Thu Hà). Không thấy "Rút ngắn thời gian chốt" hay "Chuẩn hoá báo giá" (M5/M7) trong bảng chính. Cuối màn có nút thu gọn "> Đang theo dõi (2)" (mũi tên trỏ phải, tức đóng). "Đã bỏ" nằm dưới mép khung ảnh nên không thấy ở ảnh này. Khớp Expected về bảng chính và nhóm đóng.
    E11-step2.png (sau khi bấm nhóm): nút chuyển thành "v Đang theo dõi (2)" (mở). Trong nhóm có hai hàng "Rút ngắn thời gian chốt" (Lê Thu Hà) và "Chuẩn hoá báo giá" (Lê Thu Hà), nghĩa là M5 và M7. Bên dưới là nút "> Đã bỏ (1)", nằm dưới nhóm theo dõi, đúng thứ tự. Bảng chính vẫn chỉ có M1 và M3. Khớp.
    E11-step3.png (sau tắt theo dõi M5 và đóng sheet): bảng chính vẫn M1 và M3. Nhóm hiện "v Đang theo dõi (1)" chỉ còn "Chuẩn hoá báo giá" (M7). "Rút ngắn thời gian chốt" (M5) không còn trên màn. "Đã bỏ (1)" vẫn ở dưới. Khớp. Việc okr.mine vắng M5 cả ba mảng do script khẳng định ("buoc 3: dat"), không thấy được trên ảnh.
    E11-step5.png (cookie W, 1440): trang "OKR của tôi" với Empty "Bạn chưa phụ trách mục tiêu hay KR nào", mô tả "OKR của đơn vị bạn nằm ở Theo đơn vị.", nút "Sang Theo đơn vị". Ngay bên dưới Empty có nút "> Đang theo dõi (1)". Khớp Expected: Empty và nhóm theo dõi cùng hiện.
    E11-step6.png (390 px): bố cục điện thoại, tiêu đề, bộ chọn quý, các tab, thẻ "Việc cần làm", mục tiêu "Tăng khách quay lại" và KR1, mọi thứ nằm gọn trong khung 390 px, không có thanh cuộn ngang hay phần bị cắt bên phải. Khớp (script khẳng định không cuộn ngang: "buoc 6: dat").
    Cả năm frame đều khớp Expected, không có mâu thuẫn.
  network_observed: n-a (driver)

- eval: E12
  run_id: E12-20261007-1755
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T10:53:25Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png (1440, giao dien toi, sau khi bo theo doi M5): bang chinh chi co hai muc tieu «Tang khach quay lai» (Phan Minh Anh) va «Mo kenh doi tac moi» (Le Thu Ha); M5 «Rut ngan thoi gian chot» khong con tren man; nhom o duoi co nut «Dang theo doi (1)» dang mo, ben trong chi con «Chuan hoa bao gia» (M7); phia duoi la «Da bo (1)» dong. Khop Expected: M5 roi man, nhom con (1), M7 con lai. Dau window.__cttDau va okr.mine duoc script khang dinh (khong thay trong anh), ket qua dat.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-okr-cua-toi-tach-theo-doi-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_man
  verified_at: 2026-10-07T10:53:25Z
  screenshot: evidence/E13-step1.png
  observed: |
    Frame E13-step1.png (1440, vi, nguoi W, trang Cua toi, copy tu ctt-rong-co-theo-doi.png): tieu de "OKR cua toi", tab "Cua toi" dang chon. Giua trang la Empty (icon nguoi, "Ban chua phu trach muc tieu hay KR nao", mo ta "OKR cua don vi ban nam o Theo don vi", nut "Sang Theo don vi"). Ngay duoi Empty, la nut nhom thu gon voi mui ten "Dang theo doi (1)". Khop Expected: Empty ST-cuatoi-rong va nhom "Dang theo doi (1)" cung hien cho W, nhom lien ke sau Empty.
  network_observed: n-a (driver)

- eval: E14
  run_id: design-gate-7e479c8939
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctt_san_thiet_ke
  verified_at: 2026-10-07T10:53:25Z
  output: |
    design-gate --mode static trên cua-toi.tsx và nhom-da-bo.tsx
      "hits": [],
      "findings": []

- eval: E15
  run_id: minted-okr-cua-toi-tach-theo-doi-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ctt_dot_bien
  verified_at: 2026-10-07T10:53:25Z
  output: |
    dot-bien: 8/8 cap do dung ghim, doi chung lanh xanh

### Lệnh suite (hồi quy)

Lệnh đỏ không gắn eval nào: `bun run test -- --filter=api` (khối đầu tiên bên dưới).

- cmd: bun run test -- --filter=api
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-07T10:53:25Z
  output: |
    Đuôi đầu ra chỉ có dòng log khởi động Nest (Router Factory, Mapped Mutation, deals.archive); không có dòng tóm tắt ca đỏ trong phần đã lưu.

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: muy05xb3ltw7
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

- cmd: bun run lint:slop
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

- cmd: bunx turbo run build --force
  run_id: minted-okr-cua-toi-tach-theo-doi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T10:53:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet). E14 và E11 đến E13 chạy baseline n-a (không chạy được trên cây cũ), không phải green.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ; lệnh suite `bun run test -- --filter=api` đỏ và không gắn eval, nên verdict REJECT. Trả về triển khai để tìm ca đỏ ở gói api (E1 đến E6 chạy riêng đều xanh).
