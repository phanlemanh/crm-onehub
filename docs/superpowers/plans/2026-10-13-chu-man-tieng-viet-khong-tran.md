# Chữ màn tiếng Việt, không tràn — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Breadcrumb của `packages/ui` đọc nhãn trợ năng theo ngôn ngữ giao diện, và nhãn kiểu ở danh sách Cài đặt › Trường dùng tên ngắn, không tràn ô ở khổ 360.

**Architecture:** `Breadcrumb` đọc `messages.breadcrumb.nhan` qua `useMessages` như `KhungXuong`. `crm.ts` thêm bảng `fields.typeNgan`; `fields-copy.ts` thêm `fieldTypeNgan`; hàng danh sách trường dùng nó, ô đổi `w-18` → `min-w-18` và mang `data-nhan-kieu`. Bàn đo màn mới `chup-truong.mjs` dựng trên `man-lib.mjs` của kho.

**Tech Stack:** React 19, Next 16, bun test + jsdom (`*.dom.tsx`), TypeScript compiler API cho bài quét, puppeteer-core qua `_acceptance/kho-tai-lieu/rang/man-lib.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-13-chu-man-tieng-viet-khong-tran-design.md` · hợp đồng `_acceptance/chu-man-tieng-viet-khong-tran/contract.md` · evals `_acceptance/chu-man-tieng-viet-khong-tran/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- `/packages/ui` là nguồn duy nhất của giao diện; tệp chữ dùng chung chỉ THÊM dòng (luật 7 của đợt).
- Nhãn trợ năng: vi «Vị trí trang», en «Breadcrumb» (Hỏi-2, chủ kho duyệt 13/10).
- Tên kiểu ngắn đúng «Bảng tên ngắn» của design doc (Hỏi-1, chủ kho duyệt 13/10).
- Mỗi phép đo mới có cặp hai chiều cùng fixture, chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE).
- Đo màn chỉ qua phiên đo (`tien-de.mjs` / `mot-luot.sh`), không cổng 3000/3001.
- Cổng lệnh của kho: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

1. Người gọi truyền `aria-label` riêng cho `Breadcrumb` — nhãn của họ phải thắng (Task 1 kiểm ô thứ ba).
2. `Breadcrumb` dựng ngoài `LocaleProvider` (proto) — rơi về ngôn ngữ mặc định, không ném lỗi (Task 1 kiểm).
3. Tên trường dài ở khổ 360 — tên cắt, nhãn kiểu trọn chữ, trang không cuộn ngang (Task 4 gieo trường tên dài).
4. Kiểu trường mới thêm sau này thiếu tên ngắn — `satisfies` của bảng chữ bắt lúc biên dịch (Task 2 khai kiểu).
5. Ô chọn kiểu của trình sửa bị đổi nhầm sang tên ngắn (Task 2 có ma trận 20 ô cho ô chọn).

---

### Task 1: Nhãn trợ năng breadcrumb theo ngôn ngữ — independent: true · phục vụ E1

**Files:**
- Modify: `packages/ui/src/lib/messages.ts` (thêm khối `breadcrumb` ở `en` và `vi`, cạnh `khungXuong`)
- Modify: `packages/ui/src/components/breadcrumb.tsx` (`"use client"`, `useMessages`)
- Create: `packages/ui/test/breadcrumb-nhan.dom.tsx`

**Interfaces:**
- Produces: `messages(locale).breadcrumb.nhan: string`.

- [ ] Step 1: Viết bài kiểm (ma trận 3 ô + chiều đỏ):

```tsx
import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../src/components/breadcrumb";
import { LocaleProvider } from "../src/components/locale-provider";

let root: Root | null = null;
afterEach(() => { act(() => root?.unmount()); root = null; document.body.innerHTML = ""; });

function ve(cay: ReactElement): HTMLElement {
	const o = document.createElement("div");
	document.body.appendChild(o);
	root = createRoot(o);
	act(() => root?.render(cay));
	return o;
}

const Mau = (p: { nhan?: string }) => (
	<Breadcrumb aria-label={p.nhan}><BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Trang</BreadcrumbPage></BreadcrumbItem></BreadcrumbList></Breadcrumb>
);

export function kiemNhan(o: HTMLElement, mong: string, man: string) {
	const nhan = o.querySelector('nav[data-slot="breadcrumb"]')?.getAttribute("aria-label");
	if (nhan !== mong) throw new Error(`cmt-breadcrumb: ${man} doc ${nhan} thay vi ${mong}`);
}

