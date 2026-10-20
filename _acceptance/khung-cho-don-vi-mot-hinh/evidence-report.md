---
schema_version: 2
feature_slug: khung-cho-don-vi-mot-hinh
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2338bd484502f1369e92b934c15a02b72e531c55
human_signoff:
---

# Evidence Report: khung-cho-don-vi-mot-hinh

Verdict tổng REJECT. Cả chín eval của hợp đồng đạt, nhưng một lệnh suite hồi quy không gắn eval nào cho kết quả không đạt: `bun run test -- --filter=app --filter=@crm/ui` (xem mục «Lệnh suite (hồi quy)» và Iterations). Danh sách `failed_evals` để trống vì lệnh này không thuộc eval nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-1, AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-cho-don-vi-mot-hinh-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-khung-cho-don-vi-mot-hinh-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-khung-cho-don-vi-mot-hinh-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    phien-do: xong — mã 0

- eval: E4
  run_id: minted-khung-cho-don-vi-mot-hinh-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-cho-don-vi-mot-hinh/rang/man-khung-cho.mjs"
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-khung-cho-don-vi-mot-hinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_cau_truc
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-cau-truc
    Ran 3 tests across 1 file. [1108.00ms]

- eval: E6
  run_id: minted-khung-cho-don-vi-mot-hinh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kmc_xuong
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx
    Ran 24 tests across 1 file. [519.00ms]

- eval: E7
  run_id: minted-khung-cho-don-vi-mot-hinh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_trang_khac
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: node _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs
    AC-6: 9 trang dung bang · bang-hai-dong o [slug]/okr/theo-don-vi

- eval: E8
  run_id: minted-khung-cho-don-vi-mot-hinh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_a11y
  verified_at: 2026-10-20T12:46:44Z
  output: |
    lệnh: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-a11y
    Ran 4 tests across 1 file. [766.00ms]

