# Cửa sổ trò chuyện nói tiếng Việt — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa 276 chuỗi tiếng Anh của cửa sổ trò chuyện về 0, và tháo ba mối nối với hồ sơ `agent-builder-noi-tieng-viet` đã ký mà không làm sai một con số nào của nó.

**Architecture:** Ba kho chuỗi mới chia theo màn; sáu file client đọc qua `useLocale()`. Bộ thước dùng lại qua khoá `--lat` và ổ cắm `ct_*`, cộng năm chân mới của riêng lát. Hai chỗ trong bộ thước dùng chung được sửa theo lối cộng-tính, chọn-tham-gia: nhánh `chuyen_giao` cạnh nhánh `hoan`, và chân tiêu đề thôi trả xanh trên tập rỗng.

**Tech Stack:** Next.js (apps/app) · TypeScript · bun · biome/oxlint · puppeteer-core · Node ESM cho bộ thước.

**Spec:** `docs/superpowers/specs/2026-09-06-cua-so-tro-chuyen-noi-tieng-viet-design.md`
**Hợp đồng:** `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/contract.md` · **Bộ chấm:** `evals.yaml` (21 eval)

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào code mới, không thêm khi sửa code cũ.
- **Không trailer đồng tác giả** trong commit.
- Cấm `Record<string, unknown>`; phân tích ở biên bằng Zod.
- Cấm `typeof x === "..."` — chân `lint:slop` bắt. Dùng `String(v) === v`, `v instanceof Object`, `Number.isInteger`.
- Khuôn kho chuỗi: `const en` → `export type XMessages = typeof en` → `const vi satisfies XMessages` → `const BANG = { en, vi } satisfies Record<Locale, XMessages>` → `export function xMessages(locale: Locale)`. **KHÔNG `as const`** (đóng băng literal type).
- Hàm ghép biến nhận `string`, không nhận `number`.
- `/packages/ui` là nguồn duy nhất của giao diện; vòng này KHÔNG đổi component.
- Lệnh chứng: `bun run db:test && bun run test` · `bun run check-types` · `bun run lint` (về đúng **ba cảnh báo có sẵn**: `components/app-header.tsx:128`, `lib/locale/locale.ts:1`, `postcss.config.mjs:1`) · `bun run lint:slop`.
- Máy chủ: `apps/app` 3000 · `apps/api` 3001. Phiên: `cd apps/api && bun run dev:session manh.phan@onemount.com`.
- **MEASURE-BIRTH:** một phép đo mới chỉ tính là XONG khi đã chạy CẶP HAI CHIỀU trên cùng fixture — vật lành thì xanh, phá vật thật thì đỏ **với thông điệp ghim**. Thiếu cặp = task chưa xong.

## Cấu trúc file

| File | Trách nhiệm |
|---|---|
| `apps/app/lib/messages/agent-builder-tro-chuyen.ts` | Chữ của khung hội thoại và dòng thời gian |
| `apps/app/lib/messages/agent-builder-o-soan.ts` | Chữ của ô soạn và thẻ gợi ý |
| `apps/app/lib/messages/agent-builder-hoi-thoai-thao-tac.ts` | Chữ của hộp chia sẻ và nút xoá |
| `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/gieo-va-don.mjs` | Tiền kiểm · gieo đúng một hội thoại · ghi định danh · dọn |
| `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/man-that.mjs` | Năm chân đo màn, đọc định danh từ tạo phẩm |
| `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tieu-de-khong-doi-tuong.mjs` | Chân bọc: không-có-đối-tượng + đối chứng dương |
| `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ban-giao.mjs` | Quan hệ bàn giao hai chiều + neo hồ sơ đợt một |
| `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ngoai-lat-rong.mjs` | Khối `ngoai_lat` hiện-diện-và-rỗng |
| `_acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs` | *(sửa)* nhánh `chuyen_giao`; vế trùng-chuỗi chỉ áp cho `hoan` |
| `_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs` | *(sửa)* chân tiêu đề thoát mã 2 trên tập rỗng |

---

### Task 1: Chân tiêu đề thôi trả xanh trên tập rỗng

**Files:**
- Modify: `_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs` (nhánh `--chan tieu-de`)

**Interfaces:**
- Produces: chân `tieu-de` thoát **mã 2** kèm dòng ghim nguyên văn `KHONG DO DUOC: chan tieu de khong co doi tuong o lat nay — 0 o tieu de.` khi tập ô tiêu đề rỗng; giữ nguyên hành vi cũ khi số ô > 0.

Phục vụ **E5** · `independent: true`

