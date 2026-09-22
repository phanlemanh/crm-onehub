# Đường proto cho design-pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mở một nhánh route `/proto` sau cờ dev, có sổ đăng ký buộc khai state và một proto mẫu ghép từ `@crm/ui`, rồi khai ba khoá `design_pass` để skill design-pass chạy được.

**Architecture:** Sổ đăng ký tách hai — `catalog.ts` giữ dữ liệu thuần (không nhập gì, nên phép đo `import` thẳng được), `registry.ts` ghép slug → Component. Cờ `PROTO_ROUTE` đặt ở `layout.tsx` của nhánh, một chỗ duy nhất. `/proto` vào danh sách ẩn danh của proxy để mở được khi chưa đăng nhập, nên cờ là lớp canh duy nhất và có hai tiêu chí đo thẳng vào nó.

**Tech Stack:** Next (App Router, `cacheComponents: true`), React 19, `@crm/ui` (shadcn), bun, Biome.

**Spec:** `docs/superpowers/specs/2026-09-16-duong-proto-cho-design-pass-design.md`
**Contract:** `_acceptance/duong-proto-cho-design-pass/contract.md` (14 AC) · `evals.yaml` (15 eval)

## Global Constraints

- **Không viết chú thích trong code.** Không thêm vào mã mới, không thêm khi sửa mã cũ. (`AGENTS.md`)
- **Chỉ nhập `@crm/ui` theo subpath**: `@crm/ui/components/<tên>`. Cấm barrel `"@crm/ui"`, cấm `@crm/db`, cấm `@crm/auth` trong bất kỳ file nào dưới `apps/app/app/proto/`. Barrel kéo Prisma → `pg` → `dns` và làm hỏng bản dựng. (`AGENTS.md`)
- **`params` và `searchParams` là `Promise`**, và phải đọc **bên trong ranh giới `<Suspense>`** — kho bật `cacheComponents: true` và có sẵn phép đo `ld_khong_doc_ngoai_suspense` canh luật này. Khuôn: component trang nhận Promise rồi truyền xuống một component con `async` bọc trong `<Suspense>`.
- **Không tự đặt bán kính/màu/khoảng cách.** Chỉ dùng thang có sẵn: `rounded-md` cho nút và ô nhập, `rounded-lg` cho bề mặt chứa điều khiển. Không hex mới. (`docs/design.md`)
- **Không sửa `packages/ui`.** Thiếu gì ở tầng component là việc của vòng khác.
- **Không đường ghi, không tRPC, không dữ liệu thật** trong proto. Dữ liệu giả, chỉ đọc.
- Cờ so sánh **đúng chuỗi `"1"`** (`process.env.PROTO_ROUTE === "1"`). Cấm viết `!process.env.PROTO_ROUTE` — `"0"` và `"false"` là chuỗi truthy và sẽ mở cả nhánh.
- Lệnh verify chạy từ **gốc kho**, không cần export gì.

## File Structure

| File | Trách nhiệm |
|---|---|
| `apps/app/app/proto/catalog.ts` | Dữ liệu thuần: slug, tên, danh sách state. Không nhập gì cả. |
| `apps/app/app/proto/registry.ts` | Ghép slug → Component. Nhập `catalog.ts` + các module proto. |
| `apps/app/app/proto/layout.tsx` | Cờ `PROTO_ROUTE`, một chỗ duy nhất cho cả nhánh. |
| `apps/app/app/proto/page.tsx` | Mục lục. |
| `apps/app/app/proto/[slug]/page.tsx` | Trang một proto, đọc `?state=`. |
| `apps/app/app/proto/state-switcher.tsx` | Thanh chuyển state bằng link thật. |
| `apps/app/app/proto/_modules/duong-proto/index.tsx` | Proto mẫu, năm state. |
| `apps/app/lib/proxy-paths.ts` | Danh sách đường ẩn danh + phép so đoạn. Tách ra để kiểm được. |
| `apps/app/proxy.ts` | Nhập từ `lib/proxy-paths.ts` thay vì tự giữ hằng. |
| `apps/app/test/proxy-an-danh.spec.ts` | Bài kiểm AC-13. |
| `_acceptance/duong-proto-cho-design-pass/rang/*.mjs` | Răng đo. |
| `docs/proto.md` | Hướng dẫn thêm proto — đích của `host_embed.guide`. |

