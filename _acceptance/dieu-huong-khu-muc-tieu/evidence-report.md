---
schema_version: 2
feature_slug: dieu-huong-khu-muc-tieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dbcb535544cd55d5114ed075cd3abe663d1a2a6a
human_signoff: manh 2026-10-15 — ký Cổng 2 trên verdict PASS (S4 vòng 2, wf_0412087d-785, engine feature-loop 2.30.0). Ngoài-1, 3–16 ghi Known limits; Ngoài-2, 17, 18 chấp nhận, không sửa; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: dieu-huong-khu-muc-tieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-10 | script | PASS (carry-forward từ round 1) |
| E13 | AC-11 | judgment | PASS (đề xuất của hội đồng, chờ người chốt ở Cổng 2) |
| E15 | AC-5 | script | PASS |
| E16 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dieu-huong-khu-muc-tieu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_tieu_de
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-tieu-de: hai chieu dung (1 dot bien, worktree tam)

- eval: E2
  run_id: minted-dieu-huong-khu-muc-tieu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T04:25:24Z
  screenshot: evidence/E2-step1.png
  observed: |
    Da mo bang Read du 16 anh. 1440: o 6 trang tieu de "Muc tieu" ben trai, nut "+ Them muc tieu" mau xanh nam goc phai tren cung hang voi tieu de (y~89, cung hang voi bo chon "Nam ke · mau" va nut "...") , nam TREN thanh the (tablist y~175) o ca cua-toi, cap-nhat-tuan, theo-don-vi, toan-canh, suc-khoe, hoi-y; mep phai nut ~1387, giong het nut "+ Thoa thuan moi" tren deals (mep phai ~1387, cung hang tieu de) -> lech 0. Than theo-don-vi chi co cay don vi + tab Danh sach/Cay can chinh/Hop tuan/Loc, khong co nut tao nao trong than. Khong trang nao tran ngang.
    390: moi trang tieu de "Muc tieu" -> dong mo ta -> hang (Nam ke · mau, "...", "+ Them muc tieu") -> thanh the; thu tu giong deals (Thoa thuan -> mo ta -> nut "+ Thoa thuan moi" -> tim kiem), khong tran ngang (hoi-y va suc-khoe co bang/the nhung trong khung, khong day trang).
    khoa-ly-do 1440 va 390: tai khoan vo-duc-anh (VD) o /okr (Quy 4 · mau), nut "+ Them muc tieu" bi lam mo (disabled) va co dong ly do duoi mo ta "Ban chua dan don vi nao nen chua them duoc muc tieu: muc tieu thuoc ve don vi va do truong don vi dat." -> khop dong KHOA. Tat ca khop Expected, khong co mau thuan.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-dieu-huong-khu-muc-tieu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_hanh_dong
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-hanh-dong: hai chieu dung (3 dot bien, worktree tam)

- eval: E4
  run_id: minted-dieu-huong-khu-muc-tieu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_don_dich
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-don-dich: hai chieu dung (3 dot bien, worktree tam)

- eval: E5
  run_id: minted-dieu-huong-khu-muc-tieu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T04:25:24Z

- eval: E6
  run_id: minted-dieu-huong-khu-muc-tieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_menu_soan
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-menu-soan: hai chieu dung (1 dot bien, worktree tam)

- eval: E7
  run_id: minted-dieu-huong-khu-muc-tieu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_khoa_ly_do
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-khoa-ly-do: hai chieu dung (1 dot bien, worktree tam)

- eval: E8
  run_id: minted-dieu-huong-khu-muc-tieu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_giu_don
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-giu-don: hai chieu dung (1 dot bien, worktree tam)

- eval: E9
  run_id: minted-dieu-huong-khu-muc-tieu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_suc_khoe
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-suc-khoe: hai chieu dung (1 dot bien, worktree tam)

- eval: E10
  run_id: minted-dieu-huong-khu-muc-tieu-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_dang_tai
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN dhk-dang-tai: hai chieu dung (1 dot bien, worktree tam)

- eval: E11
  run_id: minted-dieu-huong-khu-muc-tieu-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_ho_so_da_ky
  verified_at: 2026-10-15T04:25:24Z
  output: |
    KET LUAN: dat

- eval: E12
  run_id: minted-dieu-huong-khu-muc-tieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_proto
  verified_at: 2026-10-15T03:49:56Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-dieu-huong-khu-muc-tieu-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T04:25:24Z

- eval: E16
  run_id: minted-dieu-huong-khu-muc-tieu-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T04:25:24Z

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bun run lint:slop
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T04:25:24Z

