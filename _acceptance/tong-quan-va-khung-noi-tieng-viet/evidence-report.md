---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: BLOCKED
failed_evals: [E2, E23]
reason: |
  E8 (AC-8, du-lieu-nguoi-nhap): agent verify bị skip/chết giữa chừng — không có
  kết quả nào ghi lại cho bề mặt này, không được tính là pass. Lệnh:
  NGUOI=${NGUOI:-dev@localhost} APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node --no-warnings _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs du-lieu-nguoi-nhap
  E12 (AC-11, be-rong): agent verify bị skip/chết giữa chừng — không có kết quả
  nào ghi lại cho bề mặt này, không được tính là pass. Lệnh:
  NGUOI=${NGUOI:-dev@localhost} APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node --no-warnings _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs be-rong
  Đồng thời E2 và E23 đã CHẠY nhưng FAIL thật (exit khác 0) — xem bảng + khối
  Evidence bên dưới; verdict tổng là BLOCKED chứ không phải REJECT thuần vì hai
  eval E8/E12 chưa từng chạy được, không phải chạy-rồi-fail.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c3df13a2315e9413027693eb8e1c47c7728d8659
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | FAIL |
| E3 | AC-4 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | BLOCKED |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | BLOCKED |
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
| E23 | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
       document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"

    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E2-r4
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.tq_sau_bam
  verified_at: 2026-09-08T09:02:00+07:00
  output: |
    -- ngan keo tren / · vi=10 chuoi · en=10 chuoi
       cap doi chieu=10 · lech=0 · giong=0 · khong dau=0

    ket qua: 3/4 be mat · 18 cap · hong=0
    KHONG DO DUOC: ngan keo tren /chat (chi rail): /chat (lang=en) — KHONG DO DUOC: tien de thieu — xin lang=en nhung trang ve lang=.

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08T09:04:00+07:00
  output: |
    ket qua: 6 file .tsx tren dia, tru 0 loai tru co ten, cong 7 khai them = 13 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T09:06:00+07:00
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T09:08:00+07:00
  output: |
    quet 13 file · 3 loi goi toast · literal tieng Anh trong toast: 0
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T09:10:00+07:00
  output: |
    quet 13 file · 1 o nhan (1 tieu de tab + 0 nhan thanh ben) · 0 nhan thanh ben deu giai duoc qua nhom thanhBen (0 khoa) · 0 o con viet thang
    XANH: ca 1 o nhan deu doc tu kho chuoi.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T09:12:00+07:00
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4

    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T09:14:00+07:00
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: 0e36640c-9fec-4f5b-9a7b-fb35f25a2870
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dan_so
  verified_at: 2026-09-08T09:16:00+07:00
  output: |
      tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
      XANH: dan so tu thay file moi, va ca hai chan deu do vi no.
    XANH: E10 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E11
  run_id: 0e36640c-9fec-4f5b-9a7b-fb35f25a2870
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_dot_bien
  verified_at: 2026-09-08T09:18:00+07:00
  output: |
      cay lam viec da tro ve dung trang thai truoc khi chay.
      XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.
    XANH: E11 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E13
  run_id: 0e36640c-9fec-4f5b-9a7b-fb35f25a2870
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_lan_be_rong
  verified_at: 2026-09-08T09:20:00+07:00
  output: |
      cay lam viec da tro ve dung trang thai truoc khi chay.
      XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.
    XANH: E13 da chay noi tiep tren dung cay nay va tra ma 0.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T09:22:00+07:00
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34

    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T09:24:00+07:00
  output: |
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)

    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T09:26:00+07:00
  output: |
     0 fail
     400 expect() calls
    Ran 70 tests across 1 file. [774.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T09:28:00+07:00
  output: |
     0 fail
     24 expect() calls
    Ran 3 tests across 1 file. [11.00ms]

- eval: E18
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T09:30:00+07:00
  screenshot: evidence/E18-tong-quan-vi.png
  observed: |
    Đọc trực tiếp cả ba file PNG vừa lưu bằng Read (không suy từ log lệnh):
    1) evidence/E18-tong-quan-vi.png (1440x1000) — trang Tổng quan tiếng Việt, nền tối. Tiêu đề "Chào bạn", phụ đề "Bạn đã chốt được gì, còn gì đang mở, và hôm nay cần bạn ở đâu.". Bốn thẻ số liệu "Chốt được tháng này / Đang mở / Tỷ lệ chốt (90 ngày) / Trung bình mỗi thoả thuận (90 ngày)", hai biểu đồ "Đã chốt so với mới mở" / "Đang mở theo giai đoạn", hai khối "Thoả thuận đang mở" / "Việc quá hạn", mục "Hoạt động gần đây của bạn". Sidebar trái có icon điều hướng, top bar "CRM" + badge "Đang tra cứu" + avatar "D". Đúng như mô tả (vi, 1440px).
    2) evidence/E18-tong-quan-en.png (1440x1000) — cùng bố cục nhưng tiếng Anh: "Welcome back", "Closed won this month / Open pipeline / Win rate (90d) / Average deal (90d)", "Closed won vs. new pipeline", "Open pipeline by stage", "Deals in progress", "Overdue tasks", badge top-right "Enriching". Đúng như mô tả (en, 1440px).
    3) evidence/E18-ngan-keo-vi.png (360x1000) — ngăn kéo điều hướng di động đang MỞ, tiêu đề "Điều hướng" kèm nút đóng (X), danh sách mục tiếng Việt: Tổng quan (đang chọn), Hội thoại, Công ty, Cá nhân, Thoả thuận, Chiến dịch, Cài đặt. Đúng như mô tả (ngăn kéo di động 360px, tiếng Việt).
    Không có khung nào mâu thuẫn với Expected.
  network_observed: n-a (driver)
  output: |
    Dev server: apps/app (3000) va apps/api (3001) DA CHAY SAN TU TRUOC (khong phai do toi khoi dong) — kiem tra bang curl (APP:307, API:200) va lsof (PID 79543 cho 3000, PID 79572 cho 3001) truoc khi chay lenh. Toi KHONG tat cac server nay vi khong phai server toi tao ra.

    KET LUAN: Ca hai assertion deu PASS, khop voi so lieu ky vong (85 · 85 · 94 phan tu, 0 duoi nguong; 0 P0 khac low-contrast). exitCode=0.

