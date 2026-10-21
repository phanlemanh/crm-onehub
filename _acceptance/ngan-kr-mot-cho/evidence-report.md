---
schema_version: 2
feature_slug: ngan-kr-mot-cho
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f1738ca88cbd66e5553b6ca45b738730160c332f
human_signoff:
---

# Evidence Report: ngan-kr-mot-cho

Round 4. Mọi eval gắn AC (E1 đến E13) đạt. Verdict REJECT vì một lệnh suite không gắn eval nào đỏ: `bun run test -- --filter=app --filter=@crm/ui` (bài `dh4-mo-the` trong `apps/app/test/okr-so-do-don-vi.dom.tsx`, chi tiết ở mục Lệnh suite).

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

Mốc giờ của các khối chạy ở round 4 (E1, E11, E12, E13 và lệnh suite) lấy theo giờ chụp E12 của lượt này (run_id `s4-r4-e12-20261021T0543Z`); nhật ký máy ghi giờ chính xác từng dòng.

- eval: E1
  run_id: minted-ngan-kr-mot-cho-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_moi_loi
  verified_at: 2026-10-21T05:43:13Z
  output: |
    DUNG

- eval: E11
  run_id: minted-ngan-kr-mot-cho-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_trang_thai
  verified_at: 2026-10-21T05:43:13Z
  output: |
    Ran 170 tests across 1 file. [795.00ms]

- eval: E13
  run_id: minted-ngan-kr-mot-cho-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_giu_ho_so
  verified_at: 2026-10-21T05:43:13Z
  output: |
    KET LUAN: 315 GIU, 0 DO, 60 DO-SAN-NEN, 0 CHAP-CHON, 0 HOAN, 3 BO RA, 0 loi nghi, 268 lenh

- eval: E12
  run_id: s4-r4-e12-20261021T0543Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk7_man
  verified_at: 2026-10-21T05:43:13Z
  screenshot: evidence/hop-dong-1440.png
  observed: |
    Đã Read từng ảnh vừa ghi lúc 12:44 (8 ảnh: hop-dong-1440, ngan-kr-1440, ngan-sau-cap-nhat-1440, kr-ke-1440, so-do-1440, cua-toi-1440, hop-dong-390, ngan-390).
    hop-dong-1440: hộp «Cập nhật KR» giữa nền tối, tiêu đề «Đối tác hạng lạnh mới đạt 10», ô Giá trị = 12 đối tác, dòng «Hiện tại 11 đối tác · đích 10 · +1 so với hiện tại», biểu đồ có điểm mới (vòng tròn rỗng ở 12) nối tiếp đường đặc, «Tiến độ mới 100%», Mức tự tin Cao/Vừa/Thấp với Thấp được chọn, nút «Gửi cập nhật». ngan-kr-1440: ngăn bên phải «Đối tác hạng lạnh mới đạt 10», «1/4», nút trước/sau, nút «Cập nhật», Hiện tại 12 đối tác, tiến độ 100%, lịch sử 6 dòng, toast «Đã gửi cập nhật». ngan-sau-cap-nhat-1440: ngăn vẫn mở, Hiện tại đổi thành 13 đối tác, dòng mới nhất 19 thg 10 13 đối tác «Tự tin cao», vẫn 6 dòng (gom theo tuần). kr-ke-1440: ngăn «Thỏa thuận mới hạng lạnh đạt 25», «2/4», tooltip «KR kế», Hiện tại 12,1 thỏa thuận.
    so-do-1440 và cua-toi-1440 giống hệt từng byte, cùng là ngăn KR K «Đối tác hạng lạnh mới đạt 10», 1/4, Hiện tại 13 đối tác; không thấy trang sơ đồ hay Của tôi phía sau, nên ảnh không tự phân biệt hai lối, log khẳng định record=kr:K cho cả hai. hop-dong-390: hộp vừa màn 390, giá trị 14 đối tác, «Lần trước 13 đối tác · đích 10 · +1», điểm mới trên biểu đồ, Mức tự tin Vừa được chọn, nút Gửi/Hủy xếp dọc, không vỡ khung. ngan-390: Drawer kéo từ dưới lên, «1/4», nút trước/sau, «Cập nhật», Hiện tại 14 đối tác, 100%, lịch sử dòng 19 thg 10 14 đối tác «Tự tin vừa», toast «Đã gửi cập nhật», không thấy thanh cuộn ngang.
    Cả 8 ảnh khớp Expected về nội dung (exit 0, từ 8 ảnh trở lên, mỗi kiểm in DUNG, console 0 lỗi); các lưu ý phụ: bước 3 nói «số dòng lịch sử tăng 1» nhưng script chỉ khẳng định lichSau >= lichTruoc (6 -> 6, gom theo tuần, dòng mới nhất đổi 12 -> 13); hai ảnh so-do và cua-toi trùng byte; hộp 1440 hiện «Chưa có lần cập nhật nào» dưới Mức tự tin trong khi K có 6 điểm lịch sử, hộp 390 hiện «Lần trước: cao».
  network_observed: n-a (driver)
  output: |
    DUNG đủ 8 ảnh (8).
    Ảnh do chính lệnh eval ghi (mtime 12:44, 8 ảnh) trong _acceptance/ngan-kr-mot-cho/evidence/.
    Console do chính script báo 0 lỗi; driver không đọc được network nên network_observed là n-a (driver).

