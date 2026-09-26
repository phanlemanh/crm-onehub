# Đổi tên OneHub Center và cột trái /sign-in — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi chữ người dùng đọc «CRM» thành «OneHub Center», và cột trái `/sign-in` theo hướng A (nền lưới chấm, dòng neo lớn, ba bước nối nhau, không `Card`).

**Architecture:** Chữ viết thẳng ở từng chuỗi; một bộ quét dựa trên trình phân tích `typescript` giữ nhất quán và là test đỏ trước của nhóm Chữ. Hai thành phần giao diện mới/mở rộng sống ở `packages/ui` (`LuoiCham`, đường nối của `StepList` tĩnh); `AuthShell` và khối hướng dẫn chỉ ghép chúng. Thước của hồ sơ đã ký chỉ được sửa bằng phép thế tên, trừ ba vạch khai trong hợp đồng.

**Tech Stack:** Next.js (apps/app), NestJS (apps/api), better-auth (packages/auth), Tailwind v4, bun test + happy-dom, puppeteer-core, `typescript` 5.9 (compiler API).

**Spec:** `docs/superpowers/specs/2026-09-26-doi-ten-onehub-center-design.md` · Hợp đồng: `_acceptance/doi-ten-onehub-center/contract.md` · Eval: `_acceptance/doi-ten-onehub-center/evals.yaml`

## Global Constraints

- Tên luôn đủ `OneHub Center`; không `Center` đứng một mình; không `Trung tâm`; tiếng Anh không `the OneHub Center`.
- Bốn ngoại lệ giữ nguyên từng byte: hai câu `This CRM is private.…` ở `packages/auth/src/auth.ts`, `CONTEXT_DEV_DISCOUNT_CODE = "CRM"` ở `packages/db/src/settings.ts`, `Mozilla/5.0 (compatible; CRM/1.0)` ở `packages/db/src/safe-fetch.ts`.
- Không đổi: tên gói `@crm/*`, CSDL `crm_*`, `search_crm`, chỉ dẫn cho model ở `apps/agent` (ngoài `zalo-config.ts`), `apps/api/src/create-app.ts`, `apps/app/app/(landing)/page.tsx`, `apps/app/components/landing/**`, module `/proto` có sẵn, `apps/app/proxy.ts`.
- Không chú thích trong mã. Không `className` đổi màu/góc/viền/bóng của component `@crm/ui` ở chỗ gọi. Tệp `"use client"` không nhập `@crm/auth`/`@crm/db`.
- Màu chỉ từ token (`--border`, `--muted`, …); không hex/rgb/hsl/oklch số trong `luoi-cham.tsx`.
- Mỗi chuỗi mới có bản vi và en; khoá mới hay đổi của `messages/*` chạy qua `apps/app/test/messages-guard.spec.ts`.
- `bun test` luôn kèm `TZ=Asia/Ho_Chi_Minh`; test DOM chạy tệp riêng một lệnh (mock.module sống cả tiến trình).
- Một phép đo mới chỉ XONG khi có cặp hai chiều trên cùng fixture: vật lành → xanh, phá vật trong bản sao → đỏ với thông điệp ghim.

## Review Focus

- Không gian đang tên `CRM` ở máy chủ thật → đầu trang phải hiện `OneHub Center`, Cài đặt vẫn hiện `CRM` (Task 4, ca `"CRM"`, `"crm"`, `" Crm "`).
- Kho CSDL mới tinh (phiên đo) → không gian tạo mới tên `OneHub Center`, slug `onehub-center`; thước màn đã ký viết cứng `/crm/` sẽ đỏ ở E13 — kiểm ngay ở Task 4 bằng `grep` trước khi chạy S4.
- Câu tiếng Việt thế máy móc thành vô nghĩa («OneHub Center của bạn») → bảng viết lại ở Task 2 liệt đích danh 11 câu phải viết lại, không thế.
- Đường nối của `StepList` tô `bg-muted` trùng nền cột trái → Task 5 ép `bg-border`, Task 7 đo màu (E11).
- Nền lưới làm thước cũ `do-cua-vao.mjs` đỏ vạch `khong-shader` → Task 6 gỡ đúng vạch đó, E13 kiểm phần gỡ không lan.

---

### Task 1: Từ điển và bộ quét tên (đỏ trước)

**Phục vụ:** E1, E2 (AC-1, AC-2) · **independent:** false (Task 2–4 dùng bộ quét làm lệnh verify)

**Files:**
- Modify: `CONTEXT.md` (thêm mục «OneHub Center» sau mục «Không gian làm việc»)
- Create: `_acceptance/doi-ten-onehub-center/rang/quet-ten.mjs`
- Create: `_acceptance/doi-ten-onehub-center/rang/ngoai-le.json`
- Đã có: `_acceptance/doi-ten-onehub-center/rang/tep-mang-ten-cu.txt` (35 dòng)

**Interfaces:**
- Produces: `bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs` → in `DUNG|SAI <thông điệp>` từng dòng, `KET LUAN …`, thoát 0/1/2. Xuất `docChuoi(tep, noiDung)` → `{dong:number, chu:string}[]` và `viPhamLuatTen(chu)` → `string|null` cho Task 8.

- [ ] **Step 1: Thêm mục từ điển**

Thêm vào `CONTEXT.md`, ngay sau đoạn «Không gian làm việc»:

```markdown
**OneHub Center**: tên sản phẩm trên màn hình, trùng tên miền `onehub.center`.
Luôn viết đủ hai chữ, không dịch, tiếng Anh không kèm «the». Chốt 2026-09-26.
_Avoid_: CRM (trên màn hình), Center (đứng một mình), Trung tâm
Vì sao: «Center» đứng một mình đọc như danh từ chung; «CRM» kéo theo nghĩa bán
hàng mà mục *Nhân viên quan hệ đối tác* đã gạt.
```

- [ ] **Step 2: Viết `ngoai-le.json`**

```json
[
  { "tep": "packages/auth/src/auth.ts", "chu": "This CRM is private. Sign in with your @" },
  { "tep": "packages/auth/src/auth.ts", "chu": "This CRM is private. That address is not on the allow-list." },
  { "tep": "packages/db/src/settings.ts", "chu": "CRM" },
  { "tep": "packages/db/src/safe-fetch.ts", "chu": "Mozilla/5.0 (compatible; CRM/1.0)" }
]
```

(Chuỗi đầu là `TemplateHead` của template literal — trình phân tích trả phần trước `${domain}`.)

- [ ] **Step 3: Viết `quet-ten.mjs`**

