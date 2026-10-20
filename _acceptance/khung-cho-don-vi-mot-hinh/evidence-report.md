---
schema_version: 2
feature_slug: khung-cho-don-vi-mot-hinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a27befecc107714f912cfee6a8f7c2decdfdff3b
human_signoff: Phan Le Manh 2026-10-21 — ký Cổng Bằng chứng trên vòng chấm 3 (PASS, 9/9 eval, 7/7 suite; vòng 1–2 REJECT vì suite và lint, đã sửa; thước khung-man-chung sửa theo V2-11). Ngoài-1, 2, 6–9, 12–15 ghi Known limits; Ngoài-3, 4, 11 mở hợp đồng mới; Ngoài-5, 10 chấp nhận, không sửa; đồng ý cắt; Treo phê hết.
---

# Evidence Report: khung-cho-don-vi-mot-hinh

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
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

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
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bun run lint:slop
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-cho-don-vi-mot-hinh-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-20T16:55:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong phan biet (xanh ca tren HEAD lan baseline, chung minh harness chu khong phai feature; viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- E6 — `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/khung-xuong.dom.tsx`

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: suite app va @crm/ui do o bai khung-man-chung (bang hinh cua ho so da ky). Returned to implementation.
Round 2: lint:slop do. Returned to implementation (sua TEP_DOI thanh Map, ca tep-goc-da-doi re nhanh checkout nong).
Round 3: bay lenh suite deu xanh tren a27befecc107714f912cfee6a8f7c2decdfdff3b; E1-E6, E8, E9 carry-forward tu round 1 va E7 tu round 2 vi delta khong cham paths cua eval; verdict PASS.
