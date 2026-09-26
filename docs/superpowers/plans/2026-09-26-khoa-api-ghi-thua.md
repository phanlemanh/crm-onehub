# Khoá API ghi thưa — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xác minh khoá API không ghi CSDL mỗi lượt: `lastRequest` chỉ ghi khi cũ quá một phút, bỏ lần đóng dấu `updatedAt`.

**Architecture:** Vá `@better-auth/api-key` 1.6.25 bằng `bun patch` (thêm tuỳ chọn `lastRequestUpdateIntervalMs`, vắng thì y bản gốc). Kho đặt ngưỡng ở `packages/auth/src/api-keys.ts` và truyền vào `apiKey()` trong `auth.ts`. Test mức thư viện ở `packages/auth` (adapter bộ nhớ), test tích hợp ở `apps/api` (CSDL test riêng).

**Tech Stack:** Bun 1.3.12 (`bun patch`, `patchedDependencies`), better-auth 1.6.25, `@better-auth/api-key` 1.6.25, `@better-auth/memory-adapter` 1.6.25, NestJS + tRPC, Prisma, bun:test, supertest.

**Spec:** `docs/superpowers/specs/2026-09-26-khoa-api-ghi-thua-design.md` · hợp đồng `_acceptance/khoa-api-ghi-thua/contract.md` · evals `_acceptance/khoa-api-ghi-thua/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã — cả mã mới, mã sửa, lẫn phần thêm vào tệp vá (AGENTS.md).
- Ngưỡng là hằng trong `packages/auth/src/api-keys.ts`, suy từ một hằng đơn vị, `as const`; không số trần ở nơi dùng.
- Tuỳ chọn vắng thì thư viện chạy y như 1.6.25 gốc.
- Không đổi cách đếm của nhánh rate-limit bật, không chạm `consumeRemaining`, không chạm secondary-storage.
- Test tích hợp chỉ chạy trên CSDL `crm_<id>_test` qua `bun run test -- "…"`; không bao giờ trên CSDL dev `crm`.
- Không mở máy chủ trên 3000/3001/3300/3301/3500/3501; test dùng `app.getHttpServer()`.
- Bun trên PATH phải là 1.3.12 (khớp `packageManager`).

## Review Focus

1. Khoá mới tạo, `lastRequest` null — lượt đầu phải ghi (không được coi null là «còn mới»). Ca `khong-ghi-trong-nguong` ở Task 2 ghim.
2. `lastRequest` nằm ở tương lai (đồng hồ máy khác chạy nhanh) — không ghi, không lỗi, yêu cầu vẫn 200. Thêm vào ca `bien-nguong` ở Task 2.
3. Ai chạy `bun add`/`bun update` nâng thư viện — bản vá mất hiệu lực; ca `chong-troi-ban-va` ở Task 1 phải đỏ với thông điệp ghim.
4. Tuỳ chọn truyền `0` — mọi lượt đều ghi `lastRequest` (0 không phải «vắng»). Thêm vào ca `hai-chieu-thu-vien` ở Task 1.
5. Nhiều yêu cầu đồng thời đúng lúc qua ngưỡng — nhiều lần ghi, không lỗi, không 500. Chấp nhận (sổ quyết định d-…-5), không có ca riêng.

---

### Task 1: Bản vá thư viện và test mức thư viện

Phục vụ E3 (AC-3), E4 (AC-4), E6 (AC-6). `independent: false` (Task 2 cần bản vá).

**Files:**
- Create: `patches/@better-auth%2Fapi-key@1.6.25.patch` (sinh bằng `bun patch --commit`)
- Modify: `package.json` (khoá `patchedDependencies` do bun ghi), `bun.lock`
- Test: `packages/auth/test/khoa-api-ghi-thua.spec.ts`

**Interfaces:**
- Produces: tuỳ chọn plugin `apiKey({ lastRequestUpdateIntervalMs?: number })`; hằng thông điệp `NANG_KHONG_VA = "nâng @better-auth/api-key mà chưa làm lại bản vá khoa-api-ghi-thua"` (chỉ trong tệp test).

- [ ] **Step 1: Viết test mức thư viện (đỏ trước)**

```ts
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const TEN_GOI = "@better-auth/api-key";
const NANG_KHONG_VA =
	"nâng @better-auth/api-key mà chưa làm lại bản vá khoa-api-ghi-thua";
