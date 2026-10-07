---
schema_version: 2
feature_slug: soan-okr-trang-rieng
verdict: REJECT
failed_evals: [E1b, E14]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a3fab331a574453e5c9ea584922faf7dee0a6cd6
human_signoff:
---

# Evidence Report: soan-okr-trang-rieng

Round 1. Hai eval ui-check không đạt: E1b (chữ màn lỗi lệch hợp đồng) và E14 (ma trận ảnh thiếu lý do khoá ở trạng thái đang soạn). Mọi lệnh thất bại đều gắn với một trong hai eval này; không có lệnh thất bại nào ngoài eval. E15 chưa có người chốt (hội đồng đề xuất FAIL, xem mục Judge).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | FAIL |
| E2 | AC-2 | ui-check | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8c | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | ui-check | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | ui-check | PASS |
| E12 | AC-12 | test | PASS |
| E12b | AC-12 | ui-check | PASS |
| E13 | AC-13 | script | PASS |
| E13b | AC-13 | script | PASS |
| E13c | AC-13 | script | PASS |
| E14 | AC-14 | ui-check | FAIL |
| E15 | AC-15 | judgment | PENDING (hội đồng đề xuất FAIL, chờ người chốt) |
| E16 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-soan-okr-trang-rieng-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_duong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 6 tests across 1 file.

- eval: E1b
  run_id: minted-soan-okr-trang-rieng-E1b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.k2_man_duong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bước 1 đạt: đầu trang «Kinh doanh miền Bắc · Năm kế · mẫu · lượt 0/12», không sheet, không thanh tab, URL khớp /okr/soan/<id>.
    Bước 2 đạt: liên kết cũ cuocSoan thành /okr/soan/<id>; quay lại về đúng theo-don-vi, lịch sử không tăng.
    Bước 3 chưa khớp chữ: màn lỗi hiện «Kara chưa mở cuộc soạn được» + «Cuộc này không còn, hoặc bạn không xem được nó.» + nút «Thử lại»; bước 4 và AC-1 đòi chữ «Không mở được cuộc soạn». man.mjs chỉ kiểm chuỗi con trang.khongMo = «mở cuộc soạn» nên báo đạt (messages: apps/app/lib/messages/okr-soan.ts trang.khongMo; KaraState ghép «Kara chưa {what} được»).
    Bước 4 đạt: bấm «← Theo đơn vị» về theo-don-vi đúng kỳ và đơn vị. Console không lỗi.
    Chiều đỏ push-link-cu in «buớc 2: link cu them lich su» đúng kỳ vọng.
    man.mjs không tự lưu ảnh nên chạy một bản sao khuôn (scratchpad, chỉ thêm lệnh chụp, không sửa repo) cho cùng kết quả bốn bước. Phiên đo tự dọn.
    Ngoài ra: nếu chủ hợp đồng chấp nhận «Kara chưa mở cuộc soạn được» thì sửa step/AC-1; nếu không thì sửa thông điệp.
  screenshot: evidence/E1b-step1.png
  observed: |
    E1b-step1.png (1440x900): trang riêng «Soạn OKR», liên kết «← Theo đơn vị» trên cùng, dòng phụ «Kinh doanh miền Bắc · Năm kế · mẫu · lượt 0/12»; hai ô cạnh nhau (hội thoại trái, ô «Bản nháp» phải, «Kara đang soạn bản nháp đầu…») với thanh kéo giữa; không sheet, không thanh tab OKR, không ô chọn chu kỳ. Khớp Expected.
    E1b-step2.png: sau goBack là «OKR theo đơn vị» có thanh tab OKR, đơn vị Kinh doanh miền Bắc, ô chu kỳ «Năm kế · mẫu» (khớp bước 2). E1b-khong-mo.png = E1b-step3.png: thẻ lỗi với tiêu đề «Kara chưa mở cuộc soạn được», mô tả «Cuộc này không còn, hoặc bạn không xem được nó.», nút «Thử lại», có liên kết về Theo đơn vị; chữ KHÁC chữ bước 4 đòi «Không mở được cuộc soạn» (mâu thuẫn chữ). E1b-step4.png: «OKR theo đơn vị» đang tải với thanh tab, ô chu kỳ «Năm kế · mẫu» (khớp bước 4).
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-soan-okr-trang-rieng-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_khung
  verified_at: 2026-10-07T20:49:59Z
  output: |
    man.mjs --phan khung in từng số đo ở mọi khổ; console không lỗi, không tràn ngang.
    Network: driver là puppeteer-core, chỉ đọc được lỗi console và pageerror, không có lỗi nào ở mọi khổ.
    Lưu ý: git status cuối phiên cho thấy các tệp E14-ST-*.png đang sửa; phiên này chỉ chạy --phan khung nên không ghi các tệp đó.
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1.png (1440x1000): trang «Soạn OKR» đã đăng nhập; cột trái là hội thoại (tin «Đưa bản nháp.», dòng «Kara soạn bản nháp đầu: 2 Mục tiêu · 5 KR», «Đã ghi bản nháp.»), cột phải thẻ «Bản nháp» ghi «7 dòng» với Mục tiêu 1 «Giữ chân đối tác lớn» và các KR có ô Khởi điểm/Đích; thanh kéo mỏng ở giữa, ô hội thoại khoảng 380 px.
    E2-focus-thanh.png: sau Tab và hai lần ArrowRight, ô hội thoại rộng khoảng 508 px, thanh kéo có vạch focus rõ. E2-step3.png: sau kéo +300, ô hội thoại rộng khoảng 640 px, bản nháp còn khoảng 620 px, trang không cuộn. E2-step5-ban-nhap.png: thân bản nháp đã cuộn, tiêu đề trang vẫn ở chỗ cũ, nút «Đưa vào bộ OKR» ghim ở đáy. E2-step6-375-sau-reload.png (375x812) và E2-step6-1023-sau-reload.png (1023x768): không thanh kéo, có thanh tab «Trò chuyện | Bản nháp», tab Bản nháp đang chọn sau tải lại, không tràn ngang. Khớp Expected.
  network_observed: n-a (driver)

