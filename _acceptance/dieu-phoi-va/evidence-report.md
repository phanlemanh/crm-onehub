---
schema_version: 2
feature_slug: dieu-phoi-va
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 58dd699ec879b039efeb88466c09347ce485c060
human_signoff:
---

# Evidence Report: dieu-phoi-va

Vòng 1. Mọi eval của tính năng (E1 đến E11) đều xanh. Verdict là REJECT vì một lệnh suite hồi quy không gắn eval nào đã đỏ: `bun run test -- --filter=app --filter=@crm/ui`. Vì lệnh này không thuộc eval nào nên `failed_evals` để trống. Chi tiết ở khối lệnh suite bên dưới và ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-4 | ui-check | PASS |
| E11 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: mv21ex4c182q
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_ma_lech
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/dieu-phoi-va.spec.ts -t ma-lech"
    test-run: dropped crm_mv21ex4c182q_test

- eval: E1c
  run_id: mv21eyai7ui7
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_mach_lien
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/api && DPV_MACH_LIEN=1 bun test test/dieu-phoi-va.spec.ts -t mach-lien-ghi && cd ../agent && DPV_MACH_LIEN=1 bun test test/dieu-phoi-va.spec.ts -t mach-lien-doc"
    test-run: dropped crm_mv21eyai7ui7_test

- eval: E1b
  run_id: minted-dieu-phoi-va-E1b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_nhan_lo
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t nhan-lo"
    test-run: dropped crm_mv21exw4nak0_test

- eval: E2
  run_id: mv21ey45kvzf
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_khong_trung
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/dieu-phoi-va.spec.ts -t khong-trung"
    test-run: dropped crm_mv21ey45kvzf_test

- eval: E3
  run_id: mv21ey7hoxfo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_dong_som
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/agent && bun test test/dieu-phoi-va.spec.ts -t dong-som"
    test-run: dropped crm_mv21ey7hoxfo_test

- eval: E4
  run_id: minted-dieu-phoi-va-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx -t "ke-hoach-rong|bo-phan-khac|loi-bo-phan"
    Ran 6 tests across 1 file. [1.77s]

- eval: E5
  run_id: minted-dieu-phoi-va-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx -t "ke-hoach-rong|bo-phan-khac|loi-bo-phan"
    Ran 6 tests across 1 file. [1.77s]

- eval: E6
  run_id: mv21eycxmwrk
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_bo_phan_hong
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t bo-phan-hong"
    test-run: dropped crm_mv21eycxmwrk_test

- eval: E6b
  run_id: minted-dieu-phoi-va-E6b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_them_buoc_dom
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx -t "ke-hoach-rong|bo-phan-khac|loi-bo-phan"
    Ran 6 tests across 1 file. [1.77s]

- eval: E7
  run_id: mv21exejlvlr
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_dem_qua_han
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t dem-qua-han"
    test-run: dropped crm_mv21exejlvlr_test

- eval: E7b
  run_id: minted-dieu-phoi-va-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_the_qua_han_dom
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx -t the-qua-han
    Ran 4 tests across 1 file. [836.00ms]

- eval: E8
  run_id: minted-dieu-phoi-va-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dpv_the_qua_han_dom
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx -t the-qua-han
    Ran 4 tests across 1 file. [836.00ms]

- eval: E9
  run_id: minted-dieu-phoi-va-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dpv_hoi_quy
  verified_at: 2026-10-10T06:52:41Z
  output: |
    cmd: khong-xoa-expect.mjs --tu-thu, khong-xoa-expect.mjs --moc d0ccad984, bun test api (dieu-phoi-diem-nhan, han-viec), bun test app (ke-hoach-sheet, moi-phia-ke-hoach, han-viec, may-nhac), bun run check-types
    Tất cả các bước thoát bình thường.

