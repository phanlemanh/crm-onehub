# LT1d · Chặt đường đẩy bản chụp — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (vòng feature-loop T2 thi công tuần tự trong phiên chính). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trần thân 2 MB chỉ áp cho đường bản chụp lộ trình, mọi đường REST khác về 100 000 byte; kịch bản đẩy bản chụp từ chối lượt Actions không chạy từ `refs/heads/onehub`.

**Architecture:** `createApp` dựng hai `createOpenApiExpressMiddleware` trên cùng router và chọn theo `req.path` bằng đúng `BAN_CHUP_LO_TRINH.duongRest`. `day()` đọc `GITHUB_ACTIONS`/`GITHUB_REF` từ `env` nó được trao và dừng mã 1 trước mọi bước khác khi ref không phải `BAN_CHUP_LO_TRINH.refDay`. Hằng mới sống trong `BAN_CHUP_LO_TRINH` và cạnh `REST_BRIDGE_PATH`.

**Tech Stack:** NestJS + nestjs-trpc, trpc-to-openapi 3.3.0, Express, Bun test, supertest, Zod.

**Spec:** `docs/superpowers/specs/2026-10-15-chat-duong-day-ban-chup-design.md` · hợp đồng `_acceptance/chat-duong-day-ban-chup/contract.md` · bộ đo `_acceptance/chat-duong-day-ban-chup/evals.yaml`.

**Điều kiện mở:** LT1c (`feat/lo-trinh-doc-ban-chup`) đã gộp `onehub`; gộp `origin/onehub` vào nhánh này, `bun install`, `cd packages/db && bun run db:generate` trước Task 1. Mọi tệp sửa dưới đây do LT1c thêm.

## Global Constraints

- Không chú thích trong mã (AGENTS.md).
- Hằng tunable khai một chỗ theo khu: trần 2 MB và đường `/lo-trinh/ban-chup` và ref `refs/heads/onehub` trong `BAN_CHUP_LO_TRINH` (`packages/validation/src/ban-chup-lo-trinh.ts`); trần chung `REST_BRIDGE_BODY_LIMIT_BYTES = 100_000` cạnh `REST_BRIDGE_PATH` (`apps/api/src/trpc/openapi.ts`).
- Trần chung là 100 000 byte, không phải 100 × 1024.
- Cầu 2 MB chỉ được chọn khi `req.path === BAN_CHUP_LO_TRINH.duongRest` — không `startsWith`, không regex.
- Bước chặn nhánh đứng đầu `day()`, trước kiểm khoá.
- Bài kiểm trao env tường minh; không bài nào kế thừa `GITHUB_ACTIONS`/`GITHUB_REF` của máy chạy.
- Lệnh ghi CSDL đi qua `bun run test -- "<lệnh>"` (kho thử riêng mỗi lượt), không `bun test` trần ở `apps/api`.
- Không sửa `.github/workflows/ban-chup-lo-trinh.yml`.

## Review Focus

- CI của PR chạy bài với `GITHUB_ACTIONS=true`, `GITHUB_REF=refs/pull/<n>/merge` — bài `chay-that` phải đặt hai biến tường minh (Task 3, E7b).
- Thân đúng bằng 100 000 byte phải qua, 100 001 phải 413 — biên trần chung (Task 2, ô o2/o3 hàng đường khác).
- Khối lộ trình thật sẽ còn lớn dần; ô o1 hàng bản chụp kiểm cỡ thật > trần chung để bài còn chứng điều nó hứa (Task 2).
- Tiền tố gần giống `/lo-trinh/ban-chup-x` không có thủ tục để đo; Task 4 quét chuỗi đường và Task 2 khoá so khớp bằng nhau qua chấm E9.
- Ref chứa chữ `onehub` mà không phải `refs/heads/onehub` (vd `refs/heads/feat/onehub`) phải bị chặn (Task 3, ô thêm của dcn-tu-choi).

---

### Task 1: Hằng cấu hình một chỗ

independent: false · phục vụ E9, E9b

**Files:**
- Modify: `packages/validation/src/ban-chup-lo-trinh.ts` (khối `BAN_CHUP_LO_TRINH`)
- Modify: `apps/api/src/trpc/openapi.ts`
- Modify: `apps/api/src/lo-trinh/lo-trinh-ban-chup.router.ts:26`
- Modify: `scripts/ban-chup-lo-trinh/day.ts:11`
- Test: `packages/validation/test/ban-chup-lo-trinh.spec.ts`

