---
schema_version: 2
feature_slug: khung-trang-cai-dat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context sequential verification subagent (round 2, classifier-fallback)
enforcement_mode: strict
bypass_used: false
verified_commit: 106dd061b60e947bdc5d740ebcd06c1debdb28db
human_signoff:
---

# Evidence Report: khung-trang-cai-dat

Vòng 2 chạy tuần tự: mỗi lúc chỉ một lệnh. Sáu eval ui-check (E3, E4, E6, E8, E11, E13) dùng chung một lượt duy nhất của bàn đo Chrome (`man-chrome.mjs` qua `tien-de.mjs`, cổng 3720/3721 lúc bắt đầu còn trống). Bàn đo tự dựng máy chủ, tự gieo dữ liệu rồi tự dọn.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | ui-check | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: khung-trang-cai-dat-E1-r2-1790308663
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_be_rong
  verified_at: 2026-09-25T03:57:43Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat.dom.tsx -t 'be-rong'
     2 pass
     2 filtered out
     0 fail
     11 expect() calls
    Ran 2 tests across 1 file. [234.00ms]

- eval: E2
  run_id: khung-trang-cai-dat-E2-r2-1790308670
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_cau_truc
  verified_at: 2026-09-25T03:57:50Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/cau-truc.mjs
    cau-truc: 22/22 khang dinh dat

- eval: E3
  run_id: khung-trang-cai-dat-E3-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E3-step1.png
  observed: |
    E3-step1 (/settings, 1440): một h1 «Chung» ở mép trái cột nội dung, không có breadcrumb; mép trái thẻ đầu «Không gian làm việc» trùng mép trái h1; thanh bên có bốn nhóm.
    E3-step2 (/settings/connections/google, 1440): breadcrumb «Kết nối › Google» nằm trên h1 «Google»; h1 cùng mép trái với «Chung» và thấp hơn đúng một dòng breadcrumb; mục «Kết nối» của thanh bên đang sáng.
    E3-step3 (/settings, 375): đầu trang, hàng điều hướng ngang và các thẻ đều nằm gọn trong 375px, không tràn ngang. Khớp expected.
  network_observed: n-a (driver)
  output: |
    lan gieo 1: slack chua ket noi
    lan gieo 2: slack da ket noi
    ngoai-khung: /settings/members 375: noi dung tran 165px tai table
    man-chrome: 232/232 khang dinh dat
    Không có dòng DO: nào. Không có lỗi hydrate. Tổng 232 bằng KY_MONG.
    (Bàn đo là puppeteer-core trong script, không có nhật ký mạng: n-a (driver).)

- eval: E4
  run_id: khung-trang-cai-dat-E4-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E4-step1.png
  observed: |
    E4-step1 (Slack đã kết nối, vi, 1440): h1 «Slack», và nút gỡ kết nối («Gỡ») nằm trong vùng hành động bên phải đầu trang, ngang hàng h1. E4-step3 (danh sách Kết nối): nút «Thêm kết nối» nằm trong vùng hành động đầu trang.
    E4-step2 (Google, 1440): h1 «Google», và dòng tiêu đề thẻ ghi «Chưa cấu hình», không lặp tên «Google». Ghi chú: .env của bàn đo không có khoá Google, nên thứ được đo là thẻ «chưa cấu hình».
    Frame Slack chưa kết nối thuộc lần gieo 1 bị lần gieo 2 ghi đè, nên chữ «Chưa cắm» trong thân trang chỉ có khẳng định của script đo (38/38 phần E4 trong 232), không có ảnh.
  network_observed: n-a (driver)
  output: |
    Cùng lượt với E3: man-chrome: 232/232 khang dinh dat. Không có dòng DO: nào về h1, translate, tiêu đề thẻ, page-shell-actions hay «Chưa cắm».

- eval: E5
  run_id: khung-trang-cai-dat-E5-r2-1790308677
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_breadcrumb
  verified_at: 2026-09-25T03:57:57Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat.dom.tsx -t 'breadcrumb'
     2 pass
     2 filtered out
     0 fail
     38 expect() calls
    Ran 2 tests across 1 file. [283.00ms]

- eval: E6
  run_id: khung-trang-cai-dat-E6-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E6-step1.png
  observed: |
    E6-step1 (/settings/connections/zalo, 1440): breadcrumb thật «Kết nối › Zalo» nằm trên h1 «Zalo»; «Kết nối» là liên kết màu nhạt, «Zalo» là mục cuối.
    E6-step2 (/settings/connections, 1440): trang cha danh sách Kết nối, h1 «Kết nối». Đây là trang mà cú bấm vào mục breadcrumb đầu tiên phải dẫn tới.
    Script đo xác nhận cú bấm dẫn tới /<slug>/settings/connections trên cả sáu trang con.
  network_observed: n-a (driver)
  output: |
    Cùng lượt với E3: man-chrome: 232/232 khang dinh dat. Không có dòng DO: «khong co breadcrumb» hay «bam Ket noi toi» nào.

