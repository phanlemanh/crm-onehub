---
schema_version: 2
feature_slug: tong-quan-va-khung-noi-tieng-viet
verdict: BLOCKED
triage_failed: true
failed_evals: []
reason: "E22 (tq_san_thiet_ke_do / san-thiet-ke.mjs --chieu-do) không chạy được: Missing required configuration. Script requires CLAUDE_PLUGIN_ROOT (root of acceptance-gate plugin) or SAN_THIET_KE environment variable to locate /scripts/design-gate.mjs. The acceptance-gate plugin dependencies or paths are not configured in this environment. Lệnh: NGUOI=${NGUOI:-dev@localhost} APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node --no-warnings _acceptance/tong-quan-va-khung-noi-tieng-viet/rang/san-thiet-ke.mjs --chieu-do (exit 1)."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d5790936ebb9d651077d49b872b42c4b73515ed2
human_signoff:
---

# Evidence Report: tong-quan-va-khung-noi-tieng-viet

⚠ phân loại phạm vi KHÔNG chạy được — không lỗi nào bị máy tự sửa; danh sách đầy đủ nằm trong review-findings.md; người xem lại toàn bộ trước khi ký.

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
| E19 | AC-17 | judgment | UNCERTAIN |
| E20 | AC-5 | test | PASS |
| E21 | AC-3 | script | PASS |
| E22 | AC-1 | script | BLOCKED (cannot-run) |

## Evidence

- eval: E1
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_hai_tieng
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    document.title: vi="Tổng quan · OneHub CRM" · en="Overview · OneHub CRM"
    ket qua: 225 cap doi chieu · hong=0

- eval: E2
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_sau_bam
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    cap doi chieu=8 · lech=0 · giong=0 · khong dau=0
    ket qua: 4/4 be mat · 26 cap · hong=0

- eval: E3
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_chu_cung_jsx
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    cho: mot chan dot bien dang sua cay tai cho — doi no tra nguyen trang roi moi do.
    bo quet doc 13 file
    ket qua: 6 file .tsx tren dia, tru 0 loai tru co ten, cong 7 khai them = 13 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E4
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_moi_chuoi
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    quet 13 file · 30 chuoi nguoi co the doc · tru 23/23 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E5
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_toast
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    quan he: apps/app/components/app-header.tsx truyen t.header.signOutFailed → apps/app/lib/sign-out.ts tham so loiMacDinh → toast.error doc tham so

- eval: E6
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_tieu_de
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    quet 13 file · 1 o nhan (1 tieu de tab + 0 nhan thanh ben) · 0 nhan thanh ben deu giai duoc qua nhom thanhBen (0 khoa) · 0 o con viet thang
    XANH: ca 1 o nhan deu doc tu kho chuoi.

- eval: E7
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_khong_dich
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    -- nhan giai doan mang lang=en tren man: 4/4
    ket qua: thua=0 · thieu=0 · giai doan thieu lang=en=0 · muc ma hong=0

- eval: E8
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_du_lieu_nguoi_nhap
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    co   translate="no" — chu cai dau cua ten nguoi dang nhap (avatar) div:4/header:0/div:1/button:1/span:0/span:0#0 = "D"
    ket qua: chan ma thieu=0 · chan man do duoc=7 · khong do duoc=6 · thieu tren man=0 · dong bang=13

- eval: E9
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_khai_sinh
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    hang FILE: {"latSinh":13,"chanJsx":13,"chanNgoaiToast":13,"chanNgoaiTieuDe":13}
    hang VAT:  {"toastNhanRa":2,"toastKhai":2,"tieuDeNhanRa":1,"tieuDeKhai":1}
    XANH: 13 file, ba chan doc bang nhau; 2 loi goi toast va 1 o tieu de, khop bang khai.

- eval: E10
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_dan_so_tu_dia
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    chieu xanh: ca hai chan xanh tren cay lanh truoc khi tha file thu.
    tha them mot file .tsx mang chu tieng Anh: dan so 6 -> 7 · moi-chuoi(1) chu-cung-jsx(1) · cay da don sach
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E11
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_dot_bien
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 6 chan deu xanh.

