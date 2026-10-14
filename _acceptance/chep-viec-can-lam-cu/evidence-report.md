---
schema_version: 2
feature_slug: chep-viec-can-lam-cu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e0cc19b2b60e10ec4cb16988205c2f8c04d52658
human_signoff: manh 2026-10-14 — ký Cổng Bằng chứng trên vòng chấm 2 (0 eval trượt, 7/7 lệnh suite, E12 đạt). Ngoài-25 và Ngoài-26 (hạn lệch một ngày) đã sửa trong lần nâng phạm vi nên chấp nhận, không sửa; Ngoài-2, 5, 8, 9, 13, 14, 15, 16, 20, 23, 24, 27, 28 ghi Known limits; mười ba mục còn lại chấp nhận, không sửa. Đồng ý phần cắt/hoãn đã khai; phê hết các quyết định ghi sau Cổng Phạm vi.
---

# Evidence Report: chep-viec-can-lam-cu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward round 1) |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (carry-forward round 1) |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS (carry-forward round 1) |
| E12 | AC-12 | judgment | PENDING-JUDGMENT |
| E13 | AC-1 | script | PASS |
| E14 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: mv7jiohcv7zm
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_chep
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jiohcv7zm_test

- eval: E2
  run_id: mv7jinqhowd3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_chep_lai
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jinqhowd3_test

- eval: E3
  run_id: mv7jip7v9qcr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_nguoi_tao
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jip7v9qcr_test

- eval: E4
  run_id: mv7jiowgvew3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_dao
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jiowgvew3_test

- eval: E5
  run_id: minted-chep-viec-can-lam-cu-E5-r1
  exit_code: 0
  verifier: config:executors.test.cvc_dong_thoi_gian
  verified_at: 2026-10-13T16:59:03Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-chep-viec-can-lam-cu-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_man_dong_thoi_gian
  verified_at: 2026-10-14T03:14:38Z
  output: |
    Ran 3 tests across 1 file. [1184.00ms]

- eval: E6
  run_id: minted-chep-viec-can-lam-cu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_api
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jioeqm3v8_test

- eval: E7
  run_id: mv7jio6s8mfo
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_tac_nhan
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jio6s8mfo_test

- eval: E8
  run_id: mv7jip9t6whw
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_ma_lech
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jip9t6whw_test

- eval: E9
  run_id: minted-chep-viec-can-lam-cu-E9-r1
  exit_code: 0
  verifier: config:executors.test.cvc_hien
  verified_at: 2026-10-13T16:59:03Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: mv7jip3uaxa5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_nhac
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jip3uaxa5_test

- eval: E10
  run_id: mv7jiofd2ps4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.cvc_lenh
  verified_at: 2026-10-14T03:14:38Z
  output: |
    test-run: dropped crm_mv7jiofd2ps4_test

- eval: E11
  run_id: minted-chep-viec-can-lam-cu-E11-r1
  exit_code: 0
  verifier: config:executors.script.cvc_man
  verified_at: 2026-10-13T16:59:03Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E11-step1.png
  observed: |
    Frame 1280 (cvc-thoa-thuan-1280.png, copy E11-step1.png): bảng Thoả thuận phía sau, khung bên phải mở "Thoả thuận An Phát k6xiydg" ở thẻ Hoạt động. Các thẻ là Tổng quan, Cá nhân, Hoạt động, Kara; trong thẻ Hoạt động không có chữ «Sắp tới» hay «Đã xong». Dưới ô soạn có chip lọc Tất cả, Ghi chú, Email, Cuộc họp. Khối «Việc» ở đầu thẻ có một dòng "Gửi hồ sơ năng lực k6xiydg", "Chưa làm", hạn "11 thg 10, 2026", "Tôi" (việc cũ quá hạn đã chép). Không thấy checkbox nào trong dòng thời gian; phần còn lại là trạng thái rỗng "Chưa có gì xả...". Khớp Expected. Frame 375 (cvc-thoa-thuan-375.png, copy E11-step2.png): khung thoả thuận dạng sheet toàn chiều ngang, thẻ Hoạt động, khối «Việc» có số đếm 1 và cùng dòng "Gửi hồ sơ năng lực k6xiydg", "Chưa làm", "11 thg 10, 2026", "Tôi". Không có chữ «Sắp tới» hay «Đã xong», không có checkbox, không thấy cuộn ngang. Khớp Expected.
  network_observed: n-a (driver)

