---
schema_version: 2
feature_slug: kho-tai-lieu
verdict: PENDING-JUDGMENT
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3e378c8dd5de8b8da7fa2658bcab474f384de2b6
human_signoff: 
---

# Evidence Report: kho-tai-lieu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | ui-check | PASS |
| E13 | AC-13 | test | PASS |
| E13b | AC-13 | ui-check | PASS |
| E14 | AC-14 | ui-check | PASS |
| E14j | AC-14 | judgment | UNCERTAIN |
| E15 | AC-15 | test | PASS |
| E16 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-kho-tai-lieu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktl_migration_chi_them
  verified_at: 2026-09-27T15:07:36Z
  output: |
    merge-base: f51b5ba1d515
    migration moi: 20260930010000_kho_tai_lieu · so cau lenh: 32

- eval: E1b
  run_id: minted-kho-tai-lieu-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktl_migration_tren_ban_sao
  verified_at: 2026-09-27T15:07:36Z
  output: |
    anh chup sau: user=2 organization=1 member=2 company=3 department=2
    extension: pg_trgm, unaccent · unaccent: Quy dinh
    khang-dinh=8/8

- eval: E2
  run_id: minted-kho-tai-lieu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_tao_trang
  verified_at: 2026-09-27T15:07:36Z
  output: |
     31 expect() calls
    Ran 4 tests across 1 file. [1227.00ms]
    test-run: dropped crm_mujydp3is6t3_test

- eval: E2b
  run_id: minted-kho-tai-lieu-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_tao_loi
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     9 expect() calls
    Ran 3 tests across 1 file. [602.00ms]

- eval: E3
  run_id: mujydpdzj6ck
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_khong_ro
  verified_at: 2026-09-27T15:07:36Z
  output: |
     72 expect() calls
    Ran 3 tests across 1 file. [1.99s]
    test-run: dropped crm_mujydpdzj6ck_test

- eval: E4
  run_id: mujydojxm3m1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_duyet
  verified_at: 2026-09-27T15:07:36Z
  output: |
     24 expect() calls
    Ran 2 tests across 1 file. [1241.00ms]
    test-run: dropped crm_mujydojxm3m1_test

- eval: E5
  run_id: mujydpvm5oa3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_quyen_duyet
  verified_at: 2026-09-27T15:07:36Z
  output: |
     297 expect() calls
    Ran 14 tests across 2 files. [8.72s]
    test-run: dropped crm_mujydpvm5oa3_test

- eval: E5b
  run_id: minted-kho-tai-lieu-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_duyet_quyen
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [566.00ms]

- eval: E6
  run_id: minted-kho-tai-lieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_so_va_dat
  verified_at: 2026-09-27T15:07:36Z
  output: |
    test-run: dropped crm_mujye1zj3z0r_test
    EXIT_CODE: 0

- eval: E6b
  run_id: minted-kho-tai-lieu-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_de_xuat_cu
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [594.00ms]

- eval: E7
  run_id: mujydpf04c6u
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_tra_lai
  verified_at: 2026-09-27T15:07:36Z
  output: |
     19 expect() calls
    Ran 1 test across 1 file. [1139.00ms]
    test-run: dropped crm_mujydpf04c6u_test

- eval: E7b
  run_id: minted-kho-tai-lieu-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_tra_lai
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [444.00ms]

- eval: E8
  run_id: mujydp82paum
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_sua_trang
  verified_at: 2026-09-27T15:07:36Z
  output: |
     26 expect() calls
    Ran 2 tests across 1 file. [1202.00ms]
    test-run: dropped crm_mujydp82paum_test

- eval: E8b
  run_id: mujyellc4ds5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_sua_va_nhan
  verified_at: 2026-09-27T15:07:36Z
  output: |
    Ran 1 test across 1 file. [881.00ms]
    test-run: dropped crm_mujyellc4ds5_test
    EXIT_CODE=0

- eval: E9
  run_id: minted-kho-tai-lieu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_trinh_soan_nut
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     51 expect() calls
    Ran 25 tests across 1 file. [1002.00ms]

- eval: E9b
  run_id: minted-kho-tai-lieu-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_soan_giu_thay_doi
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     29 expect() calls
    Ran 10 tests across 1 file. [1322.00ms]

