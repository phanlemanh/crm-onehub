import { describe, expect, it } from "bun:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import goc from "../agent/agent";
import { SESSION_LIMITS } from "../agent/lib/dispatch-config";
import boDung from "../agent/subagents/agent_builder/agent";
import boChay from "../agent/subagents/agent_runner/agent";

const GOC_APP = join(dirname(fileURLToPath(import.meta.url)), "..");
const NGAY_MS = 24 * 60 * 60 * 1000;
const SO_VIET_TAY = /TokensPerSession:\s*\d/;

export function soHanMucViet(nguon: string, ten: string): string[] {
	return SO_VIET_TAY.test(nguon) ? [ten] : [];
}

describe("han-muc", () => {
	const VAI = [
		{
			ten: "agent_builder",
			agent: boDung,
			o: SESSION_LIMITS.builder,
			vao: 500_000,
			ra: 128_000,
			hetGio: NGAY_MS,
		},
		{
			ten: "goc",
			agent: goc,
			o: SESSION_LIMITS.root,
			vao: 500_000,
			ra: 50_000,
			hetGio: 30 * NGAY_MS,
		},
		{
			ten: "agent_runner",
			agent: boChay,
			o: SESSION_LIMITS.runner,
			vao: 500_000,
			ra: 40_000,
			hetGio: NGAY_MS,
		},
	] as const;

	for (const vai of VAI) {
		it(`han-muc: ${vai.ten} maxInputTokensPerSession`, () => {
			expect(
				vai.agent.limits?.maxInputTokensPerSession,
				`${vai.ten} maxInputTokensPerSession`,
			).toBe(vai.vao);
		});

		it(`han-muc: ${vai.ten} maxOutputTokensPerSession`, () => {
			expect(
				vai.agent.limits?.maxOutputTokensPerSession,
				`${vai.ten} maxOutputTokensPerSession`,
			).toBe(vai.ra);
		});

		it(`han-muc: ${vai.ten} doc dung o SESSION_LIMITS`, () => {
			expect(vai.agent.limits).toEqual(vai.o);
			expect(vai.o.sessionTimeoutMs).toBe(vai.hetGio);
		});
	}

	it("han-muc: khong agent.ts nao viet so han muc ngay trong tep", async () => {
		const tep = [
			"agent/agent.ts",
			...Array.from(
				new Bun.Glob("agent/subagents/*/agent.ts").scanSync({ cwd: GOC_APP }),
			),
		].sort();
		expect(tep).toContain("agent/subagents/agent_builder/agent.ts");
		expect(tep).toContain("agent/subagents/agent_runner/agent.ts");

		const viPham: string[] = [];
		for (const ten of tep) {
			const nguon = await Bun.file(join(GOC_APP, ten)).text();
			viPham.push(...soHanMucViet(nguon, ten));
		}
		expect(viPham).toEqual([]);
	});

	it("han-muc: doi chung am — so viet tay bi bat", () => {
		expect(soHanMucViet("maxOutputTokensPerSession: 10_000", "mau")).toEqual([
			"mau",
		]);
		expect(
			soHanMucViet("maxOutputTokensPerSession: SESSION_LIMITS", "mau"),
		).toEqual([]);
	});
});
