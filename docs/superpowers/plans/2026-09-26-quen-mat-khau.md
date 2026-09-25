# Quên mật khẩu — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người dùng quên mật khẩu tự xin liên kết đặt lại qua thư mà không cửa nào lộ địa chỉ có tài khoản; thư gửi ở nền, liên kết dùng một lần, cờ tắt khi chưa cấu hình thư.

**Architecture:** Nhánh `feat/quen-mat-khau-tiep-quan` = `onehub` + commit 2818333d của PR #104. Vòng này vá phía trên: `packages/auth` gửi thư ở nền qua `advanced.backgroundTasks` (waitUntil), đọc cấu hình thư lúc gọi, dọn chìa còn treo khi đặt xong; `apps/app` mở đường ẩn danh, thêm trạng thái lỗi/quá lượt cho form; `apps/api` chỉ vá test.

**Tech Stack:** Bun 1.3.12, better-auth 1.6.25, `@vercel/functions` 3.9.9, Next.js App Router, NestJS + tRPC, Prisma/Postgres, `bun:test` + jsdom, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-09-26-quen-mat-khau-design.md` · hợp đồng `_acceptance/quen-mat-khau/contract.md` · evals `_acceptance/quen-mat-khau/evals.yaml`

## Global Constraints

- Không viết chú thích trong code, kể cả code sửa (`AGENTS.md`).
- Một `.env` ở gốc; biến mới đã có ba nhà (`.env.example`, `env.validation.ts`, `turbo.json`) từ PR — không thêm nhà thứ tư.
- Hằng số chỉnh được sống trong một đối tượng cấu hình của khu (`THU`, `XIN_DAT_LAI`, `PASSWORD`), không viết số trần hai lần.
- `/packages/ui` là nguồn giao diện; không `className` đổi màu/góc/khoảng cách của component `@crm/ui`.
- Test không dùng `mock.module` ở tệp `.spec.ts` (bun chạy chung một tiến trình); tệp `.dom.tsx` chạy từng tệp qua `test:dom`, vẫn tránh khi làm được bằng prop.
- `fetch` giả phải khôi phục trong `finally`; không `setSystemTime`.
- Tên cờ `quenMatKhau`, đường `/quen-mat-khau`, prop `quenMatKhau: string | null` của `PasswordSignIn`, dòng `quenMatKhau={options?.quenMatKhau ? m.quenMatKhau : null}` ở `sign-in/page.tsx` là giao kèo với vòng `cua-vao-dang-nhap` — không đổi.
- Log không mang địa chỉ email hay thân trả lời của dịch vụ thư.
- Mọi phép đo mới phải có cặp hai chiều trên cùng fixture, chiều đỏ ghim thông điệp (MEASURE-BIRTH-CLAUSE); lượt phá-thử làm trên bản đã commit rồi `git checkout` lại, không phá trên phần chưa commit.
- Làn nặng (`bun run test` toàn kho, S4, repin) xin lượt phiên điều phối trước (`~/dev/crm/.acceptance-runs/dieu-phoi-26-09/LUAT.md`). Chạy từng tệp test thì không cần xin.

## Review Focus

1. Địa chỉ gõ hoa/thường khác kho (`Ada@OneHub.center`) → vẫn cùng câu trả lời, và thư đi tới địa chỉ đang lưu. Ca `chu-hoa` ở Task 2.
2. Địa chỉ sai khuôn (`khong-phai-email`) → cùng mã và cùng thân dù chuỗi đó có "giống" tài khoản nào hay không. Ca `sai-khuon` ở Task 2.
3. Resend trả 200 mà thân không phải JSON → không ném, không thư thứ hai, log một dòng. Ca `than-la` ở Task 2.
4. `APP_URL` có dấu `/` cuối hoặc có đường con → liên kết trong thư không có `//`. Ca `lien-ket-goc` ở Task 1.
5. Bấm gửi hai lần liền → nút tắt ngay lượt đầu, chỉ một lời gọi. Ca `form bam-hai-lan` ở Task 4.

---

## File Structure

| Tệp | Việc |
|---|---|
| `packages/auth/src/chay-nen.ts` (mới) | `chayNen(p)`: bắt lỗi rồi giao cho `waitUntil` |
| `packages/auth/src/env.ts` | cấu hình thư đọc lúc gọi (`thuCauHinh`, `isMailConfigured`), vẫn kiểm cặp lúc nạp |
| `packages/auth/src/thu.ts` | đọc cấu hình lúc gọi, log không thân |
| `packages/auth/src/thu-mat-khau.ts` | tắt sớm khi chưa có thư; `duongDatMatKhau` export để test |
| `packages/auth/src/auth.ts` | `backgroundTasks`, `onPasswordReset` dọn chìa rồi đẩy thư báo vào nền |
| `packages/auth/package.json` | thêm `@vercel/functions` |
| `packages/auth/test/chay-nen.spec.ts` (mới) | E16 |
| `packages/auth/test/quen-mat-khau-cau-hinh.spec.ts` (mới) | E6 |
| `packages/auth/test/quen-mat-khau.integration.spec.ts` (mới) | E7–E12, E14, E15 |
| `apps/api/test/auth.e2e.spec.ts` | vá kỳ vọng `signInOptions` |
| `apps/api/test/quen-mat-khau-co.spec.ts` (mới) | E1, E3 |
| `docs/api.md` | ngoại lệ có tên cho thư giao dịch |
| `apps/app/lib/proxy-paths.ts`, `apps/app/test/proxy-an-danh.spec.ts` | E4 |
| `apps/app/lib/quen-mat-khau.ts` (mới) | `duongQuenMatKhau` |
| `apps/app/app/(landing)/quen-mat-khau/page.tsx`, `quen-mat-khau-form.tsx` | trạng thái, prop `xin`, chữ thật |
| `apps/app/app/(landing)/sign-in/password-sign-in.tsx` | liên kết qua `FieldDescription` + `Link` của `@crm/ui` |
| `apps/app/lib/messages/auth.ts`, `apps/app/test/messages-guard.spec.ts` | chữ mới, ghim hàm mới |
| `apps/app/test/quen-mat-khau-man.dom.tsx` (mới) | E2, E5, E13, E17 |
| `_acceptance/quen-mat-khau/rang/chup.mjs` (mới) | E18, E21 |

---

### Task 1: Nền và cấu hình thư đọc lúc gọi

`independent: false` · phục vụ E6, E16, AC-3, AC-11, Review Focus 4

**Files:**
- Create: `packages/auth/src/chay-nen.ts`, `packages/auth/test/chay-nen.spec.ts`, `packages/auth/test/quen-mat-khau-cau-hinh.spec.ts`
- Modify: `packages/auth/src/env.ts`, `packages/auth/src/thu.ts`, `packages/auth/src/thu-mat-khau.ts`, `packages/auth/package.json`

**Interfaces:**
- Produces: `chayNen(viec: Promise<unknown>): void` · `thuCauHinh(): { apiKey: string; from: string } | undefined` · `isMailConfigured(): boolean` (đọc lúc gọi) · `duongDatMatKhau(token: string, goc?: string): string` · `guiThuXinDatLai({ email, token }): Promise<void>` trả về ngay khi chưa có thư.

- [ ] **Step 1: Thêm phụ thuộc**

Run: `cd packages/auth && bun add @vercel/functions@3.9.9 && cd ../.. && bun install`
Expected: `packages/auth/package.json` có `"@vercel/functions": "3.9.9"`, `bun.lock` đổi.

- [ ] **Step 2: Test đỏ `chay-nen.spec.ts`**

```ts
import { afterEach, describe, expect, it } from "bun:test";
import { chayNen } from "../src/chay-nen";

const KHOA = Symbol.for("@vercel/request-context");
const toanCuc = globalThis as unknown as Record<symbol, unknown>;

afterEach(() => {
	delete toanCuc[KHOA];
});

describe("chay-nen", () => {
	it("giao dung mot promise cho waitUntil khi co context Vercel", async () => {
		const daGiao: Promise<unknown>[] = [];
		toanCuc[KHOA] = { get: () => ({ waitUntil: (p: Promise<unknown>) => daGiao.push(p) }) };
		let xong = false;
		chayNen(Promise.resolve().then(() => { xong = true; }));
		expect(daGiao.length).toBe(1);
		await daGiao[0];
		expect(xong).toBe(true);
	});

	it("khong co context thi khong nem va viec van chay xong", async () => {
		let xong = false;
		const viec = new Promise<void>((r) => setTimeout(() => { xong = true; r(); }, 5));
		expect(() => chayNen(viec)).not.toThrow();
		await viec;
		expect(xong).toBe(true);
	});

	it("viec bi tu choi khong thanh unhandled rejection", async () => {
		const daGiao: Promise<unknown>[] = [];
		toanCuc[KHOA] = { get: () => ({ waitUntil: (p: Promise<unknown>) => daGiao.push(p) }) };
		chayNen(Promise.reject(new Error("resend chet")));
		await expect(daGiao[0]).resolves.toBeUndefined();
	});
});
```

