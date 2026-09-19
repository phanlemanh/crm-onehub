---
schema_version: 2
feature_slug: vao-bang-email-va-mat-khau
verdict: REJECT
failed_evals: [E12]
reason:
verified_by: fresh-context verification subagent (vòng 2)
enforcement_mode: strict
bypass_used: false
verified_commit: 5669ebb814be2a8989bf4bf620be94b23de26b51
human_signoff:
---

# Evidence Report: vao-bang-email-va-mat-khau

run_id cho lượt này: `vao-bang-email-va-mat-khau-20260919-r2` (mọi dòng round-2
trong `run-log.jsonl` dùng chung mã này; các dòng round-1 giữ nguyên
`vao-bang-email-va-mat-khau-20260919-r1`).

Cây sạch, HEAD khớp `5669ebb814be2a8989bf4bf620be94b23de26b51`, nhánh
`chore/o-vao-bang-mat-khau`. Cổng 3000/3001 đang bị một phiên khác mượn để
chấm cây khác trong lúc này — KHÔNG đụng tới. Dựng riêng hai máy chủ của
chính cây đang xét ở cổng 3300 (`app-cay-nay`) và 3301 (`api-cay-nay`, khởi
động lại một lần giữa chừng để `APP_URL`/`trustedOrigins` khớp 3300 — xem mục
Known limits). Trước khung hình đầu tiên đã tự xác minh: đặt một tệp `.svg`
đánh dấu vào `apps/app/public/`, xin lại đúng nó qua `http://localhost:3300`,
nhận về đúng nội dung đã đặt (không bị proxy chặn vì `.svg` nằm trong danh
sách phần mở rộng đi qua được của proxy) — xác nhận máy chủ ở cổng 3300 đang
phục vụ đúng cây này, không phải cây khác.

## Tóm tắt — vì sao vẫn REJECT dù bốn lỗi vòng 1 đã sửa xong

Bốn eval trượt ở vòng 1 (**E1, E5, E7, E13**) đều đã sửa và đo lại XANH thật ở
vòng này — đọc mã bài kiểm xác nhận đúng khẳng định mà `expected` đòi, không
chỉ nhìn mã thoát:

- **E1** — thêm hẳn `describe("phat-chia", ...)` còn thiếu ở vòng 1: khẳng
  định link+hạn, đọc lại đúng một hàng verification trỏ đúng id, hạn nằm
  trong tương lai và ≤ TTL, VÀ chiều âm (id người phát không tồn tại → ném
  lỗi, đếm hàng verification không đổi) trên cùng fixture với khẳng định ghim
  tên bảng + số hàng mong đợi.
- **E5** — fixture viết lại: đúc và tiêu thụ một chia THẬT để có mật khẩu cũ
  trước, rồi mới ép hạn một chia thứ hai của CHÍNH người đó về quá khứ. Khẳng
  định kép giờ có mặt: mật khẩu cũ vẫn đăng nhập được, mật khẩu mới thử thì
  không.
- **E7** — thêm đúng "chiều dương" mà vòng 1 thiếu: trên CHÍNH địa chỉ vừa bị
  chặn tự đăng ký, đúc một chia thật, đặt mật khẩu qua chia đó, rồi đăng nhập
  bằng mật khẩu mới — cả ba bước đều thành công, tách rõ "chặn tự đăng ký"
  khỏi "chặn luôn cả cửa mật khẩu".
- **E13** (nghiêm trọng nhất vòng 1) — `apps/app/app/(landing)/sign-in/page.tsx`
  không còn nhánh chết "Chưa có cách nào để vào" khi không nhà cung cấp nào
  được cấu hình. `<PasswordSignIn>` giờ LUÔN render; chỉ có dải phân cách
  "hoặc" + các nút nhà cung cấp khác là ẩn có điều kiện. Đã đo lại đúng kịch
  bản `.env` hiện có của kho (`GOOGLE_CLIENT_ID=""`) — đúng kịch bản mục tiêu
  của cả tính năng — và ô email/mật khẩu hiện ra ngay, không còn màn chết.

Nhưng vòng soi kỹ hơn lần này phát hiện **một eval mới không đạt sạch**:

