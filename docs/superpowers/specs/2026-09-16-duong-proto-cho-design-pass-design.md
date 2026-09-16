# Đường proto cho nghi thức design-pass

Ngày 16/09/2026 · slug `duong-proto-cho-design-pass` · T2

## Vì sao

Skill `design-pass` (plugin acceptance-gate 2.14.0) dừng ở preflight khi
`_acceptance/config.yaml` thiếu `design_pass.proto_route`, và luật của nó cấm
đoán route mặc định lẫn tự dựng proto trong phiên thẩm mỹ. Kho chỉ khai
`ds_skill`, nên mọi vòng feature chạm UI đều phải bỏ bước S1-D, và Cổng 1 duyệt
giao diện bằng chữ thay vì trên bản bấm được.

Vết gần nhất: `_acceptance/cho-phep-ai-vao-o-man-hinh/decisions.jsonl` entry
`d-20260916T021648Z-6`, điều kiện mở lại ghi đúng một dòng — "khi kho wire
`design_pass.proto_route`". Vòng này làm đúng dòng đó.

Đây là hạ tầng dùng lại: cái giá trả một lần, cái lợi rơi vào mọi vòng UI sau.

## Không gian đã quét

Bác preset `entity-feature`: bốn trục của nó (vòng đời entity, actor × quyền,
vào–ra, thời gian) sinh ra từ một danh từ có PII và có người dùng cuối. Proto
module là vật của thợ, sau cờ dev, dữ liệu giả, không role nào.

Trục tự dựng:

| Trục | Giá trị | Thước CE |
|---|---|---|
| A — vòng đời proto | khai sinh · mở & duyệt · sống chung với bản thật · gỡ/đổi tên | Storybook CSF; `design-pass/SKILL.md` mục 5 |
| B — bề mặt phơi ra | mục lục · trang proto · `?state=` · slug lạ · state lạ | `design-pass/SKILL.md` mục 1+3; Storybook `?path=` |
| C — bản khai khớp vật thật | `proto_route` · `dev_cmd` · `host_embed` · `.env.example` · `docs/proto.md` | bảng khoá mục 1 SKILL.md; luật một `.env` của AGENTS.md |
| D — môi trường × cờ | dev+bật · dev+tắt · prod+tắt · prod+bật | `apps/app/next.config.ts`; luật "không lộ ở bản chạy thật" |

Chân ngành đối chiếu: **Storybook** (Component Story Format — mỗi story một tên,
URL mang `?path=`), **Chromatic** (chụp story × viewport × theme), **Ladle**,
**Histoire**. Hình dạng "story = state có tên, chọn qua URL" chính là thứ
design-pass đòi ở mục 5; đây không phải phát minh mới mà là chép một khuôn đã
chạy nhiều năm, thu về đúng phần kho này cần.

## Hình dạng

```
apps/app/app/proto/
  layout.tsx             cờ PROTO_ROUTE tắt → notFound() cho CẢ nhánh
  page.tsx               mục lục — đọc sổ đăng ký
  [slug]/page.tsx        trang proto — tra sổ, đọc ?state=
  registry.ts            sổ đăng ký: slug → { tên, states[], Component }
  state-switcher.tsx     thanh chuyển state (link thật)
  _modules/duong-proto/  proto mẫu
```

**Sửa sau khi đo (S3):** cờ dev đặt ở **proxy**, không ở `layout.tsx`.

Bản đầu đặt cờ trong `layout.tsx` của nhánh. Đo trên bản dựng thật cho thấy nó
không giao được thứ đã hứa: kho bật `cacheComponents` và layout gốc bọc cả ứng
dụng trong `<Suspense>`, nên `/proto` là Partial Prerender — vỏ tĩnh rời máy chủ
với mã 200 trước khi `notFound()` kịp nói gì. Hai hỏng cùng lúc: mọi đường trả
200 kể cả slug lạ và state lạ, và nội dung mục lục rò ra HTML dù cờ tắt.

Cổng chuyển lên `apps/app/lib/proto-gate.ts` + `apps/app/proxy.ts`, chạy trước
khi có byte nào rời máy chủ. `layout.tsx` giữ lần kiểm thứ hai làm lớp phòng
hai, không phải cổng.

