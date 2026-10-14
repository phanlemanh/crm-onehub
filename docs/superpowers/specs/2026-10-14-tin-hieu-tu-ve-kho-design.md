# Tín hiệu tự về kho (TH1) — thiết kế

Hàng TH1 của `docs/plan/lo-trinh-okr.json`, mã K1 · K2 của bản phạm vi `docs/plan/pham-vi-vong-tin-hieu-1410.md`.
Cổng Đáng ký 14/10: build, **lối A**, ngưỡng như đề xuất (`_acceptance/tin-hieu-tu-ve-kho/opportunity.md`).

## Lời hứa

Người gửi tín hiệu hôm nay thì sáng mai thấy trang «Tín hiệu đã gửi» đổi từ «Chờ lấy về» sang «Chờ gom», mà
không ai chạy lệnh. Chữ đổi khi thủ tục kéo về đóng dấu tín hiệu trên máy chủ (LT2), nên lời hứa chỉ cần một lượt
kéo mỗi đêm. Tệp kéo về vào git qua một nhánh hàng chờ, gộp theo lô như mọi PR.

## Đã đọc trước khi chạm

`docs/api.md` (mục tRPC/REST, API keys, Tín hiệu), `docs/settings.md`, `docs/design.md`, `docs/proto.md`,
`.agents/skills/better-auth`, mã `@better-auth/api-key` 1.6.25 đã vá (`dist/index.mjs`: `findApiKeyAndConfig`,
`validateApiKey`, `createApiKey`), `apps/api/src/tin-hieu/**`, `scripts/tin-hieu/keo-ve.ts`, trang Cài đặt → Khoá API.

## Hai phần

### K1 — khoá chỉ kéo tín hiệu

**Chỗ chặn là thư viện, không phải từng thủ tục.** Khoá API hôm nay mở một phiên đăng nhập đầy đủ ở MỌI nơi đọc
phiên: tRPC và cầu REST, trang web của ứng dụng (`apps/app/lib/session.ts`), cầu tác nhân (`/eve/...`), và chính
các đường của thư viện xác thực (một khoá tạo được khoá mới qua `/api/auth/api-key/create`). Chặn theo từng thủ tục
sẽ hở ở đường nào quên.

Thư viện cho nhiều cấu hình khoá, mỗi khoá mang `configId`. Cấu hình thứ hai `keo-tin-hieu` có
`enableSessionForAPIKeys: false`. Khi một khoá của cấu hình này đi vào đầu `x-api-key`, móc trước của thư viện đối
chiếu nó với cấu hình mặc định, thấy `configId` lệch và trả 401 — ở mọi đường đọc phiên, không cần sửa từng đường.
Khoá còn mang `permissions: { tinHieu: ["keoVe"] }` (trường chỉ ghi được từ máy chủ) làm lớp khoá thứ hai.

- `packages/auth`: hằng `KHOA_KEO_TIN_HIEU` (configId, quyền) trong `api-keys.ts`; `auth.ts` khai hai cấu hình
  (cấu hình mặc định giữ nguyên mọi tuỳ chọn hiện có, kể cả `lastRequestUpdateIntervalMs` của bản vá); hàm
  `xacMinhKhoaKeoTinHieu(key)` gọi `auth.api.verifyApiKey` với đúng `configId` và quyền, trả `userId` hay `null`.
- **Đường kéo theo lịch** là một router riêng `tinHieuLich` (một thủ tục `keoVe`, REST `POST /tin-hieu/lich/keo-ve`)
  có middleware riêng `KhoaKeoTinHieuMiddleware`: đọc `x-api-key`, xác minh, đọc vai của chủ khoá ở MỖI lượt
  (`workspaceRoleOf`), đòi quản trị (owner/admin), rồi gọi đúng `TinHieuService.keoVe` của LT2. Đường này chỉ nhận
  khoá chỉ-kéo: khoá thường hay phiên trình duyệt bị từ chối. Router không mang `AuthMiddleware` vì không có phiên —
  middleware riêng là cổng của nó, như hai đường nhận dữ liệu trong `docs/api.md` (mục thêm một dòng).