const PHUT_MS = 60 * 1000;
const LUOT = 3;

type Kho = Record<string, Record<string, unknown>[]>;

async function dung(opts: Parameters<typeof apiKey>[0]) {
	const kho: Kho = { user: [], session: [], account: [], verification: [], apikey: [] };
	const auth = betterAuth({
		secret: "khoa-api-ghi-thua-bi-mat-du-dai-32-ky-tu",
		baseURL: "http://localhost",
		database: memoryAdapter(kho),
		plugins: [apiKey({ enableSessionForAPIKeys: true, ...opts })],
	});
	const c = await auth.$context;
	let dem = 0;
	const update = c.adapter.update.bind(c.adapter);
	const incrementOne = c.adapter.incrementOne.bind(c.adapter);
	c.adapter.update = (async (a: Parameters<typeof update>[0]) => {
		if (a.model === "apikey") dem++;
		return update(a);
	}) as typeof update;
	c.adapter.incrementOne = (async (a: Parameters<typeof incrementOne>[0]) => {
		if (a.model === "apikey") dem++;
		return incrementOne(a);
	}) as typeof incrementOne;
	const user = await c.internalAdapter.createUser({
		email: "khoa@thu.test",
		name: "khoa",
		emailVerified: true,
	});
	const khoa = await auth.api.createApiKey({ body: { name: "thu", userId: user.id } });
	const goi = () => auth.api.getSession({ headers: new Headers({ "x-api-key": khoa.key }) });
	const demQuaLuot = async (n: number) => {
		const ra: number[] = [];
		for (let i = 0; i < n; i++) {
			const truoc = dem;
			await goi();
			ra.push(dem - truoc);
		}
		return ra;
	};
	return { kho, goi, demQuaLuot, khoaId: khoa.id };
}

export function banVaKhop(daCai: string, khoaVa: string[]): void {
	const khop = khoaVa.filter((k) => k.startsWith(`${TEN_GOI}@`));
	if (khop.length !== 1 || khop[0] !== `${TEN_GOI}@${daCai}`) {
		throw new Error(`${NANG_KHONG_VA}: đã cài ${daCai}, bản vá ${khop.join(", ") || "không có"}`);
	}
}

describe("khoa-api-ghi-thua thu vien", () => {
	test("hai-chieu-thu-vien: vang tuy chon ghi 2 lan moi luot, co tuy chon chi ghi luot dau", async () => {
		const goc = await dung({ rateLimit: { enabled: false } });
		expect(await goc.demQuaLuot(LUOT), "ban goc phai ghi 2 lan moi luot").toEqual([2, 2, 2]);
		const va = await dung({ rateLimit: { enabled: false }, lastRequestUpdateIntervalMs: PHUT_MS });
		expect(await va.demQuaLuot(LUOT), "co tuy chon: chi luot dau ghi lastRequest").toEqual([1, 0, 0]);
		const khong = await dung({ rateLimit: { enabled: false }, lastRequestUpdateIntervalMs: 0 });
		expect(await khong.demQuaLuot(LUOT), "tuy chon 0 phai ghi moi luot").toEqual([1, 1, 1]);
	});

	test("rate-limit-bat-van-dem: rate-limit bat van dem va van chan luot thu ba", async () => {
		const { goi, kho, khoaId } = await dung({
			rateLimit: { enabled: true, maxRequests: 2, timeWindow: PHUT_MS },
			lastRequestUpdateIntervalMs: PHUT_MS,
		});
		expect(await goi(), "luot 1 phai hop le").not.toBeNull();
		expect(await goi(), "luot 2 phai hop le").not.toBeNull();
		const loi = await goi().then(() => null, (e: { body?: { code?: string } }) => e);
		expect(loi?.body?.code, "luot 3 phai bi chan RATE_LIMITED").toBe("RATE_LIMITED");
		const hang = kho.apikey.find((h) => h.id === khoaId);
		expect(hang?.requestCount, "requestCount phai bang 2").toBe(2);
	});

	test("chong-troi-ban-va: phien ban da cai khop khoa ban va va ma da cai co tuy chon", () => {
		const duongMa = Bun.resolveSync(TEN_GOI, import.meta.dir);
		const goiDaCai = JSON.parse(readFileSync(join(dirname(duongMa), "..", "package.json"), "utf8")) as { version: string };
		const goc = JSON.parse(readFileSync(join(GOC_KHO, "package.json"), "utf8")) as { patchedDependencies?: Record<string, string> };
		const vaTheo = goc.patchedDependencies ?? {};
		banVaKhop(goiDaCai.version, Object.keys(vaTheo));
		const tepVa = vaTheo[`${TEN_GOI}@${goiDaCai.version}`] ?? "";
		expect(readFileSync(join(GOC_KHO, tepVa), "utf8").length, "tep va rong").toBeGreaterThan(0);
		expect(readFileSync(join(GOC_KHO, "bun.lock"), "utf8"), "bun.lock thieu khoa ban va").toContain(`"${TEN_GOI}@${goiDaCai.version}"`);
		expect(readFileSync(duongMa, "utf8"), "ma da cai chua co ban va").toContain("lastRequestUpdateIntervalMs");
		expect(() => banVaKhop("1.6.26", Object.keys(vaTheo)), "phien ban lech phai do").toThrow(NANG_KHONG_VA);
	});
});
```

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts`
Expected: `hai-chieu-thu-vien` đỏ ở mảng thứ hai (`[2,2,2]` thay vì `[1,0,0]`); `chong-troi-ban-va` đỏ với `NANG_KHONG_VA`; `rate-limit-bat-van-dem` xanh (hành vi gốc).