- eval: E2
  run_id: minted-ngan-kr-mot-cho-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_dau_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E3
  run_id: minted-ngan-kr-mot-cho-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_than_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E4
  run_id: minted-ngan-kr-mot-cho-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_kr_ke
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E5
  run_id: minted-ngan-kr-mot-cho-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_cap_nhat_ngan
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E6
  run_id: minted-ngan-kr-mot-cho-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_tren_dong
  verified_at: 2026-10-21T02:12:49Z
  carried_from_round: 3
  output: |
    carry-forward từ round 3 — delta không chạm paths của eval

- eval: E7
  run_id: minted-ngan-kr-mot-cho-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ghi_that
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E8
  run_id: minted-ngan-kr-mot-cho-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_ba_bam
  verified_at: 2026-10-21T02:12:49Z
  carried_from_round: 3
  output: |
    carry-forward từ round 3 — delta không chạm paths của eval

- eval: E9
  run_id: minted-ngan-kr-mot-cho-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_xem_truoc
  verified_at: 2026-10-20T10:39:19Z
  carried_from_round: 1
  output: |
    carry-forward từ round 1 — delta không chạm paths của eval

- eval: E10
  run_id: minted-ngan-kr-mot-cho-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk7_hep
  verified_at: 2026-10-21T02:12:49Z
  carried_from_round: 3
  output: |
    carry-forward từ round 3 — delta không chạm paths của eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 1
  verified_at: 2026-10-21T05:43:13Z
  ghi chú: lệnh không gắn eval nào. Bài đỏ nguyên văn từ log: «(fail) dh4-mo-the > mở thẻ liệt kê mục tiêu, góp vào đâu, mức tin và lý do theo từng chỗ nối» tại apps/app/test/okr-so-do-don-vi.dom.tsx:544, «Expected: 0 / Received: 1» ở phép đếm [data-slot="kara-trace"]; turbo báo «Failed: app#test». Nguyên nhân gốc: chưa rõ (chưa chạy lại trên nền merge-base nên chưa biết đỏ sẵn hay do vòng này).

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

- cmd: bun run lint:slop
  run_id: minted-ngan-kr-mot-cho-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-kr-mot-cho-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-21T05:43:13Z

## Known limits

- E13 in 60 mục DO-SAN-NEN: eval của hồ sơ khác đỏ sẵn trên nền merge-base (gồm cap-nhat-tuan-okr E18, thước màn gãy từ b9be1abfb và 6c1bf4e52), không do vòng này.

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline không đo ở round này; mọi khối eval ghi baseline n-a. Không có eval nào xanh trên cả hai phía được liệt kê: none.

## Variance

none — mọi eval chạy một lần, kết quả đồng nhất

## Iterations

Round 1: E1 đến E10 chạy, đạt (run_id đuôi -r1).
Round 2: E6, E8, E10 mang sang từ round 1, không chạy lại.
Round 3: E6, E8, E10 chạy lại, đạt (run_id đuôi -r3).
Round 4: E1, E11, E12, E13 chạy lại, đạt; lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở bài dh4-mo-the (okr-so-do-don-vi.dom.tsx), nguyên nhân gốc chưa rõ. Verdict REJECT, trả về để xác định bài đó đỏ sẵn trên nền hay do vòng này.
