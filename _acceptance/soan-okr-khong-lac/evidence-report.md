---
schema_version: 2
feature_slug: soan-okr-khong-lac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb44877e7221bd581e74fa97aef799edaa76d3b1
human_signoff: Phan Le Manh 2026-10-08
---

# Evidence Report: soan-okr-khong-lac

Round 1. Cả 10 eval máy đạt ở lần chạy đầu; 7 lệnh suite hồi quy xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-soan-okr-khong-lac-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2b_tab
  verified_at: 2026-10-08T16:18:37Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-khong-lac.dom.tsx -t k2b-tab
    Ran 1 test across 1 file. [1051.00ms]
    __EXIT=0

- eval: E2
  run_id: minted-soan-okr-khong-lac-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.k2b_khoa
  verified_at: 2026-10-08T16:18:37Z
  output: |
    cd apps/app && bun test ./lib/search-param-keys.test.ts
    Ran 10 tests across 1 file. [36.00ms]
    __EXIT=0

- eval: E3
  run_id: minted-soan-okr-khong-lac-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2b_nhom_loi
  verified_at: 2026-10-08T16:18:37Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/soan-okr-khong-lac.dom.tsx -t k2b-nhom-loi
    Ran 4 tests across 1 file. [1422.00ms]
    __EXIT=0

- eval: E4
  run_id: minted-soan-okr-khong-lac-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2b_nhom_ui
  verified_at: 2026-10-08T16:18:37Z
  output: |
    cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/kara-proposal-group-loi.dom.tsx
    Ran 2 tests across 1 file. [616.00ms]
    __EXIT=0

- eval: E5
  run_id: minted-soan-okr-khong-lac-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2b_moc
  verified_at: 2026-10-08T16:18:37Z
  output: |
    spec -t k2b-moc-ba, rồi bài DOM -t k2b-moc-dom (bun test, TZ=Asia/Ho_Chi_Minh)
    Ran 2 tests across 1 file. [1264.00ms]
    __EXIT=0

- eval: E6
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.k2b_moc_hong
  verified_at: 2026-10-08T16:18:37Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/soan-okr-khong-lac.spec.ts -t k2b-moc-hong
    Ran 2 tests across 1 file. [56.00ms]
    __EXIT=0

- eval: E7
  run_id: minted-soan-okr-khong-lac-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2b_mot_nguon
  verified_at: 2026-10-08T16:18:37Z
  output: |
    bun _acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs
    KET LUAN: 0 SAI — ma thoat 0
    __EXIT=0

- eval: E8
  run_id: minted-soan-okr-khong-lac-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2b_dot_bien
  verified_at: 2026-10-08T16:18:37Z
  output: |
    bun _acceptance/soan-okr-khong-lac/rang/dot-bien.mjs
    dot-bien: 5/5 vet bi bat, tep tra lai nguyen
    __EXIT=0

- eval: E9
  run_id: minted-soan-okr-khong-lac-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.k2b_ranh_gioi
  verified_at: 2026-10-08T16:18:37Z
  output: |
    node _acceptance/soan-okr-khong-lac/rang/ranh-gioi.mjs
    KET LUAN: 0 SAI — ma thoat 0
    __EXIT=0

