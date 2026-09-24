---
schema_version: 2
feature_slug: to-chuc-danh-sach-chi-tiet
verdict: BLOCKED
failed_evals: [E20]
reason: E3 (AC-2, ref config:executors.test.tcds_truong_api) không có kết quả — lệnh `cd apps/api && bun test test/to-chuc-chi-tiet.spec.ts -t "truong-api"` (chạy qua `bun run test -- "..."`) có agent bị skip/chết giữa lượt chạy, không trả về output, không được tính là pass. Việc xác minh không hoàn tất cho eval này; cần chạy lại lượt verify cho E3 trước khi tính lại verdict.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36779778d48153b42949bf0b4ebd4c01f569d2da
human_signoff:
---

# Evidence Report: to-chuc-danh-sach-chi-tiet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | BLOCKED |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-10 | ui-check | PASS |
| E18 | AC-11 | test | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-13 | script | FAIL |
| E21 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-to-chuc-danh-sach-chi-tiet-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_chon_nut
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    7 expect() calls
    Ran 6 tests across 1 file. [826.00ms]

- eval: E2
  run_id: minted-to-chuc-danh-sach-chi-tiet-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_truong_tai_cho
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [646.00ms]

- eval: E3
  status: BLOCKED — không có kết quả (agent bị skip/chết khi chạy lệnh dưới đây)
  cmd: cd apps/api && bun test test/to-chuc-chi-tiet.spec.ts -t "truong-api"
  baseline: n-a
  reason: agent bị skip/chết — không có kết quả, không được tính là pass

- eval: E4
  run_id: mufueibttiwz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_gan_phong_ban
  verified_at: 2026-09-24T18:05:04Z
  output: |
    30 expect() calls
    Ran 1 test across 1 file. [841.00ms]
    test-run: dropped crm_mufueibttiwz_test

- eval: E5
  run_id: minted-to-chuc-danh-sach-chi-tiet-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_gan_man
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [729.00ms]

- eval: E6
  run_id: mufuehqlhnuv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_them_nguoi
  verified_at: 2026-09-24T18:05:04Z
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [942.00ms]
    test-run: dropped crm_mufuehqlhnuv_test

- eval: E7
  run_id: minted-to-chuc-danh-sach-chi-tiet-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_them_nguoi_man
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [734.00ms]

- eval: E8
  run_id: minted-to-chuc-danh-sach-chi-tiet-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_sap
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    4 expect() calls
    Ran 4 tests across 1 file. [1033.00ms]

- eval: E9
  run_id: minted-to-chuc-danh-sach-chi-tiet-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_sap_api
  verified_at: 2026-09-24T18:05:04Z
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [763.00ms]
    test-run: dropped crm_mufueiguxi31_test

- eval: E10
  run_id: mufuehmbyv7g
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_o_so
  verified_at: 2026-09-24T18:05:04Z
  output: |
    11 expect() calls
    Ran 1 test across 1 file. [948.00ms]
    test-run: dropped crm_mufuehmbyv7g_test

- eval: E11
  run_id: minted-to-chuc-danh-sach-chi-tiet-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_o_so_man
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [699.00ms]

- eval: E12
  run_id: mufueu89xfzt
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_nhap_ten_moi
  verified_at: 2026-09-24T18:05:04Z
  output: |
    8 expect() calls
    Ran 1 test across 1 file. [687.00ms]
    test-run: dropped crm_mufueu89xfzt_test

- eval: E13
  run_id: minted-to-chuc-danh-sach-chi-tiet-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_nhap_ba_buoc
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [693.00ms]

- eval: E14
  run_id: mufuevxs1j8j
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_cau_loi_nhap
  verified_at: 2026-09-24T18:05:04Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [716.00ms]
    test-run: dropped crm_mufuevxs1j8j_test

- eval: E15
  run_id: minted-to-chuc-danh-sach-chi-tiet-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_quyen
  verified_at: 2026-09-24T18:05:04Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [693.00ms]
    test-run: dropped crm_mufuf9fg2r6g_test

- eval: E16
  run_id: minted-to-chuc-danh-sach-chi-tiet-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_chi_doc
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [667.00ms]

