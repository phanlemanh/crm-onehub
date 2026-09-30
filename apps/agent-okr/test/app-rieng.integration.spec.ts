import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { dauMocCay } from "../agent/lib/cay";
import { APP, khoiDongEve, type MayEve } from "./support/khoi-dong";

let may: MayEve;
let mayCu: MayEve | null = null;
const GOC_AGENT_CU = join(APP, "..", "agent");

beforeAll(async () => {
	may = await khoiDongEve();
	if (
		existsSync(join(GOC_AGENT_CU, "agent", "agent.ts")) &&
		process.env.SOKR_KHONG_CHAY_AGENT_CU !== "1"
	) {
		mayCu = await khoiDongEve({ goc: GOC_AGENT_CU });
	}
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
		const than = (await r.json()) as { cay?: string };
		if (than.cay !== dauMocCay()) {
			console.error(`sai cay: may tra ${than.cay}, cay nay la ${dauMocCay()}`);
			process.exitCode = 2;
			throw new Error("sai cay");
		}
	});

	test("chạy cạnh apps/agent: hai tiến trình, hai cổng, /eve/v1/health cả hai xanh", async () => {
		if (!mayCu) return;
		expect(mayCu.cong).not.toBe(may.cong);
		const [a, b] = await Promise.all([
			fetch(`${may.url}/eve/v1/health`),
			fetch(`${mayCu.url}/eve/v1/health`),
		]);
		expect([a.status, b.status]).toEqual([200, 200]);
		const cu = await fetch(`${mayCu.url}/health`);
		expect(cu.status).toBe(404);
	});
});
