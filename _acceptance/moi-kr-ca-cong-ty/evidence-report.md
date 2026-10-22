---
schema_version: 2
feature_slug: moi-kr-ca-cong-ty
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 47e43998c3b51bd4f4ceb55fb7286aab0f5d7e1b
human_signoff:
---

# Evidence Report: moi-kr-ca-cong-ty

Round 3. Round này chạy lại E1, E8, E9, E10 và bảy lệnh suite; E2 đến E7, E11, E12 mang sang từ round 2 (delta không chạm paths của các eval đó).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-moi-kr-ca-cong-ty-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_o_truot
  verified_at: 2026-10-22T04:20:47Z

- eval: E8
  run_id: minted-moi-kr-ca-cong-ty-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_duong_dan
  verified_at: 2026-10-22T04:20:47Z

- eval: E9
  run_id: minted-moi-kr-ca-cong-ty-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_ngan
  verified_at: 2026-10-22T04:20:47Z

- eval: E10
  run_id: minted-moi-kr-ca-cong-ty-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_trang
  verified_at: 2026-10-22T04:20:47Z

- eval: E2
  run_id: minted-moi-kr-ca-cong-ty-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-moi-kr-ca-cong-ty-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_nguon
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-moi-kr-ca-cong-ty-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_quyen
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-moi-kr-ca-cong-ty-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_tinh_trang
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-moi-kr-ca-cong-ty-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_don_vi
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-moi-kr-ca-cong-ty-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mkc_loc_nguoi
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-moi-kr-ca-cong-ty-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval; khung của lượt gốc, cùng run_id, ảnh còn trên đĩa
  screenshot: evidence/suc-khoe-1280.png
  observed: |
    suc-khoe-1280.png: trang Mục tiêu (Quý 4 mẫu), hàng ô số đầu trang có 5 ô: Tiến độ trung bình 45%, Đơn vị đã công bố 12/13, KR đã cập nhật tuần 43/50, KR tự tin thấp 7, ô cuối "KR trượt" số 3 với chữ phụ "Bấm để xem danh sách" — nằm trong hàng ô số, khớp Expected; con trỏ/hover không thấy được trong ảnh tĩnh nhưng chữ gợi ý cho thấy bấm được. Dưới là bảng "Theo đơn vị". moi-kr-1280.png: tiêu đề "Mọi KR", một câu mô tả, hàng chip lọc tình trạng với "Trượt 3" đang chọn (viền xanh), bảng cột KR · Đơn vị · Phụ trách · Tiến độ · Tình trạng, 3 dòng, cột Tình trạng là chấm đỏ kèm chữ "Trượt", "Tổng số KR: 3". suc-khoe-375.png: ô "KR trượt 3 — Bấm để xem danh sách" nằm trong lưới ô số, không tràn ngang thấy được. moi-kr-375.png (đã mở lại bằng Read): tiêu đề + mô tả, chip "Trượt 3" chọn, nút Lọc, bảng chỉ còn cột KR · Đơn vị · Tình trạng (Phụ trách và Tiến độ ẩn), chấm đỏ kèm chữ "Trượt" còn, không tràn ngang trang (hàng chip tự cuộn ngang trong khung). Tất cả khớp Expected; không mâu thuẫn.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-moi-kr-ca-cong-ty-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mkc_man
  verified_at: 2026-10-22T03:53:18Z
  carried_from_round: 2
  ghi chú: carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bunx turbo run lint --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bun run lint:slop
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

- cmd: bunx turbo run build --force
  run_id: minted-moi-kr-ca-cong-ty-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-22T04:20:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay. Field baseline của mọi eval ghi n-a.

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có. Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval đều chạy một lần và đồng nhất (runs: 1, không có pass_rate hỗn hợp).

## Iterations

Round 1: S4 chưa đạt — thước AC-1, AC-2, AC-7, AC-9 thiếu đối chứng dương. Trả về triển khai.
Round 2: S4 chưa đạt — hàm phụ của bài kiểm nhận ReactNode làm lint:slop đỏ. Trả về triển khai.
Round 3: E1, E8, E9, E10 và bảy lệnh suite chạy lại, tất cả xanh; E2 đến E7, E11, E12 mang sang từ round 2. Verdict PASS.

