---
schema_version: 2
feature_slug: gan-tay-va-kara-co-ly-do
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 29345daca5f2b9005402a170568add658bd33f49
human_signoff: "Phan Le Manh 2026-10-14 — ký Cổng Bằng chứng trên vòng chấm 2 (17/17 eval đạt, 7/7 lệnh suite xanh, 0 phát hiện trong hợp đồng). Ngoài-1 đến Ngoài-8, Ngoài-10 đến Ngoài-12 ghi Known limits; Ngoài-9 chấp nhận, không sửa; đồng ý cắt; Treo phê hết"
---

# Evidence Report: gan-tay-va-kara-co-ly-do

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | judgment | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13 | AC-12 | test | PASS |
| E14 | AC-15 | script | PASS |
| E15 | AC-13 | test | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-15 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-gan-tay-va-kara-co-ly-do-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_luat
  verified_at: 2026-10-14T02:16:27Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    cmd: cd packages/validation && bun test test/ly-do-can-chinh.spec.ts -t l4-luat
    Ran 3 tests across 1 file. [79.00ms]

- eval: E2
  run_id: minted-gan-tay-va-kara-co-ly-do-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_gan
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-gan"
    test-run: dropped crm_mv7i1z55rvym_test

- eval: E3
  run_id: minted-gan-tay-va-kara-co-ly-do-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_sua
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-sua-sau-gan"
    test-run: dropped crm_mv7i1xbx6z2z_test

- eval: E4
  run_id: minted-gan-tay-va-kara-co-ly-do-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_quyen
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-quyen && bun test test/vai-chi-okr.spec.ts"
    test-run: dropped crm_mv7i1zk470xt_test

- eval: E5
  run_id: minted-gan-tay-va-kara-co-ly-do-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_can_cu
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/nop-de-xuat-can-cu.integration.spec.ts -t l4-can-cu" && bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-danh-sach"
    test-run: dropped crm_mv7i25sw5jzm_test

- eval: E6
  run_id: minted-gan-tay-va-kara-co-ly-do-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_nhan
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-nhan"
    test-run: dropped crm_mv7i1xrzzlzy_test

- eval: E7
  run_id: minted-gan-tay-va-kara-co-ly-do-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_sua_de_xuat
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-sua-de-xuat"
    test-run: dropped crm_mv7i1zoia0fb_test

- eval: E8
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  rationale: Mục can-chinh trong instructions.md nói đủ ba điều, mỗi điều có câu trích nguyên văn. Một, lyDo nêu vì sao mục tiêu đẩy được đích. Hai, canCu chỉ viết khi data block có số chống lưng và chép đúng số đó, không có số thì để null. Ba, luật cấm số lạ áp cho canCu.
  human_override:  # chi nguoi ghi

- eval: E9
  run_id: minted-gan-tay-va-kara-co-ly-do-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_hop_thoai
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/gan-ly-do.dom.tsx -t l4-hop-thoai
    Ran 3 tests across 1 file. [1.53s]

- eval: E10
  run_id: minted-gan-tay-va-kara-co-ly-do-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_de_xuat
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/gan-ly-do.dom.tsx -t l4-de-xuat
    Ran 2 tests across 1 file. [1324.00ms]

- eval: E11
  run_id: minted-gan-tay-va-kara-co-ly-do-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_chu
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/gan-ly-do.dom.tsx -t l4-chu && bun test ./test/messages-guard.spec.ts
    Ran 143 tests across 1 file. [912.00ms]

- eval: E12
  run_id: log-e12 (.acceptance-runs/gan-tay-va-kara-co-ly-do/log-e12.log)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l4_man
  verified_at: 2026-10-14T02:16:27Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    đủ 6 ảnh (6) DUNG. Tổng 37 DUNG, 0 SAI.
    Frame đã lưu: E12-step1.png, E12-step2.png, E12-step3.png (1440); E12-step1-390.png, E12-step2-390.png, E12-step3-390.png (390).
    Server do mot-luot/tien-de tự dựng và tự dọn (phien-do: xong — mã 0).
  screenshot: evidence/E12-step1.png
  observed: |
    Đã mở bằng Read cả 6 ảnh. 1440 de-xuat: sheet «Khiếu nại được xử lý trong ngày», tab KR (2), thẻ Kara '1 góp ý chờ' có «Góp vào «Giữ tỷ lệ đối tác gia hạn trên 85%»», chấm xanh nhãn «Có số liệu», 'Vì sao: Khiếu nại xử lý trong ngày giữ đối tác ở lại gia hạn hợp đồng.', 'Căn cứ: Khiếu nại tồn qua đêm giữ dưới 5 vụ', ba nút «Căn chỉnh kèm lý do» / «Sửa lý do» / «Bỏ qua»; không cuộn ngang. 1440 da-nhan: đường lý do có thêm mục «Trở thành đối tác logistics được chọn đầu tiên ở hai miền» với lý do Kara hiển thị kèm dấu 'đổi theo Kara' (1 dấu), dòng Căn cứ, nhãn «Có số liệu»; tab Căn chỉnh 2; thẻ 'Đã góp vào mục tiêu theo Kara · Hoàn tác'. 1440 da-sua: cùng mục đó còn lý do nhưng không còn dấu Kara, không dòng căn cứ, nhãn «Đặt cược» (chấm xám); tab Căn chỉnh 2; khung 'Kara không thấy chỗ nào cần sửa'. 390 de-xuat: dạng ngăn kéo dưới, tab KR 2 / Căn chỉnh 1, cùng thẻ góp ý với nhãn «Có số liệu», lý do, căn cứ, ba nút; chữ xuống dòng, không tràn ngang. 390 da-nhan: lý do Kara kèm dấu 'đổi theo Kara', Căn cứ, «Có số liệu», 'Đã góp vào mục tiêu theo Kara · Hoàn tác'. 390 da-sua: lý do còn, không dấu Kara, không căn cứ, nhãn «Đặt cược». Cả sáu khớp Expected (nhãn mức tin, lý do, căn cứ, dấu Kara 1 → 0, Có số liệu → Đặt cược). Ảnh da-sua thể hiện đúng trạng thái sau Lưu. Hộp thoại «Sửa lý do» không nằm trong 6 ảnh, được kiểm bằng assertion hop-thoai-sua.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-gan-tay-va-kara-co-ly-do-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_man_doc_lai
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-man-doc-lai"
    test-run: dropped crm_mv7i205hucii_test

