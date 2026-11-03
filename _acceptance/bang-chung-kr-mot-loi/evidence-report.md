---
schema_version: 2
feature_slug: bang-chung-kr-mot-loi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 43a75bc188c4c4f3d2455fca2460c218dbef0707
human_signoff: Phan Le Manh 2026-11-03 — ký Cổng 2 trên S4 lượt 1 (13/13 eval PASS). Ngoài-1 mở hợp đồng mới; Ngoài-2, 3, 4, 5 ghi Known limits; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: bang-chung-kr-mot-loi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-2 | test | PASS |
| E13 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-chung-kr-mot-loi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E2
  run_id: minted-bang-chung-kr-mot-loi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E3
  run_id: minted-bang-chung-kr-mot-loi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E4
  run_id: minted-bang-chung-kr-mot-loi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E5
  run_id: minted-bang-chung-kr-mot-loi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E6
  run_id: minted-bang-chung-kr-mot-loi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E12
  run_id: minted-bang-chung-kr-mot-loi-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.sv10_dom
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 32 tests across 1 file. [7.31s]

- eval: E7
  run_id: minted-bang-chung-kr-mot-loi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.sv10_slop
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Finished in 2.4s on 4374 files with 13 rules using 14 threads.

- eval: E8
  run_id: minted-bang-chung-kr-mot-loi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sv10_rang
  verified_at: 2026-11-02T08:37:16Z
  output: |
    cay: xanh · nhap-lai: do · ngoai-le-lai: do

- eval: E9
  run_id: minted-bang-chung-kr-mot-loi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sv10_canh_kr
  verified_at: 2026-11-02T08:37:16Z
  output: |
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-bang-chung-kr-mot-loi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sv10_chup
  verified_at: 2026-11-02T08:37:16Z
  screenshot: evidence/E10-step1.png
  observed: |
    Ảnh 1, ST-bc-dang-nhap--desktop-1280--light.png: ngăn KR «Ký hợp đồng khung…» hiện hai dòng bằng chứng (drive.google.com, onehub.sharepoint.com). Dòng nhập ở cuối danh sách, trong ngăn, không có lớp phủ hay hộp nổi. Có nhãn «Đường dẫn bằng chứng», ô https://…, chữ gợi ý, ô ghi chú tuỳ chọn, nút Huỷ và Đính. Tiêu đề dài xuống 3 dòng.
    Ảnh 2, ST-bc-sai--mobile-375--light.png: ở khổ 375 không tràn ngang. Dòng nhập nằm trong danh sách, nhãn và ô viền đỏ, câu lỗi «Đường dẫn phải bắt đầu bằng http:// hoặc https://». Mô tả và tiêu đề xuống dòng.
    Ảnh 3, ST-bc-loi--desktop-1280--light.png: dòng nhập trong ngăn, nhãn và ô đỏ, câu «Chưa đính được bằng chứng. Thử lại sau một lát.» bằng tiếng Việt. Nội dung đã nhập vẫn còn, ghi chú còn nguyên.
    Ảnh 4, ST-bc-cap-nhat-moc--mobile-375--light.png: khối «Cập nhật», Mốc: Xong, ô «Đường dẫn bằng chứng» cùng nhãn, cùng hình ô và cùng chữ gợi ý «Đường dẫn tới văn bản cho thấy mốc đã xong…» như ở dòng nhập. Giá trị dài bị cắt trong ô một dòng.
  network_observed: n-a (driver)
  output: |
    14 anh; xong; tran ngang: 0; khong co ngan: 0
    phien-do: xong — mã 0

- eval: E11
  run_id: minted-bang-chung-kr-mot-loi-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.sv10_bai_cu
  verified_at: 2026-11-02T08:37:16Z
  output: |
    Ran 62 tests across 3 files. [12.10s]

- eval: E13
  run_id: minted-bang-chung-kr-mot-loi-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sv10_mot_o
  verified_at: 2026-11-02T08:37:16Z
  output: |
    cay: dat 3/3 · ban sao: do o 1,2

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

- cmd: bunx turbo run lint --force
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

- cmd: bunx turbo run build --force
  run_id: minted-bang-chung-kr-mot-loi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-11-02T08:37:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, là regression-guard):
- E7 (bun run lint:slop)
- E11 (ba bài DOM cũ: okr-canh-kr, cap-nhat-trong-ngan-kr, ngan-kr-mot-cho)

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-chung-mot-loi.dom.tsx: bo qua baseline: tep apps/app/test/bang-chung-mot-loi.dom.tsx co o cay dang kiem nhung chua co o merge-base a3c562cd7d9f669572fc224d89ace41053e00fba — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/bang-chung-kr-mot-loi/rang/nhap-lai-dialog.mjs: bo qua baseline: tep _acceptance/bang-chung-kr-mot-loi/rang/nhap-lai-dialog.mjs co o cay dang kiem nhung chua co o merge-base a3c562cd7d9f669572fc224d89ace41053e00fba — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/bang-chung-kr-mot-loi/rang/mot-o.mjs: bo qua baseline: tep _acceptance/bang-chung-kr-mot-loi/rang/mot-o.mjs co o cay dang kiem nhung chua co o merge-base a3c562cd7d9f669572fc224d89ace41053e00fba — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 13 eval đạt, không eval nào đỏ; không có mục judgment. Verdict PASS.