**Interfaces:**
- Produces: `BAN_CHUP_LO_TRINH.duongRest: "/lo-trinh/ban-chup"`, `BAN_CHUP_LO_TRINH.refDay: "refs/heads/onehub"`, `REST_BRIDGE_BODY_LIMIT_BYTES: 100000` (export từ `apps/api/src/trpc/openapi.ts`), `DUONG_DAY` (giữ tên, nay suy từ hai hằng).

- [ ] **Step 1: Thêm ca kiểm vào spec validation**

```ts
test("ban-chup-hang: duong REST va ref day khai trong cau hinh", () => {
	expect(BAN_CHUP_LO_TRINH.duongRest).toBe("/lo-trinh/ban-chup");
	expect(BAN_CHUP_LO_TRINH.refDay).toBe("refs/heads/onehub");
});
```

- [ ] **Step 2: Chạy, thấy đỏ** — `cd packages/validation && bun test test/ban-chup-lo-trinh.spec.ts -t ban-chup-hang` → FAIL (`undefined`).

- [ ] **Step 3: Sửa cấu hình**

```ts
export const BAN_CHUP_LO_TRINH = {
	nguonCrm: "crm",
	tranThanByte: 2 * MB,
	tranCanhBao: 20,
	ketQua: ["nhan", "trung", "cu-hon"],
	duongRest: "/lo-trinh/ban-chup",
	refDay: "refs/heads/onehub",
} as const;
```

`apps/api/src/trpc/openapi.ts`, ngay dưới `REST_BRIDGE_PATH`:

```ts
export const REST_BRIDGE_BODY_LIMIT_BYTES = 100_000;
```

Router: `meta: restMeta("POST", BAN_CHUP_LO_TRINH.duongRest, ["Roadmap"]),` (import `BAN_CHUP_LO_TRINH` từ `@crm/validation/ban-chup-lo-trinh`).

`day.ts`:

```ts
import { REST_BRIDGE_PATH } from "../../apps/api/src/trpc/openapi.ts";
export const DUONG_DAY = `${REST_BRIDGE_PATH}${BAN_CHUP_LO_TRINH.duongRest}`;
```

- [ ] **Step 4: Xanh** — lệnh Step 2 PASS; `bun run check-types` không lỗi mới.

- [ ] **Step 5: Commit** — `git commit -m "refactor(chat-duong-day-ban-chup): đường bản chụp, ref đẩy và trần chung khai một chỗ"`

---

### Task 2: Hai cầu REST theo đường

independent: false (đọc hằng Task 1) · phục vụ E1, E2, E3, E4, E5, E9

**Files:**
- Create: `apps/api/test/tran-than-rest.spec.ts`
- Modify: `apps/api/src/create-app.ts` (khối dựng `restBridge` cuối hàm và middleware ở `REST_BRIDGE_PATH`)

**Interfaces:**
- Consumes: `BAN_CHUP_LO_TRINH.{duongRest,tranThanByte}`, `REST_BRIDGE_BODY_LIMIT_BYTES`, `REST_BRIDGE_PATH`, `gieoThanhVien`, `mintPhien` (`apps/api/test/phien-thu.ts`).

- [ ] **Step 1: Viết bài (đỏ trước)** — `apps/api/test/tran-than-rest.spec.ts`:

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { API_KEY_HEADER } from "@crm/auth";
import { db } from "@crm/db";
import { BAN_CHUP_LO_TRINH } from "@crm/validation/ban-chup-lo-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import { REST_BRIDGE_BODY_LIMIT_BYTES, REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttr${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const CHU = `${TIEN_TO}-owner`;
const DUONG_BAN_CHUP = `${REST_BRIDGE_PATH}${BAN_CHUP_LO_TRINH.duongRest}`;
const DUONG_KHAC = `${REST_BRIDGE_PATH}/org/divisions`;
const TRAN_CHUNG = REST_BRIDGE_BODY_LIMIT_BYTES;
const TRAN_BAN_CHUP = BAN_CHUP_LO_TRINH.tranThanByte;
const CHO_MS = 120_000;
const NGUON = BAN_CHUP_LO_TRINH.nguonCrm;
const GOC = join(import.meta.dir, "..", "..", "..");
const khoiJson = z.record(z.string(), z.json());
const KHOI_HTML =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/.exec(
		readFileSync(join(GOC, "LO-TRINH.html"), "utf8"),
	)?.[1];
