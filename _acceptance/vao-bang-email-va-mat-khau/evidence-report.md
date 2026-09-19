---
schema_version: 2
feature_slug: vao-bang-email-va-mat-khau
verdict: REJECT
failed_evals: [E1, E5, E7, E13]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ff84234ee8ac73bc5c6c3bd10b501ab4e85f206e
human_signoff:
---

# Evidence Report: vao-bang-email-va-mat-khau

run_id cho lượt này: `vao-bang-email-va-mat-khau-20260919-r1` (mọi dòng trong
`run-log.jsonl` dùng chung mã này).

Cây sạch, HEAD khớp `ff84234ee8ac73bc5c6c3bd10b501ab4e85f206e`, nhánh
`chore/o-vao-bang-mat-khau`. Hai máy chủ dev đang chạy sẵn của chính cây này
được dùng nguyên trạng: `apps/app` cổng 3000 (PID 60820, cwd
`/Users/manh-macmini/dev/crm/apps/app`), `apps/api` cổng 3001 (PID 46312, cwd
`/Users/manh-macmini/dev/crm/apps/api`) — đã xác minh cwd trước khi dùng, đúng
cảnh báo trong `CLAUDE.md` về đo nhầm cây khác.

## Tóm tắt — vì sao REJECT

Bốn eval trượt, hai lớp lỗi khác nhau:

1. **E1** — eval tham chiếu một bài kiểm không tồn tại (`-t phat-chia` khớp 0
   test). Không phải lỗi sản phẩm; là lỗ hổng phía sinh eval — AC-1 hiện không
   có phép đo máy nào phủ nó.
2. **E5, E7** — lệnh xanh nhưng bài kiểm thiếu đúng khẳng định mà `expected`
   của chính eval đó đòi (xem run-log và mục Evidence bên dưới cho từng ca).
3. **E13** — bằng chứng nhìn thấy thật: màn `/sign-in` không hề hiện ô
   email/mật khẩu khi Google/Microsoft/SSO đều chưa cấu hình — đúng kịch bản
   `.env` hiện có của kho (`GOOGLE_CLIENT_ID=""`) và đúng kịch bản mục tiêu của
   toàn bộ tính năng này. Đây là lỗi sản phẩm thật, nghiêm trọng nhất vòng này.

## Bảng eval

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | FAIL |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | FAIL |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (named-skip trong) |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-6/AC-11 | ui-check | PASS |
| E13 | AC-9 | ui-check | FAIL |
| E14 | AC-12 | judgment | PENDING-HUMAN |
| E15 | AC-3/AC-9/AC-6 | test (design-gate static) | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-8 | ui-check | PASS |

## Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verified_at: 2026-09-19T08:41:00Z
  output: |
    api:test:  458 pass / 0 fail
    app:test:  298 pass / 0 fail
    agent:test:  427 pass / 0 fail
    @crm/auth:test:  102 pass / 0 fail
    Tasks: 11 successful, 11 total — tổng 1645 pass / 0 fail

- cmd: bunx turbo run lint --force
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verified_at: 2026-09-19T08:41:40Z
  output: |
    Found 3/1/2/5/1/3/4 warnings rải trên các gói — không có error.
    Tasks: 9 successful, 9 total

- cmd: bun run lint:slop
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verified_at: 2026-09-19T08:41:41Z
  output: |
    Found 0 warnings and 0 errors. Finished in 768ms on 1061 files.

- cmd: bunx turbo run build --force
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verified_at: 2026-09-19T08:42:02Z
  output: |
    Tasks: 4 successful, 4 total. Build agent + app + auth + ui xong sạch.

## Evidence

- eval: E1
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 1
  verifier: config:executors.test.mk_phat_chia
  verified_at: 2026-09-19T08:42:30Z
  output: |
    error: regex "phat-chia" matched 0 tests. Searched 1 file (skipping 6 tests)
    error: script "test" exited with code 1
  observed: |
    Grep xác nhận chuỗi "phat-chia" (có gạch nối) không xuất hiện ở đâu trong
    apps/api/test/mat-khau-lien-ket.spec.ts. Năm describe có trong file:
    quyen-hai-ve, tao-nguoi-truoc, thanh-vien-khong-co-loi-moi, ghi-vet,
    vet-chi-quan-tri — không có phat-chia. Đây là lệnh thật, thoát mã thật (1),
    không phải bị công cụ giết.