---

### Task 1: Sổ đăng ký — dữ liệu thuần tách khỏi component

**independent: true** (không phụ thuộc task nào)
**Phục vụ:** E8 (sổ buộc khai state), và là nguồn cho E4, E7, E13.

**Files:**
- Create: `apps/app/app/proto/catalog.ts`
- Create: `apps/app/test/proto-catalog.spec.ts`

**Interfaces:**
- Produces: `export type ProtoState = { id: string; nhan: string }`
- Produces: `export type ProtoCatalogEntry = { slug: string; ten: string; states: ProtoState[] }`
- Produces: `export const PROTO_CATALOG: readonly ProtoCatalogEntry[]`

- [ ] **Bước 1: Viết bài kiểm đỏ**

```ts
import { describe, expect, test } from "bun:test";
import { PROTO_CATALOG } from "../app/proto/catalog";

describe("sổ đăng ký proto", () => {
	test("có ít nhất một proto", () => {
		expect(PROTO_CATALOG.length).toBeGreaterThan(0);
	});

	test("proto mẫu khai đúng năm state", () => {
		const mau = PROTO_CATALOG.find((muc) => muc.slug === "duong-proto");
		expect(mau).toBeDefined();
		expect(mau?.states.map((s) => s.id)).toEqual([
			"mac-dinh",
			"rong",
			"dang-tai",
			"loi",
			"tran-dai",
		]);
	});

	test("mọi mục có slug, tên và state id duy nhất", () => {
		for (const muc of PROTO_CATALOG) {
			expect(muc.slug).not.toBe("");
			expect(muc.ten).not.toBe("");
			expect(muc.states.length).toBeGreaterThan(0);
			const ids = muc.states.map((s) => s.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});
});
```

- [ ] **Bước 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/app && bun test test/proto-catalog.spec.ts`
Đợi: FAIL — `Cannot find module '../app/proto/catalog'`

- [ ] **Bước 3: Viết `catalog.ts`**

```ts
export type ProtoState = {
	id: string;
	nhan: string;
};

export type ProtoCatalogEntry = {
	slug: string;
	ten: string;
	states: ProtoState[];
};

export const PROTO_CATALOG: readonly ProtoCatalogEntry[] = [
	{
		slug: "duong-proto",
		ten: "Bản mẫu đường proto",
		states: [
			{ id: "mac-dinh", nhan: "Mặc định" },
			{ id: "rong", nhan: "Rỗng" },
			{ id: "dang-tai", nhan: "Đang tải" },
			{ id: "loi", nhan: "Lỗi" },
			{ id: "tran-dai", nhan: "Tràn dài" },
		],
	},
];

export function timProto(slug: string): ProtoCatalogEntry | undefined {
	return PROTO_CATALOG.find((muc) => muc.slug === slug);
}