if (!KHOI_HTML) throw new Error("LO-TRINH.html khong mang khoi");
const KHOI = khoiJson.parse(JSON.parse(KHOI_HTML));
const loi413 = z.looseObject({ code: z.string() });

let app: NestExpressApplication;
let cookie = "";
let khoa = "";

const sha = (c: string) => c.repeat(40);
const banChup = (s: string, luc: string, them: Record<string, string> = {}) =>
	JSON.stringify({ nguon: NGUON, sha: s, commitLuc: luc, duLieu: KHOI, canhBao: [], ...them });
const dem = (n: number) => {
	const vo = '{"p":""}';
	return `{"p":"${"x".repeat(n - vo.length)}"}`;
};
const gui = (duong: string, than: string, o: { key?: string; cookie?: string } = {}) => {
	let r = request(app.getHttpServer()).post(duong).set("content-type", "application/json");
	if (o.key) r = r.set(API_KEY_HEADER, o.key);
	if (o.cookie) r = r.set("cookie", o.cookie);
	return r.send(than);
};
const don = () => db.banChupLoTrinh.deleteMany({ where: { nguon: NGUON } });

beforeAll(async () => {
	app = await createApp();
	await gieoThanhVien(CHU, "owner");
	cookie = (await mintPhien(CHU)).cookie;
	const r = await request(app.getHttpServer())
		.post("/api/trpc/apiKeys.create")
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify({ name: "ttr-day", expiresInDays: null, loai: "day-lo-trinh" }));
	khoa = z.object({ key: z.string() }).parse(r.body?.result?.data).key;
	await don();
}, CHO_MS);

