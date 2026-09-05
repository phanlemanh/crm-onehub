# Việt hoá màn Cài đặt (lát ③b, đợt đầu) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mười file của cụm Cài đặt (gốc + currencies) đọc đúng tiếng của người dùng, và bộ đo của vòng nhìn thấy được cả lớp chữ nằm ngoài JSX mà thước cũ mù.

**Architecture:** Dựng thước TRƯỚC, dịch SAU. Hôm nay cả mười file còn nguyên tiếng Anh, nên mỗi chân đo mới phải ĐỎ trên chính cây thật ngay khi vừa viết xong — chiều đỏ được chứng bằng hiện trạng, không cần bản sao đột biến. Dịch xong thì cùng chân đo đó chuyển xanh. Đó là cặp hai chiều mạnh nhất có thể có ở vòng này.

**Tech Stack:** TypeScript compiler API (`typescript` qua `createRequire`) để đọc cây cú pháp · Node ESM script trong `_acceptance/<slug>/rang/` · bun test cho bộ canh kho chuỗi · Playwright/fetch cho các chân dựng màn thật.

**Spec:** `docs/superpowers/specs/2026-09-04-man-cai-dat-noi-tieng-viet-design.md`
**Contract:** `_acceptance/man-cai-dat-noi-tieng-viet/contract.md` · **Evals:** `.../evals.yaml`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa. (AGENTS.md)
- **`/packages/ui` là nguồn duy nhất của giao diện.** Vòng này KHÔNG sửa component nào — chỉ đổi chữ.
- Kho chuỗi theo đúng khuôn năm anh em đã có: `const en` → `export type XMessages = typeof en` → `const vi = {…} satisfies XMessages` → `const BANG = { en, vi } satisfies Record<Locale, XMessages>` → `export function xMessages(locale: Locale)`.
- Client đọc qua `settingsMessages(useLocale())`; server qua `getLocale()` của `@/lib/locale/server`. **Client component không được import gói server** (`@crm/auth`, `@crm/db`).
- Mọi giá trị tiếng Việt phải mang dấu. Ngoại lệ khai tên trong tập miễn trừ của `messages-guard.spec.ts`.
- `translate="no"` cho tên thương hiệu, mã tiền tệ, và dữ liệu người nhập.
- Bề rộng hẹp nhất ghim: **360px**.
- Danh từ sản phẩm theo `CONTEXT.md`: **công ty** và **cá nhân**, không khoá vào giai đoạn môi giới. Không tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật.
- Lệnh chứng minh chạy từ gốc kho: `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.

---

### Task 1: Dân số của lát, sinh từ đĩa

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/lat.mjs`
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/lat-cai-dat.json`

**Interfaces:**
- Produces: `export const GOC` (gốc kho, suy từ `import.meta.url` — KHÔNG hardcode) và `export function lat()` trả `{ file, mienTru, khongQuet, thieu, treo, soTuDia }`, cùng hình dạng với `_acceptance/cua-vao-noi-tieng-viet/rang/lat.mjs`.

- [ ] **Step 1: Viết bản khai**

`lat-cai-dat.json`:

```json
{
  "lat": "man-cai-dat-noi-tieng-viet",
  "thu_muc": [
    "apps/app/app/(app)/[slug]/settings",
    "apps/app/app/(app)/[slug]/settings/currencies"
  ],
  "them": [],
  "khong_quet": [],
  "mien_tru": []
}
```

`thu_muc` quét KHÔNG đệ quy — chỉ file `.tsx` ngay trong thư mục đó. Nếu quét đệ quy thì cụm gốc nuốt luôn 33 file của các cụm khác và phạm vi vỡ.

- [ ] **Step 2: Viết `lat.mjs`**

Chép hình dạng từ `_acceptance/cua-vao-noi-tieng-viet/rang/lat.mjs`, đổi đúng hai chỗ: `readdirSync` bỏ `{ recursive: true }`, và đọc `lat-cai-dat.json`.

```js
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const GOC = resolve(HERE, "../../..");
const KHAI = JSON.parse(readFileSync(`${HERE}/lat-cai-dat.json`, "utf8"));

