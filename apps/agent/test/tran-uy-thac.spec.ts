import { describe, expect, it } from "bun:test";
import {
	BUILDER_DELEGATION_LIMIT_MESSAGE,
	EMPTY_BUILDER_DELEGATION,
	recordBuilderDelegation,
} from "../agent/lib/builder-delegation";
import {
	type DuLieuHook,
	datSlot,
	duLieu,
	goiBuilder,
	goiKhac,
	type HanhDong,
	layHandler,
	phien,
	suKien,
} from "./tran-uy-thac/chuoi-cuong-che";

type TrangThai = Parameters<typeof recordBuilderDelegation>[0];

const handler = await layHandler();

const ghi = (state: TrangThai, data: DuLieuHook) =>
	recordBuilderDelegation(state, data);

const DA_GHI: TrangThai = { turnId: "turn-1", stepIndex: 2, sequence: 0 };

describe("toa-do-chay-lai", () => {
	it("toa-do-chay-lai: cung toa do, callId KHAC — khong nem, trang thai khong doi", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(
			DA_GHI,
		);
	});

	it("toa-do-chay-lai: chieu do — CUNG fixture, doi dung truong sequence thi nem", () => {
		expect(() =>
			ghi(DA_GHI, duLieu("turn-1", 2, 1, goiBuilder("call-b"))),
		).toThrow(BUILDER_DELEGATION_LIMIT_MESSAGE);
	});
});

describe("toa-do-rai-rac", () => {
	it("toa-do-rai-rac: cung step, sequence KHAC — nem", () => {
		expect(() =>
			ghi(DA_GHI, duLieu("turn-1", 2, 1, goiBuilder("call-b"))),
		).toThrow("only once");
	});

	it("toa-do-rai-rac: chieu do — dua sequence ve bang lan truoc thi khong nem", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(
			DA_GHI,
		);
	});
});

describe("toa-do-step-khac", () => {
	it("toa-do-step-khac: cung luot, stepIndex KHAC — nem", () => {
		expect(() =>
			ghi(DA_GHI, duLieu("turn-1", 3, 0, goiBuilder("call-b"))),
		).toThrow("only once");
	});

	it("toa-do-step-khac: chieu do — dua CA HAI truong ve dung toa do da ghi thi khong nem", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-b")))).toEqual(
			DA_GHI,
		);
	});
});

describe("lan-dau", () => {
	it("lan-dau: trang thai rong, mot loi goi — khong nem, ghi dung ca ba truong", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("lan-dau: chieu do — them mot su kien thu hai khac toa do thi nem", () => {
		const sau = ghi(
			EMPTY_BUILDER_DELEGATION,
			duLieu("turn-1", 2, 0, goiBuilder("call-a")),
		);
		expect(() =>
			ghi(sau, duLieu("turn-1", 3, 0, goiBuilder("call-b"))),
		).toThrow("only once");
	});
});

describe("lan-mot", () => {
	it("lan-mot: loi goi thu nhat tren luot khong co quyen van lot, va ghi dung toa do", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-9", 7, 4, goiBuilder("call-a")),
			),
		).toEqual({ turnId: "turn-9", stepIndex: 7, sequence: 4 });
	});

	it("lan-mot: chieu do — them loi goi thu hai khac toa do thi chan", () => {
		const sau = ghi(
			EMPTY_BUILDER_DELEGATION,
			duLieu("turn-9", 7, 4, goiBuilder("call-a")),
		);
		expect(() =>
			ghi(sau, duLieu("turn-9", 8, 0, goiBuilder("call-b"))),
		).toThrow("only once");
	});
});

describe("subagent-khac", () => {
	it("subagent-khac: mot builder mot subagent khac — khong nem, ghi toa do su kien", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("subagent-khac: chieu do — CUNG fixture, doi dung truong subagentName thi nem", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});
});

describe("lap-callid", () => {
	it("lap-callid: nhan lai cung toa do thi khong nem, trang thai khong doi", () => {
		expect(ghi(DA_GHI, duLieu("turn-1", 2, 0, goiBuilder("call-a")))).toEqual(
			DA_GHI,
		);
	});

	it("lap-callid: chieu do — doi dung truong stepIndex thi chan", () => {
		expect(() =>
			ghi(DA_GHI, duLieu("turn-1", 3, 0, goiBuilder("call-a"))),
		).toThrow("only once");
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai, trang thai mang toa do moi", () => {
		expect(ghi(DA_GHI, duLieu("turn-2", 5, 3, goiBuilder("call-b")))).toEqual({
			turnId: "turn-2",
			stepIndex: 5,
			sequence: 3,
		});
	});

	it("luot-moi: chieu do — giu nguyen turnId cu va doi stepIndex thi chan", () => {
		expect(() =>
			ghi(DA_GHI, duLieu("turn-1", 5, 3, goiBuilder("call-b"))),
		).toThrow("only once");
	});
});