- **E12** — hai trong ba khung hình (member: nút tắt có lý do đọc được; admin:
  nút bấm được) đo XANH rõ ràng, có cả bằng chứng DOM (`disabled`, `title`)
  lẫn hình ảnh. Nhưng khung hình thứ ba (ghi vết) chỉ chứng minh được nửa lời
  hứa: phần "ai đã phát" đọc được, phần "phát lúc nào" bị CẮT MẤT trên màn
  hình thật ở đúng bề rộng chụp chuẩn của kho (1280px) — xác nhận bằng
  `getComputedStyle` trên trang thật (không chỉ đoán từ ảnh): dòng ghi vết có
  `white-space: nowrap` bên trong một ô bảng `overflow: hidden`, nên đuôi
  "· N phút trước" bị cắt. Lặp lại cả với tên quản trị NGẮN ("Ada Okafor") —
  vẫn bị cắt giữa chữ ("vừa xo…" thay vì "vừa xong"). Theo đúng luật chính
  `expected` của E12 ghi ("Khong thay -> UNCERTAIN, KHONG duoc suy ra tu
  E11"), khung hình này không được tính là đã chứng minh. Xem
  `review-findings.md` để biết chi tiết và một lỗi bố cục thứ hai (không nằm
  trong phạm vi eval nào) phát hiện cùng lúc.

## Bảng eval

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (named-skip trong) |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-6/AC-11 | ui-check | UNCERTAIN |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-12 | judgment | PENDING-HUMAN |
| E15 | AC-3/AC-9/AC-6 | test (design-gate static) | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-8 | ui-check | PASS |

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verified_at: 2026-09-19T09:52:00Z
  output: |
    api:test:  459 pass / 0 fail (Ran 459 tests across 49 files)
    app:test:  298 pass / 0 fail (Ran 298 tests across 31 files)
    agent:test:  427 pass / 0 fail (Ran 427 tests across 37 files)
    @crm/auth:test:  102 pass / 0 fail (Ran 102 tests across 13 files)
    @crm/ui:test:  114 pass, @crm/db:test: 128 pass, @crm/telemetry:test: 61 pass,
    @crm/env:test: 17 pass, @crm/validation:test: 17 pass
    Tasks: 11 successful, 11 total

- cmd: bunx turbo run lint --force
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verified_at: 2026-09-19T09:53:00Z
  output: |
    Chỉ warning (unused var trong bài kiểm phat-chia mới, noDocumentCookie,
    noBarrelFile) — không có error.
    Tasks: 9 successful, 9 total

- cmd: bun run lint:slop
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verified_at: 2026-09-19T09:53:30Z
  output: |
    Found 0 warnings and 0 errors. 1062 files.

- cmd: bunx turbo run build --force
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verified_at: 2026-09-19T09:54:00Z
  output: |
    Tasks: 4 successful, 4 total. Build agent + app + auth + ui xong sạch.

## Evidence

- eval: E1
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_phat_chia
  verified_at: 2026-09-19T09:44:10Z
  output: |
    1 pass, 6 filtered out, 0 fail, 11 expect() calls
  observed: |
    describe("phat-chia") mới: chiều dương khẳng định url+expiresAt trả về,
    đọc LẠI từ DB đúng một hàng verification trỏ đúng id người nhận, hạn
    trong tương lai và ≤ TTL. Chiều âm cùng fixture: id người phát không tồn
    tại → reject, đếm hàng verification (theo người và theo lượt) không đổi
    trước/sau, khẳng định ghim tên bảng + số hàng mong đợi trong thông điệp.

- eval: E2
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_tao_nguoi_truoc
  verified_at: 2026-09-19T09:44:40Z
  output: |
    2 pass, 4 filtered out, 0 fail, 8 expect() calls
  observed: |
    Không đổi so với vòng 1 — cả hai chiều (tạo-trước-rồi-phát, và từ chối
    địa chỉ ngoài danh sách với đếm không đổi) vẫn có mặt.

- eval: E3
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_vong_tron
  verified_at: 2026-09-19T09:45:00Z
  output: |
    2 pass, 18 filtered out, 0 fail, 15 expect() calls
  observed: |
    Không đổi so với vòng 1 — đủ 4 chặng đúc/tiêu thụ/đọc lại DB/đăng nhập,
    cộng khẳng định huỷ phiên cũ.

- eval: E4
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_dung_lan_hai
  verified_at: 2026-09-19T09:45:20Z
  output: |
    1 pass, 19 filtered out, 0 fail, 4 expect() calls
  observed: |
    Không đổi so với vòng 1 — khẳng định kép hai chiều đăng nhập vẫn có mặt.

- eval: E5
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_het_han
  verified_at: 2026-09-19T09:45:40Z
  output: |
    1 pass, 19 filtered out, 0 fail, 5 expect() calls
  observed: |
    SỬA SO VỚI VÒNG 1 (khi đó 3 expect() calls, thiếu nửa khẳng định). Fixture
    giờ: đúc+tiêu thụ một chia đầu để có mật khẩu cũ thật, đúc chia thứ hai
    cho CHÍNH người đó rồi ép hạn về quá khứ qua DB. Khẳng định kép có mặt:
    đăng nhập bằng mật khẩu cũ vẫn được, bằng mật khẩu mới vừa thử thì không.
    Chiều dương (hạn còn tương lai → đặt được) vẫn giữ nguyên trên fixture
    khác.

- eval: E6
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_quyen_hai_ve
  verified_at: 2026-09-19T09:46:00Z
  output: |
    1 pass, 5 filtered out, 0 fail, 6 expect() calls
  observed: |
    Không đổi so với vòng 1 — vị từ tiêm hai chiều vẫn quyết định kết quả.

- eval: E7
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_chan_tu_dang_ky
  verified_at: 2026-09-19T09:46:20Z
  output: |
    2 pass, 18 filtered out, 0 fail, 7 expect() calls
  observed: |
    SỬA SO VỚI VÒNG 1 (khi đó 5 expect() calls, thiếu chiều dương). Test
    "chan-tu-dang-ky" giờ tiếp nối trên CHÍNH địa chỉ vừa bị chặn: một quản
    trị đúc chia thật cho địa chỉ đó (`ducChia`), người nhận đặt mật khẩu qua
    chia đó thành công, rồi đăng nhập bằng mật khẩu mới thành công — đúng
    khẳng định "ta chặn tự đăng ký, không chặn cửa mật khẩu" mà vòng 1 thiếu.

- eval: E8
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_mat_khau_yeu
  verified_at: 2026-09-19T09:46:35Z
  output: |
    8 pass, 12 filtered out, 0 fail, 26 expect() calls
    [auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: fetch failed
  observed: |
    Không đổi so với vòng 1 — ba dòng thông điệp phân biệt được, nhánh mạng
    không với tới được vẫn báo bo-qua-co-ten đúng dạng, không lặng lẽ tính
    đạt.

- eval: E9
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_cua_google_con_song
  verified_at: 2026-09-19T09:46:50Z
  output: |
    5 pass, 15 filtered out, 0 fail, 5 expect() calls
  observed: |
    Không đổi so với vòng 1. GOOGLE_CLIENT_ID vẫn rỗng trong .env của kho.
    Khẳng định hình dạng cấu hình (nhà cung cấp google khai khi có khoá, và
    accountLinking.updateUserInfoOnLink=true) chạy VÔ ĐIỀU KIỆN và xanh thật.
    Ba chặng đi đường Google thật (đăng nhập thật, chặn người ngoài danh
    sách, gộp hai cửa cùng địa chỉ thành một hàng) đi qua nhánh BỎ QUA CÓ TÊN
    (`BO_QUA_GOOGLE`), in ra rõ ràng, KHÔNG tính là đã đo phần thật của
    "cửa Google vẫn sống song song". Vế người-nhìn-thấy của AC-9 nằm ở E13,
    và E13 vòng này đã PASS.

- eval: E10
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_trang_ngoai_cong
  verified_at: 2026-09-19T09:47:10Z
  output: |
    6 pass, 0 fail, 13 expect() calls across 2 files
  observed: |
    Không đổi so với vòng 1 — cả hai danh sách (UNGATED 4 phần tử, ANONYMOUS
    3 phần tử) khẳng định bằng SET, in tên phần tử lệch khi có.

- eval: E11
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_ghi_vet
  verified_at: 2026-09-19T09:47:50Z
  output: |
    1 pass, 5 filtered out, 0 fail, 3 expect() calls
  observed: |
    Không đổi so với vòng 1 — đọc lại qua service.allowances() (đúng truy vấn
    màn Thành viên gọi), ai/khi nào đều đúng và không đè lên nhau.

- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome, cookie
    phiên thật qua `bun run dev:session`, tree xác minh bằng đối chứng .svg
    qua APP_URL trước khi chụp)
  verified_at: 2026-09-19T10:06:00Z
  screenshot: evidence/E12-thanhvien-member.png
  observed: |
    Vai member: cả 4 nút "Phát liên kết" đang hiện trong khung nhìn đều ở
    trạng thái tắt (DOM: disabled=true), title="Cần quyền quản trị mới phát
    được" — có lý do đọc được, không biến mất câm. Khớp expected.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome)
  verified_at: 2026-09-19T10:06:10Z
  screenshot: evidence/E12-thanhvien-admin.png
  observed: |
    Vai admin (e12-admin-1789807964659): tất cả nút "Phát liên kết" bấm
    được (disabled=false qua DOM), có thêm nút "..." đổi vai trò ở mỗi hàng.
    Khớp expected.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome)
  verified_at: 2026-09-19T10:06:20Z
  screenshot: evidence/E12-ghivet.png
  observed: |
    CHỈ CHỨNG MINH ĐƯỢC MỘT NỬA. Phát THẬT một liên kết cho Priya Raman qua
    hộp thoại, đóng, tải lại màn Thành viên: hàng của Priya hiện
    "e12-admin-1789807964659 đã phát" — phần AI ĐÃ PHÁT đọc được rõ. NHƯNG
    phần "liên kết · N phút trước" (LÚC NÀO) bị cắt mất ở bề rộng cột thật —
    xác nhận bằng getComputedStyle trên trang sống (không chỉ đoán từ ảnh):
    span ghi vết có white-space:nowrap trong <td> có overflow:hidden, và
    scrollWidth > clientWidth. Lặp lại thử với "Ada Okafor" (tên ngắn hơn
    nhiều) làm người phát cho hàng Marcus Lindqvist: vẫn bị cắt, chỉ đỡ hơn
    ("Ada Okafor đã phát liên kết · vừa xo" — thiếu "ng" cuối). Đây là lỗi
    thật trên mã MỚI của chính vòng này (vet-line.tsx + cột Tên của
    members-table.tsx), không phải lỗi chụp hình. Theo đúng câu
    "Khong thay -> UNCERTAIN" mà chính expected của E12 ghi, khung hình này
    không được tính là đã chứng minh phần "phát lúc nào".
  network_observed: n-a (driver)

- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome, khung
    hình 1 chụp trong một browser context ẩn danh RIÊNG để tránh cookie phiên
    admin/member rò từ các bước trước trong cùng lượt)
  verified_at: 2026-09-19T10:01:00Z
  screenshot: evidence/E13-dangnhap.png
  observed: |
    SỬA SO VỚI VÒNG 1 (khi đó FAIL). Màn /sign-in chưa đăng nhập, đúng kịch
    bản .env hiện có (GOOGLE_CLIENT_ID rỗng, không Microsoft, không SSO): ô
    "Địa chỉ email" và ô "Mật khẩu" hiện ra ngay trên màn, có nút "Đăng
    nhập" — không còn màn chết "Chưa có cách nào để vào" của vòng 1. Vì môi
    trường này không có khoá Google, không có nút Google nào để so sánh
    "cùng màn với" — nhưng đây đúng là giới hạn môi trường đã khai từ vòng 1,
    không phải giới hạn của bản sửa; mã (`page.tsx`) giờ luôn render
    PasswordSignIn bất kể `social.length`, dải phân cách + các nút nhà cung
    cấp khác chỉ ẩn có điều kiện.
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome)
  verified_at: 2026-09-19T10:00:30Z
  screenshot: evidence/E13-datmatkhau.png
  observed: |
    Không đổi so với vòng 1. Liên kết còn hạn: hai ô mật khẩu, mức tối thiểu
    nói TRƯỚC khi gõ ("Ít nhất 12 ký tự. Không cần chữ hoa hay ký tự đặc
    biệt."), nút "Đặt mật khẩu".
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome; liên
    kết hết hạn dựng RIÊNG cho một người CHỈ nhận đúng một chia — tránh ca
    "phát lại xoá hàng cũ" của AC-13 làm hàng verification biến mất trước
    khi kịp ép hạn, thứ đã xảy ra ở lần thử đầu của chính lượt này)
  verified_at: 2026-09-19T10:03:00Z
  screenshot: evidence/E13-datmatkhau-hethan.png
  observed: |
    "Liên kết này hết hạn rồi. Nhắn người quản trị phát cho bạn một liên kết
    mới." — câu rõ ràng, nói đúng lý do (hết hạn) và việc cần làm tiếp. Khớp
    expected ("cau noi RO la het han").
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome, vai
    admin)
  verified_at: 2026-09-19T09:59:30Z
  screenshot: evidence/E13-hopthoai.png
  observed: |
    Hộp thoại "Liên kết đặt mật khẩu": "Gửi cho Priya Raman. Liên kết dùng
    được một lần, hết hạn sau một giờ.", ô Liên kết hiện ĐẦY ĐỦ URL (chọn
    sẵn, token thật), nút "Chép liên kết", hạn dùng nói bằng chữ. Không đổi
    so với vòng 1.
  network_observed: n-a (driver)

