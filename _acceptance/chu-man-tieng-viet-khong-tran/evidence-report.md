---
schema_version: 2
feature_slug: chu-man-tieng-viet-khong-tran
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c39024d1dd4bc4997b22818a1abd77f89abf114b
human_signoff:
---

# Evidence Report: chu-man-tieng-viet-khong-tran

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E5m | AC-5 | script | PASS |
| E5j | AC-5 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-chu-man-tieng-viet-khong-tran-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmt_breadcrumb
  verified_at: 2026-10-13T23:51:19Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/breadcrumb-nhan.dom.tsx
    Ran 6 tests across 1 file. [581.00ms]

- eval: E2
  run_id: minted-chu-man-tieng-viet-khong-tran-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmt_quet
  verified_at: 2026-10-13T23:51:19Z
  output: |
    cd apps/app && bun test ./test/chu-man-tieng-viet.spec.ts
    Ran 4 tests across 1 file. [348.00ms]

- eval: E3
  run_id: minted-chu-man-tieng-viet-khong-tran-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmt_nhan_kieu
  verified_at: 2026-10-13T23:51:19Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/chu-man-tieng-viet.dom.tsx -t nhan-kieu
    Ran 4 tests across 1 file. [960.00ms]

- eval: E4
  run_id: minted-chu-man-tieng-viet-khong-tran-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cmt_o_chon
  verified_at: 2026-10-13T23:51:19Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/chu-man-tieng-viet.dom.tsx -t o-chon
    Ran 3 tests across 1 file. [856.00ms]

- eval: E5m
  run_id: minted-chu-man-tieng-viet-khong-tran-E5m-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.cmt_man_do
  verified_at: 2026-10-13T23:51:19Z
  output: |
    bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs --chi-do"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-chu-man-tieng-viet-khong-tran-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cmt_man
  verified_at: 2026-10-13T23:51:19Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/chu-man-tieng-viet-khong-tran/evidence/cmt-truong-vi-360.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) cmt-truong-vi-360.png (360x844): trang Cài đặt > Trường, thẻ Cá nhân, danh sách «Trường tự tạo». Mỗi hàng là «Trường mẫu N» kèm nhãn kiểu «Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, URL, Email, Số điện thoại» nằm trọn trong ô, mép phải các ô thẳng hàng (riêng ô rộng hơn như «Số điện thoại» vẫn kết thúc cùng mép phải), nút ba chấm bên phải không bị đè, không thấy thanh cuộn ngang. Hàng tên dài nằm dưới vùng chụp 844 px nên không hiện trong ảnh này; số đo tenDaiCat=true. (2) cmt-truong-vi-1280.png: khung 1280, cùng danh sách; mười nhãn kiểu «Chữ… Người» trọn chữ, mép phải thẳng một đường; hàng cuối tên rất dài («Ngày gia hạn hợp đồng khung … đầu m…») bị cắt bằng dấu chấm lửng còn nhãn «Số điện thoại» cùng hàng đủ chữ. Biểu tượng nổi góc phải dưới đè lên nút ba chấm của hàng cuối là phần công cụ dev, không phải lỗi nhãn kiểu. (3) cmt-truong-en-360.png: bản tiếng Anh «Fields», nhãn «Text, Long text, Number, Date, Checkbox, Select, URL, Email, Phone» trọn chữ trong ô, mép phải thẳng, không cuộn ngang. (4) cmt-truong-en-1280.png: mười nhãn «Text … User» trọn chữ, mép phải thẳng; hàng cuối tên dài bị cắt «…đầu mối nhận…» còn nhãn «Phone» đủ chữ. Khớp Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bun run lint:slop
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

- cmd: bunx turbo run build --force
  run_id: minted-chu-man-tieng-viet-khong-tran-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T23:51:19Z

### Phán đoán (judgment)

Đề xuất panel gồm ba judge (fresh context): domain-correctness, operational-feasibility, spec-alignment. Cả ba cùng UNCERTAIN; ý (1), (2), (4) của E5j đạt trên ảnh, riêng ý (3) (tên trường dài bị cắt trong khi nhãn kiểu trọn chữ ở khổ 360) không chứng minh được vì ảnh 360 dừng trước hàng tên dài.

