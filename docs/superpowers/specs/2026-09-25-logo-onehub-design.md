# Logo OneHub thay logo Comp AI — thiết kế

Ngày: 2026-09-25 · Hạng: T2 · Hồ sơ: `_acceptance/logo-onehub/`

Thiết kế này chủ kho đã duyệt trong phiên brainstorm sáng 25/09. Tài liệu ghi lại bản
đó, cộng những gì phiên S1 đo được trước khi viết hợp đồng.

## Vì sao

Trong app, logo ở thanh trên cùng, trang đăng nhập, tab Agent, bộ favicon và tên trong
manifest («Comp AI CRM») vẫn là của hãng. CRM là sản phẩm nội bộ của OneHub, nên người
dùng đang thấy thương hiệu của một công ty khác ở mọi màn.

## Nguồn và phép dựng lại

Chủ kho chỉ có PNG (`~/Documents/Share/logo/`), không có vector gốc. Hai file mark bị
lệch tâm: lề phải 76px, lề trái 0px. Vì thế không dùng thẳng PNG, mà **dựng lại mark bằng
hình học** rồi đo độ trùng.

Phép dựng: sáu lục giác đều, đỉnh nhọn hướng lên, bo góc, đặt cách đều 60° quanh một tâm.
Lỗ hình sao sáu cánh ở giữa là khoảng trống tự nhiên giữa sáu lục giác, không phải một hình
riêng. Các tham số khớp bằng tối ưu toạ độ trên ảnh `logo-mark.png` (625×622):

| Tham số | Giá trị (đơn vị px của PNG) |
|---|---|
| Tâm vòng | (274.46, 310.67) |
| Bán kính vòng (tâm → tâm lục giác) | 201.44 |
| Bán kính ngoại tiếp lục giác | 115.61 |
| Bán kính bo góc | 39.06 |
| Góc xoay | 0 (đo được −0.02°, bỏ) |

Độ trùng alpha (IoU mềm, cùng lưới 625×622): **99,72%** với `logo-mark.png`, và 99,72%
với phần mark của `logo-horizontal.png` ở đúng toạ độ đó. Ngưỡng chủ kho đặt là 98%.

Dải màu khớp bằng bình phương tối thiểu trên mọi điểm ảnh đục: kênh R ≈ 0–2, kênh B ≈ 255
không đổi, kênh G tuyến tính theo toạ độ (sai số trung bình 2,5/255). Nên đây là **một dải
tuyến tính hai điểm dừng** `#0045FF` → `#02D7FF`, hướng từ dưới-trái lên trên-phải. Tính
theo tâm mark, điểm đầu ở (−159, 228) và điểm cuối ở (157, −226), `userSpaceOnUse`.

Chữ «OneHub» không dựng lại bằng font (không biết font gốc, đoán font là rủi ro). Nó được
**dò theo nét** trên `logo-horizontal.png`: đường đồng mức alpha 0,5 nội suy dưới điểm ảnh,
rồi rút gọn đa giác với sai số 0,4px trên lưới 2048px. Kết quả: 9 đường khép kín, khoảng 700
đỉnh, IoU 99,6% với phần chữ của PNG. Chủ kho duyệt bằng mắt tại Cổng 1 qua ảnh xem trước.

## Thành phần trong `packages/ui`

- `src/lib/logo-onehub.ts` — nguồn duy nhất: `viewBox`, path của mark, path của chữ, hai
  điểm dừng màu, toạ độ dải màu, toạ độ mark trong bản ngang. Component, script sinh icon và
  test đều đọc từ đây. Là `lib/*` nên xuất được qua `@crm/ui/lib/logo-onehub`.
- `src/components/logo.tsx` — `Logo` mặc định **giữ nguyên tên và cách gọi** (nhận props
  SVG), để mọi chỗ gọi không phải sửa và xung đột merge với bản của hãng chỉ nằm trong file
  này. Vẽ mark có dải màu, căn đúng tâm trong `viewBox` vuông `-311 -311 622 622`. `id` của
  dải màu lấy từ `useId()`, vì nhiều logo cùng hiện trên một trang (thanh trên cùng và tab
  Agent). Mặc định `role="img"` và `aria-label="OneHub"`; chỗ gọi truyền `aria-hidden` thì
  vẫn đè được như hôm nay.