- eval: E12
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_be_rong
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    GIOI HAN KE THUA: mu voi vung chua cho xuong dong.
    ket qua 360px: 62 nhan dich duoc · vi tran ma en vua=0 · tran ca hai=0 · tu choi=0

- eval: E13
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_be_rong_do
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    ket qua 360px: 62 nhan tran ma en vua=1 · tran ca hai=0 · tu choi=0
    cay lam viec da tro ve dung trang thai truoc khi chay.
    XANH: chan be-rong do dung chieu — 1 nhan tran o luot vi trong khi luot en vua, tai 360px.

- eval: E14
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_goc_thuoc
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    -- DO_RONG: khong tham so ≡ (false): BANG · goc cu thay 0/1 moc thanh dau · goc moi thay 1/1 · so phan tu cu=31 moi=34
    ket qua: hong=0

- eval: E15
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tq_mot_bo_thuoc
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    ve 2b: man-that.mjs hai-tieng cua ho so da ky, khong tham so — ma 0 · {"/settings":41,"/settings/currencies":86}
    ve 3: mui goi GOM/DO_RONG ngoai rang/ cua lat truyen tham so = 0 (tru noi dinh nghia man-that-lib.mjs)
    ket qua: XANH — mot bo thuoc, bang chung ky tai lap duoc, mui goi cu khong doi

- eval: E16
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E16-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    0 fail
    400 expect() calls
    Ran 70 tests across 1 file. [501.00ms]

- eval: E17
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E17-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_khung_dieu_huong
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    0 fail
    24 expect() calls
    Ran 3 tests across 1 file. [6.00ms]

- eval: E18
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke
  verified_at: 2026-09-08T09:00:00+07:00
  screenshot: evidence/E18-tong-quan-vi.png
  observed: |
    Da doc ca 3 file PNG bang Read (anh that, khong doan tu ten lenh):
    (1) E18-tong-quan-vi.png — 1440px, tieng Viet: header "CRM" + "Đang tra cứu", tieu de "Chao ban", 4 the KPI (Chot duoc thang nay, Dang mo, Ty le chot 90 ngay, Trung binh moi thoa thuan), 2 bieu do rong (Da chot so voi moi mo / Dang mo theo giai doan), 2 khoi danh sach (Thoa thuan dang mo / Viec qua han), khung "Hoat dong gan day". Dung mo ta: 1440px + vi.
    (2) E18-tong-quan-en.png — cung layout 1440px nhung tieng Anh: "Welcome back", "Closed won this month", "Open pipeline", "Win rate (90d)", "Average deal (90d)", "Closed won vs. new pipeline", "Open pipeline by stage", "Deals in progress", "Overdue tasks", "Your recent activity". Dung mo ta: 1440px + en.
    (3) E18-ngan-keo-vi.png — 360px, ngan keo dieu huong di dong DANG MO (panel "Dieu huong" voi nut dong X, danh sach: Tong quan (dang chon), Hoi thoai, Cong ty, Ca nhan, Thoa thuan, Chien dich, Cai dat). Dung mo ta: 360px + vi + ngan keo mo.
    Ca 3 khung khop chinh xac voi Expected — khong co mau thuan nao.
  network_observed: n-a (driver)

