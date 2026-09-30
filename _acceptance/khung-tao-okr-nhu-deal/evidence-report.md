---
schema_version: 2
feature_slug: khung-tao-okr-nhu-deal
verdict: REJECT
failed_evals: [E17, E23]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3f11c5d9e5bc66c7922f8289c753501412086b66
human_signoff:
---

# Evidence Report: khung-tao-okr-nhu-deal

Round 4. Hai eval ui-check của hồ sơ khác dựng trên vỏ ngăn (E17, E23) đỏ; hai mươi eval máy và ui-check còn lại đạt, hai eval judgment giữ đề xuất của hội đồng từ vòng trước, bốn lệnh suite đạt. E17 đỏ vì lỗi hydration ở trang /deals do chính app ném ra, E23 đỏ vì nhánh «đổi đích ngoài kỳ rà» trên ngăn Sửa KR không lưu được. Không lệnh nào ngoài eval bị đỏ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | ui-check | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | test | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-9 | script | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-10 | ui-check | PASS |
| E17 | AC-10 | ui-check | FAIL |
| E18 | AC-10 | script | PASS |
| E23 | AC-10 | ui-check | FAIL |
| E19 | AC-11 | script | PASS |
| E20 | AC-12 | judgment | PASS |
| E21 | AC-13 | judgment | PASS |
| E22 | AC-9 | script | PASS |
| E24 | AC-14 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-tao-okr-nhu-deal-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_tao_muc_tieu
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [1326.00ms]

- eval: E2
  run_id: minted-khung-tao-okr-nhu-deal-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_url_khung
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Bài url-khung chạy xong, không khẳng định nào đỏ.

- eval: E3
  run_id: minted-khung-tao-okr-nhu-deal-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_that
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E3-1440-deal.png
  observed: |
    Đã mở 12 trong 18 ảnh. 1440: ngăn dính mép phải, cao suốt khung, đầu và chân giống nhau giữa ngăn deal và bốn ngăn OKR (Huỷ bên trái, nút chính xanh bên phải); cột «Trợ lý OKR» cùng hàng với form ở 1440 và 1024, nằm dưới form ở 1023 và 390. 390: chân xếp chồng, nút chính trên «Huỷ», không tràn ngang.
    Bảy ảnh chưa mở (E3-390-tao-muc-tieu, E3-390-sua-muc-tieu, E3-390-them-kr, E3-1440-cot-kr, E3-1024-cot-muc-tieu, E3-1023-cot-kr, E3-390-cot-muc-tieu), chỉ dựa vào số đo trong log.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-khung-tao-okr-nhu-deal-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kto_chan_quet
  verified_at: 2026-09-30T05:04:13Z
  output: |
    so khang dinh: 12

- eval: E5
  run_id: kto-e5-20260930
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_chan
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E5-1440-deal.png
  observed: |
    Đã mở từng trong 12 ảnh. 1440: chân ở đáy ngăn, «Huỷ» bên trái, nút chính xanh bên phải cùng hàng, sát mép phải chân khoảng 16 px, ở cả sáu ngăn. 390: chân xếp chồng, nút chính full-width ở trên, «Huỷ» full-width ở dưới; ba ngăn tạo có nút gửi nhạt màu (disabled) khi form rỗng. Không thấy mâu thuẫn với expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-khung-tao-okr-nhu-deal-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_gop_y
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E6-step1.png
  observed: |
    Đã mở từng frame. 1440 và 1024: ngăn rộng khoảng 800 px, cột «Trợ lý OKR» cùng hàng với form, thẻ Viết lại và Căn chỉnh đủ, không tràn ngang. 1023 và 390: cột nằm dưới form, thẻ vừa bề ngang cột. Khớp expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-khung-tao-okr-nhu-deal-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_co_ngan
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [1153.00ms]

- eval: E8
  run_id: minted-khung-tao-okr-nhu-deal-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_giu
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [3.09s]

- eval: E9
  run_id: minted-khung-tao-okr-nhu-deal-E9-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tgy_cot_khong_dong
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [6.41s]

- eval: E10
  run_id: minted-khung-tao-okr-nhu-deal-E10-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tgy_cot_sua_roi_nhan
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 2 tests across 1 file. [1171.00ms]

- eval: E11
  run_id: minted-khung-tao-okr-nhu-deal-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_mo_kr_url
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [1153.00ms]

- eval: E12
  run_id: minted-khung-tao-okr-nhu-deal-E12-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kto_bai_cu
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 142 tests across 4 files. [16.40s]