function quetThuMuc(goc) {
	return readdirSync(goc, { withFileTypes: true })
		.filter((m) => m.isFile() && m.name.endsWith(".tsx"))
		.map((m) => relative(GOC, join(goc, m.name)));
}
```

Phần còn lại (`lat()`, `thieu`, `treo`, `loaiRa`) giữ nguyên logic của bản cửa vào.

- [ ] **Step 3: Chạy để thấy nó đếm đúng mười**

Run: `node -e "import('./_acceptance/man-cai-dat-noi-tieng-viet/rang/lat.mjs').then(m => console.log(m.lat().file.length, m.lat().soTuDia))"`
Expected: `10 10`

- [ ] **Step 4: Chứng dân số sinh từ đĩa, không gõ tay**

Run: `touch 'apps/app/app/(app)/[slug]/settings/tam-thoi.tsx' && node -e "import('./_acceptance/man-cai-dat-noi-tieng-viet/rang/lat.mjs').then(m => console.log(m.lat().soTuDia))" ; rm 'apps/app/app/(app)/[slug]/settings/tam-thoi.tsx'`
Expected: in ra `11` — bản khai tự thấy file mới. In ra `10` nghĩa là dân số đang gõ tay ở đâu đó.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/
git commit -m "test(acceptance): sinh dân số lát Cài đặt từ đĩa, không từ danh sách gõ tay"
```

---

### Task 2: Bảng đóng toast, và chân đo chữ ngoài JSX

`independent: true` (so với Task 3)

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/toast-cua-lat.json`
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs`

**Interfaces:**
- Consumes: `lat()` và `GOC` từ Task 1.
- Produces: chân chạy được `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs [--chan toast|tieu-de|doi-chieu]`.

- [ ] **Step 1: Kê bảng đóng mười một lời gọi toast**

Chạy để lấy đúng file, dòng, và hình dạng — KHÔNG gõ tay từ trí nhớ:

```bash
S='apps/app/app/(app)/[slug]/settings'
grep -n 'toast\.' "$S"/*.tsx "$S"/currencies/*.tsx
```

Rồi viết `toast-cua-lat.json`. Mỗi dòng bốn trường:

```json
{
  "lat": "man-cai-dat-noi-tieng-viet",
  "loi_goi": [
    { "file": "apps/app/app/(app)/[slug]/settings/archive-retention.tsx", "dong": 42, "hinh_dang": "chuoi-thang", "goc": "Archive retention saved." }
  ]
}
```

`hinh_dang` lấy từ tập đóng: `chuoi-thang` · `chuoi-mau` (template literal) · `ba-ngoi` (toán tử điều kiện) · `toast-promise` · `qua-ham-tro-giup`. **Bảng phải có đủ mười một dòng** — số này ghim trong AC-2.

- [ ] **Step 2: Viết chân đo, chạy trên cây THẬT và mong nó ĐỎ**

`chu-ngoai-jsx.mjs` đọc cây cú pháp bằng `typescript` (cùng cách `chu-cung-jsx.mjs` làm), rồi:

- **chân `toast`**: đi mọi `CallExpression` có `expression` là `toast` hoặc `toast.<gì đó>`; với mỗi lời gọi, gom mọi `StringLiteral` và `TemplateExpression` trong đối số. Bỏ qua lời gọi mà đối số duy nhất là truy cập thuộc tính `.message` (đó là chuyển tiếp lỗi API — ngoài phạm vi) và ĐẾM số lượt bỏ qua để in ra.
- **chân `tieu-de`**: đi mọi `PropertyAssignment` tên `title` có initializer là `StringLiteral`, trong `export const metadata` và trong mảng khai thanh bên.
- **chân `doi-chieu`**: in số vật nhận ra mỗi loại.

Ma trận toàn phần, ghim ngay đầu hàm:

```js
const BANG = JSON.parse(readFileSync(`${HERE}/toast-cua-lat.json`, "utf8"));
if (nhanRa.length !== BANG.loi_goi.length) {
	console.log(
		`KHONG DO DUOC: bang khai ${BANG.loi_goi.length} loi goi toast nhung chan do chi nhan ra ${nhanRa.length}. ` +
			`Hinh dang chua phu: ${thieu.map((d) => `${d.file}:${d.dong} [${d.hinh_dang}]`).join(" · ")}`,
	);
	process.exit(2);
}
```

