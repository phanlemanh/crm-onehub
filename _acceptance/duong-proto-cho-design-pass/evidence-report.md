---
schema_version: 2
feature_slug: duong-proto-cho-design-pass
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f1dc3a0b31cebbabb5759766220011401697308a
human_signoff: Mạnh 2026-09-16
---

# Evidence Report: duong-proto-cho-design-pass

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | script | PASS |
| E12 | AC-13 | test | PASS |
| E13 | AC-12 | ui-check | PASS |
| E14 | AC-14 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-16 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-duong-proto-cho-design-pass-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E2
  run_id: minted-duong-proto-cho-design-pass-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E3
  run_id: minted-duong-proto-cho-design-pass-E3-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_ban_dung
  verified_at: 2026-09-16T12:15:00Z
  output: |
    OK ban-dung: cap hai chieu tren CUNG mot cay dung (.next-proto-do)

- eval: E4
  run_id: minted-duong-proto-cho-design-pass-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E5
  run_id: minted-duong-proto-cho-design-pass-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E6
  run_id: minted-duong-proto-cho-design-pass-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E7
  run_id: minted-duong-proto-cho-design-pass-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T12:10:00Z
  output: |
    OK muc-luc

    OK tat-ca: 6/6 chan dat

- eval: E8
  run_id: minted-duong-proto-cho-design-pass-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_so_dang_ky
  verified_at: 2026-09-16T12:17:00Z
  output: |
    OK so-dang-ky: 1 muc, 1 component

- eval: E9
  run_id: minted-duong-proto-cho-design-pass-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_config_tro_vat_that
  verified_at: 2026-09-16T12:18:00Z
  output: |
    OK khai-bao (config)

- eval: E10
  run_id: minted-duong-proto-cho-design-pass-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_khai_bao
  verified_at: 2026-09-16T12:18:30Z
  output: |
    OK khai-bao (bien)

- eval: E11
  run_id: minted-duong-proto-cho-design-pass-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_khong_goi_server
  verified_at: 2026-09-16T12:19:00Z
  output: |
    OK khong-goi-server: quet 7 tep

- eval: E12
  run_id: minted-duong-proto-cho-design-pass-E12-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp_proxy_an_danh
  verified_at: 2026-09-16T12:20:00Z
  output: |
     0 fail
     9 expect() calls
    Ran 4 tests across 1 file. [10.00ms]