- eval: E5j
  judged_by: judge-panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Ý (1), (2) và (4) đạt: ở cả bốn ảnh nhãn kiểu trọn chữ và không đè lên nút «⋮» (ở ảnh 360 hàng 9 và ở hàng cuối các ảnh 1280 nút «⋮» chỉ bị nút nổi của công cụ dev che). Ở 1280 mép phải mọi ô đều khoảng x≈1202. Tên ngắn khớp bảng ở design doc và AC-3. Ý (3) không kiểm được: hai ảnh 360 chỉ chụp tới hàng 10, hàng tên dài (từ 60 ký tự) nằm ngoài khung ảnh, và các tên trong ảnh 360 đều ngắn, không bị cắt. Việc tên trường bị cắt trước nhãn kiểu chỉ thấy ở ảnh 1280, không phải ở 360 như câu hỏi nêu.
    - operational-feasibility: UNCERTAIN — Ý (1), (2), (4) đạt trên ảnh. Ở 1280 nhãn trọn trong ô và mép phải thẳng ở x≈1202 cho cả vi lẫn en. Mười tên ngắn khớp bảng thiết kế và AC-3, kể cả hàng «Số điện thoại» và hàng tên dài. Ý (3) không chứng minh được vì hai ảnh 360 cắt ở hàng 9 và hàng tên dài (từ 60 ký tự) không có trong khung, nên không thấy tên trường bị cắt trước nhãn kiểu ở 360. Ngoài ra ở 360 vi, ô «Số điện thoại» nhìn như lấn sang phải hơn các ô khác, và nút «⋮» của hàng cuối bị biểu tượng nổi che, nên không loại được nghi vấn bằng mắt.
    - spec-alignment: UNCERTAIN — Ý (1), (2), (4) đạt: ở cả bốn ảnh nhãn kiểu trọn chữ, nằm trong ô, không đè nút «⋮». Ở 1280 mép phải mọi ô đều ở x≈1202, ở 360 đều ở x≈290. Tên ngắn khớp bảng AC-3: Chữ, Chữ dài, Số, Ngày, Ô đánh dấu, Chọn, URL, Email, Số điện thoại, Người; Text, Long text, Number, Date, Checkbox, Select, URL, Email, Phone, User. Ý (3) chưa có bằng chứng: hai ảnh 360 chỉ chụp vùng nhìn thấy, dừng ở «Trường mẫu 9» và hàng 10 bị cắt đáy. Hàng tên dài (≥60 ký tự) của AC-5 chỉ lộ ở 1280, nên chưa thấy ở 360 tên bị cắt trước nhãn kiểu. Ở 360 các tên ngắn đều vừa, kể cả hàng «Số điện thoại» là nhãn rộng nhất.
  required_evidence:
    - (domain-correctness) Ảnh Cài đặt › Trường ở khổ 360 bản vi và en, chụp toàn trang (fullPage) hoặc cuộn tới hàng thứ 11 «Ngày gia hạn hợp đồng khung…» (tên từ 60 ký tự, kiểu Số điện thoại / Phone), cho thấy tên có dấu «…» cắt trong khi nhãn «Số điện thoại» / «Phone» trọn chữ. Sinh bằng bàn đo màn của hồ sơ chu-man-tieng-viet-khong-tran (cùng phiên đo đã chụp cmt-truong-vi-360.png và cmt-truong-en-360.png), lưu cạnh các ảnh hiện có ở _acceptance/chu-man-tieng-viet-khong-tran/evidence/.
    - (operational-feasibility) Ảnh chụp toàn trang hoặc cuộn xuống đủ hàng, ở 360, bản vi và bản en. Ảnh phải có hàng tên dài (từ 60 ký tự, đang là «Ngày gia hạn hợp đồng khung…») với tên bị cắt bằng dấu «…» và nhãn «Số điện thoại» / «Phone» trọn chữ cùng hàng. Lấy từ bàn đo màn của phiên đo (cùng cách sinh ra cmt-truong-vi-360.png và cmt-truong-en-360.png) rồi lưu cạnh các ảnh hiện có ở _acceptance/chu-man-tieng-viet-khong-tran/evidence/.
    - (operational-feasibility) Ảnh 360 không bị biểu tượng nổi ở góc dưới phải che nút «⋮» của hàng cuối, để thấy nhãn kiểu không đè lên nút bên phải ở mọi hàng. Chụp lại với lớp phủ công cụ dev ẩn, hoặc cuộn sao cho hàng cuối nằm ngoài vùng biểu tượng.
    - (spec-alignment) Ảnh chụp toàn trang (fullPage) hoặc cuộn tới cuối Cài đặt › Trường ở khổ 360, tiếng Việt, thấy hàng tên dài (≥60 ký tự, kiểu «Số điện thoại») với tên bị cắt bằng dấu «…» và nhãn kiểu cùng hàng trọn chữ, không đè nút «…». Lấy từ bàn đo màn của chu-man-tieng-viet-khong-tran, lưu cạnh _acceptance/chu-man-tieng-viet-khong-tran/evidence/cmt-truong-vi-360.png.
    - (spec-alignment) Ảnh tương ứng cho tiếng Anh ở 360 (hàng tên dài với nhãn «Phone» trọn chữ), cạnh cmt-truong-en-360.png. Nếu có số đo scrollWidth > clientWidth của nhãn tên dài ở 360 trong log phép đo thì cũng đủ làm đổi verdict.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/breadcrumb-nhan.dom.tsx: bo qua baseline: tep packages/ui/test/breadcrumb-nhan.dom.tsx co o cay dang kiem nhung chua co o merge-base 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/chu-man-tieng-viet.spec.ts: bo qua baseline: tep apps/app/test/chu-man-tieng-viet.spec.ts co o cay dang kiem nhung chua co o merge-base 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/chu-man-tieng-viet.dom.tsx -t nhan-kieu: bo qua baseline: tep apps/app/test/chu-man-tieng-viet.dom.tsx co o cay dang kiem nhung chua co o merge-base 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/chu-man-tieng-viet.dom.tsx -t o-chon: bo qua baseline: tep apps/app/test/chu-man-tieng-viet.dom.tsx co o cay dang kiem nhung chua co o merge-base 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1 — eval moi, chay tren code cu khong phan biet gi

Ghi chú: eval E5 (ui-check) cũng mang baseline n-a nhưng kết quả máy không kèm lý do.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5, E5m đạt; E5j UNCERTAIN ở cả ba judge vì ảnh khổ 360 không chứa hàng tên dài nên chưa chứng minh được tên bị cắt trước nhãn kiểu. Verdict PENDING-JUDGMENT, chờ người quyết ở Cổng 2.