Run: `cd packages/auth && bun test test/chay-nen.spec.ts`
Expected: FAIL — `Cannot find module '../src/chay-nen'`.

- [ ] **Step 3: Viết `chay-nen.ts`**

```ts
import { waitUntil } from "@vercel/functions";

export function chayNen(viec: Promise<unknown>): void {
	const daBat = viec.then(
		() => undefined,
		(loi: unknown) => {
			console.error(`[auth] viec nen that bai: ${(loi as Error)?.name ?? "loi"}`);
		},
	);
	waitUntil(daBat);
}
```

Run lại Step 2 → PASS (3 pass).

- [ ] **Step 4: Test đỏ `quen-mat-khau-cau-hinh.spec.ts`** (E6)

```ts
import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";

const ENV = resolve(import.meta.dir, "../src/env.ts");

function napEnv(bien: Record<string, string>) {
	const ra = Bun.spawnSync(["bun", "-e", `await import(${JSON.stringify(ENV)})`], {
		env: { ...process.env, RESEND_API_KEY: "", MAIL_FROM: "", ...bien },
	});
	return { ma: ra.exitCode, loi: ra.stderr.toString() };
}

describe("cau-hinh-nua", () => {
	it("chi co RESEND_API_KEY thi nap hong va neu ten ca hai bien", () => {
		const ra = napEnv({ RESEND_API_KEY: "re_gia" });
		expect(ra.ma).not.toBe(0);
		expect(ra.loi).toContain("RESEND_API_KEY");
		expect(ra.loi).toContain("MAIL_FROM");
	});

	it("chi co MAIL_FROM thi nap hong va neu ten ca hai bien", () => {
		const ra = napEnv({ MAIL_FROM: "CRM <no-reply@example.test>" });
		expect(ra.ma).not.toBe(0);
		expect(ra.loi).toContain("RESEND_API_KEY");
		expect(ra.loi).toContain("MAIL_FROM");
	});

	it("du ca hai thi nap duoc — doi chung cung khuon spawn", () => {
		expect(napEnv({ RESEND_API_KEY: "re_gia", MAIL_FROM: "CRM <no-reply@example.test>" }).ma).toBe(0);
	});
});
```

Run: `cd packages/auth && bun test test/quen-mat-khau-cau-hinh.spec.ts`
Expected: PASS ngay (PR đã ném đúng). Đây là phép đo mới nên PHẢI làm lượt phá-thử ở Step 8.

- [ ] **Step 5: `env.ts` đọc lúc gọi**

Trong `env.ts`: giữ `thuCredentials`; bỏ `thu: thuCredentials()` khỏi đối tượng `env`; thêm ngay sau đối tượng `env`:

```ts
thuCredentials();

export function thuCauHinh(): { apiKey: string; from: string } | undefined {
	return thuCredentials();
}
```

và đổi `isMailConfigured` thành `return thuCauHinh() !== undefined;`.

- [ ] **Step 6: `thu.ts` và `thu-mat-khau.ts`**

`thu.ts`: `import { thuCauHinh } from "./env";`, `const cauHinh = thuCauHinh();`. Nhánh `!traLoi.ok`: `console.warn(\`[auth] gui thu that bai: ma ${traLoi.status}\`); return false;` — bỏ đọc `traLoi.text()`. Nhánh `catch`: `console.warn(\`[auth] khong voi toi duoc dich vu gui thu: ${(loi as Error)?.name ?? "loi"}\`);`. Nhánh thân lạ giữ nguyên.

`thu-mat-khau.ts`: export `duongDatMatKhau(token: string, goc: string = env.appUrl)` dùng `new URL(\`dat-mat-khau/${token}\`, goc.endsWith("/") ? goc : \`${goc}/\`).toString()`; đầu `guiThuXinDatLai` thêm `if (!isMailConfigured()) return;` (import từ `./env`).

- [ ] **Step 7: Ca `lien-ket-goc` (Review Focus 4)** — thêm vào `quen-mat-khau-cau-hinh.spec.ts`:

```ts
import { duongDatMatKhau } from "../src/thu-mat-khau";

describe("lien-ket-goc", () => {
	it("goc co hoac khong co dau / cuoi, co duong con, deu khong sinh //", () => {
		expect(duongDatMatKhau("abc", "http://x.test")).toBe("http://x.test/dat-mat-khau/abc");
		expect(duongDatMatKhau("abc", "http://x.test/")).toBe("http://x.test/dat-mat-khau/abc");
		expect(duongDatMatKhau("abc", "http://x.test/crm")).toBe("http://x.test/crm/dat-mat-khau/abc");
	});
});
```

(Ca này import `thu-mat-khau` → kéo `@crm/db`; chạy qua `bun run test -- "cd packages/auth && bun test test/quen-mat-khau-cau-hinh.spec.ts"` nếu thiếu `DATABASE_URL`.)

- [ ] **Step 8: Phá-thử hai chiều, rồi commit**

```bash
git add packages/auth && git commit -m "feat(quen-mat-khau): chạy nền và cấu hình thư đọc lúc gọi"
sed -i '' 's/throw new Error("RESEND_API_KEY and MAIL_FROM must be set together.");/return undefined;/' packages/auth/src/env.ts
cd packages/auth && bun test test/quen-mat-khau-cau-hinh.spec.ts; cd ../..
git checkout packages/auth/src/env.ts
```
Expected lúc phá: hai ca đầu FAIL tại `expect(ra.ma).not.toBe(0)`; sau `checkout` chạy lại PASS. Ghi lệnh + dòng đỏ vào phần «Phá-thử» cuối tệp kế hoạch này.

Verify task: `cd packages/auth && bun test test/chay-nen.spec.ts test/quen-mat-khau-cau-hinh.spec.ts && bun run check-types`

---

### Task 2: Nối vào better-auth và đo cửa công khai

`independent: false` (dùng Task 1) · phục vụ E7, E8, E9, E10, E11, E12, E14, E15, AC-4…AC-11, Review Focus 1–3

**Files:**
- Modify: `packages/auth/src/auth.ts`
- Create: `packages/auth/test/quen-mat-khau.integration.spec.ts`
- Modify: `docs/api.md`

**Interfaces:**
- Consumes: `chayNen`, `isMailConfigured`, `guiThuXinDatLai`, `guiThuBaoDaDoi`, `donChiaCu(userId)` (`chia-mat-khau.ts`), `PASSWORD`, `THU.goc`, `SANG_MAT_KHAU.goc`.

- [ ] **Step 1: Khung test tích hợp** — `quen-mat-khau.integration.spec.ts` gồm các hàm dùng chung:

```ts
import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { auth } from "../src/auth";
import { PASSWORD } from "../src/chia-mat-khau";
import { env } from "../src/env";
import { SANG_MAT_KHAU } from "../src/sang-mat-khau";
import { THU } from "../src/thu";

const suffix = process.env.TEST_RUN_ID ?? "quen-mat-khau-spec";
const DO_TRE_THU_MS = 1500;
const NUA_DO_TRE_MS = DO_TRE_THU_MS / 2;
const CHENH_TRUNG_VI_MS = 250;
const CHO_NEN_MS = 3000;
const SO_LUOT = 5;
const MAT_KHAU_MOI = "mot-cau-rat-dai-va-sach-2026";
const KHOA_VERCEL = Symbol.for("@vercel/request-context");

type ThuDaGui = { to: string[]; subject: string; text: string };

const daGui: ThuDaGui[] = [];
let cheDoThu: "tot" | "cham" | "loi-422" | "mang-chet" | "than-la" = "tot";

function dinhDanh(nhan: string) {
	return `${suffix}-${nhan}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

let ipKe = 0;
function ipMoi() {
	ipKe += 1;
	return `10.${(ipKe >> 16) & 255}.${(ipKe >> 8) & 255}.${ipKe & 255}`;
}

