---
schema_version: 2
feature_slug: cua-vao-noi-tieng-viet
verdict: BLOCKED
failed_evals: ["E2","E3","E5","E7","E8","E10","E13"]
reason: |
  Hai eval bi CHAN do ha tang/fixture, khong phai do san pham sai:
  (1) E6 (`cua-vao.mjs khong-dich`) can cac gia tri OAuth va cau hinh onboarding
  con thieu de dung nhanh "chua co cach nao de vao": GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET va cac
  gia tri UI onboarding khac. Moi truong nay chua khai bao du de do het bang
  dong muoi ba gia tri cua AC-6 (chi thay 3/13).
  (2) E15 (`khai-sinh.mjs`) can may chu ung dung tai http://localhost:3300,
  khong tra loi sau 20 giay trong vong nay — day la gia tri mac dinh cua
  rang/may-chu.mjs, khac cong that 3000/3001 ma kho nay dang chay theo
  CLAUDE.md.
  Rieng bay eval khac — E2, E3, E5, E7, E8, E10, E13 — that bai voi thoat ma 2
  vi /onboarding chuyen huong sang /onehub trong moi truong DA khai bao xong
  (workspace.get tra onboarded=true); day la loi that, ghi trong failed_evals,
  KHONG phai ly do cua BLOCKED. Tong the phai bao BLOCKED vi hai chan ha tang
  tren (E6, E15) khien khong the do du AC-6 va so khai sinh AC-11 chong-gian-lan.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: abd02c2a53ba1fa507bb16c4f6c173c00a577e6a
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
| E6 | AC-6 | script | BLOCKED |
| E7 | AC-7 | script | FAIL |
| E8 | AC-8 | script | FAIL |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | FAIL |
| E11 | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | FAIL |
| E14 | AC-14 | judgment | UNCERTAIN |
| E15 | AC-11 | script | BLOCKED |
| E16 | AC-10 | ui-check | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cua-vao-noi-tieng-viet-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_dang_nhap
  verified_at: 2026-09-04T10:45:00Z
  output: |
    ket qua: 6 o ghim tren man dang nhap dat quan he ba ve

- eval: E2
  run_id: minted-cua-vao-noi-tieng-viet-E2-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_khai_bao
  verified_at: 2026-09-04T10:45:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong
    (workspace.get tra onboarded=false va canRename=true). Moi truong nay da
    khai bao xong nen man do khong dung duoc. Do bang cach di theo chuyen huong
    la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E3
  run_id: minted-cua-vao-noi-tieng-viet-E3-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_khong_co_duong
  verified_at: 2026-09-04T10:45:00Z
  output: |
    KHONG DO DUOC: khong dung duoc nhanh "chua co cach nao de vao" o luot vi:
    khong thay "Chưa có cách nào để vào" tren man

- eval: E4
  run_id: minted-cua-vao-noi-tieng-viet-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_trang_thai_tam
  verified_at: 2026-09-04T10:45:00Z
  output: |
    ket qua: trang thai dang tai cua man dang nhap doc dung tieng nguoi doc

- eval: E5
  run_id: minted-cua-vao-noi-tieng-viet-E5-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_dang_gui
  verified_at: 2026-09-04T10:45:00Z
  output: |
    KHONG DO DUOC: khong dung duoc "nut khai bao cong ty": /onboarding chuyen
    huong sang http://localhost:3000/onehub. So nut do duoc phai BANG 3; do
    thieu mot nut khong bao gio la mot luot dat.

- eval: E6
  run_id: minted-cua-vao-noi-tieng-viet-E6-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.cua_vao_khong_dich
  verified_at: 2026-09-04T10:45:00Z
  reason: Acceptance test requires missing OAuth and configuration values GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, and other onboarding UI configuration. Environment setup incomplete for verification to proceed.
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
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
  run_id: minted-cua-vao-noi-tieng-viet-E7-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_ten_sso
  verified_at: 2026-09-04T10:45:00Z
  output: |
    KHONG DO DUOC: khong co nha cung cap SSO nao duoc gieo tren moi truong nay,
    nen khong dung duoc nut SSO. Chan nay can mot ban ghi ssoProvider co ten
    khong phai ASCII truoc khi do duoc.

- eval: E8
  run_id: minted-cua-vao-noi-tieng-viet-E8-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_tieu_de_tai_lieu
  verified_at: 2026-09-04T10:45:00Z
  output: |
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong
    (workspace.get tra onboarded=false va canRename=true). Moi truong nay da
    khai bao xong nen man do khong dung duoc. Do bang cach di theo chuyen huong
    la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E9
  run_id: minted-cua-vao-noi-tieng-viet-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cua_vao_chon_tieng
  verified_at: 2026-09-04T10:45:00Z
  output: |
     0 fail
     9 expect() calls
    Ran 9 tests across 1 file. [7.00ms]

