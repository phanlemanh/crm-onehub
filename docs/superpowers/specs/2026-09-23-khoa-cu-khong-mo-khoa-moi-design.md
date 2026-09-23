# Khoá cũ không mở được khoá mới — thiết kế

Hồ sơ: `_acceptance/khoa-cu-khong-mo-khoa-moi/` · hạng T3 · 23/09/2026
Nguồn: Cổng 2 của `go-la-cat-quyen-that` (PR #97), quyết định
`d-20260923T141901Z-14` — «Ngoài-1: mở hợp đồng mới».

## Vấn đề, đã chứng bằng chạy thật

Hồ sơ nguồn hứa: người không còn là thành viên không tạo, không sửa, không bật lại
được khoá API qua endpoint `/api/auth/api-key/*` của Better Auth. Phép kiểm
(`canhKhoaApi`) nằm trong `hooks.before` chung của Better Auth và đọc phiên bằng
`getSessionFromCtx` — tức chỉ thấy phiên cookie.

Better Auth 1.6.25 chạy móc chung của người dùng **trước** móc của plugin
(`getHooks` trong `dist/api/dispatch.mjs`). Móc của plugin `api-key` mới là chỗ
dựng phiên từ header `x-api-key` (vì `enableSessionForAPIKeys: true`). Nên một lời
gọi chỉ mang header khoá, không cookie, đi qua phép kiểm lúc chưa có phiên nào —
`if (!session) return;` — rồi plugin dựng phiên từ khoá và endpoint thực thi.

Bài kiểm mới trong `apps/api/test/go-la-cat-quyen.spec.ts`, chạy 23/09 trên cơ sở
dữ liệu thật của lượt kiểm, người ngoài kho giữ một khoá còn bật (dòng `member`
xoá trực tiếp — đúng trạng thái của người bị gỡ trước ngày có bản vá nguồn):

| Lời gọi | Đo được |
|---|---|
| `POST /api/auth/api-key/create`, chỉ header khoá | 200, thêm 1 dòng khoá |
| `POST /api/auth/api-key/update` bật lại một khoá đã tắt, chỉ header khoá | 200, khoá đã tắt bật lại |
| `POST /api/auth/api-key/update` đổi tên chính khoá đó | 200, tên đổi |
| Cookie của một thành viên + header khoá của người ngoài kho, tạo khoá | 200, thêm 1 dòng |

Đối chứng cùng lượt, xanh: thành viên dùng header khoá tạo được khoá và bật lại
được khoá của chính mình; tạo khoá phía máy chủ không kèm phiên vẫn được.

Hệ quả: một người bị gỡ trước ngày vá mà khoá còn bật có thể tạo khoá mới, hoặc
bật lại khoá cũ, cho chính mình. Không đọc được dữ liệu — `AuthMiddleware` của API
chặn mọi lối dữ liệu — nhưng giữ được một thông tin đăng nhập sống; nếu sau này
được cho phép lại, khoá đó đọc được dữ liệu ngay, trái lời hứa «cho phép lại trả tư
cách, không trả khoá».

Hàng thứ tư chỉ ra điều quan trọng hơn thứ tự móc: khi có header khoá, endpoint
thực thi dưới danh tính **của khoá**, không phải của cookie. Phép kiểm phải hỏi
đúng danh tính đó.

## Cách vá được chọn: phép kiểm là một plugin đứng sau plugin khoá

`canhKhoaApi` rời `hooks.before` chung, thành một plugin nhỏ (`id:
"canh-khoa-api"`) đặt **ngay sau** `apiKey(...)` trong mảng `plugins`. Móc của nó
khớp mọi đường `/api-key/*` và chạy sau móc của plugin khoá, nên
`getSessionFromCtx` trả đúng phiên mà endpoint sắp dùng:

- chỉ cookie → phiên cookie;
- chỉ header khoá → phiên dựng từ khoá (plugin khoá đã gán `ctx.context.session`);
- cả hai → phiên của khoá, đúng như endpoint thực thi;
- không gì (lời gọi phía máy chủ không kèm phiên) → không có phiên, cho qua như cũ.

Thân phép kiểm giữ nguyên: có phiên mà không có dòng `member` → `FORBIDDEN` với
`NOT_A_MEMBER` (`@crm/auth`). Khoá đã tắt hay sai thì plugin khoá tự từ chối trước.

Thứ tự trong mảng `plugins` là chỗ duy nhất giữ lời hứa này, nên bài kiểm ghim nó
bằng hành vi: đặt plugin trước `apiKey(...)` thì ba ca header đỏ lại.

### Phương án đã loại

| Phương án | Vì sao loại |
|---|---|
| Giữ móc chung, tự đọc header rồi tra khoá trong cơ sở dữ liệu | Phải chép lại cách plugin băm, kiểm hết hạn, kiểm tắt — lệch lặng khi nâng Better Auth |
| Cấm mọi lời gọi `/api-key/*` mang header khoá | Đơn giản nhất, nhưng tước của thành viên quyền tự quản khoá bằng khoá; chủ kho đòi đối chứng dương này |
| Tắt `enableSessionForAPIKeys` | Khoá API của tRPC và cầu REST dựa vào đúng cờ này; tắt là gãy mọi khoá |

Lỗ nằm trong mã riêng của OneHub (`canhKhoaApi`, PR #97), không phải lỗi của Better
Auth — thứ tự móc là hành vi có chủ đích của thư viện — nên không có gì gửi lên hãng.

## Lượt dọn một lần

Bản vá chặn việc dùng khoá cũ để mở khoá mới, nhưng khoá còn bật của người bị gỡ
trước ngày vá vẫn nằm đó. Hồ sơ này tắt chúng một lần bằng một `migration` chỉ-dữ
-liệu, `packages/db/prisma/migrations/<thời điểm>_tat_khoa_nguoi_ngoai_kho/`:

```sql
UPDATE "apikey" SET "enabled" = false, "updatedAt" = NOW()
WHERE "enabled" IS DISTINCT FROM false
  AND EXISTS (SELECT 1 FROM "member" WHERE "organizationId" = 'workspace')
  AND NOT EXISTS (
    SELECT 1 FROM "member" m
    WHERE m."userId" = "apikey"."referenceId" AND m."organizationId" = 'workspace'
  );
```

- **Tắt, không xoá** — cùng luật với lượt gỡ: dòng khoá còn để đọc ai từng giữ gì.
- **`IS DISTINCT FROM false`** — cột cho phép `null`, và Better Auth coi `null` là bật.
- **Chốt bảng rỗng** — khi chưa ai ghi danh, `ensureWorkspaceMembership` sẽ ghi danh
  mọi người dùng cũ ở lần đăng nhập đầu. Không có chốt, một bản cài nâng cấp từ đời
  trước workspace sẽ mất sạch khoá của mọi người.
- **Vì sao `migration` chứ không phải lệnh chạy tay** — `apps/api/scripts/build-func.mjs`
  chạy `prisma migrate deploy` ở lượt dựng production của crm-api (`docs/setup.md`,
  «Migrations run on the production deploy, and nowhere else»), nên lượt dọn đến cơ
  sở dữ liệu thật đúng một lần, cùng lúc với bản vá, không phụ thuộc ai nhớ chạy; ở
  máy dev `bun run dev` tự áp. Nó không đổi schema. Đây là một lần ghi dữ liệu thật
  khi phát hành — việc khó đảo, nên Cổng 2 dừng chờ người dù bằng chứng có xanh.
- **Vì sao không bỏ qua** — không dọn thì khoá nằm im cho tới khi người đó được cho
  phép lại, lúc đó khoá sống lại và đọc được dữ liệu.

**Người ký thấy con số trước khi phát hành.** `packages/db/scripts/xem-truoc-luot-don.ts`
(với bộ đọc dùng chung `luot-don-sql.ts`) rút mệnh đề `WHERE` bằng máy từ chính `migration.sql` rồi đếm — số khoá sẽ tắt, số
chủ khoá, số khoá có lời gọi trong 30 ngày qua — trong một giao dịch chỉ-đọc. Nó chỉ
nhận địa chỉ qua `XEM_TRUOC_DATABASE_URL`, không đọc `DATABASE_URL`, để không đếm nhầm
máy, và in tên máy đang đếm. Máy không với tới production, nên lệnh này là việc của
người ký ở Cổng 2. Bài kiểm ghim quan hệ «số xem trước = số dòng `migration` đổi».

Hệ quả nhận: một người dùng có tài khoản, có khoá, mà lần ghi danh của họ từng hỏng
(`ensureWorkspaceMembership` nuốt lỗi để không khoá cửa ai) sẽ mất khoá; họ không dùng
được khoá đó cho tới khi ghi danh xong, nên không mất quyền đọc nào, chỉ phải tạo khoá mới.

## Siết hai hạn chế của hồ sơ nguồn

- **E6, vế HTTP.** Sau lượt gỡ, gọi `contacts.list` bằng khoá vừa bị tắt trước đây
  chỉ đòi «không phải 200», và 403 tư cách cũng thoả điều đó. Đo được: khoá đã tắt
  làm `auth.api.getSession` ném lỗi, ngữ cảnh tRPC nhận phiên `null`, và
  `AuthMiddleware` trả **401**; khoá còn bật của người ngoài kho thì trả **403**
  `NOT_A_MEMBER`. Bài nay đòi đúng 401, cộng `auth.api.verifyApiKey` báo mã
  `KEY_DISABLED` — tách được «khoá đã tắt» khỏi «không còn là thành viên».
- **E7.** Ba lời gọi của người bị gỡ (tạo qua tRPC, tạo qua Better Auth, bật lại qua
  Better Auth) nay mỗi lời đòi đúng 403 và đúng thông điệp `NOT_A_MEMBER`, và thêm
  đối chứng dương cho lời bật lại: thành viên bật lại khoá đã tắt của chính mình qua
  cùng endpoint, cùng loại cookie → 200 và khoá bật.

Hai bài siết ngay tại chỗ trong `go-la-cat-quyen.spec.ts`. Hồ sơ nguồn đã ký nên
không viết lại — kể cả mục Known limits của nó; hồ sơ này là nơi ghi hai hạn chế đó
đã đóng.

## Đổi gì

| Vật | Đổi |
|---|---|
| `packages/auth/src/canh-khoa-api.ts` | thêm plugin `canhKhoaApiPlugin`, thân phép kiểm giữ nguyên |
| `packages/auth/src/auth.ts` | bỏ `canhKhoaApi` khỏi `hooks.before`, thêm plugin sau `apiKey(...)` |
| `packages/db/prisma/migrations/…_tat_khoa_nguoi_ngoai_kho/migration.sql` | lượt dọn một lần |
| `packages/db/scripts/luot-don-sql.ts` | đọc `migration`, rút mệnh đề, dựng câu đếm — bài kiểm và lệnh xem trước dùng chung |
| `packages/db/scripts/xem-truoc-luot-don.ts` | lệnh xem trước chỉ-đọc |
| `docs/api.md` | dòng về `canhKhoaApi` nói phép kiểm hỏi danh tính endpoint dùng, kể cả khoá |
| `apps/api/test/go-la-cat-quyen.spec.ts` | 7 ca mới, siết 2 ca cũ |
| `_acceptance/config.yaml` | 7 lệnh thực thi mới (`kcm_*`) |

## Không chạm UI

Không màn nào đổi. Không có bản bấm được, không có đặc tả UX.
