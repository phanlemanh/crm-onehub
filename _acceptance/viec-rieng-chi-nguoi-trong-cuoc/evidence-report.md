---
schema_version: 2
feature_slug: viec-rieng-chi-nguoi-trong-cuoc
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6eb92d6e79feb32b236ad0b95de7b8995a2d2091
human_signoff: manh 2026-10-19
---

# Evidence Report: viec-rieng-chi-nguoi-trong-cuoc

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
| E9 | AC-9 | judgment | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-2 | ui-check | PASS |
| E12 | AC-7 | ui-check | PASS |

## Evidence

- eval: E2
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_khung
  verified_at: 2026-10-19T11:53:34Z
  output: |
    Ran 1 test across 1 file. [845.00ms]

- eval: E3b
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_khung_doi
  verified_at: 2026-10-19T11:53:34Z
  output: |
    Ran 1 test across 1 file. [775.00ms]

- eval: E10
  run_id: mvf74pndy95t
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vrc_dem
  verified_at: 2026-10-19T11:53:34Z
  output: |
    test-run: dropped crm_mvf74pndy95t_test

- eval: E11
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vrc_man
  verified_at: 2026-10-19T11:53:34Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1 (vrc-khung-rieng-1280, đã mở bằng Read): khung bên phải tiêu đề «Gọi lại anh Tuấn kf74pdo», dòng dưới tiêu đề «Việc riêng — chỉ người trong cuộc thấy». Hàng «Gắn với» ghi «Việc riêng — chỉ người trong cuộc thấy», ô «Dự án» là «Không dự án». Người thực hiện Trần Văn Bình. Chữ rõ, không đè, không cắt. Khớp Expected mục 0.
    E11-step2 (vrc-khung-du-an-1280): tiêu đề «Chuẩn bị dữ liệu chi nhánh kf74pdo», dòng dưới tiêu đề «Triển khai Ngân hàng An Phát kf74pdo». «Gắn với» ghi «Việc trong dự án — mọi người xem được dự án đều thấy việc này», xuống hai dòng, đọc đủ, không cắt. Không có chữ «Việc riêng» ở đâu trong ảnh. Ô «Dự án» hiện đủ tên dự án ở 1280. Khớp Expected mục 1.
    E11-step3 (vrc-khung-ban-ghi-1280): tiêu đề «Gửi bản chào phí kf74pdo», dòng dưới tiêu đề «Thoả thuận An Phát kf74pdo». «Gắn với» là «Thoả thuận An Phát kf74pdo» kèm nút «Gỡ», không có chữ «Việc riêng». Tên thoả thuận là <button> chữ xám, gạch chân khi hover, không phải thẻ <a>. Khớp Expected mục 2, kèm ghi chú.
    E11-step4 (vrc-khung-du-an-375): khung dạng ngăn kéo ở khổ 375. Tiêu đề xuống 3 dòng, dòng dưới tiêu đề «Triển khai Ngân hàng An Phát kf74pdo» xuống 2 dòng. «Gắn với» là «Việc trong dự án — mọi người xem được dự án đều thấy việc này» xuống 2 dòng, đọc đủ, không đè, không cắt. Không có cuộn ngang. Ô chọn «Dự án» bị cắt mép phải (lỗi có sẵn, đề đã loại trừ). Khớp Expected mục 3.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu trong evidence: vrc-khung-rieng-1280.png, vrc-khung-du-an-1280.png, vrc-khung-ban-ghi-1280.png, vrc-khung-du-an-375.png, vrc-lich-su-x-1280.png, vrc-lich-su-b-1280.png. Bản sao theo bước: E11-step1.png đến E11-step4.png.
    Driver là răng man.mjs, không đọc được network nên không tạo E11-network.txt.

- eval: E1
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E1-r1
  exit_code: 0
  verifier: config:executors.test.vrc_ma_tran
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E3-r1
  exit_code: 0
  verifier: config:executors.test.vrc_chuyen
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E4-r1
  exit_code: 0
  verifier: config:executors.test.vrc_phu_thuoc
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E5-r1
  exit_code: 0
  verifier: config:executors.test.vrc_tu_doi
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E6-r1
  exit_code: 0
  verifier: config:executors.test.vrc_viec_con
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E7-r1
  exit_code: 0
  verifier: config:executors.test.vrc_lich_su_khung
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: mvf63m76cec6
  exit_code: 0
  verifier: config:executors.test.vrc_man_du_an
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-E12-r1
  exit_code: 0
  verifier: config:executors.script.vrc_man
  verified_at: 2026-10-19T11:12:54Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E12-step1.png
  observed: |
    E12-step1.png / vrc-lich-su-x-1280.png (thành viên X, khung «Ký hợp đồng triển khai kf64867», thẻ «Lịch sử» đang chọn). Có 3 dòng. Hai dòng phụ thuộc ghi: «Phạm Thu Hà gỡ việc phải chờ một việc bạn không có quyền xem» và «Phạm Thu Hà đặt việc phải chờ một việc bạn không có quyền xem». Dòng thứ ba: «Phạm Thu Hà tạo việc». Không dòng nào có tiêu đề V («Rà điều khoản bảo mật…»). Dòng che đọc tự nhiên, không có null hay mã. Khớp Expected 0 (ST-lich-su-khuat).
    E12-step2.png / vrc-lich-su-b-1280.png (người thực hiện của V, cùng khung và thẻ). Hai dòng phụ thuộc ghi: «Phạm Thu Hà gỡ việc phải chờ «Rà điều khoản bảo mật kf64867»» và «Phạm Thu Hà đặt việc phải chờ «Rà điều khoản bảo mật kf64867»». Dòng thứ ba: «Phạm Thu Hà tạo việc». Có tiêu đề V ở cả hai dòng. Khớp Expected 1 (ST-lich-su-day-du).
    Hai khung cùng bố cục, chữ đọc được, không đè, không cắt. Thứ tự ngày giờ trên cả hai ảnh là 18:25 19/10/26 · trên màn.
  network_observed: n-a (driver)

