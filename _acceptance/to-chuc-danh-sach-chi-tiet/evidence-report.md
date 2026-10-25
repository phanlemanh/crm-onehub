---
schema_version: 2
feature_slug: to-chuc-danh-sach-chi-tiet
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fd4ed7c19a1d747430525b716a645d0a4fd7f732
human_signoff: Manh Phan 2026-09-25
---

# Evidence Report: to-chuc-danh-sach-chi-tiet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
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
| E20 | AC-13 | script | PASS |
| E21 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-to-chuc-danh-sach-chi-tiet-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_chon_nut
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    7 expect() calls
    Ran 6 tests across 1 file. [911.00ms]

- eval: E2
  run_id: minted-to-chuc-danh-sach-chi-tiet-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_truong_tai_cho
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [667.00ms]

- eval: E3
  run_id: minted-to-chuc-danh-sach-chi-tiet-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_truong_api
  verified_at: 2026-09-24T18:36:02Z
  output: |
    9 expect() calls
    Ran 1 test across 1 file. [858.00ms]
    test-run: dropped crm_mufvi8grswf7_test

- eval: E4
  run_id: mufvi8o184p3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_gan_phong_ban
  verified_at: 2026-09-24T18:36:02Z
  output: |
    30 expect() calls
    Ran 1 test across 1 file. [960.00ms]
    test-run: dropped crm_mufvi8o184p3_test

- eval: E5
  run_id: minted-to-chuc-danh-sach-chi-tiet-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_gan_man
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    4 expect() calls
    Ran 2 tests across 1 file. [732.00ms]

- eval: E6
  run_id: minted-to-chuc-danh-sach-chi-tiet-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_them_nguoi
  verified_at: 2026-09-24T18:36:02Z
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [818.00ms]
    test-run: dropped crm_mufvinmafkbz_test

- eval: E7
  run_id: minted-to-chuc-danh-sach-chi-tiet-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_them_nguoi_man
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    5 expect() calls
    Ran 2 tests across 1 file. [712.00ms]

- eval: E8
  run_id: minted-to-chuc-danh-sach-chi-tiet-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_sap
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    4 expect() calls
    Ran 4 tests across 1 file. [1040.00ms]

- eval: E9
  run_id: mufvi92tn3t5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_sap_api
  verified_at: 2026-09-24T18:36:02Z
  output: |
    15 expect() calls
    Ran 1 test across 1 file. [766.00ms]
    test-run: dropped crm_mufvi92tn3t5_test

- eval: E10
  run_id: minted-to-chuc-danh-sach-chi-tiet-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_o_so
  verified_at: 2026-09-24T18:36:02Z
  output: |
    11 expect() calls
    Ran 1 test across 1 file. [877.00ms]
    test-run: dropped crm_mufvi8p653gw_test

- eval: E11
  run_id: minted-to-chuc-danh-sach-chi-tiet-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_o_so_man
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    6 expect() calls
    Ran 2 tests across 1 file. [676.00ms]

- eval: E12
  run_id: minted-to-chuc-danh-sach-chi-tiet-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_nhap_ten_moi
  verified_at: 2026-09-24T18:36:02Z
  output: |
    11 expect() calls
    Ran 1 test across 1 file. [776.00ms]
    test-run: dropped crm_mufvik6rtt2o_test

- eval: E13
  run_id: minted-to-chuc-danh-sach-chi-tiet-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_nhap_ba_buoc
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    2 expect() calls
    Ran 2 tests across 1 file. [606.00ms]

- eval: E14
  run_id: mufvikh7k1jc
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_cau_loi_nhap
  verified_at: 2026-09-24T18:36:02Z
  output: |
    2 expect() calls
    Ran 1 test across 1 file. [689.00ms]
    test-run: dropped crm_mufvikh7k1jc_test

- eval: E15
  run_id: mufvikxfbbu9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_quyen
  verified_at: 2026-09-24T18:36:02Z
  output: |
    6 expect() calls
    Ran 1 test across 1 file. [717.00ms]
    test-run: dropped crm_mufvikxfbbu9_test

- eval: E16
  run_id: minted-to-chuc-danh-sach-chi-tiet-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_chi_doc
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [661.00ms]

