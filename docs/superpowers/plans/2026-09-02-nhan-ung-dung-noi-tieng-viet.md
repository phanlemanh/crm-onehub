# Nhãn ứng dụng nói tiếng Việt — vòng ③a, kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nhân viên quan hệ đối tác làm trọn ba việc hằng ngày — thêm một công
ty, ghi một hoạt động, cập nhật một thoả thuận — mà màn hình nói tiếng Việt
suốt cả ba.

**Architecture:** Nối dài kho chuỗi vòng ② đã dựng — object `en` và object `vi`
`satisfies` cùng một kiểu, hàm cho câu ghép biến, một module một vùng. Ba lối
đọc theo chỗ gọi: hook ở component trình duyệt, hàm `await getLocale()` ở trang
máy chủ vẽ, và hàm thuần nhận `locale` làm tham số ở file `.ts`. Không thêm thư
viện đa ngôn ngữ.

**Tech Stack:** TypeScript · Next 16 (Cache Components) · React · bun test ·
puppeteer-core cho giàn đo trình duyệt · zod ở biên dữ liệu.

**Spec:** `docs/superpowers/specs/2026-09-02-nhan-ung-dung-noi-tieng-viet-design.md`

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm vào mã sửa. (`AGENTS.md`)
- **`/packages/ui` là nguồn duy nhất của giao diện.** Vòng này KHÔNG sửa component ở đó — vòng ② đã cho chúng nhận chuỗi từ ngoài.
- **Một `.env` duy nhất ở gốc.** Vòng này không thêm biến môi trường nào.
- **Phân tích ở biên bằng zod**, không truyền `Record<string, unknown>` đi vòng quanh. (`AGENTS.md`)
- **Component trình duyệt không được nhập gói máy chủ** (`@crm/auth`, `@crm/db`). (`AGENTS.md`)
- **Bốn lệnh chứng minh, chạy từ gốc kho, không export gì:** `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`.
- **Máy chủ dev phải chạy TỪ CÂY LÀM VIỆC này**, không dùng máy chủ ở cổng 3000 của kho gốc. Dựng riêng: `cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev`. Kiểm bằng `ps ax | grep next` TRƯỚC khi tin bất kỳ con số nào.
- **Mọi phép đo mới phải sinh kèm cặp hai chiều trên CÙNG một fixture**: vật lành → xanh; phá vật thật trong bản sao → đỏ với thông điệp ghim tên. Thiếu cặp thì task CHƯA XONG.
- **Không dựng máy quét mã để chứng minh sự vắng mặt.** Quét để ĐẾM PHẠM VI thì được.
- **Kịch bản đo không được khôi phục file bằng `git checkout`** — nó xoá mất bản sửa chưa commit. Khôi phục bằng nội dung đã chụp trong bộ nhớ.
- **Nhãn mang phần ngữ cảnh chưa cấp** (`CONTEXT.md`), và **cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật** — giữ tên thật, đặt trong ngoặc khi cần.

---

## Cấu trúc file

**Kho chuỗi — tạo mới, mỗi module một vùng:**

| File | Chịu trách nhiệm gì |
| --- | --- |
| `apps/app/lib/messages/contacts.ts` | chữ của màn danh sách cá nhân |
| `apps/app/lib/messages/deals.ts` | chữ của màn danh sách thoả thuận |
| `apps/app/lib/messages/record-sheet.ts` | chữ của hồ sơ bản ghi, mọi tab |
| `apps/app/lib/messages/crm.ts` | chữ dùng chung của vùng CRM: dòng thời gian, trường, trạng thái bổ sung dữ liệu, hành động hàng loạt |

Khuôn chép từ `apps/app/lib/messages/companies.ts` đã có.

**Sửa — mã sản phẩm:**

| File | Sửa gì |
| --- | --- |
| `apps/app/lib/enrichment-status.ts` | năm nhãn trạng thái nhận `locale` làm tham số |
| `apps/app/components/local-date-time.tsx` | ba chữ thời gian tương đối và ba hậu tố lấy từ kho chuỗi |
| `apps/app/components/crm/deal-stage.tsx` · `apps/app/lib/deal-stage.ts` | bọc giá trị giai đoạn trong phần tử khai `lang="en"` |
| 48 file chỗ gọi trong lát | thay chuỗi khoá cứng bằng chuỗi từ kho |
| ba bảng danh sách | nới bề rộng cột |