- eval: E10
  run_id: minted-kho-tai-lieu-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_khu_hoi
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     30 expect() calls
    Ran 17 tests across 1 file. [964.00ms]

- eval: E10b
  run_id: minted-kho-tai-lieu-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_de_xuat_trung
  verified_at: 2026-09-27T15:07:36Z
  output: |
     9 expect() calls
    Ran 1 test across 1 file. [891.00ms]
    test-run: dropped crm_mujydqeu00pm_test

- eval: E10c
  run_id: mujye0nb8pcd
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_bat_dong_qua_may_chu
  verified_at: 2026-09-27T15:07:36Z
  output: |
     17 expect() calls
    Ran 1 test across 1 file. [885.00ms]
    test-run: dropped crm_mujye0nb8pcd_test

- eval: E10d
  run_id: minted-kho-tai-lieu-E10d-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_man_sua_chua_doi
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     13 expect() calls
    Ran 3 tests across 1 file. [575.00ms]

- eval: E11
  run_id: minted-kho-tai-lieu-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_dan_tu_word
  verified_at: 2026-09-27T15:07:36Z
  output: |
     0 fail
     12 expect() calls
    Ran 12 tests across 1 file. [815.00ms]

- eval: E12
  run_id: kho-tai-lieu-E12-r2-3e378c8d
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktl_bo_go_viet
  verified_at: 2026-09-27T15:07:36Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/evidence/E12-step1.png
  observed: |
    E12-step1.png (doc truc tiep bang Read, la anh PNG that): man /tai-lieu/moi, o "Tên trang" = "Quy định về hoa hồng đối tác hgrl" (co hau to random cho ten duy nhat, dung quy uoc script), o soan ProseMirror focus (vien xanh) hien dung 1 dong "Quy định về hoa hồng đối tác" — day du dau (đ, ị, ồ, đ, ố) khop chinh xac chuoi DONG_1 mong doi sau khi phat chuoi composition Telex tung buoc. Khong thay ky tu la, khong thay chu tho "Quy dinh" con sot. Khop Expected buoc 1.
    E12-step2.png (doc truc tiep bang Read, la anh PNG that): cung man, o soan gio hien HAI doan van ban tren cung mot dong rieng: "Quy định về hoa hồng đối tác" roi "Nguyên tắc hài hoà" (dung "hoà" — xac nhan truong hop Enter giua luc dang composition 'hoa'->'hoà' khong bi mat chu hay nhan doi), tiep theo la mot danh sach gach dau dong (bullet, nut "danh sach khong thu tu" tren toolbar dang bat/highlight) voi hai muc "mục một" va "mục hai" — khop dung cau truc MONG_DOI (2 doan + danh sach 2 muc). Khop Expected buoc 2 va 3.
    Ca hai anh KHONG mau thuan Expected — noi dung khop hoan toan chuoi/markdown mong doi dang NFC.
  network_observed: n-a (driver)
  output: |
    CHIEU DO (--chieu-do) — KHONG chay trong luot nay: bo-go-viet.mjs co doan `if (process.argv.includes("--chieu-do")) await chieuDo(...)` voi doi tuong CAY_DO cam mot doan handleDOMEvents.compositionupdate vao ban sao trinh-soan.tsx (tat xu ly composition dung, chen tung ky tu tho qua view.dispatch), ghim mong doi "buoc 1: sai chu". Day la co che chieu-do da co san trong script (kiem tra bang doc code, khong tu chay them vi khong nam trong danh sach steps bat buoc cho lan chay chinh nay va se ton them mot vong worktree/bun install rieng). Khong tinh vao PASS/FAIL cua eval chinh.
    KET LUAN: moi assertion may-kiem-duoc deu PASS, ca hai anh doc truc tiep deu khop Expected, exit code cuoi cung cua toan bo pipeline (tien-de → phien-do → bo-go-viet) la 0 ("phien-do: xong — ma 0"). exitCode = 0.

- eval: E13
  run_id: mujyejo8ragv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_diff
  verified_at: 2026-09-27T15:07:36Z
  output: |
    Ran 1 test across 1 file. [809.00ms]
    test-run: dropped crm_mujyejo8ragv_test
    EXIT_CODE=0