afterAll(async () => {
	await don();
	await db.apikey.deleteMany({ where: { referenceId: { startsWith: TIEN_TO } } });
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

describe("ttr-ban-chup", () => {
	test("ttr-ban-chup: 3 o duong ban chup", async () => {
		await don();
		const o1 = banChup(sha("a"), "2026-10-15T08:00:00Z");
		expect(Buffer.byteLength(o1) > TRAN_CHUNG, "khoi that khong lon hon tran chung").toBe(true);
		const r1 = await gui(DUONG_BAN_CHUP, o1, { key: khoa });
		expect(r1.status, "khoi lo trinh that bi chan vi co").toBe(200);
		expect(r1.body.ketQua).toBe("nhan");
		const o2 = banChup(sha("b"), "2026-10-15T09:00:00Z", { dem: "x".repeat(1_500_000) });
		const r2 = await gui(DUONG_BAN_CHUP, o2, { key: khoa });
		expect(r2.status, "khoi lo trinh that bi chan vi co").toBe(200);
		expect(r2.body.ketQua).toBe("nhan");
		expect((await db.banChupLoTrinh.findUnique({ where: { nguon: NGUON } }))?.sha).toBe(sha("b"));
		const r3 = await gui(DUONG_BAN_CHUP, dem(TRAN_BAN_CHUP + 1), { key: khoa });
		expect(r3.status, "duong ban chup nhan than qua 2 MB").toBe(413);
	}, CHO_MS);
});

describe("ttr-duong-khac", () => {
	const ma = [
		[90_000, 401],
		[TRAN_CHUNG, 401],
		[TRAN_CHUNG + 1, 413],
		[150_000, 413],
		[TRAN_BAN_CHUP + 1, 413],
	] as const;
	test("ttr-duong-khac: 5 o chua dang nhap", async () => {
		const sai: string[] = [];
		for (const [co, kyVong] of ma) {
			const than = dem(co);
			expect(Buffer.byteLength(than)).toBe(co);
			const r = await gui(DUONG_KHAC, than);
			if (r.status !== kyVong) sai.push(`${co} byte: ${r.status} != ${kyVong}`);
		}
		expect(sai, "duong REST khac nhan than qua 100 KB").toEqual([]);
		expect(await db.division.count({ where: { name: "x" } })).toBe(0);
	}, CHO_MS);
	test("ttr-duong-khac: co phien khong noi tran", async () => {
		const r = await gui(DUONG_KHAC, dem(150_000), { cookie });
		expect(r.status, "tran than noi theo nguoi gui").toBe(413);
		const nho = await gui(DUONG_KHAC, "{}", { cookie });
		expect(nho.status).not.toBe(413);
	}, CHO_MS);
});

describe("ttr-khuon-413", () => {
	test("ttr-khuon-413: hai duong tra 413 cung khuon", async () => {
		const a = await gui(DUONG_BAN_CHUP, dem(TRAN_BAN_CHUP + 1), { key: khoa });
		const b = await gui(DUONG_KHAC, dem(150_000));
		expect([a.status, b.status]).toEqual([413, 413]);
		const ka = Object.keys(a.body).sort();
		const kb = Object.keys(b.body).sort();
		expect(ka, "hai duong tra loi 413 khac khuon").toEqual(kb);
		expect(loi413.parse(a.body).code, "hai duong tra loi 413 khac khuon").toBe(loi413.parse(b.body).code);
	}, CHO_MS);
});
```

Tên bảng phòng ban trong Prisma (`db.division`) kiểm lại bằng `grep -n "model " packages/db/prisma/schema.prisma` trước khi chạy; đổi đúng tên model nếu khác.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun run test -- "cd apps/api && bun test test/tran-than-rest.spec.ts"` → `ttr-duong-khac` FAIL («duong REST khac nhan than qua 100 KB», ô 100 001 và 150 000 trả 401 thay vì 413). `ttr-ban-chup` xanh sẵn (LT1c đặt 2 MB cho cả cầu) — đúng, nó là đối chứng của nhát sửa.

- [ ] **Step 3: Sửa `createApp`** — thay khối cuối:

```ts
	const { appRouter } = app.get(AppRouterHost);
	const createContext = ({ req }: { req: Request }) => createBaseTrpcContext(req);

	const cauBanChup = createOpenApiExpressMiddleware({
		router: appRouter,
		createContext,
		maxBodySize: BAN_CHUP_LO_TRINH.tranThanByte,
	});
	const cauChung = createOpenApiExpressMiddleware({
		router: appRouter,
		createContext,
		maxBodySize: REST_BRIDGE_BODY_LIMIT_BYTES,
	});
	restBridge = (req, res) =>
		req.path === BAN_CHUP_LO_TRINH.duongRest ? cauBanChup(req, res) : cauChung(req, res);
```

và import `REST_BRIDGE_BODY_LIMIT_BYTES` cạnh `REST_BRIDGE_PATH`. Kiểu của `createContext` theo đúng kiểu `createOpenApiExpressMiddleware` mong — nếu kiểu suy không khớp, giữ nguyên lambda nội tuyến như LT1c ở cả hai lời gọi.

- [ ] **Step 4: Xanh** — lệnh Step 2 PASS cả ba describe; `bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts"` vẫn xanh (đối chứng LT1c, gồm `ldbc-hong h5`).

- [ ] **Step 5: Phá-thử chiều đỏ (commit trước, rồi mới phá)** — commit nhát sửa; rồi lần lượt trên cây: (a) đặt `cauBanChup` dùng `REST_BRIDGE_BODY_LIMIT_BYTES` → `ttr-ban-chup` đỏ «khoi lo trinh that bi chan vi co»; (b) cả hai cầu dùng `tranThanByte` → `ttr-duong-khac` đỏ «duong REST khac nhan than qua 100 KB»; (c) `REST_BRIDGE_BODY_LIMIT_BYTES = 100 * 1024` → ô 100 001 đỏ; (d) chọn cầu 2 MB khi có `cookie` → «tran than noi theo nguoi gui». Sau mỗi lượt `git checkout -- <tệp>`. Ghi bốn kết quả vào commit kế hoặc sổ thi công.

- [ ] **Step 6: Commit** — `git commit -m "fix(chat-duong-day-ban-chup): trần 2 MB chỉ cho đường bản chụp, đường REST khác về 100 000 byte"`

---

### Task 3: Kịch bản đẩy chỉ chạy từ onehub

independent: false (đọc `refDay` Task 1) · phục vụ E6, E7, E7b, E8

**Files:**
- Modify: `scripts/ban-chup-lo-trinh/day.ts` (đầu hàm `day`)
- Modify: `scripts/ban-chup-lo-trinh/test/day.test.ts` (thêm ba describe, sửa env của `chay-that`)

**Interfaces:**
- Consumes: `BAN_CHUP_LO_TRINH.refDay`, `DUONG_DAY`.
- Produces: dòng `::error title=ban-chup-lo-trinh::ngoai-onehub` + một dòng lỗi chứa ref đã chạy và `refDay`.

- [ ] **Step 1: Viết bài (đỏ trước)** — thêm vào `day.test.ts`:

```ts
const ACTIONS = (ref?: string) => ({ ...ENV, GITHUB_ACTIONS: "true", ...(ref === undefined ? {} : { GITHUB_REF: ref }) });
const loiChuThich = (ra: string[]) =>
	ra.filter((d) => d.startsWith(`::error title=${TIEU_DE_GHI_CHU}::`));

describe("dcn-tu-choi", () => {
	const ca: [string, Record<string, string | undefined>][] = [
		["nhanh khac", ACTIONS("refs/heads/feat/thu")],
		["the", ACTIONS("refs/tags/v1")],
		["thieu ref", ACTIONS()],
		["nhanh mang chu onehub", ACTIONS("refs/heads/feat/onehub")],
		["sai ref khong khoa", { GITHUB_ACTIONS: "true", GITHUB_REF: "refs/heads/feat/thu" }],
	];
	for (const [ten, env] of ca)
		test(`dcn-tu-choi ${ten}: ma 1, khong goi CRM, noi ref`, async () => {
			const may = mayChu(traKetQua("nhan"));
			const { ma, ra, loi } = await chay({ fetch: may.fetch, env });
			expect(may.goi.length, "luot ngoai onehub da goi CRM").toBe(0);
			expect(`${ten}: ma ${ma}`).toBe(`${ten}: ma 1`);
			expect(ghiChu(ra), "luot ngoai onehub xanh vi chua cai").toEqual([]);
			expect(loiChuThich(ra).length).toBe(1);
			const cau = loi.join("\n");
			expect(cau).toContain(BAN_CHUP_LO_TRINH.refDay);
			expect(cau).toContain(env.GITHUB_REF ?? "thiếu GITHUB_REF");
		});
});

describe("dcn-onehub", () => {
	test("dcn-onehub actions + onehub: day nhu cu", async () => {
		const may = mayChu(traKetQua("nhan"));
		const { ma, ra } = await chay({ fetch: may.fetch, env: ACTIONS(BAN_CHUP_LO_TRINH.refDay) });
		expect(ma).toBe(0);
		expect(may.goi.length).toBe(1);
		expect(may.goi[0]?.url).toBe(new URL(DUONG_DAY, URL_API).toString());
		expect(ghiChu(ra)).toEqual([`::notice title=${TIEU_DE_GHI_CHU}::nhan`]);
	});
	test("dcn-onehub ngoai actions: nhu truoc vong", async () => {
		const may = mayChu(traKetQua("nhan"));
		const { ma } = await chay({ fetch: may.fetch, env: { ...ENV, GITHUB_REF: "refs/heads/feat/thu" } });
		expect(ma).toBe(0);
		expect(may.goi.length).toBe(1);
	});
	for (const [ref, maKyVong, soThan] of [
		[BAN_CHUP_LO_TRINH.refDay, 0, 1],
		["refs/pull/1/merge", 1, 0],
	] as const)
		test(`dcn-onehub tien trinh rieng ${ref}`, async () => {
			const nhan: unknown[] = [];
			const mayThat = Bun.serve({
				port: 0,
				fetch: async (req) => {
					nhan.push(await req.json());
					return Response.json(banChupRa.parse({ ketQua: "nhan" }));
				},
			});
			try {
				const tien = Bun.spawn(["bun", "scripts/ban-chup-lo-trinh/day.ts"], {
					cwd: GOC,
					env: {
						...process.env,
						CRM_API_URL: `http://127.0.0.1:${mayThat.port}`,
						CRM_KHOA_DAY_LO_TRINH: KHOA,
						GITHUB_ACTIONS: "true",
						GITHUB_REF: ref,
					},
					stdout: "pipe",
					stderr: "pipe",
				});
				expect(await tien.exited, await new Response(tien.stderr).text()).toBe(maKyVong);
				expect(nhan.length, "luot ngoai onehub da goi CRM").toBe(soThan);
			} finally {
				mayThat.stop(true);
			}
		});
});

