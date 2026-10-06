---
schema_version: 2
feature_slug: may-soan-de-xuat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e3b979ae92631d509c9868e6f8b03c345cbd4fac
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: may-soan-de-xuat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | PASS |
| E2t | AC-12 | script | PASS |
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
  run_id: minted-may-soan-de-xuat-E1-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_chi_them
  verified_at: 2026-09-28T10:29:19Z
  output: |
    migration moi: 20261003010000_may_soan_de_xuat · so cau lenh: 11

- eval: E1b
  run_id: minted-may-soan-de-xuat-E1b-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_tren_ban_sao
  verified_at: 2026-09-28T10:29:19Z
  output: |
    khang-dinh=7/7

- eval: E2
  run_id: minted-may-soan-de-xuat-E2-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_nhan
  verified_at: 2026-09-28T10:29:19Z

- eval: E2u
  run_id: msd-E2u thuc: tien-de->phien-do crm_wizardly_lumiere_e25e92_do (app http://localhost:4313, api http://localhost:4631) | chieu-do: crm_msd_tai_nguon_chieu_do_do (app http://localhost:4161, api http://localhost:4242)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T10:29:19Z
  screenshot: evidence/E2u-step1.png
  observed: |
    E2u-step1.png (1440, sau khi bam 'Tai nguon len'): hop thoai 'Tai nguon len' mo giua man, co vung keo-tha voi icon upload, chu 'Keo tep vao day, hoac chon tep' / 'Word (.docx) hoac PDF, toi 20 MB', muc 'Tep nay cho trang nao' voi radio 'Trang moi' da chon (cham xanh) — khop Expected buoc 1. E2u-step2.png (1440, sau khi tai len): tab 'Nguon' dang chon, bang co dung 1 hang: Nguon='quyet-dinh-hoa-hong-doi-tac.docx', Trang='Quyet dinh hoa hong doi tac 2026', Nguoi tai='Le Thu Trang', Trang thai='May dang soan' (icon + chu, khong phai ma tho nhu CHO_DOC/DANG_SOAN), Ngay tai=28/09/2026 — khop Expected buoc 2. E2u-step3.png (390, hop tai): cung noi dung hop tai xep doc full-width trong 390px, nut Huy/Tai len xep chong, khong thay tran ngang. E2u-step4.png (390, tab Nguon): the doc hien ten tep, ten trang (gach chan dang lien ket), ngay, va 'May dang soan' gon trong 390px, khong tran ngang — khop Expected buoc 3. Ca 4 frame khop Expected, khong mau thuan.
  network_observed: n-a (driver)

- eval: E2t
  run_id: minted-may-soan-de-xuat-E2t-r5
  status: not-run
  not_run_note: khai không-chạy từ 04/10 theo dòng sổ d-20261004T123430Z-91 (chủ kho duyệt gói B); lúc ký vòng 5 (28/09) thoát mã không, có khoá kho riêng tư thật
  baseline: red
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T10:29:19Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-may-soan-de-xuat-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_tu_choi
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vmgxvda8_test

- eval: E3d
  run_id: minted-may-soan-de-xuat-E3d-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Ran 3 tests across 1 file. [1020.00ms]

- eval: E4
  run_id: minted-may-soan-de-xuat-E4-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_trung
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vl0h4j9o_test

- eval: E5
  run_id: minted-may-soan-de-xuat-E5-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khong_blob
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vldu1z3f_test

- eval: E5d
  run_id: minted-may-soan-de-xuat-E5d-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Ran 2 tests across 1 file. [909.00ms]

- eval: E6
  run_id: mul3vj2c46xh
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_doc_chu
  verified_at: 2026-09-28T10:29:19Z

- eval: E7
  run_id: mul3vvapgpkc
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_dat
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vvapgpkc_test

- eval: E8
  run_id: minted-may-soan-de-xuat-E8-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_quet_duong_ghi
  verified_at: 2026-09-28T10:29:19Z

- eval: E8b
  run_id: minted-may-soan-de-xuat-E8b-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vynv13nj_test

- eval: E9
  run_id: minted-may-soan-de-xuat-E9-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_kiem_so
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vy6r7k2s_test

- eval: E10
  run_id: minted-may-soan-de-xuat-E10-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_hong
  verified_at: 2026-09-28T10:29:19Z

- eval: E10b
  run_id: minted-may-soan-de-xuat-E10b-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_lai
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3w0dfuxba_test

- eval: E10d
  run_id: minted-may-soan-de-xuat-E10d-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Ran 5 tests across 1 file. [810.00ms]

- eval: E11
  run_id: minted-may-soan-de-xuat-E11-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_duyet_may
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Ran 14 tests across 1 file. [1300.00ms]

- eval: E11b
  run_id: minted-may-soan-de-xuat-E11b-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vynv13nj_test

- eval: E11u
  run_id: minted-may-soan-de-xuat-E11u-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_duyet_may
  verified_at: 2026-09-28T10:29:19Z
  screenshot: evidence/E11u-step1.png
  observed: |
    Đọc trực tiếp 5 file ảnh vừa lưu (Read tool, không suy từ log): E11u-step1.png (msd-duyet-b1-1440.png, 1440px, tab Chờ duyệt→Bước 1): tiêu đề "Bước 1 · Nguồn nói gì", đúng 3 đoạn được tô nền cam trong khối nguồn — "Kể từ ngày 01/10/2026", "tầng hai là 1,5%", "tầng ba là 1,8%" — không có nút Duyệt ở bước này. Khớp AC. E11u-step2.png (msd-duyet-b2-1440.png, 1440px, sau khi bấm 'Đã đọc nguồn, xem bản máy soạn'): hai khối "Nguồn" (trái) và "Bản máy soạn" (phải) nằm cùng một hàng, mép trái/phải rõ ràng lệch nhau theo chiều ngang — đúng bố cục hai cột cạnh nhau. E11u-step3.png (msd-duyet-390.png, 390px): còn đúng "Bước 2 · Đối chiếu với bản máy soạn" nhưng bố cục đổi thành hai thẻ (segmented control) "Nguồn" / "Bản máy soạn" xếp trên cùng một hàng nút bấm, nội dung hiện dưới dạng một cột; không thấy dấu hiệu cuộn ngang trong ảnh. E11u-step4.png (msd-duyet-tick-1440.png, 1440px, sau khi tick 3 ô): cả 3 dòng ở bảng "Con số và ngày" đều có ô vuông xanh lá đã tick kèm chữ "Đã đối chiếu" — khớp trạng thái đã tick trước khi bấm Duyệt. E11u-step5.png (msd-doc-nguon.png, màn đọc sau khi Duyệt): trang "Chính sách hoa hồng công ty đối tác", "Phiên bản 2 · duyệt 28/09/2026"; mục "Nguồn" bên phải hiện tên tệp "quyet-dinh.docx" cùng nút "Tải về" — khớp AC. Không có mâu thuẫn nào giữa nội dung ảnh và Expected — tất cả 5 khung hình đúng như man-duyet-may.mjs đã khẳng định bằng DOM check.
  network_observed: n-a (driver)

- eval: E11s
  run_id: design-gate-40e4645265
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T10:29:19Z
  output: |
    }

