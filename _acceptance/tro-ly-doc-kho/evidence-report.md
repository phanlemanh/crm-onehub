---
schema_version: 2
feature_slug: tro-ly-doc-kho
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cd499ff8a186c29594b3ad058d23554d977a551b
human_signoff:
---

# Evidence Report: tro-ly-doc-kho

Round 3. Mọi eval máy (test, script, ui-check) đều chạy xong và đạt. Hội đồng judge của E16j đề xuất không đạt (chip gợi ý bị cắt ngang ở 390px, biểu tượng nổi che góc ô soạn). Verdict tổng được tính sẵn là REJECT. Cột Verdict của hai eval judgment là đề xuất của hội đồng, chưa có người chốt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6d | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7d | AC-7 | test | PASS |
| E7u | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-15 | script | PASS |
| E15j | AC-15 | judgment | đề xuất PASS (hội đồng, chờ người chốt) |
| E16j | AC-7 | judgment | đề xuất FAIL (hội đồng, chờ người chốt) |
| E17 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-doc-kho-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tim
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6yws2pf1_test

- eval: E2
  run_id: mups6y2nn6ty
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_doc
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6y2nn6ty_test

- eval: E3
  run_id: minted-tro-ly-doc-kho-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_kiem_trich
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6yfnp59s_test

- eval: E4
  run_id: mups6z0e9lqo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tu_choi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6z0e9lqo_test

- eval: E5
  run_id: minted-tro-ly-doc-kho-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_qua_han
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6xj0xlpl_test

- eval: E6
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_xac_minh_api
  verified_at: 2026-10-01T16:42:27Z
  output: |
    (lệnh không in dòng kết quả nào ngoài mã thoát)

- eval: E6d
  run_id: minted-tro-ly-doc-kho-E6d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_xac_minh
  verified_at: 2026-10-01T16:42:27Z
  output: |
    Ran 7 tests across 1 file. [6.13s]

- eval: E7
  run_id: minted-tro-ly-doc-kho-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_hoi_api
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6xyzyhc0_test

- eval: E7d
  run_id: minted-tro-ly-doc-kho-E7d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_hoi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    Ran 10 tests across 1 file. [7.88s]

- eval: E7u
  run_id: minted-tro-ly-doc-kho-E7u-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tlk_man_hoi
  verified_at: 2026-10-01T16:42:27Z
  screenshot: evidence/E7u-step1.png
  observed: |
    step1 (E7u-step1.png, 1440): trang Tài liệu, tab 'Hỏi' đang chọn (gạch chân), mô tả 'Hỏi về quy định, chính sách...', 3 gợi ý (Thử việc có được hưởng hoa hồng không?, Xin nghỉ phép năm thế nào?, Mẫu đề nghị tạm ứng ở đâu?), ô nhập 'Hỏi một câu về kho tài liệu…' -> trạng thái trống, đúng expected.
    step2 (E7u-step2.png): bong bóng người dùng 'quy định hoa hồng tầng 2'; câu trả lời 'Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.' có nhãn 'Trợ lý AI · theo bản đang dùng', trích 'Quy định hoa hồng đối tác · Phiên bản 1 · duyệt 02/10/2026', đoạn «Đối tác tầng 2 hưởng 1,2%...», nút 'Báo sai' -> đúng (trạng thái 'đang đọc kho…' không nằm trong frame, là trạng thái trung gian script chờ bằng DOM).
    step3 (E7u-step3.png): câu hỏi 'Thử việc có được tăng lương giữa kỳ không?'; trả lời từ chối 'Chưa có trang đã duyệt nào trả lời câu này. Mình không đoán.' + 'Trang gần nhất Chính sách thử việc' + 'Câu hỏi đã vào hàng chưa trả lời được.' -> đúng.
    step4 (E7u-step4.png): câu hỏi 'Thử việc của nhân viên kinh doanh bao lâu?'; Alert viền cam 'Trang «Chính sách thử việc» đã quá hạn xác minh từ 01/10/2026; hỏi chủ trang Lê Thu Trang trước khi làm theo.', trên câu trả lời 'Thời gian thử việc ... là hai tháng.' có trích + Báo sai -> đúng.
    step5 (E7u-step5.png, 390): cùng câu trả lời bước 2 trong layout điện thoại, chữ xuống dòng gọn, trích và 'Báo sai' hiện, không thấy tràn ngang; đo scrollWidth 390 = innerWidth 390 -> đúng.
    step6 (E7u-step6.png): câu hỏi 'Công tác phí mỗi ngày bao nhiêu?' (khác bước 2), trả lời 'Công tác phí mỗi ngày là 300.000 đồng.' + trích; nút Báo sai đã đổi thành 'Đã báo sai' (mờ đi, vô hiệu) -> đúng. Không frame nào mâu thuẫn expected.
  network_observed: n-a (driver)
  output: |
    - [PASS] ảnh lưu ở .acceptance-runs/tro-ly-doc-kho/evidence/ và chép sang _acceptance/tro-ly-doc-kho/evidence/ cho E16j.
    Frame đã lưu: E7u-step1.png (hoi-trong-1440), E7u-step2.png (hoi-tra-loi-1440), E7u-step3.png (hoi-tu-choi-1440), E7u-step4.png (hoi-qua-han-1440), E7u-step5.png (hoi-tra-loi-390), E7u-step6.png (bao-sai-1440). Cùng thư mục: E7u-network.txt (n-a driver).
    Lưu ý trung thực: script dùng trợ lý giả nộp trả lời qua nopTraLoi() vào hàng DANG_HOI do chính script gieo, không khởi động agent eve (thiết kế của man-hoi.mjs); các khẳng định của eval đều đạt.