describe("dcn-workflow", () => {
	test("dcn-workflow: nhanh push trung refDay, buoc day khong tu dat ref", () => {
		const wf: Workflow = Bun.YAML.parse(
			readFileSync(path.join(GOC, ".github", "workflows", "ban-chup-lo-trinh.yml"), "utf8"),
		) as Workflow;
		expect(wf.on.push.branches.length).toBe(1);
		expect(`refs/heads/${wf.on.push.branches[0]}`, "nhanh day lech nhanh duoc phep").toBe(BAN_CHUP_LO_TRINH.refDay);
		for (const job of Object.values(wf.jobs))
			for (const buoc of job.steps) {
				expect(buoc.env?.GITHUB_REF, "buoc day tu dat GITHUB_REF").toBeUndefined();
				expect(buoc.env?.GITHUB_ACTIONS, "buoc day tu dat GITHUB_REF").toBeUndefined();
			}
	});
});
```

Trong `describe("chay-that")` có sẵn, thêm hai khoá vào `env` của `Bun.spawn`: `GITHUB_ACTIONS: "true", GITHUB_REF: BAN_CHUP_LO_TRINH.refDay`.

- [ ] **Step 2: Chạy, thấy đỏ** — `bun test scripts/ban-chup-lo-trinh/test/day.test.ts -t dcn` → `dcn-tu-choi` FAIL («luot ngoai onehub da goi CRM»), `dcn-onehub tien trinh rieng refs/pull/1/merge` FAIL.

- [ ] **Step 3: Thêm bước chặn ở đầu `day()`**

```ts
const ngoaiNhanh = (env: DauVaoDay["env"]) =>
	env.GITHUB_ACTIONS === "true" && env.GITHUB_REF !== BAN_CHUP_LO_TRINH.refDay;

