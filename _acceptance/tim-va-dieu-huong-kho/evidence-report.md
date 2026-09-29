---
schema_version: 2
feature_slug: tim-va-dieu-huong-kho
verdict: BLOCKED
failed_evals: []
reason: "E3d — lệnh `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-cmdk.dom.tsx` — agent bị skip/chết, không có kết quả, không được tính là pass. Remedy: chạy lại eval này (không phải lỗi mã)."
blocked: [{"cmd":"cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-cmdk.dom.tsx","reason":"agent bi skip/chet — khong co ket qua, khong duoc tinh la pass"}]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: aa8173564fef36d5d990cb347c3a88b3686e7355
human_signoff:
---

# Evidence Report: tim-va-dieu-huong-kho

Round 1. Verdict BLOCKED: eval E3d (AC-3, hộp tìm nhanh ⌘K bằng DOM) không có kết quả vì agent chạy nó bị skip/chết. Hai mươi hai eval máy còn lại đều xanh và đều đỏ trên baseline (trừ E0s là regression-guard). Hội đồng E12j (judgment) đề xuất FAIL ở cả ba lens vì tiêu đề trang «Tài liệu» bị ba nút đè lên ở khổ 390; đây là đề xuất, người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3d | AC-3 | test | BLOCKED |
| E3u | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E5u | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6d | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8d | AC-8 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11d | AC-11 | test | PASS |
| E0s | AC-12 | test | PASS |
| E12j | AC-12 | judgment | PENDING (hội đồng đề xuất FAIL, chờ người) |

## Evidence

- eval: E1
  run_id: minted-tim-va-dieu-huong-kho-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_tim_ma_tran
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynhmctqxe_test

- eval: E2
  run_id: minted-tim-va-dieu-huong-kho-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_khong_ro
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynj32v5lh_test

- eval: E3
  run_id: minted-tim-va-dieu-huong-kho-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_tim_vai_okr
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynh8msbz8_test

- eval: E3d
  verifier: config:executors.test.tdk_cmdk
  output: |
    Không có kết quả: agent chạy eval này bị skip/chết. Lệnh: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/tai-lieu-cmdk.dom.tsx. Không được tính là pass; cần chạy lại.

- eval: E3u
  run_id: minted-tim-va-dieu-huong-kho-E3u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T00:50:15Z
  screenshot: evidence/E3u-step1.png
  observed: |
    Đã mở từng frame bằng Read. Bước 1 (1440): hộp tìm nhanh ⌘K có ô nhập «quy định hoa hồng», một nhóm «Tài liệu» với dòng «Quy định hoa hồng đối tác», đoạn trích có chữ «hoa» in đậm. Bước 2 (vai okr, «đào tạo»): chỉ nhóm «Tài liệu» với dòng «Đào tạo nhân viên mới», không banner lỗi, không nhóm nào khác. Bước 3 (390): hộp vừa khít chiều ngang, dòng kết quả cắt bằng dấu ba chấm, không thấy cuộn ngang. Khớp expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-tim-va-dieu-huong-kho-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_chen_lien_ket_ui
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 4 tests across 1 file.

- eval: E4b
  run_id: minted-tim-va-dieu-huong-kho-E4b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_chen_lien_ket_api
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulyng761f6c_test

- eval: E4u
  run_id: minted-tim-va-dieu-huong-kho-E4u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T00:50:15Z
  screenshot: evidence/E4u-step1.png
  observed: |
    Màn «Sửa trang» ở 1440: ô «Tên trang» là «Đào tạo nhân viên mới», thân trang «Nhân viên mới học cách làm trong tuần thử việc.». Nút liên kết trang trên thanh công cụ đang sáng, bên dưới là hộp chèn với ô tìm «bao mat»; danh sách có «Bảo mật dữ liệu khách hàng» đứng đầu và được chọn, kế đó «Nghỉ phép năm», «Quy định hoa hồng đối tác». Không banner lỗi, không tràn. Chữ được chọn không thấy nổi trong ảnh; bước tạo liên kết do script kiểm DOM.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-tim-va-dieu-huong-kho-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_toi
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynij1r5k0_test

- eval: E5d
  run_id: minted-tim-va-dieu-huong-kho-E5d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_nhac_toi
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 3 tests across 1 file.

