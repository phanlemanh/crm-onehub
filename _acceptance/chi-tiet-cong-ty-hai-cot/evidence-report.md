---
schema_version: 2
feature_slug: chi-tiet-cong-ty-hai-cot
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 24885a55e795489359f84ce653daa92c71bf4c52
human_signoff: Manh Phan 2026-10-23
---

# Evidence Report: chi-tiet-cong-ty-hai-cot

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E8 | AC-7 | ui-check | PASS |
| E7 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chi-tiet-cong-ty-hai-cot-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E1-step1.png
  observed: |
    E1-step1.png (1440): ngan ben phai; tab 'Tong quan' dang chon; muc 'GIOI THIEU' (doan 3 cau) nam tren muc 'CHI TIET'; 'CHI TIET' chiem tron be rong noi dung tab (tu mep trai den mep phai ngan), cac hang thuoc tinh xep hai cot (Ten/Website/Email/... cot trai; Ten mien/Dien thoai/Thanh pho/... cot phai); duoi la o tep 'Hop dong ...' rong het ngang voi dong tep PDF (ten day du, nut Mo/Xoa cung hang o ben phai) va vung keo tha co nut 'Chon tep' cung hang voi 'Keo tep vao day'; sau do khoi Kara va muc 'LIEN KET'. Khong con cot phai 320px. Luu y: anh nay mang hau to ctcglof5 (lan chay song song khac ghi de), bo cuc dung Expected. E1-step2.png (768): ten cong ty hau to ctcgklut (lan nay); 'GIOI THIEU' nam tren 'CHI TIET'; 'CHI TIET' rong het noi dung tab, hai cot thuoc tinh (Ten/Ten mien, Website/Dien thoai...), o tep rong het hang, dong tep co nut Mo/Xoa cung hang, vung keo tha mot hang. Ca hai khop Expected (gioi thieu truoc chi tiet, chi tiet rong bang noi dung tab, >=2 cap hang hai cot).
  network_observed: n-a (driver)
  output: |
    Frame da luu: E1-step1.png (sao tu ctc-cong-ty-1440.png), E1-step2.png (sao tu ctc-cong-ty-768.png). Cac frame khac cung lan: ctc-o-tep-1440, ctc-keo-tha-*-375, ctc-lien-he-1440, ctc-thoa-thuan-1440, ctc-cong-ty-trong-1440, ctc-tai-lieu-1440.
    Network: driver la puppeteer trong script, khong co duong doc network trong phien nay, khong ghi E1-network.txt.
    Luu y: thu muc evidence dung chung nen mot lan chay song song cua eval khac da ghi de ctc-cong-ty-1440.png luc 11:17; bo cuc giong het va so do 1440 cua lan nay lay tu log.