```js
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const TAP_QUET =
	/^(apps\/app\/(app|components|lib)\/.*\.tsx?|apps\/api\/src\/.*\.ts|packages\/[^/]+\/src\/.*\.tsx?|apps\/agent\/agent\/lib\/zalo-[^/]*\.ts|apps\/app\/public\/site\.webmanifest)$/;
const TAP_LOAI_TRU = [
	/^apps\/app\/app\/\(landing\)\/page\.tsx$/,
	/^apps\/app\/components\/landing\//,
	/^apps\/app\/app\/proto\//,
	/^apps\/api\/src\/create-app\.ts$/,
	/\/test\//,
	/\.(spec|test)\.tsx?$/,
	/\.dom\.tsx$/,
];
const BON_NGOAI_LE = [
	"packages/auth/src/auth.ts\u0000This CRM is private. Sign in with your @",
	"packages/auth/src/auth.ts\u0000This CRM is private. That address is not on the allow-list.",
	"packages/db/src/settings.ts\u0000CRM",
	"packages/db/src/safe-fetch.ts\u0000Mozilla/5.0 (compatible; CRM/1.0)",
];
const TEN_CU = /\bCRM\b/;

const dong = [];
function ghi(dat, chu) {
	dong.push(dat);
	console.log(`${dat ? "DUNG" : "SAI"} ${chu}`);
}

export function docChuoi(tep, noiDung) {
	if (tep.endsWith(".webmanifest")) {
		return Object.values(JSON.parse(noiDung))
			.filter((v) => typeof v === "string")
			.map((chu) => ({ dong: 1, chu }));
	}
	const nguon = ts.createSourceFile(tep, noiDung, ts.ScriptTarget.Latest, true,
		tep.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
	const ra = [];
	const di = (n) => {
		if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) ||
			ts.isTemplateHead(n) || ts.isTemplateMiddle(n) || ts.isTemplateTail(n) ||
			ts.isJsxText(n)) {
			const { line } = nguon.getLineAndCharacterOfPosition(n.getStart());
			ra.push({ dong: line + 1, chu: n.text });
		}
		ts.forEachChild(n, di);
	};
	di(nguon);
	return ra;
}

export function viPhamLuatTen(chu) {
	for (const m of chu.matchAll(/\bCenter\b/g)) {
		if (chu.slice(Math.max(0, m.index - 7), m.index) !== "OneHub ") return "Center tran";
	}
	if (/trung tâm/i.test(chu)) return "dich ten";
	if (/\bthe OneHub Center\b/i.test(chu)) return "the OneHub Center";
	return null;
}

function tepQuet(goc) {
	return execFileSync("git", ["-C", goc, "ls-files"], { encoding: "utf8" })
		.split("\n")
		.filter((t) => TAP_QUET.test(t) && !TAP_LOAI_TRU.some((r) => r.test(t)));
}

function quet(goc) {
	const con = [];
	const thayNgoaiLe = new Set();
	const phamLuat = [];
	for (const tep of tepQuet(goc)) {
		for (const { dong: d, chu } of docChuoi(tep, readFileSync(join(goc, tep), "utf8"))) {
			const khoa = `${tep}\u0000${chu}`;
			if (TEN_CU.test(chu)) {
				if (BON_NGOAI_LE.includes(khoa)) thayNgoaiLe.add(khoa);
				else con.push({ tep, dong: d });
			}
			const loi = viPhamLuatTen(chu);
			if (loi) phamLuat.push({ tep, dong: d, loi });
		}
	}
	return { con, thayNgoaiLe, phamLuat };
}

function doiChungLuatTen() {
	const maTran = [
		["Sign in to OneHub Center", null],
		["Open Center", "Center tran"],
		["the OneHub Center reads", "the OneHub Center"],
		["Trung tâm OneHub", "dich ten"],
	];
	for (const [chu, ky] of maTran) {
		const ra = viPhamLuatTen(chu);
		ghi(ra === ky, `doi chung luat ten «${chu}» -> ${ra ?? "hop le"}`);
	}
}

function mergeBase() {
	return execFileSync("git", ["-C", GOC, "merge-base", "HEAD", "origin/onehub"], { encoding: "utf8" }).trim();
}

function main() {
	doiChungLuatTen();
	const khai = JSON.parse(readFileSync(join(HERE, "ngoai-le.json"), "utf8"))
		.map((m) => `${m.tep}\u0000${m.chu}`);
	const la = khai.filter((k) => !BON_NGOAI_LE.includes(k));
	const thieu = BON_NGOAI_LE.filter((k) => !khai.includes(k));
	for (const k of la) ghi(false, `ngoai le la: ${k.replace("\u0000", ": ")}`);
	for (const k of thieu) ghi(false, `thieu ngoai le: ${k.replace("\u0000", ": ")}`);
	if (la.length === 0 && thieu.length === 0) ghi(true, "ngoai-le.json bang dung bon muc cua hop dong");

	const head = quet(GOC);
	for (const c of head.con) ghi(false, `con CRM: ${c.tep}:${c.dong}`);
	if (head.con.length === 0) ghi(true, "khong con CRM ngoai ngoai le");
	for (const k of BON_NGOAI_LE) {
		ghi(head.thayNgoaiLe.has(k), `${head.thayNgoaiLe.has(k) ? "ngoai le con dung cho" : "ngoai le mo coi"}: ${k.replace("\u0000", ": ")}`);
	}
	for (const p of head.phamLuat) ghi(false, `${p.loi}: ${p.tep}:${p.dong}`);
	if (head.phamLuat.length === 0) ghi(true, "luat ten dat tren moi chuoi");

	const tam = mkdtempSync(join(tmpdir(), "dtoc-base-"));
	try {
		execFileSync("git", ["-C", GOC, "worktree", "add", "--detach", tam, mergeBase()], { stdio: "ignore" });
		const base = new Set(quet(tam).con.map((c) => c.tep));
		const ky = new Set(readFileSync(join(HERE, "tep-mang-ten-cu.txt"), "utf8").split("\n").filter(Boolean));
		for (const t of ky) if (!base.has(t)) ghi(false, `thieu: ${t}`);
		for (const t of base) if (!ky.has(t)) ghi(false, `thua: ${t}`);
		if ([...ky].every((t) => base.has(t)) && [...base].every((t) => ky.has(t))) {
			ghi(true, `merge-base goi ten dung ${ky.size} tep`);
		}
	} finally {
		execFileSync("git", ["-C", GOC, "worktree", "remove", "--force", tam], { stdio: "ignore" });
		rmSync(tam, { recursive: true, force: true });
	}
	const sai = dong.filter((d) => !d).length;
	console.log(`KET LUAN ${dong.length - sai} DUNG, ${sai} SAI`);
	process.exit(sai === 0 ? 0 : 1);
}

if (import.meta.main) {
	try { main(); } catch (loi) { console.log(`KHONG DO DUOC: ${loi.message}`); process.exit(2); }
}
```

- [ ] **Step 4: Chạy — phải ĐỎ trên cây chưa đổi chữ**

Run: `bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs`
Expected: bốn dòng `DUNG doi chung luat ten`, `DUNG ngoai-le.json bang dung bon muc`, ~145 dòng `SAI con CRM: …`, `DUNG merge-base goi ten dung 35 tep`, thoát 1.

- [ ] **Step 5: Phá-thử trên bản sao** — thêm `{ "tep": "apps/app/lib/x.ts", "chu": "CRM" }` vào bản sao `ngoai-le.json` ở `.acceptance-runs/doi-ten-onehub-center/pha/` (chạy script với `HERE` trỏ bản sao bằng cách chép cả thư mục `rang/`), kỳ vọng dòng `SAI ngoai le la: apps/app/lib/x.ts: CRM`. Ghi lệnh và dòng đỏ vào `.acceptance-runs/doi-ten-onehub-center/pha-thu.md`.

- [ ] **Step 6: Commit**

```bash
git add CONTEXT.md _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs _acceptance/doi-ten-onehub-center/rang/ngoai-le.json
git commit -m "s3(doi-ten-onehub-center): mục OneHub Center trong từ điển và bộ quét tên (đỏ trước)"
```

