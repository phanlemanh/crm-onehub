---
schema_version: 2
feature_slug: so-do-can-chinh-don-vi
verdict: BLOCKED
failed_evals: []
reason: "E14 — bun _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs: lệnh chạy quá 30 phút chưa xong (khai long_running: 30 cho eval trong evals.yaml; không có khai báo long_running nào đọc được trong task nên áp mặc định 30 phút). Lệnh bị chuyển sang nền sau 600 s (ID b7bciou7q, tệp đầu ra /private/tmp/claude-503/-Users-manhphan-dev-acceptance-gate-kit--claude-worktrees-elated-chatterjee-d25a07/b42f145f-aad1-4ae1-a999-6479a43cb300/tasks/b7bciou7q.output). Tiến trình giu-ho-so.mjs (PID 67298, cwd là worktree crm-onehub so-do-can-chinh-don-vi) vẫn sống sau 30:13 phút, đang đợi tiến trình con bun run test -> turbo run test --concurrency=1 (PID 80027/80046), chưa trả về dòng mã thoát. Không có dòng mã thoát nên KHÔNG có mã thoát thật; giá trị -1 chỉ là giá trị giữ chỗ, không phải mã thoát. Không kill tiến trình (không có công cụ dừng nền riêng, không đoán PASS hay FAIL). Cách gỡ: chạy lại E14 với timeout công cụ dài hơn."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 822eb75530b7fef5ada097b46362e6fabae03c4d
human_signoff:
---

# Evidence Report: so-do-can-chinh-don-vi

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
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E14 | AC-14 | script | BLOCKED |
| E15 | AC-2 | script | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-7 | test | PASS |

không chạy theo hồ sơ: E13

## Evidence

- eval: E1
  run_id: minted-so-do-can-chinh-don-vi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_du_lieu
  verified_at: 2026-10-15T06:09:44Z
  output: |
    test-run: dropped crm_mv953aqgyvwt_test

- eval: E2
  run_id: minted-so-do-can-chinh-don-vi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_chu_y
  verified_at: 2026-10-15T06:09:44Z
  output: |
    test-run: dropped crm_mv953a65no09_test

- eval: E3
  run_id: minted-so-do-can-chinh-don-vi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_quyen
  verified_at: 2026-10-15T06:09:44Z
  output: |
    test-run: dropped crm_mv953attwhsy_test

- eval: E4
  run_id: minted-so-do-can-chinh-don-vi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_cach_xem
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [1.57s]

- eval: E5
  run_id: minted-so-do-can-chinh-don-vi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_the
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [953.00ms]

- eval: E6
  run_id: minted-so-do-can-chinh-don-vi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_loc
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [1201.00ms]

- eval: E7
  run_id: minted-so-do-can-chinh-don-vi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_mo_the
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [1209.00ms]

- eval: E8
  run_id: minted-so-do-can-chinh-don-vi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_thu_gon
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [754.00ms]

- eval: E9
  run_id: minted-so-do-can-chinh-don-vi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_hep
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [1006.00ms]

- eval: E10
  run_id: minted-so-do-can-chinh-don-vi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_trang_thai
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 1 test across 1 file. [1391.00ms]

- eval: E11
  run_id: minted-so-do-can-chinh-don-vi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_chu
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Ran 152 tests across 1 file. [1048.00ms]

- eval: E12
  run_id: minted-so-do-can-chinh-don-vi-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_man
  verified_at: 2026-10-15T06:09:44Z
  screenshot: evidence/so-do-1440.png
  observed: |
    Da mo tung file bang Read. so-do-1440.png: man Toan canh OKR 1440 o che do «So do», chip «Moi don vi 23» dang chon; khung ve co OneHub o goc, cac the Khoi Kinh doanh/Van hanh/Ho tro/So do - Khoi A, Khoi B, X o hang giua, duong lien ve tu OneHub xuong cac khoi, mot duong net dut cong sang So do - B1 (5 day tong); the «So do - Khoi B» va «So do - B2» mang nhan «Chua noi len» va khong co duong nao dan vao chung — khop Expected. chu-y-1440.png: chip «Can chu y 5» dang chon; cac the can chu y (So do - Khoi B, Khoi Ho tro, So do - B3, B2, A1) hien ro, cac the khac (OneHub, So do - X, Khoi A, Khoi Van hanh, B1, A2, A3) bi mo di — khop. the-mo-1440.png: the «So do - A3» (Do Minh Khoa) dang mo, vien xanh, hien cau ly do da gieo «A3 giu ti le giao dung han cua khoi A nen gop thang vao muc tieu khoi» (nhan «Co so lieu») va cau thu hai «A3 mo tuyen moi co the day doanh thu nam nhung chua co so do rieng» (nhan «Dat cuoc») — khop. danh-sach-390.png: viewport 390 rong, khong co khung ve; hien danh sach long nhau (OneHub > Khoi Kinh doanh ...) voi chip «Moi don vi 23 / Can chu y 5», khong thay cuon ngang — khop. Khong frame nao mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    - Console khong loi: 1440 (0 loi), 390 (0 loi).
    - Du 4 anh (4).
    Frames da luu (mtime 13:10-13:11 hom nay, ghi de ban cu): evidence/so-do-1440.png, chu-y-1440.png, the-mo-1440.png, danh-sach-390.png. Output day du o evidence/E12-output.txt (ban chay cu co 1 SAI '0 day' da bi thay bang lan chay nay: 12 muc tieu thay vi 11, 5 day). Capture di qua puppeteer cua chinh man.mjs. Driver khong co duong doc network nen khong tao E12-network.txt.

