---
schema_version: 2
feature_slug: dau-trang-okr-cho-nut-hoi-kara
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d6a2b97517e3bcb26c86aa9ac9e51d0a0cd4d9b
human_signoff: Phan Le Manh 2026-10-17 — ký Cổng 2 trên S4 lượt 2 (5/5 eval đạt); Ngoài-1…Ngoài-5 ghi Known limits, Ngoài-6 chấp nhận không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: dau-trang-okr-cho-nut-hoi-kara

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kmc_man_do
  verified_at: 2026-10-17T07:43:00Z
  output: |
    phien-do: xong — mã 0

- eval: E2
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nm5_dh1
  verified_at: 2026-10-17T07:43:00Z
  output: |
    khong-sua: dat

- eval: E3
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nm5_mo_coi
  verified_at: 2026-10-17T07:43:00Z
  output: |
    mo-coi: 0 tep cu · 0 nhap · 0 khoa dto · ma doi 1 tep

- eval: E4
  run_id: e4-20261017-0743
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kmc_man
  verified_at: 2026-10-17T07:43:00Z
  screenshot: evidence/E4-step1.png
  observed: |
    Đã mở từng frame bằng Read.
    E4-step1.png (375, lúc chờ): tiêu đề "Mục tiêu" 1 dòng, mô tả "Cả công ty trong một màn.". Hàng hành động chiếm 2 dòng: dòng 1 là nút "Hỏi Kara" thật và 2 khung xương, dòng 2 là 1 khung xương. Dưới đó là khung xương thanh thẻ ở y≈224-260, rồi 4 khung xương thẻ số tổng quan bắt đầu ở y≈284.
    E4-step2 (375, lúc xong): cùng tiêu đề "Mục tiêu" 1 dòng và mô tả. Hàng hành động 2 dòng: dòng 1 là "Hỏi Kara", "Quý 4 · mẫu", nút "…"; dòng 2 là "+ Thêm mục tiêu". Thanh thẻ Của tôi / Theo đơn vị / Toàn cảnh / Hỏi ý. Khối số tổng quan (Tiến độ trung bình 47%, Đơn vị đã công bố OKR 12/13, KR đã cập nhật 43/49, KR tự tin thấp 8) bắt đầu ở y≈284, trùng với lúc chờ. Số đo log: 284/284.
    E4-step3 (1280, lúc chờ): tiêu đề "Mục tiêu" 1 dòng, mô tả. Hàng hành động 1 dòng gồm "Hỏi Kara" thật và 2 khung xương ở y≈74-105. Thanh thẻ khung xương, 4 thẻ số khung xương bắt đầu ở y≈220.
    E4-step4 (1280, lúc xong): cùng tiêu đề và mô tả. Hàng hành động 1 dòng: Hỏi Kara, Quý 4 · mẫu, nút "…", "+ Thêm mục tiêu" ở cùng y≈74-105. Thanh thẻ và 4 thẻ số thật (47%, 12/13, 43/49, 8) bắt đầu ở y≈220, trùng với lúc chờ.
    Đối chiếu Expected: ở cả hai khổ, hàng tiêu đề, số dòng hàng hành động và độ cao khối đầu tiên của lúc chờ và lúc xong đều khớp, lệch 0 px. Không thấy mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Ngoài lệ: chiều cao đầy đủ của nội dung khác nhau (656 và 1438 ở 1280; 544 và 1594 ở 375). Đó là nội dung tải xong dài hơn khung xương, tiêu chí không đòi bằng nhau.
    Network: driver là chup-man (Playwright nội bộ), không đọc được network qua công cụ, nên networkObserved = n-a (driver). Ghi chú vào E4-network.txt.

- eval: E5
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kmc_man_do
  verified_at: 2026-10-17T07:43:00Z
  output: |
    phien-do: xong — mã 0
    (cùng lệnh với E1, chạy một lần)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bun run lint:slop
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

- cmd: bunx turbo run build --force
  run_id: minted-dau-trang-okr-cho-nut-hoi-kara-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-17T07:43:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả hai phía (E1, E5 đỏ trên baseline; E2, E3, E4 không đo được baseline, xem mục dưới).

Baseline khong do
- node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs: bo qua baseline: tep _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/khong-sua.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/go-mo-coi.mjs: bo qua baseline: tep _acceptance/dau-trang-okr-cho-nut-hoi-kara/rang/go-mo-coi.mjs co o cay dang kiem nhung chua co o merge-base 981ac146085fc2ef91484a91f4bbed5ddc04d565 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 2: E1–E5 đạt cùng bảy lệnh suite; run_id ghi theo hậu tố -r2 trong run-log.jsonl. Round 1: lịch sử không được truyền vào lần soạn này, xem run-log.jsonl.