Số ô `tieu-de` phải BẰNG chín; lệch thì cùng cách xử lý — `exit 2`, gọi tên ô thiếu.

- [ ] **Step 3: Chạy trên cây thật — phải ĐỎ**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs`
Expected: **exit 1**, in ra 11 câu toast tiếng Anh và 7 tiêu đề dịch được, mỗi dòng có tên file và số dòng. Đây là chiều đỏ, chứng trên hiện trạng — chưa dịch nên phải đỏ.

`exit 0` ở bước này nghĩa là chân đo mù: sửa nó, đừng đi tiếp.

- [ ] **Step 4: Chứng ma trận toàn phần thật sự có răng**

Run: xoá tạm một dòng khỏi `toast-cua-lat.json`, chạy lại, rồi trả lại.
Expected: **exit 2** với câu "bang khai 10 loi goi toast nhung chan do chi nhan ra 11" — số lệch được gọi tên, không phải một lượt đạt.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/
git commit -m "test(acceptance): chân đo cho chữ ngoài JSX — toast và tiêu đề tab, có ma trận toàn phần"
```

---

### Task 3: Chân ③a bọc cho lát này

`independent: true` (so với Task 2)

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs`

**Interfaces:**
- Consumes: `lat()`, `GOC` từ Task 1; bộ quét `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/chu-cung-jsx.mjs`.

- [ ] **Step 1: Viết chân bọc**

Chép hình dạng từ `_acceptance/cua-vao-noi-tieng-viet/rang/chu-cung-lat.mjs`. Giữ nguyên ba cái răng của bản đó: từ chối đo khi bản khai trỏ đường không có trên đĩa, từ chối đo khi `soTuDia === 0`, và **đối chiếu `soQuet !== L.file.length`**.

Truyền danh sách file bằng mảng, KHÔNG bằng chuỗi nối:

```js
return execFileSync("node", [QUET, ...L.file], { cwd: GOC, encoding: "utf8" });
```

- [ ] **Step 2: Chạy trên cây thật — phải ĐỎ**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs`
Expected: **exit 1**, in 54 dòng `CHU CUNG: <file>:<dòng> [<loại>] "<chuỗi>"`.

- [ ] **Step 3: Chứng cái răng đối chiếu số file**

Run: thêm tạm một dòng `khong_quet` có tên vào `lat-cai-dat.json` cho một file thật, chạy lại, rồi trả lại.
Expected: **exit 2** — hai con số được gọi tên. (Bộ quét đọc 9, lát sinh 9 → khớp; nên để thấy răng, thay vào đó sửa tạm `chu-cung-lat.mjs` truyền thiếu một file và xác nhận nó `exit 2`.)

- [ ] **Step 4: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs
git commit -m "test(acceptance): bọc bộ quét JSX cho lát Cài đặt, có răng đối chiếu số file"
```

---

### Task 4: Chân đối chiếu hai hàng số

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs`

**Interfaces:**
- Consumes: `lat()` từ Task 1; `--chan doi-chieu` của Task 2; đầu ra của Task 3.

- [ ] **Step 1: Viết chân**

Hai hàng, in cả hai dù đỏ hay xanh:

```js
const hangFile = { latSinh: L.file.length, chanJsx: soJsxDoc, chanNgoai: soNgoaiDoc };
const hangVat = { toastNhanRa, toastKhai: BANG.loi_goi.length, tieuDeNhanRa, tieuDeKhai: 9 };
```

Luật: mọi số trong `hangFile` bằng nhau, và `toastNhanRa === toastKhai`, `tieuDeNhanRa === tieuDeKhai`. Lệch bất kỳ cặp nào → in cả hai hàng, gọi tên chân lệch, `exit 2`. `latSinh === 0` hoặc `toastNhanRa === 0` → `exit 2` (tập rỗng không bao giờ là đạt).

- [ ] **Step 2: Chạy — phải XANH ngay hôm nay**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs`
Expected: **exit 0**. Chân này đo bộ đo, không đo bản dịch, nên nó xanh cả trước lẫn sau khi dịch.

- [ ] **Step 3: Chứng cả hai hàng đều có răng**

Run: bỏ tạm một file khỏi danh sách truyền cho bộ quét → `exit 2` (hàng file). Trả lại. Xoá tạm một dòng khỏi `toast-cua-lat.json` → `exit 2` (hàng vật). Trả lại.
Expected: hai lần đỏ, mỗi lần gọi tên đúng hàng lệch.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs
git commit -m "test(acceptance): đối chiếu hai hàng số — file đã đọc và vật đã nhận ra"
```

