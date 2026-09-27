import { describe, expect, test } from "bun:test";
import hook from "../agent/hooks/okr-uy-quyen";
import { LOI_UY_QUYEN, quyetUyQuyen } from "../agent/lib/okr/uy-quyen";
import { trongNguCanhEve } from "./support/eve-ngu-canh";

type HanhDong = {
	kind: string;
	callId: string;
	subagentName?: string;
	toolName?: string;
};

const troLy = (callId: string): HanhDong => ({
	kind: "subagent-call",
	callId,
	subagentName: "tro_ly_okr",
});
const cong = (toolName: string, callId: string): HanhDong => ({
	kind: "tool-call",
	callId,
	toolName,
});
const con = (subagentName: string, callId: string): HanhDong => ({
	kind: "subagent-call",
	callId,
	subagentName,
});

function ctx(purpose: string) {
	return {
		agent: { name: "crm" },
		channel: { kind: "crm" },
		session: {
			id: `ses-${purpose}`,
			auth: { current: { attributes: { purpose } }, initiator: null },
		},
	};
}

async function chay(purpose: string, loat: HanhDong[][]): Promise<string> {
	return trongNguCanhEve(async () => {
		const moc = hook.events["actions.requested"] as unknown as (
			e: unknown,
			c: unknown,
		) => void;
		try {
			for (const [i, actions] of loat.entries()) {
				moc(
					{
						type: "actions.requested",
						data: { actions, turnId: "turn_1", stepIndex: i },
					},
					ctx(purpose),
				);
			}
			return "cho";
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	});
}

describe("okr-uy-quyen", () => {
	test("ma trận viết trước: mục đích × hành động", async () => {
		const o: [string, string, HanhDong[][], string][] = [
			[
				"okr",
				"search_crm",
				[[cong("search_crm", "a")]],
				LOI_UY_QUYEN.khacTroLy,
			],
			["okr", "web_fetch", [[cong("web_fetch", "a")]], LOI_UY_QUYEN.khacTroLy],
			[
				"okr",
				"agent_runner",
				[[con("agent_runner", "a")]],
				LOI_UY_QUYEN.khacTroLy,
			],
			["okr", "tro_ly_okr lan 1", [[troLy("a")]], "cho"],
			[
				"okr",
				"tro_ly_okr lan 2",
				[[troLy("a")], [troLy("b")]],
				LOI_UY_QUYEN.lanHai,
			],
			[
				"okr",
				"hai lan mot su kien",
				[[troLy("a"), troLy("b")]],
				LOI_UY_QUYEN.lanHai,
			],
			["okr", "goi lai cung callId", [[troLy("a")], [troLy("a")]], "cho"],
			["research", "tro_ly_okr", [[troLy("a")]], LOI_UY_QUYEN.ngoaiOkr],
			["zalo", "tro_ly_okr", [[troLy("a")]], LOI_UY_QUYEN.ngoaiOkr],
			["builder", "tro_ly_okr", [[troLy("a")]], LOI_UY_QUYEN.ngoaiOkr],
			["team-agent", "tro_ly_okr", [[troLy("a")]], LOI_UY_QUYEN.ngoaiOkr],
			["research", "search_crm", [[cong("search_crm", "a")]], "cho"],
		];
		const ra: [string, string, string][] = [];
		for (const [purpose, nhan, loat] of o)
			ra.push([purpose, nhan, await chay(purpose, loat)]);
		expect(ra).toEqual(o.map(([p, n, , m]) => [p, n, m]));
		expect(ra.length).toBe(12);
	});

	test("thông điệp lỗi là hằng, không mang chữ của đầu vào", () => {
		const r = quyetUyQuyen("okr", [], [cong("DAU-OKR-4417", "x")]);
		expect(r).toEqual({ cho: false, loi: LOI_UY_QUYEN.khacTroLy });
		expect(JSON.stringify(r)).not.toContain("DAU-OKR-4417");
	});
});
