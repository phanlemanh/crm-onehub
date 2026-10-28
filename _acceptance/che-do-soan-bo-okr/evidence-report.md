---
schema_version: 2
feature_slug: che-do-soan-bo-okr
verdict: REJECT
failed_evals: ["E19","E17"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9bfecfe8826e599b10dd387337504e62f52320db
human_signoff:
---

# Evidence Report: che-do-soan-bo-okr

Round 2. Báo cáo này thay trọn các round cũ; lịch sử round nằm ở mục Iterations.

Hai lệnh đỏ của round này đều gắn với eval đã khai, không có lệnh đỏ nào không gắn eval: `bun _acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs` (E19) và `ui-check:E17` (E17).

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
| E19 | AC-11 | script | FAIL |
| E20 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-che-do-soan-bo-okr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_mo
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-mo
    Ran 7 tests across 1 file. [6.31s]

- eval: E2
  run_id: minted-che-do-soan-bo-okr-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-che-do-soan-bo-okr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_viet
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-viet
    Ran 8 tests across 1 file. [7.80s]

- eval: E4
  run_id: minted-che-do-soan-bo-okr-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-che-do-soan-bo-okr-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_sua
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-sua
    Ran 9 tests across 1 file. [4.10s]

- eval: E6
  run_id: minted-che-do-soan-bo-okr-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_cham_bo
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd packages/validation && bun test test/okr-cham-bo.spec.ts -t vk10-cham
    Ran 6 tests across 1 file. [11.00ms]

- eval: E7
  run_id: minted-che-do-soan-bo-okr-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_chat_luong
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-chat-luong
    Ran 7 tests across 1 file. [3.67s]

- eval: E8
  run_id: minted-che-do-soan-bo-okr-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_gop_y
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-gop-y
    Ran 6 tests across 1 file. [8.63s]

- eval: E9
  run_id: minted-che-do-soan-bo-okr-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-che-do-soan-bo-okr-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_cong_bo
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-cong-bo
    (đoạn cuối đầu ra không có dòng tóm tắt; mã thoát lấy từ kết quả công cụ)

- eval: E11
  run_id: minted-che-do-soan-bo-okr-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

- eval: E12
  run_id: minted-che-do-soan-bo-okr-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_ngan
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-ngan
    Ran 5 tests across 1 file. [3.27s]

- eval: E13
  run_id: minted-che-do-soan-bo-okr-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

- eval: E14
  run_id: minted-che-do-soan-bo-okr-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_quyen
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-quyen
    Ran 7 tests across 1 file. [6.50s]

- eval: E15
  run_id: minted-che-do-soan-bo-okr-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_tai
  verified_at: 2026-10-28T01:09:02Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-tai
    Ran 5 tests across 1 file. [2.55s]

- eval: E16
  run_id: minted-che-do-soan-bo-okr-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

- eval: E17
  run_id: minted-che-do-soan-bo-okr-E17-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  screenshot: evidence/E17-step2.png
  observed: |
    Khung Soạn 1280 và 375, sáng và tối: tài liệu bên trái đọc như văn bản (tên mục tiêu khoảng 16px đậm, lớn hơn dòng KR, KR thụt dưới mục tiêu), cột phải có khối Chất lượng trên và nhóm Kara dưới với nhãn Kara một lần, Công bố là nút chính duy nhất; hộp công bố liệt tên mục tiêu có ô tích; ngăn theo dõi chỉ một chip «Kara · 1 góp ý»; 375 có hai thẻ, không tràn ngang.
    Nhưng so với bản mẫu có ba chỗ lệch ngoài năm chỗ được phép: (D1) bộ trống 1280, câu dẫn khoảng 12px đọc «Bộ OKR này chưa có mục tiêu nào…» và câu cột phải «Gõ mục tiêu đầu tiên để máy chấm» khoảng 11px, bản mẫu 14px và «Bộ OKR của quý này…»; (D2) bộ trống, nhãn cột phải là «Kara» thay vì «Kara · Góp ý», lối «Nhờ Kara soạn nháp» chỉ có biểu tượng không có nhãn Kara riêng, nút «Nhờ Kara đọc bộ» có biểu tượng và bị khoá; (D3) trạng thái có góp ý, nút «Kara đọc lại bộ» mang biểu tượng, ô người phụ trách của KR khoá là ô chọn có mũi tên thay vì chip phẳng. Hợp đồng ghi mọi chỗ lệch ngoài năm chỗ là không đạt.
  network_observed: n-a (driver)

- eval: E18
  run_id: minted-che-do-soan-bo-okr-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_san_thiet_ke
  verified_at: 2026-10-28T01:09:02Z
  output: |
    bun _acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs
    KET LUAN vk10 san thiet ke: 8/8 HTML, 0 P0

- eval: E19
  run_id: minted-che-do-soan-bo-okr-E19-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk10_khong_doi_hinh
  verified_at: 2026-10-28T01:09:02Z
  output: |
    bun _acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs
    THU LAI quyet-gop-y-noi-dung-ly-do#E7: lan dau ma 2
    THU LAI quyet-gop-y-noi-dung-ly-do#E8: lan dau ma 2
    THU LAI gan-tay-va-kara-co-ly-do#E16: lan dau ma 2
    DO SAN TREN NEN gan-tay-va-kara-co-ly-do#E16: cay 1 · nen 2
    DO SAN TREN NEN quyet-gop-y-noi-dung-ly-do#E7: cay 2 · nen 2
    DO SAN TREN NEN quyet-gop-y-noi-dung-ly-do#E8: cay 2 · nen 1
    GIU quyet-gop-y-noi-dung-ly-do (và 15 hồ sơ GIU khác trong danh sách 17)
    SAI AC-11: soan-okr-trong-khung#E9 cay 1 · nen 0
    KET LUAN khong-doi-hinh: 1 SAI

- eval: E20
  run_id: minted-che-do-soan-bo-okr-E20-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T01:09:02Z
  output: |
    Cùng lần chạy man-soan.mjs với E2.
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bun run lint:slop
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

- cmd: bunx turbo run build --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-28T01:09:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không đo được ở round này vì baseline bị chặn hạ tầng, mọi field baseline là n-a; không eval nào được liệt kê.

### Baseline khong do

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

## Variance

none — mọi eval chạy một lần (runs: 1), kết quả đồng nhất; không eval ngẫu nhiên nào có pass_rate lẫn lộn.

## Iterations

Round 1: E1 failed (ca vk10-mo ném lỗi đọc viewerRole của dữ liệu workspace rỗng ở TienDoKrCo trong bang-kr.tsx), E17 failed (thước AC-2 VIET báo SAI và màn lệch bản mẫu ngoài năm chỗ được phép); E19 BLOCKED (khong-doi-hinh.mjs chạy quá 31 phút chưa xong, chờ chạy lại với trần công cụ dài hơn); lệnh suite app và @crm/ui đỏ ở ca bkr-quet-mo. Returned to implementation.
Round 2: E1 và E17 trước đó đỏ; nay E1 xanh, E17 vẫn đỏ vì màn lệch bản mẫu ngoài năm chỗ được phép (D1–D3: cỡ chữ và nhãn của bộ trống, biểu tượng và ô chọn ở trạng thái có góp ý). E19 chạy xong và đỏ: SAI AC-11 ở soan-okr-trong-khung#E9 (cây có SAI, nền xanh). Các lệnh suite xanh. verified_at ghi gần đúng theo giờ lưu ảnh khung ui, vì run-log chưa có dòng giờ của round 2 lúc soạn. Returned to implementation.