const thatFetch = globalThis.fetch;

beforeEach(() => {
	process.env.RESEND_API_KEY = "re_test_gia";
	process.env.MAIL_FROM = "CRM <no-reply@example.test>";
	daGui.length = 0;
	cheDoThu = "tot";
	globalThis.fetch = (async (dau: RequestInfo | URL, them?: RequestInit) => {
		const duong = String(dau instanceof Request ? dau.url : dau);
		if (duong.startsWith(SANG_MAT_KHAU.goc)) return new Response("", { status: 200 });
		if (!duong.startsWith(THU.goc)) return thatFetch(dau as RequestInfo, them);
		if (cheDoThu === "mang-chet") throw new TypeError("fetch failed");
		if (cheDoThu === "cham") await Bun.sleep(DO_TRE_THU_MS);
		const than = JSON.parse(String(them?.body)) as ThuDaGui;
		if (cheDoThu === "loi-422")
			return new Response(JSON.stringify({ message: `invalid to ${than.to[0]}` }), { status: 422 });
		daGui.push(than);
		if (cheDoThu === "than-la") return new Response("ok", { status: 200 });
		return Response.json({ id: dinhDanh("thu") });
	}) as typeof fetch;
});

afterEach(() => {
	globalThis.fetch = thatFetch;
	delete (globalThis as unknown as Record<symbol, unknown>)[KHOA_VERCEL];
});

async function dungKho() {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		create: { id: WORKSPACE_ID, name: "CRM", slug: "crm", createdAt: new Date() },
		update: {},
	});
}

async function gieoNguoi(loai: "con-quyen" | "thu-quyen" | "chi-google") {
	await dungKho();
	const id = dinhDanh("u");
	const email = `${dinhDanh(loai)}@onehub.center`;
	await db.user.create({ data: { id, name: "Nguoi thu", email, emailVerified: true } });
	await db.invitation.create({
		data: {
			id: dinhDanh("inv"), organizationId: WORKSPACE_ID, email, role: "member",
			status: loai === "thu-quyen" ? "cancelled" : "accepted",
			expiresAt: new Date("2099-01-01"), inviterId: id,
		},
	});
	if (loai === "chi-google")
		await db.account.create({
			data: { id: dinhDanh("acc"), userId: id, providerId: "google", accountId: dinhDanh("g") },
		});
	return { id, email };
}

async function xin(email: string, ip = ipMoi()) {
	const batDau = performance.now();
	const tra = await auth.handler(new Request(`${env.apiUrl}/api/auth/request-password-reset`, {
		method: "POST",
		headers: { "content-type": "application/json", "x-forwarded-for": ip },
		body: JSON.stringify({ email }),
	}));
	return { ma: tra.status, than: await tra.text(), ms: performance.now() - batDau };
}

async function datMatKhau(token: string, ip = ipMoi()) {
	const batDau = performance.now();
	const tra = await auth.handler(new Request(`${env.apiUrl}/api/auth/reset-password`, {
		method: "POST",
		headers: { "content-type": "application/json", "x-forwarded-for": ip },
		body: JSON.stringify({ token, newPassword: MAT_KHAU_MOI }),
	}));
	return { ma: tra.status, than: await tra.text(), ms: performance.now() - batDau };
}

function chiaTuThu(thu: ThuDaGui): string {
	const khop = thu.text.match(/\/dat-mat-khau\/([A-Za-z0-9_-]+)/);
	if (!khop?.[1]) throw new Error("thu khong co lien ket dat mat khau");
	return khop[1];
}

async function choNen() {
	await Bun.sleep(CHO_NEN_MS);
}

function trungVi(so: number[]) {
	const s = [...so].sort((a, b) => a - b);
	return s[Math.floor(s.length / 2)] ?? 0;
}

async function dangNhapDuoc(email: string, matKhau: string) {
	try {
		await auth.api.signInEmail({ body: { email, password: matKhau } });
		return true;
	} catch {
		return false;
	}
}
```

Nếu tên cột `invitation`/`account` lệch schema thực (`inviterId`, `accountId`), đọc `packages/db/prisma/schema.prisma` và sửa đúng tên — không đổi ý nghĩa ca.

- [ ] **Step 2: Các `describe` đo, viết trước khi sửa `auth.ts`** — mỗi `describe` mang đúng tag `-t` của config:

```ts
describe("cung-cau-tra-loi", () => {
	test("bon loai dia chi nhan cung ma va cung than tung byte", async () => {
		const conQuyen = await gieoNguoi("con-quyen");
		const thuQuyen = await gieoNguoi("thu-quyen");
		const chiGoogle = await gieoNguoi("chi-google");
		const ra = [
			await xin(conQuyen.email),
			await xin(`${dinhDanh("la")}@onehub.center`),
			await xin(thuQuyen.email),
			await xin(chiGoogle.email),
		];
		for (const [i, r] of ra.entries()) {
			expect({ i, ma: r.ma, than: r.than }).toEqual({ i, ma: ra[0]?.ma, than: ra[0]?.than });
		}
	});

	test("chu-hoa: dia chi go hoa van cung cau va thu toi dia chi dang luu", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const la = await xin(`${dinhDanh("la")}@onehub.center`);
		const hoa = await xin(nguoi.email.toUpperCase());
		expect(hoa.than).toBe(la.than);
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([nguoi.email]);
	});

	test("sai-khuon: chuoi khong phai email cung mot ma va than du giong tai khoan hay khong", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const a = await xin(nguoi.email.replace("@", "#"));
		const b = await xin("khong-phai-email");
		expect({ ma: a.ma, than: a.than }).toEqual({ ma: b.ma, than: b.than });
	});
});

describe("khong-cho-thu", () => {
	test("tra loi khong cho thu cham, trung vi hai phia sat nhau, thu van di", async () => {
		cheDoThu = "cham";
		const co: number[] = [];
		const khong: number[] = [];
		for (let i = 0; i < SO_LUOT; i += 1) {
			const nguoi = await gieoNguoi("con-quyen");
			const r = await xin(nguoi.email);
			if (r.ms >= NUA_DO_TRE_MS) throw new Error(`tra loi cho thu gui xong: ${Math.round(r.ms)} ms`);
			co.push(r.ms);
			khong.push((await xin(`${dinhDanh("la")}@onehub.center`)).ms);
		}
		expect(Math.abs(trungVi(co) - trungVi(khong))).toBeLessThan(CHENH_TRUNG_VI_MS);
		await choNen();
		expect(daGui.length).toBe(SO_LUOT);
	});

	test("noi-nen: thu di trong waitUntil cua Vercel", async () => {
		cheDoThu = "cham";
		const daGiao: Promise<unknown>[] = [];
		(globalThis as unknown as Record<symbol, unknown>)[KHOA_VERCEL] = {
			get: () => ({ waitUntil: (p: Promise<unknown>) => daGiao.push(p) }),
		};
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		if (daGiao.length !== 1) throw new Error(`thu khong nam trong waitUntil: ${daGiao.length} lan`);
		expect(daGui.length).toBe(0);
		await daGiao[0];
		expect(daGui.length).toBe(1);
	});
});

describe("thu-dung-nguoi", () => {
	for (const loai of ["con-quyen", "chi-google"] as const) {
		test(`${loai}: dung mot thu, lien ket co chia trong kho, so phut tu hang so`, async () => {
			const nguoi = await gieoNguoi(loai);
			await xin(nguoi.email);
			await choNen();
			expect(daGui.length).toBe(1);
			expect(daGui[0]?.to).toEqual([nguoi.email]);
			expect(daGui[0]?.text).toContain(`${env.appUrl.replace(/\/$/, "")}/dat-mat-khau/`);
			const hang = await db.verification.findFirst({
				where: { identifier: `${PASSWORD.verificationPrefix}${chiaTuThu(daGui[0] as ThuDaGui)}` },
			});
			expect(hang?.value).toBe(nguoi.id);
			expect(daGui[0]?.text).toContain(`${PASSWORD.tokenTtlSeconds / 60} phút`);
		});
	}

	test("dia chi la va dia chi da thu quyen khong nhan thu nao", async () => {
		const thuQuyen = await gieoNguoi("thu-quyen");
		await xin(thuQuyen.email);
		await xin(`${dinhDanh("la")}@onehub.center`);
		await choNen();
		expect(daGui.length).toBe(0);
	});
});

