# Trường tự tạo có đường vào ở Cài đặt — kế hoạch thực thi

> **Cho người thực thi:** dùng `superpowers:subagent-driven-development` hoặc
> `superpowers:executing-plans` để làm theo từng việc. Các bước dùng ô đánh dấu.

**Đích:** người quản trị vào Cài đặt thấy mục Trường, mở ra trang quản trị ba
thực thể, và được gợi ý bộ trường của môi giới tài chính và bất động sản Việt.

**Lối làm:** không xây lại gì. Trang mới lắp lại từ `FieldsList` và
`FieldEditor` đã có, bọc trong vỏ trang chuẩn, dùng nhóm khoá tham số riêng để
không bật khay trượt. Bộ gợi ý thay trọn nội dung, giữ nguyên cơ chế.

**Bộ công cụ:** Next.js App Router, nuqs cho trạng thái trên địa chỉ, tRPC qua
TanStack Query, shadcn từ `@crm/ui`, puppeteer-core cho thước trên trình duyệt.

**Đặc tả:** `docs/superpowers/specs/2026-09-18-truong-tu-tao-o-cai-dat-design.md`
**Hợp đồng:** `_acceptance/truong-tu-tao-o-cai-dat/contract.md` (15 tiêu chí)
**Phép đo:** `_acceptance/truong-tu-tao-o-cai-dat/evals.yaml` (16 thước)

## Ràng buộc chung — áp cho MỌI việc dưới đây

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa.
- `packages/ui` là nguồn duy nhất của giao diện. Không đè kiểu bằng `className`,
  không đúc bán kính, khoảng cách hay màu mới.
- Bán kính chỉ lấy từ thang: `rounded-sm`, `rounded-md`, `rounded-lg`.
- Thành phần phía trình duyệt KHÔNG được nhập gói phía máy chủ (`@crm/auth`,
  `@crm/db`). Trang máy chủ tính, thành phần trình duyệt nhận dữ liệu đã xong.
- Hằng số tinh chỉnh được đi vào một module cấu hình theo vùng, không nằm cạnh
  chỗ dùng đầu tiên.
- Dữ liệu chưa có kiểu phải phân tích ở biên bằng Zod, không truyền
  `Record<string, unknown>` đi tiếp.
- Mọi thước đo phải suy gốc cây từ vị trí script của chính nó, và in ra đường
  dẫn tuyệt đối của mọi module nó nạp. Không hardcode gốc kho.
- Một phép đo mới chỉ tính là XONG khi có cặp hai chiều trên cùng một bản dựng:
  vật lành thì xanh, phá vật thật trong bản sao thì đỏ **và thông điệp gọi tên
  đúng thứ vừa bị phá**.
- Trường do thước tạo trên cơ sở dữ liệu thật phải mang nhãn bắt đầu đúng tiền
  tố `ZZ thu ` và phải được xoá qua API ở cuối lượt, dù thước đỏ hay xanh.
- Bốn lệnh cổng cộng lệnh dựng, chạy từ gốc kho: `bun run test` ·
  `bun run check-types` · `bun run lint` · `bun run lint:slop` · `bun run build`.

---

### Việc 1: nhóm khoá tham số riêng cho trang Trường

**Tệp:**
- Sửa: `apps/app/lib/search-param-keys.ts`
- Kiểm: `apps/app/lib/search-param-keys.test.ts`

**Giao diện:**
- Nhận từ việc trước: không có, đây là việc đầu.
- Trao cho việc sau: `SEARCH_PARAM.fieldsPage.entity` mang giá trị `"thucThe"`
  và `SEARCH_PARAM.fieldsPage.field` mang giá trị `"truong"`. Việc 3 dùng đúng
  hai khoá này.

- [ ] **Bước 1: viết ca kiểm sẽ đỏ**

Thêm vào `apps/app/lib/search-param-keys.test.ts`:

```ts
test("nhom khoa trang Truong khac moi khoa cua khay truot", () => {
	const khay = Object.values(SEARCH_PARAM.fieldsSheet);
	const trang = Object.values(SEARCH_PARAM.fieldsPage);

	for (const khoa of trang) {
		expect(khay).not.toContain(khoa);
	}
	expect(trang).toHaveLength(2);
});

test("moi khoa cua trang Truong nam trong danh sach da giu cho", () => {
	for (const khoa of Object.values(SEARCH_PARAM.fieldsPage)) {
		expect(RESERVED_SEARCH_PARAM_KEYS.has(khoa)).toBe(true);
	}
});

test("bo canh trung khoa bat duoc khi trang dung dung khoa cua khay", () => {
	expect(() =>
		assertUnreservedSearchParamKeys(
			[SEARCH_PARAM.fieldsSheet.entity],
			"trang-truong",
		),
	).toThrow(SEARCH_PARAM.fieldsSheet.entity);
});
```

- [ ] **Bước 2: chạy để chắc nó đỏ**

Chạy: `cd apps/app && bun test lib/search-param-keys.test.ts`
Chờ đợi: ĐỎ, với lời nói `fieldsPage` không tồn tại.

- [ ] **Bước 3: thêm nhóm khoá**

Trong `apps/app/lib/search-param-keys.ts`, thêm vào `SEARCH_PARAM` ngay sau
`fieldsSheet`:

```ts
	fieldsPage: {
		entity: "thucThe",
		field: "truong",
	},
```

- [ ] **Bước 4: chạy lại để chắc nó xanh**

Chạy: `cd apps/app && bun test lib/search-param-keys.test.ts`
Chờ đợi: XANH, cả ba ca mới.

- [ ] **Bước 5: ghim**

```bash
git add apps/app/lib/search-param-keys.ts apps/app/lib/search-param-keys.test.ts
git commit -m "feat(truong-tu-tao-o-cai-dat): nhom khoa tham so rieng cho trang Truong"
```

---

### Việc 2: bộ gợi ý trường của môi giới Việt

**Tệp:**
- Sửa: `packages/validation/src/field-templates.ts`
- Tạo: `_acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs`

**Giao diện:**
- Nhận từ việc trước: không có, độc lập với việc 1.
- Trao cho việc sau: `FIELD_TEMPLATES` giữ nguyên hình dạng
  `Record<"COMPANY" | "CONTACT" | "DEAL", readonly FieldTemplate[]>`, nên việc 3
  và việc 4 không phải đổi gì ở nơi dùng.

- [ ] **Bước 1: thay trọn nội dung bộ gợi ý**

Ghi lại `packages/validation/src/field-templates.ts`, giữ nguyên phần khai kiểu
ở đầu tệp, thay trọn giá trị `FIELD_TEMPLATES` bằng đúng mười lăm dòng sau —
đây là bảng người ký đã chốt, sai một nhãn là thước ghim sẽ đỏ:

```ts
export const FIELD_TEMPLATES = {
	COMPANY: [
		{
			label: "Loại hình",
			type: "SELECT",
			options: [
				"Sàn giao dịch",
				"Công ty môi giới",
				"Đại lý phân phối",
				"Tổ chức tín dụng",
			],
		},
		{
			label: "Phân khúc chính",
			type: "SELECT",
			options: ["Căn hộ", "Nhà phố", "Đất nền", "Cho thuê", "Dự án"],
		},
		{
			label: "Quy mô môi giới",
			type: "SELECT",
			options: ["Dưới 10", "10–50", "50–200", "Trên 200"],
		},
		{
			label: "Mức độ hợp tác",
			type: "SELECT",
			options: ["Chưa tiếp xúc", "Đang thăm dò", "Đang hợp tác", "Tạm dừng"],
		},
		{
			label: "Nguồn quen",
			type: "SELECT",
			options: ["Giới thiệu", "Hội thảo", "Tự tìm", "Chiến dịch gọi"],
		},
		{ label: "Người phụ trách", type: "USER" },
	],
	CONTACT: [
		{
			label: "Phân khúc chuyên",
			type: "SELECT",
			options: ["Căn hộ", "Nhà phố", "Đất nền", "Cho thuê", "Dự án"],
		},
		{
			label: "Vai trò trong sàn",
			type: "SELECT",
			options: ["Chủ sàn", "Trưởng nhóm", "Môi giới", "Trợ lý"],
		},
		{
			label: "Kênh liên lạc quen",
			type: "SELECT",
			options: ["Zalo", "Điện thoại", "Email", "Facebook"],
		},
		{
			label: "Mức độ hợp tác",
			type: "SELECT",
			options: ["Chưa tiếp xúc", "Đang thăm dò", "Đang hợp tác", "Tạm dừng"],
		},
		{ label: "Người phụ trách", type: "USER" },
	],
	DEAL: [
		{
			label: "Hình thức hợp tác",
			type: "SELECT",
			options: [
				"Giới thiệu khách",
				"Phân phối dự án",
				"Đồng môi giới",
				"Cung cấp dữ liệu",
			],
		},
		{
			label: "Nguồn thoả thuận",
			type: "SELECT",
			options: ["Giới thiệu", "Hội thảo", "Chiến dịch gọi", "Tự tìm"],
		},
		{ label: "Tỷ lệ chia hoa hồng", type: "NUMBER" },
		{ label: "Người phụ trách", type: "USER" },
	],
} satisfies Record<"COMPANY" | "CONTACT" | "DEAL", readonly FieldTemplate[]>;
```