- eval: E2
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_tao_nguoi_truoc
  verified_at: 2026-09-19T08:45:33Z
  output: |
    2 pass, 4 filtered out, 0 fail, 8 expect() calls
  observed: |
    Đọc mã: test "dia chi trong danh sach..." khẳng định đủ 4 điều (đếm trước=0,
    sau=1, hàng verification trỏ đúng id người mới, url trả về đúng dạng); test
    "dia chi NGOAI danh sach..." khẳng định bị từ chối + đếm người=0 + đếm
    verification-của-lượt không đổi. Đủ cả hai chiều theo đúng expected.

- eval: E3
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_vong_tron
  verified_at: 2026-09-19T08:45:47Z
  output: |
    2 pass, 18 filtered out, 0 fail, 15 expect() calls
  observed: |
    Test "duc, tieu thu, mat khau luu that, dang nhap duoc" đi đủ 4 chặng: url
    đúng dạng + hạn còn trong TTL, hàng verification tồn tại và value=userId,
    tài khoản credential có password thật, đăng nhập thật thành công và trả
    đúng userId. Test thứ hai khẳng định hàng phiên mở TRƯỚC khi đặt lại mật
    khẩu không còn trong DB sau đó (đếm = 0) — đúng "hàng bị xóa", đúng giới
    hạn đã khai (cache 5 phút nằm ngoài phạm vi assertion này, đã ghi ở Known
    limits).

- eval: E4
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_dung_lan_hai
  verified_at: 2026-09-19T08:45:52Z
  output: |
    1 pass, 19 filtered out, 0 fail, 4 expect() calls
  observed: |
    Lần một đặt được, lần hai (cùng chia) bị từ chối; rồi đăng nhập bằng mật
    khẩu lần một vẫn vào được, bằng mật khẩu lần hai thì không — đúng khẳng
    định kép mà expected đòi, không dừng ở "lần hai bị từ chối".