describe("mot-lan", () => {
	test("dat xong bang chia 1 thi chia 1 va chia 2 deu chet, mat khau giu nguyen", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await xin(nguoi.email);
		await choNen();
		const [c1, c2] = daGui.map(chiaTuThu);
		expect((await datMatKhau(c1 as string)).ma).toBe(200);
		expect((await datMatKhau(c1 as string)).than).toContain("INVALID_TOKEN");
		const lan2 = await datMatKhau(c2 as string);
		if (!lan2.than.includes("INVALID_TOKEN")) throw new Error("chia con treo van dung duoc");
		expect(await dangNhapDuoc(nguoi.email, MAT_KHAU_MOI)).toBe(true);
		expect(await db.verification.count({
			where: { value: nguoi.id, identifier: { startsWith: PASSWORD.verificationPrefix } },
		})).toBe(0);
	});

	test("resend-chet: don chia khong doi thu", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await xin(nguoi.email);
		await choNen();
		const [c1, c2] = daGui.map(chiaTuThu);
		cheDoThu = "mang-chet";
		await datMatKhau(c1 as string);
		const lan2 = await datMatKhau(c2 as string);
		if (!lan2.than.includes("INVALID_TOKEN")) throw new Error("don chia phu thuoc thu");
		expect(await db.verification.count({
			where: { value: nguoi.id, identifier: { startsWith: PASSWORD.verificationPrefix } },
		})).toBe(0);
	});
});

describe("het-han", () => {
	test("moc het han = luc xin + TTL; qua han thi tu choi, con han thi dat duoc", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		const t0 = Date.now();
		await xin(nguoi.email);
		await xin(nguoi.email);
		const t1 = Date.now();
		await choNen();
		const [c1, c2] = daGui.map(chiaTuThu);
		const hang = await db.verification.findFirst({ where: { identifier: `${PASSWORD.verificationPrefix}${c1}` } });
		const ttl = PASSWORD.tokenTtlSeconds * 1000;
		expect(hang?.expiresAt.getTime()).toBeGreaterThanOrEqual(t0 + ttl - 1000);
		expect(hang?.expiresAt.getTime()).toBeLessThanOrEqual(t1 + ttl + 1000);
		await db.verification.update({ where: { id: hang?.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
		expect((await datMatKhau(c1 as string)).than).toContain("INVALID_TOKEN");
		expect((await datMatKhau(c2 as string)).ma).toBe(200);
	});
});

describe("qua-luot", () => {
	test("bo dem bat va dung chung qua co so du lieu", () => {
		const gioiHan = auth.options.rateLimit;
		if (gioiHan?.storage !== "database") throw new Error("bo dem khong chung giua cac instance");
		expect(gioiHan.enabled).toBe(true);
	});

	test("lan thu tu tu cung mot noi bi 429 va khong co thu", async () => {
		const ip = ipMoi();
		const a = await gieoNguoi("con-quyen");
		const b = await gieoNguoi("con-quyen");
		const ma = [
			(await xin(a.email, ip)).ma,
			(await xin(`${dinhDanh("la")}@onehub.center`, ip)).ma,
			(await xin(`${dinhDanh("la")}@onehub.center`, ip)).ma,
			(await xin(b.email, ip)).ma,
		];
		if (ma[3] !== 429) throw new Error(`lan thu tu phai 429, duoc ${ma[3]}`);
		expect(ma.slice(0, 3)).toEqual([200, 200, 200]);
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([a.email]);
		expect((await xin(b.email)).ma).toBe(200);
	});
});

describe("bao-da-doi", () => {
	test("dat mat khau khong cho thu bao, thu bao van di dung mot la", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0] as ThuDaGui);
		daGui.length = 0;
		cheDoThu = "cham";
		const r = await datMatKhau(chia);
		if (r.ms >= NUA_DO_TRE_MS) throw new Error(`dat mat khau cho thu bao: ${Math.round(r.ms)} ms`);
		await choNen();
		expect(daGui.map((t) => t.to[0])).toEqual([nguoi.email]);
		expect(daGui[0]?.subject).toBe("Mật khẩu CRM OneHub vừa được đổi");
	});

	test("duoi-nguong: dat bi tu choi thi khong co thu bao", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0] as ThuDaGui);
		await datMatKhau(chia);
		await choNen();
		const truoc = daGui.length;
		expect((await datMatKhau("chia-khong-ton-tai")).than).toContain("INVALID_TOKEN");
		expect((await datMatKhau(chia)).than).toContain("INVALID_TOKEN");
		await choNen();
		expect(daGui.length).toBe(truoc);
	});

	test("resend chet thi van dat duoc mat khau", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		cheDoThu = "mang-chet";
		expect((await datMatKhau(chiaTuThu(daGui[0] as ThuDaGui))).ma).toBe(200);
		expect(await dangNhapDuoc(nguoi.email, MAT_KHAU_MOI)).toBe(true);
	});

	test("noi-nen: thu bao nam trong waitUntil", async () => {
		const nguoi = await gieoNguoi("con-quyen");
		await xin(nguoi.email);
		await choNen();
		const chia = chiaTuThu(daGui[0] as ThuDaGui);
		daGui.length = 0;
		cheDoThu = "cham";
		const daGiao: Promise<unknown>[] = [];
		(globalThis as unknown as Record<symbol, unknown>)[KHOA_VERCEL] = {
			get: () => ({ waitUntil: (p: Promise<unknown>) => daGiao.push(p) }),
		};
		await datMatKhau(chia);
		if (daGiao.length !== 1) throw new Error(`thu khong nam trong waitUntil: ${daGiao.length} lan`);
		await daGiao[0];
		expect(daGui.length).toBe(1);
	});
});

describe("thu-hong", () => {
	for (const che of ["loi-422", "mang-chet", "than-la"] as const) {
		test(`${che}: cau tra loi y nhu dia chi la, log khong mang dia chi hay than`, async () => {
			const dong: string[] = [];
			const warn = spyOn(console, "warn").mockImplementation((...a: unknown[]) => { dong.push(a.map(String).join(" ")); });
			const error = spyOn(console, "error").mockImplementation((...a: unknown[]) => { dong.push(a.map(String).join(" ")); });
			try {
				cheDoThu = che;
				const nguoi = await gieoNguoi("con-quyen");
				const la = await xin(`${dinhDanh("la")}@onehub.center`);
				const co = await xin(nguoi.email);
				expect({ ma: co.ma, than: co.than }).toEqual({ ma: la.ma, than: la.than });
				await choNen();
				expect(dong.some((d) => d.includes("[auth]"))).toBe(true);
				if (che === "loi-422") expect(dong.some((d) => d.includes("422"))).toBe(true);
				const lo = dong.filter((d) => d.includes(nguoi.email) || d.includes("invalid to"));
				if (lo.length > 0) throw new Error(`log mang dia chi: ${lo.length} dong`);
			} finally {
				warn.mockRestore();
				error.mockRestore();
			}
		});
	}
});
```

Run: `bun run test -- "cd packages/auth && bun test test/quen-mat-khau.integration.spec.ts"`
Expected: FAIL ở `khong-cho-thu` («tra loi cho thu gui xong»), `noi-nen` («thu khong nam trong waitUntil»), `mot-lan` («chia con treo van dung duoc»), `bao-da-doi` («dat mat khau cho thu bao»). Các `describe` khác có thể đã xanh — ghi lại tập đỏ trước khi sửa.

- [ ] **Step 3: Sửa `auth.ts`**

```ts
import { chayNen } from "./chay-nen";
import { donChiaCu, PASSWORD } from "./chia-mat-khau";
```

Trong `emailAndPassword`:

```ts
		sendResetPassword: async ({ user, token }) => {
			await guiThuXinDatLai({ email: user.email, token });
		},
		onPasswordReset: async ({ user }) => {
			await donChiaCu(user.id);
			chayNen(guiThuBaoDaDoi(user.email));
		},
```

Trong `advanced`, ngay sau `cookiePrefix: AUTH_COOKIE_PREFIX,`:

```ts
		backgroundTasks: { handler: chayNen },