- eval: E10
  run_id: minted-soan-okr-khong-lac-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.k2b_man
  verified_at: 2026-10-08T16:18:37Z
  screenshot: evidence/E10-hep-co-ban-ghi-390.png   # 6 ảnh: E10-hep-co-ban-ghi-{390,1440}, E10-nop-tu-choi-{390,1440}, E10-hoan-nhom-loi-{390,1440}
  observed: |
    Đã mở cả 6 ảnh. (1) hep-co-ban-ghi-390: trang Soạn OKR, tab 'Bản nháp (7)' đang chọn, nút 'Mọi dòng' (bộ lọc chỉ-dòng-chờ còn bật), ngăn đã đóng, vẫn ở tab Bản nháp, không nhảy về Trò chuyện. (2) hep-co-ban-ghi-1440: bố cục hai cột trò chuyện + Bản nháp, nút 'Mọi dòng', ngăn đóng, URL giữ tabSoan/locSoan.
    (3) nop-tu-choi-390: tab Trò chuyện với đúng 2 mốc ('Kara soạn bản nháp đầu: 2 Mục tiêu · 5 KR', 'Kara sửa bản nháp: +1 KR · sửa 1 · chuyển 1 · bỏ 1') và giữa hai mốc một dòng hệ thống 'Kara nộp bản nháp chưa được — chu ky khong o pha lap ke hoach'. (4) nop-tu-choi-1440: cùng trình tự mốc/dòng hệ thống trong cột trò chuyện, bản nháp bên phải.
    (5) hoan-nhom-loi-390: biên nhận nhóm 'Đã thêm Mục tiêu 1 và 2 KR' + 'Hoàn tác', ngay dưới là chữ đỏ 'Dòng này thuộc bản nháp cũ — Kara đã nộp bản mới hơn.', biên nhận vẫn còn, nút 'Đưa vào bộ OKR · 1 Mục tiêu, 2 KR'. (6) hoan-nhom-loi-1440: tương tự, biên nhận nhóm còn, câu lỗi đỏ ngay dưới. Tất cả khớp Expected; không mâu thuẫn. Lưu ý nhỏ: chữ 'chu ky khong o pha lap ke hoach' là lý do từ công cụ (không dấu); assertion của eval chỉ đòi câu 'Kara nộp bản nháp chưa được' nên vẫn đạt.
  network_observed: n-a (driver)
  output: |
    Assertion bước 3 (hoan-nhom-loi): chặn CONFLICT cho okr.soanQuyet quyet=hoan; [data-loi=nhom] = 'Dòng này thuộc bản nháp cũ — Kara đã nộp bản mới hơn.', conBienNhan=true, nằm ngay dưới biên nhận nhóm.
    Chiều đỏ: dot-bien nop (moc-nop.ts bỏ xét kết quả) -> 3 mốc, in 'buoc 2: so moc 3, mong 2', 'KET LUAN: 1 SAI', 'tep tra lai nguyen: moc-nop.ts'; chiều đỏ bị bắt đúng như mong đợi. git status không có thay đổi mã nguồn, chỉ ảnh evidence được ghi lại.
    Ảnh đã lưu (6) trong _acceptance/soan-okr-khong-lac/evidence/. Evidence network: E10-network.txt (driver puppeteer, không có read_network_requests; console lỗi 0 ở cả 2 khổ). Dev server do tien-de tự dựng và tự dọn; không còn cổng nghe.
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-soan-okr-khong-lac-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-soan-okr-khong-lac-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-soan-okr-khong-lac-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-soan-okr-khong-lac-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bunx turbo run lint --force
  run_id: minted-soan-okr-khong-lac-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bun run lint:slop
  run_id: minted-soan-okr-khong-lac-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

- cmd: bunx turbo run build --force
  run_id: minted-soan-okr-khong-lac-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T16:18:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

E2 (`cd apps/app && bun test ./lib/search-param-keys.test.ts`) xanh trên cả HEAD lẫn baseline: bài này không phân biệt cây trước và sau tính năng. Cần viết lại để assert hành vi mới (ca «trang soạn đọc khoá đã đăng ký»), hoặc xác nhận đây là regression-guard có chủ ý; chiều đỏ của AC-2 hiện chỉ do E8 vết (a) gánh.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic, không có pass_rate hỗn hợp)

## Iterations

Round 1: cả 10 eval máy và 7 lệnh suite đạt ở lần chạy đầu; không có eval hỏng, không có mục chờ người chấm.

### Re-pin lần 1 — 2026-10-09, do K2c (ly-do-tu-choi-nop-theo-locale) đổi nop-ban-nhap.ts thuộc paths của K2b; ghim lại ở tip sau gộp onehub 59d20767
run_id: repin-20261009T093838Z-83779
sha: 38e3e4815280a164ef3a8a6125bcae55f9e03a6b · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-10, do đỉnh nhánh K2d sau chữ ký Cổng 2 và gộp onehub b80172eca
run_id: repin-20261010T020743Z-54995
sha: bb44877e7221bd581e74fa97aef799edaa76d3b1 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
