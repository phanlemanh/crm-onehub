---
schema_version: 2
feature_slug: cap-nhat-trong-ngan-kr
verdict: REJECT
failed_evals: [E10b]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2c854486e4663f989a442e5718a2f517a53e4f2
human_signoff:
---

# Evidence Report: cap-nhat-trong-ngan-kr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4a | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10a | AC-10 | script | PASS |
| E10b | AC-10 | test | FAIL |
| E10c | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cap-nhat-trong-ngan-kr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_mo_thu
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-mo-thu
    Ran 1 test across 1 file. [1.97s]

- eval: E2
  run_id: minted-cap-nhat-trong-ngan-kr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_chi_doc
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-chi-doc
    Ran 1 test across 1 file. [1325.00ms]

- eval: E3
  run_id: minted-cap-nhat-trong-ngan-kr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_xem_truoc
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-xem-truoc
    Ran 1 test across 1 file. [1.66s]

- eval: E4a
  run_id: minted-cap-nhat-trong-ngan-kr-E4a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_gui
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-gui
    Ran 1 test across 1 file. [1.89s]

- eval: E4b
  run_id: minted-cap-nhat-trong-ngan-kr-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_api
  verified_at: 2026-10-30T09:01:49Z
  output: |
    bun run test -- "cd apps/api && bun test test/cap-nhat-trong-ngan-kr.spec.ts -t cnk-api"
    test-run: dropped crm_mvuqumm7hyrk_test

- eval: E5
  run_id: minted-cap-nhat-trong-ngan-kr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_loi
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-loi
    Ran 2 tests across 1 file. [2.30s]

- eval: E6
  run_id: minted-cap-nhat-trong-ngan-kr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_giu_nhap
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-giu-nhap
    Ran 1 test across 1 file. [2.32s]

- eval: E7
  run_id: minted-cap-nhat-trong-ngan-kr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_loi_vao
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-loi-vao
    Ran 1 test across 1 file. [1.93s]

- eval: E8
  run_id: minted-cap-nhat-trong-ngan-kr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cnk_dau_ngan
  verified_at: 2026-10-30T09:01:49Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-dau-ngan
    Ran 1 test across 1 file. [2.19s]

- eval: E9
  run_id: minted-cap-nhat-trong-ngan-kr-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cnk_man
  verified_at: 2026-10-30T09:01:49Z
  screenshot: evidence/cnk-1280-1-den-han.png
  observed: |
    Đã mở từng ảnh bằng Read.
    - cnk-1280-1-den-han.png: sáng, 1280×800. Ngăn KR «Giữ thời gian duyệt hợp đồng dưới 2 ngày» (1/2) mở bên phải. Khối «CẬP NHẬT KR NÀY» đang mở, nằm trọn trong khung nhìn: ô Giá trị 1,9 ngày, «Tiến độ mới 100%», ba chip mức tự tin Cao/Vừa/Thấp, «Lần trước: cao», ô Ghi chú, nút «Gửi cập nhật» (mờ, chờ chọn mức tự tin), «LỊCH SỬ CẬP NHẬT» bắt đầu ngay bên dưới. Không có hộp thoại nào che ngăn.
    - cnk-1280-2-vua-gui.png: Ngăn vẫn mở sau khi gửi. Khối thu lại thành «Cập nhật KR này · Lần mới nhất: 30/10 · 2 ngày». Ô số hiện tại đổi thành 2 ngày. Biểu đồ có thêm chấm mới ở 30/10. Dòng đầu Lịch sử là «16:03 30/10/2026 · 2 ngày · ghi chú cnk 1280 · Tự tin vừa», đúng giá trị vừa gửi. Toast «Đã gửi cập nhật», không có dialog.
    - cnk-1280-3-tu-hop-tuan.png: Ngăn KR «Giữ khiếu nại tồn qua đêm dưới 5» (1/5 · theo thứ tự bảng) mở từ Họp tuần. Khối «CẬP NHẬT KR NÀY» mở sẵn ở đầu ngăn trong khung nhìn. Có dòng «Bạn ghi hộ Mai Đức Long». Ô Giá trị 4,8 đang có viền nhấn, tức tiêu điểm nằm ở ô giá trị. Không có dialog.
    - cnk-375-1-den-han.png: 375×812. Ngăn kéo từ dưới lên (2/2) «Người mới tự nhận ca trong 10 ngày». Khối «CẬP NHẬT KR NÀY» mở với ô Giá trị 9,6 ngày, «Tiến độ mới 100%», chip Cao/Vừa/Thấp, «Lần trước: thấp», nằm trong khung nhìn. Chỉ một ngăn kéo, không dialog thứ hai.
    - cnk-375-2-vua-gui.png: Ngăn kéo vẫn mở. Hiện tại 10 ngày, khối thu thành «Cập nhật KR này · Lần mới nhất: 30/10 · 10 ngày». Biểu đồ có chấm mới. Toast «Đã gửi cập nhật». Không dialog.
    - cnk-375-3-tu-hop-tuan.png: Ngăn kéo KR «Giữ khiếu nại tồn qua đêm dưới 5» (1/5). Khối cập nhật mở sẵn, có dòng «Bạn ghi hộ Mai Đức Long», ô Giá trị 4,8 đang có viền nhấn (tiêu điểm), nằm trong khung nhìn. Một ngăn kéo duy nhất, không dialog.
    Cả sáu ảnh khớp Expected và khớp số liệu do bàn đo in.
  network_observed: n-a (driver)
  output: |
    Network: driver là script Playwright trong man.mjs, không có đường đọc network từ đó, nên networkObserved = n-a (driver) và không ghi E9-network.txt.
    Chiều đỏ (bản sao phục hồi HopThoaiCapNhatKr) không nằm trong steps của lượt này nên không chạy.