```

Run lại Step 2 → PASS toàn tệp. Rồi `cd packages/auth && bun run check-types && bunx biome check src test`.

- [ ] **Step 4: `docs/api.md`** — trong mục «Intelligence never lives in the API», đổi câu «One documented exception, for timing: the exchange-rate fetcher, below.» thành:

```md
Two documented exceptions, both for timing: the exchange-rate fetcher, below,
and the transactional auth mail — `packages/auth` posts the password-reset link
and the password-changed notice to Resend itself (`thu.ts`), in the background
through `advanced.backgroundTasks`. The reset token must not sit in plain text
in an `AgentTask` row, and a stopped agent must not leave someone waiting for a
link. It decides nothing about a person; it only delivers what Better Auth made.
```

- [ ] **Step 5: Commit, rồi phá-thử bốn chiều đỏ** — mỗi lượt sửa một chỗ trên cây đã commit, chạy đúng `-t` của ca, ghi dòng đỏ, `git checkout packages/auth/src`:

| Phá | Lệnh `-t` | Dòng đỏ mong đợi |
|---|---|---|
| xoá dòng `backgroundTasks` | `khong-cho-thu` | `tra loi cho thu gui xong` và `thu khong nam trong waitUntil` |
| `handler: (p) => { void p; }` | `noi-nen` | `thu khong nam trong waitUntil: 0 lan` |
| xoá `await donChiaCu(user.id);` | `mot-lan` | `chia con treo van dung duoc` |
| `await guiThuBaoDaDoi(user.email);` thay `chayNen(...)` | `bao-da-doi` | `dat mat khau cho thu bao` |
| `chayNen((async () => { await guiThuBaoDaDoi(user.email); await donChiaCu(user.id); })())` | `resend-chet` | `don chia phu thuoc thu` |
| `storage: "memory"` | `qua-luot` | `bo dem khong chung giua cac instance` |
| xoá `customRules` | `qua-luot` | `lan thu tu phai 429` |
| trả lại `(await traLoi.text()).slice(0, 200)` vào log | `thu-hong` | `log mang dia chi` |

```bash
git add packages/auth docs/api.md && git commit -m "fix(quen-mat-khau): gửi thư ở nền, dọn chìa còn treo, log không mang địa chỉ"
```

Verify task: `bun run test -- "cd packages/auth && bun test test/quen-mat-khau.integration.spec.ts test/chia-mat-khau.integration.spec.ts"` — tệp cũ của vòng trước phải vẫn xanh (nó dùng chung `onPasswordReset`).

---

### Task 3: Cờ ở API

`independent: false` (dùng `isMailConfigured` đọc lúc gọi của Task 1) · phục vụ E1, E3, AC-1, AC-2

**Files:**
- Modify: `apps/api/test/auth.e2e.spec.ts:47-51`
- Create: `apps/api/test/quen-mat-khau-co.spec.ts`

- [ ] **Step 1: Vá kỳ vọng e2e cũ**

```ts
		expect(response.body.result.data).toEqual({
			google: true,
			microsoft: false,
			quenMatKhau: false,
			providers: [],
		});
```

(Tệp chạy với môi trường không có `RESEND_API_KEY`; nếu máy có khai trong `.env`, ca này phải xoá hai biến ở `beforeAll` trước khi `import` AppModule.)

- [ ] **Step 2: `quen-mat-khau-co.spec.ts`**

```ts
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

let app: INestApplication;

beforeAll(async () => {
	const { AppModule } = await import("../src/app.module");
	const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
	app = mod.createNestApplication({ bodyParser: false });
	await app.init();
});

afterAll(async () => {
	delete process.env.RESEND_API_KEY;
	delete process.env.MAIL_FROM;
	await app.close();
});

async function co() {
	const r = await request(app.getHttpServer()).get("/api/trpc/sso.signInOptions").expect(200);
	return r.body.result.data as { quenMatKhau: boolean };
}

describe("co-tat", () => {
	it("chua khai hai bien thi quenMatKhau false, khai roi thi true tren cung app", async () => {
		delete process.env.RESEND_API_KEY;
		delete process.env.MAIL_FROM;
		expect((await co()).quenMatKhau).toBe(false);
		process.env.RESEND_API_KEY = "re_test_gia";
		process.env.MAIL_FROM = "CRM <no-reply@example.test>";
		const bat = await co();
		if (bat.quenMatKhau !== true) throw new Error("co quenMatKhau khong theo cau hinh thu luc goi");
	});
});

describe("co-bat", () => {
	it("khai du hai bien thi tra dung bon truong voi quenMatKhau true", async () => {
		process.env.RESEND_API_KEY = "re_test_gia";
		process.env.MAIL_FROM = "CRM <no-reply@example.test>";
		const du = await co();
		expect(Object.keys(du).sort()).toEqual(["google", "microsoft", "providers", "quenMatKhau"]);
		expect(du.quenMatKhau).toBe(true);
	});
});
```

Run: `bun run test -- "cd apps/api && bun test test/quen-mat-khau-co.spec.ts test/auth.e2e.spec.ts"`
Expected: PASS. Nếu `signInOptions` được cache (`cache-manager`) thì ca `co-tat` đỏ ở vế thứ hai — khi đó cờ đọc lúc gọi chưa tới được màn, phải bỏ cache cho trường này chứ không sửa test.

- [ ] **Step 3: Phá-thử** — `isMailConfigured()` trả `true` cố định → `co-tat` đỏ ở `toBe(false)`; bỏ `quenMatKhau` khỏi `ssoSignInOptionsOutput` → `co-bat` đỏ ở danh sách khoá. Khôi phục, commit:

```bash
git add apps/api/test && git commit -m "test(quen-mat-khau): cờ quenMatKhau theo cấu hình thư lúc gọi"
```

Verify task: lệnh Step 2.

---

### Task 4: Màn — đường ẩn danh, form bốn trạng thái, liên kết

`independent: true` (chỉ chạm `apps/app`, không đọc mã của Task 1–3) · phục vụ E2, E4, E5, E13, E17, E19, AC-1, AC-2, AC-9, AC-12, Review Focus 5

**Files:**
- Modify: `apps/app/lib/proxy-paths.ts`, `apps/app/test/proxy-an-danh.spec.ts`
- Create: `apps/app/lib/quen-mat-khau.ts`, `apps/app/test/quen-mat-khau-man.dom.tsx`
- Modify: `apps/app/app/(landing)/quen-mat-khau/page.tsx`, `quen-mat-khau-form.tsx`, `apps/app/app/(landing)/sign-in/password-sign-in.tsx`, `apps/app/lib/messages/auth.ts`, `apps/app/test/messages-guard.spec.ts`

**Interfaces:**
- Produces: `duongQuenMatKhau(tuyChon: { quenMatKhau: boolean } | null): "hien" | "/sign-in"` · `QuenMatKhauForm` props thêm `loi: string`, `quaLuot: string`, `xin?: XinLienKet` với `type XinLienKet = (dau: { email: string }) => Promise<{ error: { status?: number } | null }>`.

- [ ] **Step 1: Đường ẩn danh (E4)** — `proxy-an-danh.spec.ts`: đổi ca đầu thành `test("danh sách dài đúng bốn mục", …)` kỳ vọng `["/dat-mat-khau", "/proto", "/quen-mat-khau", "/t"]`, thêm:

```ts
	test("nhánh quen-mat-khau đi qua — người chưa đăng nhập xin được liên kết", () => {
		expect(isAnonymous("/quen-mat-khau")).toBe(true);
		expect(isAnonymous("/quen-mat-khau-cu")).toBe(false);
		expect(isAnonymous("/quen-mat-khauX")).toBe(false);
	});
```

Run `cd apps/app && bun test ./test/proxy-an-danh.spec.ts` → FAIL. Sửa `proxy-paths.ts`: `export const ANONYMOUS: readonly string[] = ["/t", "/proto", "/dat-mat-khau", "/quen-mat-khau"];` → PASS.

- [ ] **Step 2: Hàm quyết định** — `apps/app/lib/quen-mat-khau.ts`:

```ts
export type TuyChonQuen = { quenMatKhau: boolean } | null;