- [ ] **Step 3: Mở gói để vá**

Run (gốc kho): `bun patch @better-auth/api-key@1.6.25`
Expected: bun in đường dẫn thư mục gói đã tách khỏi bộ đệm để sửa.

- [ ] **Step 4: Sửa `dist/index.mjs` trong thư mục bun vừa in**

Thêm hàm ngay trên `function evaluateRateLimit`:

```js
function stampLastRequest(lastRequest, now, opts) {
	const interval = opts.lastRequestUpdateIntervalMs;
	if (interval === void 0 || lastRequest === null) return now;
	return now.getTime() - new Date(lastRequest).getTime() < interval ? null : now;
}
```

Trong `evaluateRateLimit`, hai nhánh `skip` đầu đổi `lastRequest: now` thành `lastRequest: stampLastRequest(lastRequest, now, opts)`.

Trong `claimUsageInDatabase`, ngay sau `row = await consumeRateLimit(ctx, row, opts);`:

```js
	if (opts.lastRequestUpdateIntervalMs !== void 0) {
		if (opts.storage === "secondary-storage" && opts.fallbackToDatabase) await setApiKey(ctx, row, opts);
		return row;
	}
```

Trong `dist/types-BYqswa0N.d.mts`, ngay trên `deferUpdates?: boolean | undefined;` thêm `lastRequestUpdateIntervalMs?: number | undefined;` (không kèm khối chú thích).

- [ ] **Step 5: Chốt bản vá**

Run: `bun patch --commit <đường dẫn bun in ở Step 3>`
Expected: sinh `patches/@better-auth%2Fapi-key@1.6.25.patch`, `package.json` có `patchedDependencies`, `bun.lock` đổi. Kiểm: `git diff --stat package.json bun.lock patches/`.

- [ ] **Step 6: Chạy lại test**

Run: `cd packages/auth && bun test test/khoa-api-ghi-thua.spec.ts`
Expected: 3 pass.

- [ ] **Step 7: Phá-thử chiều đỏ trên bản sao (không sửa cây)**

Mã đã cài nằm ngoài git (`node_modules`). Lấy đường dẫn bằng `cd packages/auth && bun -e 'console.log(Bun.resolveSync("@better-auth/api-key","."))'`, sửa tạm tệp đó: thay mọi `stampLastRequest(lastRequest, now, opts)` bằng `now`. Chạy lại lệnh Step 6 — `hai-chieu-thu-vien` phải đỏ với «co tuy chon: chi luot dau ghi lastRequest». Trả lại bằng `bun install --force` (bun áp lại bản vá), chạy Step 6 lần nữa → 3 pass. Không dùng `mock.module` (nó sống qua các tệp kiểm). Ghi lệnh và kết quả vào báo cáo task.

