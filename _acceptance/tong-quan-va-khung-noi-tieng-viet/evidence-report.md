---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: REJECT
failed_evals: [E11]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d1258ef5eeb4eeb31089e750e6b0edc17ab0908a
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | FAIL |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-15 | test | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-1 | ui-check | PASS |
| E19 | AC-17 | judgment | FAIL |
| E20 | AC-5 | test | PASS |
| E21 | AC-3 | script | PASS |
| E22 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_sau_bam
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    cap doi chieu=8 · lech=0 · giong=0 · khong dau=0

    ket qua: 4/4 be mat · 26 cap · hong=0

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    cho: mot chan dot bien dang sua cay tai cho — doi no tra nguyen trang roi moi do.
    bo quet doc 13 file
    ket qua: 6 file .tsx tren dia, tru 0 loai tru co ten, cong 7 khai them = 13 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.
    quet 13 file · 3 loi goi toast · literal tieng Anh trong toast: 0
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    quet 13 file · 1 o nhan (1 tieu de tab + 0 nhan thanh ben) · 0 nhan thanh ben deu giai duoc qua nhom thanhBen (0 khoa) · 0 o con viet thang
    XANH: ca 1 o nhan deu doc tu kho chuoi.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4

    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_du_lieu_nguoi_nhap
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    co   translate="no" — chu cai dau cua ten nguoi dang nhap (avatar) div:4/header:0/div:1/button:1/span:0/span:0#0 = "D"

    ket qua: chan ma thieu=0 · chan man do duoc=7 · khong do duoc=6 · thieu tren man=0 · dong bang=13

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_dan_so_tu_dia
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    chieu xanh: ca hai chan xanh tren cay lanh truoc khi tha file thu.
    tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E11
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E11-r3
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.tq_dot_bien
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    vet "van ban JSX" -> do boi: chu-cung-jsx
    vet "thuoc tinh JSX" -> do boi: moi-chuoi
    vet "toast" -> do boi: toast
    vet "tieu de tai lieu" -> do boi: tieu-de
    vet "khoa object" -> do boi: moi-chuoi
    vet "ham ghep cau" -> do boi: moi-chuoi
       (cho 12000ms cho may chu nap lai truoc khi do — vet nay nam trong ma may chu chay)
    vet "nhan rail" -> do boi: hai-tieng
    KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang

- eval: E12
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_be_rong
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    GIOI HAN KE THUA: mu voi vung chua cho xuong dong.
    ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=0 · tran ca hai=0 · tu choi=0

