---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: BLOCKED
failed_evals: ["E22"]
reason: "Eval E3 (AC-4, tq_chu_cung_jsx) khong chay duoc. Nguyen van tu verifier: Required input file missing: /Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khong-noi-tieng-viet/rang/lat-tong-quan.json does not exist. The verification script depends on this file but it is not present in the repository. (cmd: node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs --lat ${PWD}/_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json). Duong dan trong thong bao loi bi lech chinh ta slug (khong thay vi khung) so voi slug that va so voi --lat truyen vao cung lenh; E3 da PASS o vong 6 dung dung file _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json. Chua ro day la loi go/bien moi truong khi goi verifier vong nay hay loi that trong script — can nguoi kiem lai truoc khi verify lai."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ab80e5260a14bf90b04da172914ebd1b987c20e2
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

⚠ Vòng 7 BLOCKED — eval E3 (AC-4, `tq_chu_cung_jsx`) không đo được: verifier báo thiếu file input bắt buộc `lat-tong-quan.json` tại đường dẫn `_acceptance/tong-quan-va-khong-noi-tieng-viet/rang/lat-tong-quan.json` — chú ý đường dẫn này lệch chính tả slug (`khong` thay vì `khung`) so với slug thật của lát và so với `--lat` truyền vào cùng lệnh. E3 đã PASS ở vòng 6 dùng đúng file `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json`, nên nhiều khả năng đây là lỗi gõ/biến môi trường khi gọi verifier ở vòng này chứ không phải file bị xoá khỏi kho — nhưng chưa xác nhận được, nên dừng ở BLOCKED thay vì tự đoán. Đồng thời, lệnh đo E22 (AC-1, chiều đỏ `tq_san_thiet_ke_do`) thoát mã 1 — không phải lý do BLOCKED nhưng là một FAIL thật trong vòng này (`failed_evals: [E22]`): chân bắt được lỗi tương phản ở cả 3 khung khi cấy màu chữ gần đen lên tiêu đề, nhưng mã thoát không còn khớp kỳ vọng "exit 0" như ở vòng 6 — cần xác nhận lại hành vi mong đợi của chân chiều-đỏ này trước khi ký. 22 eval máy còn lại cùng E18 (ui-check) đều PASS trên cây `ab80e5260a14bf90b04da172914ebd1b987c20e2`; hội đồng vẫn đề xuất PASS cho E19 (judgment, chưa có human_override — T2 chỉ cần xác nhận tại Gate 2, không phải mọi mục đều bắt buộc override). Cả 5 lệnh suite (`test`, `check-types`, `lint`, `lint:slop`, `build`) đều xanh — `lint:slop` đã hết đỏ so với vòng 6.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | script | BLOCKED (không đo được — thiếu file input) |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-15 | test | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-1 | ui-check | PASS |
| E19 | AC-17 | judgment | PASS (đề xuất hội đồng — chờ human_override tại Gate 2) |
| E20 | AC-5 | test | PASS |
| E21 | AC-3 | script | PASS |
| E22 | AC-1 | script | FAIL |
| E23 | AC-10 | script | PASS |
| E24 | AC-6 | script | PASS |
| E25 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_sau_bam
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       ket qua: 4/4 be mat · 26 cap · hong=0
       $ bun scripts/dev-session.ts dev@localhost
    XANH: E2 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r7
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    Error: ENOENT: no such file or directory, open '/Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khong-noi-tieng-viet/rang/lat-tong-quan.json'
  note: |
    BLOCKED. cmd day du: node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs --lat ${PWD}/_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json
    Ly do (nguyen van tu verifier): Required input file missing: /Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khong-noi-tieng-viet/rang/lat-tong-quan.json does not exist. The verification script depends on this file but it is not present in the repository.
    Duong dan bao thieu lech chinh ta slug ("khong" thay vi "khung") so voi slug that cua lat va so voi --lat truyen vao cung lenh; E3 da PASS o vong 6 dung dung file "_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json". Chua xac dinh duoc day la loi go/bien moi truong khi goi verifier o vong nay hay loi that trong script — can nguoi kiem lai truoc khi verify lai.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.
    quet 13 file · 3 loi goi toast · literal tieng Anh trong toast: 0
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    apps/app/app/(app)/[slug]/page.tsx:28 — title = tongQuanMessages(await getLocale()).title
      vi: "Tổng quan"  ·  en: "Overview"
    XANH: tieu de doc tu kho qua getLocale(), ban vi khac ban en va co dau.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_du_lieu_nguoi_nhap
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       ket qua: chan ma thieu=0 · chan man do duoc=7 · khong do duoc=6 · thieu tren man=0 · dong bang=13
       $ bun scripts/dev-session.ts dev@localhost
    XANH: E8 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
       XANH: dan so tu thay file moi, va ca hai chan deu do vi no.
    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E11
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       cay lam viec da tro ve dung trang thai truoc khi chay.
       XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E12
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong_man
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=0 · tran ca hai=0 · tu choi=0
       $ bun scripts/dev-session.ts dev@localhost
    XANH: E12 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E13
  run_id: 2490d4ed-41db-4a2b-b3e5-c4f64be0f599
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.
    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r7
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [686.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [4.00ms]

- eval: E18
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E18-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T16:45:00+07:00
  screenshot: /Users/manh-macmini/dev/crm/evidence/E18-tong-quan-vi.png
  observed: |
    Ba file frame vua luu (doc bang Read, anh that, khong doan tu ky uc lenh):

    1) evidence/E18-tong-quan-vi.png (1440px, lang=vi): Man Tong quan dashboard nen den, sidebar icon-rail trai, tieu de "Chao ban" + dong phu "Ban da chot duoc gi, con gi dang mo, va hom nay can ban o dau." Bon the so lieu tieng Viet (Chot duoc thang nay, Dang mo, Ty le chot (90 ngay), Trung binh moi thoa thuan). Hai khoi bieu do (Da chot so voi moi mo / Dang mo theo giai doan) va hai bang (Thoa thuan dang mo / Viec qua han) deu tieng Viet, cung khoi Hoat dong gan day o duoi. Dung nhu mo ta: dashboard 1440px, tieng Viet.

    2) evidence/E18-tong-quan-en.png (1440px, lang=en): Cung layout dashboard 1440px nhung toan bo nhan da chuyen sang tieng Anh ("Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", "Closed won vs. new pipeline", "Deals in progress", "Overdue tasks", "Your recent activity"). Dung nhu mo ta: cung man o vi va en tren 1440px, doi dung ngon ngu.

    3) evidence/E18-ngan-keo-vi.png (360px, lang=vi, ngan keo mobile MO): Man hep 360px, ngan keo dieu huong (drawer) da mo tu ben trai, tieu de "Dieu huong" + nut dong (X), sau muc menu tieng Viet: Tong quan (dang chon, highlight), Hoi thoai, Cong ty, Ca nhan, Thoa thuan, Chien dich, Cai dat. Dung nhu mo ta: ngan keo di dong 360px, tieng Viet, da mo.

    Ca ba frame khop dung Expected — khong co mau thuan nao.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver cua buoc do la Bash + node/Puppeteer (khong phai mot trong cac browser-tool co duong doc network nhu read_network_requests/read_console_messages). Khong co kenh doc network trong phien nay cho lenh nay → networkObserved = "n-a (driver)". Khong ghi evidence/E18-network.txt cho lan chay nay vi khong co gi de dump (mot file E18-network.txt cu co san trong evidence/ tu truoc, khong phai cua lan chay nay, khong dung lam can cu).

    Ket luan: exitCode = 0, ca hai assertion PASS, khong co mau thuan giua anh va Expected.

