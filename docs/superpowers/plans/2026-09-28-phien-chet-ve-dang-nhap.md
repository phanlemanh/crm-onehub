# Phiên chết về trang đăng nhập — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người mang cookie phiên đã hết không bao giờ thấy landing của hãng hay trang «không còn trong không gian làm việc» — luôn về `/sign-in`; người còn phiên không đổi gì.

**Architecture:** Proxy tách HTTP 401 của `workspace.get` khỏi «không biết» và chuyển về `/sign-in` (B). Trang `/` và `/het-quyen` tự kiểm phiên bằng `getSession()` như `/onboarding` đã làm (A). Một script đo trên phiên đo riêng của cây chứng cả hai trên stack thật.

**Tech Stack:** Next.js 16 `proxy.ts`, better-auth, tRPC, bun test, puppeteer-core, `scripts/lan-do/tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-09-28-phien-chet-ve-dang-nhap-design.md` · hợp đồng `_acceptance/phien-chet-ve-dang-nhap/contract.md` · eval `_acceptance/phien-chet-ve-dang-nhap/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (AGENTS.md).
- Chỉ 401 của `workspace.get` bật «hết phiên»; timeout, lỗi mạng, 5xx, 403 giữ hành vi cũ.
- Đường công khai (`/` khi `IS_MARKETING=true`), `/sign-in`, đường ẩn danh, `UNGATED` không đổi.
- Không xoá cookie, không đụng `packages/auth` (giữ T2).
- Trang `/` với phiên sống mà API lỗi: ném lỗi, không chuyển `/sign-in`, không vẽ landing.
- Test trang dùng `mock.module` phải nằm trong tệp `.dom.tsx` (runner `test:dom` chạy mỗi tệp một tiến trình).
- Mỗi phép đo mới có cặp hai chiều: vật lành → xanh, phá vật trong bản sao/cây đã commit → đỏ với thông điệp ghim.

## Review Focus

1. Request của người còn phiên mà API trả 401 vì lý do khác phiên (không có) — cả `workspace.get` lẫn `settings.researchKey` chỉ trả 401 khi thiếu phiên; ghim bằng E4 ca 403.
2. Vòng lặp `/sign-in` ↔ `/`: trang đăng nhập thấy phiên sống đẩy về `/`; ghim bằng E6(b) (API lỗi không chuyển `/sign-in`) và E3 (`/sign-in` không bị proxy chạm).
3. Bật marketing: người cookie chết vẫn thấy landing công khai — E3 ca 9 và E7.
4. Bộ đệm cookie `crm.session_data` che phiên bị thu hồi trong phép đo màn — E9/E10 tiền đề 401, mã 2.
5. Locale trình duyệt đo khác `vi` — E9 đặt cookie `lang=vi` và kiểm `html[lang]`.

---

### Task 1: `readWorkspaceGate` nhận ra 401

**independent:** false (Task 2 dùng `hetPhien`) · **phục vụ:** E4, E11

**Files:**
- Modify: `apps/app/lib/onboarding.ts`
- Test: `apps/app/test/onboarding-gate.spec.ts`

**Interfaces:**
- Produces: `WorkspaceGate = { gate: Gate; slug: string | null; inWorkspace: boolean | null; viewerRole: string | null; hetPhien: boolean }`. `readResearchGate` giữ chữ ký.

- [ ] **Step 1: Viết test đỏ** — thêm vào `onboarding-gate.spec.ts`: mở rộng `GateResponse` cho phong bì lỗi thật, thêm helper và `describe`:

```ts
type GateResponse =
	| { result: { data: unknown } }
	| {
			error: {
				message: string;
				code?: number;
				data?: { code: string; httpStatus: number; path: string };
			};
	  };

const loiPhien = (path: string): GateResponse => ({
	error: {
		message: "UNAUTHORIZED",
		code: -32001,
		data: { code: "UNAUTHORIZED", httpStatus: 401, path },
	},
});

function hetPhien() {
	const calls = { count: 0 };
	stub(async (url) => {
		calls.count += 1;
		return json(
			loiPhien(url.includes("workspace.get") ? "workspace.get" : "settings.researchKey"),
			401,
		);
	});
	return calls;
}

