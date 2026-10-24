---
schema_version: 2
feature_slug: ho-so-do-kiem-cheo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e0389b2a953d782c9f58f04cc8c119e7a47f1d88
human_signoff: Manh Phan 2026-10-24
---

# Evidence Report: ho-so-do-kiem-cheo

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | judgment | UNCERTAIN |
| E7 | AC-7 | script | PASS |

Ghi chú: round 3 chạy sau khi chủ kho thu phạm vi ngày 24/10 (AC-1 bỏ vế tái lập, AC-3 ra Known limits và eval E3 rời evals.yaml). E7 là carry-forward từ round 1 (delta không chạm paths của eval, round này không chạy lại). Không có lệnh đỏ nào, kể cả lệnh không gắn eval. Verdict là PENDING-JUDGMENT vì E6 là mục judgment chưa có người chốt; panel E6 giữ nguyên từ round 2.

## Evidence

- eval: E1
  run_id: minted-ho-so-do-kiem-cheo-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_danh_sach
  verified_at: 2026-10-24T10:25:01Z
  output: |
    danh-sach: 27 hồ sơ đầu vào · 345 eval máy · 39 dòng + 34 eval hoàn lại = 73 đỏ ở mốc nền 6be0bb688900ecd8843989bd8f8b3095548b604f

- eval: E2
  run_id: minted-ho-so-do-kiem-cheo-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_khai_du
  verified_at: 2026-10-24T10:25:01Z
  output: |
    khai-du: 93 tệp đổi ngoài hồ sơ này, 23 eval đổi, mọi thay đổi có dòng danh sách

- eval: E4
  run_id: minted-ho-so-do-kiem-cheo-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_ghim_xanh
  verified_at: 2026-10-24T10:25:01Z
  output: |
    ghim-xanh: 21/21 hồ sơ

- eval: E5
  run_id: minted-ho-so-do-kiem-cheo-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hsdk_yaml_chuan
  verified_at: 2026-10-24T10:25:01Z
  output: |
    yaml-chuan: 5/5 hồ sơ đạt

- eval: E7
  run_id: minted-ho-so-do-kiem-cheo-E7-r1
  exit_code: 0
  verifier: config:executors.script.hsdk_loi_ra
  verified_at: 2026-10-23T16:02:37Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

- eval: E6
  judged_by: hội đồng judge (fresh context), panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round 2
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn đều chưa chốt được; các dòng san-pham-hong chưa có đủ bằng chứng đo để xác nhận đúng chỗ hỏng và đúng loại.
  votes:
    - domain-correctness: UNCERTAIN (r2)
    - operational-feasibility: UNCERTAIN (r2)
    - spec-alignment: UNCERTAIN (r2)
  required_evidence:
    - tong-quan-va-khung-noi-tieng-viet:E7 — log một lượt man-that.mjs sau khi áp sửa răng E1 (bỏ nhập apps/app/lib/deal-stage.ts, lấy giai đoạn từ giaiDoan.list), cho thấy nhãn giai đoạn ở sales-dashboard.tsx:204-208 thiếu translate="no", kèm dòng sổ hay AC đã ký nói rõ nhãn đó phải mang translate="no" (AC-7 ở contract.md:49 đang loại nhãn lang="en").
    - so-okr-tu-chay:E12 và E14 — hai lượt tách ô (EVAL=E12, EVAL=E14) với bản vá sua-san/so-okr-tu-chay.patch, toàn văn _acceptance/ngan-kr-mot-cho/contract.md:40 (AC-3), và lượt chạy lỗi hydrat trên cây mốc nền 6be0bb688900ecd8843989bd8f8b3095548b604f; tệp:dòng chứa chỗ hydrat lệch (grep data-so-tom-tat apps/app).
    - cron-theo-ban-khai:E7 — chốt khác còn canh số cảnh báo lint apps/app ở HEAD, hoặc dòng sổ của chủ kho (có decided_by) nói ô E7 không còn canh HEAD.
    - bo-dung-chung-nhan-chuoi:E4, hoan_lai.sua_san (cai-dat-con-lai-noi-tieng-viet, tong-quan-va-khung-noi-tieng-viet, so-okr-tu-chay), cap-nhat-tuan-okr:E14, chu-mac-dinh-thu-vien-ngoai:E3 — ly_do phân loại và căn cứ trích được cho từng dòng, log đầy đủ lượt nền, và bảng gán từng tệp component mới trong packages/ui với hồ sơ đã ký.
  human_override: Đạt — Manh Phan 2026-10-24

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bun run lint:slop
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

- cmd: bunx turbo run build --force
  run_id: minted-ho-so-do-kiem-cheo-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-24T10:25:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Lưu ý: cả bốn eval máy chạy ở round này đều có baseline n-a (không đo được), nên danh sách trên rỗng do không có dữ liệu so sánh chứ không do đã chứng minh có phân biệt.

Baseline khong do:
- bun _acceptance/ho-so-do-kiem-cheo/rang/danh-sach.mjs: bo qua baseline: tep _acceptance/ho-so-do-kiem-cheo/rang/danh-sach.mjs co o cay dang kiem nhung chua co o merge-base 86d6114eaa7f3082fe5b502d654f045ddb32af51 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs: bo qua baseline: tep _acceptance/ho-so-do-kiem-cheo/rang/khai-du.mjs co o cay dang kiem nhung chua co o merge-base 86d6114eaa7f3082fe5b502d654f045ddb32af51 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ho-so-do-kiem-cheo/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/ho-so-do-kiem-cheo/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base 86d6114eaa7f3082fe5b502d654f045ddb32af51 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ho-so-do-kiem-cheo/rang/yaml-chuan.mjs: bo qua baseline: tep _acceptance/ho-so-do-kiem-cheo/rang/yaml-chuan.mjs co o cay dang kiem nhung chua co o merge-base 86d6114eaa7f3082fe5b502d654f045ddb32af51 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1 tái lập hỏng, E3 quá trần 30 phút, E6 hội đồng không qua; E2, E4, E5 xanh; E7 xanh (16:02:37Z). Trả về triển khai (sửa tái lập, khai lệnh chạy dài, bằng chứng cho hội đồng).
Round 2: E1 chạy hết với trần 240 phút nhưng tập đỏ khi tái lập lệch hai ô (cron-theo-ban-khai:E8, tro-ly-okr-nen:E9); E3 bắt đúng 36 trên 38 đột biến, hai ô sai thông điệp (cron-theo-ban-khai:E7, tro-ly-okr-nen:E4); E6 vẫn chưa chốt; E2, E4, E5 và bảy lệnh suite xanh; E7 mang từ round 1. Trả về triển khai.
Round 3: sau khi chủ kho thu phạm vi 24/10 (AC-1 chỉ đo phần tất định, AC-3 và E3 ra Known limits của hợp đồng), E1, E2, E4, E5 và bảy lệnh suite xanh; E7 mang từ round 1; E6 giữ panel round 2, chưa chốt nên chờ người ở Cổng 2.

### Re-pin lần 1 — 2026-10-24, do hoá cũ do gộp origin/onehub a971d21be vào nhánh F28 (lượt 3, từng hồ sơ)
run_id: repin-20261024T182422Z-97721
sha: e0389b2a953d782c9f58f04cc8c119e7a47f1d88 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6 (E6 không khai paths) · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
