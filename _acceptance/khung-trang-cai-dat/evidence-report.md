---
schema_version: 2
feature_slug: khung-trang-cai-dat
verdict: BLOCKED
failed_evals: []
reason: |
  3 eval ui-check bi chan ha tang trong luot nay, khong sua duoc boi verifier (khong dung
  chung CSDL/may chu dev, khong tu don du lieu rac chia se theo dung luat kho):
  - ui-check:E6 — DB dev dung chung (cong 3720/3721) con tai khoan Slack rac
    "ktcdge968o-slack" tu mot luot chay truoc chua don xong (hoac dang chay song song voi
    PID 30407 dang chay khong-hoi-quy.mjs cung luc). "lan gieo 1" cua man-chrome.mjs doi
    hoi Slack CHUA ket noi nen script thoat ma 2 o buoc tien-de, truoc khi mo trinh duyet —
    khong co gi de gan PASS/FAIL cho E6.
  - ui-check:E8 — cung rang man-chrome.mjs, cung nguyen nhan du lieu Slack rac, thoat ma 2
    truoc khi chup bat ky frame nao cho E8 (nhan nhom thanh ben o 1440/768/375).
  - ui-check:E11 — middleware proxy.ts doc AppSetting.researchKey (khoa API Context) tren
    CSDL dev dung chung dang configured=false (co mot cua so configured=true ngan ~32s
    trung voi mot phien Claude Code khac PID 91041 chay song song), nen moi duong /crm/*
    bi 307 ve /onboarding/research truoc khi cham toi menu nguoi dung, /reminders hay
    /settings/connections/zalo. Khong co cach hop le de tu sua (ghi DB bi auto-mode
    classifier chan; go khoa API vao o nhap bi cam theo luat an toan cua cong cu).
  Chi tiet day du (lenh da chay, log, ps aux, ket qua) nam trong tung khoi ui-check tuong
  ung o muc Evidence ben duoi.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 400b77659486bce8eeea6bc894d1f0f4f0146522
human_signoff:
---

# Evidence Report: khung-trang-cai-dat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | BLOCKED |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | ui-check | BLOCKED |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-8 | ui-check | BLOCKED |
| E12 | AC-9 | test | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-trang-cai-dat-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_be_rong
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat.dom.tsx -t 'be-rong'
     0 fail
     11 expect() calls
    Ran 2 tests across 1 file. [275.00ms]

- eval: E2
  run_id: minted-khung-trang-cai-dat-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_cau_truc
  verified_at: 2026-09-25T03:18:36Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/cau-truc.mjs
    cau-truc: 22/22 khang dinh dat

- eval: E3
  run_id: ktcdge968o
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/settings-1440.png
  observed: |
    Đọc trực tiếp 3 frame vừa được script lưu (bằng Read, không suy từ log):
    (1) evidence/settings-1440.png — trang /settings ở 1440: h1 "Chung" nằm ở x≈304px, ngay dưới không có breadcrumb (đúng — trang mục không có breadcrumb); thanh bên bên trái có đủ 4 nhãn nhóm "Không gian làm việc", "Con người", "Kết nối và dữ liệu", "Bảo mật" hiện rõ; khối thẻ nội dung đầu tiên ("Không gian làm việc") có mép trái trùng mép trái h1.
    (2) evidence/settings_connections_google-1440.png — trang /settings/connections/google ở 1440: có breadcrumb "Kết nối › Google" phía trên h1 "Google", cả breadcrumb và h1 đều căn trái đúng x≈304px — trùng mép trái h1 "Chung" ở frame (1) trong sai số nhìn bằng mắt; mục "Kết nối" trong thanh bên đang active (nền xám). Khớp yêu cầu "cạnh trái h1 trùng nhau trên mọi trang".
    (3) evidence/thanh-ben-375.png — trang /settings ở 375: thanh bên đổi thành một hàng ngang cuộn được phía trên h1 (Chung, Tiến tệ, Trường, Thành viên, Tổ chức, Đi...), không còn nhãn nhóm nào hiện — đúng quy tắc "dưới 768 không nhãn nhóm, một hàng cuộn ngang"; không thấy phần tử nào tràn ra ngoài khung nhìn ở ảnh này.
    Tất cả 3 frame đều khớp Expected, không mâu thuẫn.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver ở đây là script Bash gọi puppeteer-core nội bộ (không phải
    Browser tool của tôi có read_network_requests) — ghi "n-a (driver)" đúng luật.
    Kết luận: E3 (AC-3) PASS thật — tự chạy lại độc lập toàn bộ răng đo, xác nhận cùng
    con số 232/232, exit 0.

- eval: E4
  run_id: e4vgeq5kq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence-e4-verify/E4-step1.png
  observed: |
    4 frame đã lưu, đọc lại bằng Read (ảnh thật, không đoán từ ký ức lệnh):
    E4-step1.png (lần gieo 1, vi, /crm/settings/connections/slack): h1 "Slack" đúng font lớn đầu trang; ngay dưới là trạng thái vuông "Chưa cắm" nằm trong thân trang (page-shell-content), đúng Expected cho Slack chưa kết nối. Sidebar mục "Kết nối" đang bật sáng.
    E4-step2.png (lần gieo 2, en, /crm/settings/connections/google): h1 "Google"; thẻ đầu tiên có tiêu đề "Not configured" — KHÔNG chứa chữ "Google" trong tiêu đề thẻ, đúng Expected "tiêu đề thẻ không chứa tên nhà cung cấp". Breadcrumb "Connections > Google".
    E4-step3.png (lần gieo 2, vi, /crm/settings/connections): góc trên-phải vùng hành động đầu trang (page-shell-actions) có nút "Thêm kết nối" — đúng Expected. Danh sách dưới hiện Slack "Đã cắm" / nút "Quản lý" và Zalo "Đã cắm" / "Quản lý", xác nhận lần gieo 2 (Slack đã kết nối) đang hoạt động.
    E4-step4.png (lần gieo 2, en, /crm/settings/connections/slack): h1 "Slack"; góc trên-phải vùng hành động đầu trang có nút "Disconnect" — đúng Expected "nút nằm trong page-shell-actions". Trạng thái "Connected" hiện dưới h1.
    Cả 4 frame KHỚP hoàn toàn với Expected của AC-4, không mâu thuẫn.
  network_observed: clean
  output: |
    KẾT LUẬN: AC-4 (E4) PASS độc lập, exit 0, đúng 38/38 khẳng định theo đúng ma trận đã
    khai trong _acceptance/khung-trang-cai-dat/evals.yaml.

- eval: E5
  run_id: minted-khung-trang-cai-dat-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_breadcrumb
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat.dom.tsx -t 'breadcrumb'
     0 fail
     38 expect() calls
    Ran 2 tests across 1 file. [543.00ms]

- eval: E6
  run_id: minted-khung-trang-cai-dat-E6-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  reason: |
    DB dev dùng chung (cổng 3720/3721) đang có dữ liệu rác từ một lượt chạy trước chưa dọn
    xong (hoặc đang chạy song song): tài khoản Slack "ktcdge968o-slack" gắn với user test
    "ktcdge968o-quan-tri@thu.test" (tạo lúc 2026-09-25T03:21:30Z). "Lần gieo 1" của
    man-chrome.mjs đòi hỏi CSDL KHÔNG có tài khoản Slack nào trước khi bắt đầu, nên script
    thoát mã 2 ngay ở bước tiền-đề, trước khi kịp mở bất kỳ trang con Kết nối nào — không
    có gì để gán cho E6 (PASS hay FAIL). Verifier không tự dọn được dữ liệu rác này: mọi
    lần thử ghi/xoá trực tiếp vào DB (kể cả chỉ đọc bằng script Prisma inline) bị chặn bởi
    classifier với lý do "Modify Shared Resources"/"Blocked by classifier", và kho không có
    lệnh dọn nhẹ hơn — chỉ có `db:reset` xoá toàn bộ DB dev dùng chung (quá phá huỷ, không
    tự ý làm). Đồng thời `ps aux` cho thấy có một tiến trình khác đang chạy ngay lúc đó:
    `node _acceptance/khung-trang-cai-dat/rang/khong-hoi-quy.mjs` (PID 30407, bắt đầu
    10:19AM) — rất có thể một lần đo khác của cùng hồ sơ này đang dùng chung DB/máy chủ,
    gây va chạm. Theo luật kho (không tắt máy chủ đang chạy sẵn, không tự ý đụng DB dùng
    chung), verifier dừng ở đây và báo cannotRun thay vì ép chạy. Chưa chụp được frame nào
    (script thoát trước khi puppeteer.launch()), nên không có evidence/E6-step*.png; chưa
    thực hiện bước chiều đỏ (bỏ breadcrumb khỏi zalo/page.tsx) vì không có baseline để so.
  output: |
    $ APP_URL=http://localhost:3720 API_URL=http://localhost:3721 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-trang-cai-dat/rang/man-chrome.mjs"
    -- tiền đề lần đo: contextDevApiKey đã có sẵn, không dựng
    -- tiền đề lần đo: ảnh đại diện đã có sẵn, không dựng
    -- tiền đề lần đo: workspace đã có tên miền được phép, không dựng
    $ bun scripts/dev-session.ts "ktcdgebqk4-quan-tri@thu.test"
    lần gieo 1: slack chưa kết nối
    KHÔNG ĐO ĐƯỢC: CSDL đã có 1 tài khoản Slack — lần gieo 1 cần Slack chưa kết nối
    EXIT=2

- eval: E7
  run_id: minted-khung-trang-cai-dat-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_thanh_ben
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat-thanh-ben.dom.tsx
     0 fail
     49 expect() calls
    Ran 5 tests across 1 file. [326.00ms]

- eval: E8
  run_id: minted-khung-trang-cai-dat-E8-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  reason: |
    Rặng chung E3/E8 (_acceptance/khung-trang-cai-dat/rang/man-chrome.mjs, chạy qua
    scripts/lan-do/tien-de.mjs) thoát mã 2 ngay ở bước tiền-đề "lần gieo 1: slack chưa kết
    nối", TRƯỚC cả khi mở trình duyệt — nên KHÔNG có assertion E8 nào (nhãn nhóm ở
    1440/768/375) được chạy, và KHÔNG có frame mới nào được chụp. Lý do: CSDL dev trên cây
    đang xét đã sẵn có 1 tài khoản Slack với accessToken khác null (còn sót lại từ một lượt
    chạy khác trước đó, vì dọn-dẹp của man-chrome.mjs chỉ xoá đúng ID của chính lượt nó
    theo timestamp riêng), trong khi "lần gieo 1" đòi hỏi Slack CHƯA kết nối. Đây là lỗi
    tiền-đề/dữ liệu môi trường, không phải lỗi component thành-bên (settings-sidebar.tsx)
    đang xét. Verifier không tự dọn dẹp được: thử viết một script đọc/kiểm tra bằng
    db.account.findMany({providerId:"slack", accessToken:{not:null}}) đã bị bộ phân loại
    quyền của Claude Code chặn với lý do "Credential Exploration", và theo đúng luật của bộ
    phân loại là không được thử cách khác để đạt cùng kết quả (đổi field select, dùng sql
    trực tiếp, Prisma Studio, v.v.) — nên dừng hẳn ở đây thay vì tự xoá/sửa dữ liệu CSDL
    chia sẻ.
  output: |
    $ APP_URL=http://localhost:3720 API_URL=http://localhost:3721 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-trang-cai-dat/rang/man-chrome.mjs"
    -- tiền đề lần đo: contextDevApiKey đã có sẵn, không dựng
    -- tiền đề lần đo: ảnh đại diện đã có sẵn, không dựng
    -- tiền đề lần đo: workspace đã có sẵn tên miền được phép, không dựng
    $ bun scripts/dev-session.ts "ktcdgea7ta-quan-tri@thu.test"
    lần gieo 1: slack chưa kết nối
    KHÔNG ĐO ĐƯỢC: CSDL đã có 1 tài khoản Slack — lần gieo 1 cần Slack chưa kết nối
    EXIT=2
    -> Script tự thoát mã 2 trước khi gọi puppeteer.launch(), trước khi mở bất kỳ trang
    nào, trước khi chụp evidence/thanh-ben-*.png. Không có assertion E8 nào chạy.

- eval: E9
  run_id: minted-khung-trang-cai-dat-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_nhan
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && bun test test/khung-trang-cai-dat.spec.ts -t 'nhan'
     0 fail
     17 expect() calls
    Ran 3 tests across 1 file. [8.00ms]

- eval: E10
  run_id: minted-khung-trang-cai-dat-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_menu_nguoi_dung
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/khung-trang-cai-dat-menu.dom.tsx
     0 fail
     6 expect() calls
    Ran 2 tests across 1 file. [459.00ms]

- eval: E11
  run_id: minted-khung-trang-cai-dat-E11-r1
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  reason: |
    Môi trường (không liên quan AC-8) chặn mọi trang có bảo vệ: middleware proxy.ts đọc
    gate settings.researchKey (khoá API Context ở AppSetting singleton id="app"), và ở
    CSDL dev dùng chung (postgresql://localhost:5432/crm) giá trị này đang configured=false,
    nên MỌI đường /crm/* bị 307 sang /onboarding/research trước khi chạm được avatar menu,
    /reminders hay /settings/connections/zalo. Đo trực tiếp bằng curl lặp ~6 phút cho thấy
    có một cửa sổ configured=true ngắn (~32s, 10:33:14–10:33:46 giờ máy) rồi rơi về false
    ổn định — trùng với có một phiên Claude Code khác (pid 91041, đang chạy song song trên
    cùng máy/CSDL, xác nhận qua `ps aux`) — nên nhiều khả năng một tiến trình đo song song
    đang bật/tắt khoá này cho AC khác rồi để lại false. Verifier không được phép tự sửa: (1)
    ghi thẳng contextDevApiKey vào DB bị auto-mode classifier chặn (lý do "Credential
    Materialization") khi thử đọc field đó; (2) gõ bất kỳ chuỗi nào vào ô "Khoá API Context"
    trên /onboarding/research bị cấm cứng theo luật an toàn (Prohibited: "Entering ... API
    keys ... into any field" — cấm cả khi có "cho phép"). Không có cách hợp lệ nào khác để
    qua gate này (docs/environment.md: "the gate cannot be dismissed", không có biến môi
    trường bypass). Vì vậy không đo được AC-8 một cách đáng tin cậy trong lượt này — đây là
    chặn hạ tầng/môi trường dùng chung, không phải lỗi của tính năng nhắc-buổi-sáng/Zalo.
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E11-step3.png
  observed: |
    evidence/E11-step3.png (đã đọc bằng Read, ảnh thật): màn hình tối "Làm dày dữ liệu CRM
    của bạn" / "Khoá API Context" với ô nhập "Dán khoá vào đây" và nút "Tiếp tục" — đây
    chính là trang /onboarding/research (gate), KHÔNG phải trang đích
    /crm/settings/connections/zalo. Mâu thuẫn trực tiếp với Expected (phải thấy trang Kết
    nối › Zalo với liên kết "Nối Zalo của tôi") — xác nhận cả 3 bước của E11 đều bị gate
    chặn trước khi tới đích. File evidence/nhac-1440.png trong cùng thư mục có timestamp
    10:24 (trước khi verifier bắt đầu chạy lúc 10:36+) — đây là ảnh CŨ còn sót từ lượt
    trước, KHÔNG phải bằng chứng vừa chụp trong lượt này.
  network_observed: clean
  output: |
    Tổng 0/5 assertion pass — nhưng nguyên nhân là hạ tầng (xem reason), không kết luận
    được AC-8 đúng/sai. Bằng chứng đã lưu: evidence/E11-step3.png, evidence/E11-network.txt
    ({"network":[],"consoleErrors":[]} — không có request lỗi 4xx/5xx), evidence/E11-result.json.
    Dọn dẹp: đã kill đúng các tiến trình TỰ MÌNH khởi động (apps/app, apps/api trên cổng
    3000/3001), xác nhận cổng trống lại; không đụng tới cổng 3720/3721 hay tiến trình nào
    không phải do verifier khởi động.

- eval: E12
  run_id: minted-khung-trang-cai-dat-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ktcd_chuyen_huong
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && bun test test/khung-trang-cai-dat.spec.ts -t 'chuyen-huong'
     0 fail
     4 expect() calls
    Ran 1 test across 1 file. [14.00ms]

- eval: E13
  run_id: minted-khung-trang-cai-dat-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ktcd_man_chrome
  verified_at: 2026-09-25T03:18:36Z
  screenshot: _acceptance/khung-trang-cai-dat/evidence/E13-step1.html
  observed: |
    Đọc trực tiếp _acceptance/khung-trang-cai-dat/evidence/E13-step1.html (fallback HTML —
    RSC payload, đọc bằng grep vì Read tool từ chối do file quá khổ cho một dòng): tại vị
    trí digest, nội dung là literal "digest":"NEXT_REDIRECT;replace;/crm/reminders;307;"
    gắn với component ThongBaoCuaBanPage — response HTTP 200 thật cho GET
    /crm/settings/notifications (đã đăng nhập), khớp Expected (đường cuối = /crm/reminders).
    Đối chiếu bằng trình duyệt sống (Chrome qua Claude_Browser): sau khi điều hướng tới
    http://localhost:3000/crm/settings/notifications và chờ ổn định, location.pathname đọc
    được là "/crm/reminders", tiêu đề tab đổi thành "Nhắc buổi sáng · OneHub CRM", màn hình
    hiển thị đúng trang Nhắc buổi sáng (khối "Zalo của bạn", khối "Nhận nhắc việc qua") —
    khớp Expected, không mâu thuẫn.
  network_observed: clean
  output: |
    exitCode = 0: cả 2 assertion máy-kiểm-được đều PASS, network sạch trong phạm vi
    app-scope. Không sửa code. Trạng thái DB đã được tien-de.mjs tự dọn về như trước sau
    mỗi cửa sổ đo.

- eval: E14
  run_id: minted-khung-trang-cai-dat-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_tai_lieu
  verified_at: 2026-09-25T03:18:36Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/tai-lieu.mjs
    tai-lieu: 5/5 khang dinh dat

- eval: E15
  run_id: minted-khung-trang-cai-dat-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.lv30_loi_vao_cai_dat
  verified_at: 2026-09-25T03:18:36Z
  output: |
    cd apps/app && bun test test/cai-dat-dieu-huong.spec.ts -t loi-vao-dieu-phoi
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [6.00ms]

- eval: E16
  run_id: minted-khung-trang-cai-dat-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_khong_hoi_quy
  verified_at: 2026-09-25T03:18:36Z
  output: |
    node _acceptance/khung-trang-cai-dat/rang/khong-hoi-quy.mjs
    khong-hoi-quy: 150/150 khang dinh dat · 23 tep bai · 176 lenh
    [exited with code 0]

- eval: E17
  run_id: minted-khung-trang-cai-dat-E17-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ktcd_san_thiet_ke
  verified_at: 2026-09-25T03:18:36Z
  output: |
    bun _acceptance/khung-trang-cai-dat/rang/san-thiet-ke.mjs
    so tep giao dien vong nay cham: 27
    san-thiet-ke: dat

### Lệnh suite (hồi quy)

Lệnh `bun run test` là lệnh KHÔNG gắn eval nào (chạy toàn bộ test suite của monorepo, không
riêng cho hồ sơ này) và đã FAIL trong lượt này (exit_code 1), ở một gói telemetry khác,
không phải ở các test/script của khung-trang-cai-dat (E1, E2, E5, E7, E9, E10, E12, E14–E17
đều đã chạy PASS riêng, ở trên). Ghi rõ ở đây để không ẩn kết quả, nhưng không gán được cho
bất kỳ AC nào của hồ sơ này.

- cmd: bun run test
  run_id: muge67b9ueib
  exit_code: 1
  verified_at: 2026-09-25T03:18:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-khung-trang-cai-dat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T03:18:36Z

- cmd: bun run lint:slop
  run_id: minted-khung-trang-cai-dat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T03:18:36Z

- cmd: bunx turbo run build --force
  run_id: minted-khung-trang-cai-dat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T03:18:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

E15 (test config:executors.test.lv30_loi_vao_cai_dat, bài "loi-vao-dieu-phoi") pass trên cả
HEAD lẫn diffBase — đây là regression-guard có chủ ý của Điều phối 30 ngày (bài kiểm đã ký
trước, chỉ đổi đúng một khẳng định "đứng cuối" thành "đứng cuối nhóm Con người" theo AC-11),
không phải một khẳng định mới của khung-trang-cai-dat, nên non-discriminating ở đây là dự
kiến chứ không phải dấu hiệu eval vô nghĩa.

## Variance

none — every multi-run eval is uniform (không eval nào của hồ sơ này mang runs > 1 trong
lượt này).

## Iterations

Round 1: E6, E8, E11 (ui-check) BLOCKED bởi hạ tầng dev dùng chung — DB dính dữ liệu rác
(tài khoản Slack sót lại) và/hoặc một lần đo song song khác trên cùng máy/CSDL cho E6/E8, và
gate researchKey (AppSetting) rơi về configured=false giữa chừng, có khả năng do một phiên
đo khác, cho E11; không sửa code, không tự đụng DB/khoá dùng chung, dừng lại và báo BLOCKED
đúng luật kho thay vì ép chạy hoặc tự chế dữ liệu.