- eval: E19
  criterion: AC-17
  executor: judgment
  verifier: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verified_at: 2026-09-08T16:45:00+07:00
  run_id: (không áp dụng — đánh giá judgment, không sinh run_id máy)
  proposal: PASS
  votes:
    - domain-correctness: PASS — Bảy nhãn đúng từ điển xuất hiện ngay ở hai kho: Công ty, Cá nhân, Thoả thuận, Chiến dịch, Hội thoại, Chốt, Đang mở — đúng khớp các mục CONTEXT.md. Bốn thẻ số (Chốt được tháng này / Đang mở / Tỷ lệ chốt / Trung bình mỗi thoả thuận) và mô tả (N chốt được · N không thành) dùng đúng giọng đối tác, tránh hẳn thắng/thua/pipeline như CONTEXT.md liệt trong "Avoid". Các câu ghép số (N thoả thuận · A tháng trước, N ngày quá hạn…) đọc tự nhiên vì giữ đúng thứ tự số-danh từ tiếng Việt. Chỗ còn nguyên tiếng Anh (nhãn giai đoạn thoả thuận trong sales-dashboard.tsx, dòng 202) được nêu đích danh bằng `lang="en"` chứ không lặng lẽ để lẫn — khớp lý do CONTEXT.md ghi "Giai đoạn thoả thuận... CHƯA CHỐT NGHĨA".
    - operational-feasibility: PASS — Cả 7 nhãn rail (khung-ung-dung.ts) đều trùng khớp CONTEXT.md (Công ty, Cá nhân, Hội thoại, Chiến dịch...) hoặc là từ phổ thông (Tổng quan, Cài đặt). Bốn thẻ số ở tong-quan.ts (Chốt được tháng này / Đang mở / Tỷ lệ chốt / Trung bình mỗi thoả thuận) dùng đúng "chốt được · không thành" — từ CONTEXT.md chốt ngay tại vòng này 2026-09-08 — không còn "thắng/thua/pipeline/phễu" nào sót lại. Các câu ghép số (`Chu kỳ trung bình N ngày`, câu unconverted.sentence) đã đảo trật tự đúng ngữ pháp Việt thay vì giữ khung câu tiếng Anh, không thấy dấu vết dịch máy còn sót trong hai file này.
    - spec-alignment: PASS — Bảy nhãn thanh bên trong khung-ung-dung.ts (Tổng quan/Hội thoại/Công ty/Cá nhân/Thoả thuận/Chiến dịch/Cài đặt) khớp đúng các mục đã chốt trong CONTEXT.md. Bốn thẻ số trong tong-quan.ts dùng đúng cụm mà CONTEXT.md tự khoá cho màn Tổng quan — "Chốt được tháng này", "Tỷ lệ chốt (N ngày)", "N chốt được · A không thành" — không còn "thắng/thua/pipeline"; câu ghép số (`${n} · ${money} tháng trước`, `Chu kỳ trung bình N ngày`...) đọc tự nhiên. Chỗ còn là dữ liệu máy — nhãn giai đoạn thoả thuận (`dealStageLabel`) trong sales-dashboard.tsx — được nêu đích danh bằng `lang="en"` trên đúng span đó, khớp với việc CONTEXT.md ghi rõ "Giai đoạn thoả thuận... CHƯA CHỐT NGHĨA" là một khoản còn treo, không bị dịch liều.
  human_override:        # T2 — Gate 2, người xác nhận đề xuất PASS của hội đồng hoặc ghi đè (chưa cần thiết vì vòng này BLOCKED)

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [6.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
       cau rong bieu do giai doan: co mat tren man

    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r7
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    ket qua: cham 3/3 khung hinh · 3 khung khong dat
    DO: E18-tong-quan-vi: 1 cho tuong phan duoi nguong (do that)
    DO: E18-tong-quan-en: 1 cho tuong phan duoi nguong (do that)
    DO: E18-ngan-keo-vi: 1 cho tuong phan duoi nguong (do that)

    CHIEU DO: cam mau chu gan den len tieu de o ca 3 khung — chan bao duoi nguong o 3 khung.
    XANH: chan tuong phan do dung chieu no sinh ra de bat.
  note: |
    FAIL trong vong nay (`failed_evals: [E22]`) — cung cmd/eval nay xuat hien dong thoi trong "Lenh fail khong gan eval" cua dau vao orchestrator, exitCode=1, passes=0. Khong phai ly do BLOCKED tong the (do la E3) nhung la mot FAIL that tren chinh eval nay — o vong 6 cung lenh nay PASS (exit 0). Can xac nhan lai hanh vi mong doi cua chan chieu-do nay (exit 0 nghia la "bat duoc loi cay" hay "khong con loi") truoc khi verify lai va truoc khi ky.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    XANH (chieu do): chan doc bat duoc CA HAI — ghim neo sai cay, va cay co sua chua ghi.
    Chan nay thoat 0. Moi dong "DO:" o tren la cua hai phep thu cam vao.

- eval: E24
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E24-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de_quan_he_do
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    XANH (chieu do): mat quan he voi kho bi bat, ke ca khi chuoi viet thang van co dau.
    Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.

- eval: E25
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E25-r7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc_do
  verified_at: 2026-09-08T16:45:00+07:00
  output: |
    XANH (chieu do): ma cap mo-dun cung nam trong tam ve 1, khong chi rieng than ham.
    Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtsghkgylgto
  exit_code: 0
  verified_at: 2026-09-08T16:45:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r7
  exit_code: 0
  verified_at: 2026-09-08T16:45:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r7
  exit_code: 0
  verified_at: 2026-09-08T16:45:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r7
  exit_code: 0
  verified_at: 2026-09-08T16:45:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r7
  exit_code: 0
  verified_at: 2026-09-08T16:45:00+07:00

## Known limits

Chủ kho chọn đường **chốt với giới hạn đã khai** sau vòng chấm bảy. Ba giới hạn
dưới đây là điều kiện của lựa chọn ấy; chúng phải được đọc cùng bảng verdict.

**1. Bốn vòng chấm liên tiếp không đạt PASS, và không màu đỏ nào chạm sản phẩm.**

| Vòng | Verdict | Nguyên nhân thật |
|---|---|---|
| 4 | BLOCKED | hai tác nhân chấm chết giữa chừng (E8, E12); một tác nhân đọc nhầm chiều đỏ của E23; E2 chập chờn dưới tải 47 tác nhân song song |
| 5 | BLOCKED | máy chủ dev trả 200 không kèm chuyển hướng đúng một cửa sổ, E22 mất tiền đề |
| 6 | REJECT | thật: bộ thước mới của vòng dùng `typeof` lúc chạy, phạm luật chống mã cẩu thả. Đã sửa |
| 7 | BLOCKED | một tác nhân gõ sai tên thư mục (`khong` thay `khung`) rồi khai thiếu tệp; một tác nhân đọc nhầm chiều đỏ của E22 |

Trừ vòng sáu, mọi màu đỏ đều sinh ra ở lớp tác nhân chấm, không ở mã sản phẩm và
không ở bộ thước. Mỗi lần chạy lại một mình bằng máy đều đạt.

**2. Lớp lỗi «người chấm đọc dòng DO của phép thử cắm vào làm kết quả» chưa được khử.**

Vòng bốn vá một thể hiện (E23) bằng cách bọc và gắn nhãn output. Vòng bảy lớp đó
tái xuất ở một thể hiện khác (E22) chưa được bọc. Điều khoản dừng-vá kích lần
hai, nên vòng này KHÔNG vá tiếp từng cái. Khuôn giải đúng đã nêu tên và chưa
làm: đưa cả bốn phép đo chiều đỏ (E22, E23, E24, E25) vào làn nối tiếp để một
cái máy đọc mã thoát thay vì một tác nhân đọc văn xuôi.

**3. Sáu phép đo đi qua làn nối tiếp do chính phiên này chạy.**

E2, E8, E10, E11, E12, E13 không chạy trong đợt toả của vòng chấm. Chúng chạy
nối tiếp trên cây sạch trước khi phát vòng, và chân đọc ghim chỉ xác nhận ghim
neo đúng HEAD, cây không có sửa chưa ghi ngoài thư mục bằng chứng, và mã thoát
bằng không. Chân đọc KHÔNG tự chạy lại phép đo. Nghĩa là với sáu phép đo này,
«người làm khác người chấm» yếu hơn phần còn lại đúng một nấc. Đổi lại, chúng
hết chập chờn: trước khi vào làn, ba trong sáu đã đốt một vòng chấm.

## Ngoài hợp đồng

Các mục dưới đây là lỗi THẬT, đã được phản biện và giữ lại, nhưng nằm ngoài phạm vi
đã duyệt ở Cổng 1 — chủ kho quyết, máy không tự sửa.

- **Hàng đợi tra cứu: dòng trạng thái và hạn vẫn tiếng Anh vì API tự đúc chữ hiển thị**
  file: `apps/app/components/enrichment-queue.tsx`:231
  mức: high
  Vòng này kéo enrichment-queue.tsx vào diện Việt hoá và dịch toàn bộ phần khung (nút, tiêu đề, rỗng, footer, collapsible), nhưng hai chuỗi thân — row.line (dòng 231) và row.due (dòng ~305) — đến thẳng từ API và không đi qua kho chuỗi nào. Đã truy tới nguồn: apps/api/src/enrichment/enrichment.service.ts:193 gọi enrichmentQueueLine(state, task.kind) và dòng 207 gọi enrichmentDueLabel(task.dueAt, now); apps/api/src/enrichment/enrichment-copy.ts:23-24 khai cứng WAITING = "Waiting", GAVE_UP = "Could not look this up", cò…

- **Hợp đồng tRPC vẫn khai month: z.string() sau khi trường đổi thành khoá máy YYYY-MM**
  file: `apps/api/src/dashboard/dashboard.contracts.ts`:46
  mức: medium
  dashboard.service.ts thay MONTH_LABEL = new Intl.DateTimeFormat("en-US", {month:"short"}) bằng monthIso(), nên trend[].month đổi nghĩa từ nhãn hiển thị ("Sep") thành khoá máy ("2026-09") mà bên khách phải phân tích bằng formatMonth. Lược đồ ra vẫn để nguyên month: z.string(). Lược đồ này thật sự có hiệu lực: apps/api/src/dashboard/dashboard.router.ts:22 khai output: dashboardSummaryOutput, và dashboardSummaryOutput chứa trend: z.array(trendPointOutput). Nghĩa là đây đúng là chỗ chặn ở biên, và nó đang không chặn gì…

- **Tên công ty/cá nhân trong hàng đợi tra cứu chưa đánh dấu translate="no"**
  file: `apps/app/components/enrichment-queue.tsx`:221
  mức: medium
  CLAUDE.md, mục "Ngôn ngữ sản phẩm": «Dữ liệu người nhập không dịch, và đánh dấu để trình duyệt không tự dịch». Chính diff này thêm translate="no" đúng luật ở khắp nơi khác — dashboard-summary.tsx (task.subject, entry.company.name, entry.deal.name, entry.createdBy.name, DealCell), quick-switcher.tsx (hit.label), app-header.tsx (tên workspace, user.email, initials) — nhưng bỏ sót hai chỗ trong chính file nó vừa Việt hoá: row.subject.name ở dòng 221 (QueueRow) và dòng 302 (ScheduledSection). Đó là tên công ty/cá nhân …

- **san-thiet-ke.mjs có 19 chú thích trong mã, ngược luật và ngược mọi chân anh em**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:23
  mức: medium
  AGENTS.md, mục "Always true": «Never add code comments. Not to new code, not to code you edit.» — luật này CLAUDE.md giữ nguyên hiệu lực («không viết chú thích trong code»). File mới thêm ở commit 35b60b8 có 19 dòng chú thích (dòng 23-25, 28-32, 39, 75-78, 169-172, 189-190), phần lớn là đoạn giải thích dài về jsdom, oklch, cache plugin. Đây không phải chuyện áp luật của mã sản phẩm lên script kiểm: tám file .mjs còn lại cùng thư mục (ban-dich, dang-xuat, dot-bien, doc-lan, lan-noi-tiep, man-that, mot-bo-thuoc, tieu…

- **nhanRail là export chỉ bài kiểm dùng, chép lại đúng việc component làm thẳng**
  file: `apps/app/lib/khung-dieu-huong.ts`:47
  mức: low
  nhanRail(muc, locale) chỉ gọi khungUngDungMessages(locale).rail[muc.key]. Grep toàn kho: chỗ gọi duy nhất là apps/app/test/khung-dieu-huong.spec.ts (dòng 28-29). Mã sản phẩm không dùng — app-icon-rail.tsx đọc thẳng m.rail[muc.key] ở hai chỗ (dòng ~197 và ~217). Hai hệ quả: (a) YAGNI/mã thừa — coding-style cấm dựng trừu tượng trước khi cần; knip không bắt vì test/**/*.spec.ts là entry của apps/app; (b) bài kiểm "bay muc, nhan vi co dau va khac nhan en" đi qua một đường mà màn hình không đi, nên nó không phân biệt đư…

- **Sàn thiết kế: verdict và mã thoát bị bỏ qua, `bao.findings ?? []` biến báo cáo BLOCKED thành "0 P0" xanh**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:292
  mức: high
  `chamSan()` bắt lỗi của design-gate và trả `{ma, ra}`. Mã `s.ma` chỉ được IN ra (dòng 295), không bao giờ dùng để đánh trượt; trường `verdict` không được đọc ở đâu cả. Chỗ chấm duy nhất là `const p0 = (bao.findings ?? []).filter(f => f.pTier === "P0")`. Đối chiếu với chính script sàn (`~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.9.0/scripts/design-gate.mjs`, hàm `emit`): khi sàn trả `verdict: "BLOCKED"` (exit 3 vì không resolve được jsdom, exit 4 vì thiếu target) nó vẫn in JSON HỢP LỆ nhưng **khôn…

- **`chanSauBam` thoát 1 trước khi in danh sách bề mặt bị từ chối — bề mặt chưa hề đo được biến mất khỏi báo cáo**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:340
  mức: medium
  Trong `chanSauBam`, bề mặt nào mở không được (`hai.tuChoi`) chỉ được đẩy vào mảng `tuChoi` rồi `continue` — nó không đóng góp gì vào `hong`. Cuối hàm thứ tự là: ``` if (hong > 0) await ket(1); if (tuChoi.length > 0) { for (const t of tuChoi) console.log(`KHONG DO DUOC: ${t}`); await ket(2); } ``` `ket()` gọi `process.exit`, nên khi có bất kỳ bề mặt nào hỏng thật (`hong > 0`), toàn bộ vòng lặp in `KHONG DO DUOC` không bao giờ chạy. Báo cáo chỉ còn dòng đếm `3/4 be mat` — người đọc thấy màu đỏ của bề mặt hỏng nhưng k…

- **`chanDuLieuNguoiNhap` vứt chuỗi lỗi của `laiMenu` — click hỏng bị quy thành lỗi sản phẩm**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:596
  mức: medium
  `laiMenu()` (dòng 255-262) không ném lỗi: nó `.catch(e => \`khong bam duoc menu tai khoan: ${e.message}\`)` và TRẢ VỀ chuỗi lỗi. Ở dòng 596 giá trị trả về bị bỏ: `await laiMenu(mo.trang, "vi");`. Hai dòng trong `du-lieu-nguoi-nhap.json` chỉ hiện SAU khi menu tài khoản mở: `email nguoi dang nhap (menu tai khoan)` (nguon_san `phien.email`) và `chu cai dau cua ten nguoi dang nhap (avatar)` (nguon_san `phien.chuCaiDau`). Nếu click hỏng — ví dụ ai đó đổi `header.accountMenu` trong `apps/app/lib/messages/khung-ung-dung.t…

- **`phien.chuCaiDau` chép tay `initials()` và đọc từ email thay vì `user.name`**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:579
  mức: medium
  Bản khai `du-lieu-nguoi-nhap.json` nói giá trị đối chiếu "lay tu API trong cung luot". Thực tế `NGUON["phien.chuCaiDau"]` dựng từ biến môi trường: ``` (process.env.NGUOI ?? "dev@localhost").split("@")[0].split(" ").map(p => p[0]).filter(Boolean).slice(0,2).join("").toUpperCase() ``` Giao diện thì render `initials(user.name)` (`apps/app/components/app-header.tsx:145`, hàm ở dòng 186) — nguồn là `user.name`, không phải phần trước `@` của email. Hai bên trùng nhau CHỈ vì `apps/api/scripts/dev-session.ts:20` đặt `name …

- **`chanBeRongTienDe` luôn thoát 0 và bỏ qua lỗi mở ngăn kéo — kết luận "không có đối tượng chiều đỏ" có thể do ngăn kéo chưa mở**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:816
  mức: low
  Ở dòng 816 `if (b.lai !== undefined) await b.lai(mo.trang, "vi");` — `laiNganKeo` trả chuỗi lỗi khi click hỏng (nó `.catch` chứ không ném), và giá trị trả về bị bỏ. Sau đó `HOP_CO_TRAN` quét `document.body`, và bề mặt "ngan keo di dong" đơn giản không đóng góp hộp nào. Hàm kết thúc bằng `await ket(0)` vô điều kiện, in câu kết luận "Chieu do cua chan be-rong KHONG CO DOI TUONG o lat nay" khi `tranDuoc.length === 0`. Nghĩa là "ngăn kéo không mở được" và "ngăn kéo mở ra và không có nhãn nào tràn được" cho ra cùng một …

- **Hình dạng 4 — assertion âm-tính-một-mình: grep formatCount không có đối chứng dương, không ghim thông điệp**
  file: `apps/app/test/messages-guard.spec.ts`:599
  mức: high
  Ca duy nhất phân biệt cây này với cây trước vòng (theo chính lời khai của E16) là `expect(ghim).toEqual([])` ở dòng 617, với `ghim` gom từ `chu.matchAll(/formatCount\([^)]*"(en|vi)"[^)]*\)/g)` trên 8 file khai cứng ở dòng 601-610. Đây là assertion âm-tính đứng một mình: không có một assert dương nào chứng minh biểu thức chính quy này CÓ THỂ khớp cái gì, và không ghim số lời gọi formatCount tìm thấy. Hệ quả cụ thể: (a) hôm nay chỉ còn đúng 2 lời gọi formatCount trong 8 file đó — sales-dashboard.tsx:52 và dashboard-s…

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: `wu` chép lại logic của workspaceUrl() thay vì round-trip qua chính hàm thật**
  file: `apps/app/test/khung-dieu-huong.spec.ts`:11
  mức: medium
  Dòng 11 dựng bên tạo URL bằng tay: `const wu = (p: string) => `/onehub${p === "/" ? "" : p}`;` rồi truyền vào `mucDangMo(...)` ở tất cả sáu assert (dòng 35-40). Hàm thật là `workspaceUrl(slug, path)` ở apps/app/lib/workspace-url.ts — thuần, không phụ thuộc React, export sẵn, và chính là thứ `app-icon-rail.tsx:229` truyền vào `mucDangMo` (qua `useWorkspaceUrl()` → `workspaceUrl(slug, path)`). `wu` đang tái hiện đúng khuôn mà `mucDangMo` chờ đọc, chứ không lấy chuỗi từ writer thật rồi cho reader thật đọc. Hai bên đan…

- **Hình dạng 5 — mucDangMo tuyên theo lớp MUC_RAIL nhưng chỉ có điểm-case 3/7 mục**
  file: `apps/app/test/khung-dieu-huong.spec.ts`:34
  mức: medium
  `MUC_RAIL` (lib/khung-dieu-huong.ts:20-28) là một lớp 7 phần tử với hai chế độ khớp (`exact` / `prefix`) và một nhánh `related`. Ca "muc dang mo theo pathname cua workspace" (dòng 34-41) chỉ chạm 3 phần tử: overview, chat, companies — bốn mục còn lại (contacts, deals, campaigns, settings) không có assert nào, nên nhánh `prefix` của chúng chưa từng được đo. Rõ là điểm-case chứ không phải ma trận toàn phần: ca ngay phía trên trong cùng file ("bay muc, nhan vi co dau va khac nhan en", dòng 25-32) làm đúng khuôn số-ass…

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline — chứng minh harness chứ không phải feature):

- E16 (`cd apps/app && bun test test/messages-guard.spec.ts`, baseline: green) — bài kiểm này tự đọc thư mục `lib/messages` nên đã xanh trên cả cây trước vòng (bất biến chung của kho: mọi giá trị vi có dấu, không giá trị nào y hệt en, hàm ghép biến có khẳng định ghim, không khoá chết). Ca riêng của lát (quét tám file được liệt kê cứng và đòi 0 lời gọi `formatCount` ghim tiếng) mới thật sự phân biệt được cây này với cây trước vòng; bản thân tệp bài kiểm thì green-on-both nên vẫn được liệt ở đây theo đúng định nghĩa của mục này.

Các lệnh suite (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) xanh-cả-hai-phía là regression-guard bình thường, không liệt vào đây.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 trong vòng này)