- eval: E10
  run_id: minted-cua-vao-noi-tieng-viet-E10-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_be_rong
  verified_at: 2026-09-04T10:45:00Z
  output: |
    $ bun scripts/dev-session.ts manh.phan@onemount.com
    KHONG DO DUOC: khong dung duoc /onboarding o kho 768px: chuyen huong sang
    http://localhost:3000/onehub. Do trang khac la do nham vat.

- eval: E11
  run_id: minted-cua-vao-noi-tieng-viet-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cua_vao_chu_cung_jsx
  verified_at: 2026-09-04T10:45:00Z
  output: |
    ket qua: 9 file, 0 chuoi nguoi-doc-thay khoa cung ngoai 2 dong mien tru,
    va ca 2 dong deu con doi tuong that

- eval: E12
  run_id: minted-cua-vao-noi-tieng-viet-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.cua_vao_kho_chuoi
  verified_at: 2026-09-04T10:45:00Z
  output: |
     0 fail
     21 expect() calls
    Ran 5 tests across 1 file. [8.00ms]

- eval: E13
  run_id: minted-cua-vao-noi-tieng-viet-E13-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.cua_vao_chan_trang
  verified_at: 2026-09-04T10:45:00Z
  output: |
    KHONG DO DUOC: khong dung duoc man /onboarding: may chu chuyen huong sang
    /onehub. Man khai bao chi hien khi workspace CHUA khai bao xong
    (workspace.get tra onboarded=false va canRename=true). Moi truong nay da
    khai bao xong nen man do khong dung duoc. Do bang cach di theo chuyen huong
    la do BANG DIEU KHIEN, khong phai man khai bao.

- eval: E14
  judged_by: judge panel (fresh context) — 3 lens
  proposal: UNCERTAIN
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Câu (2) đạt rõ: E14-chu-loi.txt cho câu tiếng Việt "Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại." — vừa nói cái gì hỏng vừa nói làm gì tiếp. Câu (1): hai ảnh cho thấy màn đăng nhập dựng trọn tiếng Việt, nhưng theo đúng yêu cầu phải NHÌN THẤY giới hạn đã khai ở Cổng 1 (contract §Known limits) — bốn chỗ toast.error(error.message) do máy chủ đúc sẵn vẫn hiện tiếng Anh — nên cửa vào chưa "đọc trọn vẹn" theo nghĩa người dùng thật sự gặp, dù đây là ranh giới đã chốt chứ không phải lỗi mới. Câu (3) không thể chấm: không file input nào (kể cả contract) chứa nguyên văn ba nhãn trường của màn khai báo công ty — chính contract khai rõ hai màn khai báo KHÔNG dựng được trong môi trường này (E14-chu-hien-ra.txt dòng 19-20 xác nhận lại) — nên trả lời có/không cho câu này sẽ là đoán.
      required_evidence:
        - Ảnh chụp hoặc text-dump màn /onboarding (khai báo công ty) render ở tiếng Việt, lấy từ một workspace CHƯA khai báo xong để tránh bị chuyển hướng, cho thấy nguyên văn ba nhãn trường + mô tả field — tên công ty, địa chỉ workspace, website — thứ chưa có trong bất kỳ file input nào ở đây (contract.md tự khai đây là ô "Không đo được" trong bảng Known limits).
    - operational-feasibility: UNCERTAIN — Câu (2) đạt: E14-chu-loi.txt cho câu lỗi dự phòng client "Không kết nối được tới dịch vụ đăng nhập. Kiểm tra mạng rồi thử lại" — vừa nói cái gì hỏng vừa nói rõ việc phải làm tiếp (kiểm tra mạng, thử lại); giới hạn đã khai ở Cổng 1 (câu lỗi máy chủ đúc sẵn vẫn tiếng Anh) không áp vào đây vì đây là câu client tự dựng, đúng phạm vi AC-14, không phải cửa lách. Câu (1) và (3) không đủ căn cứ: hai ảnh E14-ba-man-*.png chỉ chụp được đúng MỘT màn (đăng nhập), không phải bốn màn của cửa vào; và E14-chu-hien-ra.txt tự khai "Hai màn khai bao KHONG dung duoc trong moi truong nay" — nên không có bằng chứng nào cho ba nhãn trường (tên công ty, địa chỉ workspace, website) của màn khai báo, và không thể xác nhận toàn bộ cửa vào không còn khung tiếng Anh nào.
      required_evidence:
        - Ảnh chụp /onboarding dựng ở tiếng Việt qua server thật với DB sạch (workspace chưa khai báo — theo "Đường mở khoá" đã ghi trong Known limits của contract.md), cho thấy ba nhãn trường tên công ty/địa chỉ workspace/website cùng mô tả dưới mỗi ô, lưu thành evidence mới ví dụ E14-onboarding-vi.png.
        - Ảnh chụp /onboarding/research dựng ở tiếng Việt qua cùng server sạch đó, cho thấy nhãn và mô tả ô khoá nghiên cứu, để câu (1) có thể xác nhận trọn bốn màn của cửa vào chứ không chỉ màn đăng nhập.
    - spec-alignment: UNCERTAIN — Câu (2) có bằng chứng rõ ràng: E14-chu-loi.txt cho câu lỗi dự phòng tiếng Việt nêu cả cái gì hỏng lẫn việc phải làm tiếp ("Kiểm tra mạng rồi thử lại"). Nhưng câu (1) chỉ có bằng chứng cho 1/4 màn của cửa vào (sign-in, qua hai ảnh và chu-hien-ra.txt) — ba màn còn lại (khai báo công ty, khoá nghiên cứu, grant-access) không có trong input, và chính chu-hien-ra.txt ghi rõ hai màn khai báo "Chưa đo được, không phải đã đạt". Câu (3) hỏi về ba nhãn trường của màn khai báo (tên công ty, địa chỉ workspace, website) nhưng không một file input nào chứa màn đó — không có căn cứ để trả lời, không phải để suy diễn là đạt hay hỏng. Đây là thiếu bằng chứng cho phạm vi câu hỏi, không phải vi phạm tiêu chí đã thấy; giới hạn về câu lỗi máy chủ đúc sẵn (Known limits, Cổng 1) không được dùng để giảm nhẹ hai lỗ hổng bằng chứng này vì chúng thuộc màn khai báo, không thuộc lỗi máy chủ.
      required_evidence:
        - Ảnh chụp màn hình hoặc bản liệt kê chuỗi (kiểu E14-chu-hien-ra.txt) của hai màn /onboarding và /onboarding/research, ở cả hai thứ tiếng, lấy từ một workspace THẬT CHƯA khai báo (không bị redirect) — cần để trả lời câu (3) về ba nhãn trường tên công ty / địa chỉ workspace / website có nói rõ loại thứ nằm dưới nó không.
        - Ảnh chụp hoặc bản liệt kê chuỗi của màn grant-access (màn thứ tư dùng chung AuthShell) ở cả hai thứ tiếng — cần để câu (1) kết luận được trên cả BỐN màn của cửa vào, không chỉ /sign-in.
  human_override:

- eval: E15
  run_id: minted-cua-vao-noi-tieng-viet-E15-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.cua_vao_khai_sinh
  verified_at: 2026-09-04T10:45:00Z
  reason: The app server at http://localhost:3300 does not respond within 20 seconds. The test suite requires a running application server to verify the acceptance criteria, which is infrastructure/fixture setup, not a code issue in the verification script itself.
  output: |
      TU CHOI     cua-vao.mjs be-rong                            · KHONG DO DUOC: may chu ung dung http://localhost:3300 khong tra loi sau 20 giay
      TU CHOI     cua-vao.mjs chan-trang                         · KHONG DO DUOC: may chu ung dung http://localhost:3300 khong tra loi sau 20 giay
      TU CHOI     cua-vao.mjs loi-mang                           · KHONG DO DUOC: may chu ung dung http://localhost:3300 khong tra loi sau 20 giay
      TU CHOI     cua-vao.mjs chon-tieng-may-chu                 · KHONG DO DUOC: may chu ung dung http://localhost:3300 khong tra loi sau 20 giay
      im          chu-cung-lat.mjs
      im          test/locale-resolve.spec.ts
      im          test/auth-messages.spec.ts

    KHONG DO DUOC: 12/15 muc TU CHOI DO vi ha tang hoac fixture. Mot muc khong
    chay duoc khong bao gio la mot luot dat.