export function timState(
	muc: ProtoCatalogEntry,
	state: string | undefined,
): ProtoState | undefined {
	if (state === undefined) return muc.states[0];
	return muc.states.find((s) => s.id === state);
}
```

- [ ] **Bước 4: Chạy lại, phải xanh**

Chạy: `cd apps/app && bun test test/proto-catalog.spec.ts`
Đợi: PASS — 3 test.

- [ ] **Bước 5: Chiều đỏ trên cùng fixture**

Đổi tạm `states: []` cho `duong-proto`, chạy lại: phải ĐỎ ở cả test "năm state" lẫn "state id duy nhất". Hoàn nguyên.

- [ ] **Bước 6: Commit**

```bash
git add apps/app/app/proto/catalog.ts apps/app/test/proto-catalog.spec.ts
git commit -m "feat(proto): sổ đăng ký dữ liệu thuần, tách khỏi component"
```

---

### Task 2: Proxy cho `/proto` đi qua trước cửa đăng nhập

**independent: true**
**Phục vụ:** E12 (AC-13), và mở đường cho E1/E2.

**Files:**
- Create: `apps/app/lib/proxy-paths.ts`
- Modify: `apps/app/proxy.ts` (bỏ hằng `ANONYMOUS`, `isUnder`, `isAnonymous` tại chỗ; nhập từ module mới)
- Create: `apps/app/test/proxy-an-danh.spec.ts`

**Interfaces:**
- Produces: `export const ANONYMOUS: readonly string[]`
- Produces: `export function isUnder(pathname: string, prefix: string): boolean`
- Produces: `export function isAnonymous(pathname: string): boolean`

- [ ] **Bước 1: Viết bài kiểm đỏ**

```ts
import { describe, expect, test } from "bun:test";
import { ANONYMOUS, isAnonymous } from "../lib/proxy-paths";

describe("đường ẩn danh của proxy", () => {
	test("danh sách dài đúng hai mục", () => {
		expect([...ANONYMOUS].sort()).toEqual(["/proto", "/t"]);
	});

	test("nhánh proto đi qua", () => {
		expect(isAnonymous("/proto")).toBe(true);
		expect(isAnonymous("/proto/duong-proto")).toBe(true);
	});

	test("tiền tố giống nhưng khác đoạn thì KHÔNG ẩn danh", () => {
		expect(isAnonymous("/protoXYZ")).toBe(false);
		expect(isAnonymous("/proto-cu")).toBe(false);
	});

	test("phần còn lại vẫn đòi đăng nhập", () => {
		for (const duong of ["/settings", "/contacts", "/deals", "/"]) {
			expect(isAnonymous(duong)).toBe(false);
		}
	});
});
```

- [ ] **Bước 2: Chạy để chắc nó đỏ**

Chạy: `cd apps/app && bun test test/proxy-an-danh.spec.ts`
Đợi: FAIL — `Cannot find module '../lib/proxy-paths'`

- [ ] **Bước 3: Tách module**

```ts
export const ANONYMOUS: readonly string[] = ["/t", "/proto"];