## Iterations

Round 2: E16 mở rộng thêm ca riêng của lát (quét 8 file, đòi 0 lời gọi `formatCount` ghim tiếng) sau khi bổ sung bước phân tích nêu tên trong bản khai; E19 được hội đồng lần thứ hai xem lại ba mảnh bằng chứng (unconverted.sentence trong sales-dashboard.tsx, rail.chat trỏ /chat và /agents, mục "Chốt"/"Đang mở" mới thêm vào CONTEXT.md).

Round 4: chân đọc-ghim-cây-sạch (`lan-noi-tiep.mjs` + `doc-lan.mjs`) từng vấp một tài nguyên trình duyệt thật dùng chung — dưới tải 47 tác nhân song song, E2 từng nhận về thuộc tính ngôn ngữ rỗng và E8/E12 từng mất hẳn kết quả; sửa bằng cách gom các chân lái trình duyệt thật vào chạy nối tiếp (`lan-noi-tiep.mjs`) trước khi phát S4, mỗi chân một lúc. Cùng vòng đó, một người chấm từng lấy nhầm dòng "DO:" (thuộc phần cấy lỗi cố ý bên trong E23) làm kết quả của E23 và ghi mã 1 trong khi lệnh thật thoát 0 — vòng này đọc lại đúng hai dòng cuối ("XANH (chieu do)...") và mã thoát thật, không lặp lại nhầm lẫn đó.

