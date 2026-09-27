import { describe, expect, test } from "bun:test";
import {
	ketQuaDoiSoat,
	mocBaoTran,
	type NguonBuoc,
	NHOM_CUA_TINH_NANG,
	TINH_NANG,
	type TinhNang,
	tinhNangCua,
} from "../src/ai-chi-phi";
import { KENH_TAC_TU, SESSION_PURPOSES } from "../src/phien-tac-tu";

const PHIEN_CON = [
	{ subagent: null, okrViec: null },
	{ subagent: "tro_ly_okr", okrViec: "de-xuat" },
	{ subagent: "tro_ly_okr", okrViec: "tom-tat-tuan" },
	{ subagent: "agent_runner", okrViec: null },
	{ subagent: "agent_builder", okrViec: null },
] as const;

const VIEC_GOC: Record<string, TinhNang> = {
	builder: "crm.dung-tac-nhan",
	"team-agent": "crm.tac-nhan",
	research: "crm.nghien-cuu",
	zalo: "zalo.hoi-crm",
	okr: "okr.chuyen-tiep",
};

function kyVong(
	purpose: string,
	kenh: string,
	con: (typeof PHIEN_CON)[number],
): TinhNang | undefined {
	if (con.subagent === "tro_ly_okr")
		return con.okrViec === "tom-tat-tuan" ? "okr.tom-tat" : "okr.de-xuat";
	if (con.subagent === "agent_runner") return "crm.tac-nhan";
	if (con.subagent === "agent_builder") return "crm.dung-tac-nhan";
	if (kenh === "eve") return "crm.hoi-dap";
	if (kenh === "zalo") return "zalo.hoi-crm";
	return VIEC_GOC[purpose];
}

function kiemMaTran(purposes: readonly string[]) {
	const o: { nguon: NguonBuoc; mong: TinhNang }[] = [];
	for (const purpose of purposes) {
		for (const kenh of KENH_TAC_TU) {
			for (const con of PHIEN_CON) {
				const mong = kyVong(purpose, kenh, con);
				if (!mong) throw new Error(`thieu dong suy viec: ${purpose}`);
				o.push({
					nguon: {
						kenh,
						purpose,
						subagent: con.subagent,
						okrViec: con.okrViec,
					},
					mong,
				});
			}
		}
	}
	return o;
}

describe("ma-tran-viec", () => {
	test("mọi mục đích phiên × kênh × phiên con có đúng một việc có tên", () => {
		const o = kiemMaTran(SESSION_PURPOSES);
		expect(o.length).toBe(
			SESSION_PURPOSES.length * KENH_TAC_TU.length * PHIEN_CON.length,
		);
		const lech = o
			.map(({ nguon, mong }) => ({ nguon, mong, that: tinhNangCua(nguon) }))
			.filter((x) => x.that !== x.mong);
		expect(lech).toEqual([]);
		expect(o.filter(({ nguon }) => tinhNangCua(nguon) === "khac")).toEqual([]);
	});

	test("thêm một mục đích chưa có dòng suy việc thì bảng kỳ vọng đỏ có tên", () => {
		expect(() => kiemMaTran([...SESSION_PURPOSES, "thu-nghiem"])).toThrow(
			"thieu dong suy viec: thu-nghiem",
		);
	});

	test("phiên con lạ và mục đích lạ rơi vào khac", () => {
		expect(
			tinhNangCua({
				kenh: "crm",
				purpose: "research",
				subagent: "la",
				okrViec: null,
			}),
		).toBe("khac");
		expect(
			tinhNangCua({
				kenh: "crm",
				purpose: "la",
				subagent: null,
				okrViec: null,
			}),
		).toBe("khac");
	});

	test("mọi việc có một nhóm trên màn", () => {
		expect(Object.keys(NHOM_CUA_TINH_NANG).sort()).toEqual(
			[...TINH_NANG].sort(),
		);
	});
});

describe("moc-bao-tran", () => {
	test("biên 80 và 100, trần 0", () => {
		expect([
			mocBaoTran(7.19, 9),
			mocBaoTran(7.2, 9),
			mocBaoTran(8.99, 9),
			mocBaoTran(9, 9),
			mocBaoTran(0, 0),
		]).toEqual([0, 80, 80, 100, 100]);
	});
});

describe("doi-soat", () => {
	test("khớp trong 10%, lệch ngoài 10%, biên 10% là khớp", () => {
		expect(ketQuaDoiSoat(1, 1.08)).toEqual({
			ketQua: "khop",
			lechPhanTram: 7.4,
		});
		expect(ketQuaDoiSoat(1, 1.12)).toEqual({
			ketQua: "lech",
			lechPhanTram: 10.7,
		});
		expect(ketQuaDoiSoat(0.9, 1).ketQua).toBe("khop");
		expect(ketQuaDoiSoat(0, 0)).toEqual({ ketQua: "khop", lechPhanTram: 0 });
	});
});
