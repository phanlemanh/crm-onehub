---
schema_version: 2
feature_slug: sua-sau-chay-that
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1a899fe05955121f4f79fa2b52915c68fcb0acec
human_signoff: manh 2026-10-19 — ký Cổng 2 trên verdict PASS 16/16 eval + 7 suite (S4 round 5, wf_5b4d3132-dfc, sau gộp onehub d479d1c6b). Ngoài-1, 4, 7, 8, 9, 10, 13, 15–21 ghi Known limits; Ngoài-2, 5, 6 mở hợp đồng mới; Ngoài-3, 11, 12, 14 chấp nhận, không sửa; đồng ý phần cắt; phê hết các quyết định Treo.
---

# Evidence Report: sua-sau-chay-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |
| E14 | AC-2 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-sau-chay-that-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nguon
  verified_at: 2026-10-19T10:58:59Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-sua-sau-chay-that-E1b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nop_luu_tru
  verified_at: 2026-10-19T10:58:59Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-sua-sau-chay-that-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-sua-sau-chay-that-E3-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-19T13:01:16Z
  output: |
    Ran 6 tests across 1 file. [619.00ms]

- eval: E4
  run_id: minted-sua-sau-chay-that-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_quay_lai
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-sau-chay-that-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_muc_luc
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-sua-sau-chay-that-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_lien_ket
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-sua-sau-chay-that-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_chon_loi
  verified_at: 2026-10-19T10:58:59Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-sua-sau-chay-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_tim_nhanh
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-sua-sau-chay-that-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_en
  verified_at: 2026-10-19T13:01:16Z
  output: |
    Ran 9 tests across 1 file. [902.00ms]

- eval: E9b
  run_id: minted-sua-sau-chay-that-E9b-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_ma
  verified_at: 2026-10-19T13:01:16Z
  output: |
    test-run: dropped crm_mvf9xznwy6gt_test

- eval: E10
  run_id: minted-sua-sau-chay-that-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_bang_doi_cot
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-sua-sau-chay-that-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_duyet_may_cu
  verified_at: 2026-10-19T13:01:16Z
  output: |
    Ran 2 tests across 1 file. [798.00ms]

- eval: E12
  run_id: minted-sua-sau-chay-that-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_loai_tep
  verified_at: 2026-10-19T10:58:59Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-sua-sau-chay-that-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_so_bo_mau
  verified_at: 2026-10-19T13:01:16Z
  output: |
    chieu do mot byte tep tro ly doi: dat (ghim apps/agent/agent/subagents/tro_ly_kho/agent.ts)

- eval: E14
  run_id: e14-ssct-20261019
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_man
  verified_at: 2026-10-19T10:58:59Z
  carried_from_round: 4
  note: carry-forward tu round 4 — delta khong cham paths cua eval
  screenshot: evidence/E14-step1.png
  observed: |
    Đã mở từng khung bằng Read (lượt chạy có KHO_TAI_LIEU_BLOB_TOKEN giả).
    Step1 (E14-step1.png, 1440): màn đọc trang «Quy định hoa hồng đối tác». Hàng nút có huy hiệu «Có 1 bản chờ duyệt», huy hiệu riêng «Có đề xuất lưu trữ chờ duyệt», nút «Sửa trang», «Lịch sử», «Đặt hạn xác minh» và nút «Xem bản chờ duyệt». Khớp Expected: số bản chờ là 1, đề xuất lưu trữ không bị đếm vào. Harness xác nhận href nút trỏ tới /tai-lieu/de-xuat/<id đề xuất sửa nội dung>.
    Step2 (E14-step2.png): trang «Chính sách lương thưởng». Mục lục «Trên trang này» có đúng hai mục «Lương & thưởng» và «A < B»; thân bài có hai tiêu đề h2 cùng tên. Khớp Expected. Harness bấm «A < B» rồi kiểm hash trỏ đúng id tiêu đề «A < B».
    Step3 (E14-step3.png): màn duyệt đề xuất của «Bảng hoa hồng theo tầng». Hiện hai bảng riêng. Bảng trên (2 cột Tầng, Tỉ lệ) gạch đỏ toàn bộ, bảng dưới (3 cột Tầng, Tỉ lệ, Hạn) tô xanh toàn bộ; có nút «Duyệt» và «Trả lại». Khớp Expected.
    Step4 (E14-step4.png): màn «Sửa trang», hộp liên kết mở với «http://a.vn», viền đỏ, dòng đỏ «Chỉ nhận liên kết https». Nội dung ô soạn không có liên kết mới. Khớp Expected.
    Step5 (E14-step5.png): hộp «Tải nguồn lên», vùng thả viền đỏ, dòng đỏ «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB.». Khớp Expected (nêu cả Word và PDF).
    Ghi chú: khung step5 của lượt chạy lệnh nguyên bản (không token, tệp ktl-loi-buoc-5.png) cho thấy trang Tài liệu có dòng «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình» và nút «Tải nguồn lên» bị khoá.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_api-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_app_filter_crm_ui-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_filter_crm_aut-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_okr_filter_crm-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bun run lint:slop
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-10-19T13:01:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không phân biệt (xanh cả hai phía): không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 round 1 xanh; một mục trong hợp đồng về thước E13 (chỉ chặn lùi và đếm lỗi model ở lượt 1, chiều đỏ chỉ đột biến lượt 1). Đã sửa ở 166840e3c: bộ so E13 chặn cả hai lượt của bộ câu mẫu.
Round 2: không eval nào đỏ (E13 và E14 chạy lại xanh, E1 đến E12 mang từ round 1) nhưng lệnh suite `bun run test -- --filter=api` đỏ ở một bài (`l3-canh`), không gắn eval nào. Verdict REJECT, trả về triển khai để điều tra bài đó (nguyên nhân chưa rõ).
Round 3: chạy lại ở 3678528430a6f7672a9a0e1e1f69e3530842ff97 (commit 367852843 ghi ca api chập chờn ngoài nhánh). E13 và E14 xanh, E1 đến E12 mang từ round 1, cả bảy lệnh suite xanh. Nguyên nhân chỗ đỏ ở round 2: chưa rõ. Verdict PASS.
Round 4: chạy lại ở 593ecaca453c8d89a56627bdda0ec7d932ce3f3f sau khi gộp onehub (d479d1c6b). E9 đỏ (câu «het-tran» bản tiếng Việt lệch nguồn sau khi onehub đổi tên thành Kara), E13 đỏ (33 tệp trợ lý đổi sau lần đo), và lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở ca `kmt-luat` (luật «AI một tên»). E2, E4, E5, E6, E8, E10 mang từ round 1. Verdict REJECT, trả về triển khai.
Round 5: chạy lại ở 1a899fe05955121f4f79fa2b52915c68fcb0acec sau khi sửa câu Kho tài liệu theo luật một tên và đo lại 50 câu mẫu. E3, E9, E9b, E11, E13 chạy lại xanh; E1, E1b, E7, E12, E14 mang từ round 4; E2, E4, E5, E6, E8, E10 mang từ round 1; cả bảy lệnh suite xanh. Verdict PASS.