export function duongQuenMatKhau(tuyChon: TuyChonQuen): "hien" | "/sign-in" {
	return tuyChon?.quenMatKhau ? "hien" : "/sign-in";
}
```

`page.tsx`: `guiThuDuoc` đổi thành `docTuyChon(): Promise<TuyChonQuen>` trả `options` hoặc `null` khi lỗi; trong `QuenMatKhau`: `if (duongQuenMatKhau(tuyChon) !== "hien") redirect("/sign-in");`. Trang tính `const phut = Math.round(PASSWORD.tokenTtlSeconds / SECONDS_PER_MINUTE);` (import `PASSWORD` từ `@crm/auth`, `SECONDS_PER_MINUTE = 60` như trang `/dat-mat-khau`) và truyền `xong.description = m.xong.description(phut)`, `loi = m.loi`, `quaLuot = m.quaLuot`.

- [ ] **Step 3: Chữ** — `lib/messages/auth.ts`, cả `vi` và `en`, trong `quenMatKhau`:

```ts
		loi: "Chưa gửi được liên kết. Kiểm tra kết nối rồi bấm gửi lại.",
		quaLuot: "Bạn đã xin quá nhiều lần. Chờ 15 phút rồi thử lại.",
		xong: {
			title: "Kiểm tra hộp thư",
			description: (phut: number) =>
				`Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn ${phut} phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.`,
			quayLai: "Quay lại đăng nhập",
		},
```

`en`: `loi: "The link could not be sent. Check your connection and send again."`, `quaLuot: "You have asked too many times. Wait 15 minutes and try again."`, `description: (phut: number) => \`If that address can sign in to this CRM, a link is on its way. It can be used once and expires in ${phut} minutes. Nothing changes until you open it.\``.

«15 phút» trong câu phải bằng `XIN_DAT_LAI.cuaSoGiay / 60` — thêm một assert vào `quen-mat-khau-man.dom.tsx` ca `form qua-luot` so với hằng này nếu import được qua `@crm/auth`; không import được thì ghi rủi ro này vào Notes của hợp đồng ở Gate 2.

`messages-guard.spec.ts`: thêm vào `GHIM`:

```ts
			"auth:quenMatKhau.xong.description": [
				"Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn 1 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.",
				"Nếu địa chỉ này vào được CRM, liên kết đang trên đường tới. Liên kết dùng được một lần và còn hạn 12 phút. Chưa mở thì mật khẩu hiện tại vẫn nguyên.",
			],
```

Run `cd apps/app && bun test ./test/messages-guard.spec.ts` → PASS.

- [ ] **Step 4: Test DOM đỏ `quen-mat-khau-man.dom.tsx`**

```tsx
import { describe, expect, it } from "bun:test";
import { act, createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { duongQuenMatKhau } from "@/lib/quen-mat-khau";

const { QuenMatKhauForm } = await import("@/app/(landing)/quen-mat-khau/quen-mat-khau-form");
const { PasswordSignIn } = await import("@/app/(landing)/sign-in/password-sign-in");
const { authMessages } = await import("@/lib/messages/auth");

const m = authMessages("vi");
const PHUT_THU = 45;

type Xin = (d: { email: string }) => Promise<{ error: { status?: number } | null }>;

function dung<P extends object>(thanh: (p: P) => unknown, props: P) {
	const o = document.createElement("div");
	document.body.appendChild(o);
	const root = createRoot(o);
	act(() => { root.render(h(thanh as never, props)); });
	return o;
}

function propsForm(xin: Xin) {
	const q = m.quenMatKhau;
	return {
		title: q.title, description: q.description, diaChi: q.diaChi, gui: q.gui,
		dangGui: q.dangGui, quayLai: q.quayLai, loi: q.loi, quaLuot: q.quaLuot,
		xong: { title: q.xong.title, description: q.xong.description(PHUT_THU), quayLai: q.xong.quayLai },
		xin,
	};
}

function go(o: HTMLElement, chu: string) {
	const o2 = o.querySelector<HTMLInputElement>("input[type=email]");
	if (!o2) throw new Error("khong thay o email");
	const dat = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
	act(() => { dat?.call(o2, chu); o2.dispatchEvent(new Event("input", { bubbles: true })); });
}

async function gui(o: HTMLElement) {
	const f = o.querySelector("form");
	await act(async () => { f?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });
}

describe("co-tat", () => {
	it("khong co nhan thi khong co lien ket quen mat khau", () => {
		const props = { diaChi: "a", matKhau: "b", dangNhap: "c", dangGui: "d", saiChung: "e" };
		const tat = dung(PasswordSignIn, { ...props, quenMatKhau: null });
		expect(tat.querySelectorAll('a[href="/quen-mat-khau"]').length).toBe(0);
		expect(tat.textContent).not.toContain(m.signIn.quenMatKhau);
		const bat = dung(PasswordSignIn, { ...props, quenMatKhau: m.signIn.quenMatKhau });
		expect(bat.querySelectorAll('a[href="/quen-mat-khau"]').length).toBe(1);
	});

	it("ham quyet dinh cua trang: tat, bat, doc loi", () => {
		const ra = [duongQuenMatKhau({ quenMatKhau: false }), duongQuenMatKhau({ quenMatKhau: true }), duongQuenMatKhau(null)];
		if (ra[0] !== "/sign-in" || ra[2] !== "/sign-in") throw new Error("co tat thi trang phai ve /sign-in");
		expect(ra).toEqual(["/sign-in", "hien", "/sign-in"]);
	});
});

describe("lien-ket", () => {
	it("lien ket nam sau o mat khau, dung href, tab toi duoc", () => {
		const o = dung(PasswordSignIn, { diaChi: "a", matKhau: "b", dangNhap: "c", dangGui: "d", saiChung: "e", quenMatKhau: m.signIn.quenMatKhau });
		const matKhau = o.querySelector("input[type=password]");
		const lk = o.querySelector<HTMLAnchorElement>('a[href="/quen-mat-khau"]');
		if (!matKhau || !lk) throw new Error("thieu o mat khau hoac lien ket");
		expect(matKhau.compareDocumentPosition(lk) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		expect(lk.textContent).toBe(m.signIn.quenMatKhau);
		expect(lk.tabIndex).toBe(0);
	});
});

describe("form", () => {
	it("dang-gui: nut tat va ghi Đang gửi…", async () => {
		const o = dung(QuenMatKhauForm, propsForm(() => new Promise(() => {})));
		go(o, "ada@onehub.center");
		await gui(o);
		const nut = o.querySelector<HTMLButtonElement>("button[type=submit]");
		expect(nut?.disabled).toBe(true);
		expect(nut?.textContent).toContain(m.quenMatKhau.dangGui);
	});

	it("bam-hai-lan: chi mot loi goi", async () => {
		let dem = 0;
		const o = dung(QuenMatKhauForm, propsForm(() => { dem += 1; return new Promise(() => {}); }));
		go(o, "ada@onehub.center");
		await gui(o);
		await gui(o);
		expect(dem).toBe(1);
	});

	it("da-gui: man Kiem tra hop thu mang so phut that, trong vung aria-live", async () => {
		const o = dung(QuenMatKhauForm, propsForm(async () => ({ error: null })));
		go(o, "ada@onehub.center");
		await gui(o);
		expect(o.textContent).toContain(m.quenMatKhau.xong.title);
		expect(o.textContent).toContain(`${PHUT_THU} phút`);
		expect(o.textContent).not.toContain("một giờ");
		expect(o.querySelector('[aria-live="polite"]')?.textContent).toContain(m.quenMatKhau.xong.title);
	});

	for (const [ten, xin] of [
		["loi", (async () => { throw new TypeError("fetch failed"); }) as Xin],
		["loi-may-chu", (async () => ({ error: { status: 500 } })) as Xin],
	] as const) {
		it(`${ten}: hien cau loi, van o form, chu da go con`, async () => {
			const o = dung(QuenMatKhauForm, propsForm(xin));
			go(o, "ada@onehub.center");
			await gui(o);
			if (o.textContent?.includes(m.quenMatKhau.xong.title)) throw new Error("loi van hien man da gui");
			expect(o.textContent).toContain(m.quenMatKhau.loi);
			expect(o.querySelector<HTMLInputElement>("input[type=email]")?.value).toBe("ada@onehub.center");
		});
	}

	it("qua-luot: 429 hien cau qua luot, khong hien man da gui", async () => {
		const o = dung(QuenMatKhauForm, propsForm(async () => ({ error: { status: 429 } })));
		go(o, "ada@onehub.center");
		await gui(o);
		expect(o.textContent).toContain(m.quenMatKhau.quaLuot);
		expect(o.textContent).not.toContain(m.quenMatKhau.xong.title);
	});
});
```

Run: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/quen-mat-khau-man.dom.tsx`
Expected: FAIL — `co-tat` (hàm chưa tồn tại nếu Step 2 chưa làm thì đã có), `form loi` («loi van hien man da gui»), `qua-luot`, `da-gui` (chưa có `aria-live`).

- [ ] **Step 5: Sửa `quen-mat-khau-form.tsx`**

Thay phần trạng thái và `submit` bằng:

```tsx
import { Alert, AlertDescription } from "@crm/ui/components/alert";