- eval: E19
  judged_by: judge-panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: |
    - domain-correctness: UNCERTAIN — Ba phần đầu có bằng chứng khá rõ trong hai file chuỗi: bảy nhãn rail (Tổng quan/Hội thoại/Công ty/Cá nhân/Thoả thuận/Chiến dịch/Cài đặt) khớp định nghĩa trong CONTEXT.md, và bốn cụm số của Tổng quan né được giọng phễu bán hàng (dùng "chốt được/không thành", "tỷ lệ chốt" thay vì "thắng/thua", không dùng "phễu"/"pipeline"). Nhưng câu ghép số `unconverted.sentence` nhận `n` và `currencies` đã được định dạng sẵn từ nơi gọi — hai file input không cho thấy nơi gọi đó — nên không thể xác nhận câu hiển thị thật ("N bằng currencies không được tính…") có đọc tự nhiên hay bị cụt vì thiếu danh từ đi kèm con số; và không có căn cứ nào trong phạm vi cho biết codebase này đánh dấu "nợ dịch" (chữ còn là dịch máy) bằng cơ chế gì, nên không kiểm chứng được tiêu chí thứ tư.
    - operational-feasibility: UNCERTAIN — Bảy nhãn rail và các cụm ghép số (closedWonDesc, wonLost, unconverted.sentence...) đọc tự nhiên và bám đúng từ điển CONTEXT.md (Công ty, Cá nhân, Thoả thuận, Chiến dịch...), nhưng tiêu chí "bốn thẻ số nói giống đối tác chứ không giống phễu bán hàng" không có căn cứ rõ trong CONTEXT.md để phân định — các nhãn "Tỷ lệ chốt", "Đang mở", "Chốt được tháng này" vẫn là từ vựng CRM/phễu bán hàng chuẩn (chốt = close), không thấy dấu hiệu được viết lại riêng cho giọng "quan hệ đối tác". Ngoài ra rail.chat → "Hội thoại" chỉ được suy luận khớp với định nghĩa "Hội thoại" trong CONTEXT.md (chat với bộ dựng tác nhân) qua gợi ý gián tiếp từ nav.mobileChat, không có bằng chứng trực tiếp xác nhận đây là cùng một tính năng.
    - spec-alignment: UNCERTAIN — Bảy nhãn thanh bên (Công ty, Cá nhân, Thoả thuận, Chiến dịch, Hội thoại, Cài đặt, Tổng quan) khớp đúng từ điển CONTEXT.md, và câu ghép `unconverted.sentence` đọc tự nhiên; nhưng bốn thẻ số ở Tổng quan (`Chốt được tháng này`, `Tỷ lệ chốt`, `Trung bình mỗi thoả thuận`, `Chu kỳ trung bình`) đều dựng trên khái niệm thắng/thua và giai đoạn chốt — đúng thứ mà CONTEXT.md tự nhận là "Giai đoạn thoả thuận: CHƯA CHỐT NGHĨA... thừa kế từ một phễu bán phần mềm". CONTEXT.md không có mục nào phân xử riêng giọng của các thẻ số này là "đối tác" hay "phễu bán hàng", nên đây là tiêu chí mở hai cách đọc mà bộ input không đủ căn cứ để chốt.
  required_evidence:
    - "[domain-correctness] File component gọi tongQuanMessages(locale).unconverted.sentence(n, currencies, reporting) trong apps/app (ví dụ trang Tổng quan/Overview dashboard), cho thấy chuỗi thực tế được truyền vào n và currencies — để xác nhận câu ghép có đọc tự nhiên hay là 'số trần + bằng + mã tiền' cụt nghĩa."
    - "[domain-correctness] Kết quả lệnh grep -rn 'TODO|chưa dịch|dịch máy|MT:' apps/app/lib/messages/ (hoặc file quy ước dịch thuật nếu có) để xác nhận codebase có cơ chế đánh dấu nợ dịch cho các đoạn còn là dịch máy hay không — nếu có cơ chế và mọi chỗ dịch-máy trong hai file input đều được gắn dấu, tiêu chí 4 đạt; nếu có đoạn dịch-máy rõ ràng mà không gắn dấu, tiêu chí 4 fail."
    - "[operational-feasibility] Xác nhận rail.chat trỏ tới cùng tính năng 'Hội thoại' (chat với bộ dựng tác nhân, /chats) mà CONTEXT.md định nghĩa — lấy từ route/component render mục rail 'chat' trong apps/app (ví dụ file layout hoặc rail nav component tham chiếu khung-ung-dung.ts), hoặc ảnh chụp app khi bấm icon 'Chat' trên rail cho thấy nó mở đúng màn Hội thoại/Chats"
    - "[operational-feasibility] Đánh giá của người ngoài (không phải người dịch) đọc bốn thẻ số trên màn Tổng quan đã render thật (ảnh chụp /apps/app tại route tổng quan, khổ 1024px) và trả lời có đọc ra giọng 'nhân viên quan hệ đối tác' hay vẫn đọc như phễu bán hàng SaaS — nếu người đọc xác nhận giọng đối tác thì verdict đổi thành PASS, nếu xác nhận vẫn giống phễu bán hàng thì đổi thành FAIL"
    - "[spec-alignment] Một mục quyết định trong CONTEXT.md (hoặc tài liệu được nó dẫn) chốt rõ giọng của bốn thẻ số Tổng quan — ví dụ xác nhận rằng khung 'Chốt được / Tỷ lệ chốt / Trung bình mỗi thoả thuận' (win-loss, closed-won) là giọng nhân viên quan hệ đối tác chấp nhận được, không phải giọng phễu bán hàng thừa kế — hiện mục 'Giai đoạn thoả thuận' trong CONTEXT.md đang để ngỏ đúng phần này ('CHƯA CHỐT NGHĨA')."
    - "[spec-alignment] Một ghi nhận nghiệm thu (kiểu file trong _acceptance/.../evidence/) ghi lại phản ứng của nhân viên quan hệ đối tác thật khi đọc bốn thẻ số này trên màn Tổng quan, xác nhận họ thấy giọng 'đối tác' chứ không phải 'phễu bán hàng' — không có trong danh sách input đã cấp."
  human_override:

