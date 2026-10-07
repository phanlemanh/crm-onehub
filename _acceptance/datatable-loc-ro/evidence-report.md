---
schema_version: 2
feature_slug: datatable-loc-ro
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2d09a90c95166eb80ecce6ac7ca8b321ddb694b0
human_signoff:
---

# Evidence Report: datatable-loc-ro

Round 1. Mười một eval của hợp đồng đều xanh, nhưng một lệnh suite hồi quy không gắn eval nào đỏ: `bun run test -- --filter=app --filter=@crm/ui`. Theo luật, lệnh suite đỏ thì verdict là REJECT dù `failed_evals` rỗng. Chi tiết ở mục Lệnh suite (hồi quy) bên dưới.

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
  run_id: minted-datatable-loc-ro-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_rong_vi_loc
  verified_at: 2026-10-07T21:38:25Z
  output: |
    Ran 1 test across 1 file. [1088.00ms]

- eval: E2
  run_id: minted-datatable-loc-ro-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_nut_bo_loc
  verified_at: 2026-10-07T21:38:25Z
  output: |
    Ran 2 tests across 1 file. [1032.00ms]

- eval: E3
  run_id: minted-datatable-loc-ro-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_bang_bo_loc
  verified_at: 2026-10-07T21:38:25Z
  output: |
    (bo-loc, 4 bảng) xanh; lệnh chạy với TZ=Asia/Ho_Chi_Minh

- eval: E4
  run_id: minted-datatable-loc-ro-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_bo_chon
  verified_at: 2026-10-07T21:38:25Z
  output: |
    (bo-chon) xanh

- eval: E5
  run_id: minted-datatable-loc-ro-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_so_dem
  verified_at: 2026-10-07T21:38:25Z
  output: |
    (so-dem) xanh

- eval: E6
  run_id: minted-datatable-loc-ro-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_bang_so_0
  verified_at: 2026-10-07T21:38:25Z
  output: |
    4 expect() calls
    Ran 3 tests across 1 file. [3.12s]

- eval: E7
  run_id: minted-datatable-loc-ro-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dlr_bang_khong_loc
  verified_at: 2026-10-07T21:38:25Z
  output: |
    Ran 2 tests across 1 file. [1.60s]

- eval: E8
  run_id: minted-datatable-loc-ro-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlr_do_man
  verified_at: 2026-10-07T21:38:25Z
  screenshot: evidence/menu-giai-doan-1440.png
  observed: |
    menu-giai-doan-1440: trang Thoả thuận, menu Lọc mở, mục Giai đoạn có menu con liệt kê từng giai đoạn kèm số (giai đoạn rỗng mang 0), hộp menu nằm trọn trong khung 1440x900.
    rong-vi-loc-1440: bảng rỗng với tiêu đề "Không có kết quả nào khớp bộ lọc", mô tả, nút "Bỏ lọc" rõ giữa bảng, nút Lọc hiện (1), không đè thanh công cụ, không tràn ngang.
    sau-bo-loc-1440: sau khi bấm Bỏ lọc bảng có 12 dòng (27 thoả thuận, trang 1/2), nút Lọc hết số đếm. truong-tuy-chinh-1440: menu con trường "Nguồn đo E7" có lựa chọn chưa ai dùng kèm 0.
    rong-vi-loc-375 và sau-bo-loc-375: khung điện thoại thấy rõ tiêu đề, mô tả, nút "Bỏ lọc", không tràn ngang; sau bỏ lọc bảng hiện nhiều dòng, nút Lọc hết (1). Khớp expected.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu (6 ảnh trong evidence/): menu-giai-doan-1440, rong-vi-loc-1440, sau-bo-loc-1440, truong-tuy-chinh-1440, rong-vi-loc-375, sau-bo-loc-375 (.png). Đã mở từng ảnh bằng Read và đối chiếu mắt.
    Driver là script do-man.mjs, không có công cụ đọc network nên không tạo E8-network.txt.
    Ghi chú nhỏ: ở 375 (rong-vi-loc, sau-bo-loc) nút nổi "N" của dev overlay đè lên chữ chân bảng ở góc dưới, không đè tiêu đề, mô tả, nút hay thanh công cụ.

- eval: E9
  run_id: minted-datatable-loc-ro-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dlr_chu
  verified_at: 2026-10-07T21:38:25Z
  output: |
    Ran 12 tests across 1 file. [856.00ms]

- eval: E10
  run_id: minted-datatable-loc-ro-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dlr_hoi_quy
  verified_at: 2026-10-07T21:38:25Z
  output: |
    git diff --quiet với merge-base: hai tệp OKR không đổi; năm tệp kiểm xanh

- eval: E11
  run_id: minted-datatable-loc-ro-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlr_san_thiet_ke
  verified_at: 2026-10-07T21:38:25Z
  output: |
    design-gate --mode static xanh cho sáu tệp; rang/khong-ghi-de.mjs:
    KET LUAN 4 DUNG, 0 SAI

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-07T21:38:25Z
  output: |
    Tệp đỏ: apps/app/test/danh-muc-quan-ly.dom.tsx, ca "khong-khop: dang bang giu thanh loc, hien khong khop va Bo loc" (6 ca xanh, 1 ca đỏ trong tệp).
    Lỗi: màn không tới trạng thái mong đợi. Nội dung màn lúc đó: nút Lọc (1) và dòng "Không có kết quả nào khớp bộ lọc", tức câu chung của DataTable thay cho màn không-khớp riêng của bảng danh mục onboarding.
    Task đỏ: app#test; 3 trên 4 task thành công. Cơ sở dữ liệu thử đã drop sạch.
    Lệnh này không gắn eval nào. Nguyên nhân khớp với hai phát hiện t2 và t3 trong review-findings.md (bộ lọc đang bật thắng prop empty của DataTable); phát hiện đó cần người xác nhận.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-datatable-loc-ro-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

- cmd: bunx turbo run lint --force
  run_id: minted-datatable-loc-ro-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

- cmd: bun run lint:slop
  run_id: minted-datatable-loc-ro-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

- cmd: bunx turbo run build --force
  run_id: minted-datatable-loc-ro-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T21:38:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline diffBase, chứng minh harness chứ không chứng minh tính năng): E9 và E10.

- E9 (AC-9): lệnh messages-guard cộng data-table-locale xanh cả trước lẫn sau. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý. Lưu ý thêm: ca "loc-ro-chu" trong tệp chỉ phủ 4 khoá table chứ không đủ 7 khoá như eval hứa (xem review-findings.md).
- E10 (AC-10): hồi quy có chủ ý (năm tệp kiểm cũ cộng kiểm hai tệp OKR không đổi so với merge-base), xanh ở cả hai phía là kỳ vọng.

E8 và E11 không chạy được trên baseline (n-a), không tính là không phân biệt.

## Variance

none — every multi-run eval is uniform

## Judge panels

Không có eval judgment nào trong vòng này, không có panel nào được chấm. Không mục nào chờ human_override.

## Iterations

Round 1: mọi eval của hợp đồng xanh nhưng lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở ca không-khớp của bảng danh mục onboarding (danh-muc-quan-ly.dom.tsx), không gắn eval nào nên failed_evals rỗng. Trả về triển khai để người xem xét: hoặc sửa DataTable cho prop empty tường minh thắng nguồn lọc, hoặc cập nhật nơi gọi.
