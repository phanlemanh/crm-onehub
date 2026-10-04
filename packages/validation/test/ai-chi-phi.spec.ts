import { describe, expect, test } from "bun:test";
import {
	ketQuaDoiSoat,
	mocBaoTran,
	type NguonBuoc,
	NHOM_CUA_TINH_NANG,
	TINH_NANG,
	TINH_NANG_TRO_LY_OKR,
	type TinhNang,
	tinhNangCua,
} from "../src/ai-chi-phi";
import { KENH_TAC_TU, SESSION_PURPOSES } from "../src/phien-tac-tu";

const PHIEN_CON = [
	{ ma: "-", subagent: null, okrViec: null },
	{ ma: "tro_ly_okr/de-xuat", subagent: "tro_ly_okr", okrViec: "de-xuat" },
	{
		ma: "tro_ly_okr/tom-tat-tuan",
		subagent: "tro_ly_okr",
		okrViec: "tom-tat-tuan",
	},
	{ ma: "agent_runner", subagent: "agent_runner", okrViec: null },
	{ ma: "agent_builder", subagent: "agent_builder", okrViec: null },
	{ ma: "tro_ly_kho", subagent: "tro_ly_kho", okrViec: null },
] as const;

const BANG = new Map<string, TinhNang>([
	["crm|builder|-", "crm.dung-tac-nhan"],
	["crm|team-agent|-", "crm.tac-nhan"],
	["crm|research|-", "crm.nghien-cuu"],
	["crm|okr|-", "okr.chuyen-tiep"],
	["eve|research|-", "crm.hoi-dap"],
	["zalo|zalo|-", "zalo.hoi-crm"],
	["crm|okr|tro_ly_okr/de-xuat", "okr.de-xuat"],
	["crm|okr|tro_ly_okr/tom-tat-tuan", "okr.tom-tat"],
	["crm|team-agent|agent_runner", "crm.tac-nhan"],
	["crm|builder|agent_builder", "crm.dung-tac-nhan"],
	["crm|may-soan|-", "tai-lieu.may-soan"],
	["crm|kho|-", "tai-lieu.tro-ly"],
	["crm|kho|tro_ly_kho", "tai-lieu.tro-ly"],
	["zalo|zalo|tro_ly_kho", "tai-lieu.tro-ly"],
	["eve|okr-soan|-", "okr.soan"],
	["crm|okr-soan|-", "okr.soan"],
]);

const NGOAI: readonly { khop: RegExp; lyDo: string }[] = [
	{
		khop: /^(eve|zalo)\|may-soan\|/,
		lyDo: "phiên máy soạn chỉ mở từ kênh crm",
	},
	{
		khop: /^crm\|may-soan\|(tro_ly_okr\/|agent_runner$|agent_builder$)/,
		lyDo: "phiên máy soạn chỉ giao việc cho may_soan",
	},
	{
		khop: /^crm\|zalo\|/,
		lyDo: "phiên purpose zalo chỉ mở từ kênh zalo",
	},
	{
		khop: /^eve\|(builder|team-agent|okr|zalo)\|/,
		lyDo: "khung hội thoại eve không mang purpose; purposeOf trả research",
	},
	{
		khop: /^zalo\|okr-soan\|/,
		lyDo: "phiên soạn OKR chỉ mở từ kênh crm hoặc eve, không từ Zalo",
	},
	{
		khop: /^(crm|eve)\|okr-soan\|(tro_ly_okr\/|agent_runner$|agent_builder$|tro_ly_kho$)/,
		lyDo: "phiên soạn OKR tự soạn, không giao việc cho phiên con",
	},
	{
		khop: /^zalo\|(builder|team-agent|research|okr)\|/,
		lyDo: "kênh zalo luôn gắn purpose zalo",
	},
	{
		khop: /^(crm|eve|zalo)\|(builder|team-agent|research|zalo)\|tro_ly_okr\//,
		lyDo: "tro_ly_okr chỉ được gọi từ phiên okr — hook uỷ quyền chặn nơi khác",
	},
	{
		khop: /^(eve|zalo)\|okr\|tro_ly_okr\//,
		lyDo: "phiên okr chỉ mở từ kênh crm",
	},
	{
		khop: /^(crm|eve|zalo)\|(builder|research|zalo|okr)\|agent_runner$/,
		lyDo: "agent_runner chỉ chạy dưới lượt Tác nhân (purpose team-agent)",
	},
	{
		khop: /^(eve|zalo)\|team-agent\|agent_runner$/,
		lyDo: "lượt Tác nhân chỉ mở từ kênh crm",
	},
	{
		khop: /^(crm|eve|zalo)\|(team-agent|research|zalo|okr)\|agent_builder$/,
		lyDo: "agent_builder chỉ chạy dưới hội thoại dựng Tác nhân (purpose builder)",
	},
	{
		khop: /^(eve|zalo)\|builder\|agent_builder$/,
		lyDo: "hội thoại dựng Tác nhân chỉ mở từ kênh crm",
	},
	{
		khop: /^(eve|zalo)\|kho\|/,
		lyDo: "phiên hỏi kho chỉ mở từ kênh crm",
	},
	{
		khop: /^crm\|kho\|(tro_ly_okr\/|agent_runner$|agent_builder$)/,
		lyDo: "phiên hỏi kho chỉ giao việc cho tro_ly_kho",
	},
	{
		khop: /^(crm|eve|zalo)\|(builder|team-agent|research|okr|may-soan)\|tro_ly_kho$/,
		lyDo: "tro_ly_kho chỉ chạy dưới phiên kho hay phiên zalo — hook mở hỏi ném ở phiên khác",
	},
	{
		khop: /^(crm|eve)\|zalo\|tro_ly_kho$/,
		lyDo: "phiên purpose zalo chỉ mở từ kênh zalo",
	},
];