- [ ] **Step 8: Commit**

```bash
git add patches package.json bun.lock packages/auth/test/khoa-api-ghi-thua.spec.ts
git commit -m "feat: vá @better-auth/api-key thêm lastRequestUpdateIntervalMs"
```

### Task 2: Cấu hình kho và test tích hợp API

Phục vụ E1 (AC-1), E2 (AC-2), E5 (AC-5). `independent: false` (cần Task 1).

**Files:**
- Modify: `packages/auth/src/api-keys.ts`, `packages/auth/src/auth.ts:246-258`, `packages/auth/src/index.ts:10-15`
- Test: `apps/api/test/khoa-api-ghi-thua.spec.ts`

**Interfaces:**
- Consumes: tuỳ chọn `lastRequestUpdateIntervalMs` từ Task 1.
- Produces: `export const API_KEY_USAGE = { lastRequestIntervalMs: number } as const` xuất qua `@crm/auth`.

- [ ] **Step 1: Viết test tích hợp (đỏ trước)**

```ts
import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { API_KEY_HEADER, API_KEY_USAGE, auth } from "@crm/auth";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "khoa-api-ghi-thua";
const NGUOI = `kagt-${suffix}`;
const GIAY_MS = 1000;
const TUONG_LAI_MS = 10 * 60 * GIAY_MS;
const DUONG = "/api/trpc/contacts.list?input=%7B%7D";

let app: NestExpressApplication;

async function taoKhoa(ten: string) {
	return auth.api.createApiKey({ body: { name: ten, userId: NGUOI } });
}

async function goi(khoa: string) {
	return request(app.getHttpServer()).get(DUONG).set(API_KEY_HEADER, khoa);
}

async function hang(id: string) {
	return db.apikey.findUniqueOrThrow({
		where: { id },
		select: { lastRequest: true, updatedAt: true },
	});
}

async function maLoi(khoa: string): Promise<string | undefined> {
	return auth.api
		.getSession({ headers: new Headers({ [API_KEY_HEADER]: khoa }) })
		.then(() => undefined, (e: { body?: { code?: string } }) => e.body?.code);
}

beforeAll(async () => {
	app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	await gieoThanhVien(NGUOI, "member");
});

afterAll(async () => {
	await db.apikey.deleteMany({ where: { referenceId: NGUOI } });
	await app.close();
});

describe("khoa-api-ghi-thua", () => {
	test("khong-ghi-trong-nguong: luot hai trong nguong khong ghi gi", async () => {
		const khoa = await taoKhoa("khong-ghi");
		expect((await hang(khoa.id)).lastRequest).toBeNull();
		expect((await goi(khoa.key)).status, "luot dau phai 200").toBe(200);
		const sauDau = await hang(khoa.id);
		expect(sauDau.lastRequest, "luot dau phai ghi lastRequest").not.toBeNull();
		expect((await goi(khoa.key)).status, "luot hai phai 200").toBe(200);
		expect(await hang(khoa.id), "lastRequest doi o luot trong nguong").toEqual(sauDau);
	});

	test("bien-nguong: qua nguong thi ghi, duoi nguong thi khong, tuong lai thi khong", async () => {
		const khoa = await taoKhoa("bien");
		const nguong = API_KEY_USAGE.lastRequestIntervalMs;
		const cu = new Date(Date.now() - nguong - GIAY_MS);
		await db.apikey.update({ where: { id: khoa.id }, data: { lastRequest: cu } });
		const batDau = Date.now();
		expect((await goi(khoa.key)).status).toBe(200);
		const sauCu = (await hang(khoa.id)).lastRequest?.getTime() ?? 0;
		expect(sauCu, "khong ghi khi da qua nguong").toBeGreaterThanOrEqual(batDau);
		const moi = new Date(Date.now() - nguong + GIAY_MS);
		await db.apikey.update({ where: { id: khoa.id }, data: { lastRequest: moi } });
		expect((await goi(khoa.key)).status).toBe(200);
		expect((await hang(khoa.id)).lastRequest, "ghi khi con trong nguong").toEqual(moi);
		const tuongLai = new Date(Date.now() + TUONG_LAI_MS);
		await db.apikey.update({ where: { id: khoa.id }, data: { lastRequest: tuongLai } });
		expect((await goi(khoa.key)).status, "lastRequest tuong lai lam hong yeu cau").toBe(200);
		expect((await hang(khoa.id)).lastRequest, "ghi de lastRequest tuong lai").toEqual(tuongLai);
	});

	test("tu-choi-van-giu: khoa tat va khoa het han van bi tu choi trong nguong", async () => {
		const tat = await taoKhoa("tat");
		const hetHan = await taoKhoa("het-han");
		expect((await goi(tat.key)).status, "doi chung: khoa bat phai 200").toBe(200);
		expect((await goi(hetHan.key)).status, "doi chung: khoa con han phai 200").toBe(200);
		await db.apikey.update({ where: { id: tat.id }, data: { enabled: false } });
		await db.apikey.update({ where: { id: hetHan.id }, data: { expiresAt: new Date(Date.now() - GIAY_MS) } });
		expect((await goi(tat.key)).status, "khoa tat van qua").toBe(401);
		expect(await maLoi(tat.key), "khoa tat van qua").toBe("KEY_DISABLED");
		expect(await maLoi(hetHan.key), "khoa het han van qua").toBe("KEY_EXPIRED");
		expect((await goi(hetHan.key)).status, "khoa het han van qua").toBe(401);
	});
});
```