---

### Task 5: Kho chuỗi, và nối mười file vào nó

**Files:**
- Create: `apps/app/lib/messages/settings.ts`
- Modify: 10 file dưới `apps/app/app/(app)/[slug]/settings/` (8 gốc + 2 currencies)

**Interfaces:**
- Produces: `export type SettingsMessages`, `export function settingsMessages(locale: Locale): SettingsMessages`.

- [ ] **Step 1: Lấy danh sách chuỗi từ chính bộ đo, không từ mắt**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs > /tmp/jsx.txt; node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs > /tmp/ngoai.txt`

74 chuỗi trong hai file đó là đề bài. Không thêm, không bớt.

- [ ] **Step 2: Viết `settings.ts`**

Nhóm khoá theo màn, không theo file: `chung` (workspace, model tác nhân, hạn lưu trữ, khoá nghiên cứu), `tienTe`, `thanhBen`, `tieuDe`, `bao` (toast). Hình dạng bắt buộc:

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
	thanhBen: {
		chung: "General",
		theoDoi: "Tracking & Analytics",
	},
} as const;

export type SettingsMessages = typeof en;

const vi = {
	thanhBen: {
		chung: "Chung",
		theoDoi: "Theo dõi & phân tích",
	},
} satisfies SettingsMessages;

const BANG = { en, vi } satisfies Record<Locale, SettingsMessages>;

export function settingsMessages(locale: Locale): SettingsMessages {
	return BANG[locale];
}
```

Nhãn theo luật `CONTEXT.md`: mang phần ngữ cảnh CHƯA cấp. Xoá một chữ mà người đứng ở màn đó vẫn hiểu đúng thì chữ đó thừa.

- [ ] **Step 3: Nối sáu file client**

Mỗi file: `const t = settingsMessages(useLocale());` rồi thay chuỗi bằng `t.<nhóm>.<khoá>`. `useLocale` nhập từ `@crm/ui/lib/locale` như các vòng trước làm.

- [ ] **Step 4: Nối bốn file server**

Mỗi file: `const t = settingsMessages(await getLocale());` với `getLocale` từ `@/lib/locale/server`. **Dùng đúng helper đã có** — vòng cửa vào từng đẻ ra một bản sao của nó và bị soi bắt.

`export const metadata` là hằng tĩnh nên không đọc được locale: đổi sang `export async function generateMetadata()`. Layout gốc đã đọc `cookies()` nên mọi route đã defer — không gây lỗi `cacheComponents`.

- [ ] **Step 5: Đánh dấu chỗ không dịch**

Tên thương hiệu, mã tiền tệ, và tên workspace người nhập: bọc phần tử chứa chúng bằng `translate="no"`.

- [ ] **Step 6: Chạy hai chân đo — phải chuyển từ ĐỎ sang XANH**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs && node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs`
Expected: cả hai **exit 0**. Đây là chiều xanh của cặp; chiều đỏ đã chứng ở Task 2 Step 3 và Task 3 Step 2 trên chính cây này.

- [ ] **Step 7: Kiểu và lint**

Run: `bun run check-types && bun run lint && bun run lint:slop`
Expected: cả ba exit 0. `satisfies SettingsMessages` bắt mọi khoá thiếu hoặc thừa ở bản `vi` ngay tại đây.

- [ ] **Step 8: Commit**

```bash
git add apps/app/lib/messages/settings.ts "apps/app/app/(app)/[slug]/settings"
git commit -m "feat(app): màn Cài đặt đọc chữ từ kho chuỗi, hai thứ tiếng"
```

---

### Task 6: Bộ canh kho chuỗi nhận thêm kho mới

**Files:**
- Modify: `apps/app/test/messages-guard.spec.ts`

- [ ] **Step 1: Chạy bài kiểm TRƯỚC khi sửa, xác nhận nó mù với kho mới**

Run: `cd apps/app && bun test test/messages-guard.spec.ts`
Expected: PASS — và đó chính là vấn đề: kho `settings.ts` vừa thêm chưa ai canh.

- [ ] **Step 2: Thêm kho vào danh sách `MODULE`**

```ts
import { settingsMessages } from "@/lib/messages/settings";