- eval: E2
  run_id: minted-chi-tiet-cong-ty-hai-cot-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E2-step1.png
  observed: |
    Opened E2-step1.png with Read: the 1440px company sheet on the Overview tab. The Chi tiet section is a two-column grid; the Tep field row, labelled "Hop dong ctcgn1...", spans the right-hand wide column, measured width 808px (over the 600px minimum).
    The file row sits inside a bordered box with the title in full on one line ("Hop dong hop tac An Phu — ban ky chinh thuc nam 2026 ctc.pdf", no ellipsis), and "Mo" and "Xoa" buttons at the right end of the same row, level with the title block. Below it is a dashed drop zone with the "Chon tep" button on the left and the text "Keo tep vao day" plus "PDF, DOCX, PNG, JPG · toi da 20 MB · 10 tep" on the same row to its right. Matches Expected: one wide Tep cell, file name not cut, buttons on the same row, drop zone on one row.
  network_observed: n-a (driver)
  output: |
    Frame saved: evidence/E2-step1.png (copy of the script's own ctc-o-tep-1440.png, same directory).
    Network: the driver is a script (puppeteer via do-bo-cuc.mjs) with no network-reading tool available, so E2-network.txt was not written.

- eval: E3
  run_id: minted-chi-tiet-cong-ty-hai-cot-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E3-step1.png
  observed: |
    E3-step1.png (ngan Cong ty An Phu, 375 rong): trong tab Tong quan co the tep 'Hop dong hop tac An Phu...' roi vung keo tha vien dut. Ben trong: nut 'Chon tep' o tren cung, ngay duoi la dong chu 'Keo tep vao day' dung 1 dong (khong bop), duoi nua la dong mo ta 'PDF, DOCX, PNG, JPG · toi da 20 MB · 10 tep' tren 1 dong, rong gan het vung. Khop expected. E3-step2.png (ngan Lien he Lan ctcglof5): cung bo cuc — nut 'Chon tep', chu 'Keo tep vao day' 1 dong duoi nut, dong mo ta 1 dong day vung; khong tran ngang. Khop expected. E3-step3.png (ngan Thoa thuan An Phu): cung bo cuc — 'Chon tep' tren, 'Keo tep vao day' 1 dong duoi nut, mo ta 1 dong rong; ngan khong tran. Khop expected. Ca ba frame nhat quan voi so do: vung 333px, mo ta 299px, chu 1 dong, duoi nut.
  network_observed: n-a (driver)
  output: |
    Cac buoc khac cua cung lan chay cung dat: buoc 1, 2, 4 (207 phan tu, tran 0), 5, 6, 7.
    Frame luu (ban sao tu anh do-bo-cuc ghi, mtime 11:18): evidence/E3-step1.png (cong ty), E3-step2.png (lien he), E3-step3.png (thoa thuan); goc: ctc-keo-tha-cong-ty-375.png, ctc-keo-tha-lien-he-375.png, ctc-keo-tha-thoa-thuan-375.png cung thu muc.
    Network: driver la script puppeteer, khong doc duoc network qua tool; khong ghi E3-network.txt. Chieu do tren ban sao (E7, --chi-do) khong thuoc pham vi lan chay nay.

- eval: E4
  run_id: minted-chi-tiet-cong-ty-hai-cot-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png (doc truc tiep): ngan cong ty 'Cong ty An Phu ctcgo31y' mo o khung 375 rong. Tieu de xuong dong, nut hanh dong va nut dong nam gon trong khung; hang the con 'Tong quan | Ca nhan 1 | Thoa thuan 1 | Hoat dong' vua khung (the 'Hoat dong' hien day du, khong thay thanh cuon ngang cua trang); the tep Hop dong va vung keo tha 'Chon tep / Keo tep vao day / PDF, DOCX, PNG, JPG - toi da 20 MB - 10 tep' nam gon trong be rong ngan, ten tep bi cat bang dau ba cham, khong thay noi dung tran phai. Khop Expected (khong tran ngang o 375). Anh nay la ngu canh tu buoc 3; ket qua do buoc 4 doc tu E4-run.txt: 207 phan tu, tran 0, bo qua 1 hang the con trong khung cuon ngang, 'buoc 4: dat'.
  network_observed: n-a (driver)
  output: |
    Cac buoc 1,2,3,5,6,7 cung dat (ngoai pham vi E4, chi ghi nhan).
    Frame: buoc 4 trong steps khong co lenh chup nen script khong sinh anh rieng cho buoc 4. E4-step1.png la ban sao cua ctc-keo-tha-cong-ty-375.png (ngan cong ty o 375, chup o buoc 3 cung luot) de lam bang chung hinh anh ngu canh; so lieu buoc 4 la tu log, khong tu anh. Cac tep da luu: E4-step1.png, E4-run.txt, E4-network.txt (trong thu muc evidence).
    Network: driver la puppeteer script, khong co tool doc network (n-a (driver)).

- eval: E5
  run_id: minted-chi-tiet-cong-ty-hai-cot-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E5-step1.png
  observed: |
    E5-step1.png (phieu lien he Lan ctcgmqiu, 1440, ngan Tong quan, drawer ben phai): muc CHI TIET hien luoi hai cot ro rang — cot trai Ten/Chuc danh/Dien thoai/X/Cong ty, cot phai Ho/Email/LinkedIn/GitHub/Phu trach (cac hang cung ngang nhau, 5 hang hai cot). Duoi do la hang 'Hop dong ctcgm...' co o Tep rong het be ngang noi dung (~808px): dong tep 'Hop dong hop tac An Phu — ban ky chinh thuc nam 2026 ctc.pdf' kem nut Mo/Xoa, ben duoi la vung keo tha vien net dut, trong do nut 'Chon tep' o ben trai va khoi chu 'Keo tep vao day' + 'PDF, DOCX, PNG, JPG · toi da 20 MB · 10 tep' nam cung mot hang ben phai nut. Khop Expected. E5-step2.png (phieu thoa thuan 'Thoa thuan An Phu ctcgmqiu', 1440, ngan Tong quan): muc CHI TIET cung luoi hai cot (Ten/Tien te/Cong ty ben trai; Gia tri/Ngay chot/Phu trach ben phai, 3 hang hai cot), o Tep rong ~808px voi dong tep + nut Mo/Xoa, vung keo tha 'Chon tep' va 'Keo tep vao day' cung hang. Khong co dau hieu mot cot, o tep hep hay keo tha tach hang. Khop Expected.
  network_observed: n-a (driver)
  output: |
    Frames da luu: E5-step1.png (copy cua ctc-lien-he-1440.png), E5-step2.png (copy cua ctc-thoa-thuan-1440.png), cung ctc-lien-he-1440.png, ctc-thoa-thuan-1440.png, trong thu muc evidence.
    Network: E5-network.txt ghi 'n-a (driver)' (script puppeteer, khong co duong doc network cho verifier).
    Khong chay chieu do (7) vi la viec cua E7.

- eval: E6
  run_id: minted-chi-tiet-cong-ty-hai-cot-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E6-step1.png
  observed: |
    Đã mở E6-step1.png bằng Read. Đây là ngăn bản ghi «Công ty Trống ctcgr8x9» ở khổ 1440, nền tối, ngăn nằm bên phải. Đầu ngăn có tiêu đề, trạng thái «Đang chờ» và nút «Tra cứu lại», «Nhớ Kara tra cứu». Bên dưới là hàng bốn ô số liệu và hàng thẻ con: Tổng quan (đang chọn), Cá nhân, Thoả thuận, Hoạt động, Kara.
    Mục đầu tiên của thẻ Tổng quan có tiêu đề «CHI TIẾT», đúng với expected. Mục này dàn hai cột (Tên, Website, Email… bên trái; Tên miền, Điện thoại, Thành phố… bên phải), kèm trường Tệp «Hợp đồng…» và vùng «Kéo tệp vào đây». Ngay dưới mục Chi tiết có dòng Kara chờ, chữ «Kara đang tra cứu — ngành, mô tả, liên kết mạng xã hội». Dòng này dàn hết bề rộng mục Chi tiết (từ x~482 đến ~1420), top nằm dưới đáy lưới Chi tiết, khớp với số đo 938px/938px.
    Không có tiêu đề «Giới thiệu» và không có khung mục rỗng nào. Không thấy mục «Hoạt động trên web» hay «Liên kết», đúng với ngăn công ty trống. Frame khớp Expected, không có điểm mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    Tên gốc script ghi: evidence/ctc-cong-ty-trong-1440.png.
    Network: driver là script puppeteer của kho, không có đường đọc network qua tool nên không có E6-network.txt.

- eval: E8
  run_id: minted-chi-tiet-cong-ty-hai-cot-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man
  verified_at: 2026-10-23T03:58:15Z
  screenshot: evidence/E8-step1.png
  observed: |
    Đã mở E8-step1.png bằng Read. Khung 1440x900, nền tối. Hộp thoại "Tải nguồn lên" nằm giữa màn hình, mô tả "Kara đọc tệp và soạn một bản đề xuất cho trang...". Trong hộp thoại, vùng kéo thả có viền nét đứt, rộng khoảng 608px (x từ 416 đến 1024). Trên cùng một hàng ngang từ trái sang phải: nút "+ Chọn tệp", rồi khối chữ hai dòng "Kéo tệp vào đây" và "Word (.docx) hoặc PDF, tới 20 MB". Nút và khối chữ cùng hàng, canh giữa theo chiều dọc, không xếp dọc. Phía dưới vùng này là phần "Tệp này cho trang nào", ô Tên trang, ba ô chọn Loại trang, Đơn vị, Chủ trang, và nút Huỷ, Tải lên. Khớp Expected: vùng kéo thả có chữ cùng hàng với nút "Chọn tệp", không có dấu hiệu tách hàng.
  network_observed: n-a (driver)
  output: |
    Frame đã lưu: evidence/E8-step1.png (chép từ ctc-tai-lieu-1440.png do lượt chạy này vừa ghi). Chỉ có một bước chụp nên chỉ có một frame.
    Network: driver là puppeteer bên trong do-bo-cuc.mjs, không có đường đọc network qua công cụ trình duyệt; không có E8-network.txt.

- eval: E7
  run_id: minted-chi-tiet-cong-ty-hai-cot-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctc_man_do
  verified_at: 2026-10-23T03:58:15Z
  output: |
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bunx turbo run lint --force
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bun run lint:slop
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

- cmd: bunx turbo run build --force
  run_id: minted-chi-tiet-cong-ty-hai-cot-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-23T03:58:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Baseline khong do:

- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs --chi-do": BLOCKED ha tang baseline: dau ra thieu dong __BL_XONG — lenh baseline khong chay het (bi dung, cho hop xin quyen, dau ra bi cat, hoac lenh eval vo cu phap shell)

Eval khong-phan-biet: khong xac dinh duoc o round nay — baseline khong do duoc nen moi field baseline la n-a, chua biet eval nao pass ca tren code cu.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong co eval ngau nhien)

## Iterations

Round 1: E1-E8 deu dat, khong eval nao hong; baseline khong do duoc (ha tang), khong co muc phan quyet cho nguoi.