- [ ] **Step 1: Chạy chân tiêu đề trên lát đợt hai và ghi lại hành vi sai hiện tại**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs \
  --lat "$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json" --chan tieu-de; echo "EXIT=$?"
```
Kỳ vọng HIỆN TẠI (sai): `XANH: ca 0 o nhan deu doc tu kho chuoi.` · `EXIT=0`

- [ ] **Step 2: Ghi lại đối chứng dương trước khi sửa**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs \
  --lat "$PWD/_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json" --chan tieu-de; echo "EXIT=$?"
```
Kỳ vọng: `XANH: ca 4 o nhan deu doc tu kho chuoi.` · `EXIT=0` — con số 4 này phải KHÔNG đổi sau khi sửa.

- [ ] **Step 3: Thêm chốt tập-rỗng vào nhánh `tieu-de`**

Ngay trước dòng in `XANH: ca ${SO_TIEU_DE} o nhan…`, chèn:

```js
if (o.length === 0) {
	console.log(
		"KHONG DO DUOC: chan tieu de khong co doi tuong o lat nay — 0 o tieu de.",
	);
	process.exit(2);
}
```
(`o` là mảng ô tiêu đề nhận ra được; giữ đúng tên biến đang có trong hàm.)

- [ ] **Step 4: Chạy lại cả hai chiều**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat "$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json" --chan tieu-de; echo "RONG_EXIT=$?"
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat "$PWD/_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json" --chan tieu-de; echo "CO_DOI_TUONG_EXIT=$?"
```
Kỳ vọng: `RONG_EXIT=2` kèm dòng ghim · `CO_DOI_TUONG_EXIT=0` và vẫn `ca 4 o`.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs
git commit -m "fix(acceptance): the title probe stops passing on an empty object set"
```

---

### Task 2: Nhánh `chuyen_giao` trong chân dân số

**Files:**
- Modify: `_acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs` (khối `loaiRa`)

**Interfaces:**
- Consumes: dòng `khong_quet` có khoá `hoan: true` (đã có) hoặc `chuyen_giao: "<slug>"` (mới).
- Produces: dòng `chuyen_giao` KHÔNG bị chốt «loại trừ che giấu» bắt, và KHÔNG bị vế trùng-chuỗi bắt; đổi lại nó chịu chốt riêng ở Task 9.

Phục vụ **E12, E13, E14** · `independent: true`

- [ ] **Step 1: Chạy chân dân số của đợt hai và ghi lại lỗi hiện tại**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs \
  --lat "$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json" --chan dan-so; echo "EXIT=$?"
```
Kỳ vọng HIỆN TẠI: 15 dòng `LOAI TRU CHE GIAU` — sai, vì 15 file đó không còn tiếng Anh nên chốt cũ vốn không bắt; nếu chúng còn chuỗi nào thì chốt bắt oan. Ghi lại nguyên văn đầu ra.

- [ ] **Step 2: Cho `chuyen_giao` đi cùng nhánh `hoan`**

Trong vòng lặp phân loại `loaiRa`, đổi phép rẽ thành:

```js
if (ma !== 1) continue;
if (k.hoan === true) hoan.push(k);
else if (String(k.chuyen_giao) === k.chuyen_giao) hoan.push(k);
else conAnh.push(k);
```

- [ ] **Step 3: Bó vế trùng-chuỗi lại cho riêng `hoan`**

Chốt «file bị loại trừ mà mang chuỗi trùng với giá trị của kho chuỗi mới» chỉ chạy trên các dòng có `hoan === true`. Lọc danh sách trước khi so:

```js
const dongHoan = loaiRa.filter((k) => k.hoan === true);
```
rồi dùng `dongHoan` thay cho `loaiRa` ở đúng chốt đó.

- [ ] **Step 4: Chạy cả ba lát**

```bash
for L in cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so agent-builder-noi-tieng-viet/rang/lat-agent-builder; do
  node _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs --lat "$PWD/_acceptance/$L.json" --chan dan-so >/dev/null 2>&1; echo "$L EXIT=$?"
done
```
Kỳ vọng: cả hai `EXIT=0`.

- [ ] **Step 5: Chiều đỏ — dòng `chuyen_giao` trỏ hồ sơ không có thật vẫn phải bị Task 9 bắt, không phải chân này**

Ghi một dòng vào `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json` với `chuyen_giao: "khong-he-ton-tai"`, chạy lại Step 4, xác nhận chân này **vẫn xanh** (đúng thiết kế — quan hệ liên-hồ-sơ là việc của `ban-giao.mjs`), rồi trả bản khai về nguyên trạng.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/man-cai-dat-noi-tieng-viet/rang/khai-sinh.mjs
git commit -m "feat(acceptance): an excluded file may declare a handover, not only a deferral"
```

