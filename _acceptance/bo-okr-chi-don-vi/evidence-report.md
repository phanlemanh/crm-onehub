---
schema_version: 2
feature_slug: bo-okr-chi-don-vi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 42554bef4690018f2789b88195671b05c3b770ed
human_signoff: Phan Le Manh 2026-10-28
---

# Evidence Report: bo-okr-chi-don-vi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-okr-chi-don-vi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_bon_the
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-bon-the"
    test-run: dropped crm_mvs52eiup6sr_test
    __EXIT=0

- eval: E2
  run_id: minted-bo-okr-chi-don-vi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_so_rieng
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-so-rieng"
    test-run: dropped crm_mvs52ezl71tt_test
    __EXIT=0

- eval: E3
  run_id: minted-bo-okr-chi-don-vi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_toan_canh
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-toan-canh"
    test-run: dropped crm_mvs52el9cl1t_test
    __EXIT=0

- eval: E4
  run_id: minted-bo-okr-chi-don-vi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_gon
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-gon
    Ran 1 test across 1 file. [1345.00ms]
    __EXIT=0

- eval: E5
  run_id: minted-bo-okr-chi-don-vi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_menu
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-menu
    Ran 3 tests across 1 file. [1213.00ms]
    __EXIT=0

- eval: E6
  run_id: minted-bo-okr-chi-don-vi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_da_bo
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-da-bo
    Ran 1 test across 1 file. [1387.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-bo-okr-chi-don-vi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_rong
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-rong
    Ran 1 test across 1 file. [1051.00ms]
    __EXIT=0

- eval: E8
  run_id: minted-bo-okr-chi-don-vi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bcd_hop_tuan_goc
  verified_at: 2026-10-28T13:16:54Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-hop-tuan-goc
    Ran 1 test across 1 file. [1094.00ms]
    __EXIT=0

- eval: E9
  run_id: E9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bcd_man
  verified_at: 2026-10-28T13:16:54Z
  screenshot: evidence/E9-step1.png
  observed: |
    E9-step1 (bcd-khoi-1440-sang): trang Mục tiêu, dòng vị trí «Bộ OKR › Khối Kinh doanh ▾» ngay dưới đầu trang; dưới là thẻ con OKR · Họp tuần · Việc · Sơ đồ góp vào; bốn ô số (Ngày còn lại 54, Tiến độ 75%, KR đã cập nhật 2/2, KR tự tin thấp 0); đúng một hàng công cụ (chip Tất cả 1, Cần bàn 0, Chưa góp vào đâu 0; Lọc, Sắp xếp, Cột, Gập tất cả); bảng có đúng 1 mục tiêu «Khối Kinh doanh về đích doanh thu quý 4» với 2 KR. Không có ô chọn đơn vị, không có lưới đơn vị trực thuộc dưới bảng (chỉ chân «Trưởng … 1 mục tiêu · 2 KR»). Khớp Expected.
    E9-step2 (bcd-menu-1440-sang): menu mở dưới dòng vị trí, ba nhóm Thuộc (OneHub Center, chưa có mục tiêu riêng), Cùng cấp (Khối Vận hành 1 mục tiêu; Khối Hỗ trợ chưa có mục tiêu riêng), Trực thuộc (Kinh doanh miền Bắc 2, miền Nam 2, Chăm sóc đối tác 2, Marketing 2 mục tiêu); mỗi mục có tên và số mục tiêu; chữ rõ trên nền sáng. Khớp.
    E9-step3 (bcd-menu-375-sang): ở 375 menu nằm gọn trong bề ngang, ba nhóm và 7 mục đủ tên và số mục tiêu, không tên bị cắt, không tràn ngang trang; chữ đọc rõ nền sáng. Khớp.
    E9-step4 (bcd-menu-375-toi): cùng bố cục ở chế độ tối, menu nền tối chữ sáng, tương phản đủ, không chìm nền, nằm gọn trong màn. Khớp.
    E9-step5 (bcd-rong-1440-sang): Khối Hỗ trợ: dòng vị trí «Bộ OKR › Khối Hỗ trợ ▾», ô Tiến độ «—» (Chưa có mục tiêu công bố để so), 0/0, bảng rỗng với câu «Khối Hỗ trợ chưa có mục tiêu riêng trong Quý 4 · mẫu» kèm «Mục tiêu của các phòng ban nằm ở bộ của từng phòng — bấm Khối Hỗ trợ trên dòng vị trí để sang». Chân «0 mục tiêu · 0 KR». Khớp.
    E9-step6 (bcd-danh-sach-1440-sang): danh sách Bộ OKR 14 hàng; cột Mục tiêu / Tiến độ / KR tự tin thấp; Khối Kinh doanh Mục tiêu 1, Tiến độ 75%, KR tự tin thấp 0; Khối Vận hành 1, 14%, 0; Khối Hỗ trợ Mục tiêu 0, Tiến độ «—» (trống), 0. Khớp Expected (Kinh doanh Mục tiêu 1, Hỗ trợ Tiến độ trống) và khớp số script in.
  network_observed: n-a (driver)
  output: |
    - Menu 1440 sáng: Thuộc · Cùng cấp · Trực thuộc, 7 mục, trong màn, tràn ngang 0px DUNG. Menu 375 sáng và 375 tối: cùng ba nhóm, 7 mục, tràn ngang 0px DUNG.
    - Đi từ bộ khối sang bộ một phòng trong 2 lần bấm: DUNG (pb:mau-okr-pb-kd-bac).
    Khung chụp lưu: E9-step1..6.png (bản sao của bcd-khoi-1440-sang, bcd-menu-1440-sang, bcd-menu-375-sang, bcd-menu-375-toi, bcd-rong-1440-sang, bcd-danh-sach-1440-sang) trong _acceptance/bo-okr-chi-don-vi/evidence/. Ảnh gốc do script chụp (qua BCD_CHEP_ANH=1) nằm cùng thư mục (6 tệp bcd-*.png, chưa theo dõi bởi git). Network: driver là script ui-check, không có công cụ đọc network, nên ghi n-a (driver). Đã mở và đọc cả 6 ảnh, tất cả khớp Expected.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bo-okr-chi-don-vi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-okr-chi-don-vi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-okr-chi-don-vi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-okr-chi-don-vi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-okr-chi-don-vi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bun run lint:slop
  run_id: minted-bo-okr-chi-don-vi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-okr-chi-don-vi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-28T13:16:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

none — không đo được ở round này (baseline BLOCKED hạ tầng, mọi eval có baseline n-a); chưa eval nào được xác nhận là red trên baseline, nên danh sách eval không-phân-biệt không xác định được.

### Baseline khong do

- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-bon-the": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-so-rieng": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/bo-okr-chi-don-vi.spec.ts -t bcd-toan-canh": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-gon: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-menu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-da-bo: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-rong: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-chi-don-vi.dom.tsx -t bcd-hop-tuan-goc: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: E1–E9 đạt, bảy lệnh suite hồi quy đạt; không eval nào hỏng. Baseline không đo được (hạ tầng), xem mục Analyst.
