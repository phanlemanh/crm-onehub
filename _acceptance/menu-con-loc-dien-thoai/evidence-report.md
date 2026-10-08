---
schema_version: 2
feature_slug: menu-con-loc-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 483fbb30a55f10f4e034552fad01d2f84a9c5db6
human_signoff: Phan Le Manh 2026-10-08
---

# Evidence Report: menu-con-loc-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-menu-con-loc-dien-thoai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:41:33Z
  screenshot: evidence/E1-step1.png
  observed: |
    giai-doan-375.png (375 wide): Thoả thuận page, filter «Lọc» menu open with Phụ trách / Giai đoạn / Hạn chót. The Giai đoạn submenu is open and sits on the right edge, fully inside the frame (about x159..367), listing Demo booked 5, Qualified to buy 8, Decision maker in 2, Contract sent 5, Closed won 0, Closed lost 3, Unqualified 4. Not clipped, no horizontal overflow. Matches expected.
    cham-375.png: same submenu after tapping Demo booked. The filter badge shows «Lọc (1)», a «Bỏ chọn» row and a check mark appear on Demo booked 5, and the table beneath is filtered to 5 rows, all Demo booked, footer "5 thoả thuận · 231.000 US$". Matches the stage=DEMO_BOOKED assertion.
    cong-ty-375.png: Cá nhân page, filter menu open, Công ty submenu at right with search box holding «Att» and two checkbox items, Attio 3 and Nhà Đất Thủ Đức 2. The submenu and search box are inside the 375 frame (right edge about 367). Matches expected.
    doi-chung-1440.png: 1440 desktop view, Lọc menu at top right, Giai đoạn submenu opens to the left of the menu (data-side left), listing the 7 stages with counts. It is inside the viewport and overlays the table without clipping. Matches expected.
    hang-loat-768.png: 768 wide, 1 row selected («Đã chọn 1 dòng», Wise — expansion ticked), «Hành động» menu open with Giao người phụ trách / Đổi giai đoạn / Lưu trữ. The Giao người phụ trách submenu opens to the left, listing Ada Okafor, Marcus Lindqvist and Priya Raman, fully inside 0..768. Matches expected.
    No frame contradicts the Expected values.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-menu-con-loc-dien-thoai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:41:33Z
  screenshot: evidence/E2-step1.png
  observed: |
    E2-step1.png và E2-step2.png đều là bản sao của cong-ty-375.png, ảnh chụp mới ở lần chạy này (09:42), viewport 375 px. Trong ảnh có trang "Cá nhân", panel "Lọc" đang mở, và menu cha liệt kê Phụ trách, Công ty, Chức danh, Hoạt động. Menu con "Công ty" mở ra bên phải, không bị cắt ở mép màn. Ô tìm trong menu con hiện chữ "Att". Hai mục công ty nhìn rõ bên dưới: "Attio" (3) và "Nhà Đất Thủ Đức" (2). Ô tìm và các mục nằm trọn trong khung 375 px, nên khớp Expected (ô tìm và ít nhất một mục công ty thấy rõ).
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-menu-con-loc-dien-thoai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:41:33Z
  screenshot: evidence/E3-step2.png
  observed: |
    E3-step2.png and doi-chung-1440.png are the same file (142878 bytes). It is a 1440 px dark-theme screenshot of the Thoả thuận page. The Lọc menu is open on the right and lists Phụ trách, Giai đoạn (highlighted) and Hạn chốt. The Giai đoạn submenu is open to the LEFT of the parent menu, spanning about x=865 to 1073 and abutting the parent's left edge at about 1073 without covering it. Its rows are Demo booked 5, Qualified to buy 8, Decision maker in 2, Contract sent 5, Closed won 0, Closed lost 3 and Unqualified 4. The whole submenu is inside the viewport. It overlays the table underneath (Giá trị and Phụ trách columns) but not the parent menu. This matches the expected image, "menu con nam canh menu cha (phia Radix chon), khong de len" (the submenu sits beside the parent menu, on Radix's chosen side, and does not overlap it). The log numbers match the picture: box left 865, deviation 0.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-menu-con-loc-dien-thoai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_do_man
  verified_at: 2026-10-08T02:41:33Z
  screenshot: evidence/E4-step1.png
  observed: |
    Mo that file E4-step1.png (= copy cua hang-loat-768.png vua do luc 09:42; E4-step2.png la ban sao cung noi dung). Frame rong 768 px: trang "Thoa thuan", dong "Da chon 1 dong", dong "Wise — expansion" co o tich xanh, nut "Hanh dong" dang mo. Menu cha co "Giao nguoi phu trach" (dang sang, co mui ten >), "Doi giai doan", "Luu tru". Menu con cua "Giao nguoi phu trach" mo sang TRAI menu cha voi 3 muc: Ada Okafor, Marcus Lindqvist, Priya Raman; hop menu con nam tron trong khung (khoang x 351-460), khong tran mep phai/trai, khong de len menu cha. Khop Expected: left >= 0, right <= 768, khong tran.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-menu-con-loc-dien-thoai-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mcl_lop
  verified_at: 2026-10-08T02:41:33Z
  output: |
    Ran 3 tests across 1 file. [817.00ms]

- eval: E6
  run_id: minted-menu-con-loc-dien-thoai-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.mcl_hoi_quy
  verified_at: 2026-10-08T02:41:33Z
  output: |
    Ran 9 tests across 1 file. [3.42s]

- eval: E7
  run_id: minted-menu-con-loc-dien-thoai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.mcl_san_thiet_ke
  verified_at: 2026-10-08T02:41:33Z
  output: |
    (đuôi output rỗng — hai lệnh nối nhau đều hoàn tất)

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bunx turbo run lint --force
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bun run lint:slop
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

- cmd: bunx turbo run build --force
  run_id: minted-menu-con-loc-dien-thoai-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T02:41:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase) — là regression-guard có chủ ý, cần xác nhận hoặc viết lại để assert hành vi mới:

- E6 (executor mcl_hoi_quy): lệnh `git diff --quiet $(git merge-base HEAD origin/onehub) -- packages/ui/test/data-table-loc-ro.dom.tsx packages/ui/test/data-table-locale.spec.tsx packages/ui/test/render-diff.spec.tsx packages/ui/test/lai-ra-man.spec.tsx apps/app/test/bang-crm-loc-ro.dom.tsx && cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-loc-ro.dom.tsx ./test/data-table-locale.spec.tsx ./test/render-diff.spec.tsx ./test/lai-ra-man.spec.tsx && cd ../../apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/bang-crm-loc-ro.dom.tsx` — baseline green. Đây là chốt không hồi quy theo AC-6 (năm tệp kiểm cũ giữ nguyên, không sửa kỳ vọng), không chứng minh phần sửa.

## Variance

none — every multi-run eval is uniform

## Judge

Không có eval judgment trong hợp đồng này — không có panel để đề xuất, không có mục chờ human_override.

## Iterations

Round 1: E2 không đạt — cảnh ô tìm Công ty lọc hết nên menu con rỗng, ảnh không có mục nào; răng khong-cham-noi-goi cũng chưa bắt thẻ nhiều dòng. Returned to implementation (sửa ở 483fbb30a).
Round 2: E1, E2, E3, E4, E5, E6, E7 đều đạt; bảy lệnh suite đạt. Verdict PASS, chờ người ký ở Cổng Bằng chứng.
