# Điều phối 30 ngày đầu của đối tác mới — thiết kế

> Vòng `dieu-phoi-30-ngay-dau`, hạng **T3**, làn **D1**.
> Hồ sơ cơ hội đã ký Cổng Đáng: `_acceptance/dieu-phoi-30-ngay-dau/opportunity.md`.
> Không gian năng lực đã quét: `_acceptance/dieu-phoi-30-ngay-dau/morphological-scan.md`.

## 1. Bối cảnh và phạm vi

Ký xong với một đối tác là hết phần dễ. Ba mươi ngày đầu huy động nhiều bộ phận
của OneHub — đào tạo sử dụng, phổ biến chính sách nền tảng, chuyển dữ liệu — và
hôm nay việc điều phối quãng đó sống trong **Google Sheet một dòng một việc**.

Phạm vi owner chốt 2026-09-19: đây là **sản phẩm nội bộ**; thành công là **cả đội
nghiệm thu và dùng được, thay được Sheet**. Hiệu quả kinh doanh owner đo riêng,
ngoài vòng này.

Ba cơn đau — việc rơi giữa bộ phận, không ai biết đối tác ở đâu, nguội âm thầm —
là bóng của **một** gốc: chưa ai chốt vạch đích, nên không có trạng thái, nên
không ai cầm được, không ai nhìn được, không ai so được.

## 2. Mô hình dữ liệu

**Năm bảng mới. Không sửa bảng nào đang chạy** — không đụng `Activity`, không
đụng `DealStage`, không đụng `FieldDefinition`. Bán kính nổ của một vòng T3 giữ
nhỏ nhất có thể.

| Bảng | Trường chính |
|---|---|
| `Department` | `name` · `position` · `archivedAt` — sao hình `FieldOption` |
| `OnboardingTemplate` | `name` · `partnerType` · `steps Json` · `archivedAt` |
| `OnboardingPlan` | `companyId` · `templateId?` · `startedAt` · `targetDays` · `ownerId` · `closedAt?` |
| `OnboardingStep` | `planId` · `label` · `departmentId` · `assigneeId?` · `dueAt` · `completedAt?` · `position` |
| `OnboardingEnrollment` | `planId` · `contactId` · bốn mốc bậc · `source` · duy nhất `(planId, contactId)` |

`OnboardingTemplate.steps` là **cột Json có schema Zod** ở
`packages/validation/src/onboarding-template.ts`, parse tại chỗ đọc — đúng nếp
`AgentManifest` mà `AGENTS.md` nêu làm mẫu. Bớt một bảng và cả một bộ CRUD.

### Quyết định 2a — kế hoạch treo vào Công ty, nhiều bản theo thời gian

Một công ty onboard được nhiều lượt: mở thêm mảng, đổi gói, làm lại sau khi
nguội. Người tự đặt `startedAt`.

**Hệ quả quan trọng: thiết kế KHÔNG đọc `DealStage`.** Từ điển sản phẩm ghi
`Giai đoạn thoả thuận` là **CHƯA CHỐT NGHĨA** — dữ liệu vẫn mang bảy bước phễu
bán phần mềm thừa kế. Treo đồng hồ 30 ngày vào một enum chưa chốt nghĩa là thừa
kế món nợ đó vào một bảng mới.

### Quyết định 2b — bước được CHÉP từ khuôn, không tham chiếu

Sửa khuôn tháng sau không được động vào kế hoạch đang chạy: người ta đã làm việc
theo bản cũ. Đây là mặc định đúng ở mọi sản phẩm cùng loại, nhưng nó là một lựa
chọn, không phải hiển nhiên.

### Quyết định 2c — bốn bậc lưu bằng MỐC THỜI GIAN, không bằng đúng/sai

