---
schema_version: 2
feature_slug: trang-bo-okr
verdict: REJECT
failed_evals: ["E15","E17","E14"]
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f1781c3b21863a7fc76c6874b61d6a21c2223c32
human_signoff:
---

# Evidence Report: trang-bo-okr

Round 3. Verdict REJECT: ba eval đỏ là E15 và E17 (phép quét không-đổi-hình báo SAI AC-11 trên một số hồ sơ cũ đã ký) và E14 (kiểm bằng mắt: trang một bộ vẫn đặt tiêu đề «Mục tiêu» thay cho tên đơn vị). Hai lệnh suite cũng đỏ: `bun run test -- --filter=app --filter=@crm/ui` (bài `mot-nut-tao-muc-tieu.dom.tsx`, hai ca đỏ) và `bun run lint:slop` (một lỗi ở `apps/api/test/okr-danh-sach-bo.spec.ts:733`). Hai lệnh suite này không gắn eval nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-6 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | ui-check | FAIL |
| E15 | AC-11 | script | FAIL |
| E16 | AC-6 | test | PASS |
| E17 | AC-11 | script | FAIL |
| E18 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-bo-okr-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_hang
  verified_at: 2026-10-23T08:08:24Z
  output: |
    test-run: dropped crm_mvkougd74ryd_test

- eval: E2
  run_id: minted-trang-bo-okr-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-trang-bo-okr-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_co
  verified_at: 2026-10-23T08:08:24Z
  output: |
    test-run: dropped crm_mvkougmnna3j_test

- eval: E4
  run_id: minted-trang-bo-okr-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-trang-bo-okr-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-trang-bo-okr-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_the
  verified_at: 2026-10-23T08:08:24Z
  output: |
    Ran 7 tests across 1 file. [2.76s]

- eval: E7
  run_id: minted-trang-bo-okr-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E8
  run_id: minted-trang-bo-okr-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_viec
  verified_at: 2026-10-23T08:08:24Z
  output: |
    test-run: dropped crm_mvkoug1tvvp4_test

- eval: E9
  run_id: minted-trang-bo-okr-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-trang-bo-okr-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E11
  run_id: minted-trang-bo-okr-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_lien_ket
  verified_at: 2026-10-23T08:08:24Z
  output: |
    Ran 16 tests across 1 file. [1.64s]

- eval: E12
  run_id: minted-trang-bo-okr-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  output: |
    phien-do: xong — mã 0

- eval: E13
  run_id: minted-trang-bo-okr-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_tai
  verified_at: 2026-10-23T08:08:24Z
  output: |
    Ran 3 tests across 1 file. [915.00ms]