- eval: E8
  run_id: minted-tro-ly-doc-kho-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_zalo
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups6yk8jplc_test

- eval: E9
  run_id: minted-tro-ly-doc-kho-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_nhat_ky
  verified_at: 2026-10-01T16:42:27Z
  output: |
    (lệnh không in dòng kết quả nào ngoài mã thoát)

- eval: E10
  run_id: minted-tro-ly-doc-kho-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_chua_tra_loi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7cjqeto8_test

- eval: E10d
  run_id: minted-tro-ly-doc-kho-E10d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_man_suc_khoe_hoi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    Ran 4 tests across 1 file. [2.43s]

- eval: E11
  run_id: minted-tro-ly-doc-kho-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_bao_sai
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7ifrd9vm_test

- eval: E12
  run_id: mups7j8djzsa
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tlk_ranh_gioi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7j8djzsa_test

- eval: E13
  run_id: mups7j42mko4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_loi
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7j42mko4_test

- eval: E14
  run_id: minted-tro-ly-doc-kho-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tlk_tran
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7l6h5ong_test

- eval: E15
  run_id: minted-tro-ly-doc-kho-E15-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_cham_bo_do
  verified_at: 2026-10-01T16:42:27Z
  output: |
    (lệnh không in dòng kết quả nào ngoài mã thoát; kết quả hai lượt ghi ở _acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md)

- eval: E17
  run_id: minted-tro-ly-doc-kho-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tlk_san_thiet_ke
  verified_at: 2026-10-01T16:42:27Z
  output: |
    test-run: dropped crm_mups7rlqsp51_test

