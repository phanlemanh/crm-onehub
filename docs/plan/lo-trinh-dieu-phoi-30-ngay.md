# Lộ trình điều phối 30 ngày đầu — sau vòng một

> **Đã khép 17/10/2026.** Lượt 1–3 đã giao (22/09). Lượt 4 `buoc-co-viec-con` và lượt 5 `so-lua-va-noi-nen-tang` chuyển thành mục chờ điều kiện DA9, DA10 (khoá `chan_troi`) trong `docs/plan/lo-trinh-viec-du-an.json`. Tệp này giữ làm lịch sử, không cập nhật nữa.

Viết 2026-09-22, sau ba lượt rà trên `onehub.center` và một bản quét không gian
(kiểu Zwicky, preset entity-feature, thước Trello) chạy cùng ngày. Vòng một
(`dieu-phoi-30-ngay-dau`, ký 2026-09-21) đã dựng đủ khuôn, danh mục, hồ sơ, phễu
và điểm nhận. Lộ trình này chia phần còn lại thành **năm lượt `/feature-loop`**,
mỗi lượt một bản giao dùng được, và một chân trời để không ai bàn lại.

Bản quét đầy đủ nằm trong lịch sử phiên; bảng phủ ở mục 6 chép lại từng ô để
không ô nào rơi giữa hai lượt.

## Hiện trạng 2026-09-29 — ba lượt đã lên, chờ số thật

Lượt 1, 2, 3 cùng lên `onehub` ngày 22/09. Lượt 4 và 5 chưa mở, đúng điều kiện
đã khai. Việc của khu này trước 06/10 không phải dựng thêm mà là **chuẩn bị để
đo được**: ba lượt cùng hết cửa sổ hai tuần vào một ngày, và ba chỗ hiện đang
làm phép đo đỏ vì lý do đã biết. Mục 1–8 bên dưới giữ nguyên như viết 22/09;
mục 9 là sổ theo dõi.

### Đã giao

| Câu giao | Lượt | PR | Hồ sơ |
| --- | --- | --- | --- |
| Kế hoạch là một bản ghi làm việc được | 1 | #77 | `signed-off`; phiên nghiệm thu dựng sẵn, hoãn |
| Mọi phía đều thấy kế hoạch | 2 | #79 | `machine-cleared` — chưa ký hẳn |
| Máy nhắc trước người, qua Slack | 3 | #82 | `signed-off` |

Cùng khu, ngoài năm lượt, đã lên:

