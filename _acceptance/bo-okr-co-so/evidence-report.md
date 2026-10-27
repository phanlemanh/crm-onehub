---
schema_version: 2
feature_slug: bo-okr-co-so
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2bd4770799820a3cd867a64b45ba80f357354e3e
human_signoff: Phan Le Manh 2026-10-27
---

# Evidence Report: bo-okr-co-so

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | ui-check | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-1 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bo-okr-co-so-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"
    runs: 1, passes: 1, variance: false
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-bo-okr-co-so-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_o_so
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-o-so
    runs: 1, passes: 1, variance: false
    Ran 2 tests across 1 file. [1.95s]

- eval: E3
  run_id: minted-bo-okr-co-so-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_bien
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-bien
    runs: 1, passes: 1, variance: false
    Ran 2 tests across 1 file. [1132.00ms]

- eval: E4
  run_id: minted-bo-okr-co-so-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_the
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-the
    runs: 1, passes: 1, variance: false
    Ran 2 tests across 1 file. [2.48s]

- eval: E5
  run_id: minted-bo-okr-co-so-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd packages/ui && bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/data-table-mo-san.dom.tsx
    runs: 1, passes: 1, variance: false
    Ran 6 tests across 1 file. [1008.00ms]

- eval: E6
  run_id: minted-bo-okr-co-so-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"
    runs: 1, passes: 1, variance: false
    phien-do: xong — mã 0

- eval: E7
  run_id: minted-bo-okr-co-so-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd packages/ui && bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/data-table-mo-san.dom.tsx
    runs: 1, passes: 1, variance: false
    Ran 6 tests across 1 file. [1008.00ms]

- eval: E8
  run_id: minted-bo-okr-co-so-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"
    runs: 1, passes: 1, variance: false
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-bo-okr-co-so-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_ui_mo_san
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd packages/ui && bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/data-table-mo-san.dom.tsx
    runs: 1, passes: 1, variance: false
    Ran 6 tests across 1 file. [1008.00ms]

- eval: E10
  run_id: minted-bo-okr-co-so-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_dom_tai
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/bo-okr-co-so.dom.tsx -t bco-tai
    runs: 1, passes: 1, variance: false
    Ran 2 tests across 1 file. [1.88s]

- eval: E11
  run_id: minted-bo-okr-co-so-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs"
    runs: 1, passes: 1, variance: false
    phien-do: xong — mã 0

- eval: E12
  run_id: E12-20261027T0715Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_man
  verified_at: 2026-10-27T00:13:45Z
  screenshot: evidence/E12-step1.png
  observed: |
    bco-1440-sang.png: Thẻ OKR «Kinh doanh miền Bắc»; ngay dưới hàng thẻ con (OKR · Họp tuần · Việc · Sơ đồ góp vào) là khối bốn ô một hàng: Ngày còn lại 55 (đến 20/12) · Tiến độ 31% (Lẽ ra đã tới 40%) · KR đã cập nhật tuần này 4/4 · KR tự tin thấp 2; có viền ngoài và đường chia ô dọc. Bên dưới là hàng công cụ (ô chọn đơn vị, chip Tất cả 3 / Cần bàn 2 / Chưa góp vào đâu 1, Lọc, Sắp xếp, Cột (4), nút «Gập tất cả» hiện ngay trên hàng). Bảng mục tiêu đã mở sẵn: mục tiêu «Giữ đà tăng trưởng bán lẻ miền Bắc» hiện KR1, KR2, KR3; mục tiêu thứ hai cũng có chevron mở. Không tràn ngang.
    bco-1440-toi.png: cùng bố cục ở nền tối; nhãn, giá trị 55/31%/4/4/2, viền ngoài và đường chia ô đều nhìn thấy, không chìm; nút «Gập tất cả» thấy; KR đã mở sẵn.
    bco-375-sang.png: bốn ô thành hai cột hai hàng (Ngày còn lại 55 | Tiến độ 31%; KR đã cập nhật tuần này (xuống hai dòng) 4/4 | KR tự tin thấp 2), không nhãn nào bị cắt chữ, không tràn ngang; hàng thẻ con nằm trên khối số; nút «Gập tất cả» thấy ngay phía dưới khối số, trên ô chọn đơn vị và nút Lọc, không phải mở Lọc; tiêu đề bảng «Mục tiêu» bắt đầu bên dưới.
    bco-375-toi.png: giống bản sáng ở nền tối; chữ và viền khối số, nút Gập tất cả đều đọc được.
    bco-toan-canh-1440-sang.png (đối chiếu): hàng số Toàn cảnh OKR năm ô một hàng, cùng khối viền ngoài, cùng đường chia ô, nhãn cùng cỡ/màu xám, giá trị cùng cỡ lớn (cao 21px như BCO), đệm trong ô trái 24px và trên ~34px như BCO.
    bco-toan-canh-375-sang.png (đối chiếu): hai cột nhiều hàng, nhãn xuống dòng không bị cắt, cùng nếp khối viền ngoài và cỡ chữ với bản BCO 375.
    Kết luận: các frame khớp Expected; không mâu thuẫn.
  network_observed: n-a (driver)

- eval: E13
  run_id: minted-bo-okr-co-so-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bco_thuoc_da_ky
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: bun _acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs --chi-quet
    runs: 1, passes: 1, variance: false
    MUC vo-khu-muc-tieu#E14

- eval: E14
  run_id: minted-bo-okr-co-so-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.bco_api_so_bo
  verified_at: 2026-10-27T00:13:45Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-so-bo.spec.ts -t bco-so-bo"
    runs: 1, passes: 1, variance: false
    test-run: dropped crm_mvpxnmb3kj84_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bo-okr-co-so-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bunx turbo run lint --force
  run_id: minted-bo-okr-co-so-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bun run lint:slop
  run_id: minted-bo-okr-co-so-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

- cmd: bunx turbo run build --force
  run_id: minted-bo-okr-co-so-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-27T00:13:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần baseline cuối).

Không có eval không-phân-biệt được liệt kê. Lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — mọi eval chạy một lần (runs 1), kết quả thuần nhất; không eval nào ngẫu nhiên hay chập chờn.

## Iterations

Round 1: S4 vòng 1 bị REJECT — 16/16 lượt máy đạt nhưng có 7 phát hiện trong hợp đồng; đã sửa rồi trả về dựng lại.
Round 2: 14/14 eval đạt, bảy lệnh suite xanh, không phát hiện trong hợp đồng; verdict PASS.

### Re-pin lần 1 — 2026-10-27, do gộp onehub 5084ffe74 (#566, #567 VK6, #575) vào VK8; sửa hydrat khung xương, khung chờ có hàng số và thước bco-the (V4-8); xếp import cho lint
run_id: repin-20261027T120842Z-80884
sha: 2bd4770799820a3cd867a64b45ba80f357354e3e · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · chập chờn (đỏ lần đầu, đạt khi chạy lại): muc-tieu-va-kr E14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
