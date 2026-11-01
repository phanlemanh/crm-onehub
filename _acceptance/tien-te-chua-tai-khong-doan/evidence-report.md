---
schema_version: 2
feature_slug: tien-te-chua-tai-khong-doan
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 59c48fcd01785d02b359aeda882a071fcd7729be
human_signoff:
---

# Evidence Report: tien-te-chua-tai-khong-doan

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tien-te-chua-tai-khong-doan-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_tao_dang_tai
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [813.00ms]

- eval: E2
  run_id: minted-tien-te-chua-tai-khong-doan-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_tao_loi
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [575.00ms]

- eval: E3
  run_id: minted-tien-te-chua-tai-khong-doan-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_tao_ma_tran
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [1214.00ms]

- eval: E4
  run_id: minted-tien-te-chua-tai-khong-doan-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_nhanh_dang_tai
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [541.00ms]

- eval: E5
  run_id: minted-tien-te-chua-tai-khong-doan-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_nhanh_loi
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [579.00ms]

- eval: E6
  run_id: minted-tien-te-chua-tai-khong-doan-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_nhanh_thu_lai
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [536.00ms]

- eval: E7
  run_id: minted-tien-te-chua-tai-khong-doan-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcct_o_chua_biet
  verified_at: 2026-09-24T15:00:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [523.00ms]

- eval: E9
  run_id: minted-tien-te-chua-tai-khong-doan-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T15:00:00Z
  output: |
    dong bao cao=VND dong chon=EUR yeu cau da chan=8 khang-dinh=10/10

- eval: E12
  run_id: minted-tien-te-chua-tai-khong-doan-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T15:00:00Z
  output: |
    dong bao cao=VND dong chon=EUR yeu cau da chan=8 khang-dinh=10/10

- eval: E10
  run_id: minted-tien-te-chua-tai-khong-doan-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_soi_ma
  verified_at: 2026-09-24T15:00:00Z
  output: |
    soi-ma: 10/10 khang dinh, 0 lech

- eval: E8
  run_id: tcctmuf8hpt3 (mã tự sinh của man-that.mjs, lần chạy fresh 2026-09-24 14:52)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T14:52:00Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/beautiful-thompson-16c095/_acceptance/tien-te-chua-tai-khong-doan/evidence/E8-step1.png
  observed: |
    Đã mở bằng Read (ảnh thật) hai frame E8 vừa lưu, không đoán từ trí nhớ:
    - E8-step1.png (= tao-loi-truoc-khi-chon.png, sau bước 4): tấm "Thoả thuận mới" đang mở, ô "Giá trị" chứa "150.000.000", dòng ngay dưới ô đúng câu "Không tải được đồng tiền mặc định — chọn đồng tiền bên cạnh để nhập số tiền." (đúng CAU_TAO_LOI), và ô chọn đồng tiền cạnh nó hiện chữ trung tính "Tiền tệ" — KHÔNG phải mã đồng tiền nào (không phải USD). Khớp đúng Expected "trước khi chọn: dòng là câu lỗi + ô chọn = Tiền tệ".
    - E8-step2.png (= tao-sau-khi-chon.png, sau bước 5, đã chọn EUR = DONG_CHON): ô chọn đồng tiền đổi thành "EUR", dòng dưới ô đổi thành "Đọc là 150.000.000 €" — đúng mẫu "Đọc là " + số theo DONG_CHON. Khớp đúng Expected "sau khi chọn: dòng = Đọc là + số theo DONG_CHON".
    Đối chứng bản trước vòng (PR #114, ô chọn hiện USD, dòng "Đọc là 150.000.000 US$") KHÔNG tái hiện ở đây — thoát khỏi thông điệp ghim 'tao truoc khi chon: o chon dong tien «USD» != «Tiền tệ»'.
  network_observed: n-a (driver)

- eval: E11
  run_id: E11-verify-fresh-run
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T15:00:00Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/beautiful-thompson-16c095/_acceptance/tien-te-chua-tai-khong-doan/evidence/E11-step1.png
  observed: |
    E11-step1.png (= nhanh-loi.png, tam them nhanh tren cong ty gieo, add=deal, luc chan currency.settings): o "Giá trị" = "150.000.000"; nut "Thử lại" nam ngay canh o (dung Expected "co nut Thử lại canh o"); dong duoi o = "Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại." — dung "cau loi cua them nhanh"; nut "Tạo thoả thuận" hien fill mau xanh dam binh thuong, khong co dang xam/disabled — dung "nut Tạo không khoá". Khop toan bo Expected cua frame luc chan.
    E11-step2.png (= nhanh-sau-thu-lai.png, cung tam sau khi bam Thử lại va bo chan): nut "Thử lại" da bien mat hoan toan khoi canh o "Giá trị"; dong duoi o doi thanh "Đọc là 150.000.000 đ" (ky hieu "đ" = dong bao cao VND doc tu server, dung mau "Đọc là" theo dong bao cao); nut "Tạo thoả thuận" van fill xanh dam, khong khoa. Khop dung Expected "sau Thu lai: dong Đọc là theo dong bao cao, khong con nut Thu lai".
    Doi chung voi ban loi truoc vong (nut Tao khoa true, khong co nut Thu lai): KHONG xay ra o ca hai frame — nut Tao luon fill/khong khoa va nut Thu lai co mat dung luc roi mat dung luc, nen khong roi vao thong diep ghim "nhanh loi: khong thay nut Thử lại" / "nhanh loi: nut Tao khoa true != false".
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-24T15:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-24T15:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-24T15:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-24T15:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này.

none — danh sách eval không-phân-biệt rỗng round này (baseline không đo lại; xem round 1 nếu cần dữ liệu discriminating). Các lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê ở đây.

## Variance

none — không có eval nào mang `runs` > 1 hay `pass_rate` lệch round này; toàn bộ 12 eval đều deterministic (runs: 1).

## Iterations

Round 1: E9, E12 BLOCKED — máy chủ api ở http://localhost:3001 không tới được nên `man-that.mjs` không mở được phiên xin dev-session; 10 eval còn lại và cả bốn lệnh suite đã xanh. Trả về S3 để chỉnh thước đo.
Round 2: sửa `_acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs` để chờ máy chủ api sẵn sàng rồi mới thử lại xin phiên, không còn phụ thuộc việc máy chủ đã lên kịp lúc script chạy. Toàn bộ 12 eval (E1–E12) và cả bốn lệnh suite (`bun run test`, `bunx turbo run lint --force`, `bun run lint:slop`, `bunx turbo run build --force`) đều pass — verdict PASS.

### Re-pin lần 1 — 2026-09-24, do hoá cũ do vòng ten-dong-tien-bao-cao đổi chữ và đổi thư mục ghi ảnh của thước màn thật
run_id: repin-20260924T084643Z-52504
sha: 09234bc36c10fffd85564767bd8dd83a1ab08aa2 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E8, E11 · diff chạm vật đo ngoài làn máy: E8, E11 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 2 — 2026-09-24, do hoá cũ do gộp origin/onehub (51 commit) vào nhánh trước khi gộp PR #114
run_id: repin-20260924T090705Z-75556
sha: d3911564da114e9b2f61ebe02d24e13039f5d81d · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E8, E11

### Re-pin lần 3 — 2026-11-01, do sua-ban-do-tien-te: thước màn tự dựng tiền đề trong kho đo
run_id: repin-20261101T092201Z-36653
sha: 59c48fcd01785d02b359aeda882a071fcd7729be · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E8, E11 · diff chạm vật đo ngoài làn máy: E8, E11 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
