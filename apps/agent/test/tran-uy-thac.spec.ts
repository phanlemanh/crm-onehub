import { describe, expect, it } from "bun:test";
import {
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import type { HookEvent } from "eve/hooks";
import hook from "../agent/hooks/builder-delegation";
import { recordBuilderDelegation } from "../agent/lib/builder-delegation";
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";
import type { purposeOf } from "../agent/lib/session-purpose";

type HanhDong = HookEvent<"actions.requested">["data"]["actions"][number];
type SuKienHook = HookEvent<"actions.requested">;
type NguCanhQuyen = Parameters<typeof purposeOf>[0];
type TrangThai = Parameters<typeof recordBuilderDelegation>[0];

const NGU_CANH_VANG = "No active eve context";
const CAU_TRAN = "The agent builder can be delegated only once per turn.";
const TRONG: TrangThai = { turnId: null, callIds: [] };

const banGhi = (authorized: boolean) =>
	buildPendingInputRequest(
		{
			kind: "question",
			requestId: "req_1",
			prompt: "Chon mot muc",
			options: [],
		},
		authorized,
	);

const phien = (over: Record<string, string> = {}, authorized = true) => ({
	session: {
		auth: {
			current: {
				attributes: {
					...builderSessionAttributes({
						commandType: commandTypeFromAuthorization(banGhi(authorized)),
						message: {
							text: "co",
							resources: [],
							inputResponse: { requestId: "req_1", text: "co" },
						},
						conversationId: "conv_1",
						userId: "user_1",
						submissionId: "sub_1",
						hasTitle: true,
					}),
					...over,
				},
			},
			initiator: null,
		},
	},
});

const goiBuilder = (callId: string): HanhDong => ({
	kind: "subagent-call",
	callId,
	subagentName: "agent_builder",
});

const goiKhac = (callId: string): HanhDong => ({
	kind: "subagent-call",
	callId,
	subagentName: "agent_runner",
});

const suKien = (turnId: string, ...actions: HanhDong[]) =>
	({ data: { turnId, actions } }) as unknown as SuKienHook;

const handler = hook.events["actions.requested"] as (
	event: SuKienHook,
	ctx: NguCanhQuyen,
) => void;

const gacChoQua = (ctx: NguCanhQuyen): boolean => {
	try {
		handler(suKien("turn-1", goiBuilder("call-1")), ctx);
		return false;
	} catch (loi) {
		const cau = (loi as Error).message;
		if (cau.includes(NGU_CANH_VANG)) return true;
		throw loi;
	}
};

const ghi = (state: TrangThai, turnId: string, ...actions: HanhDong[]) =>
	recordBuilderDelegation(state, turnId, actions);

const HAI_CHIEU = [
	{ nhan: "duoc phep", authorized: true },
	{ nhan: "khong duoc phep", authorized: false },
] as const;

describe("khong-quyen", () => {
	it("khong-quyen: hook CHAM chot cung tren luot khong co quyen", () => {
		expect(gacChoQua(phien({}, false))).toBe(true);
	});

	it("khong-quyen: chieu do — cung bo dung, doi mot truong sang duoc phep, gac van cho qua", () => {
		expect(gacChoQua(phien({}, true))).toBe(true);
	});

	it("khong-quyen: loi goi thu hai khac callId trong cung luot thi chan", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(() => ghi(sau, "turn-1", goiBuilder("call-2"))).toThrow("only once");
	});
});

describe("co-quyen", () => {
	it("co-quyen: hook cham chot cung tren luot co quyen, khong hoi quy", () => {
		expect(gacChoQua(phien({}, true))).toBe(true);
	});

	it("co-quyen: goi lan hai bi chan", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(() => ghi(sau, "turn-1", goiBuilder("call-2"))).toThrow("only once");
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan", () => {
		expect(() => ghi(TRONG, "turn-1", goiBuilder("call-1"))).not.toThrow();
	});
});

describe("lan-mot", () => {
	it("lan-mot: gac cho qua o CA HAI chieu quyen, nen duong ra not_authorized con nguyen", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			expect(gacChoQua(phien({}, authorized))).toBe(true);
		}
	});

	it("lan-mot: goi mot lan thi lot va trang thai ghi dung callId", () => {
		expect(ghi(TRONG, "turn-1", goiBuilder("call-1"))).toEqual({
			turnId: "turn-1",
			callIds: ["call-1"],
		});
	});

	it("lan-mot: chieu do — them loi goi thu hai khac callId thi chan", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(() => ghi(sau, "turn-1", goiBuilder("call-2"))).toThrow("only once");
	});
});