- eval: E9
  run_id: minted-khung-cho-don-vi-mot-hinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  screenshot: evidence/E9-khung-1440.png
  observed: |
    Đã mở bằng Read từng ảnh.
    1) E9-khung-1440.png: tiêu đề «Mục tiêu» + câu mô tả thật; bên phải có nút Kara «Hỏi Kara» thật cùng hai thanh xương (kỳ, nút thêm). Dưới tiêu đề: một thanh xương dài thay hàng thẻ con. Hàng công cụ xương y≈220-248: ba thanh trái (ô chọn đơn vị, nhóm nút xem, chip lọc) và ba thanh phải (Lọc, Sắp xếp, Cột). Thân bảng: khung bo góc, đầu bảng xương y≈261-305, năm dòng hai tầng cao 65 (tầng trên: thanh dài + hai nhãn; tầng dưới: thanh ngắn; bên phải ba thanh tiến độ/tình trạng/phụ trách). Không vòng quay, không vạch tràn ngang.
    2) E9-bang-1440.png: cùng khổ, bảng đã dựng: tiêu đề «Mục tiêu», Kara, ô «Quý 4 · mẫu», nút «Thêm mục tiêu»; thẻ con Của tôi · Theo đơn vị · Toàn cảnh · Lấy ý kiến; hàng công cụ thật cũng ở y≈220-248 (ô chọn «Pháp chế», Danh sách, Sơ đồ góp vào, Họp tuần, Tất cả 3, Cần bàn 0, Chưa góp vào đâu 1; Lọc, Sắp xếp, Cột (4)); đầu bảng y≈261-305 (Mục tiêu, Tiến độ, Tình trạng, Phụ trách); ba dòng mục tiêu hai tầng cao 65 (tiêu đề + nhãn Cam kết/Đã công bố, dưới là «2 KR · góp vào 1 chỗ»). Đặt cạnh khung 1440: hàng công cụ, đầu bảng và các dòng hai tầng trùng chỗ và trùng chiều cao (khớp «lệch 0»). Khác biệt duy nhất: bảng thật 3 dòng, khung 5 dòng; chân trang thống kê chỉ có ở bảng.
    3) E9-khung-390.png: ảnh 390 rộng, một cột; tiêu đề + mô tả hai dòng, «Hỏi Kara» thật và thanh xương, thanh xương nút thêm, thanh thẻ con, ba thanh xương xếp dọc cho hàng công cụ (ô chọn, ô chọn nhỏ, Lọc), rồi thân bảng với đầu bảng xương và dòng hai tầng xương (tầng trên thanh dài + hai nhãn, giữa thanh ngắn, dưới thanh dài toàn bề rộng). Mọi vạch nằm trong lề 16px, không tràn ngang.
    4) E9-bang-390.png: cùng khổ, bảng đã dựng: tiêu đề, mô tả, Hỏi Kara, «Quý 4 · mẫu», «···», nút «Thêm mục tiêu» xuống dòng; thẻ con; ô chọn «Pháp chế», ô chọn nhỏ, «Lọc» xếp dọc đúng ba vị trí của ba thanh xương; đầu bảng «Mục tiêu»; dòng thật hai/ba tầng (tiêu đề, nhãn, «2 KR · góp vào 1 chỗ · An Khánh Linh», «Tính từ 2 KR» + thanh tiến độ, trạng thái). Không tràn ngang. Dòng thật 149-165 (dòng thứ hai 165 vì tiêu đề xuống hai dòng), khung 149: lệch chiều cao dòng có thật nhưng nhỏ và thước khai báo dòng 149 là khớp đúng với dòng đầu; vị trí hàng công cụ và đầu bảng lệch 0.
    5) E9-doi-don-1440.png: lúc thân bảng còn là khung (5 dòng xương, đầu bảng xương) nhưng hàng công cụ đã thật: ô chọn đơn vị thật «Kinh doanh miền Bắc» (đã đổi đơn vị từ Pháp chế), nhãn «Danh sách», «Sơ đồ góp vào», «Họp tuần» thật, kèm một thanh xương cho phần chip chưa có số, ba thanh xương cho Lọc/Sắp xếp/Cột; thẻ con thật, «Quý 4 · mẫu» thật, nút «Thêm mục tiêu» còn là thanh xương. Đỉnh ô chọn lệch 0 so với khung. Khớp Expected: ảnh đổi đơn vị có ô chọn đơn vị thật trên khung.
    Kết luận đối chiếu: không có mâu thuẫn với Expected; khung đặt cạnh bảng cùng khổ khớp ở hàng công cụ, đầu bảng, dòng hai tầng; 390 không tràn ngang; ảnh đổi đơn vị có ô chọn thật.
  network_observed: n-a (driver)
  output: |
    Kích thước ảnh: khung-1440, bang-1440, doi-don-1440 đều 1440x900; khung-390 và bang-390 đều 390x844. Năm ảnh có mặt trong evidence/ (ghi lại lúc 19:48-19:49 của lượt chạy này).
    Frame đã lưu: E9-khung-1440.png, E9-bang-1440.png, E9-khung-390.png, E9-bang-390.png, E9-doi-don-1440.png (thư mục _acceptance/khung-cho-don-vi-mot-hinh/evidence/).
    Dùng thước của kho (script Playwright), không dùng capture.ui riêng. E9-khung-390.png đổi so với bản đã commit (17408 sang 14517 byte), nội dung khung vẫn đúng; ba ảnh kia giữ nguyên số byte. Không commit.
    Network: driver là script chạy trình duyệt trong phiên đo, không có công cụ đọc network; log không có dòng error, failed hay 5xx; ghi n-a (driver), không viết E9-network.txt.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-20T12:46:44Z
  note: lệnh này không gắn eval nào và là lý do verdict tổng là REJECT; hai ca không đạt nằm ở apps/app/test/khung-man-chung.spec.ts
  output: |
    app:test: 2 tests failed:
    app:test: (fail) hinh-theo-man > bang hinh bang dung tap tep goc va moi tep dung hinh [58.14ms]
    app:test: (fail) checkout-nong > thieu commit goc: bo phep so, chi mot dong ghi chu [20.41ms]
    app:test:  923 pass
    app:test:  2 fail
    app:test: Ran 925 tests across 93 files. [7.92s]
    Failed: app#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

- cmd: bun run lint:slop
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-20T12:46:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), chứng minh harness chứ không chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- E6 (`cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx`): baseline green.

Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-cau-truc: bo qua baseline: tep apps/app/test/khung-cho-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base fb58ef9726823ff78ba5bb9fc11102c99febbd05 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs: bo qua baseline: tep _acceptance/khung-cho-don-vi-mot-hinh/rang/trang-khac.mjs co o cay dang kiem nhung chua co o merge-base fb58ef9726823ff78ba5bb9fc11102c99febbd05 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-cho-don-vi.dom.tsx -t kcd-a11y: bo qua baseline: tep apps/app/test/khung-cho-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base fb58ef9726823ff78ba5bb9fc11102c99febbd05 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào của hợp đồng đạt thiếu, nhưng lệnh suite `bun run test -- --filter=app --filter=@crm/ui` (không gắn eval) cho hai ca không đạt trong apps/app/test/khung-man-chung.spec.ts: `hinh-theo-man > bang hinh bang dung tap tep goc va moi tep dung hinh` và `checkout-nong > thieu commit goc`. Nguyên nhân theo bước rà soát (review-findings.md): fallback của okr/theo-don-vi/page.tsx đổi sang KhungDangTaiDonVi và hang-cong-cu.tsx dùng KhungXuong hinh="bang-hai-dong", còn bảng hình apps/app/test/fixtures/khung-man-chung-hinh.json chưa cập nhật. Trả về bước cài đặt.