- eval: E14
  judged_by: pending human (T3, phán quyết trực tiếp bắt buộc — không được
    máy chấm)
  verdict: UNCERTAIN
  rationale: Hạng T3 đòi phán quyết trực tiếp của người theo đúng chỉ dẫn
    nhiệm vụ ("KHÔNG tự chấm"). Không đổi so với vòng 1. Nội dung nguồn:
    apps/app/lib/messages/auth.ts và apps/app/lib/messages/settings-thanh-vien.ts
    — câu chữ tiếng Việt tự nhiên trong các câu đã render, không thấy từ
    ghép kỹ thuật tự đúc ("Mật khẩu phải có ít nhất N ký tự.", "Mật khẩu này
    đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác.", "Liên kết
    này hết hạn rồi...", "Liên kết đặt mật khẩu") — nhưng đây là quan sát hỗ
    trợ, không phải phán quyết thay người.
  required_evidence:
    - Người đọc trực tiếp evidence/E13-hopthoai.png và evidence/E13-datmatkhau*.png
      (đã chụp lại tươi ở vòng này) rồi trả lời câu hỏi nguyên văn của E14.
  human_override:

- eval: E15
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_san_thiet_ke
  verified_at: 2026-09-19T09:48:10Z
  output: |
    Ba tệp đều verdict PASS, p0_count 0, blocking [], findings [].
  observed: |
    Không đổi so với vòng 1 — cả ba tệp đều sạch.

- eval: E16
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: config:executors.test.mk_phat_lai
  verified_at: 2026-09-19T09:47:55Z
  output: |
    1 pass, 19 filtered out, 0 fail, 6 expect() calls
  observed: |
    Không đổi so với vòng 1 — đủ cả bốn khẳng định (M2 vào được, M1 không
    vào được, chia1 vẫn bị từ chối, đếm hàng verification treo = 0).

- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome, set
    value qua input value-setter thật + dispatch input event)
  verified_at: 2026-09-19T10:02:00Z
  screenshot: evidence/E17-mk-ngan.png
  observed: |
    Không đổi so với vòng 1. Mật khẩu ngắn hơn mức tối thiểu ở cả hai ô, gửi:
    lỗi "Mật khẩu phải có ít nhất 12 ký tự." hiện cạnh ô "Mật khẩu mới"
    (client-side). Ô "Gõ lại mật khẩu" vẫn còn nguyên giá trị đã gõ.
  network_observed: n-a (driver)
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome)
  verified_at: 2026-09-19T10:02:20Z
  screenshot: evidence/E17-mk-dalo.png
  observed: |
    KHÁC VÒNG 1 THEO HƯỚNG TỐT HƠN: lượt này môi trường VỚI TỚI ĐƯỢC mạng
    ngoài, nên phép sàng mật khẩu đã lộ chạy THẬT (không phải named-skip
    như lượt chạy đơn vị E8 trong cùng vòng này) — "123456789012" trả về lỗi
    thật "Mật khẩu này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu
    khác.", PHÂN BIỆT rõ với câu ở khung 1, cùng vị trí cạnh ô "Mật khẩu
    mới". Ô xác nhận vẫn nguyên giá trị. Liên kết KHÔNG bị tiêu thụ.
  network_observed: clean
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r2
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless + Google Chrome)
  verified_at: 2026-09-19T10:02:40Z
  screenshot: evidence/E17-sua-duoc.png
  observed: |
    Không đổi so với vòng 1. Vẫn trên CHÍNH liên kết vừa bị từ chối hai lần
    ở trên, gõ mật khẩu sạch và gửi: "Xong — Mật khẩu đã đặt. Từ giờ bạn vào
    CRM được bằng địa chỉ email và mật khẩu này, kể cả khi mạng không vào
    được Google." Hai lần bị từ chối trước đó không đốt mất liên kết.
  network_observed: clean

