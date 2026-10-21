---
schema_version: 2
feature_slug: so-do-toan-vung
verdict: REJECT
failed_evals: ["E11"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e9ebbc1ece06f0d8732b9b3c6d9c6623f1d9fd31
human_signoff:
---

# Evidence Report: so-do-toan-vung

Round 1. Nội dung thay trọn các round cũ; lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-so-do-toan-vung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_khung
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 1 test across 1 file. [1.59s]

- eval: E2
  run_id: minted-so-do-toan-vung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_toan_man
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 2 tests across 1 file. [5.00ms]

- eval: E3
  run_id: minted-so-do-toan-vung-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hai_kieu
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 3 tests across 1 file. [2.23s]

- eval: E4
  run_id: minted-so-do-toan-vung-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_loi_vao
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 2 tests across 1 file. [1.81s]

- eval: E5
  run_id: minted-so-do-toan-vung-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_duong_cu
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 3 tests across 1 file. [364.00ms]

- eval: E6
  run_id: minted-so-do-toan-vung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_bo_cay
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 1 test across 1 file. [569.00ms]

- eval: E7
  run_id: minted-so-do-toan-vung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_hep
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 1 test across 1 file. [1.89s]

- eval: E8
  run_id: minted-so-do-toan-vung-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_trang_thai
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Ran 1 test across 1 file. [2.12s]

- eval: E9
  run_id: minted-so-do-toan-vung-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk6_chu
  verified_at: 2026-10-21T14:53:00Z
  output: |
    Lệnh ghép vk6-chu và messages-guard.spec.ts, cả hai đoạn đều xong.

- eval: E10
  run_id: s4-r1-e10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk6_man
  verified_at: 2026-10-21T14:53:00Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/dazzling-bohr-10e829/.acceptance-runs/so-do-toan-vung/man/thuong-1440.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) thuong-1440.png: vỏ khu thật, thanh bên khu rộng (Của tôi, Bộ OKR, Lấy ý kiến 3, Sức khoẻ, mục Sơ đồ đang chọn), breadcrumb 'Báo cáo > Sơ đồ góp vào', chip 'Mọi đơn vị 23' / 'Cần chú ý 5', nút 'Toàn màn hình'; khung vẽ react-flow lấp đầy vùng nội dung tới sát đáy cửa sổ (đáy ~976 trên 1000), có cây cả công ty (OneHub Center, các khối, thẻ Sơ đồ A/B/X/B1/B2/B3) và thanh zoom 49%, không thanh cuộn tài liệu. (2) toan-man-1440.png: thanh bên khu vắng, khung vẽ chiếm trọn bề rộng (từ x~80 tới ~1415), nút đổi thành 'Thoát toàn màn hình', cùng nội dung sơ đồ dịch sang trái. (3) sau-esc-1440.png: thanh bên khu trở lại, nút 'Toàn màn hình' đang có vòng focus, bố cục như ảnh 1. (4) quanh-1440.png: sau khi bấm 'Xem trên sơ đồ' từ ngăn, breadcrumb 'Báo cáo > Sơ đồ > Sơ đồ · A1 góp mục tiêu khối A', 'Đang xem quanh: Sơ đồ · A1 góp mục tiêu khối A', dải 'Góp lên công ty qua KR «Doanh thu hợp đồng mới đạt 48 tỷ đồng» của mục tiêu «Trở thành đối tác logistics được chọn đầu tiên ở hai miền»', thẻ tâm có viền xanh, hai KR dưới, thẻ cha phía trên, liên kết 'Về sơ đồ cả công ty'; khớp KR công ty n1-k1 của bộ gieo. (5) hep-ca-cong-ty-390.png: danh sách thẻ xếp dọc (OneHub Center, Khối Kinh doanh, Khối Vận hành, Khối Hỗ trợ, Sơ đồ · Khối A), không khung vẽ, không nút toàn màn hình, không cuộn ngang. (6) hep-quanh-390.png: danh sách dọc 'Góp vào' (Công ty, Công ty, Sơ đồ · A góp KR doanh thu năm) rồi 'Mục tiêu này', có liên kết 'Về sơ đồ cả công ty', không khung vẽ, không tràn ngang. Tất cả khớp Expected, không frame nào mâu thuẫn.
    Lưu ý khi soạn báo cáo: ảnh hep-ca-cong-ty-390.png cho thấy danh sách chạy tới sát đáy khung nhìn 390x844 (thẻ 'Sơ đồ · Khối A' bị cắt ở mép dưới); kiểm của E10 ở khổ này chỉ đo cuộn ngang, không đo việc cuộn dọc tới được mục cuối. Xem review-findings.md, mục Trong hợp đồng.
  network_observed: n-a (driver)
  output: |
    KET LUAN: 19 DUNG, 0 SAI. Lệnh khai chạy nguyên văn qua tien-de.mjs, phiên đo riêng (kho crm_dazzling_bohr_10e829_do, app :4380, api :4674), cuối log 'phien-do: xong', phiên đã dọn.
    Đủ 6 ảnh trong .acceptance-runs/so-do-toan-vung/man/: thuong-1440, toan-man-1440, sau-esc-1440, quanh-1440, hep-ca-cong-ty-390, hep-quanh-390.
    Console 390 và 1440 đều 0 lỗi; hai ca điều hướng giữ toàn màn hình đều DUNG.

