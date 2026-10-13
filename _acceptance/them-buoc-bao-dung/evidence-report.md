---
schema_version: 2
feature_slug: them-buoc-bao-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2b65a3d5aa9673375c4c14c9f4cf9cc8ad749e11
human_signoff:
---

# Evidence Report: them-buoc-bao-dung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-3 | ui-check | PASS |
| E11 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: mv6h21vv2tfr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T09:21:32Z
  cmd: bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts"
  output: |
    The suite finished with 2 pass, 1 skip, 0 fail across 3 tests in test/them-buoc-bao-dung.spec.ts (21 expect() calls, 454.00ms).

- eval: E2
  run_id: mv6h21vv2tfr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T09:21:32Z
  cmd: bun run test -- "cd apps/api && bun test test/them-buoc-bao-dung.spec.ts"
  output: |
    The suite finished with 2 pass, 1 skip, 0 fail across 3 tests in test/them-buoc-bao-dung.spec.ts (21 expect() calls, 454.00ms).

- eval: E3
  run_id: minted-them-buoc-bao-dung-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T09:21:32Z
  cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
  output: |
    Ran 12 tests across 1 file. [1459.00ms]

- eval: E4
  run_id: minted-them-buoc-bao-dung-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T09:21:32Z
  cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
  output: |
    Ran 12 tests across 1 file. [1459.00ms]

- eval: E5
  run_id: minted-them-buoc-bao-dung-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T09:21:32Z
  cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t phong-ban-loi
  output: |
    Ran 12 tests across 1 file. [1459.00ms]

- eval: E6
  run_id: minted-them-buoc-bao-dung-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_lui
  verified_at: 2026-10-13T09:21:32Z
  cmd: cd apps/app && TBD_MUI_GIO=lui TZ=America/Los_Angeles bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-lui
  output: |
    Ran 4 tests across 1 file. [1037.00ms]

- eval: E7
  run_id: minted-them-buoc-bao-dung-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_tien
  verified_at: 2026-10-13T09:21:32Z
  cmd: cd apps/app && TBD_MUI_GIO=tien TZ=Pacific/Kiritimati bun test --preload ../../packages/ui/test/setup-dom.ts ./test/them-buoc-bao-dung.dom.tsx -t qua-han-tien
  output: |
    Ran 4 tests across 1 file. [774.00ms]

- eval: E8
  run_id: minted-them-buoc-bao-dung-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_hoi_quy
  verified_at: 2026-10-13T09:21:32Z
  cmd: bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --tu-thu && bun _acceptance/them-buoc-bao-dung/rang/khong-xoa-expect.mjs --moc 3a2783409 && bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts" && cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dieu-phoi-va.dom.tsx ./test/han-viec.dom.tsx ./test/moi-phia-ke-hoach.dom.tsx ./test/may-nhac.dom.tsx ./test/ke-hoach-sheet.dom.tsx && cd ../.. && bun run check-types
  output: |
    Chuỗi lệnh chạy hết, không có dòng lỗi (tự-thử, so mốc, suite API điều phối, năm tệp DOM, check-types).

- eval: E9
  run_id: minted-them-buoc-bao-dung-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_khu_hoi
  verified_at: 2026-10-13T09:21:32Z
  cmd: bun run test -- "cd apps/api && TBD_KHU_HOI=1 TZ=America/Los_Angeles bun test test/them-buoc-bao-dung.spec.ts -t qua-han-khu-hoi && TBD_KHU_HOI=1 TZ=Pacific/Kiritimati bun test test/them-buoc-bao-dung.spec.ts -t qua-han-khu-hoi"
  output: |
    test-run: dropped crm_mv6h22gsn846_test

- eval: E10
  run_id: tbd-r4-e10-60553
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T09:21:32Z
  cmd: ui-check:E10
  screenshot: evidence/them-buoc-loi-phong-ban-1440.png
  observed: |
    Đã mở từng frame bằng Read. 1440 / them-buoc-loi-phong-ban: sheet bản ghi 'Đo E6b mv6h2toc 0', tab Bước, trạng thái rỗng 'Kế hoạch chưa có bước nào'; hộp lỗi «Không tải được danh sách phòng ban», câu 'Kiểm tra kết nối rồi thử lại.' và nút 'Thử lại' nằm trong khung nhìn; không có ô chọn Phòng ban; không thấy cuộn ngang. Khớp Expected.
    1440 / them-buoc-khac-loi-phong-ban: bản ghi 'Đo E6b mv6h2toc 1' có 1 bước sẵn (phòng ban đo A, 'Thêm bước' trong nhóm); bên dưới hộp lỗi + nút 'Thử lại' trong khung nhìn; không ô chọn. 1440 / them-buoc-thu-lai-xong: bản ghi 0 bước, vùng lỗi biến mất, ô chọn 'Phòng ban' hiện và mở danh sách 'Phòng ban đo A / B mv6h2toc'. Khớp.
    390 / them-buoc-loi-phong-ban: drawer đáy, hộp lỗi «Không tải được danh sách phòng ban» và nút 'Thử lại' hiện trọn trong khung nhìn 390, không tràn ngang, không ô chọn. 390 / them-buoc-khac-loi-phong-ban: bản ghi '... 3' có 1 bước; hộp lỗi + nút 'Thử lại' trong khung nhìn, không tràn ngang. 390 / them-buoc-thu-lai-xong: lỗi hết, ô chọn 'Phòng ban' hiện với danh sách hai phòng ban. Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Sáu frame đã lưu trong evidence/: them-buoc-loi-phong-ban, them-buoc-khac-loi-phong-ban, them-buoc-thu-lai-xong, mỗi tên ở khổ 1440 và 390. Các tệp E10-step1..6.png trong evidence/ là bản cũ, lượt này không ghi đè.

- eval: E11
  run_id: minted-them-buoc-bao-dung-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T09:21:32Z
  cmd: ui-check:E11
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440): Tổng quan OneHub Center. Thẻ «Việc quá hạn» ghi "12 việc quá hạn", bảng cuộn trong thẻ hiện 6 dòng, mỗi dòng có chấm đỏ (tone error). Ngay dưới thẻ là chân thẻ đúng chữ «và 1 việc quá hạn nữa». Khớp AC-6 nhánh lùi. Dòng bước cụ thể không nằm trong 6 dòng nhìn thấy (bảng cuộn), nên dấu error của dòng bước dựa vào assertion DOM của man.mjs chứ không từ ảnh.
    E11-step2.png (390): cùng nội dung ở khổ điện thoại, 6 dòng, chấm đỏ mỗi dòng, chân thẻ «và 1 việc quá hạn nữa», không tràn ngang đáng kể. Không mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    Hai ảnh E11-step1.png (1440) và E11-step2.png (390) trong evidence/, bản sao của qua-han-con-sot-1440.png và qua-han-con-sot-390.png do man.mjs ghi.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bun run lint:slop
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

- cmd: bunx turbo run build --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-13T09:21:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: toan bo eval round nay (evals.yaml khong doi tu lan baseline cuoi, round 1); moi block ghi baseline n-a.

Eval khong-phan-biet: none.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: 11 eval va 7 lenh suite deu xanh tren 2b65a3d5aa9673375c4c14c9f4cf9cc8ad749e11; verdict PASS.
Round 1-3: dau vet tung round nam trong run-log.jsonl cung thu muc; round nay thay toan bo noi dung report.
