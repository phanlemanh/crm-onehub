---
schema_version: 2
feature_slug: may-soan-de-xuat
verdict: REJECT
failed_evals: [E2t]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 26105798cac0ec7e6c24c01b85860eff991a8f12
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
  run_id: minted-may-soan-de-xuat-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_chi_them
  verified_at: 2026-09-28T08:27:32Z
  output: |
    migration moi: 20261003010000_may_soan_de_xuat · so cau lenh: 11

- eval: E1b
  run_id: minted-may-soan-de-xuat-E1b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_tren_ban_sao
  verified_at: 2026-09-28T08:27:32Z
  output: |
    khang-dinh=7/7

- eval: E2
  run_id: minted-may-soan-de-xuat-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_nhan
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukziuwa9y4k_test

- eval: E2u
  run_id: minted-may-soan-de-xuat-E2u-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T08:27:32Z
  screenshot: evidence/E2u-step1.png
  observed: |
    4 frame da doc truc tiep bang Read, doi chieu tung cai voi Expected:
    - E2u-step1.png (= msd-tai-1440.png, buoc 1, 1440px): hop thoai "Tải nguồn lên" mo dung, co vung keo-tha voi chu "Kéo tệp vào đây, hoặc chọn tệp" + "Word (.docx) hoặc PDF, tới 20 MB", muc "Tệp này cho trang nào" co radio "Trang mới" duoc chon (dot xanh dac). Khop dung buoc 1.
    - E2u-step2.png (= msd-nguon-1440.png, buoc 2, 1440px): trang /tai-lieu, tab "Nguồn" dang active (gach chan trang), bang co 1 hang: ten tep "quyet-dinh-hoa-hong-doi-tac.docx", cot Trang = "Quyết định hoa hồng đối tác 2026", cot Trang thai = icon + chu "Máy đang soạn", ngay tai 28/09/2026. Khong co ma trang thai tho (CHO_DOC/DANG_SOAN/...) hien ra man hinh. Khop dung buoc 2.
    - E2u-step3.png (= msd-tai-390.png, buoc 3, 390px): hop thoai Tai nguon len hien day du trong khung 390px, khong thay thanh cuon ngang, cac truong xep doc gon trong be rong khung.
    - E2u-step4.png (= msd-nguon-390.png, buoc 3, 390px): tab Nguon dang o dang the (card) thay vi bang, hien ten tep, ten trang + ngay, va "Máy đang soạn"; khong thay tran/cuon ngang.
    Ca 4 anh khop hoan toan voi Expected, khong mau thuan.
  network_observed: n-a (driver)

- eval: E2t
  run_id: minted-may-soan-de-xuat-E2t-r3
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T08:27:32Z
  output: |
    -- tiền đề làn đo: kho "crm" không phải kho dùng-một-lần — chạy trong một phiên đo riêng
    phien-do: kho crm_wizardly_lumiere_e25e92_do · app http://localhost:4227 · api http://localhost:4546
    -- tiền đề làn đo: đã đặt contextDevApiKey (khoá giả, sẽ dọn)
    -- tiền đề làn đo: đã đặt ảnh đại diện (sẽ dọn)
    -- tiền đề làn đo: workspace đã có tên miền được phép, không đụng
    KHONG DO DUOC: thieu BLOB_READ_WRITE_TOKEN that
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 2
  FAIL: thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng — E2t (AC-12) không chạy được, các bước "xin chỗ → PUT thật → nhận → tải về ký/không ký" chưa được đo lần này.

- eval: E3
  run_id: minted-may-soan-de-xuat-E3-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_tu_choi
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukziuij8div_test

- eval: E3d
  run_id: minted-may-soan-de-xuat-E3d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T08:27:32Z
  output: |
    (dom test) — exit 0

- eval: E4
  run_id: minted-may-soan-de-xuat-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_trung
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukziw4k3c42_test

- eval: E5
  run_id: minted-may-soan-de-xuat-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khong_blob
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzitui60ac_test

- eval: E5d
  run_id: minted-may-soan-de-xuat-E5d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T08:27:32Z
  output: |
    Ran 2 tests across 1 file. [1222.00ms]

- eval: E6
  run_id: minted-may-soan-de-xuat-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_doc_chu
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukziu8cl7qc_test