- eval: E5u
  run_id: minted-tim-va-dieu-huong-kho-E5u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T00:50:15Z
  screenshot: evidence/E5u-step1.png
  observed: |
    Bước 1 (1440): màn đọc «Bảo mật dữ liệu khách hàng» có khối «Trang nhắc tới trang này (2)» gồm «Nghỉ phép năm» và «Quy định hoa hồng đối tác», mỗi dòng có câu chứa đoạn in đậm; cột phải «Chủ trang: Lê Thu Trang». Bước 2 (390): cùng khối nằm dưới nội dung, không cuộn ngang. Bước 3 (trang «Trang không ai nhắc tới»): khối (0) chỉ hiện «Chưa trang nào nhắc tới trang này.». Khớp expected.
  network_observed: n-a (driver)
  ghi_chu: chiều đỏ --chieu-do của man-tim.mjs chỉ có bản sao bỏ nhóm Tài liệu khỏi ⌘K (ghim bước 1); chưa có bản sao bỏ khối «Trang nhắc tới» nên câu «bước 5: không thấy khối» trong expected chưa được chứng minh bằng chiều đỏ. Đây là khe hở của eval, không phải lỗi UI.

- eval: E6
  run_id: minted-tim-va-dieu-huong-kho-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_loc
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynhvn0ix7_test

- eval: E6d
  run_id: minted-tim-va-dieu-huong-kho-E6d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_loc
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 4 tests across 1 file.

- eval: E7
  run_id: minted-tim-va-dieu-huong-kho-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_suc_khoe_lien_ket
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynqdodo1i_test

- eval: E8
  run_id: minted-tim-va-dieu-huong-kho-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_suc_khoe_trang_thai
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Bộ ca trang-thai hoàn tất, không ca nào đỏ.

- eval: E8d
  run_id: minted-tim-va-dieu-huong-kho-E8d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_suc_khoe
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 2 tests across 1 file.

- eval: E8u
  run_id: minted-tim-va-dieu-huong-kho-E8u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_suc_khoe
  verified_at: 2026-09-29T00:50:15Z
  screenshot: evidence/E8u-step1.png
  observed: |
    Frame 1 (1440, tab Sức khoẻ): khối «Quá hạn xác minh» số 2 (hai dòng, có chữ «hết hạn»), khối «Có đề xuất chờ duyệt» số 1; các khối khác nằm dưới nếp gấp, số đọc từ DOM khớp đồ thị E7. Frame 2 (390): một cột, không cuộn ngang, NHƯNG tiêu đề «Tài liệu» bị các nút «Tìm nhanh / Tải nguồn lên / Trang mới» đè lên, chữ bị cắt («Tả», «liệ»). Frame 3 (tab Trang, có lọc): còn 1 dòng «Lọc L1». Frame 4 (Chờ duyệt trang 2): 6 dòng, chân trang «26-31 trong số 31» (kỳ vọng ghi 5 dòng, lệch 1 do một bản chờ từ đồ thị E7).
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-tim-va-dieu-huong-kho-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_sang
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Bộ ca nhắc sáng hoàn tất, không ca nào đỏ.

- eval: E9b
  run_id: minted-tim-va-dieu-huong-kho-E9b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_bang_tab
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulynyi69962_test

- eval: E10
  run_id: minted-tim-va-dieu-huong-kho-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_ong_dung
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 8 tests across 1 file.

- eval: E10d
  run_id: minted-tim-va-dieu-huong-kho-E10d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_ong_dung_doc
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 4 tests across 1 file.

- eval: E11
  run_id: minted-tim-va-dieu-huong-kho-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_de_xuat_phan_trang
  verified_at: 2026-09-29T00:50:15Z
  output: |
    test-run: dropped crm_mulyo7ijwhud_test

- eval: E11d
  run_id: minted-tim-va-dieu-huong-kho-E11d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_cho_duyet
  verified_at: 2026-09-29T00:50:15Z
  output: |
    Ran 2 tests across 1 file.

- eval: E0s
  run_id: minted-tim-va-dieu-huong-kho-E0s-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tdk_san_thiet_ke
  verified_at: 2026-09-29T00:50:15Z
  output: |
    design-gate --mode static chạy trên mọi tsx của Kho tài liệu, quick-switcher và trình soạn; không P0.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-29T00:50:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-29T00:50:15Z

- cmd: bun run lint:slop
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-29T00:50:15Z

- cmd: bunx turbo run build --force
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-29T00:50:15Z

### Judgment

