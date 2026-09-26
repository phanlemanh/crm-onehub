import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { z } from "zod";

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const TEN_GOI = "@better-auth/api-key";
const NANG_KHONG_VA =
	"nâng @better-auth/api-key mà chưa làm lại bản vá khoa-api-ghi-thua";
const PHUT_MS = 60 * 1000;
const LUOT = 3;

const hangKhoa = z.object({ id: z.string(), requestCount: z.number() });
type TuyChon = NonNullable<Parameters<typeof apiKey>[0]>;

async function dung(opts: TuyChon) {
	const kho = {
		user: [] as object[],
		session: [] as object[],
		account: [] as object[],
		verification: [] as object[],
		apikey: [] as object[],
	};
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
	const khoa = await auth.api.createApiKey({
		body: { name: "thu", userId: user.id },
	});
	const goi = () =>
		auth.api.getSession({
			headers: new Headers({ "x-api-key": khoa.key }),
		});
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

const LOCK_LECH = "bun.lock lệch patchedDependencies của package.json";

function khoaVaTrongLock(lock: string): Record<string, string> {
	const khoi = lock.match(/"patchedDependencies":\s*\{([^}]*)\}/)?.[1] ?? "";
	return Object.fromEntries(
		[...khoi.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
	);
}

function lockKhop(goc: Record<string, string>, lock: string): void {
	const trongLock = khoaVaTrongLock(lock);
	if (JSON.stringify(trongLock) !== JSON.stringify(goc)) {
		throw new Error(
			`${LOCK_LECH}: package.json ${JSON.stringify(goc)}, bun.lock ${JSON.stringify(trongLock)}`,
		);
	}
}

function banVaKhop(daCai: string, khoaVa: string[]): void {
	const khop = khoaVa.filter((k) => k.startsWith(`${TEN_GOI}@`));
	if (khop.length !== 1 || khop[0] !== `${TEN_GOI}@${daCai}`) {
		throw new Error(
			`${NANG_KHONG_VA}: đã cài ${daCai}, bản vá ${khop.join(", ") || "không có"}`,
		);
	}
}

describe("khoa-api-ghi-thua thu vien", () => {
	test("hai-chieu-thu-vien: vang tuy chon ghi 2 lan moi luot, co tuy chon chi ghi luot dau", async () => {
		const goc = await dung({ rateLimit: { enabled: false } });
		expect(
			await goc.demQuaLuot(LUOT),
			"ban goc phai ghi 2 lan moi luot",
		).toEqual([2, 2, 2]);
		const va = await dung({
			rateLimit: { enabled: false },
			lastRequestUpdateIntervalMs: PHUT_MS,
		});
		expect(
			await va.demQuaLuot(LUOT),
			"co tuy chon: chi luot dau ghi lastRequest",
		).toEqual([1, 0, 0]);
		const khong = await dung({
			rateLimit: { enabled: false },
			lastRequestUpdateIntervalMs: 0,
		});
		expect(
			await khong.demQuaLuot(LUOT),
			"tuy chon 0 phai ghi moi luot",
		).toEqual([1, 1, 1]);
	});

	test("rate-limit-bat-van-dem: rate-limit bat van dem va van chan luot thu ba", async () => {
		const { goi, kho, khoaId } = await dung({
			rateLimit: { enabled: true, maxRequests: 2, timeWindow: PHUT_MS },
			lastRequestUpdateIntervalMs: PHUT_MS,
		});
		expect(await goi(), "luot 1 phai hop le").not.toBeNull();
		expect(await goi(), "luot 2 phai hop le").not.toBeNull();
		const loi = await goi().then(
			() => null,
			(e: { body?: { code?: string } }) => e,
		);
		expect(loi?.body?.code, "luot 3 phai bi chan RATE_LIMITED").toBe(
			"RATE_LIMITED",
		);
		const hang = hangKhoa
			.array()
			.parse(kho.apikey)
			.find((h) => h.id === khoaId);
		expect(hang?.requestCount, "requestCount phai bang 2").toBe(2);
	});

	test("chong-troi-ban-va: phien ban da cai khop khoa ban va va ma da cai co tuy chon", () => {
		const duongMa = Bun.resolveSync(TEN_GOI, import.meta.dir);
		const goiDaCai = JSON.parse(
			readFileSync(join(dirname(duongMa), "..", "package.json"), "utf8"),
		) as { version: string };
		const goc = JSON.parse(
			readFileSync(join(GOC_KHO, "package.json"), "utf8"),
		) as { patchedDependencies?: Record<string, string> };
		const vaTheo = goc.patchedDependencies ?? {};
		banVaKhop(goiDaCai.version, Object.keys(vaTheo));
		const tepVa = vaTheo[`${TEN_GOI}@${goiDaCai.version}`] ?? "";
		expect(
			readFileSync(join(GOC_KHO, tepVa), "utf8").length,
			"tep va rong",
		).toBeGreaterThan(0);
		const lock = readFileSync(join(GOC_KHO, "bun.lock"), "utf8");
		lockKhop(vaTheo, lock);
		expect(
			() =>
				lockKhop(
					vaTheo,
					lock.replace(/"patchedDependencies":\s*\{[^}]*\},?/, ""),
				),
			"bun.lock mat muc patchedDependencies phai do",
		).toThrow(LOCK_LECH);
		expect(readFileSync(duongMa, "utf8"), "ma da cai chua co ban va").toContain(
			"lastRequestUpdateIntervalMs",
		);
		expect(
			() => banVaKhop("1.6.26", Object.keys(vaTheo)),
			"phien ban lech phai do",
		).toThrow(NANG_KHONG_VA);
	});
});