---

### Task 3: Bản khai của lát, dead-check từng dòng

**Files:**
- Modify: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json`
- Modify: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/khong-phai-chu-nguoi-doc.json` (đang có **24 dòng chết** chép từ đợt một)
- Modify: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/thuoc-tinh-cua-lat.json` (đang có **4 tên kỹ thuật chết**)

**Interfaces:**
- Produces: `neo` = `{file: 21, file_quet: 6, chuoi: 276, van_ban: 183, thuoc_tinh: 93}`; mọi dòng miễn trừ và mọi tên kỹ thuật đều có đối tượng thật trong sáu file.

Phục vụ **E1, E2, E3, E13** · `independent: false` (phải sau Task 2)

- [ ] **Step 1: Liệt kê dòng chết**

```bash
K="$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json"
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$K" 2>&1 | grep "khong con doi tuong that"
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat "$K" --chan thuoc-tinh 2>&1 | grep "TEN KY THUAT CHET"
```

- [ ] **Step 2: Gỡ đúng những dòng vừa được gọi tên**, không gỡ dòng nào khác.

- [ ] **Step 3: Thêm khối `neo`**

```json
"neo": {
	"file": 21, "file_quet": 6, "chuoi": 276, "van_ban": 183, "thuoc_tinh": 93,
	"ghi_chu": "Do bang chinh ban khai nay ngay 06/09. file = so .tsx tren dia trong thu muc lat; file_quet = con lai sau khi tru 15 file da ban giao; chuoi = ung vien truoc khi tru mien tru, tach thanh van_ban + thuoc_tinh."
}
```

- [ ] **Step 4: Chạy lại, không còn dòng chết**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$K" 2>&1 | tail -3
```
Kỳ vọng: `quet 6 file · 276 chuoi …` và KHÔNG còn dòng `khong con doi tuong that`.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/
git commit -m "feat(acceptance): the chat-window manifest, every exemption dead-checked"
```

---

### Task 4: Kho chuỗi khung hội thoại (113 + 45 chuỗi)

**Files:**
- Create: `apps/app/lib/messages/agent-builder-tro-chuyen.ts`
- Modify: `apps/app/components/agent-builder/agent-builder-chat.tsx`
- Modify: `apps/app/components/agent-builder/agent-history.tsx`
- Modify: `apps/app/test/messages-guard.spec.ts`

**Interfaces:**
- Produces: `export function troChuyenMessages(locale: Locale): TroChuyenMessages`

Phục vụ **E1, E2, E3, E4, E18** · `independent: false` (chung `messages-guard.spec.ts`)

- [ ] **Step 1: Dựng khung kho theo đúng khuôn của kho**

```ts
import type { Locale } from "@/lib/locale/locale";

const en = {
	khung: { tieuDe: "Chat", moi: "New chat" },
} ;

export type TroChuyenMessages = typeof en;

const vi = {
	khung: { tieuDe: "Hội thoại", moi: "Hội thoại mới" },
} satisfies TroChuyenMessages;

const BANG = { en, vi } satisfies Record<Locale, TroChuyenMessages>;

export function troChuyenMessages(locale: Locale): TroChuyenMessages {
	return BANG[locale];
}
```

- [ ] **Step 2: Rút từng chuỗi bằng máy, không đọc bằng mắt**

```bash
K="$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json"
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$K" 2>&1 \
  | grep -E "agent-builder-chat|agent-history" | sed 's|.*agent-builder/||'
