# Thêm bước báo đúng — thiết kế (E6b)

Hàng E6b của `docs/plan/lo-trinh-okr.json`, Cổng Đáng `build` ký 2026-10-12T23:58:15Z
(`_acceptance/them-buoc-bao-dung/opportunity.md`). Ba lỗi hành vi mà review vòng 1 của E6
(`_acceptance/dieu-phoi-va/review-findings.md`, mục r1) tìm ra và để lại ở Known limits / wont-fix:

1. **Phòng ban không có thật** — `onboarding.addStep` trả `BAD_REQUEST` «Không có **bộ phận** nào mang mã …»,
   trong khi tạo/sửa khuôn và mọi đường `org.*` trả `NOT_FOUND` «Không có **phòng ban** nào mang mã …». Hai
   kiểm tra viết hai lần (`boPhanDangDung` trong `onboarding-ghi.ts`, `kiemBoPhanDangDung` trong
   `onboarding.service.ts`), và bản của `addStep` còn dùng nhầm chữ của cấp trên (bộ phận = `Division`).
2. **Danh sách phòng ban không tải được** — `PlanSteps` đọc `onboarding.listDepartments` rồi `?? []`: lỗi tải
   thành ô chọn trống, nút Lưu khoá không lý do, và nút «Thêm bước ở phòng ban khác» biến mất như thể hết
   phòng ban.
3. **Dòng «và N việc quá hạn nữa»** — máy chủ đếm quá hạn theo đầu ngày giờ Việt Nam (`dauNgayVN`), còn thẻ
   trừ đi số dòng quá hạn đang hiện tính theo ngày **địa phương của trình duyệt** (`buocQuaHan` →
   `ngayCuaBuoc` dựng `Date` địa phương). Trình duyệt ở múi giờ khác, quanh nửa đêm VN, thấy dòng «nữa» cho
   bước đang hiện, hoặc thấy thiếu.

Chữ trên màn và trong thông điệp dùng «phòng ban» theo `CONTEXT.md` (mục **Phòng ban**: «_Avoid_: bộ phận
(cho cấp này)»). Câu giao của hàng viết «bộ phận» theo chữ cũ của màn Điều phối.

## Hướng đã chọn

**(1) Một hàm kiểm phòng ban cho mọi đường ghi của kế hoạch 30 ngày.** `onboarding-ghi.ts` xuất
`kiemPhongBanDangDung(db, ids)`: nhận một client Prisma (giao dịch hoặc `Db`) và danh sách mã; thiếu mã nào →
`NotFoundException(TO_CHUC.thongDiep.khongCoPhongBan(<các mã nối bằng ", ">))`; có phòng ban đã lưu trữ →
`BadRequestException(ONBOARDING.thongDiep.boPhanDaLuuTru(<tên>))`. `addStep` gọi nó với một mã;
`OnboardingService.kiemBoPhanDangDung` (tạo khuôn, sửa khuôn, tạo kế hoạch từ khuôn) thôi tự viết câu, gọi
cùng hàm. Một mã → câu giống hệt `org.*` (`phongBanCo` của `to-chuc.service.ts`). Đường lưu trữ giữ nguyên
câu đang dùng chung (`ONBOARDING.thongDiep.boPhanDaLuuTru`). Form thêm bước đã hiện `e.message` trong
`FieldError` khi lưu lỗi (E6, AC-6) — không đổi.

Hệ quả cho hồ sơ đã ký `dieu-phoi-va`: AC-6 vế «`departmentId` không có thật → `BAD_REQUEST`» bị thay bằng
AC-1 của vòng này (Cổng Đáng 12/10 ký sau AC-6 ký 09/10). Bài kiểm `bo-phan-hong` của
`apps/api/test/dieu-phoi-va.spec.ts` đổi đúng một khẳng định (`toBe(400)` → `toBe(404)` cho ca mã lạ); vế lưu
trữ và đối chứng dương giữ nguyên. Hồ sơ đó cũ theo `paths` và được ghim lại ở bước ghim lại của vòng. Việc
thay một vế của hồ sơ người đã ký là câu hỏi cho anh ở Cổng Phạm vi (Hỏi-1); máy khuyên thay.

