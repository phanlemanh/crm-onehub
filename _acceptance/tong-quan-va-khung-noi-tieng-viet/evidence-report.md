---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: BLOCKED
failed_evals: []
reason: |
  E22 (AC-1, chiều đỏ của sàn thiết kế) không đo được: Precondition not met — máy chủ app tại http://localhost:3000 không chạy hoặc không phản hồi đúng. Chân đo đòi hỏi app chạy tại localhost:3000 và trả header Location. Thông điệp lỗi thật: 'KHONG DO DUOC: tien de thieu — http://localhost:3000/ tra 200 ma khong co Location, khong suy duoc slug.' (Cannot measure: precondition missing - http://localhost:3000/ returns 200 but no Location header, cannot infer slug). Cần khởi động lại app server (bun run dev ở apps/app, cổng 3000) rồi verify lại E22 trước khi vòng này có thể lên PASS hoặc PENDING-JUDGMENT.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c2f9f4989c0198d7e3c6a1d174c4106fec439744
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

⚠ Vòng 5 BLOCKED — 22/23 eval máy đã chạy và PASS trên cây `c2f9f4989c0198d7e3c6a1d174c4106fec439744`; riêng E22 không đo được vì máy chủ app (localhost:3000) không phản hồi đúng tiền đề. Không có eval nào FAIL — đây không phải REJECT, mà là một chân không chạy được vì môi trường.

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
| E22 | AC-1 | script | BLOCKED (cannot-run — tiền đề thiếu) |
| E23 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08 (round 5)
  output: |
       document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_sau_bam
  verified_at: 2026-09-08 (round 5)
  output: |
      ket qua: 4/4 be mat · 26 cap · hong=0
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E2 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08 (round 5)
  output: |
    ket qua: 6 file .tsx tren dia, tru 0 loai tru co ten, cong 7 khai them = 13 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08 (round 5)
  output: |

    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08 (round 5)
  output: |
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08 (round 5)
  output: |
    quet 13 file · 1 o nhan (1 tieu de tab + 0 nhan thanh ben) · 0 nhan thanh ben deu giai duoc qua nhom thanhBen (0 khoa) · 0 o con viet thang
    XANH: ca 1 o nhan deu doc tu kho chuoi.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08 (round 5)
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4

    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_du_lieu_nguoi_nhap
  verified_at: 2026-09-08 (round 5)
  output: |
      ket qua: chan ma thieu=0 · chan man do duoc=7 · khong do duoc=6 · thieu tren man=0 · dong bang=13
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E8 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08 (round 5)
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-08 (round 5)
  output: |
      tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
      XANH: dan so tu thay file moi, va ca hai chan deu do vi no.
    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E11
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-08 (round 5)
  output: |
    XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E12
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong_man
  verified_at: 2026-09-08 (round 5)
  output: |
      ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=0 · tran ca hai=0 · tu choi=0
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E12 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E13
  run_id: f64d2d96-c192-4e17-903d-29da82e9f3f9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-08 (round 5)
  output: |
      cay lam viec da tro ve dung trang thai truoc khi chay.
      XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.
    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08 (round 5)
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08 (round 5)
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08 (round 5)
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [821.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08 (round 5)
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [8.00ms]

- eval: E18
  run_id: E18-san-thiet-ke-20260908-1500
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T15:00
  screenshot: /Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khung-noi-tieng-viet/evidence/E18-tong-quan-vi.png
  observed: |
    Cả 3 frame đã mở bằng Read và khớp với mô tả:
    1) E18-tong-quan-vi.png (1440px, nền tối/dark theme): trang Tổng quan tiếng Việt đúng / — tiêu đề "Chào bạn", 4 thẻ số liệu (Chốt được tháng này, Đang mở, Tỷ lệ chốt 90 ngày, Trung bình mỗi thoả thuận), 2 biểu đồ rỗng (Đã chốt so với mới mở / Đang mở theo giai đoạn), khu Thoả thuận đang mở + Việc quá hạn, thanh điều hướng icon bên trái, header "CRM" + badge "Đang tra cứu" + avatar "D". Đúng tiếng Việt, đúng khung 1440px.
    2) E18-tong-quan-en.png (1440px): cùng bố cục y hệt frame 1 nhưng toàn bộ chữ là tiếng Anh — "Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", badge "Enriching", nút "Me/Everyone". Đúng / ở tiếng Anh, đúng khung 1440px — đối chứng với frame 1 xác nhận i18n hoạt động.
    3) E18-ngan-keo-vi.png (360px, mobile): ngăn kéo điều hướng (drawer) đang MỞ, phủ kín gần hết màn hình, tiêu đề "Điều hướng" + nút đóng (X) ở góc phải trên, danh sách mục menu tiếng Việt: Tổng quan (đang chọn, sáng), Hội thoại, Công ty, Cá nhân, Thoả thuận, Chiến dịch, Cài đặt. Đúng ngăn kéo di động ở 360px tiếng Việt, đúng mở.
    Cả ba frame khớp CHÍNH XÁC với Expected: "/" ở vi và en tại 1440px, và ngăn kéo di động tại 360px tiếng Việt — không có sai lệch nào quan sát được.
  network_observed: n-a (driver)
  output: |
    (Ghi chu: co ban cu hon o thu muc goc evidence/ tu 14:23 cua lan chay truoc — khong dung, da doc ban moi nhat ung voi lan chay nay.)
    Network: driver la node script goi puppeteer-core truc tiep (khong phai browser-tool co duong doc network/console) → khong doc duoc failed requests/console errors qua cong cu nay.

