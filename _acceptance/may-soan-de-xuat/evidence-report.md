---
schema_version: 2
feature_slug: may-soan-de-xuat
verdict: BLOCKED
failed_evals: []
reason: E2t (AC-12) không chạy được — lệnh `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/may-soan-de-xuat/rang/blob-that.mjs"` thoát mã khác 0 với thông điệp "Missing environment variable: BLOB_READ_WRITE_TOKEN is required but not set. The verification script blob-that.mjs cannot run without it." Phiên đo cần khoá Blob thật (không phải khoá giả) để gọi taiLieu.nguon.xinCho/nhan/taiVe qua Blob storage thật; môi trường phiên round 2 vẫn chưa có khoá đó nên verifier không tự chạy được — không đổi so với round 1. Mọi eval máy khác (26/27 eval + 2 ui-check + 4 lệnh suite hồi quy) đều PASS trên đúng cây đã pin ở verified_commit; E15j (judgment) vẫn UNCERTAIN chờ người quyết (xem khối judgment bên dưới) — đây là lý do riêng, độc lập với lý do BLOCKED.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b4c967aa6324f41e6c8bd160e4a5ce53ff028e13
human_signoff:
---

# Evidence Report: may-soan-de-xuat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | PASS |
| E2t | AC-12 | script | BLOCKED |
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
| E14 | AC-14 | test | PASS |
| E15a | AC-15 | script | PASS |
| E15j | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-may-soan-de-xuat-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_chi_them
  verified_at: 2026-09-28T06:46:02Z
  output: |
    migration moi: 20261003010000_may_soan_de_xuat · so cau lenh: 11

- eval: E1b
  run_id: minted-may-soan-de-xuat-E1b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_tren_ban_sao
  verified_at: 2026-09-28T06:46:02Z
  output: |
    khang-dinh=7/7

- eval: E2
  run_id: minted-may-soan-de-xuat-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_nhan
  verified_at: 2026-09-28T06:46:02Z
  output: |
    (không có dòng log thêm ngoài mã thoát 0 — bun test qua hết ma trận 4 ca của nguon-nhan mà không in gì khác)

- eval: E2u
  run_id: PHIEN_DO auto (crm_wizardly_lumiere_e25e92_do, app:4147/api:4447); chieu-do auto (crm_msd_tai_nguon_chieu_do_do, app:4757/api:4125)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T06:46:02Z
  screenshot: evidence/E2u-step1.png
  observed: |
    E2u-step1.png (1440, buoc 1): dialog 'Tải nguồn lên' mo dung, vung keo-tha hien 'Kéo tệp vào đây, hoặc chọn tệp' + 'Word (.docx) hoặc PDF, tới 20 MB', radio dich 'Trang mới' da duoc chon (dot xanh). Khop Expected buoc 1.
    E2u-step2.png (1440, buoc 2 sau khi tai .docx mau + dien ten + chon loai + bam Tai len): tab 'Nguồn' active, mot hang duy nhat voi ten tep 'quyet-dinh-hoa-hong-doi-tac.docx', cot Trang = 'Quyết định hoa hồng đối tác 2026', cot Trạng thái = 'Máy đang soạn', khong co ma trang thai tho (CHO_SOAN/DANG_SOAN/...). Khop Expected buoc 2.
    E2u-step3.png (390, hop tai): dialog 'Tài nguồn lên' xep doc gon trong khung 390px, khong thay dau hieu tran ngang/cat noi dung. Khop Expected buoc 3 (khong cuon ngang).
    E2u-step4.png (390, tab Nguon dang the): the nguon hien day du ten tep, ten trang, ngay, trang thai 'Máy đang soạn', khong tran khung. Khop Expected buoc 3.
  network_observed: n-a (driver)

- eval: E2t
  status: BLOCKED (cannotRun)
  cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/may-soan-de-xuat/rang/blob-that.mjs"
  reason: Missing environment variable: BLOB_READ_WRITE_TOKEN is required but not set. The verification script blob-that.mjs cannot run without it.
  exit_code: 1
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T06:46:02Z
  output: |
    -- tiền đề làn đo: kho "crm" không phải kho dùng-một-lần — chạy trong một phiên đo riêng
    phien-do: kho crm_wizardly_lumiere_e25e92_do · app http://localhost:4100 · api http://localhost:4269
    -- tiền đề làn đo: đã đặt contextDevApiKey (khoá giả, sẽ dọn)
    -- tiền đề làn đo: đã đặt ảnh đại diện (sẽ dọn)
    -- tiền đề làn đo: workspace đã có tên miền được phép, không đụng
    KHONG DO DUOC: thieu BLOB_READ_WRITE_TOKEN that
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 2