---

### Task 2: Đổi chữ trong `apps/app`

**Phục vụ:** E1, E2, E3, E4, E7 (AC-1..AC-4, AC-7) · **independent:** false

**Files:**
- Modify: 14 tệp `apps/app/lib/messages/*.ts` (danh sách trong `tep-mang-ten-cu.txt`), `apps/app/app/layout.tsx:30-31`, `apps/app/public/site.webmanifest:2`, `apps/app/lib/agent-run-failure.ts:7,21`, `apps/app/lib/agent-transcript.ts:53,74`
- Create: `apps/app/test/onehub-center-tieu-de.dom.tsx`, `apps/app/test/onehub-center-metadata.spec.ts`
- Modify (thước, chỉ phép thế tên): `apps/app/test/cua-vao-sign-in.dom.tsx`, `apps/app/test/agent-transcript.spec.ts`, `apps/app/test/messages-guard.spec.ts` (nếu ghim chuỗi cũ)

**Interfaces:**
- Consumes: `quet-ten.mjs` (Task 1).
- Produces: `authMessages(l).shell.headline`, `authMessages(l).signIn.title`, `cuaVaoMessages(l).lanDau.moTa` mang tên mới; khoá `authMessages(l).shell.eyebrow` bị XOÁ (Task 6 bỏ chỗ dùng).

- [ ] **Step 1: Viết test tiêu đề (đỏ)** — `apps/app/test/onehub-center-tieu-de.dom.tsx`

```tsx
import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

let locale: "vi" | "en" = "vi";
mock.module("@/lib/locale/server", () => ({ getLocale: async () => locale }));

const { AuthShell, AuthHeading } = await import("@/components/auth-shell");

const KY_VONG = {
	vi: {
		h1: "Đăng nhập vào OneHub Center",
		neo: "OneHub Center: đối tác, kế hoạch 30 ngày và OKR.",
	},
	en: {
		h1: "Sign in to OneHub Center",
		neo: "OneHub Center: partners, 30-day plans and OKRs.",
	},
} as const;

async function ve(coKhoi: boolean): Promise<HTMLElement> {
	const cay = await AuthShell({
		children: await AuthHeading({ cap: "h1", title: KY_VONG[locale].h1, description: "" }),
		gioiThieu: coKhoi ? <div data-khoi="" /> : undefined,
	});
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(cay);
	return o;
}

const TRANG = [
	["sign-in", true],
	["dat-mat-khau", false],
	["grant-access", false],
	["onboarding", false],
	["onboarding/research", false],
] as const;

describe("tieu de OneHub Center", () => {
	for (const l of ["vi", "en"] as const) {
		for (const [trang, coKhoi] of TRANG) {
			it(`${trang}/${l}`, async () => {
				locale = l;
				const { authMessages } = await import("@/lib/messages/auth");
				const o = await ve(coKhoi);
				const nhanCu = [...o.querySelectorAll("*")].filter((e) => e.textContent?.trim() === "CRM");
				expect(nhanCu.length, `${trang}/${l}: con nhan CRM`).toBe(0);
				expect(authMessages(l).shell.headline, `tieu de: ${authMessages(l).shell.headline}`).toBe(KY_VONG[l].neo);
				if (trang === "sign-in") {
					expect(authMessages(l).signIn.title).toBe(KY_VONG[l].h1);
					expect(o.querySelector("h1")?.textContent).toBe(KY_VONG[l].h1);
				}
			});
		}
	}
	it("mo ta khoi huong dan (vi)", async () => {
		const { cuaVaoMessages } = await import("@/lib/messages/cua-vao");
		expect(cuaVaoMessages("vi").lanDau.moTa).toBe("OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.");
	});
});
```

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/onehub-center-tieu-de.dom.tsx` → Expected: FAIL 11/11 (`tieu de: CRM của OneHub…`).

- [ ] **Step 2: Viết test metadata (đỏ)** — `apps/app/test/onehub-center-metadata.spec.ts`

```ts
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { metadata } from "../app/layout";

describe("ten tab va manifest", () => {
	it("title mac dinh", () => {
		expect((metadata.title as { default: string }).default).toBe("OneHub Center");
	});
	it("khuon title", () => {
		expect((metadata.title as { template: string }).template).toBe("%s · OneHub Center");
	});
	it("manifest name", () => {
		const m = JSON.parse(readFileSync(join(import.meta.dir, "..", "public", "site.webmanifest"), "utf8"));
		expect(m.name).toBe("OneHub Center");
	});
});
```

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/onehub-center-metadata.spec.ts` → FAIL 3 (`OneHub CRM`).

- [ ] **Step 3: Đổi chữ theo bảng**

Luật thế máy móc (áp mọi dòng không có trong bảng viết-lại dưới):

| Dạng cũ | Dạng mới |
|---|---|
| `OneHub CRM`, `CRM OneHub`, `The OneHub CRM` | `OneHub Center` |
| `the CRM`, `this CRM`, `your CRM` (tiếng Anh, CRM là sản phẩm) | `OneHub Center` |
| `CRM` đứng riêng (vi và en) | `OneHub Center` |
| `trong CRM`, `vào CRM`, `của CRM` | `trong/vào/của OneHub Center` |

Bảng viết-lại (câu phải viết lại, không thế):

| Tệp:dòng | Cũ | Mới |
|---|---|---|
| `messages/agent-builder-khung.ts:28` | Ask about your CRM, tag a record… | Ask about your records, tag a record… |
| `messages/agent-builder-khung.ts:77` | Hỏi về CRM của bạn, gắn thẻ… | Hỏi về dữ liệu trong OneHub Center, gắn thẻ… |
| `messages/agent-builder-o-soan.ts:6` | Ask about your CRM or automate a task… | Ask about your records or automate a task… |
| `messages/agent-builder-o-soan.ts:41` | Hỏi về CRM của bạn, hoặc tả… | Hỏi về dữ liệu trong OneHub Center, hoặc tả… |
| `messages/agent-builder-o-soan.ts:14` | Tag CRM records and integrations | Tag records and integrations |
| `messages/agent-builder-o-soan.ts:16` | CRM records | Records |
| `messages/agent-builder-tro-chuyen.ts:93` | On CRM event | On a record event |
| `messages/agent-builder-tro-chuyen.ts:95` | CRM records in the approved scope | Records in the approved scope |
| `messages/auth.ts:64` | Level up your CRM data | Level up your data in OneHub Center |
| `messages/auth.ts:181` | Làm dày dữ liệu CRM của bạn | Làm dày dữ liệu trong OneHub Center |
| `messages/settings-thanh-vien.ts:100` | Những người vào được CRM của bạn. | Những người vào được OneHub Center. |
| `messages/settings.ts:183` | Tên và website của công ty đang dùng CRM này. | Tên và website của công ty đang dùng OneHub Center. |
| `messages/settings-ket-noi.ts:206` | …linked to another CRM account. | …linked to another OneHub Center account. |
| `messages/auth.ts` `shell.eyebrow` (vi, en) | `"CRM"` | XOÁ khoá (Task 6 bỏ chỗ dùng) |

Tiêu đề và dòng neo đích (AC-3): `signIn.title` vi `Đăng nhập vào OneHub Center`, en `Sign in to OneHub Center`; `shell.headline` vi `OneHub Center: đối tác, kế hoạch 30 ngày và OKR.`, en `OneHub Center: partners, 30-day plans and OKRs.`; `cua-vao.ts` `lanDau.moTa` vi `OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.`, en `OneHub Center only opens for addresses an administrator has allowed.`

