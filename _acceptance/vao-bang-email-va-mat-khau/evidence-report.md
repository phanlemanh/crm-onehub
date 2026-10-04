---
schema_version: 2
feature_slug: vao-bang-email-va-mat-khau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (vòng 3)
enforcement_mode: strict
bypass_used: false
verified_commit: 0d03129ecfa5bdbcff83dee9706a511e342f399c
human_signoff: Phan Le Manh 2026-09-19
---

# Evidence Report: vao-bang-email-va-mat-khau

run_id cho lượt này: `vao-bang-email-va-mat-khau-20260919-r3` (mọi dòng round-3
trong `run-log.jsonl` dùng chung mã này; các dòng round-1/round-2 giữ nguyên
`vao-bang-email-va-mat-khau-20260919-r1` / `-r2`).

Cây sạch, HEAD khớp `3dd48ef15d2ce343c09311587b43ece6a61a45b1`, nhánh
`chore/o-vao-bang-mat-khau`. Cổng 3000/3001 đang bị một phiên khác mượn để
chấm cây khác trong lúc này — KHÔNG đụng tới, không tắt/khởi động lại gì ở đó.
Dựng riêng hai máy chủ của chính cây đang xét ở cổng 3300 (`app-cay-nay`) và
3301 (`api-cay-nay`). Trước khung hình đầu tiên đã tự xác minh: đặt một tệp
`.svg` đánh dấu vào `apps/app/public/`, xin lại đúng nó qua
`http://localhost:3300`, nhận về đúng nội dung đã đặt (không bị proxy chặn vì
`.svg` nằm trong danh sách phần mở rộng đi qua được) — xác nhận máy chủ ở
cổng 3300 đang phục vụ đúng cây này, không phải cây khác. Xoá tệp đánh dấu
ngay sau khi xác minh xong.

Diff mã sản phẩm kể từ commit đã ký của vòng 2 (`5669ebb8`) chỉ có ĐÚNG một
dòng: `apps/app/app/(app)/[slug]/settings/members/members-table.tsx` thêm
`cellClassName: "whitespace-normal align-top"` trên cột Tên (commit
`8a480042`) — đúng bản vá cho lỗi E12 vòng 2. Mọi eval khác không có lý do kỹ
thuật để đổi kết quả, nhưng vẫn đo lại TỪNG cái, không suy diễn từ vòng trước.

## Tóm tắt — vì sao vòng này không còn eval nào trượt

**E12** (mục duy nhất trượt ở vòng 2) đo lại XANH thật ở vòng này. Khung hình
ghi vết (khung hình 3) được dựng lại đúng kịch bản làm vòng 2 trượt: admin có
tên DÀI nhất trong kho dữ liệu hiện có (`e12-admin-1789807964659`, 23 ký tự —
chính danh tính đã tái hiện lỗi ở vòng 2) phát một liên kết thật cho
`zzm5c39f436`, tải lại màn Thành viên. Dòng ghi vết dưới hàng người nhận đọc
được TRỌN VẸN: `"e12-admin-1789807964659 đã phát liên kết · 8 phút trước"` —
cả "ai" lẫn "lúc nào". Xác nhận bằng hình học thật trên trang sống
(`getBoundingClientRect`/`getComputedStyle`), không chỉ nhìn ảnh: ở bề rộng
1280px, `span.bottom (788) ≤ cell.bottom (800)` và `span.right (540) ≤
cell.right (552)`, `white-space: normal` (không còn `nowrap`) — không tràn
theo cả hai chiều. Đo lại lần hai ở chiều cao 1400px (né lỗi xếp-chồng-bảng
mô tả dưới đây) cho cùng kết quả không cắt. Hai khung hình còn lại của E12
(nút tắt có lý do ở vai member, nút bấm được ở vai admin) không đổi so với
vòng 2, vẫn xanh.

