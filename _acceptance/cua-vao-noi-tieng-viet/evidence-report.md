---
schema_version: 2
feature_slug: cua-vao-noi-tieng-viet
verdict: BLOCKED
failed_evals: ["E2","E3","E5","E6","E7","E10","E13","E16"]
reason: |
  Hai lenh khong chay duoc vi ha tang/fixture, khong phai vi san pham sai:
  (1) E8 (`cua-vao.mjs tieu-de-tai-lieu`) can mot session da xac thuc dung qua
  `bun scripts/dev-session.ts manh.phan@onemount.com`. Moi truong non-interactive
  nay khong tao duoc session OAuth; may chu chuyen huong /onboarding sang /onehub
  vi workspace da khai bao xong (workspace.get tra onboarded=true), nen man
  khai bao khong dung duoc de do.
  (2) E15 (`khai-sinh.mjs`) can may chu ung dung tai http://localhost:3300,
  khong tra loi sau 20 giay. May chu that dang chay o cong 3000/3001 (dung theo
  CLAUDE.md); 3300/3301 la gia tri mac dinh sai trong rang/may-chu.mjs (xem
  finding "Hinh dang 6" trong review-findings.md).
  Ca hai chan nay chan ca so khai sinh (E15, bao trum 15 muc chong-gian-lan)
  lan mot AC rieng (E8), nen tong the phai bao BLOCKED chu khong duoc suy dien
  sang REJECT hay PASS.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: af5d6f1fc7d514840c1449af7d92cc1a48819de4
human_signoff:
---

# Evidence Report: cua-vao-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | FAIL |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | FAIL |
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | script | FAIL |
| E8 | AC-8 | script | BLOCKED |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | FAIL |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | FAIL |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-11 | script | BLOCKED |
| E16 | AC-10 | ui-check | FAIL |
| E17 | AC-14 | script | PASS |
| E18 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cua-vao-noi-tieng-viet-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_dang_nhap
  verified_at: 2026-09-04T09:00:00Z
  output: |
    ket qua: 6 o ghim tren man dang nhap dat quan he ba ve

- eval: E2
  run_id: minted-cua-vao-noi-tieng-viet-E2-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_khai_bao
  verified_at: 2026-09-04T09:00:00Z
  output: |
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong
    (workspace.get tra onboarded=false va canRename=true). Moi truong nay da
    khai bao xong nen man do khong dung duoc. Do bang cach di theo chuyen huong
    la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E3
  run_id: minted-cua-vao-noi-tieng-viet-E3-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_khong_co_duong
  verified_at: 2026-09-04T09:00:00Z
  output: |
    KHONG DO DUOC: khong dung duoc nhanh "chua co cach nao de vao" o luot vi:
    khong thay "Chưa có cách nào để vào" tren man

- eval: E4
  run_id: minted-cua-vao-noi-tieng-viet-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_trang_thai_tam
  verified_at: 2026-09-04T09:00:00Z
  output: |
    ket qua: trang thai dang tai cua man dang nhap doc dung tieng nguoi doc

- eval: E5
  run_id: minted-cua-vao-noi-tieng-viet-E5-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.cua_vao_dang_gui
  verified_at: 2026-09-04T09:00:00Z
  output: |
    ReferenceError: hienRa is not defined
        at file:///Users/manhphan/dev/crm/_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs:505:18
    Node.js v24.15.0

