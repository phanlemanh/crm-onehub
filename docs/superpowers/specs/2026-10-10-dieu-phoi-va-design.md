# Điều phối vá (E6 `dieu-phoi-va`) — thiết kế

Hàng E6 của `docs/plan/lo-trinh-okr.json`, đợt sau-14-10, làn P3. Câu giao: «Mã đối tác không khớp vẫn có
người xử lý; kế hoạch rỗng thêm được bước; thẻ quá hạn báo còn sót». Bản khảo sát lộ trình 04/10 (mục #38 #39
#40) đã mất; ba lỗi dò lại từ mã ngày 09/10. Anh chốt hướng ngày 09/10: 1A' · 2 theo đề xuất · 3A · bỏ
design-pass có tên.

## Ba lỗi hôm nay

1. **Mã đối tác không khớp không ai xử lý.** `OnboardingIngestService.nhan` gom mã `platformBrokerId` không
   khớp cá nhân nào rồi gọi `AgentTriggerService.onboardingMatchNeeded`, ghi `AgentTask` loại
   `onboarding-identify`. Loại này không có trong `TASK_KINDS` (`packages/db/src/agent-tasks.ts`), nên làn
   nghiên cứu của tác nhân nhận nó với brief chung «Handle this: …» (`dispatch.ts`), không có ngữ cảnh kế
   hoạch, rồi rút việc sau `MAX_ATTEMPTS`. Không người nào được báo. Hồ sơ `dieu-phoi-30-ngay-dau` đã gắn mức
   «high» cho đúng chỗ này (`run-log.jsonl` dòng 129, 174).
2. **Kế hoạch rỗng không thêm được bước.** `plan-steps.tsx` chỉ đặt nút «Thêm bước» trong nhóm bộ phận đã có
   bước, với `departmentId` cố định. Kế hoạch không còn bước nào chỉ hiện khung trống — mà chữ của khung bảo
   «Thêm bước đầu tiên và chọn bộ phận giữ nó». Bộ phận chưa có bước cũng không thêm được. Ngoài-5 của
   `ke-hoach-la-mot-ban-ghi` đã hứa mở hợp đồng mới cho việc này. API `addStep` đúng, nhưng không kiểm bộ phận:
   bộ phận không có thật hay đã lưu trữ trả lỗi 500 thô (Ngoài-1 cùng hồ sơ).
3. **Thẻ «Việc quá hạn» đếm sót.** `DashboardService` lấy việc quá hạn với `take: 10` và bước của tôi với trần
   `ONBOARDING.viecCuaToi.tran` (10); `dashboard-summary.tsx` đếm số quá hạn trên hai danh sách đã cắt. 25 việc
   quá hạn hiện thành «10 quá hạn»; ở phạm vi «Tất cả» số kẹt ở 10. Thẻ không nói còn bao nhiêu.

## Thiết kế

### 1. Mã lệch thành việc cho người phụ trách kế hoạch (1A')

API giữ nguyên luật `docs/api.md` («No identity guessing»: mã không khớp ghi `AgentTask`, tác nhân quyết) và
giữ nguyên `onboardingMatchNeeded`. Thay đổi nằm ở hai chỗ:

- `packages/db/src/agent-tasks.ts`: thêm `"onboarding-identify"` vào `TASK_KINDS` và `DIRECT_KINDS`. Làn
  nghiên cứu không còn nhận nó; làn trực tiếp xử lý, không gọi mô hình.
- `apps/agent/agent/lib/dispatch.ts` gọi một trình xử lý mới trong `apps/agent/agent/lib/ma-lech.ts`:
  1. Parse `payload` bằng schema `onboardingIdentifyPayload` (`{ planId, platformBrokerId }`) ở
     `packages/validation/src/onboarding-identify.ts` — shape đi qua ranh giới gói, API ghi, tác nhân đọc.
     Parse hỏng → đóng việc với lý do «payload onboarding-identify hỏng: …», không nuốt.
  2. Đọc kế hoạch. Không còn hoặc đã đóng → đóng việc «kế hoạch đã đóng hoặc không còn», không ghi gì.
  3. Đọc lại bảng mã: mã nay đã khớp một cá nhân (có người gắn kịp) → đóng việc «mã đã khớp», không ghi.
  4. Đã có việc mở (`type TASK`, `completedAt null`) của cùng kế hoạch mang `meta.platformBrokerId` bằng mã
     này → đóng việc «đã có việc mở», không ghi trùng.
  5. Còn lại → ghi một `Activity` `TASK`: `createdById` = `plan.ownerId` (để việc vào «Của tôi» của người phụ
     trách — `DashboardService` lọc «Của tôi» theo `createdById`), `planId`, `companyId` của kế hoạch,
     `dueAt` = đầu ngày hôm nay giờ Việt Nam, `subject` «Gắn mã nền tảng <mã> vào đúng cá nhân», `body` một
     câu nói lô nào báo, `meta` `{ agent: "onboarding-identify", platformBrokerId }`. Rồi đóng `AgentTask`
     với kết quả «đã giao việc cho người phụ trách».

Việc hiện ngay trong ngày ở dòng thời gian của kế hoạch (bộ lọc việc chưa xong). Thẻ «Việc quá hạn» của Tổng
quan chỉ đếm việc có hạn trước hôm nay, nên việc chưa xong lên thẻ đó của người phụ trách từ hôm sau — không
đặt hạn lùi để ép nó lên sớm.

Việc này không mang dấu Kara: không có phán đoán của mô hình, chỉ là định tuyến xác định (`docs/ai-ux.md` áp
cho chỗ AI nói, đề xuất, tóm tắt).

### 2. Thêm bước khi kế hoạch rỗng hoặc bộ phận chưa có bước

`ThemBuoc` nhận `departmentId` tuỳ chọn. Thiếu thì form có thêm ô chọn bộ phận (`Select` của `packages/ui`)
lấy từ `trpc.onboarding.listDepartments({ archived: false })`, chỉ liệt bộ phận chưa có nhóm trong kế hoạch.

- Kế hoạch mở, không bước nào: khung trống `DetailSheetEmpty` giữ nguyên chữ, thêm `ThemBuoc` có ô chọn bộ phận
  ngay dưới khung.
- Kế hoạch mở, có bước: sau các nhóm, một `ThemBuoc` nhãn «Thêm bước ở bộ phận khác», ô chọn chỉ có bộ phận
  chưa có nhóm. Hết bộ phận để chọn → nút không hiện.
- Kế hoạch đã đóng: không nút nào (giữ luật `khoa` hiện có).
- `onboarding-ghi.ts` `addStep`: kiểm bộ phận có thật và chưa lưu trữ trước khi ghi; sai → `TRPCError`
  `BAD_REQUEST` với thông điệp đọc được, không ghi bước (trả Ngoài-1 của `ke-hoach-la-mot-ban-ghi`).

### 3. Thẻ quá hạn đếm số thật (3A)

- `dashboard.contracts.ts`: thêm `quaHan: { viec: number, buoc: number }` vào đầu ra.
- `dashboard.service.ts`: `viec` = `count` cùng điều kiện truy vấn việc quá hạn (TASK chưa xong,
  `dueAt < dauNgayVN(now)`, «Của tôi» lọc `createdById`), không trần. `buoc` = `count` bước của tôi, chưa
  xong, kế hoạch mở, `dueAt < dauNgayVN(now)`. Danh sách giữ trần 10 như cũ.
- `dashboard-summary.tsx`: số trên thẻ = `quaHan.viec + quaHan.buoc`. Số dòng quá hạn đang hiện ít hơn tổng →
  thêm một dòng chữ phụ «và N việc quá hạn nữa» dưới bảng (N = tổng − số dòng quá hạn đang hiện). Không có
  trang xem hết, nên dòng này không là liên kết.
- Chữ mới vào `apps/app/lib/messages/tong-quan.ts` (chỉ thêm khoá).

## Coverage (quét test-matrix)

Chân sản phẩm: `[SUY-TỪ-REPO: apps/api/src/onboarding/onboarding-ingest.service.ts, plan-steps.tsx,
dashboard.service.ts]`. Chân ngành: `[NGÀNH: HubSpot — hàng việc quá hạn đếm tổng thật, không theo trang]`.

- Trục A — Mã lệch: lô 1 mã | nhiều mã | gửi lại cùng mã | cùng mã ở hai kế hoạch × lúc tác nhân chạy: vẫn
  lệch | đã khớp | kế hoạch đã đóng · payload hỏng. Thước CE: bốn ca `khong-khop-agenttask` của
  `dieu-phoi-diem-nhan.spec.ts` + nhánh của trình xử lý.
- Trục B — Thêm bước: kế hoạch rỗng | có bước × bộ phận đã có nhóm | chưa có nhóm | đã lưu trữ | không có thật ×
  kế hoạch mở | đã đóng. Thước CE: `gomTheoBoPhan`, `listDepartments`, `addStep`.
- Trục C — Đếm quá hạn: 0 | ≤ 10 | > 10 × việc | bước × «Của tôi» | «Tất cả». Thước CE: hai truy vấn của
  `DashboardService`, `buocQuaHan`.
- Later: trang xem hết việc quá hạn; nhắc buổi sáng nêu việc mã lệch trong ngày; bước giao cho người khác
  ngoài «Của tôi».
- Never: API tự đoán cá nhân theo tên/số điện thoại khi mã lệch.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (kế hoạch rỗng): Tổng quan › Kế hoạch › mở bản ghi kế hoạch → khung trống → «Thêm bước» → chọn bộ
  phận, gõ tên, hạn → Lưu → bước hiện trong nhóm bộ phận đó (điểm ra: bản ghi kế hoạch).
- Suôn sẻ (thẻ quá hạn): Tổng quan → thẻ «Việc quá hạn» → đọc «N quá hạn» đúng tổng → «và M việc quá hạn nữa».
- Biên: hết bộ phận chưa có nhóm → không có nút «Thêm bước ở bộ phận khác»; kế hoạch đã đóng → không nút.
- Lỗi & quay lại: bộ phận vừa bị lưu trữ → Lưu báo lỗi đọc được tại form, form giữ chữ đã gõ, chọn lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bản ghi kế hoạch (`?record=plan:<id>`) | xem và chỉnh bước của kế hoạch | danh sách kế hoạch, Tổng quan / đóng khung |
| Tổng quan — thẻ «Việc quá hạn» | thấy việc trễ của mình | trang chủ / dòng việc mở bản ghi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ke-hoach-rong | Bản ghi kế hoạch | khung trống «Kế hoạch chưa có bước» + nút «Thêm bước» | bấm, chọn bộ phận |
| ST-ke-hoach-them-bo-phan | Bản ghi kế hoạch | form: ô chọn bộ phận, tên bước, hạn, Lưu, Huỷ | lưu hoặc huỷ |
| ST-ke-hoach-bo-phan-khac | Bản ghi kế hoạch | dưới các nhóm: «Thêm bước ở bộ phận khác» | bấm, chọn bộ phận chưa có nhóm |
| ST-ke-hoach-dong | Bản ghi kế hoạch | không nút thêm | — |
| ST-tong-quan-con-sot | Tổng quan | «N quá hạn» với N là tổng thật, dòng «và M việc quá hạn nữa» | mở từng dòng |
| ST-tong-quan-du | Tổng quan | «N quá hạn», không dòng «và … nữa» | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lưu bị khoá khi tên trống hoặc chưa chọn bộ phận (form không có bộ phận cố định).
- Ô chọn bộ phận đứng trước ô tên; focus vào ô chọn khi mở form không có bộ phận cố định.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `Select` (`packages/ui`) | dùng | ô chọn bộ phận |
| `DetailSheetEmpty`, `Button`, `Input` | dùng | khung trống và form sẵn có |
| `CardPanel` + chữ phụ | dùng | dòng «và M việc nữa» dưới `SimpleTable` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — sửa trong hai màn có sẵn, không đổi bố cục; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Trang xem hết việc quá hạn (không có trang danh sách việc).
- Đổi luật `docs/api.md` cho ingest; tác nhân dò cá nhân bằng mô hình (lối 1B).
- Dọn các hàng `onboarding-identify` cũ đã rút trên production.
- Bản mẫu bấm được (design-pass) — bỏ có tên ở sổ quyết định.
