---
schema_version: 2
feature_slug: ngan-kr-mot-cho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7ec85392c3bcba56fe4c2261d0d935318290becb
human_signoff:
---

# Evidence Report: ngan-kr-mot-cho

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ngan-kr-mot-cho-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_moi_loi
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-ngan-kr-mot-cho-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_dau_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-ngan-kr-mot-cho-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_than_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-ngan-kr-mot-cho-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_kr_ke
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-ngan-kr-mot-cho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_cap_nhat_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-ngan-kr-mot-cho-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_tren_dong
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-ngan-kr-mot-cho-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ghi_that
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-ngan-kr-mot-cho-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ba_bam
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-ngan-kr-mot-cho-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_xem_truoc
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-ngan-kr-mot-cho-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_hep
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-ngan-kr-mot-cho-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_trang_thai
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-ngan-kr-mot-cho-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_man
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  screenshot: evidence/hop-dong-1440.png
  observed: |
    hop-dong-1440.png: hộp thoại giữa màn tối "Cập nhật KR – Đối tác hàng lạnh mới đạt 10", Giá trị 12 đối tác, dòng "Hiện tại 11 đối tác · đích 10 · +1", biểu đồ có điểm mới rỗng ở 12, "Tiến độ mới 100%", Mức tự tin chọn "Thấp" (viền sáng), nút "Gửi cập nhật". Khớp bước 2 (hộp có điểm mới trước khi gửi, tự tin thấp). ngan-kr-1440.png: ngăn bên phải URL KR k1 "Đối tác hàng lạnh mới đạt 10", Hiện tại 12 đối tác, Tiến độ 100%, đầu ngăn có 1/4, ‹ ›, nút Cập nhật, ✕; lịch sử 6 dòng, dòng đầu 19 thg 10 "12 đối tác" tự tin thấp; toast "Đã gửi cập nhật". ngan-sau-cap-nhat-1440.png: cùng ngăn k1 vẫn mở, Hiện tại đổi thành 13 đối tác, dòng đầu 19 thg 10 "13 đối tác" tự tin cao, vẫn 6 dòng lịch sử (thay vì +1, do gom tuần). kr-ke-1440.png: ngăn chuyển sang "Thoả thuận mới hàng lạnh đạt 25", 2/4, Hiện tại 12,1, tooltip "KR kế" — khớp bấm KR kế. so-do-1440.png và cua-toi-1440.png: ảnh giống hệt nhau, ngăn KR k1 với Hiện tại 13, nút Cập nhật, 1/4; không thấy sơ đồ hay trang Của tôi (nền trái đen). hop-dong-390.png: hộp thoại khổ điện thoại, Giá trị 14, "Lần trước 13 · +1 so với lần trước", Mức tự tin chọn "Vừa", nút "Gửi cập nhật" và "Huỷ" xếp dọc, không tràn ngang. ngan-390.png: Drawer đáy có tay nắm, tiêu đề "Đối tác hàng lạnh mới đạt 10", 1/4, ‹ ›, nút Cập nhật, Hiện tại 14 đối tác, lịch sử dòng đầu "14 đối tác · Tự tin vừa", toast "Đã gửi cập nhật"; không có thanh cuộn ngang. Tất cả khớp Expected (8 ảnh, mọi kiểm DUNG, console 0 lỗi), kèm ba lưu ý ở output.
  network_observed: n-a (driver)
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-ngan-kr-mot-cho-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_giu_ho_so
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bun run lint:slop
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-20T12:25:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (xanh ca tren HEAD lan baseline): none. Round nay khong do baseline nen moi eval ghi baseline n-a; lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Judge panels

Khong co judgment item nao trong hop dong nay: 13 eval deu la test, ui-check hoac script. Khong co panel de ghi.

## Iterations

Round 1: lenh suite app va @crm/ui do vi mot ca suite chap chon nam ngoai vong (S4 round 1 tra ve REJECT). Quay lai de chay lai suite.
Round 2: 13 eval giu nguyen tu round 1 vi delta khong cham paths cua eval; 7 lenh suite chay lai va xanh het. Gio verified_at cua lenh suite lay theo ngay chay, gio chinh xac nam trong run-log.