**Tạo — giàn đo:**

| File | Chịu trách nhiệm gì |
| --- | --- |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` | tám chân đo qua trình duyệt (đã có bản sao từ vòng ①, phải dựng các chân mới) |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs` | danh sách bề mặt phải mở, khai trước, dùng chung cho E1 và E2 |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs` | trả từng khoá về tiếng Anh, một khoá một lượt |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs` | dựng ba trạng thái dữ liệu biên rồi đo |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh` | lấy HTML lượt vẽ đầu bằng curl |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh` | chặn chống-lách: không chân nào chứng minh vắng mặt bằng đọc mã |
| `apps/app/test/messages-guard.spec.ts` | canh kho chuỗi: dấu tiếng Việt, ma trận hàm ghép biến |
| `_acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md` | bảng dịch chốt TRƯỚC khi chạm mã |

---

## Task 1: Dựng ba trạng thái dữ liệu mà phép đo hiện không chạm được

`independent: true`

Máy chủ trả: 0 trên 15 công ty thiếu người phụ trách, 0 công ty có hoạt động.
Không có ba trạng thái này thì E11 mù, và ba chữ thời gian tương đối không phép
đo nào chạm tới — đúng lỗ vòng ① để lại.

**Files:**
- Modify: `packages/db/prisma/seed.ts`
- Test: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`

**Interfaces:**
- Consumes: không gì.
- Produces: ba hàng có thể truy được từ máy chủ — một công ty `owner: null`; một công ty `lastActivityAt` trong 7 ngày; một công ty tên đúng 52 ký tự. Task 9 dùng chúng.

- [ ] **Step 1: Viết chân đo trước, và cho nó ĐỎ trên dữ liệu hiện tại**

Tạo `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`. Nó gọi
`companies.list` qua tRPC, đếm ba trạng thái, và in số hàng tìm được cho từng
trạng thái:

```js
const can = [
  { ten: "khong nguoi phu trach", loc: (r) => r.owner === null },
  { ten: "co hoat dong trong 30 ngay", loc: (r) => r.lastActivityAt !== null },
  { ten: "ten 40-60 ky tu", loc: (r) => r.name.length >= 40 && r.name.length <= 60 },
];
let thieu = 0;
for (const c of can) {
  const n = rows.filter(c.loc).length;
  console.log(`   ${n === 0 ? "THIEU" : "co   "} ${String(n).padStart(3)} hang · ${c.ten}`);
  if (n === 0) thieu += 1;
}
console.log(`ket qua: trang thai thieu=${thieu}`);
process.exit(thieu > 0 ? 1 : 0);
```

- [ ] **Step 2: Chạy, xác nhận nó ĐỎ và gọi tên đúng ba trạng thái thiếu**

Run: `node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`
Expected: exit 1, in `THIEU` cho cả ba dòng, `trang thai thieu=3`.

Đây là chiều đỏ của chính task này: chân đo phải đỏ TRƯỚC khi có dữ liệu.

- [ ] **Step 3: Thêm ba hàng vào seed**

Trong `packages/db/prisma/seed.ts`, thêm ba công ty vào danh sách đang có. Tên
công ty thứ ba đếm đúng 52 ký tự:

```ts
{ name: "Công ty Cổ phần Đầu tư và Phát triển Địa ốc Phú Mỹ", domain: "phumy.vn", industry: "Real Estate", ownerId: null },
{ name: "Nhà Đất Thủ Đức", domain: "nhadatthuduc.vn", industry: "Real Estate", ownerId: SEED_OWNERS.ada },
{ name: "Sàn Giao Dịch Bất Động Sản Hoàng Gia", domain: "hoanggia.vn", industry: "Real Estate", ownerId: null },
```

Công ty thứ hai phải có một hoạt động gần đây. Trong khối sinh hoạt động của
seed, thêm một bản ghi `lastActivityAt` cách hiện tại 2 ngày cho `nhadatthuduc.vn`.

- [ ] **Step 4: Nạp lại dữ liệu thử và chạy lại chân đo**

Run: `bun run db:seed && node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`
Expected: exit 0, ba dòng `co`, `trang thai thieu=0`.

- [ ] **Step 5: Chiều đỏ trên vật thật**

Xoá tạm hàng `owner: null` khỏi seed, nạp lại, chạy chân đo. Expected: exit 1 và
in `THIEU   0 hang · khong nguoi phu trach`. Khôi phục hàng, nạp lại, xanh.

Ghi kết quả cả hai chiều vào phần Notes của task khi commit.

- [ ] **Step 6: Commit**

```bash
git add packages/db/prisma/seed.ts _acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs
git commit -m "test(db): give the fixture the three states no measure could reach"
```

---

## Task 2: Chốt bảng dịch trước khi chạm mã

`independent: true`

Vòng ② học: hội đồng chấm đúng bảng đã chốt, không chấm chữ chưa ai khai. E14
đòi `ban-dich.md` tồn tại và TRƯỢT CỨNG nếu thiếu.

**Files:**
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md`