- [ ] **Bước 2: viết thước, bốn chế độ, chạy để chắc nó xanh**

Tạo `_acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs`. Thước nhận một
tham số chế độ: `nhom-cong-ty` (E1) · `ba-thuc-the` (E2) · `khong-trung-bo-cao`
(E3) · `tu-dien` (E4) · `bang-muoi-lam` (E16).

Yêu cầu cứng của thước, mỗi điều là một lớp lỗi đã có tiền lệ trong kho:

- Suy gốc cây bằng `resolve(dirname(fileURLToPath(import.meta.url)), "../../..")`,
  và nhận `process.env.GOC_CAY` khi biến đó có. Không hardcode gốc kho.
- Nạp bộ gợi ý bằng `await import()` module thật, KHÔNG đọc tệp thành chuỗi rồi
  tìm chữ.
- In đường dẫn tuyệt đối của mọi module đã nạp. Chế độ `khong-trung-bo-cao` nạp
  cả bộ gợi ý lẫn `LISTING` của bộ cào, và phải khẳng định hai đường cùng một
  gốc cây; khác gốc thì thoát mã 2 và nói rõ hai gốc.
- Chế độ `bang-muoi-lam` mang một hằng mười lăm dòng viết TRONG tệp thước, mỗi
  dòng là bộ ba thực thể, nhãn nguyên văn, kiểu, kèm danh sách lựa chọn đúng thứ
  tự cho kiểu `SELECT`. So hai chiều: không thiếu, không thừa, đúng thứ tự. Và
  khẳng định tổng đúng mười lăm, không gợi ý nào ngoài hằng.
- Chế độ `khong-trung-bo-cao` sinh khoá bằng đúng hàm `fieldKeyFromLabel` mà
  giao diện dùng, không tự viết lại phép sinh khoá. Khẳng định số khoá bộ cào
  đọc được đúng bằng chín.
- Mọi khẳng định phải là khẳng định thật, không phải in số rồi bỏ.
- Thông điệp khi đỏ phải gọi tên đúng vật sai: nhãn, khoá, hoặc tên lựa chọn.

Chạy cả năm chế độ trên cây lành:

```bash
node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs nhom-cong-ty
node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs ba-thuc-the
node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs khong-trung-bo-cao
node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs tu-dien
node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs bang-muoi-lam
```

Chờ đợi: cả năm thoát 0. Chế độ `tu-dien` sẽ ĐỎ cho tới khi việc 5 xong — đó là
đúng, ghi lại rồi chạy lại sau việc 5.

- [ ] **Bước 3: phá thử để chắc thước có răng**

Đây là bước bắt buộc, không phải tuỳ chọn. Dựng bản sao cây ra thư mục tạm, phá
đúng một thứ mỗi lần, chạy thước với `GOC_CAY` trỏ vào bản sao, và khẳng định
thước ĐỎ **và** thông điệp chứa đúng chuỗi cần thấy:

| Phá gì trong bản sao | Chế độ | Thông điệp phải chứa |
|---|---|---|
| chèn lại gợi ý `Territory` với lựa chọn `AMER` vào COMPANY | `nhom-cong-ty` | `AMER` và `Territory` |
| xoá sạch nhóm DEAL | `ba-thuc-the` | `DEAL` |
| đổi nhãn `Phân khúc chuyên` thành `Segment` | `ba-thuc-the` | `Segment` |
| chèn gợi ý nhãn `Địa bàn` vào CONTACT | `khong-trung-bo-cao` | `dia_ban` |
| xoá dòng `Kênh liên lạc quen` | `bang-muoi-lam` | `Kênh liên lạc quen` |
| đổi kiểu `Tỷ lệ chia hoa hồng` từ NUMBER sang SELECT | `bang-muoi-lam` | tên trường và cả hai tên kiểu |
| xoá lựa chọn `Đất nền` khỏi `Phân khúc chuyên` | `bang-muoi-lam` | `Đất nền` |

Lượt nào đỏ mà không gọi tên đúng chuỗi thì thước chưa xong, sửa thước rồi phá
lại.

- [ ] **Bước 4: ghim**

```bash
git add packages/validation/src/field-templates.ts _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs
git commit -m "feat(truong-tu-tao-o-cai-dat): bo goi y truong cua moi gioi Viet, kem thuoc ghim 15 dong"
```

---

### Việc 3: trang Cài đặt › Trường

**Tệp:**
- Tạo: `apps/app/app/(app)/[slug]/settings/fields/page.tsx`
- Tạo: `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`
- Sửa: `apps/app/lib/messages/settings.ts`

**Giao diện:**
- Nhận từ việc trước: `SEARCH_PARAM.fieldsPage` từ việc 1.
- Trao cho việc sau: đường `/settings/fields` phục vụ được, và khoá nhãn
  `settingsMessages.thanhBen.truong` cùng nhóm `settingsMessages.truong` với hai
  khoá `tieuDe` và `moTa` tồn tại ở cả hai thứ tiếng. Việc 4 dùng khoá nhãn đó.

- [ ] **Bước 1: thêm nhãn hai thứ tiếng**

Trong `apps/app/lib/messages/settings.ts`, thêm vào `thanhBen` của bản `en`, đặt
NGAY SAU `tienTe`:

```ts
		truong: "Fields",
```

Thêm vào `tieuDeTab` của bản `en`:

```ts
		truong: "Fields",
```

Thêm một nhóm mới vào bản `en`, cạnh nhóm `congTy`:

```ts
	truong: {
		tieuDe: "Fields",
		moTa: "The shape of your data: what each company, contact and deal records.",
	},
```

Rồi làm đúng ba chỗ tương ứng cho bản `vi`, cũng đặt `truong` ngay sau `tienTe`
trong `thanhBen`:

```ts
		truong: "Trường",
```

```ts
		truong: "Trường",
```

```ts
	truong: {
		tieuDe: "Trường",
		moTa: "Hình dạng dữ liệu của bạn: mỗi công ty, cá nhân và thoả thuận ghi những gì.",
	},
```

- [ ] **Bước 2: viết trang máy chủ**

Tạo `apps/app/app/(app)/[slug]/settings/fields/page.tsx` theo đúng khuôn trang
Tiền tệ (`../currencies/page.tsx`): `generateMetadata` lấy tiêu đề tab từ
`settingsMessages(await getLocale()).tieuDeTab.truong`; thân trang dùng
`PageShell`, `PageShellHeader`, `PageShellHeading`, `PageShellTitle`,
`PageShellDescription`, `PageShellContent`, và `Suspense` với
`PageShellLoading`. Bên trong gọi `requireSession()`, rồi `getServerTrpc()` và
`getServerQueryClient()`, nạp trước danh sách trường của thực thể mặc định:

```tsx
	await queryClient.prefetchQuery(
		trpc.fields.list.queryOptions({ entity: "COMPANY", includeArchived: true }),
	);
```