- eval: E13
  run_id: minted-khung-tao-okr-nhu-deal-E13-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_gui_dung
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 1 test across 1 file. [1338.00ms]

- eval: E14
  run_id: minted-khung-tao-okr-nhu-deal-E14-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kto_ui_goc
  verified_at: 2026-09-30T05:04:13Z
  output: |
    rang/ui-goc.mjs in từng mục và kết thúc không lỗi.

- eval: E15
  run_id: minted-khung-tao-okr-nhu-deal-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kto_ngan_ui
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 3 tests across 1 file. [573.00ms]

- eval: E16
  run_id: E16-verify-20260930
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_9b
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E16-step1.png
  observed: |
    Đã mở từng frame. 1440: ngăn «Sửa mục tiêu» có nút «Nhờ Trợ lý OKR góp ý»; khi có đề xuất, ngăn mở hai cột (form trái, cột «Trợ lý OKR» phải) với thẻ Viết lại và Căn chỉnh; sau «Nhận» thẻ thu gọn và tên mục tiêu đổi. 390: tab «Vết» liệt kê lần sửa theo đề xuất của Trợ lý OKR, cột xếp dưới form, không tràn ngang. Không frame nào mâu thuẫn expected.
  network_observed: n-a (driver)

- eval: E17
  run_id: E17-verify-ui-20260930
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kto_man_giu
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E17-step1.png
  observed: |
    Đã mở từng ảnh. Các frame khớp expected về hiển thị: hộp «Bỏ những gì vừa nhập?» với «Tiếp tục sửa» và «Bỏ» ở 1440 và 390, ngăn Sửa KR có ô Đích báo lỗi đỏ, ngăn Sửa mục tiêu, hộp Chuyển đơn vị và ngăn bản ghi tự lưu đều đúng. Lỗi không nằm trên frame: chốt cuối của script bắt một lỗi console ở trang /deals.
  network_observed: n-a (driver)
  output: |
    man-giu-cho: hong 1. Cả hai lần chạy độc lập đều đỏ giống hệt, nên không chập chờn.
    Bảy bước 1..7 đều in «dat»; chốt cuối tính mọi lỗi console/pageerror của app là hỏng, và cả hai lần đều có «loi console app: 1»:
    /deals: pageerror Error: Hydration failed because the server rendered text didn't match the client (xảy ra ở bước 3, hg-deal-huy).
    Bộ chọn [data-hop-thoai-muc-tieu] đạt; diff của script so với merge-base chỉ đổi đúng bộ chọn đó.
    Phiên đo tự dựng kho crm_kto_e17_do, app :4674, api :4654 và tự dọn. Chưa truy nguyên nhân gốc: chưa biết lỗi có sẵn ở merge-base hay mới sinh sau merge onehub #218 hoặc sau thay đổi ở đây.

- eval: E18
  run_id: minted-khung-tao-okr-nhu-deal-E18-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kto_thuoc_cu
  verified_at: 2026-09-30T05:04:13Z
  output: |
    ok hop-thoai-giu-cho-dang-nhap E9: ma 0 (ky vong 0)

- eval: E23
  run_id: E23-kto-e23
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kto_khep_ky
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E23-step1.png
  observed: |
    Đã mở từng khung. Ngăn «Thêm KR» ở 1440 và 390 hiện đúng hai câu hỏi chất lượng mà không chặn lưu; trang «OKR của tôi» có băng cam «Đang rà giữa kỳ», KR 12 / 40. Khung E23-step4 mâu thuẫn expected: ngăn «Sửa KR» mở, ô «Lý do đổi đích» hiện, nhưng ô Đích chỉ chứa «5» (script gõ «35»), báo lỗi đỏ «Đích phải lớn hơn khởi điểm.» và nút «Lưu» bị mờ, nên không tới được bước gõ lý do rồi lưu.
  network_observed: n-a (driver)
  output: |
    man-khep-ky: 41 khang dinh, 4 hong, 6 anh.
    Đạt: câu hỏi kr-la-viec và thieu-khoi-diem đúng chỗ, Lưu bật; ô lý do đổi đích hiện đúng nhãn, Lưu tắt khi chưa có lý do; trong kỳ rà không hiện ô lý do.
    Hỏng bốn chỗ, đều ở nhánh ngoài kỳ rà của E7: gõ lý do 12 ký tự chờ hết 30000 ms mà «Lưu» không bật; Lưu không đóng được hộp; DB không có đúng một dòng okrDoiDich ngoaiRa true; nhánh trong kỳ rà lệch vì nhánh ngoài kỳ rà chưa ghi dòng nào.
    Lần chạy trước đó (10:20) cho đúng cùng trạng thái ô Đích «5», nên lỗi lặp lại, không chập chờn.
    Phiên đo tự dựng kho crm_kto_e23_do, app :4454, api :4418 và tự dọn.