- eval: E13b
  run_id: crm_kho_tai_lieu_do (that run) + crm_ktl_duyet_chieu_do_do (mutation run)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktl_man_duyet
  verified_at: 2026-09-27T15:07:36Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/.acceptance-runs/kho-tai-lieu/evidence/ktl-duyet-1440.png
  observed: |
    ktl-duyet-1440.png (1440px, tab Chờ duyệt → đề xuất mở qua /tai-lieu/de-xuat/{id}): trang diff hiển thị "48" gạch ngang màu đỏ cạnh "24" gạch chân màu xanh trong dòng "Đối tác gửi bảng kê trong 48 24 giờ sau khi chốt kỳ" — khớp cặp ins/del đổi số. Câu "Bộ phận tài chính kiểm tra số liệu trước khi chuyển khoản." hiện gạch ngang toàn dòng (del, câu bị bỏ). Câu "Phòng Đối tác trả lời khiếu nại trong ba ngày làm việc." hiện trong khung nền xanh lục nhạt bo góc (ins, câu thêm) — nền rõ ràng khác trong suốt, đúng cấu hình được đo bằng DOM (ins.backgroundColor khác transparent, del.textDecorationLine chứa line-through). Có nút "Duyệt" (xanh, nổi bật) và "Trả lại". ktl-duyet-390.png (390px, cùng đề xuất): bố cục xếp dọc responsive, cùng nội dung diff và nút Duyệt/Trả lại, không thấy thanh cuộn ngang, mép phải nội dung nằm gọn trong viewport 390px. ktl-doc-sau-duyet.png (sau khi bấm Duyệt, điều hướng về /tai-lieu/{slug}): tiêu đề "Quy trình đối soát hoa hồng", dòng phụ đề "Quy trình · Phiên bản 2 · duyệt 27/09/2026" — khớp mẫu "Phiên bản 2 · duyệt dd/mm/yyyy" (ngày 27/09/2026 = hôm nay theo giờ VN); nội dung trang đã chốt bản mới: "Đối tác gửi bảng kê trong 24 giờ sau khi chốt kỳ" (không còn ins/del, không còn câu "Bộ phận tài chính kiểm tra số liệu trước khi chuyển khoản."), và câu mới "Phòng Đối tác trả lời khiếu nại trong ba ngày làm việc." đã có mặt như văn bản thường. Cả ba frame đều mở bằng Read (ảnh đọc trực tiếp), không dựa vào log.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver là puppeteer nội bộ trong man-lib.mjs (không phải Claude_Browser/ego-browser MCP mà tôi điều khiển trực tiếp) — tôi không có đường đọc network/console của phiên puppeteer đó ngoài log console.error mà chính script đã tự bắt và báo cáo (0 lỗi, không tạo file evidence/E13b-network.txt vì điều kiện "driver là browser tool có đường đọc network" không thỏa) → networkObserved = "n-a (driver)".
    Kết luận: exitCode=0, mọi assertion PASS, xác nhận bằng cả log máy lẫn đọc trực tiếp 3 ảnh, cộng thêm mutation-kill test xác nhận assertion 1 là thật (không phải cờ giả).

