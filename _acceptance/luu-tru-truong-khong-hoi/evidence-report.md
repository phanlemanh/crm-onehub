---
schema_version: 2
feature_slug: luu-tru-truong-khong-hoi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2aa280c24de843594eb6edc26a1648bccc556da
human_signoff: Phan Le Manh 2026-10-13
---

# Evidence Report: luu-tru-truong-khong-hoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-8 | judgment | PASS |
| E12 | AC-5 | test | PASS |
| E13 | AC-2 | script | PASS |

## Evidence

- eval: E9
  run_id: minted-luu-tru-truong-khong-hoi-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ltk_man
  verified_at: 2026-10-13T13:59:29Z
  output: |
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-luu-tru-truong-khong-hoi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ltk_man
  verified_at: 2026-10-13T13:59:29Z
  screenshot: evidence/ltk-toast-1440.png
  observed: |
    ltk-toast-1440.png (1440x900, trang Truong > Cong ty): khong co hop thoai hoi lai; toast xanh goc duoi trai «Đã lưu trữ ZZ ltk 1 k6r06id.» kem nut «Hoàn tác». Truong ZZ ltk 1 khong con trong danh sach «Trường tự tạo» (con 7 hang, moi hang con nut «…»); nhom «Đã lưu trữ» o cuoi hien «1 · giữ giá trị, cắt khỏi mọi nơi» (dong gap). Khop Expected buoc 1.
    ltk-hoan-tac-1440.png: toast «Đã khôi phục ZZ ltk 1 k6r06id.» (khong con nut Hoan tac); truong ZZ ltk 1 k6r06id da ve cuoi danh sach «Trường tự tạo» (8 hang, co nut «…»); dong nhom «Đã lưu trữ» da bien mat. Khop: truong ve nhom dang dung.
    ltk-toast-390.png (390 rong, di dong): thanh trinh sua da dong, khong co hop hoi lai; danh sach Truong tu tao hien; toast «Đã lưu trữ ZZ ltk 2 k6r06id.» + nut «Hoàn tác» nam hoan toan trong khung nhin o day man hinh; dong «Đã lưu trữ · 1 · giữ giá trị, cắt khỏi mọi nơi» xuat hien, ZZ ltk 2 khong con trong danh sach dang dung (ZZ ltk 1 hien do da khoi phuc o buoc 1). Khop Expected buoc 2.
    ltk-ngan-1440.png: ngan «Trường» (Quan ly truong tu bang Cong ty) van mo ben phai sau Hoan tac; toast «Đã khôi phục ZZ ltk 3 k6r06id.»; ba truong ZZ ltk 1/2/3 deu nam trong «Trường tự tạo» voi nut «…»; khong co nhom «Đã lưu trữ». Khop Expected buoc 3 (ngan khong dong, truong ve nhom dang dung).
    Khong frame nao mau thuan Expected. Luu y: nhom «Đã lưu trữ» o frame toast dang thu gon nen noi dung trong nhom khong nhin thay truc tiep; viec «nam trong nhom Da luu tru / co nut Khoi phuc» do kich ban man.mjs tu xac nhan (log «dat»), anh chi cho thay so dem 1 va truong bien khoi nhom dang dung.
  network_observed: n-a (driver)