- eval: E19
  criterion: AC-17
  executor: judgment
  verifier: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verified_at: 2026-09-08 (round 5)
  run_id: (không áp dụng — đánh giá judgment, không sinh run_id máy)
  proposal: PASS
  votes:
    - domain-correctness: PASS — Bảy nhãn rail (khung-dieu-huong.ts) đều hoặc trùng khớp từ điển CONTEXT.md ("Hội thoại", "Công ty", "Cá nhân", "Thoả thuận", "Chiến dịch") hoặc là chữ thường ai cũng hiểu ("Tổng quan", "Cài đặt") — đúng luật viết nhãn của CONTEXT.md. Bốn thẻ số ở tong-quan.ts dùng đúng cụm CONTEXT.md đã chốt cùng ngày 2026-09-08 ("Chốt được tháng này", "Tỷ lệ chốt", "N chốt được · A không thành", "Đang mở" đứng một mình) — không còn dấu vết thắng/thua/pipeline; các câu ghép số ("N thoả thuận", "N ngày", "N quá hạn") đọc tự nhiên theo mẫu nhãn CRM tiếng Việt. Chỗ còn là chữ dịch máy (nhãn giai đoạn thoả thuận trong sales-dashboard.tsx) được đánh dấu `lang="en"` tường minh, khớp với ghi chú "CHƯA CHỐT NGHĨA" của CONTEXT.md — tức nợ dịch được nêu danh, không bị lấp liếm.
    - operational-feasibility: PASS — Bảy nhãn rail khớp từ điển (Công ty/Cá nhân/Chiến dịch trùng khớp nguyên văn CONTEXT.md, Hội thoại khớp mục "Hội thoại", Thoả thuận là rút gọn hợp lý theo đúng luật "ngắn theo ngữ cảnh" của chính từ điển, Tổng quan/Cài đặt là chữ phổ thông được phép dùng khi chưa có mục riêng); bốn thẻ số dùng nhất quán "chốt được / đang mở / không thành" và né đúng danh sách _Avoid (thắng, thua, pipeline, phễu) mà mục "Chốt" trong CONTEXT.md liệt kê; các câu ghép số như "N thoả thuận · A tháng trước", "Chu kỳ trung bình N ngày", câu "Mọi con số trên đây tính bằng B..." đọc tự nhiên, không theo trật tự từ tiếng Anh; không thấy khoản nào còn giữ cấu trúc dịch máy — các chỗ khó (byStage.description, open.title/button, trend.description) đều được biên tập lại chủ đích chứ không dịch thẳng.
    - spec-alignment: PASS — Bảy nhãn trên rail (Tổng quan · Hội thoại · Công ty · Cá nhân · Thoả thuận · Chiến dịch · Cài đặt, đúng 7 mục theo khung-dieu-huong.ts) đều khớp mục từ CONTEXT.md hoặc là chữ thường phổ thông. Bốn thẻ số (Chốt được tháng này / Đang mở / Tỷ lệ chốt / Trung bình mỗi thoả thuận) và các mô tả kèm theo dùng đúng cặp "chốt được · không thành" ở thẻ Tỷ lệ chốt, không xuất hiện thắng/thua/pipeline ở đâu trong bốn thẻ. Các câu ghép số (`${n} · ${money} tháng trước`, `${n} chốt được · ${l} không thành`, `${days} ngày`…) đọc như câu Việt kiểu thẻ UI, nhất quán với lối rút gọn mà CONTEXT.md đã minh định (ví dụ "Đang mở" đứng một mình). Không thấy cụm nào trong hai file mang dấu vết dịch máy rõ rệt cần nêu toạ độ.
  human_override:        # Gate 2 (T2) — người xác nhận đề xuất PASS của hội đồng hoặc ghi đè

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08 (round 5)
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [14.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08 (round 5)
  output: |
       cau rong bieu do giai doan: co mat tren man

    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r5
  exit_code: 1
  cannot_run: true
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08 (round 5)
  reason: |
    Precondition not met: The app server at http://localhost:3000 is not running or not responding correctly. The verifier script requires the app to be running at localhost:3000 and to return a Location header. Error message: 'KHONG DO DUOC: tien de thieu — http://localhost:3000/ tra 200 ma khong co Location, khong suy duoc slug.' (Cannot measure: precondition missing - http://localhost:3000/ returns 200 but no Location header, cannot infer slug)
  output: |
    $ bun scripts/dev-session.ts dev@localhost
    KHONG DO DUOC: tien de thieu — http://localhost:3000/ tra 200 ma khong co Location, khong suy duoc slug.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-08 (round 5)
  output: |

    XANH (chieu do): chan doc bat duoc ghim neo sai cay va goi dung ten ly do.
    Chan E23 nay thoat 0. Cac dong "DO:" o tren la cua phep thu cam vao, khong phai ket qua cua E23.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_test-r5
  exit_code: 0
  verified_at: 2026-09-08T00:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r5
  exit_code: 0
  verified_at: 2026-09-08T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-09-08T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-09-08T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-09-08T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline — chứng minh harness chứ không phải feature):