- eval: E14
  run_id: phien-do kho crm_kho_tai_lieu_do (app :4419, api :4663) cho lenh chinh; phien-do kho crm_ktl_danh_sach_chieu_do_do (app :4606, api :4600) cho --chieu-do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktl_man_danh_sach
  verified_at: 2026-09-27T15:07:36Z
  screenshot: /Users/manhphan/dev/crm-onehub/.claude/worktrees/kho-tai-lieu/_acceptance/kho-tai-lieu/evidence/ktl-kho-rong.png
  observed: |
    Doc truc tiep ca 5 file PNG vua luu bang Read (khong doan tu log):
    1. ktl-kho-rong.png (1440): trang "Tài liệu", tab "Trang" active, giua man hinh la khoi rong voi icon, dong chu "Chưa có trang nào", va nut xanh la "Viết trang đầu tiên" — dung Expected buoc 1.
    2. ktl-danh-sach-1440.png (1440): bang danh sach 5 hang trang (Quy trinh tiep nhan doi tac moi/Do Minh Khang, Chinh sach cong tac phi/Do Minh Khang, Chinh sach thuong quy/Tran Thi Mai co the "Co ban cho duyet", Quy dinh bao mat du lieu khach hang/Tran Thi Mai co the "Co ban cho duyet", Quy dinh ve hoa hong doi tac/Tran Thi Mai). Tab "Cho duyet" mang badge so "2". Hang bo loc: "Tat ca 5", "Quy dinh 2", "Chinh sach 2", "Quy trinh 1", "Bieu mau 0" — khop dung DEM_LOAI va SO_CHO=2 ky vong.
    3. ktl-danh-sach-390.png (390, mobile): cung danh sach 5 hang xep doc, cung bo dem "Tat ca 5/Quy dinh 2/Chinh sach 2/Quy trinh 1", tab "Cho duyet 2"; khong thay dau hieu tran ngang.
    4. ktl-doc-390.png (390): man doc trang "Quy dinh ve hoa hong doi tac", dong "Quy dinh · Phien ban 1 · duyet 27/09/2026", nut "Sua trang", noi dung day du (Pham vi/Muc hoa hong/Thoi diem chi tra/Khieu nai) khong tran ngang, khong thay muc luc (dung voi bo cuc hep).
    5. ktl-doc-1440.png (1440): cung trang, co cot phai "Tren trang nay" liet ke Pham vi/Muc hoa hong/Thoi diem chi tra (thut vao)/Khieu nai (dung mucMong 4 muc), khoi "Chu trang: Tran Thi Mai", dong "Quy dinh · Phien ban 1 · duyet 27/09/2026". Tat ca khop Expected buoc 4.
    Ca 5 anh dong nhat, khong anh nao thieu hay mau thuan Expected.
  network_observed: n-a (driver)
  output: |
    Network truth: driver la script puppeteer-core rieng (khong phai mcp Claude_Browser/claude-in-chrome), khong co duong read_network_requests/read_console_messages. Console loi trang duoc chinh script theo doi noi bo (listener console/pageerror trong moTrang()) va khong ghi nhan loi nao trong ca hai lan chay chinh (khong co dong "loi console app"). Da ghi/lam moi evidence/E14-network.txt voi ket luan nay. networkObserved = "n-a (driver)" (gia tri nay khong lam eval fail theo luat).
    Tong ket: MOI assertion cua eval E14 (bon buoc + tong ket) va cua phan CHIEU DO trong Expected deu PASS. exitCode tra ve = 0.