**Interfaces:**
- Consumes: `CONTEXT.md` (từ điển sản phẩm), `apps/app/lib/messages/companies.ts` (nhãn vòng ① đã chốt).
- Produces: bảng `| khoá | tiếng Anh | tiếng Việt | ghi chú |` cho mọi chuỗi trong lát. Task 4–7 chép giá trị từ đây, không tự đặt chữ.

- [ ] **Step 1: Liệt kê mọi chuỗi trong lát, do máy sinh**

Run: `node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/phan-loai.mjs`
Rồi chạy bản `day-du` của `dem-pham-vi.mjs` giới hạn theo lát để lấy từng chuỗi
kèm file và dòng.

- [ ] **Step 2: Viết bảng dịch**

Khuôn mỗi dòng:

```markdown
| `crm.timeline.empty` | No activity yet. | Chưa có hoạt động nào. | câu rỗng của dòng thời gian |
```

Luật áp cho từng dòng, chép từ `CONTEXT.md`:
- Nhãn mang phần ngữ cảnh **chưa cấp**; xoá một chữ mà người đứng ở màn đó vẫn hiểu đúng thì chữ đó thừa.
- Không tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật.
- Danh từ sản phẩm theo từ điển: **công ty** · **cá nhân** · **thoả thuận hợp tác**. `liên hệ`, `contact`, `deal`, `cơ hội`, `giao dịch` nằm trong danh sách cấm.
- Mọi giá trị tiếng Việt mang ít nhất một dấu tiếng Việt.

- [ ] **Step 3: Kiểm bảng bằng máy, không bằng mắt**

Run:
```bash
node -e "
const fs=require('fs');
const rows=[...fs.readFileSync('_acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md','utf8').matchAll(/^\| \`([^\`]+)\` \| (.+?) \| (.+?) \|/gm)];
const DAU=/[ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i;
const xau=rows.filter(r=>!DAU.test(r[3]));
console.log('dong:',rows.length,'· khong mang dau tieng Viet:',xau.length);
for(const r of xau) console.log('  ',r[1],'->',r[3]);
process.exit(xau.length?1:0);"
```
Expected: exit 0. Dòng nào không mang dấu phải có ghi chú lý do ở cột bốn.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/ban-dich.md
git commit -m "docs(acceptance): pin the words before touching a line of code"
```

---

## Task 3: Danh sách bề mặt phải mở, và chân bản vẽ ba màn

Phản biện ngữ cảnh sạch gọi đây là lỗ thứ BA cùng một loại: không phép đo nào mở
menu, nên chữ trong menu không bao giờ vào DOM. Chân này phải khai trước danh
sách, mở đủ số đó, và in tên từng cái.

**Files:**
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs`
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` (dựng chân `ba-man`)

**Interfaces:**
- Consumes: giàn bản vẽ thừa kế từ vòng ① (dựng hai lần, trừ phần giống hệt, danh sách trung tính sinh từ máy chủ, đếm SỐ LẦN).
- Produces: `export const BE_MAT` — mảng `{ man, ten, mo(page) }`. Task 4 dùng lại cho hồ sơ bản ghi.

- [ ] **Step 1: Khai danh sách bề mặt**

```js
export const BE_MAT = [
  { man: "companies", ten: "menu Bo loc", mo: (p) => bamNut(p, "filters") },
  { man: "companies", ten: "menu con facet Phu trach", mo: (p) => reMenuCon(p, 0) },
  { man: "companies", ten: "menu con facet Nganh", mo: (p) => reMenuCon(p, 1) },
  { man: "companies", ten: "menu Sap xep", mo: (p) => bamNut(p, "sort") },
  { man: "companies", ten: "menu Cot", mo: (p) => bamNut(p, "columns") },
  { man: "companies", ten: "menu Views", mo: (p) => bamNut(p, "views") },
  { man: "companies", ten: "hop thoai tao moi", mo: (p) => bamNut(p, "new") },
];
```
Lặp cùng bảy dòng cho `contacts` và `deals`.

- [ ] **Step 2: Viết chân `ba-man`, đỏ trước khi có bản dịch**

Chân dựng mỗi màn hai lần (`lang=vi`, `lang=en`), mở đủ `BE_MAT` của màn đó, gom
chữ ở cả page-shell lẫn nội dung menu, trừ phần giống hệt và trừ danh sách trung
tính sinh từ máy chủ. In:

```
-- man companies · be mat khai=7 · da mo=7
   da mo: menu Bo loc · menu con facet Phu trach · … 