- eval: E12
  run_id: minted-may-soan-de-xuat-E12-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_khong_ro
  verified_at: 2026-09-28T10:29:19Z

- eval: E13
  run_id: minted-may-soan-de-xuat-E13-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khoa_rieng
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3waofzahn_test

- eval: E13b
  run_id: minted-may-soan-de-xuat-E13b-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_bien_ba_nha
  verified_at: 2026-09-28T10:29:19Z
  output: |
    KHO_TAI_LIEU_AI_GATEWAY_API_KEY: co o capabilities.ts

- eval: E16
  run_id: minted-may-soan-de-xuat-E16-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_cua_ai
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3wb01tri0_test

- eval: E14
  run_id: minted-may-soan-de-xuat-E14-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_ranh_gioi
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Ran 11 tests across 2 files. [304.00ms]

- eval: E15a
  run_id: minted-may-soan-de-xuat-E15a-r5
  status: not-run
  not_run_note: khai không-chạy từ 04/10 theo dòng sổ d-20261004T123430Z-91 (chủ kho duyệt gói B); lúc ký vòng 5 (28/09) thoát mã không, có ba tệp nguồn thật
  baseline: red
  verifier: config:executors.script.msd_soan_that
  verified_at: 2026-09-28T10:29:19Z
  output: |
    phien-do: xong — mã 0

- eval: E15j
  judged_by: judge-subagent panel (carried, không chấm lại vòng này)
  verdict: UNCERTAIN
  rationale: Panel giữ nguyên từ round 2 — inputs (bieu-mau, man-duyet-may.mjs) không đổi, không chấm lại; rationale xem round 2. Đề xuất tổng thể của panel là PASS nhưng lens operational-feasibility còn UNCERTAIN.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: UNCERTAIN (r2)
    - spec-alignment: PASS (r2)
  required_evidence:
    - Ảnh chụp Bước 2 · Đối chiếu với bản máy soạn của trang bieu-mau ở 1440px NGAY KHI VỪA MỞ (chưa cuộn) — xác nhận cột phải có tiêu đề «Bản máy soạn» và nội dung hiển thị, không phải mảng đen trống, giống cấu trúc đã thấy ở hai ảnh b2-1440 của quyet-dinh-hoa-hong và quy-trinh
    - Một ghi chú hoặc video ngắn xác nhận hai cột Nguồn / Bản máy soạn ở màn duyệt bieu-mau cuộn ĐỘC LẬP với nhau (cuộn cột nguồn xuống sâu không làm mất nội dung cột bản máy soạn) — nếu xác nhận được đây chỉ là draft ngắn hơn nguồn (không phải lỗi hiển thị), verdict đổi thành PASS
  human_override: Đạt — Phan Le Manh 2026-09-28

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_test-r5
  exit_code: 0
  verified_at: 2026-09-28T10:29:19Z
  output: |
    test-run: dropped crm_mul3vjpwvh3w_test