function kiemMaTran(purposes: readonly string[]) {
	const o: { o: string; nguon: NguonBuoc; mong: TinhNang }[] = [];
	for (const purpose of purposes) {
		for (const kenh of KENH_TAC_TU) {
			for (const con of PHIEN_CON) {
				const khoa = `${kenh}|${purpose}|${con.ma}`;
				const mong = BANG.get(khoa);
				const ngoai = NGOAI.filter((n) => n.khop.test(khoa)).length;
				if (mong && ngoai > 0)
					throw new Error(`o vua co nghia vua ngoai: ${khoa}`);
				if (!mong && ngoai === 0)
					throw new Error(`thieu dong suy viec: ${purpose} (${khoa})`);
				if (mong)
					o.push({
						o: khoa,
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
	test("mọi mục đích phiên × kênh × phiên con nằm đúng một trong bảng có nghĩa hoặc bảng ngoài, mỗi ô có nghĩa đúng việc viết trước", () => {
		const o = kiemMaTran(SESSION_PURPOSES);
		const tongO =
			SESSION_PURPOSES.length * KENH_TAC_TU.length * PHIEN_CON.length;
		console.log(
			`ma-tran-viec: ${tongO} to hop, ${o.length} o co nghia, ${tongO - o.length} o ngoai`,
		);
		expect(o.length).toBe(BANG.size);
		const lech = o
			.map(({ o: khoa, nguon, mong }) => ({
				khoa,
				mong,
				that: tinhNangCua(nguon),
			}))
			.filter((x) => x.that !== x.mong);
		expect(lech).toEqual([]);
		expect(o.filter(({ nguon }) => tinhNangCua(nguon) === "khac")).toEqual([]);
	});

	test("thêm một mục đích chưa có dòng suy việc thì bảng kỳ vọng đỏ có tên", () => {
		expect(() => kiemMaTran([...SESSION_PURPOSES, "thu-nghiem"])).toThrow(
			"thieu dong suy viec: thu-nghiem",
		);
	});

	test("phiên con tro_ly_okr chưa tìm được việc rơi vào nhóm chuyển tiếp, vẫn tính trần Trợ lý OKR", () => {
		const nhom = tinhNangCua({
			kenh: "crm",
			purpose: null,
			subagent: "tro_ly_okr",
			okrViec: null,
		});
		expect(nhom).toBe("okr.chuyen-tiep");
		expect((TINH_NANG_TRO_LY_OKR as readonly string[]).includes(nhom)).toBe(
			true,
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
	test("lệch tính trên số của sổ: khớp trong 10%, lệch ngoài 10%, biên 10% là khớp", () => {
		expect(ketQuaDoiSoat(1, 1.08)).toEqual({ ketQua: "khop", lechPhanTram: 8 });
		expect(ketQuaDoiSoat(1, 1.12)).toEqual({
			ketQua: "lech",
			lechPhanTram: 12,
		});
		expect(ketQuaDoiSoat(1, 1.1).ketQua).toBe("khop");
		expect(ketQuaDoiSoat(1, 0.88).ketQua).toBe("lech");
		expect(ketQuaDoiSoat(0, 0)).toEqual({ ketQua: "khop", lechPhanTram: 0 });
		expect(ketQuaDoiSoat(0, 0.2)).toEqual({
			ketQua: "lech",
			lechPhanTram: 100,
		});
	});
});