-- CON LAI (n chuoi / m lan)
ket qua: con lai=… · khong dau=… · lan=… · be mat lech=0
```

`be mat lech` khác 0 là chân ĐỎ, bất kể số chuỗi còn lại.

- [ ] **Step 3: Chạy trên mã CHƯA dịch — phải ĐỎ**

Run: `APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs --chan ba-man`
Expected: exit 1, `con lai` là một số lớn (contacts và deals còn nguyên tiếng Anh),
và `be mat lech=0`.

Đây là đường chuẩn: ghi con số này vào Notes, Task 7 sẽ đưa nó về 0.

- [ ] **Step 4: Chiều đỏ của chính danh sách bề mặt**

Xoá tạm một dòng khỏi `BE_MAT` rồi chạy lại. Expected: `be mat lech=1` và chân
đỏ, in tên bề mặt bị thiếu. Khôi phục.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/
git commit -m "test(acceptance): make the measure open every surface it claims to read"
```

---

## Task 4: Chân bản vẽ cho hồ sơ bản ghi và dòng thời gian

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/be-mat.mjs` (thêm bề mặt của hồ sơ)
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` (chân `ho-so`, chân `dong-thoi-gian`)

**Interfaces:**
- Consumes: `BE_MAT` từ Task 3.
- Produces: hai chân `--chan ho-so` và `--chan dong-thoi-gian`.

- [ ] **Step 1: Thêm bề mặt của hồ sơ vào `BE_MAT`**

Mỗi tab của hồ sơ, mỗi menu hành động, mỗi ô sửa tại chỗ, hộp thoại xác nhận.

- [ ] **Step 2: Chân `ho-so`** — mở hồ sơ một công ty, một cá nhân, một thoả
thuận; cuộn hết; mở đủ bề mặt đã khai; đếm như Task 3.

- [ ] **Step 3: Chân `dong-thoi-gian` với HAI đường hỏng**

```js
// (a) hong phia trinh duyet
await page.setOfflineMode(true);
await luu(page);
const chuA = await docThongBao(page);
// (b) hong THAT tu may chu
await page.setOfflineMode(false);
await guiBanGhiMayChuTuChoi(page);
const chuB = await docThongBao(page);
console.log(`   (a) trinh duyet hong -> ${JSON.stringify(chuA)}`);
console.log(`   (b) may chu tu choi  -> ${JSON.stringify(chuB)}`);
```

Đường (a) phải tiếng Việt, và là chiều đỏ của chân. Đường (b) **không phải chiều
đỏ** — nó ghi lại nguyên văn chữ máy chủ trả về, để chỗ đứt nằm trong hồ sơ chứ
không bị giấu. Hợp đồng khai câu máy chủ thuộc vòng ④.

- [ ] **Step 4: Chạy cả hai chân trên mã chưa dịch, ghi đường chuẩn**

