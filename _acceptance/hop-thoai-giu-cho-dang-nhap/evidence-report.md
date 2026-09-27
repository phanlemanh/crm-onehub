---
schema_version: 2
feature_slug: hop-thoai-giu-cho-dang-nhap
verdict: REJECT
failed_evals: [E10]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2ee32f641005781656ba000bb1ea42d1b3bbcb97
human_signoff:
---

# Evidence Report: hop-thoai-giu-cho-dang-nhap

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | FAIL |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_bam_ngoai
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [608.00ms]

- eval: E2
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_hoi_lai
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     14 expect() calls
    Ran 8 tests across 1 file. [759.00ms]

- eval: E3
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_sheet
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [727.00ms]

- eval: E4
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_drawer
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     10 expect() calls
    Ran 9 tests across 1 file. [5.26s]

- eval: E5
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_may_dong
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     7 expect() calls
    Ran 7 tests across 1 file. [788.00ms]

- eval: E6
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hg_lop_con
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     6 expect() calls
    Ran 3 tests across 1 file. [758.00ms]

- eval: E7
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_tu_khai
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [644.00ms]

- eval: E8
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hg_confirm_chung
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     590 expect() calls
    Ran 101 tests across 1 file. [564.00ms]

- eval: E9
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hg_huy_qua_nut_dong
  verified_at: 2026-09-27T03:47:29Z
  output: |
    huy: doi chung duong bat 1/1 vi pham
    huy: 26/26 tep, 0 vi pham, 27 nut qua nut dong
    huy: khai tay 1 tep ngoai bo rut may

