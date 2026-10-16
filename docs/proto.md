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

Mọi giá trị khác — không đặt, chuỗi rỗng, `0`, `false`, `true` — đều giữ cả
nhánh ở 404. Đây là chủ ý: `if (!process.env.PROTO_ROUTE)` sẽ coi `"0"` là bật
vì chuỗi khác rỗng đều truthy, và lúc đó không còn lớp nào canh nhánh này.

## Cổng nằm ở proxy, không nằm ở trang

`apps/app/lib/proto-gate.ts` giữ ba thứ: cờ, tiền tố `/proto`, và phép kiểm một
đường proto có hợp lệ không (slug có trong sổ chưa, `?state=` có được khai
chưa). `apps/app/proxy.ts` gọi chúng **trước** mọi việc khác và trả 404 thật khi
không đạt.

Đặt ở đó chứ không đặt trong `layout.tsx` là kết quả của một phép đo, không phải
sở thích. Kho bật `cacheComponents`, và `apps/app/app/layout.tsx` bọc cả ứng
dụng trong một `<Suspense>` ở gốc, nên trang `/proto` là **Partial Prerender**:
vỏ tĩnh rời máy chủ với mã 200 trước khi bất kỳ `notFound()` nào ở tầng render
kịp nói gì. Đo trên bản dựng thật, cách cũ cho hai kết quả sai cùng lúc — mọi
đường đều 200, và nội dung mục lục vẫn rò ra HTML dù cờ tắt.

Proxy chạy trước khi có byte nào rời máy chủ, nên nó là chỗ duy nhất quyết định
được. Hệ quả tốt kèm theo: cờ đọc **lúc chạy**, nên bật hay tắt không cần dựng
lại.

`layout.tsx` vẫn giữ một lần kiểm cờ nữa. Đó là lớp phòng hai, phòng khi
`config.matcher` của proxy đổi; nó không thay được mã trạng thái và không được
coi là cổng.

## Hai chữ "slug" khác nhau

`design_pass.proto_route` trong `_acceptance/config.yaml` là
`http://localhost:3000/proto/{slug}`. Chữ `{slug}` ở đó là **slug hồ sơ nghiệm
thu** — tên thư mục dưới `_acceptance/` — chứ không phải slug workspace của CRM.
Workspace của CRM cũng là một đoạn động ở gốc URL (`(app)/[slug]`), nên hai
nghĩa nằm cạnh nhau trong cùng không gian đường dẫn. Next cho đoạn tĩnh thắng
đoạn động, nên `/proto/...` luôn về đây; cái giá là một workspace tên đúng chữ
`proto` sẽ bị che.

## Slug của bản mẫu PHẢI bằng slug hồ sơ

`design-pass` điền `{slug}` bằng **slug hồ sơ nghiệm thu**, nên nếu sổ khai một
tên khác thì URL nó mở ra sẽ 404 và nghi thức dừng ở preflight — đúng cái đường
ống này dựng ra để xoá. Luật: `slug` trong `catalog.ts` bằng đúng tên thư mục
dưới `_acceptance/` mà bản mẫu đó phục vụ.

Răng `khai-bao.mjs slug` đo đúng điều này: nó suy slug hồ sơ từ vị trí của chính
nó rồi đòi giải được thành một mục trong sổ.

## Nhà thứ ba của biến

`PROTO_ROUTE` phải nằm trong `globalPassThroughEnv` của `turbo.json` ở gốc kho.
`docs/environment.md` gọi đây là nhà hay cắn nhất: turbo chạy chế độ `strict`
nên biến chưa khai bị giấu khỏi mọi task, và lệnh dev một dòng sẽ im lặng không
mở được proto. Kho đã từng mất nút đăng nhập Microsoft vì đúng lỗi này.

## Thêm một bản mẫu

Bốn bước, theo đúng thứ tự:

1. **Khai vào sổ** — thêm một mục vào `PROTO_CATALOG` trong
   `apps/app/app/proto/catalog.ts`: `slug` (**bằng đúng tên thư mục hồ sơ dưới
   `_acceptance/`**), `ten`, và `states` (ít nhất một state, mỗi state có `id` và
   `nhan`). File này cố ý **không nhập gì cả** để phép đo `import` thẳng nó được.
2. **Viết module** — `apps/app/app/proto/_modules/<slug>/index.tsx`, xuất một
   hàm nhận `{ state }: { state: string }`. Mỗi state phải cho một cây DOM khác
   nhau thấy được; hai state cho cùng một cây là phép đo đỏ.
3. **Nối vào bảng** — thêm `"<slug>": <TênHàm>` vào `PROTO_COMPONENTS` trong
   `apps/app/app/proto/registry.ts`. Mục có trong sổ mà thiếu ở bảng, hoặc
   ngược lại, đều là mồ côi và bị phép đo bắt.
4. **Chạy phép đo** — `cd apps/app && bun test test/proto-catalog.spec.ts`.

## Block ReUI chỉ là tham chiếu bố cục

Block Pro của ReUI (vd `settings-8`, `settings-12`, `onboarding-2`) là vật liệu
để **xem**, không phải để cài. Đo bằng `ui:add … --dry-run` ngày 2026-09-24:
`@reui/settings-8` ghi đè 5 tệp, `@reui/settings-12` ghi đè 7 tệp đã tuỳ biến
trong `packages/ui` (`button`, `card`, `badge`…) và thêm 18 biến màu vào
`globals.css`. `docs/reui.md` cấm `--overwrite`, `docs/design.md` cấm màu lạ.

Nên dùng block làm tham chiếu: mở ảnh hay mã nguồn của nó
(`ui:add … --dry-run --view`), rút bố cục, rồi dựng lại bản mẫu bằng component
sẵn có của kho. Cần một primitive kho chưa có thì cài **component miễn phí** của
ReUI vào `packages/ui` theo bốn chỗ sửa của `docs/reui.md` — ví dụ
`@reui/stepper`, trên đó kho dựng `step-list`. Việc cài là một finding Nhóm 2
của phiên design-pass, làm ở S3, không làm trong lúc dựng bản mẫu.

**Ngoại lệ: thành phần nền mà bản mẫu không thể có nếu thiếu.** Khung vẽ sơ đồ,
biểu đồ Gantt — thiếu chúng thì không có gì để Cổng 1 duyệt, nên chờ tới S3 là
vòng lẩn quẩn. Thành phần đó được cài vào `packages/ui` **ngay lúc dựng bản
mẫu**, theo `docs/reui.md`: thành phần miễn phí, hoặc tệp máy rút từ block Pro
(mục «Block có phần máy»). Việc cài vẫn ghi thành finding Nhóm 2 để Cổng 1
duyệt; Cổng 1 từ chối thì gỡ cùng bản mẫu. Phép thử: bỏ thành phần đó đi mà
bản mẫu vẫn trả lời được câu hỏi của Cổng 1 thì không phải ngoại lệ.

## Ba điều cấm

- **Không sửa `packages/ui`** để bản mẫu đẹp hơn. Thiếu hay xấu ở tầng component
  là một finding chờ Cổng 1, sửa ở vòng của nó. Cài thành phần nền theo ngoại lệ
  ở trên không phải là sửa.
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
