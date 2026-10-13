---
schema_version: 2
feature_slug: them-buoc-bao-dung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 591e315adc837db51de555ffb7a6bf35d6f24bb7
human_signoff:
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
  run_id: minted-them-buoc-bao-dung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T02:12:04Z
  output: |
    Assertion trong script: 8 DUNG, 0 SAI. 3 trang thai (them-buoc-loi-phong-ban, them-buoc-khac-loi-phong-ban, them-buoc-thu-lai-xong) x 2 kho (1440, 390) deu DUNG.
    Bon dong loi: vung loi co, tieu de «Không tải được danh sách phòng ban», nut thu lai trong khung nhin, khong cuon ngang, khong co o chon.
    Hai dong thu lai: vung loi mat, o chon hien, co «Phòng ban đo B», khong chan them.
    Hai dong phu qua-han-con-sot (1440, 390) cung DUNG.
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở cả 6 ảnh bằng Read. Ở 1440 và 390 khi tải phòng ban lỗi: khung viền có tiêu đề «Không tải được danh sách phòng ban», chữ «Kiểm tra kết nối rồi thử lại.», nút «Thử lại» nằm trọn trong khung nhìn (cả ca kế hoạch chưa có bước lẫn ca đã có «Bước có sẵn»), không có ô chọn «Phòng ban», không thấy cuộn ngang.
    Sau thử lại ở cả hai khổ: khung lỗi biến mất, ô chọn «Phòng ban» hiện với danh sách «Phòng ban đo A / B». Tất cả khớp Expected.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-them-buoc-bao-dung-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbd_man
  verified_at: 2026-10-13T02:12:04Z
  output: |
    Hai frame luu: E11-step1.png (1440, tu qua-han-con-sot-1440.png), E11-step2.png (390, tu qua-han-con-sot-390.png); ban chay moi ghi de ban cu.
    Phep do in mui gio da chon va dat cho ca hai kho.
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440, đã mở bằng Read): màn Tổng quan, thẻ «Việc quá hạn» ghi «5 việc quá hạn», bảng 5 hàng gồm 4 hàng việc và hàng bước «Bước đo ngày VN … — Đo E6b … · Kế hoạch 30 ngày» hạn 12 thg 10; cả 5 hàng đều có chấm đỏ, kể cả hàng bước. Không có dòng «và N việc quá hạn nữa» (tổng 5 bằng số hàng đang hiện).
    E11-step2.png (390, đã mở bằng Read): thẻ cùng 5 hàng, chấm đỏ ở hàng bước, bố cục dọc, không tràn ngang trang, không có dòng «nữa». Khớp Expected: dấu quá hạn của dòng bước khớp ngày VN. Ghi chú ngoài Expected: cột ngày bên phải bị cắt mép nhẹ.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bunx turbo run lint --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bun run lint:slop
  run_id: minted-them-buoc-bao-dung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

- cmd: bunx turbo run build --force
  run_id: minted-them-buoc-bao-dung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-13T02:12:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — khong co eval nao xanh ca hai phia duoc ghi nhan la khong-phan-biet; lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS, nhung 2 finding trong hợp đồng ở thước màn man.mjs (dòng «và N việc quá hạn nữa» của E11 chưa được đo) — đã sửa ở e175546b7, bằng chứng S4 round 1 ở 591e315ad.
Round 2: chạy lại E10, E11 (ui-check) và 7 lệnh suite trên 591e315ad; E1-E9 mang sang từ round 1 vì delta không chạm paths của các eval này. Tất cả PASS.
