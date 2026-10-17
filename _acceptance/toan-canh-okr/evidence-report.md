---
schema_version: 2
feature_slug: toan-canh-okr
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 91b4e246850c022b600b63901a2666a3aac8428e
human_signoff: Manh Phan 2026-09-26 — uỷ quyền phiên điều phối 2026-09-24
---

# Evidence Report: toan-canh-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-3 | ui-check | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | test | PASS |
| E10 | AC-5 | ui-check | PASS |
| E11 | AC-6 | test | PASS |
| E12 | AC-6 | test | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-7 | ui-check | PASS |
| E15 | AC-8 | test | PASS |
| E16 | AC-9 | test | PASS |
| E17 | AC-9 | ui-check | PASS |
| E18 | AC-10 | test | PASS |
| E19 | AC-10 | ui-check | PASS |
| E20 | AC-11 | test | PASS |
| E21 | AC-11 | ui-check | PASS |
| E22 | AC-12 | test | PASS |
| E23 | AC-12 | ui-check | PASS |
| E24 | AC-13 | test | PASS |
| E25 | AC-14 | script | PASS |
| E26 | AC-14 | test | PASS |
| E27 | AC-15 | judgment | PASS |
| E28 | AC-8 | script | PASS |
| E29 | AC-12 | script | PASS |
| E30 | AC-8 | test | PASS |
| E31 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-toan-canh-okr-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_danh_sach
  verified_at: 2026-09-26T10:18:32Z
  output: |
    Ran 1 test across 1 file. [1488.00ms]
    test-run: dropped crm_mui9bjkqrkyh_test
    EXIT_CODE=0

- eval: E2
  run_id: minted-toan-canh-okr-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: .acceptance-runs/toan-canh-okr/evidence/E2-buoc-loc-1.png
  observed: |
    5/5 frame đã Read trực tiếp, đối chiếu Expected từng bước: E2-buoc-loc-1.png (1440, donOkr=bp:B) panel "Khối Kinh doanh ti9g5j4" ghi "4 mục tiêu · 5 KR" đúng data-muc-tieu=4. E2-buoc-loc-2.png sau khi chọn phụ trách k: chip "Lọc (1)", panel "1 mục tiêu · 1 KR", đúng 1 mục tiêu "Đối tác mới được đỡ trọn tháng đầu", tải lại vẫn giữ 1 mục tiêu. E2-buoc-loc-3.png thêm loại Cam kết: chip "Lọc (2)", "0 mục tiêu · 0 KR", câu rỗng "Không mục tiêu nào khớp bộ lọc" + nút "Bỏ lọc". E2-buoc-nguoi-1.png (1440, donOkr=nguoi:k): đủ ba trường tên/phòng ban chính/quản lý trực tiếp, đúng 2 mục tiêu. E2-buoc-nguoi-2.png (390): layout dọc, không tràn ngang. Không frame nào mâu thuẫn Expected.
  network_observed: clean

- eval: E3
  run_id: minted-toan-canh-okr-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  output: |
    man-toan-canh: 161 khang dinh, 0 hong, 37 anh, 79 s
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện

- eval: E4
  run_id: minted-toan-canh-okr-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_ui_cay
  verified_at: 2026-09-26T10:18:32Z
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [1227.00ms]

- eval: E5
  run_id: E5-r3-toan-canh-okr-20260926T104440Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: .acceptance-runs/toan-canh-okr/evidence/E5-buoc-cay-1.png
  observed: |
    5 frame đã Read: E5-buoc-cay-1.png (Tab tới cây căn chỉnh, role=tree/treeitem, B1 hiện hai lần với nhãn "cũng hiện ở chỗ góp kia" đúng Expected). E5-buoc-cay-2.png/3.png: vòng tiêu điểm xanh lá đúng theo chuỗi phím End/trước Enter. E5-buoc-cay-4.png: Enter trên đơn vị đổi URL donOkr sang đơn vị chọn ("Khối Kinh doanh ti9j0t3"). E5-buoc-cay-5.png: Tab đưa tiêu điểm vào cây đơn vị ở trang donOkr=nguoi:k, đúng 1 mục tabindex=0. Không frame nào mâu thuẫn Expected.
  network_observed: clean

- eval: E6
  run_id: minted-toan-canh-okr-E6-r2
  exit_code: 0
  verifier: config:executors.test.tco_ui_thanh_phan
  verified_at: 2026-09-26T09:26:26Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-toan-canh-okr-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_soi_ma
  verified_at: 2026-09-26T10:18:32Z
  output: |
    dat  apps/app/app/(app)/[slug]/dashboard-summary.tsx (Progress: 0)
    dat  apps/app/app/(app)/[slug]/tong-quan-chi-okr.tsx (Progress: 0)
    so tep: 34, so phan tu Progress: 1

