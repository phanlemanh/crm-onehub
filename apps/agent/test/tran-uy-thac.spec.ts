import { describe, expect, it } from "bun:test";
import {
	BUILDER_DELEGATION_LIMIT_MESSAGE,
	clearBuilderDelegationStep,
	EMPTY_BUILDER_DELEGATION,
	recordBuilderDelegation,
} from "../agent/lib/builder-delegation";
import {
	type DuLieuHanhDong,
	datSlot,
	duLieu,
	duLieuStep,
	goiBuilder,
	goiKhac,
	type HanhDong,
	layHook,
	phien,
	suKien,
} from "./tran-uy-thac/chuoi-cuong-che";

type TrangThai = Parameters<typeof recordBuilderDelegation>[0];

const hook = await layHook();

const ghi = (state: TrangThai, data: DuLieuHanhDong) =>
	recordBuilderDelegation(state, data);

const xoaStep = (state: TrangThai, turnId: string, stepIndex: number) =>
	clearBuilderDelegationStep(state, duLieuStep(turnId, stepIndex));

const daUyThac = (turnId: string, stepIndex: number, callId: string) =>
	ghi(EMPTY_BUILDER_DELEGATION, duLieu(turnId, stepIndex, goiBuilder(callId)));

describe("step-chay-lai", () => {
	it("step-chay-lai: step khoi dong lai xoa o, nen loi goi moi cua lan chay lai KHONG bi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(sau).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});

		const daXoa = xoaStep(sau, "turn-1", 2);
		expect(daXoa).toEqual({ turnId: "turn-1", stepIndex: null, callIds: [] });
		expect(ghi(daXoa, duLieu("turn-1", 2, goiBuilder("call-b")))).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-b"],
		});
	});

	it("step-chay-lai: chieu do — KHONG co step khoi dong lai thi loi goi thu hai bi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});

	it("step-chay-lai: step KHAC khoi dong thi o van con, nen tran van giu", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(xoaStep(sau, "turn-1", 3)).toEqual(sau);
		expect(() =>
			ghi(xoaStep(sau, "turn-1", 3), duLieu("turn-1", 3, goiBuilder("call-b"))),
		).toThrow("only once");
	});
});

describe("goi-song-song", () => {
	it("goi-song-song: HAI su kien rieng, cung step, callId khac — bi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});

	it("goi-song-song: chieu do — CUNG fixture, dung lai dung callId thi khong chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-1", 2, goiBuilder("call-a")))).toEqual(sau);
	});

	it("goi-song-song: day la hinh dang eve THAT phat — mot loi goi mot su kien, cung toa do step", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});
		expect(() =>
			hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});
});

describe("toa-do-step-khac", () => {
	it("toa-do-step-khac: cung luot, stepIndex KHAC — nem", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 3, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});

	it("toa-do-step-khac: chieu do — cung stepIndex va callId cu thi khong nem", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-1", 2, goiBuilder("call-a")))).toEqual(sau);
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang o moi", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-2", 5, goiBuilder("call-b")))).toEqual({
			turnId: "turn-2",
			stepIndex: 5,
			callIds: ["call-b"],
		});
	});

	it("luot-moi: chieu do — giu nguyen turnId cu va doi stepIndex thi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 5, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("lan-dau", () => {
	it("lan-dau: trang thai rong, mot loi goi — khong nem, ghi dung o", () => {
		expect(daUyThac("turn-1", 2, "call-a")).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});
	});

	it("lan-dau: chieu do — them mot loi goi thu hai khac callId thi nem", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("lan-mot", () => {
	it("lan-mot: loi goi thu nhat tren luot khong co quyen van lot, va ghi dung o", () => {
		expect(daUyThac("turn-9", 7, "call-a")).toEqual({
			turnId: "turn-9",
			stepIndex: 7,
			callIds: ["call-a"],
		});
	});

	it("lan-mot: chieu do — them loi goi thu hai khac callId thi chan", () => {
		const sau = daUyThac("turn-9", 7, "call-a");
		expect(() => ghi(sau, duLieu("turn-9", 8, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("lap-callid", () => {
	it("lap-callid: nhan lai dung callId thi khong nem, trang thai khong doi", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-1", 2, goiBuilder("call-a")))).toEqual(sau);
	});

	it("lap-callid: chieu do — doi dung callId sang gia tri khac thi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi builder trong CUNG mot actions thi chan", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, callIds: ["call-a"] });
	});
});

describe("subagent-khac", () => {
	it("subagent-khac: mot builder mot subagent khac — khong nem, chi ghi callId builder", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, callIds: ["call-a"] });
	});

	it("subagent-khac: chieu do — CUNG fixture, doi dung truong subagentName thi nem", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});
});

