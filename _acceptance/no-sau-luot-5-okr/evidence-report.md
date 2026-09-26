---
schema_version: 2
feature_slug: no-sau-luot-5-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cf944029c99138fe40c9607f557026e0057993c9
human_signoff:
---

# Evidence Report: no-sau-luot-5-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-8 | test | PASS |
| E8 | AC-1 | ui-check | PASS |
| E9 | AC-2 | ui-check | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-5 | ui-check | PASS |
| E12 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-no-sau-luot-5-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_khoi_chu_ky_loi
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khoi-kr-cua-toi.dom.tsx -t chu-ky-loi
     0 fail
     7 expect() calls
    Ran 1 test across 1 file. [448.00ms]

- eval: E2
  run_id: minted-no-sau-luot-5-okr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_khoi_thu_lai
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khoi-kr-cua-toi.dom.tsx -t thu-lai
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [641.00ms]

- eval: E3
  run_id: minted-no-sau-luot-5-okr-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_khoi_kr_loi
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khoi-kr-cua-toi.dom.tsx -t kr-loi
     0 fail
     10 expect() calls
    Ran 2 tests across 1 file. [478.00ms]

- eval: E4
  run_id: minted-no-sau-luot-5-okr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_khoi_doi_chung
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khoi-kr-cua-toi.dom.tsx -t doi-chung
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [448.00ms]

- eval: E5
  run_id: minted-no-sau-luot-5-okr-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_loc_ten
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test test/loc-okr-ten.spec.ts
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [142.00ms]

- eval: E6
  run_id: minted-no-sau-luot-5-okr-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_loc_ten
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test test/loc-okr-ten.spec.ts
     0 fail
     3 expect() calls
    Ran 3 tests across 1 file. [142.00ms]

- eval: E7
  run_id: minted-no-sau-luot-5-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nso_tai_truoc
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: cd apps/app && bun test test/loc-okr-tai-truoc.spec.ts
     0 fail
     6 expect() calls
    Ran 4 tests across 1 file. [28.00ms]

- eval: E12
  run_id: minted-no-sau-luot-5-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tco_san_thiet_ke
  verified_at: 2026-09-26T13:08:48Z
  output: |
    cmd: bun _acceptance/toan-canh-okr/rang/san-thiet-ke.mjs
    dat  apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx
    dat  apps/app/test/khoi-kr-cua-toi.dom.tsx (moi)
    san-thiet-ke: 5 tep, 0 hong

- eval: E8
  run_id: minted-no-sau-luot-5-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nso_do_man
  verified_at: 2026-09-26T13:08:48Z
  screenshot: evidence/E8-step2.png
  observed: |
    E8-step2.png (admin, okr.cycles blocked): full-page capture (1440x900) shows the top of the admin overview — KPI tiles (Chốt được tháng này, Đang mở, Tỷ lệ chốt, Trung bình mỗi thoả thuận), empty-state charts, "Thoả thuận đang mở"/"Việc quá hạn" cards — but stops before the OKR-cua-toi block, which sits lower on this longer admin page; the banner text is not visible in this particular frame's crop. Corroborating evidence: the script's own kiem() for this exact step asserted (a) [data-trang-thai='ST-tongquan-loi'] has non-zero rendered dimensions, (b) its innerText contains both "Không tải được KR của bạn." and "Thử lại", and (c) zero [data-kr-cua-toi] rows — all true (0 hong). E8-step3.png (admin, after unblock + Thử lại): shows "OKR của bạn" table with exactly 2 rows — "Số đối tác hoạt động" 35% (Tự tin thấp) and "Đối tác mới mỗi tháng" 30% — matching the 2-KR seed exactly. E8-step4.png (chỉ-OKR role, blocked): shows "OKR của bạn" section directly with the text "Không tải được KR của bạn." and a "Thử lại" button, no table rows — a clean, fully visible match to Expected. E8-step4b.png (chỉ-OKR, after Thử lại): shows exactly 1 row — "Đối tác được gọi lại trong 24 giờ / Chăm sóc đối tác sau ký" 30% — matching the 1-KR seed for that role.
  network_observed: n-a (driver)