- cmd: bunx turbo run lint --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-28T10:29:19Z

- cmd: bun run lint:slop
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-28T10:29:19Z
  output: |
    Finished in 1.3s on 2016 files with 9 rules using 14 threads.

- cmd: bunx turbo run build --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-28T10:29:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

E11s, E14 — cả hai xanh trên cả nhánh và baseline diffBase (green-on-both):
- E11s (config:executors.script.msd_san_thiet_ke, AC-11): design-gate --mode static chạy trên toàn bộ tệp tsx của khu tài-liệu; vòng này không có target mới nào vi phạm nên baseline cũng xanh — đây là regression-guard bình thường của toàn khu, không phải bằng chứng riêng cho may-soan-de-xuat.
- E14 (config:executors.test.msd_ranh_gioi, AC-14): quét ranh giới subagent (tool allowlist, sandbox deny-all, khuôn di động) — cấu hình ranh giới này đã tồn tại từ trước và không đổi theo round, nên baseline cũng xanh.

## Variance

none — every multi-run eval is uniform (không eval nào có runs > 1 trong vòng này).

## Iterations

Round 3: E2t (AC-12) đỏ vì thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng; lệnh suite "bun run test" cũng đỏ với 19 ca ngoài phạm vi tính năng — mọi test riêng của may-soan-de-xuat đều pass. Verdict: REJECT.
Round 4: E2t (AC-12) vẫn đỏ, cùng nguyên nhân — thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo riêng (mã thoát 2, không phải mã nguồn bị đổi để né); mọi eval khác (E1…E16, panel E15j carried) và cả bốn lệnh suite (bun run test, turbo lint, lint:slop, turbo build) đều thoát mã 0. Verdict: REJECT — chỉ vướng E2t.
Round 5 (vòng này): E2t (AC-12) đã xanh sau khi sổ ghi sửa trước round 5 (commit 4a28ff7d, dọn tệp thử bằng @vercel/blob của packages/db) — phiên đo riêng có BLOB_READ_WRITE_TOKEN thật, phien-do báo "xong — mã 0". Mọi eval khác (E1…E16) và cả bốn lệnh suite đều thoát mã 0. Panel E15j (AC-15) vẫn carried từ round 2 — lens operational-feasibility còn UNCERTAIN, chờ human_override. Verdict: PENDING-JUDGMENT — chỉ còn vướng phán quyết người ở E15j.

### Re-pin lần 1 — 2026-09-28, do gộp onehub và vòng kho-nguon-khoa-rieng chạm thước; E1 của may-soan-de-xuat neo vào migration của hồ sơ
run_id: repin-20260928T140638Z-39911
sha: 095f1dc10bcb70d6a424ec7f9743e7983a964442 · suites: 4 lệnh exit 0 · evals: 26/26 eval máy đạt kỳ vọng · ngoài làn máy: E2u, E11u, E15j (E15j không khai paths) · diff chạm vật đo ngoài làn máy: E2u, E11u — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 2 — 2026-09-28, do gộp onehub lần hai (#196) trước khi mở PR
run_id: repin-20260928T141942Z-73088
sha: fe33822dc1e4ffc081efeb7ac94d00018bd26912 · suites: 4 lệnh exit 0 · evals: 26/26 eval máy đạt kỳ vọng · ngoài làn máy: E2u, E11u, E15j (E15j không khai paths)

### Re-pin lần 3 — 2026-10-05, do sửa thước đỏ lô 2-4 (g2)
run_id: repin-20261005T050537Z-69105
sha: df01345e0af096a5310ed5f99d5a3b580ae3d234 · suites: 7 lệnh exit 0 · evals: 24/24 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2t, E15a · ngoài làn máy: E2u, E11u, E15j · diff chạm vật đo ngoài làn máy: E2u, E11u — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-15

### Re-pin lần 4 — 2026-10-06, do sửa thước đỏ lô 2-4 (g2c)
run_id: repin-20261006T110836Z-56430
sha: e3b979ae92631d509c9868e6f8b03c345cbd4fac · suites: 7 lệnh exit 0 · evals: 24/24 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E2t, E15a · ngoài làn máy: E2u, E11u, E15j · AC không có chốt máy: AC-15
