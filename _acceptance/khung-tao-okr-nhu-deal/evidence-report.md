---
schema_version: 2
feature_slug: khung-tao-okr-nhu-deal
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c57cf22c6193ebbbdd903cf74f0b1fdb3c7022f2
human_signoff: Manh Phan 2026-09-30
---

# Evidence Report: khung-tao-okr-nhu-deal

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
| E17 | AC-10 | ui-check | PASS |
| E18 | AC-10 | script | PASS |
| E23 | AC-10 | ui-check | PASS |
| E19 | AC-11 | script | PASS |
| E20 | AC-12 | judgment | PASS |
| E21 | AC-13 | judgment | PASS |
| E22 | AC-9 | script | PASS |
| E24 | AC-14 | ui-check | PASS |

## Evidence

### Eval chạy lại ở round 5

- eval: E17
  run_id: kto-e17
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_giu
  verified_at: 2026-09-30T05:30:30Z
  output: |
    Kịch bản hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs chạy trong phiên đo riêng kto-e17; đủ bảy bước in «dat».
    Lỗi console duy nhất là lỗi hydrat trên /deals (có sẵn trên onehub, hạn chế đã biết chủ kho duyệt 30/09).
    Frame lưu ở _acceptance/khung-tao-okr-nhu-deal/evidence/: E17-step1.png đến E17-step10.png, kèm E17-output.log và E17-network.txt.
    Không chạy các chiều đo ghim (--tu-tep) vì bước này chỉ yêu cầu kịch bản thật.
  screenshot: evidence/E17-step1.png
  observed: |
    Đã mở từng frame: step1 là ngăn phải «Thêm KR» với ô đã nhập dở (tên KR, kiểu Tăng tới, khởi điểm 0, đơn vị đo trống) cùng nút Huỷ và Thêm, khớp việc giữ chỗ khi đang nhập. step2 đến step5 là hộp «Bỏ những gì vừa nhập?» ở 1440 và 390 px, vừa khung, không tràn. step6 đến step8 là ngăn Sửa KR, Sửa mục tiêu (cấp và đơn vị bị khoá xám) và hộp chuyển đơn vị chỉ đánh dấu ô đã đổi. step9 và step10 là ngăn bản ghi cá nhân tự lưu rồi đóng, danh sách Cá nhân hiện dòng vừa sửa ở đầu. Không frame nào mâu thuẫn với Expected; lỗi console duy nhất là lỗi hydrat /deals đã biết.
  network_observed: n-a (driver)

- eval: E23
  run_id: phien-do crm_kto_e23_do (app :4112, api :4273), EVAL=E3,E7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_khep_ky
  verified_at: 2026-09-30T05:30:30Z
  output: |
    khep-ky-okr/rang/man-khep-ky.mjs chạy E3 và E7 trong phiên đo crm_kto_e23_do (app :4112, api :4273).
    E3 chạy trên ngăn «Thêm KR» (cùng vỏ hop-thoai-kr.tsx), E7 chạy trên ngăn «Sửa KR»; cùng kịch bản như lúc hồ sơ đó ký.
    Frame lưu ở _acceptance/khung-tao-okr-nhu-deal/evidence/: E23-step1.png đến E23-step6.png, kèm E23-network.txt.
  screenshot: evidence/E23-step1.png
  observed: |
    step1 (1440) là ngăn «Thêm KR» nền tối, dưới ô tên và ô khởi điểm hiện câu hỏi chất lượng, nút «Thêm KR» vẫn bật nên câu hỏi không chặn lưu. step2 (390) cùng ngăn ở màn hẹp, hai câu hỏi hiện, nút bật, bố cục dọc. step3 là ngăn Mục tiêu đã công bố có dải cảnh báo vàng nói câu hỏi không chặn công bố. step4 là ngăn «Sửa KR» đổi đích 35 hiện «Trước đây: 30», ô «Lý do đổi đích» còn trống và nút Lưu bị khoá. step5 và step6 là trang /okr với dải «Đang rà giữa kỳ», ở 1440 và 390 px. Khớp Expected.
  network_observed: n-a (driver)

### Eval mang từ round 4 (carry-forward)

- eval: E1
  run_id: minted-khung-tao-okr-nhu-deal-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_tao_muc_tieu
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-khung-tao-okr-nhu-deal-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_url_khung
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khung-tao-okr-nhu-deal-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_that
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khung-tao-okr-nhu-deal-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_chan_quet
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E5
  run_id: kto-e5-20260930
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_chan
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khung-tao-okr-nhu-deal-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_gop_y
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khung-tao-okr-nhu-deal-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_co_ngan
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-khung-tao-okr-nhu-deal-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_giu
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-khung-tao-okr-nhu-deal-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tgy_cot_khong_dong
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-khung-tao-okr-nhu-deal-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tgy_cot_sua_roi_nhan
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-khung-tao-okr-nhu-deal-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_mo_kr_url
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-khung-tao-okr-nhu-deal-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_bai_cu
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-khung-tao-okr-nhu-deal-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_gui_dung
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-khung-tao-okr-nhu-deal-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_ui_goc
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-khung-tao-okr-nhu-deal-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kto_ngan_ui
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E16
  run_id: E16-verify-20260930
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_9b
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-khung-tao-okr-nhu-deal-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_thuoc_cu
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E19
  run_id: minted-khung-tao-okr-nhu-deal-E19-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_proto
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E22
  run_id: design-gate-fc0bbdbbbb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_san_thiet_ke
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E24
  run_id: minted-khung-tao-okr-nhu-deal-E24-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_dau_cot
  verified_at: 2026-09-30T05:04:13Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