- eval: E20
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E20-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tq_dang_xuat
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    0 fail
    7 expect() calls
    Ran 3 tests across 1 file. [5.00ms]

- eval: E21
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E21-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tq_trang_thai_rong
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    cau rong bieu do giai doan: co mat tren man
    ket qua: 51 cap · hong=0

- eval: E22
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-E22-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tq_san_thiet_ke_do
  verified_at: 2026-09-08T09:00:00+07:00
  output: |
    KHONG DO DUOC: khong thay san thiet ke tai /scripts/design-gate.mjs. Dat CLAUDE_PLUGIN_ROOT (goc plugin acceptance-gate) hoac SAN_THIET_KE.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-08T09:00:00+07:00

- cmd: bunx turbo run check-types --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-08T09:00:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-08T09:00:00+07:00

- cmd: bun run lint:slop
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-08T09:00:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-tong-quan-va-khung-noi-tieng-viet-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-08T09:00:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

- E16 (cd apps/app && bun test test/messages-guard.spec.ts) — baseline: green. Ca này xanh trên cả HEAD lẫn diffBase, nên chứng minh harness còn sống chứ không riêng feature. Cần viết lại để assert hành vi MỚI của vòng này (ca mới thêm ở vòng 2, quét 8 file của lát và đòi 0 lời gọi formatCount ghim tiếng), hoặc xác nhận đây là regression-guard có chủ ý và giữ nguyên.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3, E6 lỗi do gõ nhầm đường dẫn thư mục (khieu thay vì tong-quan-va-khung-noi-tieng-viet) khiến ENOENT bị đọc thành thiếu dữ liệu; E18 báo giả 2 P0 do jsdom không giải được oklch()/var() nên đọc mọi màu về #ffffff (trắng-trên-trắng giả). Quay lại implementation.
Round 2: toàn bộ eval máy (E1-E17, E20, E21) và E18 (ui-check) đều PASS, phần lớn với baseline red (phân biệt được); mọi lệnh suite hồi quy xanh cả hai phía; E19 (judgment) còn UNCERTAIN chờ người; E22 (tq_san_thiet_ke_do) không chạy được vì thiếu CLAUDE_PLUGIN_ROOT/SAN_THIET_KE trong môi trường này → verdict tổng là BLOCKED.