- `src/components/logo-lockup.tsx` — `LogoLockup`: mark kèm chữ OneHub, `viewBox 0 0 2048
  622`. Chữ dùng `fill="currentColor"`, nên một component dùng được cả giao diện sáng lẫn tối.

Màu mark giống nhau ở cả hai giao diện, theo đúng luật «một màu thương hiệu là một màu» của
`docs/design.md`. Màu nút chính `#006B4F` giữ nguyên — vòng này chỉ thay logo và icon.

## Bộ icon

Script `packages/ui/scripts/logo-icons.ts` (chạy bằng bun) lấy SVG bằng
`renderToStaticMarkup` của chính `Logo` — cùng component app đang vẽ, không có bản vẽ song
song — rồi dùng `sharp` để xuất PNG. Phép đo IoU và căn tâm cũng raster đúng chuỗi đó, nên
component sai là phép đo đỏ. File `.ico` tự ghép (định dạng ICO chứa PNG: phần đầu, bảng
mục, dữ liệu), không thêm thư viện. `sharp` 0.34.5 đã có trong `bun.lock` (qua Next) nhưng
chưa là phụ thuộc trực tiếp của gói nào, nên thêm vào `devDependencies` của `@crm/ui`.

| File | Cỡ | Nền | Ghi chú |
|---|---|---|---|
| `apps/app/app/favicon.ico` | 16, 32, 48 | trong suốt | Next.js ưu tiên file này |
| `apps/app/public/favicon.ico` | 16, 32, 48 | trong suốt | giống từng byte với file trên |
| `apps/app/public/favicon.svg` | vector | trong suốt | |
| `apps/app/public/favicon-96x96.png` | 96 | trong suốt | |
| `apps/app/public/apple-touch-icon.png` | 180 | trắng, đục | iOS tô đen phần trong suốt |
| `apps/app/public/web-app-manifest-192x192.png` | 192 | trắng, đục | `maskable`: mark nằm trong vòng tròn bán kính 40% |
| `apps/app/public/web-app-manifest-512x512.png` | 512 | trắng, đục | như trên |

Mark có sáu đỉnh ngoài cách tâm khoảng 311 đơn vị. Để lọt vòng an toàn bán kính 40% của
icon `maskable`, khung icon là 778 đơn vị (311 / 0,4).

Chạy `bun packages/ui/scripts/logo-icons.ts --external <thư mục>` thì xuất thêm ba PNG cho
chủ kho tự thay ngoài kho, và KHÔNG ghi gì vào kho:

| File | Cỡ | Căn cứ |
|---|---|---|
| `slack-app-icon-1024.png` | 1024 | Slack nhận icon app 512–2000px |
| `zalo-bot-avatar-512.png` | 512 | Zalo OA tối thiểu 240×240, vuông, cắt tròn — mark nằm trong vòng 80% |
| `google-oauth-logo-120.png` | 120 | Màn xin quyền Google OAuth: vuông 120×120, dưới 1MB |

Hai PNG gốc (`logo-mark.png`, `logo-horizontal.png`) chép vào
`packages/ui/scripts/logo-goc/` để phép đo IoU chạy lại được trên mọi máy, không phụ thuộc
thư mục cá nhân của chủ kho.

Phép kiểm «icon trong kho khớp nguồn» sinh lại cả bộ trong bộ nhớ rồi so điểm ảnh giải mã,
cho lệch mỗi kênh tối đa 2 và tối đa 0,5% số điểm ảnh: bộ raster của `sharp` có thể lệch khử
răng cưa giữa Mac arm64 (nơi sinh) và linux x64 (CI).

`apps/app/public/site.webmanifest`: `name` thành «OneHub CRM», `short_name` thành «OneHub».

## Chỗ dùng

`Logo` tự đổi theo component, chỉ cần kiểm: `app-header.tsx` (thanh trên cùng và khung chờ
lúc tải), `crm/agent-panel.tsx` (màn trống của tab Agent và ảnh đại diện trợ lý),
`agent-builder/agent-scope-badges.tsx`, `proto/_modules/ban-mau-okr/phan-chung.tsx`.

Hai file `settings/connections/page.tsx` và `add-connection-dialog.tsx` trong danh sách của
phiên brainstorm **không** import `Logo`: chúng chỉ dùng `brand-logos/*`. Không có gì để đổi
ở đó.

