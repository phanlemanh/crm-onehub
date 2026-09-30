---
schema_version: 2
feature_slug: hydrat-giai-doan-deals
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 02ed49e4f4e84c65e4bb55b4558153f1e84549f6
human_signoff: Manh Phan 2026-09-30
---

# Evidence Report: hydrat-giai-doan-deals

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E1d | AC-1 | script | PASS |
| E6 | AC-6 | ui-check | PASS |
| E6d | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hydrat-giai-doan-deals-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hgd_e1
  verified_at: 2026-09-30T11:46:16Z
  output: |
    Ran 3 tests across 1 file. [926.00ms]

- eval: E2
  run_id: minted-hydrat-giai-doan-deals-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hgd_e2
  verified_at: 2026-09-30T11:46:16Z
  output: |
    Ran 3 tests across 1 file. [512.00ms]

- eval: E3
  run_id: minted-hydrat-giai-doan-deals-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hgd_e3
  verified_at: 2026-09-30T11:46:16Z
  output: |
    Ca e0 và e3 của deals-giai-doan-hydrat.dom.tsx chạy xong, không ca nào đỏ.

- eval: E4
  run_id: minted-hydrat-giai-doan-deals-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hgd_e4
  verified_at: 2026-09-30T11:46:16Z
  output: |
    Ran 3 tests across 1 file. [631.00ms]

- eval: E5
  run_id: minted-hydrat-giai-doan-deals-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hgd_e5
  verified_at: 2026-09-30T11:46:16Z
  output: |
    Ran 5 tests across 1 file. [1071.00ms]
    (kèm hai tệp cũ tien-te-chua-tai.dom.tsx và o-so-tien.dom.tsx, cùng xanh)

- eval: E1d
  run_id: minted-hydrat-giai-doan-deals-E1d-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hgd_chieu_do_dom
  verified_at: 2026-09-30T11:46:16Z
  output: |
    DO DUNG GHIM: e1 e2 e3 e4

- eval: E6
  run_id: ui-E6-hgd-man
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hgd_man_deals
  verified_at: 2026-09-30T11:46:16Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (/deals, bang, q=hgdo1il02, 1440): 3 dong hgdo1il02 LOST / WON / OPEN; cot Giai doan hien nhan chu «Closed lost» (cham do), «Closed won» (cham xanh la), «Demo booked» (cham xanh duong); khong co ma viet hoa gach duoi nao; chan «1-3 trong so 3». E6-step2.png (/deals kanban, 1440): tieu de cot «Demo booked» (1), «Qualified to buy», «Decision maker in», «Contract sent», «Closed won» (cot con lai cat ngang theo cuon); the OPEN o «Demo booked», the WON o «Closed won», chip giai doan hien nhan chu; khong ma tho. Khop expected.
  network_observed: n-a (driver)
  output: |
    Phien do rieng crm_hgd_man_do (app :4543, api :4226), da don khi xong.
    man-deals: slug onehub-center, ma hgdo1il02, 7 giai doan, 3 deal, luot=6.
    doi chung bo nghe: 1 loi
    loi hydrat: 0/12 luot
    man-deals: 14 kiem, 0 hong

- eval: E6d
  run_id: minted-hydrat-giai-doan-deals-E6d-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hgd_man_deals_chieu_do
  verified_at: 2026-09-30T11:46:16Z
  output: |
    chieu do: DO DUNG GHIM: ma 1, in «html may chu /deals: ma tho CLOSED_LOST»

- eval: E7
  run_id: minted-hydrat-giai-doan-deals-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kto_man_giu
  verified_at: 2026-09-30T11:46:16Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-step1.png (hg-kr-giu, step 1): "Thêm KR" drawer open on the right, with the fields Tên KR ("Buổi gặp khách hàng mới"), Kiểu, Khởi điểm/Đích/Hiện tại, Nguồn số, Đơn vị đo, Phụ trách, Hạn, and Huỷ / Thêm buttons. It is the hold-place drawer with typed input, as step 1 expects. E7-step3.png (hg-deal-huy, step 3): a centred dialog "Bỏ những gì vừa nhập?" with "Tiếp tục sửa" and "Bỏ" buttons on a dark backdrop. The /deals page behind is not visible (dark overlay), so /deals is confirmed only by the script's own step-3 assertion, not by pixels. It shows the discard-confirm dialog and no error overlay or hydration error. E7-step7.png (hg-ngan-ban-ghi-da-dong, step 7): the "Cá nhân" (people) list page, fully rendered with 53 records and the sidebar, with the record drawer closed. No error overlay. All three frames match the expected outcome (steps done, no console error).
  network_observed: n-a (driver)
  output: |
    Frames saved: evidence/E7-step1.png, E7-step3.png, E7-step7.png.
    Driver is a script, so there is no network file; the script's own console gate reported no app console error.
    Single run only; the load-dependent flake was not reproduced here, and E6d is the deterministic check for the same class of error.

- eval: E8
  run_id: minted-hydrat-giai-doan-deals-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hgd_go_boc
  verified_at: 2026-09-30T11:46:16Z
  output: |
    go-boc: 5 kiem, 0 hong

- eval: E9
  run_id: minted-hydrat-giai-doan-deals-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-30T11:46:16Z
  output: |
    bunx turbo run check-types --force chạy xong, mọi gói qua.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-hydrat-giai-doan-deals-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-30T11:46:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-hydrat-giai-doan-deals-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-30T11:46:16Z

- cmd: bun run lint:slop
  run_id: minted-hydrat-giai-doan-deals-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-30T11:46:16Z

- cmd: bunx turbo run build --force
  run_id: minted-hydrat-giai-doan-deals-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-30T11:46:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E9 (bunx turbo run check-types --force) — regression-guard có chủ ý cho AC-9.

## Variance

none — mọi eval chạy một lượt và đều xanh; không eval nào có pass_rate lẫn.

## Iterations

Round 1: REJECT — lint:slop đỏ (dùng typeof trong go-boc.mjs); đã cho go-boc đọc config qua khuôn zod, ghi sổ sửa và đếm thước. Returned to implementation.
Round 2: mọi eval và bốn lệnh suite xanh; kết quả PASS.
