---
schema_version: 2
feature_slug: tran-test-ci-30
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e22bcd60bda7b1cf47bfbaf26052492784e39fe9
human_signoff:
---

# Evidence Report: tran-test-ci-30

Vòng 1. Cả ba eval máy (E1, E2, E3) đều đạt, nhưng một lệnh suite không gắn eval nào (`bun run test -- --filter=app --filter=@crm/ui`) thoát khác 0 với bốn bài kiểm đỏ, nên báo cáo là REJECT. `failed_evals` để trống vì lệnh đỏ không thuộc eval nào.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | judgment | PASS (hội đồng đề xuất, chờ người chốt ở human_override) |

## Evidence

- eval: E1
  run_id: minted-tran-test-ci-30-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_mot_khoa
  verified_at: 2026-10-22T13:17:57Z
  output: |
    KET mot-khoa: dat, moi ca do bi bat

- eval: E2
  run_id: minted-tran-test-ci-30-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_e3_cu
  verified_at: 2026-10-22T13:17:57Z
  output: |
    KET e3-cu: dat, moi ca do bi bat

- eval: E3
  run_id: minted-tran-test-ci-30-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttc30_thay_boi
  verified_at: 2026-10-22T13:17:57Z
  output: |
    KET thay-boi: dat, moi ca do bi bat

- eval: E4
  judged_by: judge panel (fresh context), đề xuất — chờ người
  proposal: PASS
  votes:
    - domain-correctness: PASS — Hạt giống ghi rõ điều kiện mở lại «trung vị các lượt xanh của test (api) > 22 phút» và lý do chưa tách (khoảng 3 phút cài đặt cho mọi lượt chạy). Cả bốn hàng bảng 40 lượt trong design doc cộng đủ 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40, check 21+1+5+13 (13 lượt nhảy qua vì PR nháp nằm trong ngoặc ở cột huỷ). Hai tệp khớp nhau về số M5 (15 xanh, 7 lượt 17–19′, 6 lượt sát trần, app-ui ~18′), về mức tăng trần và về lý do không tách ô.
    - operational-feasibility: PASS — Hạt giống ghi rõ điều kiện mở lại «trung vị các lượt xanh của test (api) > 22 phút» và lý do chưa tách (khoảng 3 phút cài đặt cho mọi lượt chạy). Bảng của design doc chia nhóm rời nhau và mỗi hàng cộng đủ 40: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40. Hàng check là 21+0+1+5 và 13 lượt nhảy qua vì PR nháp, tổng 40. Hai tệp khớp nhau ở 3 phút, trần 30 phút, mức tăng tối đa 10 phút, số đo M5 và con trỏ qua lại. Số đo M5 lúc gieo (15 xanh) khác số đo lại 22/10 (33 xanh), nhưng design doc ghi rõ đó là hai phép đo riêng nên không trái nhau.
    - spec-alignment: PASS — Hạt giống ghi điều kiện mở lại «trung vị các lượt xanh của test (api) > 22 phút» và lý do chưa tách (khoảng 3 phút cài đặt mỗi ô mới cho mọi lượt chạy), và design doc nhắc lại đúng lý do đó. Bảng 40 lượt cộng đủ 40 ở cả bốn dòng: api 33+2+2+3, app-ui 37+0+0+3, con-lai 40, check 21+0+1+5+13. Dòng check hơi khó đọc vì 13 lượt nhảy qua nằm trong ngoặc của một ô, nhưng không làm sai tổng. Hai tệp không nói trái nhau: số đo của M5 và số đo lại 22/10 là hai lần đo khác nhau và design doc nêu rõ cả hai, còn ngưỡng 22 phút nằm trên trung vị 17,0 phút.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-22T13:17:57Z
  note: lệnh này không gắn eval nào. Bốn bài kiểm đỏ trong gói app, 940 đạt và 4 hỏng trên 944 bài ở 96 tệp. Gói app#test là gói duy nhất đỏ (Tasks 3 successful, 4 total).
  failed_tests: |
    ltmh-viec-moc: moc cua viec theo viec_hien khi khoa lech luat cu
    ltmh-viec-moc: doi chung — khoi chua sua, luat cu va khoa trung nhau
    ltmh-viec-moc: pha-thu — ban sao dung luat moc dau tien thi do
    ltmh-khoi-cu: ban chup moi qua cot Json giu nam khoa

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-tran-test-ci-30-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

- cmd: bun run lint:slop
  run_id: minted-tran-test-ci-30-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

- cmd: bunx turbo run build --force
  run_id: minted-tran-test-ci-30-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T13:17:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều chưa có baseline để so (cả ba eval máy mang baseline n-a), nên chưa có eval nào được xác nhận là không-phân-biệt.

Baseline khong do
- bun _acceptance/tran-test-ci-30/rang/kiem.mjs mot-khoa: bo qua baseline: tep _acceptance/tran-test-ci-30/rang/kiem.mjs co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tran-test-ci-30/rang/kiem.mjs e3-cu: bo qua baseline: tep _acceptance/tran-test-ci-30/rang/kiem.mjs co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/tran-test-ci-30/rang/kiem.mjs thay-boi: bo qua baseline: tep _acceptance/tran-test-ci-30/rang/kiem.mjs co o cay dang kiem nhung chua co o merge-base 05e3f7743ec5c9b70bc98dc838fa4b8b1cd25467 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (cả ba eval máy chạy một lần, xác định).

## Iterations

Round 1: không eval nào hỏng, nhưng lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ ở bốn bài kiểm của gói app (ltmh-viec-moc ba bài, ltmh-khoi-cu một bài), không gắn eval nào. Trả về bước triển khai.