- eval: E10
  run_id: crm_compassionate_hofstadter_928035_do
  exit_code: 1
  verifier: config:executors.script.hg_man_that
  verified_at: 2026-09-27T03:47:29Z
  screenshot: .acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/hg-kr-giu.png
  observed: |
    Mở từng frame đã lưu bằng Read và đối chiếu Expected:

    - hg-kr-giu.png (bước 1, 1440px): hộp "Thêm KR" còn mở sau khi bấm ra ngoài — ĐÚNG phần "hộp còn". NHƯNG ô "Tên KR" ở trên cùng hiển thị RỖNG, không có chữ "Buổi gặp khách hàng mới". Chữ đó lại nằm trong ô "Đơn vị đo" (label "Đơn vị đo" → giá trị "Buổi gặp khách hàng mới"). Đây là SAI so với Expected "gõ tên ... ô còn tên": chữ đã gõ vào field số 5 (donVi), không phải field số 1 (ten). Đối chiếu source `apps/app/app/(app)/[slug]/okr/hop-thoai-kr.tsx` dòng 320 (Tên KR, input đầu tiên) và dòng 442 (Đơn vị đo, input cuối cùng còn hiện khi không có Trọng số) xác nhận: selector của man-giu-cho.mjs (`[data-hop-thoai-kr='moi'] input`, lấy phần tử `.at(-1)`) chọp trúng input CUỐI trong DOM là Đơn vị đo, không phải Tên KR. Assertion nội bộ của script vẫn tự-nhất-quán (nó đọc lại giá trị từ đúng cùng selector) nên in "buoc 1: dat", nhưng bằng chứng ảnh KHÔNG chứng minh được đúng field mà Expected mô tả.
    - hg-hoi-lai-1440.png (bước 2): alertdialog đúng chữ "Bỏ những gì vừa nhập?" / "Tiếp tục sửa" (viền xanh, đang focus) / "Bỏ" (đỏ) — khớp Expected.
    - hg-deal-huy.png (bước 3): alertdialog giống hệt bố cục bước 2 (cùng ba chữ), sau khi bấm nút Huỷ của ngăn Thoả thuận mới — khớp Expected "ngăn còn hỏi lại".
    - hg-drawer-390.png (bước 4, 390px): alertdialog dạng mobile (nút xếp dọc, "Bỏ" trên/đỏ, "Tiếp tục sửa" dưới) hiện sau Esc trên drawer đang gõ dở ô Trao đổi — khớp Expected.
    - hg-drawer-vuot-390.png (bước 5): giống HỆT byte-for-byte với hg-drawer-390.png (đã so md5, trùng khớp 100%). Điều này khớp hợp lý với thiết kế: cả hai đường đóng (Esc và kéo tay nắm xuống 320px) đều bị cùng một guard chặn và bật lại đúng một alertdialog, đưa UI về đúng cùng trạng thái nghỉ — không phải lỗi chụp trùng ảnh, mà là bằng chứng cho thấy hai đường đóng có hành vi giữ-chỗ giống hệt nhau.
    - hg-kr-chi-doi-o-chon.png, hg-muc-tieu-chi-doi-o-chon.png, hg-don-vi-chi-doi-o-chon.png (bước 6): cả ba hộp (Sửa KR, Sửa mục tiêu, Chuyển bộ phận) đều còn mở sau khi bấm ra ngoài, ô chọn giữ giá trị mới (Kiểu→"Giảm xuống" kèm lỗi validate đích/khởi điểm hợp lý; Loại→"Tham vọng"; đơn vị đích→"Khối Kinh doanh…") — khớp Expected.
  network_observed: n-a (driver)
  output: |
    Lệnh chạy: cd "<worktree>" && bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs" (timeout 600000ms, chạy nền, hoàn tất tự nhiên, không bị công cụ giết).
    tien-de.mjs tự phát hiện DATABASE_URL="crm" không phải kho dùng-một-lần → tự chạy trong phiên đo riêng qua phien-do.mjs: kho crm_compassionate_hofstadter_928035_do, app http://localhost:4545, api http://localhost:4790 (đúng mô tả "kho _do riêng, API và app của chính cây trên hai cổng tự do").
    canh-cay: không có dòng lỗi "KHONG DO DUOC"/"khac-cay" → cây được đo đúng là cây đang xét (man-giu-cho.mjs gọi canhCay() trước khi mở trang nào).
    Gieo dữ liệu qua tRPC thật: hai dev:session (agja4iww@thu.test admin, tgja4iww@thu.test trưởng phòng) chạy thành công, không log lỗi.

    buoc 1: dat (script tự báo) — NHƯNG frame hg-kr-giu.png cho thấy chữ đã gõ nằm SAI Ô (Đơn vị đo thay vì Tên KR) → MÂU THUẪN với Expected "gõ tên ... ô còn tên". => ASSERTION NÀY FAIL theo luật "observed mâu thuẫn Expected".
    buoc 2: dat — frame hg-hoi-lai-1440.png khớp đúng ba chữ hộp hỏi, Tiếp tục sửa focus đúng, Bỏ xoá đúng (KR count không đổi, log không báo lệch). PASS.
    buoc 3: dat — frame hg-deal-huy.png khớp: nút Huỷ → alertdialog, ngăn còn. PASS.
    buoc 4: dat — frame hg-drawer-390.png khớp: drawer còn, chữ còn, alertdialog đúng chữ. PASS.
    buoc 5: dat — frame hg-drawer-vuot-390.png khớp: sau kéo tay nắm 320px vẫn còn alertdialog, drawer nằm trọn viewport (script check getBoundingClientRect), bấm Tiếp tục sửa quay lại bấm được đúng ô Trao đổi (elementFromPoint). PASS.
    buoc 6: dat — ba frame hg-*-chi-doi-o-chon.png khớp: cả ba hộp KR/mục tiêu/đơn vị đều còn mở sau khi đổi đúng một ô chọn rồi bấm ra ngoài. PASS.
    "loi console app" không xuất hiện trong log → không lỗi console app trong toàn bộ 6 bước (script tự theo dõi pageerror + console.error, đã lọc dòng React DevTools).
    man-giu-cho: dat (mã thoát nội bộ của script bằng 0); tien-de dọn contextDevApiKey và ảnh đại diện thành công; phien-do: xong; mã thoát của toàn bộ pipeline cũng bằng 0, nhưng đây là mã do CHÍNH script sinh, không phải phán quyết độc lập của verifier.

    PHÁN QUYẾT ĐỘC LẬP CỦA VERIFIER: mặc dù pipeline thoát mã sạch và cả 6 "buoc N: dat" đều tự báo đạt, bằng chứng ảnh của bước 1 (hg-kr-giu.png) không chứng minh đúng điều Expected mô tả — chữ gõ vào lại nằm ở ô "Đơn vị đo" chứ không phải ô "Tên KR", do selector `[data-hop-thoai-kr='moi'] input` của man-giu-cho.mjs lấy input CUỐI trong DOM (Đơn vị đo) thay vì input ĐẦU (Tên KR). Đây là lỗi trong chính răn (test) man-giu-cho.mjs (bug chọn selector), không phải lỗi trong code sản phẩm — cơ chế giữ-chỗ (giữ hộp mở + giữ giá trị + hỏi lại khi đóng) đã được nó chứng minh đúng cho ô Đơn vị đo, nhưng KHÔNG chứng minh cho ô Tên KR như Expected yêu cầu. Theo luật của người gọi ("observed mâu thuẫn Expected → FAIL"), verifier buộc phải trả verdict thất bại cho eval này dù lệnh chạy trót lọt.
    Đề xuất sửa (không tự sửa vì verifier độc lập): đổi selector ô gõ ở bước 1/2 trong man-giu-cho.mjs từ `[data-hop-thoai-kr='moi'] input` (lấy .at(-1)) sang selector trỏ đúng input Tên KR, ví dụ `[data-hop-thoai-kr='moi'] input[id$='-ten']`, rồi chạy lại toàn bộ E10 để có bằng chứng đúng.
    CHIỀU ĐỎ (--chieu-do): KHÔNG chạy trong lượt này vì không nằm trong danh sách 8 bước được giao chấm theo thứ tự — nếu cần xác nhận eval không vacuously-pass, cần chạy thêm `bun _acceptance/hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs --chieu-do` ở lượt sau.
    NETWORK TRUTH: driver là script Node/puppeteer-core chạy qua Bash, không có công cụ đọc network/console trực tiếp (không phải browser-tool có read_network_requests/read_console_messages). Bản thân man-giu-cho.mjs có tự theo dõi pageerror + console.error nội bộ và log "loi console app" nếu có — log không xuất hiện dòng đó nên không có lỗi console app tự phát hiện được, nhưng đây không phải kiểm tra network/wire đầy đủ theo đúng nghĩa NETWORK TRUTH → networkObserved = "n-a (driver)".
    Ảnh lưu tại: .acceptance-runs/hop-thoai-giu-cho-dang-nhap/evidence/hg-kr-giu.png, hg-hoi-lai-1440.png, hg-deal-huy.png, hg-drawer-390.png, hg-drawer-vuot-390.png, hg-kr-chi-doi-o-chon.png, hg-muc-tieu-chi-doi-o-chon.png, hg-don-vi-chi-doi-o-chon.png (8 file, đều mở và đọc bằng Read).

