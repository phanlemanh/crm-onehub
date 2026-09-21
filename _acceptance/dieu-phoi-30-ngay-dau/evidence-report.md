---
schema_version: 2
feature_slug: dieu-phoi-30-ngay-dau
verdict: BLOCKED
failed_evals: []
reason: |
  Hai eval khong chay duoc: (1) E11 (ui-check, AC-11) — khong phai loi san
  pham, ma Next.js 16 khoa mot-tien-trinh-moi-thu-muc; mot next dev khac
  (PID 59628) dang giu khoa, app-cay-nay khong khoi dong duoc. AC-11 se duoc
  bao dam bang mat nguoi tai phien nghiem thu. (2) E15 (test, AC-3) — agent
  thuc thi bi skip/chet.
  Sau do, verifier doc lap chay lai E2 (buoc-chua-giao, AC-2): PASS, exit
  code 0, run_id muatdm4ig5hb. Tong ket: 13/15 eval PASS (E1–E10, E12–E14),
  1 PASS-recheck (E2), 2 BLOCKED (E11, E15). Toi Cong Bang Chung: E11 la
  chan ha tang, khong phai bat hai san pham.
verified_by: fresh-context verification subagent + independent verifier (Phan Le Manh)
enforcement_mode: strict
bypass_used: false
verified_commit: 027d1e13f202e1b8514f2a4f091dd42970351350
human_signoff:
---

# Evidence Report: dieu-phoi-30-ngay-dau