- eval: E3
  run_id: minted-may-soan-de-xuat-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_tu_choi
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvw9g4sjdy_test

- eval: E3d
  run_id: minted-may-soan-de-xuat-E3d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T06:46:02Z
  output: |
    Ran 3 tests across 1 file. [887.00ms]

- eval: E4
  run_id: minted-may-soan-de-xuat-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_trung
  verified_at: 2026-09-28T06:46:02Z
  output: |
    (không có dòng log thêm ngoài mã thoát 0)

- eval: E5
  run_id: minted-may-soan-de-xuat-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khong_blob
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvw938tqzx_test

- eval: E5d
  run_id: minted-may-soan-de-xuat-E5d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T06:46:02Z
  output: |
    Ran 2 tests across 1 file. [1154.00ms]

- eval: E6
  run_id: minted-may-soan-de-xuat-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_doc_chu
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvw7zrnaki_test

- eval: E7
  run_id: mukvwl7e1gc5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_dat
  verified_at: 2026-09-28T06:46:02Z
  output: |
    (không có dòng log thêm ngoài mã thoát 0)

- eval: E8
  run_id: minted-may-soan-de-xuat-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_quet_duong_ghi
  verified_at: 2026-09-28T06:46:02Z
  output: |
    so tep da quet: 205 · so loi goi Prisma da xet: 300

- eval: E8b
  run_id: minted-may-soan-de-xuat-E8b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvwlagz1c4_test

- eval: E9
  run_id: minted-may-soan-de-xuat-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_kiem_so
  verified_at: 2026-09-28T06:46:02Z
  output: |
    (không có dòng log thêm ngoài mã thoát 0)

- eval: E10
  run_id: mukvwqo6twae
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_hong
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvwqo6twae_test

- eval: E10b
  run_id: minted-may-soan-de-xuat-E10b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_lai
  verified_at: 2026-09-28T06:46:02Z
  output: |
    (không có dòng log thêm ngoài mã thoát 0)

- eval: E10d
  run_id: minted-may-soan-de-xuat-E10d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T06:46:02Z
  output: |
    Ran 5 tests across 1 file. [771.00ms]

- eval: E11
  run_id: minted-may-soan-de-xuat-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_duyet_may
  verified_at: 2026-09-28T06:46:02Z
  output: |
    Ran 14 tests across 1 file. [1132.00ms]

- eval: E11b
  run_id: minted-may-soan-de-xuat-E11b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvwlagz1c4_test

- eval: E11u
  run_id: minted-may-soan-de-xuat-E11u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_duyet_may
  verified_at: 2026-09-28T06:46:02Z
  screenshot: evidence/E11u-step1.png
  observed: |
    5 frame đã đọc bằng Read (ảnh thật, không đoán từ log):
    - E11u-step1.png (msd-duyet-b1-1440.png, 1440w): màn "Bước 1 · Nguồn nói gì", tệp nguồn "quyet-dinh.docx" hiện rõ; 3 đoạn được TÔ NỀN màu cam rõ ràng trong khối nguồn: «Kể từ ngày 01/10/2026», «tầng hai là 1,5%», «tầng ba là 1,8%» — đúng 3 mark, có nền khác trong suốt. KHÔNG thấy nút Duyệt trên màn này (đúng với bước 1 chưa có nút Duyệt).
    - E11u-step2.png (msd-duyet-b2-1440.png, 1440w): hai khối "Nguồn" (trái) và "Bản máy soạn" (phải) NẰM CẠNH NHAU CÙNG MỘT HÀNG (đỉnh khung ngang bằng nhau, khối phải ở bên phải khối trái) — đúng Expected "hai cột cạnh nhau cùng hàng".
    - E11u-step3.png (msd-duyet-390.png, 390w): cùng màn bước 2 nhưng ở đó rộng 390, hiện HAI THẺ bấm được đúng tên "Nguồn" và "Bản máy soạn" (dạng tab-list), không thấy thanh cuộn ngang trong ảnh — đúng Expected "hai thẻ, không cuộn ngang".
    - E11u-step4.png (msd-duyet-tick-1440.png, 1440w): bảng "Con số và ngày" có 3 dòng, cả 3 ô checkbox "Đã đối chiếu" ĐỀU ĐÃ TICK (dấu check màu xanh) — khớp với bước tick 3 ô trước khi bấm Duyệt.
    - E11u-step5.png (msd-doc-nguon.png, 1440w): màn đọc trang sau khi duyệt ("Chính sách · Phiên bản 2 · duyệt 28/09/2026"), mục "Nguồn" bên phải hiện tên tệp "quyet-dinh.docx" kèm nút "Tải về" — đúng Expected "có tên tệp và nút tải về".
    Không có mâu thuẫn nào giữa nội dung frame và Expected.
  network_observed: n-a (driver)

