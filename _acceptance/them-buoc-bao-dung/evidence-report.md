---
schema_version: 2
feature_slug: them-buoc-bao-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: be9ad8c15432cfde0d716d1a05fce5ae43f4c6d0
human_signoff: Phan Le Manh 2026-10-13
---

# Evidence Report: them-buoc-bao-dung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-3 | ui-check | PASS |
| E11 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-them-buoc-bao-dung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-them-buoc-bao-dung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_phong_ban
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-them-buoc-bao-dung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-them-buoc-bao-dung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-them-buoc-bao-dung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_form_dom
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-them-buoc-bao-dung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_lui
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-them-buoc-bao-dung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_qua_han_tien
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-them-buoc-bao-dung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_hoi_quy
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: mv60zc5o3esr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbd_khu_hoi
  verified_at: 2026-10-13T01:50:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-them-buoc-bao-dung-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T02:31:28Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở từng ảnh bằng Read.
    E10-step1 (1440, kế hoạch mở không bước, sau bấm «Thêm bước», đang chặn listDepartments): panel bản ghi bên phải; trạng thái rỗng «Kế hoạch chưa có bước nào»; khung lỗi viền liền «Không tải được danh sách phòng ban» + «Kiểm tra kết nối rồi thử lại.» + nút «Thử lại», nằm trọn trong khung nhìn; không có ô chọn «Phòng ban»; dưới là ô «Việc cần làm», ngày, «Thêm», «Thôi»; không dấu hiệu cuộn ngang. Khớp Expected.
    E10-step2 (1440, kế hoạch có 1 bước, «Thêm bước ở phòng ban khác»): phần «Phòng ban đo A… · đã xong 0/1» có bước; bên dưới cùng khung lỗi «Không tải được danh sách phòng ban» với nút «Thử lại» trong khung nhìn; không có ô chọn phòng ban. Khớp.
    E10-step3 (1440, sau gỡ chặn và thử lại): vùng lỗi biến mất; ô chọn «Phòng ban» hiện, danh sách mở ra «Phòng ban đo A…» và «Phòng ban đo B…». Khớp.
    E10-step4 (390, không bước, lỗi): ngăn kéo dưới; khung lỗi «Không tải được danh sách phòng ban» + nút «Thử lại» nằm trong khung nhìn 390x844, không bị cắt ngang, không tràn ngang. Khớp.
    E10-step5 (390, có bước, lỗi): dòng bước, nút «Thêm bước», khung lỗi với «Thử lại» trong khung nhìn; chữ tên bước bị rút gọn «Bước …» nhưng không tràn ngang. Khớp.
    E10-step6 (390, sau thử lại): không còn vùng lỗi; ô chọn «Phòng ban» hiện với danh sách A và B. Khớp.
    Không frame nào mâu thuẫn Expected; số đo trong log (nutTrongKhung=true, tranNgang=false, oChon=true sau thử lại) khớp ảnh.
  network_observed: n-a (driver)

- eval: E11
  run_id: tbd-r3-e11-5986
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T02:31:28Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440, mới 09:32): trang Tổng quan, thẻ «Việc quá hạn», phụ đề «12 việc quá hạn». Bảng liệt kê 6 dòng với chấm đỏ ở cột «Quá hạn» (Book the technical deep dive 13 ngày trước, Send SOC 2 report 4 ngày trước, Chase procurement 2 ngày trước, và ba dòng «Việc đo E6b mv62f793» 0/2/3, đều 2 ngày trước). Dưới bảng có đường kẻ rồi dòng «và 1 việc quá hạn nữa». Khớp Expected AC-6 (lùi): có dòng «nữa» với N = 1. Dòng bước (mong mang dấu quá hạn) không nằm trong phần danh sách nhìn thấy trong ảnh; thước đã khẳng định dấu error ở dòng bước qua DOM.
    E11-step2.png (390, mới 09:32): cùng nội dung ở khổ điện thoại, cột «Quá hạn» bị cắt chữ ở mép phải bảng («13 ngày trước» thành «13 ngày trước» cụt); 6 dòng, chấm đỏ, rồi dòng «và 1 việc quá hạn nữa» dưới bảng; dưới là «Hoạt động gần đây của bạn». Khớp Expected. Không thấy mâu thuẫn với Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bunx turbo run lint --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bun run lint:slop
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

- cmd: bunx turbo run build --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-13T02:31:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen round nay khong do lai; moi block eval ghi baseline n-a.

Eval khong-phan-biet: none. Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS — 2 finding trong hợp đồng (thước màn E11 không đo dòng «và N việc quá hạn nữa» của AC-6, AC-7); đã sửa ở e175546b7.
Round 2: PASS — 1 finding trong hợp đồng (thước E11 chưa đo trường hợp dòng «nữa» phải hiện); đã sửa ở ba5bfc10b.
Round 3: PASS — chỉ chạy lại suite và hai eval ui-check E10, E11 trên be9ad8c15; E1 đến E9 giữ nguyên từ round 1 vì delta không chạm paths của eval.