- eval: E11
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment) — de xuat, fresh context
  verdict: PASS
  rationale: Ba judge cung cho PASS; xem tung phieu ben duoi.
  votes: |
    - domain-correctness: PASS — Cả ba ảnh đều cho thấy luồng lưu trữ đọc đúng như «cất lại được», không phải xoá. (1) Toast ghi «Đã lưu trữ …», trường rời khỏi danh sách, và mục gập «Đã lưu trữ · 1 · giữ giá trị, cắt khỏi mọi nơi» hiện cuối danh sách (ltk-toast-1440, ltk-toast-390). (2) «Hoàn tác» là nút trắng nổi trên nền toast xanh tối, nằm ngay trong toast ở cả hai khổ. Bấm vào thì toast «Đã khôi phục …» hiện ra và trường quay về danh sách (ltk-hoan-tac-1440). (3) Chữ trong toast và mục gập chỉ dùng «Đã lưu trữ», «Khôi phục», «Hoàn tác», không có «xoá». (4) Ở 390 toast nằm gọn trong khung, nút «Hoàn tác» không bị cắt, không tràn.
    - operational-feasibility: PASS — Toast «Đã lưu trữ …» kèm nút «Hoàn tác» nổi bật; dòng trường rời danh sách và nhóm «Đã lưu trữ — giữ giá trị, cất khỏi mọi nơi» hiện ngay dưới nên rõ là cất, không phải xoá; sau Hoàn tác trường quay lại kèm «Đã khôi phục». Chữ khớp bộ chữ của docs/vong-doi.md (chữ «ẩn» còn trên trang chỉ nói việc ẩn trường chuẩn, không phải lưu trữ); ở 390 toast và nút nằm gọn, không bị cắt hay tràn.
    - spec-alignment: PASS — Cả bốn điểm đều đạt. (1) Toast ghi «Đã lưu trữ ZZ ltk … .», trường biến khỏi nhóm «Trường tự tạo» và dòng «Đã lưu trữ 1 · giữ giá trị, cất khỏi mọi nơi» xuất hiện (ltk-toast-1440, ltk-toast-390). (2) «Hoàn tác» là nút trắng nổi trên nền toast tối ngay trong toast, và ltk-hoan-tac-1440 cho thấy bấm xong trường về lại danh sách với toast «Đã khôi phục …». (3) Chữ của luồng cất khớp bộ chữ: «Đã lưu trữ», «Hoàn tác», «Khôi phục». Không có «xoá» nào. Chữ «ẩn» chỉ xuất hiện ở dòng «Trường chuẩn · chỉ sắp lại thứ tự và ẩn», một thao tác khác, không phải chữ chỉ việc cất trường này. (4) Ở 390 toast nằm gọn trong màn, chữ không bị cắt và nút «Hoàn tác» nằm trong toast. Toast chỉ che lên nút «Trường mới» bên dưới, đúng như toast nổi thông thường.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Eval carry-forward từ round 1

- eval: E1
  run_id: minted-luu-tru-truong-khong-hoi-E1-r1
  exit_code: 0
  verifier: config:executors.test.ltk_menu
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-luu-tru-truong-khong-hoi-E2-r1
  exit_code: 0
  verifier: config:executors.test.ltk_trinh_sua
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-luu-tru-truong-khong-hoi-E3-r1
  exit_code: 0
  verifier: config:executors.test.ltk_hoan_tac
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-luu-tru-truong-khong-hoi-E4-r1
  exit_code: 0
  verifier: config:executors.test.ltk_hoan_tac_loi
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-luu-tru-truong-khong-hoi-E5-r1
  exit_code: 0
  verifier: config:executors.test.ltk_chu
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-luu-tru-truong-khong-hoi-E6-r1
  exit_code: 0
  verifier: config:executors.test.ltk_cap_chu
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-luu-tru-truong-khong-hoi-E7-r1
  exit_code: 0
  verifier: config:executors.test.cqt_man_khoa
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-luu-tru-truong-khong-hoi-E8-r1
  exit_code: 0
  verifier: config:executors.test.cqt_sheet_khoa
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-luu-tru-truong-khong-hoi-E12-r1
  exit_code: 0
  verifier: config:executors.test.vdc_chu
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: design-gate-e1e8026a41
  exit_code: 0
  verifier: config:executors.script.ltk_san_thiet_ke
  verified_at: 2026-10-13T11:44:57Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bunx turbo run lint --force
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bun run lint:slop
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

- cmd: bunx turbo run build --force
  run_id: minted-luu-tru-truong-khong-hoi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-13T13:59:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature chay round nay (E9, E10) khong nam trong danh sach khong-phan-biet; E9 red tren baseline (co phan biet).
Baseline khong do: E10 (ui-check, khong chay duoc tren baseline) va E1–E8, E12, E13 (carry-forward tu round 1, khong chay lai round nay). Round 1 da ghi E6, E7, E8, E12, E13 green ca hai phia — regression-guard co chu y, khong phai eval phan biet.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS kem 2 phat hien trong hop dong (AC-7) — kich ban do man E9/E10 chua kiem truong nam nhom «Đã lưu trữ» roi ve nhom dang dung. Quay lai sua man.mjs va ghim chieu do nhom.
Round 2: chay lai E9, E10 va bay lenh suite tren fd2d128ec; E1–E8, E12, E13 carry-forward tu round 1. PASS.

### Re-pin lần 1 — 2026-10-13, do gộp onehub mới vào nhánh V2b trước lô gộp
run_id: repin-20261013T144913Z-54452
sha: c2aa280c24de843594eb6edc26a1648bccc556da · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E10, E11 (E11 không khai paths) · AC không có chốt máy: AC-8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