- eval: E6
  run_id: minted-cua-vao-noi-tieng-viet-E6-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_khong_dich
  verified_at: 2026-09-04T09:00:00Z
  output: |
    KHONG DO DUOC: dan so THIEU: quan sat duoc 3/13 gia tri cua bang dong.
    Vang: "GOOGLE_CLIENT_ID" (doan huong dan man chua-co-duong) ·
    "GOOGLE_CLIENT_SECRET" (doan huong dan man chua-co-duong) ·
    "MICROSOFT_CLIENT_ID" (doan huong dan man chua-co-duong) ·
    "MICROSOFT_CLIENT_SECRET" (doan huong dan man chua-co-duong) ·
    "https://" (tien to o website) · "acme.com" (goi y o website) ·
    "crm" (goi y o dia chi workspace) · "Đất Xanh" (nut SSO) ·
    "Microsoft" (nut dang nhap Microsoft) · "Context" (nhan va mo ta o khoa).
    Dan so thieu bi chan y het dan so rong — khong bao gio la mot luot dat.

- eval: E7
  run_id: minted-cua-vao-noi-tieng-viet-E7-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_ten_sso
  verified_at: 2026-09-04T09:00:00Z
  output: |
    KHONG DO DUOC: khong co nha cung cap SSO nao duoc gieo tren moi truong nay,
    nen khong dung duoc nut SSO. Chan nay can mot ban ghi ssoProvider co ten
    khong phai ASCII truoc khi do duoc.

- eval: E8
  run_id: minted-cua-vao-noi-tieng-viet-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.cua_vao_tieu_de_tai_lieu
  verified_at: 2026-09-04T09:00:00Z
  reason: Lệnh yêu cầu authenticated session từ `bun scripts/dev-session.ts manh.phan@onemount.com`. Trong môi trường non-interactive này, không thể tạo session OAuth. Máy chủ chuyển hướng sang /onehub nhưng thủ tục onboarding chỉ chạy khi workspace chưa khai báo (workspace.onboarded=false). Môi trường này đã khai báo xong nên không thể dùng màn onboarding.
  output: |
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong. Moi truong
    nay da khai bao xong nen man do khong dung duoc. Do bang cach di theo
    chuyen huong la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E9
  run_id: minted-cua-vao-noi-tieng-viet-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cua_vao_chon_tieng
  verified_at: 2026-09-04T09:00:00Z
  output: |
     0 fail
     7 expect() calls
    Ran 7 tests across 1 file. [7.00ms]

- eval: E10
  run_id: minted-cua-vao-noi-tieng-viet-E10-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_be_rong
  verified_at: 2026-09-04T09:00:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    KHONG DO DUOC: khong dung duoc /onboarding o kho 768px: chuyen huong sang
    http://localhost:3000/onehub. Do trang khac la do nham vat.

- eval: E11
  run_id: minted-cua-vao-noi-tieng-viet-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cua_vao_chu_cung_jsx
  verified_at: 2026-09-04T09:00:00Z
  output: |
    quet 1 file trong lat
    chu cung nguoi doc thay: 0 cho, tren 0 file
    XANH: khong cho nao khoa cung.

- eval: E12
  run_id: minted-cua-vao-noi-tieng-viet-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cua_vao_kho_chuoi
  verified_at: 2026-09-04T09:00:00Z
  output: |
     0 fail
     21 expect() calls
    Ran 5 tests across 1 file. [10.00ms]

