---
schema_version: 2
feature_slug: tien-te-chua-tai-khong-doan
verdict: BLOCKED
failed_evals: []
reason: "bun _acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs (evals E9, E12): Verification script requires the API server running at http://localhost:3001, but it is not accessible. The verification test tried to create a dev session but failed at connection stage. To run this verification: start the API server with `cd apps/api && bun run dev` in another terminal, then retry the verification command."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0ee38022eb0efd17df0bce40787946433b2f3b82
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
| E9 | AC-8 | script | BLOCKED |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-10 | script | BLOCKED |

## Evidence

- eval: E1
  run_id: minted-tien-te-chua-tai-khong-doan-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_tao_dang_tai
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [715.00ms]

- eval: E2
  run_id: minted-tien-te-chua-tai-khong-doan-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_tao_loi
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [978.00ms]

- eval: E3
  run_id: minted-tien-te-chua-tai-khong-doan-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_tao_ma_tran
  verified_at: 2026-09-24T00:00:00Z
  output: |
    Ran 1 test across 1 file. [1403.00ms]

- eval: E4
  run_id: minted-tien-te-chua-tai-khong-doan-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_nhanh_dang_tai
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [620.00ms]

- eval: E5
  run_id: minted-tien-te-chua-tai-khong-doan-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_nhanh_loi
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    1 expect() calls
    Ran 1 test across 1 file. [584.00ms]

- eval: E6
  run_id: minted-tien-te-chua-tai-khong-doan-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_nhanh_thu_lai
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    3 expect() calls
    Ran 2 tests across 1 file. [738.00ms]

- eval: E7
  run_id: minted-tien-te-chua-tai-khong-doan-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tcct_o_chua_biet
  verified_at: 2026-09-24T00:00:00Z
  output: |
    0 fail
    2 expect() calls
    Ran 1 test across 1 file. [366.00ms]

- eval: E8
  run_id: minted-tien-te-chua-tai-khong-doan-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T00:00:00Z
  screenshot: evidence/tao-loi-truoc-khi-chon.png
  observed: |
    4 frame da doc bang Read (anh that, khong doan tu tri nho):
    - tao-loi-truoc-khi-chon.png: tam "Thoả thuận mới" mo, o "Giá trị" co "150.000.000", dong duoi o do dung "Không tải được đồng tiền mặc định — chọn đồng tiền bên cạnh để nhập số tiền.", o chon canh no hien chu "Tiền tệ" (khong phai USD/ma dong tien nao) — dung Expected truoc-khi-chon.
    - tao-sau-khi-chon.png: sau khi chon EUR (DONG_CHON), o chon hien "EUR", dong duoi doi thanh "Đọc là 150.000.000 €" — dung mau "Đọc là " + so theo DONG_CHON.
    - nhanh-loi.png (evidence phu tro E11 cung lan chay): tam them nhanh tren cong ty gieo, dong loi dung cau nhanh-loi, co nut "Thử lại" canh o, nut "Tạo thoả thuận" khong khoa (mau xanh binh thuong).
    - nhanh-sau-thu-lai.png: sau Thu lai, dong doi thanh "Đọc là 150.000.000 ₫" (theo dong bao cao VND), khong con nut "Thử lại".
    Doi chung voi ban truoc vong (PR #114, o chon hien USD) khong con xay ra — o chon dung la nhan trung tinh "Tiền tệ" khi chua biet dong tien, dung nhu Expected mong.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-tien-te-chua-tai-khong-doan-E9-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T00:00:00Z
  cannot_run: true
  reason: "Verification script requires the API server running at http://localhost:3001, but it is not accessible. The verification test tried to create a dev session but failed at connection stage. To run this verification: start the API server with `cd apps/api && bun run dev` in another terminal, then retry the verification command."
  output: |
    error: Unable to connect. Is the computer able to access the url?
      path: "http://localhost:3001/api/trpc/deals.list?input=%7B%22q%22%3A%22tcctmuf7xho6%22%2C%22pageSize%22%3A50%7D"
     errno: 0,
      code: "ConnectionRefused"
    Bun v1.3.10 (macOS arm64)

- eval: E10
  run_id: minted-tien-te-chua-tai-khong-doan-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tcct_soi_ma
  verified_at: 2026-09-24T00:00:00Z
  output: |
    soi-ma: 10/10 khang dinh, 0 lech

- eval: E11
  run_id: minted-tien-te-chua-tai-khong-doan-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T00:00:00Z
  screenshot: evidence/nhanh-loi.png
  observed: |
    nhanh-loi.png (bang chung 1, cong ty gieo, tam them nhanh, add=deal): o "Giá trị" = "150.000.000", co nut "Thử lại" ngay canh o (dung vi tri, chu "Thử lại"); dong duoi o = "Không tải được đồng tiền báo cáo, nên chưa lưu được số tiền. Bỏ trống số tiền để tạo thoả thuận, hoặc thử lại." khop dung CAU_NHANH_LOI trong script; nut "Tạo thoả thuận" hien mau xanh dam (fill), khong co dang xam/mo cua trang thai disabled — dung Expected "nút Tạo không khoá".
    nhanh-sau-thu-lai.png (bang chung 2, cung tam sau khi bam Thử lại): nut "Thử lại" da bien mat khoi canh o "Giá trị"; dong duoi o doi thanh "Đọc là 150.000.000 đ" (dong bao cao doc duoc tu server la VND, ky hieu "đ" dung dinh dang tienVi("VND")); nut "Tạo thoả thuận" van hien fill, khong khoa. Ca hai frame khop dung Expected cua E11, khong roi vao doi chung cua ban truoc vong (khong khoa Tao, khong con Thu lai sau khi bam).
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-tien-te-chua-tai-khong-doan-E12-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tcct_man_that
  verified_at: 2026-09-24T00:00:00Z
  cannot_run: true
  reason: "Verification script requires the API server running at http://localhost:3001, but it is not accessible. The verification test tried to create a dev session but failed at connection stage. To run this verification: start the API server with `cd apps/api && bun run dev` in another terminal, then retry the verification command."
  output: |
    error: Unable to connect. Is the computer able to access the url?
      path: "http://localhost:3001/api/trpc/deals.list?input=%7B%22q%22%3A%22tcctmuf7xho6%22%2C%22pageSize%22%3A50%7D"
     errno: 0,
      code: "ConnectionRefused"
    Bun v1.3.10 (macOS arm64)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muf7xh8t4yeb
  exit_code: 0
  verified_at: 2026-09-24T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tien-te-chua-tai-khong-doan-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform.

## Iterations

Round 1: BLOCKED — E9, E12 (bun _acceptance/tien-te-chua-tai-khong-doan/rang/man-that.mjs) không chạy được vì API server tại http://localhost:3001 không truy cập được (ConnectionRefused khi script cố tạo dev session để đọc deals.list); E1-E8, E10, E11 đã PASS trên cùng lượt chạy. Remedy: khởi động `cd apps/api && bun run dev` ở một terminal khác rồi chạy lại man-that.mjs cho E9/E12 — chưa quay lại implementation, không phải một fail cần sửa code.