- Thủ tục `tinHieu.keoVe` của LT2 (khoá thường của quản trị, lượt tay) giữ nguyên.
- Khoá cũ: mọi hàng `apikey` đang có mang `configId = 'default'` (cột `NOT NULL DEFAULT 'default'`); thư viện coi
  `default` và rỗng là cấu hình mặc định nên khoá cũ vẫn mở phiên, không migration.
- Mọi chỗ đọc khoá được liệt kê bằng máy (răng `duong-doc-khoa.mjs`): chỗ nào gọi `getSession`, `verifyApiKey` hay đọc
  đầu `x-api-key` trong `apps/api`, `apps/app`, `apps/agent` phải có một ô trong ma trận E4; chỗ mới chưa có ô là đỏ.
- **Tạo khoá**: `apiKeys.create` nhận thêm `loai: "toan-quyen" | "keo-tin-hieu"` (vắng = toàn quyền). Loại
  `keo-tin-hieu` chỉ quản trị tạo được (403 với vai khác); máy chủ tạo khoá bằng lời gọi phía máy chủ (`userId`,
  `configId`, `permissions`) sau khi đã kiểm phiên và vai. `apiKeys.list` trả thêm `loai`. Thu hồi như cũ.
- Phản hồi kéo về thêm `dongDauLuc` (lúc đóng dấu của lượt này, hay `null` khi không đóng dấu gì) và mỗi tệp mang
  `keoVeLuc`, để lệnh kéo về in «chờ lâu nhất» cho ngưỡng.

### K2 — lịch chạy hằng ngày, nhánh hàng chờ (lối A)

- `.github/workflows/tin-hieu-keo-ve.yml`: `schedule` hai lần mỗi ngày, 21:00Z (04:00 giờ Việt Nam, trước giờ làm) và 09:00Z (16:00) — lúc chờ dài nhất khoảng 12 giờ cộng độ trễ lịch, ngưỡng một ngày còn dư — và `workflow_dispatch`; quyền
  `contents: write`, `pull-requests: write`, không quyền nào khác; một lượt một lúc (`concurrency`). Bước: lấy
  `onehub`, cài phụ thuộc, chạy `bun scripts/tin-hieu/lich.ts`.
- `scripts/tin-hieu/lich.ts` (có test): chạy `chayKeoVe` của LT2 trên cây của đỉnh `onehub` bằng
  `CRM_KHOA_KEO_TIN_HIEU`; lỗi → thoát khác 0, không đụng git. Có tệp mới so với `onehub` → dựng nhánh
  `tin-hieu/keo-ve` = đỉnh `onehub` + một commit chỉ chạm `tin-hieu/crm/**`; so cây với nhánh hàng chờ đang có
  trên origin, khác thì đẩy (ghi đè — nhánh của máy), giống thì thôi. Không có tệp mới → không commit, không đẩy.
  Ghi đè không làm rơi tệp vì thủ tục kéo về trả MỌI tín hiệu còn lại mỗi lần, kể cả tín hiệu đã đóng dấu (LT2);
  E3 và E8 đo đúng quan hệ đó. Cuối mỗi lượt xanh, dù có đẩy hay không: nhánh hàng chờ khác `onehub` mà chưa
  có PR mở (chưa từng có, hay PR trước đã đóng không gộp) → mở PR «Tín hiệu kéo về» vào `onehub`; kho cấm tác vụ mở PR → lượt đỏ
  với câu gọi tên quyền thiếu. Không bao giờ gộp.
- `scripts/tin-hieu/keo-ve.ts`: `CRM_KHOA_KEO_TIN_HIEU` có → đường lịch; chỉ `CRM_API_KEY` → đường cũ; thiếu cả
  hai → mã 2 gọi tên hai biến. Dòng tổng kết thêm `đóng dấu lượt này: n · chờ lâu nhất: x giờ`.
- `_acceptance/config.yaml`: `tin-hieu/crm/**` vào `t1_skip_globs` — PR hàng chờ là T1, bộ phân loại bỏ job nặng.

**Cài một lần (chủ kho, ngoài kho):** tạo khoá chỉ-kéo ở Cài đặt → Khoá API trên production; đặt hai bí mật kho
`CRM_API_URL`, `CRM_KHOA_KEO_TIN_HIEU`; bật «Allow GitHub Actions to create and approve pull requests» (hôm nay
đang tắt). Thiếu bước cuối, lượt vẫn kéo và đẩy nhánh, rồi đỏ ở bước mở PR — người gửi vẫn thấy chữ đổi.

