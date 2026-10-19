---
schema_version: 2
feature_slug: soan-okr-song-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b9acad6b77fde52541221e857cd2eb01d839e45f
human_signoff: Phan Le Manh 2026-10-04
---

# Evidence Report: soan-okr-song-lai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | ui-check | PASS |
| E12 | AC-7 | script | PASS |
| E13 | AC-2 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-soan-okr-song-lai-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_nut_dom
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 29 tests across 1 file. [4.15s]

- eval: E2
  run_id: minted-soan-okr-song-lai-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_cau_noi_server
  verified_at: 2026-10-04T01:21:07Z
  output: |
    0 fail
    10 expect() calls
    Ran 4 tests across 1 file. [168.00ms]

- eval: E3
  run_id: minted-soan-okr-song-lai-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_man_dom
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 2 tests across 1 file. [1070.00ms]

- eval: E4
  run_id: minted-soan-okr-song-lai-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_loi_dom
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 5 tests across 1 file. [1360.00ms]

- eval: E5
  run_id: minted-soan-okr-song-lai-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_dem_db
  verified_at: 2026-10-04T01:21:07Z
  output: |
    test-run: dropped crm_mut4y40cb2br_test

- eval: E6
  run_id: minted-soan-okr-song-lai-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_tran_api
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 10 tests across 1 file. [3.19s]
    test-run: dropped crm_mut4y8ry7sox_test

- eval: E7
  run_id: minted-soan-okr-song-lai-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sol_nut_dom
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 29 tests across 1 file. [4.15s]

- eval: E8
  run_id: minted-soan-okr-song-lai-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.soan_man_trang_thai
  verified_at: 2026-10-04T01:21:07Z
  output: |
    Ran 86 tests across 1 file. [8.12s]

- eval: E9
  run_id: minted-soan-okr-song-lai-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.soan_tran
  verified_at: 2026-10-04T01:21:07Z
  output: |
    test-run: dropped crm_mut4y721k5a0_test

- eval: E10
  run_id: minted-soan-okr-song-lai-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sol_huong_dan
  verified_at: 2026-10-04T01:21:07Z
  output: |
    2 DUNG, 0 SAI

- eval: E11
  run_id: minted-soan-okr-song-lai-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sol_man_that
  verified_at: 2026-10-04T01:21:07Z
  screenshot: evidence/E11-nut-1440.png
  observed: |
    Đã mở từng khung bằng Read. E11-nut-1440.png: trang OKR theo đơn vị, phòng "Kinh doanh miền Bắc"; nút "Soạn OKR cùng Trợ lý" mờ (disabled), ngay dưới là câu "Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó."; không tràn ngang. E11-nut-390.png: một cột, nút mờ, câu chưa bật nằm dưới nút, vừa khung 390.
    E11-man-1440.png / E11-man-390.png: ngăn "Soạn OKR cùng Trợ lý" (lượt 0/12) chỉ có đúng câu chưa bật, không ô nhập, không khung chat.
    E11-loi-1440.png / E11-loi-390.png: sheet soạn đầy đủ, hộp báo lỗi trong khung chat chứa đúng câu chưa bật, không nút "Thử lại", không tràn ngang. Cả sáu khung khớp Expected.
  network_observed: n-a (driver)
  output: |
    Assertion độc lập trên HTML đã lưu: nut-1440/390: câu chưa bật x1, data-nut-soan="nut-chua-cau-hinh", nút disabled, textarea 0, "Thử lại" 0; man-1440/390: [data-man-chua-cau-hinh] x1, câu x2 (nút phía sau + empty), textarea 0; loi-1440/390: data-tu-choi="chua-cau-hinh" x1 chứa đúng câu, data-nut="thu-lai" 0.
    Request /eve/agents/okr: pha rỗng = 0 (cả hai khổ); pha lỗi = 1 (bị chặn, trả phản hồi chưa-cấu-hình dựng từ hằng của cửa).
    Ghi chú môi trường: máy chủ là phiên đo tạm của tien-de, tự dọn xong. Một tiến trình anh em trong cùng cây ghi lại E11-loi-* sau lượt chạy (bản trên đĩa trùng bản đã commit, hình giống hệt khung đã mở); lượt chiều đỏ ghim riêng của E11 không được khai trong kết quả máy — bản ghi chiều đỏ dùng chung cờ nằm ở evidence/E13-kiem-do-do.txt. Số request thô ở evidence/E11-network.txt.

- eval: E12
  run_id: minted-soan-okr-song-lai-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.sol_san_thiet_ke
  verified_at: 2026-10-04T01:21:07Z
  output: |
    (không có dòng đầu ra; kết luận lấy từ mã thoát 0 của lệnh trên cả ba tệp nut-soan.tsx, man-soan.tsx, hoi-thoai-soan.tsx)