- eval: E11
  run_id: minted-so-do-toan-vung-E11-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk6_giu_ho_so
  verified_at: 2026-10-21T14:53:00Z
  output: |
    DO khung-cho-don-vi-mot-hinh/E3: 1
    DO khung-cho-don-vi-mot-hinh/E4: 1
    DO khung-cho-don-vi-mot-hinh/E9: 1
    DO vo-khu-muc-tieu/E4: 1
    DO vo-khu-muc-tieu/E6: 1
    DO vo-khu-muc-tieu/E10: 1
    DO vo-khu-muc-tieu/E12: 1
    DO vo-khu-muc-tieu/E13: 1
    DO vo-khu-muc-tieu/E14: 1
    DO vo-khu-muc-tieu/E9: 1
    KET LUAN: 263 GIU, 16 DO, 54 DO-SAN-NEN, 1 CHAP-CHON, 0 HOAN, 0 BO RA, 0 loi nghi, 247 lenh
    (Đuôi đầu ra chỉ hiện 10 trong 16 dòng DO; 6 dòng còn lại nằm phía trên đuôi. Không có dòng MAT THUOC nào trong đuôi. Nguyên nhân từng eval cũ chạy lại ra mã khác 0: chưa rõ, máy không trả dòng log nguyên văn của lệnh con.)
  note: Lệnh bun _acceptance/so-do-toan-vung/rang/giu-ho-so.mjs gắn E11, nên không có lệnh fail nào nằm ngoài eval.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-toan-vung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bun run lint:slop
  run_id: minted-so-do-toan-vung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-toan-vung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-21T14:53:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo là xanh ở cả hai phía; mọi eval có baseline n-a (lý do ở mục «Baseline khong do» ngay dưới), nên chưa chứng minh được eval nào phân biệt code cũ với code mới.

Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-khung: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-toan-man && bun test ./test/okr-toan-man-hinh.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-hai-kieu: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-loi-vao.dom.tsx -t vk6-loi-vao: bo qua baseline: tep apps/app/test/okr-so-do-loi-vao.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test ./test/so-do-toan-vung-duong-cu.spec.ts -t vk6-duong-cu: bo qua baseline: tep apps/app/test/so-do-toan-vung-duong-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-bo-cay && bun test ./test/so-do-toan-vung-duong-cu.spec.ts -t vk6-bo-cay: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-hep: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-trang-thai: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-toan-vung.dom.tsx -t vk6-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-toan-vung.dom.tsx co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-toan-vung/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/so-do-toan-vung/rang/giu-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 110a073771341ee7315be78538f9ed1a6610102b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần, không eval nào có nhiều lần chạy; không eval nào cho kết quả khác nhau giữa các lần.

## Iterations

Round 1: E11 failed — giu-ho-so.mjs chạy lại các eval đã ký bị vòng này chạm và 16 eval trả mã khác 0 (đuôi đầu ra hiện khung-cho-don-vi-mot-hinh E3/E4/E9 và vo-khu-muc-tieu E4/E6/E9/E10/E12/E13/E14; nguyên nhân từng eval chưa rõ vì thiếu dòng log nguyên văn). Returned to implementation.