describe("cung-batch", () => {
	it("cung-batch: hai loi goi builder trong CUNG mot actions thi chan", () => {
		expect(() =>
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiBuilder("call-b")),
			),
		).toThrow("only once");
	});

	it("cung-batch: chieu do — loi goi thu hai toi subagent KHAC thi khong chan", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});
});

describe("khong-loi-goi", () => {
	const HINH_DANG_KHONG_GOI = [
		{ nhan: "actions rong", actions: [] as HanhDong[] },
		{ nhan: "chi co subagent khac", actions: [goiKhac("call-1")] },
	] as const;

	const doiSangBuilder = (actions: readonly HanhDong[]): HanhDong[] =>
		actions.map((action) => ({ ...action, subagentName: "agent_builder" }));

	it("khong-loi-goi: su kien khong mang agent_builder thi khong ghi toa do nao", () => {
		expect(HINH_DANG_KHONG_GOI).toHaveLength(2);
		for (const { actions } of HINH_DANG_KHONG_GOI) {
			const sau = ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, 0, ...actions),
			);
			expect(sau).toEqual({
				turnId: "turn-1",
				stepIndex: null,
				sequence: null,
			});
			expect(ghi(sau, duLieu("turn-1", 3, 0, ...actions))).toEqual({
				turnId: "turn-1",
				stepIndex: null,
				sequence: null,
			});
		}
	});

	it("khong-loi-goi: chieu do — CUNG fixture, doi subagentName lam toa do het rong", () => {
		const coLoiGoi = HINH_DANG_KHONG_GOI.filter((h) => h.actions.length > 0);
		expect(coLoiGoi).toHaveLength(1);
		for (const { actions } of coLoiGoi) {
			expect(
				ghi(EMPTY_BUILDER_DELEGATION, duLieu("turn-1", 2, 0, ...actions)),
			).toEqual({ turnId: "turn-1", stepIndex: null, sequence: null });
			expect(
				ghi(
					EMPTY_BUILDER_DELEGATION,
					duLieu("turn-1", 2, 0, ...doiSangBuilder(actions)),
				),
			).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
		}
	});
});

describe("mot-cau", () => {
	const cauNem = (): string => {
		try {
			ghi(DA_GHI, duLieu("turn-1", 3, 0, goiBuilder("call-b")));
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

describe("khong-xoa-slot", () => {
	it("khong-xoa-slot: su kien 0 loi goi dung GIUA hai lan uy thac khong xoa toa do", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });

		handler(suKien(duLieu("turn-1", 3, 0, goiKhac("call-x"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });

		expect(() =>
			handler(suKien(duLieu("turn-1", 4, 0, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});

	it("khong-xoa-slot: chieu do — lan chay lai cua CHINH step da ghi thi khong nem", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		handler(suKien(duLieu("turn-1", 3, 0, goiKhac("call-x"))), phien());
		expect(() =>
			handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-b"))), phien()),
		).not.toThrow();
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("khong-xoa-slot: hook that su ghi ben — su kien builder co ca get va update", () => {
		const slot = datSlot();
		handler(suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))), phien());
		expect(slot.nhatKy).toEqual(["get", "update"]);
	});
});

describe("khong-quyen", () => {
	it("khong-quyen: hook CHAM chot cung tren luot khong co quyen", () => {
		const slot = datSlot();
		handler(
			suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
			phien({}, false),
		);
		expect(slot.nhatKy).toEqual(["get", "update"]);
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
	});

	it("khong-quyen: loi goi thu hai khac toa do trong cung luot thi chan", () => {
		datSlot();
		handler(
			suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
			phien({}, false),
		);
		expect(() =>
			handler(
				suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))),
				phien({}, false),
			),
		).toThrow("only once");
	});

	it("khong-quyen: chieu do — CUNG bo dung, doi mot truong sang duoc phep, van chan", () => {
		datSlot();
		handler(
			suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
			phien({}, true),
		);
		expect(() =>
			handler(
				suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))),
				phien({}, true),
			),
		).toThrow("only once");
	});
});

describe("co-quyen", () => {
	it("co-quyen: luot co quyen van bi chan o loi goi thu hai", () => {
		datSlot();
		handler(
			suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
			phien({}, true),
		);
		expect(() =>
			handler(
				suKien(duLieu("turn-1", 3, 0, goiBuilder("call-b"))),
				phien({}, true),
			),
		).toThrow("only once");
	});

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan, va trang thai ghi toa do", () => {
		const slot = datSlot();
		expect(() =>
			handler(
				suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
				phien({}, true),
			),
		).not.toThrow();
		expect(slot.doc()).toEqual({ turnId: "turn-1", stepIndex: 2, sequence: 0 });
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
			handler(
				suKien(duLieu("turn-1", 2, 0, goiBuilder("call-a"))),
				phien({ purpose, commandType }),
			);
			expect(slot.nhatKy.length > 0).toBe(purpose === "builder");
		}
	});
});