- eval: E12j
  judged_by: judge panel (3 lens, fresh context) — đề xuất, chờ người
  verdict: UNCERTAIN
  rationale: Hội đồng đề xuất FAIL ở cả ba lens; máy không tự chốt, người quyết ở Cổng 2. Ảnh tdk-suc-khoe-390.png cho thấy tiêu đề «Tài liệu» bị «Tìm nhanh», «Tải nguồn lên», «Trang mới» đè lên, trái tiêu chí không chữ đè nhau ở khổ 390.
  votes:
    - domain-correctness: FAIL — Ở khổ 390, ảnh tdk-suc-khoe-390.png cho thấy tiêu đề trang «Tài liệu» bị các nút «Tìm nhanh», «Tải nguồn lên», «Trang mới» đè lên, chỉ còn đọc được «Tả» và «liệ». Ảnh 1440 nhìn chung dễ hiểu và nhãn khớp từ điển (chủ trang, xác minh, «Quá hạn xác minh», «Trang nhắc tới trang này»), nhưng dòng «hết hạn xác minh» dùng chữ «hết hạn» mà mục «Xác minh đến ngày» trong CONTEXT.md ghi trong Avoid. Bộ ảnh cũng thiếu bản 390 cho hộp chèn liên kết, danh sách Kho có lọc và tab Chờ duyệt trang 2.
    - operational-feasibility: FAIL — Ảnh tdk-suc-khoe-390.png cho thấy ở khổ 390 tiêu đề «Tài liệu» bị ba nút «Tìm nhanh», «Tải nguồn lên», «Trang mới» đè lên, chỉ còn «Tả»/«liệ» đọc được, nên tiêu chí không chữ đè lên nhau bị vi phạm. Phần còn lại phần lớn dễ hiểu và theo từ điển, nhưng dòng «hết hạn xác minh» ở tab Sức khoẻ dùng chữ mà mục «Xác minh đến ngày» liệt vào Avoid. Bộ ảnh thiếu khổ 390 cho danh sách có lọc, hộp chèn liên kết và Chờ duyệt trang 2.
    - spec-alignment: FAIL — Ảnh tdk-suc-khoe-390.png cho thấy hai nút «Tìm nhanh» và «Tải nguồn lên» đè lên tiêu đề trang «Tài liệu», chỉ còn thấy «Tả» và «liê» ở mép trái, nên tiêu chí không chữ đè lên nhau ở khổ 390 không đạt. Các ảnh còn lại (hộp ⌘K 1440 và 390, khối «Trang nhắc tới trang này», hộp chèn liên kết, tab Chờ duyệt trang 2, danh sách Kho có lọc) đọc được và không thấy cuộn ngang. Nhãn phần lớn khớp CONTEXT.md, nhưng dòng «hết hạn xác minh» dùng đúng chữ «hết hạn» mà mục «Xác minh đến ngày» liệt vào Avoid.
  required_evidence:
    - Ảnh chụp lại tdk-suc-khoe-390.png (chạy lại phép đo màn ui-check của tim-va-dieu-huong-kho ở khổ 390) trong đó tiêu đề «Tài liệu» hiện đủ chữ, không bị ba nút «Tìm nhanh» / «Tải nguồn lên» / «Trang mới» đè lên; kèm số đo hộp chữ và hộp nút ở 390 không giao nhau (spec-alignment)
    - Ảnh 390 còn thiếu của danh sách Kho có lọc (tương ứng tdk-loc-1440.png), hộp chèn liên kết (tương ứng tdk-chen-lien-ket-1440.png) và tab Chờ duyệt trang 2 (tương ứng tdk-cho-duyet-trang-2.png), lấy từ cùng phép đo ở evidence/, chứng minh không cuộn ngang và không chữ đè nhau
    - Xác nhận ở CONTEXT.md hoặc hợp đồng rằng câu «hết hạn xác minh» trên dòng Sức khoẻ được chấp nhận, hoặc ảnh chụp lại với nhãn đổi thành «quá hạn xác minh» / «xác minh đến ngày …» theo mục «Xác minh đến ngày»
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E0s (regression-guard có chủ ý: design-gate tĩnh pass cả trên code cũ lẫn code mới, chứng minh sàn thiết kế chứ không chứng minh tính năng mới).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3d không có kết quả vì agent chạy nó bị skip/chết, nên báo cáo BLOCKED (chạy lại E3d, không phải sửa mã). E12j hội đồng đề xuất FAIL 3/3 vì tiêu đề «Tài liệu» bị nút đè ở khổ 390 và cụm «hết hạn xác minh». Hai lưu ý phụ của ui-check: chiều đỏ của E5u chưa có bản sao cho khối «Trang nhắc tới»; E8u bước 4 ra 6 dòng thay vì 5 do một bản chờ của đồ thị E7.
