---
schema_version: 2
feature_slug: khung-chung-ngan-ban-ghi
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4a5e925d4e250edf683eafc29da270680f6e5142
human_signoff:
---

# Evidence Report: khung-chung-ngan-ban-ghi

Vòng 1. Verdict REJECT: mười một eval của hợp đồng đều đạt, nhưng một lệnh suite không gắn eval (`bun run test -- --filter=app --filter=@crm/ui`) đỏ với ba bài kiểm. Không eval nào bị đánh rớt, nên `failed_evals` để trống; lệnh đỏ được ghi ở mục Lệnh suite bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-9 | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-chung-ngan-ban-ghi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_quet
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E2
  run_id: minted-khung-chung-ngan-ban-ghi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_quet
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E3
  run_id: minted-khung-chung-ngan-ban-ghi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E4
  run_id: minted-khung-chung-ngan-ban-ghi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E5
  run_id: minted-khung-chung-ngan-ban-ghi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E6
  run_id: minted-khung-chung-ngan-ban-ghi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E7
  run_id: minted-khung-chung-ngan-ban-ghi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_kieu
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E8
  run_id: minted-khung-chung-ngan-ban-ghi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_bai_cu
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E9
  run_id: minted-khung-chung-ngan-ban-ghi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E11
  run_id: minted-khung-chung-ngan-ban-ghi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_dom
  verified_at: 2026-10-31T16:32:35Z
  output: |
    DAT tat ca

- eval: E10
  run_id: minted-khung-chung-ngan-ban-ghi-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bk1_chup
  verified_at: 2026-10-31T16:32:35Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở cả năm ảnh gốc. (1) ST-kr-dang-tai desktop: ô KR và ô Deal cùng đầu ngăn (tiêu đề bên trái, nút đóng X bên phải, đường kẻ dưới) và cùng khung xương: hai ô số cạnh nhau, một thanh thẻ mảnh, ba đoạn hai dòng; hai ô giống nhau. (2) ST-so-kr-loi desktop: ô Số KR và ô Deal cùng một khung có viền, mỗi khung gồm tiêu đề («Không tải được số» / «Không tải được bản ghi này»), một câu mô tả và một nút «Thử lại», căn giữa dọc; cùng hình, chỉ khác chữ. (3) ST-muc-tieu-du mobile 375: ô Mục tiêu và ô Deal cùng đầu ngăn (tiêu đề nhiều dòng, nút Sửa, X), vùng ô số, thanh thẻ, nội dung; cùng bố cục, không tràn ngang. (4) ST-kr-cu-moi-dang-tai desktop: ô trái «Trước — ngăn KR tự dựng» có hai ô số, một thanh mỏng và MỘT khối chữ nhật lớn; ô phải «Sau — ngăn KR trong khung» có hai ô số, thanh thẻ và ba đoạn hai dòng; hai hình khác nhau rõ, đối chứng âm đạt. (5) ST-kr-loi mobile: ô KR lỗi («Không thấy KR», một câu, nút «Về mục tiêu») và ô Deal lỗi («Không tải được bản ghi này», một câu, «Thử lại») cùng một khung có tiêu đề, một câu, một nút; đầu ngăn cùng hình. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Lệnh: PROTO_ROUTE=1 bun run do:man --chay "PROTO_URL=$APP_URL node .../chup-proto.mjs". Dòng cuối: «xong; 46 anh; tran ngang: 0; khong co ngan: 0», «phien-do: xong — mã 0» (log ở evidence/E10-run.log). Khung đã lưu: E10-step1.png đến E10-step5.png trong _acceptance/khung-chung-ngan-ban-ghi/evidence/.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-31T16:32:35Z
  output: |
    Lệnh không gắn eval nào. 1050 pass, 3 fail trên 1053 bài ở 106 tệp (gói app).
    Ba bài đỏ:
    - hinh-theo-man > bang hinh bang dung tap tep goc va moi tep dung hinh
    - checkout-nong > thieu commit goc: bo phep so, chi mot dong ghi chu
    - khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI
    Turbo: app#test lỗi, 3 trên 4 tác vụ thành công.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

- cmd: bun run lint:slop
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-chung-ngan-ban-ghi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-31T16:32:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú thật: bốn eval có lệnh riêng (E1 và E2, E3 đến E6 cùng E9 và E11, E7, E8) không đo được baseline, nên trường baseline của chúng là n-a. Dòng trên là câu mẫu máy tính sẵn cho danh sách eval không-phân-biệt, danh sách đó rỗng.

Baseline khong do:
- node _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/quet-ngan.mjs co o cay dang kiem nhung chua co o merge-base 6aa709e5839bd268a4cd985ab3ce3ffc8ce0da90 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/chay-dom.mjs co o cay dang kiem nhung chua co o merge-base 6aa709e5839bd268a4cd985ab3ce3ffc8ce0da90 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/kieu-bat-buoc.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/kieu-bat-buoc.mjs co o cay dang kiem nhung chua co o merge-base 6aa709e5839bd268a4cd985ab3ce3ffc8ce0da90 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/khung-chung-ngan-ban-ghi/rang/bai-cu.mjs: bo qua baseline: tep _acceptance/khung-chung-ngan-ban-ghi/rang/bai-cu.mjs co o cay dang kiem nhung chua co o merge-base 6aa709e5839bd268a4cd985ab3ce3ffc8ce0da90 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ba bài (hinh-theo-man, checkout-nong, khoa chet), không gắn eval nào; mười một eval của hợp đồng đều đạt. Chưa rõ nguyên nhân từng bài: đầu ra chỉ có tên bài, chưa có dòng lỗi nguyên văn. Trả về cho khâu cài đặt.