- eval: E5
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_het_han
  verified_at: 2026-09-19T08:45:59Z
  output: |
    1 pass, 19 filtered out, 0 fail, 3 expect() calls
  observed: |
    Nhánh "con han" đặt được. Nhánh "qua han": đẩy expiresAt về quá khứ rồi thử
    đặt -> bị từ chối, và khẳng định login bằng mật khẩu vừa thử thất bại. NHƯNG
    fixture "qua" là người MỚI (gieoNguoiVaChia() lần đầu) — chưa từng có mật
    khẩu nào trước đó, nên "mật khẩu cũ vẫn dùng được" mà expected đòi ("Khang
    dinh kep nhu E4") không có gì để kiểm và không được kiểm. Thiếu đúng nửa
    khẳng định expected đòi -> FAIL theo luật "thiếu khẳng định thì không đạt,
    dù lệnh xanh".

- eval: E6
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_quyen_hai_ve
  verified_at: 2026-09-19T08:46:09Z
  output: |
    1 pass, 5 filtered out, 0 fail, 6 expect() calls
  observed: |
    Vế một: member bị từ chối (đếm hàng verification không đổi), admin/owner
    đều thành công. Vế hai: vị từ được TIÊM làm tham số — tiêm ()=>false thì
    owner cũng bị từ chối, tiêm ()=>true thì member được chấp nhận. Cả hai
    chiều cùng xanh chỉ khi kết quả thật sự chạy qua vị từ — đúng cách kiểm duy
    nhất mà expected đòi, không phải chuỗi-có-mặt.

- eval: E7
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_chan_tu_dang_ky
  verified_at: 2026-09-19T08:46:33Z
  output: |
    2 pass, 18 filtered out, 0 fail, 5 expect() calls
  observed: |
    Cả hai test (địa chỉ trong danh sách, địa chỉ ngoài danh sách) đều khẳng
    định signUpEmail ném lỗi và đếm người dùng vẫn = 0. Nhưng "CHIEU DUONG doi
    trong tren cung fixture" mà expected đòi — dùng CHÍNH địa chỉ vừa bị chặn
    tự đăng ký để phát/tiêu thụ một chia thật và xác nhận đặt mật khẩu vẫn
    thành công — hoàn toàn không có trong describe("chan-tu-dang-ky"). Không
    có gì phân biệt "ta chặn tự đăng ký" với "ta chặn luôn cả mật khẩu cho địa
    chỉ đó" trong bài kiểm này. Thiếu khẳng định đòi -> FAIL.

- eval: E8
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_mat_khau_yeu
  verified_at: 2026-09-19T08:46:34Z
  output: |
    8 pass, 12 filtered out, 0 fail, 26 expect() calls
    [auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: fetch failed
    [auth] khong voi toi duoc danh sach mat khau da lo, cho mat khau di qua: danh sach mat khau da lo tra ve 503
  observed: |
    Ba dòng đủ: quá ngắn (thông điệp CAU_MAT_KHAU.quaNgan), đã lộ (thông điệp
    CAU_MAT_KHAU.daLo, PHÂN BIỆT được với thông điệp trên qua nội dung), sạch
    thì được nhận. Nhánh named-skip khi dịch vụ đã-lộ không với tới mạng được
    triển khai đúng dạng "bo-qua-co-ten" bằng khẳng định mảng-bằng-mảng, không
    lặng lẽ tính là đạt.

- eval: E9
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_cua_google_con_song
  verified_at: 2026-09-19T08:46:35Z
  output: |
    5 pass, 15 filtered out, 0 fail, 5 expect() calls
  observed: |
    GOOGLE_CLIENT_ID rỗng trong .env của kho -> isGoogleConfigured() = false.
    Bốn trong năm test đi qua nhánh BỎ QUA CÓ TÊN (khẳng định
    [BO_QUA_GOOGLE, false] == [BO_QUA_GOOGLE, false], named và không lặng lẽ).
    Một test ("cau hinh cap nhat thong tin nguoi khi noi tai khoan") chạy VÔ
    ĐIỀU KIỆN và khẳng định account.accountLinking.updateUserInfoOnLink=true.
    BÁO CÁO RÕ: ba chặng đi đường Google thật (đăng nhập thật, chặn người
    ngoài danh sách, gộp hai cửa thành một hàng người dùng) KHÔNG chạy được
    trong môi trường này — BỎ QUA CÓ TÊN, không tính là đạt phần đó. Phần vỏ
    cấu hình (backend) thì xanh thật. Vế NGƯỜI NHÌN THẤY của AC-9 nằm ở E13,
    và E13 đang FAIL — nên AC-9 tổng thể KHÔNG coi là đạt dù E9 xanh.

- eval: E10
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_trang_ngoai_cong
  verified_at: 2026-09-19T08:49:00Z
  output: |
    6 pass, 0 fail, 13 expect() calls across 2 files
  observed: |
    proxy-duong-mo.spec.ts khẳng định SET UNGATED (rút từ proxy.ts) bằng đúng 4
    phần tử đã ghim, in tên phần tử thừa/thiếu khi lệch (mảng {thua, thieu}).
    proxy-an-danh.spec.ts khẳng định ANONYMOUS đúng 3 phần tử (mảng đã sort,
    so bằng toEqual — diff tên phần tử vẫn hiện khi lệch dù không tự tay in),
    đường /dat-mat-khau với TOKEN THẬT trong path đi qua, và các đường khác của
    ứng dụng (/settings, /contacts, /deals, /) không được coi là ẩn danh.

- eval: E11
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_ghi_vet
  verified_at: 2026-09-19T08:49:12Z
  output: |
    1 pass, 5 filtered out, 0 fail, 3 expect() calls
  observed: |
    Phát hai lần cho hai người nhận khác nhau, đọc lại qua service.allowances()
    (đúng truy vấn mà màn Thành viên gọi, không đọc thẳng Prisma), khẳng định
    tên người phát của mỗi hàng đúng người, không đè lên nhau, và mốc thời gian
    >= lúc bắt đầu lượt chạy.

- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (dev:session + puppeteer-core headless, cookie phiên thật)
  verified_at: 2026-09-19T09:00:00Z
  screenshot: evidence/E12-thanhvien-member.png
  observed: |
    Vai member (zzm5c39f436): cả 8 nút "Phát liên kết" trên màn Thành viên đều
    ở trạng thái tắt (disabled=true qua DOM, không chỉ nhìn màu xám), title=
    "Only an owner or an admin can issue this" — có lý do đọc được, không biến
    mất câm.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (dev:session + puppeteer-core headless, cookie phiên thật)
  verified_at: 2026-09-19T09:00:30Z
  screenshot: evidence/E12-thanhvien-admin.png
  observed: |
    Vai admin (e12-admin-...): nút "Phát liên kết" bấm được, có thêm nút "..."
    ở mỗi hàng. Khối "Được phép vào" hiện danh sách địa chỉ chờ, mỗi hàng có
    vết "X đã phát liên kết · N giờ/phút trước" cho các lượt phát trước đó.
  network_observed: n-a (driver)
- eval: E12
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (dev:session + puppeteer-core headless, cookie phiên thật)
  verified_at: 2026-09-19T09:01:00Z
  screenshot: evidence/E12-ghivet.png
  observed: |
    Phát THẬT một liên kết mới cho manh.phan qua chính hộp thoại (chụp dialog
    riêng thấy link đầy đủ + nút chép + "hết hạn sau một giờ"), rồi tải lại màn
    Thành viên: hàng của người vừa nhận hiện "e12-admin-... đã phát liên kết ·
    vài phút trước" — đúng ai-phát/lúc-nào đọc được trên màn, không suy từ E11.
  network_observed: n-a (driver)

- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 1
  verifier: manual ui-check (puppeteer-core headless, cả locale en mặc định và vi qua cookie lang)
  verified_at: 2026-09-19T09:05:00Z
  screenshot: evidence/E13-dangnhap.png
  observed: |
    Màn /sign-in chưa đăng nhập KHÔNG hiện ô email/mật khẩu và KHÔNG hiện nút
    Google. Thay vào đó là toàn màn "Chưa có cách nào để vào" / "No way in
    yet" — "CRM này chưa cấu hình cách đăng nhập nào, nên chưa ai vào được — kể
    cả bạn", kèm hướng dẫn CHỈ nói tới GOOGLE_CLIENT_ID/MICROSOFT_CLIENT_ID,
    không hề nhắc cửa mật khẩu mới. Đây TRỰC TIẾP trái AC-9 ("ô email và ô mật
    khẩu hiện cùng màn với nút Google") ở đúng kịch bản `.env` hiện có của kho
    (GOOGLE_CLIENT_ID rỗng) — cũng chính là kịch bản mục tiêu của tính năng.
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless)
  verified_at: 2026-09-19T09:05:30Z
  screenshot: evidence/E13-datmatkhau.png
  observed: |
    Trang đặt mật khẩu với liên kết còn hạn: hai ô "Mật khẩu mới"/"Gõ lại mật
    khẩu", mức tối thiểu nói TRƯỚC khi gõ ("Ít nhất 12 ký tự. Không cần chữ hoa
    hay ký tự đặc biệt."), nút "Đặt mật khẩu". Đúng yêu cầu khung hình 2.
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless, liên kết bị hết hạn tay qua DB)
  verified_at: 2026-09-19T09:06:00Z
  screenshot: evidence/E13-datmatkhau-hethan.png
  observed: |
    "Liên kết này hết hạn rồi. Nhắn người quản trị phát cho bạn một liên kết
    mới." — câu rõ ràng, nói đúng lý do (hết hạn) và việc cần làm tiếp (xin
    liên kết mới), không phải câu lỗi chung chung.
  network_observed: n-a (driver)