- eval: E16
  run_id: design-gate-bdbfb701ee (vi), design-gate-03e96cc65b (en)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.gate
  verified_at: 2026-09-04T10:45:00Z
  screenshot: evidence/E16-sign-in-vi.png
  observed: |
    evidence/E16-sign-in-vi.png (1280x900+, full page, cookie lang=vi):
    near-black gradient background, brand mark top-left of left panel; right
    panel shows headline "Mọi khách hàng, một chỗ." (large, off-white, high
    contrast on dark), eyebrow "CRM", right-side card "Mừng bạn quay lại" /
    "Đăng nhập bằng tài khoản của bạn để tiếp tục." and a dark button "Tiếp
    tục với Google" with a colored Google glyph + white label text. No
    visibly clipped strings, no white-on-white, all Vietnamese diacritics
    render correctly. A red "1 Issue" chip bottom-left and a small round
    avatar bottom-right are a dev-tool/devtools overlay, not product UI.
    evidence/E16-sign-in-en.png: identical layout and contrast, English
    strings ("Every customer, one place.", "Welcome back", "Sign in with
    your account to continue.", "Continue with Google"), same dev overlay
    chip. Both match their respective saved HTML (document.documentElement.lang
    = vi / en, confirmed by grep). Design-gate JSON for both frames: verdict
    PASS, p0_count 0, only P1/P2 warnings (gradient-text on the headline,
    tiny-text, layout-transition) — no P0 rule fired on either frame,
    consistent with what the images show (no low-contrast, no truncation
    visible).
  network_observed: n-a (driver)
  output: |
    evidence/E16-design-gate-vi.json, evidence/E16-design-gate-en.json

    Scope of exitCode=0: every assertion that this environment can actually
    run (lang-attribute checks x2, design-gate P0 checks x2) passed; the two
    onboarding screens are explicitly declared not-measured rather than
    assumed-passing, matching the eval's own instruction not to over-claim.

- eval: E17
  run_id: minted-cua-vao-noi-tieng-viet-E17-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_loi_mang
  verified_at: 2026-09-04T10:45:00Z
  output: |
    ket qua: cau bao loi du phong doc dung tieng nguoi doc o ca hai luot

- eval: E18
  run_id: minted-cua-vao-noi-tieng-viet-E18-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cua_vao_chon_tieng_may_chu
  verified_at: 2026-09-04T10:45:00Z
  output: |
    ket qua: 3 o cua luat chon tieng dat ca hai ve

### Lệnh suite (hồi quy)

- cmd: bun run db:test && bun run test
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bun_run_db_test_bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-04T10:45:00Z

- cmd: bunx turbo run check-types --force
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bunx_turbo_run_check_types_force-r2
  exit_code: 0
  verified_at: 2026-09-04T10:45:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-04T10:45:00Z

- cmd: bun run lint:slop
  run_id: minted-cua-vao-noi-tieng-viet-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-04T10:45:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

E9, E11, E12 — pass tren CA HEAD lan diffBase (baseline: green): chung minh
harness chu chua tu phan biet hanh vi moi.

- cd apps/app && bun test test/locale-resolve.spec.ts (E9)
- node _acceptance/cua-vao-noi-tieng-viet/rang/chu-cung-lat.mjs (E11)
- cd apps/app && bun test test/auth-messages.spec.ts (E12)

## Variance

none — every multi-run eval is uniform (khong co eval nao mang field runs > 1
trong vong nay)

## Iterations

Round 1: E2, E3, E5, E6, E7, E10, E13, E16 do (that bai tren may/fixture that
hoac tren san thiet ke); E8 va E15 BLOCKED vi ha tang do (khong dung duoc
session xac thuc non-interactive cho E8, khong dung duoc may chu 3300 cho
E15); E14 UNCERTAIN vi thieu dau vao cho hai man khai bao. Sau vong 1 da sua
nam cho that (ham doc tieng nhan ban, hai form doc useLocale thay vi nhan
chuoi qua prop, man grant-access vao pham vi va da dich, chan dang-gui goi ham
da xoa, hai ca kiem resolveLocale bi xoa nham, chan chu-cung-jsx nhan co
"--lat" ma khong he hieu) roi gui lai xac minh.

Round 2: mo lai server that va chay lai toan bo. E16 nay PASS (san thiet ke
sach, khong con loi gia jsdom cua vong 1). Nhung bay eval E2, E3, E5, E7, E8,
E10, E13 van FAIL vi /onboarding tiep tuc chuyen huong sang /onehub trong moi
truong DA khai bao xong (workspace.onboarded=true) — day la gioi han moi
truong lap lai tu vong 1, khong phai loi moi phat sinh. E6 va E15 van BLOCKED:
E6 thieu bien moi truong OAuth (GOOGLE_CLIENT_ID va ba bien lien quan) va cau
hinh onboarding UI can de dung nhanh "chua co cach nao de vao"; E15 khong goi
duoc may chu tai localhost:3300 (gia tri mac dinh sai cua rang/may-chu.mjs,
khac cong that 3000/3001 kho nay dang dung). E14 van UNCERTAIN: ca ba lens deu
thieu bang chung cho man /onboarding va /onboarding/research o tieng Viet, vi
hai man do van khong dung duoc trong moi truong nay. Vong nay phat hien them
hai loi that trong hop dong — AC-11 tai grant-access.tsx (chuoi tieng Anh cung
viet thang trong JSX) va AC-6 tai research-form.tsx ("Context" thieu
translate="no") — xem review-findings.md. Chua quay lai implementation cho
hai vi pham nay; dang cho nguoi quyet o Cong 2 vi con hai chan ha tang chua
mo duoc.