- eval: E2b
  run_id: minted-soan-okr-trang-rieng-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_khung
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 2 tests across 1 file.

- eval: E3
  run_id: minted-soan-okr-trang-rieng-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_trang_thai
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 1 test across 1 file.

- eval: E4
  run_id: minted-soan-okr-trang-rieng-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_dong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 2 tests across 1 file.

- eval: E5
  run_id: minted-soan-okr-trang-rieng-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_quyet
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bài k2-quyet chạy xanh; lệnh trả mã thoát 0.

- eval: E5b
  run_id: minted-soan-okr-trang-rieng-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_api_hoan
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bài API k2-api-hoan chạy xanh trên kho _test; lệnh trả mã thoát 0.

- eval: E6
  run_id: minted-soan-okr-trang-rieng-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_nhom
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 2 tests across 1 file.

- eval: E6b
  run_id: minted-soan-okr-trang-rieng-E6b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_api_nhom
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bài API k2-api-nhom chạy xanh trên kho _test; lệnh trả mã thoát 0.

- eval: E7
  run_id: minted-soan-okr-trang-rieng-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_khoa
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 2 tests across 1 file.

- eval: E8
  run_id: minted-soan-okr-trang-rieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_luat
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bài đơn vị tom-tat-moc chạy xanh; kho thử dùng một lần đã được xoá sau lượt.

- eval: E8b
  run_id: minted-soan-okr-trang-rieng-E8b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_moc_dom
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 1 test across 1 file.

