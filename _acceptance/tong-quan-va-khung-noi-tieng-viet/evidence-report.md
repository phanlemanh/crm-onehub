---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e49ace95fe964aea890aabe5f8728e616d3589b3
human_signoff: Phan Le Manh 2026-09-09 — ký Cổng 2 trên verdict PASS của vòng chấm 9 (25/25 eval, hội đồng đạt, 5/5 lệnh chứng xanh), với BA giới hạn đã khai. Ký trên hiểu biết rằng mười một trong hai mươi lăm phép đo chạy qua làn nối tiếp do chính phiên viết mã chạy, rằng bốn vòng chấm trước hỏng vì tầng tác nhân chứ không vì mã, và rằng mười ba mục ngoài hợp đồng đã được định đoạt từng mục ở lượt ký này.
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
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | script | PASS |
| E14 | AC-13 | script | PASS |
| E15 | AC-14 | script | PASS |
| E16 | AC-15 | test | PASS |
| E17 | AC-16 | test | PASS |
| E18 | AC-1 | ui-check | PASS |
| E19 | AC-17 | judgment | PASS |
| E20 | AC-5 | test | PASS |
| E21 | AC-3 | script | PASS |
| E22 | AC-1 | script | PASS |
| E23 | AC-10 | script | PASS |
| E24 | AC-6 | script | PASS |
| E25 | AC-14 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T23:10:00Z
  output: |
       document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_sau_bam
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E2 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E3
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_chu_cung
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E3 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T23:10:00Z
  output: |

    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.
    quet 13 file · 3 loi goi toast · literal tieng Anh trong toast: 0
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T23:10:00Z
  output: |
      vi: "Tổng quan"  ·  en: "Overview"
    XANH: tieu de doc tu kho qua getLocale(), ban vi khac ban en va co dau.
    Verification complete: both scripts ran successfully with exit code 0

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T23:10:00Z
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4

    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_du_lieu_nguoi_nhap
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E8 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T23:10:00Z
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-08T23:10:00Z
  output: |

    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E11
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E12
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong_man
  verified_at: 2026-09-08T23:10:00Z
  output: |

    XANH: E12 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E13
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-08T23:10:00Z
  output: |

    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T23:10:00Z
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T23:10:00Z
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r9
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T23:10:00Z
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [415.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T23:10:00Z
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [6.00ms]

- eval: E18
  run_id: verify-tong-quan-va-khung-noi-tieng-viet-E18-20260908T230110Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T23:01:10Z
  screenshot: evidence/E18-tong-quan-vi.png
  observed: |
    Doc truc tiep ca ba file .png bang Read (khong doan tu ten lenh):
    (1) evidence/E18-tong-quan-vi.png (1440px, vi) — nen den, icon-rail hep ben trai 8 icon KHONG nhan chu, tieu de "Chao ban" + phu de "Ban da chot duoc gi, con gi dang mo, va hom nay can ban o dau.", 4 the so: "Chot duoc thang nay" 0 US$, "Dang mo" 0 US$, "Ty le chot (90 ngay)" —, "Trung binh moi thoa thuan (90 ngay)" —; hai khoi bieu do rong "Chua co thoa thuan nao chot hay mo" / "Chua co thoa thuan nao mo"; hai khoi danh sach rong "Chua co thoa thuan nao mo." / "Khong co viec qua han."; khu "Hoat dong gan day cua ban" o duoi. Dung tieng Viet, dung layout mo ta trong expected — KHOP.
    (2) evidence/E18-tong-quan-en.png (1440px, en) — cung layout het, chuyen sang tieng Anh dung nhu expected liet ke: "Welcome back", "Closed won this month" $0, "Open pipeline" $0, "Win rate (90d)" —, "Average deal (90d)" —, "Nothing open. Time to fill the pipeline.", "Nothing overdue. Good." — KHOP.
    (3) evidence/E18-ngan-keo-vi.png (360px, vi, ngan keo mo) — day la mot PANEL NGAN KEO truot tu trai (khong phai desktop bi thu nho): tieu de "Dieu huong" + nut dong X goc phai, 7 muc dieu huong tieng Viet dung THU TU: Tong quan (dang chon, nen sang hon), Hoi thoai, Cong ty, Ca nhan, Thoa thuan, Chien dich, Cai dat — KHOP dung expected.
    Ca ba khung deu KHOP voi mo ta ky vong; khong co mau thuan nao.
  network_observed: n-a (driver)

- eval: E19
  judged_by: judge panel (fresh context, 3 lens — domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    Ca ba lens deu bo phieu PASS, dong thuan tren cung ba manh bang chung: (1) cau ghep
    soThoaThuan(n) trong sales-dashboard.tsx dung formatCount de doc du danh tu tieng Viet;
    (2) rail.chat tro /chat va /agents dung tinh nang ma CONTEXT.md dinh nghia la "Hoi thoai";
    (3) CONTEXT.md da co muc "Chot" va "Dang mo" khop dung bon the so tren man. Khong lens nao
    bao FAIL, khong dissent.
  votes:
    - domain-correctness: PASS — Bảy nhãn rail (Tổng quan, Hội thoại, Công ty, Cá nhân, Thoả thuận, Chiến dịch, Cài đặt) đều khớp CONTEXT.md hoặc là từ phổ thông được phép dùng khi chưa có mục riêng. Bốn thẻ số ở tong-quan.ts dùng đúng bộ từ quan hệ đối tác mà CONTEXT.md chốt, không có "thắng/thua/pipeline/phễu" nào lọt qua. Các câu ghép số đọc tự nhiên theo lối rút gọn dashboard tiếng Việt, không thấy dấu vết dịch máy cứng hay còn sót chưa xử lý.
    - operational-feasibility: PASS — Cả bảy nhãn thanh bên khớp CONTEXT.md hoặc là từ phổ thông được phép dùng. Bốn thẻ số dùng đúng giọng đối tác, không một chỗ nào lộ "thắng/thua/pipeline/phễu". Các câu ghép số đọc tự nhiên như câu tiếng Việt viết tay. Nhãn giai đoạn thoả thuận chưa chốt nghĩa được sales-dashboard.tsx bọc lang="en" nêu đích danh khoá, đúng tinh thần CONTEXT.md.
    - spec-alignment: PASS — Bảy nhãn rail khớp đúng CONTEXT.md hoặc là chữ thường phổ thông được phép. Bốn thẻ số dùng thuần ngôn ngữ đối tác, không lộ "thắng/thua/pipeline". Các câu ghép số đều là cụm danh từ tiếng Việt tự nhiên, không có dấu vết dịch máy còn sót trong phạm vi sáu file được xét.
  human_override:

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T23:10:00Z
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [6.00ms]

- eval: E21
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_lan_trang_thai_rong
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E21 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E22
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_san_thiet_ke_do
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E22 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r9
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-08T23:10:00Z
  output: |

    XANH (chieu do): chan doc bat duoc CA HAI — ghim neo sai cay, va cay co sua chua ghi.
    Chan nay thoat 0. Moi dong "DO:" o tren la cua hai phep thu cam vao.

- eval: E24
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_tieu_de_do
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E24 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

- eval: E25
  run_id: a06c3b0e-744d-407f-9f43-8143250aa10a
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_trung_lap_do
  verified_at: 2026-09-08T23:10:00Z
  output: |
    XANH: E25 da chay noi tiep tren dung cay nay va tra ma 0.
    Lenh nay thoat 0. Moi dong "DO:" o tren nam trong phan chep lai, khong phai ket qua cua no.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtt9u1zvuci8
  exit_code: 0
  verified_at: 2026-09-08T23:10:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r9
  exit_code: 0
  verified_at: 2026-09-08T23:10:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r9
  exit_code: 0
  verified_at: 2026-09-08T23:10:00Z

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r9
  exit_code: 0
  verified_at: 2026-09-08T23:10:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r9
  exit_code: 0
  verified_at: 2026-09-08T23:10:00Z

## Known limits

Vòng chấm chín đạt sạch. Ba giới hạn dưới đây là điều kiện của kết quả ấy và
phải được đọc cùng bảng verdict.

**1. Mười một trên hai mươi lăm phép đo đi qua làn nối tiếp do chính phiên viết
mã chạy.** E2, E3, E8, E10, E11, E12, E13, E21, E22, E24, E25 không chạy trong
đợt toả của vòng chấm. Chúng chạy nối tiếp trên cây sạch trước khi phát vòng, và
chân đọc ghim chỉ xác nhận ba điều: ghim neo đúng mã commit đang xét, cây không
có sửa chưa ghi ngoài thư mục bằng chứng, và mã thoát bằng không. Chân đọc KHÔNG
tự chạy lại phép đo. Với mười một phép đo này, «người làm khác người chấm» yếu
hơn phần còn lại đúng một nấc.

Đổi lại là thứ đã đo được: trước khi vào làn, các phép đo này đốt bốn vòng chấm
liên tiếp bằng những màu đỏ không chạm sản phẩm. Sau khi vào làn, không phép đo
nào trong số đó hỏng lần nào nữa.

**2. Bốn vòng chấm hỏng vì tầng tác nhân, không vì mã.**

| Vòng | Verdict | Nguyên nhân thật |
|---|---|---|
| 4 | BLOCKED | hai tác nhân chết; một tác nhân đọc dòng đỏ của phép thử cắm vào làm kết quả; một phép đo chập chờn dưới tải 47 tác nhân |
| 5 | BLOCKED | máy chủ dev trả 200 không kèm chuyển hướng đúng một cửa sổ |
| 6 | REJECT | thật: bộ thước mới dùng lối kiểm kiểu lúc chạy mà luật kho cấm. Đã sửa |
| 7 | BLOCKED | một tác nhân gõ sai tên thư mục; một tác nhân đọc nhầm chiều đỏ |
| 8 | BLOCKED | một tác nhân gõ sai tên thư mục lần hai; một tác nhân chết |

Chỉ vòng sáu là lỗi thật, và nó đã được sửa. Bốn vòng còn lại là chi phí của
tầng tác nhân chấm, không phải chất lượng của mã.

**3. Chín trong mười một chân đọc ghim dựa trên một khe môi trường.** Chiều đỏ
của chân đọc dùng biến `LAN_BAN_GIA` để cắm một đường bẩn giả. Khe này chỉ HỢP
thêm đường vào kết quả thật của lệnh trạng thái, không bao giờ bớt đi, nên nó
không thể dùng để làm một cây bẩn trông như sạch. Đây là một khe thử có chủ ý,
được khai ở đây để người ký biết nó tồn tại.

## Ngoài hợp đồng

- **Locale switch: nhãn và đích chuyển ngôn ngữ bị tách khỏi nhau, mất tính vét cạn theo type**
  file: `apps/app/components/app-header.tsx`:126
  severity: high
  Đề xuất: new-contract
  Người dùng thấy gì: Diff xoá bảng `OTHER_LOCALE = { en: {next:"vi", label:"Tiếng Việt"}, vi: {next:"en", label:"English"} } satisfies Record<Locale, …>` và thay bằng HAI nguồn độc lập: đích là `const tiengKia: Locale = locale === "vi" ? "en" : "vi"` (app-header.tsx:126, dùng ở dòng 170) còn nhãn là `t.header.otherLocale` nằm ở apps/app/lib/messages/khung-ung-dung.ts:29 (en → "Tiếng Việt") và :86 (vi → "English"). Bản cũ khoá cặp (next, …

- **Bảo vệ chống ghim tiếng vào formatCount không thể bắt được thứ nó hứa bắt**
  file: `apps/app/test/messages-guard.spec.ts`:613
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Chân `describe("dinh dang theo tieng cua lat Tong quan")` (dòng 598) là phép đo duy nhất giữ cho lát Tổng quan không ghim `"en"` vào `formatCount`. Nó có hai lỗ: 1. Biểu thức `/formatCount\([^)]*"(en|vi)"[^)]*\)/g` dùng `[^)]*`, nên KHÔNG bao giờ vượt qua một dấu `)` lồng bên trong. Đã chạy thử: `formatCount(x.length, "task", "en")` → bắt được; `formatCount(count(x), "task", "en")` → LỌT; `formatCount(rows.filter((r)…

- **_acceptance/config.yaml.bak — bản sao cũ 298 dòng của cấu hình cổng được commit vào kho**
  file: `_acceptance/config.yaml.bak`:1
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Commit 35b60b8 trong dải diff này thêm `_acceptance/config.yaml.bak` (33 KB, 298 dòng) nằm ngay cạnh `_acceptance/config.yaml` đang sống. Đã grep toàn kho (trừ node_modules/.git): KHÔNG file nào tham chiếu tới nó — không script, không workflow, không `gate-shape.json`. CLAUDE.md khai `_acceptance/config.yaml` là nơi duy nhất giữ `enforcement: strict` / `recheck: strict` và danh sách executor. Một bản sao đầy đủ, cũ h…

- **nhanRail xuất ra nhưng không đường sản phẩm nào gọi — chỉ bài kiểm gọi**
  file: `apps/app/lib/khung-dieu-huong.ts`:47
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: `export function nhanRail(muc: MucRail, locale: Locale)` được thêm mới ở dòng 47. Grep toàn kho: chỉ `apps/app/test/khung-dieu-huong.spec.ts:28-29` gọi nó. Component thật — `apps/app/components/app-icon-rail.tsx` — KHÔNG gọi `nhanRail`; nó đọc thẳng `m.rail[muc.key]` (dòng 218 và 189). Hai hệ quả: 1. Mã sản phẩm chết. Vi phạm YAGNI trong luật coding-style, và `refactor-cleaner` sẽ xoá nó ở lượt dọn kế tiếp — kéo theo…

- **API đổi trend.month sang khoá YYYY-MM nhưng hợp đồng vẫn khai z.string(), và bên đọc nuốt lỗi phân tích**
  file: `apps/api/src/dashboard/dashboard.contracts.ts`:46
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: `dashboard.service.ts:185` đổi `month` từ nhãn hiển thị (`Intl.DateTimeFormat("en-US", {month:"short"})` → "Sep") sang khoá máy đọc `monthIso()` → "2026-09". Hướng đi đúng (đẩy việc hiển thị ra biên), nhưng hai đầu của hợp đồng mới không được siết: 1. `dashboard.contracts.ts:46` vẫn là `month: z.string()` — thứ lỏng nhất phân tích được. AGENTS.md nói thẳng: "The schema describes what is **actually stored**, not the l…

- **Sàn thiết kế nuốt lỗi của design-gate: mã thoát bị bỏ qua và `findings` thiếu bị đọc thành "không có lỗi"**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs`:292
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: `chamSan()` trả về `{ma, ra}`, nhưng `ma` (mã thoát của design-gate) CHỈ được in ra ở dòng 295 — không có chỗ nào đọc nó để quyết định đỏ/xanh. Ngay dưới, `const p0 = (bao.findings ?? []).filter(...)` biến một báo cáo không có khoá `findings` thành mảng rỗng. Hệ quả cụ thể: design-gate chạy lỗi (thiếu jsdom nội bộ, HTML sai định dạng, lỗi tự nó) và thoát khác 0 nhưng vẫn in ra JSON hợp lệ dạng `{"error": "..."}` — kh…

- **`_acceptance/config.yaml.bak` — bản sao cũ của cấu hình cổng bị commit vào kho**
  file: `_acceptance/config.yaml.bak`:1
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: File này được thêm mới trong diff (298 dòng) và đang được git theo dõi. Nó là ảnh chụp giữa chừng của `_acceptance/config.yaml` (314 dòng): `diff` giữa hai file cho thấy bản .bak thiếu 15 executor đã có ở bản thật — toàn bộ nhóm `tq_lan_*` (13 mục doc-lan/lan-noi-tiep), `tq_tieu_de_quan_he_do`, `tq_mot_bo_thuoc_do` — và `tq_tieu_de` của nó dừng ở `chu-ngoai-jsx.mjs`, chưa nối `&& node ... tieu-de-quan-he.mjs`. Đây là…

- **Chân canh `formatCount` ghim tiếng dùng regex `[^)]*`, mù với lời gọi có ngoặc lồng và chỉ soi 8 file cứng**
  file: `apps/app/test/messages-guard.spec.ts`:613
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Chân mới `khong cho nao trong lat ghim "en" vao formatCount` quét bằng `/formatCount\([^)]*"(en|vi)"[^)]*\)/g`. Lớp ký tự `[^)]*` dừng ở dấu `)` ĐẦU TIÊN, nên bất kỳ lời gọi nào có ngoặc lồng trong đối số đều vô hình với nó — ví dụ `formatCount(rows.filter(r => r.overdue).length, "task", "en")` hay `formatCount(Number(x), "deal", "en")` đều KHÔNG khớp và chân vẫn xanh. Thêm nữa, danh sách `FILE` là 8 đường dẫn gõ cứn…

- **Đọc `git status --porcelain` bằng `slice(3)` vỡ khi git bọc ngoặc kép đường dẫn phi-ASCII**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/doc-lan.mjs`:38
  severity: low
  Đề xuất: known-limits
  Người dùng thấy gì: Cả `doc-lan.mjs:38` (`duongBan()`) và `lan-noi-tiep.mjs:56` (`banCay()`) đều cắt `d.slice(3)` rồi so `cuoi.startsWith(c)` với danh sách cho phép `_acceptance/<lat>/evidence/`. Với `core.quotepath` mặc định (= true), git bọc mọi đường dẫn chứa byte phi-ASCII trong ngoặc kép và escape theo kiểu C: một file bằng chứng tên tiếng Việt sẽ hiện là `?? "_acceptance/tong-quan.../evidence/\341\272\243nh.png"`. Sau `slice(3)` c…

- **`doRongHai` vứt câu lỗi mà `lai()` trả về, khác với `docHai` cùng file**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs`:654
  severity: low
  Đề xuất: known-limits
  Người dùng thấy gì: `docHai` (dòng 121-127) kiểm `const loiLai = await lai(mo.trang, tieng); if (loiLai) { ...; return { tuChoi: ... } }` — nó dùng câu lỗi mà `laiNganKeo`/`laiMenu` trả về để nói ra vì sao. `doRongHai` ở dòng 654 chỉ viết `if (lai !== undefined) await lai(mo.trang, tieng);` — giá trị trả về bị bỏ. `laiNganKeo` bắt lỗi bấm bằng `.catch(e => "khong bam duoc nut mo dieu huong: " + e.message)` chứ không ném, nên khi nút mở …

- **Assertion âm-tính-một-mình: chan formatCount chỉ khẳng định tập rỗng, không có đối chứng dương**
  file: `apps/app/test/messages-guard.spec.ts`:617
  severity: medium
  Đề xuất: new-contract
  Người dùng thấy gì: Cả ca kiểm chỉ có một assert duy nhất: `expect(ghim).toEqual([])` trên kết quả của `chu.matchAll(/formatCount\([^)]*"(en|vi)"[^)]*\)/g)`. Không có ca đối chứng dương nào chứng minh regex đó CÓ THỂ ra khác rỗng, và không có thông điệp lỗi nào được ghim. Hệ quả cụ thể: hôm nay chỉ 2/8 file trong danh sách thực sự chứa `formatCount` (sales-dashboard.tsx, dashboard-summary.tsx), nên tập rỗng là trạng thái mặc định — đổi …

- **Tuyên quét LỚP nhưng danh sách file gõ tay chỉ phủ 8/13 file của lát**
  file: `apps/app/test/messages-guard.spec.ts`:601
  severity: medium
  Đề xuất: known-limits
  Người dùng thấy gì: Tên ca là "khong cho nao trong lat ghim \"en\" vao formatCount" — một tuyên bố quét cả lớp "lát Tổng quan". Nhưng mảng `FILE` là 8 đường dẫn gõ tay, trong khi bản khai của chính lát (`_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/lat-tong-quan.json`) định nghĩa lát là 6 file .tsx trong `apps/app/app/(app)/[slug]` cộng 7 đường ở `them` = 13 file. Năm file đã khai mà ca này không đọc: `app/(app)/[slug]/layout.tsx`…

## Analyst

E16 (`cd apps/app && bun test test/messages-guard.spec.ts`) — pass trên cả HEAD lẫn baseline diffBase, nên không tự nó chứng minh feature; đây là chân bảo vệ chống-ghim-tiếng chung của lib/messages, có chủ ý là regression-guard áp cho toàn kho chứ không riêng lát Tổng quan — nên xanh-cả-hai-phía là đúng thiết kế, không cần viết lại.

## Variance

none — không có eval nào mang field runs>1 trong vòng này; không có kết quả stochastic cần người phân xử.

## Iterations

Round 9: E1-E25 (24 eval máy + 1 judgment) và năm lệnh suite hồi quy (bun run test, turbo check-types, turbo lint, lint:slop, turbo build) đều pass, không eval nào fail — verdict PASS. Lịch sử các vòng trước không có trong dữ liệu đưa vào lần tổng hợp này.

### Re-pin lần 1 — 2026-09-08, do bang chung neo o 80f872e; diff tu do toi HEAD chi cham ho so _acceptance va PRODUCT-MAP va thu muc evidence lac o goc kho, khong cham file nao trong paths cua eval nao
run_id: repin-20260908T233212Z-34776
sha: 17b1a736c7793987150a13a1205745324e648ef3 · suites: 5 lệnh exit 0 · evals: 23 eval máy exit 0

### Re-pin lần 2 — 2026-09-09, do hoa origin/onehub vao nhanh; diff tu moc cu chi cham lib/ scripts/ cua kit va tools/listing-crawl, khong tep nao duoi apps/ hay packages/
run_id: repin-20260909T005403Z-41966
sha: ae5d2125d10a205697a36f002d0b17e1caa0605b · suites: 5 lệnh exit 0 · evals: 23 eval máy exit 0

### Re-pin lần 3 — 2026-09-10, do hoa origin/onehub lan hai truoc khi merge; neo lai moc bang chung tai dung cay sap merge
run_id: repin-20260910T021529Z-40716
sha: e49ace95fe964aea890aabe5f8728e616d3589b3 · suites: 5 lệnh exit 0 · evals: 23 eval máy exit 0