## Known limits

- Không gửi được thư (mời, đặt lại mật khẩu) — kho chưa có, đã khai trong hợp đồng.
- Không báo cho người dùng khi thông tin đăng nhập đổi — chỉ có ghi vết cho quản trị (AC-11).
- Chìa API của quản trị đi qua cầu REST như một phiên thường — đã khai sẵn
  trong hợp đồng, không phải phát hiện mới.
- Huỷ phiên cũ khi đặt lại mật khẩu xoá hàng phiên thật, nhưng cache bánh
  phiên 5 phút khiến một phiên mở trước vẫn dùng được tới 5 phút sau — đã
  khai sẵn trong hợp đồng.
- E9 xanh chỉ phủ được vỏ cấu hình backend; ba chặng đi đường Google thật đều
  BỎ QUA CÓ TÊN trong môi trường này (GOOGLE_CLIENT_ID rỗng) — vế người nhìn
  thấy nằm ở E13 (vòng này PASS), nhưng vế "đăng nhập Google thật" chưa từng
  được đo máy trong bất kỳ vòng nào của kho này.
- Máy chủ `api-cay-nay` dùng cho vòng này khởi động lần đầu KHÔNG có `APP_URL`
  riêng (launch.json chỉ khai `PORT`), nên các liên kết đặt mật khẩu đầu tiên
  hiển thị với host `:3000` và bị `trustedOrigins` từ chối khi nộp form từ
  `:3300` ("Invalid origin"). Đã khởi động lại thủ công với `APP_URL=http://localhost:3300`
  khớp `app-cay-nay` trước khi chụp bất kỳ khung hình nào dùng để kết luận —
  đây là lỗi cấu hình của chính phiên đo này (launch.json), không phải hành
  vi sản phẩm; không sửa `launch.json` (nằm ngoài `diffFiles`/không phải mã
  sản phẩm), chỉ ghi lại để vòng đo sau biết cần set `APP_URL` cho cả hai máy
  chủ, không chỉ `app-cay-nay`.

