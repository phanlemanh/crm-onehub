import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { currentTree, treeSlug } from "@crm/db/measure-database";
import { APP, khoiDongEve, type MayEve } from "./support/khoi-dong";

let may: MayEve;
let mayCu: MayEve | null = null;
const GOC_KHO = join(APP, "..", "..");
const GOC_AGENT_CU = join(APP, "..", "agent");
const CAY_KHAC = "cay-khac";
const CHAY_AGENT_CU =
	existsSync(join(GOC_AGENT_CU, "agent", "agent.ts")) &&
	process.env.SOKR_KHONG_CHAY_AGENT_CU !== "1";

if (!CHAY_AGENT_CU) {
	console.warn(
		"bo qua ca chay canh apps/agent: thieu apps/agent/agent/agent.ts hoac SOKR_KHONG_CHAY_AGENT_CU=1",
	);
}

beforeAll(async () => {
	may = await khoiDongEve();
	if (CHAY_AGENT_CU) mayCu = await khoiDongEve({ goc: GOC_AGENT_CU });
}, 300_000);

afterAll(async () => {
	await may?.dung();
	await mayCu?.dung();
});

describe("app-rieng", () => {
	test("khởi động trên cổng tự do, không dùng 2100, có .eve riêng", async () => {
		expect(may.cong).not.toBe(2100);
		expect(existsSync(join(APP, ".eve"))).toBe(true);
	});

	test("GET /health trả dấu mốc cây của chính cây này (sai cây → mã 2)", async () => {
		const r = await fetch(`${may.url}/health`);
		expect(r.status).toBe(200);
		const than = (await r.json()) as { cay?: string | null };
		const cayNay = treeSlug(currentTree(GOC_KHO));
		if (than.cay !== cayNay) {
			console.error(`sai cay: may tra ${than.cay}, cay nay la ${cayNay}`);
			process.exitCode = 2;
			throw new Error("sai cay");
		}
	});

	test.skipIf(!CHAY_AGENT_CU)(
		"chạy cạnh apps/agent: hai tiến trình, hai cổng, /eve/v1/health cả hai xanh",
		async () => {
			if (!mayCu) throw new Error("apps/agent khong khoi dong");
			expect(mayCu.cong).not.toBe(may.cong);
			const [a, b] = await Promise.all([
				fetch(`${may.url}/eve/v1/health`),
				fetch(`${mayCu.url}/eve/v1/health`),
			]);
			expect([a.status, b.status]).toEqual([200, 200]);
			const cu = await fetch(`${mayCu.url}/health`);
			expect(cu.status).toBe(404);
		},
	);

	test("máy dò còn sống: eve của «cây khác» trả dấu mốc khác cây này (một gốc app chỉ một eve dev, nên dừng máy chính trước)", async () => {
		await may.dung();
		const khac = await khoiDongEve({ env: { PHIEN_DO_TEN_CAY: CAY_KHAC } });
		try {
			const than = (await fetch(`${khac.url}/health`).then((r) =>
				r.json(),
			)) as {
				cay?: string | null;
			};
			expect(than.cay).toBe(treeSlug(CAY_KHAC));
			expect(than.cay).not.toBe(treeSlug(currentTree(GOC_KHO)));
		} finally {
			await khac.dung();
		}
	}, 180_000);
});
