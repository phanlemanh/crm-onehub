---
schema_version: 2
feature_slug: che-do-soan-bo-okr
verdict: REJECT
failed_evals: [E17]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b420b8ac168ce1165453604d6a5a4e89560f6097
human_signoff:
---

# Evidence Report: che-do-soan-bo-okr

Vòng 5. Một eval đỏ: E17 (ui-check, AC-10). Mọi eval máy và mọi lệnh suite còn lại xanh. Lệnh không gắn eval mà đỏ: ui-check:E17 (cover E17).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | script | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-10 | script | PASS |
| E17 | AC-10 | ui-check | FAIL |
| E18 | AC-10 | script | PASS |
| E19 | AC-11 | script | PASS |
| E20 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-che-do-soan-bo-okr-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_mo
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 7 tests across 1 file. [5.32s]
    __EXIT=0

- eval: E2
  run_id: minted-che-do-soan-bo-okr-E2-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E3
  run_id: minted-che-do-soan-bo-okr-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_viet
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 8 tests across 1 file. [7.26s]
    __EXIT=0

- eval: E4
  run_id: minted-che-do-soan-bo-okr-E4-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E5
  run_id: minted-che-do-soan-bo-okr-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_sua
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 9 tests across 1 file. [3.77s]
    __EXIT=0

- eval: E6
  run_id: minted-che-do-soan-bo-okr-E6-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_cham_bo
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 6 tests across 1 file. [13.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-che-do-soan-bo-okr-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_chat_luong
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 7 tests across 1 file. [3.56s]
    __EXIT=0

- eval: E8
  run_id: minted-che-do-soan-bo-okr-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_gop_y
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 6 tests across 1 file. [7.87s]
    __EXIT=0

- eval: E9
  run_id: minted-che-do-soan-bo-okr-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E10
  run_id: minted-che-do-soan-bo-okr-E10-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_cong_bo
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 7 tests across 1 file. [7.03s]
    __EXIT=0

- eval: E11
  run_id: minted-che-do-soan-bo-okr-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E12
  run_id: minted-che-do-soan-bo-okr-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_ngan
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 9 tests across 1 file. [2.97s]
    __EXIT=0

- eval: E13
  run_id: minted-che-do-soan-bo-okr-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E14
  run_id: minted-che-do-soan-bo-okr-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_quyen
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 7 tests across 1 file. [4.56s]
    __EXIT=0

- eval: E15
  run_id: minted-che-do-soan-bo-okr-E15-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_tai
  verified_at: 2026-10-28T10:16:02Z
  output: |
    Ran 5 tests across 1 file. [1.98s]
    __EXIT=0

- eval: E16
  run_id: minted-che-do-soan-bo-okr-E16-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

- eval: E17
  run_id: E17-20261028-1724
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  screenshot: evidence/E17-step1.png
  observed: |
    E17-step1 / soan-1280-sang: hộp "Soạn bộ OKR", trái là tài liệu (tên mục tiêu cỡ lớn đậm hơn dòng KR, ba dòng KR thụt dưới đường kẻ trái, ô số xám vì mục tiêu đã công bố), phải là khối "Chất lượng 13 trên 16 điểm đạt" ở trên và nhóm "Kara · 1 đề xuất · Vì sao?" ở dưới, nhãn Kara một lần; chân tài liệu có nút Công bố là nút chính duy nhất.
    Các khung khác: bộ trống có con trỏ ở dòng mục tiêu đầu và lối "Nhờ Kara soạn nháp"; hộp "Công bố 1 mục tiêu?" liệt tên mục tiêu có ô tích; ngăn theo dõi chỉ một chip "Kara · 1 góp ý", không khối Kara; 375 có hai thẻ "Bộ OKR" / "Chất lượng và Kara", không tràn ngang; sáng và tối chữ, viền đọc được.
    Chỗ lệch thứ tám ngoài bảy chỗ của Notes: dòng ô số của KR (khởi điểm, đích, đơn vị, người) xếp sát lề nhãn "KR n" (x=133 ở 1280, x=33 ở 375), bản mẫu thụt thẳng hàng dưới tiêu đề KR (x=169 ở 1280, x=69 ở 375), chênh khoảng 36 px, có ở sáng, tối, 1280, 375 và cả mục tiêu đã công bố. Phụ: ở bộ trống nút "Nhờ Kara soạn nháp" hiện chữ xám nhạt kiểu vô hiệu, bản mẫu hiện chữ đậm.
  network_observed: n-a (driver)
  output: |
    Lệnh nguyên văn: EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs"
    ANH 10/10 · HTML 8/8 · KET LUAN vk10 man: 9 DUNG, 0 SAI · phien-do: xong — mã 0
    Frame đã lưu: E17-step1 = soan-1280-sang; step2 = soan-375-sang; step3 = trong-1280-sang; step4 = hoi-cong-bo-1280-sang; step5 = ngan-1280-sang.
    Assertion SAI (B1): chỗ lệch thứ tám nằm ngoài danh sách đóng bảy chỗ — lề ô số KR. Cách sửa: thụt dòng ô số KR thẳng hàng dưới tiêu đề KR như bản mẫu, hoặc thêm chỗ lệch thứ tám vào Notes nếu chủ kho duyệt. (B2, phụ, cần làm rõ): chữ nút "Nhờ Kara soạn nháp" ở bộ trống gần chìm vào nền trắng.

- eval: E18
  run_id: minted-che-do-soan-bo-okr-E18-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_san_thiet_ke
  verified_at: 2026-10-28T10:16:02Z
  output: |
    KET LUAN vk10 san thiet ke: 8/8 HTML, 0 P0
    __EXIT=0

- eval: E19
  run_id: minted-che-do-soan-bo-okr-E19-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_khong_doi_hinh
  verified_at: 2026-10-28T10:16:02Z
  output: |
    KET LUAN khong-doi-hinh: dat
    __EXIT=0

- eval: E20
  run_id: minted-che-do-soan-bo-okr-E20-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T10:16:02Z
  output: |
    phien-do: xong — mã 0
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_api-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bun run lint:slop
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

- cmd: bunx turbo run build --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-10-28T10:16:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-mo: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-viet: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-sua: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd packages/validation && bun test test/okr-cham-bo.spec.ts -t vk10-cham: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-chat-luong: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-gop-y: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-cong-bo: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-ngan: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-quyen: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-tai: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt (green trên cả HEAD lẫn baseline): none — moi eval feature deu red tren baseline (co phan biet). Lưu ý: dòng này không đo được ở vòng này vì baseline bị chặn hạ tầng, mọi trường baseline đều là n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 5: E17 failed — chỗ lệch thứ tám ngoài bảy chỗ của Notes (lề ô số KR sát nhãn "KR n", bản mẫu thụt thẳng hàng dưới tiêu đề KR, chênh khoảng 36 px); phụ: chữ nút "Nhờ Kara soạn nháp" ở bộ trống nhạt kiểu vô hiệu. Returned to implementation.
Rounds 1-4: dữ liệu truyền xuống vòng này không kèm lịch sử; xem run-log.jsonl và sổ quyết định S4 vòng 4 (commit cac923dbf).