const KHONG_BIET = {
	gate: "unknown",
	slug: null,
	inWorkspace: null,
	viewerRole: null,
	hetPhien: false,
};

describe("readWorkspaceGate and a dead session", () => {
	it("doc-401: flags only a 401 as a dead session", async () => {
		const ca: [string, () => void, unknown][] = [
			["401", () => hetPhien(), { ...KHONG_BIET, hetPhien: true }],
			[
				"200",
				() => answerWith(workspace({ onboarded: true, canRename: true })),
				{ gate: "settled", slug: SLUG, inWorkspace: true, viewerRole: "owner", hetPhien: false },
			],
			["403", () => answerWith({ error: { message: "FORBIDDEN" } }, 403), KHONG_BIET],
			["500", () => answerWith({ error: { message: "INTERNAL_SERVER_ERROR" } }, 500), KHONG_BIET],
			["loi mang", () => stub(async () => { throw new Error("connect ECONNREFUSED"); }), KHONG_BIET],
			["het gio", () => stub(async () => { throw new DOMException("timed out", "TimeoutError"); }), KHONG_BIET],
		];
		const sai: string[] = [];
		for (const [ten, dung, mong] of ca) {
			dung();
			const that = await readWorkspaceGate(request("/", [SESSION_COOKIE]));
			if (JSON.stringify(that) !== JSON.stringify(mong)) sai.push(`${ten}: hetPhien sai`);
		}
		const calls = hetPhien();
		const khongCookie = await readWorkspaceGate(request("/"));
		if (JSON.stringify(khongCookie) !== JSON.stringify(KHONG_BIET) || calls.count !== 0)
			sai.push("khong cookie: hetPhien sai");
		expect(ca.length + 1).toBe(7);
		expect(sai).toEqual([]);
	});
});
```

Sửa hai `toEqual` cũ ở test «carries the slug the app is served under» và «says the viewer is out when the API names no role for them»: thêm `hetPhien: false` vào đối tượng mong đợi.

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && bun test ./test/onboarding-gate.spec.ts -t doc-401` → FAIL, `sai` chứa `"401: hetPhien sai"`.

- [ ] **Step 3: Cài** — trong `apps/app/lib/onboarding.ts`:

```ts
const HTTP_HET_PHIEN = 401;

type Doc = { hetPhien: boolean; data: unknown };

const KHONG_DOC: Doc = { hetPhien: false, data: null };

async function read(request: NextRequest, procedure: string): Promise<Doc> {
	const cookie = request.headers.get("cookie");

	if (!cookie) return KHONG_DOC;

	try {
		const response = await fetch(`${API_URL}/api/trpc/${procedure}`, {
			headers: { cookie },
			cache: "no-store",
			signal: AbortSignal.timeout(GATE_TIMEOUT_MS),
		});

		if (response.status === HTTP_HET_PHIEN) return { hetPhien: true, data: null };

		if (!response.ok) return KHONG_DOC;

		return {
			hetPhien: false,
			data: procedureResult.parse(await response.json()).result.data,
		};
	} catch {
		return KHONG_DOC;
	}
}
```

`WorkspaceGate` thêm `hetPhien: boolean`; `readWorkspaceGate` đọc `const doc = await read(request, "workspace.get")`, parse `doc.data`, và trả `hetPhien: doc.hetPhien` ở cả hai nhánh `return`. `readResearchGate` thành `congNghienCuu((await read(request, "settings.researchKey")).data)`.

- [ ] **Step 4: Chạy, thấy xanh** — `cd apps/app && bun test ./test/onboarding-gate.spec.ts` → PASS toàn tệp.

- [ ] **Step 5: Commit** — `git commit -m "phien-chet-ve-dang-nhap: readWorkspaceGate nhận 401 là hết phiên"`.

### Task 2: Proxy chuyển người hết phiên về `/sign-in`

**independent:** false (dùng Task 1) · **phục vụ:** E1, E2, E3, E11

**Files:**
- Modify: `apps/app/proxy.ts`
- Test: `apps/app/test/onboarding-gate.spec.ts`

