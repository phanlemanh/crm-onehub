---
schema_version: 2
feature_slug: may-soan-de-xuat
verdict: REJECT
failed_evals: [E2t]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9cb6ec2684fae6d5ff1bb062184d6a623a749348
human_signoff:
---

# Evidence Report: may-soan-de-xuat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | PASS |
| E2t | AC-12 | script | FAIL |
| E3 | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E11u | AC-11 | ui-check | PASS |
| E11s | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E13b | AC-13 | script | PASS |
| E16 | AC-16 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15a | AC-15 | script | PASS |
| E15j | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-may-soan-de-xuat-E1-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_chi_them
  verified_at: 2026-09-28T09:02:38Z
  output: |
    migration moi: 20261003010000_may_soan_de_xuat · so cau lenh: 11

- eval: E1b
  run_id: minted-may-soan-de-xuat-E1b-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_tren_ban_sao
  verified_at: 2026-09-28T09:02:38Z
  output: |
    khang-dinh=7/7

- eval: E2
  run_id: minted-may-soan-de-xuat-E2-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_nhan
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s2wwj98g_test

- eval: E2u
  run_id: msd-E2u (tien-de -> phien-do crm_wizardly_lumiere_e25e92_do, app http://localhost:4506, api http://localhost:4419) + chieu-do run (crm_msd_tai_nguon_chieu_do_do, app http://localhost:4842, api http://localhost:4455)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T09:02:38Z
  screenshot: evidence/msd-tai-1440.png
  observed: |
    msd-tai-1440.png (1440, sau khi bấm 'Tải nguồn lên'): hộp thoại «Tài nguồn lên» hiện giữa màn, có vùng kéo-thả với icon upload, chữ «Kéo tệp vào đây, hoặc chọn tệp» / «Word (.docx) hoặc PDF, tới 20 MB», mục «Tệp này cho trang nào» với radio «Trang mới» đã chọn (chấm xanh), ô «Tên trang» trống, dropdown «Loại trang: Quy định», «Đơn vị: Không thuộc đơn vị nào», «Chủ trang: Bạn» — khớp Expected buoc 1.
    msd-nguon-1440.png (1440, sau khi tải lên): trang Tài liệu tab «Nguồn» đang chọn, bảng có đúng 1 hàng: cột Nguồn = «quyet-dinh-hoa-hong-doi-tac.docx», cột Trang = «Quyết định hoa hồng đối tác 2026», Người tải = «Lê Thu Trang», Trạng thái = «Máy đang soạn» (icon + chữ, không phải mã thô), Ngày tải = 28/09/2026 — khớp Expected buoc 2.
    msd-tai-390.png (390, hộp tải): cùng nội dung hộp tải nhưng xếp dọc full-width trong viewport 390px, nút Huỷ/Tải lên xếp chồng, không thấy dấu hiệu tràn ngang (không có scrollbar ngang, mọi phần tử nằm trong 390px) — khớp Expected buoc 3.
    msd-nguon-390.png (390, tab Nguồn): thẻ dọc hiện tên tệp, tên trang (gạch chân, dạng liên kết), ngày, và trạng thái «Máy đang soạn» dưới dạng thẻ dọc gọn trong 390px, không tràn ngang — khớp Expected buoc 3.
    Log chiều-đo (mutation, ẩn BangNguon ở buoc 2): in đúng «buoc 2: khong thay hang nguon», mã thoát của lượt bên trong = 1 (chieu-do wrapper báo «DO DUNG GHIM: ma 1, in «buoc 2: khong thay hang nguon»» và tự thoát mã 0 vì bắt đúng ghim) — khớp câu Expected về CHIEU DO.
  network_observed: n-a (driver)

- eval: E2t
  run_id: minted-may-soan-de-xuat-E2t-r4
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T09:02:38Z
  output: |
    -- tiền đề làn đo: kho "crm" không phải kho dùng-một-lần — chạy trong một phiên đo riêng
    phien-do: kho crm_wizardly_lumiere_e25e92_do · app http://localhost:4768 · api http://localhost:4429
    -- tiền đề làn đo: đã đặt contextDevApiKey (khoá giả, sẽ dọn)
    -- tiền đề làn đo: đã đặt ảnh đại diện (sẽ dọn)
    -- tiền đề làn đo: workspace đã có tên miền được phép, không đụng
    KHONG DO DUOC: thieu BLOB_READ_WRITE_TOKEN that
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 2
  FAIL: thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng — E2t (AC-12) không chạy được, các bước "xin chỗ → PUT thật → nhận → tải về ký/không ký" chưa được đo lần này. Đây là hạ tầng đo (thiếu secret thật của phiên do), không phải mã nguồn bị đổi để né.

- eval: E3
  run_id: minted-may-soan-de-xuat-E3-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_tu_choi
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s2hzm0pe_test

- eval: E3d
  run_id: minted-may-soan-de-xuat-E3d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Ran 3 tests across 1 file. [970.00ms]

- eval: E4
  run_id: minted-may-soan-de-xuat-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_trung
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s2unzyeb_test

- eval: E5
  run_id: minted-may-soan-de-xuat-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khong_blob
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s4njck70_test

- eval: E5d
  run_id: minted-may-soan-de-xuat-E5d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Ran 2 tests across 1 file. [925.00ms]

- eval: E6
  run_id: minted-may-soan-de-xuat-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_doc_chu
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s21bfpzl_test

- eval: E7
  run_id: minted-may-soan-de-xuat-E7-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_dat
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0sg3le4xi_test

- eval: E8
  run_id: minted-may-soan-de-xuat-E8-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_quet_duong_ghi
  verified_at: 2026-09-28T09:02:38Z
  output: |
    so tep da quet: 205 · so loi goi Prisma da xet: 300

- eval: E8b
  run_id: minted-may-soan-de-xuat-E8b-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0shh0ngho_test

- eval: E9
  run_id: minted-may-soan-de-xuat-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_kiem_so
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0shi7fu87_test

- eval: E10
  run_id: minted-may-soan-de-xuat-E10-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_hong
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0sjji44zp_test

- eval: E10b
  run_id: minted-may-soan-de-xuat-E10b-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_lai
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0sno3ftgq_test

- eval: E10d
  run_id: minted-may-soan-de-xuat-E10d-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Ran 5 tests across 1 file. [932.00ms]

- eval: E11
  run_id: minted-may-soan-de-xuat-E11-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_duyet_may
  verified_at: 2026-09-28T09:02:38Z
  output: |
    (dom test tai-lieu-man-duyet-may.dom.tsx) — exit 0, không có dòng log bổ sung ngoài mã thoát sạch.

- eval: E11b
  run_id: minted-may-soan-de-xuat-E11b-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0shh0ngho_test

- eval: E11u
  run_id: minted-may-soan-de-xuat-E11u-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_duyet_may
  verified_at: 2026-09-28T09:02:38Z
  screenshot: evidence/E11u-step1.png
  observed: |
    E11u-step1.png (msd-duyet-b1-1440.png, 1440px): trang "Bước 1 · Nguồn nói gì", 3 đoạn được tô nền cam trong khối "Nguồn": "Kể từ ngày 01/10/2026", "tầng hai là 1,5%", "tầng ba là 1,8%" — đúng 3 số mới theo yêu cầu; không thấy nút Duyệt trên màn (khớp DOM: 3 mark có nền, coDuyet=false). E11u-step2.png (msd-duyet-b2-1440.png, 1440px): "Bước 2 · Đối chiếu với bản máy soạn" — hai khối "Nguồn" (trái) và "Bản máy soạn" (phải) nằm cùng hàng, cạnh nhau (không xếp chồng dọc) — khớp getBoundingClientRect cungHang=true, benPhai=true. E11u-step3.png (msd-duyet-390.png, 390px): cùng màn "Bước 2", hiển thị hai thẻ pill "Nguồn" / "Bản máy soạn" ở trên, không tràn ngang, nội dung vừa khung 390px. E11u-step4.png (msd-doc-nguon.png, 1440px): màn đọc trang đã duyệt "Chính sách hoa hồng công ty đối tác · Phiên bản 2 · duyệt 28/09/2026", mục "Nguồn" hiển thị tên tệp "quyet-dinh.docx" kèm nút "Tải về" — khớp yêu cầu. Đã đọc thêm .acceptance-runs/.../msd-duyet-tick-1440.png (không nằm trong 4 slot step nhưng là ảnh bước 4 thứ nhất): cả 3 dòng "Con số và ngày" đều có ô "Đã đối chiếu" tick xanh trước khi bấm Duyệt.
  network_observed: n-a (driver)

- eval: E11s
  run_id: minted-may-soan-de-xuat-E11s-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T09:02:38Z
  output: |
    (design-gate --mode static trên mọi tệp tsx của khu tài-liệu + component mới của packages/ui) — exit 0.

- eval: E12
  run_id: minted-may-soan-de-xuat-E12-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_khong_ro
  verified_at: 2026-09-28T09:02:38Z
  output: |
    (test) — exit 0, không có dòng log bổ sung ngoài mã thoát sạch.

- eval: E13
  run_id: minted-may-soan-de-xuat-E13-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khoa_rieng
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0suj1m4vj_test

- eval: E13b
  run_id: minted-may-soan-de-xuat-E13b-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_bien_ba_nha
  verified_at: 2026-09-28T09:02:38Z
  output: |
    KHO_TAI_LIEU_AI_GATEWAY_API_KEY: co o capabilities.ts

- eval: E16
  run_id: minted-may-soan-de-xuat-E16-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_cua_ai
  verified_at: 2026-09-28T09:02:38Z
  output: |
    (test) — exit 0, không có dòng log bổ sung ngoài mã thoát sạch.

- eval: E14
  run_id: minted-may-soan-de-xuat-E14-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_ranh_gioi
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Ran 11 tests across 2 files. [341.00ms]

- eval: E15a
  run_id: minted-may-soan-de-xuat-E15a-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_soan_that
  verified_at: 2026-09-28T09:02:38Z
  output: |
    phien-do: xong — mã 0

- eval: E15j
  judged_by: judge-subagent panel (carried, không chấm lại vòng này)
  verdict: UNCERTAIN
  rationale: Panel giữ nguyên từ round 2 — inputs (bieu-mau, man-duyet-may.mjs) không đổi nên không chấm lại; rationale xem round 2. Đề xuất tổng thể của panel là PASS nhưng lens operational-feasibility còn UNCERTAIN.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: UNCERTAIN (r2)
    - spec-alignment: PASS (r2)
  required_evidence:
    - Ảnh chụp Bước 2 · Đối chiếu với bản máy soạn của trang bieu-mau ở 1440px NGAY KHI VỪA MỞ (chưa cuộn) — xác nhận cột phải có tiêu đề «Bản máy soạn» và nội dung hiển thị, không phải mảng đen trống, giống cấu trúc đã thấy ở hai ảnh b2-1440 của quyet-dinh-hoa-hong và quy-trinh
    - Một ghi chú hoặc video ngắn xác nhận hai cột Nguồn / Bản máy soạn ở màn duyệt bieu-mau cuộn ĐỘC LẬP với nhau (cuộn cột nguồn xuống sâu không làm mất nội dung cột bản máy soạn) — nếu xác nhận được đây chỉ là draft ngắn hơn nguồn (không phải lỗi hiển thị), verdict đổi thành PASS
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-28T09:02:38Z
  output: |
    test-run: dropped crm_mul0s1piovke_test

- cmd: bunx turbo run lint --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-28T09:02:38Z

- cmd: bun run lint:slop
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Finished in 1.2s on 2010 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-28T09:02:38Z
  output: |
    Time:    15.617s

## Known limits

## Ngoài hợp đồng

## Analyst

E11s, E14 — cả hai xanh trên cả nhánh và baseline diffBase (green-on-both):
- E11s (config:executors.script.msd_san_thiet_ke, AC-11): design-gate --mode static chạy trên toàn bộ tệp tsx của khu tài-liệu; vòng này không có target mới nào vi phạm nên baseline cũng xanh — đây là regression-guard bình thường của toàn khu, không phải bằng chứng riêng cho may-soan-de-xuat.
- E14 (config:executors.test.msd_ranh_gioi, AC-14): quét ranh giới subagent (tool allowlist, sandbox deny-all, khuôn di động) — cấu hình ranh giới này đã tồn tại từ trước và không đổi theo round, nên baseline cũng xanh.

## Variance

none — every multi-run eval is uniform (không eval nào có runs > 1 trong vòng này).

## Iterations

Round 2: panel E15j (AC-15, judgment) chấm — lens operational-feasibility còn UNCERTAIN (thiếu ảnh 1440px của bieu-mau đối chiếu bản máy soạn ngay khi vừa mở); panel này carried sang các round sau vì input (bieu-mau, man-duyet-may.mjs) không đổi.
Round 3: E2t (AC-12) đỏ vì thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng; lệnh suite "bun run test" cũng đỏ với 19 ca ngoài phạm vi tính năng — mọi test riêng của may-soan-de-xuat đều pass. Verdict: REJECT.
Round 4 (vòng này): E2t (AC-12) vẫn đỏ, cùng nguyên nhân — thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng (mã thoát 2, không phải mã nguồn bị đổi để né); mọi eval khác (E1…E16, panel E15j carried) và cả bốn lệnh suite (bun run test, turbo lint, lint:slop, turbo build) đều thoát mã 0. Verdict: REJECT — chỉ vướng E2t.