- eval: E13
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (dev:session admin + puppeteer-core headless)
  verified_at: 2026-09-19T09:06:30Z
  screenshot: evidence/E13-hopthoai.png
  observed: |
    Hộp thoại "Liên kết đặt mật khẩu": "Gửi cho manh. Liên kết dùng được một
    lần, hết hạn sau một giờ.", ô Liên kết hiện ĐẦY ĐỦ URL (có token thật, chọn
    sẵn), nút "Chép liên kết", hạn dùng nói bằng chữ chứ không phải dấu thời
    gian máy.
  network_observed: n-a (driver)

- eval: E14
  judged_by: pending human (T3, phán quyết trực tiếp bắt buộc — không được máy chấm)
  verdict: UNCERTAIN
  rationale: Hạng T3 đòi phán quyết trực tiếp của người theo đúng chỉ dẫn nhiệm
    vụ ("KHÔNG tự chấm"). Nội dung nguồn để đọc: apps/app/lib/messages/auth.ts
    và apps/app/lib/messages/settings-thanh-vien.ts (đã đọc qua trong lúc dựng
    ảnh E13/E17 — câu chữ tiếng Việt tự nhiên, không thấy từ ghép kỹ thuật tự
    đúc trong các câu đã render: "Mật khẩu phải có ít nhất N ký tự.", "Mật khẩu
    này đã từng bị lộ trong một vụ rò dữ liệu. Chọn mật khẩu khác.", "Liên kết
    này hết hạn rồi...", "Liên kết đặt mật khẩu", "Người nhận mở liên kết rồi
    tự đặt mật khẩu. Bạn không thấy mật khẩu của họ." — nhưng đây là quan sát
    hỗ trợ, không phải phán quyết thay người).
  required_evidence:
    - Người đọc trực tiếp evidence/E13-hopthoai.png và evidence/E13-datmatkhau*.png
      (đã chụp ở lượt này, tiếng Việt) rồi trả lời câu hỏi nguyên văn của E14.
  human_override:

- eval: E15
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_san_thiet_ke
  verified_at: 2026-09-19T08:49:34Z
  output: |
    Ba tệp đều verdict PASS, p0_count 0, blocking [], findings [].
  observed: |
    Chạy đủ cả ba: dat-mat-khau/[token]/page.tsx, sign-in/password-sign-in.tsx,
    settings/members/phat-chia-dialog.tsx — không tệp nào đỏ.

- eval: E16
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: config:executors.test.mk_phat_lai
  verified_at: 2026-09-19T08:49:21Z
  output: |
    1 pass, 19 filtered out, 0 fail, 6 expect() calls
  observed: |
    Đủ cả bốn khẳng định: đăng nhập bằng M2 vào được, bằng M1 không vào được,
    dùng lại chia1 vẫn bị từ chối, đếm hàng verification treo lại của người đó
    sau cùng = 0. Không đi qua nhánh "chưa có hàng người dùng thì tạo" sai cổng.

- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless, set value trực tiếp qua input value-setter thật + dispatch input event, không dùng click+backspace vì gặp race với React state — xem ghi chú dưới)
  verified_at: 2026-09-19T09:12:00Z
  screenshot: evidence/E17-mk-ngan.png
  observed: |
    Cùng một mật khẩu ngắn hơn mức tối thiểu gõ vào CẢ HAI ô, gửi: lỗi "Mật
    khẩu phải có ít nhất 12 ký tự." hiện cạnh ô "Mật khẩu mới" (client-side,
    không gọi máy chủ). Ô "Gõ lại mật khẩu" vẫn còn nguyên 6 dấu chấm, không bị
    xóa sạch.
  network_observed: n-a (driver)
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless)
  verified_at: 2026-09-19T09:12:30Z
  screenshot: evidence/E17-mk-dalo.png
  observed: |
    Trên CHÍNH liên kết đó, gõ "123456789012" (đủ dài, xác nhận THẬT là mật
    khẩu đã lộ qua chính API pwnedpasswords.com — SHA1 8D993CCDF...:167068 lượt
    lộ) vào cả hai ô, gửi: server trả 400 thật (quan sát qua network response
    log của trình duyệt), lỗi hiện "Mật khẩu này đã từng bị lộ trong một vụ rò
    dữ liệu. Chọn mật khẩu khác." — PHÂN BIỆT rõ với câu ở khung 1, cùng vị trí
    cạnh ô "Mật khẩu mới". Ô xác nhận vẫn còn nguyên giá trị. Liên kết KHÔNG bị
    tiêu thụ (form vẫn còn 2 ô mật khẩu sau lần gửi này).
  network_observed: clean