describe("khong-loi-goi", () => {
	const HINH_DANG_KHONG_GOI = [
		{ nhan: "actions rong", actions: [] as HanhDong[] },
		{ nhan: "chi co subagent khac", actions: [goiKhac("call-1")] },
	] as const;

	const doiSangBuilder = (actions: readonly HanhDong[]): HanhDong[] =>
		actions.map((action) => ({ ...action, subagentName: "agent_builder" }));

	it("khong-loi-goi: su kien khong mang agent_builder thi khong ghi callId nao", () => {
		expect(HINH_DANG_KHONG_GOI).toHaveLength(2);
		for (const { actions } of HINH_DANG_KHONG_GOI) {
			const sau = ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, ...actions),
			);
			expect(sau).toEqual({
				turnId: "turn-1",
				stepIndex: null,
				callIds: [],
			});
			expect(ghi(sau, duLieu("turn-1", 3, ...actions))).toEqual(sau);
		}
	});

	it("khong-loi-goi: chieu do — CUNG fixture, doi subagentName lam o het rong", () => {
		const coLoiGoi = HINH_DANG_KHONG_GOI.filter((h) => h.actions.length > 0);
		expect(coLoiGoi).toHaveLength(1);
		for (const { actions } of coLoiGoi) {
			expect(
				ghi(EMPTY_BUILDER_DELEGATION, duLieu("turn-1", 2, ...actions)).callIds,
			).toEqual([]);
			expect(
				ghi(
					EMPTY_BUILDER_DELEGATION,
					duLieu("turn-1", 2, ...doiSangBuilder(actions)),
				).callIds,
			).toEqual(["call-1"]);
		}
	});
});

describe("khong-xoa-slot", () => {
	it("khong-xoa-slot: su kien 0 loi goi dung GIUA hai lan uy thac khong xoa o", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});

		hook.hanhDong(suKien(duLieu("turn-1", 3, goiKhac("call-x"))), phien());
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});

		expect(() =>
			hook.hanhDong(suKien(duLieu("turn-1", 4, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});

	it("khong-xoa-slot: chieu do — step 2 khoi dong lai thi o bi xoa va loi goi moi lot", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		hook.stepBatDau({ data: duLieuStep("turn-1", 2) }, phien());
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: null,
			callIds: [],
		});
		expect(() =>
			hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-b"))), phien()),
		).not.toThrow();
	});

	it("khong-xoa-slot: hook that su ghi ben — su kien builder co ca get va update", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		expect(slot.nhatKy).toEqual(["get", "update"]);
	});
});

describe("khong-quyen", () => {
	it("khong-quyen: hook CHAM chot cung tren luot khong co quyen", () => {
		const slot = datSlot();
		hook.hanhDong(
			suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
			phien({}, false),
		);
		expect(slot.nhatKy).toEqual(["get", "update"]);
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});
	});

	it("khong-quyen: loi goi thu hai khac callId trong cung luot thi chan", () => {
		datSlot();
		hook.hanhDong(
			suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
			phien({}, false),
		);
		expect(() =>
			hook.hanhDong(
				suKien(duLieu("turn-1", 2, goiBuilder("call-b"))),
				phien({}, false),
			),
		).toThrow("only once");
	});

	it("khong-quyen: chieu do — CUNG bo dung, doi mot truong sang duoc phep, van chan", () => {
		datSlot();
		hook.hanhDong(
			suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
			phien({}, true),
		);
		expect(() =>
			hook.hanhDong(
				suKien(duLieu("turn-1", 2, goiBuilder("call-b"))),
				phien({}, true),
			),
		).toThrow("only once");
	});
});

describe("co-quyen", () => {
	it("co-quyen: luot co quyen van bi chan o loi goi thu hai", () => {
		datSlot();
		hook.hanhDong(
			suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
			phien({}, true),
		);
		expect(() =>
			hook.hanhDong(
				suKien(duLieu("turn-1", 3, goiBuilder("call-b"))),
				phien({}, true),
			),
		).toThrow("only once");
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan, va trang thai ghi o", () => {
		const slot = datSlot();
		expect(() =>
			hook.hanhDong(
				suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
				phien({}, true),
			),
		).not.toThrow();
		expect(slot.doc()).toEqual({
			turnId: "turn-1",
			stepIndex: 2,
			callIds: ["call-a"],
		});
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
			const slot = datSlot();
			hook.hanhDong(
				suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
				phien({ purpose, commandType }),
			);
			expect(slot.nhatKy.length > 0).toBe(purpose === "builder");
		}
	});

	it("ngoai-kenh: hook step.started cung khong dung phien ngoai kenh builder", () => {
		const slot = datSlot();
		hook.stepBatDau(
			{ data: duLieuStep("turn-1", 2) },
			phien({ purpose: "research" }),
		);
		expect(slot.nhatKy).toEqual([]);
		hook.stepBatDau({ data: duLieuStep("turn-1", 2) }, phien());
		expect(slot.nhatKy).toEqual(["get", "update"]);
	});
});

describe("mot-cau", () => {
	const cauNem = (): string => {
		const sau = daUyThac("turn-1", 2, "call-a");
		try {
			ghi(sau, duLieu("turn-1", 3, goiBuilder("call-b")));
		} catch (loi) {
			return (loi as Error).message;
		}
		throw new Error("tran khong bat: khong co lan nem nao de doc cau");
	};

	it("mot-cau: cau nem BANG DUNG hang dung chung, khong chi chua only once", () => {
		expect(cauNem()).toBe(BUILDER_DELEGATION_LIMIT_MESSAGE);
		expect(BUILDER_DELEGATION_LIMIT_MESSAGE).toBe(
			"The agent builder can be delegated only once per turn.",
		);
	});

	it("mot-cau: chieu do — cau khong con chu creation", () => {
		expect(cauNem()).not.toContain("creation");
	});
});