- eval: E13
  run_id: minted-cua-vao-noi-tieng-viet-E13-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_chan_trang
  verified_at: 2026-09-04T09:00:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong. Moi truong
    nay da khai bao xong nen man do khong dung duoc. Do bang cach di theo
    chuyen huong la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens
  proposal: UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Câu (2) đạt: câu lỗi dự phòng mạng ("Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại.") nêu rõ cả cái hỏng lẫn việc cần làm tiếp. Nhưng câu (1) và câu (3) không có căn cứ: bộ input chỉ có ảnh và chữ của màn đăng nhập (đã đọc trọn, tiếng Việt sạch), không có ảnh hay chữ nào của màn khai báo công ty/khoá nghiên cứu — nên không thể xác nhận ba nhãn trường (tên công ty, địa chỉ workspace, website) có gợi ý loại thứ nằm dưới hay không, cũng không thể xác nhận toàn bộ "cửa vào" (gồm hai màn đó) đọc trọn vẹn tiếng Việt. Đây đúng là giới hạn môi trường đã khai ở contract.md (workspace đã khai báo xong nên hai màn đó không dựng được để đo), không phải lỗi sản phẩm, nên không cho phép tự suy bằng cách khác.
      required_evidence:
        - Ảnh chụp /onboarding (màn khai báo công ty) dựng ở tiếng Việt trên một cặp máy chủ chạy với DB thử sạch (workspace chưa khai báo) — cho thấy ba nhãn trường tên công ty, địa chỉ workspace, website cùng placeholder/mô tả của từng ô, để trả lời câu (3).
        - Ảnh chụp /onboarding/research (màn khoá nghiên cứu) dựng ở tiếng Việt trên cùng cặp máy chủ đó — nhãn ô khoá, chữ gợi ý, nút gửi — để trả lời trọn vẹn câu (1) cho cả ba màn của cửa vào, không chỉ màn đăng nhập.
    - operational-feasibility: UNCERTAIN — Câu (1) và (2) có căn cứ: màn hiện ra (sign-in) đọc trọn tiếng Việt không sót khung, và câu lỗi dự phòng của client ("Kiểm tra mạng rồi thử lại") có nói rõ việc cần làm tiếp chứ không chỉ báo cái hỏng — hợp với Known limits đã khai ở Cổng 1 (toast lỗi máy chủ vẫn tiếng Anh là giới hạn đã thấy, không phải lý do trừ điểm câu 1). Nhưng câu (3) không có căn cứ nào trong bộ input: cả hai màn khai báo (tên công ty, địa chỉ workspace, website) đều KHÔNG dựng được trong môi trường này (Known limits đã khai), và không file nào trong danh sách input cho thấy nội dung ba nhãn trường đó — nên không thể chấm câu (3) là đạt hay hỏng.
      required_evidence:
        - Ảnh chụp hoặc chuỗi trích từ màn /onboarding ở tiếng Việt (chạy trên một cặp máy chủ thứ hai với cơ sở dữ liệu sạch, workspace chưa khai báo — đúng "Đường mở khoá" đã ghi trong contract.md Known limits) cho thấy ba nhãn trường tên công ty, địa chỉ workspace, website cùng chữ gợi ý trong ô, đủ để trả lời câu (3) nhãn có gợi ý loại giá trị nằm dưới nó hay không.
    - spec-alignment: UNCERTAIN — Câu (2) đạt rõ: E14-chu-loi.txt cho câu lỗi dự phòng tiếng Việt "Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại." — có nêu việc phải làm tiếp (kiểm tra mạng, thử lại), không chỉ nói cái gì hỏng; giới hạn câu lỗi máy chủ đúc sẵn (tiếng Anh) đã được nhìn thấy nhưng đúng như đã khai ở Cổng 1 nên không tính vào đây. Câu (1) chỉ đo được trên bằng chứng ảnh /sign-in (dù tên file "ba-man" gợi ý ba màn, ảnh chỉ cho thấy một màn) — nội dung màn đó trọn vẹn tiếng Việt, không chỗ nào còn khung tiếng Anh trong phần chữ do CRM tự đúc. Câu (3) hoàn toàn không có căn cứ: E14-chu-hien-ra.txt tự ghi rõ "Hai màn khai báo KHÔNG dựng được trong môi trường này... Chưa đo được, không phải đã đạt" — không có ảnh, không có văn bản nào cho ba nhãn trường (tên công ty, địa chỉ workspace, website) để chấm liệu chúng có nói rõ loại thứ nằm dưới hay không.
      required_evidence:
        - Ảnh chụp hoặc bản trích chữ màn /onboarding (khai báo công ty) ở tiếng Việt, dựng trên một workspace CHƯA khai báo (theo đúng "đường mở khoá" mà contract.md mục Known limits đã gợi ý: cơ sở dữ liệu thử sạch), cho thấy đủ ba nhãn trường + hai dòng mô tả — để trả lời câu (3) liệu nhãn có nói rõ loại giá trị cần nhập.
        - Ảnh chụp màn /onboarding/research (khoá nghiên cứu) ở tiếng Việt cùng một fixture workspace-chưa-khai-báo đó, để câu (1) có thể chấm "trọn vẹn cửa vào" trên cả ba màn thay vì chỉ một màn /sign-in như bằng chứng hiện có.
  human_override:

