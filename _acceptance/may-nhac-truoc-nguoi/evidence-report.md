---
schema_version: 2
feature_slug: may-nhac-truoc-nguoi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9eda32f754e003b14f75e32e0d841520329d8bcb
human_signoff:
---

# Evidence Report: may-nhac-truoc-nguoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |
| E13 | AC-12 | ui-check | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: mucmevaqer11
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_dung_nguoi
  verified_at: 2026-09-22T09:30:00Z
  output: |
     6 expect() calls
    Ran 6 tests across 1 file. [146.00ms]
    test-run: dropped crm_mucmevaqer11_test

- eval: E2
  run_id: mucmeu6kwr6e
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_bien_nguong
  verified_at: 2026-09-22T09:30:00Z
  output: |
     13 expect() calls
    Ran 6 tests across 1 file. [209.00ms]
    test-run: dropped crm_mucmeu6kwr6e_test

- eval: E3
  run_id: mucmeuq7thj1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_nua_dem
  verified_at: 2026-09-22T09:30:00Z
  output: |
     4 expect() calls
    Ran 2 tests across 1 file. [123.00ms]
    test-run: dropped crm_mucmeuq7thj1_test

- eval: E4
  run_id: mucmete9k273
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_quet_mot_lan
  verified_at: 2026-09-22T09:30:00Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [198.00ms]
    test-run: dropped crm_mucmete9k273_test

- eval: E5
  run_id: mucmetzrliz3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_gui_slack
  verified_at: 2026-09-22T09:30:00Z
  output: |
     7 expect() calls
    Ran 7 tests across 1 file. [293.00ms]
    test-run: dropped crm_mucmetzrliz3_test

- eval: E6
  run_id: minted-may-nhac-truoc-nguoi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_khong_kenh
  verified_at: 2026-09-22T09:30:00Z
  output: |
     4 expect() calls
    Ran 4 tests across 1 file. [261.00ms]
    test-run: dropped crm_mucmeu149zth_test

- eval: E7
  run_id: mucmetdn6qxp
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_theo_doi
  verified_at: 2026-09-22T09:30:00Z
  output: |
     5 expect() calls
    Ran 2 tests across 1 file. [357.00ms]
    test-run: dropped crm_mucmetdn6qxp_test

- eval: E8
  run_id: mucmeszzm66h
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_tong_quan
  verified_at: 2026-09-22T09:30:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [392.00ms]

- eval: E9
  run_id: minted-may-nhac-truoc-nguoi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_the_tasks
  verified_at: 2026-09-22T09:30:00Z
  output: |
     0 fail
     6 expect() calls
    Ran 6 tests across 1 file. [569.00ms]

- eval: E10
  run_id: mucmesl90jk1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_payload
  verified_at: 2026-09-22T09:30:00Z
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [346.00ms]
    test-run: dropped crm_mucmesl90jk1_test

- eval: E11
  run_id: minted-may-nhac-truoc-nguoi-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_nut_theo_doi
  verified_at: 2026-09-22T09:30:00Z
  output: |
    0 fail
    4 expect() calls
    Ran 4 tests across 1 file. [582.00ms]

- eval: E12
  run_id: mucmf6ewhqgw
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_duong_do
  verified_at: 2026-09-22T09:30:00Z
  output: |
     3 expect() calls
    Ran 3 tests across 1 file. [223.00ms]
    test-run: dropped crm_mucmf6ewhqgw_test

- eval: E13
  run_id: minted-may-nhac-truoc-nguoi-E13-r1
  exit_code: 0
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-22T09:30:00Z
  screenshot: evidence/E13-tong-quan-1440.png
  observed: |
    E13-tong-quan-1440.png (đọc trực tiếp bằng Read, ảnh 1440x900): thẻ "Overdue tasks" (locale en của "Thẻ Tasks") có 4 dòng cùng kiểu bảng: (1) "E13 Buoc qua han cua toi" — cột hạn "Sep 19, 2026" với ô vuông ĐỎ; (2) "Dao tao nen tang" việc khác, ô xám; (3) "Quiet plan · E13 Cong Ty Cam Trich" (= "Kế hoạch im" locale vi, message keHoachIm) — cột hạn "quiet 8 days" với ô vuông ĐỎ giống hệt màu ô đỏ của dòng (1); (4) "Day checkpoint · E13 Cong Ty Cam Trich" (= "Mốc ngày", message mocNgay) — "1/3 steps done · Plan", cột hạn "day 14/30" ô XÁM (neutral). Zoom pixel xác nhận ô đỏ dòng (1) và dòng (3) cùng sắc đỏ. => khớp Expected #1 (dòng "Kế hoạch im"/"Mốc ngày" cùng kiểu dòng bước, cột hạn dòng im cùng chỉ báo đỏ với bước quá hạn).
    E13-theo-doi-1440.png: sheet kế hoạch "E13 Cong Ty Theo Doi" (chủ = E13 Nguoi Cam Trich B) hiện nút "👁 Watching · 1" (locale en của "Đang theo dõi") nằm NGAY CẠNH nút "…" (menu) và nút đóng "✕" ở góc phải header — đúng vị trí "cạnh menu", kèm số người theo dõi = 1. => khớp Expected #2.
    E13-tong-quan-375.png và E13-theo-doi-375.png (375x1400 / 375x1000): cả hai ảnh không có nội dung bị cắt/tràn theo chiều ngang bằng mắt; đo bổ sung bằng puppeteer (document.documentElement.scrollWidth vs clientWidth) cho cả hai URL ở viewport 375 đều ra scrollWidth=clientWidth=375 — không tràn ngang. => khớp Expected #3.
    Không có dòng Expected nào vắng mặt trên ảnh.
  network_observed: clean

- eval: E14
  run_id: design-gate-21c58c4483
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mn3_san_thiet_ke
  verified_at: 2026-09-22T09:30:00Z
  output: |
      "hits": [],
      "findings": []
    }

- eval: E15
  run_id: mucmf5qm3m4v
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mn3_payload_theo_doi
  verified_at: 2026-09-22T09:30:00Z
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [244.00ms]
    test-run: dropped crm_mucmf5qm3m4v_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mucmes6928r3
  exit_code: 0
  verified_at: 2026-09-22T09:30:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:30:00Z

- cmd: bun run lint:slop
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-22T09:30:00Z

- cmd: bunx turbo run build --force
  run_id: minted-may-nhac-truoc-nguoi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-22T09:30:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform.

## Iterations

Round 1: toàn bộ 15 eval (E1–E15) và 4 lệnh suite hồi quy (test, lint, lint:slop, build) PASS ngay từ lượt đầu — không có vòng thất bại nào, không có eval nào quay lại implementation.
