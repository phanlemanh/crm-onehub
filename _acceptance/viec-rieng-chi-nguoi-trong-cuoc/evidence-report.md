---
schema_version: 2
feature_slug: viec-rieng-chi-nguoi-trong-cuoc
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 32db7ae1f9c6007e3f8d6a192ed871fdcc994d00
human_signoff:
---

# Evidence Report: viec-rieng-chi-nguoi-trong-cuoc

Round 1. Verdict REJECT: E11 (ui-check) không đạt, và lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ (không gắn eval nào).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E10 | AC-10 | test | PASS |
| E11 | AC-2 | ui-check | FAIL |
| E12 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_ma_tran
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63lgj46rm_test

- eval: E2
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_khung
  verified_at: 2026-10-19T11:12:54Z
  output: |
    Ran 1 test across 1 file. [1360.00ms]

- eval: E3
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_chuyen
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63mpj60cd_test

- eval: E3b
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_khung_doi
  verified_at: 2026-10-19T11:12:54Z
  output: |
    Ran 1 test across 1 file. [1369.00ms]

- eval: E4
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_phu_thuoc
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63m0kp5ux_test

- eval: E5
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_tu_doi
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63lyqetyw_test

- eval: E6
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_viec_con
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63m9ehbt3_test

- eval: E7
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_lich_su_khung
  verified_at: 2026-10-19T11:12:54Z
  output: |
    Ran 1 test across 1 file. [1138.00ms]

- eval: E8
  run_id: mvf63m76cec6
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_man_du_an
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63m76cec6_test

- eval: E10
  run_id: mvf63mbbpbry
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_dem
  verified_at: 2026-10-19T11:12:54Z
  output: |
    test-run: dropped crm_mvf63mbbpbry_test

- eval: E11
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vrc_man
  verified_at: 2026-10-19T11:12:54Z
  screenshot: evidence/E11-step1.png
  observed: |
    Dữ liệu và đăng nhập đúng đề (3 người, dev:session). Người xem là Trần Văn Bình (người thực hiện B).
    E11-step1.png, khung V0 ở 1280: tiêu đề «Gọi lại anh Tuấn kf65zsv». Dòng dưới tiêu đề ghi «Việc riêng — chỉ người trong cuộc thấy». Ô «Gắn với» ghi đúng câu đó. Ô «Dự án» là «Không dự án». Chữ rõ, không đè, không cắt. Khung là sheet bên phải, giao diện tối giống các màn khác. Khớp Expected 0.
    E11-step2.png, khung V1 ở 1280: tiêu đề «Chuẩn bị dữ liệu chi nhánh kf65zsv». Dòng dưới tiêu đề ghi tên dự án «Triển khai Ngân hàng An Phát kf65zsv». Ô «Gắn với» ghi «Việc trong dự án — mọi người xem được dự án đều thấy việc này», xuống hai dòng, không bị cắt. Không có chữ «Việc riêng». Có thêm mục «Phải chờ (0)». Khớp Expected 1.
    E11-step3.png, khung V2 ở 1280: tiêu đề «Gửi bản chào phí kf65zsv». Dòng dưới tiêu đề ghi «Thoả thuận An Phát kf65zsv». Ô «Gắn với» là tên thoả thuận dạng liên kết xám, kèm nút «Gỡ». Khớp Expected 2. Lưu ý nhỏ: phần tử này là <button>, không phải <a href>.
    E11-step4.png, khung V1 ở 375: sheet đáy, không thấy cuộn ngang. Chữ «Việc trong dự án — mọi người xem được dự án đều thấy việc này» đọc được, xuống hai dòng. Dòng dưới tiêu đề ghi tên dự án. Không có chữ «Việc riêng». Tuy nhiên ô chọn «Dự án» («Triển khai Ngân hàng An Phát kf65zsv») bị cắt ở mép phải: chevron chỉ còn nửa, viền phải mất. Ảnh phóng to xác nhận. Tiêu đề trong ô nhập bị rút gọn bằng dấu «…», có chủ ý. Phần cắt ở ô chọn mâu thuẫn dòng Expected «Chữ đọc được, không đè, không cắt», nên Expected 3 không đạt hoàn toàn dù scrollWidth ≤ 375.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vrc_man
  verified_at: 2026-10-19T11:12:54Z
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png / vrc-lich-su-x-1280.png (thành viên X, khung «Ký hợp đồng triển khai kf64867», thẻ «Lịch sử» đang chọn). Có 3 dòng. Hai dòng phụ thuộc ghi: «Phạm Thu Hà gỡ việc phải chờ một việc bạn không có quyền xem» và «Phạm Thu Hà đặt việc phải chờ một việc bạn không có quyền xem». Dòng thứ ba: «Phạm Thu Hà tạo việc». Không dòng nào có tiêu đề V («Rà điều khoản bảo mật…»). Dòng che đọc tự nhiên, không có null hay mã. Khớp Expected 0 (ST-lich-su-khuat).
    E12-step2.png / vrc-lich-su-b-1280.png (người thực hiện của V, cùng khung và thẻ). Hai dòng phụ thuộc ghi: «Phạm Thu Hà gỡ việc phải chờ «Rà điều khoản bảo mật kf64867»» và «Phạm Thu Hà đặt việc phải chờ «Rà điều khoản bảo mật kf64867»». Dòng thứ ba: «Phạm Thu Hà tạo việc». Có tiêu đề V ở cả hai dòng. Khớp Expected 1 (ST-lich-su-day-du).
    Hai khung cùng bố cục, chữ đọc được, không đè, không cắt. Thứ tự ngày giờ trên cả hai ảnh là 18:25 19/10/26 · trên màn.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-19T11:12:54Z
  output: |
    Đỏ ở app#test, tệp apps/app/test/khung-viec-lich.dom.tsx, ca "dg-man-khung: ô Dự án, nói trước khi công khai việc riêng, đưa vào đúng một lần" (5 ca xanh, 1 ca đỏ).
    Lỗi ném: "dg: khong noi truoc khi cong khai" (khung-viec-lich.dom.tsx:366): hộp thoại xác nhận không chứa V.khung.congKhaiThan, hoặc viec.doiDuAn đã bị gọi trước khi người dùng xác nhận.
    Lệnh này không gắn eval nào.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