- eval: E7
  run_id: khung-trang-cai-dat-E7-r2-1790308684
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_thanh_ben
  verified_at: 2026-09-25T03:58:04Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat-thanh-ben.dom.tsx
     5 pass
     0 fail
     49 expect() calls
    Ran 5 tests across 1 file. [277.00ms]

- eval: E8
  run_id: khung-trang-cai-dat-E8-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E8-step1.png
  observed: |
    E8-step1 (1440) và E8-step2 (768): thanh bên dọc hiện đủ bốn nhãn nhóm «Không gian làm việc», «Con người», «Kết nối và dữ liệu», «Bảo mật», theo đúng thứ tự và đúng các mục. «Điều phối 30 ngày» đứng cuối nhóm Con người.
    E8-step3 (375): không còn nhãn nhóm. Thanh bên thành một hàng ngang (Chung, Tiền tệ, Trường, Thành viên, Tổ chức, «Đi…» bị cắt ở mép phải), cho thấy hàng cuộn ngang được. Khớp expected.
  network_observed: n-a (driver)
  output: |
    Cùng lượt với E3: man-chrome: 232/232 khang dinh dat. Không có dòng DO: «nhan nhom hien» hay «hang thanh ben khong cuon ngang» nào.

- eval: E9
  run_id: khung-trang-cai-dat-E9-r2-1790308691
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_nhan
  verified_at: 2026-09-25T03:58:11Z
  output: |
    cd apps/app && bun test test/khung-trang-cai-dat.spec.ts -t 'nhan'
     3 pass
     1 filtered out
     0 fail
     17 expect() calls
    Ran 3 tests across 1 file. [13.00ms]

- eval: E10
  run_id: khung-trang-cai-dat-E10-r2-1790308698
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_menu_nguoi_dung
  verified_at: 2026-09-25T03:58:18Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat-menu.dom.tsx
     2 pass
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [383.00ms]

- eval: E11
  run_id: khung-trang-cai-dat-E11-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E11-step1.png
  observed: |
    E11-step1 (/reminders, 1440, vi): một h1 «Nhắc buổi sáng», với hai khối «Zalo của bạn» (các bước nối, nút «Nối Zalo») và «Nhận nhắc việc qua» (Tự động · Zalo · Slack). Không có thanh bên Cài đặt, chỉ có dải biểu tượng của ứng dụng.
    E11-step2 (Kết nối › Zalo, 1440): có nút-liên kết «Nối Zalo của tôi» ở khối người đã nối. href của nó không đọc được từ ảnh; script đo xác nhận href trỏ tới /<slug>/reminders.
  network_observed: n-a (driver)
  output: |
    Cùng lượt với E3: man-chrome: 232/232 khang dinh dat. Không có dòng DO: «menu:», «reminders:» hay «zalo: lien ket» nào, và không có KHONG DO DUOC.

- eval: E12
  run_id: khung-trang-cai-dat-E12-r2-1790308704
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_chuyen_huong
  verified_at: 2026-09-25T03:58:24Z
  output: |
    cd apps/app && bun test test/khung-trang-cai-dat.spec.ts -t 'chuyen-huong'
     1 pass
     3 filtered out
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [10.00ms]

- eval: E13
  run_id: khung-trang-cai-dat-E13-r2-1790308910
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T04:01:50Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E13-step1.png
  observed: |
    E13-step1 là trang đích /reminders ở 1440: h1 «Nhắc buổi sáng» cùng hai khối Zalo và kênh, không có thanh bên Cài đặt.
    Bàn đo không chụp riêng ảnh sau khi mở đường cũ, nên đây là ảnh của trang đích cuối cùng, không phải ảnh của chính lần chuyển hướng. Việc đường cũ /settings/notifications về /<slug>/reminders do khẳng định location.pathname của script đo chứng minh.
  network_observed: n-a (driver)
  output: |
    Cùng lượt với E3: man-chrome: 232/232 khang dinh dat. Không có dòng DO: «duong cu khong chuyen huong».

- eval: E14
  run_id: khung-trang-cai-dat-E14-r2-1790308710
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_tai_lieu
  verified_at: 2026-09-25T03:58:30Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/tai-lieu.mjs
    tai-lieu: 5/5 khang dinh dat

- eval: E15
  run_id: khung-trang-cai-dat-E15-r2-1790308717
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lv30_loi_vao_cai_dat
  verified_at: 2026-09-25T03:58:37Z
  output: |
    cd apps/app && bun test test/cai-dat-dieu-huong.spec.ts -t loi-vao-dieu-phoi
     1 pass
     1 filtered out
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [4.00ms]