export function isUnder(pathname: string, prefix: string): boolean {
	return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isAnonymous(pathname: string): boolean {
	return ANONYMOUS.some((prefix) => isUnder(pathname, prefix));
}
```

- [ ] **Bước 4: Nối `proxy.ts` vào module mới**

Trong `apps/app/proxy.ts`: xoá hằng `ANONYMOUS` và hai hàm `isUnder`, `isAnonymous` đang khai tại chỗ; thêm `import { isAnonymous, isUnder } from "@/lib/proxy-paths";`. Giữ nguyên `UNGATED` và `SECTIONS` tại chỗ (chúng vẫn dùng `isUnder` nhập vào). Không đổi thứ tự kiểm trong hàm `proxy`.

- [ ] **Bước 5: Chạy lại, phải xanh**

Chạy: `cd apps/app && bun test test/proxy-an-danh.spec.ts`
Đợi: PASS — 4 test.

- [ ] **Bước 6: Chiều đỏ trên cùng fixture**

Đổi tạm `isUnder` thành `pathname.startsWith(prefix)`, chạy lại: test "tiền tố giống nhưng khác đoạn" phải ĐỎ và thông điệp nêu `/protoXYZ`. Hoàn nguyên.

- [ ] **Bước 7: Bài kiểm cổng onboarding vẫn xanh**

Chạy: `cd apps/app && bun test test/onboarding-gate.spec.ts`
Đợi: PASS — chứng việc tách module không đổi hành vi phần còn lại.

- [ ] **Bước 8: Commit**

```bash
git add apps/app/lib/proxy-paths.ts apps/app/proxy.ts apps/app/test/proxy-an-danh.spec.ts
git commit -m "feat(proto): /proto đi qua proxy trước cửa đăng nhập, tách danh sách ẩn danh ra module kiểm được"
```

---

### Task 3: Biến môi trường và tài liệu

**independent: true**
**Phục vụ:** E10 (AC-10).

**Files:**
- Modify: `.env.example` (thêm một khối ở cuối)
- Create: `docs/proto.md`
- Modify: `AGENTS.md` (thêm một dòng vào bảng chỉ mục)

- [ ] **Bước 1: Thêm biến vào `.env.example`**

Thêm vào cuối file, theo nếp văn xuôi của các biến khác:

```
# Mở nhánh /proto — phòng trưng bày giao diện chạy được, dùng cho nghi thức
# design-pass trước Cổng 1. Đặt đúng chuỗi "1" mới mở; mọi giá trị khác, kể cả
# "0" và "false", đều giữ nhánh ở trạng thái không tồn tại (404). Chỉ apps/app
# đọc biến này, API không đọc, nên nó KHÔNG khai trong
# apps/api/src/config/env.validation.ts. Bản chạy thật không đặt nó.
# PROTO_ROUTE="1"
```

- [ ] **Bước 2: Viết `docs/proto.md`**

Nội dung phải nói đủ: nhánh sống ở đâu; cách bật (`PROTO_ROUTE=1` + lệnh dev); **chữ `{slug}` trong `design_pass.proto_route` là slug hồ sơ nghiệm thu, không phải workspace của CRM**; bốn bước thêm một proto (thêm mục vào `catalog.ts` → viết module dưới `_modules/<slug>/` → nối vào `registry.ts` → chạy `bun test test/proto-catalog.spec.ts`); và ba điều cấm (không sửa `packages/ui`, không đường ghi, chỉ nhập `@crm/ui` theo subpath).

- [ ] **Bước 3: Thêm dòng vào bảng chỉ mục `AGENTS.md`**

Thêm vào bảng "Read first", ngay dưới dòng `docs/design.md`:

```
| Bản mẫu giao diện dưới `/proto`, thêm một proto cho phiên design-pass | `docs/proto.md` |
```

- [ ] **Bước 4: Verify**

Chạy: `grep -c "PROTO_ROUTE" .env.example && test -s docs/proto.md && grep -c "docs/proto.md" AGENTS.md`
Đợi: cả ba khác 0. Và `grep -c "PROTO_ROUTE" apps/api/src/config/env.validation.ts` phải là `0`.

- [ ] **Bước 5: Commit**

```bash
git add .env.example docs/proto.md AGENTS.md
git commit -m "docs(proto): khai biến PROTO_ROUTE và hướng dẫn thêm bản mẫu"
```

---

### Task 4: Proto mẫu — năm state ghép từ `@crm/ui`

**independent: false** — cần `ProtoState` từ Task 1.
**Phục vụ:** E1 (component thật), E4 (state đổi nội dung), E13 (ma trận chụp).

**Files:**
- Create: `apps/app/app/proto/_modules/duong-proto/index.tsx`

**Interfaces:**
- Consumes: `ProtoState` từ `apps/app/app/proto/catalog.ts`
- Produces: `export function DuongProtoMau({ state }: { state: string })`

- [ ] **Bước 1: Viết module**

Ràng buộc bắt buộc khi viết: mỗi state phải cho một cây DOM **khác nhau thấy được** — E4 so bằm thân trang giữa các state, hai state cho cùng một cây là ĐỎ.

```tsx
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Empty, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import { Separator } from "@crm/ui/components/separator";

const DOI_TAC = [
	{ ten: "Ngân hàng Đại Nam", loai: "RM ngân hàng", trangThai: "Đang theo" },
	{ ten: "Sàn Phương Bắc", loai: "Môi giới", trangThai: "Mới" },
	{ ten: "Công ty Tân Việt", loai: "Môi giới", trangThai: "Đã ký" },
];

const DAI = Array.from({ length: 24 }, (_, i) => ({
	ten: `Đối tác số ${i + 1} với một cái tên rất dài để thử tràn dòng`,
	loai: i % 2 === 0 ? "Môi giới" : "RM ngân hàng",
	trangThai: "Đang theo",
}));

export function DuongProtoMau({ state }: { state: string }) {
	if (state === "rong") {
		return (
			<Card>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>Chưa có đối tác nào</EmptyTitle>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	if (state === "dang-tai") {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Đối tác</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col gap-3">
						<div className="h-5 w-2/3 animate-pulse rounded-md bg-muted" />
						<div className="h-5 w-1/2 animate-pulse rounded-md bg-muted" />
						<div className="h-5 w-3/5 animate-pulse rounded-md bg-muted" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (state === "loi") {
		return (
			<Alert variant="destructive">
				<AlertTitle>Không tải được danh sách đối tác</AlertTitle>
				<AlertDescription>
					Máy chủ không trả lời. Thử lại sau ít phút.
				</AlertDescription>
			</Alert>
		);
	}

	const hang = state === "tran-dai" ? DAI : DOI_TAC;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Đối tác</CardTitle>
				<CardDescription>{hang.length} đối tác đang theo dõi</CardDescription>
			</CardHeader>
			<CardContent>
				<ul className="flex flex-col gap-3">
					{hang.map((d) => (
						<li key={d.ten} className="flex flex-col gap-2">
							<div className="flex items-center justify-between gap-3">
								<span className="truncate font-medium">{d.ten}</span>
								<Badge variant="secondary">{d.trangThai}</Badge>
							</div>
							<span className="text-muted-foreground text-sm">{d.loai}</span>
							<Separator />
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
```

- [ ] **Bước 2: Verify kiểu**

Chạy: `bun run check-types`
Đợi: mã 0.

- [ ] **Bước 3: Verify không kéo gói máy chủ**

Chạy: `grep -rnE 'from "@crm/(db|auth)"|from "@crm/ui"' apps/app/app/proto/ ; echo "exit=$?"`
Đợi: không dòng nào khớp (grep trả 1).

- [ ] **Bước 4: Commit**

```bash
git add apps/app/app/proto/_modules/duong-proto/index.tsx
git commit -m "feat(proto): bản mẫu năm state ghép từ component dùng chung"
```

---

### Task 5: Nhánh route — cờ dev, mục lục, trang proto, thanh chuyển state

**independent: false** — cần Task 1 và Task 4.
**Phục vụ:** E1, E2, E5, E6, E7.

**Files:**
- Create: `apps/app/app/proto/registry.ts`
- Create: `apps/app/app/proto/layout.tsx`
- Create: `apps/app/app/proto/page.tsx`
- Create: `apps/app/app/proto/[slug]/page.tsx`
- Create: `apps/app/app/proto/state-switcher.tsx`

**Interfaces:**
- Consumes: `PROTO_CATALOG`, `timProto`, `timState`, `ProtoCatalogEntry` từ `catalog.ts`; `DuongProtoMau` từ `_modules/duong-proto`
- Produces: `export const PROTO_COMPONENTS: Record<string, (p: { state: string }) => React.ReactNode>`

- [ ] **Bước 1: `registry.ts`**

```ts
import type { ReactNode } from "react";
import { PROTO_CATALOG } from "./catalog";
import { DuongProtoMau } from "./_modules/duong-proto";

export const PROTO_COMPONENTS: Record<
	string,
	(props: { state: string }) => ReactNode
> = {
	"duong-proto": DuongProtoMau,
};

export function mucMoCoi(): string[] {
	const trongSo = PROTO_CATALOG.map((muc) => muc.slug);
	const trongBang = Object.keys(PROTO_COMPONENTS);
	return [
		...trongSo.filter((s) => !trongBang.includes(s)),
		...trongBang.filter((s) => !trongSo.includes(s)),
	];
}
```

- [ ] **Bước 2: `layout.tsx` — cờ, một chỗ duy nhất**

```tsx
import { notFound } from "next/navigation";

export default function ProtoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	if (process.env.PROTO_ROUTE !== "1") notFound();

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
			{children}
		</main>
	);
}
```

- [ ] **Bước 3: `state-switcher.tsx` — link thật, không nút chạy JavaScript**

```tsx
import Link from "next/link";
import type { ProtoState } from "./catalog";

export function StateSwitcher({
	slug,
	states,
	dangBat,
}: {
	slug: string;
	states: ProtoState[];
	dangBat: string;
}) {
	return (
		<nav className="flex flex-wrap gap-2" aria-label="Trạng thái">
			{states.map((s) => (
				<Link
					key={s.id}
					href={`/proto/${slug}?state=${s.id}`}
					aria-current={s.id === dangBat ? "page" : undefined}
					className={
						s.id === dangBat
							? "rounded-md bg-primary px-3 py-1.5 text-primary-foreground text-sm"
							: "rounded-md border px-3 py-1.5 text-sm"
					}
				>
					{s.nhan}
				</Link>
			))}
		</nav>
	);
}
```

- [ ] **Bước 4: `page.tsx` — mục lục, href dựng từ slug**

```tsx
import Link from "next/link";
import { Empty, EmptyHeader, EmptyTitle } from "@crm/ui/components/empty";
import { PROTO_CATALOG } from "./catalog";

export default function ProtoIndexPage() {
	if (PROTO_CATALOG.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>Chưa có bản mẫu nào — xem docs/proto.md</EmptyTitle>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<>
			<h1 className="font-semibold text-2xl">Bản mẫu giao diện</h1>
			<ul className="flex flex-col gap-2">
				{PROTO_CATALOG.map((muc) => (
					<li key={muc.slug}>
						<Link
							href={`/proto/${muc.slug}`}
							data-proto-slug={muc.slug}
							className="flex items-center justify-between rounded-lg border p-4"
						>
							<span className="font-medium">{muc.ten}</span>
							<span className="text-muted-foreground text-sm">
								{muc.slug} · {muc.states.length} trạng thái
							</span>
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}
```

- [ ] **Bước 5: `[slug]/page.tsx` — đọc Promise TRONG Suspense**

```tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { timProto, timState } from "../catalog";
import { PROTO_COMPONENTS } from "../registry";
import { StateSwitcher } from "../state-switcher";

export const instant = false;

export default function ProtoPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ state?: string }>;
}) {
	return (
		<Suspense fallback={null}>
			<MotProto params={params} searchParams={searchParams} />
		</Suspense>
	);
}

async function MotProto({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ state?: string }>;
}) {
	const [{ slug }, { state }] = await Promise.all([params, searchParams]);

	const muc = timProto(slug);
	if (muc === undefined) notFound();

	const dangBat = timState(muc, state);
	if (dangBat === undefined) notFound();

	const Proto = PROTO_COMPONENTS[slug];
	if (Proto === undefined) notFound();

	return (
		<>
			<h1 className="font-semibold text-2xl">{muc.ten}</h1>
			<StateSwitcher slug={slug} states={muc.states} dangBat={dangBat.id} />
			<Proto state={dangBat.id} />
		</>
	);
}
```

- [ ] **Bước 6: Verify kiểu và lint**

Chạy: `bun run check-types && bun run lint && bun run lint:slop`
Đợi: cả ba mã 0.

- [ ] **Bước 7: Verify bằng mắt, cả hai chiều cờ**

Chạy: `PROTO_ROUTE=1 bun --filter=app run dev` ở một cửa sổ, rồi:
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/proto/duong-proto` → `200`
- `curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/proto/duong-proto?state=khong-ton-tai"` → `404`
- `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/proto/khong-ton-tai` → `404`

Dừng server, chạy lại **không có** `PROTO_ROUTE`:
- `/proto` và `/proto/duong-proto` → cả hai `404`

- [ ] **Bước 8: Commit**

```bash
git add apps/app/app/proto/registry.ts apps/app/app/proto/layout.tsx apps/app/app/proto/page.tsx apps/app/app/proto/state-switcher.tsx "apps/app/app/proto/[slug]/page.tsx"
git commit -m "feat(proto): nhánh route sau cờ dev — mục lục, trang proto, thanh chuyển state"
```

---

### Task 6: Khai ba khoá `design_pass` vào config

**independent: false** — `proto_route` và `host_embed.route` phải trỏ vào đường đã tồn tại (Task 5).
**Phục vụ:** E9 (AC-9).

**Files:**
- Modify: `_acceptance/config.yaml` khối `design_pass`

- [ ] **Bước 1: Ghi bằng script splice, KHÔNG sửa tay**

```bash
AG=/Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.14.0
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key design_pass.proto_route --value "http://localhost:3000/proto/{slug}" --write
node "$AG/scripts/config-patch.mjs" --config _acceptance/config.yaml --key design_pass.dev_cmd --value "PROTO_ROUTE=1 TURBO_UI=false bunx turbo run dev --ui=stream --filter=app --filter=api" --write
```

`config-patch.mjs` không splice được map lồng (`host_embed` có ba khoá con) → sửa tay đúng khối đó, giữ nguyên thụt lề của file:

```yaml
  host_embed:
    guide: "docs/proto.md"
    route: "apps/app/app/proto/[slug]/page.tsx"
    dev_flag: "PROTO_ROUTE"
```

- [ ] **Bước 2: Verify**

Chạy: `node -e 'const y=require("fs").readFileSync("_acceptance/config.yaml","utf8"); for (const k of ["proto_route","dev_cmd","host_embed","PROTO_ROUTE=1","{slug}","docs/proto.md"]) if(!y.includes(k)) {console.error("thiếu",k);process.exit(1)}; console.log("đủ")'`
Đợi: in `đủ`, mã 0. Và `test -f "apps/app/app/proto/[slug]/page.tsx" && test -f docs/proto.md` phải mã 0.

- [ ] **Bước 3: Commit**

```bash
git add _acceptance/config.yaml
git commit -m "feat(proto): khai proto_route, dev_cmd và host_embed cho design-pass"
```

---

### Task 7: Răng đo và nối vào config

**independent: false** — cần mọi task trên.
**Phục vụ:** E1–E11 (mọi eval `script`).

**Files:**
- Create: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs` (các chặng HTTP: `co-bat`, `co-tat`, `state-chon-duoc`, `state-la`, `slug-la`, `muc-luc`)
- Create: `_acceptance/duong-proto-cho-design-pass/rang/so-dang-ky.mjs` (E8)
- Create: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs` (E9, E10)
- Create: `_acceptance/duong-proto-cho-design-pass/rang/khong-goi-server.mjs` (E11)
- Create: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs` (E3)
- Modify: `_acceptance/config.yaml` khối `executors.script` và `executors.test`

**Ràng buộc bắt buộc của mọi răng HTTP trong task này:**

- Răng **tự dựng máy chủ của riêng nó** trên một cổng rỗi, KHÔNG đọc `APP_URL` mặc định. Lý do đã đo ở kho này: một bản dev đang chạy ở checkout chính sẽ bị đo thay cho cây đang xét, và kết quả vẫn in ra như thường.
- Gọi **không cookie phiên** — sau Task 2 thì cờ là lớp canh duy nhất, nên đo lúc đang đăng nhập không phân biệt được cờ-chặn với proxy-chặn.
- Nạp danh sách proto bằng `import` `catalog.ts`, **cấm bóc văn bản**.
- Đường dẫn suy từ vị trí script (`import.meta.url`), **cấm hardcode gốc kho**.
- Mã thoát: 0 xanh, khác 0 đỏ kèm thông điệp ghim vật cụ thể; máy chủ không lên trong hạn → mã 2.

- [ ] **Bước 1: Viết `duong-proto.mjs` với sáu chặng**

Chặng `co-tat` phải chạy **ma trận sáu giá trị** — không đặt, `""`, `"0"`, `"false"`, `"true"`, `"1"` — số assert bằng số giá trị; chỉ `"1"` được 200, năm giá trị còn lại phải 404 trên **cả hai** đường `/proto` và `/proto/duong-proto`. Nhận 307 thì thông điệp phải nói "proxy đã chặn, chưa chứng được cờ chặn".

Chặng `muc-luc` phải có **hai vế**: so tập slug hai chiều (phân biệt sót với thừa), và rút `href` thật trên DOM rồi GET từng cái, đòi 200 và đúng tên proto.

Chặng `state-chon-duoc` phải bằm thân trang từng state và đòi **khác nhau đôi một**.

- [ ] **Bước 2: Viết bốn răng tĩnh**

`so-dang-ky.mjs`: sàn cứng (catalog ≥ 1, `duong-proto` đúng 5 state) **trước** mọi vòng lặp, cộng vế không-mồ-côi hai chiều giữa `catalog` và `registry`.
`khai-bao.mjs`: ba khoá config trỏ vật có thật, `dev_flag` rút từ mã nguồn `layout.tsx` chứ không viết tay hai lần; `.env.example` có chú giải trước biến; `docs/proto.md` khác rỗng; `AGENTS.md` có dòng trỏ; và `PROTO_ROUTE` **không** có trong `apps/api/src/config/env.validation.ts`.
`khong-goi-server.mjs`: quét mọi file dưới `apps/app/app/proto/`, bắt cả barrel `"@crm/ui"` lẫn `@crm/db`/`@crm/auth`.
`ban-dung.mjs`: dựng bản production, khởi động, đo `/proto` hai chiều cờ.

- [ ] **Bước 3: Chiều đỏ cho TỪNG răng**

Mỗi răng phải chạy một lượt phá-thử trên bản sao và thấy nó ĐỎ với đúng thông điệp đã khai trong `evals.yaml`. Răng chưa từng đỏ là thước chưa từng chạy — màu xanh của nó không phân biệt được "vật lành" với "fixture hỏng". Ghi lại mã thoát và thông điệp thật của từng lượt phá.

- [ ] **Bước 4: Nối vào config**

Thêm vào `executors.script`: `dp_co_bat`, `dp_co_tat`, `dp_ban_dung`, `dp_state_chon_duoc`, `dp_state_la`, `dp_slug_la`, `dp_muc_luc`, `dp_so_dang_ky`, `dp_config_tro_vat_that`, `dp_khai_bao`, `dp_khong_goi_server`. Thêm vào `executors.test`: `dp_proxy_an_danh`.

Tên khoá phải khớp **đúng** `cmd: config:...` đã khai trong `evals.yaml` — lệch một chữ là `s4-args.mjs` từ chối sinh tệp ở S4.

- [ ] **Bước 5: Verify toàn bộ**

Chạy: `bun run test && bun run check-types && bun run lint && bun run lint:slop && bun run build`
Đợi: cả năm mã 0.

- [ ] **Bước 6: Commit**

```bash
git add _acceptance/duong-proto-cho-design-pass/rang _acceptance/config.yaml
git commit -m "feat(proto): răng đo cho mười một eval script và nối vào config"
```

---

## Thứ tự chạy

Ba task đầu độc lập với nhau, chạy song song được: **Task 1**, **Task 2**, **Task 3**.
Rồi tuần tự: **Task 4** → **Task 5** → **Task 6** → **Task 7**.
