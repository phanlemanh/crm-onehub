---
schema_version: 2
feature_slug: kara-mot-ten
verdict: REJECT
failed_evals: ["E14"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 153171e652f2ccc229a6f7ad1cd024e754338c3c
human_signoff:
---

# Evidence Report: kara-mot-ten

Round 1. Kết luận máy: REJECT, một eval hỏng là E14 (ảnh chụp không chứng minh được điều «expected» hứa). Eval judgment E13 có đề xuất của hội đồng chấm là FAIL, để trống `human_override` cho người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-9 | script | PASS |
| E15 | AC-7 | script | PASS |
| E16 | AC-1 | script | PASS |
| E13 | AC-1 | judgment | đề xuất FAIL của hội đồng chấm, chờ người (human_override trống) |
| E14 | AC-4 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: minted-kara-mot-ten-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_ban_ghi
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-ban-ghi
    Ran 1 test across 1 file. [1058.00ms]

- eval: E2
  run_id: minted-kara-mot-ten-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_tom_tat
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-tom-tat
    Ran 1 test across 1 file. [993.00ms]

- eval: E2b
  run_id: minted-kara-mot-ten-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_tin_nhac
  verified_at: 2026-10-13T10:18:35Z
  output: |
    bun run test -- "cd apps/agent && bun test test/kara-mot-ten.spec.ts -t kmt-tin-nhac"
    test-run: dropped crm_mv6j3vnqd8mq_test

- eval: E3
  run_id: minted-kara-mot-ten-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_soan
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-soan
    Ran 1 test across 1 file. [1114.00ms]

- eval: E4
  run_id: minted-kara-mot-ten-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_cai_dat
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-cai-dat
    Ran 1 test across 1 file. [1158.00ms]

- eval: E5
  run_id: minted-kara-mot-ten-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_tai_lieu
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-tai-lieu
    Ran 1 test across 1 file. [1225.00ms]

- eval: E6
  run_id: minted-kara-mot-ten-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kmt_dung_chung
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/messages-guard.spec.ts -t kmt-dung-chung
    Ran 1 test across 1 file. [1.56s]

- eval: E7
  run_id: minted-kara-mot-ten-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_luat
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat
    Ran 4 tests across 1 file. [326.00ms]

- eval: E8
  run_id: minted-kara-mot-ten-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_dot_bien
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/dot-bien.mjs
    dot-bien: 7/7 cap dat

- eval: E9
  run_id: minted-kara-mot-ten-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_giu
  verified_at: 2026-10-13T10:18:35Z
  output: |
    cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-giu
    Ran 2 tests across 1 file. [187.00ms]

- eval: E10
  run_id: minted-kara-mot-ten-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_bai_cu_app
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/bai-cu.mjs --app
    bai-cu --app: 28 bai, 0 cho do

- eval: E11
  run_id: minted-kara-mot-ten-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmt_bai_cu_may
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/bai-cu.mjs --may
    (lệnh không in dòng tóm tắt; kết thúc thành công)

- eval: E12
  run_id: minted-kara-mot-ten-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_khong_go_bai
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/khong-go-bai.mjs
    khong-go-bai: 18 tep doi, 0 vi pham

- eval: E15
  run_id: minted-kara-mot-ten-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_kiem_ke
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/kiem-ke.mjs
    kiem-ke: 133 muc, 118 doi, goc khop

- eval: E16
  run_id: minted-kara-mot-ten-E16-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmt_bang_chu
  verified_at: 2026-10-13T10:18:35Z
  output: |
    node _acceptance/kara-mot-ten/rang/bang-chu.mjs
    bang-chu: 186 dong

- eval: E14
  run_id: minted-kara-mot-ten-E14-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.kmt_chup
  verified_at: 2026-10-13T10:18:35Z
  screenshot: evidence/E14-cai-dat-okr-1440.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) E14-cai-dat-okr-1440.png: trang «Chương trình OKR» (khu Cài đặt, mục Chương trình OKR được chọn). Hiện Chu kỳ, Cấu hình (trần mục tiêu, trần KR, thang chấm, công tắc), Mẫu OKR. Trong khung chụp không thấy thẻ tiêu đề «Kara · OKR» và không thấy nút «Bật Kara»; cũng không thấy khối sổ chi phí với nhãn nhóm «Kara · OKR», «Kara · hồ sơ», «Tác nhân». Ảnh chỉ là viewport, phần dưới có thể nằm ngoài khung, nhưng ảnh không chứng minh được điều Expected yêu cầu. (2) E14-cai-dat-okr-390.png: cùng trang ở 390, cũng chỉ thấy Chu kỳ và Cấu hình, không thấy «Kara · OKR» hay «Bật Kara»; không tràn ngang. (3) E14-soan-okr-1440.png: toàn màn đen với chữ «404 | This page could not be found.» Đây KHÔNG phải khung Soạn OKR; route /<slug>/okr/soan trả 404, mâu thuẫn Expected («đúng màn đó, không phải màn lỗi»). Dòng «E14 soan-okr: khong cum cam []» đạt vì trang 404 không có chữ nào, nên đạt rỗng. (4) E14-tab-kara-1440.png: khung bản ghi công ty Monzo, tab «Kara» đang mở, tiêu đề «Hỏi Kara về công ty này», nút «Nhờ Kara tra cứu», ô nhập. Đúng màn, mọi chỗ gọi AI đều là «Kara», không thấy «Trợ lý». (5) E14-tai-lieu-1440.png: trang «Tài liệu», trạng thái rỗng «Chưa có trang nào», các thẻ Trang/Chờ duyệt/Nguồn/Sức khoẻ/Hỏi; đúng màn, không có cụm cấm.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy nguyên văn qua tien-de.mjs --chay "bun _acceptance/kara-mot-ten/rang/chup.mjs": lệnh thoát 0, dòng "KET LUAN: 13 DUNG, 0 SAI", không dòng KHONG DO DUOC. Phiên đo: kho crm_nice_payne_f3b589_do, app :4656, api :4813; đã dọn tiền đề sau khi chạy. Log: .acceptance-runs/kara-mot-ten/log-e14.log. 13 dòng E14 đều DUNG (1440 và 390: tiêu đề «Kara · OKR», nút «Bật Kara», số chi phí gọi Kara · OKR, không cụm cấm, tràn ngang 0px; soan-okr, tai-lieu, tab-kara không cụm cấm).
    Ảnh đã lưu: E14-cai-dat-okr-1440.png, E14-cai-dat-okr-390.png, E14-soan-okr-1440.png, E14-tab-kara-1440.png, E14-tai-lieu-1440.png (thư mục _acceptance/kara-mot-ten/evidence/).
    KẾT LUẬN FAIL do đối chiếu ảnh với Expected: (a) E14-soan-okr-1440.png là trang 404, không phải khung Soạn OKR (chup.mjs gọi /<slug>/okr/soan; thư mục route apps/app/app/(app)/[slug]/okr/soan tồn tại nhưng trả 404 trong phiên đo, có thể do thiếu cuộc soạn hoặc cờ tính năng); assertion «không cụm cấm» đạt rỗng giả. (b) Ảnh Cài đặt › OKR ở 1440 và 390 không cho thấy thẻ «Kara · OKR», nút «Bật Kara», khối sổ chi phí và nhóm «Kara · hồ sơ»/«Tác nhân», dù dòng log báo DUNG (có thể nằm dưới nếp gập, ảnh không chứng minh được). Không có tool đọc network nên network_observed = n-a (driver); không tạo E14-network.txt. Không sửa code.
    Ghi chú: lệnh ui-check:E14 là lệnh gắn với eval E14, không phải lệnh hỏng không gắn eval.