```
Mỗi dòng in `file:dòng:[bối cảnh]:"nguyên văn"` — dịch từng dòng, đặt khoá theo cụm màn.

- [ ] **Step 3: Nối hai file vào kho**

Thêm `const t = troChuyenMessages(useLocale());` **trong thân hàm component**, ngay sau các hook khác — không đặt trong khối kiểu prop. Chèn import sau `"use client";\n\n`, không chèn sau dòng `import` đầu tiên (import nhiều dòng sẽ vỡ).

- [ ] **Step 4: Đăng ký kho vào bộ canh**

Trong `apps/app/test/messages-guard.spec.ts`, thêm `["agent-builder-tro-chuyen", troChuyenMessages]` vào `MODULE`. Chạy:

```bash
cd apps/app && bun test test/messages-guard.spec.ts
```
Đọc từng dòng fail: giá trị không dấu → khai vào `KHONG_DAU`; hàm ghép biến → thêm khẳng định `GHIM` bằng cách **gọi hàm thật**:

```bash
cd apps/app && bun -e 'import {troChuyenMessages as m} from "./lib/messages/agent-builder-tro-chuyen";const t=m("vi");console.log(JSON.stringify(t.<nhom>.<khoa>("1")),JSON.stringify(t.<nhom>.<khoa>("12")))'
```
Chép đúng hai giá trị đó vào `GHIM` — không gõ tay theo trí nhớ.

- [ ] **Step 5: Chạy hết**

```bash
cd apps/app && bun test test/messages-guard.spec.ts && cd .. && cd .. && bun run check-types
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$PWD/_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/lat-cua-so.json" 2>&1 | grep -cE "agent-builder-chat|agent-history"
```
Kỳ vọng: bộ canh xanh · `check-types` xanh · số chuỗi còn tiếng Anh của hai file = **0**.

- [ ] **Step 6: Commit**

```bash
git add apps/app/lib/messages/agent-builder-tro-chuyen.ts apps/app/components/agent-builder/agent-builder-chat.tsx apps/app/components/agent-builder/agent-history.tsx apps/app/test/messages-guard.spec.ts
git commit -m "feat(app): the conversation frame and its timeline speak Vietnamese"
```

---

### Task 5: Kho chuỗi ô soạn (65 + 15 chuỗi)

**Files:**
- Create: `apps/app/lib/messages/agent-builder-o-soan.ts`
- Modify: `apps/app/components/agent-builder/agent-composer.tsx`
- Modify: `apps/app/components/agent-builder/chat-chips.tsx`
- Modify: `apps/app/test/messages-guard.spec.ts`

**Interfaces:**
- Produces: `export function oSoanMessages(locale: Locale): OSoanMessages`. **Phải chứa ba khoá trạng thái nhất thời** — đang gửi · đã gửi · gửi hỏng — vì Task 11 ghim đường vào chúng, và Task 13 cắm nhãn dài vào một trong ba.

Phục vụ **E1, E2, E3, E4, E7, E18** · `independent: false`

- [ ] **Step 1–5:** làm y hệt Task 4, đổi tên kho và hai file. Lệnh rút chuỗi:

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$K" 2>&1 | grep -E "agent-composer|chat-chips"
```

- [ ] **Step 6: Ghi tên ba khoá nhất thời ra bản khai ngay**

Thêm vào `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/trang-thai-cua-lat.json` ba dòng trỏ đường thật vào kho (`kho: "o-soan"`, `duong: "<nhóm>.<khoá>"`) — Task 11 đọc file này.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/agent-builder-o-soan.ts apps/app/components/agent-builder/agent-composer.tsx apps/app/components/agent-builder/chat-chips.tsx apps/app/test/messages-guard.spec.ts _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/trang-thai-cua-lat.json
git commit -m "feat(app): the composer and its suggestion chips speak Vietnamese"
```

---

### Task 6: Kho chuỗi chia sẻ và xoá (26 + 12 chuỗi)

**Files:**
- Create: `apps/app/lib/messages/agent-builder-hoi-thoai-thao-tac.ts`
- Modify: `apps/app/components/agent-builder/share-chat-dialog.tsx`
- Modify: `apps/app/components/agent-builder/delete-chat-action.tsx`
- Modify: `apps/app/test/messages-guard.spec.ts`

Phục vụ **E1, E2, E3, E4, E18** · `independent: false`

- [ ] **Step 1–5:** y hệt Task 4. Lệnh rút chuỗi dùng `grep -E "share-chat-dialog|delete-chat-action"`.

- [ ] **Step 6: Xác nhận toàn lát về 0**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/moi-chuoi.mjs --lat "$K" >/dev/null 2>&1; echo "MOI_CHUOI_EXIT=$?"
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-cung-lat.mjs --lat "$K" >/dev/null 2>&1; echo "CHU_CUNG_EXIT=$?"
```
Kỳ vọng: cả hai `EXIT=0`.

- [ ] **Step 7: Commit**

```bash
git add apps/app/lib/messages/agent-builder-hoi-thoai-thao-tac.ts apps/app/components/agent-builder/share-chat-dialog.tsx apps/app/components/agent-builder/delete-chat-action.tsx apps/app/test/messages-guard.spec.ts
git commit -m "feat(app): sharing and deleting a chat speak Vietnamese"
```

---

### Task 7: Bảng đóng toast và thuộc tính

**Files:**
- Modify: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/toast-cua-lat.json` (14 lời gọi)
- Modify: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/thuoc-tinh-cua-lat.json`

