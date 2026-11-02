---
schema_version: 2
feature_slug: sua-tai-cho-muc-tieu-va-kr
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0b3b5f5de43edb8318b1a48ef6f965314f283216
human_signoff:
---

# Evidence Report: sua-tai-cho-muc-tieu-va-kr

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
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-1 | script | PASS |
| E12 | AC-5 | test | PASS |
| E13 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E2
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E3
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E4
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E5
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E6
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E7
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E8
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E13
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 44 tests across 1 file. [5.17s]

- eval: E9
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_bai_cu
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Ran 51 tests across 4 files. [12.28s]

- eval: E11
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sv9_slop
  verified_at: 2026-11-02T04:02:51Z
  output: |
    Finished in 2.4s on 4366 files with 13 rules using 14 threads.

- eval: E10
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E10-r1
  exit_code: 0
  verifier: config:executors.script.sv9_chup
  verified_at: 2026-11-02T02:47:15Z
  carried_from_round: 1
  screenshot: evidence/E10-step1.png
  observed: |
    Frame 1 (E10-step1.png = ST-muc-tieu-dang-sua desktop-1280 light): ngăn mục tiêu, tiêu đề dài xuống 3 dòng, không tràn. Mục CHI TIẾT là hàng nhãn trái (Tên, Vì sao lúc này, Phụ trách) và ô bấm được bên phải; ô Tên đang focus viền xanh, nội dung dài cuộn trong ô; «Vì sao» xuống dòng nhiều dòng; không tràn ngang.
    Frame 2 (E10-step2.png = ST-muc-tieu-loi mobile-375 light): tiêu đề xuống 5 dòng, hàng nhãn trái / giá trị phải; Tên cắt bằng dấu «…»; Vì sao xuống dòng trong cột hẹp; Phụ trách «Nguyễn Thị Phươn» bị cắt cứng không có «…» (lưu ý nhỏ); toast lỗi tiếng Việt «Tên cần 3–200 ký tự.»; không tràn ngang.
    Frame 3 (E10-step3.png = ST-kr-xem desktop-1280 light): ngăn KR, tiêu đề xuống 2 dòng; hàng Tên (cắt «…» một dòng) và Phụ trách «Hoàng Anh Tuấn · Đã rời đội», nhãn trái giá trị phải như ngăn deal.
    Frame 4 (E10-step4.png = ST-kr-dang-luu mobile-375 light): tiêu đề xuống 4 dòng; hàng Tên có biểu tượng đang lưu và chữ xám cắt «…»; Phụ trách cắt cứng ở mép; không tràn ngang.
    Tất cả khớp Expected (hình ô cùng ngăn deal, chữ dài xuống dòng hoặc cắt trong ô không tràn trang, ảnh lỗi có câu tiếng Việt).
  network_observed: n-a (driver)
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E12-r1
  exit_code: 0
  verifier: config:executors.test.sv9_api
  verified_at: 2026-11-02T02:47:15Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-11-02T04:02:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Baseline cua moi eval la n-a.

Eval khong phan biet (xanh tren ca HEAD lan baseline, chung minh harness chu khong phai feature; can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- E9 (cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-sheet.dom.tsx ./test/khung-tao-okr.dom.tsx ./test/sheet-quyen-cap-nhat.dom.tsx ./test/ngan-kr-mot-cho.dom.tsx)
- E11 (bun run lint:slop)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: chạy lần đầu, ghi run-log; E10 và E12 được giữ lại cho round 2.
Round 2: E1–E9, E11, E13 chạy lại và xanh cùng sáu lệnh suite; E10 và E12 carry-forward từ round 1 vì delta không chạm paths của chúng.