`accountAt: DateTime?` thay vì `hasAccount: Boolean`. Rỗng hay không-rỗng vẫn
trả lời được *"đã chưa"*, nhưng còn trả lời được *"khi nào"* và *"cách bậc trước
bao lâu"* — đúng thứ ô Later «việc nào trong 30 ngày dự báo được kết cục» sẽ cần
ở vòng sau. Bây giờ nó miễn phí; chọn boolean là tự cắt mất đường đó.

### Quyết định 2d — bộ phận nằm trên BƯỚC, không suy từ người được giao

Một bước **chưa giao cho ai** vẫn phải thuộc về một bộ phận. Nếu bộ phận suy từ
người được giao thì đúng ca *"việc rơi giữa các bộ phận"* — việc chưa ai nhận —
lại là ca duy nhất hệ thống không biểu diễn được.

Bộ phận là **bảng nhỏ quản trị tự thêm**, không enum: thêm một bộ phận không được
là một migration. Kho chưa có khái niệm đội/phòng ban nào để dùng lại; `WorkspaceRole`
là vai trò **quyền**, trục khác hẳn, không được lẫn.

## 3. API và điểm nhận dữ liệu

Module bám nguyên nếp `campaigns`:

```
apps/api/src/onboarding/
  onboarding-config.ts        mọi số chỉnh được: 30 ngày, trần lô, ngưỡng nguội
  onboarding.contracts.ts
  onboarding.module.ts
  onboarding.router.ts        @UseMiddlewares(AuthMiddleware)
  onboarding.service.ts       Prisma sống ở đây
  onboarding.controller.ts    REST, điểm nhận, sao hình ListingsController
  onboarding-ingest.service.ts
packages/validation/src/
  onboarding-template.ts
  onboarding-ingest.ts        schema của lô — hợp đồng đưa đội nền tảng
```

Hằng số đặt tập trung ở `onboarding-config.ts`, `as const`, theo luật
«Constants belong in one file per area» của `AGENTS.md`.

### Mặt tRPC

| Nhóm | Thủ tục |
|---|---|
| Bộ phận | `list` · `create` · `update` · `reorder` · `archive` |
| Khuôn | `list` · `byId` · `create` · `update` · `archive` |
| Kế hoạch | `list` · `byId` · `createFromTemplate` · `update` · `close` |
| Bước | `create` · `update` · `reorder` |
| Ghi danh | `listByPlan` · `upsert` · `remove` |

`list` nhận `listInput` và trả `{ rows, total, facetCounts }` theo luật
`docs/api.md`. `facetCounts` chính là thứ màn danh mục cần để đếm theo bộ phận
và theo trạng thái.

### Điểm nhận dữ liệu — và một chỗ vênh với tài liệu

`docs/api.md` có tiêu đề mục **«tRPC is the data surface; REST is auth and health
only»**, nhưng `ListingsController` (`@Controller("internal/listings")`) đang là
REST nhận dữ liệu, chạy thật, và tài liệu **không ghi nó là ngoại lệ** — trong
khi có ghi ngoại lệ cho bộ lấy tỷ giá ở mục khác.

Vòng này đi theo tiền lệ đã có, và **sửa `docs/api.md`** để khai hạng mục «điểm
nhận nội bộ» cho cả hai controller. Rẻ, và đúng nếp sửa-thứ-mình-đang-đụng.

`POST /internal/onboarding/ingest`, `Bearer <ONEHUB_PLATFORM_INGEST_SECRET>`,
thân gói parse bằng `parseOnboardingBatch` tại biên.

### Khớp danh tính — luật kho cấm API đoán

`docs/api.md`: *"The API ... does not ... match identities."* Nên điểm nhận khớp
**chỉ bằng mã nền tảng đúng-từng-ký-tự**, giữ trong một trường tự tạo trên Cá
nhân — cùng cơ chế `listing-ingest` đang dùng (nó so `FieldValue.text` với định
danh ngoài trên một trường được chỉ định).

Không khớp thì **không đoán**: `AgentTriggerService` viết một dòng `AgentTask` và
để tác nhân quyết. Phản hồi trả về số khớp và số chuyển cho tác nhân.