- eval: E15
  run_id: minted-cua-vao-noi-tieng-viet-E15-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.cua_vao_khai_sinh
  verified_at: 2026-09-04T09:00:00Z
  reason: Application server at http://localhost:3300 is not responding after 20 seconds. The dev server must be running to execute this verification. Start the app server before retrying.
  output: |
      TU CHOI     cua-vao.mjs chon-tieng-may-chu                 · KHONG DO DUOC: may chu ung dung http://localhost:3300 khong tra loi sau 20 giay
      im          chu-cung-jsx.mjs --lat lat-cua-vao.json
      im          test/locale-resolve.spec.ts
      im          test/auth-messages.spec.ts

    KHONG DO DUOC: 12/15 muc TU CHOI DO vi ha tang hoac fixture. Mot muc khong
    chay duoc khong bao gio la mot luot dat.

- eval: E16
  run_id: design-gate-e49e0b3eb9 (vi), design-gate-0bb9aaca42 (en)
  exit_code: 2
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-09-04T09:00:00Z
  screenshot: evidence/E16-sign-in-vi.png
  observed: |
    evidence/E16-sign-in-vi.png (step 1, /sign-in, cookie lang=vi, 1280x900 full page): dark near-black gradient background on the left panel with an animated-shader blob, brand mark top-left, eyebrow "CRM" and headline "Mọi khách hàng, một chỗ." in clearly legible off-white text; right panel has "Mừng bạn quay lại" / "Đăng nhập bằng tài khoản của bạn để tiếp tục." and a dark "Tiếp tục với Google" button with white Google-colored icon + white label text. No clipped strings, no white-on-white anywhere visible. A red "1 Issue" chip bottom-left is a dev-tool overlay (Next.js/devtools), not part of the product UI. evidence/E16-sign-in-en.png (step 2, same route, cookie lang=en): identical layout, English strings ("Every customer, one place.", "Welcome back", "Sign in with your account to continue.", "Continue with Google"), same visual contrast, same dev-overlay chip. Both frames read <html lang="vi"> and <html lang="en"> respectively in their saved HTML (evidence/E16-sign-in-vi.html, evidence/E16-sign-in-en.html), confirmed by grep.
  network_observed: n-a (driver)
  output: |
    Repo: /Users/manhphan/dev/crm, branch onehub. Dev server was ALREADY running
    before this task (apps/app pid 67469 on :3000, apps/api pid 67934 on :3001).

    Step 1 — PASS (mechanically checked): captured http://localhost:3000/sign-in
    with cookie lang=vi -> evidence/E16-sign-in-vi.png + .html. grep '<html
    lang="vi"' matched.
    Step 2 — PASS (mechanically checked): same route, cookie lang=en -> evidence/
    E16-sign-in-en.png + .html. grep '<html lang="en"' matched.
    Step 3 — FAIL as literally executed: design-gate.mjs (DOM/jsdom mode) against
    the two saved HTML snapshots. evidence/E16-design-gate-vi.json: exit_code=2,
    verdict=REJECT, p0_count=2 — rule "low-contrast", "1.0:1 (need 4.5:1) — text
    #ffffff on #ffffff" (x2). evidence/E16-design-gate-en.json: same shape.
    Investigation (documentation only, no code changed, no verdict overridden):
    a real-browser getComputedStyle probe on the same page shows left-panel
    background rgb(26,26,26) and headline color rgb(237,237,237), contrast
    ~14.96:1 — clears the 4.5:1/3:1 thresholds comfortably. Root cause traced to
    packages/ui/src/styles/geist.css composing dark-theme colors as
    hsla(var(--ds-background-200-value), 1) / hsla(var(--ds-gray-1000-value), 1);
    jsdom's CSS engine cannot resolve this custom-property-inside-color-function
    composition, so design-gate's contrast checker reads a same-color (white/
    white) false match. Judged a likely DOM-mode/jsdom tool false positive, not a
    verified real defect on /sign-in — flagged for a human to weigh at Gate 2, not
    silently upgraded to PASS. Kho chua wire executors.design.static nen KHONG co
    static eval per-surface; dieu do phai hien trong goi Cong 2.
    Because the designated machine assertion (exit 0) did not hold on either
    surface, this eval's exitCode is reported non-zero (2) despite the counter-
    evidence above. No product code and no kit script were modified.

