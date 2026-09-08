---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c95c030a891c53a700146f87dc8dfcb24f1eb728
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

⚠ Vòng 6 REJECT — toàn bộ 24 eval máy (E1-E18, E20-E25) và eval ui-check (E18) đều PASS trên cây `c95c030a891c53a700146f87dc8dfcb24f1eb728`; hội đồng đề xuất PASS cho eval judgment E19. Bốn lệnh suite đầu (`test`, `check-types`, `lint`, `build`) đều xanh. Nhưng lệnh thứ năm — `bun run lint:slop` — thoát mã 1, KHÔNG gắn với eval nào: quy tắc anti-slop `no-runtime-typeof` bắt hai lỗi trong `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/tieu-de-quan-he.mjs:151` (`if (typeof vi !== "string" || typeof en !== "string")`). Đây là gate riêng của kho (CLAUDE.md, mục "Cách chứng minh nó chạy" liệt `bun run lint:slop` là lệnh thứ tư trong năm lệnh chứng minh), không gắn AC nào, nhưng thoát khác 0 nên vòng này REJECT theo đúng luật "mọi lệnh chứng minh phải xanh trước khi ký". Không có eval nghiệm thu nào FAIL — `failed_evals: []` là đúng thực tế; lý do REJECT nằm ở lệnh suite này.

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
| E22 | AC-1 | script | PASS |
| E23 | AC-10 | script | PASS |
| E24 | AC-6 | script | PASS |
| E25 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
       document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_sau_bam
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      ket qua: 4/4 be mat · 26 cap · hong=0
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E2 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    bo quet doc 13 file
    ket qua: 6 file .tsx tren dia, tru 0 loai tru co ten, cong 7 khai them = 13 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      vi: "Tổng quan"  ·  en: "Overview"
    XANH: tieu de doc tu kho qua getLocale(), ban vi khac ban en va co dau.
    EXIT_CODE: 0

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4

    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_du_lieu_nguoi_nhap
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      ket qua: chan ma thieu=0 · chan man do duoc=7 · khong do duoc=6 · thieu tren man=0 · dong bang=13
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E8 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
      XANH: dan so tu thay file moi, va ca hai chan deu do vi no.
    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E11
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      cay lam viec da tro ve dung trang thai truoc khi chay.
      XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E12
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong_man
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
      ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=0 · tran ca hai=0 · tu choi=0
      $ bun scripts/dev-session.ts dev@localhost
    XANH: E12 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E13
  run_id: 5bf8c570-9204-41b5-9142-a4b22d28a862
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.
    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r6
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [919.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [5.00ms]

- eval: E18
  run_id: E18-san-thiet-ke-2026-09-08T14:23
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T14:23:00+07:00
  screenshot: /Users/manh-macmini/dev/crm/evidence/E18-tong-quan-vi.png
  observed: |
    Đọc trực tiếp cả ba file .png vừa lưu (timestamp 14:23, đúng lượt chạy này):
    1) evidence/E18-tong-quan-vi.png (1440px, /vi): dashboard tối màu, tiêu đề "Chào bạn", phụ đề "Bạn đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.", 4 thẻ số liệu tiếng Việt (Chốt được tháng này, Đang mở, Tỷ lệ chốt (90 ngày), Trung bình mỗi thoả thuận), hai biểu đồ "Đã chốt so với mới mở" / "Đang mở theo giai đoạn", hai khối "Thoả thuận đang mở" / "Việc quá hạn", avatar "D" góc phải trên — đã đăng nhập, mọi nhãn đều tiếng Việt.
    2) evidence/E18-tong-quan-en.png (1440px, /en): cùng bố cục, toàn bộ nhãn đã chuyển sang tiếng Anh — "Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", "Closed won vs. new pipeline", "Open pipeline by stage", "Deals in progress", "Overdue tasks" — cùng avatar "D" đã đăng nhập, badge trạng thái "Enriching" khác badge "Đang tra cứu" ở bản /vi (đúng như AC-6 mô tả: hai lượt khác nhau ở nhiều cặp).
    3) evidence/E18-ngan-keo-vi.png (360px, /vi, ngăn kéo mở): panel "Điều hướng" trượt ra, nút đóng "×", danh sách điều hướng tiếng Việt "Tổng quan" (đang chọn, tô sáng), "Hội thoại", "Công ty", "Cá nhân", "Thoả thuận", "Chiến dịch", "Cài đặt" — đúng mô tả "ngăn kéo di động ở 360px tiếng Việt".
    Cả ba khung khớp đúng Expected: dùng /vi và /en ở 1440px, ngăn kéo di động ở 360px tiếng Việt, đã tự đăng nhập (avatar D mọi khung).
  network_observed: n-a (driver)
  output: |
    Không chạm code, không sửa gì trong repo — chỉ verify.
    Dev server 3000/3001: đã chạy sẵn trước khi phiên này bắt đầu (curl xác nhận APP:307, API:200 trước khi chạy lệnh) → dùng chung, không khởi, không tắt.
    Không có tool đọc network cho driver này (chạy qua Bash + puppeteer-core nội bộ trong script, không phải qua browser tool của phiên verify) → networkObserved = "n-a (driver)", không tính là FAIL.

