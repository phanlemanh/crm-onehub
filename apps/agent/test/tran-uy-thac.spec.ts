import { describe, expect, it } from "bun:test";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
	buildPendingInputRequest,
	commandTypeFromAuthorization,
} from "@crm/validation/builder-question";
import hook from "../agent/hooks/builder-delegation";
import {
	builderDelegationState,
	type recordBuilderDelegation,
} from "../agent/lib/builder-delegation";
import { builderSessionAttributes } from "../agent/lib/custom-agent-dispatch";
import type { purposeOf } from "../agent/lib/session-purpose";

type HanhDong = Parameters<typeof recordBuilderDelegation>[2][number];
type NguCanhQuyen = Parameters<typeof purposeOf>[0];
type SuKienHook = { data: { turnId: string; actions: readonly HanhDong[] } };

const gocEve = join(
	createRequire(import.meta.url).resolve("eve/package.json"),
	"..",
);
type KhoaNguCanh = { readonly name: string };
type ThungNguCanh = {
	ensure<T>(khoa: KhoaNguCanh, tao: () => T): T;
	set<T>(khoa: KhoaNguCanh, gia: T): T;
};
type KhoLuot = { run<T>(thung: ThungNguCanh, fn: () => T): T };

const duongThung = join(gocEve, "dist/src/context/container.js");
const { ContextContainer } = (await import(duongThung).catch((loi) => {
	throw new Error(
		`bo cuc eve da doi: khong nap duoc ContextContainer tai ${duongThung} (${loi})`,
	);
})) as { ContextContainer: new () => ThungNguCanh };

const KHOA_ALS = Symbol.for("eve.context-storage");
const als = Reflect.get(globalThis, KHOA_ALS) as KhoLuot | undefined;
if (!als) {
	throw new Error(
		`bo cuc eve da doi: khong thay AsyncLocalStorage o ${String(KHOA_ALS)}`,
	);
}
const luot = als;

const trongLuot = <T>(fn: () => T): T => luot.run(new ContextContainer(), fn);

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

const suKien = (
	turnId: string,
	...actions: readonly HanhDong[]
): SuKienHook => ({
	data: { turnId, actions },
});

const handler = hook.events["actions.requested"] as (
	event: SuKienHook,
	ctx: NguCanhQuyen,
) => void;

const chay = (ctx: NguCanhQuyen, event: SuKienHook): void => {
	handler(event, ctx);
};

describe("khong-quyen", () => {
	it("khong-quyen: goi lan hai bi chan", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});

	it("khong-quyen: chieu do — cung bo dung, doi mot truong sang duoc phep, cung chan", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});
});

describe("co-quyen", () => {
	it("co-quyen: goi lan hai bi chan nhu cu", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan", () => {
		trongLuot(() => {
			const ctx = phien({}, true);
			expect(() =>
				chay(ctx, suKien("turn-1", goiBuilder("call-1"))),
			).not.toThrow();
		});
	});
});

describe("lan-mot", () => {
	it("lan-mot: luot khong quyen, goi mot lan thi lot va trang thai ghi dung callId", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(builderDelegationState.get()).toEqual({
				turnId: "turn-1",
				callIds: ["call-1"],
			});
		});
	});

	it("lan-mot: chieu do — them loi goi thu hai khac callId thi chan", () => {
		trongLuot(() => {
			const ctx = phien({}, false);
			chay(ctx, suKien("turn-1", goiBuilder("call-1")));
			expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
				"only once",
			);
		});
	});
});

const cauNem = (authorized: boolean): string =>
	trongLuot(() => {
		const ctx = phien({}, authorized);
		chay(ctx, suKien("turn-1", goiBuilder("call-1")));
		try {
			chay(ctx, suKien("turn-1", goiBuilder("call-2")));
		} catch (loi) {
			return (loi as Error).message;
		}
		throw new Error("tran khong bat: khong co lan nem nao de doc cau");
	});

describe("mot-cau", () => {
	it("mot-cau: cau nem dung nguyen van, khong con chu creation", () => {
		expect(cauNem(false)).toBe(
			"The agent builder can be delegated only once per turn.",
		);
		expect(cauNem(false)).not.toContain("creation");
	});

	it("mot-cau: hai chieu quyen cho cau BANG NHAU", () => {
		expect(cauNem(true)).toBe(cauNem(false));
	});
});

const HAI_CHIEU = [
	{ nhan: "duoc phep", authorized: true },
	{ nhan: "khong duoc phep", authorized: false },
] as const;

describe("lap-callid", () => {
	it("lap-callid: nhan lai dung callId thi khong nem, trang thai khong doi", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				const truoc = builderDelegationState.get();
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(builderDelegationState.get()).toEqual(truoc);
			});
		}
	});

	it("lap-callid: chieu do — doi dung callId sang gia tri khac thi chan, ca hai chieu", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
					"only once",
				);
			});
		}
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang luot moi", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				chay(ctx, suKien("turn-2", goiBuilder("call-2")));
				expect(builderDelegationState.get()).toEqual({
					turnId: "turn-2",
					callIds: ["call-2"],
				});
			});
		}
	});

	it("luot-moi: chieu do — giu nguyen turnId cu thi chan, ca hai chieu", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				chay(ctx, suKien("turn-1", goiBuilder("call-1")));
				expect(() => chay(ctx, suKien("turn-1", goiBuilder("call-2")))).toThrow(
					"only once",
				);
			});
		}
	});
});

const PURPOSES = ["builder", "team-agent", "research"] as const;
const COMMAND_TYPES = ["CREATE_AGENT", "CHAT"] as const;

describe("ngoai-kenh", () => {
	it("ngoai-kenh: ma tran toan phan purpose nhan commandType, sau o", () => {
		const o = PURPOSES.flatMap((purpose) =>
			COMMAND_TYPES.map((commandType) => ({ purpose, commandType })),
		);
		expect(o).toHaveLength(6);
		for (const { purpose, commandType } of o) {
			const goi = () =>
				trongLuot(() => {
					const ctx = phien({ purpose, commandType });
					chay(ctx, suKien("turn-1", goiBuilder("call-1")));
					chay(ctx, suKien("turn-1", goiBuilder("call-2")));
				});
			if (purpose === "builder") {
				expect(goi).toThrow("only once");
			} else {
				expect(goi).not.toThrow();
			}
		}
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi khac callId trong CUNG mot actions thi chan", () => {
		expect(HAI_CHIEU).toHaveLength(2);
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() =>
					chay(
						ctx,
						suKien("turn-1", goiBuilder("call-1"), goiBuilder("call-2")),
					),
				).toThrow("only once");
			});
		}
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		for (const { authorized } of HAI_CHIEU) {
			trongLuot(() => {
				const ctx = phien({}, authorized);
				expect(() =>
					chay(
						ctx,
						suKien("turn-1", goiBuilder("call-1"), {
							kind: "subagent-call",
							callId: "call-2",
							subagentName: "agent_runner",
						}),
					),
				).not.toThrow();
			});
		}
	});
});