Phục vụ **E3, E4** · `independent: false` (sau Task 4–6)

- [ ] **Step 1: Để chân tự kê danh sách thừa**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat "$K" --chan toast 2>&1 | grep "THUA"
```
Mỗi dòng THỪA cho `file:dòng` — mở đúng dòng đó, đọc khoá `t.x.y` và ghi vào `loi_goi`.

- [ ] **Step 2: Chạy tới khi hai chiều khớp**

```bash
node _acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs --lat "$K" --chan toast; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0` và **14** lời gọi.

- [ ] **Step 3: Chiều đỏ**

Gỡ một dòng khỏi `loi_goi`, chạy lại, xác nhận `EXIT=2` và dòng bị gỡ được **gọi tên**; rồi trả lại.

- [ ] **Step 4: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/toast-cua-lat.json _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/thuoc-tinh-cua-lat.json
git commit -m "test(acceptance): the closed toast and attribute tables for the chat window"
```

---

### Task 8: Chân gieo-và-dọn

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/gieo-va-don.mjs`

**Interfaces:**
- Produces: tạo phẩm `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/evidence/hoi-thoai-gieo.json` dạng `{"id": "<chatId>", "so_lan_goi": 1, "ts": "<ISO>"}`; hàm `docHoiThoaiGieo()` xuất ra cho `man-that.mjs` dùng.

Phục vụ **E0** · `independent: false`

- [ ] **Step 1: Tiền kiểm**

Khẳng định ba việc, hỏng vế nào thì thoát mã 2 **gọi tên**: `GET ${API}/api/trpc/…` trả lời · phiên đăng nhập lấy được qua `phien()` · workspace slug suy được qua `suySlug()`.

- [ ] **Step 2: Gieo đúng một lần**

```js
const r = await fetch(`${API}/api/trpc/conversations.createBuilder`, {
	method: "POST",
	headers: { "Content-Type": "application/json", ...mu(cookie) },
	body: JSON.stringify({
		clientRequestId: randomUUID(),
		commandType: "CHAT",
		message: "Hội thoại gieo để đo màn — vòng nghiệm thu tự dọn.",
	}),
});
```
Đếm số lời gọi bằng một biến cục bộ, ghi vào tạo phẩm, và in `so lan goi createBuilder: 1`.

- [ ] **Step 3: Dọn kể cả khi hỏng**

Bọc phần đo trong `try/finally`; nhánh `finally` gọi `conversations.remove`, và nếu lệnh dọn không trả 200 thì thoát mã 2 với `KHONG DO DUOC: don vat gieo that bai`.

- [ ] **Step 4: Đối chứng cây sạch**

Sau khi dọn, chạy chân trạng thái của đợt một và đòi mã 0:

```bash
APP_URL=http://localhost:3000 API_URL=http://localhost:3001 \
  node _acceptance/agent-builder-noi-tieng-viet/rang/man-that.mjs trang-thai >/dev/null 2>&1; echo "SACH_EXIT=$?"
```
Kỳ vọng `SACH_EXIT=0` — đây là đối chứng độc lập, không phải lời tự khai của chân gieo.

- [ ] **Step 5: Cặp hai chiều**

```bash
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/gieo-va-don.mjs; echo "XANH_EXIT=$?"
rm _acceptance/cua-so-tro-chuyen-noi-tieng-viet/evidence/hoi-thoai-gieo.json
APP_URL=http://localhost:3000 API_URL=http://localhost:3001 node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/man-that.mjs hai-tieng; echo "THIEU_TAO_PHAM_EXIT=$?"
```
Kỳ vọng: `XANH_EXIT=0` · `THIEU_TAO_PHAM_EXIT=2` kèm dòng gọi tên tạo phẩm vắng.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/gieo-va-don.mjs
git commit -m "test(acceptance): seed exactly one conversation, hand its id over, clean up even on failure"
```

---

### Task 9: Chân bàn giao và chân `ngoai_lat` rỗng

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ban-giao.mjs`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ngoai-lat-rong.mjs`
- Modify: `_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json`
- Modify: `_acceptance/agent-builder-noi-tieng-viet/rang/khong-dich-cua-lat.json`

**Interfaces:**
- Consumes: cả hai bản khai lát.
- Produces: mã 0 khi mọi dòng `chuyen_giao` trỏ đúng và năm số neo đợt một đo lại trên đĩa vẫn đúng.

Phục vụ **E12, E15** · `independent: false`

- [ ] **Step 1: Đổi sáu dòng của đợt một**