- eval: E7
  run_id: minted-may-soan-de-xuat-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_dat
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzj5wsivhl_test

- eval: E8
  run_id: minted-may-soan-de-xuat-E8-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_quet_duong_ghi
  verified_at: 2026-09-28T08:27:32Z
  output: |
    so tep da quet: 205 · so loi goi Prisma da xet: 300

- eval: E8b
  run_id: minted-may-soan-de-xuat-E8b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzj9d1grt3_test

- eval: E9
  run_id: minted-may-soan-de-xuat-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_kiem_so
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzjd97c7yv_test

- eval: E10
  run_id: minted-may-soan-de-xuat-E10-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_hong
  verified_at: 2026-09-28T08:27:32Z
  output: |
    Ran 4 tests across 1 file. [749.00ms]
    test-run: dropped crm_mukzjdf4ezx1_test

- eval: E10b
  run_id: minted-may-soan-de-xuat-E10b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_lai
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzjdyd8jsr_test

- eval: E10d
  run_id: minted-may-soan-de-xuat-E10d-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T08:27:32Z
  output: |
    Ran 5 tests across 1 file. [792.00ms]

- eval: E11
  run_id: minted-may-soan-de-xuat-E11-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_duyet_may
  verified_at: 2026-09-28T08:27:32Z
  output: |
    Ran 14 tests across 1 file. [1229.00ms]

- eval: E11b
  run_id: minted-may-soan-de-xuat-E11b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzj9d1grt3_test

- eval: E11u
  run_id: crm_wizardly_lumiere_e25e92_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_duyet_may
  verified_at: 2026-09-28T08:27:32Z
  screenshot: evidence/E11u-step1.png
  observed: |
    5 frame đã đọc trực tiếp bằng Read (ảnh), đối chiếu Expected:
    - E11u-step1.png (msd-duyet-b1-1440.png, 1440, Bước 1 "Nguồn nói gì"): đúng 3 đoạn được tô nền cam/vàng rõ ràng trong khối [data-slot='nguon-chu'] — "Kể từ ngày 01/10/2026", "tầng hai là 1,5%", "tầng ba là 1,8%". Không thấy nút Duyệt ở màn này (đúng — bước 1 chưa cho duyệt).
    - E11u-step2.png (msd-duyet-b2-1440.png, 1440, sau khi bấm "Đã đọc nguồn, xem bản máy soạn"): hai khối "Nguồn" (trái) và "Bản máy soạn" (phải) nằm cùng một hàng, khối phải bắt đầu bên phải khối trái — khớp DOM check cungHang=true/benPhai=true.
    - E11u-step3.png (msd-duyet-390.png, 390): có đúng hai thẻ "Nguồn" / "Bản máy soạn" xếp trên cùng, đang ở thẻ "Nguồn"; nội dung xuống dòng gọn trong 390px, không thấy tràn ngang.
    - E11u-step4.png (msd-duyet-tick-1440.png, 1440): cả 3 hàng "Con số và ngày" đều có ô "Đã đối chiếu" tích xanh (đã tick hết). Nút Duyệt không nằm trong khung ảnh 1440x900 này (trang có vùng cuộn nội bộ riêng) — script đã evaluate DOM (disabled === false) trước khi chụp và in "buoc 4: dat".
    - E11u-step5.png (msd-doc-nguon.png): màn tài liệu đã sang "Phiên bản 2 · duyệt 28/09/2026"; mục "Nguồn" bên phải hiện tên tệp "quyet-dinh.docx" cùng nút "Tải về" — đúng như Expected.
    Không có frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E11s
  run_id: design-gate-791dc3b60f
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T08:27:32Z
  output: |
    (design-gate --mode static trên mọi tệp tsx khu tài-liệu + component mới của packages/ui) — exit 0

- eval: E12
  run_id: minted-may-soan-de-xuat-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_khong_ro
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzjk9m47xw_test

- eval: E13
  run_id: minted-may-soan-de-xuat-E13-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khoa_rieng
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzjlwrfndk_test

- eval: E13b
  run_id: minted-may-soan-de-xuat-E13b-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_bien_ba_nha
  verified_at: 2026-09-28T08:27:32Z
  output: |
    KHO_TAI_LIEU_AI_GATEWAY_API_KEY: co o capabilities.ts