describe("lap-callid", () => {
	it("lap-callid: nhan lai dung callId thi khong nem, trang thai khong doi", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(sau).toEqual({ turnId: "turn-1", callIds: ["call-1"] });
		expect(ghi(sau, "turn-1", goiBuilder("call-1"))).toEqual(sau);
	});

	it("lap-callid: chieu do — doi dung callId sang gia tri khac thi chan", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(() => ghi(sau, "turn-1", goiBuilder("call-2"))).toThrow("only once");
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang luot moi", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(ghi(sau, "turn-2", goiBuilder("call-2"))).toEqual({
			turnId: "turn-2",
			callIds: ["call-2"],
		});
	});

	it("luot-moi: chieu do — giu nguyen turnId cu thi chan", () => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		expect(() => ghi(sau, "turn-1", goiBuilder("call-2"))).toThrow("only once");
	});
});

describe("ngoai-kenh", () => {
	it("ngoai-kenh: ma tran toan phan purpose nhan commandType, sau o", () => {
		const PURPOSES = ["builder", "team-agent", "research"] as const;
		const COMMAND_TYPES = ["CREATE_AGENT", "CHAT"] as const;
		const o = PURPOSES.flatMap((purpose) =>
			COMMAND_TYPES.map((commandType) => ({ purpose, commandType })),
		);
		expect(o).toHaveLength(6);
		for (const { purpose, commandType } of o) {
			expect(gacChoQua(phien({ purpose, commandType }))).toBe(
				purpose === "builder",
			);
		}
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi khac callId trong CUNG mot actions thi chan", () => {
		expect(() =>
			ghi(TRONG, "turn-1", goiBuilder("call-1"), goiBuilder("call-2")),
		).toThrow("only once");
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		expect(
			ghi(TRONG, "turn-1", goiBuilder("call-1"), goiKhac("call-2")),
		).toEqual({ turnId: "turn-1", callIds: ["call-1"] });
	});

	it("cung-batch: gac cho qua o CA HAI chieu quyen", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			expect(gacChoQua(phien({}, authorized))).toBe(true);
		}
	});
});

describe("mot-cau", () => {
	const cauNem = (): string => {
		const sau = ghi(TRONG, "turn-1", goiBuilder("call-1"));
		try {
			ghi(sau, "turn-1", goiBuilder("call-2"));
		} catch (loi) {
			return (loi as Error).message;
		}
		throw new Error("tran khong bat: khong co lan nem nao de doc cau");
	};

	it("mot-cau: cau nem dung nguyen van, khong con chu creation", () => {
		expect(cauNem()).toBe(CAU_TRAN);
		expect(cauNem()).not.toContain("creation");
	});

	it("mot-cau: cau ay den duoc CA HAI chieu quyen, vi gac cho qua ca hai", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			expect(gacChoQua(phien({}, authorized))).toBe(true);
		}
		expect(cauNem()).toBe(CAU_TRAN);
	});
});

describe("khong-loi-goi", () => {
	const HINH_DANG_KHONG_GOI = [
		{ nhan: "actions rong", actions: [] as HanhDong[] },
		{ nhan: "chi co subagent khac", actions: [goiKhac("call-1")] },
	] as const;

	const doiSangBuilder = (actions: readonly HanhDong[]): HanhDong[] =>
		actions.map((action) => ({ ...action, subagentName: "agent_builder" }));

	it("khong-loi-goi: su kien khong mang agent_builder thi trang thai khong ghi callId nao", () => {
		expect(HINH_DANG_KHONG_GOI).toHaveLength(2);
		for (const { actions } of HINH_DANG_KHONG_GOI) {
			const sau = ghi(TRONG, "turn-1", ...actions);
			expect(sau).toEqual({ turnId: "turn-1", callIds: [] });
			expect(ghi(sau, "turn-1", ...actions)).toEqual(sau);
		}
	});

	it("khong-loi-goi: chieu do — CUNG fixture, doi subagentName lam trang thai het rong", () => {
		const coLoiGoi = HINH_DANG_KHONG_GOI.filter((h) => h.actions.length > 0);
		expect(coLoiGoi).toHaveLength(1);
		for (const { actions } of coLoiGoi) {
			expect(ghi(TRONG, "turn-1", ...actions).callIds).toEqual([]);
			expect(ghi(TRONG, "turn-1", ...doiSangBuilder(actions)).callIds).toEqual([
				"call-1",
			]);
		}
	});

	it("khong-loi-goi: gac cho qua o CA HAI chieu quyen, nen vung nay that su bi cham", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			expect(gacChoQua(phien({}, authorized))).toBe(true);
		}
	});
});