- eval: E11s
  run_id: design-gate (multiple targets)
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T06:46:02Z
  output: |
    design-gate --mode static chạy trên mọi tệp tsx của khu tai-lieu và thành phần mới của
    packages/ui đã thêm; in tên từng tệp đạt; JSON kết quả kết thúc bằng "}", mã thoát 0.

- eval: E12
  run_id: minted-may-soan-de-xuat-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_khong_ro
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvx3lepalm_test

- eval: E13
  run_id: minted-may-soan-de-xuat-E13-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khoa_rieng
  verified_at: 2026-09-28T06:46:02Z
  output: |
    test-run: dropped crm_mukvx3g6f1xi_test

- eval: E13b
  run_id: minted-may-soan-de-xuat-E13b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_bien_ba_nha
  verified_at: 2026-09-28T06:46:02Z
  output: |
    KHO_TAI_LIEU_AI_GATEWAY_API_KEY: co o capabilities.ts

- eval: E14
  run_id: minted-may-soan-de-xuat-E14-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_ranh_gioi
  verified_at: 2026-09-28T06:46:02Z
  output: |
    Ran 11 tests across 2 files. [299.00ms]

- eval: E15a
  run_id: minted-may-soan-de-xuat-E15a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_soan_that
  verified_at: 2026-09-28T06:46:02Z
  output: |
    phien-do: xong — mã 0

- eval: E15j
  judged_by: judge panel (fresh context, 3 lens)
  verdict: UNCERTAIN
  rationale: |
    Panel 2/3 lens đề xuất PASS (domain-correctness, spec-alignment); lens operational-feasibility
    còn UNCERTAIN vì bộ ảnh evidence thiếu khung Bước 2 CHƯA CUỘN của trang bieu-mau, nên chưa
    phân biệt được panel bên phải trống là do cuộn độc lập bình thường (nguồn dài hơn draft ngắn)
    hay lỗi hiển thị thật. Mục này chưa chốt — người quyết đọc đủ ba phiếu bên dưới rồi điền
    human_override; không phiếu nào bị tóm tắt hay viết lại.
  votes:
    - domain-correctness: PASS — Cả ba trang máy soạn giữ đúng một chủ đề mỗi trang, chép số liệu khớp nguyên văn với "Chữ nguồn máy đọc được" (KPI 6/7/8 tỷ và 18/21/24 tỷ, hoa hồng 70/85/100%, chi phí cơ bản 2%/1,3%, phí hỗ trợ +0.3%, hoa hồng giới thiệu 0,5%, 1 V-point=1000đ, 30 ngày...), nêu đúng đối tượng/giới hạn như nguồn (CVKD/TNKD; bốn nhóm người giới thiệu, loại trừ khối KD-Marketing), không tự thêm quy định (bỏ đúng các mục Trách nhiệm/Mục đích khi nguồn không có), và theo đúng lối dặn của Quy tắc viết (ghi hai giá trị hiệu lực khác nhau kèm câu xác nhận, ghi "Nguồn trình bày công thức dạng hình, cần đối chiếu" khi công thức không rõ, giữ bảng thay vì diễn giải). Ảnh msd-duyet-b1/b2 (1440 và 390) cho thấy màn nguồn và màn duyệt đặt cạnh nhau, chữ rõ, số được tô nền và đối chiếu từng dòng — đọc được cho người văn phòng.
    - operational-feasibility: UNCERTAIN — Nội dung ba bản máy soạn (quyet-dinh-hoa-hong, quy-trinh, bieu-mau) đối chiếu được với đúng «Chữ nguồn máy đọc được» của chính nó — số liệu, đối tượng áp dụng, giới hạn và cấu trúc trang khớp Quy tắc viết ở mức tôi kiểm được. Nhưng ảnh `soan-that-bieu-mau-b2-1440.png` (Bước 2, cột «Bản máy soạn») cho thấy nửa phải màn hình trống hoàn toàn — không khung, không tiêu đề, không nội dung — trái với hai ảnh b2-1440 còn lại (quyet-dinh-hoa-hong, quy-trinh) ở cùng bước, nơi cột phải luôn có hộp nội dung hiển thị. Bộ input không có ảnh đầu trang Bước 2 (chưa cuộn) của bieu-mau nên tôi không phân biệt được đây là cuộn-độc-lập bình thường (nguồn dài hơn draft ngắn, không phải lỗi) hay màn thật sự gãy — tức là chưa đủ căn cứ để nói «đọc được cạnh nhau» đúng cho cả ba tệp.
      required_evidence:
        - Ảnh chụp Bước 2 · Đối chiếu với bản máy soạn của trang bieu-mau ở 1440px NGAY KHI VỪA MỞ (chưa cuộn) — xác nhận cột phải có tiêu đề «Bản máy soạn» và nội dung hiển thị, không phải mảng đen trống, giống cấu trúc đã thấy ở hai ảnh b2-1440 của quyet-dinh-hoa-hong và quy-trinh
        - Một ghi chú hoặc video ngắn xác nhận hai cột Nguồn / Bản máy soạn ở màn duyệt bieu-mau cuộn ĐỘC LẬP với nhau (cuộn cột nguồn xuống sâu không làm mất nội dung cột bản máy soạn) — nếu xác nhận được đây chỉ là draft ngắn hơn nguồn (không phải lỗi hiển thị), verdict đổi thành PASS
    - spec-alignment: PASS — Đối chiếu cả ba bản máy soạn với chữ nguồn máy đọc được trong chính ba tệp evidence: mỗi bản giữ đúng một chủ đề (chính sách hoa hồng, chính sách giới thiệu, phụ lục chi phí — phụ lục tách trang riêng đúng luật "đứng thành tệp riêng"), số liệu (tỷ lệ %, tiền tỷ, ngày, kể cả "1,3%", "+0.3%", ngày thiếu năm "05/12") được chép nguyên văn không đổi, đối tượng/giới hạn áp dụng nêu đúng như nguồn (CVKD/TNKD; bốn nhóm người giới thiệu + loại trừ khối KD&Marketing), và không thấy quy định nào bịa thêm. Quy tắc viết được tuân theo rõ: viết tắt lần đầu kèm ngoặc, giữ ngày thiếu năm, xử lý đúng khuôn "hai giá trị khác nhau" cho ngày hiệu lực mâu thuẫn, không chép mục lục/số phiên bản. Các ảnh msd-nguon/msd-duyet và soan-that-*-b1/b2 (1440 và 390) cho thấy màn nguồn và màn duyệt cạnh nhau rõ chữ, có tô nền trích đoạn, bảng đối chiếu con số, và chuyển hai cột thành hai thẻ ở 390 — đọc được cho người văn phòng.
  required_evidence:
    - Ảnh chụp Bước 2 của trang bieu-mau ở 1440px NGAY KHI VỪA MỞ (chưa cuộn), xác nhận cột phải "Bản máy soạn" có tiêu đề và nội dung.
    - Xác nhận hai cột Nguồn / Bản máy soạn ở màn duyệt bieu-mau cuộn độc lập với nhau (không phải lỗi hiển thị).
  human_override:  # chờ người ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-28T06:46:02Z

