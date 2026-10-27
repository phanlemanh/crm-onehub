---
schema_version: 2
feature_slug: hop-tuan-mo-dung-bo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7ff1af1a5ee1a0ad245658ba545860dd1dc30e1b
human_signoff: Phan Le Manh 2026-10-26
---

# Evidence Report: hop-tuan-mo-dung-bo

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | ui-check | PASS |
| E12 | AC-10 | script | PASS |

## Evidence

- eval: E12
  run_id: minted-hop-tuan-mo-dung-bo-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htmb_khong_doi_hinh
  verified_at: 2026-10-25T22:11:06Z
  output: |
    KET LUAN khong-doi-hinh: dat

- eval: E1
  run_id: minted-hop-tuan-mo-dung-bo-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htmb_man_duong
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-hop-tuan-mo-dung-bo-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_bo_api
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-hop-tuan-mo-dung-bo-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_chuyen
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-hop-tuan-mo-dung-bo-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_thanh_ben
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-hop-tuan-mo-dung-bo-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_hang_so
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-hop-tuan-mo-dung-bo-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_o_so
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-hop-tuan-mo-dung-bo-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_chua_kr
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-hop-tuan-mo-dung-bo-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_toan_canh_api
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-hop-tuan-mo-dung-bo-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_ly_do
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-hop-tuan-mo-dung-bo-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.htmb_tai
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: E11-htmb-anh-20261026
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.htmb_man
  verified_at: 2026-10-25T18:56:15Z
  carried_from_round: 1
  screenshot: evidence/E11-step1.png
  observed: |
    Đã mở từng ảnh trong 12 frame (E11-step1..12). Hàng bốn ô «Đã cập nhật 4/4», «Đang bàn 1», «Tự tin thấp 0», «Ngày còn lại 56» đọc trọn, không cắt; thanh bên/hàng cuộn ngang có «Bộ OKR» đang chọn và không có mục «Họp tuần»; sáng và tối đều đọc rõ, 375 là lưới hai cột hai hàng.
    Ảnh chưa có KR nêu tên bộ và kỳ, có liên kết «Xem mọi bộ OKR», không hàng số; ảnh danh sách đơn vị có câu «OneHub Center chưa có KR công bố…» và các mục «n KR · đã cập nhật m» đọc trọn. Khớp Expected, đủ 12 ảnh; bàn đo in 33 dòng DUNG, 0 SAI.
  network_observed: n-a (driver)
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bun run lint:slop
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-tuan-mo-dung-bo-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-25T22:11:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

none — khong co eval khong-phan-biet duoc liet ke; baseline cua moi eval la n-a (round nay khong do lai).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E12 failed — phép đo E12 so mã thoát của các mục khep-ky-okr#E14 và tro-ly-okr-de-xuat#E24 với mặc định thay vì với expected_exit từng eval đã khai. Returned to implementation (sửa ở 57c82772c, sổ ở 66adc6780).
Round 2: E12 chạy lại trên cây đã sửa, đạt (run_id minted-hop-tuan-mo-dung-bo-E12-r2); E1–E11 carry-forward từ round 1 vì delta không chạm paths của các eval này; bảy lệnh suite chạy lại, đều xanh. Ghi chú: dòng r2 chưa có trong run-log lúc soạn báo cáo, nên verified_at của E12 và của các lệnh suite round 2 là mốc ngày chạy 26/10 do người soạn đặt, không phải giờ do máy in.

### Re-pin lần 1 — 2026-10-27, do gộp onehub 518f05802 (#573 sửa thước đọc lệnh viết thẳng); E12 HT1 sửa như #573 rồi nghỉ sang kiem-cheo-sau-gop#AC-6
run_id: repin-20261027T004022Z-21289
sha: 7ff1af1a5ee1a0ad245658ba545860dd1dc30e1b · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E12 · thay bởi hồ sơ đã ký: E12→kiem-cheo-sau-gop#AC-6 · ngoài làn máy: E11 · AC không có chốt máy: AC-9, AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