- eval: E17
  run_id: tcdsfuhhld
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcds_man_chrome
  verified_at: 2026-09-24T18:05:04Z
  screenshot: evidence/chi-tiet-320-vi.png
  observed: |
    Đã mở và đọc từng frame bằng Read (ảnh thật, không đoán từ log):
    - chi-tiet-320-vi.png / 375-vi.png / 768-vi.png (và bản en tương ứng): chỉ hiện khung trượt bên phải phủ toàn bộ bề rộng ("tcdsfuhhld Vùng 1" + danh sách "Người · 2"), không thấy cây điều hướng, không tràn ngang, tên người/đơn vị giữ nguyên dạng gốc (không dịch) ở cả vi và en — đúng kỳ vọng <1024 chỉ hiện khung trượt.
    - chi-tiet-1024-vi.png / 1024-en.png / 1440-vi.png / 1440-en.png: cây (sidebar trái, danh sách bộ phận/phòng ban) và khung chi tiết bên phải hiện CÙNG lúc, không có sheet-overlay, không tràn ngang, nhãn menu dịch đúng ngôn ngữ (Tổ chức/Organization, Thành viên/Members...) trong khi tên riêng (tcdsfuhhld Vùng 1, An tcdsfuhhld, Bình tcdsfuhhld) giữ nguyên ở cả hai ngôn ngữ — đúng kỳ vọng >=1024 hai cột + translate=no.
    - ban-phim.png: phòng ban "tcdsfuhhld Kho vận" đang được chọn (aria-current), hộp thoại "Thêm người vào tcdsfuhhld Kho vận" đã mở với pick-list 5 người — xác nhận Tab+Enter chọn được phòng ban rồi Enter mở được hộp Thêm người.
    - ghi-that.png: sau khi ghi thật rồi tải lại, phòng ban "tcdsfuhhld Kho vận" (dưới "tcdsfuhhld Vận hành") hiện 3 người gồm "Hà tcdsfuhhld" mới thêm, không gắn nhãn "phụ" đè lên dòng — khớp assertion "thêm người giữ phòng ban phụ không thành chính sau tải lại".
    Log lệnh (stdout) in đủ 10 dòng "o <khổ>/<tiếng>", "ban phim", 4 dòng "ghi: ...", và dòng tổng "o=10/10 khang-dinh=36/36" — không có dòng "HONG" nào, nghĩa là mọi kiểm(nhan, đạt) đều đạt và không có lỗi hydrate bị đẩy vào mảng hong.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver của bước UI là puppeteer-core chạy TRONG script Bash (man-chi-tiet.mjs tự mở/tự đóng Chrome headless), không phải công cụ browser của phiên xác minh này — phiên này không có đường sống để đọc network/console của trình duyệt đó khi nó đang chạy. => networkObserved = "n-a (driver)". File _acceptance/to-chuc-danh-sach-chi-tiet/evidence/E17-network.txt đang có sẵn (mtime 00:19, TRƯỚC lượt chạy 01:08 của phiên này) — không đại diện cho lượt chạy đang được xác minh nên không dùng làm căn cứ; không tạo file mới vì không có đường đọc network thật.
    Không sửa code, không sửa evals.yaml/config.yaml, không tắt server đang chạy (không phải do phiên này khởi động).

- eval: E18
  run_id: minted-to-chuc-danh-sach-chi-tiet-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_trang_thai
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    6 expect() calls
    Ran 5 tests across 1 file. [1.61s]

- eval: E19
  run_id: minted-to-chuc-danh-sach-chi-tiet-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_luu_tru_chung
  verified_at: 2026-09-24T18:05:04Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [594.00ms]

- eval: E20
  run_id: minted-to-chuc-danh-sach-chi-tiet-E20-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tcds_khong_hoi_quy
  verified_at: 2026-09-24T18:05:04Z
  output: |
    ba ho so: 84 bai da ky, 253 loi goi expect tai HEAD
    cau-truc-to-chuc: repin repin-20260924T164220Z-99128 sha ded515a9 evals 23
    sua-luu-tru-dieu-phoi: repin repin-20260924T164220Z-99128 sha ded515a9 evals 28
    noi-bon-nut-dieu-phoi: repin repin-20260924T164220Z-99128 sha ded515a9 evals 13
    repin-lane: LÀN ĐỎ — không ghi gì (suite [0,0,0,0]; eval đỏ: sua-luu-tru-dieu-phoi/E17=1). Khắc phục nguyên nhân rồi chạy làn MỚI (run_id mới); không ký mù.
    HONG lan may ba ho so do: ma 1

- eval: E21
  run_id: minted-to-chuc-danh-sach-chi-tiet-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcds_san_thiet_ke
  verified_at: 2026-09-24T18:05:04Z
  output: |
    dat  packages/ui/src/components/pick-list-dialog.tsx: da khai trong ke hoach
    dat  packages/ui/src/components/stat-tile.tsx: da khai trong ke hoach
    dat  packages/ui/test/to-chuc-thanh-phan.dom.tsx: da khai trong ke hoach

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mufueh4j6lvo
  exit_code: 0
  verified_at: 2026-09-24T18:05:04Z

- cmd: bunx turbo run lint --force
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T18:05:04Z

- cmd: bun run lint:slop
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T18:05:04Z

- cmd: bunx turbo run build --force
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T18:05:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay
none — khong eval nao duoc danh dau khong-phan-biet round nay (baseline khong do lai).

## Variance

none — khong eval nao khai runs>1 (khong co phuong sai).

## Iterations

Round 1: E17 failed — o kho 320px (vi va en), nhan "Vi tri" cua dong nguoi dau tien de chong len email do `<li className="flex items-center ...">` can giua toan bo chieu cao trong khi noi dung giua la nhieu dong. Tra ve implementation.
Round 2: E17 da xanh (bug chong lan da sua, quan sat doc lap tren 12 frame khop Expected). Nhung E20 (khong-hoi-quy.mjs) do LÀN ĐỎ tai ho so sua-luu-tru-dieu-phoi/E17 (suite [0,0,0,0]); dong thoi E3 (AC-2, truong-api) khong co ket qua vi agent bi skip/chet giua luot chay. → BLOCKED, chua the tinh PASS/REJECT cho ca hai.