describe("breadcrumb-nhan", () => {
	test("vi doc Vị trí trang", () => kiemNhan(ve(<LocaleProvider locale="vi"><Mau /></LocaleProvider>), "Vị trí trang", "vi"));
	test("en doc Breadcrumb", () => kiemNhan(ve(<LocaleProvider locale="en"><Mau /></LocaleProvider>), "Breadcrumb", "en"));
	test("nguoi goi thang", () => kiemNhan(ve(<LocaleProvider locale="vi"><Mau nhan="Đường về" /></LocaleProvider>), "Đường về", "vi-goi"));
	test("chieu do: nhan cung tieng Anh", () => {
		const o = ve(<nav aria-label="breadcrumb" data-slot="breadcrumb" />);
		expect(() => kiemNhan(o, "Vị trí trang", "vi")).toThrow("cmt-breadcrumb: vi doc breadcrumb thay vi Vị trí trang");
	});
});
```

- [ ] Step 2: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/breadcrumb-nhan.dom.tsx` → FAIL ở «vi doc Vị trí trang».
- [ ] Step 3: Thêm `breadcrumb: { nhan: "Breadcrumb" }` vào `en`, `breadcrumb: { nhan: "Vị trí trang" }` vào `vi` của `messages.ts`. Trong `breadcrumb.tsx`: dòng đầu `"use client";`, import `useMessages` từ `@crm/ui/components/locale-provider`, `Breadcrumb` gọi `const msg = useMessages();` và đặt `aria-label={msg.breadcrumb.nhan}` TRƯỚC `{...props}`.
- [ ] Step 4: chạy lại → 4 pass. Commit `feat(breadcrumb): nhãn trợ năng theo ngôn ngữ`.

### Task 2: Tên kiểu ngắn ở hàng danh sách trường — independent: true · phục vụ E3, E4

**Files:**
- Modify: `apps/app/lib/messages/crm.ts` (thêm `typeNgan` cạnh `type` ở `fields`, cả `en` và `vi`)
- Modify: `apps/app/components/crm/fields/fields-copy.ts` (thêm `fieldTypeNgan`)
- Modify: `apps/app/components/crm/fields/fields-list.tsx:346-351`
- Create: `apps/app/test/chu-man-tieng-viet.dom.tsx`

**Interfaces:**
- Produces: `fieldTypeNgan(type: keyof CrmMessages["fields"]["typeNgan"], locale: Locale): string`; thuộc tính `data-nhan-kieu` trên `Badge` của hàng.

- [ ] Step 1: Bài kiểm DOM theo khuôn mock của `apps/app/test/luu-tru-truong-khong-hoi.dom.tsx` (mock `@/lib/trpc/client` với `fields.list` trả `fieldListOutput.parse` mười trường mười kiểu `FIELD_TYPES`, entity `CONTACT`; mock `@/lib/trpc/cache`, `next/navigation`). Nhóm `nhan-kieu`: dựng `FieldsList` trong `LocaleProvider` vi và en, chờ `fields.list` đã gọi và đủ 10 `[data-nhan-kieu]`, so từng ô với bảng viết trước (20 ô, đếm đúng 20), khẳng định không chứa «—»; hàm kiểm ném `cmt-nhan-kieu: <locale> <kiểu> doc <chữ> thay vi <mong>`; chiều đỏ: hàng giả `<span data-nhan-kieu="SELECT">Chọn — một trong danh sách cố định</span>` → ghim `cmt-nhan-kieu: vi select doc cau dai thay vi Chọn` (thông điệp riêng khi chữ chứa «—»). Nhóm `o-chon`: dựng `FieldEditor` (field `undefined`, entity CONTACT), mở ô «Kiểu» bằng `userEvent.click` trên `[role=combobox]`, đọc `[role=option]` so với `crmMessages(locale).fields.type` (20 ô); chiều đỏ: danh sách giả dùng tên ngắn → ghim `cmt-o-chon: vi select mat cau dai`.
- [ ] Step 2: chạy `-t nhan-kieu` → FAIL (chưa có `data-nhan-kieu`).
- [ ] Step 3: `crm.ts` thêm `typeNgan` en `{ text: "Text", longText: "Long text", number: "Number", date: "Date", checkbox: "Checkbox", select: "Select", user: "User", url: "URL", email: "Email", phone: "Phone" }`, vi `{ text: "Chữ", longText: "Chữ dài", number: "Số", date: "Ngày", checkbox: "Ô đánh dấu", select: "Chọn", user: "Người", url: "URL", email: "Email", phone: "Số điện thoại" }`. `fields-copy.ts` thêm `fieldTypeNgan` cùng khuôn `fieldTypeLabel`. `fields-list.tsx`: `Badge` hàng trường dùng `fieldTypeNgan(TYPE_KEY[field.type], locale)`, `className="min-w-18 shrink-0 justify-center"`, `data-nhan-kieu={field.type}`.
- [ ] Step 4: chạy cả hai nhóm → pass; `bun run check-types`. Commit `feat(fields): nhãn kiểu ngắn ở danh sách trường`.