- eval: E8c
  run_id: minted-soan-okr-trang-rieng-E8c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_moc
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Chiều đỏ moc-tu-bo-nho: bước 1-3 đạt, in «het gio cho: moc sau tai lai» và «buoc 4: moc mat sau tai lai»; lệnh chiều đỏ trả mã khác 0 đúng Expected.
    man.mjs gốc không lưu ảnh nên chạy thêm một bản sao tạm (scratchpad, chỉ thêm chụp và ghi network, không sửa repo) cùng kịch bản: bốn bước đều đạt, console không lỗi.
    Network: GET/POST của app đều thành công; ba luồng SSE /eve/.../stream bị client huỷ khi tải lại hoặc chuyển trang, không phải lỗi máy chủ. Origin là cổng phiên đo riêng, khác localhost:3000 khai trong config.
  screenshot: evidence/E8c-step1.png
  observed: |
    E8c-moc-1440.png (1440x760): cột hội thoại có hai mốc nằm giữa dòng kẻ: «Kara soạn bản nháp đầu: 2 Mục tiêu · 5 KR» và «Kara sửa bản nháp: +1 KR · sửa 1 · chuyển 1 · bỏ 1», xen kẽ hai tin người; ô bản nháp có «Mục tiêu 1 · Cam kết» kèm nhãn «vừa sửa» và dòng cũ gạch ngang «Giữ chân đối tác lớn». Khớp AC-8.
    E8c-step2/E8c-noi-dong: dòng Mục tiêu 1 nổi có data-noi nằm trong khung ô bản nháp (log đo được); vệt tô nền chỉ rõ ở frame step3. E8c-step3: sau bấm nhãn «vừa sửa», hội thoại cuộn thấy mốc hai trong khung. E8c-step4: sau tải lại hai mốc vẫn còn đúng thứ tự, bản nháp «7 dòng» không còn gạch. Không mâu thuẫn Expected.
  network_observed: unscoped-partial

- eval: E9
  run_id: minted-soan-okr-trang-rieng-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_hoi_dong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 2 tests across 1 file.

- eval: E9b
  run_id: e9b-green-20261008
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_hoi_dong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Evidence lưu ở _acceptance/soan-okr-trang-rieng/evidence/: E9b-step1.png (chip trong ô soạn), E9b-step2.png (sau khi gửi), E9b-chip.png, dau-loi-goi.ndjson, E9b-green.log, E9b-red.log, E9b-network.txt.
    Lệch nhẹ giữa steps và mã: (1) man.mjs không tự chụp E9b-chip.png nên chạy một script chụp phụ ở scratchpad, không sửa repo; (2) tệp đầu vào mô hình thực tế là vao-mo-hinh.ndjson, đã sao thành dau-loi-goi.ndjson; (3) «KR thứ nhất» trong steps thực tế là KR «Tăng số đại lý gắn bó» theo hợp đồng AC-9, không phải KR đầu bảng.
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-step1.png (1440x900): hội thoại bên trái với bản nháp đã ghi («Đã ghi bản nháp.»); ô soạn có chip «KR · Tăng số đại lý gắn bó» kèm dấu x gỡ và viền focus xanh; bên phải bảng bản nháp 7 dòng với các nút «Hỏi Kara về dòng này». Khớp Expected.
    E9b-step2.png: sau khi gửi «ngắn hơn» (lượt 3/12), bong bóng người chứa chip «KR · Tăng số đại lý gắn bó» và chữ «ngắn hơn», không có ký tự khối nào lộ ra, Kara trả «Đã ghi nhận.», ô soạn trống và chip đã mất. E9b-chip.png: bong bóng riêng đúng như Expected.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-soan-okr-trang-rieng-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_khoi
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Bài đơn vị khoi-ngu-canh chạy xanh; kho thử dùng một lần đã được xoá sau lượt.

- eval: E10b
  run_id: minted-soan-okr-trang-rieng-E10b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_he_thong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 1 test across 1 file.

- eval: E10c
  run_id: E10c-20261008
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_he_thong
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Chiều đỏ bo-quyet in «buoc 3: mo hinh khong thay quyet» và «buoc 4: dong he thong khong dung ngay truoc bong bong»; KET LUAN 2 SAI, lệnh trả mã khác 0 đúng Expected.
    Bằng chứng lưu dạng .html (fallback): man.mjs không lưu E10c-se-gui.png và capture.ui không tái tạo được trạng thái phiên, đăng nhập, bản nháp. Không sửa code.
    Lưu ý nhỏ: kịch bản gửi «Tiep tuc.» (hằng LENH.tiep) chứ không phải «tiep» nguyên văn, dùng nhất quán ở cả ba bước nên không ảnh hưởng kết luận. dau-loi-goi.ndjson không còn trên đĩa vì phiên đo đã dọn.
  screenshot: evidence/E10c-step1.html
  observed: |
    Không có ảnh PNG (fallback .html). E10c-step1.html: các bước 1-4 đạt; dòng hệ thống đúng mẫu «sẽ gửi» với KR «Số khiếu nại giao hàng» và Mục tiêu «Mở kênh đại lý miền Trung»; mô hình nhận khối ngữ cảnh JSON quyết [nhãn KR, bậc Mục tiêu] rồi «Tiếp tục.»; sau tải lại dòng hệ thống đứng ngay trước bong bóng «Tiếp tục.»; console không lỗi. E10c-step2-do-bo-quyet.html: chiều đỏ in «mo hinh khong thay quyet», «sau tai lai: he thong «null»», dòng hệ thống không đứng đúng chỗ. Khớp Expected.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-soan-okr-trang-rieng-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_so
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 3 tests across 1 file.

