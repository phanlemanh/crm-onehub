---
schema_version: 2
feature_slug: hop-cap-nhat-lan-truoc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6f23db66ee3497dcf42672e4f2a6690dff03fcd9
human_signoff:
---

# Evidence Report: hop-cap-nhat-lan-truoc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-cap-nhat-lan-truoc-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_khoi
  verified_at: 2026-10-23T09:43:06Z
  output: |
    Ran 1 test across 1 file. [1120.00ms]

- eval: E2
  run_id: minted-hop-cap-nhat-lan-truoc-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_rong
  verified_at: 2026-10-23T09:43:06Z
  output: |
    Ran 1 test across 1 file. [1158.00ms]

- eval: E3
  run_id: minted-hop-cap-nhat-lan-truoc-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_api_moi_nhat
  verified_at: 2026-10-23T09:43:06Z
  output: |
    test-run: dropped crm_mvks87lfgja4_test

- eval: E4
  run_id: minted-hop-cap-nhat-lan-truoc-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_sau_gui
  verified_at: 2026-10-23T09:43:06Z
  output: |
    Ran 1 test across 1 file. [1237.00ms]

- eval: E5
  run_id: minted-hop-cap-nhat-lan-truoc-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_goi_y
  verified_at: 2026-10-23T09:43:06Z
  output: |
    Ran 1 test across 1 file. [1144.00ms]

- eval: E6
  run_id: minted-hop-cap-nhat-lan-truoc-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hct_tai
  verified_at: 2026-10-23T09:43:06Z
  output: |
    Ran 1 test across 1 file. [1.79s]

- eval: E7
  run_id: minted-hop-cap-nhat-lan-truoc-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hct_man
  verified_at: 2026-10-23T09:43:06Z
  screenshot: evidence/hct-1440.png
  observed: |
    Đã mở bằng Read cả hai ảnh. hct-1440.png: hộp «Cập nhật KR» mở giữa trang nền tối. Đầu thân hộp có khối «Lần cập nhật trước · 23/10, 16:43» với «11 đối tác», chấm cam và nhãn «Vừa». Ghi chú dài (đoạn đầu liền không khoảng trắng, sau đó là «chờ pháp chế ký phụ lục, tuần tới gửi bản cuối…») xuống dòng trọn trong khối, không bị cắt, không tràn ra viền hộp. Bên dưới có ô Giá trị 11 đối tác, biểu đồ, nút Mức tự tin Cao/Vừa/Thấp với «Lần trước: vừa», ô «Ghi chú» (placeholder «Một dòng: điều gì đổi, cần ai giúp») và ba câu gợi ý ngay dưới. Nút «Huỷ» và «Gửi cập nhật» thấy được ở cuối hộp. hct-375.png: cùng nội dung ở khổ hẹp; khối «Lần cập nhật trước · 23/10, 16:43», «11 đối tác», «Vừa», ghi chú dài (đoạn liền không khoảng trắng) xuống dòng trọn trong khối, không tràn. Ô Ghi chú và ba câu gợi ý ngay dưới. Nút «Gửi cập nhật» nằm ở đáy khung nhìn, thấy được. Không có thanh cuộn ngang. Khớp Expected ở cả hai khổ.
  network_observed: n-a (driver)
  output: |
    Chạy: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-cap-nhat-lan-truoc/rang/man.mjs" (hct_man qua mot-luot.sh, phiên đo riêng kho crm_suspicious_matsumoto_c64c22_do, app :4121, api :4714, không dùng 3000/3001).
    Mỗi khổ 1440 và 375 đều DUNG 9 dòng: khối lần trước có ghi chú; ghi chú 200 ký tự nguyên văn; ghi chú không bị dịch; hộp không tràn ngang; khối và ghi chú không tràn ngang; ba câu gợi ý (3); trang không cuộn ngang (false); đối chứng đỏ (chèn khối rộng thì báo tràn); nút gửi trong khung nhìn. Cộng DUNG đủ 2 ảnh (2).
    KET LUAN: 19 DUNG, 0 SAI. Phiên đo xong, đã dọn khoá giả và ảnh đại diện. Sau chạy cổng 4121/4714 không còn lắng nghe.
    Frame đã lưu: evidence/hct-1440.png, evidence/hct-375.png, bản sao evidence/E7-step1.png (1440) và evidence/E7-step2.png (375); log evidence/E7-run.log; evidence/E7-network.txt ghi driver là script bun, không có đường đọc network.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bun run lint:slop
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-cap-nhat-lan-truoc-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-23T09:43:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào xanh trên cả baseline lẫn HEAD: baseline của sáu eval test (E1–E6) không đo được vì eval mới (xem dưới), và E7 mang baseline n-a mà máy không ghi lý do.

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-khoi: bo qua baseline: tep apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-rong: bo qua baseline: tep apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/hop-cap-nhat-lan-truoc.spec.ts -t hct-moi-nhat": bo qua baseline: tep apps/api/test/hop-cap-nhat-lan-truoc.spec.ts co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-sau-gui: bo qua baseline: tep apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-goi-y: bo qua baseline: tep apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-cap-nhat-lan-truoc.dom.tsx -t hct-tai: bo qua baseline: tep apps/app/test/hop-cap-nhat-lan-truoc.dom.tsx co o cay dang kiem nhung chua co o merge-base 6adaf11e015353352c1f98dc7a3ee0d346780804 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E7 đều qua, không eval nào đỏ; không có mục judgment nào chờ người. Chuyển sang Cổng 2.