Hệ quả phụ đáng ghi: nối nền tảng **không cần cột mới trên `Contact`** và không
cần migration cho việc khớp — chỉ cần một trường tự tạo giữ mã.

### Phát hiện nguội — một phép trừ ngày, không phải một điểm số

Ý ban đầu là «điểm sức khoẻ». `docs/api.md` cấm API `score`, nên thay bằng
**`ngày kể từ lần đổi gần nhất`**, so với ngưỡng khai trong `onboarding-config.ts`.
Kết quả tốt hơn ý định ban đầu: một con số truy được về sự thật, không phải một
điểm số không ai giải thích nổi.

## 4. Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh bên → Danh mục 30 ngày → chọn một đối tác → Hồ sơ kế hoạch → giao bước / đánh dấu xong (điểm ra: quay lại danh mục, đối tác rời khỏi nhóm «đang tắc»)
- Biên: ngày đầu bật tính năng mọi thứ rỗng — chưa có khuôn nào thì chưa tạo được kế hoạch nào; đối tác 80 môi giới làm phễu vượt 50 dòng
- Lỗi & quay lại: tạo kế hoạch khi chưa có khuôn → màn nói thẳng và dẫn sang Cài đặt › Khuôn; lô từ nền tảng sai khuôn → bị từ chối trọn lô, không có nửa vời

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh mục 30 ngày | nhìn ra đối tác nào đang tắc | thanh bên / hồ sơ một kế hoạch |
| Hồ sơ kế hoạch | làm việc của một đối tác: bước và phễu | danh mục / bước và môi giới |
| Cài đặt › Khuôn | soạn bộ bước cho một loại đối tác | Cài đặt / danh mục |
| Cài đặt › Bộ phận | thêm, đổi tên, lưu trữ bộ phận | Cài đặt |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhmuc-loading | Danh mục | khung xương hàng bảng, chữ «Đang tải…» | chờ |
| ST-danhmuc-empty | Danh mục | chưa kế hoạch nào | bấm tạo từ khuôn |
| ST-danhmuc-chuacokhuon | Danh mục | chưa có khuôn nào nên chưa tạo được kế hoạch | đi Cài đặt › Khuôn |
| ST-danhmuc-loi | Danh mục | lỗi kèm việc cần làm tiếp, không chỉ nêu lỗi | thử lại |
| ST-hoso-phieurong | Hồ sơ | chưa ghi danh môi giới nào | thêm tay, hoặc chờ nền tảng |
| ST-hoso-khongkhuon | Hồ sơ | kế hoạch tạo tay, không có khuôn | vẫn thêm bước được |
| ST-khuon-empty | Cài đặt › Khuôn | chưa khuôn nào | tạo khuôn đầu tiên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lọc theo bộ phận và trạng thái, phân trang: **nằm trong query param** (kho đã có `nuqs`)
- Phễu môi giới trên 50 dòng: **ảo hoá** — đối tác 80 môi giới vượt ngưỡng ngay
- Cột số (ngày thứ N/30, số ngày im): `tabular-nums`
- Xoá ghi danh và đóng kế hoạch: có xác nhận hoặc cửa hoàn tác, không làm ngay
- Nhãn dài: cắt có dấu ba chấm, chữ đầy đủ vẫn tới trình đọc màn hình (luật cắt nhãn đã chốt trong `CONTEXT.md`)
- Chữ trạng thái đang tải kết thúc bằng dấu ba chấm; thông điệp lỗi nói việc cần làm tiếp

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| Bảng, huy hiệu, hộp chọn, hộp thoại | dùng | `/packages/ui` đã có, cấm đè style ở chỗ gọi |
| Hiển thị phễu bốn bậc | mở rộng **trong `/packages/ui`** | nếu cần biến thể thì dựng ở nguồn chung, không dựng tại chỗ gọi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không tra mẫu thị trường — luồng hiển nhiên. Kho đã dùng đúng khuôn này cho Công ty, Cá nhân, Thoả thuận; một danh mục nhiều đối tác rồi soi từng cái là cùng một hình.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Đo lường và đường đo