**Interfaces:**
- Consumes: `WorkspaceGate.hetPhien` (Task 1), `hetPhien()` và `loiPhien()` trong test (Task 1).

- [ ] **Step 1: Viết test đỏ**

```ts
describe("proxy and a dead session", () => {
	it("het-phien: sends the rep to sign in from every gated path", async () => {
		marketing(undefined);
		hetPhien();
		const duong = ["/", `/${SLUG}/companies`, "/companies", "/onboarding", "/onboarding/research"];
		const sai: string[] = [];
		for (const d of duong) {
			if (redirectedTo(await proxy(request(d, [SESSION_COOKIE]))) !== "/sign-in")
				sai.push(`${d}: cookie chet van lot qua proxy`);
		}
		expect(duong.length).toBe(5);
		expect(sai).toEqual([]);
	});

	it("het-phien: leaves a live session where it is", async () => {
		setup();
		expect(
			redirectedTo(await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE]))),
		).toBeNull();
	});

	it("giu-mo: keeps failing open when the API only fails", async () => {
		const ca: [string, () => void][] = [
			["loi mang", () => stub(async () => { throw new Error("connect ECONNREFUSED"); })],
			["het gio", () => stub(async () => { throw new DOMException("timed out", "TimeoutError"); })],
			["500", () => answerWith({ error: { message: "INTERNAL_SERVER_ERROR" } }, 500)],
			["503", () => answerWith({ error: { message: "SERVICE_UNAVAILABLE" } }, 503)],
			["403", () => answerWith({ error: { message: "FORBIDDEN" } }, 403)],
		];
		const sai: string[] = [];
		for (const [ten, dung] of ca) {
			dung();
			if (redirectedTo(await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE]))) !== null)
				sai.push(`${ten}: proxy day ve /sign-in du API chi loi`);
		}
		expect(ca.length).toBe(5);
		expect(sai).toEqual([]);
	});

	it("khong-dung: never touches the paths that skip the gate", async () => {
		marketing(undefined);
		const duong = [
			"/sign-in", "/t/crm.js", "/proto/x", "/dat-mat-khau/abc",
			"/quen-mat-khau", "/grant-access", "/eve/v1/info", "/het-quyen",
		];
		const sai: string[] = [];
		for (const d of duong) {
			const calls = hetPhien();
			const dich = redirectedTo(await proxy(request(d, [SESSION_COOKIE])));
			if (dich !== null || calls.count !== 0)
				sai.push(`${d}: proxy dung vao duong khong co cong`);
		}
		marketing("true");
		hetPhien();
		if (redirectedTo(await proxy(request("/", [SESSION_COOKIE]))) !== null)
			sai.push("marketing bat: / bi day ve /sign-in");
		marketing(undefined);
		const doiChung = hetPhien();
		expect(redirectedTo(await proxy(request(`/${SLUG}/companies`, [SESSION_COOKIE])))).toBe("/sign-in");
		expect(doiChung.count).toBe(1);
		expect(duong.length + 1).toBe(9);
		expect(sai).toEqual([]);
	});
});
```

(`doiChung.count` = 1 vì proxy gọi `workspace.get` và `settings.researchKey` song song — nếu đếm ra 2 thì sửa mong đợi thành 2 và ghi lý do vào sổ; đối chứng dương chỉ cần chứng bộ đếm đếm thật.)

- [ ] **Step 2: Chạy, thấy đỏ** — `cd apps/app && bun test ./test/onboarding-gate.spec.ts -t het-phien` → FAIL `"/: cookie chet van lot qua proxy"`.

- [ ] **Step 3: Cài** — trong `proxy()` ngay sau `Promise.all`:

```ts
	if (workspace.hetPhien && !isPublic(pathname)) {
		return NextResponse.redirect(new URL(SIGN_IN_PATH, request.nextUrl));
	}
```