Mười sáu eval máy còn lại (E1–E11, E13, E15–E17) đo lại XANH, đọc mã bài kiểm
xác nhận đúng khẳng định mà `expected` đòi — không chỉ nhìn mã thoát. E9 vẫn
đi qua nhánh BỎ QUA CÓ TÊN cho ba chặng đăng nhập Google thật (kho vẫn để
trống `GOOGLE_CLIENT_ID`), in ra rõ ràng chứ không lặng lẽ tính đạt — xem mục
Evidence của E9. **E14** (câu chữ màn hình, hạng T3) vẫn đúng luật: máy không
tự chấm, chờ người quyết trực tiếp.

Một sự cố hạ tầng lặp lại y hệt vòng 2 (không phải phát hiện mới, xem mục
Known limits): máy chủ `api-cay-nay` khởi động lần đầu bằng `launch.json` chỉ
khai `PORT`, không khai `APP_URL`, nên liên kết đặt mật khẩu đầu tiên hiện
host `:3000` và `resetPassword` bị `trustedOrigins` từ chối ("Invalid
origin") khi nộp từ `:3300`. Đã khởi động lại thủ công với
`APP_URL=http://localhost:3300` trước khi chụp bất kỳ khung hình nào dùng để
kết luận; không khung hình nào trong báo cáo này dựng trên lần chạy bị lỗi
origin đó.

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
| E12 | AC-6/AC-11 | ui-check | PASS |
| E13 | AC-9 | ui-check | PASS |
| E14 | AC-12 | judgment | PENDING-HUMAN |
| E15 | AC-3/AC-9/AC-6 | test (design-gate static) | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-8 | ui-check | PASS |

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verified_at: 2026-09-19T10:33:20Z
  output: |
    api:test:  459 pass / 0 fail
    app:test:  298 pass / 0 fail (Ran 298 tests across 31 files)
    agent:test:  427 pass / 0 fail
    @crm/auth:test:  102 pass / 0 fail
    @crm/ui:test:  114 pass, @crm/db:test: 128 pass, @crm/telemetry:test: 61 pass,
    @crm/env:test: 17 pass, @crm/validation:test: 17 pass
    Tasks: 11 successful, 11 total

- cmd: bunx turbo run lint --force
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verified_at: 2026-09-19T10:38:40Z
  output: |
    Chỉ warning (noUnusedVariables trong mat-khau-lien-ket.spec.ts, noDocumentCookie,
    noBarrelFile x2 ở app, vài warning có sẵn ở @crm/auth/@crm/ui/@crm/db) — không
    có error nào.
    Tasks: 9 successful, 9 total

- cmd: bun run lint:slop
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verified_at: 2026-09-19T10:38:55Z
  output: |
    Found 0 warnings and 0 errors. 1062 files.

- cmd: bunx turbo run build --force
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verified_at: 2026-09-19T10:39:15Z
  output: |
    Tasks: 4 successful, 4 total. Build agent + app + auth + ui xong sạch.

## Evidence

- eval: E1
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_phat_chia
  verified_at: 2026-09-19T10:34:10Z
  output: |
    1 pass, 6 filtered out, 0 fail, 11 expect() calls
  observed: |
    describe("phat-chia"): chiều dương khẳng định url+expiresAt trả về, đọc
    LẠI từ DB đúng một hàng verification trỏ đúng id người nhận, hạn trong
    tương lai và ≤ TTL. Chiều âm cùng fixture: id người phát không tồn tại →
    reject, đếm hàng verification (theo người và theo lượt) không đổi
    trước/sau, khẳng định ghim tên bảng + số hàng mong đợi trong thông điệp
    (dòng "bang verification phai co dung...").

- eval: E2
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_tao_nguoi_truoc
  verified_at: 2026-09-19T10:35:00Z
  output: |
    2 pass, 4 filtered out, 0 fail, 8 expect() calls
  observed: |
    Cả hai chiều có mặt: tạo-trước-rồi-phát cho địa chỉ chưa từng có user
    (đếm 0→1, hàng verification trỏ đúng id mới sinh, url trả về), và từ
    chối địa chỉ ngoài danh sách với thông điệp cố định, đếm user và đếm
    verification đều không đổi. Đọc mã service xác nhận cổng chặn là một
    khối `if` gọi `decideSignInFromDb` riêng trên đường tạo-người, đúng ghi
    chú "SUA SAU VONG SOI CUOI" của eval.

- eval: E3
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_vong_tron
  verified_at: 2026-09-19T10:37:00Z
  output: |
    2 pass, 18 filtered out, 0 fail, 15 expect() calls
  observed: |
    Đủ 4 chặng đúc/tiêu thụ/đọc lại DB/đăng nhập trong một lượt, không nạp
    lại module. Bài kiểm thứ hai khẳng định hàng phiên cũ bị XOÁ thật (đếm
    session=0), đúng khai báo "SUA SAU VONG SOI CUOI" phân biệt "hàng bị
    xoá" với "phiên hết dùng được" (giới hạn cache 5 phút vẫn ở Known
    limits, ngoài phạm vi eval này).

