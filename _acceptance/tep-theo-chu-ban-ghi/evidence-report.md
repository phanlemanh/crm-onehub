---
schema_version: 2
feature_slug: tep-theo-chu-ban-ghi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8584c8374be667f1b6886a1b74cd2d8c547e4f0d
human_signoff:
---

# Evidence Report: tep-theo-chu-ban-ghi

Round 1. Mọi eval máy chạy xong và xanh; verdict REJECT do workflow tính sẵn từ năm finding trong hợp đồng (E3, E5, E6) — xem review-findings.md và mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-tep-theo-chu-ban-ghi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_luat
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-luat"
    test-run: dropped crm_mvjnwi7h74oq_test

- eval: E1b
  run_id: mvjnwgseku8x
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_ham
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd packages/auth && bun test test/quyen-tep.spec.ts -t tcb-ham"
    test-run: dropped crm_mvjnwgseku8x_test

- eval: E2
  run_id: minted-tep-theo-chu-ban-ghi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_doi_chu
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-doi-chu"
    test-run: dropped crm_mvjnwgow7nqe_test

- eval: E3
  run_id: minted-tep-theo-chu-ban-ghi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_pham_vi
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-pham-vi"
    test-run: dropped crm_mvjnwh7ittmu_test

- eval: E4
  run_id: minted-tep-theo-chu-ban-ghi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_xoa
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-xoa"
    test-run: dropped crm_mvjnwgttml64_test

- eval: E5
  run_id: minted-tep-theo-chu-ban-ghi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_o_tep
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tep-theo-chu.dom.tsx -t tcb-o-tep
    Ran 3 tests across 1 file. [2.17s]

- eval: E6
  run_id: minted-tep-theo-chu-ban-ghi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tcb_vet
  verified_at: 2026-10-22T14:54:03Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-vet"
    test-run: dropped crm_mvjnwghbdszr_test

- eval: E7
  run_id: minted-tep-theo-chu-ban-ghi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tcb_man
  verified_at: 2026-10-22T14:54:03Z
  screenshot: evidence/E7-step1.png
  observed: |
    1) tcb-phu-trach-1280: drawer phieu 'Thoả thuận T1 tcb', Phu trach = Ngô Thị Lan (A). Truong 'Hợp đồng' co hai dong tep (Phụ lục 01.pdf, Hợp đồng chính.pdf), moi dong co nut 'Mở' va 'Xoá' deu bat, khong co dong ly do duoi danh sach; o keo tha 'Chọn tệp' ben duoi. Khop Expected.
    2) tcb-khong-phu-trach-375: viewport 375, phieu T1 cuon toi truong tep, Phu trach Ngô Thị Lan; hai dong tep chi con nut 'Mở' (khong 'Xoá'), ngay duoi danh sach co dong 'Chỉ Ngô Thị Lan và quản trị mở được tệp.' xuong dong gon, khong de nut, chu phu nhu mo ta o; khong cuon ngang. Khop Expected (muc khoa 'Mở' xac nhan bang DOM cua rang; nut trong anh trong mo hon).
    3) tcb-doi-chu-1280: cung phieu T1, Phu trach da thanh Trần Văn Minh (B) o ca thanh dau phieu lan o Chi tiet; DB ownerId = B theo rang. Khop Expected.
    4) tcb-mat-quyen-1280: phieu cua A khong tai lai, Phu trach Trần Văn Minh; toast do 'Bạn không còn phụ trách bản ghi này nên không mở được tệp.' o goc trai duoi; hai nut 'Mở' chuyen sang khoa (mo, khong con 'Xoá'), dong ly do ngay duoi danh sach 'Chỉ Trần Văn Minh và quản trị mở được tệp.' neu ten B. Khop Expected.
    5) tcb-nguoi-moi-1280: B tai lai phieu T1, Phu trach Trần Văn Minh, hai dong tep co 'Mở' va 'Xoá' bat, khong co dong ly do. Khop Expected (tab moi xac nhan boi rang).
    6) tcb-ca-nhan-1280: phieu lien he 'Hà tcb', Phu trach Ngô Thị Lan (A), truong 'Hợp đồng' mot tep 'Hồ sơ cá nhân.pdf', 'Mở' khoa (mo), dong 'Chỉ Ngô Thị Lan và quản trị mở được tệp.' neu ten A ngay duoi danh sach. Khop Expected.
    7) tcb-chua-phu-trach-375: viewport 375, phieu cong ty 'Công ty Bình Minh tcb', Phu trach '—', truong 'Hợp đồng' mot tep 'Hợp đồng Bình Minh.pdf', 'Mở' khoa, dong 'Bản ghi chưa có người phụ trách nên chỉ quản trị mở được tệp.' xuong 2 dong gon, khong de nut. Khop Expected.
    Doi chung bang mat: dong ly do nam ngay duoi danh sach tep, co chu phu cung kieu mo ta o, ten nguoi phu trach khong bi dich (translate="no" trong source), o 375 dong ly do xuong dong gon khong de nut. Khong thay mau thuan voi Expected.
  network_observed: n-a (driver)
  output: |
    Du lieu gieo qua API that: T1 va P1 do A phu trach, C0 khong chu; quan tri tai bon PDF len ba phieu.
    Frame da luu: tcb-phu-trach-1280.png, tcb-khong-phu-trach-375.png, tcb-doi-chu-1280.png, tcb-mat-quyen-1280.png, tcb-nguoi-moi-1280.png, tcb-ca-nhan-1280.png, tcb-chua-phu-trach-375.png; ban sao E7-step1..7.png cung thu muc evidence.
    Khong co file E7-network.txt: driver la script do-man.mjs, khong co duong doc network.
    Kiem them: source o-tep.tsx danh dau translate="no" cho ten nguoi phu trach (dong 222) va ten tep.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bun run lint:slop
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

- cmd: bunx turbo run build --force
  run_id: minted-tep-theo-chu-ban-ghi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T14:54:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo green trên baseline; cả bảy eval máy đều n-a vì là eval mới (xem «Baseline khong do»). Lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê.

### Baseline khong do

- bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-luat": bo qua baseline: tep apps/api/test/tep-theo-chu.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/auth && bun test test/quyen-tep.spec.ts -t tcb-ham": bo qua baseline: tep packages/auth/test/quyen-tep.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-doi-chu": bo qua baseline: tep apps/api/test/tep-theo-chu.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-pham-vi": bo qua baseline: tep apps/api/test/tep-theo-chu.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-xoa": bo qua baseline: tep apps/api/test/tep-theo-chu.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/tep-theo-chu.dom.tsx -t tcb-o-tep: bo qua baseline: tep apps/app/test/tep-theo-chu.dom.tsx co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/tep-theo-chu.spec.ts -t tcb-vet": bo qua baseline: tep apps/api/test/tep-theo-chu.spec.ts co o cay dang kiem nhung chua co o merge-base 830d82e1ffdf64bb1a5a244fd8e048926ce13f26 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic)

## Iterations

Round 1: không eval máy nào đỏ (failed_evals rỗng). Verdict REJECT do workflow tính sẵn từ năm finding trong hợp đồng chưa xử lý: E3 (đếm tệp list/board chỉ kiểm chuỗi có mặt), E5 (tên người phụ trách truyền thẳng vào ô; ca mất quyền đếm lời gọi trên bản giả của cache), E6 (quét laPhuTrach bằng regex; bộ dò lộ URL không có đối chứng dương). Chi tiết ở review-findings.md. Returned to implementation.