- Nhắc buổi sáng qua Zalo, người nhận tự chọn kênh (#94); trả lời «xong n» trong
  Zalo để đánh dấu bước xong (#144). Lượt 3 nay có hai kênh, và «đánh dấu xong»
  đi qua một thủ tục chung cho cả màn lẫn Zalo.
- Trang 30 ngày đầu theo khuôn danh sách của Thoả thuận (#85); hạn việc tính
  theo ngày giờ Việt Nam (#84).

Nền dưới chân đã đổi, không do lộ trình này:

- Bộ phận của khuôn nay là phòng ban của cây tổ chức (#120, #136): Cài đặt ›
  Điều phối trỏ sang Cài đặt › Tổ chức, danh mục lọc theo phòng ban, ô Mục tiêu
  đổi thành Thời lượng.
- Vai «chỉ OKR» (#129) không đọc được dữ liệu đối tác, nên cũng không thấy kế
  hoạch 30 ngày. Người được giao bước mà mang vai này sẽ không thấy việc của
  mình — cần soát trước phiên nghiệm thu.

### Mốc đo đã khai

| Ngày | Lượt | Sống khi | Nguồn số |
| --- | --- | --- | --- |
| 06/10 | 1 | Mọi kế hoạch đang chạy có bước đã giao hoặc đã xong; cột Im lặng khác `—` ở ít nhất một hàng | `OnboardingStep`, danh mục |
| 06/10 | 2 | Ít nhất nửa số bước xong do chính người được giao bấm; «hôm nay tôi có việc gì» trả lời từ tổng quan trong 30 giây | vết `buoc.xong`, bấm giờ tại phiên |
| 06/10 | 3 | Số ngày im trung vị thấp hơn ngày bật; ít nhất nửa số bước đã nhắc xong đúng hoặc trước hạn | `OnboardingStep.updatedAt`, hàng nhắc đã gửi |
| 06/10 | 4 (mở hay lùi) | Có bước bị đổi hạn hơn một lần, hoặc ghi chú trên bước đang dùng làm danh sách việc con | vết đổi hạn, ghi chú |
| khoảng 02/11 | vòng một | Sheet cũ không còn được cập nhật hai tuần cuối; mỗi bộ phận chấm kín từ 4/5 | phiên nghiệm thu |

Cả năm dòng đọc dữ liệu production. Nếu tới 06/10 production chưa có đối tác
thật nào trong kế hoạch, ba lượt đo trên tập rỗng — phải biết điều này trước
khi đặt lịch phiên, không phải tại phiên.

### Now — lấp trước 06/10

1. **Kế hoạch trống không thêm được bước đầu** (Ngoài-5 của lượt 1, đã hứa
   «mở hợp đồng mới», chưa mở). Nút «Add a step» chỉ nằm dưới nhóm phòng ban đã
   có bước, nên kế hoạch không còn bước nào — hoặc phòng ban chưa có bước — không
   thêm được từ màn. Ngưỡng lượt 1 đếm «mọi kế hoạch đang chạy», nên một kế hoạch
   như vậy làm đỏ cả lượt vì một lỗ đã biết, không vì người không dùng. T2, nhỏ.
2. **Số nền của lượt 3 chưa ai chụp.** Ngưỡng so với «ngày bật» nhưng hôm 22/09
   không có số đo. Dựng lại được, không cần đổi ngưỡng: trước #77 không thủ tục
   nào ghi vào bước, nên ngày chạm cuối của bước chưa từng đổi là ngày tạo; từ #77
   mọi giao · xong · đổi hạn đều để vết có giờ. Tính ngày im của từng kế hoạch tại
   lúc #82 gộp (2026-09-22 13:29 UTC) từ hai nguồn đó, ghi vào hồ sơ lượt 3.
3. **Lượt 2 chưa ký hẳn.** Hồ sơ dừng ở `machine-cleared`, cửa veto để ngỏ.
   Phiên nghiệm thu chỉ chạy trên vòng đã ký, nên phải đóng trước 06/10.

### Next — sau 06/10

- **Một phiên nghiệm thu cho cả ba lượt**, cùng người, cùng dữ liệu, thay vì ba
  buổi. Vòng một vẫn đo riêng khoảng 02/11 vì cửa sổ sáu tuần.
- **Lượt 4 mở hay lùi**, quyết bằng số đổi hạn và ghi chú đọc từ vết ở 06/10.
- **Nợ đã ghi của lượt 1**: thêm bước dưới phòng ban đã lưu trữ trả lỗi thô thay
  vì câu đọc được (Ngoài-1 — cây tổ chức đã chặn lưu trữ phòng ban còn người, nhưng
  chưa ai đo lại đường này); ba bài kiểm giao diện của vòng một vẫn đo trang kế
  hoạch cũ (Ngoài-2); vết đổi kế hoạch hỏng hình dạng không để lại lỗi (Ngoài-3).

### Later — không đổi

- Lượt 5 vẫn chờ đội nền tảng có bên gửi; điểm nhận không có thay đổi nào từ
  21/09.
- Phiên nghiệm thu vòng một rơi vào tuần OKR bắt đầu áp dụng cho mọi phòng ban
  (26/10). Cùng những trưởng bộ phận sẽ được gọi cho cả hai — nên đặt lịch sớm.
- Chân trời (mục 5) và Never (mục 7) giữ nguyên.

## 1. Ba điều rà ra, gom thành một

| Phát hiện | Bằng chứng |
| --- | --- |
| Sau khi tạo, **không thủ tục nào ghi vào `OnboardingStep`** — không giao người, không đánh dấu xong, không sửa hạn, không thêm bước | `apps/api/src/onboarding/onboarding.service.ts` trên `origin/onehub` chỉ có một `onboardingStep.createMany` |
| Vì thế ba cột danh mục đang chết: Bước luôn `0/n`, Đang tắc ở luôn là bước đầu, Im lặng luôn `—` | `onboarding-danh-muc.ts` tính `imNgay` từ `updatedAt` của bước |
| Hồ sơ kế hoạch là **trang riêng**, không cùng họ record sheet với Công ty · Cá nhân · Thoả thuận; không tên đối tác, không dải số, không tab | `[planId]/page.tsx` dùng `PageShell`; `RECORD_KINDS` chỉ có `company · contact · deal` |
| Sheet Công ty không biết đối tác đang có kế hoạch | `company-sheet.tsx` không nhắc `onboarding` |
| Nút xoá môi giới luôn xoá người đầu danh sách; hạn hôm nay đã bị gắn «Quá hạn» | `ho-so-ke-hoach.tsx`: `moHoi(h, dsGhiDanh[0].contactId)`; so `dueAt` 00:00 với giờ hiện tại |
| `CONTEXT.md` chưa có mục cho kế hoạch · bước · bậc · người cầm trịch | nợ từ điển S1 của vòng một, chưa trả |

Cùng một gốc: kế hoạch chưa được coi là **một bản ghi làm việc được** trong CRM.
Nó có màn, nhưng không có tay.

## 2. Nguyên tắc chia lượt

- **Mỗi lượt giao một câu người dùng nói được**, không phải một danh sách API.
- **Lượt sau đứng trên dữ liệu thật của lượt trước.** Không dự báo, không nhắc,
  không việc con khi bước còn chưa đánh dấu xong được.
- **Không chạm hai lớp khó-đảo trong một lượt** nếu tránh được. Lượt nào chạm
  `packages/db/prisma` là T3, có Cổng 1.5.
- **Cổng Giá trị của vòng một dời tới sau lượt 1.** Ngưỡng «mỗi bộ phận chấm
  4/5 dùng được thay Sheet» không thể đạt khi bước không đánh dấu xong được;
  đo bây giờ là đo một lỗ đã biết.

## 3. Tổng quan

| # | Slug | Câu giao | Hạng | Đứng trên |
| --- | --- | --- | --- | --- |
| 1 | `ke-hoach-la-mot-ban-ghi` | «Tôi mở một đối tác như mở một thoả thuận, giao bước, đánh dấu xong, và thấy ai làm gì lúc nào» | T3 | vòng một |
| 2 | `moi-phia-deu-thay-ke-hoach` | «Từ công ty, từ người, từ màn tổng quan của bộ phận tôi — đều tới được kế hoạch, và việc của tôi tự hiện ra» | T2 | lượt 1 |
| 3 | `may-nhac-truoc-nguoi` | «Tôi không phải mở danh mục mỗi sáng: sắp tới hạn, im quá lâu, tới mốc — máy nhắc đúng người kèm việc cần làm» | T2/T3 | lượt 1, 2 |
| 4 | `buoc-co-viec-con` | «Một bước lớn chia được việc con, việc này xong mới mở việc kia, tài liệu đính ngay tại chỗ» | T3 | lượt 1 + bằng chứng bước còn quá to |
| 5 | `so-lua-va-noi-nen-tang` | «Số từ nền tảng tự đổ vào phễu; tôi so lứa này với lứa trước và biết việc nào ăn thua» | T3 | đội nền tảng có bên gửi |
| — | Chân trời | Cổng cho đối tác · LMS · chi phí — đổi mô hình quyền hoặc ngoài CRM | — | quyết riêng |

## 4. Từng lượt

### Lượt 1 — `ke-hoach-la-mot-ban-ghi`

**Ý định (dán vào `/feature-loop:feature-loop`):** Kế hoạch 30 ngày trở thành
một loại bản ghi trong họ record sheet, mở từ danh mục như mở thoả thuận; trên
đó giao được người, đánh dấu xong, sửa hạn, thêm bớt bước, đổi người cầm
trịch, ghi chú, và mọi thay đổi để lại vết đọc được ở tab Hoạt động.

**Phủ ô:** Core 1–6 của bản quét 22/09; Core #8 · #9 · #15 · #20 của bản quét
19/09 (lần này có tay); hai lỗi nhỏ; nợ từ điển.

**Trong phạm vi**

- API: `updateStep` (assigneeId · completedAt · dueAt · label), `addStep`,
  `removeStep`, `reorderSteps`, `updatePlan` (ownerId · targetDays). Mọi thủ
  tục chạm `updatedAt` của bước để `imNgay` sống lại.
- Vết: `Activity.planId` (migration), mỗi giao / xong / đổi hạn / đổi cầm trịch
  ghi một `Activity` kiểu `TASK` hoặc `STAGE_CHANGE`; ghi chú là `NOTE`.
  `TimelineAnchor` nhận `planId`.
- Giao diện: `plan` vào `RECORD_KINDS`; `PlanSheet` dùng `RecordSheetFrame` —
  tiêu đề là tên đối tác kèm logo, dòng phụ bấm được mở sheet công ty, dải số
  Ngày x/30 · Bước x/y · Im n ngày · Cầm trịch, nút Đóng kế hoạch và menu
  `⋯`. Tab **Bước** gom theo bộ phận, nút giao và nút xong ngay trên dòng.
  Tab **Môi giới** là bảng có tiêu đề cột bậc và nút xoá trên từng hàng.
  Tab **Hoạt động**. `/onboarding/[planId]` chỉ còn chuyển hướng về
  `?record=plan:<id>`.
- Sửa: xoá môi giới đúng người được chọn, hộp xác nhận nêu tên; «Quá hạn» so
  theo ngày.
- `CONTEXT.md`: mục cho kế hoạch 30 ngày · bước · bậc · người cầm trịch · ghi danh.

**Ngoài phạm vi:** tab 30 ngày trong sheet Công ty (lượt 2), nhắc (lượt 3),
việc con (lượt 4), kéo thả bảng cột (Never).

**Ngưỡng đo gợi ý cho `opportunity.md`**

- Trên môi trường thật, sau hai tuần: mọi kế hoạch đang chạy có ít nhất một
  bước `completedAt ≠ null` hoặc `assigneeId ≠ null` — số từ `OnboardingStep`.
- Cột Im lặng khác `—` ở ít nhất một hàng danh mục — chứng dữ liệu sống.
- Phiên nghiệm thu Cổng Giá trị của vòng một chạy **sau** lượt này, dùng đúng
  bốn ngưỡng đã ký 2026-09-19.

**Cảnh ngữ cảnh bắt buộc ở design-pass:** chụp `PlanSheet` cạnh `DealSheet`
cùng khổ 1440, cùng dữ liệu One Mount. Vòng một bỏ cảnh này và đó là lý do
lệch.

**AC không được thiếu:** mỗi thủ tục ghi có một AC «đọc lại từ DB thấy đúng»;
một AC khẳng định `imNgay` đổi sau khi đánh dấu xong; một AC cho tab Hoạt động
hiện đúng dòng vết. Vòng một lọt lỗ vì chỉ đo tạo và đọc.

### Lượt 2 — `moi-phia-deu-thay-ke-hoach`

**Ý định:** Kế hoạch hiện ra ở mọi chỗ người đã đứng — tab «30 ngày đầu» trong
sheet Công ty, dòng «trong phễu của …» ở sheet Cá nhân, khối «việc của tôi» trên
màn tổng quan cho bộ phận chuyên môn, và báo theo người / bộ phận cho quản lý;
kèm đường chuyển giao hàng loạt khi một người nghỉ.

**Phủ ô:** trục Vai × quyền của bản quét 22/09; Later #13 · #16 · #37 của bản
quét 19/09; ba lệch nhỏ của sheet Công ty.

**Trong phạm vi**

- `companies.byId` trả tóm tắt kế hoạch; tab «30 ngày đầu» có số đếm, bảng
  Kế hoạch · Ngày · Bước · Đang tắc ở · Cầm trịch, bấm mở `plan:` chồng lên,
  hàng `AddRow` «Tạo kế hoạch» điền sẵn công ty. Chỉ hiện khi công ty có kế
  hoạch hoặc thuộc loại có khuôn.
- Sheet Cá nhân: mục «Where it stands» thêm dòng phễu, bấm mở kế hoạch.
- Tổng quan: khối «Bước được giao cho tôi, sắp hạn / quá hạn» cho người đăng nhập.
- Danh mục: lọc theo người được giao; bảng cột chia theo người được giao.
- Chuyển giao: chọn người đi → người nhận, đổi cầm trịch và mọi bước đang giao,
  ghi vết từng dòng.
- Sửa ba lệch: `None` → `EmptyCellValue` qua bộ dịch; Owner «—» và
  «Unassigned» thống nhất một cách; Open pipeline «—» khi không deal nào có giá.

**Ngoài phạm vi:** đổi dải số chung của sheet Công ty (trình người duyệt quyết
riêng); quyền xem-sửa theo bộ phận (chờ ô phân quyền).

**Ngưỡng đo gợi ý:** tại phiên nghiệm thu, một người của bộ phận đào tạo trả
lời «hôm nay tôi có việc gì» mà không mở danh mục — bấm giờ.

### Lượt 3 — `may-nhac-truoc-nguoi`

**Ý định:** Máy nhắc thay người canh: bước sắp tới hạn nhắc người được giao,
kế hoạch im quá ngưỡng nhắc người cầm trịch kèm việc cần làm sẵn, tới mốc
ngày 7 · 14 · 30 nhắc kiểm; người theo dõi được kế hoạch không phải của mình.

**Phủ ô:** trục Thời gian D2 · D3; Core #20 phần «kèm việc-cần-làm sẵn»; Later
#3 · #11 · #12 · #30 của bản quét 19/09; «theo dõi» của bản quét 22/09.

**Trong phạm vi**

- Việc quét định kỳ sinh `AgentTask` — trí khôn ở `apps/agent`, API chỉ ghi
  hàng. Dùng `ONBOARDING.stale.warnAfterMs` đang khai mà không ai đọc.
- Kênh: Slack qua `agent-actions` đã có; thư qua mailbox nếu đã nối. Không kênh
  nào cũng không ném — theo nếp `capabilities.ts`.
- Mỗi nhắc mang một việc cụ thể («giao bước X», «gọi lại Y») và đường dẫn mở
  đúng `?record=plan:<id>`.
- Theo dõi: bảng `OnboardingWatch` hoặc trường trên `Activity`; người theo dõi
  nhận cùng nhắc.
- Mốc: ngưỡng kiểm tại ngày 7 · 14 · 30 khai trong `onboarding-config.ts`.

**Ngoài phạm vi:** leo thang tự động lên quản lý; nhắc thẳng cho đối tác
(chân trời — cần cổng).

**Hạng:** T2 nếu chỉ thêm loại `AgentTask` và đọc cấu hình; T3 nếu chạm
`tracking`/`mailbox` của API.

**Ngưỡng đo gợi ý:** số ngày im trung vị của kế hoạch đang chạy giảm so với
hai tuần trước lượt — số từ `OnboardingStep.updatedAt`.

### Lượt 4 — `buoc-co-viec-con`

**Ý định:** Một bước lớn chia được việc con có người và hạn riêng; khai được
«việc này xong mới mở việc kia»; đính tài liệu ngay trên bước; khuôn tự điền
sẵn từ bản ghi công ty.

**Phủ ô:** «việc con» · «đính kèm» · «phụ thuộc» của bản quét 22/09; Later
#4 · #5 của bản quét 19/09.

**Điều kiện mở lượt:** sau lượt 1 chạy ít nhất hai tuần, có bằng chứng bước
còn quá to — ví dụ nhiều bước bị đổi hạn hơn một lần, hoặc ghi chú trên bước
đang dùng làm danh sách việc con. Không có bằng chứng thì lượt này lùi, không
tự mở.

**Trong phạm vi:** bảng `OnboardingSubtask` (T3); `dependsOnStepId` trên bước;
đính kèm dùng đường tệp đã có của CRM nếu có, chưa có thì liên kết ngoài;
khuôn có ô điền sẵn từ trường công ty.

**Ngoài phạm vi:** ngày bắt đầu riêng cho bước (Never); biểu mẫu đối tác điền
(chân trời).

### Lượt 5 — `so-lua-va-noi-nen-tang`

**Ý định:** Nối thật với nền tảng OneHub để bốn bậc tự đổ vào phễu; lọc mẫu số
bằng sản lượng trên sàn ngoài; so lứa đối tác này với lứa trước; xuất danh mục;
từ đó nhìn ra việc nào trong 30 ngày dự báo được kết cục.

**Phủ ô:** trục Vào/ra C3 · C4; D4; Later #17 · #18 · #21 · #22 · #23 · #24 ·
#25 · #26 của bản quét 19/09.

**Điều kiện mở lượt:** đội nền tảng có bên gửi cho điểm nhận đã dựng ở vòng
một (`onboarding-ingest.service.ts`); đưa schema lô cho họ đọc **trước** —
giả định #1 trong design doc vòng một vẫn chưa được thử.

**Trong phạm vi:** bên gửi thật; hoàn thành khoá học đọc từ LMS nếu có ống;
báo theo lứa (tháng bắt đầu) với bốn bậc; xuất CSV danh mục; điểm sức khoẻ và
dự báo chỉ khi đã có ≥ 2 tín hiệu máy.

**Ngoài phạm vi:** mọi thứ cần đối tác tự đăng nhập.

## 5. Chân trời — ghi để không bàn lại

| Ô | Vì sao chưa vào lượt nào |
| --- | --- |
| Cổng cho đối tác nhìn tiến độ · vào không cần tài khoản · kế hoạch chung hai bên · biểu mẫu đối tác điền · kho nội dung · theo dõi ai xem gì (#31–#36) | Mở CRM nội bộ cho người ngoài là đổi mô hình quyền, không phải thêm màn. Quyết ở Cổng Đáng riêng, sau khi ô phân quyền xong |
| LMS trong sản phẩm · chứng chỉ · mở quyền lợi theo chứng chỉ (#27–#29) | Nằm ngoài CRM; vào qua ống ở lượt 5 nếu bên kia có |
| Giờ công · chi phí theo bậc · dự báo nguồn lực (#38–#40) | Chưa có ai đòi số này; nhắc lại khi có |
| Bậc phục vụ theo cỡ đối tác (#6) | Chờ có hơn một cỡ đối tác thật |

## 6. Bảng phủ — mọi ô về đúng một chỗ

Bản quét 22/09 (thước Trello):

| Ô | Lượt |
| --- | --- |
| Đánh dấu bước xong · giao người · sửa hạn | 1 |
| Thêm / bỏ / sắp bước trong kế hoạch | 1 |
| Vết ai giao / ai xong lúc nào | 1 |
| Ghi chú trên kế hoạch | 1 |
| Hiện và đổi người cầm trịch | 1 |
| Kế hoạch là record sheet | 1 |
| Xoá môi giới nhầm người · Quá hạn sai ngày | 1 |
| Nợ từ điển `CONTEXT.md` | 1 |
| Tab 30 ngày ở sheet Công ty · dòng ở sheet Cá nhân | 2 |
| «Việc của tôi» cho bộ phận chuyên môn | 2 |
| Báo theo người / bộ phận · ai gánh bao nhiêu | 2 |
| Chuyển giao khi nghỉ việc | 2 |
| Ba lệch nhỏ của sheet Công ty | 2 |
| Nhắc trước hạn · cảnh báo im lặng · theo dõi | 3 |
| Việc con · phụ thuộc · đính kèm | 4 |
| Xuất | 5 |

Bản quét 19/09 (47 ô): Core #1 #2 #7 #14 đã giao ở vòng một; Core #8 #9 #15
#20 hoàn tất ở lượt 1 (và #20 vế nhắc ở lượt 3); Later #3 #11 #12 #30 → 3;
#4 #5 → 4; #13 #16 #37 → 2; #17 #18 #21 #22 #23 #24 #25 #26 → 5; #6 #10
#27–#29 #31–#36 #38–#40 → chân trời; Never #41–#47 giữ nguyên.

## 7. Never — kèm lý do, để khỏi bàn lại

- Kéo thả thẻ giữa cột — bảng cột cố ý chỉ để xem (`d6489181`); cột là bước
  tắc **suy ra**, không phải trạng thái người đặt.
- Nhãn tự do — bộ phận đã là nhãn có nghĩa; nhãn tự do là đường quay lại Sheet.
- Bình chọn, power-up, tự động hoá kiểu Butler trong giao diện — Tác nhân đã
  là chỗ đó.
- Ngày bắt đầu riêng cho bước — hạn một mốc là đủ cho 30 ngày.
- Bảy ô #41–#47 của bản quét 19/09 (đăng ký thương vụ, phân phối lead, hoa
  hồng, MDF, đồng thương hiệu, ký trong cổng, giờ công để xuất hoá đơn).

## 8. Xuyên suốt mọi lượt

- Mỗi thủ tục **ghi** mới có một AC đọc lại từ DB. Vòng một xanh 14 AC mà lọt
  lỗ vì chỉ đo tạo và đọc.
- Design-pass có **cảnh ngữ cảnh**: màn mới chụp cạnh màn cùng họ, cùng khổ.
- Số tunable vào `onboarding-config.ts`; răng `hang-so-o-config.mjs` mở rộng
  quét sang `apps/app` (Known limit đã ký của vòng một).
- Từ mới vào `CONTEXT.md` trước khi lên màn.
- Dữ liệu cá nhân: nhắc và vết đều mang tên người — theo Luật 91/2025/QH15,
  vết là thứ người có quyền yêu cầu xem và xoá; tra lại hiệu lực ở mỗi lượt.
- Trạng thái rỗng · đang tải · lỗi cho mọi màn mới; lỗi nói việc cần làm tiếp.

## 9. Theo dõi — cập nhật sau mỗi hạng mục

Một dòng một lượt; cột Trạng thái chỉ nhận: chưa mở · Cổng Đáng · Cổng Phạm vi ·
đang dựng · Cổng Bằng chứng · đã lên `onehub` · Cổng Giá trị · xong. Ngày là
ngày đổi trạng thái gần nhất. Không sửa dòng cũ, chỉ nối thêm ở cột Ghi chú.

| # | Slug | Trạng thái | Ngày | PR | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 0 | `dieu-phoi-30-ngay-dau` (vòng một) | đã lên `onehub` | 2026-09-21 | #68 · #71 · #74 · #75 | Cổng Giá trị dời tới sau lượt 1. 2026-09-29 soát: hồ sơ `da-cham-boi-thuc-te`; PR mở đầu vòng một là #66 (cột PR thiếu). Chưa có `uat-session.md`; ngưỡng vòng một tính sáu tuần sau ngày bật, đo sớm nhất khoảng 2026-11-02. Vế (c) của lượt 1 chờ phiên này |
| 1 | `ke-hoach-la-mot-ban-ghi` | Cổng Giá trị | 2026-09-22 | #77 | Cổng Phạm vi duyệt (15 tiêu chí, 20 phép đo); Cổng 1.5 duyệt qua /goal; S3 xong; S4 vòng 1 PASS — 20/20 phép đo và bốn lệnh suite xanh, hợp đồng `verified`; Cổng Bằng chứng ký 2026-09-22 (Phan Le Manh): tám giới hạn ghi Known limits, Ngoài-5 (kế hoạch trống không thêm được bước đầu) mở hợp đồng mới. PR #77 merge 2026-09-22 (`cca1cf4b`), production dựng xanh, migration đã chạy. Phiên nghiệm thu dựng ở `scheduled`, HOÃN theo chủ kho 2026-09-22 để làm lượt 2: ngưỡng hai tuần đo sớm nhất 2026-10-06; vế (c) chờ phiên nghiệm thu của vòng một. Phải ghim lại bốn hồ sơ trước PR: dieu-phoi-30-ngay-dau, noi-bon-nut-dieu-phoi, sua-luu-tru-dieu-phoi, chi-quan-tri-sua-duoc-truong. 2026-09-29 soát: trạng thái đổi về từ vựng của bảng (trước ghi «đã giao, chờ Cổng Giá trị»). Phiên nghiệm thu vẫn `scheduled`, đo sớm nhất 2026-10-06; chưa có `stranger-drive.md`. Hợp đồng mới cho Ngoài-5 (kế hoạch trống không thêm được bước đầu, không thêm được bước dưới bộ phận chưa có bước) chưa mở |
| 2 | `moi-phia-deu-thay-ke-hoach` | đã lên `onehub` | 2026-09-22 | #79 | Cổng Đáng ký build (Manh Phan); Cổng Phạm vi đi tiếp ở trạng thái V (T2, 13 tiêu chí, 18 phép đo, phản biện 0 P0, cửa veto mở); S3 xong — năm lệnh xanh, 17 khoá kh2 xanh; S4 vòng 1 PASS (18/18 phép đo đạt, 0 lỗi trong hợp đồng, 9 mục ngoài hợp đồng chờ người quyết), Cổng Bằng chứng: 9 mục ngoài hợp đồng ghi Known limits, để yên cửa veto (Manh Phan) → hồ sơ `machine-cleared`, lưới trước-merge sạch; kế: ghim lại ba hồ sơ đã ký rồi mở PR. Phải ghim lại trước PR: ke-hoach-la-mot-ban-ghi, dieu-phoi-30-ngay-dau, quan-ly-danh-muc-30-ngay. Đã gộp #79 2026-09-22 (`7442c667`) sau khi gộp `onehub` (kit 2.18.1) và ghim lại ke-hoach-la-mot-ban-ghi cùng chính hồ sơ này (hai hồ sơ kia không hoá cũ); phiên nghiệm thu chưa chạy. 2026-09-29 soát: hồ sơ dừng ở `machine-cleared` — Cổng Bằng chứng để yên cửa veto, chưa `signed-off`; chưa có `uat-session.md` |
| 3 | `may-nhac-truoc-nguoi` | đã lên `onehub` | 2026-09-22 | #82 | nhánh `feat/may-nhac-truoc-nguoi` từ `onehub` `7442c667`; Cổng Đáng ký build (Phan Le Manh, 2026-09-22): theo dõi bằng bảng `OnboardingWatch` → T3; thư ngoài phạm vi; ngưỡng chốt như đề xuất. S1 xong 2026-09-22: 12 tiêu chí, 15 phép đo, phản biện context sạch 0 P0 (5 lỗ đã vá), bản mẫu /proto 7 trạng thái. Cổng Phạm vi duyệt (Phan Le Manh); Cổng 1.5 duyệt kế hoạch sáu task; S3 xong — năm lệnh xanh, 14 khoá mn3 xanh; S4 vòng 1 PASS (15/15 phép đo đạt), hợp đồng `verified`; hai điểm yếu phép đo trong hợp đồng (E5 dòng 6, E12) và năm mục ngoài hợp đồng chờ Cổng Bằng chứng. Cổng Bằng chứng trả lại (Phan Le Manh) để sửa E5, E12; S4 vòng 2 PASS, hợp đồng `verified`, 0 lỗi trong hợp đồng, 8 mục ngoài hợp đồng chờ người quyết. Cổng Bằng chứng ký 2026-09-22 (Phan Le Manh): bảy mục ghi Known limits, Ngoài-5 chấp nhận không sửa; kế: gộp onehub, ghim lại, mở PR. Lộ ra khi đo: bốn eval dom của quan-ly-danh-muc-30-ngay đỏ trên onehub từ lượt 1 (mở việc riêng). 2026-09-29 soát: #82 đã gộp 2026-09-22 (`acbb1366`), hồ sơ `signed-off`; migration chạy trong bước dựng crm-api; `APP_URL` của crm-onehub-agent đã có ở Production. Số nền «ngày im trung vị» ở ngày bật không có trong kho — vế (a) của ngưỡng chưa có mốc để so, phải quyết trước 2026-10-06. Mở rộng ngoài lộ trình đã lên: `nhac-qua-zalo` (#94), `tra-loi-tin-nhac` (#144), cả hai `signed-off`. Chưa có `uat-session.md` |
| 4 | `buoc-co-viec-con` | chưa mở | — | — | chỉ mở khi có bằng chứng bước còn quá to |
| 5 | `so-lua-va-noi-nen-tang` | chưa mở | — | — | chờ đội nền tảng có bên gửi |

## 10. Bắt đầu lượt 1 thế nào

1. Nhánh mới từ `onehub` (nhánh `feat/dieu-phoi-30-ngay-dau` đã cũ hơn
   production).
2. Tạo `_acceptance/ke-hoach-la-mot-ban-ghi/opportunity.md` với ngưỡng ở mục 4
   và ký Cổng Đáng (ba trường `stage · decision · decided_by`).
3. `/feature-loop:feature-loop` với câu ý định ở mục 4. T3 nên có Cổng 1.5
   duyệt plan.
4. Sau khi lượt 1 lên production hai tuần: chạy `/acceptance-gate:uat-session`
   cho vòng một với bốn ngưỡng đã ký 2026-09-19.
