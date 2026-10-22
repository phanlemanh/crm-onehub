---
schema_version: 2
feature_slug: hop-dong-mau
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ac26961b4cdfef895c5e24bcf8ca6fe878ef0156
human_signoff:
---

# Evidence Report: hop-dong-mau

Vòng 1. Bảy eval máy đều xanh, nhưng một lệnh suite không gắn eval nào (`bun run test -- --filter=api`) đỏ: một bài trong gói api hết hạn ở bước beforeEach/afterEach. Vì vậy kết luận chung là REJECT. Chi tiết ở mục «Lệnh suite (hồi quy)» bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | judgment | PASS |

## Evidence

- eval: E1
  run_id: mvjmw38d8qh2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_bo_mau
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw38d8qh2_test

- eval: E2
  run_id: mvjmw43se9ew
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_doc_chu
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw43se9ew_test

- eval: E3
  run_id: mvjmw3ghzme8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_nap
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw3ghzme8_test

- eval: E3b
  run_id: mvjmw4b09xzj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_khong_ghi_thang
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw4b09xzj_test

- eval: E4
  run_id: mvjmw4uq0lm3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_chay_lai
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw4uq0lm3_test

- eval: E5
  run_id: mvjmw3ktqiig
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_chan
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw3ktqiig_test

- eval: E6
  run_id: mvjmw4g5yrf4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_thoat
  verified_at: 2026-10-22T14:25:42Z
  output: |
    test-run: dropped crm_mvjmw4g5yrf4_test

- eval: E7
  judged_by: judge panel (fresh context, ba góc nhìn) — đề xuất, chưa người chốt
  verdict: PASS
  rationale: Mục «Bộ hợp đồng mẫu» trong docs/setup.md (dòng 175-208) trả lời đủ năm câu bằng chữ thường, không mơ hồ: lệnh làm gì, cần gì trước, chạy lại có an toàn không, bị chặn khi nào, đáp án nằm ở đâu.
  panel:
    - domain-correctness: PASS — Mục «Bộ hợp đồng mẫu» trong docs/setup.md (dòng 175-208) trả lời đủ năm câu. Lệnh gắn sáu hợp đồng vào ô Tệp «Hợp đồng» của bảy thoả thuận mẫu. Điều kiện trước là workspace, `TEP_BAN_GHI_BLOB_TOKEN` và kiểu trường Tệp (`bun run db:migrate`), kèm mã thoát 6 và 4. Chạy lại không nhân đôi tệp, bản ghi hay trường. Lệnh bị từ chối với mã 2 trên production và trên cơ sở dữ liệu không ở máy cục bộ. Ngày ký, ngày hết hạn và giá trị nằm ở `packages/db/mau/hop-dong/dap-an.json`.
    - operational-feasibility: PASS — Mục «Bộ hợp đồng mẫu» trong docs/setup.md (dòng 175-208) trả lời đủ năm câu mà không mơ hồ. (1) Lệnh gắn sáu hợp đồng mẫu vào ô Tệp «Hợp đồng» của các thoả thuận mẫu, và nêu rõ những gì nó tạo. (2) «Cần trước» gồm workspace (kèm cách tạo), `TEP_BAN_GHI_BLOB_TOKEN` trong `.env`, và kiểu trường Tệp qua `bun run db:migrate`, kèm mã thoát 6 và 4 khi thiếu. (3) «Chạy lại an toàn» nói chạy lại không nhân đôi tệp, bản ghi hay trường. (4) «Không bao giờ chạy trên production» nêu các điều kiện chặn (production, preview, cơ sở dữ liệu không ở máy cục bộ), mã 2, không cờ nào vượt được. (5) Ngày ký, ngày hết hạn và giá trị nằm ở `packages/db/mau/hop-dong/dap-an.json`. Chi tiết nhỏ: tài liệu không gọi tên «DA19», nhưng đã mô tả đúng điều kiện là kiểu trường Tệp qua migrate, nên người mới vẫn trả lời đúng.
    - spec-alignment: PASS — Mục «Bộ hợp đồng mẫu» trong docs/setup.md (dòng 175-208) trả lời cả năm câu rõ ràng. Lệnh gắn sáu hợp đồng vào ô Tệp «Hợp đồng» và tạo công ty, bảy thoả thuận, trường, người dùng mẫu. «Cần trước» nêu workspace, TEP_BAN_GHI_BLOB_TOKEN và kiểu trường Tệp qua `bun run db:migrate`, kèm mã thoát 6 và 4. Chạy lại không nhân đôi gì. Lệnh bị chặn mã 2 khi là production, preview hay cơ sở dữ liệu không ở máy cục bộ, không cờ nào vượt được. Đáp án ngày ký, ngày hết hạn, giá trị nằm ở `packages/db/mau/hop-dong/dap-an.json`. Tệp không gọi đích danh «DA19», nhưng ý «ô Tệp và kiểu trường Tệp» vẫn đủ để người mới làm đúng.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

Một lệnh suite không gắn eval nào đỏ, nên không có eval nào trong `failed_evals`, nhưng báo cáo vẫn là REJECT. Lệnh đỏ là `bun run test -- --filter=api`: 2050 bài đạt, 16 bỏ qua, 1 bài hỏng. Bài hỏng không có tên, báo «a beforeEach/afterEach hook timed out for this test» (5008.60ms), kèm 1 lỗi. Dòng bỏ qua gần đó thuộc `gieo-nguoi-song-song > gnss-dong-thoi`. Chưa có dữ liệu cho biết lỗi này có liên quan tới tính năng hay là bập bênh sẵn có; cần người xem và chạy lại ở Cổng 2.

- cmd: bun run test -- --filter=api
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-22T14:25:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-dong-mau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

- cmd: bun run lint:slop
  run_id: minted-hop-dong-mau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-dong-mau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T14:25:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- bun run test -- "cd apps/agent && bun test test/hop-dong-mau.spec.ts -t hdm-bo-mau": bo qua baseline: tep apps/agent/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/hop-dong-mau.spec.ts -t hdm-doc-chu": bo qua baseline: tep apps/agent/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-dong-mau.spec.ts -t hdm-nap": bo qua baseline: tep apps/api/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-dong-mau.spec.ts -t hdm-khong-ghi-thang": bo qua baseline: tep apps/api/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-dong-mau.spec.ts -t hdm-chay-lai": bo qua baseline: tep apps/api/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-dong-mau.spec.ts -t hdm-chan": bo qua baseline: tep apps/api/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-dong-mau.spec.ts -t hdm-thoat": bo qua baseline: tep apps/api/test/hop-dong-mau.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bảy eval máy xanh (E1-E6 và E3b), E7 do hội đồng đề xuất PASS chờ người; lệnh suite `bun run test -- --filter=api` đỏ vì một bài hết hạn ở bước beforeEach/afterEach, không gắn eval nào. Verdict REJECT, trả về cho người xem lỗi suite.