- eval: E11b
  run_id: minted-soan-okr-trang-rieng-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_so
  verified_at: 2026-10-07T20:49:59Z
  output: |
    KET LUAN 0 SAI; bước 1-3 đạt, console không lỗi.
    Khác biệt với steps (ghi thẳng): (a) steps ghi gõ (100,150,5,9) nhưng man-so.mjs gõ (10,20,50,30); bộ (100,150,5,9) chỉ có trong bài DOM E11, invariant kiểm vẫn là một (bốn ô giữ nguyên sau nộp lại, đổi tab, tải lại). (b) «mô hình giả nộp 2 Mục tiêu x 5 KR» và «ngữ cảnh KR chờ/nhận» không tự đọc được; harness chỉ in «id dòng đổi sau nộp lại: 6/7». (c) man.mjs không lưu E11b-sau-tai-lai.png nên không có frame PNG; fallback lưu log ba lần chạy thành HTML. Thiếu ảnh là khoảng trống bằng chứng, không phải assertion đỏ.
    Log thô: /private/tmp/claude-501/e11b-main.log, e11b-khoa-theo-id.log, e11b-doc-luc-dung.log.
  screenshot: evidence/E11b-output.html
  observed: |
    Không có ảnh (fallback HTML). E11b-output.html có ba khối log: khối xanh cho bốn ô khởi/đích = 10, 20, 50, 30 giữ nguyên sau nộp lại, sau đổi tab và sau tải lại, KET LUAN 0 SAI; khối khoa-theo-id: sau nộp lại bốn ô rỗng, «buoc 1: mat so sau nop lai»; khối doc-luc-dung: sau nộp lại còn đủ số nhưng sau tải lại bốn ô rỗng, «buoc 3: mat so sau tai lai». Hai chiều đỏ đều khác 0 đúng Expected; giá trị số khác steps như đã ghi.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-soan-okr-trang-rieng-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2_dua_vao
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Ran 1 test across 1 file.

- eval: E12b
  run_id: e12b-2026-10-08
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2_man_dua_vao
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Dấu vết không thuộc phiên này: git status có các ảnh E14-*.png đang sửa; phiên này không chạy phần ma-tran nên do phiên khác. Cổng 4632 của tiến trình khác, không dùng và không tắt.
    Log: /private/tmp/claude-501/e12b-faithful2.log, e12b-run.log, e12b-red2.log. Ảnh: evidence/E12b-con-thieu.png, evidence/E12b-da-dua-vao.png, evidence/E12b-network.txt.
  screenshot: evidence/E12b-con-thieu.png
  observed: |
    E12b-con-thieu.png (1440x900, lượt 2/12): cột Bản nháp có «Đã thêm Mục tiêu 1 và 3 KR», «Đã thêm Mục tiêu 2 và 1 KR» và «Đã thêm KR · Tăng số đại lý gắn bó»; ô Khởi điểm của KR đó là 40, ô Đích trống và viền đỏ; chân bản nháp có «Điền khởi điểm và đích cho 1 KR đã nhận trước khi đưa vào», «Còn thiếu: Tăng số đại lý gắn bó» (đúng một mục), nút «Đưa vào bộ OKR · 2 Mục tiêu, 5 KR» bị khoá. Khớp Expected.
    E12b-da-dua-vao.png: hộp «Đã tạo 2 Mục tiêu nháp» với «5 KR đi kèm; đích bạn đã điền được giữ» và nút «Xem ở Theo đơn vị»; hai nhóm đã quyết hết, ô khởi điểm 40 và đích 99 bị khoá, ô chat bị vô hiệu hoá kèm dòng «Bản nháp bên cạnh còn để xem lại; không gửi thêm lượt nào», không còn nút quyết. Khớp Expected.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-soan-okr-trang-rieng-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2_mo_coi
  verified_at: 2026-10-07T20:49:59Z
  output: |
    XANH: cổng mồ côi không còn miễn trừ K1, đi qua kara/, cả hai chiều đỏ bắt đúng.

