---
schema_version: 2
feature_slug: trang-bo-okr
verdict: BLOCKED
failed_evals: []
reason: |
  E15 (bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs): lenh chua xong sau hon 31 phut (bat dau 11:43 +07, quan sat den 12:14:37 +07; tien trinh bun PID 16675 van dang chay, con tien trinh con dang test trong thu muc tam tbo-khong-doi-*). Lenh duoc chuyen nen boi cong cu sau 600 giay (khong phai cong cu giet). evals.yaml khong khai long_running cho E15 (cau hinh.executors.script.tbo_khong_doi_hinh), nen tran mac dinh 30 phut da vuot. Cach go: khai long_running: 30 cho eval E15 trong evals.yaml roi chay lai. Khong co dong ket thuc kem ma thoat, khong co ma thoat, khong co run_id tu lenh. Khong kill tien trinh (cong cu khong cho dung tac vu nen); no se bi dong khi ket thuc luot.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b5b644421a02bd562914f31bfd1ec8376286232f
human_signoff:
---

# Evidence Report: trang-bo-okr

Round 1. Verdict BLOCKED: 14 trong 15 eval da chay xong va xanh; E15 chua co ket qua vi lenh vuot tran thoi gian mac dinh (xem reason).

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
| E14 | AC-10 | ui-check | PASS |
| E15 | AC-11 | script | BLOCKED |

## Evidence

- eval: E1
  run_id: minted-trang-bo-okr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_hang
  verified_at: 2026-10-22T04:42:49Z
  output: |
    test-run: dropped crm_mvj22e57iswo_test

    __EXIT=0

- eval: E2
  run_id: minted-trang-bo-okr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E3
  run_id: minted-trang-bo-okr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_co
  verified_at: 2026-10-22T04:42:49Z
  output: |
    test-run: dropped crm_mvj22dpf5lk9_test

    __EXIT=0

- eval: E4
  run_id: minted-trang-bo-okr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E5
  run_id: minted-trang-bo-okr-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E6
  run_id: minted-trang-bo-okr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_the
  verified_at: 2026-10-22T04:42:49Z
  output: |
    Ran 7 tests across 1 file. [1206.00ms]

    __EXIT=0

- eval: E7
  run_id: minted-trang-bo-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E8
  run_id: minted-trang-bo-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_api_viec
  verified_at: 2026-10-22T04:42:49Z
  output: |
    test-run: dropped crm_mvj22e4ccrr1_test

    __EXIT=0

- eval: E9
  run_id: minted-trang-bo-okr-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E10
  run_id: minted-trang-bo-okr-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E11
  run_id: minted-trang-bo-okr-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_lien_ket
  verified_at: 2026-10-22T04:42:49Z
  output: |
    Ran 8 tests across 1 file. [1056.00ms]

    __EXIT=0

- eval: E12
  run_id: minted-trang-bo-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E13
  run_id: minted-trang-bo-okr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbo_dom_tai
  verified_at: 2026-10-22T04:42:49Z
  output: |
    Ran 3 tests across 1 file. [1331.00ms]

    __EXIT=0

- eval: E14
  run_id: E14-s4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbo_man
  verified_at: 2026-10-22T04:42:49Z
  screenshot: evidence/tbo-danh-sach-1440-sang.png
  observed: |
    tbo-danh-sach-1440-sang.png: tiêu đề «Mục tiêu», mô tả một câu, nút viền Hỏi Kara bên phải (không có nút primary). Dòng «Bộ OKR», ba chip lọc Tất cả 14 (đang chọn, viền xanh) · Tôi dẫn 1 · Đang theo dõi 1 ở trên bảng. Bảng 14 hàng thụt theo cấp OneHub Center → 3 Khối → các phòng ban, năm cột Bộ OKR của · Trưởng · Mục tiêu · Tiến độ · KR tự tin thấp; chữ và viền rõ trên nền trắng. Thanh bên khu có mục Bộ OKR đang chọn.
    tbo-danh-sach-1440-toi.png: cùng bố cục trên nền đen; chữ trắng, viền bảng và chip nhìn rõ, không chìm.
    tbo-danh-sach-375-sang.png: không có bảng; danh sách thẻ gồm OneHub Center, Khối Kinh doanh, Kinh doanh miền Bắc... mỗi thẻ có «Trưởng · Mục tiêu N · Tiến độ N%»; ba chip lọc ở trên; không tràn ngang. Hàng điều hướng khu nằm ở đầu.
    tbo-mot-bo-1440-sang.png: tiêu đề «Mục tiêu», dòng vị trí «Bộ OKR › Kinh doanh miền Bắc» (Bộ OKR là liên kết), ngay dưới là hàng thẻ con gạch chân OKR (đậm, có gạch chân, đang mở) · Họp tuần · Việc · Sơ đồ góp vào; không có Chấm điểm (chu kỳ đang chạy) và không có ô chuyển kiểu xem. Thanh công cụ: ô chọn đơn vị (lệch được phép) + chip Tất cả 2 · Cần bàn 2 · Chưa góp vào đâu 0, kèm Lọc, Sắp xếp, Cột; bảng 2 mục tiêu; nút primary Thêm mục tiêu ở đầu trang.
    tbo-mot-bo-1440-toi.png: cùng bố cục trên nền đen, thẻ OKR đang mở gạch chân rõ, viền bảng và chữ phụ đọc được.
    tbo-mot-bo-375-sang.png: tiêu đề, nút Kara và Thêm mục tiêu xếp dọc, dòng vị trí, thẻ con OKR có gạch chân, ô chọn đơn vị và nút Lọc đầy ngang, mục tiêu hiện dạng thẻ dọc (không bảng tràn), không chữ hay viền chìm.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-trang-bo-okr-E15-r1
  status: BLOCKED (chua co ket qua)
  baseline: n-a
  verifier: config:executors.script.tbo_khong_doi_hinh
  verified_at: 2026-10-22T04:42:49Z
  output: |
    Tep dau ra dung 0 byte o 12:14:37 +07 (chua co dong ket thuc kem ma thoat). Tien trinh van song: bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs (elapsed 31:27), con node/bun cua tbo-khong-doi-53bNCy/crm (elapsed 03:55). Khong ket luan PASS hay FAIL. Lenh bi chuyen nen sau 600 giay, khong phai cong cu giet; E15 khong khai long_running nen vuot tran mac dinh 30 phut.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-trang-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bunx turbo run lint --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bun run lint:slop
  run_id: minted-trang-bo-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

- cmd: bunx turbo run build --force
  run_id: minted-trang-bo-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T04:42:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet) o cac eval da do duoc baseline (E2, E4, E5, E7, E9, E10, E12); cac eval con lai khong do duoc baseline (xem muc duoi), khong phai green-on-both.

Baseline khong do
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-hang": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-co": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-the: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-danh-sach-bo.spec.ts -t tbo-viec": bo qua baseline: tep apps/api/test/okr-danh-sach-bo.spec.ts co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-lien-ket: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/trang-bo-okr.dom.tsx -t tbo-tai: bo qua baseline: tep apps/app/test/trang-bo-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs: bo qua baseline: tep _acceptance/trang-bo-okr/rang/khong-doi-hinh.mjs co o cay dang kiem nhung chua co o merge-base f2eab4d5caa1b1f69204e71565dec7a02e98e348 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 BLOCKED — lenh khong-doi-hinh.mjs vuot tran thoi gian mac dinh 30 phut vi evals.yaml khong khai long_running cho E15; 14 eval con lai va 7 lenh suite xanh. Cach go: khai long_running: 30 cho E15 roi chay lai (khong phai loi ma nguon).
