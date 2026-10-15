---
schema_version: 2
feature_slug: dieu-huong-khu-muc-tieu
verdict: REJECT
failed_evals: ["E6","E7"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8df4157039fa53d83245043116ddf3377e597ad1
human_signoff:
---

# Evidence Report: dieu-huong-khu-muc-tieu

Round 1. Hai eval máy đỏ (E6, E7) và lệnh `bun run lint:slop` đỏ không gắn eval nào; còn lại xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-4 | test | FAIL |
| E7 | AC-5 | test | FAIL |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-11 | judgment | PASS (đề xuất hội đồng, chờ người ở Cổng 2) |
| E15 | AC-5 | script | PASS |
| E16 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dieu-huong-khu-muc-tieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_tieu_de
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-tieu-de: hai chieu dung (1 dot bien)

- eval: E2
  run_id: minted-dieu-huong-khu-muc-tieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T03:49:56Z
  screenshot: evidence/E2-step1.png
  observed: |
    Da mo bang Read ca 16 anh. 1440 (dark theme, dang nhap le-hai-dang quan tri, ky 'Nam ke · mau'): cua-toi, cap-nhat-tuan, theo-don-vi, toan-canh, suc-khoe, hoi-y deu co tieu de 'Muc tieu' ben trai va hang nut 'Nam ke · mau' + '...' + 'Them muc tieu' (xanh) ben PHAI cung hang voi tieu de, nam TREN thanh tab (Cua toi / Cap nhat tuan / Theo don vi / Toan canh / Hoi y 3); mep phai nut ~1387 = mep phai bang/the. /deals 1440: nut 'Thoa thuan moi' o cung vi tri goc phai-tren (mep phai ~1387), cung hang tieu de -> khop 'phai 52px = Thoa thuan 52px'. Than theo-don-vi (cay don vi + danh sach) khong co nut tao/nhap/soan nao ngoai header; khong tran ngang o cac trang. 390: moi trang co thu tu tieu de 'Muc tieu' > mo ta > hang (selector ky + '...' + 'Them muc tieu') > tab; /deals 390 cung thu tu tieu de > mo ta > nut 'Thoa thuan moi'; khong thay cuon ngang cua trang (bang suc-khoe tu cuon trong khung rieng). khoa-ly-do 1440/390 (vo-duc-anh, khong dan don vi): nut 'Them muc tieu' xam mo (disabled) trong header, ngay duoi mo ta co dong ly do 'Ban chua dan don vi nao nen chua them duoc muc tieu: muc tieu thuoc ve don vi va do truong don vi dat.' (page-shell-note); anh khoa 1390 nut disabled hien ro, khong the tab Hoi y badge. Moi frame khop Expected, khong mau thuan.
  network_observed: n-a (driver)
  output: |
    Du 16 anh ton tai (dau-trang-{6 the}-{1440,390}.png, dau-trang-deals-1440/390.png, khoa-ly-do-1440/390.png).
    Chieu do (DHK_PHA=nut-giua-than) KHONG chay theo yeu cau steps (steps chi gom lenh chinh); khong khang dinh them.
    Frame da luu (evidence/): 6 the x 2 kkho, deals x 2, khoa-ly-do x 2; them E2-step1.png va E2-output.txt.

- eval: E3
  run_id: minted-dieu-huong-khu-muc-tieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_hanh_dong
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-hanh-dong: hai chieu dung (3 dot bien)

- eval: E4
  run_id: minted-dieu-huong-khu-muc-tieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_don_dich
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-don-dich: hai chieu dung (2 dot bien)

- eval: E5
  run_id: minted-dieu-huong-khu-muc-tieu-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T03:49:56Z
  output: |
    phien-do: xong — mã 0

- eval: E15
  run_id: minted-dieu-huong-khu-muc-tieu-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T03:49:56Z
  output: |
    phien-do: xong — mã 0

- eval: E16
  run_id: minted-dieu-huong-khu-muc-tieu-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dhk_man
  verified_at: 2026-10-15T03:49:56Z
  output: |
    phien-do: xong — mã 0

- eval: E6
  run_id: minted-dieu-huong-khu-muc-tieu-E6-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.dhk_menu_soan
  verified_at: 2026-10-15T03:49:56Z
  output: |
    dhk-menu-soan: 9/11 o dat
    Hai o sai: soanSanSang hoi {cycleId q4, level onehub, divisionId null, departmentId null}, mong phong-ban P2;
    soanMo gui cung bo doi so goc nhu vay.
    SAI dhk-menu-soan: doi chung duong do tren vat lanh khong qua (0 pass, 1 fail).

- eval: E7
  run_id: minted-dieu-huong-khu-muc-tieu-E7-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.test.dhk_khoa_ly_do
  verified_at: 2026-10-15T03:49:56Z
  output: |
    dhk-khoa-ly-do: 7/13 o dat
    Sau o sai cung mot cau: nut them-muc-tieu vang khi canCreate=false, o ca ba nguon dich
    (chon don vi, don vi minh dan, khong dan ai) x hai pha (lap-ke-hoach, dang-chay).
    SAI dhk-khoa-ly-do: doi chung duong do tren vat lanh khong qua (0 pass, 1 fail).

- eval: E8
  run_id: minted-dieu-huong-khu-muc-tieu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_giu_don
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-giu-don: hai chieu dung (1 dot bien)

- eval: E9
  run_id: minted-dieu-huong-khu-muc-tieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_suc_khoe
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-suc-khoe: hai chieu dung (1 dot bien)

- eval: E10
  run_id: minted-dieu-huong-khu-muc-tieu-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dhk_dang_tai
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN dhk-dang-tai: hai chieu dung (1 dot bien)

- eval: E11
  run_id: minted-dieu-huong-khu-muc-tieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_ho_so_da_ky
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN: dat

- eval: E12
  run_id: minted-dieu-huong-khu-muc-tieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dhk_proto
  verified_at: 2026-10-15T03:49:56Z
  output: |
    KET LUAN: dat

- eval: E13
  judged_by: judge panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Ba lens cùng thấy khu Mục tiêu có cùng khuôn đầu trang với Thoả thuận ở cả hai khổ, và dòng lý do nằm ngay dưới tiêu đề. Đây là đề xuất của hội đồng, chưa phải quyết định của người.
  human_override:  # chi nguoi ghi

### Hội đồng E13 (đề xuất PASS — chữ quyết ở người, human_override để TRỐNG)

- domain-correctness: PASS — Ở 1440 px, cả ba ảnh Mục tiêu (Theo đơn vị, Của tôi, Sức khoẻ) và ảnh Thoả thuận đều có tên khu cỡ lớn bên trái, nút chính xanh lục ở mép phải cùng hàng tiêu đề, dòng mô tả bên dưới và một thanh ngang ngay sau đó (thanh thẻ ở Mục tiêu, thanh tìm/lọc ở Thoả thuận). Ở 390 px, hai bên cùng xếp dọc: tiêu đề, mô tả, nút chính, rồi thanh bên dưới. Ảnh khoá cho thấy nút «Thêm mục tiêu» mờ đi và dòng chữ «Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu…» nằm ngay dưới tiêu đề và mô tả, đọc được ở cả hai cỡ.
- operational-feasibility: PASS — Ở 1440 px và 390 px, cả bốn màn khu Mục tiêu đều có cùng khuôn đầu trang với Thoả thuận: tên khu và phụ đề bên trái, nút chính xanh bên phải (ở 390 px xếp dọc, nút nằm dưới phụ đề), thanh thẻ hoặc thanh công cụ ngay dưới. Ảnh khoá cho thấy dòng lý do đọc được ngay dưới tiêu đề và phụ đề ở cả hai độ rộng, nút chính bị mờ. Có hai lệch nhỏ không đổi kết luận: Thoả thuận có thanh tìm kiếm và lọc thay cho thanh thẻ, và ở 390 px nút chính của Thoả thuận nằm riêng một hàng.
- spec-alignment: PASS — Ở cả 1440 và 390, ba ảnh khu Mục tiêu (Theo đơn vị, Của tôi, Sức khoẻ) có cùng bố cục với Thoả thuận: tên khu cỡ lớn bên trái, dòng mô tả dưới tên, nút chính xanh bên phải ở 1440 và dưới dòng mô tả ở 390 như Thoả thuận, rồi đến thanh thẻ/thanh công cụ. Ảnh khoá có nút "Thêm mục tiêu" bị mờ và dòng "Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu…" nằm ngay dưới mô tả, đọc rõ ở cả hai độ rộng.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

- cmd: bun run lint:slop
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bun_run_lint_slop-r1
  exit_code: 1
  verified_at: 2026-10-15T03:49:56Z
  output: |
    Lệnh không gắn eval nào và ĐỎ: 0 cảnh báo, 8 lỗi anti-slop trong apps/app/test/okr-dau-trang-khu.dom.tsx
    (no-unknown-parameters ở dòng 1006; no-runtime-typeof ở các dòng 1007, 1008, 1010 và vài dòng khác).

- cmd: bunx turbo run build --force
  run_id: minted-dieu-huong-khu-muc-tieu-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-15T03:49:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-tieu-de: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-hanh-dong: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-don-dich: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-menu-soan: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-khoa-ly-do: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-giu-don: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-suc-khoe: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs dhk-dang-tai: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/hai-chieu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/ho-so-da-ky.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/dieu-huong-khu-muc-tieu/rang/proto-khu.mjs: bo qua baseline: tep _acceptance/dieu-huong-khu-muc-tieu/rang/proto-khu.mjs co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6, E7 failed — E6 (menu soạn): truy vấn okr.soanSanSang và soanMo ở dòng Của tôi gửi đơn vị gốc (onehub, không phòng ban) thay vì đơn vị đích P2 do hàm giải E4 tính; E7 (khoá lý do): nút «Thêm mục tiêu» vắng mặt khi canCreate=false ở 6/12 ô, thay vì hiện xám kèm dòng lý do. Ngoài ra lệnh lint:slop đỏ (8 lỗi trong tệp test mới) và có 1 lỗi trong hợp đồng (AC-3, thẻ Hỏi ý tạo nhầm chu kỳ) cùng 13 lỗi ngoài hợp đồng ở review-findings.md. Returned to implementation.