`hoan: true` → `chuyen_giao: "cua-so-tro-chuyen-noi-tieng-viet"`. Giữ nguyên `vi_sao`, giữ **sáu** dòng, KHÔNG đụng `neo`.

- [ ] **Step 2: Gỡ 8 chuỗi `ngoai_lat`, GIỮ khối**

```json
"ngoai_lat": { "ghi_chu": "Dot hai da dich xong sau file nay — khoi giu lai va RONG co chu y; vang mat han la duong sach-gia.", "khoi": [], "mien_dau": ["/"] }
```

- [ ] **Step 3: `ban-giao.mjs` — ba vế**

Với mỗi dòng `chuyen_giao` ở CẢ HAI bản khai: (a) thư mục `_acceptance/<slug>/` tồn tại; (b) trong đó có một `rang/lat-*.json`; (c) bản khai đó thật sự chứa file được trỏ tới (trong `thu_muc` và không nằm trong `khong_quet` của chính nó). Thiếu vế nào → mã 1, in **tên cả hai bên**.

- [ ] **Step 4: `ban-giao.mjs` — đo lại neo đợt một trên đĩa**

Gọi `khai-sinh.mjs --lat <bản khai đợt một>` bằng `spawnSync`, đòi mã 0, rồi rút ba con số từ đầu ra và so với `neo` trong bản khai; chỉ so bản khai với hằng số hợp đồng là **chưa đủ** — thiếu bước chạy lại là mã 2.

- [ ] **Step 5: `ngoai-lat-rong.mjs`**

Khối `ngoai_lat` phải **có mặt** và `khoi.length === 0` — vắng khối là mã 1 `KHOI VANG MAT: duong sach-gia`. Rồi chạy chân màn của đợt một và đòi dòng `ngoai lat=0`.

- [ ] **Step 6: Cặp hai chiều cho cả hai chân**

```bash
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ban-giao.mjs; echo "XANH=$?"
# đỏ 1: đổi một slug chuyen_giao thành "khong-he-ton-tai"
# đỏ 2: gỡ một file khỏi thu_muc của bên nhận
# đỏ 3: xoá hẳn khối ngoai_lat khỏi bản khai đợt một
```
Mỗi lượt phá phải cho **mã 1** kèm tên cả hai bên; trả bản khai về nguyên trạng sau mỗi lượt.

- [ ] **Step 7: Mười bảy phép đo của đợt một phải còn xanh**

```bash
for k in ab_hai_tieng ab_chu_cung_jsx ab_toast ab_tieu_de ab_thuoc_tinh ab_trang_thai ab_khong_dich ab_du_lieu_nguoi_nhap ab_dot_bien ab_khai_sinh ab_dan_so_tu_dia ab_be_rong ab_moi_chuoi ab_mot_bo_thuoc ab_tu_dien ab_khong_du_quyen; do echo "== $k"; done
```
Chạy từng ổ cắm `ab_*` trong `_acceptance/config.yaml`; **mọi lệnh phải mã 0**. Đây là điều kiện xong của task, không phải việc kiểm sau.

- [ ] **Step 8: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ban-giao.mjs _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ngoai-lat-rong.mjs _acceptance/agent-builder-noi-tieng-viet/rang/
git commit -m "feat(acceptance): hand the six chat files over, and prove neither dossier's numbers moved"
```

---

### Task 10: Chân bọc tiêu đề không-có-đối-tượng

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tieu-de-khong-doi-tuong.mjs`

Phục vụ **E5** · `independent: false` (sau Task 1)

- [ ] **Step 1: Hai lượt trong một chân**

Lượt A trên bản khai lát này: đòi mã **2** và đầu ra chứa NGUYÊN VĂN `chan tieu de khong co doi tuong o lat nay`. Lượt B trên bản khai đợt một: đòi mã **0** và đầu ra chứa một số đếm **lớn hơn 0**. Thiếu lượt B → mã 2 `KHONG DO DUOC: thieu doi chung duong`.

- [ ] **Step 2: Cặp hai chiều**

```bash
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tieu-de-khong-doi-tuong.mjs; echo "XANH=$?"
```
Rồi tạm đổi đường dẫn lượt B sang một bản khai không tồn tại → phải **mã 2** gọi tên, không phải xanh. Trả lại.

- [ ] **Step 3: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tieu-de-khong-doi-tuong.mjs
git commit -m "test(acceptance): an absent measure must say so, and prove itself alive elsewhere"
```

---

### Task 11: Chân đo màn — năm chân trong một file

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/man-that.mjs`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/khong-dich-cua-lat.json`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/du-lieu-nguoi-nhap.json`

