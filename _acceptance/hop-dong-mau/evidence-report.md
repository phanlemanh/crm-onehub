---
schema_version: 2
feature_slug: hop-dong-mau
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ab72f2310e1751eaccd0b3f4a7cd0270c1e9ff0e
human_signoff:
---

# Evidence Report: hop-dong-mau

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

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — khong eval nao bi liet ke la khong-phan-biet; moi eval carry-forward mang baseline n-a vi round nay khong do lai, cac lenh suite xanh o ca hai phia la regression-guard binh thuong.

## Evidence

- eval: E1
  run_id: mvjmw38d8qh2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_bo_mau
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: mvjmw43se9ew
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_doc_chu
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: mvjmw3ghzme8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_nap
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3b
  run_id: mvjmw4b09xzj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_khong_ghi_thang
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: mvjmw4uq0lm3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_chay_lai
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: mvjmw3ktqiig
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_chan
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: mvjmw4g5yrf4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hdm_thoat
  verified_at: 2026-10-22T14:25:42Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  rationale: Mục «Bộ hợp đồng mẫu» của docs/setup.md (dòng 175-208) trả lời đủ cả năm câu bằng chữ thường. Lệnh làm gì, cần gì trước, chạy lại có an toàn không, bị chặn ở đâu, và đáp án nằm ở đâu đều có chữ rõ ràng.
  panel_proposal: PASS
  panel:
    - domain-correctness: PASS — Mục «Bộ hợp đồng mẫu» trong docs/setup.md (dòng 175-208) trả lời đủ cả năm câu. Lệnh gắn sáu hợp đồng mẫu vào ô Tệp «Hợp đồng» và tạo công ty, bảy thoả thuận, trường và người dùng mẫu. Điều kiện cần là workspace, TEP_BAN_GHI_BLOB_TOKEN và kiểu trường Tệp (`bun run db:migrate`), kèm mã thoát 6 và 4 khi thiếu. Chạy lại không nhân đôi tệp, bản ghi hay trường. Lệnh bị chặn với mã 2 trên production, preview hay cơ sở dữ liệu không ở máy cục bộ. Đáp án nằm ở `packages/db/mau/hop-dong/dap-an.json`, gồm ngày ký, ngày hết hạn và giá trị.
    - operational-feasibility: PASS — Mục «Bộ hợp đồng mẫu» của docs/setup.md (dòng 175-208) trả lời đủ cả năm câu. Lệnh làm gì: gắn sáu hợp đồng mẫu vào ô Tệp «Hợp đồng», tạo công ty, bảy thoả thuận, trường và người dùng mẫu. Cần trước: workspace (kèm cách tạo bằng dev:session), TEP_BAN_GHI_BLOB_TOKEN trong .env, kiểu trường Tệp qua bun run db:migrate; thiếu thì dừng mã 6 hoặc 4 và không ghi gì. Chạy lại không nhân đôi tệp, bản ghi hay trường. Production và kho xa bị chặn với mã 2, không cờ nào vượt được. Đáp án ngày ký, ngày hết hạn, giá trị nằm ở packages/db/mau/hop-dong/dap-an.json, đọc bằng boHopDongMau(). Mục này không nhắc tên «DA19», nhưng gọi đúng thứ cần có là kiểu trường Tệp, nên người mới vẫn hiểu.
    - spec-alignment: PASS — Mục «Bộ hợp đồng mẫu» của docs/setup.md (dòng 175-208) trả lời rõ cả năm câu. (1) Lệnh gắn sáu hợp đồng mẫu vào ô Tệp «Hợp đồng», tạo công ty mẫu, bảy thoả thuận, trường Tệp và người dùng mẫu. (2) «Cần trước» liệt kê workspace, `TEP_BAN_GHI_BLOB_TOKEN` và kiểu trường Tệp qua `bun run db:migrate`, kèm mã thoát khi thiếu. (3) «Chạy lại an toàn» nói không nhân đôi tệp, bản ghi hay trường. (4) «Không bao giờ chạy trên production» nêu rõ các điều kiện bị từ chối và nói không cờ nào vượt được, gồm cả cơ sở dữ liệu không ở máy cục bộ. (5) Đáp án nằm ở `packages/db/mau/hop-dong/dap-an.json`. Chỗ duy nhất hơi lệch là tệp không gọi tên «DA19», nhưng ý «kho đã có kiểu trường Tệp» thì rõ.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-dong-mau-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-dong-mau-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bun run lint:slop
  run_id: minted-hop-dong-mau-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-dong-mau-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-22T15:45:08Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lệnh suite `bun run test -- --filter=api` đỏ chập chờn, không gắn eval nào; các eval E1-E6 đều xanh. Trả về để chạy lại.
Round 2: toàn bộ bảy lệnh suite xanh trên cây ab72f2310; E1-E6 carry-forward từ round 1 vì delta không chạm paths của eval; E7 giữ đề xuất PASS, để trống human_override cho người quyết ở Cổng 2.