- eval: E14
  run_id: trang-bo-okr-s4-r3-e14
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-23T08:08:24Z
  screenshot: evidence/tbo-danh-sach-1440-sang.png
  observed: |
    Đã mở cả sáu ảnh vừa do lệnh ghi lúc 15:11 ngày 23/10, không dùng ảnh cũ.
    1) tbo-danh-sach-1440-sang.png: nền sáng. Tiêu đề trang là «Mục tiêu», dưới có dòng «Bộ OKR» và ba chip lọc «Tất cả 14 · Tôi dẫn 1 · Đang theo dõi 1» nằm trên bảng. Bảng có năm cột (Bộ OKR của · Trưởng · Mục tiêu · Tiến độ · KR tự tin thấp), 14 hàng thụt theo cấp OneHub Center > Khối > phòng ban. Không có nút primary xanh, chỉ có nút «Hỏi Kara» viền. Chữ và viền đọc được. KHỚP expected.
    2) tbo-danh-sach-1440-toi.png: cùng bố cục trên nền đen, chữ xám cột và viền bảng vẫn đọc được, chip đang chọn có viền xanh. KHỚP.
    3) tbo-danh-sach-375-sang.png: không có bảng, các mục là thẻ (OneHub Center, Khối Kinh doanh…), chip lọc ở trên, không tràn ngang. KHỚP.
    4) tbo-mot-bo-1440-sang.png: có đường dẫn «Bộ OKR › Kinh doanh miền Bắc» ở đầu, hàng thẻ con gạch chân «OKR · Họp tuần · Việc · Sơ đồ góp vào» ngay dưới đầu trang, thẻ OKR đang mở có gạch chân và chữ đậm hơn, có ô chọn đơn vị, không có ô chuyển kiểu xem. NHƯNG tiêu đề trang (cỡ chữ lớn) vẫn là «Mục tiêu», và dòng mô tả là «Bộ OKR của từng đơn vị trong chu kỳ…». Tên đơn vị «Kinh doanh miền Bắc» chỉ xuất hiện ở đường dẫn, cỡ chữ nhỏ, không phải tiêu đề.
    5) tbo-mot-bo-1440-toi.png: giống ảnh 4 trên nền tối, cùng điểm lệch (tiêu đề vẫn «Mục tiêu»).
    6) tbo-mot-bo-375-sang.png: tiêu đề «Mục tiêu», đường dẫn «Bộ OKR › Kinh doanh miền Bắc», bốn thẻ con nằm trọn khung, ô chọn đơn vị và nút Lọc xếp dọc, mục tiêu dạng thẻ, không cuộn ngang. Cùng điểm lệch tiêu đề.
    Đối chiếu bản mẫu a7b9e4325 (man.tsx, ManTrangDonVi): tiêu đề trang là tên đơn vị («Chăm sóc khách hàng»), đường dẫn nằm phía trên tiêu đề. Chỗ lệch được phép trong expected và bản thiết kế chỉ gồm ô chọn đơn vị, thẻ Chấm điểm, nội dung Sơ đồ cả chu kỳ, lọc ghi URL. Tiêu đề «Mục tiêu» thay cho tên đơn vị không thuộc bốn chỗ ấy, nên là chỗ lệch khác. Điểm này sai với expected «tiêu đề tên đơn vị» và sai với bản thiết kế (docs/superpowers/specs/2026-10-21-trang-bo-okr-design.md: «một bộ — tên đơn vị»).
  network_observed: n-a (driver)
  output: |
    Lệnh chụp ảnh chạy xong, log ghi «phien-do: xong — mã 0» và «KET LUAN tbo: 0 DUNG, 0 SAI» (chế độ EVAL=E14 chỉ chụp ảnh, không đếm khẳng định). Phiên đo riêng tự dựng app :4505 và api :4124 rồi tự dọn.
    - PASS: sáu ảnh có mặt, do chính lệnh ghi lúc 15:11 hôm nay.
    - PASS: danh sách 1440 sáng và tối có bảng năm cột, thụt theo cấp, lọc ba mục trên bảng, không có nút primary.
    - PASS: danh sách 375 là các mục thẻ, không bảng, không tràn ngang.
    - PASS: một bộ có đường dẫn «Bộ OKR» ở đầu, hàng thẻ con gạch chân ngay dưới đầu trang, không có ô chuyển kiểu xem.
    - PASS: chữ và viền không chìm vào nền ở cả sáng và tối.
    - FAIL: một bộ phải có tiêu đề là tên đơn vị nhưng tiêu đề trang vẫn là «Mục tiêu» ở cả ba ảnh (1440 sáng, 1440 tối, 375). Chỗ lệch này không nằm trong các chỗ được phép.
    - Ghi chú: thẻ Chấm điểm không hiện ở ảnh; bản thiết kế cho phép (chỉ hiện ở pha chấm điểm hoặc đã đóng). Nút «Soạn OKR» của bản mẫu không có ở bản dựng, nhưng expected không nêu nên không dùng làm căn cứ.
    Ảnh lưu (cùng thư mục evidence/): tbo-danh-sach-1440-sang.png, tbo-danh-sach-1440-toi.png, tbo-danh-sach-375-sang.png, tbo-mot-bo-1440-sang.png, tbo-mot-bo-1440-toi.png, tbo-mot-bo-375-sang.png. Nhật ký: .acceptance-runs/trang-bo-okr/s4-r3-e14.log.

- eval: E15
  run_id: minted-trang-bo-okr-E15-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh
  verified_at: 2026-10-23T08:08:24Z
  output: |
    SAI AC-11: HO SO dieu-huong-khu-muc-tieu#E11: cay 1 · nen 0
    HO SO doi-nhan-khu-muc-tieu#E12: cay 1 · nen 2
    DO SAN TREN NEN doi-nhan-khu-muc-tieu#E12
    HO SO trang-lo-trinh-trong-crm#E16: cay 1 · nen 1
    DO SAN TREN NEN trang-lo-trinh-trong-crm#E16
    SAI AC-11: HO SO tro-ly-okr-tom-tat#E17: cay 1 · nen 0
    HO SO ve-sinh-do-san-onehub#E15: cay 2 · nen 2
    DO SAN TREN NEN ve-sinh-do-san-onehub#E15
    KET LUAN khong-doi-hinh: 2 SAI

