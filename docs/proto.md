# Bản mẫu giao diện dưới `/proto`

Phòng trưng bày giao diện chạy được của kho. Nó tồn tại để Cổng 1 duyệt giao
diện **trên bản bấm được** thay vì trên chữ, và để skill `design-pass` có một
URL thật mà mở — thiếu nó thì nghi thức dừng ở preflight.

## Bật lên

Cờ là biến `PROTO_ROUTE`, và nó phải bằng **đúng chuỗi `"1"`**:

```bash
PROTO_ROUTE=1 TURBO_UI=false bunx turbo run dev --ui=stream --filter=app --filter=api
```

Rồi mở `http://localhost:3000/proto`.

Mọi giá trị khác — không đặt, chuỗi rỗng, `0`, `false` — đều giữ cả nhánh ở
404. Đây là chủ ý: `if (!process.env.PROTO_ROUTE)` sẽ coi `"0"` là bật vì chuỗi
khác rỗng đều truthy, và lúc đó không còn lớp nào canh nhánh này.

Cờ đọc lúc **dựng**, không phải lúc chạy. Một bản triển khai muốn mở proto phải
đặt biến trước khi build; đặt sau khi build xong thì không có tác dụng.

## Hai chữ "slug" khác nhau

`design_pass.proto_route` trong `_acceptance/config.yaml` là
`http://localhost:3000/proto/{slug}`. Chữ `{slug}` ở đó là **slug hồ sơ nghiệm
thu** — tên thư mục dưới `_acceptance/` — chứ không phải slug workspace của CRM.
Workspace của CRM cũng là một đoạn động ở gốc URL (`(app)/[slug]`), nên hai
nghĩa nằm cạnh nhau trong cùng không gian đường dẫn. Next cho đoạn tĩnh thắng
đoạn động, nên `/proto/...` luôn về đây; cái giá là một workspace tên đúng chữ
`proto` sẽ bị che.

## Thêm một bản mẫu

Bốn bước, theo đúng thứ tự:

1. **Khai vào sổ** — thêm một mục vào `PROTO_CATALOG` trong
   `apps/app/app/proto/catalog.ts`: `slug`, `ten`, và `states` (ít nhất một
   state, mỗi state có `id` và `nhan`). File này cố ý **không nhập gì cả** để
   phép đo `import` thẳng nó được.
2. **Viết module** — `apps/app/app/proto/_modules/<slug>/index.tsx`, xuất một
   hàm nhận `{ state }: { state: string }`. Mỗi state phải cho một cây DOM khác
   nhau thấy được; hai state cho cùng một cây là phép đo đỏ.
3. **Nối vào bảng** — thêm `"<slug>": <TênHàm>` vào `PROTO_COMPONENTS` trong
   `apps/app/app/proto/registry.ts`. Mục có trong sổ mà thiếu ở bảng, hoặc
   ngược lại, đều là mồ côi và bị phép đo bắt.
4. **Chạy phép đo** — `cd apps/app && bun test test/proto-catalog.spec.ts`.

## Ba điều cấm

- **Không sửa `packages/ui`** để bản mẫu đẹp hơn. Thiếu hay xấu ở tầng component
  là một finding chờ Cổng 1, sửa ở vòng của nó.
- **Không đường ghi, không tRPC, không dữ liệu thật.** Bản mẫu là ý định, không
  phải bản chạy. Dữ liệu giả, chỉ đọc.
- **Chỉ nhập `@crm/ui` theo subpath** (`@crm/ui/components/<tên>`). Barrel
  `"@crm/ui"` kéo Prisma rồi `pg` rồi `dns` vào trình duyệt và làm hỏng bản
  dựng. `@crm/db` và `@crm/auth` cũng cấm.

## Bản mẫu sống mãi, và ai canh nó

Bản mẫu ở lại kho vĩnh viễn chứ không xoá khi ship. Rủi ro đi kèm là bản mẫu cũ
lệch khỏi bản thật mà không ai biết — kho **không** dựng máy dọn riêng cho việc
đó, vì bản mẫu nằm trong đồ thị của `bun run check-types` và `bun run build`:
`@crm/ui` đổi API thì bản mẫu cũ đỏ ngay ở cổng sẵn có.

Đó cũng là lý do kỹ thuật để bắt bản mẫu ghép từ component thật thay vì vẽ tay
bằng HTML tĩnh. Vẽ tay thì không cổng nào canh, và nó mục dần trong im lặng.