- eval: E4
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_dung_lan_hai
  verified_at: 2026-09-19T10:37:20Z
  output: |
    1 pass, 19 filtered out, 0 fail, 4 expect() calls
  observed: |
    Lần dùng thứ hai của cùng một chia bị từ chối, VÀ khẳng định kép hai
    chiều đăng nhập: mật khẩu lần một vẫn vào được, mật khẩu lần hai không.

- eval: E5
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_het_han
  verified_at: 2026-09-19T10:37:27Z
  output: |
    1 pass, 19 filtered out, 0 fail, 5 expect() calls
  observed: |
    Fixture đúc+tiêu thụ một chia đầu để có mật khẩu cũ thật, đúc chia thứ
    hai cho CHÍNH người đó rồi ép hạn về quá khứ qua DB. Khẳng định kép có
    mặt: đăng nhập bằng mật khẩu cũ vẫn được, bằng mật khẩu mới vừa thử thì
    không. Chiều dương (hạn còn tương lai → đặt được) trên fixture khác cùng
    bài kiểm.

- eval: E6
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_quyen_hai_ve
  verified_at: 2026-09-19T10:35:54Z
  output: |
    1 pass, 5 filtered out, 0 fail, 6 expect() calls
  observed: |
    member bị từ chối và đếm không đổi; admin/owner được chấp nhận; vị từ
    tiêm HAI chiều quyết định kết quả (tiêm luôn-false → owner cũng bị từ
    chối, tiêm luôn-true → member được chấp nhận) — chứng minh service GỌI
    THẬT vị từ từ `@crm/auth`, không tự viết lại điều kiện vai trò.

- eval: E7
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_chan_tu_dang_ky
  verified_at: 2026-09-19T10:37:41Z
  output: |
    2 pass, 18 filtered out, 0 fail, 7 expect() calls
  observed: |
    Tự đăng ký bị chặn cho cả địa chỉ TRONG danh sách được vào lẫn NGOÀI
    danh sách. Trên CHÍNH địa chỉ trong-danh-sách vừa bị chặn, một quản trị
    đúc chia thật (`ducChia`), người nhận đặt mật khẩu qua chia đó thành
    công, đăng nhập bằng mật khẩu mới thành công — đúng "chặn tự đăng ký,
    không chặn cửa mật khẩu".