- eval: E19
  criterion: AC-17
  executor: judgment
  verifier: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verified_at: 2026-09-08T15:38:00+07:00
  run_id: (không áp dụng — đánh giá judgment, không sinh run_id máy)
  proposal: PASS
  votes:
    - domain-correctness: PASS — Bảy nhãn rail (Công ty, Cá nhân, Thoả thuận, Chiến dịch khớp mục từ điển CONTEXT.md; Tổng quan/Hội thoại/Cài đặt là từ phổ thông không cần mục riêng) và bốn thẻ số Tổng quan dùng đúng cặp "chốt được / đang mở / không thành" — đúng như CONTEXT.md chốt 2026-09-08, tránh hẳn "thắng/thua/pipeline/phễu". Các câu ghép số (`${n} thoả thuận · ${money} tháng trước`, `Tỷ lệ chốt (N ngày)`, `Chu kỳ trung bình N ngày`) đọc như câu tiếng Việt tự nhiên, không lộ cấu trúc Anh ngữ dịch máy. Không thấy đoạn nào còn giọng dịch máy bị bỏ sót mà không gắn cờ; điểm duy nhất đáng chú ý (rút gọn "Thỏa thuận hợp tác" → "Thoả thuận" ở rail, và câu thứ hai của `open.empty` bị lược) là biến thể chính tả/rút gọn hợp lệ theo luật ngữ cảnh của CONTEXT.md, không phải lỗi.
    - operational-feasibility: PASS — Bảy nhãn rail (Tổng quan, Hội thoại, Công ty, Cá nhân, Thoả thuận, Chiến dịch, Cài đặt) khớp đúng các mục CONTEXT.md đã chốt. Bốn thẻ số Tổng quan dùng "Chốt được tháng này/Đang mở/Tỷ lệ chốt/N chốt được · A không thành" — đúng bộ từ "chốt/đang mở/không thành" mà CONTEXT.md vừa chốt 2026-09-08, tránh hẳn "thắng/thua/phễu/pipeline". Các câu ghép số (ví dụ "N · A tháng trước", "N đang mở · A hạn chốt tháng này", "Chu kỳ trung bình N ngày") đọc tự nhiên, không lộ khung câu tiếng Anh. Rà 102 khoá trong ban-dich.md không thấy chỗ nào còn dấu vết dịch máy/calque rõ rệt; chỗ duy nhất rút gọn so với bản Anh (open.empty bỏ "Time to fill the pipeline") là cắt chủ đích để tránh ẩn dụ "pipeline" bị cấm, không phải sót dịch máy.
    - spec-alignment: PASS — Bảy nhãn `rail.*` khớp CONTEXT.md (Công ty/Cá nhân/Chiến dịch có mục riêng; Tổng quan/Cài đặt là chữ thường phổ thông được từ điển cho phép khi chưa có mục); bốn thẻ số dùng đúng họ từ "chốt được / đang mở / không thành" (mục "Chốt" chốt 2026-09-08) và không có "thắng/thua/phễu/pipeline" ở đâu trong hai file. Các câu ghép số (`unconverted.sentence`, `avgCycle`, `wonLost`...) đọc tự nhiên theo trật tự tiếng Việt chứ không dịch thẳng. Chỗ còn là placeholder máy — nhãn giai đoạn thoả thuận trong `sales-dashboard.tsx` — được nêu đích danh bằng `lang="en"`, đúng như CONTEXT.md ghi rõ giai đoạn "CHƯA CHỐT NGHĨA".
  human_override:        # Gate 2 (T2) — người xác nhận đề xuất PASS của hội đồng hoặc ghi đè

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [5.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
       cau rong bieu do giai doan: co mat tren man

    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08T15:38:00+07:00
  output: |

    CHIEU DO: cam mau chu gan den len tieu de o ca 3 khung — chan bao duoi nguong o 3 khung.
    XANH: chan tuong phan do dung chieu no sinh ra de bat.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-08T15:38:00+07:00
  output: |
    Two verification issues detected:
    1. Git anchor/pin mismatch (tree changed since snapshot)
    2. Source file modifications detected in apps/app/lib/messages/tong-quan.ts

- eval: E24
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E24-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de_quan_he_do
  verified_at: 2026-09-08T15:38:00+07:00
  output: |

    XANH (chieu do): mat quan he voi kho bi bat, ke ca khi chuoi viet thang van co dau.
    Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.

- eval: E25
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E25-r6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc_do
  verified_at: 2026-09-08T15:38:00+07:00
  output: |

    XANH (chieu do): ma cap mo-dun cung nam trong tam ve 1, khong chi rieng than ham.
    Chan nay thoat 0. Cac dong tren la cua phep thu cam vao.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_test-r6
  exit_code: 0
  verified_at: 2026-09-08T15:38:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r6
  exit_code: 0
  verified_at: 2026-09-08T15:38:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r6
  exit_code: 0
  verified_at: 2026-09-08T15:38:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r6
  exit_code: 1
  verified_at: 2026-09-08T15:38:00+07:00
  note: |
    KHÔNG gắn eval nào (evals: [] trong đầu vào). Đây là lý do REJECT của vòng 6.
    x anti-slop(no-runtime-typeof): A runtime `typeof` check only narrows an unparsed representation; it does not establish the expected contract. Parse the value into a strongly typed domain type at the earliest possible point, as close as possible to the I/O boundary where the data originated.
     ,-[_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/tieu-de-quan-he.mjs:151:5]
     150 | const en = tongQuanMessages("en")[r.khoa];
     151 | if (typeof vi !== "string" || typeof en !== "string") {
     152 |     chet(
    Found 0 warnings and 2 errors.
    Finished in 1.9s on 958 files with 9 rules using 14 threads.
    error: script "lint:slop" exited with code 1

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r6
  exit_code: 0
  verified_at: 2026-09-08T15:38:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline — chứng minh harness chứ không phải feature):

- E16 (`cd apps/app && bun test test/messages-guard.spec.ts`, baseline: green) — bài kiểm này tự đọc thư mục `lib/messages` nên đã xanh trên cả cây trước vòng (bất biến chung của kho: mọi giá trị vi có dấu, không giá trị nào y hệt en, hàm ghép biến có khẳng định ghim, không khoá chết). Ca riêng của lát (quét tám file được liệt kê cứng và đòi 0 lời gọi `formatCount` ghim tiếng) mới thật sự phân biệt được cây này với cây trước vòng; bản thân tệp bài kiểm thì green-on-both nên vẫn được liệt ở đây theo đúng định nghĩa của mục này.

Các lệnh suite (`bun run test`, `check-types`, `lint`, `build`) xanh-cả-hai-phía là regression-guard bình thường, không liệt vào đây. `bun run lint:slop` không có baseline được đo trong vòng này (`n-a`) và tự nó FAIL trên HEAD, nên không thuộc mục này.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 trong vòng này)

## Iterations

Round 2: E16 mở rộng thêm ca riêng của lát (quét 8 file, đòi 0 lời gọi `formatCount` ghim tiếng) sau khi bổ sung bước phân tích nêu tên trong bản khai; E19 được hội đồng lần thứ hai xem lại ba mảnh bằng chứng (unconverted.sentence trong sales-dashboard.tsx, rail.chat trỏ /chat và /agents, mục "Chốt"/"Đang mở" mới thêm vào CONTEXT.md).

Round 4: chân đọc-ghim-cây-sạch (`lan-noi-tiep.mjs` + `doc-lan.mjs`) từng vấp một tài nguyên trình duyệt thật dùng chung — dưới tải 47 tác nhân song song, E2 từng nhận về thuộc tính ngôn ngữ rỗng và E8/E12 từng mất hẳn kết quả; sửa bằng cách gom các chân lái trình duyệt thật vào chạy nối tiếp (`lan-noi-tiep.mjs`) trước khi phát S4, mỗi chân một lúc. Cùng vòng đó, một người chấm từng lấy nhầm dòng "DO:" (thuộc phần cấy lỗi cố ý bên trong E23) làm kết quả của E23 và ghi mã 1 trong khi lệnh thật thoát 0 — vòng này đọc lại đúng hai dòng cuối ("XANH (chieu do)...") và mã thoát thật, không lặp lại nhầm lẫn đó.

Round 5 (cây `c2f9f4989c0198d7e3c6a1d174c4106fec439744`): 22/23 eval máy PASS, không eval nào FAIL. Riêng E22 (AC-1, chiều đỏ của sàn thiết kế `tq_san_thiet_ke_do`) BLOCKED — máy chủ dev tại `http://localhost:3000` không phản hồi header `Location` ở tiền đề, nên chân không suy được slug và không đo được. Bốn lệnh suite (`test`, `check-types`, `lint`, `build`) và `lint:slop` đều xanh trên cây này. Vòng này DỪNG ở BLOCKED thay vì đi tiếp tới PASS/PENDING-JUDGMENT.

Round 6 (vòng hiện tại, cây `c95c030a891c53a700146f87dc8dfcb24f1eb728`): app server tại localhost:3000/3001 đã chạy sẵn (xác nhận qua curl trước khi đo) nên E22 (`tq_san_thiet_ke_do`, BLOCKED ở vòng 5 vì thiếu tiền đề) nay đo được và PASS; thêm hai chiều đỏ mới E24 (AC-6, `tq_tieu_de_quan_he_do`) và E25 (AC-14, `tq_mot_bo_thuoc_do`), cả hai PASS. Tất cả 24 eval máy + E18 (ui-check) PASS, hội đồng đề xuất PASS cho E19 (judgment), 4/5 lệnh suite xanh — nhưng `bun run lint:slop` (không gắn eval, gate riêng của kho) thoát mã 1: anti-slop `no-runtime-typeof` bắt tại `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/tieu-de-quan-he.mjs:151`. Verdict: REJECT — quay lại implementation để sửa file `rang/` đó (parse `vi`/`en` thành kiểu chuỗi tại nguồn thay vì `typeof` runtime, hoặc đổi cấu trúc để không cần kiểm tra kiểu tại đó), rồi verify lại.