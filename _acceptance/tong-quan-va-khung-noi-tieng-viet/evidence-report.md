---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: BLOCKED
failed_evals: []
reason: |
  E3 (config:executors.script.tq_chu_cung_jsx): lệnh "node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs --lat ${PWD}/_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json" thoát mã 1 (ENOENT). Nguyên nhân: bên trong chu-cung-lat.mjs của lát man-cai-dat-noi-tieng-viet, đường dẫn bị gõ sai trỏ tới thư mục "tong-quan-va-khieu-noi-tieng-viet" trong khi thư mục thật của lát này là "tong-quan-va-khung-noi-tieng-viet". File lat-tong-quan.json cần dùng tồn tại đúng ở đường dẫn thật (/Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json) — lỗi nằm ở bộ đọc đường dẫn dùng chung, không phải ở lát đang xét. Không phải một REJECT thật (feature không sai), verifier không chạy được.
  E21 (config:executors.script.tq_trang_thai_rong): lệnh "NGUOI=${NGUOI:-dev@localhost} APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node --no-warnings _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs trang-thai-rong" không để lại kết quả nào trong round này — agent chạy eval bị skip hoặc chết giữa chừng (không có exit code, không có output ghi lại). Không có kết quả nghĩa là không được tính là pass; cần chạy lại chân này riêng trước khi kết luận AC-3.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 008b17454516289400c04cf3ed920ddfa4759f2c
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-4 | script | CANNOT-RUN (env/path bug, không phải REJECT) |
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
| E19 | AC-17 | judgment | PASS (panel đề xuất, human_override còn trống) |
| E20 | AC-5 | test | PASS |
| E21 | AC-3 | script | NO-RESULT (agent bị skip/chết) |
| E22 | AC-1 | script | PASS |
| E23 | AC-10 | script | PASS |
| E24 | AC-6 | script | PASS |
| E25 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-09T00:00:00Z
  output: |
    document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"
    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_sau_bam
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E2 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r8
  cannot_run: true
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-09T00:00:00Z
  reason: |
    File path contains typo bên trong chu-cung-lat.mjs (thuộc lát man-cai-dat-noi-tieng-viet):
    lệnh trỏ tới "tong-quan-va-khieu-noi-tieng-viet" nhưng thư mục thật của lát này là
    "tong-quan-va-khung-noi-tieng-viet". File lat-tong-quan.json cần dùng có tồn tại đúng ở
    đường dẫn thật; sai lệch nằm ở bộ đọc đường dẫn dùng chung, không phải ở lát đang xét.
  output: |
    Error: ENOENT: no such file or directory, open '/Users/manh-macmini/dev/crm/_acceptance/tong-quan-va-khieu-noi-tieng-viet/rang/lat-tong-quan.json'
        at readFileSync (node:fs:539:20)
        at lat (file:///Users/manh-macmini/dev/crm/_acceptance/man-cai-dat-noi-tieng-viet/rang/lat.mjs:22:26)
        at file:///Users/manh-macmini/dev/crm/_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs:11:11

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-09T00:00:00Z
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-09T00:00:00Z
  output: |
    quet 13 file · 3 loi goi toast · literal tieng Anh trong toast: 0
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-09T00:00:00Z
  output: |
    apps/app/app/(app)/[slug]/page.tsx:28 — title = tongQuanMessages(await getLocale()).title
      vi: "Tổng quan"  ·  en: "Overview"
    XANH: tieu de doc tu kho qua getLocale(), ban vi khac ban en va co dau.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-09T00:00:00Z
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4
    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_du_lieu_nguoi_nhap
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E8 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-09T00:00:00Z
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E11
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E12
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong_man
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E12 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0.

- eval: E13
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-09T00:00:00Z
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34
    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-09T00:00:00Z
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)
    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r8
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-09T00:00:00Z
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [382.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-09T00:00:00Z
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [4.00ms]

- eval: E18
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E18-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-09T00:00:00Z
  screenshot: evidence/E18-tong-quan-vi.png
  observed: |
    Doc bang Read ca 3 file .png vua luu o evidence/:
    1) evidence/E18-tong-quan-vi.png (1440px, lang=vi): trang Tong quan dashboard toi, icon-rail hep ben trai (8 icon, khong nhan chu), tieu de "Chao ban" + phu de, 4 the so (Chot duoc thang nay 0 US$, Dang mo 0 US$, Ty le chot — , Trung binh moi thoa thuan — ), hai khoi bieu do rong ("Chua co thoa thuan nao chot hay mo", "Chua co thoa thuan nao mo"), hai khoi danh sach ("Chua co thoa thuan nao mo.", "Khong co viec qua han."), khu Hoat dong gan day. Dung tieng Viet, dung / o vi tri.
    2) evidence/E18-tong-quan-en.png (1440px, lang=en): cung layout, noi dung da chuyen sang tieng Anh ("Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", "Nothing open. Time to fill the pipeline.", "Nothing overdue. Good."). Dung / o vi tri, doi tieng dung.
    3) evidence/E18-ngan-keo-vi.png (360px, lang=vi, ngan keo MO): panel ngan keo di dong hien ra tu trai, tieu de "Dieu huong" + nut dong (X), 7 muc dieu huong tieng Viet theo dung thu tu: Tong quan (dang chon, sang), Hoi thoai, Cong ty, Ca nhan, Thoa thuan, Chien dich, Cai dat. Day la ngan keo di dong tieng Viet dung nhu mo ta, khong phai man desktop bi thu nho.
    Ca ba khung khop voi Expected: "dung / o vi va en (1440px) va ngan keo di dong o 360px tieng Viet".
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver cua lenh nay la mot script Node/puppeteer-core chay qua Bash (khong phai browser tool co duong doc network) — ghi "n-a (driver)".
    Ket luan: exitCode=0, moi assertion may-kiem-duoc va doi chieu quan sat deu PASS, khong mau thuan Expected.