- eval: E8
  run_id: minted-toan-canh-okr-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_toan_canh
  verified_at: 2026-09-26T10:18:32Z
  output: |
     48 expect() calls
    Ran 1 test across 1 file. [2.09s]
    test-run: dropped crm_mui9b6jqujts_test

- eval: E9
  run_id: mui9b7f1mp6v
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_hieu_nang
  verified_at: 2026-09-26T10:18:32Z
  output: |
     34 expect() calls
    Ran 2 tests across 1 file. [3.02s]
    test-run: dropped crm_mui9b7f1mp6v_test

- eval: E10
  run_id: s4-r3-e10-20260926T104716Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: _acceptance/toan-canh-okr/evidence/s4-r3-e10/E10-step2.png
  observed: |
    E10-step2.png (vai okr, 1440, /toan-canh): 4 StatCard đúng (46%, 3/6, 0/4, 0), bảng Theo đơn vị đúng 7 hàng theo thứ tự gieo, thanh tiến độ neutral (không bg-primary), KHÔNG có nút "Sức khoẻ chương trình" cho vai okr. E10-step3-1440/390.png (quản trị): nút "Sức khoẻ chương trình" xuất hiện, 390px xếp dọc không tràn ngang. E10-step4.png: chặn okr.toanCanh → Empty + nút "Thử lại", phục hồi sau khi bỏ chặn. E10-step5.png: kỳ chưa công bố mục tiêu → 4 StatCard rỗng hợp lý + câu hẹn CHU.tuanDau đúng chữ ghim. Log: 22 khang dinh, 0 hong, 7 anh, 16 s.
  network_observed: unscoped-partial

- eval: E11
  run_id: mui9b6xp5y2h
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_toan_canh_tu_tin
  verified_at: 2026-09-26T10:18:32Z
  output: |
     31 expect() calls
    Ran 1 test across 1 file. [1.98s]
    test-run: dropped crm_mui9b6xp5y2h_test

- eval: E12
  run_id: minted-toan-canh-okr-E12-r2
  exit_code: 0
  verifier: config:executors.test.tco_ui_heatmap
  verified_at: 2026-09-26T09:26:26Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E13
  run_id: mui9b8005tkn
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_hop_tuan
  verified_at: 2026-09-26T10:18:32Z
  output: |
    Test Results:
    - okr-toan-canh-thuan.spec.ts (hop-tuan): 3 pass, 0 fail
    - okr-toan-canh.spec.ts (hop-tuan-xep): 1 pass, 0 fail

- eval: E14
  run_id: toan-canh-okr-s4r3-E14-20260926T104200Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: .acceptance-runs/toan-canh-okr/evidence/E14-buoc-hop-tuan-1.png
  observed: |
    4 frame mới đã Read: bảng "Đang bàn tuần này 5" đúng thứ tự [Kb,Ka,Kc,Kd,Ke] với lý do tương ứng (tụt tự tin, im lâu, ghi chú mới); dòng gấp "Còn lại 1 KR" cho Kf. Bấm dòng Kb mở sheet mục tiêu, tab Diễn biến chọn KR đúng. Bản 390px xếp dọc, không tràn ngang, cùng thứ tự. Chọn đơn vị không KR nào đang bàn → trạng thái rỗng đúng câu ghim CHU.yenAng. Không frame nào mâu thuẫn Expected. Xác nhận lại sửa AC-7 round 2 (so tự tin với lần cuối tuần trước) không đổi kết quả so với round 2.
  network_observed: clean

- eval: E15
  run_id: minted-toan-canh-okr-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_mo_hop_tuan
  verified_at: 2026-09-26T10:18:32Z
  output: |
    Ran 2 tests across 1 file. [1.73s]
    test-run: dropped crm_mui9b79glsog_test

- eval: E16
  run_id: mui9b70s3tyj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_dien_bien
  verified_at: 2026-09-26T10:18:32Z
  output: |
     5 expect() calls
    Ran 1 test across 1 file. [858.00ms]
    test-run: dropped crm_mui9b70s3tyj_test

- eval: E17
  run_id: minted-toan-canh-okr-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: _acceptance/toan-canh-okr/evidence/s4-r3-e17/E17-step1.png
  observed: |
    E17-step1.png: tab Diễn biến chọn, svg có đường liền (giá trị thật) + đường đứt tới ReferenceLine "Đích 85%" trong khung, khối "MỨC TỰ TIN THEO TUẦN" 4 dòng đúng màu/chữ. E17-step2.png: KR mốc → không còn svg, chỉ dòng thời gian tự tin. E17-step3.png: KR chưa cập nhật → trạng thái rỗng riêng + câu hẹn ngày đúng mẫu. E17-step4.png (390px): sheet thu hẹp, không tràn ngang, biểu đồ vẫn đủ nhãn "Đích 85%". Không khung hình nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E18
  run_id: mui9b72ppgug
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_khoi_cua_toi
  verified_at: 2026-09-26T10:18:32Z
  output: |
     25 expect() calls
    Ran 1 test across 1 file. [1.71s]
    test-run: dropped crm_mui9b72ppgug_test