- cmd: bunx turbo run lint --force
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

- cmd: bun run lint:slop
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

- cmd: bunx turbo run build --force
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T11:12:54Z

### Judgment

- eval: E9
  judged_by: judge-subagent (fresh context), hội đồng ba lăng kính
  proposal: PASS
  rationale: Ba lăng kính cùng đề xuất PASS. Nhận xét nhỏ không đổi kết luận (lăng kính spec-alignment): docs/api.md dòng 598 viết «việc mất hết bản ghi gắn thành việc riêng» mà không kèm điều kiện dự án, trong khi dòng 555 ngay trước đó đã bổ sung ngoại lệ dự án.
  votes:
    - domain-correctness: PASS — CONTEXT.md mục «Việc» (dòng 173-175) định nghĩa việc riêng là không gắn bản ghi và không thuộc dự án nào, chỉ ba vai người trong cuộc thấy. Mục «Dự án» (dòng 234-235) vẫn nói ai đọc được phạm vi đối tác thì thấy mọi dự án và mọi việc trong đó; hai mục không mâu thuẫn. docs/api.md dòng 558-561 nêu `aiThay` với `ban-ghi`, `du-an`, `rieng`; dòng 562-567 nêu luật che của `viec.lichSu` (việc không đọc được hoặc đã xoá thì mang `null`, không tiêu đề, không mã).
    - operational-feasibility: PASS — hai mục của CONTEXT.md khớp nhau về việc trong dự án không gắn bản ghi; docs/api.md nêu đủ ba giá trị `aiThay` và luật che của `viec.lichSu`.
    - spec-alignment: PASS — câu (1)-(2) và (4)-(5) có đủ trong hai tệp, câu (3) không có mâu thuẫn; kèm lưu ý nhỏ ở dòng 598 của docs/api.md nêu trên.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-ma-tran": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-rieng-trong-cuoc.dom.tsx -t vrc-khung-chu: bo qua baseline: tep apps/app/test/viec-rieng-trong-cuoc.dom.tsx co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-chuyen": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-rieng-trong-cuoc.dom.tsx -t vrc-khung-doi: bo qua baseline: tep apps/app/test/viec-rieng-trong-cuoc.dom.tsx co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-phu-thuoc": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-tu-doi": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-viec-con": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-rieng-trong-cuoc.dom.tsx -t vrc-lich-su-khung: bo qua baseline: tep apps/app/test/viec-rieng-trong-cuoc.dom.tsx co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/viec-rieng-trong-cuoc.spec.ts -t vrc-man-du-an": bo qua baseline: tep apps/api/test/viec-rieng-trong-cuoc.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/dem-viec-rieng.spec.ts -t vrc-dem": bo qua baseline: tep packages/db/test/dem-viec-rieng.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E11 failed — ô chọn «Dự án» của khung việc ở khổ 375 bị cắt ở mép phải (chevron còn nửa, mất viền phải), trái dòng Expected «không cắt»; thêm lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở khung-viec-lich.dom.tsx (ca dg-man-khung, lỗi «dg: khong noi truoc khi cong khai»), không gắn eval nào. Returned to implementation.