- eval: E19
  criterion: AC-17
  executor: judgment
  judged_by: judge panel (fresh context) — 3 lenses: domain-correctness, operational-feasibility, spec-alignment
  proposal: PASS
  votes:
    - domain-correctness: PASS — Bảy nhãn rail khớp CONTEXT.md hoặc dùng chữ thường phổ thông cho mục chưa có từ điển; bốn thẻ số dùng "chốt được / đang mở / tỷ lệ chốt" nhất quán với CONTEXT.md, không còn thắng/thua/phễu/pipeline; các câu ghép số đọc đúng trật tự tiếng Việt tự nhiên.
    - operational-feasibility: PASS — Bảy nhãn rail và bốn thẻ số dùng đúng cụm CONTEXT.md đã dẫn nguyên văn; vết dịch máy còn lại (tên bước giai đoạn thoả thuận) được nêu rõ là nợ chưa chốt và được đánh dấu kỹ thuật bằng lang="en" tại sales-dashboard.tsx.
    - spec-alignment: PASS — Bảy nhãn rail khớp đúng các mục CONTEXT.md đã chốt; bốn thẻ số không còn chữ thắng/thua/pipeline nào lọt màn, đúng quyết định "Chốt" 2026-09-08. Vết chưa dịch duy nhất (nhãn giai đoạn thoả thuận) được đánh dấu lang="en" và CONTEXT.md ghi rõ là "CHƯA CHỐT NGHĨA" — nợ dịch đã được nêu, không âm thầm để chữ Anh trần trụi.
  human_override:

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-09T00:00:00Z
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [4.00ms]

- eval: E21
  cannot_run: true
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  reason: |
    Agent chay eval nay bi skip hoac chet giua chung trong round nay: khong co exit code,
    khong co output, khong co run_id ghi lai. Khong duoc tinh la pass — can chay lai rieng
    chan nay truoc khi ket luan AC-3.

- eval: E22
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_san_thiet_ke_do
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH (chieu do): chan doc bat duoc CA HAI — ghim neo sai cay, va cay co sua chua ghi.
    Chan nay thoat 0. Moi dong "DO:" o tren la cua hai phep thu cam vao.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH (chieu do): chan doc bat duoc CA HAI — ghim neo sai cay, va cay co sua chua ghi.
    Chan nay thoat 0. Moi dong "DO:" o tren la cua hai phep thu cam vao.

- eval: E24
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_tieu_de_do
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E24 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E25
  run_id: b7b604cc-4dc7-4720-807d-0bce9fe635c7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_trung_lap_do
  verified_at: 2026-09-09T00:00:00Z
  output: |
    XANH: E25 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_test-r8
  exit_code: 0
  verified_at: 2026-09-09T00:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r8
  exit_code: 0
  verified_at: 2026-09-09T00:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r8
  exit_code: 0
  verified_at: 2026-09-09T00:00:00Z

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r8
  exit_code: 0
  verified_at: 2026-09-09T00:00:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r8
  exit_code: 0
  verified_at: 2026-09-09T00:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

cd apps/app && bun test test/messages-guard.spec.ts (E16)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E2 nhận về thuộc tính ngôn ngữ rỗng, E8/E12 mất hẳn kết quả do 47 tác nhân chạy song song tranh cùng một máy chủ dev — chuyển các chân này sang lần nối tiếp (lan-noi-tiep.mjs), chạy tuần tự trước khi phát S4.
Round 5: một tiêu đề viết thẳng có dấu lọt qua chân chu-ngoai-jsx.mjs (chỉ bắt ASCII không dấu) — thêm tieu-de-quan-he.mjs làm chân đọc quan hệ cú pháp riêng cho E6.
Round 7: một người chấm gõ nhầm một chữ khi đọc đường dẫn lat-tong-quan.json rồi khai tệp không tồn tại — tệp có thật, lỗi nằm ở người chấm chứ không phải lát; Round 8 (vòng này) lộ ra rằng chính lệnh của man-cai-dat-noi-tieng-viet cũng gõ sai đường dẫn đó (E3 cannot-run) và E21 mất kết quả do agent bị skip/chết — verdict round này là BLOCKED, chờ chạy lại hai chân đó.
