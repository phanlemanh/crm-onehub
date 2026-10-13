---
schema_version: 2
feature_slug: dai-luu-tru-dung-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3bb94b7375e734a17d79e4a00a837e56001fc7d6
human_signoff:
---

# Evidence Report: dai-luu-tru-dung-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-6 | ui-check | PASS |
| E10 | AC-7 | judgment | PASS |
| E11 | AC-3 | script | PASS |
| E12 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dai-luu-tru-dung-chung-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_dai
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/dai-luu-tru.dom.tsx -t dlt-dai
    Ran 2 tests across 1 file. [982.00ms]

- eval: E2
  run_id: minted-dai-luu-tru-dung-chung-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_khoa
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/dai-luu-tru.dom.tsx -t dlt-khoa
    Ran 2 tests across 1 file. [548.00ms]

- eval: E3
  run_id: minted-dai-luu-tru-dung-chung-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vdc_dai_bao
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-dai-bao
    Ran 1 test across 1 file. [2.11s]

- eval: E4
  run_id: minted-dai-luu-tru-dung-chung-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vdc_chi_doc
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chi-doc
    Ran 1 test across 1 file. [2.53s]

- eval: E5
  run_id: minted-dai-luu-tru-dung-chung-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vdc_chu
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/vong-doi-mot-cach-cat.dom.tsx -t vdc-chu
    Ran 1 test across 1 file. [2.90s]

- eval: E6
  run_id: minted-dai-luu-tru-dung-chung-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlt_mot_noi
  verified_at: 2026-10-13T17:11:46Z
  output: |
    bun _acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs
    dai-luu-tru-dung-chung mot-noi: dat (758 tep)

- eval: E7
  run_id: minted-dai-luu-tru-dung-chung-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlt_bang_manh
  verified_at: 2026-10-13T17:11:46Z
  output: |
    bun _acceptance/dai-luu-tru-dung-chung/rang/bang-manh.mjs
    dai-luu-tru-dung-chung bang-manh: dat

- eval: E8
  run_id: minted-dai-luu-tru-dung-chung-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dlt_man
  verified_at: 2026-10-13T17:11:46Z
  output: |
    bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/dai-luu-tru-dung-chung/rang/man.mjs"
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-dai-luu-tru-dung-chung-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlt_man
  verified_at: 2026-10-13T17:11:46Z
  screenshot: evidence/E9-step1.png
  observed: |
    Khổ 1440 (E9-step1.png): ngăn bên phải mở «Thoả thuận đã cất k6xvnma gf1c»; ngay dưới tiêu đề có dải ngang «Đã lưu trữ ngày 15/09/2026» kèm icon lưu trữ, nút «Khôi phục» (icon hoàn tác) nằm sát mép phải dải. Các ô Tên, Tiền tệ, Công ty, Phụ trách ở dạng chữ xám chỉ đọc, không tràn.
    Khổ 390 (E9-step2.png): ngăn là drawer toàn màn hình, cùng dải «Đã lưu trữ ngày 15/09/2026» và nút «Khôi phục» nằm gọn trong khung dải, không bị cắt hay tràn ngang; các ô chi tiết vẫn chỉ đọc. Khớp expected: có chữ dải báo và nút Khôi phục ở cả hai khổ.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-dai-luu-tru-dung-chung-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dlt_v2_nguyen
  verified_at: 2026-10-13T17:11:46Z
  output: |
    bun _acceptance/dai-luu-tru-dung-chung/rang/v2-nguyen.mjs
    dai-luu-tru-dung-chung v2-nguyen: dat (4 tep, moc 0d22687b8)

- eval: E12
  run_id: minted-dai-luu-tru-dung-chung-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dlt_ngan_cho
  verified_at: 2026-10-13T17:11:46Z
  output: |
    cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dai-luu-tru-dung-chung.dom.tsx -t dlt-ngan-cho
    Ran 1 test across 1 file. [1307.00ms]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bun run lint:slop
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

- cmd: bunx turbo run build --force
  run_id: minted-dai-luu-tru-dung-chung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-13T17:11:46Z

### Judgment (đề xuất của hội đồng)

- eval: E10
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment), fresh context
  verdict: PASS
  rationale: Ba giám khảo cùng thấy hai cặp ảnh dlt-ngan-da-cat-1440/390 và vdc-ngan-da-cat-1440/390 giống nhau từng điểm nhìn thấy được, chỉ khác tên thoả thuận, tên công ty và đuôi mã do dữ liệu gieo.
  votes:
    - domain-correctness: PASS — Ở 1440, dải «Đã lưu trữ ngày 15/09/2026» giống nhau về chữ, icon lưu trữ, khung viền, màu và vị trí; nút «Khôi phục» giống nhau về icon hoàn tác, kiểu nút, cỡ và chỗ đặt sát phải; các ô thẻ chi tiết đều là chữ xám chỉ đọc. Ở 390, các ô «Ngày dự …», «P…», «Demo boo…», «Qualified t…» bị cắt giống hệt ở cả hai ảnh, không có chỗ cắt hay tràn mới.
    - operational-feasibility: PASS — Ở cả hai khổ, dải lưu trữ, nút «Khôi phục» (icon undo, kiểu outline nhỏ, bên phải dải, cùng toạ độ) và các ô thẻ chi tiết giống nhau; không ô nào trông sửa được. Ở 390 chữ bị cắt giống nhau ở cả hai ảnh nên không có tràn mới.
    - spec-alignment: PASS — Dải báo, nút «Khôi phục» và các ô thẻ chi tiết cùng chữ, icon, màu, khung viền, cỡ và vị trí ở cả hai khổ; ở 390 dlt-… và vdc-… cắt chữ y hệt nhau, không tràn thêm ở bản mới.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), được giữ có chủ ý làm regression-guard: các bài của hồ sơ đã ký vong-doi-mot-cach-cat chạy lại không sửa, để chứng minh việc dời sang DaiLuuTru, KhoaLuuTru không đổi hành vi của V2.

- E3 (AC-3): vdc-dai-bao, xanh trên baseline.
- E4 (AC-3): vdc-chi-doc, xanh trên baseline.
- E5 (AC-3): vdc-chu, xanh trên baseline.

Baseline khong do

- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/dai-luu-tru.dom.tsx -t dlt-dai: bo qua baseline: tep packages/ui/test/dai-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/dai-luu-tru.dom.tsx -t dlt-khoa: bo qua baseline: tep packages/ui/test/dai-luu-tru.dom.tsx co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs: bo qua baseline: tep _acceptance/dai-luu-tru-dung-chung/rang/mot-noi.mjs co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dai-luu-tru-dung-chung/rang/bang-manh.mjs: bo qua baseline: tep _acceptance/dai-luu-tru-dung-chung/rang/bang-manh.mjs co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dai-luu-tru-dung-chung/rang/v2-nguyen.mjs: bo qua baseline: tep _acceptance/dai-luu-tru-dung-chung/rang/v2-nguyen.mjs co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/dai-luu-tru-dung-chung.dom.tsx -t dlt-ngan-cho: bo qua baseline: tep apps/app/test/dai-luu-tru-dung-chung.dom.tsx co o cay dang kiem nhung chua co o merge-base 0d22687b884627aec9a14cdda932b09e86be89fb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval máy (E1-E9, E11, E12) và bảy lệnh suite đều đạt; E10 do hội đồng đề xuất PASS, chờ người xác nhận ở Cổng 2. Không có eval nào hỏng.