`/proto/x` thắng `(app)/[slug]` vì Next cho đoạn tĩnh thắng đoạn động. Cái giá:
một workspace CRM tên đúng chữ `proto` sẽ bị che. Nhận, không phòng xa.

Chữ `{slug}` trong `proto_route` là slug **hồ sơ nghiệm thu**, không phải
workspace CRM. Hai nghĩa nằm cạnh nhau trong cùng không gian URL; `docs/proto.md`
phải nói ra để người sau không nhầm.

## Proxy phải mở đường, và cái giá của việc đó

`apps/app/proxy.ts` chạy trên mọi đường trừ `api` và `_next`. Không có cookie
phiên thì `/proto` bị đá về `/sign-in` — bản bấm được không mở được, design-pass
DỪNG y như khi không có route. Nên chỉ dựng route là chưa đủ.

Cách sạch: thêm `/proto` vào `ANONYMOUS` — nhánh trả `next()` **trước** lần kiểm
phiên. Hai cách khác đều tệ hơn: nhét proto dưới `/t` mượn quyền ẩn danh sẵn có
thì sai nghĩa và đụng `[site]`; thêm vào `UNGATED` thì vô ích vì `UNGATED` nằm
sau lần kiểm phiên.

Cái giá phải nói thẳng: sau thay đổi, proxy thôi canh `/proto`, nên cờ
`PROTO_ROUTE` là **lớp chặn duy nhất**. Vì thế AC-2 đo ở đúng điều kiện
không-cookie — đo khi đang đăng nhập thì không phân biệt được "cờ chặn" với
"proxy chặn", và một cờ hỏng sẽ đi qua màu xanh. AC-13 đo rằng danh sách chỉ dài
thêm đúng một mục và `/protoXYZ` không ăn theo tiền tố.

File này không nằm trong `t3_paths` nên hạng vẫn T2, nhưng nó cạnh xác thực —
đây là mục phải nằm đầu gói Cổng 1.

## Sổ đăng ký, tách làm hai — và vì sao phải tách

- `catalog.ts` — dữ liệu thuần: `{ slug, ten, states: [{ id, nhan }] }[]`. Không
  nhập React, không nhập `@crm/ui`, không nhập gì cả.
- `registry.ts` — ghép `slug → Component`, nhập `catalog.ts`.

Tách vì phép đo. Nếu sổ là một file duy nhất mang cả Component, răng muốn đọc
danh sách state chỉ còn hai đường: bóc văn bản bằng biểu thức chuỗi, hoặc kéo cả
cây React vào một tiến trình `bun`. Đường thứ nhất là đúng lớp lỗi kho đã ghi ở
`[do-quyen-luot-bang-hanh-vi#F1]` — fixture tự dựng đúng khuôn bên đọc thay vì
đi qua đường thật: ai đó khai sổ bằng `.map()` hay trải mảng thì răng đọc ra 0
mục, và một vòng lặp trên 0 phần tử thì **đúng vô nghĩa** — ba eval xanh trên một
sổ chưa từng được đọc.

`catalog.ts` không nhập gì nên răng `import` thẳng nó bằng `bun`, đúng đường mã
thật dùng. Kèm sàn cứng trước mọi so sánh: `catalog` dài ≥ 1, `duong-proto` đúng
5 state. Sàn cứng là thứ phân biệt "đo và đúng" với "không đo được nên đúng".

`Component` nhận `{ state }` và tự quyết render gì. Sổ không biết gì về ruột
proto — đó là chỗ ranh giới đặt đúng: thêm proto không phải sửa hạ tầng. Ràng
buộc hai chiều: mọi slug trong `catalog` phải có Component trong `registry` và
ngược lại, không mục mồ côi bên nào.

## State đi qua URL

`/proto/<slug>?state=<id>`. Vắng → state đầu tiên trong bản khai. **State lạ →
`notFound()`, không rơi về mặc định.** Chọn nghiêm có lý do: mục 5 SKILL.md cấm
nết "chụp mỗi default rồi im", mà rơi-về-mặc-định-lặng-lẽ chính là cách một lỗi
gõ sai biến thành một ma trận chụp giả — xanh, đủ file, sai toàn bộ.