**Interfaces:**
- Consumes: `docHoiThoaiGieo()` từ Task 8.
- Produces: năm chân `hai-tieng` · `trang-thai` · `khong-dich` · `du-lieu-nguoi-nhap` · `be-rong`.

Phục vụ **E6, E7, E8, E9, E10** · `independent: false`

- [ ] **Step 1: Mở màn bằng chiến lược chờ riêng**

```js
const res = await trang.goto(`${APP}/${slug}${man}`, {
	waitUntil: "domcontentloaded",
	timeout: 30_000,
});
await new Promise((r) => setTimeout(r, CHO_LANG_MS));
```
`networkidle0` **không dùng được** ở lát này — màn giữ một kết nối sống. Viết mới, không bê thân hàm của `man-that-lib.mjs` (chân `mot-bo-thuoc` bắt 12 dòng trùng).

- [ ] **Step 2: Đọc định danh, không tự gieo**

```js
const gieo = docHoiThoaiGieo();
if (gieo === null) {
	console.log("KHONG DO DUOC: vang tao pham hoi thoai gieo — chay chan gieo-va-don truoc.");
	process.exit(2);
}
```

- [ ] **Step 3: Ba vế của chân `hai-tieng`** — số chuỗi hai lượt bằng nhau · mỗi cặp cùng vị trí khác nhau trừ bảng AC-7 · lượt `vi` mang dấu. Tập rỗng trên một route → mã 2.

- [ ] **Step 4: Chân `khong-dich` so theo VỊ TRÍ** — dựng `Map<khoá DOM, chữ>` cho mỗi lượt, rồi với mỗi giá trị khai: tìm vị trí lượt `vi` vẽ ra nó, đòi lượt `en` ở đúng vị trí ấy vẽ ra **y hệt**. Không so chuỗi với chính nó.

- [ ] **Step 5: Chân `be-rong` in số phần tử từng route**

```js
console.log(`-- man ${man} o ${HEP}px · nhan dich duoc=${cap.length}`);
```
`cap.length === 0` trên một route → mã 2 gọi tên route.

- [ ] **Step 6: Cặp hai chiều cho từng chân** — năm lượt phá, mỗi lượt một chân, mỗi lượt phải cho **mã 1** kèm thông điệp ghim; ghi lại nguyên văn năm đầu ra đỏ đó vào phần bằng chứng.

- [ ] **Step 7: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/man-that.mjs _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/khong-dich-cua-lat.json _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/du-lieu-nguoi-nhap.json
git commit -m "test(acceptance): five screen legs that wait the way this screen actually behaves"
```

---

### Task 12: Chiều đỏ bề rộng, neo vào tập phép đo xuôi nhìn thấy

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/be-rong-do.sh`

Phục vụ **E11** · `independent: false` (sau Task 11)

- [ ] **Step 1: Ghim tên khoá mốc** vào một biến có tên trong script, kèm route mà nó xuất hiện.

- [ ] **Step 2: Kiểm khoá mốc nằm trong tập phép đo xuôi**

Chạy chân `be-rong`, đọc dòng `nhan dich duoc=` của đúng route đã ghim, và khẳng định giá trị của khoá mốc có mặt trong tập chân ấy đếm được. Không có mặt → **mã 2** gọi tên khoá, không xanh cũng không đỏ.

- [ ] **Step 3: Cắm nhãn dài, đòi tràn**

Cắm một cụm tiếng Việt **có dấu, đọc được** vào khoá mốc, chạy `be-rong` ở 360px, đòi `vi tran ma en vua > 0`. Bằng 0 → **mã 1** `chan be-rong dang mu`.

- [ ] **Step 4: Trả nguyên trạng và kiểm cây**

`git status --porcelain` trước và sau phải bằng nhau; khác → mã 2.

- [ ] **Step 5: Chạy**