Bốn ngưỡng đã ký ở Cổng Đáng, và chỗ từng ngưỡng được đo:

| Ngưỡng | Ai đo | Cần gì |
|---|---|---|
| Mọi đối tác ký mới điều phối trọn vẹn trong CRM | người, tại phiên nghiệm thu | CRM giữ được trọn vẹn — AC-1, AC-2 |
| Sheet cũ không còn lần cập nhật nào hai tuần cuối | người, đọc lịch sử sửa của Sheet | **không code** — cần quyền xem lịch sử |
| Mỗi bộ phận chấm kín không dưới 4/5 | người, chấm kín trước thảo luận | **không code** |
| Câu «đối tác X đang tắc ở bậc nào» trả lời từ một màn | người, bấm đồng hồ | màn danh mục hiện được — AC-3 |

Hai dòng giữa **không có phép đo máy** — chúng đo hành vi đội ngũ, không đo phần
mềm. Khai ra để tới Cổng Giá trị không ai mở bảng ngưỡng rồi thấy ô trống không
biết vì sao.

**Việc phải làm sớm, không phải lúc nghiệm thu:** xin quyền xem lịch sử sửa của
Google Sheet. Không có nó thì ngưỡng thứ hai không đo được, và lúc đó đã quá muộn
để đổi phép đo.

## 6. Ca lỗi

- Khoá `ONEHUB_PLATFORM_INGEST_SECRET` chưa khai → **503, không ném**; khai trong `.env.example` và `env.validation.ts`
- Lô sai khuôn → **từ chối cả lô**, 400, thông điệp ghim tên trường hỏng; không nhận một phần
- Mục không khớp mã nền tảng → `AgentTask`, API không đoán
- Đóng kế hoạch còn bước dở → cho, ghi ngày đóng, giữ bước dở nguyên trạng; ép làm xong mới đóng là cách nhanh nhất khiến người ta bỏ công cụ
- Đổi tên bộ phận → dữ liệu bước cũ không được mất (khoá ngoài, không chuỗi)

## 7. Ngoài phạm vi

- Cổng cho đối tác nhìn vào — ứng viên số một vòng hai; mở CRM nội bộ cho người ngoài là đổi mô hình quyền
- Loại bản ghi cho trường tự tạo — chỗ co giãn theo loại đối tác đặt ở **khuôn kế hoạch**, không ở danh sách trường
- Vá lỗ quyền sửa trường — ô riêng `chi-quan-tri-sua-duoc-truong`
- Chốt nghĩa `DealStage` — bước của kế hoạch KHÔNG phải giai đoạn thoả thuận
- `Activity.assigneeId` — thiếu sót chung của CRM nhưng thiết kế này không cần; nếp `CampaignTouch` cho thấy bảng nghiệp vụ tự mang trường của nó
- Bậc phục vụ theo cỡ đối tác, điểm sức khoẻ tổng hợp, dự báo ngày hoàn thành

## 8. Rủi ro và giả định

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất |
|---|---|---|---|
| 1 | Schema lô khớp thứ nền tảng OneHub thật sự trả được | Nối thật phải sửa schema và cả bên gửi | Đưa `onboarding-ingest.ts` cho đội nền tảng đọc **trước** khi code |
| 2 | Đội thật sự bỏ Sheet, không ghi song song hai chỗ | Công cụ thành việc cộng thêm | Ngồi cạnh một người gõ một lượt |
| 3 | Có quyền đọc lịch sử sửa của Sheet | Ngưỡng thứ hai không đo được | Hỏi một câu, ngay tuần này |
| 4 | Hai mức quyền hiện có là đủ cho vòng này | Phải chờ ô phân quyền xong mới ship được | Hỏi: có ai không được sửa kế hoạch của người khác không |