### Judgment

- eval: E20
  judged_by: judge panel 3 lens (fresh context)
  verdict: PASS
  rationale: Đề xuất PASS, ba lens cùng PASS. Người quyết ở Cổng Bằng chứng.
  votes:
    - domain-correctness: PASS — Ở 1440 px và 390 px, ngăn tạo deal và bốn ngăn OKR đều mở từ mép phải, có tiêu đề bên trái với nút đóng X bên phải (thêm dòng mô tả nhỏ bên dưới khi có), thân là các trường xếp dọc, và chân có Huỷ cùng nút chính xanh (cạnh nhau, căn phải ở 1440; xếp chồng, tràn ngang ở 390). Khi cột góp ý mở (E3-1440-cot-muc-tieu, E3-1440-cot-kr), ngăn giãn sang trái, giữ nguyên một tiêu đề và một chân chung, biểu mẫu vẫn đúng bố cục cũ nhưng hẹp hơn, còn cột "Trợ lý OKR" hiện thêm bên phải. Nhìn vào là cùng một ngăn mở thêm một cột, không phải một màn khác.
    - operational-feasibility: PASS — Cả năm ngăn đều dính mép phải, cùng chiều rộng khoảng 384px ở 1440 px. Đầu ngăn có tiêu đề bên trái, nút đóng bên phải và mô tả tuỳ chọn ngay dưới. Chân ngăn là Huỷ cạnh nút chính xanh ở góc phải dưới. Ở 390 px, cả năm ngăn đều chiếm gần hết bề ngang, chừa một dải hẹp bên trái, và có hai nút xếp dọc, Huỷ nằm dưới nút chính. Ngăn Sửa mục tiêu và Sửa KR khi mở cột góp ý chỉ kéo rộng sang trái tới khoảng x=640. Đầu và chân vẫn chạy suốt bề ngang, cột form giữ nguyên, và cột Trợ lý OKR nằm bên phải, nên đọc như chính ngăn đó mở thêm một cột. Điểm nhỏ là cột có nút đóng riêng, nhưng nó không làm ngăn giống một màn khác.
    - spec-alignment: PASS — Ở cả 1440 và 390 px, năm ngăn (tạo deal, Thêm mục tiêu, Sửa mục tiêu, Thêm KR, Sửa KR) đều dính mép phải, cùng đường viền trái, tiêu đề ở góc trên trái và nút đóng X ở góc trên phải. Chân ngăn cũng giống nhau: Huỷ cạnh nút chính ở góc dưới phải khi 1440 px, và nút chính xếp trên Huỷ khi 390 px. Khi cột góp ý mở, ngăn rộng ra về bên trái, giữ nguyên tiêu đề, X và chân ở toàn ngăn, còn cột form giữ đúng các trường như ngăn hẹp và Trợ lý OKR chỉ thêm một cột bên phải, nên đọc như cùng ngăn mở thêm cột, không phải màn khác.
  human_override:  # chi nguoi ghi