- eval: E19
  judged_by: judge panel (3 lens: domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: |
    Cả ba lens đồng thuận PASS. domain-correctness: bốn thẻ số và câu chào bám
    sát từ điển CONTEXT.md, dùng "chốt được / đang mở / không thành" nhất quán,
    không còn thắng/thua/pipeline; câu ghép số đọc tự nhiên, không lộ cấu trúc
    dịch máy. operational-feasibility: bảy nhãn rail khớp CONTEXT.md hoặc dùng
    chữ phổ thông theo luật fallback; các câu ghép số đọc tự nhiên. spec-alignment:
    bảy nhãn rail và bốn thẻ số của tong-quan.ts khớp đúng mục "Chốt"/"Đang mở"
    đã chốt 2026-09-08 trong CONTEXT.md; không thấy dấu vết dịch máy còn sót
    trong hai kho chuỗi được liệt kê.
  votes:
    - domain-correctness: PASS — Cả hai kho chuỗi bám sát từ điển CONTEXT.md: "chốt" dùng nhất quán làm động từ chung (closedWon, winRate, wonLost) đúng như mục "Chốt" chốt 2026-09-08 cho chính vòng này, và "đang mở"/"mới mở" thay cho "pipeline" — không chỗ nào trong bốn thẻ số hay biểu đồ dùng thắng/thua/phễu/pipeline. Câu chào mở màn và câu unconverted.sentence đọc như câu Việt bản xứ, không lộ cấu trúc tiếng Anh. Không tìm thấy dấu vết dịch máy rõ ràng trong hai file lib/messages trong phạm vi cho phép.
    - operational-feasibility: PASS — Bảy nhãn rail (Tổng quan, Hội thoại, Công ty, Cá nhân, Thoả thuận, Chiến dịch, Cài đặt) khớp đúng từ điển CONTEXT.md hoặc dùng chữ phổ thông theo đúng luật fallback; "Hội thoại" khớp sát nghĩa hẹp mà CONTEXT.md định nghĩa. Bốn thẻ số dùng đúng giọng đối tác — không xuất hiện thắng/thua/pipeline ở phần hiển thị, khớp đúng quyết định "Chốt" mới chốt 2026-09-08. Không tìm thấy chỗ nào còn rõ ràng là văn dịch máy chưa được xử lý.
    - spec-alignment: PASS — Bảy nhãn rail trong khung-ung-dung.ts khớp đúng nghĩa CONTEXT.md. Bốn thẻ số của tong-quan.ts nhất quán dùng "chốt được / đang mở / không thành" và tránh hoàn toàn thắng/thua/pipeline — đúng mục "Chốt" và "Đang mở" trong CONTEXT.md. Các câu ghép số đọc như câu Việt tự nhiên, không thấy dấu vết dịch máy còn sót.
  human_override:

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T09:32:00+07:00
  output: |
     0 fail
     7 expect() calls
    Ran 3 tests across 1 file. [5.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08T09:34:00+07:00
  output: |
       cau rong bieu do giai doan: co mat tren man

    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08T09:36:00+07:00
  output: |
    CHIEU DO: cam mau chu gan den len tieu de o ca 3 khung — chan bao duoi nguong o 3 khung.
    XANH: chan tuong phan do dung chieu no sinh ra de bat.

- eval: E23
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E23-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tq_lan_doc_do
  verified_at: 2026-09-08T09:38:00+07:00
  output: |
    DO: cay da doi sau khi lan chay — ghim neo o 000000000000 con HEAD la c3df13a2315e.
    Ket qua cu khong noi gi ve cay hien tai. Chay lai lan noi tiep.

    XANH (chieu do): ghim neo sai cay bi bat, ma 1, thong diep goi dung ten.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mtscclq1f00v
  exit_code: 0
  verified_at: 2026-09-08T09:40:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r4
  exit_code: 0
  verified_at: 2026-09-08T09:42:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-08T09:44:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-08T09:46:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-08T09:48:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

E16 — pass trên cả HEAD lẫn baseline (`cd apps/app && bun test test/messages-guard.spec.ts`); ca "khong cho nao trong lat ghim en vao formatCount" là bất biến chung của kho (regression-guard có chủ ý), không phải phân biệt riêng cho tính năng vòng này. Xem thêm review-findings.md — bản thân ca này có lỗ hổng assertion-âm-tính-một-mình cần vá song song.

## Variance

none — không eval nào trong vòng này mang `runs` > 1 (không có eval ngẫu nhiên/stochastic được đo).

## Iterations

Round 1: E3, E6 lỗi do gõ nhầm đường dẫn thư mục (khieu thay vì tong-quan-va-khung-noi-tieng-viet) khiến ENOENT bị đọc thành thiếu dữ liệu; E18 báo giả 2 P0 do jsdom không giải được oklch()/var() nên đọc mọi màu về #ffffff (trắng-trên-trắng giả). Quay lại implementation.
Round 2: toàn bộ eval máy (E1-E17, E20, E21) và E18 (ui-check) đều PASS, phần lớn với baseline red (phân biệt được); mọi lệnh suite hồi quy xanh cả hai phía; E19 (judgment) còn UNCERTAIN chờ người; E22 (tq_san_thiet_ke_do) không chạy được vì thiếu CLAUDE_PLUGIN_ROOT/SAN_THIET_KE trong môi trường này → verdict tổng là BLOCKED.
Round 3: E22 đã chạy được (script tự tìm sàn thiết kế, không cần biến môi trường nữa) và PASS. E11 (tq_dot_bien) FAIL exit 2: "KHONG DO DUOC: cay lam viec khac truoc khi chay — vet chua duoc tra nguyen trang" — cây làm việc bị một tác vụ khác sửa đang lúc đo, chân dừng giữa chừng ở vết "nhãn rail" trước khi kịp trả nguyên trạng. Mọi eval máy/test còn lại (E1-E10, E12-E18, E20, E21) đều PASS; 4/5 lệnh suite hồi quy xanh nhưng `bun run test` thoát 1 (không gắn eval nào, đuôi log không lộ dòng lỗi). Judge panel của E19 giờ đề xuất FAIL (2/3 lens: domain-correctness, operational-feasibility) vì hai khoá `open.cols.deal`/`activity.cols.deal` trong tong-quan.ts mang câu dài lạc nghĩa thay vì "Thoả thuận" như ban-dich.md đã chốt; lens thứ ba (spec-alignment) vẫn PASS. → verdict tổng round này là REJECT (failed_evals: [E11]); cần chạy lại chân dot-bien.mjs trên cây yên tĩnh (không job nào khác sửa cây cùng lúc) và sửa hai khoá cột theo ban-dich.md trước vòng sau.
Round 4: E2 (sau-bam) FAIL exit 2 — bề mặt "ngăn kéo trên /chat (chỉ rail)" báo KHONG DO DUOC: tiền đề thiếu, xin lang=en nhưng trang về lang= rỗng, nên bề mặt bị từ chối. E23 (doc-lan --chieu-do, chân chiều-đố cho chân đọc-ghim) FAIL exit 1 — cây đã đổi sau lần chạy trước (ghim neo cũ = 000000000000, HEAD hiện tại = c3df13a2315e); thông điệp nội bộ tự nhận "XANH (chiều đố)" vì bắt đúng ghim sai, nhưng script kết thúc bằng mã 1 nên máy tính là fail — cần rà lại quy ước exit của chính chân chiều-đố này trước vòng sau. Đồng thời E8 (du-lieu-nguoi-nhap) và E12 (be-rong) không có kết quả nào: agent verify bị skip/chết giữa chừng, không được tính là pass. → verdict tổng round này là BLOCKED (không phải REJECT thuần, vì E8/E12 chưa từng chạy được chứ không phải chạy-rồi-fail); cần chạy lại toàn bộ agent cho hai bề mặt E8/E12 trên một lượt yên tĩnh, sửa nguyên nhân "tien de thieu" của E2 (bề mặt /chat lang=en trả về lang rỗng), và soát lại exit-code của doc-lan.mjs --chieu-do (E23) trước vòng kế tiếp.