export async function day(o: DauVaoDay): Promise<0 | 1> {
	if (ngoaiNhanh(o.env)) {
		const ref = o.env.GITHUB_REF?.trim() || "thiếu GITHUB_REF";
		o.in(`::error title=${TIEU_DE_GHI_CHU}::ngoai-onehub`);
		o.loi(
			`Lượt này chạy từ ${ref}; chỉ ${BAN_CHUP_LO_TRINH.refDay} được đẩy bản chụp lộ trình lên CRM. Không gọi CRM.`,
		);
		return 1;
	}
```

(phần còn lại của `day()` giữ nguyên).

- [ ] **Step 4: Xanh** — `bun test scripts/ban-chup-lo-trinh/test` PASS toàn bộ; `GITHUB_ACTIONS=true GITHUB_REF=refs/pull/1/merge bun test scripts/ban-chup-lo-trinh/test` PASS (E7b).

- [ ] **Step 5: Phá-thử (commit trước)** — (a) bỏ bước chặn → `dcn-tu-choi` đỏ «luot ngoai onehub da goi CRM»; (b) dời bước chặn xuống sau bước chưa-cài-khoá → ô «sai ref khong khoa» đỏ «luot ngoai onehub xanh vi chua cai»; (c) so bằng `endsWith("onehub")` → ô «nhanh mang chu onehub» đỏ; (d) bỏ hai khoá env vừa thêm ở `chay-that` → lệnh E7b đỏ ở `chay-that`; (e) bản sao workflow đổi `branches: [main]` → `dcn-workflow` đỏ «nhanh day lech nhanh duoc phep». Hoàn lại sau mỗi lượt.

- [ ] **Step 6: Commit** — `git commit -m "fix(chat-duong-day-ban-chup): kịch bản đẩy từ chối lượt Actions không chạy từ onehub"`

---

### Task 4: Thước «khai một chỗ»

independent: true (chỉ đọc cây) · phục vụ E9b

**Files:**
- Create: `_acceptance/chat-duong-day-ban-chup/rang/mot-cho-khai.mjs`

**Interfaces:**
- Consumes: không. Lệnh: `node _acceptance/chat-duong-day-ban-chup/rang/mot-cho-khai.mjs [--root <gốc>]`; gốc mặc định suy từ vị trí tệp (`../../..`).

- [ ] **Step 1: Viết thước**

```js
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const i = process.argv.indexOf("--root");
const GOC = i > 0 ? resolve(process.argv[i + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const CHUOI = "/lo-trinh/ban-chup";
const NOI_KHAI = "packages/validation/src/ban-chup-lo-trinh.ts";
const BO_THU_MUC = new Set(["node_modules", "generated", "test", "tests", "__tests__", "dist"]);
const DUOI = /\.(ts|tsx|js|mjs|cjs)$/;
const BO_TEP = /\.(spec|test|dom)\.[^.]+$/;

function* duyet(d) {
	for (const ten of readdirSync(d)) {
		if (BO_THU_MUC.has(ten) || ten.startsWith(".")) continue;
		const p = join(d, ten);
		if (statSync(p).isDirectory()) yield* duyet(p);
		else if (DUOI.test(ten) && !BO_TEP.test(ten)) yield p;
	}
}

const viPham = [];
for (const goc of ["apps", "packages", "scripts"])
	for (const p of duyet(join(GOC, goc))) {
		const rel = relative(GOC, p);
		if (rel === NOI_KHAI) continue;
		readFileSync(p, "utf8").split("\n").forEach((dong, n) => {
			if (dong.includes(CHUOI)) viPham.push(`${rel}:${n + 1}: ${dong.trim()}`);
		});
	}
readFileSync(join(GOC, "apps/api/src/create-app.ts"), "utf8").split("\n").forEach((dong, n) => {
	if (/maxBodySize:\s*[\d(]/.test(dong)) viPham.push(`apps/api/src/create-app.ts:${n + 1}: maxBodySize la so — ${dong.trim()}`);
});
for (const v of viPham) console.log(v);
console.log(`KET LUAN mot-cho-khai: ${viPham.length} vi pham`);
process.exit(viPham.length === 0 ? 0 : 1);
```

- [ ] **Step 2: Đối chứng dương** — `node _acceptance/chat-duong-day-ban-chup/rang/mot-cho-khai.mjs` → `KET LUAN mot-cho-khai: 0 vi pham`, mã 0 (sau Task 1–2).

- [ ] **Step 3: Chiều đỏ trên bản chép** — `git archive HEAD | tar -x -C "$(mktemp -d)"` vào thư mục tạm `T`; (a) sửa `T/apps/api/src/lo-trinh/lo-trinh-ban-chup.router.ts` gõ lại `"/lo-trinh/ban-chup"` → `node …/mot-cho-khai.mjs --root T` mã 1, dòng nêu `lo-trinh-ban-chup.router.ts`; (b) đặt `maxBodySize: 100000` trong `T/apps/api/src/create-app.ts` → mã 1, dòng «maxBodySize la so».

- [ ] **Step 4: Commit** — `git commit -m "test(chat-duong-day-ban-chup): thước đường bản chụp và trần khai một chỗ"`

---

### Task 5: Tài liệu API

independent: true · phục vụ E10

**Files:**
- Modify: `docs/api.md` mục «Bản chụp lộ trình: Actions đẩy, CRM giữ bản mới nhất» (thêm hai gạch đầu dòng cuối mục)

- [ ] **Step 1: Viết**

```markdown
- **Trần thân 2 MB chỉ áp riêng đường bản chụp.** `createApp` dựng hai cầu REST trên cùng router:
  `POST /rest/lo-trinh/ban-chup` (khớp đúng đường, `BAN_CHUP_LO_TRINH.duongRest`) đọc thân tới
  `tranThanByte`; mọi đường khác của `/rest` đọc tới `REST_BRIDGE_BODY_LIMIT_BYTES` (100 000 byte,
  đúng mặc định của `trpc-to-openapi`). Thân được đọc trước khi thủ tục kiểm quyền, nên trần không
  nới theo người gửi — người đã đăng nhập cũng nhận 413 khi quá 100 000 byte. Lỗi 413 của hai cầu
  cùng một khuôn.
- **Chỉ onehub đẩy được.** `day.ts` chạy trong GitHub Actions (`GITHUB_ACTIONS=true`) mà
  `GITHUB_REF` khác `refs/heads/onehub` — kể cả bấm «Run workflow» trên một nhánh — thì lượt đỏ,
  in ref đã chạy, không gọi CRM. Chạy ngoài Actions không bị chặn. Bước chặn sống trong kịch bản
  của chính nhánh được chạy: nhánh lấy onehub trước khi bước chặn vào onehub thì không có nó.
```

- [ ] **Step 2: Commit** — `git commit -m "docs(api): trần thân theo đường và luật chỉ onehub đẩy bản chụp"`

---

### Kết S3

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` sạch (việc nhẹ).
- [ ] Đặt `status: implemented` trong `contract.md`, commit, rồi dispatch S4 (qua khoá máy).
