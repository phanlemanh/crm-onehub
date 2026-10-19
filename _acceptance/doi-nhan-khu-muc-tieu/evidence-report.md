---
schema_version: 2
feature_slug: doi-nhan-khu-muc-tieu
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f54a0250b869a9e4255d3591c471a7595b625c44
human_signoff:
---

# Evidence Report: doi-nhan-khu-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-1 | script | PASS |
| E14 | AC-2 | judgment | FAIL (đề xuất của hội đồng judge, chờ người quyết ở Cổng 2) |
| E15 | AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-nhan-khu-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_gop_vao
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-gop-vao
    Ran 2 tests across 1 file. [48.00ms]

- eval: E2
  run_id: minted-doi-nhan-khu-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_gop_vao
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-gop-vao
    Ran 2 tests across 1 file. [48.00ms]

- eval: E3
  run_id: minted-doi-nhan-khu-muc-tieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_goc_man
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-khu-muc-tieu.dom.tsx -t dnk-goc-man
    Ran 5 tests across 1 file. [1482.00ms]

- eval: E4
  run_id: minted-doi-nhan-khu-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_goc
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-goc
    Ran 2 tests across 1 file. [78.00ms]

- eval: E5
  run_id: minted-doi-nhan-khu-muc-tieu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_lay_y_kien
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-lay-y-kien
    Ran 1 test across 1 file. [59.00ms]

- eval: E6
  run_id: minted-doi-nhan-khu-muc-tieu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dnk_luat
  verified_at: 2026-10-19T12:36:21Z
  output: |
    cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-luat
    Ran 2 tests across 1 file. [68.00ms]

- eval: E7
  run_id: minted-doi-nhan-khu-muc-tieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_dot_bien
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/dot-bien.mjs
    dot-bien: 5/5 cap dat

- eval: E8
  run_id: minted-doi-nhan-khu-muc-tieu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_kiem_ke
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/kiem-ke.mjs
    kiem-ke: 84 muc, goc khop (dai nhanh-mo 8 commit)

- eval: E9
  run_id: minted-doi-nhan-khu-muc-tieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_proto
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/proto.mjs
    proto: 0 tep doi, 0 tep nap chu okr (dai nhanh-mo 8 commit)

- eval: E10
  run_id: minted-doi-nhan-khu-muc-tieu-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_khong_go_bai
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/khong-go-bai.mjs
    khong-go-bai: 8 tep doi, 0 vi pham (dai nhanh-mo 8 commit)

- eval: E11
  run_id: minted-doi-nhan-khu-muc-tieu-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.dnk_bai_cu
  verified_at: 2026-10-19T12:36:21Z
  output: |
    bun test ./test/messages-guard.spec.ts và mười bài dom cũ đã đổi chữ (vòng for)
    Ran 54 tests across 1 file. [2.76s]

- eval: E12
  run_id: minted-doi-nhan-khu-muc-tieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_thuoc_da_ky
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/thuoc-da-ky.mjs
    thuoc-da-ky: 2 ho so, 3 cap, 0 lech (dai nhanh-mo)

- eval: E13
  run_id: minted-doi-nhan-khu-muc-tieu-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_bang_chu
  verified_at: 2026-10-19T12:36:21Z
  output: |
    node _acceptance/doi-nhan-khu-muc-tieu/rang/bang-chu.mjs
    bang-chu: 142 dong

