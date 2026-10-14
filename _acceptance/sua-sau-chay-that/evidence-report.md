---
schema_version: 2
feature_slug: sua-sau-chay-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3678528430a6f7672a9a0e1e1f69e3530842ff97
human_signoff:
---

# Evidence Report: sua-sau-chay-that

Round 3. Mọi eval có gắn AC đều xanh (E1 đến E12 mang từ round 1, E13 và E14 chạy lại ở round này). Cả bảy lệnh suite hồi quy xanh, kể cả `bun run test -- --filter=api` đã đỏ ở round 2.

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
  run_id: minted-sua-sau-chay-that-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_so_bo_mau
  verified_at: 2026-10-14T08:58:12Z
  output: |
    lenh: bun _acceptance/sua-sau-chay-that/rang/so-bo-mau.ts (chay nguyen van, khong co, khong goi model)
    chieu do mot byte tep tro ly doi: dat (ma 1, mong 1; ghim apps/agent/agent/subagents/tro_ly_kho/agent.ts)

- eval: E14
  run_id: minted-sua-sau-chay-that-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ssct_man
  verified_at: 2026-10-14T08:58:12Z
  screenshot: evidence/E14-step1.png
  observed: |
    Step1 (doc P, 1440): tieu de "Quy định hoa hồng đối tác"; hang chip co "Có đề xuất lưu trữ chờ duyệt" va "Có 1 bản chờ duyệt", nut "Sửa trang", "Lịch sử", "Đặt hạn xác minh" va nut "Xem bản chờ duyệt" -> dem 1 ban cho (chi de xuat sua noi dung, de xuat luu tru tach rieng) dung Expected.
    Step2 (doc M): tieu de "Chính sách lương thưởng"; muc luc "Trên trang này" co dung hai muc "Lương & thưởng" va "A < B"; noi dung co hai heading "Lương & thưởng" va "A < B" hien nguyen ky tu (khong bi escape) dung.
    Step3 (duyet de xuat them cot): "Bảng hoa hồng theo tầng", hai bang rieng: bang cu (gach do: Tầng/Tỉ lệ, Một 1%, Hai 2%) va bang moi (gach xanh: Tầng/Tỉ lệ/Hạn, Một 1% Quý, Hai 2% Năm), cac chip "1% →","2% →","→ 1%","→ 2%", nut Duyệt/Trả lại -> dung.
    Step4 (sua trang): trinh soan co noi dung Lương & thưởng / A < B, hop nhap lien ket chua "http://a.vn" vien do va cau do "Chỉ nhận liên kết https", khong co lien ket nao duoc tao trong noi dung; nut Gui duyet vo hieu "Chưa có thay đổi" -> dung.
    Step5 (tai nguon len): hop thoai "Tải nguồn lên" voi vung chon tep vien do net dut, cau do "Chỉ nhận Word (.docx) hoặc PDF, tới 20 MB." nhac Word va PDF, nut Tai len vo hieu -> dung. Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Lenh chay nguyen van: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/sua-sau-chay-that/rang/man.mjs", chay xong thanh cong (log /tmp/sua-sau-chay-that-e14.log).
    Phien do rieng crm_gifted_poincare_71daab_do, app :4346, api :4291; da don sau khi xong, cong khong con listen. Dang nhap qua dev:session (2 tai khoan thanh vien).
    man.mjs in "buoc 1: dat" den "buoc 5: dat" va "man sua-sau-chay-that: dat" (5/5 buoc). Chu doc bang innerText (textContent chi dung cho del/ins o buoc 3).
    Chieu do (--chieu-do) khong chay o round nay: steps khong co va rao cam doi dong lenh; chieu do 'buoc 1: dem ban cho sai' da kiem o round 2.
    Network: driver khong co duong doc network, ghi n-a (driver) trong evidence/E14-network.txt.
    Frames: evidence/E14-step1.png den evidence/E14-step5.png.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bun run lint:slop
  run_id: minted-sua-sau-chay-that-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-sau-chay-that-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-14T08:58:12Z

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
Round 3: chạy lại ở 3678528430a6f7672a9a0e1e1f69e3530842ff97 (commit 367852843 ghi ca api chập chờn ngoài nhánh). E13 và E14 xanh, E1 đến E12 mang từ round 1, cả bảy lệnh suite xanh gồm cả `bun run test -- --filter=api`. Nguyên nhân chỗ đỏ ở round 2: chưa rõ, không có dòng lỗi nguyên văn đã lưu. Verdict PASS.