### Judgment

- eval: E13
  judged_by: hội đồng 3 lens (fresh context), đề xuất của máy: FAIL
  panel: domain-correctness, operational-feasibility, spec-alignment
  votes:
    - domain-correctness: FAIL — Bảng chữ đạt tiêu chí 1 và 2: mọi dòng gọi AI là «Kara», và «trợ lý phụ» vẫn còn ý trợ tác. Nhưng sáu dòng dùng «Kara · OKR» ngay trong câu (toast, câu trạng thái, câu lỗi, mô tả, nhãn đo). Đó là dạng ghép cứng, và design doc chỉ cho dạng này ở tên trang, tên nhóm, tiêu đề; trong câu phải là «Kara».
    - operational-feasibility: FAIL — Bảng chữ có sáu dòng dùng dạng «Kara · OKR» ngay trong câu hoặc nhãn trạng thái, trái tiêu chí 4 (chỉ dùng ở tên trang, tên nhóm, tiêu đề) và đọc cứng theo tiêu chí 3. Các dòng còn lại gọi AI bằng một tên Kara và giữ đúng nghĩa; «trợ lý phụ» vẫn còn ý «trợ tác».
    - spec-alignment: FAIL — Phần lớn dòng đạt: một tên «Kara», giữ nghĩa, «trợ lý phụ» thành «trợ tác». Nhưng một số dòng đặt «Kara · OKR» vào giữa câu hay nhãn dạng câu. Bảng thay chữ của design doc chỉ cho dạng đó ở tên trang, tên nhóm và tiêu đề, còn trong câu thì phải là «Kara» trần.
  required_evidence:
    - domain-correctness: dòng apps/app/lib/messages/tro-ly-okr.ts#troLy.daLuu (vi «Đã lưu Kara · OKR.», en «Kara · OKR saved.»), là câu toast, bang-chu.md dòng 134-135; nếu bảng ghi «Đã lưu Kara.» / «Kara saved.» thì đạt.
    - domain-correctness: dòng tro-ly-okr.ts#so.thanh (vi «Kara · OKR đã dùng trên trần tháng», en «Kara · OKR spend against the monthly cap»), dạng ghép cứng, bang-chu.md dòng 153-154; nếu bảng ghi «Kara đã dùng trên trần tháng» / «Kara spend against the monthly cap» thì đạt.
    - domain-correctness: dòng tro-ly-okr.ts#so.rongMoTa (vi «Trần của Kara · OKR: X.», en «Kara · OKR cap: X.»), câu mô tả, bang-chu.md dòng 159-160; nếu bảng ghi «Trần của Kara: X.» / «Kara cap: X.», hoặc design doc cho phép nhắc tên nhóm trong câu, thì đạt.
    - domain-correctness: dòng tro-ly-okr.ts#troLy.sanSang.sanSangNguon.khoa-rieng (vi «Sẵn sàng · khoá riêng của Kara · OKR», en «Ready · own key for Kara · OKR»), hai dấu «·» liền nhau đọc không tự nhiên, bang-chu.md dòng 149-150; nếu bảng ghi «Sẵn sàng · khoá riêng của Kara» / «Ready · Kara's own key» thì đạt.
    - domain-correctness: dòng apps/api/src/okr/okr-config.ts#chuaCoKhoaMoHinh («Chưa có khoá model cho Kara · OKR.»), câu báo lỗi, bang-chu.md dòng 169; nếu bảng ghi «Chưa có khoá model cho Kara.» thì đạt.
    - domain-correctness: dòng apps/app/lib/messages/kara-ban-ghi.ts#tab.buoc.okr-chi-tro-ly en («Kept the OKR session to Kara · OKR»), câu mô tả bước, bang-chu.md dòng 26; nếu bảng ghi «Kept the OKR session to Kara» thì đạt.
    - domain-correctness: dòng apps/app/lib/messages/tai-lieu.ts#hoi.nhanTraLoi («Kara · theo bản đang dùng», en «Kara · from the version in use») chỉ là nghi vấn, không tính vào FAIL; bang-chu.md dòng 118-119; cần design doc nói rõ nhãn dưới câu trả lời có thuộc dạng «tiêu đề» hay không.
    - operational-feasibility: tro-ly-okr.ts#troLy.daLuu cần chữ viết thành câu, ví dụ «Đã lưu cài đặt Kara.» và «Kara settings saved.», in lại trong _acceptance/kara-mot-ten/evidence/bang-chu.md.
    - operational-feasibility: tro-ly-okr.ts#so.thanh cần chữ đọc tự nhiên như «Kara đã dùng … trên trần tháng» (vi) và «Kara's spend against the monthly cap» (en).
    - operational-feasibility: tro-ly-okr.ts#so.rongMoTa cần chữ không chèn dấu «·» giữa câu, ví dụ «Trần của Kara: X.» và «Kara's cap: X.».
    - operational-feasibility: apps/api/src/okr/okr-config.ts#chuaCoKhoaMoHinh cần đổi thành «Chưa có khoá model cho Kara.» hoặc câu tương đương.
    - operational-feasibility: kara-ban-ghi.ts#tab.buoc.okr-chi-tro-ly (en «Kept the OKR session to Kara · OKR») cần câu tự nhiên như «Kept the OKR session to Kara», hoặc xác nhận đây là nhãn riêng chứ không nằm trong câu.
    - operational-feasibility: tro-ly-okr.ts#troLy.sanSang.sanSangNguon.khoa-rieng có hai dấu «·» trong một nhãn trạng thái, cần chữ không lặp dấu phân cách, ví dụ «Sẵn sàng · khoá riêng của Kara».
    - operational-feasibility: nếu chủ kho xác nhận bằng văn bản (design doc hoặc docs/ai-ux.md) rằng dạng «Kara · OKR» trong câu và nhãn trạng thái được phép, thì sáu dòng trên không còn là vi phạm và đề xuất đổi.
    - spec-alignment: kara-ban-ghi.ts#tab.buoc.okr-chi-tro-ly (en) dòng 26 «Kept the OKR session to Kara · OKR», câu giữa dòng; đổi thành «Kara» trần hoặc câu gợi tên phần không ghép «·», rồi cập nhật bang-chu.md.
    - spec-alignment: tro-ly-okr.ts#troLy.daLuu dòng 134-135 «Đã lưu Kara · OKR.» / «Kara · OKR saved.», thông báo dạng câu; cần chữ mới theo bảng thay chữ, rồi chụp lại bang-chu.md.
    - spec-alignment: tro-ly-okr.ts#troLy.sanSang.sanSangNguon.khoa-rieng dòng 149-150 «Sẵn sàng · khoá riêng của Kara · OKR» / «Ready · own key for Kara · OKR», ghép «Kara · OKR» trong câu lại có thêm dấu «·» phân cách trạng thái; cần chữ mới không ghép cứng.
    - spec-alignment: tro-ly-okr.ts#so.thanh dòng 153-154 «Kara · OKR đã dùng trên trần tháng» / «Kara · OKR spend against the monthly cap»; nếu là tiêu đề nhóm thì cần bằng chứng chỗ hiển thị (ảnh E14 hoặc đoạn mã chỗ dùng khoá) để đổi đề xuất.
    - spec-alignment: tro-ly-okr.ts#so.rongMoTa dòng 159-160 «Trần của Kara · OKR: X.» / «Kara · OKR cap: X.», câu mô tả; đúng bảng thay chữ là «Kara» trần hoặc diễn đạt lại, cần chữ mới và bang-chu.md cập nhật.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-kara-mot-ten-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-kara-mot-ten-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bun run lint:slop
  run_id: minted-kara-mot-ten-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