**(2) Lỗi tải danh sách phòng ban nói ra trong form.** `PlanSteps` truyền xuống `ThemBuoc` trạng thái của truy
vấn danh sách (`loi`, `thuLai`, `dangTai`) thay cho mảng đã `?? []`. Form có ô chọn phòng ban (kế hoạch rỗng,
hoặc «Thêm bước ở phòng ban khác») mà truy vấn lỗi → thay ô chọn bằng `VungTaiLoi` (tiêu đề «Không tải được
danh sách phòng ban», mô tả dùng chung `crm.vungCon.loiMoTa` «Kiểm tra kết nối rồi thử lại.», nút thử lại gọi
`refetch`). Nút Lưu vẫn khoá vì chưa chọn phòng ban. Nút «Thêm bước ở phòng ban khác» hiện khi truy vấn lỗi
(không suy «hết phòng ban» từ một mảng rỗng do lỗi). Form trong nhóm phòng ban có sẵn không cần danh sách nên
không đổi. Thử lại thành công → ô chọn hiện đủ phòng ban, vùng lỗi biến mất.

**(3) Quá hạn của bước đếm theo ngày Việt Nam ở cả hai phía.** `apps/app/lib/qua-han.ts` thêm
`buocQuaHanVN(dueAt, now)`: so chuỗi ngày `dueAt` (máy chủ đã gửi `ngayVN(dueAt)`) với ngày Việt Nam của `now`
(`homNayVn` có sẵn ở `apps/app/lib/okr-chu-ky-nhan.ts`), không dựng `Date` địa phương nữa. `buocQuaHan(buoc, now)`
của `dong-buoc.tsx` gọi nó; hàm nằm ở `lib/` để bài kiểm khứ hồi phía API gọi đúng hàm này trên đầu ra thật của
`dashboard.summary` (AC-9). Cả dòng «và N … nữa» lẫn màu quá hạn
của từng dòng bước đọc cùng hàm, nên cùng một ngày với số máy chủ đếm. Hợp đồng `dashboard.summary` không
đổi. Lối khác — máy chủ gửi cờ `quaHan` cho từng bước — đúng hơn về nguồn nhưng đổi kiểu `mySteps`, kéo theo
bộ dữ liệu thử của bốn bài kiểm DOM thuộc các hồ sơ đã ký; giá đó không mua thêm gì khi cả hai phía đã cùng
định nghĩa ngày (AC-7 của `dieu-phoi-va`: «`dueAt` trước đầu ngày hôm nay giờ Việt Nam»). Lệch còn lại là
`now` của trình duyệt và của máy chủ khác nhau vài trăm mili-giây ngay nửa đêm; dòng «nữa» đã kẹp ở 0.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bản ghi kế hoạch → «Thêm bước» / «Thêm bước ở phòng ban khác» → chọn phòng ban, gõ việc, chọn hạn → «Thêm» (điểm ra: bước hiện dưới tiêu đề phòng ban)
- Biên: danh sách phòng ban không tải được; kế hoạch đã có bước ở mọi phòng ban đang dùng (nút «ở phòng ban khác» ẩn — chỉ khi danh sách tải được)
- Lỗi & quay lại: tải danh sách lỗi → vùng lỗi trong form, nút thử lại → ô chọn trở lại; lưu lỗi (phòng ban vừa bị xoá hay lưu trữ) → câu của máy chủ dưới form, form giữ chữ đã gõ

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bản ghi kế hoạch — phần Bước | thêm một bước vào một phòng ban | từ danh sách Kế hoạch / ở lại bản ghi |
| Tổng quan — thẻ «Việc quá hạn» | cho biết còn bao nhiêu việc quá hạn ngoài danh sách | từ thanh bên / mở bản ghi của dòng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-them-buoc-loi-phong-ban | Bản ghi kế hoạch | `VungTaiLoi` «Không tải được danh sách phòng ban» · «Kiểm tra kết nối rồi thử lại.» · nút thử lại, thay chỗ ô chọn; nút «Thêm» khoá | bấm thử lại, hoặc «Thôi» |
| ST-them-buoc-khac-loi-phong-ban | Bản ghi kế hoạch | nút «Thêm bước ở phòng ban khác» vẫn hiện; mở ra là vùng lỗi như trên | bấm thử lại |
| ST-them-buoc-thu-lai-xong | Bản ghi kế hoạch | vùng lỗi biến mất, ô chọn liệt phòng ban đang dùng | chọn phòng ban, lưu |
| ST-qua-han-con-sot | Tổng quan | «và N việc quá hạn nữa» với N = tổng máy chủ trừ số dòng quá hạn theo ngày VN đang hiện; không có dòng khi N = 0 | mở bản ghi của dòng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút «Thêm» khoá khi chưa chọn phòng ban — gồm cả lúc danh sách lỗi; vùng lỗi nói vì sao không chọn được.
- Màu quá hạn của dòng bước và dòng «nữa» cùng theo ngày Việt Nam, bất kể múi giờ của trình duyệt.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `VungTaiLoi` (`packages/ui`) | dùng | `docs/design.md` mục «Chờ tải và lỗi tải»: lỗi tải là `VungTaiLoi`, không dựng khung lỗi riêng |
| `Select`, `FieldError`, `Button` (`packages/ui`) | dùng | giữ nguyên form E6 |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — vòng này chỉ thêm một trạng thái lỗi vào form sẵn có trong bản ghi (chi tiết) và sửa một con số trên thẻ; một khuôn khả dĩ, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