`layout.tsx`: `default: "OneHub Center"`, `template: "%s · OneHub Center"`. `site.webmanifest`: `"name": "OneHub Center"`. `agent-run-failure.ts`: `the CRM` → `OneHub Center`. `agent-transcript.ts:53` `Looked the record up in OneHub Center`, `:74` `Changed what OneHub Center tracks`.

- [ ] **Step 4: Sửa thước bằng phép thế tên** — trong `cua-vao-sign-in.dom.tsx`, `agent-transcript.spec.ts`, `messages-guard.spec.ts`: chỉ thay chuỗi cũ bằng đúng chuỗi mới của Step 3, không đổi gì khác (E13 kiểm từng byte ở Task 8).

- [ ] **Step 5: Chạy**

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/onehub-center-tieu-de.dom.tsx` → 11 pass (sau Task 6 thì nhãn nhỏ mới hết; trước Task 6 ca `con nhan CRM` của bốn trang kia vẫn đỏ — ghi nhận, chạy lại ở Task 6).
Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/onehub-center-metadata.spec.ts ./test/messages-guard.spec.ts ./test/agent-transcript.spec.ts` → PASS.
Run: `bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs | grep '^SAI con CRM' | grep -c apps/app` → 0.

- [ ] **Step 6: Commit** — `s3(doi-ten-onehub-center): đổi chữ CRM thành OneHub Center trong apps/app`

---

### Task 3: Đổi chữ ở API, packages và bot Zalo

**Phục vụ:** E1, E2, E6 (AC-1, AC-2, AC-6) · **independent:** false

**Files:**
- Modify: `apps/api/src/{to-chuc/to-chuc-config.ts,zalo/zalo.service.ts,okr/okr-config.ts,contacts/contacts.service.ts,backfill/backfill.service.ts,conversations/conversations.service.ts,currency/currency.contracts.ts}`, `apps/api/src/workspace/workspace.service.ts:170-171` (T3), `packages/auth/src/{thu-mat-khau.ts:10,22,slack-scopes.ts:20,133,slack-connect.ts:42}` (T3), `packages/auth/src/auth.ts:100` (chỉ `appName`, T3), `packages/validation/src/vai-workspace.ts:12`, `packages/db/src/crm-events.ts:12,17,22`, `apps/agent/agent/lib/zalo-config.ts:30,36,46`, `.env.example:300` (dòng mẫu `MAIL_FROM`)
- Create: `packages/auth/test/onehub-center-thu.spec.ts`
- Modify (thước, chỉ phép thế tên): `_acceptance/cai-dat-con-lai-noi-tieng-viet/rang/khong-dich-cua-lat.json`, `_acceptance/dat-okr-trong-crm/rang/man-okr.mjs`, `_acceptance/man-xin-quyen-co-rang/rang/chieu-do.mjs`, cùng các test kho ghim chuỗi cũ (`apps/api/test/*`, `apps/agent/test/*zalo*`, `packages/auth/test/quen-mat-khau-cau-hinh.spec.ts`)

- [ ] **Step 1: Test thư (đỏ)** — `packages/auth/test/onehub-center-thu.spec.ts`

```ts
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { THU_MAT_KHAU } from "../src/thu-mat-khau";

const AUTH = readFileSync(join(import.meta.dir, "..", "src", "auth.ts"), "utf8");

describe("thu va ten ung dung", () => {
	it("tieu de thu dat lai", () => {
		expect(THU_MAT_KHAU.xin.tieuDe).toBe("Đặt lại mật khẩu OneHub Center");
	});
	it("tieu de thu da doi", () => {
		expect(THU_MAT_KHAU.daDoi.tieuDe).toBe("Mật khẩu OneHub Center vừa được đổi");
	});
	it("appName", () => {
		expect(AUTH).toContain('appName: "OneHub Center"');
	});
	it("chuoi phan loai loi khong doi", () => {
		expect(AUTH, "chuoi phan loai loi doi").toContain("`This CRM is private. Sign in with your @${domain} account.`");
		expect(AUTH, "chuoi phan loai loi doi").toContain('"This CRM is private. That address is not on the allow-list."');
	});
});
```

Run: `cd packages/auth && TZ=Asia/Ho_Chi_Minh bun test ./test/onehub-center-thu.spec.ts` → FAIL 3 (tiêu đề cũ, appName `CRM`), PASS 1.

- [ ] **Step 2: Đổi chữ** theo luật thế của Task 2 Step 3. Viết-lại đích danh:

| Tệp:dòng | Mới |
|---|---|
| `conversations.service.ts:768` | `A conversation cannot be moved to another record.` |
| `slack-scopes.ts:20` | `See their email addresses, so it can match them to records in OneHub Center` |
| `slack-scopes.ts:133` | `Names and email addresses, so it can match a Slack account to a record in OneHub Center.` |
| `zalo-config.ts:46` | `Tài khoản OneHub Center của bạn không còn quyền với kế hoạch 30 ngày đầu, nên chưa đánh dấu mục nào.` |
| `thu-mat-khau.ts:10` | `Đặt lại mật khẩu OneHub Center` |
| `thu-mat-khau.ts:22` | `Mật khẩu OneHub Center vừa được đổi` |
| `auth.ts:100` | `appName: "OneHub Center",` (hai dòng 315–316 KHÔNG đụng) |
| `.env.example:300` | `#   MAIL_FROM="OneHub Center <no-reply@onehub.center>"` |

- [ ] **Step 3: Sửa thước bằng phép thế tên** — ba tệp `rang/` đã ký và các test kho: chỉ thay chuỗi cũ bằng chuỗi mới vừa viết.

- [ ] **Step 4: Chạy**

Run: `cd packages/auth && TZ=Asia/Ho_Chi_Minh bun test ./test/onehub-center-thu.spec.ts` → PASS 4.
Run: `bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs` → chỉ còn đỏ ở `workspace-label.ts`, `organization.ts` (Task 4).
Run: `bun run test` (gốc kho) → PASS.

- [ ] **Step 5: Commit** — `s3(doi-ten-onehub-center): đổi chữ ở API, thư mật khẩu và bot Zalo`

---

### Task 4: Nhãn đầu trang và tên không gian mặc định

**Phục vụ:** E5, E5b (AC-5) · **independent:** false

**Files:**
- Modify: `apps/app/lib/workspace-label.ts`, `packages/auth/src/organization.ts:13` (T3)
- Rewrite: `apps/app/test/workspace-label.spec.ts`
- Create: `packages/auth/test/onehub-center-khong-gian.integration.spec.ts`

**Interfaces:** Produces `workspaceLabel(name: string | undefined): string`; `DEFAULT_WORKSPACE_NAME = "OneHub Center"`.

- [ ] **Step 1: Test nhãn (đỏ)** — viết lại `apps/app/test/workspace-label.spec.ts`

