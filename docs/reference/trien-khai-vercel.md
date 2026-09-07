# Triển khai trên Vercel

Ba dự án, một kho, một nhánh production là `onehub`:

| Dự án | Thư mục gốc | Lệnh dựng |
| --- | --- | --- |
| `crm-onehub-app` | `apps/app` | mặc định của Next.js |
| `crm-onehub-api` | gốc kho | `node apps/api/scripts/build-func.mjs` |
| `crm-onehub-agent` | `apps/agent` | `bun run build` |

Cả ba ghim `nodeVersion: 24.x`. `eve build` đòi Node ≥ 24 trong khi `package.json`
của kho khai `engines: >=22`, nên hạ số này xuống là làm đỏ dự án agent.

## `API_URL` mang hai giá trị khác nhau, và đó là cố ý

`.vercel.app` nằm trong Public Suffix List, nên hai origin `*.vercel.app` không
dùng chung được cookie phiên. Lối thoát là `apps/app/app/api/[...path]/route.ts`:
app proxy toàn bộ `/api/*` trên origin của chính nó.

Vì `betterAuth({ baseURL: env.apiUrl })` sinh ra redirect URI của Google:

- trên dự án **api**, `API_URL` = origin của **app** — Google trả người dùng về
  app, cookie đậu đúng origin họ đang đứng.
- trên dự án **app**, `API_URL` = origin của **api** — đích của proxy.

Đặt ngược lại là vòng lặp chuyển hướng, hoặc proxy tự gọi chính nó.

## Biến của bản xem trước phải cắm riêng

Vercel không cho bản xem trước mượn biến của production. Thiếu biến thì lượt dựng
chết ngay ở `bun install`: postinstall của `@crm/db` gọi Prisma và đòi
`DATABASE_URL`. Mỗi pull request khi đó đỏ ba check.

Số biến tối thiểu cho target `preview`:

| Dự án | Biến |
| --- | --- |
| `crm-onehub-app` | `DATABASE_URL` `POSTGRES_URL_NON_POOLING` `BETTER_AUTH_SECRET` `ALLOWED_SIGN_IN` `API_URL` `APP_URL` `NEXT_PUBLIC_API_URL` `AGENT_BRIDGE_SECRET` `AGENT_URL` |
| `crm-onehub-api` | thêm `GOOGLE_CLIENT_ID` `GOOGLE_CLIENT_SECRET` |
| `crm-onehub-agent` | `DATABASE_URL` `POSTGRES_URL_NON_POOLING` `AGENT_BRIDGE_SECRET` `APP_URL` `API_URL` |

Ba cái bẫy khi cắm:

1. `vercel env pull` **không** trả về biến riêng của dự án. File nó ghi ra chỉ có
   biến hệ thống — `VERCEL*`, `TURBO_*`, `NX_*`. Chép file đó sang target khác là
   cắm rác vào lượt dựng. Đường đúng là REST API:
   `POST /v10/projects/<tên>/env?teamId=<team>&upsert=true`.
2. Biến khai kiểu `sensitive` **không đọc lại được**, kể cả với `?decrypt=true`.
   Cắm mới thì khai `encrypted`.
3. Khoá trong `.env` ở máy không phải khoá của production. Kiểm trước khi chép.

## Giới hạn còn lại của bản xem trước

Bản xem trước dùng chung cơ sở dữ liệu production. Một bản mang migration mới sẽ
áp thẳng lên dữ liệu thật.

Bản xem trước của app trỏ `API_URL` vào api production, nhưng
`apps/app/lib/session.ts` gọi `auth.api.getSession()` — chính app kiểm chữ ký
cookie bằng `BETTER_AUTH_SECRET` của nó. Hai khoá không khớp thì bản xem trước
không nhận được phiên. Muốn preview đăng nhập được, `BETTER_AUTH_SECRET` và
`AGENT_BRIDGE_SECRET` phải giống hệt production ở cả ba dự án.

Redirect URI đăng ký ở Google Cloud là origin app production. URL xem trước sinh
động theo từng lượt dựng, và Google không nhận ký tự đại diện, nên đăng nhập
Google khởi động được từ bản xem trước nhưng kết thúc ở production.