## Ngoài hợp đồng

Xem `review-findings.md`:
- Mục cũ (vòng 1, chưa sửa): va chạm id trong `apps/api/scripts/dev-session.ts`
  khi hai email trùng 10 ký tự đầu.
- Mục mới (vòng 2): trang `/[slug]/settings/members` xếp chồng hai bảng
  ("Thành viên" và "Được phép vào") ở một số chiều cao khung nhìn phổ biến
  (1280×700 đến 1280×1000 đã thử; ổn định trở lại từ ~1280×1400), và dòng ghi
  vết bị cắt chữ ở cột Tên khi tên người phát đủ dài.

## Analyst

Không chạy đối chứng `diffBase` trong lượt này (không được yêu cầu rõ trong
nhiệm vụ giao cho phiên đo này). Không khẳng định gì về non-discriminating ở
đây; để trống thận trọng thay vì đoán.

## Variance

none — không có eval nào khai `runs > 1` trong tập 17 eval của vòng này.

## Iterations

Round 1: E1, E5, E7, E13 trượt — E1 do eval tham chiếu bài kiểm không tồn
tại; E5, E7 do bài kiểm thiếu khẳng định mà chính eval đòi dù lệnh xanh; E13
do lỗi sản phẩm thật (màn đăng nhập không hiện mật khẩu khi Google chưa cấu
hình). Trả REJECT.

Round 2 (lượt này): cả bốn lỗi của vòng 1 đo lại XANH, đọc mã bài kiểm xác
nhận đủ khẳng định `expected` đòi, không chỉ nhìn mã thoát. Nhưng soi kỹ hơn
ở E12 (khung hình ghi vết) phát hiện một lỗi hiển thị thật trên chính mã mới
của vòng này (vet-line.tsx bị cắt chữ ở cột Tên) khiến phần "phát lúc nào"
không đọc được trên màn hình thật ở bề rộng chụp chuẩn — theo đúng luật riêng
của E12, khung hình này tính UNCERTAIN, không phải PASS. Trả REJECT, đích
danh E12. Phiên NGHIỆM THU này không vá — trả về cho người điều phối quyết
định vòng kế tiếp (rất có thể chỉ cần nới độ rộng cột Tên hoặc bỏ
`white-space: nowrap` trên dòng ghi vết — một sửa nhỏ, không đụng logic).