const MODULE = [
	["companies", companyMessages],
	["contacts", contactMessages],
	["deals", dealMessages],
	["record-sheet", recordSheetMessages],
	["crm", crmMessages],
	["auth", authMessages],
	["settings", settingsMessages],
] as const;
```

- [ ] **Step 3: Chứng chiều đỏ**

Run: đổi tạm một giá trị tiếng Việt trong `settings.ts` thành chuỗi không dấu, chạy lại bài kiểm, rồi trả lại.
Expected: FAIL, và thông điệp gọi tên đúng khoá đó.

- [ ] **Step 4: Chạy lại, phải xanh**

Run: `cd apps/app && bun test test/messages-guard.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/app/test/messages-guard.spec.ts
git commit -m "test(app): bộ canh kho chuỗi nhận thêm kho màn Cài đặt"
```

---

### Task 7: Bốn chân dựng màn thật

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs` (bốn chân: `hai-tieng`, `trang-thai-rong`, `khong-dich`, `be-rong`)
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khong-dich-cua-lat.json`

**Interfaces:**
- Consumes: máy chủ ở `APP_URL` (mặc định `http://localhost:3000`) và `API_URL` (`http://localhost:3001`).

- [ ] **Step 1: Chân `hai-tieng` (E13)**

Dựng cả hai màn hai lượt, `redirect: "manual"` — **không đi theo chuyển hướng**; gặp 3xx thì `exit 2` và gọi tên tiền đề thiếu (vòng cửa vào đã đo nhầm màn đúng vì bỏ luật này). Gom chuỗi người-đọc-thấy theo vị trí trong cây, rồi khẳng định ba vế của AC-1. Tập rỗng → `exit 2`.

- [ ] **Step 2: Chân `trang-thai-rong` (E5)**

Bước gieo trước khi chấm: tạo một workspace mới qua đúng luồng người dùng. Không dựng được → `exit 2`, gọi tên tiền đề thiếu. **Không được hạ xuống mức đọc mã rồi ghi đạt.**

- [ ] **Step 3: Chân `khong-dich` (E6, E14)**

Sinh tập ứng viên TỪ MÀN: mọi phần tử mang `translate="no"`, hợp với mọi chuỗi hiện giống hệt ở hai lượt. Đối chiếu với `khong-dich-cua-lat.json` **cả hai chiều** — thiếu một dòng, hoặc thừa một giá trị trên màn, đều `exit 2` và gọi tên.

- [ ] **Step 4: Chân `be-rong` (E10)**

Dựng ở bề rộng ghim **360**, hai lượt. Với mọi phần tử mang nhãn dịch được: `scrollWidth > clientWidth` là ĐỎ, in tên nhãn và hai con số. **Không miễn trừ `truncate`.** Lượt `en` là đối chứng dương: chỗ nào cả hai lượt cùng tràn thì báo riêng, không tính vào chân này. Tập rỗng → `exit 2`.

- [ ] **Step 5: Chạy cả bốn**

Run: `APP_URL=http://localhost:3000 API_URL=http://localhost:3001 node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs <chân>` cho từng chân.
Expected: exit 0. Chân nào không dựng được tiền đề thì `exit 2` — ghi thành giới hạn đã khai, KHÔNG ghi thành đạt.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/
git commit -m "test(acceptance): bốn chân dựng màn Cài đặt thật — hai tiếng, rỗng, không dịch, bề rộng"
```

---

### Task 8: Chân đột biến — phép đo của các phép đo

**Files:**
- Create: `_acceptance/man-cai-dat-noi-tieng-viet/rang/dot-bien.mjs`

- [ ] **Step 1: Viết chân**

Chép lát sang bản sao trong thư mục tạm (suy từ `GOC`, KHÔNG hardcode). Rồi với **mỗi hình dạng** trong `toast-cua-lat.json`, cộng một lượt cho JSX và một lượt cho `title`: cắm lại một câu tiếng Anh, chạy chân tương ứng, đòi nó ĐỎ.

Chân nào không đỏ khi vật đã bị phá là thước mù → eval này ĐỎ và gọi tên chân mù đó.

Chiều còn lại: trên bản sao KHÔNG bị phá, cả ba chân đều xanh.

Bản sao phải bị xoá sau khi chạy, và lát thật KHÔNG được động tới. Khẳng định điều đó bằng `git status --porcelain` trước và sau, phải giống nhau.

- [ ] **Step 2: Chạy**

Run: `node _acceptance/man-cai-dat-noi-tieng-viet/rang/dot-bien.mjs`
Expected: exit 0, in ra danh sách từng hình dạng đã thử và chân nào đỏ vì nó.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/dot-bien.mjs
git commit -m "test(acceptance): chân đột biến — cắm lại tiếng Anh vào từng hình dạng, đòi từng thước đỏ"
```