- eval: E13
  run_id: minted-duong-proto-cho-design-pass-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-16T12:12:00Z
  output: |
    NETWORK TRUTH: driver cua toan bo eval nay la Bash (curl de doi 200 + script ui:capture cua repo, khong phai browser-tool co read_network_requests) → khong co duong doc network → networkObserved = "n-a (driver)" (gia tri nay khong lam eval fail theo luat).

    Tong ket: 20/20 o co anh, dung 20 file, khong o nao trang, khong trung hash trong tung nhom (kho,theme), dark khac light ro rang o moi cap da kiem. Server tat dung PID, khong dung pkill rong, khong cham server khac. exitCode=0.
  screenshot: _acceptance/duong-proto-cho-design-pass/evidence/design-pass/mac-dinh--1280--light.png
  observed: |
    Đọc trực tiếp 8/20 file PNG bằng Read (đại diện đủ 5 state x 2 khổ x 2 theme): mac-dinh--1280--light, mac-dinh--1280--dark, mac-dinh--375--light, rong--1280--light, rong--375--dark, dang-tai--1280--light, dang-tai--375--dark, loi--1280--light, loi--375--dark, tran-dai--1280--light, tran-dai--375--dark (11 file thực tế đã mở). Không file nào trắng/trống nội dung. mac-dinh: 3 card đối tác (Ngân hàng Đại Nam / Sàn Phương Bắc / Công ty Tân Việt) với badge trạng thái, nền sáng (#f9f9f9-ish) ở light, nền đen tuyền ở dark, chữ trắng — khác biệt rõ bằng mắt. rong: khung trắng/tối với dòng "Chưa có đối tác nào" giữa khung, không phải danh sách trống trơn. dang-tai: 3 thanh skeleton bo góc, màu xám nhạt (light) / xám đậm trên nền đen (dark), có dáng pulse-bar điển hình của component Skeleton chứ không phải div kẻ tay. loi: khối thông báo lỗi "Không tải được danh sách đối tác / Máy chủ không trả lời. Thử lại sau ít phút." nền xám nhạt viền mảnh. tran-dai: danh sách 24 đối tác tên rất dài, tràn cuộn dọc đúng như state overflow. Thanh chuyển state (Mặc định/Rỗng/Đang tải/Lỗi/Tràn dài) ở mọi ảnh đã xem đều là hàng nút bo góc rounded-md, item đang chọn tô đặc màu xanh brand (#006B4F-ish) chữ trắng, các item còn lại là chip viền/nền trắng (dark: chip nền tối viền mảnh) — đúng mẫu Button primary/outline của packages/ui, không thấy dấu hiệu div kẻ tay bằng className tuỳ ý.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-duong-proto-cho-design-pass-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-16T12:23:00Z
  output: |
    agent:build: [BUILD] built output at /Users/manhphan/dev/crm-onehub/.claude/worktrees/agitated-kilby-4b9585/apps/agent/.output
    agent:build: [nitro] ✔ You can preview this build using npx nitro preview

- eval: E15
  run_id: minted-duong-proto-cho-design-pass-E15-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-16T12:29:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    7.773s

- eval: E16
  run_id: minted-duong-proto-cho-design-pass-E16-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_nha_thu_ba
  verified_at: 2026-09-16T12:21:00Z
  output: |
    OK khai-bao (nha-thu-ba)

- eval: E17
  run_id: minted-duong-proto-cho-design-pass-E17-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_slug_giai_duoc
  verified_at: 2026-09-16T12:21:30Z
  output: |
    OK khai-bao (slug)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mu3ocm9wptgc
  exit_code: 0
  verified_at: 2026-09-16T12:05:00Z
  output: |
      Time:    27.763s

    test-run: dropped crm_mu3ocm9wptgc_test

- cmd: bunx turbo run lint --force
  run_id: minted-duong-proto-cho-design-pass-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-16T12:07:00Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    375ms

- cmd: bun run lint:slop
  run_id: minted-duong-proto-cho-design-pass-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-16T12:08:00Z
  output: |
    oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 394ms on 1011 files with 9 rules using 18 threads.

## Known limits

## Ngoài hợp đồng

## Analyst

E15 (check-types, config:executors.script.check_types_khong_cache) — pass trên cả HEAD và baseline (green/green); là regression-guard cho toàn kho, không phải bằng chứng phân biệt riêng cho tính năng proto/AC-14. Cân nhắc viết lại để assert hành vi kiểu mới do proto thêm vào (vd. ProtoState, catalog.ts), hoặc xác nhận đây là regression-guard có chủ ý và giữ nguyên.

## Variance

none — không có eval nào mang field runs > 1 trong vòng này; mọi kết quả đều deterministic (runs=1) và không biến thiên giữa các lần chạy đã ghi.

## Iterations

Round 1: E3 (dp_ban_dung) và E7 (dp_muc_luc) thất bại (mã 1 và 2) vì một tiến trình `next build`/`next dev` khác đang chiếm `apps/app/.next` và cổng 51063; E4 (dp_state_chon_duoc) không chạy được vì máy chủ riêng của răng không lên trong 90s do cổng đó đã bị PID 51725 giữ. Verdict BLOCKED.
Round 2: E2 (dp_co_tat, PID 61807), E6 (dp_slug_la, PID 61718) và E7 (dp_muc_luc, PID 61807) không chạy được vì một máy chủ Next khác đang khóa `apps/app` theo THƯ MỤC (không theo cổng), và dừng nó có thể phá hỏng verifier khác đang chạy song song nên không tự ý kill; E14 (build --force) thất bại thật (mã 1) vì một tiến trình `next build` khác đang chạy. Verdict BLOCKED — chưa quay về implementation, cần dừng các tiến trình Next cạnh tranh (xác nhận an toàn rồi kill PID 61807/61718) trước khi verify lại từ đầu vòng.
Round 3: E8 (dp_so_dang_ky) thất bại thật (mã 2) vì so-dang-ky.mjs vẫn ghim cứng slug cũ "duong-proto" trong khi catalog.ts đã đổi sang "duong-proto-cho-design-pass" từ round trước, nên sàn cứng chặn ngay và toàn bộ đối chiếu catalog↔registry không chạy được; E1/E2/E4/E5/E6/E7 (dp_duong_song, chạy gộp `tat-ca`) không đo được vì một máy chủ Next khác (PID 73707) khóa `apps/app` theo thư mục, server test không lên nổi trong 90s. Verdict BLOCKED — không tự ý pkill nhiều lần theo hướng dẫn của vòng này; cần dừng PID 73707 và sửa so-dang-ky.mjs dùng SLUG_HO_SO thay vì hằng cứng trước khi verify lại từ đầu.
Round 4: so-dang-ky.mjs đổi sang nạp slug hồ sơ qua SLUG_HO_SO thay vì viết tay (de62f1b), và bước dọn máy chủ của E13 đổi sang dừng theo PID đã in ra thay vì pkill rộng (852dc77) — cả 17 eval và ba lệnh suite hồi quy (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`) chạy hết, không còn máy chủ Next nào tranh khóa thư mục. Verdict PASS.

### Re-pin lần 1 — 2026-09-18, do hoa cu do tron origin/onehub vao nhanh truoc khi mo PR
run_id: repin-20260918T123301Z-81551
sha: 83457a0979f2332fd2ed396d7cbccf5facac3989 · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T053254Z-97828
sha: 3f3c60fe85ce0734a0f149a37c6c24dd52b98a74 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E13 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12

### Re-pin lần 3 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T102557Z-19741
sha: c0d7bd90bfedb66192708fd6a8e15fb7f08c5700 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E13 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12

### Re-pin lần 4 — 2026-10-04, do sua-thuoc-sau-gop
run_id: repin-20261004T122715Z-87704
sha: f1dc3a0b31cebbabb5759766220011401697308a · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E13 · AC không có chốt máy: AC-12
