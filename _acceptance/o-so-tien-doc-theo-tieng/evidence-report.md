---
schema_version: 2
feature_slug: o-so-tien-doc-theo-tieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d0c9c01179bff94bf64fb609993ace54132b66a
human_signoff: Phan Le Manh 2026-11-01 — ký Cổng 2 trong cửa veto (B8 dọn dẹp 31/10) trên verdict PASS 11/11 eval, ghim lại repin-20261101T062656Z-16061. Ngoài-1, 4, 5 mở hợp đồng mới; Ngoài-2, 3 chấp nhận, không sửa; Ngoài-6, 7 ghi Known limits; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: o-so-tien-doc-theo-tieng

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
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  cmd: cd packages/ui && bun test ./test/money-input.spec.ts -t ma-tran
  run_id: minted-o-so-tien-doc-theo-tieng-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_ma_tran
  verified_at: 2026-09-24T13:20:00Z
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [14.00ms]

- eval: E2
  cmd: cd packages/ui && bun test ./test/money-input.spec.ts -t tieng-kia
  run_id: minted-o-so-tien-doc-theo-tieng-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_tieng_kia
  verified_at: 2026-09-24T13:20:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [13.00ms]

- eval: E3
  cmd: cd packages/ui && bun test ./test/money-input.spec.ts -t chinh-xac
  run_id: minted-o-so-tien-doc-theo-tieng-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_chinh_xac
  verified_at: 2026-09-24T13:20:00Z
  output: |
     0 fail
     9 expect() calls
    Ran 3 tests across 1 file. [15.00ms]

- eval: E4
  cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/money-input.dom.tsx -t doc-lai
  run_id: minted-o-so-tien-doc-theo-tieng-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_o_doc_lai
  verified_at: 2026-09-24T13:21:00Z
  output: |
     0 fail
     17 expect() calls
    Ran 5 tests across 1 file. [333.00ms]

- eval: E5
  cmd: cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/money-input.dom.tsx -t roi-o
  run_id: minted-o-so-tien-doc-theo-tieng-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_o_roi_o
  verified_at: 2026-09-24T13:21:00Z
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [303.00ms]

- eval: E6
  cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/o-so-tien.dom.tsx -t tao-thoa-thuan
  run_id: minted-o-so-tien-doc-theo-tieng-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_tao
  verified_at: 2026-09-24T13:22:00Z
  output: |
     0 fail
     3 expect() calls
    Ran 2 tests across 1 file. [734.00ms]

- eval: E7
  cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/o-so-tien.dom.tsx -t sua-tai-cho
  run_id: minted-o-so-tien-doc-theo-tieng-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_sua_tai_cho
  verified_at: 2026-09-24T13:22:00Z
  output: |
     0 fail
     1 expect() calls
    Ran 1 test across 1 file. [540.00ms]

- eval: E8
  cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/o-so-tien.dom.tsx -t them-nhanh
  run_id: minted-o-so-tien-doc-theo-tieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.stdt_them_nhanh
  verified_at: 2026-09-24T13:22:00Z
  output: |
     0 fail
     2 expect() calls
    Ran 2 tests across 1 file. [666.00ms]

