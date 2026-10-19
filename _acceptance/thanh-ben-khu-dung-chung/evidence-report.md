---
schema_version: 2
feature_slug: thanh-ben-khu-dung-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 16dcfc79eee9bbae7f59f24740d48539f6ac2950
human_signoff: Phan Le Manh 2026-10-19 — ký Cổng 2 trên S4 round 2 (12/12 eval, 7/7 suite PASS), ghim lại ở 915cf201a sau gộp onehub (repin-20261019T144005Z-34260). Ngoài-2, 4, 5, 6, 7 ghi Known limits; Ngoài-3 nâng phạm vi sửa ngay (đã sửa trong PR, AC-11); Ngoài-1, 8 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: thanh-ben-khu-dung-chung

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | judgment | PASS |
| E12 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-thanh-ben-khu-dung-chung-E1-r1
  exit_code: 0
  verifier: config:executors.test.tbk_khung
  verified_at: 2026-10-19T11:59:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-thanh-ben-khu-dung-chung-E2-r1
  exit_code: 0
  verifier: config:executors.test.tbk_panel
  verified_at: 2026-10-19T11:59:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-thanh-ben-khu-dung-chung-E3-r1
  exit_code: 0
  verifier: config:executors.test.tbk_cai_dat
  verified_at: 2026-10-19T11:59:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-thanh-ben-khu-dung-chung-E4-r1
  exit_code: 0
  verifier: config:executors.test.tbk_hoi_thoai_may_tinh
  verified_at: 2026-10-19T11:59:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-thanh-ben-khu-dung-chung-E5-r1
  exit_code: 0
  verifier: config:executors.test.tbk_hoi_thoai_bam
  verified_at: 2026-10-19T11:59:58Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-thanh-ben-khu-dung-chung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbk_hoi_thoai_dien_thoai
  verified_at: 2026-10-19T13:32:32Z
  output: |
    Ran 2 tests across 1 file. [672.00ms]

- eval: E7
  run_id: minted-thanh-ben-khu-dung-chung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tbk_dang_tai
  verified_at: 2026-10-19T13:32:32Z
  output: |
    Ran 1 test across 1 file. [454.00ms]

- eval: E8
  run_id: minted-thanh-ben-khu-dung-chung-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbk_man
  verified_at: 2026-10-19T13:32:32Z
  output: |
    phien-do: xong — mã 0

- eval: E9
  run_id: minted-thanh-ben-khu-dung-chung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbk_man
  verified_at: 2026-10-19T13:32:32Z
  screenshot: evidence/E9-step1.png
  observed: |
    cai-dat-1280.png: thanh bên trái rộng khoảng 224px, viền phải, 4 nhãn nhóm chữ hoa nhỏ xám (KHÔNG GIAN LÀM VIỆC, CON NGƯỜI, KẾT NỐI VÀ DỮ LIỆU, BẢO MẬT); mục "Chung" đang mở tô nền sáng hơn; nội dung trang Chung bên phải không bị cắt.
    hoi-thoai-1280.png: thanh bên trái cùng bề rộng và cùng viền phải; nhãn nhóm chữ hoa nhỏ cùng kiểu (HÔM NAY, TÁC NHÂN CỦA ĐỘI); mục hội thoại đang mở (dòng cuối) tô nền cùng kiểu với "Chung"; cột chat bên phải với ô soạn tin ở đáy.
    cai-dat-375.png: không có thanh dọc; một hàng mục nằm ngang ngay dưới đầu trang (Chung, Tiền tệ, Trường, Giai đoạn thoả thuận, Lịch... cuộn ngang, "Chung" tô nền); không có nhãn nhóm; nội dung trang bên dưới không bị cắt ngang, không tràn ngang.
    hoi-thoai-375.png: không thanh dọc; một hàng hội thoại nằm ngang dưới đầu trang (mục cuối đang chọn tô nền, hàng cuộn ngang); không nhãn nhóm; tiêu đề hội thoại, tin nhắn "Do thanh ben khu 1" và ô soạn tin ở đáy màn đều đủ, không bị cắt.
    hoi-thoai-375-dai.png: cùng bố cục 375 với hàng ngang dưới đầu trang; vùng tin phía trên trống (script chèn khối đệm cao 3000px làm vùng tin cuộn, 3140/523); ô soạn tin "Gửi một tin" vẫn nằm sát đáy màn (đáy ô soạn 758px, màn 812px), không bị đẩy ra khỏi màn, không tràn dọc. Khớp Expected.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-thanh-ben-khu-dung-chung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tbk_quet
  verified_at: 2026-10-19T13:32:32Z
  output: |
    DUNG AC-9: 492 tep, 0 vo thanh ben tu dung, 2/2 tep nhap AreaSidebar

- eval: E11
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba judge cung xac nhan muc «Thanh bên khu và thẻ con» trong design.md (dong 111-132) neu du nam y, bang «Dấu hiệu vẽ tay» (dong 69) va muc «Thanh bên» cua settings.md (dong 32-33) deu tro AreaSidebar.
  votes:
    - domain-correctness: PASS — nam y deu co trong design.md dong 111-132, ca bang «Dấu hiệu vẽ tay» dong 69 va settings.md dong 32-33 tro AreaSidebar.
    - operational-feasibility: PASS — du bon y (thanh ben khu, the con, gioi han, vi du that); dong 69 va settings.md dong 32 tro AreaSidebar.
    - spec-alignment: PASS — du nam y, co cau hoi chon «doi noi hay doi phan», vi du that moi ben; settings.md dong 30-33 tro AreaSidebar va AreaSidebarItem.
  human_override:  # chi nguoi ghi

- eval: E12
  run_id: minted-thanh-ben-khu-dung-chung-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tbk_man
  verified_at: 2026-10-19T13:32:32Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bunx turbo run lint --force
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bun run lint:slop
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

- cmd: bunx turbo run build --force
  run_id: minted-thanh-ben-khu-dung-chung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-19T13:32:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-ben-khu.dom.tsx -t 'tbk-hoi-thoai-dien-thoai|tbk-hoi-thoai-ngan': bo qua baseline: tep apps/app/test/thanh-ben-khu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/thanh-ben-khu.dom.tsx -t tbk-dang-tai: bo qua baseline: tep apps/app/test/thanh-ben-khu.dom.tsx co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/thanh-ben-khu-dung-chung/rang/quet-vo-tay.mjs: bo qua baseline: tep _acceptance/thanh-ben-khu-dung-chung/rang/quet-vo-tay.mjs co o cay dang kiem nhung chua co o merge-base 1fce5d49cd8d5875a3b96171573eb7a9b22dacdb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS 11/11 — 7 muc ngoai hop dong chuyen Cong 2 (trong do Ngoai-2: chat dai tren dien thoai khong cuon, da thanh AC-11).
Round 2: E6, E7, E8, E9, E10 va E12 (AC-11 moi) chay lai tren f2acec0f4b09fcc641abd830fe79372685f566ab, E1-E5 carry-forward tu round 1; PASS.

### Re-pin lần 1 — 2026-10-19, do gộp onehub (#490, không chạm vật của hồ sơ) sau S4 round 2
run_id: repin-20261019T144005Z-34260
sha: 915cf201adc2f6391534a67163b213ceddc40227 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9, E11 · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-19, do gộp onehub lần cuối (#410, #493) sau chữ ký; bàn đo thôi chép ảnh vào hồ sơ đã ký
run_id: repin-20261019T154621Z-69918
sha: 16dcfc79eee9bbae7f59f24740d48539f6ac2950 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E9, E11 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