**Giới hạn đã biết:** PR do tác vụ mở bằng `GITHUB_TOKEN` không kích hoạt CI. PR chỉ chạm tệp T1 nên không cần job
nặng; điều phối đóng-mở lại PR để chạy bước nhẹ trước khi đưa vào lô. GitHub báo lượt đỏ qua thư cho người sửa
dòng lịch gần nhất.

## Không làm

Khoá nhiều phạm vi tuỳ chọn · bot tự gộp (lối B) · gom tự chạy (TH2) · trạng thái sống (TH3) · báo tin người gửi
(TB1/S2) · gỡ rác (TH5) · trang Cài đặt hiện lượt kéo gần nhất.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt → Khoá API → «Tạo khoá» → nhập tên, chọn «Khoá dùng để: Chỉ kéo tín hiệu về kho», hạn → «Tạo
  khoá» → hộp khoá vừa tạo hiện khoá một lần kèm câu nói khoá chỉ dùng cho lịch kéo tín hiệu (điểm ra: danh sách,
  dòng khoá mới mang nhãn «Chỉ kéo tín hiệu»).
- Biên: người không phải quản trị không thấy mục «Khoá dùng để» — mọi khoá của họ là toàn quyền như trước.
- Lỗi & quay lại: máy chủ từ chối → thông báo lỗi như hôm nay, tờ tạo khoá còn nguyên chữ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tờ «Tạo khoá API» | đặt tên, chọn loại và hạn cho một khoá mới | nút «Tạo khoá» / hộp khoá vừa tạo |
| Hộp khoá vừa tạo | chép khoá một lần | tờ tạo khoá / danh sách |
| Danh sách khoá | thấy khoá nào làm được gì, thu hồi | Cài đặt / tờ tạo khoá |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tao-khoa-quan-tri | Tờ tạo khoá | mục «Khoá dùng để» hai lựa chọn, mặc định «Mọi việc bạn làm được», mỗi lựa chọn một dòng mô tả | chọn rồi tạo |
| ST-tao-khoa-chon-keo | Tờ tạo khoá | đã chọn «Chỉ kéo tín hiệu về kho»; câu mô tả tờ đổi sang «Chọn khoá dùng để làm gì, rồi đặt tên.» | đặt tên, chọn hạn, tạo |
| ST-tao-khoa-thanh-vien | Tờ tạo khoá | như hôm nay, không có mục «Khoá dùng để» | tạo khoá toàn quyền |
| ST-tao-khoa-dang-tao | Tờ tạo khoá | nút «Tạo khoá» quay, khoá bấm lại | chờ |
| ST-khoa-moi-keo-tin-hieu | Hộp khoá vừa tạo | khoá, nút chép, câu «Khoá này chỉ kéo được tín hiệu về kho — đặt nó vào bí mật của lịch chạy» | chép, đóng |
| ST-danh-sach-co-khoa-keo | Danh sách | dòng khoá có nhãn «Chỉ kéo tín hiệu» cạnh tên | thu hồi nếu cần |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lựa chọn loại là `RadioGroup` hai mục, phím mũi tên đổi mục; tờ dưới `md` giữ nguyên một cột.
- Tên khoá là dữ liệu người nhập: không dịch (`translate="no"`), như hôm nay.
- Theo chuẩn nội `web-design-guidelines` (đã nạp ở S1): mỗi mục radio có nhãn gắn `htmlFor`, nhãn và nút chung một
  vùng bấm; nhóm có tên đọc được (`FieldLegend`/`aria-labelledby`); nhãn loại trên dòng danh sách không xuống dòng
  (`shrink-0`, cột tên có `min-w-0`).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `RadioGroup` + `Field` (`FieldLabel`, `FieldDescription`) | dùng | đã có ở `packages/ui`, bậc 1 |
| `Badge variant="secondary"` | dùng | nhãn loại khoá trên dòng danh sách |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: trang Khoá API đã là danh sách + tờ tạo; vòng này chỉ thêm một trường và một nhãn, không đổi khuôn. Đối chiếu
[NGÀNH: Stripe restricted keys] — chọn phạm vi ngay trong tờ tạo, danh sách ghi loại cạnh tên.
<!-- UX-SPEC-TEMPLATE>>> -->