- cmd: bunx turbo run lint --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-28T06:46:02Z

- cmd: bun run lint:slop
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-28T06:46:02Z

- cmd: bunx turbo run build --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-28T06:46:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (pass trên cả HEAD lẫn baseline):
- E11s (AC-11, `design-gate --mode static`) — pass trên cả hai phía vì đây là quét thiết kế tĩnh trên tệp hiện tại của nhánh, không phải phép so trước/sau; chiều đỏ của chính nó (chèn className thô) đã riêng chứng minh nó phân biệt được lỗi thiết kế, nên đây là regression-guard có chủ ý chứ không phải lỗi đo.
- E14 (AC-14, `tai-lieu-ranh-gioi.spec.ts` + `khuon-di-dong.spec.ts`) — pass trên cả hai phía vì các file quét (sandbox.ts, khai báo subagent) đã tồn tại từ trước; đây là regression-guard cho ranh giới sandbox/tool-set, không phải hành vi mới của tính năng — giữ nguyên, không cần viết lại.

## Variance

none — không có eval nào có runs > 1 trong vòng này (không có eval stochastic hay flaky).

## Iterations

Round 1: 26/27 eval máy PASS, 2 ui-check PASS, 4 lệnh suite hồi quy PASS, 1 judgment (E15j) UNCERTAIN chờ người quyết; E2t (AC-12) không chạy được — thiếu BLOB_READ_WRITE_TOKEN thật. Verdict: BLOCKED.
Round 2: soan-that.mjs nay tự lái luôn màn duyệt (chupManDuyet) và sinh ảnh soan-that-*-b1/b2 làm input cho E15j; toàn bộ 26/27 eval máy PASS lại, 2 ui-check PASS, 4 lệnh suite hồi quy PASS; panel E15j chấm lại trên bằng chứng mới (2/3 lens PASS, lens operational-feasibility vẫn UNCERTAIN vì thiếu ảnh Bước 2 chưa cuộn của bieu-mau) — vẫn cần người quyết. E2t vẫn không chạy được vì phiên đo chưa có BLOB_READ_WRITE_TOKEN thật (không đổi từ round 1). Verdict: BLOCKED — chờ khoá Blob thật rồi chạy lại đúng E2t; các eval khác không cần chạy lại.