- eval: E15j
  judged_by: hội đồng judge (fresh context), 3 lens
  proposal: PASS
  votes:
    - domain-correctness: PASS — Trong cả hai lượt, mọi câu trả lời ở nhóm câu khó (c11–c20: ngưỡng 15 triệu, tiền phòng, phép không đổi thành tiền, nhiều trang) đều đi kèm trích dẫn nguyên văn nói đúng điều được khẳng định. Sáu câu phải từ chối (c21–c26) đều bị từ chối ở cả hai lượt (lượt hai trả lời «Chưa có trang đã duyệt nào… Mình không đoán»), không câu nào được trả lời bằng nội dung. Ở lượt Zalo, cả 30 câu quy định (gồm 4 câu không dấu) đều «chuyen», còn 10 câu không phải quy định (kể cả câu có tên khách như Minh An, Hoàng Long, Sao Việt) đều «khong-chuyen», nên không có kiểu nhận nhầm lặp lại nào. Khuyết điểm nhỏ: c17 ở Zalo không nêu ngày đối soát, nhưng chỉ là thiếu ý chứ không khẳng định điều trang không nói.
    - operational-feasibility: PASS — Trong nhóm câu khó (c11-c20, ngoại lệ/ngưỡng/hai trang), mọi khẳng định ở cả hai lượt đều có trích dẫn nguyên văn khớp; c17 lượt Zalo chỉ trả lời thiếu ngày đối soát chứ không khẳng định điều trang không nói. Sáu câu phải từ chối (c21-c26) đều bị từ chối ở cả hai lượt ("Mình không đoán"), không có câu trả lời nào lọt ra. Ở lượt Zalo, 30 câu quy định đều "chuyen" và 10 câu không phải quy định đều "khong-chuyen" (tỉ lệ nhầm 0%), kể cả 4 câu không dấu và các câu có tên khách (Minh An, Hoàng Long, Sao Việt), nên không thấy kiểu nhận nhầm lặp lại.
    - spec-alignment: PASS — Trong nhóm câu khó (c11 đến c20) và nhóm phải từ chối (c21 đến c26), mọi khẳng định đều đi kèm trích dẫn khớp ý. Sáu câu c21 đến c26 đều bị từ chối, không có câu nào bị trả lời. Ở lượt Zalo, 30 câu quy định đều "chuyen" và 10 câu c31 đến c40 đều "khong-chuyen", gồm cả câu không dấu c27 đến c30 và các câu có tên khách c31, c36, c37, nên không có kiểu nhận nhầm nào lặp lại. Điểm lệch duy nhất là ở lượt Zalo c17: câu trả lời chỉ nói hoa hồng chi theo quy trình đối soát hằng tháng và bỏ sót ngày đối soát. Đó là thiếu ý, không phải khẳng định điều trang không nói. Nội dung các trang nguồn nằm ngoài danh sách Input nên không đối chiếu độc lập được, chỉ dựa vào các trích dẫn trong báo cáo.
  human_override:  # chi nguoi ghi