---

### Task 9: Khai ổ cắm vào config

**Files:**
- Modify: `_acceptance/config.yaml`

- [ ] **Step 1: Thêm mười ổ cắm dưới `executors.script`**

```yaml
    cai_dat_chu_cung_jsx: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs"
    cai_dat_chu_ngoai_jsx: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --chan toast"
    cai_dat_tieu_de: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --chan tieu-de"
    cai_dat_khong_du_quyen: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --chan khong-du-quyen"
    cai_dat_khai_sinh: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs"
    cai_dat_dan_so_tu_dia: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs --chan dan-so"
    cai_dat_dot_bien: "node _acceptance/man-cai-dat-noi-tieng-viet/rang/dot-bien.mjs"
    cai_dat_hai_tieng: "APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs hai-tieng"
    cai_dat_trang_thai_rong: "APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs trang-thai-rong"
    cai_dat_khong_dich: "APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs khong-dich"
    cai_dat_be_rong: "APP_URL=${APP_URL:-http://localhost:3000} API_URL=${API_URL:-http://localhost:3001} node _acceptance/man-cai-dat-noi-tieng-viet/rang/man-that.mjs be-rong"
```

- [ ] **Step 2: Đối chiếu ổ cắm với evals**

Run:
```bash
for k in $(grep -o 'config:executors\.script\.[a-z_]*' _acceptance/man-cai-dat-noi-tieng-viet/evals.yaml | sed 's/.*\.//' | sort -u); do
  grep -q "^    $k:" _acceptance/config.yaml && echo "OK  $k" || echo "THIEU $k"
done
```
Expected: mọi dòng `OK`. Một dòng `THIEU` làm `s4-args.mjs` thoát có tên ở S4.

- [ ] **Step 3: Đặt contract sang `implemented` và commit**

```bash
git add _acceptance/config.yaml _acceptance/man-cai-dat-noi-tieng-viet/contract.md
git commit -m "chore(acceptance): khai mười một ổ cắm cho vòng màn Cài đặt"
```

---

## Self-Review

**Spec coverage.** Mười hai AC → task: AC-1 → Task 7 Step 1 · AC-1b → Task 3 · AC-2 → Task 2 · AC-3 → Task 2 Step 2 · AC-4 → Task 2 (chân `khong-du-quyen`) · AC-5 → Task 7 Step 2 · AC-6 → Task 7 Step 3 · AC-6b → Task 7 Step 3 · AC-7 → Task 8 · AC-8 → Task 4 · AC-9 → Task 1 Step 4 · AC-10 → Task 7 Step 4. Không AC nào không có task.

**Placeholder scan.** Không có "TBD"/"tương tự Task N". Chỗ duy nhất không inline nguyên văn là 74 chuỗi bản dịch — chúng đến từ đầu ra của bộ đo ở Task 5 Step 1 chứ không từ trí nhớ, và đó là cố ý.

**Type consistency.** `settingsMessages` / `SettingsMessages` dùng nhất quán ở Task 5 và Task 6. `lat()` trả cùng hình dạng ở Task 1, dùng ở Task 2, 3, 4, 8. `toast-cua-lat.json` khoá `loi_goi` dùng nhất quán ở Task 2, 4, 8.

**Thứ tự có chủ ý.** Task 2 và 3 dựng thước TRƯỚC khi Task 5 dịch, để chiều đỏ được chứng trên hiện trạng thật thay vì trên một bản sao dựng riêng.