const HTTP_QUA_LUOT = 429;

type TrangThai = "nhap" | "dang-gui" | "da-gui" | "loi" | "qua-luot";
export type XinLienKet = (dau: { email: string }) => Promise<{ error: { status?: number } | null }>;

const xinThat: XinLienKet = (dau) => requestPasswordReset(dau);
```

Props thêm `loi: string; quaLuot: string; xin?: XinLienKet` (mặc định `xinThat`). Thân:

```tsx
	const [email, setEmail] = useState("");
	const [trangThai, setTrangThai] = useState<TrangThai>("nhap");

	async function submit() {
		const ket = await xin({ email });
		if (!ket.error) {
			setTrangThai("da-gui");
			return;
		}
		setTrangThai(ket.error.status === HTTP_QUA_LUOT ? "qua-luot" : "loi");
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (trangThai === "dang-gui") return;
		setTrangThai("dang-gui");
		submit().catch(() => setTrangThai("loi"));
	}
```

Bọc toàn bộ đầu ra trong `<div aria-live="polite" className="contents">`. Nhánh `da-gui` giữ như PR. Nhánh form: `Input` thêm `name="email"`, `inputMode="email"`, `spellCheck={false}`; trên nút gửi thêm

```tsx
				{trangThai === "loi" || trangThai === "qua-luot" ? (
					<Alert variant="destructive">
						<AlertDescription>{trangThai === "loi" ? loi : quaLuot}</AlertDescription>
					</Alert>
				) : null}
```

Nút: `disabled={trangThai === "dang-gui"}`, chữ theo `trangThai === "dang-gui"`.

- [ ] **Step 6: Liên kết ở `password-sign-in.tsx`** — bỏ `import Link from "next/link"` tự đặt `className`; dùng:

```tsx
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@crm/ui/components/field";
import { Link } from "@crm/ui/components/link";
import NextLink from "next/link";
```

và ngay trong `Field` của ô mật khẩu, sau `Input`:

```tsx
					{quenMatKhau ? (
						<FieldDescription>
							<Link asChild variant="quiet">
								<NextLink href="/quen-mat-khau">{quenMatKhau}</NextLink>
							</Link>
						</FieldDescription>
					) : null}
```

Xoá khối `Link` cũ nằm giữa `FieldGroup` và nút. Đây là chỗ lệch câu «Button asChild variant="link"» của design doc: nút `link` mang `px-2.5` nên chữ lệch lề ô nhập; `Link` của `@crm/ui` là thành phần dành cho liên kết chữ — ghi entry `approach` stage `S2` vào sổ.

Run Step 4 → PASS toàn tệp.

- [ ] **Step 7: Sàn thiết kế (E19)** — chạy nguyên văn `config:executors.test.qmk_san_thiet_ke`. Mã 0. Phá-thử: thêm lại `className="text-muted-foreground text-sm"` lên `Link` trong bản đã commit → ghi design-gate có báo hay không; không báo thì ghi đúng câu «thước này không bắt lớp className trên Link» vào phần Phá-thử, không tuyên bố nó bắt.

- [ ] **Step 8: Phá-thử DOM và commit**

| Phá | Ca | Dòng đỏ |
|---|---|---|
| `submit` luôn `setTrangThai("da-gui")` | `form loi` | `loi van hien man da gui` |
| `duongQuenMatKhau` trả `"hien"` vô điều kiện | `co-tat ham quyet dinh` | `co tat thi trang phai ve /sign-in` |
| xoá `"/quen-mat-khau"` khỏi `ANONYMOUS` | `proxy-an-danh` | ca «nhánh quen-mat-khau đi qua» |

```bash
git add apps/app && git commit -m "feat(quen-mat-khau): trang xin liên kết mở cho người chưa đăng nhập, form báo lỗi và quá lượt"
```

Verify task: `cd apps/app && bun test ./test/proxy-an-danh.spec.ts ./test/messages-guard.spec.ts && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/quen-mat-khau-man.dom.tsx && bun run check-types`

---

### Task 5: Bàn chụp màn cho E18/E21

`independent: false` (cần Task 4) · phục vụ E18, E21

**Files:**
- Create: `_acceptance/quen-mat-khau/rang/chup.mjs`

- [ ] **Step 1: Viết `chup.mjs`** — khuôn theo `_acceptance/logo-onehub/rang/chup.mjs` (puppeteer-core + Chrome hệ thống, `canhCay` từ `_acceptance/man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`), đầu ra `DUNG`/`SAI`/`KHONG DO DUOC` + `KET LUAN` với mã 0/1/2:

```js
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = resolve(GOC, process.env.BANG_CHUNG ?? join(".acceptance-runs", "quen-mat-khau", "evidence"));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const CA = process.argv.includes("--ca") ? process.argv[process.argv.indexOf("--ca") + 1] : "bat";
const CAO = 900;
const HEP = 390;
const RONG = 1440;
const SO_LAN_QUA_LUOT = 4;
const DUONG_QUEN = "/quen-mat-khau";

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else { sai += 1; dong.push(`SAI ${nhan}`); }
}

async function trang(rong, duong) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie({ name: "lang", value: "vi", domain: new URL(APP).hostname, path: "/" });
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: CAO, deviceScaleFactor: 2 });
	await p.goto(`${APP}${duong}`, { waitUntil: "networkidle0" });
	return p;
}

async function khongTranNgang(p) {
	return p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
}

async function guiForm(p, email) {
	await p.$eval("input[type=email]", (o) => { o.value = ""; });
	await p.type("input[type=email]", email);
	await p.click("button[type=submit]");
	await p.waitForNetworkIdle();
}

async function caBat() {
	for (const rong of [RONG, HEP]) {
		const p = await trang(rong, "/sign-in");
		const lk = await p.$$(`a[href="${DUONG_QUEN}"]`);
		kiem(`/sign-in ${rong}: dung mot lien ket toi ${DUONG_QUEN}`, lk.length === 1);
		kiem(`/sign-in ${rong}: khong tran ngang`, await khongTranNgang(p));
		await p.screenshot({ path: join(RA, `E18-dang-nhap-${rong}.png`) });
		if (rong === RONG) {
			await Promise.all([p.waitForNavigation({ waitUntil: "networkidle0" }), lk[0]?.click()]);
			kiem("bam lien ket thi URL la /quen-mat-khau", new URL(p.url()).pathname === DUONG_QUEN);
		}
	}
	for (const rong of [RONG, HEP]) {
		const p = await trang(rong, DUONG_QUEN);
		kiem(`${DUONG_QUEN} ${rong}: khong bi day ve /sign-in`, new URL(p.url()).pathname === DUONG_QUEN);
		kiem(`${DUONG_QUEN} ${rong}: khong tran ngang`, await khongTranNgang(p));
		await p.screenshot({ path: join(RA, `E18-quen-trong-${rong}.png`) });
	}
	const p = await trang(RONG, DUONG_QUEN);
	await guiForm(p, `chup-${Date.now()}@example.test`);
	kiem("gui xong hien Kiem tra hop thu", (await p.content()).includes("Kiểm tra hộp thư"));
	await p.screenshot({ path: join(RA, "E18-da-gui-1440.png") });
	const p2 = await trang(RONG, DUONG_QUEN);
	await p2.setRequestInterception(true);
	p2.on("request", (r) => (r.url().includes("request-password-reset") ? r.abort() : r.continue()));
	await guiForm(p2, "ada@example.test");
	kiem("chan mang thi hien Alert loi", (await p2.$('[data-slot="alert"]')) !== null);
	kiem("chan mang thi o email con chu", (await p2.$eval("input[type=email]", (o) => o.value)) === "ada@example.test");
	await p2.screenshot({ path: join(RA, "E18-loi-1440.png") });
	const p3 = await trang(RONG, DUONG_QUEN);
	for (let i = 1; i < SO_LAN_QUA_LUOT; i += 1) {
		await guiForm(p3, `chup-${i}-${Date.now()}@example.test`);
		await p3.goto(`${APP}${DUONG_QUEN}`, { waitUntil: "networkidle0" });
	}
	await guiForm(p3, `chup-cuoi-${Date.now()}@example.test`);
	const noi = await p3.content();
	kiem("lan thu tu hien cau qua luot", noi.includes("Bạn đã xin quá nhiều lần"));
	kiem("lan thu tu khong hien Kiem tra hop thu", !noi.includes("Kiểm tra hộp thư"));
	await p3.screenshot({ path: join(RA, "E18-qua-luot-1440.png") });
}