- eval: E12
  judged_by: judge panel ba lens (domain-correctness, operational-feasibility, spec-alignment), fresh context — chỉ là đề xuất
  verdict: PASS
  verified_at: 2026-10-14T03:14:38Z
  rationale: Hội đồng đề xuất PASS. Người quyết ở Cổng 2; mục này chưa có chữ ký người nên báo cáo giữ PENDING-JUDGMENT.
  votes:
    - domain-correctness: PASS — Cả sáu điều đều có trong bốn tệp đầu vào. (1) CONTEXT.md dòng 167-169 và docs/api.md dòng 549-555 nói việc cũ đã chép, bản gốc còn để đảo, việc chưa chép chỉ đọc. (2) và (3) docs/production.md dòng 276-301 có đếm, chạy thử, chạy thật, đếm lại, cờ ALLOW_REMOTE_DB, `--nguoi` là email quản trị, hai vế ngưỡng (`taskTong` không đổi, `--tu` cho `taskTaoSau` bằng 0 sau 14 ngày), đảo kể cả bản đã đổi bằng `--ca-ban-da-doi`. (4) docs/api.md dòng 549-551 nói `activities.create` trả 400 với TASK, `complete` và `myTasks` đã bỏ. (5) docs/agent.md dòng 77-81 và 1085-1091 nói Tác nhân giao Việc cho người khởi chạy, việc mã môi giới lệch giao cho người cầm trịch. (6) docs/production.md dòng 282-285 có thứ tự lên (đợi deployment api xong migration), dòng 298-301 có thứ tự lùi (chạy `--dao` trước, kèm lý do hiện hai lần và giao trùng). Không thấy từ ghép tự đúc nào: «vết», «người cầm trịch», «vai chỉ OKR» đều có trong CONTEXT.md. «mã môi giới lệch» không có mục riêng ở đó, nhưng tài liệu giải nghĩa nó ngay tại chỗ dùng, nên coi là chữ thường chứ không phải thuật ngữ đúc mới.
    - operational-feasibility: PASS — Bốn tài liệu nói đủ sáu điều. (1) CONTEXT.md 167-169 và api.md 549-555 nói việc cũ đã chép, bản gốc còn để đảo, việc chưa chép chỉ đọc. (2) production.md 276-301 nêu đủ đếm, chạy thử, chạy thật, đếm lại, ALLOW_REMOTE_DB=1, `--nguoi` là email quản trị và `--dao` (kể cả `--ca-ban-da-doi`). (3) Hai vế ngưỡng ở production.md 294-295, vế hai dùng `--tu` và `taskTaoSau` bằng 0. (4) api.md 549-551. (5) agent.md 77-81 và 1085-1091. (6) production.md 282-285 (thứ tự lên) và 297-301 (chạy đảo trước khi lùi mã, kèm lý do). Các từ như «người cầm trịch», «vết», «Việc», «quản trị» đều có trong CONTEXT.md; «bản chép» và «đảo» là chữ thường, không phải từ ghép tự đúc.
    - spec-alignment: PASS — Bốn tệp nói đủ sáu điều. (1) CONTEXT.md mục «Việc», dòng 167-169. (2) và (3) docs/production.md dòng 276-301: đếm, chạy thử, chạy thật, đếm lại, ALLOW_REMOTE_DB, `--nguoi` là email quản trị, hai vế ngưỡng, `--dao` và `--ca-ban-da-doi`. (4) docs/api.md dòng 549-555. (5) docs/agent.md dòng 77-81 và 1085-1091. (6) docs/production.md dòng 282-285 và 297-301. Các từ dùng đều là chữ thường hoặc tên định danh/lệnh, không có từ ghép kỹ thuật nào mới đúc.
  human_override: manh 2026-10-14 — Đạt

- eval: E13
  run_id: minted-chep-viec-can-lam-cu-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvc_dot_bien
  verified_at: 2026-10-14T03:14:38Z
  output: |
    dot-bien: 16/16 cap dat

- eval: E14
  run_id: minted-chep-viec-can-lam-cu-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cvc_quet_task
  verified_at: 2026-10-14T03:14:38Z
  output: |
    quet-task: 15 tep · doc 7 · khai 6 · so-quyen 7 · nhan 4

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bunx turbo run lint --force
  run_id: minted-chep-viec-can-lam-cu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bun run lint:slop
  run_id: minted-chep-viec-can-lam-cu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

- cmd: bunx turbo run build --force
  run_id: minted-chep-viec-can-lam-cu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T03:14:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:

- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-chep-du": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-chep-lai": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-nguoi-tao": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep.spec.ts -t cvc-dao": bo qua baseline: tep packages/db/test/viec-chep.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/dong-thoi-gian-viec-cu.dom.tsx: bo qua baseline: tep apps/app/test/dong-thoi-gian-viec-cu.dom.tsx co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/viec-can-lam-cu.spec.ts -t cvc-api": bo qua baseline: tep apps/api/test/viec-can-lam-cu.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && bun test test/tac-nhan-giao-viec.integration.spec.ts -t cvc-tac-nhan": bo qua baseline: tep apps/agent/test/tac-nhan-giao-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/ma-lech-viec.integration.spec.ts": bo qua baseline: tep apps/agent/test/ma-lech-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/tac-nhan-giao-viec.integration.spec.ts -t cvc-nhac": bo qua baseline: tep apps/agent/test/tac-nhan-giao-viec.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd packages/db && bun test test/viec-chep-lenh.spec.ts": bo qua baseline: tep packages/db/test/viec-chep-lenh.spec.ts co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/chep-viec-can-lam-cu/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs: bo qua baseline: tep _acceptance/chep-viec-can-lam-cu/rang/quet-task.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bộ đo máy đều xanh, verdict PENDING-JUDGMENT vì E12 chờ người chốt; còn vài findings trong hợp đồng ở bộ đo (E4, quet-task) quay về vòng sửa.
Round 2: chạy lại E1-E4, E5b, E6-E8, E9b, E10, E13, E14 cùng bảy lệnh suite, tất cả xanh; E5, E9, E11 mang từ round 1 vì delta không chạm paths của chúng. E12 vẫn chờ người. Mốc verified_at của các eval chạy lại là ngày soạn; ts máy do vòng lặp chính ghi vào run-log.

### Re-pin lần 1 — 2026-10-14, do gộp onehub aac0975b5 (DA2, l3b), dời migration chep_viec_can_lam sang 20261014060147, sửa đua upsert ở dem-qua-han
run_id: repin-20261014T063030Z-77767
sha: e0cc19b2b60e10ec4cb16988205c2f8c04d52658 · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E11, E12 (E12 không khai paths) · diff chạm vật đo ngoài làn máy: E11 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-11, AC-12 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