- eval: E14
  run_id: minted-gan-tay-va-kara-co-ly-do-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l4_dot_bien
  verified_at: 2026-10-14T02:16:27Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    cmd: bun _acceptance/gan-tay-va-kara-co-ly-do/rang/dot-bien.mjs
    dot-bien: 10/10 vet bi bat, tep tra lai nguyen

- eval: E15
  run_id: minted-gan-tay-va-kara-co-ly-do-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.l4_mau
  verified_at: 2026-10-14T02:37:13Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-gan-ly-do.spec.ts -t l4-mau"
    test-run: dropped crm_mv7i1xqr0smp_test

- eval: E16
  run_id: minted-gan-tay-va-kara-co-ly-do-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l4_giu_ho_so
  verified_at: 2026-10-14T02:16:27Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    cmd: bun _acceptance/gan-tay-va-kara-co-ly-do/rang/giu-ho-so.mjs
    giu ho so dat

- eval: E17
  run_id: minted-gan-tay-va-kara-co-ly-do-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.l4_ranh_gioi
  verified_at: 2026-10-14T02:16:27Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    cmd: node _acceptance/gan-tay-va-kara-co-ly-do/rang/ranh-gioi.mjs
    ranh gioi dat

### Judge panel (đề xuất)

- E8 — đề xuất panel: PASS
  - domain-correctness: PASS — Mục `can-chinh` trong tệp nói đủ cả ba điều. (1) Có: «`lyDo` says why this Mục tiêu moves that target». (2) Có: «`canCu` is the evidence for that claim: write it only when the data block holds a number that backs it, and copy that number exactly as the data block writes it; with no such number, leave `canCu` null». (3) Có: «Rule 3 holds for `canCu` too: never a number the data block does not already have».
  - operational-feasibility: PASS — Dòng `can-chinh` trong tệp nói đủ cả ba điều: lyDo là lý do mục tiêu này đẩy đích, canCu chỉ viết khi có số chống lưng và chép đúng số, không có thì null, và luật số áp rõ cho canCu.
  - spec-alignment: PASS — Mục `can-chinh` trong instructions.md nói đủ cả ba điều, và mỗi điều có câu trích. (1) lyDo: «`lyDo` says why this Mục tiêu moves that target.» (2) canCu: «write it only when the data block holds a number that backs it, and copy that number exactly as the data block writes it; with no such number, leave `canCu` null.» (3) Luật số áp cho canCu: «Rule 3 holds for `canCu` too: never a number the data block does not already have.» Luật 3 ở trên cũng có: «Never write a number that is not already in the data block.»
  - human_override của E8 để trống cho người quyết ở Cổng 2.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bunx turbo run lint --force
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bun run lint:slop
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

- cmd: bunx turbo run build --force
  run_id: minted-gan-tay-va-kara-co-ly-do-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T02:37:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Mọi eval máy ở trên có baseline n-a.

none — không eval nào được liệt kê là xanh trên cả baseline lẫn HEAD (không có eval không-phân-biệt).

### Baseline khong do

- Mọi eval máy: round này không đo lại baseline vì evals.yaml không đổi so với lần đo cuối ở round 1. Lý do từng lệnh (tệp test chưa có ở merge-base, eval mới) xem mục «Baseline khong do» của round 1.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt (E1–E17), không eval nào thất bại; verdict PASS. Hai phát hiện trong hợp đồng về độ chặt của phép đo (AC-9 gửi chữ đã cắt, AC-7 đối chứng dòng viết lại) được vá bằng test ở commit 21a40522d.
Round 2: chạy lại E2–E7, E9–E11, E13, E15 và bảy lệnh suite trên cây 29345daca5f2b9005402a170568add658bd33f49, tất cả đạt; E1, E12, E14, E16, E17 mang sang từ round 1 vì delta không chạm paths của chúng. Ghi chú: payload round 2 không có mốc giờ chạy, nên verified_at của các eval chạy lại ở round này ghi theo ngày chạy (độ phân giải ngày); mốc giờ chính xác nằm ở run-log.jsonl.