Thước màn `rang/man.mjs` (puppeteer-core, theo khuôn thước màn của `dieu-phoi-va`) chặn yêu cầu
`onboarding.listDepartments` để dựng ba trạng thái lỗi ở 1440 và 390, và đặt múi giờ trang bằng `emulateTimezone`
cho Tổng quan — đó là khung hình cho Cổng Bằng chứng (E10, E11).

Đối chiếu `web-design-guidelines` (khoá `feature_loop.ui_standards_skill`): «Error messages include fix/next
step, not just problem» — vùng lỗi có câu «Kiểm tra kết nối rồi thử lại.» và nút thử lại; «Errors inline next
to fields» — vùng lỗi đứng đúng chỗ ô chọn. «Async updates … need `aria-live="polite"`» — `VungTaiLoi` của
`packages/ui` chưa có `aria-live`; sửa thành phần dùng chung nằm ngoài vòng này (Later).

## Độ phủ (quét hình thái, preset test-matrix)

Chân sản phẩm: `CONTEXT.md` (Phòng ban, Bước), `docs/api.md` (cây tổ chức, `org.*` là đường ghi phòng ban
duy nhất), `apps/api/src/dashboard/dashboard.service.ts` (`demQuaHan`). Chân ngành: [NGÀNH: Salesforce SOQL —
biên của date literal theo locale của người chạy, không có thì theo locale của tổ chức] — kho này là một tổ
chức ở Việt Nam nên chọn ngày của tổ chức cho mọi người. Thước CE: lịch sử lỗi của chính khu này — ba mục r1
của `_acceptance/dieu-phoi-va/review-findings.md`.

- Trục A — đường ghi nhận mã phòng ban: `addStep` | tạo khuôn | sửa khuôn | tạo kế hoạch từ khuôn | `org.*`
  [SUY-TỪ-REPO: apps/api/src/onboarding/onboarding.service.ts, apps/api/src/to-chuc/to-chuc.service.ts]
- Trục B — tình trạng mã: có, đang dùng | không có thật | đã lưu trữ
- Trục C — chỗ mở form thêm bước: kế hoạch rỗng | «ở phòng ban khác» | trong nhóm có sẵn
  [SUY-TỪ-REPO: apps/app/components/crm/record-sheet/plan-steps.tsx]
- Trục D — trạng thái danh sách phòng ban: đang tải | lỗi | rỗng | có
- Trục E — múi giờ trình duyệt so với VN, tại một thời điểm quanh nửa đêm VN: bằng | lùi (ngày địa phương
  trước ngày VN) | tiến (ngày địa phương sau ngày VN)

Core: A{addStep, tạo khuôn, sửa khuôn}×B{không có thật} cùng lỗi với `org.*`; A{addStep, tạo khuôn}×B{lưu trữ}
cùng lỗi; C{rỗng, khác}×D{lỗi}; C{rỗng}×D{lỗi→có} (thử lại); C{nhóm có sẵn}×D{lỗi} vẫn thêm được; E{lùi, tiến}
cho dòng «nữa» và màu dòng; E{bằng} không hồi quy.
Later: C×D{đang tải} — ô chọn trống trong lúc tải chưa nói «đang tải»; C×D{rỗng} — chưa có phòng ban nào thì
form nên trỏ Cài đặt › Tổ chức như màn khuôn; `aria-live` cho `VungTaiLoi`; việc (`Activity`) quá hạn — danh sách
đã do máy chủ lọc nên không lệch.
Never: tính ngày theo múi giờ riêng của từng người — một tổ chức, một ngày; API tạo phòng ban hộ khi mã lạ.