- eval: E8
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_mat_khau_yeu
  verified_at: 2026-09-19T10:37:41Z
  output: |
    8 pass, 12 filtered out, 0 fail, 26 expect() calls
    [auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: fetch failed
    [auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: danh sach mat khau da lo tra ve 503
  observed: |
    Ba dòng thông điệp phân biệt được (quá ngắn / đã lộ / chấp nhận). Chia
    sống sót sau khi bị từ chối (đã lộ hoặc quá ngắn) và đặt lại được trên
    CHÍNH chia đó. Fail-open xác nhận thật cho cả hai ca (network không với
    tới, và danh sách trả về không-2xx) — hai dòng log trên là do CHÍNH hai
    bài kiểm đó cố ý giả lập lỗi mạng, không phải named-skip. Lượt này môi
    trường VỚI TỚI ĐƯỢC danh sách mật khẩu đã lộ thật (bài kiểm "da lo" chạy
    hết 8/8 pass mà không cần rơi vào nhánh bo-qua-co-ten của chính nó).

- eval: E9
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_cua_google_con_song
  verified_at: 2026-09-19T10:37:53Z
  output: |
    5 pass, 15 filtered out, 0 fail, 5 expect() calls
  observed: |
    GOOGLE_CLIENT_ID vẫn rỗng trong .env của kho (đã tự grep xác nhận, không
    suy đoán). Khẳng định hình dạng cấu hình chạy VÔ ĐIỀU KIỆN và xanh thật:
    (1) nhà cung cấp google khai clientId khi có khoá trong môi trường — ca
    này TỰ nó cũng đi nhánh bo-qua-co-ten vì không có khoá, đúng vì "không
    có khoá thì không có gì để khẳng định nhà cung cấp khai" (không phải lỗi
    của eval); (2) accountLinking.updateUserInfoOnLink=true — chạy vô điều
    kiện, không nhánh, PASS thật. Ba chặng đi đường Google thật (đăng nhập
    thật, chặn người ngoài danh sách, gộp hai cửa cùng địa chỉ thành một
    hàng) đi qua nhánh BỎ QUA CÓ TÊN (`BO_QUA_GOOGLE = "bo-qua-co-ten: khong
    co GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET trong moi truong bai kiem"`),
    KHÔNG được tính là đã đo phần thật của "cửa Google vẫn sống song song".
    Vế người-nhìn-thấy của AC-9 nằm ở E13 (PASS vòng này).

- eval: E10
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_trang_ngoai_cong
  verified_at: 2026-09-19T10:39:40Z
  output: |
    6 pass, 0 fail, 13 expect() calls across 2 files
  observed: |
    Cả hai danh sách khẳng định bằng SET (không phải có-mặt): `UNGATED`
    (apps/app/proxy.ts, đọc trực tiếp qua import, không nạp lại) đúng 4 phần
    tử /grant-access, /eve, NO_WORKSPACE_PATH, SET_PASSWORD_PATH — khớp
    danh sách ghim trong bài kiểm, in tên phần tử lệch khi có. `ANONYMOUS`
    (apps/app/lib/proxy-paths.ts) đúng 3 phần tử /t, /proto, /dat-mat-khau —
    xác nhận bằng đọc mã nguồn. Đường dat-mat-khau có TOKEN thật đi qua được
    (không chỉ thử đường gốc), một đường ứng dụng bất kỳ vẫn đòi đăng nhập.

- eval: E11
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_ghi_vet
  verified_at: 2026-09-19T10:36:01Z
  output: |
    1 pass, 5 filtered out, 0 fail, 3 expect() calls
  observed: |
    Hai quản trị phát cho hai người nhận khác nhau, đọc lại qua
    service.allowances() (đúng truy vấn màn Thành viên gọi, không đọc thẳng
    bảng Prisma cho vừa khuôn) — ai/khi nào đều đúng và không đè lên nhau,
    mốc thời gian đọc lại được và ≥ mốc bắt đầu lượt chạy.

- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_nut_phat_chia
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, cookie phiên thật qua `bun run dev:session`, tree xác minh bằng đối chứng .svg qua APP_URL trước khi chụp, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:57:00Z
  screenshot: evidence/E12-thanhvien-member.png
  observed: |
    Vai member (marcus@trycomp.ai): tất cả 8 nút "Phát liên kết" trong bảng
    Thành viên ở trạng thái tắt (DOM: disabled=true), title="Cần quyền quản
    trị mới phát được" — có lý do đọc được, không biến mất câm. Không có
    dòng ghi vết nào hiện dưới tên (đúng luật vet-chi-quan-tri: chỉ quản trị
    đọc được ai/khi nào). Khớp expected.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_nut_phat_chia
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:57:10Z
  screenshot: evidence/E12-thanhvien-admin.png
  observed: |
    Vai admin (e12-admin-1789807964659): mọi nút "Phát liên kết" bấm được
    (disabled=false qua DOM), có thêm nút "..." đổi vai trò ở mỗi hàng. Chụp
    lại ở viewport 1280×1400 để né lỗi bố cục mô tả dưới đây (bảng
    "Thành viên" hiện đủ 3 hàng đầu Ada/Marcus/Priya, có thanh cuộn nội bộ
    cho phần còn lại) — cùng một khẳng định DOM disabled=false vẫn đúng.
    Khớp expected.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_nut_phat_chia
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, viewport 1280×1400 — 900 tái hiện đúng lỗi xếp-chồng-bảng đã biết ở mục Ngoài hợp đồng, che mất hàng cần chụp; 1400 tránh lỗi đó mà không đổi khẳng định đang đo)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:58:30Z
  screenshot: evidence/E12-ghivet.png
  observed: |
    FIXED SO VỚI VÒNG 2. Phát THẬT một liên kết cho zzm5c39f436 bằng chính
    admin có tên DÀI nhất kho (e12-admin-1789807964659, 23 ký tự — cùng danh
    tính đã tái hiện lỗi cắt chữ ở vòng 2), đóng hộp thoại, tải lại màn
    Thành viên, cuộn hàng zzm5c39f436 vào khung nhìn: dòng ghi vết đọc được
    TRỌN VẸN "e12-admin-1789807964659 đã phát liên kết · 8 phút trước" — cả
    AI lẫn LÚC NÀO. Xác nhận bằng hình học thật (không chỉ đoán từ ảnh):
    `span.getBoundingClientRect()` cho span.text-muted-foreground.text-xs
    (đúng phần tử VetLine render, không phải span bọc ngoài) có
    bottom=788/right=540 nằm gọn trong ô `<td>` có bottom=800/right=552 ở
    viewport 900; `getComputedStyle(span).whiteSpace === "normal"` (không
    còn nowrap). Đo lại lần hai ở viewport 1400 (bố cục sạch, không xếp
    chồng): cùng hàng zzm5c39f436 vẫn "clipped: false". Vá của vòng 2
    (`cellClassName: "whitespace-normal align-top"` trên cột Tên,
    `members-table.tsx`) đã đủ.
  network_observed: n-a (driver)

- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dang_nhap_cung_man
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, khung hình 1 chụp trong một browser context ẩn danh RIÊNG để tránh cookie phiên admin/member rò từ các bước trước trong cùng lượt, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:53:30Z
  screenshot: evidence/E13-dangnhap.png
  observed: |
    Không đổi so với vòng 2. Màn /sign-in chưa đăng nhập, đúng kịch bản .env
    hiện có của kho (GOOGLE_CLIENT_ID="", không Microsoft, không SSO): ô
    "Địa chỉ email" và ô "Mật khẩu" hiện ra ngay trên cùng màn, có nút "Đăng
    nhập" — không màn chết, không nút "cách khác" phải bấm trước mới thấy.
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dang_nhap_cung_man
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, liên kết còn hạn thật, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:53:35Z
  screenshot: evidence/E13-datmatkhau.png
  observed: |
    Không đổi so với vòng 2. Liên kết còn hạn: hai ô mật khẩu, mức tối thiểu
    nói TRƯỚC khi gõ ("Ít nhất 12 ký tự. Không cần chữ hoa hay ký tự đặc
    biệt."), nút "Đặt mật khẩu".
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dang_nhap_cung_man
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome; liên kết hết hạn dựng RIÊNG cho priya@trycomp.ai — một người KHÁC với người nhận liên kết còn hạn — rồi ép hạn về quá khứ thẳng trong DB qua cột `verification.expiresAt`, tránh ca "phát lại xoá hàng cũ" của AC-13 làm hàng verification biến mất trước khi kịp ép hạn)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:54:10Z
  screenshot: evidence/E13-datmatkhau-hethan.png
  observed: |
    "Liên kết này hết hạn rồi. Nhắn người quản trị phát cho bạn một liên kết
    mới." — câu rõ ràng, nói đúng lý do (hết hạn) và việc cần làm tiếp. Đây
    là màn server-side kiểm hạn TRƯỚC khi render form (page.tsx đọc thẳng
    bảng verification), không phải lỗi client sau khi gửi form. Khớp
    expected ("cau noi RO la het han").
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dang_nhap_cung_man
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, vai admin, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:49:20Z
  screenshot: evidence/E13-hopthoai.png
  observed: |
    Hộp thoại "Liên kết đặt mật khẩu": "Gửi cho zzm5c39f436. Liên kết dùng
    được một lần, hết hạn sau một giờ.", ô Liên kết hiện ĐẦY ĐỦ URL (chọn
    sẵn, token thật), nút "Chép liên kết", nút "Đóng", hạn dùng nói bằng
    chữ ("hết hạn sau một giờ"), không phải dấu thời gian máy. Không đổi so
    với vòng 2.
  network_observed: n-a (driver)

