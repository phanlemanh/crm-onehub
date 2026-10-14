---
schema_version: 2
feature_slug: sua-sau-chay-that
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 166840e3c44d8b72ee24b0634c68efe98648d1d4
human_signoff:
---

# Evidence Report: sua-sau-chay-that

Round 2. Mọi eval có gắn AC đều xanh (E1 đến E12 mang từ round 1, E13 và E14 chạy lại). Verdict là REJECT vì một lệnh suite hồi quy không gắn eval nào bị đỏ: `bun run test -- --filter=api` (chi tiết ở mục «Lệnh suite (hồi quy)» và Iterations).

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
  run_id: minted-sua-sau-chay-that-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nguon
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: mv7u77p5y6e0
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_nop_luu_tru
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-sua-sau-chay-that-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-sua-sau-chay-that-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_doc_cho
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-sua-sau-chay-that-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_quay_lai
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-sau-chay-that-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_muc_luc
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-sua-sau-chay-that-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_lien_ket
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-sua-sau-chay-that-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_chon_loi
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-sua-sau-chay-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_tim_nhanh
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-sua-sau-chay-that-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_en
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-sua-sau-chay-that-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_hoi_ma
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-sua-sau-chay-that-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_bang_doi_cot
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-sua-sau-chay-that-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_duyet_may_cu
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-sua-sau-chay-that-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ssct_loai_tep
  verified_at: 2026-10-14T08:16:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-sua-sau-chay-that-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_so_bo_mau
  verified_at: 2026-10-14T08:38:28Z
  output: |
    lenh: bun _acceptance/sua-sau-chay-that/rang/so-bo-mau.ts (chay nguyen van, khong co, khong goi model)
    chieu do mot byte tep tro ly doi: dat (ma 1, mong 1; ghim apps/agent/agent/subagents/tro_ly_kho/agent.ts)

- eval: E14
  run_id: minted-sua-sau-chay-that-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_man
  verified_at: 2026-10-14T08:38:28Z
  screenshot: evidence/E14-step1.png
  observed: |
    step1 (1440, doc trang Quy dinh hoa hong doi tac): tieu de «Quy định hoa hồng đối tác», cac chip «Có đề xuất lưu trữ chờ duyệt» va «Có 1 bản chờ duyệt», nut «Sửa trang», «Lịch sử», «Đặt hạn xác minh», nut «Xem bản chờ duyệt»; muc «Mức hưởng», noi dung «Đối tác tầng 1 hưởng 2% doanh thu thuần.» — khop Expected (dem 1 ban, khong tinh de xuat luu tru; con tro dung duoc man.mjs khang dinh qua chieu do).
    step2 (doc trang Chinh sach luong thuong): muc luc «Trên trang này» hien dung hai muc «Lương & thưởng» va «A < B»; than trang co hai tieu de «Lương & thưởng» va «A < B» khop (ky tu < khong bi escape) — khop.
    step3 (duyet de xuat them cot «Bảng hoa hồng theo tầng»): hai bang rieng, bang tren 2 cot (Tầng, Tỉ lệ) gach do, bang duoi 3 cot (Tầng, Tỉ lệ, Hạn) gach xanh, nut Duyệt / Trả lại — khop.
    step4 (Sua trang): popup lien ket o nhap «http://a.vn» vien do va dong do «Chỉ nhận liên kết https», noi dung khong chen lien ket — khop.
    step5 (hop «Tải nguồn lên»): vung tha tep viền đỏ, dong loi do «Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB.», nut Tải lên mo — khop (neu Word va PDF). Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Lenh chay nguyen van: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/sua-sau-chay-that/rang/man.mjs", chay xong, 5 buoc in "dat" va "man sua-sau-chay-that: dat" trong phien do rieng, phien do don sach.
    Chieu do (--chieu-do tren ban sao): "buoc 1: dem ban cho sai" va "chieu do: DO DUNG GHIM" — dung mong doi.
    Frames: evidence/E14-step1.png den evidence/E14-step5.png.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_api-r2
  exit_code: 1
  verified_at: 2026-10-14T08:38:28Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

- cmd: bun run lint:slop
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T08:38:28Z

Lệnh suite đỏ không gắn eval: `bun run test -- --filter=api`. Cuối log: 1805 pass, 5 skip, 1 hỏng trên 1811 bài kiểm. Bài hỏng duy nhất là `l3-canh > l3-canh moi cho noi co mat trong cay co dung mot canh, gia tri bang okr.objective` (430.91ms). Nguyên nhân của chỗ đỏ này: chưa rõ, log đã lưu chỉ cho tên bài hỏng, chưa có dòng lỗi nguyên văn của nó. Round 1 cùng lệnh này xanh. Đây là lệnh hồi quy bắt buộc nên round này không thể ký PASS khi nó còn đỏ.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1); field baseline cua moi eval ghi n-a.

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 round 1 xanh; một mục trong hợp đồng về thước E13 (chỉ chặn lùi và đếm lỗi model ở lượt 1, chiều đỏ chỉ đột biến lượt 1). Đã sửa ở 166840e3c: bộ so E13 chặn cả hai lượt của bộ câu mẫu.
Round 2: không eval nào đỏ (E13 và E14 chạy lại xanh, E1 đến E12 mang từ round 1) nhưng lệnh suite `bun run test -- --filter=api` đỏ ở một bài (`l3-canh`), không gắn eval nào. Verdict REJECT, trả về triển khai để điều tra bài đó (nguyên nhân chưa rõ).