- eval: E13b
  run_id: minted-soan-okr-trang-rieng-E13b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2_ranh_gioi
  verified_at: 2026-10-07T20:49:59Z
  output: |
    XANH: 240 tệp đều trong ranh giới K2 hoặc đã duyệt; tệp chung chỉ thêm; okr.contracts.ts chỉ trong khối quyết; resizable.tsx được trang soạn nhập.

- eval: E13c
  run_id: minted-soan-okr-trang-rieng-E13c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2_tai_lieu
  verified_at: 2026-10-07T20:49:59Z
  output: |
    XANH: hàng artifact.tsx và task.tsx nêu trang soạn là nơi dùng, không còn chữ miễn trừ; đoạn ngoại lệ không còn nêu hai tệp.

- eval: E14
  run_id: E14-20261008-verifier
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.k2_man_ma_tran
  verified_at: 2026-10-07T20:49:59Z
  output: |
    Lệnh eval (qua mot-luot.sh) in «so anh: 78 = 13 trang thai x 3 kho x 2 nen (78)», «DUNG so anh dung 78», «DUNG anh dau vao cua E15 du va khac rong», KET LUAN 0 SAI; console không lỗi. Phiên đo riêng tự dựng và tự dọn (kho crm_optimistic_kare_ec244b_do); không còn server nào do verifier khởi động. Log: evidence/E14-run.log, evidence/E14-network.txt.
    Chiều đỏ tran: «SAI ST-soan-mo-dau 1440 light: tran ngang (2000/1440)». Chiều đỏ chup-som: «SAI ST-soan-co-nhap 1440 light: thieu chu ban «dòng» o [data-slot=kara-artifact-header]». Cả hai đúng Expected.
    78 ảnh E14-*.png có mặt (13 x 3 x 2); 9 ảnh inputs của E15 đều lớn hơn 0 byte (55 KB-110 KB). Đạt: không tràn ngang, kéo chuột 380 sang 480 px, phím mũi tên 480 sang 300 px, hai chiều đỏ đúng.
    Không đạt dù lệnh in đủ: (A) Bước 4: ST-soan-dang-soan cần role=status trong đầu bản nháp chứa chữ báo bận trước khi chụp. Script không có chỗ này. Thành phần KaraState working chỉ hiện chữ sau 1000 ms (KARA_TRE_MS, packages/ui/src/components/kara/state.tsx), script chỉ chờ 400 ms. Cổng chữ đầu của script chỉ tìm chuỗi «Kara đang soạn — xong sẽ quyết được.» trong [data-cot=ban-nhap], chuỗi này có mặt nhờ span sr-only ở chân khung (bang-nhap.tsx khoảng dòng 314). Ba ảnh dang-soan (1440 light, 375 light, 1440 dark) cho thấy role=status ở đầu bản nháp RỖNG; các nút Thêm/Sửa/Bỏ qua chỉ mờ đi mà không có lý do nhìn thấy, trái bảng UX-STATE-TABLE («đầu khung Kara đang soạn…»).
    (B) Bước 2: script in «trang thai chua co cach dung: <ids>» (man-ma-tran.mjs khoảng dòng 188), không phải «thieu trang thai: <id>» như steps.
    (C) Bước 3: script không có kiểm tab đang chọn và không có thông điệp «sai tab: <id>». Bảng tab trong script khác steps: script đặt mo-dau=ban-nhap (steps: tro-chuyen), moc=tro-chuyen (steps: ban-nhap), hoi-dong=ban-nhap (steps: tro-chuyen). Ảnh 375: mốc hiện tab «Trò chuyện» được chọn (steps yêu cầu Bản nháp).
    (D) ST-soan-da-quyet và ST-soan-con-thieu ở 375 light có md5 giống hệt và ở 1440 gần như giống nhau (cùng một trạng thái ứng dụng), nên hai ảnh không phân biệt được hai trạng thái.
  screenshot: evidence/E14-ST-soan-mo-dau-1440-light.png
  observed: |
    Đã mở từng frame bằng Read. mo-dau-1440-light: đầu trang «Soạn OKR», ô hội thoại trống chỉ có avatar AI, ô bản nháp «Bản nháp · Kara» với «Kara đang soạn bản nháp đầu…» và chỉ báo ThinkingIndicator; khớp ST-soan-mo-dau, không tràn. co-nhap-1440-light: hai cột hội thoại và bản nháp «Kara · 7 dòng · sửa lúc 03:59», nhóm Mục tiêu 1 với nút chính xanh «Thêm Mục tiêu», Sửa, Bỏ qua, Hỏi Kara, KR có ô Khởi điểm/Đích; chân «Đưa vào bộ OKR · 0 Mục tiêu, 0 KR» mờ. co-nhap-375-light: tab «Trò chuyện» và «Bản nháp (7)» với Bản nháp được chọn, không tràn ngang.
    dang-soan-1440-light, dang-soan-375-light, dang-soan-1440-dark: hội thoại có «Tiếp tục.» và avatar AI trống, ô soạn có nút Dừng; các nút dòng chờ mờ đi nhưng đầu bản nháp KHÔNG có chữ «Kara đang soạn…» và không có lý do khoá nhìn thấy: mâu thuẫn Expected bước 4 và bảng trạng thái. da-quyet-1440-light / 375-light: biên nhận «Đã thêm Mục tiêu 1 · …» và «Đã thêm KR · …» kèm «Hoàn tác», ô Khởi điểm/Đích viền đỏ, chân «Còn thiếu: …». con-thieu-1440-light / 375-light: giống hệt da-quyet (cùng md5 ở 375), «Còn thiếu: Tỷ lệ đối tác gia hạn hợp đồng · Số khiếu nại giao hàng» là liên kết xanh, nút Đưa vào «1 Mục tiêu, 2 KR» mờ. moc-375-light: tab «Trò chuyện» được chọn (steps yêu cầu tab Bản nháp). hoi-dong-375-light: tab «Trò chuyện», chip «KR · Tăng số đại lý gắn bó ×» trên ô soạn có viền focus xanh.
  network_observed: n-a (driver)