- [ ] **Step 4: Chạy xanh + phá-thử** — `bun test ./test/onboarding-gate.spec.ts` PASS. Phá-thử trên cây đã commit (sau Step 5, rồi `git checkout -- apps/app`): (a) đổi `response.status === HTTP_HET_PHIEN` thành `!response.ok` → `giu-mo` đỏ «500: proxy day ve /sign-in du API chi loi»; (b) bỏ `&& !isPublic(pathname)` → `khong-dung` đỏ «marketing bat: / bi day ve /sign-in»; (c) chuyển `/sign-in` cho mọi `gate === "unknown"` → test cũ «fails open when the API is unreachable» đỏ.

- [ ] **Step 5: Commit** — `git commit -m "phien-chet-ve-dang-nhap: proxy đưa người hết phiên về /sign-in"`.

### Task 3: Trang `/` và `/het-quyen` tự kiểm phiên

**independent:** true (không dùng Task 1–2) · **phục vụ:** E5, E6, E7, E8

**Files:**
- Create: `apps/app/lib/trang-goc.ts`
- Modify: `apps/app/app/(landing)/page.tsx`, `apps/app/app/(landing)/het-quyen/page.tsx`
- Test: `apps/app/test/phien-chet-trang-goc.dom.tsx`, `apps/app/test/phien-chet-het-quyen.dom.tsx`

**Interfaces:**
- Produces: `duongTrangGoc(): Promise<string>` — `/sign-in` khi không phiên, `/<slug>` khi còn phiên; ném lỗi khi API lỗi hoặc không slug.

- [ ] **Step 1: Test đỏ cho `/`** — `apps/app/test/phien-chet-trang-goc.dom.tsx`:

```tsx
import { afterEach, describe, expect, it, mock } from "bun:test";
import { isValidElement, type ReactElement } from "react";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

const may = {
	phien: null as null | { user: { id: string } },
	workspace: async (): Promise<{ slug: string | null }> => ({ slug: "comp-ai" }),
	goiPhien: 0,
	goiWorkspace: 0,
	chuyen: [] as string[],
};

mock.module("@/lib/session", () => ({
	getSession: async () => {
		may.goiPhien += 1;
		return may.phien;
	},
	requireSession: async () => may.phien,
	requireMailboxAccess: async () => may.phien,
}));
mock.module("@/lib/trpc/server", () => ({
	getServerQueryClient: () => ({
		fetchQuery: async () => {
			may.goiWorkspace += 1;
			return may.workspace();
		},
	}),
	getServerTrpc: () => ({ workspace: { get: { queryOptions: () => ({}) } } }),
}));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		may.chuyen.push(dich);
		throw new ChuyenHuong(dich);
	},
	useRouter: () => ({ push: () => undefined, refresh: () => undefined }),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

const { default: Home } = await import("@/app/(landing)/page");
const { Hero } = await import("@/components/landing/hero");

const coThat = process.env.IS_MARKETING;

function datLai(marketing: string | undefined) {
	if (marketing === undefined) delete process.env.IS_MARKETING;
	else process.env.IS_MARKETING = marketing;
	may.phien = null;
	may.workspace = async () => ({ slug: "comp-ai" });
	may.goiPhien = 0;
	may.goiWorkspace = 0;
	may.chuyen = [];
}

afterEach(() => datLai(coThat));

const bat = (p: Promise<unknown>) => p.then(() => null, (loi: unknown) => loi);

describe("trang goc", () => {
	it("khong-phien: sends a stranger to sign in", async () => {
		datLai(undefined);
		const loi = await bat(Home());
		const dung = loi instanceof ChuyenHuong && loi.dich === "/sign-in" && may.goiWorkspace === 0;
		expect(dung ? "" : "/: khong phien ma khong ve /sign-in").toBe("");
	});

	it("con-phien: takes a live session into the workspace, and never to sign in on failure", async () => {
		const sai: string[] = [];

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		const a = await bat(Home());
		if (!(a instanceof ChuyenHuong && a.dich === "/comp-ai")) sai.push("(a) con phien khong vao workspace");

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		const apiChet = new Error("API chet");
		may.workspace = async () => { throw apiChet; };
		const b = await bat(Home());
		if (b !== apiChet || may.chuyen.length !== 0) sai.push("(b) API loi ma van chuyen huong");

		datLai(undefined);
		may.phien = { user: { id: "u" } };
		may.workspace = async () => ({ slug: null });
		const c = await bat(Home());
		if (!(c instanceof Error) || c instanceof ChuyenHuong || may.chuyen.length !== 0)
			sai.push("(c) khong slug ma van chuyen huong");

		expect(sai).toEqual([]);
	});

	it("marketing-bat: shows the landing page without reading the session", async () => {
		datLai("true");
		const trang = (await Home()) as ReactElement<{ children: unknown[] }>;
		const con = isValidElement(trang) ? [trang.props.children].flat() : [];
		const coHero = con.some((c) => isValidElement(c) && c.type === Hero);
		expect(coHero ? "" : "marketing bat: landing khong con").toBe("");
		expect(may.goiPhien === 0 && may.chuyen.length === 0 ? "" : "marketing bat: trang doc phien").toBe("");
	});
});
```

