---
schema_version: 2
feature_slug: so-do-can-chinh-don-vi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 735c996977a6fa3e0aad9753f5b27adaea04267c
human_signoff: manh 2026-10-15
---

# Evidence Report: so-do-can-chinh-don-vi

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
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E15 | AC-2 | script | PASS |
| E16 | AC-15 | script | PASS |
| E17 | AC-7 | test | PASS |

không chạy theo hồ sơ: E13

## Evidence

- eval: E1
  run_id: minted-so-do-can-chinh-don-vi-E1-r2
  exit_code: 0
  verifier: config:executors.test.dh4_du_lieu
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-so-do-can-chinh-don-vi-E2-r2
  exit_code: 0
  verifier: config:executors.test.dh4_chu_y
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-so-do-can-chinh-don-vi-E3-r2
  exit_code: 0
  verifier: config:executors.test.dh4_quyen
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-so-do-can-chinh-don-vi-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_cach_xem
  verified_at: 2026-10-15T07:50:36Z
  output: |
    Ran 1 test across 1 file. [1302.00ms]

- eval: E5
  run_id: minted-so-do-can-chinh-don-vi-E5-r2
  exit_code: 0
  verifier: config:executors.test.dh4_the
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-so-do-can-chinh-don-vi-E6-r2
  exit_code: 0
  verifier: config:executors.test.dh4_loc
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-so-do-can-chinh-don-vi-E7-r2
  exit_code: 0
  verifier: config:executors.test.dh4_mo_the
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-so-do-can-chinh-don-vi-E8-r2
  exit_code: 0
  verifier: config:executors.test.dh4_thu_gon
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-so-do-can-chinh-don-vi-E9-r2
  exit_code: 0
  verifier: config:executors.test.dh4_hep
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-so-do-can-chinh-don-vi-E10-r2
  exit_code: 0
  verifier: config:executors.test.dh4_trang_thai
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-so-do-can-chinh-don-vi-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dh4_chu
  verified_at: 2026-10-15T07:50:36Z
  output: |
    Ran 155 tests across 1 file. [827.00ms]

- eval: E12
  run_id: ui:E12-r3-20261015-1451
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_man
  verified_at: 2026-10-15T07:50:36Z
  screenshot: evidence/E12-step1.png
  observed: |
    Đã mở từng ảnh bằng Read.
    E12-step1 (so-do-1440.png): Trang Toàn cảnh OKR, tab «Sơ đồ» đang chọn, chip «Mọi đơn vị 23» đang sáng, chú giải «Nét liền / Nét đứt / Chưa nối lên». Khung vẽ hiện cây OneHub → ba khối (Kinh doanh, Vận hành, Hỗ trợ) → Sơ đồ·Khối A, Khối B, X → hàng B3, B2, B1. Thẻ «Sơ đồ · Khối B» và «Sơ đồ · B2» mang dòng «Chưa nối lên» và «Có mục tiêu chưa góp vào đâu»; không có đường nào đi lên các thẻ này (đường liền từ OneHub xuống ba khối và Khối A, B1 có nét đứt, không đường nào kết thúc ở Khối B hay B2). Khớp Expected.
    E12-step2 (chu-y-1440.png): Chip «Cần chú ý 5» đang sáng sau khi bấm. Các thẻ Sơ đồ·Khối B, Sơ đồ·B3, Sơ đồ·B2, Sơ đồ·A1 và Khối Hỗ trợ hiển thị rõ; OneHub, Sơ đồ·X, Khối A, Khối Vận hành, B1, A2, A3 bị mờ. Tập cần chú ý không mờ khớp bốn khóa được assert (A1, Khối B, B2, B3); thẻ rõ thứ năm là Khối Hỗ trợ (đơn vị cha, không thuộc tập khai). Không thấy mâu thuẫn với Expected.
    E12-step3 (the-mo-1440.png): Chip trở lại «Mọi đơn vị 23». Thẻ «Sơ đồ · A3» (Đỗ Minh Khoa, 1 mục tiêu · 1 KR · 100%) được mở rộng, viền xanh, hiện tiêu đề «Sơ đồ · A3 góp cả khối A lẫn công ty» và hai mục góp, mỗi mục kèm câu lý do: «A3 giữ tỉ lệ giao đúng hẹn của khối A nên góp thẳng vào mục tiêu khối.» (nhãn «Có số liệu») và «A3 mở tuyển mới có thể đẩy doanh thu năm nhưng chưa có số đo riêng.» (nhãn «Đặt cược»). Khớp Expected (câu lý do đã gieo hiện trong thẻ).
    E12-step4 (danh-sach-390.png): Khung 390 rộng, không có khung vẽ; hiện danh sách dọc có thụt cấp: «OneHub» rồi «Khối Kinh doanh» với số liệu đúng nhịp/chậm nhịp/trượt, ô chọn «Sơ đồ» dạng dropdown, chip «Mọi đơn vị 23» và «Cần chú ý 5». Không thấy tràn ngang trên ảnh. Khớp Expected.
    Tổng: cả bốn ảnh khớp Expected, không có mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Network: driver là script puppeteer, không có công cụ đọc network nên không tạo E12-network.txt; console lỗi do chính script đếm (0 ở cả hai khổ).
    Lưu ý ngoài phạm vi: _acceptance/so-do-can-chinh-don-vi/s4-args.json đã sửa từ trước khi lượt chạy bắt đầu (không phải do lượt chạy). Không sửa mã.