```ts
import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";
import { workspaceLabel } from "../lib/workspace-label";

const goc = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const base = execFileSync("git", ["-C", goc, "merge-base", "HEAD", "origin/onehub"], { encoding: "utf8" }).trim();
const nguonCu = execFileSync("git", ["-C", goc, "show", `${base}:packages/auth/src/organization.ts`], { encoding: "utf8" });
const TEN_CU = nguonCu.match(/DEFAULT_WORKSPACE_NAME = "([^"]+)"/)?.[1] ?? "";

const SAN_PHAM = "OneHub Center";
const MA_TRAN: [string | undefined, string][] = [
	[undefined, SAN_PHAM], ["", SAN_PHAM], ["   ", SAN_PHAM],
	[DEFAULT_WORKSPACE_NAME, SAN_PHAM], [TEN_CU, SAN_PHAM], [TEN_CU.toLowerCase(), SAN_PHAM],
	[` ${TEN_CU} `, SAN_PHAM], [SAN_PHAM, SAN_PHAM],
	["Acme", "Acme"], ["  Acme  ", "Acme"], ["Acme CRM", "Acme CRM"],
];

describe("nhan dau trang", () => {
	it("ten mac dinh moi", () => expect(DEFAULT_WORKSPACE_NAME).toBe(SAN_PHAM));
	it("rut duoc ten cu tu merge-base", () => expect(TEN_CU.length).toBeGreaterThan(0));
	for (const [vao, ra] of MA_TRAN) {
		it(`${JSON.stringify(vao)} -> ${ra}`, () => expect(workspaceLabel(vao)).toBe(ra));
	}
});
```

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/workspace-label.spec.ts` → FAIL (`"Acme"` ra `Acme CRM`).

- [ ] **Step 2: Test tạo không gian (đỏ)** — `packages/auth/test/onehub-center-khong-gian.integration.spec.ts`, chép phần dựng db và `beforeEach` dọn bảng của `packages/auth/test/cong-vao.integration.spec.ts`:

```ts
import { beforeEach, describe, expect, it } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { ensureWorkspaceMembership } from "../src/organization";

async function nguoi(email: string) {
	return db.user.create({ data: { email, name: email, emailVerified: true } });
}

beforeEach(async () => {
	await db.member.deleteMany();
	await db.invitation.deleteMany();
	await db.organization.deleteMany();
	await db.user.deleteMany();
});

describe("khong gian mac dinh", () => {
	it("kho trong tao khong gian ten OneHub Center", async () => {
		const u = await nguoi("a@onehub.center");
		await ensureWorkspaceMembership(u.id, u.email, async () => ({ allowed: true }) as never);
		const ws = await db.organization.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
		expect(ws.name, "ten khong gian moi").toBe("OneHub Center");
	});
	it("kho da co khong gian CRM thi giu ten va slug", async () => {
		await db.organization.create({ data: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() } });
		const u = await nguoi("b@onehub.center");
		await ensureWorkspaceMembership(u.id, u.email, async () => ({ allowed: true }) as never);
		const ws = await db.organization.findUniqueOrThrow({ where: { id: WORKSPACE_ID } });
		expect(ws.name, "doi du lieu cu").toBe("CRM");
		expect(ws.slug, "doi slug cu").toBe("crm");
	});
});
```

(Kiểu `AllowDecision` thật lấy từ `packages/auth/src/allow-list.ts`; thay `as never` bằng giá trị đúng khuôn nếu `check-types` đòi.)

Run: `bun run test -- "cd packages/auth && bun test test/onehub-center-khong-gian.integration.spec.ts"` → FAIL ca 1 (`CRM`).

- [ ] **Step 3: Sửa**

`packages/auth/src/organization.ts:13`: `export const DEFAULT_WORKSPACE_NAME = "OneHub Center";`

`apps/app/lib/workspace-label.ts`:

```ts
import { DEFAULT_WORKSPACE_NAME } from "@crm/auth";

const TEN_CU = "crm";