```bash
bash _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/be-rong-do.sh; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0` kèm dòng `XANH: chan be-rong do dung chieu`.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/be-rong-do.sh
git commit -m "test(acceptance): the width probe's red direction, anchored to what the forward measure sees"
```

---

### Task 13: Bộ đột biến, một-bộ-thước, từ điển

**Files:**
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/dot-bien.mjs`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/hinh-dang-dot-bien.json`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/mot-bo-thuoc.mjs`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tu-dien.mjs`
- Create: `_acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tu-dien-cua-lat.json`
- Modify: `CONTEXT.md`

Phục vụ **E16, E17, E19** · `independent: false`

- [ ] **Step 1: Bảng đóng sáu hình dạng** — văn bản JSX · thuộc tính · toast · khoá object · trạng thái trên màn · **bàn giao**. Mỗi hình dạng ghi `chan_chuyen_trach`. Hình dạng không có đối tượng ở lát này phải khai `khong_co_doi_tuong` kèm lý do, không bịa vết.

- [ ] **Step 2: Sáu vết** — vết *bàn giao* cắm bằng cách đổi một slug `chuyen_giao` sang tên không tồn tại; chỉ `ban-giao.mjs` được bắt nó.

- [ ] **Step 3: Chạy bộ đột biến**

```bash
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/dot-bien.mjs; echo "EXIT=$?"
```
Kỳ vọng `EXIT=0` · mỗi vết bị **đúng** chân chuyên trách bắt · `git status` trước và sau bằng nhau.

- [ ] **Step 4: Thêm mục từ điển**

`CONTEXT.md` cần mục cho danh từ trung tâm của lát (**Ô soạn** · **Thẻ gợi ý** · **Chia sẻ hội thoại**), mỗi mục có dòng `_Avoid_` và một dòng "Vì sao". Chiều đỏ của `tu-dien.mjs`: gỡ một mục khỏi `CONTEXT.md` → mã 1 gọi tên mục.

- [ ] **Step 5: Chạy hai chân còn lại**

```bash
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/mot-bo-thuoc.mjs; echo "MOT_BO=$?"
node _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/tu-dien.mjs; echo "TU_DIEN=$?"
```
Kỳ vọng cả hai `EXIT=0`. `mot-bo-thuoc` đỏ nghĩa là có thân hàm bị chép — sửa bằng cách nâng phần chung lên `man-cai-dat-noi-tieng-viet/rang/`, không bằng cách đổi tên biến.

- [ ] **Step 6: Commit**

```bash
git add _acceptance/cua-so-tro-chuyen-noi-tieng-viet/rang/ CONTEXT.md
git commit -m "test(acceptance): the mutation set, the no-copy probe, and the dictionary for the chat window"
```

---

### Task 14: Bốn lệnh chứng của kho

**Files:** không tạo file mới.

Phục vụ **E18** và điều kiện vào S4 · `independent: false`

- [ ] **Step 1: Chạy trọn bộ**

```bash
bun run db:test && bun run test; echo "TEST=$?"
bun run check-types; echo "TYPES=$?"
bun run lint 2>&1 | grep -c "Found 1 error"; echo "LINT_ERROR_COUNT (phai la 0)"
bun run lint:slop; echo "SLOP=$?"
```
Kỳ vọng: `TEST=0` · `TYPES=0` · số lỗi lint = 0 (chỉ còn **ba cảnh báo có sẵn**) · `SLOP=0`.

- [ ] **Step 2: Lỗi định dạng thì chạy formatter, đừng sửa tay**

```bash
cd apps/app && bunx biome check --write <file vừa sửa>
```

- [ ] **Step 3: Set `status: implemented` và commit**

```bash
git add -A && git commit -m "chore(acceptance): the chat window is implemented, ready to verify"
```

## Self-review

**Phủ spec:** ba kho chuỗi → Task 4–6 · bản khai và dead-check → Task 3, 7 · năm chân màn → Task 11 · gieo/dọn → Task 8 · tiêu đề không-có-đối-tượng → Task 1, 10 · bàn giao và `ngoai_lat` → Task 9 · chiều đỏ bề rộng → Task 12 · đột biến/không-chép/từ điển → Task 13 · bốn lệnh chứng → Task 14. Không mục nào của spec thiếu task.

**Quét chỗ trống:** không còn "TBD", không còn "làm tương tự Task N" mà thiếu lệnh — Task 5 và 6 trỏ về khuôn Task 4 nhưng vẫn ghi đủ lệnh rút chuỗi riêng và danh sách file riêng.

**Nhất quán kiểu:** ba hàm đọc kho tên `troChuyenMessages` · `oSoanMessages` · `hoiThoaiThaoTacMessages`, dùng nguyên tên đó ở Task 4–6 và ở bộ canh. `docHoiThoaiGieo()` khai ở Task 8 và tiêu thụ ở Task 11 — cùng một tên.

**Thứ tự phụ thuộc:** Task 1 và 2 độc lập, chạy trước. Task 3 sau Task 2. Task 4–6 sau Task 3. Task 7 sau Task 4–6. Task 8 trước Task 11. Task 9 sau Task 6 (vì cần sáu file đã hết tiếng Anh). Task 12 sau Task 11. Task 13 sau Task 9 và 12. Task 14 cuối.