- cmd: bunx turbo run build --force
  run_id: minted-kara-mot-ten-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T10:18:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đo được baseline đều red trên baseline (có phân biệt); các eval không đo được baseline (n-a) liệt kê dưới đây, không phải eval không phân biệt.

Baseline khong do:
- bun run test -- "cd apps/agent && bun test test/kara-mot-ten.spec.ts -t kmt-tin-nhac": bo qua baseline: tep apps/agent/test/kara-mot-ten.spec.ts co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-luat: bo qua baseline: tep apps/app/test/kara-mot-ten.spec.ts co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/kara-mot-ten.spec.ts -t kmt-giu: bo qua baseline: tep apps/app/test/kara-mot-ten.spec.ts co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bai-cu.mjs --app: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bai-cu.mjs --may: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/khong-go-bai.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/khong-go-bai.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/kiem-ke.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/kiem-ke.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/kara-mot-ten/rang/bang-chu.mjs: bo qua baseline: tep _acceptance/kara-mot-ten/rang/bang-chu.mjs co o cay dang kiem nhung chua co o merge-base b4e7258604c8d6839296c4e60db398294e8ce094 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định).

## Iterations

Round 1: E14 hỏng — ảnh chụp không chứng minh được «expected»: ảnh soan-okr là trang 404 (không phải màn Soạn OKR), ảnh Cài đặt › OKR ở 1440 và 390 không cho thấy thẻ «Kara · OKR» và nút «Bật Kara» trong khung chụp, dù dòng log của phép đo báo đạt. E13 (judgment) có đề xuất FAIL của hội đồng chấm về sáu dòng dùng «Kara · OKR» ghép giữa câu, chờ người quyết ở Cổng 2. Trả về bước triển khai.