### Judge (E9)

- eval: E9
  judged_by: judge panel domain-correctness, operational-feasibility, spec-alignment (fresh context)
  verdict: PASS
  verified_at: 2026-10-19T11:53:34Z
  rationale: Ba judge cùng PASS. CONTEXT.md mục «Việc» (dòng 173-176) định nghĩa việc riêng là «không gắn bản ghi và không thuộc dự án nào», khớp với mục «Dự án» (dòng 234-235). docs/api.md nêu đủ ba giá trị aiThay (dòng 558-561) và luật che của viec.lichSu (dòng 562-567).
  panel_votes:
    - domain-correctness: PASS — CONTEXT.md mục «Việc» (dòng 173-176) định nghĩa việc riêng là «không gắn bản ghi và không thuộc dự án nào», và grep không thấy câu nào khác nói việc không gắn gì là việc riêng. Mục «Dự án» (dòng 234-235) vẫn nói ai đọc được phạm vi đối tác thì thấy mọi dự án và mọi việc trong đó, khớp với «Việc» nên không mâu thuẫn. docs/api.md nêu `aiThay` với ba giá trị `ban-ghi`, `du-an`, `rieng` kèm nghĩa (dòng 558-561) và luật che trong `viec.lichSu` (dòng 562-567): việc không đọc được hoặc đã xoá thì mang `null`, không tiêu đề, không mã. Ghi chú nhỏ ngoài phạm vi: docs/api.md dòng 598 nói «việc mất hết bản ghi gắn thành việc riêng» mà không kèm điều kiện dự án.
    - operational-feasibility: PASS — CONTEXT.md mục «Việc» (dòng 173-176) định nghĩa việc riêng là «việc không gắn bản ghi và không thuộc dự án nào», không còn câu nào khác trong tệp nói việc không gắn gì là việc riêng mà không kèm điều kiện dự án. Mục «Dự án» (dòng 234-235) vẫn nói ai đọc được phạm vi đối tác thì thấy mọi dự án và mọi việc trong đó; hai mục khớp nhau. docs/api.md dòng 558-561 nêu `viec.get` trả `aiThay` với đúng ba giá trị và nghĩa từng giá trị; dòng 562-567 nêu luật che trong `viec.lichSu`. Ngoài phạm vi câu hỏi: docs/api.md dòng 598 viết «việc mất hết bản ghi gắn thành việc riêng» mà không kèm điều kiện dự án, không làm đổi kết luận.
    - spec-alignment: PASS — CONTEXT.md mục «Việc» (dòng 173-175) định nghĩa việc riêng là "không gắn bản ghi và không thuộc dự án nào", không còn câu nào nói việc không gắn gì là việc riêng mà thiếu điều kiện dự án. Mục «Dự án» (dòng 234-235) vẫn ghi "Ai đọc được phạm vi đối tác thì thấy mọi dự án và mọi việc trong đó"; hai mục khớp nhau. docs/api.md dòng 558-561 nêu `aiThay` của `viec.get` với đúng ba giá trị kèm nghĩa; dòng 562-567 nêu luật che của `viec.lichSu`: việc người xem không đọc được hoặc đã xoá thì vết trả `null`, "không tiêu đề, không mã".
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bunx turbo run lint --force
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bun run lint:slop
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

- cmd: bunx turbo run build --force
  run_id: minted-viec-rieng-chi-nguoi-trong-cuoc-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-19T11:53:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-rieng-trong-cuoc.dom.tsx -t vrc-khung-chu: bo qua baseline: tep apps/app/test/viec-rieng-trong-cuoc.dom.tsx co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/viec-rieng-trong-cuoc.dom.tsx -t vrc-khung-doi: bo qua baseline: tep apps/app/test/viec-rieng-trong-cuoc.dom.tsx co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/dem-viec-rieng.spec.ts -t vrc-dem": bo qua baseline: tep packages/db/test/dem-viec-rieng.spec.ts co o cay dang kiem nhung chua co o merge-base ff0384895e448184ae27ae478954593a15d297a3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E11 và hai bộ suite (app, @crm/ui) đỏ, một phát hiện trong hợp đồng ở AC-10 (lệnh viec:dem-rieng không chặn được ca thiếu DATABASE_URL). Returned to implementation.
Round 2: sửa ở commit 6eb92d6e7; chạy lại E2, E3b, E10, E11 và toàn bộ suite, tất cả xanh; E1, E3, E4, E5, E6, E7, E8, E12 giữ nguyên từ round 1 vì delta không chạm paths của chúng.
