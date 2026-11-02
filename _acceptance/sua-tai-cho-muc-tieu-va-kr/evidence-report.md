---
schema_version: 2
feature_slug: sua-tai-cho-muc-tieu-va-kr
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8db3b8e5a05232d84f7e7b76b86c547dc3f103a6
human_signoff:
---

# Evidence Report: sua-tai-cho-muc-tieu-va-kr

Round 1. Mọi eval của tính năng đều xanh, nhưng hai lệnh suite hồi quy (`--filter=api` và `--filter=app --filter=@crm/ui`) đỏ và không gắn eval nào, nên verdict là REJECT. Chi tiết ở mục Evidence, "Lệnh suite (hồi quy)".

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
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-1 | script | PASS |
| E12 | AC-5 | test | PASS |
| E13 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E2
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E3
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E4
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E5
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E6
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E7
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E8
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

- eval: E9
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sv9_bai_cu
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/okr-sheet.dom.tsx ./test/khung-tao-okr.dom.tsx ./test/sheet-quyen-cap-nhat.dom.tsx ./test/ngan-kr-mot-cho.dom.tsx
    Ran 51 tests across 4 files. [12.29s]

- eval: E10
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E10-r1
  exit_code: 0
  verifier: config:executors.script.sv9_chup
  verified_at: 2026-11-02T02:47:15Z
  screenshot: evidence/E10-step1.png
  observed: |
    Frame 1 (E10-step1.png = ST-muc-tieu-dang-sua desktop-1280 light): ngăn mục tiêu, tiêu đề dài xuống 3 dòng, không tràn. Mục CHI TIẾT là hàng nhãn trái (Tên, Vì sao lúc này, Phụ trách) và ô bấm được bên phải; ô Tên đang focus viền xanh, nội dung dài cuộn trong ô; «Vì sao» xuống dòng nhiều dòng; không tràn ngang.
    Frame 2 (E10-step2.png = ST-muc-tieu-loi mobile-375 light): tiêu đề xuống 5 dòng, hàng nhãn trái / giá trị phải; Tên cắt bằng dấu «…»; Vì sao xuống dòng trong cột hẹp; Phụ trách «Nguyễn Thị Phươn» bị cắt cứng không có «…» (lưu ý nhỏ); toast lỗi tiếng Việt «Tên cần 3–200 ký tự.»; không tràn ngang.
    Frame 3 (E10-step3.png = ST-kr-xem desktop-1280 light): ngăn KR, tiêu đề xuống 2 dòng; hàng Tên (cắt «…» một dòng) và Phụ trách «Hoàng Anh Tuấn · Đã rời đội», nhãn trái giá trị phải như ngăn deal.
    Frame 4 (E10-step4.png = ST-kr-dang-luu mobile-375 light): tiêu đề xuống 4 dòng; hàng Tên có biểu tượng đang lưu và chữ xám cắt «…»; Phụ trách cắt cứng ở mép; không tràn ngang.
    Tất cả khớp Expected (hình ô cùng ngăn deal, chữ dài xuống dòng hoặc cắt trong ô không tràn trang, ảnh lỗi có câu tiếng Việt).
  network_observed: n-a (driver)
  baseline: n-a
  output: |
    PROTO_ROUTE=1 bun run do:man --chay "PROTO_URL=$APP_URL node _acceptance/.../rang/chup-proto.mjs" (qua phien-do, app :4585 api :4841, kho dùng-một-lần).
    16 anh; xong; tran ngang: 0; khong co ngan: 0
    phien-do: xong — mã 0
    16 ảnh ST-*--light.png có trong evidence/; 4 ảnh đã mở bằng Read. Log: .acceptance-runs/e10.log.

- eval: E11
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.sv9_slop
  verified_at: 2026-11-02T02:47:15Z
  output: |
    bun run lint:slop
    Finished in 2.2s on 4366 files with 13 rules using 14 threads.

- eval: E12
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_api
  verified_at: 2026-11-02T02:47:15Z
  output: |
    bun run test -- "cd apps/api && bun test test/sua-tai-cho-okr.spec.ts"
    test-run: dropped crm_mvynsi4h6ijo_test

- eval: E13
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv9_dom
  verified_at: 2026-11-02T02:47:15Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx
    Ran 44 tests across 1 file. [4.68s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-11-02T02:47:15Z
  output: |
    api:test:  2165 pass / 18 skip / 5 fail; Ran 2188 tests across 279 files. [354.05s]
    api:test: (fail) ttdc-csdl > ttdc-api-cho: phong bat chua co ban thay gio ban dau tien [33.99ms]
    api:test: (fail) ttdc-csdl > ttdc-dang-xep: dang xep chi khi hom nay la ngay xep va luot xep chua dong [46.27ms]
    api:test: (fail) ttdc-csdl > ttdc-tam-dung: het tran thang va chua co khoa thi tam dung, sang thang sau thi neu gio [40.62ms]
    api:test: (fail) ttdc-csdl > ttdc-khong-doi: cac trang thai cu khong co choBan [219.69ms]
    api:test: (fail) ttdc-csdl > ttdc-mot-luat: luot xep that cua tac tu o gio da bao xep viec cho phong [100.27ms]
    Failed: api#test

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-11-02T02:47:15Z
  output: |
    app:test: Ran 7 tests across 1 file. [1241.00ms]   (6 pass, 1 fail)
    app:test: chay-dom: test/duong-ly-do.dom.tsx đỏ (mã 1) sau 1.3 s
    Failed: app#test

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-02T02:47:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-02T02:47:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-02T02:47:15Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-tai-cho-muc-tieu-va-kr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-02T02:47:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline), cần coi là regression-guard có chủ ý hoặc viết lại để khẳng định hành vi mới:
- E9: bốn bài DOM cũ của ngăn mục tiêu, hộp sửa và ngăn KR, xanh cả hai phía (đúng vai trò giữ hồi quy).
- E11: `bun run lint:slop` xanh cả hai phía (đúng vai trò giữ hồi quy).

Baseline không đo:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/sua-tai-cho-okr.dom.tsx: bo qua baseline: tep apps/app/test/sua-tai-cho-okr.dom.tsx co o cay dang kiem nhung chua co o merge-base 7341a193db92e45cc83121947e757fa8e64fad09 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/sua-tai-cho-okr.spec.ts": bo qua baseline: tep apps/api/test/sua-tai-cho-okr.spec.ts co o cay dang kiem nhung chua co o merge-base 7341a193db92e45cc83121947e757fa8e64fad09 — eval moi, chay tren code cu khong phan biet gi

Lệnh suite đỏ không gắn eval nào (nguyên nhân chưa rõ, chưa có bằng chứng nối chúng với thay đổi của tính năng):
- bun run test -- --filter=api: 5 bài trong ttdc-csdl đỏ (danh sách ở khối suite phía trên), các dòng log nguyên văn ở trên.
- bun run test -- --filter=app --filter=@crm/ui: test/duong-ly-do.dom.tsx đỏ, 1 bài trong 7.

Judge panels: không có hạng mục judgment nào trong vòng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval của tính năng xanh; hai lệnh suite hồi quy (`--filter=api`, `--filter=app --filter=@crm/ui`) đỏ nên verdict REJECT. Returned to implementation.