- eval: E17
  run_id: vao-bang-email-va-mat-khau-20260919-r1
  exit_code: 0
  verifier: manual ui-check (puppeteer-core headless)
  verified_at: 2026-09-19T09:13:00Z
  screenshot: evidence/E17-sua-duoc.png
  observed: |
    Vẫn trên CHÍNH liên kết vừa bị từ chối ở bước trên, gõ một mật khẩu sạch và
    gửi: server trả 200 thật, màn chuyển sang "Xong — Mật khẩu đã đặt. Từ giờ
    bạn vào CRM được bằng địa chỉ email và mật khẩu này, kể cả khi mạng không
    vào được Google." Đúng yêu cầu ma trận thêm sau vòng soi cuối: một lần bị
    từ chối vì mật khẩu xấu không đốt mất liên kết.
  network_observed: clean

<!-- Ghi chú kỹ thuật cho E17: lần chụp đầu dùng click(clickCount:3)+Backspace+type
     mô phỏng gõ tay, và VÔ TÌNH cho ra kết quả sai — mật khẩu đã-lộ "đi qua" —
     vì việc xoá/gõ lại qua thao tác chuột không cập nhật đúng state React trong
     một số lần chạy. Xác minh lại bằng set value trực tiếp qua input value-setter
     (như dispatchEvent input thật) và bằng curl thẳng vào /api/auth/reset-password
     (400 với "123456789012") thì hành vi ĐÚNG như trên. Đây là lỗi công cụ chụp
     của tôi ở lần đầu, không phải lỗi sản phẩm — ảnh cuối cùng trong evidence/ đã
     đúng và đã kiểm chứng chéo bằng network log + curl. -->

## Known limits

- Không gửi được thư (mời, đặt lại mật khẩu) — kho chưa có, đã khai trong hợp đồng.
- Không báo cho người dùng khi thông tin đăng nhập đổi — chỉ có ghi vết cho quản trị (AC-11).
- Chìa API của quản trị đi qua cầu REST như một phiên thường — bán kính nổ của
  một chìa bị rò gồm cả chiếm tài khoản người khác; canh duy nhất là hàng ghi
  vết trên màn Thành viên. Đã khai sẵn trong hợp đồng, không phải phát hiện mới.
- Huỷ phiên cũ khi đặt lại mật khẩu xoá hàng phiên thật, nhưng cache bánh phiên
  5 phút khiến một phiên mở trước vẫn dùng được tới 5 phút sau — đã khai sẵn
  trong hợp đồng (AC-3's test chỉ đo "hàng bị xoá", không đo "phiên hết dùng
  được ngay").
- E9 xanh chỉ phủ được vỏ cấu hình backend; ba chặng đi đường Google thật đều
  BỎ QUA CÓ TÊN trong môi trường này (GOOGLE_CLIENT_ID rỗng) — không coi là đã
  đo vế thật của "cửa Google vẫn sống song song".

## Ngoài hợp đồng

Xem `review-findings.md` — mục `dev-session.ts` va chạm id khi hai email trùng
10 ký tự đầu.

## Analyst

Không eval nào xanh trên cả hai vế (branch và baseline) — không chạy đối chứng
diffBase trong lượt này (không được yêu cầu rõ trong nhiệm vụ giao; `runBaseline:
true` có trong args nhưng chỉ dẫn của người điều phối cho phiên này không đòi
chạy nó). Không khẳng định gì về non-discriminating ở đây; để trống thận trọng
thay vì đoán.

## Variance

none — không có eval nào khai `runs > 1` trong tập 17 eval của vòng này.

## Iterations

Round 1 (lượt duy nhất của phiên nghiệm thu này): E1, E5, E7, E13 trượt —
E1 do eval tham chiếu bài kiểm không tồn tại; E5, E7 do bài kiểm thiếu khẳng
định mà chính eval đòi dù lệnh xanh; E13 do lỗi sản phẩm thật (màn đăng nhập
không hiện mật khẩu khi Google chưa cấu hình). Không có vòng sửa nào trong
phiên NGHIỆM THU này — phiên này chỉ đo, không vá. Trả về cho người điều phối
để quyết định vòng kế tiếp.