- E16 (`cd apps/app && bun test test/messages-guard.spec.ts`, baseline: green) — bài kiểm này tự đọc thư mục `lib/messages` nên đã xanh trên cả cây trước vòng (bất biến chung của kho: mọi giá trị vi có dấu, không giá trị nào y hệt en, hàm ghép biến có khẳng định ghim, không khoá chết). Ca riêng của lát chỉ được thêm ở vòng 2 (quét tám file được liệt kê cứng và đòi 0 lời gọi `formatCount` ghim tiếng) — ca đó mới thật sự phân biệt được cây này với cây trước vòng; bản thân tệp bài kiểm thì green-on-both nên vẫn được liệt ở đây theo đúng định nghĩa của mục này.

Các lệnh suite (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) xanh-cả-hai-phía là regression-guard bình thường, không liệt vào đây.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 trong vòng này)

## Iterations

Round 2: E16 mở rộng thêm ca riêng của lát (quét 8 file, đòi 0 lời gọi `formatCount` ghim tiếng) sau khi bổ sung bước phân tích nêu tên trong bản khai; E19 được hội đồng lần thứ hai xem lại ba mảnh bằng chứng (unconverted.sentence trong sales-dashboard.tsx, rail.chat trỏ /chat và /agents, mục "Chốt"/"Đang mở" mới thêm vào CONTEXT.md).

Round 4: chân đọc-ghim-cây-sạch (`lan-noi-tiep.mjs` + `doc-lan.mjs`) từng vấp một tài nguyên trình duyệt thật dùng chung — dưới tải 47 tác nhân song song, E2 từng nhận về thuộc tính ngôn ngữ rỗng và E8/E12 từng mất hẳn kết quả; sửa bằng cách gom các chân lái trình duyệt thật vào chạy nối tiếp (`lan-noi-tiep.mjs`) trước khi phát S4, mỗi chân một lúc. Cùng vòng đó, một người chấm từng lấy nhầm dòng "DO:" (thuộc phần cấy lỗi cố ý bên trong E23) làm kết quả của E23 và ghi mã 1 trong khi lệnh thật thoát 0 — vòng này đọc lại đúng hai dòng cuối ("XANH (chieu do)...") và mã thoát thật, không lặp lại nhầm lẫn đó.

Round 5 (vòng hiện tại, cây `c2f9f4989c0198d7e3c6a1d174c4106fec439744`): 22/23 eval máy PASS, không eval nào FAIL. Riêng E22 (AC-1, chiều đỏ của sàn thiết kế `tq_san_thiet_ke_do`) BLOCKED — máy chủ dev tại `http://localhost:3000` không phản hồi header `Location` ở tiền đề, nên chân không suy được slug và không đo được. Bốn lệnh suite (`test`, `check-types`, `lint`, `build`) và `lint:slop` đều xanh trên cây này. Vòng này DỪNG ở BLOCKED thay vì đi tiếp tới PASS/PENDING-JUDGMENT: cần khởi động lại app server (`apps/app`, cổng 3000, ví dụ `bun scripts/dev-session.ts dev@localhost` rồi `bun run dev` trong `apps/app`) rồi verify lại đúng một mình E22 trước khi đóng vòng.