Expected: cả hai exit 1 với số chuỗi còn lại lớn.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/nhan-ung-dung-noi-tieng-viet/rang/
git commit -m "test(acceptance): measure the record sheet and the timeline, both failure paths"
```

---

## Task 5: Kho chuỗi bốn module, và bài kiểm canh nó

**Files:**
- Create: `apps/app/lib/messages/contacts.ts` · `deals.ts` · `record-sheet.ts` · `crm.ts`
- Create: `apps/app/test/messages-guard.spec.ts`

**Interfaces:**
- Consumes: `ban-dich.md` (Task 2) — giá trị chép từ đó, không tự đặt.
- Produces: `contactMessages(locale)` · `dealMessages(locale)` · `recordSheetMessages(locale)` · `crmMessages(locale)`, mỗi hàm trả `Messages` của vùng đó. Task 6–8 gọi chúng.

- [ ] **Step 1: Viết bài kiểm TRƯỚC, cho nó đỏ**

`apps/app/test/messages-guard.spec.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { contactMessages } from "../lib/messages/contacts";

const DAU_TIENG_VIET = /[ăâđêôơưÁÀẢÃẠáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i;

function phang(o: object, tien = ""): [string, unknown][] {
  return Object.entries(o).flatMap(([k, v]) =>
    v !== null && typeof v === "object" ? phang(v, `${tien}${k}.`) : [[`${tien}${k}`, v]],
  );
}

describe("kho chuoi cua vong ③a", () => {
  test("moi gia tri tieng Viet mang it nhat mot dau tieng Viet", () => {
    const xau = phang(contactMessages("vi"))
      .map(([k, v]) => [k, v instanceof Function ? v("X", "Y", "Z") : String(v)] as const)
      .filter(([, s]) => !DAU_TIENG_VIET.test(s));
    expect(xau).toEqual([]);
  });
});
```

- [ ] **Step 2: Chạy, xác nhận đỏ vì module chưa tồn tại**

Run: `cd apps/app && bun test test/messages-guard.spec.ts`
Expected: FAIL — `Cannot find module '../lib/messages/contacts'`.

- [ ] **Step 3: Viết bốn module**

Khuôn chép từ `apps/app/lib/messages/companies.ts`:

```ts
import type { Locale } from "@crm/ui/lib/locale";

const en = {
  headers: { name: "Name", email: "Email" },
  empty: "No contacts match this view.",
} as const;

type ContactMessages = typeof en;

const vi = {
  headers: { name: "Tên", email: "Thư điện tử" },
  empty: "Chưa có cá nhân nào khớp bộ lọc này.",
} satisfies ContactMessages;

const BANG = { en, vi } satisfies Record<Locale, ContactMessages>;

export function contactMessages(locale: Locale): ContactMessages {
  return BANG[locale] ?? BANG.en;
}
```

`vi satisfies ContactMessages` là chỗ trình biên dịch bắt thiếu khoá — đó là nửa
đầu của AC-12. Giá trị chép từ `ban-dich.md`.

- [ ] **Step 4: Mở rộng bài kiểm ra cả bốn module, và thêm ma trận hàm ghép biến**

```ts
const MODULE = [
  ["contacts", contactMessages], ["deals", dealMessages],
  ["record-sheet", recordSheetMessages], ["crm", crmMessages],
] as const;

test("moi ham ghep bien co khang dinh, va so ham = so khang dinh", () => {
  const GHIM: Record<string, [string, string]> = {
    "crm.bulk.archived": ["1 công ty đã lưu trữ.", "12 công ty đã lưu trữ."],
  };
  const ham = MODULE.flatMap(([ten, f]) =>
    phang(f("vi")).filter(([, v]) => v instanceof Function).map(([k]) => `${ten}.${k}`),
  );
  expect(ham.filter((k) => !(k in GHIM))).toEqual([]);
  for (const [khoa, [mot, nhieu]] of Object.entries(GHIM)) {
    expect(goi(khoa, 1)).toBe(mot);
    expect(goi(khoa, 12)).toBe(nhieu);
  }
});
```

Chân `expect(ham.filter(...)).toEqual([])` là chỗ một module mọc thêm hàm thứ
N+1 mà không ai khẳng định thì bài kiểm đỏ — lỗ P1 phản biện tìm ra.

- [ ] **Step 5: Chạy bốn lệnh**

Run: `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` · `bun run lint:slop`
Expected: tất cả exit 0.

- [ ] **Step 6: Chiều đỏ, hai lượt**

1. Xoá một khoá khỏi object `vi` của `contacts.ts`. Run `bun run check-types`.
   Expected: đỏ, thông điệp gọi tên khoá thiếu. Khôi phục.
2. Đổi một giá trị `vi` thành một chuỗi tiếng Anh KHÁC (ví dụ `"Order by"`).
   Run `cd apps/app && bun test test/messages-guard.spec.ts`. Expected: đỏ, gọi
   tên khoá. Khôi phục.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages apps/app/test/messages-guard.spec.ts
git commit -m "feat(app): give the three flows a message store the compiler can check"
```

---

## Task 6: Ba lối đọc — trang máy chủ vẽ, component trình duyệt, file `.ts` thuần

**Files:**
- Modify: `apps/app/lib/enrichment-status.ts`
- Modify: `apps/app/components/local-date-time.tsx`
- Modify: các file `.ts` thuần trong lát mang chữ người đọc

**Interfaces:**
- Consumes: bốn hàm từ Task 5.
- Produces: `enrichmentPresentation(status, queued, locale)` — chữ ký đổi, mọi chỗ gọi phải truyền `locale`. Task 7 sửa các chỗ gọi đó.

- [ ] **Step 1: `enrichment-status.ts` nhận vùng**

```ts
export function enrichmentPresentation(
	status: EnrichmentStatus,
	queued: boolean,
	locale: Locale,
): { label: string; tone: StatusTone; busy?: boolean } {
	const m = crmMessages(locale).enrichment;
	...
}
```
`ENRICHMENT_FACET_OPTIONS` thành hàm `enrichmentFacetOptions(locale)`.

- [ ] **Step 2: Ba chữ thời gian tương đối lấy từ kho chuỗi**

Trong `local-date-time.tsx`, `formatRelativeTime` đã nhận `locale` từ vòng ①. Thay
`"just now"`, `"in "`, `" ago"` và ba hậu tố `m`/`h`/`d` bằng giá trị từ
`crmMessages(locale).time`. Kịch bản nạp ở trình duyệt nhận cùng bảng qua một
thuộc tính `data-` trên thẻ `<script>`, đọc bằng `JSON.parse`.

- [ ] **Step 3: Chạy `check-types`, sửa hết chỗ gọi vỡ**

Run: `bun run check-types`
Expected: đỏ, liệt kê mọi chỗ gọi `enrichmentPresentation` thiếu tham số. Sửa từng
chỗ bằng cách truyền `locale` — component trình duyệt lấy từ `useLocale()`, trang
máy chủ lấy từ `await getLocale()`.

- [ ] **Step 4: Bốn lệnh xanh**

- [ ] **Step 5: Chiều đỏ**

Đổi `crmMessages(locale)` thành `crmMessages("en")` ở một chỗ trong
`enrichment-status.ts`, chạy chân `ba-man`. Expected: đỏ và gọi tên nhãn trạng
thái đó. Khôi phục.

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(app): let the status labels and relative times follow the reader"
```

---

## Task 7: Thay chuỗi khoá cứng ở 48 chỗ gọi

Task lớn nhất. Chia theo module kho chuỗi, mỗi module một lượt commit.

**Files:**
- Modify: 48 file mang chữ trong lát

**Interfaces:**
- Consumes: bốn hàm từ Task 5, `useLocale()`, `getLocale()`.
- Produces: không chuỗi khoá cứng nào còn lại trong lát.

- [ ] **Step 1: Màn danh sách cá nhân**

Thay từng chuỗi bằng `m.<khoá>` với `const m = contactMessages(useLocale())`.
Run chân đo sau mỗi file: chân `ba-man` phải giảm số `con lai`.

- [ ] **Step 2: Màn danh sách thoả thuận** — như trên, `dealMessages`.

- [ ] **Step 3: Năm chuỗi vòng ① gửi sang**

`companies-table.tsx:264` ô tìm · nút `Archived` · `saved-views-menu.tsx` nút
`Views` · `create-company-sheet.tsx` nút `New company` · năm nhãn trạng thái đã
xong ở Task 6.

- [ ] **Step 4: Hồ sơ bản ghi** — `recordSheetMessages`.

- [ ] **Step 5: Vùng CRM dùng chung** — `crmMessages`; dòng thời gian, trường, hành động hàng loạt.

- [ ] **Step 6: Chạy ba chân bản vẽ, cả ba phải về 0**

Run:
```bash
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs --chan ba-man
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs --chan ho-so
APP_URL=http://localhost:3100 node _acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs --chan dong-thoi-gian
```
Expected: cả ba `con lai=0 · khong dau=0`, và `be mat lech=0`.

- [ ] **Step 7: Bốn lệnh xanh, rồi commit từng module**

---

## Task 8: Khai tiếng cho chữ tiếng Anh còn lại, và bảy giai đoạn thoả thuận

`independent: true` (không đụng file của Task 7 ngoài `deal-stage`)

**Files:**
- Modify: `apps/app/components/crm/deal-stage.tsx` · `apps/app/components/crm/stage-stepper.tsx` · các chỗ vẽ giá trị `industry`
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` (chân `khai-tieng`, chân `giai-doan`)

**Interfaces:**
- Consumes: danh sách giá trị enum lấy từ máy chủ.
- Produces: mọi phần tử chứa giá trị tiếng Anh từ cơ sở dữ liệu mang `lang="en"`.

- [ ] **Step 1: Viết chân `khai-tieng` trước, cho nó đỏ**

Chân duyệt DOM trên trang `lang=vi`, với từng giá trị dữ liệu lấy từ tRPC, tìm
node chứa nó và đi ngược lên tìm tổ tiên khai `lang="en"`. In tên từng giá trị
không được bọc.

Run: expected exit 1, liệt kê `Software`, `Banking`, `DEMO_BOOKED`…

- [ ] **Step 2: Bọc chỗ vẽ**

```tsx
<span lang="en">{row.industry}</span>
```
Với giai đoạn thoả thuận, bọc ở `deal-stage.tsx` — một chỗ, mọi chỗ gọi hưởng theo.

- [ ] **Step 3: Chân `giai-doan` gọi tên đủ bảy giá trị**

Danh sách bảy giá trị lấy từ enum của cơ sở dữ liệu qua máy chủ, không viết tay.
Thêm một giai đoạn thứ tám mà không bọc thì chân đỏ.

- [ ] **Step 4: Chiều đỏ** — gỡ `lang="en"` khỏi một chỗ, chân đỏ và gọi tên giá trị đó. Khôi phục.

- [ ] **Step 5: Bốn lệnh xanh, commit**

```bash
git commit -am "feat(app): let a screen reader hear the English values in an English voice"
```

---

## Task 9: Bề rộng cột, và file chữ-hiện-ra cho hội đồng

**Files:**
- Modify: `apps/app/app/(app)/[slug]/companies/companies-table.tsx` · `contacts/contacts-table.tsx` · `deals/deals-table.tsx`
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` (chân `be-rong` xuất file)

**Interfaces:**
- Consumes: chân `be-rong` thừa kế từ vòng ①, đã biết đo chữ-thật-hiện-ra bằng dựng từng tiền tố.
- Produces: `evidence/E10-chu-hien-ra.txt` — đầu vào bắt buộc của E14.

- [ ] **Step 1: Đo đường chuẩn ở bốn bề rộng, ba bảng, hai thứ tiếng**

Run chân `be-rong` cho từng bảng. Ghi số `cat kem ba cham` từng ô vào Notes.

- [ ] **Step 2: Nới bề rộng cột cho tới khi ≥1024px không cột nào bị cắt**

Sửa các lớp `w-[N%]` ở ba bảng. Cột ô đánh dấu chiếm ~120px ở 768px trong khi bốn
tiêu đề bên cạnh bị cắt — thu nó lại trước.

- [ ] **Step 3: Chân `be-rong` xuất file chữ-hiện-ra**

```
| cot | be rong o | be rong chu | 768px | 1024px | 1280px | 1440px |
| Số lượng cá nhân | 87,69 | 95,05 | (an) | Số lượn… | Số lượng cá … | Số lượng cá n… |
```

- [ ] **Step 4: Chân xanh ở ngưỡng của AC-10**

Expected: `>=1024px: cat=0` cho cả ba bảng; ở 768px mọi chỗ cắt có ba chấm và `title`.

- [ ] **Step 5: Chiều đỏ** — thu một cột xuống dưới bề rộng chữ ở 1024px, chân đỏ và gọi tên cột. Khôi phục.

- [ ] **Step 6: Commit**

```bash
git commit -am "fix(app): give every column header room before the ellipsis is needed"
```

---

## Task 10: Bốn chân còn lại, và chặn chống-lách

**Files:**
- Modify: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs` (chân `trinh-doc-man-hinh`, `doi-tieng`, `no-vong-1`)
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh`
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh`
- Create: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs`

- [ ] **Step 1: Chân `no-vong-1` gọi tên từng chuỗi**

In năm dòng, mỗi dòng một chuỗi tiếng Anh cũ kèm chuỗi tiếng Việt đang thay nó.
Trả một con số là chân sai — AC-4 đòi gọi tên.

- [ ] **Step 2: Chân `trinh-doc-man-hinh`** — đọc cây trợ năng, gom tên truy cập và mọi `aria-*`, `title`, `alt`.

- [ ] **Step 3: Chân `doi-tieng`** — đổi tiếng, khẳng định `performance.timeOrigin` không đổi và một component máy chủ chưa vẽ lại vẫn đổi chữ.

- [ ] **Step 4: `may-chu-ve.sh`** — `curl` ba màn, khẳng định chuỗi tiếng Việt có trong lượt trả về đầu và chuỗi tiếng Anh tương ứng không có.

- [ ] **Step 5: `dot-bien.mjs`** — chép khuôn từ `_acceptance/tieng-viet-cho-crm/rang/dot-bien.mjs`, mở rộng ra bốn module. Giữ nguyên hai phép kiểm của bản gốc: đột biến đúng 1 dòng khác bản gốc, và khôi phục bằng nội dung đã chụp chứ KHÔNG bằng `git checkout`.

- [ ] **Step 6: `khong-may-quet.sh`** — chặn chống-lách: đọc `evals.yaml`, khẳng định không chân nào từ E1 đến E11 chỉ grep mã nguồn.

```bash
XAU=$(grep -rlE '^\s*(grep|rg)\b' _acceptance/nhan-ung-dung-noi-tieng-viet/rang/*.mjs \
  | xargs -r grep -Ln 'puppeteer|curl|bun test')
[ -n "$XAU" ] && { echo "RANG DO: chan chi grep ma nguon: $XAU"; exit 1; }
```

- [ ] **Step 7: Chiều đỏ cho `khong-may-quet.sh`** — thêm một chân giả chỉ grep mã nguồn, chân này phải đỏ và gọi tên chân giả. Xoá chân giả.

- [ ] **Step 8: Quét đột biến đầy đủ, bắt ≥95%**

Mọi khoá không bắt được phải có tên cùng lý do ghi vào `evidence/`.

- [ ] **Step 9: Bốn lệnh xanh, commit**

---

## Self-review

**Spec coverage:** 14 tiêu chí, đối chiếu từng cái — AC-1 Task 3+7 · AC-2 Task 4+7
· AC-3 Task 4+7 · AC-4 Task 7+10 · AC-5 Task 10 · AC-6 Task 5 · AC-7 Task 8 ·
AC-8 Task 10 · AC-9 Task 10 · AC-10 Task 9 · AC-11 Task 1+9 · AC-12 Task 5 ·
AC-13 Task 2 (bảng dịch) + hội đồng ở S4 · AC-14 Task 8. Không tiêu chí nào
không có task.

**Placeholder scan:** không dòng nào ghi TBD hay "xử lý lỗi phù hợp". Mọi bước
có mã hoặc lệnh chạy được.

**Type consistency:** `contactMessages` · `dealMessages` · `recordSheetMessages`
· `crmMessages` dùng cùng tên ở Task 5, 6, 7. `enrichmentPresentation` đổi chữ ký
ở Task 6 và mọi chỗ gọi sửa trong cùng task đó. `BE_MAT` khai ở Task 3, mở rộng ở
Task 4.

**Thứ tự có lý do:** Task 1 và 2 chạy trước vì không có dữ liệu và bảng dịch thì
mọi phép đo sau mù. Task 3 và 4 dựng phép đo TRƯỚC bản dịch, để có đường chuẩn đỏ
— nếu dựng sau thì không ai biết phép đo có đỏ được không.