- eval: E14
  judged_by: pending human (T3, phán quyết trực tiếp bắt buộc — không được
    máy chấm)
  verdict: UNCERTAIN
  rationale: Hạng T3 đòi phán quyết trực tiếp của người theo đúng chỉ dẫn
    nhiệm vụ ("KHÔNG tự chấm"). Không đổi so với vòng 1/2. Nội dung nguồn:
    apps/app/lib/messages/auth.ts và
    apps/app/lib/messages/settings-thanh-vien.ts — câu chữ tiếng Việt tự
    nhiên trong các câu đã render, không thấy từ ghép kỹ thuật tự đúc ("Mật
    khẩu phải có ít nhất N ký tự.", "Mật khẩu này đã từng bị lộ trong một vụ
    rò dữ liệu. Chọn mật khẩu khác.", "Liên kết này hết hạn rồi...", "Liên
    kết đặt mật khẩu") — đây là quan sát hỗ trợ, không phải phán quyết thay
    người.
  required_evidence:
    - Người đọc trực tiếp evidence/E13-hopthoai.png và evidence/E13-datmatkhau*.png
      (chụp lại tươi ở vòng này) rồi trả lời câu hỏi nguyên văn của E14: người
      dùng lần đầu có biết làm gì tiếp ở mỗi màn không; ba câu lỗi của trang đặt
      mật khẩu có phân biệt được không; có từ ghép kỹ thuật tự đúc nào không.
  human_override: Đạt — Phan Le Manh 2026-09-19

- eval: E15
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_san_thiet_ke
  verified_at: 2026-09-19T10:40:09Z
  output: |
    Ba tệp đều verdict PASS, p0_count 0, blocking [], findings [].
  observed: |
    apps/app/app/(landing)/dat-mat-khau/[token]/page.tsx,
    apps/app/app/(landing)/sign-in/password-sign-in.tsx, và
    apps/app/app/(app)/[slug]/settings/members/phat-chia-dialog.tsx đều sạch
    P0 (độ tương phản, mục tiêu chạm, ô nhập không nhãn, trạng thái focus
    thiếu).

- eval: E16
  run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.mk_phat_lai
  verified_at: 2026-09-19T10:39:32Z
  output: |
    1 pass, 19 filtered out, 0 fail, 6 expect() calls
  observed: |
    Đủ cả bốn khẳng định trên MỘT người: phát chia 1, đặt mật khẩu M1 →
    thành công; phát chia 2 cho CHÍNH người đó; đặt mật khẩu M2 bằng chia 2
    → thành công. Rồi: đăng nhập bằng M2 vào được; bằng M1 không vào được;
    dùng lại chia 1 vẫn bị từ chối; đếm hàng verification treo của người đó
    sau khi xong = 0 (khẳng định ghim tên, chặn ca "quên dọn hàng cũ").

- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dat_mat_khau_loi
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, set value qua input value-setter thật + dispatch input event — không gõ ký tự rời để tránh race của React controlled input, viewport 1280×900)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:53:55Z
  screenshot: evidence/E17-mk-ngan.png
  observed: |
    Không đổi so với vòng 2. Cùng MỘT mật khẩu ngắn hơn mức tối thiểu gõ vào
    CẢ HAI ô, gửi: lỗi "Mật khẩu phải có ít nhất 12 ký tự." hiện CẠNH ô "Mật
    khẩu mới" (kiểm client-side, đúng vì hai ô giống nhau nên chiều dài thua
    trước chiều lệch-nhau). Ô "Gõ lại mật khẩu" vẫn còn nguyên giá trị đã
    gõ, không bị xoá sạch.
  network_observed: n-a (driver)
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dat_mat_khau_loi
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, vẫn trên CHÍNH liên kết của khung hình trước)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:54:05Z
  screenshot: evidence/E17-mk-dalo.png
  observed: |
    Môi trường này VỚI TỚI ĐƯỢC mạng ngoài, phép sàng mật khẩu đã lộ chạy
    THẬT (không named-skip): "123456789012" trả lỗi thật "Mật khẩu này đã
    từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác." — PHÂN BIỆT rõ
    với câu ở khung 1, cùng vị trí cạnh ô "Mật khẩu mới". Ô xác nhận vẫn
    nguyên giá trị. Liên kết KHÔNG bị tiêu thụ (bài kiểm E8 nguồn xác nhận
    một chia sống sót qua nhiều lần bị từ chối; ở đây quan sát trực tiếp
    trên UI thật bằng việc khung hình kế tiếp vẫn dùng được đúng liên kết
    này).
  network_observed: clean
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r4
  frame_run_id: vao-bang-email-va-mat-khau-20260919-r3
  exit_code: 0
  verifier: config:executors.test.mk_dat_mat_khau_loi
  frame_method: manual ui-check (puppeteer-core headless + Google Chrome, vẫn trên CHÍNH liên kết đã bị từ chối hai lần ở trên)
  verified_at: 2026-09-19T12:56:26Z
  frame_at: 2026-09-19T10:54:15Z
  screenshot: evidence/E17-sua-duoc.png
  observed: |
    Ô MA TRẬN THÊM SAU VÒNG SOI CUỐI (19/09), lần đầu có bằng chứng UI cho
    ô này. Vẫn trên CHÍNH liên kết vừa bị từ chối hai lần (ngắn, rồi đã lộ),
    gõ mật khẩu sạch và gửi: "Xong — Mật khẩu đã đặt. Từ giờ bạn vào CRM
    được bằng địa chỉ email và mật khẩu này, kể cả khi mạng không vào được
    Google." — phục hồi thành công trên CHÍNH liên kết, không cần xin liên
    kết mới. Hai lần bị từ chối trước đó không đốt mất liên kết.
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
- Máy chủ `api-cay-nay` khởi động lần đầu bằng `launch.json` KHÔNG có
  `APP_URL`/`API_URL` riêng (launch.json chỉ khai `PORT`), nên các liên kết
  đặt mật khẩu đầu tiên hiển thị với host `:3000` và bị `trustedOrigins` từ
  chối khi nộp form từ `:3300` ("Invalid origin"). Đã tái hiện Y HỆT ở vòng
  2 và lại xảy ra ở vòng này — khởi động lại thủ công với
  `APP_URL=http://localhost:3300` (và giữ `API_URL=http://localhost:3301`)
  trước khi chụp bất kỳ khung hình nào dùng để kết luận. Đây là lỗi cấu hình
  của chính phiên đo (launch.json), không phải hành vi sản phẩm; không sửa
  `launch.json` (nằm ngoài `diffFiles`, không phải mã sản phẩm). Ghi lại lần
  thứ hai để vòng đo sau cân nhắc sửa `launch.json` khai sẵn cả hai biến cho
  `api-cay-nay`, tránh phải khởi động lại giữa chừng mỗi lần.

