---
schema_version: 2
feature_slug: ngan-kr-mot-cho
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 81a0533b008b0c74df3934f955c5946c73383a8f
human_signoff:
---

# Evidence Report: ngan-kr-mot-cho

Round 3 (chấm delta sau #516). E1, E6, E8, E10, E11, E12, E13 chạy lại ở round này; E2, E3, E4, E5, E7, E9 mang từ round 1 vì delta không chạm paths của chúng.

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
  run_id: minted-ngan-kr-mot-cho-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_moi_loi
  verified_at: 2026-10-21T02:12:49Z
  output: |
    DUNG

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
  run_id: minted-ngan-kr-mot-cho-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_tren_dong
  verified_at: 2026-10-21T02:12:49Z
  output: |
    Ran 1 test across 1 file. [2.58s]

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
  run_id: minted-ngan-kr-mot-cho-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ba_bam
  verified_at: 2026-10-21T02:12:49Z
  output: |
    (đuôi đầu ra của lệnh chỉ có dòng báo mã thoát 0, không có dòng tóm tắt của bun test)

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
  run_id: minted-ngan-kr-mot-cho-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_hep
  verified_at: 2026-10-21T02:12:49Z
  output: |
    Ran 2 tests across 1 file. [2.13s]

- eval: E11
  run_id: minted-ngan-kr-mot-cho-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_trang_thai
  verified_at: 2026-10-21T02:12:49Z
  output: |
    Ran 170 tests across 1 file. [862.00ms]

- eval: E12
  run_id: minted-ngan-kr-mot-cho-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_man
  verified_at: 2026-10-21T02:12:49Z
  screenshot: evidence/hop-dong-1440.png
  observed: |
    Đã mở từng ảnh bằng Read.
    1) hop-dong-1440.png: hộp «Cập nhật KR» (Đối tác hàng lạnh mới đạt 10), ô Giá trị gõ 12 «đối tác», dòng «Hiện tại 11 đối tác · đích 10 · +1 so với hiện tại», biểu đồ có điểm mới (vòng rỗng) ở cuối đường liền, «Tiến độ mới 100%», mức tự tin Cao/Vừa/Thấp với Thấp được chọn, nút Huỷ và «Gửi cập nhật». Khớp: hộp có điểm mới trước khi gửi, giá trị 12, mức Thấp. Nền đen phía sau là lớp phủ của hộp thoại (ảnh chụp chỉ hộp).
    2) ngan-kr-1440.png: ngăn bên phải mở trên KR «Đối tác hàng lạnh mới đạt 10», 1/4, nút Cập nhật ở đầu ngăn cùng ‹ ›; Hiện tại 12 đối tác, Tiến độ 100%, lịch sử 6 dòng, dòng mới nhất «19 thg 10, 2026 12 đối tác · Tự tin thấp»; toast «Đã gửi cập nhật». Khớp bước gửi từ dòng (12, thấp).
    3) ngan-sau-cap-nhat-1440.png: cùng ngăn vẫn mở sau khi gửi từ đầu ngăn; Hiện tại đổi 12 -> 13 đối tác, dòng mới nhất «13 đối tác · Tự tin cao», vẫn 6 dòng (gom theo tuần) và biểu đồ có điểm 13; toast «Đã gửi cập nhật». Khớp.
    4) kr-ke-1440.png: sau bấm KR kế, ngăn đổi sang «Thoả thuận mới hàng lạnh đạt 25» 2/4, Hiện tại 12,1 thoả thuận, tooltip «KR kế», ngăn vẫn mở. Khớp (đường dẫn đổi sang ...-k2 theo kiểm DUNG của script).
    5) so-do-1440.png: ngăn mở trên KR K (13 đối tác, 1/4) sau khi bấm thẻ K trong sơ đồ (record=kr:K theo script). Khớp.
    6) cua-toi-1440.png: giống so-do (cùng ngăn KR K, 13 đối tác, 1/4) sau khi bấm khối KR ở Của tôi; kích thước tệp giống hệt so-do là hợp lý vì cùng đích. Khớp.
    7) hop-dong-390.png: hộp «Cập nhật KR» ở khổ 390, giá trị 14, «Lần trước 13 · +1 so với lần trước», điểm mới trên biểu đồ, mức Vừa được chọn, nút «Gửi cập nhật» và Huỷ xếp dọc, không tràn ngang. Khớp.
    8) ngan-390.png: ngăn KR dạng Drawer từ đáy (có tay nắm kéo), Hiện tại 14 đối tác, 1/4, nút Cập nhật và ‹ › ở đầu, dòng mới nhất «14 đối tác · Tự tin vừa», toast «Đã gửi cập nhật», không thấy cuộn ngang. Khớp.
    Không có frame nào mâu thuẫn Expected. Hạn chế nhỏ: ảnh chỉ cho thấy phần KR của ngăn; việc ngăn M vẫn ở dưới được chứng minh bằng kiểm đường dẫn record=objective:M,kr:K của script (DUNG), không thấy trong ảnh.
  network_observed: n-a (driver)
  output: |
    Ảnh đã lưu (do chính lệnh eval ghi, 8 tệp, trong _acceptance/ngan-kr-mot-cho/evidence/): hop-dong-1440.png, ngan-kr-1440.png, ngan-sau-cap-nhat-1440.png, kr-ke-1440.png, so-do-1440.png, cua-toi-1440.png, hop-dong-390.png, ngan-390.png. Tên do eval đặt là đường chứng cứ (không đổi sang E12-stepN.png vì lượt chấm không được tạo tệp trong kho ngoài ảnh do lệnh eval tự ghi).
    Network: driver là script Playwright chạy trong man.mjs, không phải browser tool có read_network_requests; script tự kiểm console (0 lỗi mới ở cả hai khổ). Không có E12-network.txt vì không có dữ liệu mạng thô để dump.

- eval: E13
  run_id: minted-ngan-kr-mot-cho-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_giu_ho_so
  verified_at: 2026-10-21T02:12:49Z
  output: |
    KET LUAN: 315 GIU, 0 DO, 58 DO-SAN-NEN, 1 CHAP-CHON, 0 HOAN, 3 BO RA, 0 loi nghi, 267 lenh

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bun run lint:slop
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-21T02:12:49Z

## Known limits

- E13 báo 58 eval của hồ sơ đã ký khác đỏ sẵn trên nền merge-base (DO-SAN-NEN), trong đó có cap-nhat-tuan-okr E18 mà đề E13 nêu tên; 0 eval đỏ chỉ ở HEAD. Không phải hồi quy của vòng này, ghi để người đọc ở Cổng 2 biết.

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Baseline khong do: moi block eval ghi baseline n-a vi round nay khong do lai.

Eval không-phân-biệt (xanh cả HEAD lẫn baseline): none.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: lệnh suite app/@crm/ui đỏ trong log, tally REJECT. Trả về triển khai.
Round 2: bảy lệnh suite xanh, tally PASS; E2–E11, E13 mang từ round 1.
Round 3: chấm delta sau #516 ở commit 81a0533b0; E1, E6, E8, E10, E11, E12, E13 chạy lại, E2–E5, E7, E9 mang từ round 1; bảy lệnh suite xanh. Verdict PASS.