rồi bọc `<HydrateClient>` quanh `<FieldsSettings />`. Trang máy chủ KHÔNG nhận
tham số địa chỉ; thẻ đang mở do thành phần trình duyệt đọc.

- [ ] **Bước 3: viết thành phần trình duyệt**

Tạo `apps/app/app/(app)/[slug]/settings/fields/fields-settings.tsx`, mở đầu bằng
`"use client"`. Nó điều phối đúng ba thứ và không vẽ gì mới:

- Trạng thái trên địa chỉ bằng `useQueryStates` của nuqs với ĐÚNG hai khoá
  `SEARCH_PARAM.fieldsPage.entity` và `SEARCH_PARAM.fieldsPage.field`. Khoá thực
  thể phân tích bằng `parseAsStringLiteral(RECORD_KINDS)`, mặc định là thực thể
  công ty khi địa chỉ không mang tham số.
- Ba thẻ bằng `Tabs`, `TabsList`, `TabsTrigger` của `@crm/ui`, nhãn lấy từ
  `entityTabs(locale)` của `@/components/crm/fields/fields-copy` — cùng nguồn
  nhãn mà khay trượt dùng, nên ba nhãn không thể lệch nhau giữa hai đường vào.
- Khi khoá trường trên địa chỉ rỗng: render `<FieldsList entity={entity}
  onEdit={...} onNew={...} />`. Khi khoá trường có giá trị: render
  `<FieldEditor entity={entity} field={...} onDone={...} />`, trong đó trường
  đang sửa tìm từ kết quả `trpc.fields.list` theo khoá, và `key` của ô sửa đặt
  bằng mã trường hoặc chuỗi `"new"` — giống khay trượt, để ô sửa dựng lại khi
  đổi trường.

Thành phần này KHÔNG nhập `useFieldsSheet`, không nhập gì từ `record-stack`, và
không nhập gói phía máy chủ. Nó chỉ nhập từ `@crm/ui`, nuqs, tRPC phía trình
duyệt, và hai thành phần trường đã có.

- [ ] **Bước 4: dựng và soi bằng mắt**

Chạy máy chủ rồi mở `/settings/fields`. Khẳng định bằng mắt: mục Trường có trong
thanh bên ngay sau Tiền tệ; trang có tiêu đề và mô tả; ba thẻ hiện đúng nhãn;
bấm một trường thì ô sửa mở; và **khay trượt KHÔNG hiện**. Nếu khay hiện thì
nhóm khoá đang trùng, quay lại việc 1.

- [ ] **Bước 5: chạy hai lệnh cổng rẻ nhất**

Chạy: `bun run check-types` rồi `bun run lint`
Chờ đợi: cả hai xanh. Lỗi kiểu dạng `Module not found: Can't resolve 'dns'`
nghĩa là một thành phần trình duyệt đã nhập gói máy chủ — đọc vết nhập từ dưới
lên, dòng cuối là trang, dòng trên nó là thành phần đã rò.

- [ ] **Bước 6: ghim**

```bash
git add apps/app/app/\(app\)/\[slug\]/settings/fields apps/app/lib/messages/settings.ts
git commit -m "feat(truong-tu-tao-o-cai-dat): trang Cai dat > Truong voi ba the"
```

---

### Việc 4: mục Trường trên thanh bên Cài đặt

**Tệp:**
- Sửa: `apps/app/app/(app)/[slug]/settings/settings-sidebar.tsx`

**Giao diện:**
- Nhận từ việc trước: khoá nhãn `thanhBen.truong` từ việc 3, và đường
  `/settings/fields` phục vụ được từ việc 3.
- Trao cho việc sau: không có; đây là việc cuối của phần sản phẩm.

- [ ] **Bước 1: thêm một dòng vào danh sách mục**

Trong `settings-sidebar.tsx`, thêm vào `ITEMS` đúng một phần tử, đặt NGAY SAU
dòng `tienTe` — thứ tự trong danh sách này là thứ tự trên màn, và một phép đo
khẳng định hai mục liền nhau:

```ts
	{ khoa: "truong", href: `${ROOT}/fields` },
```

Không sửa gì khác trong tệp. Cả bản đầy đủ lẫn bản chờ tải đều đọc từ `ITEMS`,
nên một dòng này phục vụ cả hai.

- [ ] **Bước 2: soi bằng mắt ở hai khổ**

Mở `/settings` ở khổ rộng và khổ hẹp. Khẳng định: mục Trường hiện ở cả hai, đứng
ngay sau Tiền tệ, và ở khổ hẹp nó cuộn ngang cùng các mục khác.

- [ ] **Bước 3: ghim**

```bash
git add apps/app/app/\(app\)/\[slug\]/settings/settings-sidebar.tsx
git commit -m "feat(truong-tu-tao-o-cai-dat): muc Truong tren thanh ben Cai dat"
```

---

### Việc 5: mục «Trường» trong từ điển sản phẩm

**Tệp:**
- Sửa: `CONTEXT.md`

**Giao diện:**
- Nhận từ việc trước: nhãn đã chốt là `Trường`, từ việc 3.
- Trao cho việc sau: chế độ `tu-dien` của thước ở việc 2 chuyển sang xanh.

- [ ] **Bước 1: thêm mục, đúng khuôn các mục khác**

Thêm vào `CONTEXT.md`, cạnh các mục danh từ sản phẩm:

```markdown
**Trường**: một ô dữ liệu trên bản ghi, gồm trường chuẩn của hệ thống và trường
người quản trị tự tạo thêm. Người quản trị xem và sửa chúng ở Cài đặt › Trường.
_Avoid_: thuộc tính, property, custom field, trường tuỳ chỉnh
Vì sao: màn Cài đặt hiện CẢ trường chuẩn lẫn trường tự tạo, nên thêm chữ "tự
tạo" vào nhãn là nói hẹp hơn thứ người thấy; ba từ còn lại là tiếng của nhà khác
hoặc nửa Việt nửa Anh.
```

- [ ] **Bước 2: chạy thước từ điển để chắc nó xanh**

Chạy: `node _acceptance/truong-tu-tao-o-cai-dat/rang/bo-goi-y.mjs tu-dien`
Chờ đợi: thoát 0.

- [ ] **Bước 3: phá thử**

Trên bản sao, xoá dòng `_Avoid_` của mục vừa thêm, chạy lại chế độ `tu-dien` với
`GOC_CAY` trỏ vào bản sao. Chờ đợi: ĐỎ, thông điệp chứa chuỗi `_Avoid_`.

- [ ] **Bước 4: ghim**

```bash
git add CONTEXT.md
git commit -m "docs(truong-tu-tao-o-cai-dat): muc Truong trong tu dien san pham"
```

---

### Việc 6: thước trên trình duyệt thật

**Tệp:**
- Tạo: `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`

**Giao diện:**
- Nhận từ việc trước: trang và mục thanh bên từ việc 3 và việc 4; bộ gợi ý từ
  việc 2.
- Trao cho việc sau: không có; sau việc này là bước nghiệm thu máy.

- [ ] **Bước 1: viết thước, tám chế độ**

Tạo `_acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs`. Nhập
`APP`, `API`, `CHROME`, `LANG`, `chotMayChu`, `phien`, `tuChoi` từ
`../../cua-vao-noi-tieng-viet/rang/may-chu.mjs` — module đó đã suy gốc cây từ vị
trí của chính nó và đã có bước chốt máy chủ đang phục vụ đúng cây.

Tám chế độ, một chế độ một tham số dòng lệnh:

| Chế độ | Thước | Đo gì |
|---|---|---|
| `duong-vao` | E5 | mục Trường có trong thanh bên, đứng ngay sau Tiền tệ, bấm thì đổi đường; chạy hai thứ tiếng, nhãn phải khác nhau |
| `tieu-de-trang` | E14 | trang có tiêu đề và mô tả không rỗng, hai thứ tiếng khác nhau cả tiêu đề lẫn mô tả |
| `ba-the` | E6 | đúng ba thẻ, đúng thứ tự, thẻ Công ty đang mở, ba nhãn khác nhau; mỗi thẻ có hộp khác không và nằm trong khung nhìn |
| `the-tren-dia-chi` | E7 | bấm thẻ Cá nhân, đọc địa chỉ, tải lại từ địa chỉ đó, thẻ Cá nhân vẫn đang mở |
| `khong-bat-khay` | E8 | vế một: mở trang, khay KHÔNG có trên màn. vế hai đối chứng: mở trang kèm tham số của khay, khay PHẢI hiện; vế hai không thấy khay thì thoát mã 2 |
| `tao-tu-goi-y` | E9 | hai lượt, Cá nhân rồi Thoả thuận: bấm một gợi ý, khẳng định qua API đúng nhãn, đúng kiểu, đúng bộ lựa chọn cả thứ tự |
| `ba-viec` | E10 | trên thẻ Công ty: tạo từ đầu, sửa nhãn, lưu trữ; mỗi việc khẳng định qua API |
| `ba-nhom` | E15 | trên thẻ Cá nhân: ba nhóm có tiêu đề, nhóm chuẩn có phần tử, nhóm đang dùng chứa đủ chín khoá bộ cào nhập từ `LISTING`; đối chứng số phần tử với hai đường API; rồi lưu trữ một trường và khẳng định nó chuyển nhóm |
| `khay-cu` | E11 | trong khay trượt cũ: sáu việc, mỗi việc khẳng định ở tầng sau; xếp lại so nguyên cả dãy thứ tự |
| `trang-thai` | E12 | vế rỗng: lời «Chưa có trường tự tạo nào» và khối gợi ý. vế lỗi: chặn đường gọi ở tầng mạng, thấy lời lỗi và nút thử lại |

Yêu cầu cứng:

- Gọi `await chotMayChu()` TRƯỚC mọi khẳng định. Sai cây thì thoát mã 2.
- Đọc bằng thứ người thấy: lấy chữ từ phần tử trên màn, không đọc mã nguồn,
  không đọc biến trong bộ nhớ trang.
- Mọi trường thước tạo mang nhãn bắt đầu `ZZ thu ` kèm hậu tố ngẫu nhiên, và xoá
  qua API ở cuối lượt trong khối `finally`, dù thước đỏ hay xanh.
- Chế độ `ba-nhom` nhập `LISTING` từ `apps/api/src/listings/listings-config.ts`,
  không chép tay chín khoá.
- Chụp ảnh vào `_acceptance/truong-tu-tao-o-cai-dat/evidence/` cho các chế độ mà
  bảng phép đo đòi ảnh.
- Thông điệp khi đỏ gọi tên đúng vật sai: nhãn mục, nhãn thẻ, tên việc, tên nhóm.

- [ ] **Bước 2: chạy tám chế độ trên cây lành**

Dựng hai máy chủ trước: `apps/app` ở cổng 3000 và `apps/api` ở cổng 3001.

```bash
for m in duong-vao tieu-de-trang ba-the the-tren-dia-chi khong-bat-khay tao-tu-goi-y ba-viec ba-nhom khay-cu trang-thai; do
  node _acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs "$m" || echo "DO: $m"
done
```

Chờ đợi: cả mười chế độ thoát 0.

- [ ] **Bước 3: phá thử từng chế độ**

Với mỗi chế độ, dựng bản sao cây, phá đúng một thứ, chạy lại trên bản sao:

| Phá gì | Chế độ | Thông điệp phải chứa |
|---|---|---|
| xoá dòng mục Trường khỏi `ITEMS` | `duong-vao` | `Trường` |
| xoá `moTa` của nhóm `truong` | `tieu-de-trang` | phần mô tả |
| xoá thẻ Thoả thuận | `ba-the` | nhãn thẻ Thoả thuận |
| bỏ ghi thẻ vào địa chỉ, giữ trong bộ nhớ React | `the-tren-dia-chi` | `Cá nhân` |
| đổi nhóm khoá của trang thành khoá của khay | `khong-bat-khay` | `manageFields` |
| làm nút gợi ý chỉ cập nhật màn, không gọi API | `tao-tu-goi-y` | nhãn gợi ý, và lời nói API không có trường đó |
| làm nút lưu trữ không gọi API | `ba-viec` | `luu tru` |
| bỏ truyền trường chuẩn cho danh sách | `ba-nhom` | tên nhóm trường chuẩn |
| xoá `FieldsSheetHost` khỏi bố cục chung | `khay-cu` | khay |
| bỏ nhánh lỗi, chỉ còn vòng chờ | `trang-thai` | trạng thái lỗi |