- eval: E13
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_be_rong_do
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=1 · tran ca hai=0 · tu choi=0
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [389.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [6.00ms]

- eval: E18
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E18-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T14:00:00+07:00
  screenshot: evidence/E18-tong-quan-vi.png
  observed: |
    Doc truc tiep ca 3 file PNG vua luu (10:29, cung lan chay nay) bang Read:
    (1) E18-tong-quan-vi.png — desktop 1440px, dark theme, tieu de "Chao ban", toggle "Toi/Ca doi", 4 the KPI (Chot duoc thang nay, Dang mo, Ty le chot 90 ngay, Trung binh moi thoa thuan), 2 bieu do rong (Da chot so voi moi mo / Dang mo theo giai doan), 2 khoi danh sach (Thoa thuan dang mo / Viec qua han), toan bo nhan chu la tieng Viet co dau. Icon rail doc ben trai hien dien — dung layout desktop.
    (2) E18-tong-quan-en.png — cung layout 1440px y het frame (1), nhung toan bo van ban da chuyen sang tieng Anh: "Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", "Me/Everyone" toggle, "Open deals", "Deals in progress", "Overdue tasks" — dung doi chieu ngon ngu vi/en tren cung mot khung 1440px.
    (3) E18-ngan-keo-vi.png — khung hep 360px (mobile), ngan keo (sheet) dieu huong dang MO de: tieu de "Dieu huong" + nut dong (X), danh sach 7 muc dieu huong tieng Viet co dau: Tong quan (dang chon, sang), Hoi thoai, Cong ty, Ca nhan, Thoa thuan, Chien dich, Cai dat. Phan nen ben phai (vung ngoai sheet) toi den, dung hanh vi overlay cua sheet mobile.
    Ca ba khung deu khop dung mo ta trong Expected: 1440px vi + 1440px en + 360px mobile drawer vi, khong co dau hieu mau thuan.
  output: |
    Ca 3 frame da duoc Read truc tiep (anh) — xem field observed. Noi dung khop hoan toan Expected, khong mau thuan → khong ha exitCode.

    Ghi chu network: driver la Bash + node/puppeteer-core (khong phai browser-tool co read_network_requests/read_console_messages), khong co duong doc network trong phien nay → networkObserved = "n-a (driver)". Khong co dev server nao duoc tu start/stop trong buoc nay — ca hai port 3000 (Next app) va 3001 (bun api) da co san server dang chay tu truoc phien nay (lsof xac nhan LISTEN); dung chung, khong tat.
  network_observed: n-a (driver)

- eval: E19
  judged_by: judge-panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: FAIL
  rationale: |
    - domain-correctness: FAIL — Trong tong-quan.ts, hai khoá `open.cols.deal` (dòng 134) và `activity.cols.deal` (dòng 159) không mang nhãn cột "Thoả thuận" đơn giản như tiếng Anh "Deal", mà mang nguyên câu "Thoả thuận của người dùng trong công ty và toàn bộ quyền đi kèm" — một câu vô nghĩa về quyền hạn, không liên quan gì tới ngữ cảnh tiêu đề cột trong bảng thoả thuận/hoạt động, và không khớp khái niệm "Thỏa thuận hợp tác" trong CONTEXT.md. Bản thân tài liệu tham chiếu ban-dich.md (dòng 92 và 113, do máy sinh từ đúng hai kho chuỗi này) lại ghi đúng là "Thoả thuận" cho cả hai khoá đó, chứng tỏ chuỗi đang chạy trong code sai lệch so với bản dịch đã chốt — đây là bằng chứng rõ ràng, nằm trong phạm vi input, đủ để kết luận hai kho chuỗi KHÔNG đọc như tiếng Việt tự nhiên của một nhân viên quan hệ đối tác ở hai điểm này.
    - operational-feasibility: FAIL — Phần lớn nhãn khớp từ điển CONTEXT.md ("Chốt được tháng này", "Tỷ lệ chốt", "N chốt được · A không thành", "Đang mở" đứng một mình trên thẻ số) và đọc tự nhiên, nhưng hai khoá tong-quan.ts#open.cols.deal (dòng 134) và #activity.cols.deal (dòng 159) không phải nhãn cột ngắn "Thoả thuận" mà là một câu dài lạc đề "Thoả thuận của người dùng trong công ty và toàn bộ quyền đi kèm" — không đọc như tiếng Việt tự nhiên cho một tiêu đề cột, và trái với chính bảng dịch tham chiếu ban-dich.md (ghi rõ cả hai khoá này là "Thoả thuận"). Đây là bằng chứng rõ ràng và cụ thể trong đúng phạm vi input được cấp, không phải suy đoán.
    - spec-alignment: PASS — Cả 7 nhãn rail (Công ty, Cá nhân, Thoả thuận, Chiến dịch, Hội thoại, cùng Tổng quan/Cài đặt không xung đột) đều đúng nghĩa CONTEXT.md, và CONTEXT.md còn trích dẫn nguyên văn bốn thẻ số của Tổng quan (`Chốt được tháng này` · `Tỷ lệ chốt` · `X chốt được · Y không thành` · `Đang mở`) làm ví dụ khoá nghĩa 'Chốt'/'Đang mở' — tức khớp tuyệt đối, không lẫn từ bị liệt vào danh sách tránh (thắng/thua/pipeline). Các hàm ghép câu (closedWonDesc, openPipelineDesc, unconverted.sentence, wonLost) khi thế đối số vào đọc thành câu/cụm tiếng Việt tự nhiên, không có dấu vết dịch máy (calque, sai trật tự) trong hai kho chuỗi được xem.
  required_evidence:
    - "Sửa /Users/manh-macmini/dev/crm/apps/app/lib/messages/tong-quan.ts dòng 134 (khoá open.cols.deal) và dòng 159 (khoá activity.cols.deal) từ chuỗi 'Thoả thuận của người dùng trong công ty và toàn bộ quyền đi kèm' thành 'Thoả thuận' — đúng như /Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khung-noi-tieng-viet/ban-dich.md dòng 92 và 113 đã ghi — thì tiêu chí 'câu Việt tự nhiên khi đọc cùng nơi gọi' mới đạt và verdict có thể đổi thành PASS."
    - "Đọc lại /Users/manh-macmini/dev/crm/apps/app/lib/messages/tong-quan.ts dòng 134 (open.cols.deal) và dòng 159 (activity.cols.deal): nếu giá trị thực tế là chuỗi ngắn 'Thoả thuận' (khớp bảng /Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khung-noi-tieng-viet/ban-dich.md) thay vì câu dài 'Thoả thuận của người dùng trong công ty và toàn bộ quyền đi kèm' hiện đang thấy, verdict đổi thành PASS."
  human_override:

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [5.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    cau rong bieu do giai doan: co mat tren man

    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08T14:00:00+07:00
  output: |
    CHIEU DO: cam mau chu gan den len tieu de o ca 3 khung — chan bao duoi nguong o 3 khung.
    XANH: chan tuong phan do dung chieu no sinh ra de bat.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mts3z64v3ith
  exit_code: 1
  verified_at: 2026-09-08T14:00:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r3
  exit_code: 0
  verified_at: 2026-09-08T14:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-09-08T14:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-09-08T14:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-09-08T14:00:00+07:00

Ghi chú lệnh suite không gắn eval: `bun run test` thoát 1 ở vòng này (run_id mts3z64v3ith). Đuôi output thu được (61 pass, 0 fail trên `@crm/telemetry:test`, cùng ca AC-5 pass trên `@crm/ui:test`) không chứa dòng lỗi — bài kiểm/gói thất bại thực sự nằm ngoài đoạn đuôi được cắt, cần xem log đầy đủ của `bun run test` để định vị. Bốn lệnh suite còn lại (check-types, lint, lint:slop, build) đều xanh.

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này.

none — baseline không đo lại round này (P2, evals.yaml không đổi từ lần baseline cuối); mọi block eval bên trên ghi baseline: n-a đúng vì lý do này, không có eval nào được đối chiếu lại với diffBase ở vòng 3.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3, E6 lỗi do gõ nhầm đường dẫn thư mục (khieu thay vì tong-quan-va-khung-noi-tieng-viet) khiến ENOENT bị đọc thành thiếu dữ liệu; E18 báo giả 2 P0 do jsdom không giải được oklch()/var() nên đọc mọi màu về #ffffff (trắng-trên-trắng giả). Quay lại implementation.
Round 2: toàn bộ eval máy (E1-E17, E20, E21) và E18 (ui-check) đều PASS, phần lớn với baseline red (phân biệt được); mọi lệnh suite hồi quy xanh cả hai phía; E19 (judgment) còn UNCERTAIN chờ người; E22 (tq_san_thiet_ke_do) không chạy được vì thiếu CLAUDE_PLUGIN_ROOT/SAN_THIET_KE trong môi trường này → verdict tổng là BLOCKED.
Round 3: E22 đã chạy được (script tự tìm sàn thiết kế, không cần biến môi trường nữa) và PASS. E11 (tq_dot_bien) FAIL exit 2: "KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang" — cây làm việc bị một tác vụ khác sửa đang lúc đo, chân dừng giữa chừng ở vết "nhãn rail" trước khi kịp trả nguyên trạng. Mọi eval máy/test còn lại (E1-E10, E12-E18, E20, E21) đều PASS; 4/5 lệnh suite hồi quy xanh nhưng `bun run test` thoát 1 (không gắn eval nào, đuôi log không lộ dòng lỗi). Judge panel của E19 giờ đề xuất FAIL (2/3 lens: domain-correctness, operational-feasibility) vì hai khoá `open.cols.deal`/`activity.cols.deal` trong tong-quan.ts mang câu dài lạc nghĩa thay vì "Thoả thuận" như ban-dich.md đã chốt; lens thứ ba (spec-alignment) vẫn PASS. → verdict tổng round này là REJECT (failed_evals: [E11]); cần chạy lại chân dot-bien.mjs trên cây yên tĩnh (không job nào khác sửa cây cùng lúc) và sửa hai khoá cột theo ban-dich.md trước vòng sau.