- eval: E16
  run_id: minted-soan-okr-trang-rieng-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2_san_thiet_ke
  verified_at: 2026-10-07T20:49:59Z
  output: |
    design-gate.mjs --mode static chạy trên từng .tsx dưới okr/soan/ cộng resizable.tsx và kara/proposal.tsx; năm lỗi nền P0 bằng 0.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-soan-okr-trang-rieng-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-soan-okr-trang-rieng-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-soan-okr-trang-rieng-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-soan-okr-trang-rieng-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bunx turbo run lint --force
  run_id: minted-soan-okr-trang-rieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bun run lint:slop
  run_id: minted-soan-okr-trang-rieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

- cmd: bunx turbo run build --force
  run_id: minted-soan-okr-trang-rieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-07T20:49:59Z

### Judge (E15, đề xuất của hội đồng, chờ người chốt)

- eval: E15
  judged_by: judge panel (3 lens, fresh context)
  verdict: PENDING-HUMAN (hội đồng đề xuất FAIL, người chốt ở Cổng 2)
  rationale: Ba lens đều thấy tiêu chí 1, 2, 4 đạt (hai vùng tách bạch, một nút chính mỗi dòng chờ, biên nhận phân biệt được, «Còn thiếu» chỉ ra việc phải làm) và tiêu chí 3 (lý do khoá đọc được) không đạt ở ba ảnh đang soạn.
  votes:
    - domain-correctness: FAIL — Tiêu chí 1, 2 và 4 đạt: hội thoại và thẻ «Bản nháp» tách bạch, mỗi dòng chờ có đúng một nút tô xanh «Thêm …» và dòng đã quyết thu thành biên nhận «Đã thêm … · Hoàn tác», còn «Còn thiếu:» có chữ giải thích cùng đường dẫn tới từng KR. Tiêu chí 3 hỏng: ở ảnh đang soạn, các nút «Thêm / Sửa / Bỏ qua», nút nhóm và «Đưa vào bộ OKR» bị mờ, nhưng dòng của Kara trong hội thoại chỉ có dấu tia sáng và không có chữ «Kara đang <động từ> <thứ>…» như mục 7. Khung bản nháp cũng không có dòng nào nói vì sao khoá, và ở 375 px tab Bản nháp hoàn toàn không có lý do nào. Ba ảnh đang soạn (1440 light, 375 light, 1440 dark) đều như vậy.
    - operational-feasibility: FAIL — Tiêu chí (1), (2) và (4) đạt: hội thoại và bản nháp là hai ô khác nhau, mỗi dòng chờ có đúng một nút tô xanh và dòng đã quyết thu thành «Đã thêm … Hoàn tác», còn ảnh còn thiếu có câu hướng dẫn, danh sách «Còn thiếu» và ô đỏ. Tiêu chí (3) không đạt: ở ảnh đang soạn, các nút, nút nhóm và «Đưa vào bộ OKR» chỉ mờ đi và không có chữ nào nói Kara đang soạn nên bị khoá. Dòng hội thoại của Kara chỉ có icon trống, không có «Kara đang <động từ> <thứ>…» như mục 7 của docs/ai-ux.md. Ở 375 thì tab Bản nháp đang mở, tab Trò chuyện bị ẩn, nên không có dấu hiệu nào giải thích việc khoá.
    - spec-alignment: FAIL — Tiêu chí (1), (2) và (4) đạt. Hội thoại và «Bản nháp» tách thành hai ô ở 1440 và hai tab ở 375. Mỗi dòng chờ có đúng một nút «Thêm …» tô màu, và dòng đã quyết thu thành «Đã thêm … · Hoàn tác». Dòng «Còn thiếu:» kèm liên kết cho biết phải điền gì. Tiêu chí (3) không đạt: ở ba ảnh đang soạn (1440 sáng, 375 sáng, 1440 tối), các nút «Thêm», «Sửa», «Bỏ qua», «Hỏi Kara» và nút nhóm chỉ mờ đi, không có chữ nào giải thích. Chỗ Kara đang làm chỉ là một dấu tia sáng trơ, không có «Kara đang <động từ> <thứ>…» như mục 7 yêu cầu. Ở 375, ảnh chỉ chụp tab Bản nháp nên người xem không thấy lý do ở đâu cả.
  required_evidence:
    - Ảnh E14-ST-soan-dang-soan-375-light.png chụp lại, trong đó tab Bản nháp (hoặc thanh tab) hiện một dòng nói Kara đang soạn nên các nút tạm khoá, theo mục 7 và 3 của docs/ai-ux.md (nút khoá cùng FieldDescription); dòng giải thích khoá nằm trong tab Bản nháp (ví dụ «Kara đang soạn…» cạnh nút nhóm hoặc nút Đưa vào bộ OKR kèm FieldDescription theo mục 7 «Tắt hay hết lượt»), lấy bằng cách chạy lại lệnh đo màn K2 trong _acceptance/soan-okr-trang-rieng.
    - Ảnh E14-ST-soan-dang-soan-1440-light.png và bản dark chụp lại sau khi chữ «Kara đang … …» của ThinkingIndicator đã hiện, để thấy dòng hội thoại không còn trống bên cạnh dấu tia sáng; chữ phải đọc được ở trạng thái shimmer dừng, chụp qua mot-luot ở trạng thái đang soạn. Nếu chữ chỉ ẩn vì hiệu ứng shimmer lúc chụp, ảnh phải cho thấy chữ đó đọc được.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — mọi eval multi-run đều đồng đều

## Iterations

Round 1: E1b, E14 failed. E1b: màn lỗi bước 4 hiện «Kara chưa mở cuộc soạn được», lệch chữ hợp đồng «Không mở được cuộc soạn» (khớp nghĩa, lệch chữ; man.mjs chỉ kiểm chuỗi con nên báo đạt). E14: ma trận ảnh đủ 78 nhưng trạng thái đang soạn không có chữ báo bận ở đầu bản nháp (chờ 400 ms so với 1000 ms của KaraState), bảng tab 375 lệch steps, hai trạng thái da-quyet và con-thieu cho ảnh không phân biệt được. E15 hội đồng đề xuất FAIL cùng nguyên nhân (thiếu lý do khoá ở trạng thái đang soạn). Returned to implementation.
