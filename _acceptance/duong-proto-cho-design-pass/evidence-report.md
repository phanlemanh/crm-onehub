---
schema_version: 2
feature_slug: duong-proto-cho-design-pass
verdict: BLOCKED
failed_evals: ["E8"]
reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Cần dừng process hiện tại trước (pkill -f "next dev") rồi chạy lại, nhưng hướng dẫn cấm không được chạy lại nhiều lần.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3e722ead1b6349755043c892ae179e96fa7ca509
human_signoff:
---

# Evidence Report: duong-proto-cho-design-pass

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | BLOCKED |
| E2 | AC-2 | script | BLOCKED |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | BLOCKED |
| E5 | AC-5 | script | BLOCKED |
| E6 | AC-6 | script | BLOCKED |
| E7 | AC-7 | script | BLOCKED |
| E8 | AC-8 | script | FAIL |
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
  run_id: minted-duong-proto-cho-design-pass-E1-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:00:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "co-bat" của chính eval này thực ra đã chạy và đạt ("OK co-bat") trước khi lệnh gộp `tat-ca` dừng ở các chân sau; nhưng vì E1-E7 dùng chung một lệnh và lệnh đó thoát mã khác 0, cả sáu eval được ghi cannotRun theo đúng dữ liệu đo được.
  output: |
    chan co-bat: OK co-bat
    chan co-tat: rang: may chu khong len trong 90s (co=khong-dat)
    chan state-chon-duoc: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan state-la: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan slug-la: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan muc-luc: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E2
  run_id: minted-duong-proto-cho-design-pass-E2-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:01:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "co-tat" của E2 báo "rang: may chu khong len trong 90s (co=khong-dat)" — không đo được ma trận sáu giá trị cờ đã khai.
  output: |
    chan co-tat: rang: may chu khong len trong 90s (co=khong-dat)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E3
  run_id: minted-duong-proto-cho-design-pass-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_ban_dung
  verified_at: 2026-09-16T06:02:00Z
  output: |
    OK ban-dung: cap hai chieu tren CUNG mot cay dung (.next-proto-do)

- eval: E4
  run_id: minted-duong-proto-cho-design-pass-E4-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:03:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "state-chon-duoc" của E4 không chạy được — không đo được năm state qua import catalog.ts.
  output: |
    chan state-chon-duoc: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E5
  run_id: minted-duong-proto-cho-design-pass-E5-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:04:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "state-la" của E5 không chạy được — không đo được 404 cho state lạ.
  output: |
    chan state-la: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E6
  run_id: minted-duong-proto-cho-design-pass-E6-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:05:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "slug-la" của E6 không chạy được — không đo được 404 cho slug lạ.
  output: |
    chan slug-la: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E7
  run_id: minted-duong-proto-cho-design-pass-E7-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.script.dp_duong_song
  verified_at: 2026-09-16T06:06:00Z
  reason: Verifier không thể khởi động server test trong vòng 90s vì một Next.js server đã chạy sẵn ở apps/app (PID 73707). Next khóa theo thư mục chứ không theo cổng, nên không thể khởi động instance thứ hai. Chân "muc-luc" của E7 không chạy được — không đo được đối chiếu tập slug hiển thị so với catalog.
  output: |
    chan muc-luc: rang: da co mot may chu Next chay san trong apps/app (PID 73707)
    chan hong: co-tat (ma 2), state-chon-duoc (ma 2), state-la (ma 2), slug-la (ma 2), muc-luc (ma 2)
    rang: tat-ca: 5/6 chan khong dat

- eval: E8
  run_id: minted-duong-proto-cho-design-pass-E8-r3
  exit_code: 2
  baseline: red
  verifier: config:executors.script.dp_so_dang_ky
  verified_at: 2026-09-16T06:07:00Z
  output: |
    rang: san cung: khong thay muc duong-proto

- eval: E9
  run_id: minted-duong-proto-cho-design-pass-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_config_tro_vat_that
  verified_at: 2026-09-16T06:08:00Z
  output: |
    OK khai-bao (config)

- eval: E10
  run_id: minted-duong-proto-cho-design-pass-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_khai_bao
  verified_at: 2026-09-16T06:09:00Z
  output: |
    OK khai-bao (bien)