### Task 3: Bài quét nhãn viết cứng — independent: false (sau Task 1) · phục vụ E2

**Files:** Create `apps/app/test/chu-man-tieng-viet.spec.ts`.

- [ ] Step 1: Viết `quetNhanBreadcrumb(doc: DocTep, tep: string[]): string[]` dùng `docTuDia`, `moiTepTsx`, `GOC_KHO` từ `./lib/quet-jsx`: với mỗi tệp chứa `aria-label="breadcrumb"` → `cmt-quet: con aria-label breadcrumb cung o <tep>`; chứa «Vị trí trang» → `cmt-quet: chu nhan breadcrumb viet cung o <tep>`. Ca xanh: tập tệp `packages/ui/src` + `apps/app` (bỏ `test/fixtures`), quan hệ chứa `breadcrumb.tsx` và `cai-dat-breadcrumb.tsx`, kết quả `[]`; `messages.ts` có `nhan: "Vị trí trang"` và `nhan: "Breadcrumb"`. Hai chiều đỏ bằng `docThay` trên `breadcrumb.tsx` (tra lại chuỗi cứng; viết ba ngôi locale) với hai thông điệp ghim.
- [ ] Step 2: chạy `cd apps/app && bun test ./test/chu-man-tieng-viet.spec.ts` → pass. Commit.

### Task 4: Bàn đo màn — independent: false (sau Task 1, 2) · phục vụ E5, E5m

**Files:** Create `_acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs`.

- [ ] Step 1: Dựng trên `moDo`, `chay`, `cho`, `chieuDo` của `_acceptance/kho-tai-lieu/rang/man-lib.mjs` theo khuôn `_acceptance/khung-man-chung/rang/chup-man.mjs`. Gieo qua `d.lam(cookie, "fields.create", …)`: mười trường mười kiểu (SELECT kèm hai lựa chọn) và một trường TEXT tên ≥ 60 ký tự, entity CONTACT; chiến dịch qua `savedViews.create` + `campaigns.create`.
- [ ] Step 2: Bước 1 — mỗi (vi, en) × (360, 1280): đặt cookie `lang`, mở `/settings/fields?entity=CONTACT` (tham số theo `fields-search-params.ts`), chờ đủ 11 `[data-nhan-kieu]`, đo từng ô `scrollWidth ≤ clientWidth`, `width ≥ 72 - 0.5`, độ lệch mép phải lớn nhất ≤ 1, ô nằm trong hàng, `document.scrollingElement.scrollWidth ≤ innerWidth`, nút tên của hàng tên dài có `scrollWidth > clientWidth`; chụp `cmt-truong-<ngôn ngữ>-<khổ>.png`. Lỗi ở 360 vi do tràn ô → `cmt-man: truong vi 360 nhan kieu tran`; do cuộn ngang → `cmt-man: truong vi 360 trang cuon ngang`.
- [ ] Step 3: Bước 2 — chi tiết chiến dịch vi và en: `nav[data-slot=breadcrumb]` đang hiện có `aria-label` «Vị trí trang» / «Breadcrumb».
- [ ] Step 4: `CAY_DO` hai chiều đỏ: (1) `fields-list.tsx` trả `w-18` và `fieldTypeLabel`; (2) nút tên bỏ `min-w-0` và `truncate`; `chiBuoc: "1"`.
- [ ] Step 5: chạy lượt xanh qua `KHO_TAI_LIEU_BLOB_TOKEN= bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/chu-man-tieng-viet-khong-tran/rang/chup-truong.mjs"` rồi `--chieu-do=1`, `--chieu-do=2` (sau commit). Commit.

### Task 5: Cổng lệnh và chuyển trạng thái — independent: false

- [ ] `bun run check-types`, `lint`, `lint:slop`, `test`, `build` xanh; chép ảnh vào `_acceptance/chu-man-tieng-viet-khong-tran/evidence/`; contract `status: implemented`; commit.