export function workspaceLabel(name: string | undefined): string {
	const trimmed = name?.trim();
	if (!trimmed) return DEFAULT_WORKSPACE_NAME;
	if (trimmed.toLowerCase() === TEN_CU) return DEFAULT_WORKSPACE_NAME;
	return trimmed;
}
```

Kiểm trước: `grep -n '"use client"' apps/app/lib/workspace-label.ts apps/app/components/app-header.tsx` — `app-header.tsx` là client component thì KHÔNG nhập `@crm/auth` ở đây (AGENTS.md); khi đó viết `const SAN_PHAM = "OneHub Center";` trong `workspace-label.ts` và bỏ import.

- [ ] **Step 4: Kiểm slug `crm` viết cứng** — `grep -rln -E "[\"'\`]/crm(/|[\"'\`])" _acceptance/*/rang` → ghi kết quả vào `.acceptance-runs/doi-ten-onehub-center/slug-crm.txt`; tệp nào dựa vào không gian do `ensureWorkspaceMembership` tạo thì là rủi ro cho E13, báo trong nhật ký S3.

- [ ] **Step 5: Chạy** — hai lệnh ở Step 1–2 → PASS; `bun _acceptance/doi-ten-onehub-center/rang/quet-ten.mjs` → thoát 0.

- [ ] **Step 6: Commit** — `s3(doi-ten-onehub-center): nhãn đầu trang và tên không gian mặc định`

---

### Task 5: `LuoiCham` và đường nối của `StepList` (packages/ui)

**Phục vụ:** E9, E10 (AC-9, AC-10) · **independent:** true

**Files:**
- Create: `packages/ui/src/components/luoi-cham.tsx`
- Modify: `packages/ui/src/components/step-list.tsx`
- Create: `packages/ui/test/step-list-noi.dom.tsx`

**Interfaces:** Produces `LuoiCham(): JSX.Element` (không prop) với `data-slot="luoi-cham"`, `aria-hidden="true"`; `StepList` ở `tinh` vẽ `[data-slot=stepper-separator]` giữa các bước.

- [ ] **Step 1: Ghi số đường nối chế độ tiến độ ở merge-base** — chạy trên cây hiện tại (chưa sửa) một lệnh bun in ra `querySelectorAll("[data-slot=stepper-separator]").length` và số `[data-state=completed]` cho `StepList activeStep=2 markCompleted` 3 bước; ghi hai số làm hằng `TIEN_DO_SEP`, `TIEN_DO_XONG` trong test.

- [ ] **Step 2: Test (đỏ)** — `packages/ui/test/step-list-noi.dom.tsx`, dựng theo khuôn `step-list-tinh.dom.tsx` (hàm `dung`, `afterEach`):

```tsx
function danhSach(n: number, tinh: boolean): HTMLElement {
	return dung(
		<StepList activeStep={2} label="Lần đầu vào?" markCompleted tinh={tinh}>
			{Array.from({ length: n }, (_, i) => (
				<StepListItem activeStep={2} key={i} step={i + 1} title={`bước ${i + 1}`} />
			))}
		</StepList>,
	);
}

describe("StepList tinh co duong noi", () => {
	for (const n of [1, 2, 3, 4]) {
		test(`tinh n=${n}`, () => {
			const o = danhSach(n, true);
			const sep = [...o.querySelectorAll("[data-slot=stepper-separator]")];
			expect(sep.length, `tinh n=${n}: ${sep.length} duong noi, can ${n - 1}`).toBe(n - 1);
			for (const s of sep) expect(s.getAttribute("aria-hidden")).toBe("true");
			const muc = [...o.querySelectorAll("[data-slot=stepper-item]")];
			expect(muc.at(-1)?.querySelector("[data-slot=stepper-separator]")).toBeNull();
		});
	}
	test("che do tien do giu nguyen", () => {
		const o = danhSach(3, false);
		expect(o.querySelectorAll("[data-slot=stepper-separator]").length).toBe(TIEN_DO_SEP);
		expect(o.querySelectorAll("[data-state=completed]").length).toBe(TIEN_DO_XONG);
	});
});
```

Run: `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/step-list-noi.dom.tsx` → FAIL `tinh n=3: 0 duong noi, can 2`.

- [ ] **Step 3: `StepList`** — trong `step-list.tsx`: thêm `SoBuocContext = createContext(0)`; `StepList` bọc `SoBuocContext.Provider value={Children.count(children)}`; `StepListItem` đọc `tinh` và `soBuoc`, khi `tinh && step < soBuoc` render ngay trong `StepperItem`:

```tsx
<StepperSeparator className="absolute top-7 bottom-0 left-3 m-0 h-auto w-px rounded-none bg-border group-data-[orientation=vertical]/stepper-nav:h-auto group-data-[orientation=vertical]/stepper-nav:w-px" />
```

cùng `aria-hidden` — `StepperSeparator` không nhận prop đó, nên bọc: `<span aria-hidden="true" className="contents"><StepperSeparator … /></span>` và đổi `className` của `StepperItem` thành `relative flex-row items-start justify-start gap-3 pb-5 last:pb-0`. `m-0 rounded-none bg-border` ở đây là trong `packages/ui` (chỗ định nghĩa biến thể), không phải chỗ gọi.

- [ ] **Step 4: `LuoiCham`** — `packages/ui/src/components/luoi-cham.tsx`:

```tsx
export function LuoiCham() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:radial-gradient(ellipse_80%_70%_at_30%_45%,black,transparent)]"
			data-slot="luoi-cham"
		/>
	);
}
```

Kiểm `packages/ui/package.json` `exports` phủ `./components/*`; không thì thêm mục.

- [ ] **Step 5: Chạy** — lệnh Step 2 → PASS 5; `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --preload ./test/setup-dom.ts ./test/step-list-tinh.dom.tsx` → PASS (E21 cũ).

- [ ] **Step 6: Commit** — `s3(doi-ten-onehub-center): LuoiCham và đường nối cho StepList tĩnh`

---

### Task 6: `AuthShell`, khối hướng dẫn, gỡ `AuthShader`

**Phục vụ:** E3, E8, E10, E12 (AC-3, AC-8, AC-10, AC-12) · **independent:** false (cần Task 2, Task 5)

**Files:**
- Modify: `apps/app/components/auth-shell.tsx`, `apps/app/components/cua-vao/khoi-huong-dan.tsx`, `apps/app/app/(landing)/sign-in/page.tsx` (bỏ prop `laGi` nếu khối không còn dùng)
- Delete: `apps/app/components/auth-shader.tsx`
- Create: `apps/app/test/onehub-center-nen.dom.tsx`
- Modify (thước — ĐÚNG ba vạch thay thế): `apps/app/test/cua-vao-shell.dom.tsx` (vạch «có con của AuthShader», «có chữ CRM», «bg-muted phẳng khi có khối» + ca «khong hieu ung nen» đối chứng), `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs` (mã `khong-shader` khỏi `MA_TRAN` và khối ghi của nó)

- [ ] **Step 1: Test nền (đỏ)** — `apps/app/test/onehub-center-nen.dom.tsx`

```tsx
import { describe, expect, it, mock } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("@/lib/locale/server", () => ({ getLocale: async () => "vi" as const }));
const { AuthShell } = await import("@/components/auth-shell");
const GOC = join(import.meta.dir, "..", "..", "..");

async function cotTrai(coKhoi: boolean): Promise<Element | undefined> {
	const o = document.createElement("div");
	o.innerHTML = renderToStaticMarkup(await AuthShell({ children: <p />, gioiThieu: coKhoi ? <div data-khoi-huong-dan="" /> : undefined }));
	return [...o.querySelectorAll("main > section")].find((s) => s.className.includes("bg-muted"));
}

describe("nen luoi cham", () => {
	for (const coKhoi of [true, false]) {
		it(`cot trai co luoi-cham (${coKhoi ? "sign-in" : "bon trang kia"})`, async () => {
			const luoi = (await cotTrai(coKhoi))?.querySelectorAll("[data-slot=luoi-cham]") ?? [];
			expect(luoi.length, "khong co luoi-cham").toBe(1);
			expect(luoi[0]?.getAttribute("aria-hidden")).toBe("true");
		});
	}
	it("auth-shader.tsx da xoa", () => {
		expect(existsSync(join(GOC, "apps/app/components/auth-shader.tsx")), "auth-shader.tsx van con").toBe(false);
	});
	it("khong tep nao nhap auth-shader", () => {
		let ra = "";
		try {
			ra = execFileSync("git", ["-C", GOC, "grep", "-l", "auth-shader", "--", "apps/app"], { encoding: "utf8" });
		} catch {
			ra = "";
		}
		expect(ra.trim(), "con nhap auth-shader").toBe("");
	});
	it("luoi-cham khong mau viet cung", () => {
		const nguon = readFileSync(join(GOC, "packages/ui/src/components/luoi-cham.tsx"), "utf8");
		expect(nguon).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(\s*[0-9]/i);
	});
});
```

(`git grep` thoát 1 khi không thấy gì — đó là ca xanh, nên bắt lỗi thành chuỗi rỗng.)

Run: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/onehub-center-nen.dom.tsx` → FAIL `khong co luoi-cham`, `auth-shader.tsx van con`.

- [ ] **Step 2: `AuthShell`** — thay `AuthShader` bằng `<LuoiCham />` (nhập `@crm/ui/components/luoi-cham`) ở cả hai nhánh; nhánh có `gioiThieu`: section trái thành `relative flex flex-col gap-10 overflow-hidden bg-muted px-6 py-10 sm:px-10 lg:order-first lg:min-h-svh lg:p-12`, logo bọc `relative hidden lg:flex`, `{gioiThieu}` bọc `<div className="relative flex flex-1 flex-col justify-center">`; nhánh không `gioiThieu`: bỏ khối `<p … m.eyebrow>`, giữ `h1` dòng neo, thêm `relative` cho con. Xoá `apps/app/components/auth-shader.tsx`.

- [ ] **Step 3: `KhoiHuongDan`** — bỏ `Card`; cấu trúc:

```tsx
<div className="contents" data-khoi-huong-dan="">
	<p className="hidden max-w-[18ch] font-semibold text-5xl/tight text-balance tracking-tight lg:block 2xl:text-6xl/tight">{laGi}</p>
	<div className="flex w-full max-w-xl flex-col gap-5 lg:mt-14">
		<div className="flex flex-col gap-1.5">
			<p className="font-mono text-muted-foreground text-xs/4 uppercase">{tieuDe}</p>
			<p className="text-muted-foreground text-sm">{moTa}</p>
		</div>
		<StepList label={tieuDe} tinh>{…}</StepList>
	</div>
	<p className="text-muted-foreground text-sm lg:hidden">{laGi}</p>
</div>
```

`data-khoi-huong-dan` phải nằm trên phần tử có hộp (không `contents`) để thước đo `getBoundingClientRect` — chuyển thuộc tính sang `div.max-w-xl` và cập nhật các test `cua-vao-*` đang tìm `[data-khoi-huong-dan]` (vẫn cùng tên thuộc tính, chỉ đổi phần tử mang nó). Đây là những lớp bố cục (`max-w-*`, `text-*`, `font-*`) trên phần tử HTML thường, không phải component `@crm/ui`.

- [ ] **Step 4: Ba vạch thay thế** — trong `cua-vao-shell.dom.tsx`: bỏ `expect(coHieuUngNen(trai)).toBe(true)`, `expect(trai?.textContent).toContain("CRM")`, `expect(sau?.className).toContain("bg-muted")` (phiên bản có khối), và `expect(phanCuaMain(o).some(coHieuUngNen)).toBe(false)`; đổi `DONG_TIEU_DE` theo phép thế tên. Trong `do-cua-vao.mjs`: bỏ `"khong-shader"` khỏi mảng mã ở `MA_TRAN` và khối `ghi(\`${giaoDien}-khong-shader\`, …)`; không đổi dòng nào khác.

- [ ] **Step 5: Chạy** — lệnh Step 1 → PASS 5; `bun test` riêng từng tệp `cua-vao-shell.dom.tsx`, `cua-vao-sign-in.dom.tsx`, `cua-vao-trang-khac.dom.tsx`, `onehub-center-tieu-de.dom.tsx` → PASS; `bun run check-types`, `bun run build` → xanh.

- [ ] **Step 6: Commit** — `s3(doi-ten-onehub-center): cột trái hướng A, nền LuoiCham cho năm trang AuthShell`

---

### Task 7: Thước màn (do-cot-trai), giữ lời hứa, soi mã

**Phục vụ:** E8, E11, E12, E14, E15, E16 (AC-8, AC-11, AC-12, AC-14, AC-15) · **independent:** false (cần Task 6)

**Files:**
- Create: `_acceptance/doi-ten-onehub-center/rang/do-cot-trai.mjs`, `_acceptance/doi-ten-onehub-center/rang/giu-loi-hua.sh`, `_acceptance/doi-ten-onehub-center/rang/soi-ma.mjs`

- [ ] **Step 1: `do-cot-trai.mjs`** — chép khung của `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs` (các hằng `CHROME`, `APP`, `API`, `CHO_MS`, hàm `ghi`, `mo`, `tuongPhan`, `canhCay()` đầu `main`, khối kết luận so `MA_TRAN`), thay phần đo bằng:

```js
const KHO = [
	{ ten: "1440", rong: 1440, cao: 900 },
	{ ten: "1920", rong: 1920, cao: 1080 },
];
const GIAO_DIEN = ["light", "dark"];
const CO_NEO_TOI_THIEU = 36;
const RONG_KHOI_TOI_DA = 576;
const LECH_TOI_DA = 1;
const CHI_VI_TRI = process.argv.includes("--chi-vi-tri");
const CHUP = process.argv.includes("--chup");
const KHO_CHON = process.argv.includes("--kho") ? process.argv[process.argv.indexOf("--kho") + 1] : null;

async function doCot(trang, kho, g) {
	await mo(trang, "/sign-in", g, kho);
	const r = await trang.evaluate(() => {
		const khoi = document.querySelector("[data-khoi-huong-dan]");
		const cot = khoi?.closest("section");
		const logo = cot?.querySelector("svg");
		const neo = [...(cot?.querySelectorAll("p") ?? [])].find((p) => getComputedStyle(p).display !== "none" && Number.parseFloat(getComputedStyle(p).fontSize) >= 30);
		const hop = (e) => e?.getBoundingClientRect();
		return {
			card: cot?.querySelectorAll("[data-slot=card]").length ?? -1,
			neoTag: neo?.tagName ?? null,
			neoCo: neo ? Number.parseFloat(getComputedStyle(neo).fontSize) : 0,
			lechKhoi: Math.abs((hop(khoi)?.left ?? -99) - (hop(logo)?.left ?? 0)),
			lechNeo: Math.abs((hop(neo)?.left ?? -99) - (hop(logo)?.left ?? 0)),
			rongKhoi: hop(khoi)?.width ?? 0,
			h1: document.querySelectorAll("h1").length,
			trai: (hop(cot)?.left ?? 99) < 10,
			tran: document.documentElement.scrollWidth > window.innerWidth,
		};
	});
	const o = `${kho.ten}/${g}`;
	if (CHI_VI_TRI) {
		ghi(`${o}-vi-tri`, r.trai, `${o}: khoi ${r.trai ? "o" : "KHONG o"} cot trai`);
		ghi(`${o}-tran`, !r.tran, `${o}: ${r.tran ? "CO" : "khong"} tran ngang`);
		return;
	}
	ghi(`${o}-card`, r.card === 0, `${o}: ${r.card === 0 ? "khong co" : "co"} card trong cot trai`);
	ghi(`${o}-neo`, r.neoTag === "P" && r.neoCo >= CO_NEO_TOI_THIEU, `${o}: dong gioi thieu ${r.neoTag} ${r.neoCo}px (can p >= ${CO_NEO_TOI_THIEU}px)`);
	ghi(`${o}-mep`, r.lechKhoi <= LECH_TOI_DA && r.lechNeo <= LECH_TOI_DA, `${o}: lech mep khoi ${r.lechKhoi}px, dong neo ${r.lechNeo}px`);
	ghi(`${o}-rong`, r.rongKhoi <= RONG_KHOI_TOI_DA, `${o}: khoi rong ${r.rongKhoi}px`);
	ghi(`${o}-h1`, r.h1 === 1, `${o}: ${r.h1} h1`);
}
```

Thêm `doMau(trang, g)` ở 1440 (E11): đọc `backgroundColor` của `body`, của `section` cột trái, `background-image` của `[data-slot=luoi-cham]` (rút màu trong `radial-gradient(`), `backgroundColor` của `[data-slot=stepper-separator]`; ghi `${g}-nen` (độ sáng > 0.5 ở light, < 0.5 ở dark), `${g}-cham` (màu chấm ≠ nền cột), `${g}-duong-noi` (≠ nền cột, thông điệp `${g}: duong noi trung mau nen`), `${g}-tuong-phan` (mọi phần tử của `tuongPhan()` đạt). Tiền đề: đọc `${API}/trpc/sso.signInOptions` như `docSignInOptions` của thước cũ, `google !== true` → `console.log("KHONG DO DUOC: tien de khong dung — API tra google=false")`, thoát 2. `--chup`: chụp `/sign-in` ở 375×812, 1440×900, 1920×1080 × light/dark vào `_acceptance/doi-ten-onehub-center/evidence/sign-in-<kho>-<giao-dien>.png` và ghi `anh-<kho>-<g>` khi tệp > 20 KB. `MA_TRAN` viết trước đúng các mã trên cho chế độ đang chạy. Ghi `evidence/do-cot-trai.json` = mảng `dong`.

- [ ] **Step 2: `giu-loi-hua.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
cmd() { node -e "const y=require('yaml');console.log(y.parse(require('fs').readFileSync('_acceptance/config.yaml','utf8')).executors.$1)"; }
bash -c "$(cmd script.cvdn_do_cua_vao)"
bash -c "$(cmd script.dtoc_do_cot_trai | sed 's|do-cot-trai.mjs"|do-cot-trai.mjs --kho 1920 --chi-vi-tri"|')"
bash -c "$(cmd script.cvdn_ma_loi_that)"
bash -c "$(cmd test.cvdn_step_list_tinh)"
```

(`yaml` giải từ `node_modules/.bun`; nếu `require('yaml')` không thấy ở gốc thì đặt `NODE_PATH` như lệnh đã dùng ở S1.)

- [ ] **Step 3: `soi-ma.mjs`** — chép `_acceptance/cua-vao-dang-nhap/rang/soi-ma.mjs`, giữ vạch (a)(b)(c), thay vạch (e) bằng `DANH_SACH_CAM`:

```js
const DANH_SACH_CAM = [
	/^apps\/app\/proxy\.ts$/,
	/^apps\/app\/app\/\(landing\)\/page\.tsx$/,
	/^apps\/app\/components\/landing\//,
	/^apps\/app\/app\/proto\/_modules\/(?!doi-ten-onehub-center\/)/,
];
const MA_TRAN_CAM = [
	["apps/app/app/(landing)/sign-in/page.tsx", false],
	["apps/app/app/(landing)/het-quyen/page.tsx", false],
	["apps/app/app/proto/_modules/doi-ten-onehub-center/index.tsx", false],
	["apps/app/app/(landing)/page.tsx", true],
	["apps/app/components/landing/hero.tsx", true],
	["apps/app/app/proto/_modules/cua-vao-dang-nhap/index.tsx", true],
	["apps/app/proxy.ts", true],
];
```

cộng hai vạch đọc `diff`: dòng `-`/`+` chứa `This CRM is private` → `SAI (e) packages/auth/src/auth.ts`; `package.json` có hunk đổi `"name"` → `SAI (e) <tep>`; và (d) `existsSync("packages/ui/src/components/luoi-cham.tsx")`.

- [ ] **Step 4: Phá-thử từng thước trên bản sao** (`.acceptance-runs/doi-ten-onehub-center/pha/`): (i) `auth-shell.tsx` bọc khối trong `Card` → `do-cot-trai` đỏ `co card`; (ii) `bg-border` → `bg-muted` ở đường nối → `duong noi trung mau nen`; (iii) thêm `// x` vào `auth-shell.tsx` → `soi-ma` `SAI (b)`; (iv) `style={{ color: "#ff0000" }}` → `dtoc_san_thiet_ke` thoát ≠ 0. Ghi lệnh + dòng đỏ vào `pha-thu.md`.

- [ ] **Step 5: Chạy** — `bash -c "$(… dtoc_do_cot_trai)"` → thoát 0 (đủ 4 ô × 5 vạch + 2 × 4 vạch màu); `bash _acceptance/doi-ten-onehub-center/rang/giu-loi-hua.sh` → thoát 0; `bun _acceptance/doi-ten-onehub-center/rang/soi-ma.mjs` → thoát 0.

- [ ] **Step 6: Commit** — `s3(doi-ten-onehub-center): thước cột trái, giữ lời hứa cũ, soi mã`

---

### Task 8: Bảng thế và thước hồ sơ đã ký; bằng chứng chữ

**Phục vụ:** E7, E13 (AC-7, AC-13) · **independent:** false (chạy sau cùng)

**Files:**
- Create: `_acceptance/doi-ten-onehub-center/rang/bang-the.json`, `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`, `_acceptance/doi-ten-onehub-center/rang/chuoi-doi.mjs`
- Create (sinh): `_acceptance/doi-ten-onehub-center/evidence/chuoi-doi.md`

- [ ] **Step 1: `bang-the.json`** — mảng `{ "cu": "…", "moi": "…" }`, mỗi cặp là một chuỗi cũ/mới xuất hiện trong `diff` của tệp thước đã ký (Task 2 Step 4, Task 3 Step 3, Task 6 Step 4 phần thế tên). Rút bằng: `git diff $(git merge-base HEAD origin/onehub) -- <tệp thước> | grep '^[-+]'`, ghép cặp dòng `-`/`+` liền nhau, lấy đoạn khác nhau nhỏ nhất chứa `CRM`/`OneHub Center`.

- [ ] **Step 2: `thuoc-da-ky.mjs`** — chép `_acceptance/cua-vao-dang-nhap/rang/thuoc-da-ky.mjs` (phần (a): rút eval máy của hồ sơ `signed-off`/`machine-cleared` có `paths` giao diff, chạy ở HEAD và ở `merge-base` qua `git worktree` tạm, chạy lại tuần tự ô đỏ); thêm:

```js
const THAY_THE = [
	{ tep: "apps/app/test/cua-vao-shell.dom.tsx", ma: ["coHieuUngNen(trai)", 'toContain("CRM")', 'toContain("bg-muted")', "some(coHieuUngNen)"] },
	{ tep: "_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs", ma: ["khong-shader"] },
];
const CHUAN = (s) => s.replace(/\b(the |your |this )?(OneHub )?CRM( OneHub)?\b|\bOneHub Center\b/gi, "\u0000TEN\u0000");
```

(b) với mỗi tệp thước bị chạm: bỏ các dòng `-` của `git diff` chứa một `ma` của `THAY_THE`, áp `bang-the.json` ngược (`moi` → `cu`) lên nội dung HEAD, so từng byte với `git show <base>:<tệp>` sau khi cũng bỏ các dòng mang `ma` ở bản base → lệch thì `SAI the: <tệp>`; tệp đã ký bị xoá → `SAI`. (c) mỗi cặp: `/\bCRM\b/.test(cu)` và (`CHUAN(cu) === CHUAN(moi)` hoặc (`git grep -F -e <cu> <base> -- ':!*test*' ':!_acceptance'` có kết quả và `git grep -F -e <moi> HEAD -- ':!*test*' ':!_acceptance'` có kết quả)) → không thì `SAI bang the: <cu> -> <moi>`. (d) mỗi `THAY_THE` có dòng `"supersedes"` trong `decisions.jsonl` (slug `cua-vao-dang-nhap/E2`, `/E11`) → không thì `SAI thay the khong co so`. Chạy nền, ghi `.acceptance-runs/doi-ten-onehub-center/thuoc-da-ky.log`, kết thúc bằng dòng `EXIT <mã>`.

- [ ] **Step 3: Phá-thử** — thêm `{ "cu": "toBe(2)", "moi": "toBe(3)" }` vào bản sao `bang-the.json` → `SAI bang the: toBe(2) -> toBe(3)`.

- [ ] **Step 4: `chuoi-doi.mjs`** — đọc `git diff merge-base..HEAD` của 35 tệp, dùng `docChuoi` (nhập từ `quet-ten.mjs`) trên nội dung base và HEAD, ghép theo tệp + dòng gần nhất, in bảng Markdown `| Tệp | Khoá | Cũ | Mới | vi/en |` vào `evidence/chuoi-doi.md`.

- [ ] **Step 5: Chạy** — `bun _acceptance/doi-ten-onehub-center/rang/chuoi-doi.mjs`; `bun _acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs > .acceptance-runs/doi-ten-onehub-center/thuoc-da-ky.log 2>&1 &` rồi chờ `EXIT`; kỳ vọng `EXIT 0`.

- [ ] **Step 6: Năm lệnh chứng** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` → xanh. Set contract `status: implemented`.

- [ ] **Step 7: Commit** — `s3(doi-ten-onehub-center): bảng thế, thước hồ sơ đã ký, bằng chứng chữ — implemented`