- eval: E21
  judged_by: judge panel 3 lens (fresh context)
  verdict: PASS
  rationale: Đề xuất PASS, ba lens cùng PASS. Người quyết ở Cổng Bằng chứng.
  votes:
    - domain-correctness: PASS — docs/settings.md, mục «Tạo mới và hỏi lại», ghi chân ngăn khớp chân hộp thoại. Cả hai đều «Huỷ» trái, nút chính phải; từ 640 px một hàng, dưới 640 px nút chính nằm trên. Mục «Đợt» đánh dấu SheetFooter đã xong ở khung-tao-okr-nhu-deal, và mô tả PR khớp với các dòng đó. Mục 10 của lo-trinh-okr.md có dòng mới «K» cho khung-tao-okr-nhu-deal (đang dựng, 2026-09-30). Bảng «Vẽ tay là bậc cuối» trong mo-ta-pr.md liệt kê từng bậc đã tra: hàng dừng ở bậc 5 kể (1) đến (4) kèm câu tìm ReUI và tên block; hàng dừng ở bậc 1 chỉ ghi phần đã tra. Hàng «Thân ngăn chung» chỉ ghi «như trên; sheet-8» thay vì chép lại câu tìm. Vậy nó dựa vào hàng liền trên, nhưng vẫn có tên block và không phải là «không có» trơ trụi.
    - operational-feasibility: PASS — docs/settings.md, mục «Tạo mới và hỏi lại», ghi SheetFooter xếp như DialogFooter từ 2026-09-30 (khung-tao-okr-nhu-deal), cùng luật 640 px với mô tả PR. Mục 10 của lo-trinh-okr.md có dòng K `khung-tao-okr-nhu-deal` (đang dựng, 2026-09-30, kèm phạm vi và các hồ sơ ghim lại). Bảng «đã tra gì» của mô tả PR có một dòng cho mỗi khối mới. Dòng dừng ở bậc 1 nêu lý do. Ba dòng dừng ở bậc 5 liệt kê đủ bậc 1 đến 4, kèm câu tìm ReUI cụ thể cho bậc 3 và bậc 4. Riêng dòng «Thân ngăn chung» viết «như trên» thay vì chép lại câu tìm, nhưng nó trỏ rõ tới dòng ngay trên và thêm chi tiết `sheet-8`, nên vẫn đủ.
    - spec-alignment: PASS — docs/settings.md, mục «Tạo mới và hỏi lại», ghi «Huỷ» trái, nút chính phải, cho cả Dialog lẫn Sheet. Nó ghi SheetFooter xếp như DialogFooter từ 2026-09-30 (`khung-tao-okr-nhu-deal`), từ 640 px một hàng dồn phải, dưới 640 px nút chính nằm trên, và mục «Đợt» ghi đợt 2 đã xong. Mục 10 của lo-trinh-okr.md có dòng K `khung-tao-okr-nhu-deal` (đang dựng, 2026-09-30) nêu rõ sửa chân ngăn chung. Bảng «đã tra gì» trong mo-ta-pr.md dừng ở bậc 1 với chân ngăn và ở bậc 5 với ba khối còn lại; mỗi khối bậc 5 nêu đủ bốn bậc trên, kèm câu tìm ReUI thật ở bậc 3 và bậc 4 (Pro).
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bun_run_test-r5
  exit_code: 0
  verified_at: 2026-09-30T05:30:30Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-30T05:30:30Z

- cmd: bun run lint:slop
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-30T05:30:30Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-tao-okr-nhu-deal-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-30T05:30:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: REJECT — E23 không đạt trong run-log của round đó và mô tả PR thiếu dòng bậc tra cho đầu cột (AC-13); sửa ở commit ae23d26e và 161d7714 (E17 chạy qua lớp bọc hạn chế đã biết).
Round 5: PASS — E17 và E23 chạy lại và đạt, bốn lệnh suite đạt, 20 eval còn lại mang từ round 4 vì delta không chạm paths của chúng; hai judgment item đề xuất PASS, human_override để trống cho người quyết.

### Re-pin lần 1 — 2026-09-30, do sửa sau chữ ký: xoá khoá URL không được mở bằng useMountEffect thay cho useEffect (E11 của hop-thoai-giu-cho-dang-nhap)
run_id: repin-20260930T072944Z-36590
sha: 21b20e9fc9789a48272e69d636391a3544ec3e95 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E3, E5, E6, E16, E17, E23, E20, E21, E24 · diff chạm vật đo ngoài làn máy: E3, E5, E16, E17, E21 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-3, AC-12, AC-13, AC-14

### Re-pin lần 2 — 2026-09-30, do gộp onehub (#219) trước khi gộp PR #220
run_id: repin-20260930T091426Z-68531
sha: 1d4312c2d5d0fae6e9f66254a7c3634f756e9798 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E3, E5, E6, E16, E17, E23, E20, E21, E24 · diff chạm vật đo ngoài làn máy: E3, E5, E16, E17, E21 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-3, AC-12, AC-13, AC-14

### Re-pin lần 3 — 2026-09-30, do ngăn tạo deal thôi tạo truy vấn khi đóng và gỡ lớp bọc E17 (hydrat-giai-doan-deals)
run_id: repin-20260930T120519Z-35859
sha: 63953282d44b1550f95ff0fe8fa568996c581061 · suites: 4 lệnh exit 0 · evals: 15/15 eval máy đạt kỳ vọng · ngoài làn máy: E3, E5, E6, E16, E17, E23, E20, E21, E24 · diff chạm vật đo ngoài làn máy: E3, E5 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-3, AC-12, AC-13, AC-14

### Re-pin lần 4 — 2026-10-06, do nhận kit 2.24.0 — eval máy khai superseded_by theo BANG-THAY-THE của gop-y-dung-cho
run_id: repin-20261006T163931Z-72362
sha: c57cf22c6193ebbbdd903cf74f0b1fdb3c7022f2 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E7, E9, E10, E11, E12, E18 · thay bởi hồ sơ đã ký: E7→gop-y-dung-cho#AC-12, E9→gop-y-dung-cho#AC-12, E10→gop-y-dung-cho#AC-7, E11→gop-y-dung-cho#AC-5, E12→gop-y-dung-cho#AC-15, E18→gop-y-dung-cho#AC-15 · ngoài làn máy: E3, E5, E6, E16, E17, E23, E20, E21, E24 · diff chạm vật đo ngoài làn máy: E3, E5, E6, E16, E17, E23, E20, E21, E24 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-3, AC-5, AC-7, AC-10, AC-12, AC-13, AC-14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