`auth-shell.tsx` là chỗ duy nhất sửa code: cả ba chỗ đang đặt `Logo` đổi sang `LogoLockup`
(góc trên của nửa trái, ô giữ chỗ vô hình để hai nửa thẳng hàng, và phần đầu form). Trên
điện thoại nửa trái bị ẩn, nên phần đầu form là chỗ duy nhất có tên thương hiệu.

Trang landing của hãng (`components/landing/*`, đang tắt sau `IS_MARKETING`) cũng import
`Logo`, nên nó đổi theo mà không cần sửa file nào. Không mở lại landing trong vòng này.

## Không đụng

- `apps/app/components/landing/*`, `app/(landing)/page.tsx`.
- `packages/ui/src/components/brand-logos/`.
- Logo của công ty đối tác (`favicon.service`, `packages/db/src/favicon.ts`).
- Chuỗi «Comp AI» là tên bot Slack (`slack-channels.tsx`, `lib/agent-handoff.ts`): đó là tên
  hiển thị của app Slack, đổi khi chủ kho đổi tên app ở Slack, không phải logo.
- Màu `--primary`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: người mở trang đăng nhập → thấy mark và chữ OneHub → đăng nhập → thanh trên cùng
  mang mark OneHub → mở một hồ sơ, tab Agent → màn trống mang mark OneHub (điểm ra: làm việc
  như thường, tab trình duyệt mang favicon OneHub).
- Biên: trang đang tải (khung chờ của thanh trên cùng) vẫn mang mark; thêm app vào màn hình
  chính iOS hoặc Android thì icon có nền trắng, không bị cắt mất cánh.
- Lỗi & quay lại: không có luồng lỗi mới — logo là hình tĩnh, không tải từ mạng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Đăng nhập | nói đây là CRM của OneHub và mời đăng nhập | URL / trang chính workspace |
| Thanh trên cùng | đưa về trang chính workspace | mọi trang trong app / trang chính |
| Tab Agent (màn trống) | mời hỏi trợ lý | hồ sơ công ty hay liên hệ / hội thoại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dangnhap-rong | Đăng nhập, khổ ≥1024 | chữ OneHub kèm mark ở góc nửa trái và ở đầu form, chữ màu sáng trên nền tối | đăng nhập |
| ST-dangnhap-dienthoai | Đăng nhập, khổ 390 | nửa trái ẩn; đầu form mang mark và chữ OneHub | đăng nhập |
| ST-thanhtren-sang | Thanh trên cùng, giao diện sáng | mark dải xanh cỡ 20px cạnh tên workspace | bấm về trang chính |
| ST-thanhtren-toi | Thanh trên cùng, giao diện tối | cùng mark, cùng màu | bấm về trang chính |
| ST-thanhtren-dangtai | Khung chờ thanh trên cùng | mark cạnh một thanh xương | chờ |
| ST-agent-trong | Tab Agent, chưa có hội thoại | mark 16px trong ô vuông tương phản, tiêu đề và gợi ý | bấm một gợi ý |
| ST-trinhduyet-tab | Tab trình duyệt | favicon mark 16/32px | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mọi logo là SVG nội tuyến, không tải từ mạng, không gây nhảy bố cục: cỡ do `className`
  của chỗ gọi đặt như hôm nay.
- `role="img"` + `aria-label="OneHub"` mặc định; chỗ gọi đặt `aria-hidden` (huy hiệu phạm vi
  agent) thì trình đọc màn hình bỏ qua như cũ. Chỗ bọc trong liên kết đã có `aria-label` riêng
  của liên kết.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Logo` | mở rộng (thay hình, giữ API) | 8 chỗ gọi và bản của hãng dùng đúng tên này |
| `LogoLockup` | tạo, trong `packages/ui` | bậc 1–4 của `docs/design.md` không có logo của OneHub — logo không phải thứ ReUI hay shadcn có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: vòng này không đổi bố cục màn nào, chỉ thay hình trong chỗ sẵn có — không có hai khuôn
khả dĩ để phải tra mẫu; ghi khuôn của trang đăng nhập hiện hữu.
<!-- UX-SPEC-TEMPLATE>>> -->
