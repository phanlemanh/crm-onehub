---
schema_version: 1
feature: Xác minh khoá API không ghi CSDL mỗi lượt — vá @better-auth/api-key để lastRequest chỉ ghi khi cũ quá một phút và bỏ lần đóng dấu updatedAt
slug: khoa-api-ghi-thua
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-09-26
design_doc: docs/superpowers/specs/2026-09-26-khoa-api-ghi-thua-design.md
---

# Acceptance Contract: khoa-api-ghi-thua

## Context

Mỗi yêu cầu gửi `x-api-key` làm `@better-auth/api-key` 1.6.25 ghi hai `UPDATE
apikey` (`lastRequest` và `updatedAt`) vào hàng của khoá, kể cả khi kho tắt
rate-limit. Đo 26/09: 600 lần ghi cho 300 lượt. Không cấu hình nào tắt được, bản
1.7.6 giống hệt, better-auth#10921 còn mở. Chủ kho chọn vá trong kho bằng `bun
patch`: thêm tuỳ chọn `lastRequestUpdateIntervalMs`, kho đặt một phút. Thiết kế:
`docs/superpowers/specs/2026-09-26-khoa-api-ghi-thua-design.md`.

Source input: prompt

## Criteria

- AC-1: Given một khoá mới tạo cho một thành viên, `lastRequest` null, When gọi tRPC `contacts.list` bằng khoá đó hai lần liền, Then cả hai lượt trả 200, lượt đầu ghi `lastRequest` khác null, và sau lượt thứ hai cả `lastRequest` lẫn `updatedAt` của hàng giữ đúng giá trị đọc được sau lượt đầu.
- AC-2: Given khoá đó với `lastRequest` đặt thẳng trong CSDL, When gọi `contacts.list` một lượt, Then nếu `lastRequest` cũ hơn `API_KEY_USAGE.lastRequestIntervalMs` cộng một giây thì hàng nhận `lastRequest` không sớm hơn lúc bắt đầu lượt; nếu mới hơn ngưỡng trừ một giây thì `lastRequest` giữ nguyên — ngưỡng đọc từ hằng của `@crm/auth`, không gõ số.
- AC-3: Given một `betterAuth` dựng với adapter bộ nhớ, rate-limit tắt, và phép đếm lệnh `update` lên model `apikey`, When xác minh cùng một khoá ba lượt qua `getSession` với header khoá, Then bản plugin KHÔNG có `lastRequestUpdateIntervalMs` đếm đúng 2 lệnh mỗi lượt, còn bản có tuỳ chọn đếm 1 lệnh ở lượt đầu và 0 ở hai lượt sau — cùng dựng, hai chiều.
- AC-4: Given cùng dựng với rate-limit bật (tối đa 2 lượt trong cửa sổ một phút) và có `lastRequestUpdateIntervalMs`, When xác minh ba lượt, Then lượt thứ ba bị từ chối mã `RATE_LIMITED` và `requestCount` của hàng bằng 2 — bản vá không nới rate-limit.
- AC-5: Given hai khoá tạo qua `auth.api.createApiKey`, mỗi khoá đã gọi `contacts.list` một lượt trả 200 nên `lastRequest` còn trong ngưỡng, When khoá thứ nhất bị đặt `enabled = false` và khoá thứ hai bị đặt `expiresAt` về quá khứ rồi mỗi khoá gọi lại, Then cả hai lượt tRPC trả 401, và `auth.api.getSession` với header của từng khoá ném lỗi mã `KEY_DISABLED` và `KEY_EXPIRED` tương ứng — ngưỡng ghi không làm tắt phép kiểm bật/hết hạn.
- AC-6: Given `package.json` gốc và gói `@better-auth/api-key` đã cài, When chạy phép chống trôi, Then `patchedDependencies` có đúng một khoá `@better-auth/api-key@<phiên bản đã cài>`, tệp vá nó trỏ tới tồn tại, `bun.lock` ghi cùng khoá, và `dist/index.mjs` của gói đã cài (nơi cả bản build Vercel lẫn bản chạy thử lấy mã) có tuỳ chọn `lastRequestUpdateIntervalMs`; cùng hàm so với một phiên bản lệch thì đỏ với thông điệp ghim `nâng @better-auth/api-key mà chưa làm lại bản vá khoa-api-ghi-thua`.
- AC-7: Given `docs/api.md`, When đọc mục về khoá API, Then có một đoạn nêu `patchedDependencies`, `lastRequestUpdateIntervalMs`, điều kiện gỡ gắn với better-auth#10921, và việc phải làm lại bản vá khi nâng thư viện.
- AC-8: Given toàn cây tại HEAD, When chạy suite (`bun run test`), kiểm kiểu, lint, lint:slop và build không dùng bộ nhớ đệm, Then cả năm thoát 0.
- AC-9: Given tệp vá, mã cấu hình ở `packages/auth` và design doc, When người đọc soi, Then trên cấu hình của kho (lưu khoá bằng CSDL, không có `secondaryStorage`) bản vá chỉ đổi hai việc và chỉ khi có tuỳ chọn: hai nhánh `skip` của `evaluateRateLimit` bỏ ghi `lastRequest` còn trong ngưỡng, và `claimUsageInDatabase` bỏ lần đóng dấu `updatedAt`; không đổi cách đếm của nhánh rate-limit bật, không chạm `consumeRemaining`, không thêm chú thích vào mã; đường secondary-storage có bị chạm (tuỳ chọn cũng áp lên nó) nhưng kho không dùng, và AC-11 giữ điều kiện đó bằng máy. (judgment)
- AC-10: Given mục mới về bản vá trong `docs/api.md`, When người đọc chỉ đọc mục đó, Then trả lời được hai câu: khi nào gỡ bản vá, và phải làm gì khi nâng `@better-auth/api-key`. (judgment)

- AC-11: Given tuỳ chọn plugin khoá API thật của kho, tách thành hằng `API_KEY_PLUGIN_OPTIONS` (kiểu `ApiKeyConfigurationOptions`) mà `auth.ts` truyền nguyên vào `apiKey()`, When chạy phép kiểm đường lưu, Then `storage` không phải `secondary-storage` và không có `customStorage` — hai công tắc duy nhất mà thư viện dùng để rẽ sang đường secondary-storage; cùng hàm kiểm với bản chép của chính hằng đó có `storage: "secondary-storage"`, và với bản chép có `customStorage`, thì cả hai đỏ với thông điệp ghim `plugin khoá API đi đường secondary-storage — bản vá khoa-api-ghi-thua đổi cả đường đó, xem lại AC-9`; bộ nhớ đệm chung `auth.options.secondaryStorage` không tham gia phép kiểm.
## Coverage

Quét bằng `morphological-scan` (preset test-matrix). Chân sản phẩm: `packages/auth/src/auth.ts` [SUY-TỪ-REPO: packages/auth/src/auth.ts] — rate-limit plugin tắt, khoá không đặt `remaining`. Chân ngành: laravel/sanctum#207 [NGÀNH: Laravel Sanctum — ghi `last_used_at` mỗi yêu cầu gây deadlock, cách lách là bỏ ghi khi chỉ cột đó đổi] và better-auth#10921 [NGÀNH: better-auth].

- Trục rate-limit của khoá: tắt toàn cục (AC-1, AC-2, AC-3, AC-5) | tắt riêng khoá (Later) | bật (AC-4) [thước CE: ba nhánh đầu của `evaluateRateLimit` trong `dist/index.mjs` 1.6.25]
- Trục tuổi `lastRequest` lúc đọc: null (AC-1, AC-3) | mới hơn ngưỡng (AC-1, AC-2, AC-3, AC-5) | cũ hơn ngưỡng (AC-2) [thước CE: phép so ngưỡng có đúng ba miền]
- Trục tuỳ chọn: có (AC-1…AC-5) | vắng (AC-3) [thước CE: tuỳ chọn là `number | undefined`]
- Lớp xuyên suốt, trạng thái khoá: bật (AC-1…AC-4) | tắt · hết hạn (AC-5) [thước CE: `validateApiKey` kiểm `enabled` và `expiresAt` trước `claimUsageInDatabase`]

Không gian nhỏ (khoảng 10 ô có nghĩa), nên Core vượt mốc 20% của skill — cố ý, vì mỗi ô Core là một nhánh mã riêng.

Later: rate-limit tắt riêng khoá (`rateLimitEnabled = false`) — cùng một phép sửa với tắt toàn cục, kho không dùng. Khoá có `remaining` — kho không đặt. Nhiều yêu cầu đồng thời đúng lúc qua ngưỡng — chấp nhận ghi trùng, xem sổ quyết định.

Never: secondary-storage — kho không cấu hình; AC-11 đỏ nếu ai bật nó, vì bản vá cũng đổi đường đó.

## Out of scope

- Rate-limit lõi của better-auth xoá hàng đếm sau 60 giây — việc của phiên quên mật khẩu (#104).
- Phần chênh 4ms so với 1.5ms của test chập chờn `go-la-cat-quyen > khoa-con-bat`.
- Đổi giao diện cột «Dùng lần cuối» ở Cài đặt → Khoá API.
- Gửi bản sửa lên hãng.
- Chốt điều kiện chống ghi trùng khi nhiều yêu cầu cùng qua ngưỡng.

## Notes

Không có bề mặt web. Không sinh eval thiết kế.

Ước lượng pin bị chạm (26/09, theo `paths` của `evals.yaml`, so với 85 hồ sơ
`signed-off`/`machine-cleared`/`verified`): 7 hồ sơ khớp tệp sẽ đổi —
`chu-cuoi-cung-tien-de`, `go-la-cat-quyen-that`, `go-thanh-vien-phai-giu-duoc`,
`khoa-cu-khong-mo-khoa-moi`, `neo-dan-so-khong-cung`, `thuoc-o-soan-don-dep`,
`vai-chi-okr` — và 30 hồ sơ có eval không khai `paths`. `package.json` gốc và
`bun.lock` không khớp `paths` của hồ sơ nào. Soát 26/09: chỉ
`apps/api/test/go-la-cat-quyen.spec.ts` chạm `lastRequest` (đặt giá trị cũ vài ngày
để thử thứ tự), không test hay răng nào đọc `lastRequest`/`updatedAt` của khoá sau
một lượt dùng. Pin hoá cũ được ghim lại ở lượt merge theo luật điều phối (làn
`repin-lane` chạy mọi eval máy của từng hồ sơ bị chạm).

[GIẢ ĐỊNH] Vercel cài `apps/api` bằng bun theo `bun.lock` (kho có `bun.lock`,
`packageManager: bun@1.3.12`), nên `patchedDependencies` được áp trước
`build-func.mjs` đóng gói thư viện. AC-6 đo mã đã cài tại chỗ, không đo bản đã
triển khai.

Giá trị còn lại của bản vá, theo số đo 26/09 trên CSDL test riêng (trước khi vá):
hai `UPDATE apikey` mỗi lượt dùng khoá tốn khoảng 0.3–0.5ms/lượt tại chỗ (300 lượt
tuần tự: p50 3.42ms có ghi, 3.04ms bỏ ghi); 20 kết nối cùng ghi một hàng chậm khoảng
2.5 lần so với ghi hàng riêng (p50 3.4ms so 1.4ms). Trên production mỗi lần ghi là
một vòng khứ hồi tới Neon — chưa đo. Cái bản vá mua là bớt hai lần ghi và bớt tranh
khoá hàng khi một khoá bị gọi dày, không phải một cải thiện lớn về độ trễ tại chỗ.