- eval: E17
  run_id: minted-cua-vao-noi-tieng-viet-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_loi_mang
  verified_at: 2026-09-04T09:00:00Z
  output: |
    ket qua: cau bao loi du phong doc dung tieng nguoi doc o ca hai luot

- eval: E18
  run_id: minted-cua-vao-noi-tieng-viet-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_chon_tieng_may_chu
  verified_at: 2026-09-04T09:00:00Z
  output: |
    ket qua: 3 o cua luat chon tieng dat ca hai ve

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bun_run_db_test_bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-04T09:00:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r1
  exit_code: 0
  verified_at: 2026-09-04T09:00:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-04T09:00:00Z

- cmd: bun run lint:slop
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-04T09:00:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

E9, E11, E12 — pass tren CA HEAD lan diffBase (baseline: green): chung minh
harness chu chua tu phan biet hanh vi moi.

- cd apps/app && bun test test/locale-resolve.spec.ts (E9)
- node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs --lat _acceptance/cua-vao-noi-tieng-viet/rang/lat-cua-vao.json (E11)
- cd apps/app && bun test test/auth-messages.spec.ts (E12)

## Variance

none — every multi-run eval is uniform (khong co eval nao mang field runs > 1
trong vong nay)

## Iterations

Round 1: E2, E3, E5, E6, E7, E10, E13, E16 do (that bai tren may/fixture that
hoac tren san thiet ke); E8 va E15 BLOCKED vi ha tang do (khong dung duoc
session xac thuc non-interactive cho E8, khong dung duoc may chu 3300 cho
E15); E14 UNCERTAIN vi thieu dau vao cho hai man khai bao. Chua quay lai
implementation — dang cho nguoi quyet o Cong 2 vi phan lon nguyen nhan la ha
tang/fixture chu khong ro rang la loi san pham (xem review-findings.md).

Sua sau vong 1 (chua phai mot vong cham): sau khi nguoi doc muoi chin phat hien. Da dong
nam cho THAT: ham doc tieng nhan ban (nay dung getLocale co san o
lib/locale/server.ts), hai form doc useLocale thay vi nhan chuoi qua prop,
man grant-access — man THU TU cua cua vao — vao pham vi va da dich, chan
dang-gui goi mot ham da xoa nen nem ReferenceError, va hai ca kiem nhanh cua
resolveLocale bi xoa nham nay tra lai. Cong mot loi NGUOI DOC KHONG BAT DUOC:
chan chu-cung-jsx nhan co "--lat" ma bo quet khong he hieu, nen no quet dung
file JSON cua lat va bao XANH ma chua bao gio doc tam file kia. Nay di qua
lop boc chu-cung-lat.mjs — khang dinh so file bo quet doc BANG so file lat
khai, va do khi mot dong mien tru khong con doi tuong that. Tam gioi han moi
truong cua vong 1 GIU NGUYEN, khong tieu chi nao bi thu hep.