- eval: E17
  run_id: tcdsfvlpau (mã seed sinh bởi man-chi-tiet.mjs)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcds_man_chrome
  verified_at: 2026-09-24T18:36:02Z
  screenshot: evidence/chi-tiet-320-vi.png
  observed: |
    Đã mở bằng Read cả 12 frame vừa lưu (10 ô ma trận + ban-phim.png + ghi-that.png), đối chiếu Expected:
    - chi-tiet-320-{vi,en}.png, chi-tiet-375-{vi,en}.png, chi-tiet-768-{vi,en}.png (đều <1024): chỉ thấy khung chi tiết phòng ban trượt từ phải, không thấy cây điều hướng cùng lúc — đúng luật <1024. Không tràn ngang (nội dung nằm trong viewport, không có thanh cuộn ngang). Tên người/đơn vị ("tcdsfvlpau Vùng 1", "tcdsfvlpau Kinh doanh", "An tcdsfvlpau", "Bình tcdsfvlpau") giữ nguyên chữ ở cả vi và en — không bị dịch — trong khi nhãn UI dịch đúng (Trưởng phòng ban/Department head, Bỏ trưởng/Remove head, Thêm người/Add people, Vị trí/Place, Quản lý/Manager).
    - chi-tiet-1024-{vi,en}.png, chi-tiet-1440-{vi,en}.png (>=1024): cây điều hướng bên trái và khung chi tiết bên phải cùng hiện trên một màn (bố cục hai cột), không có sheet trượt che. Không tràn ngang. Tên riêng vẫn không dịch, nhãn UI dịch đúng theo ngôn ngữ.
    - ban-phim.png: hộp thoại "Thêm người vào tcdsfvlpau Kho vận" đang mở, ô tìm kiếm có focus (viền xanh) — đúng kịch bản chỉ dùng Tab/Enter chọn phòng ban Kho vận rồi mở hộp Thêm người.
    - ghi-that.png: chụp sau khi tải lại trang, phản ánh đúng bốn thay đổi đã ghi: (1) bộ phận "tcdsfvlpau Tài chính" đã lên đầu danh sách (kéo-thả bộ phận thứ 3 lên đầu, giữ sau tải lại); (2) "tcdsfvlpau Tài chính" hiện có 2 phòng ban (Pháp chế, Vùng 2 — đúng thao tác gán 2 phòng ban); (3) trưởng phòng "tcdsfvlpau Kho vận" là "Dũng tcdsfvlpau" (đúng thao tác chọn trường một phòng ban); (4) phòng "Kho vận" có 3 người, người thứ ba "Hà tcdsfvlpau" ghi "Quản lý: Dũng tcdsfvlpau" (không có nhãn "phụ" đè lên — đúng: người đang giữ phòng ban đó được thêm làm phụ mà không đổi thành chính). Không thấy dấu hiệu lỗi hydrate hay tràn ngang trong bất kỳ frame nào.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver là script Node/puppeteer chạy qua Bash (execFileSync/puppeteer-core), không phải browser MCP tool có read_network_requests/read_console_messages. Theo luật "driver khong doc duoc network -> n-a (driver)" — không áp dụng luật scoping FAIL-eligible, không tạo lại E17-network.txt.
    Kết luận: mọi assertion (bằng log script + bằng frame đọc lại + bằng git status) đều khớp Expected. exitCode = 0 hợp lệ, không phải false-pass.

- eval: E18
  run_id: minted-to-chuc-danh-sach-chi-tiet-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_trang_thai
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    6 expect() calls
    Ran 5 tests across 1 file. [1.56s]

- eval: E19
  run_id: minted-to-chuc-danh-sach-chi-tiet-E19-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcds_luu_tru_chung
  verified_at: 2026-09-24T18:36:02Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [587.00ms]

- eval: E20
  run_id: minted-to-chuc-danh-sach-chi-tiet-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcds_khong_hoi_quy
  verified_at: 2026-09-24T18:36:02Z
  output: |
    sua-luu-tru-dieu-phoi: repin repin-20260924T183547Z-84900 sha 70776c91 evals 28
    noi-bon-nut-dieu-phoi: repin repin-20260924T183547Z-84900 sha 70776c91 evals 13
    lan may ba ho so tai HEAD, luot 1: ma 0

- eval: E21
  run_id: minted-to-chuc-danh-sach-chi-tiet-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcds_san_thiet_ke
  verified_at: 2026-09-24T18:36:02Z
  output: |
    dat  packages/ui/src/components/nav-item.tsx: da khai trong ke hoach
    dat  packages/ui/src/components/pick-list-dialog.tsx: da khai trong ke hoach
    dat  packages/ui/src/components/stat-tile.tsx: da khai trong ke hoach

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mufvi8davf8k
  exit_code: 0
  verified_at: 2026-09-24T18:36:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-24T18:36:02Z

- cmd: bun run lint:slop
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-24T18:36:02Z

- cmd: bunx turbo run build --force
  run_id: minted-to-chuc-danh-sach-chi-tiet-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-24T18:36:02Z

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
Round 3: Ca 21 eval xanh, ba lenh chung (test/lint/lint:slop/build) xanh, lan may ba ho so tai HEAD (E20) xanh, khong con LÀN ĐỎ; E3 co ket qua day du (9 expect() calls). → PASS.

### Re-pin lần 1 — 2026-09-25, do mot-duong-ghi-phong-ban: bài kiểm chuyển sang org.*, đường ghi phòng ban cũ gỡ
run_id: repin-20260925T025226Z-13987
sha: dd85e27b0cd98a954011374c51e2679021a3c880 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E17 · diff chạm vật đo ngoài làn máy: E17 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

### Re-pin lần 2 — 2026-09-25, do mot-duong-ghi-phong-ban: ghim lại sau gộp onehub a8572437 (#129) và thêm ba thủ tục org.*Department
run_id: repin-20260925T032447Z-74232
sha: dfc8ff345842e738f421c08891eb1754198d9064 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E17 · AC không có chốt máy: AC-10

### Re-pin lần 3 — 2026-09-25, do gộp onehub 5d9e8b9c (#135 Zalo) vào nhánh — mã Zalo không chạm phòng ban
run_id: repin-20260925T042418Z-71551
sha: fd4ed7c19a1d747430525b716a645d0a4fd7f732 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E17 · AC không có chốt máy: AC-10