- eval: E16j
  judged_by: hội đồng judge (fresh context), 3 lens
  proposal: FAIL
  votes:
    - domain-correctness: FAIL — Ở trạng thái trả lời, từ chối và quá hạn, nhãn khớp từ điển (Trợ lý AI, theo bản đang dùng, Phiên bản, duyệt ngày, quá hạn xác minh, chủ trang, Câu hỏi đã vào hàng chưa trả lời được). Người đọc cũng biết câu trả lời dựa vào trang nào và bản nào, và ở ca quá hạn còn thấy tên chủ trang. Nhưng ảnh tlk-hoi-trong-390.png cho thấy hàng câu hỏi gợi ý bị cắt ở mép phải: chip thứ hai chỉ còn «Xin nghỉ phé», chip thứ ba không hiện. Đó là nội dung tràn ngang trong một vùng cuộn ngang. tlk-hoi-cuon-390.txt chỉ đo scrollWidth của cả trang (390 = 390) nên không bắt được lỗi này. Thêm nữa, ở tlk-hoi-qua-han-390.png biểu tượng nổi góc dưới phải chồng lên góc phải ô soạn, che chỗ nút gửi.
    - operational-feasibility: FAIL — The answer, overdue, refusal and report-wrong states are clear at 1440 and 390. Labels follow CONTEXT.md: «Trợ lý AI · theo bản đang dùng», page name with «Phiên bản 1 duyệt 01/10/2026», and a banner «quá hạn xác minh… hỏi chủ trang Lê Thu Trang». The empty state at 390 (tlk-hoi-trong-390.png) fails the no-horizontal-scroll clause: the suggestion chips run off the right edge, with «Xin nghỉ phé…» cut mid-word and the third chip invisible. tlk-hoi-cuon-390.txt only measures document scrollWidth, so it misses this inner overflow. In tlk-hoi-qua-han-390.png the fixed palm-tree badge also sits over the bottom-right of the input box.
    - spec-alignment: FAIL — Ở 1440 và 390, câu trả lời có trích, từ chối, quá hạn xác minh và báo sai đều đọc được ngay: có tên trang, "Phiên bản 1", "duyệt 01/10/2026", dòng "Trợ lý AI · theo bản đang dùng" và cảnh báo "hỏi chủ trang Lê Thu Trang trước khi làm theo", đúng từ điển CONTEXT.md. Nhưng tlk-hoi-trong-390.png cho thấy hàng gợi ý bị cắt ngang mép phải ("Xin nghỉ phé…", chip thứ ba mất hẳn), tức vẫn có chỗ tràn ngang trong thân trang; tlk-hoi-cuon-390.txt chỉ đo scrollWidth của cả trang nên không che được lỗi này. Ngoài ra ở tlk-hoi-qua-han-390.png, vòng tròn nổi góc dưới phải đè lên ô soạn và che mất nút gửi.
  required_evidence:
    - Ảnh chụp lại tab Hỏi trạng thái trống ở 390px (thay tlk-hoi-trong-390.png), trong đó cả ba chip gợi ý đều hiện đủ chữ, xuống dòng chứ không bị cắt ở mép phải. Lấy bằng script chụp màn đã dùng cho bộ tlk-*.
    - Số đo bổ sung trong tlk-hoi-cuon-390.txt cho riêng hàng chip ([data-goi-y]): scrollWidth bằng clientWidth ở 390px, đo bằng page.evaluate trên phần tử đó chứ không chỉ document.documentElement.
    - Ảnh tab Hỏi ở trạng thái quá hạn (và các trạng thái có ô soạn thấp) ở 390px cho thấy nút gửi trong ô soạn không bị biểu tượng nổi góc dưới phải che. Hoặc bằng chứng biểu tượng đó là lớp phủ của công cụ dev chứ không phải sản phẩm, có thể bằng ảnh chụp từ bản build production.
    - A new tlk-hoi-trong-390.png in which all three suggestion chips are fully visible, for example wrapped onto several lines, with no text cut at the viewport edge. Source: re-capture the Hỏi tab empty state at a 390px viewport.
    - An element-level measurement in tlk-hoi-cuon-390.txt showing that the suggestion-chip container has scrollWidth <= clientWidth at 390px. Source: page.evaluate on the [data-goi-y] container, plus the document-level check already there.
    - A tlk-hoi-qua-han-390.png where nothing overlaps the input box or its send button, or proof that the palm-tree badge is a dev-only overlay absent from the real product. Source: re-capture without the overlay, or the code or DOM path showing where the badge comes from.
    - Ảnh chụp lại tlk-hoi-trong-390.png sau khi sửa, trong đó cả ba chip gợi ý đều hiện đủ chữ (xuống dòng hoặc xếp chồng), lấy từ lệnh chụp của eval E16j ở khổ 390.
    - Số đo ghi vào tlk-hoi-cuon-390.txt cho phần tử chứa chip ([data-goi-y]): scrollWidth bằng clientWidth, đo bằng cùng script đã sinh tệp .txt hiện có. Hiện tệp chỉ đo document nên không bắt được cắt ngang bên trong.
    - Ảnh tlk-hoi-qua-han-390.png (hoặc cùng cảnh ở 390 khi nội dung dài) cho thấy nút gửi của ô soạn không bị vòng tròn nổi góc dưới phải che, hoặc bằng chứng vòng tròn đó là lớp công cụ dev không có trong bản người dùng thật.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-10-01T16:42:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-01T16:42:27Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-doc-kho-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-01T16:42:27Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-doc-kho-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-01T16:42:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

E12 (bun run test -- "cd apps/agent && bun test test/tro-ly-kho-ranh-gioi.spec.ts test/khuon-di-dong.spec.ts"): baseline green, tức xanh trên cả HEAD lẫn code cũ nên chưa chứng minh được tính năng, chỉ chứng minh bộ đo chạy. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý. Liên quan phát hiện trong hợp đồng ở AC-12: phép đo ZDR gọi thẳng modelTaiLieu() chứ không chạy model thật của tro_ly_kho.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, không eval nào có pass_rate lẫn).

## Iterations

Round 1: REJECT — 24 eval, hai judgment chờ người chốt; trả về implementation, sửa ở d9959e31 và 260b562b.
Round 2: BLOCKED — E15 và E7u thất bại thật (E15: tỉ lệ Zalo chuyển nhầm câu không phải quy định vượt ngưỡng; E7u: ảnh bước 5 ở 390 không hiện câu trả lời); E13 và lint:slop bị skip hoặc chết nên không có kết quả; sửa chỉ dẫn Zalo gọn lại và chạy lại bộ chấm E15 hai lượt song song.
Round 3: REJECT — mọi eval máy đạt tại cd499ff8; hội đồng judge E16j đề xuất không đạt vì chip gợi ý ở 390px bị cắt ngang và biểu tượng nổi đè ô soạn; E12 vẫn không phân biệt được với baseline; E6 được máy ghi run_id là chuỗi rỗng đặt trong dấu nháy (chép nguyên văn từ bản đồ mã).