## Ngoài hợp đồng

Xem `review-findings.md` — cả hai mục cũ vẫn giữ nguyên, không có mục mới ở
vòng này:
- Mục vòng 1 (chưa sửa): va chạm id trong `apps/api/scripts/dev-session.ts`
  khi hai email trùng 10 ký tự đầu.
- Mục vòng 2 (chưa sửa, RIÊNG với lỗi E12 đã vá): trang
  `/[slug]/settings/members` xếp chồng hai bảng ("Thành viên" và "Được phép
  vào") ở một số chiều cao khung nhìn phổ biến (1280×700 đến 1280×1000; ổn
  định trở lại từ ~1280×1400). Vòng này TÁI XÁC NHẬN lỗi này vẫn còn: khi
  chụp `E12-ghivet.png` lần đầu ở viewport mặc định 1280×900, tiêu đề "Được
  phép vào" + thanh công cụ của nó đè lên đúng vị trí các hàng của bảng
  "Thành viên", che mất hàng cần chụp — phải chuyển sang viewport 1280×1400
  để có khung hình sạch (xem cách dựng của evidence E12 khung 3 ở trên). Đây
  KHÔNG phải hồi quy mới của vòng 3, không nằm trong phạm vi eval nào của
  hợp đồng này — chỉ xác nhận lại nó vẫn sống, không mô tả lại chi tiết
  (xem review-findings.md để biết chi tiết đầy đủ từ vòng 2).