- eval: E10a
  run_id: minted-cap-nhat-trong-ngan-kr-E10a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cnk_khong_hop_thoai
  verified_at: 2026-10-30T09:01:49Z
  output: |
    bun _acceptance/cap-nhat-trong-ngan-kr/rang/khong-hop-thoai.mjs
    khong-hop-thoai: 0 cho dung

- eval: E10b
  run_id: minted-cap-nhat-trong-ngan-kr-E10b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.suite_app_ui
  verified_at: 2026-10-30T09:01:49Z
  output: |
    bun run test -- --filter=app --filter=@crm/ui
    app:test: 3 tests failed:
    app:test: (fail) kho chuoi cua vong ③a > okr-canh-kr: moi gia tri tieng Viet mang dau, tru khoa da khai [0.14ms]
    app:test: (fail) kho chuoi cua vong ③a > okr-canh-kr: khong gia tri nao con y het ban tieng Anh [0.30ms]
    app:test: (fail) khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI [2.66ms]
    app:test:  1031 pass
    app:test:  3 fail
    app:test: Ran 1034 tests across 105 files. [9.18s]
    Tasks: 3 successful, 4 total; Failed: app#test
  ghi_chu: |
    Lệnh fail này gắn eval E10b; không có lệnh fail nào không gắn eval. Nguyên nhân: chưa rõ. Log chỉ cho tên ba ca đỏ (hai ca «okr-canh-kr» của bộ kho chuỗi vòng ③a và ca «khoa chet»), chưa có dòng lỗi chi tiết của từng ca. Ba ca cùng nằm trong bộ bài kiểm chuỗi/khoá của apps/app, không thuộc nhóm tệp đã ký đo cập nhật KR mà expected của E10b nêu tên.

- eval: E10c
  run_id: minted-cap-nhat-trong-ngan-kr-E10c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cnk_thuoc_da_ky
  verified_at: 2026-10-30T09:01:49Z
  output: |
    bun _acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs
    thuoc-da-ky: 45 o, 0 mat lang

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

- cmd: bun run lint:slop
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

- cmd: bunx turbo run build --force
  run_id: minted-cap-nhat-trong-ngan-kr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-30T09:01:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-mo-thu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-chi-doc: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-xem-truoc: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-gui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && bun test test/cap-nhat-trong-ngan-kr.spec.ts -t cnk-api": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-loi: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-giu-nhap: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-loi-vao: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/cap-nhat-trong-ngan-kr.dom.tsx -t cnk-dau-ngan: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/cap-nhat-trong-ngan-kr/rang/khong-hop-thoai.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- --filter=app --filter=@crm/ui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/cap-nhat-trong-ngan-kr/rang/thuoc-da-ky.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: none — không eval nào được đo là xanh-trên-baseline. Lưu ý: baseline không đo được ở round này (BLOCKED hạ tầng), nên danh sách rỗng này không chứng minh eval nào là «red trên baseline»; khả năng phân biệt của từng eval chưa được xác nhận bằng A/B.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10b failed — bộ bài kiểm app và @crm/ui có 3 ca đỏ (hai ca «okr-canh-kr» của bộ kho chuỗi vòng ③a và ca «khoa chet: moi khoa da khai deu co cho goi»); nguyên nhân chi tiết chưa rõ, log chỉ cho tên ca. Returned to implementation.