- eval: E16
  run_id: khung-trang-cai-dat-E16-r2-1790309844
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_khong_hoi_quy
  verified_at: 2026-09-25T04:17:24Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/khong-hoi-quy.mjs
    do san (do ca o merge-base, khong tinh la hoi quy): 29
    can may chu (khong chay o day, lan ghim lai cua tung ho so): 23
    khong-hoi-quy: 150/150 khang dinh dat · 23 tep bai · 176 lenh

- eval: E17
  run_id: khung-trang-cai-dat-E17-r2-1790308724
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_san_thiet_ke
  verified_at: 2026-09-25T03:58:44Z
  output: |
    bun _acceptance/khung-trang-cai-dat/rang/san-thiet-ke.mjs
    so tep giao dien vong nay cham: 27
    san-thiet-ke: dat

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mugg9dql2569
  exit_code: 0
  verified_at: 2026-09-25T04:18:40Z

- cmd: bunx turbo run lint --force
  run_id: khung-trang-cai-dat-SUITE-bunx_turbo_run_lint___force-r2-1790309929
  exit_code: 0
  verified_at: 2026-09-25T04:18:49Z

- cmd: bun run lint:slop
  run_id: khung-trang-cai-dat-SUITE-bun_run_lint_slop-r2-1790309938
  exit_code: 0
  verified_at: 2026-09-25T04:18:58Z

- cmd: bunx turbo run build --force
  run_id: khung-trang-cai-dat-SUITE-bunx_turbo_run_build___force-r2-1790309960
  exit_code: 0
  verified_at: 2026-09-25T04:19:20Z

`bun run test`: 11/11 task turbo thành công, 0 fail ở mọi gói, cơ sở dữ liệu riêng `crm_mugg9dql2569_test` đã tạo rồi drop. Build: 4/4 task, trong đó `app:build` chạy `next build` thật (46/46 trang tĩnh).

## Known limits

- Bàn đo Chrome in một dòng `ngoai-khung` (chỉ để biết, không tính vào 232): `/settings/members 375: noi dung tran 165px tai table`. Khung trang (đầu trang, khối trang, thanh điều hướng) không tràn; bảng Thành viên trong thân trang tràn ngang 165px ở khổ 375.
- E16: 29 eval «đỏ sẵn» (đỏ cả ở HEAD lẫn merge-base, không tính là hồi quy) và 23 eval «cần máy chủ» (không chạy ở đây, để dành cho lượt ghim lại của từng hồ sơ). Danh sách tên đầy đủ nằm trong `.acceptance-runs/khung-trang-cai-dat/r2/E16.log`.
- Cả sáu eval ui-check đều là `network_observed: n-a (driver)`: bàn đo là puppeteer-core trong script, chỉ bắt lỗi hydrate chứ không ghi nhật ký mạng.
- Ảnh của E4 (Slack chưa kết nối) và E13 (chính lần chuyển hướng) không có frame riêng, vì bàn đo không chụp ở hai bước đó. Hai khẳng định này chỉ dựa trên khẳng định DOM của script đo, xem khối observed tương ứng.

## Ngoài hợp đồng

- 12 phát hiện ngoài hợp đồng của vòng 1 được mang sang nguyên văn, chưa chấm lại. Người quyết ở Gate 2, xem `_acceptance/khung-trang-cai-dat/review-findings.md` (mục «Ngoài hợp đồng — người quyết ở Gate 2»).

## Analyst

E15 (`config:executors.test.lv30_loi_vao_cai_dat`, bài «loi-vao-dieu-phoi») xanh cả trên HEAD lẫn diffBase (mang sang từ vòng 1, `runBaseline: false` ở vòng này). Đây là bài canh hồi quy có chủ ý của hồ sơ đã ký `loi-vao-dieu-phoi-30-ngay`: AC-11 chỉ đổi một khẳng định, «đứng cuối» thành «đứng cuối nhóm Con người». Bài này không đo hành vi mới của vòng này, nên việc nó xanh cả hai phía là dự kiến. Mọi eval test/script khác của hồ sơ đều đỏ ở baseline. Các eval ui-check không có baseline (n-a).

## Variance

none — không eval nào của hồ sơ này mang runs > 1; mọi eval tất định chạy một lần.

## Iterations

Round 1: BLOCKED. E6, E8 và E11 (ui-check) va nhau trên bàn đo dùng chung, vì nhiều agent chạy song song trên cùng CSDL dev: tài khoản Slack sót lại chặn lần gieo 1, và khoá researchKey bị bật tắt giữa chừng. Suite `bun run test` đỏ ở app vì bài `chuyen-huong` nhận nhầm mock redirect rò sang từ một spec khác. Lỗi đó đã sửa ở commit 106dd061.
Round 2: PASS. Chạy tuần tự từng lệnh, bàn đo Chrome chạy đúng một lần, 232/232 khẳng định. Cả 17 eval và 4 lệnh suite đều xanh.