- eval: E11
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.hg_san_thiet_ke
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     38 expect() calls
    Ran 17 tests across 2 files. [112.00ms]

- eval: E12
  run_id: minted-hop-thoai-giu-cho-dang-nhap-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.hg_o_loc
  verified_at: 2026-09-27T03:47:29Z
  output: |
     0 fail
     10 expect() calls
    Ran 10 tests across 1 file. [791.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muja2zk51x99
  exit_code: 0
  verified_at: 2026-09-27T03:47:29Z
  output: |
      Time:    4m13.505s

    test-run: dropped crm_muja2zk51x99_test

- cmd: bunx turbo run lint --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-27T03:47:29Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    483ms

- cmd: bun run lint:slop
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-27T03:47:29Z
  output: |
    Found 0 warnings and 0 errors.
    Finished in 853ms on 1682 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-hop-thoai-giu-cho-dang-nhap-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-27T03:47:29Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    10.197s

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — bằng chứng ảnh bước 1 (hg-kr-giu.png) cho thấy chữ gõ vào nằm sai ô (Đơn vị đo thay vì Tên KR) do bug selector `.at(-1)` trong man-giu-cho.mjs, mâu thuẫn với Expected dù cơ chế giữ-chỗ của sản phẩm tự nó đúng; cần sửa selector của kịch bản đo rồi chạy lại E10.
