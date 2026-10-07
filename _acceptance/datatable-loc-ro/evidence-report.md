---
schema_version: 2
feature_slug: datatable-loc-ro
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1a1c0eed2235ddd3bf3e684bc182624485af152e
human_signoff: Phan Le Manh 2026-10-07
---

# Evidence Report: datatable-loc-ro

Round 2. Mười một eval của hợp đồng đều xanh và cả bảy lệnh suite hồi quy đều xanh, kể cả lệnh `bun run test -- --filter=app --filter=@crm/ui` đã đỏ ở round 1. Không có eval judgment, không có eval ngẫu nhiên, không mục nào chờ người.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-datatable-loc-ro-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_rong_vi_loc
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 1 test across 1 file. [733.00ms]

- eval: E2
  run_id: minted-datatable-loc-ro-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_nut_bo_loc
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 2 tests across 1 file. [1000.00ms]

- eval: E3
  run_id: minted-datatable-loc-ro-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_bo_loc
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 4 tests across 1 file. [1146.00ms]
    Lệnh chạy với TZ=Asia/Ho_Chi_Minh.

- eval: E4
  run_id: minted-datatable-loc-ro-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bo_chon
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 4 tests across 1 file. [874.00ms]

- eval: E5
  run_id: minted-datatable-loc-ro-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_so_dem
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 4 tests across 1 file. [931.00ms]

- eval: E6
  run_id: minted-datatable-loc-ro-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_so_0
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 3 tests across 1 file. [3.11s]
    Lệnh chạy với TZ=Asia/Ho_Chi_Minh.

- eval: E7
  run_id: minted-datatable-loc-ro-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_bang_khong_loc
  verified_at: 2026-10-07T22:02:36Z
  output: |
    3 expect() calls
    Ran 2 tests across 1 file. [1243.00ms]

- eval: E8
  run_id: minted-datatable-loc-ro-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlr_do_man
  verified_at: 2026-10-07T22:02:36Z
  screenshot: evidence/menu-giai-doan-1440.png
  observed: |
    Đã mở từng ảnh bằng Read. menu-giai-doan-1440: trang Thoả thuận, menu Lọc mở, submenu Giai đoạn liệt kê từng giai đoạn kèm số (Demo booked 5, Qualified to buy 8, ... «Giai đoạn đo E7» 0, Closed won 0), giai đoạn rỗng mang 0, hộp menu nằm trọn trong khung 1440x900.
    rong-vi-loc-1440: nút «Lọc (1)» bật, bảng chỉ còn hàng tiêu đề, giữa vùng bảng có «Không có kết quả nào khớp bộ lọc», mô tả và nút «Bỏ lọc» rõ ràng, không đè thanh công cụ. sau-bo-loc-1440: nút Lọc hết số đếm, bảng 12 dòng, chân bảng «27 thoả thuận», trang 1/2. truong-tuy-chinh-1440: trang Cá nhân, menu con «Nguồn đo E7» có «Hội chợ đo E7» 1 và «Chưa dùng đo E7» 0.
    rong-vi-loc-375: điện thoại, «Lọc (1)», câu, mô tả và nút «Bỏ lọc» trong khung nhìn, không tràn ngang (chỉ huy hiệu dev «N» che nhẹ chân trang, không thuộc nội dung). sau-bo-loc-375: nút Lọc hết (1), bảng nhiều dòng thoả thuận, chân «27 thoả thuận». Tất cả khớp expected.
  network_observed: n-a (driver)
  output: |
    6 ô đo: 1440 gồm menu-giai-doan, rong-vi-loc, sau-bo-loc, truong-tuy-chinh; 375 gồm rong-vi-loc, sau-bo-loc.
    Frame lưu trong evidence/: menu-giai-doan-1440, rong-vi-loc-1440, sau-bo-loc-1440, truong-tuy-chinh-1440, rong-vi-loc-375, sau-bo-loc-375 (.png); bản sao E8-step1..6.png theo cùng thứ tự.
    Driver là script Playwright trong do-man.mjs, không có công cụ đọc network nên không tạo E8-network.txt. Máy chủ do script tự dựng và tự dọn.

- eval: E9
  run_id: minted-datatable-loc-ro-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_chu
  verified_at: 2026-10-07T22:02:36Z
  output: |
    Ran 12 tests across 1 file. [940.00ms]

- eval: E10
  run_id: minted-datatable-loc-ro-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlr_hoi_quy
  verified_at: 2026-10-07T22:02:36Z
  output: |
    git diff --quiet với merge-base: hai tệp OKR không đổi.
    Ran 96 tests across 3 files. [3.40s]

- eval: E11
  run_id: minted-datatable-loc-ro-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlr_san_thiet_ke
  verified_at: 2026-10-07T22:02:36Z
  output: |
    design-gate --mode static xanh cho sáu tệp; rang/khong-ghi-de.mjs xanh.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-datatable-loc-ro-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bun run lint:slop
  run_id: minted-datatable-loc-ro-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

- cmd: bunx turbo run build --force
  run_id: minted-datatable-loc-ro-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-07T22:02:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần baseline cuối). Trường `baseline:` của mọi eval ghi n-a vì round này không đo.

Eval không phân biệt theo phép đo baseline ở round 1 (xanh ở cả code mới lẫn baseline diffBase, chứng minh harness chứ không chứng minh tính năng): E9 và E10.

- E9 (AC-9): lệnh messages-guard cộng data-table-locale xanh cả trước lẫn sau. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý. Lưu ý thêm: ca "loc-ro-chu" trong tệp chỉ phủ 4 khoá table chứ không đủ 7 khoá như eval hứa (xem review-findings.md, mục carried từ round 1).
- E10 (AC-10): hồi quy có chủ ý (năm tệp kiểm cũ cộng kiểm hai tệp OKR không đổi so với merge-base), xanh ở cả hai phía là kỳ vọng.

Lệnh suite xanh ở cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Judge panels

Không có eval judgment nào trong vòng này, không có panel nào được chấm. Không mục nào chờ người điền xác nhận.

## Iterations

Round 1: mọi eval của hợp đồng xanh nhưng lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở ca không-khớp của bảng danh mục onboarding (danh-muc-quan-ly.dom.tsx), không gắn eval nào nên failed_evals rỗng. Verdict REJECT, trả về triển khai.
Round 2: đã vá ở hai commit bcad1554d (nơi gọi tự đưa màn rỗng vì lọc riêng qua filteredEmpty, giữ màn không khớp và màn lỗi của danh mục) và f769014fe (bảng danh mục giữ nhãn bộ lọc chỉ là tên). Mười một eval và bảy lệnh suite đều xanh trên commit 1a1c0eed2. Verdict PASS.