- eval: E14
  judged_by: hội đồng judge ba lăng kính (fresh context)
  proposal: FAIL
  rationale: Hai trong ba lăng kính chấm không đạt; xem phiếu từng judge ngay dưới. Máy không tự chốt, người quyết ở Cổng 2.
  votes:
    - domain-correctness: PASS — Tôi đọc hết 146 dòng của bảng chữ, đối chiếu với mục «Bảng thay chữ» của design doc. Chữ mới dùng đúng một tên cho từng khái niệm: «Góp vào» hoặc contribute cho căn chỉnh, «Lấy ý kiến» cho lần hỏi ý, «Công ty» hoặc «Company» cho tên cấp và dự phòng tên gốc, «cả công ty» cho phạm vi. Hướng (cái gì góp vào cái gì) và người làm gì được giữ, không có dòng nào ghép cứng kiểu «Gỡ Góp vào». Có hai chỗ hơi vụng nhưng không làm sai nghĩa. Một là dòng en `loiQuyet.can-chinh-chinh-no` ("so it can't contribute to it"). Hai là dòng `hienThi.congKhaiMoTa` và `gioiHanMoTa`, nơi câu mới chỉ nói chiều «góp vào mục tiêu khác» trong khi câu cũ «căn chỉnh được» không nêu chiều.
    - operational-feasibility: FAIL — Phần lớn dòng đạt cả ba tiêu chí. Riêng dòng okr-toan-canh.ts#soDo.moTa (en) dùng hai tên cho một khái niệm trong cùng một câu. Có thêm một dòng nhóm okr-gioi-han.ts#hienThi (mất hướng) cần chủ kho xác nhận.
    - spec-alignment: FAIL — Phần lớn dòng đạt: một tên cho một khái niệm, các dòng `goc` đúng vai theo design doc, câu đọc tự nhiên. Nhưng dòng en của `okr-gop-y.ts#loiQuyet.can-chinh-gioi-han` đọc sai, và bốn dòng `okr-gioi-han.ts#hienThi` thu hẹp nghĩa cũ vốn không có chiều.
  required_evidence:
    - (operational-feasibility) Dòng okr-toan-canh.ts#soDo.moTa (en) vi phạm tiêu chí 1: chữ mới là «Lines are real contributions: solid lines feed the unit directly above, dashed lines skip a level…». Đầu câu dùng «contributions», nhưng vế sau vẫn giữ động từ cũ «feed» cho cùng khái niệm; vi cùng khoá đã đổi hết sang «góp vào». Cùng bảng, dòng soDo.chuGiaiChuaNoi (en) đã đổi «feeds» thành «contributes». Nếu bảng chữ (bang-chu.md dòng 75) sửa «feed» thành «contribute to» (ví dụ «solid lines contribute to the unit directly above») và tệp apps/app/lib/messages/okr-toan-canh.ts khớp, dòng này hết vi phạm.
    - (operational-feasibility) Cần xác nhận hướng cho hai khoá okr-gioi-han.ts#hienThi.congKhaiMoTa (vi/en) và hienThi.gioiHanMoTa (vi/en). Chữ cũ «căn chỉnh được» / «can be aligned» / «cannot be aligned» hai chiều (mục tiêu giới hạn không làm đích được và không làm nguồn được), nhưng chữ mới chỉ nói «góp vào mục tiêu khác được» / «cannot contribute to other objectives», tức một chiều. Nguồn đối chiếu: quy tắc mức hiển thị trong okr-gioi-han.ts (hoặc ghi chú của chủ kho) cho biết mục tiêu giới hạn có thể là đích của người khác hay không. Nếu hiển thị giới hạn cũng chặn người khác góp vào nó, cần sửa thêm vế «mục tiêu khác cũng không góp vào nó được». Nếu chỉ chặn một chiều, dòng này hết vi phạm.
    - (spec-alignment) Sửa dòng en `okr-gop-y.ts#loiQuyet.can-chinh-gioi-han` trong bang-chu.md: «One side is restricted, so it can't contribute there.» có đại từ «it» và «there» không rõ chỉ bên nào. Câu cũ «they can't be aligned» nói về cả hai bên. Cần bản mới nêu rõ cả hai chiều (ví dụ «One side is restricted, so this objective can't contribute to that target.»), rồi nạp lại để thấy dòng đã đổi.
    - (spec-alignment) Làm rõ bốn dòng `okr-gioi-han.ts#hienThi.congKhaiMoTa` và `okr-gioi-han.ts#hienThi.gioiHanMoTa` (vi và en): chữ cũ «căn chỉnh được» / «không căn chỉnh được» không có chiều, còn chữ mới chỉ nói chiều «góp vào mục tiêu khác», bỏ chiều «được mục tiêu khác góp vào». Dòng en `can-chinh-gioi-han` cho thấy mức giới hạn chặn cả hai chiều. Cần chủ kho xác nhận chiều «được góp vào» có thể bỏ, hoặc bản chữ mới nêu cả hai chiều, ghi ở mục «Bảng thay chữ» của design doc hoặc trong bang-chu.md.
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: minted-doi-nhan-khu-muc-tieu-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dnk_chup
  verified_at: 2026-10-19T12:36:21Z
  screenshot: evidence/E15-khung-gop-vao-1440.png
  observed: |
    1) E15-khung-gop-vao-1440.png: khung trượt phải mục tiêu «Giữ đà tăng trưởng bán lẻ miền Bắc», hàng thẻ KR 3 · Góp vào 1 · Vết · Trao đổi 1 · Diễn biến; thẻ KR đang chọn nhưng khối «GÓP VÀO ĐÂU» hiện ngay dưới «VÌ SAO LÚC NÀY», có mục tiêu cha «Trở thành đối tác logistics…» qua KR «Doanh thu hợp đồng mới đạt 48 tỷ đồng», nhãn «đổi theo Kara», «Căn cứ…», «Có số liệu»; bảng KR bên dưới. Không thấy «căn chỉnh», «Hỏi ý», «Toàn công ty».
    2) E15-khung-gop-vao-en-1440.png: cùng khung ở tiếng Anh: thẻ «Contributes to 1», «Changes», «Discussion 1», «History», tiêu đề khối «WHERE IT CONTRIBUTES», «through KR», «changed via Kara», «Backed by data»; nhãn thẻ không tràn hay cắt. Không thấy «Alignment». Nội dung người nhập vẫn tiếng Việt (đúng, không dịch).
    3) E15-gop-vao-trong-en-1440.png: mục tiêu «Mở đại lý cấp hai ở Cần Thơ» (Q4, công khai chờ duyệt), thẻ «Contributes to» đang chọn (gạch chân), trạng thái trống với biểu tượng liên kết, «Not contributing anywhere» và mô tả «Pick a published objective or KR one level up…»; nhãn thẻ và tiêu đề trống nằm một dòng, không tràn hay cắt. Không «Alignment».
    4) E15-theo-don-vi-1440.png: trang Mục tiêu, thẻ khu «Của tôi · Theo đơn vị · Toàn cảnh · Lấy ý kiến 3», ô chọn đơn vị đang mở, hàng gốc «OneHub Center — cả công ty · chưa đặt» có dấu tích, các đơn vị con «Thuộc OneHub Center · … mục tiêu». Không thấy «căn chỉnh», «Hỏi ý», «Toàn công ty». Một số tên đơn vị con bị cắt bằng dấu … trong ô chọn (ngoài phạm vi kỳ vọng).
    5) E15-do-phu-1440.png: mục «Độ phủ theo đơn vị» với bảng nhiệt theo ngày 13 đến 18 thg 10; hàng đầu là «OneHub Center» (đúng tên không gian làm việc), dưới là các khối và phòng ban; chú thích ô đậm nhạt. Không «căn chỉnh», «Hỏi ý», «Toàn công ty». Dải thẻ «Lấy ý kiến» ở đỉnh trang không nằm trong khung ảnh (đã cuộn), được xác nhận qua DOM.
  network_observed: n-a (driver)
  output: |
    Các dòng E15 đều DUNG: khung-gop-vao (thẻ «Góp vào», khối «Góp vào đâu», không cụm cấm), theo-don-vi (ô chọn gốc «OneHub Center», không cụm cấm), do-phu (thẻ khu «Lấy ý kiến», hàng gốc «OneHub Center» trong translate=no, không cụm cấm), en khung-gop-vao (thẻ «Contributes to», khối «Where it contributes», không cụm cấm), en gop-vao-trong (bấm thẻ «Contributes to»; «Not contributing anywhere»; nhãn thẻ rộng 81/81 một dòng; tiêu đề trạng thái trống rộng 174/174 một dòng); «DUNG du 5 anh (5)».
    Ảnh đã lưu: evidence/E15-khung-gop-vao-1440.png, E15-theo-don-vi-1440.png, E15-do-phu-1440.png, E15-khung-gop-vao-en-1440.png, E15-gop-vao-trong-en-1440.png.
    Ghi chú: ảnh E15-do-phu-1440 đã cuộn xuống bảng độ phủ nên dải thẻ «Lấy ý kiến» không nằm trong khung ảnh; sự có mặt của thẻ được xác nhận bằng dòng DOM «DUNG E15 do-phu: the khu «Lấy ý kiến»». Driver là script chụp, không có công cụ đọc network nên không có E15-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bun run lint:slop
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