- [ ] **Step 2: Test đỏ cho `/het-quyen`** — `apps/app/test/phien-chet-het-quyen.dom.tsx`:

```tsx
import { describe, expect, it, mock } from "bun:test";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

class ChuyenHuong extends Error {
	constructor(readonly dich: string) {
		super(`chuyen huong toi ${dich}`);
	}
}

const may = { phien: null as null | { user: { id: string } } };

mock.module("@/lib/session", () => ({
	getSession: async () => may.phien,
	requireSession: async () => may.phien,
	requireMailboxAccess: async () => may.phien,
}));
mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" as const }));
mock.module("next/navigation", () => ({
	redirect: (dich: string) => {
		throw new ChuyenHuong(dich);
	},
	useRouter: () => ({ push: () => undefined, refresh: () => undefined }),
}));

const { default: HetQuyenPage } = await import("@/app/(landing)/het-quyen/page");
const { thanhVienMessages } = await import("@/lib/messages/settings-thanh-vien");
const t = thanhVienMessages("vi").hetQuyen;

describe("het-quyen", () => {
	it("sends a stranger to sign in and keeps the page for a live session", async () => {
		const sai: string[] = [];

		may.phien = null;
		const loi = await HetQuyenPage().then(() => null, (e: unknown) => e);
		if (!(loi instanceof ChuyenHuong && loi.dich === "/sign-in"))
			sai.push("het-quyen: khong phien ma khong ve /sign-in");

		may.phien = { user: { id: "u" } };
		const o = document.createElement("div");
		o.innerHTML = renderToStaticMarkup((await HetQuyenPage()) as ReactElement);
		const nut = [...o.querySelectorAll("button")].map((b) => b.textContent);
		if (o.querySelector("h1")?.textContent !== t.tieuDe || !nut.includes(t.dangXuat))
			sai.push("het-quyen: nguoi con phien mat trang");

		expect(sai).toEqual([]);
	});
});
```

- [ ] **Step 3: Chạy, thấy đỏ** — `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/phien-chet-trang-goc.dom.tsx` → FAIL «/: khong phien ma khong ve /sign-in»; tệp het-quyen → FAIL «het-quyen: khong phien ma khong ve /sign-in».

- [ ] **Step 4: Cài** — `apps/app/lib/trang-goc.ts`:

```ts
import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { workspaceUrl } from "@/lib/workspace-url";

export async function duongTrangGoc(): Promise<string> {
	const phien = await getSession();

	if (!phien) return "/sign-in";

	const workspace = await getServerQueryClient().fetchQuery(
		getServerTrpc().workspace.get.queryOptions(),
	);

	if (!workspace.slug) {
		throw new Error(
			"Trang gốc: workspace.get không trả slug cho một phiên còn sống.",
		);
	}

	return workspaceUrl(workspace.slug);
}
```

`(landing)/page.tsx`: `Home` thành `async`, dòng đầu `if (!isMarketing()) redirect(await duongTrangGoc());`, nhập `redirect` từ `next/navigation`, `isMarketing` từ `@/lib/env`, `duongTrangGoc` từ `@/lib/trang-goc`.

`het-quyen/page.tsx`:

```tsx
export default async function HetQuyenPage() {
	const [phien, locale] = await Promise.all([getSession(), getLocale()]);

	if (!phien) redirect("/sign-in");

	const t = thanhVienMessages(locale).hetQuyen;
	…
```