## Analyst

Không chạy đối chứng `diffBase` trong lượt này (không được yêu cầu rõ trong
nhiệm vụ giao cho phiên đo này). Không khẳng định gì về non-discriminating ở
đây; để trống thận trọng thay vì đoán. Trường `baseline: n-a` trên các khối
Evidence phía trên phản ánh đúng điều này.

## Variance

none — không có eval nào khai `runs > 1` trong tập 17 eval của vòng này.

## Iterations

Round 1: E1, E5, E7, E13 trượt — E1 do eval tham chiếu bài kiểm không tồn
tại; E5, E7 do bài kiểm thiếu khẳng định mà chính eval đòi dù lệnh xanh; E13
do lỗi sản phẩm thật (màn đăng nhập không hiện mật khẩu khi Google chưa cấu
hình). Trả REJECT.

Round 2: cả bốn lỗi của vòng 1 đo lại XANH, đọc mã bài kiểm xác nhận đủ
khẳng định `expected` đòi, không chỉ nhìn mã thoát. Nhưng soi kỹ hơn ở E12
(khung hình ghi vết) phát hiện một lỗi hiển thị thật trên chính mã mới của
vòng đó (`vet-line.tsx` bị cắt chữ ở cột Tên do `white-space: nowrap` trong
một `<td>` `overflow: hidden`) khiến phần "phát lúc nào" không đọc được trên
màn hình thật ở bề rộng chụp chuẩn 1280px. Trả REJECT, đích danh E12.

Round 3 (lượt này): bản vá một dòng của E12
(`cellClassName: "whitespace-normal align-top"` trên cột Tên,
`members-table.tsx`, commit `8a480042`) đo lại XANH — dựng lại đúng kịch bản
tái hiện lỗi vòng 2 (cùng admin tên dài nhất kho), xác nhận bằng hình học
thật (`getBoundingClientRect`/`getComputedStyle`) chứ không chỉ nhìn ảnh, ở
cả hai chiều cao khung nhìn. Mười sáu eval máy còn lại đo lại XANH không
đổi. E14 (T3, câu chữ) vẫn đúng luật chờ người — không máy nào tự chấm được
thay. Không có eval nào trượt ở vòng này. Verdict: **PENDING-JUDGMENT** — chờ
người trực tiếp đọc `evidence/E13-hopthoai.png` +
`evidence/E13-datmatkhau*.png` và điền `human_override` cho E14 tại Cổng
Bằng chứng; sau đó mới nâng lên PASS.

### Re-pin lần 1 — 2026-09-19, do hoa cu do commit 670c8859 them ba chan do that cho E12/E13/E17
run_id: repin-20260919T130705Z-28331
sha: 670c8859fdf38306fcd869913d4c5980dbbea855 · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-09-19, do ghim lai sau khi go phu thuoc thu tu nap o hai bai kiem man dang nhap
run_id: repin-20260919T140317Z-98890
sha: 2d2ca16ae5ec5935ef0231268c85ccdc2e5ebc8a · suites: 4 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · diff chạm vật đo ngoài làn máy: E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12

### Re-pin lần 4 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · diff chạm vật đo ngoài làn máy: E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-12

### Re-pin lần 5 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T161003Z-91842
sha: 0d03129ecfa5bdbcff83dee9706a511e342f399c · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E14 · AC không có chốt máy: AC-12