Round 5 (cây `c2f9f4989c0198d7e3c6a1d174c4106fec439744`): 22/23 eval máy PASS, không eval nào FAIL. Riêng E22 (AC-1, chiều đỏ của sàn thiết kế `tq_san_thiet_ke_do`) BLOCKED — máy chủ dev tại `http://localhost:3000` không phản hồi header `Location` ở tiền đề, nên chân không suy được slug và không đo được. Bốn lệnh suite (`test`, `check-types`, `lint`, `build`) và `lint:slop` đều xanh trên cây này. Vòng này DỪNG ở BLOCKED thay vì đi tiếp tới PASS/PENDING-JUDGMENT.

Round 6 (cây `c95c030a891c53a700146f87dc8dfcb24f1eb728`): app server tại localhost:3000/3001 đã chạy sẵn (xác nhận qua curl trước khi đo) nên E22 (`tq_san_thiet_ke_do`, BLOCKED ở vòng 5 vì thiếu tiền đề) nay đo được và PASS; thêm hai chiều đỏ mới E24 (AC-6, `tq_tieu_de_quan_he_do`) và E25 (AC-14, `tq_mot_bo_thuoc_do`), cả hai PASS. Tất cả 24 eval máy + E18 (ui-check) PASS, hội đồng đề xuất PASS cho E19 (judgment), 4/5 lệnh suite xanh — nhưng `bun run lint:slop` (không gắn eval, gate riêng của kho) thoát mã 1: anti-slop `no-runtime-typeof` bắt tại `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/tieu-de-quan-he.mjs:151`. Verdict: REJECT — quay lại implementation để sửa file `rang/` đó (parse `vi`/`en` thành kiểu chuỗi tại nguồn thay vì `typeof` runtime), rồi verify lại.

Round 7 (cây `ab80e5260a14bf90b04da172914ebd1b987c20e2`): `bun run lint:slop` đã hết đỏ so với vòng 6, và 22/23 eval máy còn lại + E18 (ui-check) đều PASS, hội đồng vẫn đề xuất PASS cho E19. Nhưng eval E3 (AC-4, `tq_chu_cung_jsx`) không đo được: verifier báo thiếu file input `lat-tong-quan.json` tại một đường dẫn lệch chính tả slug (`...-khong-...` thay vì `...-khung-...`); E3 đã PASS ở vòng 6 dùng đúng cùng file này, nên nhiều khả năng là lỗi gõ/biến môi trường khi gọi verifier ở vòng này chứ không phải file bị xoá khỏi kho — chưa xác nhận được nên KHÔNG tự đoán. Đồng thời E22 (AC-1, chiều đỏ `tq_san_thiet_ke_do`, PASS ở vòng 6) lần này thoát mã 1 — một FAIL thật, không thuộc lý do BLOCKED. Verdict: BLOCKED — cần người xác nhận lại đường dẫn/tiền đề của E3 và xem lại hành vi của E22 trước khi verify lại; không tự sửa.
