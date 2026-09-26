# Khoá API ghi thưa — thiết kế

Ngày 26/09/2026 · hồ sơ `_acceptance/khoa-api-ghi-thua/` · hạng T3.

## Vấn đề

Mỗi yêu cầu gửi `x-api-key` đi qua móc `before` của `@better-auth/api-key` 1.6.25.
Móc đó gọi `validateApiKey` → `claimUsageInDatabase`, và hàm này ghi **hai**
`UPDATE apikey` vào đúng hàng của khoá ở mọi lượt, kể cả khi kho đã đặt
`rateLimit: { enabled: false }`:

1. `evaluateRateLimit` trả `{ type: "skip", lastRequest: now }` khi rate-limit tắt,
   và `consumeRateLimit` ghi giá trị đó.
2. `claimUsageInDatabase` luôn chạy thêm `update({ updatedAt: new Date() })`.

Đo ngày 26/09 trên CSDL test riêng: đúng 600 lần ghi cho 300 lượt dùng khoá, 0 cho
cookie; tại chỗ tốn khoảng 0.3–0.5ms mỗi lượt (hai vòng khứ hồi); 20 kết nối cùng
ghi một hàng chậm khoảng 2.5 lần so với ghi hàng riêng. Trên production (Neon qua
pooler) mỗi lần ghi là một vòng khứ hồi mạng.