- [ ] **Bước 4: ghim**

```bash
git add _acceptance/truong-tu-tao-o-cai-dat/rang/trang-truong.mjs
git commit -m "feat(truong-tu-tao-o-cai-dat): thuoc tren trinh duyet that, tam che do"
```

---

### Việc 7: soi giao diện theo chuẩn của kho, rồi đóng bước viết mã

**Tệp:**
- Sửa: bất cứ tệp nào bước soi chỉ ra
- Sửa: `_acceptance/truong-tu-tao-o-cai-dat/contract.md` (chỉ khoá `status`)

- [ ] **Bước 1: nạp chuẩn giao diện của kho rồi soi hai tệp mới**

Skill `web-design-guidelines` của kho lấy luật từ nguồn trên mạng lúc chạy. Nạp
nó, rồi soi đúng hai tệp trang mới. Sửa những gì nó chỉ ra, trong khuôn ràng
buộc chung ở đầu kế hoạch: không đè kiểu bằng `className`, không đúc giá trị
thị giác mới.

- [ ] **Bước 2: chạy trọn năm lệnh cổng**

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

Chờ đợi: cả năm xanh. Đỏ ở `agent#test` tại `retireExhausted` thì chạy
`bun run db:test --reset` rồi mới tin màu đỏ.

- [ ] **Bước 3: đặt hồ sơ sang «code xong»**

Sửa `status` trong `_acceptance/truong-tu-tao-o-cai-dat/contract.md` thành
`implemented`. Không sửa khoá nào khác, không điền `approved_by`.

- [ ] **Bước 4: ghim**

```bash
git add -A
git commit -m "chore(truong-tu-tao-o-cai-dat): code xong, san sang nghiem thu may"
```

---

## Tự soi kế hoạch

**Phủ đặc tả.** Bảy việc phủ trọn bảy dòng của bảng «Tệp sẽ sửa» trong đặc tả:
nhóm khoá tham số (việc 1), bộ gợi ý (việc 2), trang và nhãn (việc 3), thanh bên
(việc 4), từ điển (việc 5). Hai việc còn lại là thước đo (việc 2 và việc 6) và
bước đóng (việc 7). Mười sáu thước của bảng phép đo đều có một bước dựng: năm
chế độ tĩnh ở việc 2, mười chế độ trên trình duyệt ở việc 6, một bài kiểm ở
việc 1.

**Chỗ trống.** Không có bước nào nói «xử lý lỗi cho phù hợp» hay «viết kiểm cho
phần trên». Mọi bước có mã đều mang mã thật. Bảng phá thử nêu đúng chuỗi phải
thấy, không nói «kiểm tra thông điệp lỗi».

**Khớp tên.** `SEARCH_PARAM.fieldsPage` khai ở việc 1 và dùng ở việc 3, cùng hai
khoá `thucThe` và `truong`. Khoá nhãn `thanhBen.truong` khai ở việc 3 và dùng ở
việc 4. `FIELD_TEMPLATES` giữ nguyên hình dạng nên việc 3 và 4 không phải đổi
nơi dùng. Tiền tố `ZZ thu ` dùng thống nhất ở việc 6 và khai trong điều khoản
chung của bảng phép đo.

**Thứ tự bắt buộc.** Việc 1 đi trước việc 3. Việc 3 đi trước việc 4, vì mục
thanh bên trỏ tới đường mà việc 3 tạo. Việc 5 đi trước lượt chạy xanh của chế độ
`tu-dien`. Việc 6 đi sau việc 2, 3, 4. Việc 2 độc lập với việc 1, nên hai việc
này chạy song song được.