- eval: E14j
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Danh sách (1440 và 390) phân biệt rõ trang đang dùng vs "Có bản chờ duyệt", nút "Trang mới"/"Viết trang đầu tiên" và "Duyệt" đều rõ, và màn duyệt ở 1440 đọc được kiểu Track Changes (thêm tô nền xanh/gạch chân, bỏ gạch ngang đỏ) với nhãn toàn chữ thường không thuật ngữ. Nhưng bộ ảnh không có màn duyệt (nơi có Track Changes) chụp ở khổ 390 — chỉ có ktl-duyet-1440.png — nên không đủ căn cứ xác nhận vế "bố cục 390 dùng được" cho đúng màn hình mà câu hỏi hỏi tới.
    - operational-feasibility: UNCERTAIN — Ở khổ 1440, mọi nhãn đều bằng chữ thường ai cũng hiểu (Có bản chờ duyệt, Trang mới, Chủ trang, Bản đề xuất, Duyệt, Trả lại) và màn duyệt (ktl-duyet-1440.png) đúng kiểu Track Changes: chữ thêm tô nền xanh gạch chân, chữ bỏ gạch ngang đỏ, không một thuật ngữ kỹ thuật nào lộ ra màn hình. Nhưng bộ ảnh chỉ có 390 cho màn danh sách và màn đọc trang (ktl-danh-sach-390.png, ktl-doc-390.png) — không có ảnh màn duyệt ở 390, nên không có căn cứ để nói bố cục 390 "dùng được" cho đúng phần việc mà câu hỏi nhấn mạnh nhất: đọc diff kiểu Track Changes.
    - spec-alignment: UNCERTAIN — Các ảnh 1440 chứng minh tốt phần cốt lõi: badge "Có bản chờ duyệt" phân biệt trang đang chờ, nút "Trang mới"/"Duyệt"/"Trả lại" rõ ràng, và màn duyệt hiện chữ thêm gạch chân/tô nền xanh, chữ bỏ gạch ngang đỏ — không nhãn nào dùng từ kỹ thuật (markdown, diff, hash...). Nhưng bộ ảnh đưa vào chỉ có danh-sách-390 và đọc-390, không có ảnh màn duyệt ở khổ 390, nên phần "bố cục 390 dùng được" của câu hỏi — áp cho đúng màn duyệt kiểu Track Changes — không có căn cứ để xác nhận hay bác bỏ.
  rationale: Cả ba lens đều UNCERTAIN vì cùng một lý do — bộ ảnh vòng này không có ảnh màn duyệt (/tai-lieu/de-xuat/[id]) chụp ở khổ 390px, chỉ có ktl-duyet-1440.png. Phần cốt lõi của AC-14 (đọc diff kiểu Track Changes, nhãn không thuật ngữ) đã chứng minh tốt ở 1440px, nhưng vế "bố cục 390 dùng được" áp cho đúng màn duyệt thì chưa có căn cứ.
  required_evidence:
    - Ảnh chụp màn duyệt (route /tai-lieu/de-xuat/[id], ví dụ trang "Quy trình đối soát hoa hồng" đang dùng trong bộ ảnh này) ở khổ viewport 390px, lưu vào _acceptance/kho-tai-lieu/evidence/ (ví dụ ktl-duyet-390.png), cho thấy diff một cột và các nút Duyệt/Trả lại vẫn thao tác được ở bề rộng đó — nếu có ảnh này và layout dùng được, verdict đổi thành PASS.
    - Một ảnh chụp màn duyệt (route /tai-lieu/de-xuat/[id]) ở khổ 390px, tương tự ktl-duyet-1440.png nhưng viewport mobile — cho thấy dải diff (chữ thêm/bỏ, dải "Con số và ngày bị đổi", nút Duyệt/Trả lại) có đọc được và không vỡ bố cục ở 390 hay không; nếu ảnh này tồn tại và cho thấy diff một cột vẫn đọc được, đọc rõ, verdict đổi thành PASS.
    - Ảnh chụp màn duyệt (trang /tai-lieu/de-xuat/[id]) ở khổ 390px — vd ktl-duyet-390.png — cho thấy diff một cột (theo đúng mô tả "Khổ 390: ... diff một cột" ở mục 4 Hành vi của spec) vẫn đọc được chữ thêm/bỏ và bấm được nút Duyệt/Trả lại trong viewport hẹp
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: mujyepe3hcoa
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_lien_ket_tim
  verified_at: 2026-09-27T15:07:36Z
  output: |
     21 expect() calls
    Ran 1 test across 1 file. [880.00ms]
    test-run: dropped crm_mujyepe3hcoa_test

- eval: E16
  run_id: design-gate-e03bd7653e
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ktl_san_thiet_ke
  verified_at: 2026-09-27T15:07:36Z
  output: |
      "hits": [],
      "findings": []
    }

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mujydoyi5pge
  exit_code: 0
  verified_at: 2026-09-27T15:07:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-kho-tai-lieu-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-27T15:07:36Z

- cmd: bun run lint:slop
  run_id: minted-kho-tai-lieu-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-27T15:07:36Z

- cmd: bunx turbo run build --force
  run_id: minted-kho-tai-lieu-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-27T15:07:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

E5 (bun run test -- "cd apps/api && bun test test/tai-lieu-quyen.spec.ts test/vai-chi-okr.spec.ts") — pass trên cả HEAD lẫn baseline (round 1), không phân biệt được feature. Đây là bộ test quyền OKR có sẵn từ trước khi thêm module tai-lieu; giữ nguyên như regression-guard có chủ ý (xác nhận taiLieu.* không phá quyền vai OKR hiện có), không viết lại thành eval mới cho AC-5 vì AC-5 đã có E5b riêng đo hành vi mới (ẩn/hiện nút duyệt) trên component thật.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: S4 lượt 1 REJECT — bảng ins/del trong màn duyệt (liên quan E13/E13b) và hai lệnh suite (`bunx turbo run lint --force`, `bunx turbo run build --force`) đỏ. Đã sửa bảng trong màn duyệt và hai lệnh suite; quay lại S4 cho vòng 2 (báo cáo này).