Thanh chuyển state vẽ bằng link thật, nên tên state hiện trên DOM: design-pass
đọc được bằng `read_page`, không phải đi đọc mã nguồn.

## Proto mẫu `duong-proto`

Bậc vật liệu `real-components` — ghép từ `@crm/ui`: `card`, `data-table`,
`badge`, `button`, `empty`, `skeleton-swap`, `alert`, `separator`. Năm state:
`mac-dinh`, `rong`, `dang-tai`, `loi`, `tran-dai`.

Năm state này là năm state mọi surface CRM đều có, nên proto mẫu vừa chứng đường
ống vừa là bản chan cho người sau. Dữ liệu giả, không tRPC, không đường ghi.

## Vì sao không cần lưới drift riêng

Phòng trưng bày giữ proto lại vĩnh viễn, nên câu hỏi thật là proto cũ lệch khỏi
bản thật thì ai biết. Trả lời: proto nằm trong đồ thị `bun run check-types` và
`bun run build`, nên `@crm/ui` đổi API là proto cũ đỏ ở cổng sẵn có.

Đây chính là lý do kỹ thuật để bắt bậc `real-components` chứ không phải lý do
thẩm mỹ: proto ghép từ component thật thì được cổng thật canh; proto vẽ tay bằng
HTML tĩnh thì không ai canh, và nó thối dần trong im lặng.

## Khai vào config

```yaml
design_pass:
  ds_skill: web-design-guidelines
  proto_route: "http://localhost:3000/proto/{slug}"
  dev_cmd: "PROTO_ROUTE=1 TURBO_UI=false bunx turbo run dev --ui=stream --filter=app --filter=api"
  host_embed:
    guide: "docs/proto.md"
    route: "apps/app/app/proto/[slug]/page.tsx"
    dev_flag: "PROTO_ROUTE"
```

`dev_cmd` mang sẵn `PROTO_ROUTE=1`: công dụng khai báo của nó là in ra lệnh khi
route chết, mà lệnh thiếu cờ thì in ra cũng vẫn chết.

**Không khai `capture_cmd`.** `scripts/ui-capture.mjs` là bản tham chiếu
một-URL→một-file; design-pass cần ma trận đặt tên
`<state>--<breakpoint>[--<theme>].png`. Khai một lệnh không khớp quy ước gọi thì
tệ hơn để trống — để trống thì design-pass tự chụp bằng Browser pane, đường nó
xử lý sẵn.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: design-pass mở `proto_route` đã điền slug → trang proto render state
  đầu → đổi state bằng thanh link → chụp từng ô ma trận (điểm ra:
  `_acceptance/<slug>/evidence/design-pass/`)
- Biên: sổ đăng ký chưa có proto nào → mục lục hiện trạng thái rỗng kèm trỏ
  `docs/proto.md`; cờ `PROTO_ROUTE` chưa bật → cả nhánh 404
- Lỗi & quay lại: slug lạ hoặc state lạ → 404 (không rơi về mặc định); người
  quay lại mục lục `/proto` để thấy danh sách đúng

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Mục lục `/proto` | liệt kê mọi proto đang đăng ký | từ tay gõ URL / tới trang proto |
| Trang proto `/proto/[slug]` | trình MỘT proto ở MỘT state | từ mục lục hoặc `proto_route` / tới state khác cùng trang |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-muc-luc-co-proto | Mục lục | danh sách proto, mỗi dòng tên + slug + số state | bấm vào một proto |
| ST-muc-luc-rong | Mục lục | trạng thái rỗng + trỏ `docs/proto.md` | đi thêm proto theo hướng dẫn |
| ST-trang-proto-mac-dinh | Trang proto | proto ở state đầu tiên + thanh chuyển state | đổi state |
| ST-trang-proto-doi-state | Trang proto | proto ở state đã chọn, state hiện đang bật rõ trên thanh | chụp / đổi tiếp |
| ST-nhanh-tat-co | cả nhánh | 404 của Next | bật `PROTO_ROUTE=1` rồi chạy `dev_cmd` |
| ST-slug-la | Trang proto | 404 của Next | về mục lục xem slug đúng |
| ST-state-la | Trang proto | 404 của Next | đọc thanh state để lấy id đúng |
<!-- UX-STATE-TABLE>>> -->