- eval: E16
  run_id: minted-trang-bo-okr-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_viec
  verified_at: 2026-10-23T08:08:24Z
  output: |
    Ran 2 tests across 1 file. [930.00ms]

- eval: E17
  run_id: minted-trang-bo-okr-E17-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh_2
  verified_at: 2026-10-23T08:08:24Z
  output: |
    HO SO trang-don-vi-mot-bang#E16: cay 2 · nen 2
    DO SAN TREN NEN trang-don-vi-mot-bang#E16
    HO SO trang-don-vi-mot-bang#E18: cay 2 · nen 2
    DO SAN TREN NEN trang-don-vi-mot-bang#E18
    HO SO tro-ly-okr-de-xuat#E24: cay 1 · nen 2
    DO SAN TREN NEN tro-ly-okr-de-xuat#E24
    HO SO vo-khu-muc-tieu#E10: cay 1 · nen 1
    DO SAN TREN NEN vo-khu-muc-tieu#E10
    KET LUAN khong-doi-hinh: 3 SAI
    (phần đuôi nhật ký lưu lại không hiện dòng «SAI AC-11» nào của phần này; nguyên nhân cụ thể: chưa rõ, xem .acceptance-runs/trang-bo-okr/ để tra từng dòng)

- eval: E18
  run_id: minted-trang-bo-okr-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh_3
  verified_at: 2026-10-23T08:08:24Z
  output: |
    KET LUAN khong-doi-hinh: dat

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-23T08:08:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 1
  verified_at: 2026-10-23T08:08:24Z
  output: |
    mnt-man-doc: 6 o client x vai, 2 o trang server tinh, 2 o dang tai — khong nut chinh, khong nut tao; doi chung duong (đỏ)
    test/mot-nut-tao-muc-tieu.dom.tsx: 17 pass, 2 fail (Ran 19 tests across 1 file)
    Failed: app#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-23T08:08:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-23T08:08:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-23T08:08:24Z

- cmd: bun run lint:slop
  run_id: minted-trang-bo-okr-SUITE-bun_run_lint_slop-r3
  exit_code: 1
  verified_at: 2026-10-23T08:08:24Z
  output: |
    anti-slop(no-known-value-widening): apps/api/test/okr-danh-sach-bo.spec.ts:733:43 — binding `hang` khai kiểu Record<string, HangViecBo> làm mất kiểu đã biết của giá trị khởi tạo
    Found 0 warnings and 1 error.

- cmd: bunx turbo run build --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-23T08:08:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: các eval có baseline n-a (không đo được trên nền cũ) không phải eval không-phân-biệt; lý do từng lệnh nằm ở mục dưới.

Baseline khong do:
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-viec-ten: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 1/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 2/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs --phan 3/3: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base 50c86ba4c281cd83b2736532647352d9330670d0 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 BLOCKED — lệnh khong-doi-hinh.mjs vượt trần thời gian mặc định vì evals.yaml không khai long_running cho E15; 14 eval còn lại và 7 lệnh suite xanh. Cách gỡ: khai long_running cho E15 rồi chạy lại.
Round 2: cả 15 eval và 7 lệnh suite xanh (E15 chạy xong, đạt). REJECT vì bốn phát hiện trong hợp đồng chưa xử lý: tiêu đề việc rỗng ở thẻ Việc khi việc liên kết bị xoá hoặc ẩn quyền (AC-6, hai mục), danh sách hồ sơ của E15 viết tay bỏ sót hồ sơ đã ký thuộc lớp (AC-11), và vai «danh-sach» của tbo-lien-ket chỉ khớp chuỗi chứ không đọc href (AC-7). Trả về implementation.
Round 3: E15 và E17 đỏ (phép quét không-đổi-hình báo SAI AC-11 trên các hồ sơ cũ đã ký, ví dụ dieu-huong-khu-muc-tieu#E11 và tro-ly-okr-tom-tat#E17 đỏ trên cây nhưng xanh trên origin/onehub); E14 đỏ (trang một bộ giữ tiêu đề «Mục tiêu», không đặt tên đơn vị làm tiêu đề). Hai lệnh suite đỏ ngoài eval: bài kiểm app mot-nut-tao-muc-tieu.dom.tsx và lint:slop ở okr-danh-sach-bo.spec.ts. Sau vòng 3 thì chuyển lên người, verdict REJECT.