Ghi chú: vòng chấm lại này vẫn là **Round 1** (BLOCKED không tiêu một vòng
trong ba vòng cho phép của S4), chạy sau khi ba lỗi TRONG hợp đồng mà vòng
soi trước tìm ra đã được sửa. 13 eval máy (E1–E10, E12–E14) và bốn lệnh
suite hồi quy đều PASS trên HEAD `03a09dc7`. Hai eval không chạy được: E11
(ui-check, AC-11) — chặn hạ tầng khác hẳn vòng trước (khoá
một-tiến-trình-mỗi-thư-mục của Next.js do một `next dev` dài hạn khác giữ,
không phải cổng bị chiếm); E15 (test, AC-3, vế "bộ lọc nằm trong query
param") — agent thực thi bị skip/chết, không có kết quả. Xem `reason` ở
frontmatter và các khối Evidence của E11/E15 bên dưới.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-11 | ui-check | BLOCKED |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E14 | AC-14 | test | PASS |
| E15 | AC-3 | test | BLOCKED |

## Evidence

- eval: E1
  run_id: minted-dieu-phoi-30-ngay-dau-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_chep_khong_tham_chieu
  verified_at: 2026-09-20T09:30:00Z
  output: |
     6 expect() calls
    Ran 2 tests across 1 file. [130.00ms]
    test-run: dropped crm_mu9y1veq8lvf_test

- eval: E2
  run_id: mu9y1wat9d0r
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_buoc_chua_giao_van_co_bo_phan
  verified_at: 2026-09-20T09:30:00Z
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [133.00ms]
    test-run: dropped crm_mu9y1wat9d0r_test

- eval: E3
  run_id: minted-dieu-phoi-30-ngay-dau-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_danh_muc_loc_va_ngay_im
  verified_at: 2026-09-20T09:30:00Z
  output: |
     1045 expect() calls
    Ran 315 tests across 33 files. [584.00ms]
    test-run: dropped crm_mu9y7hcipkn9_test

- eval: E4
  run_id: mu9y1qqeu1x9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_bac_la_moc_ngay
  verified_at: 2026-09-20T09:30:00Z
  output: |
    Ran 1 test across 1 file. [122.00ms]
    test-run: dropped crm_mu9y1qqeu1x9_test

- eval: E5
  run_id: minted-dieu-phoi-30-ngay-dau-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_lo_sai_tu_choi_tron
  verified_at: 2026-09-20T09:30:00Z
  output: |
    4 expect() calls
    Ran 1 test across 1 file. [191.00ms]
    test-run: dropped crm_mu9y1z191hfw_test

- eval: E6
  run_id: mu9y22j6mqux
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_khong_khop_viet_agenttask
  verified_at: 2026-09-20T09:30:00Z
  output: |
    15 expect() calls
    Ran 3 tests across 1 file. [238.00ms]
    test-run: dropped crm_mu9y22j6mqux_test

- eval: E7
  run_id: mu9y1v4ufijy
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_thieu_khoa_tra_503
  verified_at: 2026-09-20T09:30:00Z
  output: |
     3 expect() calls
    Ran 2 tests across 1 file. [232.00ms]
    test-run: dropped crm_mu9y1v4ufijy_test

- eval: E8
  run_id: mu9y1fr1j581
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_doi_ten_bo_phan_khong_mat
  verified_at: 2026-09-20T09:30:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [164.00ms]
    test-run: dropped crm_mu9y1fr1j581_test

- eval: E9
  run_id: mu9y1xbme4c8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.dp30_trang_thai_chua_co_khuon
  verified_at: 2026-09-20T09:30:00Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [150.00ms]
    test-run: dropped crm_mu9y1xbme4c8_test

- eval: E10
  run_id: minted-dieu-phoi-30-ngay-dau-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.dp30_hang_so_o_config
  verified_at: 2026-09-20T09:30:00Z
  output: |
    hang-so-o-config: sach — 7 tep quet, 0 ghim ngoai cau hinh, cau hinh co nguoi dung

- eval: E11
  cannot_run: true
  exit_code: 2
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-20T09:30:00Z
  network_observed: n-a (driver)
  reason: |
    app-cay-nay (cong 3300, apps/app) khong khoi dong duoc — khong phai do
    cong 3300/3301 bi chiem (ca hai deu ranh khi kiem truoc), ma do Next.js 16
    co khoa mot-tien-trinh-moi-thu-muc du an: da co san mot `next dev` khac
    dang chay TRONG CHINH thu muc apps/app cua cay nay (PID 59628, cong 3000,
    thoi gian song ~15h17p, log: "Another next dev server is already
    running... PID: 59628, Dir: /Users/manh-macmini/dev/crm/apps/app"). Khi
    chay `PORT=3300 bun run dev` trong cung thu muc, no in "Ready" roi tu
    thoat ma 1 ngay sau vi phat hien khoa `.next/dev/lock` da bi PID 59628
    giu; cong 3300 khong bao gio lang nghe (xac nhan bang lsof va 45 lan curl
    deu tra 000). Khong tat PID 59628 vi khong phai server do luot cham nay tu
    khoi dong (quy tac: chi tat server minh start; port da co server san thi
    dung chung va khong tat) — day ro rang la tien trinh nen dai han cua
    nguoi dung/phien khac, khong phai cua luot cham nay. Vi vay khong the
    dung ca hai may chu cua CAY DANG XET nhu buoc 2 doi hoi, nen khong the
    chay tiep buoc 3 (chan cay hai phia qua APP_URL) cho toi khi con lai. Day
    la chan ha tang thuc su, khong phai loi san pham AC-11.
  output: |
    Assertion-by-assertion:
    1. Kiem cong truoc: lsof -nP -iTCP:3300 -sTCP:LISTEN -t va cong 3301
       tuong tu -> ca hai RANH truoc khi bat dau. PASS (khong bi chiem).
    2. Buoc 2 cua E11 — dung ca hai may chu cua CAY DANG XET (api 3301, app
       3300): api-cay-nay PASS (PID 76778, curl 200 on dinh qua 45 lan lap);
       app-cay-nay FAIL — log "Ready in 155ms" roi ngay sau do "Another next
       dev server is already running... PID: 59628 ... Dir:
       /Users/manh-macmini/dev/crm/apps/app" -> tien trinh tu thoat ma 1;
       lsof -nP -iTCP:3300 -sTCP:LISTEN -t sau do RONG; 45 lan curl trong 90s
       deu tra ma 000.
    3. Buoc 3 (chan cay hai phia qua APP_URL/API_URL): khong chay duoc — phia
       APP_URL khong co gi de xin dau moc. Dung theo dung tinh than cua buoc
       nay: khong nhan lai duoc mot trong hai -> thoat ma 2, khong doc con so
       nao tren anh.
    4-8. Khong thuc hien: gieo du lieu, doc lai, tao phien, mo man danh muc,
       chup evidence/E11-danh-muc.png va evidence/E11-danh-muc-768.png — tat
       ca phu thuoc APP_URL dang song, nen bo qua ma khong doan ket qua.
    Don dep: da kill 76778 (api-cay-nay do minh tu khoi dong) va xac nhan
    cong 3301 tro lai RONG. KHONG dung cham PID 59628.
    evidence/: khong co file nao duoc tao. screenshotPath: khong co.
    observed: rong — khong co khung hinh nao de doc.
    network_observed goc: n-a (driver).

- eval: E15
  cannot_run: true
  baseline: n-a
  verifier: config:executors.test.dp30_bo_loc_nam_trong_duong_dan
  verified_at: 2026-09-20T09:30:00Z
  reason: |
    Agent thuc thi phep do nay (lenh `cd apps/app && bun test
    test/dieu-phoi-trang-thai.spec.ts -t bo-loc-duong-dan`) bi skip hoac chet
    giua chung — khong co ket qua tra ve, khong co exit code, khong co
    output de doc. Khong duoc tinh la PASS khi khong co bang chung thuc thi;
    day la cannotRun thu hai cua vong nay, doc lap voi chan ha tang cua E11.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-20T09:30:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-20T09:30:00Z

- cmd: bun run lint:slop
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-20T09:30:00Z

- cmd: bunx turbo run build --force
  run_id: minted-dieu-phoi-30-ngay-dau-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-20T09:30:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet).

## Variance

none — every multi-run eval is uniform.

## Iterations

Round 1: 14/15 eval máy (E1–E10, E12–E15) và bốn lệnh suite hồi quy (bun run test, turbo lint, lint:slop, turbo build) đều PASS trên HEAD 38cea6a6. E11 (ui-check, AC-11) không chạy được: cổng 3300/3301 của cây đang xét bị một worktree khác (busy-chatterjee-fc04e2) chiếm dụng — chặn môi trường/hạ tầng, không phải lỗi sản phẩm. Báo cáo dừng ở BLOCKED, chưa thể kết luận AC-11.
Round 1 (chạy lại — BLOCKED không tiêu vòng): ba lỗi TRONG hợp đồng của vòng soi (bắt đầu từ lỗi E12 đo bộ giảm thuần thay vì dựng màn hồ sơ) đã được sửa. 13/15 eval máy (E1–E10, E12–E14) và bốn lệnh suite hồi quy PASS trên HEAD 03a09dc7. Hai cannotRun mới, khác nguyên nhân vòng trước: E11 (ui-check, AC-11) — app-cây-này không khởi động được vì Next.js 16 khoá một-tiến-trình-mỗi-thư-mục, một `next dev` dài hạn khác (PID 59628) đang giữ khoá `.next/dev/lock` trong chính thư mục apps/app của cây đang xét (không phải do cổng 3300/3301 bị chiếm — cả hai đều rảnh khi kiểm trước); E15 (test, AC-3) — agent thực thi bị skip/chết, không có kết quả. Báo cáo tiếp tục BLOCKED, chưa thể kết luận AC-11 và vế «bộ lọc nằm trong query param» của AC-3.
Round 1 (verifier độc lập, 2026-09-21): Chạy lại E2 (buoc-chua-giao, AC-2) bằng lenh: `bun run test -- "cd apps/api && bun test test/dieu-phoi.spec.ts -t buoc-chua-giao"` trên HEAD 027d1e13 → PASS, exit code 0, run_id muatdm4ig5hb. Tong ket: 13/15 eval PASS (E1–E10, E12–E14), 1 PASS-recheck (E2), 2 BLOCKED (E11 Next.js-khoa, E15 agent-skip). Nhiet luc toi Cong Bang Chung: E11 la chan ha tang, khong phai bat hai san pham AC-11.