- eval: E19
  run_id: minted-khung-tao-okr-nhu-deal-E19-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kto_proto
  verified_at: 2026-09-30T05:04:13Z
  output: |
    Ran 3 tests across 1 file. [8.00ms]

- eval: E22
  run_id: design-gate-fc0bbdbbbb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_san_thiet_ke
  verified_at: 2026-09-30T05:04:13Z
  output: |
    design-gate.mjs --mode static chạy xong trên cả bảy tệp; năm lỗi nền P0 bằng 0.

- eval: E24
  run_id: minted-khung-tao-okr-nhu-deal-E24-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_dau_cot
  verified_at: 2026-09-30T05:04:13Z
  screenshot: evidence/E24-1440-sua-muc-tieu-dang-soan.png
  observed: |
    Đã mở từng frame. Ở 1440 chữ tiêu đề cột «Trợ lý OKR» thẳng mép trái với dòng mô tả và khung đang soạn, dấu X cột thẳng mép phải với khung và nằm cách dấu X ngăn rõ ràng, tiêu đề cùng cỡ với «Sửa mục tiêu» và cùng hàng với nút «Nhờ Trợ lý OKR góp ý». Ở 390 cột nằm dưới form, đầu cột vẫn thẳng mép với thẻ đề xuất. Không frame nào mâu thuẫn expected.
  network_observed: n-a (driver)

### Judgment

Hội đồng đề xuất; `human_override` để trống cho người quyết ở Cổng Bằng chứng. Cả hai panel giữ từ vòng trước vì inputs không đổi.

- eval: E20
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: panel giữ nguyên từ round 3 — inputs không đổi, không chấm lại; rationale xem round đó.
  votes:
    - domain-correctness: PASS (r3)
    - operational-feasibility: PASS (r3)
    - spec-alignment: PASS (r3)
  human_override:  # chi nguoi ghi

- eval: E21
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round đó.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-30T05:04:13Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-30T05:04:13Z

- cmd: bun run lint:slop
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-30T05:04:13Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-30T05:04:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt cả trên nhánh lẫn trên baseline diffBase, chứng minh bộ đo chứ chưa chứng minh tính năng): E9, E10, E12. Cả ba là bài sẵn có của hồ sơ trước chạy lại trên vỏ ngăn, nên là regression-guard có chủ ý theo khai báo trong eval; nếu muốn chúng gánh hành vi mới thì viết lại để khẳng định điều chỉ ngăn mới làm được.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không eval nào có phương sai)

## Iterations

Round 1: E13 đỏ vì so payload với dữ liệu viết tay thay cho payload rút từ hộp thoại cũ ở merge-base. Đã sửa (commit 50816276) và quay lại implementation.
Round 2: không eval nào đỏ, nhưng hai lệnh suite đỏ không gắn eval. `bun run test`: 1151 đạt, 1 bỏ qua, 1 đỏ là vai-chi-okr › duong-ngoai-router (hết 60000 ms). `bun run lint:slop`: 3 lỗi no-unsafe-dictionary-type do `Record<ThuTucGui, unknown>` trong bài đo E13. Quay lại implementation.
Round 3: sau hai commit sửa (f4f8a755, 472057fd), dữ liệu gửi đi của bài E13 mang kiểu rút từ schema và parse ở biên; chạy lại E1, E2, E7, E8, E11, E12, E13 và cả bốn lệnh suite, tất cả đạt. Các eval còn lại mang từ round 2 vì delta không chạm paths của chúng. Verdict PASS.
Round 4: sau AC-14 (đầu cột góp ý, E24 đạt), merge onehub #218 và chân ngăn đợt hỏi ý giữ hình, chạy lại toàn bộ eval máy và ui-check. E17 đỏ vì lỗi hydration ở /deals; E23 đỏ vì ô Đích mất ký tự đầu khi gõ trên ngăn Sửa KR nên nhánh đổi đích ngoài kỳ rà không lưu được. Chưa xác định nguyên nhân gốc và chưa biết lỗi có sẵn từ trước merge hay mới sinh; quay lại implementation. Mọi eval khác, hai judgment giữ từ vòng trước và bốn lệnh suite đạt.