Ghi chú khi chạy: `KEY_EXPIRED` xoá hàng khoá hết hạn ngay lượt đầu nó gặp, nên lượt tRPC sau đó trả 401 vì khoá không còn — ca vẫn đúng lời hứa (bị từ chối), mã được ghim ở `maLoi` gọi TRƯỚC. Nếu thư viện đặt mã khác (vd `INVALID_API_KEY` cho khoá tắt), dừng và đối chiếu `API_KEY_ERROR_CODES` trong mã đã cài trước khi đổi test.

- [ ] **Step 2: Chạy để thấy đỏ**

Run: `bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts"`
Expected: FAIL ở import `API_KEY_USAGE` (chưa có).

- [ ] **Step 3: Thêm hằng và truyền vào plugin**

`packages/auth/src/api-keys.ts` thêm:

```ts
const MINUTE_MS = 60 * 1000;

export const API_KEY_USAGE = {
	lastRequestIntervalMs: MINUTE_MS,
} as const;
```

`packages/auth/src/index.ts`: thêm `API_KEY_USAGE` vào khối `export { … } from "./api-keys"`.

`packages/auth/src/auth.ts`: import `API_KEY_USAGE` cùng chỗ các hằng khoá API đang import, và trong `apiKey({ … })` thêm dòng `lastRequestUpdateIntervalMs: API_KEY_USAGE.lastRequestIntervalMs,` ngay sau `rateLimit: { enabled: false },`.

- [ ] **Step 4: Chạy lại**

Run: `bun run test -- "cd apps/api && bun test test/khoa-api-ghi-thua.spec.ts"`
Expected: 3 pass.

- [ ] **Step 5: Phá-thử chiều đỏ**

Commit Task 2 trước (ghi nhớ phá-thử tại chỗ mất thay đổi), rồi trên cây: xoá dòng `lastRequestUpdateIntervalMs: …` khỏi `auth.ts`, chạy lại lệnh Step 4 — `khong-ghi-trong-nguong` phải đỏ với «lastRequest doi o luot trong nguong» và `bien-nguong` đỏ với «ghi khi con trong nguong». `git checkout packages/auth/src/auth.ts` để trả lại. Ghi kết quả vào báo cáo task.

- [ ] **Step 6: Commit**

```bash
git add packages/auth/src/api-keys.ts packages/auth/src/auth.ts packages/auth/src/index.ts apps/api/test/khoa-api-ghi-thua.spec.ts
git commit -m "feat: khoá API chỉ ghi lastRequest khi cũ quá một phút"
```

### Task 3: Tài liệu và răng kiểm tài liệu