Năm state của riêng proto mẫu `duong-proto` (`mac-dinh`, `rong`, `dang-tai`,
`loi`, `tran-dai`) là nội dung do module tự khai, không phải trạng thái của hạ
tầng — hạ tầng chỉ bảo đảm chúng chọn được qua `?state=`.

### 4. Hành vi

- Thanh chuyển state là link thật (`<a href>`), không phải nút chạy JavaScript:
  design-pass phải đọc được tên state trên DOM và mở thẳng từng URL
- State đang bật phải phân biệt được bằng thị giác lẫn bằng `aria-current`
- Khổ đo: 375 và 1280 · theme: light và dark (kho có `next-themes`)

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `card`, `badge`, `button`, `separator` | dùng | có sẵn trong `@crm/ui`, đúng nhu cầu |
| `empty` | dùng | trạng thái rỗng của mục lục và của proto mẫu |
| `skeleton-swap` | dùng | state `dang-tai` của proto mẫu |
| `alert` | dùng | state `loi` của proto mẫu |
| `data-table` | dùng | state `mac-dinh` và `tran-dai` của proto mẫu |
| thanh chuyển state | ghép | ghép từ `button` (biến thể liên kết) + `separator`; không component mới |

Không tạo component mới, không sửa `@crm/ui`. Thiếu gì ở tầng component là
finding Nhóm 2 chờ Cổng 1, theo đúng ràng buộc cứng của design-pass.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)

Căn cứ: Storybook, Ladle và Histoire — ba sản phẩm cùng loại đang chạy thật —
đều là master-detail (danh sách bên trái, khung trình bày bên phải), và
design-pass cần một cửa vào liệt kê được lẫn một URL đi thẳng tới từng vật. Đây
là luồng hiển nhiên, không mở bước tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Vật đi kèm

- `.env.example`: `PROTO_ROUTE` kèm chú giải theo nếp file (181 dòng hiện có,
  mỗi biến một đoạn văn xuôi nói nó làm gì)
- `docs/proto.md`: cách thêm một proto module — đích của `host_embed.guide`
- `AGENTS.md`: thêm một dòng vào bảng "đọc gì trước khi chạm gì"

Biến chỉ `apps/app` đọc, API không đọc, nên **không** khai vào
`apps/api/src/config/env.validation.ts` — luật AGENTS.md ràng đúng điều kiện đó.

## Ngoài phạm vi

- **Gỡ / đổi tên proto.** Phòng trưng bày vừa mở, chưa có vật nào cần gỡ. Dựng
  luật dọn cho một kho rỗng là dựng máy không có việc.
- **Lưới drift riêng.** `check-types` và `build` đã canh; thêm lưới thứ hai đo
  cùng một thứ là thêm chỗ hỏng chứ không thêm bảo đảm.
- **Tìm kiếm / lọc trong mục lục.** Một proto thì danh sách là danh sách.
- **`capture_cmd` — bộ chụp ma trận của kho.** Đáng làm, nhưng là việc riêng:
  nó đụng `scripts/ui-capture.mjs` và quy ước đặt tên file bằng chứng, không đụng
  đường proto.
- **Wire `executors.design.static`.** Bảng CT1 của feature-loop trỏ
  `config:executors.design.static`, kho chỉ có `.gate` và `.ui_check` — con trỏ
  đó đang chết. Nằm ở làn static, không phải làn proto.
- **Xác thực cho `/proto`.** Sau cờ dev, dữ liệu giả — thêm cửa mà không thêm
  một phần an toàn nào.
- **Đường ghi / tRPC trong proto.** Ràng buộc cứng của design-pass cấm tường
  minh; proto là ý định, không phải bản chạy.

## Nút mồi

Vòng này tự nó chạm UI, nên theo luật S1-D nó phải chạy design-pass trước Cổng 1
— mà design-pass lại cần chính `proto_route` vòng này đang dựng. Không né được
bằng cách sắp xếp lại thứ tự. Bỏ S1-D ở vòng này là entry `descope` có tên trong
sổ quyết định; từ vòng sau trở đi thì không còn cớ đó.