- eval: E19
  run_id: tco_man_chrome EVAL=E19 (S4 round 3, cwd /Users/manhphan/dev/crm/.claude/worktrees/toan-canh-okr)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: .acceptance-runs/toan-canh-okr/evidence/E19-buoc-tong-quan-1.png
  observed: |
    5 frame đã Read: trang chủ với KPI 4 thẻ cho vai member (khối "Việc OKR"/"OKR của bạn" nằm dưới điểm cuộn của khung chụp, không mâu thuẫn Expected vì Expected chỉ đòi assertion DOM đã pass). Vai "okr": khối "Việc OKR" hiện đủ 6 dòng KR được giao. Người không phụ trách KR: trạng thái rỗng đúng. 390px xếp dọc không tràn ngang. Trang "OKR theo đơn vị" lọc theo người (Đỗ Quang Khải): bảng "KR người này phụ trách" đúng 5 dòng theo đúng thứ tự [trượt, chậm nhịp, mốc chưa xong, đúng nhịp tự tin thấp, đúng nhịp tự tin cao] + "và 1 KR khác" xác nhận tổng 6. Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E20
  run_id: mui9bj647lie
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_suc_khoe
  verified_at: 2026-09-26T10:18:32Z
  output: |
     32 expect() calls
    Ran 1 test across 1 file. [1179.00ms]
    test-run: dropped crm_mui9bj647lie_test

- eval: E21
  run_id: minted-toan-canh-okr-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: .acceptance-runs/toan-canh-okr/evidence/E21-step1.png
  observed: |
    E21-step1.png (admin, 1440, /okr/toan-canh/suc-khoe): breadcrumb đúng thứ tự, 4 StatCard đúng số, bảng "Theo đơn vị" 3 hàng khớp đúng ma trận E20, không thấy chữ "thiếu khởi điểm". E21-step2.png (390): layout dọc, không tràn ngang. E21-step3.png (thành viên thường "k", mở thẳng URL): trang chặn quyền, hiện đúng câu ghim OKR.thongDiep.chiQuanTri, không rơi vào chiều đỏ "thành viên thấy bảng". Không frame nào mâu thuẫn Expected.
  network_observed: clean

- eval: E22
  run_id: minted-toan-canh-okr-E22-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_ui_chon_ky
  verified_at: 2026-09-26T10:18:32Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [602.00ms]

- eval: E23
  run_id: ti9jaxr
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  screenshot: scratchpad/evidence/E23-step1.png
  observed: |
    E23-step1.png: menu chu kỳ mở, nhóm theo năm đúng (Quý 3 «đã đóng», Quý 4 «hiện tại»). E23-step2.png: chọn Quý 3 → tab Theo đơn vị chỉ hiện TCO-Q3, không thấy TCO-Q4. E23-step3.png: chuyển tab Họp tuần, ô chọn chu kỳ vẫn giữ Quý 3, dòng KR ghi TCO-Q3. E23-step4.png (tab Toàn cảnh — chiều đỏ AC-12): ô chọn vẫn Quý 3, hàng đơn vị báo số đúng của Quý 3 (1 KR), không lệch sang số Quý 4 — Toàn cảnh đã tôn trọng kyOkr. Không frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E24
  run_id: mui9btvjah5e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_pham_vi
  verified_at: 2026-09-26T10:18:32Z
  output: |
     97 expect() calls
    Ran 1 test across 1 file. [2.00s]
    test-run: dropped crm_mui9btvjah5e_test

- eval: E25
  run_id: minted-toan-canh-okr-E25-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_san_thiet_ke
  verified_at: 2026-09-26T10:18:32Z
  output: |
    dat  apps/app/app/(app)/[slug]/okr/toan-canh/suc-khoe/suc-khoe.tsx (moi)
    dat  apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx (moi)
    san-thiet-ke: 28 tep, 0 hong

- eval: E26
  run_id: minted-toan-canh-okr-E26-r2
  exit_code: 0
  verifier: config:executors.test.tco_chu
  verified_at: 2026-09-26T09:26:26Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E27
  judged_by: judge panel (3 lens — domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: panel giữ nguyên từ round 2 — inputs không đổi, không chấm lại; rationale xem round 2.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)