- eval: E10
  run_id: minted-dieu-phoi-va-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dpv_man
  verified_at: 2026-10-10T06:52:41Z
  screenshot: evidence/E10-step1.png
  observed: |
    Tôi đã mở và đọc từng ảnh trong 8 ảnh (lần chạy 2).
    - E10-step1 (rỗng, 1440): Sheet Kế hoạch bên phải, tiêu đề «Đo E6 …». Thống kê Bước 0/0. Tab Bước không có số đếm. Khung trống «Kế hoạch chưa có bước nào», dòng «Thêm bước đầu tiên và chọn phòng ban giữ nó.», nút «+ Thêm bước». Khớp expected.
    - E10-step2 (rỗng, 390): Cùng trạng thái dạng drawer dưới. Nút «+ Thêm bước» nhìn thấy, không tràn ngang. Khớp.
    - E10-step3 (thêm bộ phận, 1440): Form đã mở với ô chọn «Bộ phận đo B …», ô nhãn «Bước đo … 1440», ô ngày 10/10/2026, nút «Thêm» và «Thôi». Đã chọn bộ phận và gõ tên trước khi Lưu. Khớp.
    - E10-step4 (thêm bộ phận, 390): Cùng form, nhãn «Bước đo … 390» gõ đủ. Hàng ngày và nút «Thêm» bị huy hiệu N của Next dev che một phần (công cụ dev, không phải ứng dụng). Khớp.
    - E10-step5 (bộ phận khác, 1440): Kế hoạch có 1 bước, tab «Bước 1», nhóm «BỘ PHẬN ĐO A … · ĐÃ XONG 0/1», dòng «Bước có sẵn …», nút «+ Thêm bước». Form mở với menu chọn bộ phận chỉ liệt kê «Bộ phận đo B …» (không có A, bộ phận đã có bước). Khớp.
    - E10-step6 (bộ phận khác, 390): Cùng trạng thái. Menu chỉ có «Bộ phận đo B …». Nhãn bước trên dòng bị cắt thành «Bước …» vì ô chọn người và ngày chiếm chỗ. Chỉ để ghi nhận, không phải lỗi theo expected.
    - E10-step7 (đóng, 1440): Huy hiệu «Đã đóng 10 thg 10, 2026», dòng «Kế hoạch đã đóng — mở lại để sửa.», nhóm bộ phận A với 1 bước, ô chọn người và ngày bị làm mờ. Không có nút «Thêm bước». Khớp.
    - E10-step8 (đóng, 390): Cùng trạng thái dạng drawer, không có nút thêm, nhãn bước cũng bị cắt thành «Bước …». Khớp.
    Không có ảnh nào mâu thuẫn với expected.
  network_observed: n-a (driver)
  output: |
    Ghi chú của người đo: chưa khớp hẳn với Expected. Expected nói «đọc lại bước qua API», nhưng man.mjs đọc lại bằng Prisma (db.onboardingStep.findFirst), không gọi API. Bước hiện lại trên màn sau khi Lưu cho thấy đường đọc của giao diện chạy, nhưng chưa có assertion nào đọc qua API. Mục này được chấp nhận dựa trên dữ liệu đã ghi vào cơ sở dữ liệu; nếu người duyệt muốn đúng chữ «qua API» thì cần thêm một lần đọc bằng API.

- eval: E11
  run_id: minted-dieu-phoi-va-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dpv_man
  verified_at: 2026-10-10T06:52:41Z
  screenshot: evidence/E11-step1.png
  observed: |
    I opened all 4 frames with Read.
    - E11-step1.png (1440, 25 việc + 15 bước seeded): The Tổng quan card "Việc quá hạn" has the description "43 việc quá hạn". It lists 3 pre-existing rows (Book the technical deep dive, Send SOC 2 report, Chase procurement) and then "Việc đo mv21ice4 0/1/2…" in a scroll box. Below the box is the visible line "và 23 việc quá hạn nữa". This matches Expected apart from the total: 43 instead of 40, because the measurement DB already held 3 overdue items for ada@trycomp.ai. 23 = 43 − 20 rows rendered (10 việc + 10 bước).
    - E11-step2.png (390): The card description is hidden (packages/ui hides CardDescription below 640 px, as the step predicts). The same list is shown, and the line "và 23 việc quá hạn nữa" is visible under the box. This matches Expected.
    - E11-step3.png (1440, seed cleaned up): The description is "3 việc quá hạn" with 3 rows and no "nữa" line. This matches Expected.
    - E11-step4.png (390, seed cleaned up): The same 3 rows, and no "và N … nữa" line anywhere. This matches Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-10T06:52:41Z
  output: |
    746 pass, 1 fail, 747 tests across 72 files.
    Bài đỏ duy nhất: test/ (kho chuoi cua vong ③a) > "moi ham ghep bien co khang dinh, va so ham bang so khang dinh".
    Lệnh này không gắn eval nào của tính năng. Nguyên nhân bài đỏ: chưa rõ (chỉ có tên bài, chưa có thông điệp khẳng định thất bại nguyên văn và chưa có tệp, dòng).

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dieu-phoi-va-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-va-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-va-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-va-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T06:52:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Hai eval ui-check (E10, E11) không chạy được trên baseline (n-a), nên không xếp vào nhóm không phân biệt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào của tính năng đỏ. Lệnh suite hồi quy `bun run test -- --filter=app --filter=@crm/ui` đỏ ở một bài (kho chuoi cua vong ③a: mỗi hàm ghép biến cố có khẳng định, và số hàm bằng số khẳng định). Bài này không gắn eval nào nên `failed_evals` để trống. Nguyên nhân chưa rõ. Cần xác định bài đỏ là hồi quy do nhánh này gây ra hay đã đỏ sẵn ở diffBase trước khi trả về triển khai. Ghi chú thêm cho người duyệt: E10 nói «đọc lại qua API» nhưng phép đo đọc lại bằng Prisma (xem khối E10).