- eval: E16
  run_id: minted-may-soan-de-xuat-E16-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_cua_ai
  verified_at: 2026-09-28T08:27:32Z
  output: |
    test-run: dropped crm_mukzjpqxkaxu_test

- eval: E14
  run_id: minted-may-soan-de-xuat-E14-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_ranh_gioi
  verified_at: 2026-09-28T08:27:32Z
  output: |
     46 expect() calls
    Ran 11 tests across 2 files. [321.00ms]

- eval: E15a
  run_id: minted-may-soan-de-xuat-E15a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_soan_that
  verified_at: 2026-09-28T08:27:32Z
  output: |
    -- tiền đề làn đo: đã dọn ảnh đại diện
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
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_test-r3
  exit_code: 1
  verified_at: 2026-09-28T08:27:32Z
  note: |
    KHÔNG gắn với bất kỳ eval nào của tính năng này (evals: []). 963 pass / 1 skip / 19 fail
    trên 983 test, 111 tệp. 19 ca đỏ đều nằm ngoài phạm vi may-soan-de-xuat: moc-ghim-mau (2 ca),
    xoa-mau (3 ca), okr-that-mau (4 ca), bo-hong-mau (4 ca), thu-tuc-that-mau (1 ca),
    chan-production (3 ca), vet-chi-quan-tri (1 ca), cộng 1 ca (unnamed). Không có ca nào của
    tai-lieu-nguon*/tai-lieu-soan*/tai-lieu-*duyet* trong danh sách đỏ — mọi test của feature
    này (E2, E3, E3d, E4, E5, E5d, E6, E7, E8b, E9, E10, E10b, E10d, E11b, E12, E13, E13b, E16)
    đã pass riêng lẻ ở các block eval phía trên. Lệnh suite tổng vẫn thoát mã 1 nên góp phần
    vào verdict REJECT của vòng này.

- cmd: bunx turbo run lint --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-28T08:27:32Z

- cmd: bun run lint:slop
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-28T08:27:32Z
  output: |
    Finished in 1.3s on 2010 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-28T08:27:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

E11s, E14 — cả hai xanh trên cả nhánh và baseline diffBase (green-on-both):
- E11s (config:executors.script.msd_san_thiet_ke, AC-11): design-gate --mode static chạy trên toàn bộ tệp tsx của khu tài-liệu; vòng này không có target mới nào vi phạm nên baseline cũng xanh — đây là regression-guard bình thường của toàn khu, không phải bằng chứng riêng cho may-soan-de-xuat.
- E14 (config:executors.test.msd_ranh_gioi, AC-14): quét ranh giới subagent (tool allowlist, sandbox deny-all, khuôn di động) — cấu hình ranh giới này đã tồn tại từ trước và không đổi theo round, nên baseline cũng xanh.

## Variance

none — every multi-run eval is uniform (không eval nào có runs > 1 trong vòng này).

## Iterations

Round 1: các mục ngoài hợp đồng còn treo từ lượt triển khai đầu (đánh dấu fromRound 1 trong review-findings — ví dụ chuỗi invalidate cache thủ công, timeout sweep lệch mốc, nop_ban_de_xuat bien-1-5 không thể đỏ, drainMaySoan nuốt lỗi im lặng) được ghi nhận nhưng chưa xử lý, đa số proposal known-limits/new-contract chờ Gate 2.
Round 2: panel E15j (AC-15, judgment) chấm — lens operational-feasibility còn UNCERTAIN (thiếu ảnh 1440px của bieu-mau đối chiếu bản máy soạn ngay khi vừa mở); panel này carried nguyên sang round 3 vì input (bieu-mau, man-duyet-may.mjs) không đổi.
Round 3 (vòng này): E2t (AC-12) đỏ vì thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng (không tự sinh được, không phải lỗi code); lệnh suite "bun run test" cũng đỏ với 19 ca ngoài phạm vi tính năng (moc-ghim-mau, xoa-mau, okr-that-mau, bo-hong-mau, thu-tuc-that-mau, chan-production, vet-chi-quan-tri) — mọi test riêng của may-soan-de-xuat đều pass. Verdict: REJECT.