- eval: E11
  run_id: minted-duong-proto-cho-design-pass-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_khong_goi_server
  verified_at: 2026-09-16T06:10:00Z
  output: |
    OK khong-goi-server: quet 7 tep

- eval: E12
  run_id: minted-duong-proto-cho-design-pass-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp_proxy_an_danh
  verified_at: 2026-09-16T06:11:00Z
  output: |
     0 fail
     9 expect() calls
    Ran 4 tests across 1 file. [15.00ms]

- eval: E13
  run_id: minted-duong-proto-cho-design-pass-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-16T06:12:00Z
  screenshot: _acceptance/duong-proto-cho-design-pass/evidence/design-pass/mac-dinh--375--light.png
  observed: |
    Đã Read (đọc trực tiếp) cả 20 file .png. Kết quả từng ô: mac-dinh--375--light/dark: card "Đối tác" 3 dòng (Ngân hàng Đại Nam/Sàn Phương Bắc/Công ty Tân Việt), badge trạng thái bo tròn nhỏ. Light nền #fafafa/trắng, chữ đen; dark nền đen tuyền, chữ trắng — khác biệt rõ bằng mắt. mac-dinh--1280--light/dark: cùng nội dung, thêm dòng phụ đề "3 đối tác đang theo dõi", layout rộng hơn con trỏ desktop. Light/dark khác biệt rõ. rong--375/1280--light/dark: khung trắng/đen rỗng với text giữa khung "Chưa có đối tác nào" — không trắng trơn (có border + text), khác trạng thái mac-dinh rõ ràng. dang-tai--375/1280--light/dark: 3 thanh Skeleton xám mờ (pulsing placeholder), rõ ràng là component Skeleton chứ không phải div vẽ tay — khác biệt hẳn hình dạng so với card dữ liệu thật. loi--375/1280--light/dark: khối cảnh báo nền xám nhạt (light)/xám đậm (dark) với tiêu đề "Không tải được danh sách đối tác" + mô tả "Máy chủ không trả lời...". tran-dai--375/1280--light/dark: danh sách dài "24 đối tác đang theo dõi", tên đối tác dài lặp "Đối tác số N với một cái tên rất dài để thử tràn dòng", cuộn dài xuống dưới, xác nhận state tràn nội dung hoạt động đúng. Thanh chuyển state (Mặc định/Rỗng/Đang tải/Lỗi/Tràn dài) ở mọi ô đều là các nút bo góc theo thang thiết kế (rounded-md nhìn được ở corner ~5px), nút active tô xanh lá đậm (#006B4F) — đúng token primary trong docs/design.md, các nút còn lại là chip viền/nền tối nhạt tuỳ theme — khớp mô tả component Button của packages/ui, không phải div className vẽ tay. Không ô nào trắng/đen trơn không nội dung. Tổng: 20/20 ô có ảnh, đúng 20 file .png, tất cả >5KB, không ô nào trắng, không 2 ô nào trùng shasum trong cùng (kho,theme), tất cả 10 cặp light/dark khác nhau rõ.
  network_observed: n-a (driver)

- eval: E16
  run_id: minted-duong-proto-cho-design-pass-E16-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_nha_thu_ba
  verified_at: 2026-09-16T06:13:00Z
  output: |
    OK khai-bao (nha-thu-ba)

- eval: E17
  run_id: minted-duong-proto-cho-design-pass-E17-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp_slug_giai_duoc
  verified_at: 2026-09-16T06:14:00Z
  output: |
    OK khai-bao (slug)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-duong-proto-cho-design-pass-SUITE-bun_run_test-r3
  exit_code: 0
  verified_at: 2026-09-16T06:15:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-duong-proto-cho-design-pass-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 1
  verified_at: 2026-09-16T06:16:00Z

- cmd: bun run lint:slop
  run_id: minted-duong-proto-cho-design-pass-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-16T06:17:00Z

- eval: E14
  run_id: minted-duong-proto-cho-design-pass-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build_khong_cache
  verified_at: 2026-09-16T06:18:00Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    9.678s

- eval: E15
  run_id: minted-duong-proto-cho-design-pass-E15-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.check_types_khong_cache
  verified_at: 2026-09-16T06:19:00Z
  output: |
     Tasks:    13 successful, 13 total
    Cached:    0 cached, 13 total
      Time:    6.424s

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