---
schema_version: 2
feature_slug: khung-cho-don-vi-mot-hinh
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4c621c211bfb87aacc52614224988632033319fd
human_signoff:
---

# Evidence Report: khung-cho-don-vi-mot-hinh

Vòng 2. Chín eval đều đạt (E7 chạy lại ở vòng này, tám eval còn lại mang từ vòng 1 vì delta không chạm paths của chúng). Verdict REJECT đến từ một lệnh suite không gắn eval: `bun run lint:slop` đỏ ở bài `apps/app/test/khung-man-chung.spec.ts`. Chi tiết ở mục «Lệnh fail không gắn eval» bên dưới.

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
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-khung-cho-don-vi-mot-hinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-khung-cho-don-vi-mot-hinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-khung-cho-don-vi-mot-hinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-khung-cho-don-vi-mot-hinh-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_cau_truc
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khung-cho-don-vi-mot-hinh-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kmc_xuong
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-khung-cho-don-vi-mot-hinh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_trang_khac
  verified_at: 2026-10-20T16:16:23Z
  output: |
    AC-6: 9 trang dung bang · bang-hai-dong o [slug]/okr/theo-don-vi

- eval: E8
  run_id: minted-khung-cho-don-vi-mot-hinh-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kcd_a11y
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-khung-cho-don-vi-mot-hinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kcd_man
  verified_at: 2026-10-20T12:46:44Z
  carried_from_round: 1
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

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

- cmd: bun run lint:slop
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_lint_slop-r2
  exit_code: 1
  verified_at: 2026-10-20T16:16:23Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T16:16:23Z

### Lệnh fail không gắn eval

`bun run lint:slop` (1 lần chạy, 0 lần đạt) báo 1 lỗi, 0 cảnh báo, ở luật `anti-slop(no-known-value-widening)`: biến `TEP_DOI` có giá trị khởi tạo đã biết kiểu nhưng bị khai kiểu `Record<string, string>` nên mất thông tin kiểu. Vị trí: `apps/app/test/khung-man-chung.spec.ts:53`. Tệp này là bài của hồ sơ đã ký `khung-man-chung`, vòng này được sửa để bảng hình ghi khung Theo đơn vị đã dời sang `hang-cong-cu.tsx`. Không eval nào của hồ sơ này gắn với lệnh đó, nên `failed_evals` để trống. Cách xử lý: giữ suy luận kiểu hoặc dùng `satisfies` cho `TEP_DOI`, rồi chạy lại.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E6 — lệnh `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx`

Baseline không đo lại ở vòng này vì `evals.yaml` không đổi kể từ lần đo baseline cuối (vòng 1): field baseline của mọi eval ghi n-a. Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic)

## Iterations

Round 1: REJECT — suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở bài khung-man-chung (bảng hình của hồ sơ đã ký chưa ghi khung Theo đơn vị đã dời sang hang-cong-cu.tsx). Returned to implementation.
Round 2: REJECT — chín eval đều đạt (E7 chạy lại, tám eval mang từ vòng 1), bốn lệnh test và lint, build đều xanh, nhưng `bun run lint:slop` đỏ ở `apps/app/test/khung-man-chung.spec.ts:53` (luật no-known-value-widening, lỗi nằm trong phần sửa của vòng này). Giờ `verified_at` của vòng 2 là giờ đóng dấu lúc soạn báo cáo (payload không kèm giờ chạy). Returned to implementation.