Phục vụ E7 (AC-7), E14 (AC-10). `independent: false` (tài liệu nêu tên tuỳ chọn và hằng của Task 1–2).

**Files:**
- Modify: `docs/api.md` (thêm một mục H2 ngay sau mục «One organization, and it is not a tenancy boundary»)
- Create: `_acceptance/khoa-api-ghi-thua/rang/tai-lieu.mjs`

- [ ] **Step 1: Viết răng (đỏ trước)**

```js
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TEP = process.argv[2] ?? join(GOC, "docs", "api.md");
const CAN = ["patchedDependencies", "lastRequestUpdateIntervalMs", "better-auth#10921", "khoa-api-ghi-thua"];

const muc = readFileSync(TEP, "utf8").split(/^## /m).slice(1);
const tot = muc
	.map((m) => ({ ten: m.split("\n")[0], thieu: CAN.filter((c) => !m.includes(c)) }))
	.sort((a, b) => a.thieu.length - b.thieu.length)[0];

if (!tot || tot.thieu.length > 0) {
	console.error(`tai-lieu: khong muc H2 nao co du bon chuoi; muc gan nhat «${tot?.ten ?? "(khong co)"}» thieu: ${(tot?.thieu ?? CAN).join(", ")}`);
	process.exit(1);
}
console.log(`tai-lieu: muc «${tot.ten}» co du bon chuoi`);
```

Run: `node _acceptance/khoa-api-ghi-thua/rang/tai-lieu.mjs` → Expected: exit 1, liệt đủ bốn chuỗi thiếu.

- [ ] **Step 2: Viết mục tài liệu**

Thêm vào `docs/api.md`:

```markdown
## API keys run on a patched library

`@better-auth/api-key` 1.6.25 writes two `UPDATE apikey` statements on every
request that sends `x-api-key`, even with `rateLimit: { enabled: false }`
(better-auth#10921). This repo patches it with `bun patch`: the patch lives in
`patches/`, `package.json` lists it under `patchedDependencies`, and it adds one
plugin option, `lastRequestUpdateIntervalMs`. Without the option the library
behaves exactly as released.

- **`lastRequest` is written at most once per `API_KEY_USAGE.lastRequestIntervalMs`**
  (one minute, `packages/auth/src/api-keys.ts`), so Settings → API keys shows the
  last use to within a minute. `updatedAt` no longer moves on use; nothing reads it.
- **Upgrading `@better-auth/api-key` means redoing the patch.** The version is part
  of the patch key; `packages/auth/test/khoa-api-ghi-thua.spec.ts` fails with a named
  message when the installed version and the patch disagree. Run
  `bun patch @better-auth/api-key@<new>`, reapply the three edits, `bun patch --commit`.
- **Remove the patch when better-auth#10921 is fixed upstream** with a release that
  stops writing on every verification while rate limiting is off: upgrade, drop the
  `patchedDependencies` entry and the file, drop the option from `auth.ts`.

The acceptance record is `_acceptance/khoa-api-ghi-thua/`.
```

- [ ] **Step 3: Chạy lại răng và phá-thử chiều đỏ**

Run: `node _acceptance/khoa-api-ghi-thua/rang/tai-lieu.mjs` → exit 0.
Phá-thử: chép `docs/api.md` sang scratchpad, xoá chuỗi `better-auth#10921` khỏi bản sao, chạy `node _acceptance/khoa-api-ghi-thua/rang/tai-lieu.mjs <bản sao>` → exit 1 và in `thieu: better-auth#10921`.

- [ ] **Step 4: Commit**

```bash
git add docs/api.md _acceptance/khoa-api-ghi-thua/rang/tai-lieu.mjs
git commit -m "docs: ghi bản vá api-key và điều kiện gỡ"
```

### Task 4: Soát toàn cây

Phục vụ E8–E12 (AC-8). `independent: false`.

- [ ] **Step 1:** `bun run check-types` → exit 0.
- [ ] **Step 2:** `bun run lint` và `bun run lint:slop` → exit 0.
- [ ] **Step 3:** Xin lượt phiên điều phối, rồi `bun run test` và `bun run build` → exit 0.
- [ ] **Step 4:** Sửa lỗi nếu có, commit.