- eval: E9
  cmd: ui-check:E9
  run_id: minted-o-so-tien-doc-theo-tieng-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.stdt_man_that
  verified_at: 2026-09-24T13:25:00Z
  screenshot: evidence/E9-step1-tao-doc-lai-vi-1440.png
  observed: |
    E9-step1-tao-doc-lai-vi-1440.png (vi, 1440, create-deal sheet, opened via Read/image): field "Giá trị" shows "150.000.000" with the label-below text "Đọc là 150.000.000 đ" (the "đ"/"₫" glyph renders slightly differently under headless Chrome's default font, but the live DOM read below confirms the exact character is "₫"). Matches Expected line "Đọc là 150.000.000 ₫".
    E9-step2-tao-doc-lai-vi-375.png (vi, 375, same sheet at mobile width): identical field + hint, sheet fills the 375px viewport edge-to-edge with no clipped/cut text and no visible horizontal overflow. A DOM measurement taken during the same headless pass reported document.documentElement.scrollWidth === clientWidth === 375, confirming no horizontal scroll.
    E9-step3-sua-doc-lai-en.png (en, 1440, "Wise — Comp AI" record-sheet, Amount field mid-edit): field shows "1,500,000.50" with hint "Reads as $1,500,000.50" directly below in the DETAILS grid, before any commit. Matches Expected "Reads as $1,500,000.50" (en).
    E9-step3-sua-doc-lai-en-after.png: after Enter, the field reverted to display text "$1,500,000.50" in both the header stat and the Details row — confirms the value committed correctly (not truncated to "1" the way old parseFloat-based code would have).
    E9-step4-sua-tieng-kia-vi.png (vi, 1440, same deal, Amount field mid-edit): field shows "1.5" outlined/text in red (destructive style) with the red hint text "Số này viết theo kiểu tiếng Anh. Ở đây dấu chấm ngăn hàng nghìn, dấu phẩy đứng trước phần lẻ — ví dụ 1.500.000,50." directly below. Matches Expected "ô 1.5 dòng dưới ô là câu 'viết theo kiểu tiếng Anh'".
    No frame contradicted Expected; all four screenshots were opened and read directly (not inferred from step text).
  network_observed: clean

- eval: E10
  cmd: bun _acceptance/o-so-tien-doc-theo-tieng/rang/man-that.mjs
  run_id: minted-o-so-tien-doc-theo-tieng-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stdt_man_that
  verified_at: 2026-09-24T13:25:00Z
  output: |
    bun scripts/dev-session.ts manh.phan@onemount.com
    khang-dinh=11/11
    EXIT_CODE=0

- eval: E11
  cmd: bun _acceptance/o-so-tien-doc-theo-tieng/rang/soi-ma.mjs
  run_id: minted-o-so-tien-doc-theo-tieng-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.stdt_soi_ma
  verified_at: 2026-09-24T13:26:00Z
  output: |
    soi-ma: 38 khang dinh, 0 lech

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muf3v8bjovhp
  exit_code: 0
  verified_at: 2026-09-24T13:30:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-o-so-tien-doc-theo-tieng-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-24T13:31:00Z

- cmd: bun run lint:slop
  run_id: minted-o-so-tien-doc-theo-tieng-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-24T13:32:00Z

- cmd: bunx turbo run build --force
  run_id: minted-o-so-tien-doc-theo-tieng-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-24T13:33:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1)

## Iterations

Round 1: toàn bộ 11 eval pass ngay từ lượt đầu — không có vòng sửa nào trước đó.

### Re-pin lần 1 — 2026-09-24, do hoá cũ do gộp origin/onehub vào nhánh (mã api và test của hồ sơ khác)
run_id: repin-20260924T063913Z-89099
sha: 7ddf69e18ba83d4e366f61d4b43b768253da2f60 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-24, do hoá cũ do vòng tien-te-chua-tai-khong-doan chạm ô số tiền, tấm tạo và thêm nhanh
run_id: repin-20260924T080246Z-15787
sha: da582c9865c0f29c3871bad51cc74e904d5a9dfc · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-09-24, do hoá cũ do vòng ten-dong-tien-bao-cao đổi chữ và đổi thư mục ghi ảnh của thước màn thật
run_id: repin-20260924T084643Z-52504
sha: 09234bc36c10fffd85564767bd8dd83a1ab08aa2 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-09-24, do hoá cũ do gộp origin/onehub (51 commit) vào nhánh trước khi gộp PR #114
run_id: repin-20260924T090705Z-75556
sha: d3911564da114e9b2f61ebe02d24e13039f5d81d · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9

### Re-pin lần 5 — 2026-11-01, do B8: ghim trên onehub b65feb175 sau sửa ba thước lệch, trước khi chủ kho ký cửa veto mở
run_id: repin-20261101T062656Z-16061
sha: 4d0c9c01179bff94bf64fb609993ace54132b66a · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