Không tuỳ chọn nào tắt được: `deferUpdates` bị bỏ qua ở `storage: "database"`; đặt
null cột rate-limit không lọt nhánh không-ghi vì schema điền mặc định khi đọc;
bản 1.6.33 và 1.7.6 có đoạn này giống hệt. Hãng đã có báo lỗi
(better-auth/better-auth#10921) và một PR đang mở (#10958) chưa được duyệt. Cùng lớp
lỗi ở hệ khác: laravel/sanctum#207 (ghi `last_used_at` mỗi yêu cầu gây deadlock).

## Quyết định

Chủ kho chọn vá trong kho bằng `bun patch`, không chờ hãng và không tự viết lại
móc xác thực.

## Thiết kế

### Bản vá

`patches/@better-auth%2Fapi-key@1.6.25.patch`, sinh bằng `bun patch` rồi
`bun patch --commit`, ghi `patchedDependencies` vào `package.json` gốc và
`bun.lock`. Bản vá đổi `dist/index.mjs` và kiểu trong `dist/*.d.mts`:

- Tuỳ chọn mới của plugin: `lastRequestUpdateIntervalMs?: number`. Vắng thì mọi
  hành vi y như bản gốc.
- `evaluateRateLimit`, hai nhánh `skip` có `lastRequest: now` (rate-limit tắt toàn
  cục, hoặc tắt riêng cho khoá): khi có tuỳ chọn và `apiKey.lastRequest` khác null
  và còn mới hơn ngưỡng, trả `lastRequest: null` — nhánh «không ghi» mà
  `consumeRateLimit` đã có sẵn. Ngược lại trả `now` như gốc.
- `claimUsageInDatabase`: khi có tuỳ chọn và `storage` là `database`, bỏ lần
  `update({ updatedAt })` cuối và trả hàng đang có (hàng đọc lúc đầu, hoặc hàng mà
  lệnh ghi phía trên trả về).
- Đường secondary-storage: phần bỏ ghi `lastRequest` trong `evaluateRateLimit`
  cũng áp lên nó khi có tuỳ chọn, vì hàm này không biết kiểu lưu. Kho không cấu
  hình `secondaryStorage`, và một test (AC-11) đỏ nếu ai bật nó — chủ kho chọn thu
  lời hứa về cấu hình thật của kho thay vì rào thêm trong bản vá (dừng-vá, 26/09).
- Không đổi cách đếm của nhánh rate-limit bật (`start` · `reset` · `increment` ·
  `deny`), không chạm `consumeRemaining`. Lần
  đóng dấu `updatedAt` thì bỏ mỗi khi có tuỳ chọn ở `storage: "database"`, bất kể
  rate-limit bật hay tắt.

Khi đã quá ngưỡng, lệnh ghi là `UPDATE` thường, không có chốt điều kiện: vài yêu
cầu đồng thời đúng lúc qua ngưỡng có thể cùng ghi — tối đa một đợt mỗi phút cho
mỗi khoá.

### Cấu hình ở phía kho

`packages/auth/src/api-keys.ts` thêm `API_KEY_USAGE = { lastRequestIntervalMs }`
bằng một phút, suy từ một hằng đơn vị, `as const`. `packages/auth/src/auth.ts`
truyền nó vào `apiKey({ lastRequestUpdateIntervalMs: … })`.

### Hệ quả nhìn thấy

Cột «Dùng lần cuối» ở Cài đặt → Khoá API (`api-keys-table.tsx`) trễ tối đa một
phút. `apikey.updatedAt` thôi đổi theo lượt dùng; kho không đọc cột này ở đâu
(`api-keys.service.ts` chỉ chọn `createdAt` và `lastRequest`).

### Rủi ro đã nhận

Lần đóng dấu cuối của thư viện cũng là phép kiểm «hàng còn không»: khoá bị **xoá
cứng** giữa lúc đọc và lúc ghi thì yêu cầu bị từ chối. Bỏ lần ghi thì khe vài
mili-giây đó cho lọt một yêu cầu. Khoá bị **tắt** không bị ảnh hưởng — trạng thái
bật được kiểm ở lượt đọc — và kho gỡ thành viên bằng cách tắt khoá, không xoá.

### Chống trôi

`patchedDependencies` khoá theo phiên bản chính xác. Ai nâng `@better-auth/api-key`
thì một test so phiên bản đã cài với khoá bản vá phải đỏ, nói rõ phải làm lại bản
vá — không để thư viện im lặng quay về ghi mỗi lượt.

### Đường cài của bản chạy thật

`patchedDependencies` chỉ có hiệu lực khi cài bằng bun theo `bun.lock`. CI chạy
`bun install --frozen-lockfile`. Bản Vercel của `apps/api` đóng gói
`@better-auth/api-key` từ `node_modules` đã cài (`apps/api/scripts/build-func.mjs`
không để gói này ngoài `EXTERNALS`), và Vercel chọn bun khi thấy `bun.lock` — giả
định, ghi ở Notes của contract. Test chống trôi đo mã đã cài có tuỳ chọn mới.

### Điều kiện gỡ

Khi hãng đóng better-auth#10921 bằng một bản sửa không ghi mỗi lượt lúc rate-limit
tắt, nâng thư viện và bỏ bản vá. Mục mới trong `docs/api.md` ghi điều kiện này.

## Kiểm chứng

- Tích hợp ở `apps/api/test/khoa-api-ghi-thua.spec.ts` (CSDL test riêng,
  `createApp`, tRPC `contacts.list` bằng khoá thật): lượt đầu ghi `lastRequest`;
  lượt thứ hai không đổi `lastRequest` lẫn `updatedAt`; biên ngưỡng hai phía (cũ
  hơn ngưỡng một giây thì ghi, mới hơn một giây thì không); khoá tắt, khoá hết hạn
  vẫn bị từ chối dù `lastRequest` còn mới.
- Thư viện ở `packages/auth/test/khoa-api-ghi-thua.spec.ts` (adapter bộ nhớ, đếm
  lệnh `update` lên `apikey`): cùng dựng, không tuỳ chọn thì 2 lệnh mỗi lượt, có
  tuỳ chọn thì 0 — cặp hai chiều; rate-limit bật vẫn đếm và vẫn chặn; chống trôi.

## Ngoài phạm vi

- Rate-limit lõi của better-auth xoá hàng đếm sau 60 giây — phiên quên mật khẩu (#104).
- Phần chênh 4ms so với 1.5ms của test chập chờn `go-la-cat-quyen > khoa-con-bat`.
- Giao diện cột «Dùng lần cuối».
- Gửi bản sửa lên hãng.