- cmd: bunx turbo run build --force
  run_id: minted-doi-nhan-khu-muc-tieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T12:36:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh harness chứ không phải feature):
- E11: `cd apps/app && bun test ./test/messages-guard.spec.ts && for f in okr-cua-toi-ba-phan okr-sheet okr-tai-co-cau okr-gioi-han-duyet duong-ly-do okr-so-do-don-vi okr-theo-don-vi okr-hoi-y okr-thanh-tab okr-trang-don-vi; do TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/$f.dom.tsx || exit 1; done` — baseline green. Đây là bài hồi quy giữ các bài cũ xanh sau khi đổi chữ (regression-guard có chủ ý theo AC-7), không đo hành vi mới.

Baseline khong do:
- cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-gop-vao: bo qua baseline: tep apps/app/test/doi-nhan-khu-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/doi-nhan-khu-muc-tieu.dom.tsx -t dnk-goc-man: bo qua baseline: tep apps/app/test/doi-nhan-khu-muc-tieu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-goc: bo qua baseline: tep apps/app/test/doi-nhan-khu-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-lay-y-kien: bo qua baseline: tep apps/app/test/doi-nhan-khu-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/doi-nhan-khu-muc-tieu.spec.ts -t dnk-luat: bo qua baseline: tep apps/app/test/doi-nhan-khu-muc-tieu.spec.ts co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/kiem-ke.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/proto.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/proto.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/khong-go-bai.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/khong-go-bai.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/thuoc-da-ky.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/thuoc-da-ky.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doi-nhan-khu-muc-tieu/rang/bang-chu.mjs: bo qua baseline: tep _acceptance/doi-nhan-khu-muc-tieu/rang/bang-chu.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh, nhưng hội đồng judge của E14 đề xuất không đạt (hai trong ba lăng kính) và review nêu năm phát hiện trong hợp đồng (bài đối chứng git show hỏng trên checkout nông của CI; hai phép đo E15 và E3 chưa chứng được vế tên gốc; đối chứng phạm vi giữ của E4 quá lỏng). Trả về triển khai.