(kiểu `workspace.get` trả `slug` — kiểm bằng `bun run check-types`; khác tên trường thì theo kiểu thật.)

- [ ] **Step 5: Chạy xanh + phá-thử** — hai lệnh ở Step 3 PASS. Phá-thử trên cây đã commit: đổi nhánh API lỗi thành `redirect("/sign-in")` (bọc `try`) → «(b) API loi ma van chuyen huong»; gọi `getSession()` trước khi xét cờ → «marketing bat: trang doc phien». Rồi `git checkout -- apps/app`.

- [ ] **Step 6: Commit** — `git commit -m "phien-chet-ve-dang-nhap: trang / và /het-quyen tự kiểm phiên"`.

### Task 4: Đo màn và đo API trên phiên đo của cây

**independent:** false (đo Task 1–3) · **phục vụ:** E9, E10

**Files:**
- Create: `_acceptance/phien-chet-ve-dang-nhap/rang/do-man.mjs`

**Interfaces:**
- Consumes: `phien`, `APP`, `API`, `CHROME` từ `_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs`; `canhCay` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`; `PHIEN_DO.nguoi` từ `scripts/lan-do/cau-hinh.mjs`; `db` từ `packages/db/src/client.ts`; `authMessages`; `LANG_COOKIE`.
- Produces: lệnh `bun do-man.mjs man|api`, in từng dòng `DUNG …`/`SAI …` và dòng cuối `KET LUAN: ma <0|1|2>`, thoát đúng mã đó.

- [ ] **Step 1: Viết script** — gốc kho suy từ `import.meta.url`; đọc `metadata.title` của `(landing)/page.tsx` và `template` của `app/layout.tsx` bằng regex trên nguồn; `slug` từ `db.organization.findFirst`. Hàm chung:
  - `thuHoi(cookie)`: token = `decodeURIComponent(value).split(".")[0]`; `db.session.deleteMany({ where: { token } })` phải xoá đúng 1 hàng, không thì mã 2.
  - `tienDe(cookie)`: `fetch(API/api/trpc/workspace.get)` với đúng `crm.session_token` + `lang=vi` phải ra 401, không thì mã 2 «khong do duoc: phien chua chet».
  - chế độ `api` (6 dòng): trước thu hồi — API 200, `/<slug>/agents` không về `/sign-in`; sau thu hồi — API 401, `/<slug>/agents` 307 + Location `/sign-in` + thân không chứa `NEXT_REDIRECT`, `/` 307 Location `/sign-in`, `/het-quyen` 307 Location `/sign-in` hoặc 200 chứa `NEXT_REDIRECT;replace;/sign-in`.
  - chế độ `man` (7 dòng): puppeteer 1280×800 với phiên thu hồi mở `/`, `/<slug>/companies`, `/<slug>/agents`, `/onboarding`, `/het-quyen`; dòng 6 `/` ở 375×812; dòng 7 phiên sống mới ở `/`. Mỗi dòng kiểm đường cuối, `html[lang]`, `document.title`, `innerText` không chứa tiêu đề landing; chụp `pcd-*.png` vào `BANG_CHUNG`.

- [ ] **Step 2: Chạy** — `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/phien-chet-ve-dang-nhap/rang/do-man.mjs api"` rồi `… man` (qua lệnh config `pcd_do_api`, `pcd_do_man`) → `KET LUAN: ma 0`; mở từng ảnh.

- [ ] **Step 3: Phá-thử** — trên cây đã commit, gỡ nhánh `hetPhien` trong `proxy()` (giữ Task 3) → `api` đỏ «api: /<slug>/agents voi phien thu hoi SAI — 200»; `git checkout -- apps/app/proxy.ts`.

- [ ] **Step 4: Commit** — `git commit -m "phien-chet-ve-dang-nhap: răng đo màn và API trên phiên đo"`.

### Task 5: Năm lệnh chứng của kho

**independent:** false · **phục vụ:** E11 và suite

- [ ] **Step 1:** Từ gốc worktree: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` — tất cả thoát 0.
- [ ] **Step 2:** Đặt `status: implemented` trong contract, commit.