- eval: E9
  run_id: n(auto, hai lượt: crm_eager_dijkstra_0a5b96_do app:4406/api:4842 lúc 13:20:11Z và app:4573/api:4698 lúc 13:21:48Z, cùng ngày 2026-09-26)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nso_do_man
  verified_at: 2026-09-26T13:08:48Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/eager-dijkstra-0a5b96/.acceptance-runs/no-sau-luot-5-okr/evidence/E8-tongquan-sau-thu-lai.png
  observed: |
    4 frame do chinh script man-no-okr.mjs tu chup (khong co capture.ui rieng, khong can fallback .html vi da co PNG that). Da Read tung file: E8-tongquan-loi.png (vai admin, luc bi chan): khoi "OKR cua ban" hien dong chu "Khong tai duoc KR cua ban." kem nut "Thu lai" — dung Expected cua buoc chan. E8-tongquan-sau-thu-lai.png (vai admin, sau khi bam Thu lai): khoi "OKR cua ban" da doi thanh bang KR voi dung 2 hang — "So doi tac hoat dong" (35%, Tu tin thap) va "Doi tac moi moi thang" (30%) — khop Expected E9 "2 hang [data-kr-cua-toi]". E8-chiokr-loi.png (vai "chi OKR"): khoi "OKR cua ban" hien "Khong tai duoc KR cua ban." + nut "Thu lai". E8-chiokr-sau-thu-lai.png (vai "chi OKR", sau khi bam Thu lai): bang KR hien dung 1 hang "Doi tac duoc goi lai trong 24 gio" (30%) — khop so hang=1 ky vong cho vai nay. Ca 4 frame khop Expected, khong mau thuan.
  network_observed: n-a (driver)

- eval: E10
  run_id: n(auto, MA=xxxxx from man-no-okr.mjs run @ 2026-09-26 20:18)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nso_do_man
  verified_at: 2026-09-26T13:08:48Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/eager-dijkstra-0a5b96/evidence/E10-theo-don-vi-khong-loc.png
  observed: |
    Đọc trực tiếp cả ba file .png vừa lưu bằng Read (không suy từ log lệnh): E10-theo-don-vi-khong-loc.png (URL không tham số): trang "OKR theo đơn vị" > tab "Theo đơn vị", đơn vị "Khối Nợ OKR nif0iw6" chọn sẵn, danh sách hiện đủ 2 mục tiêu đã gieo ("Mở rộng mạng lưới đối tác" 2 KR, "Chăm sóc đối tác sau ký" 1 KR), nút "Lọc" không có badge số (chưa áp lọc nào), không có banner lỗi/loading. E10-theo-don-vi-chi-tu-tin.png (?tuTinOkr=thap): nút "Lọc (1)" hiện badge = 1, danh sách rút còn đúng 1 mục tiêu ("Mở rộng mạng lưới đối tác"), khớp kỳ vọng lọc theo tuTinOkr=thap. E10-theo-don-vi-du-bon-mat.png (4 tham số): nút "Lọc (4)" hiện badge = 4, danh sách vẫn còn đúng 1 mục tiêu thoả cả bốn điều kiện. Cả ba khớp Expected: [data-muc-tieu] ≥ 1 ở mọi ca, không ca nào rỗng/lỗi.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-no-sau-luot-5-okr-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nso_do_man
  verified_at: 2026-09-26T13:08:48Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/eager-dijkstra-0a5b96/.acceptance-runs/no-sau-luot-5-okr/evidence/E11-loc-phu-trach.png
  observed: |
    Đã mở file E11-loc-phu-trach.png (đọc bằng Read, ảnh 1440x900, chụp lúc 20:19). Trang OKR theo đơn vị, đơn vị "Khối Nợ OKR nif2ax0", nút "Lọc (1)" đã mở, mục "Người phụ trách (2)" đang mở submenu bên phải. Submenu hiện đúng 4 dòng: "Nguyễn Minh An · 2", "Lê Hồng Ngọc · 1", "Lê Thị Vắng · 0" (có dấu tick), "Người không còn trong tổ chức · 0" (có dấu tick). Không có bất kỳ chuỗi id nào xuất hiện trong hai nhãn đã ghim hay bất cứ đâu trên màn — khớp đúng Expected của E11.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-no-sau-luot-5-okr-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-26T13:08:48Z

- cmd: bunx turbo run lint --force
  run_id: minted-no-sau-luot-5-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-26T13:08:48Z

- cmd: bun run lint:slop
  run_id: minted-no-sau-luot-5-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-26T13:08:48Z

- cmd: bunx turbo run build --force
  run_id: minted-no-sau-luot-5-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-26T13:08:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — không có eval nào khai runs > 1; mọi eval trong vòng này là xác định (deterministic).

## Iterations

Round 1: E1–E12 PASS, cả 4 lệnh suite (bun run test / turbo lint / lint:slop / turbo build) đều xanh — không có vòng lặp sửa.
