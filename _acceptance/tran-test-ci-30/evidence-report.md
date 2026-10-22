---
schema_version: 2
feature_slug: tran-test-ci-30
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 35201e23ced83dc70a70061603dc8e2b782f60b5
human_signoff:
---

# Evidence Report: tran-test-ci-30

Round 2. Verdict REJECT do một lệnh suite đỏ không gắn eval nào: `bun run test -- --filter=app --filter=@crm/ui` (xem mục «Lệnh suite (hồi quy)»). Mọi eval có khai (E1, E2, E3) đều mang từ round 1, E4 là judgment. `failed_evals` để rỗng vì lệnh đỏ không thuộc eval nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS (carry-forward từ round 1) |
| E2 | AC-2 | script | PASS (carry-forward từ round 1) |
| E3 | AC-3 | script | PASS (carry-forward từ round 1) |
| E4 | AC-4 | judgment | PASS (đề xuất của hội đồng, chờ human_override) |

## Evidence

- eval: E1
  run_id: minted-tran-test-ci-30-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_mot_khoa
  verified_at: 2026-10-22T13:17:57Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tran-test-ci-30-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_e3_cu
  verified_at: 2026-10-22T13:17:57Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tran-test-ci-30-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_thay_boi
  verified_at: 2026-10-22T13:17:57Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  judged_by: hội đồng judge (fresh context), panel đề xuất ba lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  votes:
    - domain-correctness: PASS — Hạt giống ghi điều kiện mở lại «trung vị các lượt xanh của test (api) lớn hơn 22 phút» và lý do chưa tách (mỗi ô mới tốn khoảng 3 phút cài đặt cho mọi lượt chạy, còn nâng trần thì lượt xanh không tốn thêm). Bảng đo của design doc có bốn nhóm rời nhau, và cả bốn dòng cộng đủ 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40. Dòng check chỉ đủ 40 khi tính thêm 13 lượt nhảy qua vì PR nháp (21+0+1+5+13), mà số 13 chỉ nằm trong ngoặc chứ không có cột riêng. Hai tệp không nói trái nhau: số đo của M5 (15 xanh, 6 bị cắt, app-ui khoảng 18 phút), mức 3 phút cài đặt và mức tối đa 10 phút thêm cho lượt treo đều khớp.
    - operational-feasibility: PASS — Hạt giống ghi điều kiện mở lại là «trung vị các lượt xanh của test (api) > 22 phút». Nó cũng nêu lý do chưa tách: mỗi ô mới tốn khoảng 3 phút cài đặt cho mọi lượt chạy, và design doc nhắc lại đúng lý do này. Bảng 40 lượt của design doc chia thành bốn nhóm rời nhau và mọi hàng cộng đủ 40. `api` là 33+2+2+3, `app-ui` là 37+0+0+3, `con-lai` là 40, `check` là 21+0+1+(5 cộng 13)=40. Số đo lúc gieo (15 xanh, 6 bị cắt, `app-ui` khoảng 18 phút) khớp giữa hai tệp, và số đo lại 22/10 được ghi riêng với phạm vi khác nên hai tệp không trái nhau.
    - spec-alignment: PASS — Hạt giống ghi rõ điều kiện mở lại «trung vị các lượt xanh của test (api) > 22 phút» và lý do chưa tách (khoảng 3 phút cài đặt cho mọi lượt chạy). Bảng trong design doc chia 40 lượt thành các nhóm rời nhau, và hàng nào cũng cộng đủ 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40, check 21+0+1+5+13 (13 lượt nhảy qua vì PR nháp). Hai tệp khớp nhau: cùng đổi trần 20 sang 30, cùng con số 3 phút và 10 phút, hạt giống nhắc lại số đo M5 còn design thêm số đo lại ngày 22/10 và nói rõ đó là hai phép đo khác nhau.
  rationale: Đề xuất PASS (ba lens cùng PASS). Hạt giống nêu đúng điều kiện mở lại và lý do chưa tách; bảng 40 lượt của design doc cộng đủ ở mọi hàng.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 1
  verified_at: 2026-10-22T13:39:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

- cmd: bun run lint:slop
  run_id: minted-tran-test-ci-30-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T13:39:52Z

Ghi chú về lệnh suite đỏ (không gắn eval nào): `bun run test -- --filter=app --filter=@crm/ui` chạy trọn 8 phút 16 giây. Ba trên bốn tác vụ turbo xanh. Tác vụ `app#test` đỏ ở script `test:dom`: tệp `test/truong-mot-cach.dom.tsx` xanh 15 trên 15, rồi `chay-dom` gọi tiếp `test/truong-tep.dom.tsx` và bun báo `Test filter "./test/truong-tep.dom.tsx" had no matches`, nên script thoát lỗi và kéo `test` đỏ theo. Đây là suite hồi quy của `app`, không phải eval khai trong hợp đồng; cần người xem tệp `truong-tep.dom.tsx` có tồn tại ở cây này không (hoặc bộ chạy `chay-dom` còn trỏ vào tệp đã đổi tên) trước khi chạy lại.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có eval nào để liệt kê. Field `baseline` của từng block eval ghi n-a vì round này không đo lại. Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, xác định; không eval nào có pass_rate lẫn)

## Iterations

Round 1: REJECT — suite app-ui đỏ (gói bằng chứng S4 lượt 1). Returned to implementation.
Round 2: REJECT — E1, E2, E3 mang từ round 1 (delta không chạm paths của eval); E4 hội đồng đề xuất PASS; lệnh suite `bun run test -- --filter=app --filter=@crm/ui` còn đỏ ở `app#test` (`test:dom`, tệp `test/truong-tep.dom.tsx` không khớp bộ lọc của bun), sáu lệnh suite còn lại xanh. Returned to implementation.