- eval: E28
  run_id: minted-toan-canh-okr-E28-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  output: |
    man-toan-canh: 161 khang dinh, 0 hong, 37 anh, 79 s (cùng lần chạy với E3/E29)

- eval: E29
  run_id: minted-toan-canh-okr-E29-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tco_man_chrome
  verified_at: 2026-09-26T10:18:32Z
  output: |
    man-toan-canh: 161 khang dinh, 0 hong, 37 anh, 79 s (cùng lần chạy với E3/E28)

- eval: E30
  run_id: mui9bvlk4vsb
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_vet_an
  verified_at: 2026-09-26T10:18:32Z
  output: |
    dat  okrTrail.findMany apps/api/src/okr/okr.service.ts:1323
    dat  okrTrail.findMany apps/api/src/okr/okr-xem.service.ts:495
    so cho doc vet: 2

- eval: E31
  run_id: mui9bw0yx5xy
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tco_cay_day_du
  verified_at: 2026-09-26T10:18:32Z
  output: |
     5 expect() calls
    Ran 3 tests across 1 file. [9.00ms]
    test-run: dropped crm_mui9bw0yx5xy_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mui9b60ccbxb
  exit_code: 0
  verified_at: 2026-09-26T10:18:32Z
  output: |
      Time:    3m21.305s
    test-run: dropped crm_mui9b60ccbxb_test

- cmd: bunx turbo run lint --force
  run_id: minted-toan-canh-okr-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-26T10:18:32Z
  output: |
     Tasks:    9 successful, 9 total
    Cached:    0 cached, 9 total
      Time:    486ms

- cmd: bun run lint:slop
  run_id: minted-toan-canh-okr-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-26T10:18:32Z
  output: |
    $ oxlint --format=default
    Found 0 warnings and 0 errors.
    Finished in 857ms on 1611 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-toan-canh-okr-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-26T10:18:32Z
  output: |
     Tasks:    4 successful, 4 total
    Cached:    0 cached, 4 total
      Time:    11.601s

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

E26 (cmd: `cd apps/app && bun test test/messages-guard.spec.ts && cd ../../packages/ui && bun test --preload ./test/setup-dom.ts ./test/render-diff.spec.tsx`) — non-discriminating trên baseline round 1 (xanh trên cả HEAD lẫn baseline); regression-guard có chủ ý cho lớp chữ/messages, xem ghi chú carried_from_round tại khối Evidence E26.

## Variance

none — không có eval nào chạy nhiều lần (không có multi-run eval để xét phương sai).

## Iterations

Round 1: BLOCKED tại dac9eb03 — 0 eval đỏ, E30 chặn vì tác tử chấm chết không nộp kết quả; 2 finding (AC-7 tụt tự tin khi cập nhật hai lần một tuần, AC-3 cây đơn vị không Tab tới được).
Round 2: Fix AC-7 (so mức tự tin với lần cuối của tuần trước) và AC-3 (cây đơn vị giữ đúng một mục Tab khi mục đang chọn không có trong cây) — S4-r2 xanh, repin tại 635cc9db.
Round 3: Toàn bộ 31 eval + 4 lệnh suite PASS trên verified_commit 635cc9db; không finding mới trong hợp đồng.

### Re-pin lần 1 — 2026-10-05, do sửa thước đỏ lô 2-4 (b3)
run_id: repin-20261005T052409Z-94633
sha: 08d8837e1cc4222d84ebf0a880d0a64bdcbe5d64 · suites: 7 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 · diff chạm vật đo ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 2 — 2026-10-06, do sửa thước đỏ lô 2-4 (b3)
run_id: repin-20261006T104542Z-41641
sha: a8e229b52f9d3819c526d154271e98f18d9ebe28 · suites: 7 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 · diff chạm vật đo ngoài làn máy: E19 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 3 — 2026-10-17, do ve-sinh-do-san-onehub: sửa gốc đỏ sẵn onehub (hydration record=, 403, moi-chuoi, neo F8, E16) + thước DH1/DH3 trên onehub 21b709411
run_id: repin-20261017T062808Z-56916
sha: 38ba7b5e8cdb6e285227092dfd7afb9ec9fcda2c · suites: 7 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 · diff chạm vật đo ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-17, do ve-sinh-do-san-onehub: ghim lại bảy hồ sơ sau gộp onehub 9dfdf0628 (#459, #462, #463, #465) trước khi đẩy
run_id: repin-20261017T113609Z-76485
sha: 91b4e246850c022b600b63901a2666a3aac8428e · suites: 7 lệnh exit 0 · evals: 22/22 eval máy đạt kỳ vọng · ngoài làn máy: E2, E5, E10, E14, E17, E19, E21, E23, E27 · diff chạm vật đo ngoài làn máy: E2, E5, E14, E17, E19, E21, E23 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