- eval: E13
  run_id: minted-soan-okr-song-lai-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sol_man_that
  verified_at: 2026-10-04T01:21:07Z
  screenshot: evidence/E13-step1.png
  observed: |
    Đã mở từng khung bằng Read. E13-step1.png (1440x1000, màn soạn mở bằng ?cuocSoan=<id>, bí mật cầu nối rỗng): ngăn bên phải "Soạn OKR cùng Trợ lý", dòng phụ "Kinh doanh miền Bắc · Năm kế · mẫu · lượt 0/12", thân chỉ có câu "Tính năng soạn nháp chưa được bật trên máy chủ này — quản trị viên OneHub cần bật nó."; không ô nhập, không nút Thử lại.
    E13-step1-390.png (390x844): cùng nội dung, "lượt 0/12" xuống dòng, không tràn ngang. E13-step2.html và E13-step3.html dựng từ log của chính lượt chạy (phép đọc tRPC không có hình): soLuot sau khi mở màn = 0, soLuot sau tangLuot = 1, 0 request /eve/agents/okr/ ở cả hai khổ. Không khung nào mâu thuẫn Expected.
  network_observed: n-a (driver)
  output: |
    20 DUNG, 0 SAI (phép đọc soLuot: sau khi mở màn 0; sau tangLuot 1; 0 request /eve/agents/okr/ trong lúc màn mở, cả hai khổ).
    Chiều đỏ ghim chạy riêng (evidence/E13-kiem-do-do.txt): bỏ bước tangLuot mà vẫn đòi 1 thì phép đo báo "phep doc soLuot khong nhay" và kết luận chiều đỏ "phep do bat duoc loi nhu ky vong".
    Ghi chú: lệnh nguyên văn ghi đè các tệp E11-* đang được git theo dõi; bản chép lại đúng như trạng thái tìm thấy, vì một phiên anh em đã ghi E11-* trước đó. Driver là script puppeteer nên networkObserved là n-a (driver); số đếm thô ở evidence/E13-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-soan-okr-song-lai-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-soan-okr-song-lai-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-soan-okr-song-lai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-soan-okr-song-lai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bunx turbo run lint --force
  run_id: minted-soan-okr-song-lai-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bun run lint:slop
  run_id: minted-soan-okr-song-lai-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

- cmd: bunx turbo run build --force
  run_id: minted-soan-okr-song-lai-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T01:21:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

E8, E9, E12 — xanh cả trên code hiện tại lẫn code cũ (baseline green), nên không phân biệt được tính năng này với bản trước. Đây là regression-guard có chủ ý theo hợp đồng: E8 chạy nguyên bài DOM đã ký của soan-okr-cung-tro-ly (chỉ thêm cauNoi=true vào fixture), E9 chạy nguyên bài API đã ký soan-okr-tran, E12 là sàn thiết kế chế độ tĩnh trên ba tệp giao diện. Không cần viết lại. Mọi eval còn lại của tính năng (E1–E7, E10) đỏ trên baseline, tức có phân biệt; E11 và E13 không chạy được trên baseline (n-a).

## Variance

none — mọi eval chạy một lượt, không eval nào ngẫu nhiên hay chập chờn.

## Iterations

Round 1: 13 eval và 7 lệnh suite đều xanh, verdict PASS; không phải quay lại implementation.

### Re-pin lần 1 — 2026-10-14, do F24 ba-ho-so-do-san: sửa thước chết và răng đỏ sẵn (phạm vi A, làn C 12 hồ sơ)
run_id: repin-20261014T001054Z-11514
sha: aeacc862fc3a28e5391c27772a4ad96e16ae3317 · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E11, E13 · diff chạm vật đo ngoài làn máy: E11, E13 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-14, do F24 ba-ho-so-do-san: expected E12 bỏ lời hứa cũ (S4 r1)
run_id: repin-20261014T042621Z-95949
sha: 2d20545607b5d6104c5baadb3bffcb2b91ad6a65 · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E11, E13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-15, do ghim ở đỉnh sau gộp onehub 3818ad4ec, ngay trước gộp #406 (làn X lần 2, 11 hồ sơ)
run_id: repin-20261014T231434Z-99400
sha: b9acad6b77fde52541221e857cd2eb01d839e45f · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E11, E13 · diff chạm vật đo ngoài làn máy: E11 — chưa chứng lại, đi vòng S4 delta · chập chờn (đỏ lần đầu, đạt khi chạy lại): lenh-dung-do-khong-ai-thay E8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