- eval: E14
  run_id: minted-so-do-can-chinh-don-vi-E14-r2
  status: BLOCKED
  baseline: n-a
  verifier: config:executors.script.dh4_giu_ho_so
  verified_at: 2026-10-15T06:09:44Z
  output: |
    Lệnh được chuyển sang nền sau 600 s (ID b7bciou7q). Tệp đầu ra lúc 13:40:23 rỗng 0 byte, chưa có dòng mã thoát.
    Tiến trình giu-ho-so.mjs (PID 67298) vẫn chạy, elapsed 30:13; tiến trình con bun run test (PID 80027) và turbo run test (PID 80046) đang chạy.
    Không có mã thoát thật, không phán PASS hay FAIL.

- eval: E15
  run_id: minted-so-do-can-chinh-don-vi-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_dot_bien
  verified_at: 2026-10-15T06:09:44Z
  output: |
    dot-bien: 7/7 vet bi bat

- eval: E16
  run_id: minted-so-do-can-chinh-don-vi-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_ranh_gioi
  verified_at: 2026-10-15T06:09:44Z
  output: |
    DUNG ranh gioi

- eval: E17
  run_id: minted-so-do-can-chinh-don-vi-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_ly_do
  verified_at: 2026-10-15T06:09:44Z
  output: |
    test-run: dropped crm_mv953hjpmku1_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

- cmd: bun run lint:slop
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T06:09:44Z

Lệnh fail không gắn eval nào (evals: [] — không thuộc failed_evals):

- cmd: bunx turbo run build --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 1
  verified_at: 2026-10-15T06:09:44Z
  ghi chú: build app đỏ ở bước kiểm kiểu TypeScript, lỗi TS2352 tại apps/app/test/kara-mot-ten-luat.ts dòng 159 cột 10 (ép kiểu bảng chuỗi giao diện có khoá soDo, hàm nutDaDich nhận (huong: string, x: number, y: number) không khớp chữ ký (...doiSo: string[])). Task app#build thất bại; 3 trên 5 task thành công, không dùng cache.

## Known limits

## Ngoài hợp đồng

## Analyst

none — danh sách eval không-phân-biệt rỗng. Lưu ý: baseline không đo được cho mọi eval mới (xem mục dưới) nên chưa eval nào được chứng minh đỏ trên nền.

Baseline khong do:

- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-du-lieu": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-chu-y": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-quyen": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-cach-xem: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-the: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-loc: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-mo-the: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-thu-gon: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-hep: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-trang-thai: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/giu-ho-so.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/so-do-can-chinh-don-vi/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/okr-so-do-don-vi.spec.ts -t dh4-ly-do": bo qua baseline: tep apps/api/test/okr-so-do-don-vi.spec.ts co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần (deterministic), không eval nào có pass_rate lẫn.

## Iterations

Round 1: REJECT — E12, E14 và hai lệnh suite (api; app + @crm/ui) đỏ; riêng E12 ở vòng này có một số liệu sai ("0 day") đã được thay bằng lần chạy mới (12 mục tiêu, 5 dây). Returned to implementation.
Round 2: BLOCKED — E1–E11, E12, E15, E16, E17 xanh; E14 chưa kết thúc sau 30 phút (chạy bộ test của các hồ sơ đã ký trên nền, đang đợi tiến trình con turbo), chưa có mã thoát thật; lệnh suite build đỏ ở lỗi kiểu TS2352 trong apps/app/test/kara-mot-ten-luat.ts (không gắn eval nào). Cần chạy lại E14 với timeout công cụ dài hơn.