- eval: E15
  run_id: minted-so-do-can-chinh-don-vi-E15-r2
  exit_code: 0
  verifier: config:executors.script.dh4_dot_bien
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-so-do-can-chinh-don-vi-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dh4_ranh_gioi
  verified_at: 2026-10-15T07:50:36Z
  output: |
    DUNG ranh gioi

- eval: E17
  run_id: minted-so-do-can-chinh-don-vi-E17-r2
  exit_code: 0
  verifier: config:executors.test.dh4_ly_do
  verified_at: 2026-10-15T06:09:44Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bun run lint:slop
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

- cmd: bunx turbo run build --force
  run_id: minted-so-do-can-chinh-don-vi-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-15T07:50:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-cach-xem: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base b57509860b3522f7e13c6741194d8ca93b0708f1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/okr-so-do-don-vi.dom.tsx -t dh4-chu && bun test ./test/messages-guard.spec.ts: bo qua baseline: tep apps/app/test/okr-so-do-don-vi.dom.tsx co o cay dang kiem nhung chua co o merge-base b57509860b3522f7e13c6741194d8ca93b0708f1 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs: bo qua baseline: tep _acceptance/so-do-can-chinh-don-vi/rang/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base b57509860b3522f7e13c6741194d8ca93b0708f1 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: chạy trên sha bd32cb3c, nhật ký ghi lúc 2026-10-15T04:58:21Z.
Round 2: chạy trên sha 822eb755, nhật ký ghi lúc 2026-10-15T06:09:44Z; E1–E3, E5–E10, E15, E17 xanh ở round này.
Round 3: chạy lại E4, E11, E12, E16 cùng bảy lệnh suite; E1–E3, E5–E10, E15, E17 mang từ round 2 vì delta không chạm paths của chúng. Tất cả xanh, verdict PASS.

### Re-pin lần 1 — 2026-10-16, do gộp origin/onehub f59e83cd3 + sửa nút lọc theo luật lkx-quet (#418)
run_id: repin-20261015T235856Z-83378
sha: cf4bcbc28ed17b12d567aec504517234fe697e1f · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13 · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12, AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-16, do lan-dem-16-10: gộp onehub ngày 16/10 (#434…#453)
run_id: repin-20261016T233032Z-31285
sha: 735c996977a6fa3e0aad9753f5b27adaea04267c · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E13 · ngoài làn máy: E12 · AC không có chốt máy: AC-12, AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