### Judgment (đề xuất hội đồng — người chốt ở Cổng 2)

- eval: E13
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Cả ba góc nhìn cùng đề xuất PASS; khuôn đọc được ở hai khổ và dòng lý do nằm ngay dưới tiêu đề.
  required_evidence:
    - (hội đồng không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

Phiếu từng góc nhìn:

- domain-correctness: PASS — Ở 1440 px cả bốn ảnh Mục tiêu và ảnh Thoả thuận đều có tiêu đề bên trái (x≈108), nút chính bên phải (mép x≈1387), dòng phụ ngay dưới tiêu đề và một thanh ngang ở y≈175 (thanh tab với Mục tiêu, thanh công cụ với Thoả thuận). Ở 390 px hai khu xếp cùng thứ tự tiêu đề, dòng phụ, hàng nút, thanh bên dưới. Ảnh khoa-ly-do ở cả hai cỡ cho thấy nút "Thêm mục tiêu" mờ và dòng "Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: …" đọc được ngay dưới tiêu đề, trên thanh tab.
- operational-feasibility: PASS — Ở 1440 px, bốn ảnh đầu trang khu Mục tiêu và ảnh Thoả thuận cùng khung: tên khu và dòng mô tả ở trái, nút chính xanh ở phải cùng toạ độ (khoảng y 89), rồi một thanh điều khiển ngay dưới. Ở 390 px cả hai cùng xếp dọc theo thứ tự tên, mô tả, hàng nút, thanh bên dưới. Ảnh trạng thái khoá có dòng lý do «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu…» nằm ngay dưới tiêu đề và mô tả, đọc rõ ở cả hai cỡ, nút «Thêm mục tiêu» bị làm mờ. Khác biệt còn lại là Mục tiêu có thanh thẻ chuyển tab, bộ chọn kỳ và nút «…», còn Thoả thuận có thanh tìm kiếm và lọc; tôi coi đó là phần nội dung đệm của cùng một khuôn.
- spec-alignment: PASS — Ở 1440 px, cả ba ảnh Mục tiêu (Theo đơn vị, Của tôi, Sức khoẻ) và ảnh Thoả thuận đều có tên khu «Mục tiêu»/«Thoả thuận» ở trái, mô tả ngay dưới, nút chính «Thêm mục tiêu»/«Thoả thuận mới» ở phải, rồi tới thanh thẻ (Mục tiêu) hoặc thanh công cụ (Thoả thuận). Ở 390 px, hai khu cùng xếp tiêu đề, mô tả, nút, rồi thanh bên dưới. Ảnh nút khoá cho thấy «Thêm mục tiêu» mờ đi và dòng «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu…» đọc được ngay dưới tiêu đề và mô tả, ở cả 1440 lẫn 390.

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1).

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline): không có. Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

Baseline khong do: toàn bộ eval máy ghi baseline n-a ở round này vì không đo lại (carried tu round 1).

## Variance

none — mọi eval chạy một lần, xác định (runs 1), không có pass_rate hỗn hợp.

## Iterations

Round 1: E6, E7 và lệnh lint:slop đỏ; verdict REJECT. Theo ghi chú quyết định của vòng, nguyên nhân E6/E7 là đột biến tiêm tại chỗ lọt vào lượt vật-lành khi các lệnh chạy song song; kèm một phát hiện trong hợp đồng ở AC-3 (hanh-dong-khu.tsx). Returned to implementation.
Round 2: chuyển đột biến sang worktree tạm; mọi eval xanh (E12 carry-forward từ round 1, delta không chạm paths của nó); không còn phát hiện trong hợp đồng. Lưu ý: mốc verified_at của round 2 là mốc làm tròn do bước capture không trả thời điểm từng lệnh; run_id khớp bản đồ đã ghi vào run-log.

### Re-pin lần 1 — 2026-10-15, do sửa AC-8 khung xương + thước dhk_man nuốt SAI (DH2 15/10)
run_id: repin-20261015T073627Z-12344
sha: 9b770cdfd17edbd6680a2e8b141f23ac8f7cbf1e · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E2, E13 (E13 không khai paths) · diff chạm vật đo ngoài làn máy: E2 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-15, do gộp onehub eb5ab4269 (#419) — NutHoiKara dời vào hàng hành động
run_id: repin-20261015T111914Z-25015
sha: dbcb535544cd55d5114ed075cd3abe663d1a2a6a · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E2, E13 (E13 không khai paths) · diff chạm vật đo ngoài làn máy: E2 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