async function caTat() {
	const p = await trang(RONG, "/sign-in");
	kiem("cau hinh thu tat: /sign-in khong co lien ket quen mat khau", (await p.$$(`a[href="${DUONG_QUEN}"]`)).length === 0);
	await p.screenshot({ path: join(RA, "E21-dang-nhap-tat-1440.png") });
	const p2 = await trang(RONG, DUONG_QUEN);
	kiem("cau hinh thu tat: mo thang /quen-mat-khau thi ve /sign-in", new URL(p2.url()).pathname === "/sign-in");
}

const cay = await canhCay();
if (cay.ket !== "dung-cay") {
	for (const d of cay.dong) dong.push(`KHONG DO DUOC: ${d}`);
	await ket(2);
}
mkdirSync(RA, { recursive: true });
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
	if (CA === "tat") await caTat();
	else await caBat();
} catch (loi) {
	dong.push(`KHONG DO DUOC: ${String(loi?.message ?? loi)}`);
	await ket(2);
}
await ket(sai > 0 ? 1 : 0);
```

Chữ «Bạn đã xin quá nhiều lần» và «Kiểm tra hộp thư» phải khớp `lib/messages/auth.ts`; nếu chữ đổi ở Task 4 thì sửa ở đây cùng lượt.

- [ ] **Step 2: Xoá bộ đếm trước lượt quá-lượt** — trước `caBat`, xoá hàng `RateLimit` có `key` chứa `request-password-reset` trong DB dev bằng `bun -e` với `@crm/db` (chỉ khi `DATABASE_URL` không phải production: kiểm bằng `packages/db/scripts/require-local-db.ts`). Viết thành hàm `donBoDem()` trong `chup.mjs`, gọi đầu `caBat`.

- [ ] **Step 3: Chạy thử hai chiều — CẦN LƯỢT CỔNG.** Báo phiên điều phối xin 3300/3301 độc quyền; khi được cấp: dựng api 3301 có `RESEND_API_KEY=re_test_gia MAIL_FROM='CRM <no-reply@example.test>'`, app 3300 (cấu hình `api-cay-nay`/`app-cay-nay`); chạy `config:executors.test.qmk_chup` → mã 0. Phá-thử trên cây đã commit: xoá `"/quen-mat-khau"` khỏi `ANONYMOUS` → dòng `SAI /quen-mat-khau 1440: khong bi day ve /sign-in` và mã 1. Khôi phục. Khởi động lại api không có hai biến, chạy `qmk_chup_tat` → mã 0; phá: `sign-in/page.tsx` truyền nhãn vô điều kiện → `SAI cau hinh thu tat: /sign-in khong co lien ket`. Trả cổng, báo điều phối. Chưa được cấp cổng thì đánh dấu step này «chờ lượt» và làm Task 6 trước — S4 cũng chạy đúng hai lệnh này.

```bash
git add _acceptance/quen-mat-khau/rang && git commit -m "test(quen-mat-khau): bàn chụp màn bật và tắt cờ"
```

---

### Task 6: Năm lệnh chứng và đóng S3

`independent: false`

- [ ] **Step 1:** Xin lượt phiên điều phối cho `bun run test` toàn kho (làn nặng). Khi được: chạy với PATH Bun 1.3.12:

```bash
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

Expected: cả năm mã 0. Đỏ ở tệp không thuộc vòng này → so với đường nền (`_acceptance/quen-mat-khau/duong-nen.md`: chỉ `auth.e2e` đỏ sẵn) trước khi kết luận.

- [ ] **Step 2:** Đặt `status: implemented` trong `contract.md`, commit:

```bash
git add _acceptance/quen-mat-khau/contract.md docs/superpowers/plans/2026-09-26-quen-mat-khau.md
git commit -m "chore(quen-mat-khau): xong S3, sẵn chấm"
```

- [ ] **Step 3:** Báo phiên điều phối «sẵn S4», chờ cấp 3300/3301 + giờ bắt đầu, ghi trong `s4-args` rằng E18/E21 giữ hai cổng độc quyền suốt lượt.

---

## Phá-thử (điền trong lúc thi công)

| Task | Phá gì | Lệnh | Dòng đỏ thật |
|---|---|---|---|
| 1 | env.ts không ném khi thiếu một nửa | `bun test test/quen-mat-khau-cau-hinh.spec.ts -t cau-hinh-nua` | 2 fail: hai ca nửa cấu hình, ca đủ vẫn xanh |
| 2 | bỏ `backgroundTasks` | `-t khong-cho-thu` | `tra loi cho thu gui xong: 1529 ms` · `thu khong nam trong waitUntil: 0 lan` |
| 2 | handler thả promise | `-t noi-nen` | `thu khong nam trong waitUntil: 0 lan` (cả hai luồng) |
| 2 | bỏ `donChiaCu` | `-t mot-lan` | `chia con treo van dung duoc` · `don chia phu thuoc thu` |
| 2 | `await` thư báo | `-t bao-da-doi` | `dat mat khau cho thu bao: 1557 ms` |
| 2 | dọn chìa sau thư trong nền | `-t resend-chet` | lần đầu XANH (thước hỏng) → sửa thêm ca Resend treo → `don chia phu thuoc thu` |
| 2 | `storage: "memory"` | `-t qua-luot` | `bo dem khong chung giua cac instance` |
| 2 | bỏ `customRules` | `-t 'lan thu tu tu cung'` | lần đầu XANH (luật mặc định 60 giây che) → lùi mốc 2 phút → `lan thu tu phai 429, duoc 200` |
| 2 | log mang thân lỗi Resend | `-t thu-hong` | `log mang dia chi: 1 dong` |
| 2 | (vật thật, không phá) bộ dọn của better-auth | ca `sau-don` ở scratchpad | `bo don hang dem xoa cua so 15 phut: lan thu tu 200` — lỗi thật, chờ chủ kho |
| 3 | `isMailConfigured` trả `true` cố định | `-t co-tat` | `expect(received).toBe(expected)` ở vế tắt |
| 3 | bỏ `quenMatKhau` khỏi `ssoSignInOptionsOutput` | `-t co-bat` | danh sách khoá thiếu `"quenMatKhau"` |
| 4 | form luôn báo «đã gửi» | `-t form` | `loi van hien man da gui` (hai ca) |
| 4 | `duongQuenMatKhau` trả `"hien"` vô điều kiện | `-t co-tat` | `co tat thi trang phai ve /sign-in` |
| 4 | xoá `/quen-mat-khau` khỏi `ANONYMOUS` | `proxy-an-danh.spec.ts` | hai ca đỏ |
| 4 | thêm `className` màu/cỡ chữ lên `Link` | design-gate static | XANH — thước này không bắt lớp `className` trên `Link`; E19 chỉ chứng không có vi phạm P0 mà nó biết |
| 5 | (thước) E18 đọc `p.content()` | `qmk_chup` | dòng «gui xong hien Kiểm tra hộp thư» XANH HẰNG ĐÚNG — HTML chứa dữ liệu RSC mang sẵn chữ; sửa sang `innerText` (acb35439) |
| 5 | xoá `/quen-mat-khau` khỏi `ANONYMOUS` | `qmk_chup` | `KET LUAN: 8 DUNG, 6 SAI — ma thoat 1`, gồm `SAI /quen-mat-khau 1440: khong bi day ve /sign-in` |
| 5 | màn đăng nhập truyền nhãn vô điều kiện + trang luôn hiện | `qmk_chup_tat` | `KET LUAN: 0 DUNG, 2 SAI — ma thoat 1` |
| 5 | vật lành | `qmk_chup` / `qmk_chup_tat` | `14 DUNG, 0 SAI` / `2 DUNG, 0 SAI`, cổng 3300/3301 22:38–22:40 UTC |
| 2 (b) | `requestMax: 5` | `-t qua-luot` | `lan thu tu phai 429, duoc 200` |
| 2 (b) | `requestWindowSeconds: 15 * MINUTE_SECONDS` | `-t qua-luot` | `bo don hang dem xoa cua so dang chan: lan thu tu 200` — đúng lỗi gốc, nay có răng |
