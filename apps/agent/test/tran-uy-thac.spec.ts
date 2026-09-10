import { describe, expect, it } from "bun:test";
import {
	BUILDER_DELEGATION_LIMIT_MESSAGE,
	EMPTY_BUILDER_DELEGATION,
	recordBuilderDelegation,
} from "../agent/lib/builder-delegation";
import {
	CHUOI_SONG,
	type DuLieuHanhDong,
	datSlot,
	duLieu,
	goiBuilder,
	goiKhac,
	type HanhDong,
	kiemChuoiCuongChe,
	layHook,
	phien,
	suKien,
} from "./tran-uy-thac/chuoi-cuong-che";

type TrangThai = Parameters<typeof recordBuilderDelegation>[0];

const hook = await layHook();

const ghi = (state: TrangThai, data: DuLieuHanhDong) =>
	recordBuilderDelegation(state, data);

const daUyThac = (turnId: string, stepIndex: number, callId: string) =>
	ghi(EMPTY_BUILDER_DELEGATION, duLieu(turnId, stepIndex, goiBuilder(callId)));

describe("lan-dau", () => {
	it("lan-dau: loi goi thu nhat lot, va ghi dung callId", () => {
		expect(daUyThac("turn-1", 2, "call-a")).toEqual({
			turnId: "turn-1",
			callIds: ["call-a"],
		});
	});

	it("lan-dau: chieu do — them loi goi thu hai khac callId thi nem", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("lan-mot", () => {
	it("lan-mot: loi goi thu nhat tren luot khong co quyen van lot", () => {
		expect(daUyThac("turn-9", 7, "call-a")).toEqual({
			turnId: "turn-9",
			callIds: ["call-a"],
		});
	});

	it("lan-mot: chieu do — loi goi thu hai khac callId thi chan", () => {
		const sau = daUyThac("turn-9", 7, "call-a");
		expect(() => ghi(sau, duLieu("turn-9", 8, goiBuilder("call-b")))).toThrow(
			"only once",
		);
	});
});

describe("lap-callid", () => {
	it("lap-callid: nhan lai DUNG callId thi khong nem, trang thai khong doi", () => {
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

describe("goi-song-song", () => {
	it("goi-song-song: HAI su kien rieng, CUNG step, callId khac — bi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});

	it("goi-song-song: hai su kien rieng, step KHAC, callId khac — cung bi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 5, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});

	it("goi-song-song: chay qua CHINH hook that, khong chi ham thuan", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", callIds: ["call-a"] });
		expect(() =>
			hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});

	it("goi-song-song: chieu do — CUNG fixture, dung lai dung callId thi khong chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-1", 2, goiBuilder("call-a")))).toEqual(sau);
	});
});

describe("gioi-han-chay-lai", () => {
	it("gioi-han-chay-lai: lan chay lai cua mot step VAN bi chan — day la GIOI HAN DA KHAI, khong phai bug moi", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 2, goiBuilder("call-b")))).toThrow(
			BUILDER_DELEGATION_LIMIT_MESSAGE,
		);
	});

	it("gioi-han-chay-lai: chi mot lan chay lai trong CUNG luot moi vuong — luot moi thi khong", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-2", 0, goiBuilder("call-b")))).toEqual({
			turnId: "turn-2",
			callIds: ["call-b"],
		});
	});
});

describe("luot-moi", () => {
	it("luot-moi: turnId khac thi tran mo lai", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(ghi(sau, duLieu("turn-2", 5, goiBuilder("call-b")))).toEqual({
			turnId: "turn-2",
			callIds: ["call-b"],
		});
	});

	it("luot-moi: chieu do — giu nguyen turnId cu thi chan", () => {
		const sau = daUyThac("turn-1", 2, "call-a");
		expect(() => ghi(sau, duLieu("turn-1", 5, goiBuilder("call-b")))).toThrow(
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
		).toEqual({ turnId: "turn-1", callIds: ["call-a"] });
	});
});

describe("subagent-khac", () => {
	it("subagent-khac: mot builder mot subagent khac — chi ghi callId builder", () => {
		expect(
			ghi(
				EMPTY_BUILDER_DELEGATION,
				duLieu("turn-1", 2, goiBuilder("call-a"), goiKhac("call-b")),
			),
		).toEqual({ turnId: "turn-1", callIds: ["call-a"] });
	});

	it("subagent-khac: chieu do — doi dung truong subagentName thi nem", () => {
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
			expect(sau).toEqual({ turnId: "turn-1", callIds: [] });
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
		expect(slot.doc()).toEqual({ turnId: "turn-1", callIds: ["call-a"] });

		hook.hanhDong(suKien(duLieu("turn-1", 3, goiKhac("call-x"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-1", callIds: ["call-a"] });

		expect(() =>
			hook.hanhDong(suKien(duLieu("turn-1", 4, goiBuilder("call-b"))), phien()),
		).toThrow("only once");
	});

	it("khong-xoa-slot: chieu do — su kien 0 loi goi o LUOT MOI thi o ve rong", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		hook.hanhDong(suKien(duLieu("turn-2", 0, goiKhac("call-x"))), phien());
		expect(slot.doc()).toEqual({ turnId: "turn-2", callIds: [] });
	});

	it("khong-xoa-slot: hook that su ghi ben — su kien builder co ca get va update", () => {
		const slot = datSlot();
		hook.hanhDong(suKien(duLieu("turn-1", 2, goiBuilder("call-a"))), phien());
		expect(slot.nhatKy).toEqual(["get", "update"]);
	});
});

describe("chuoi-cuong-che", () => {
	it("chuoi-cuong-che: hook that lai tron chuoi — ghi ben roi chan lan hai", () => {
		expect(kiemChuoiCuongChe(hook)).toEqual(CHUOI_SONG);
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
		expect(slot.doc()).toEqual({ turnId: "turn-1", callIds: ["call-a"] });
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

	it("co-quyen: chieu do — goi dung mot lan thi KHONG chan", () => {
		const slot = datSlot();
		expect(() =>
			hook.hanhDong(
				suKien(duLieu("turn-1", 2, goiBuilder("call-a"))),
				phien({}, true),
			),
		).not.toThrow();
		expect(slot.doc()).toEqual({ turnId: "turn-1", callIds: ["call-a"] });
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
