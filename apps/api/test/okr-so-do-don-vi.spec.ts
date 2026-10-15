import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { tinhTrang } from "@crm/validation/okr-muc-tieu";
import type { NestExpressApplication } from "@nestjs/platform-express";
import {
	CHU_SO_DO,
	KHOA_CA,
	LY_DO_SO_DO,
	mtSoDo,
	NGUOI_XEM_HEP,
	napCaSoDo,
} from "../scripts/okr-mau/ca-so-do";
import { mucTieuOutput } from "../src/okr/okr.contracts";
import {
	cayCanChinhOutput,
	type SoDoDonViOutput,
	soDoDonViOutput,
} from "../src/okr/okr-xem.contracts";
import { OkrXemService } from "../src/okr/okr-xem.service";
import { gopSoDoDonVi } from "../src/okr/so-do-don-vi";
import { congTy } from "./okr-mau-san";
import { CHU_KY_Q4 } from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	goi,
	ketThucMau,
	MOC_MAU,
	nguoi,
	ok,
	phienMau,
} from "./tro-ly-okr-san";

const QUAN_TRI = congTy().nguoi.find((n) => n.vai === "admin")?.ma ?? "";
const CO = [
	"chua-truong",
	"chua-okr",
	"chua-noi",
	"muc-tieu-chua-gop",
	"kr-truot",
] as const;
type Co = (typeof CO)[number];

let app: NestExpressApplication;
const phien = new Map<string, string>();

beforeAll(async () => {
	app = await dungUngDung();
	await batDauMau();
	await napCaSoDo(db, { luc: MOC_MAU });
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

async function cookie(ma: string): Promise<string> {
	const co = phien.get(ma);
	if (co) return co;
	const moi = await phienMau(ma);
	phien.set(ma, moi);
	return moi;
}

async function soDo(ma: string): Promise<SoDoDonViOutput> {
	const tra = await goi(
		app,
		"okr.soDoDonVi",
		"query",
		{ cycleId: CHU_KY_Q4 },
		await cookie(ma),
	);
	return soDoDonViOutput.parse(ok(tra, `so do ${ma}`));
}

async function mucTieu(id: string, ma: string) {
	const tra = await goi(app, "okr.objective", "query", { id }, await cookie(ma));
	return mucTieuOutput.parse(ok(tra, `muc tieu ${id}`));
}

const nutCua = (s: SoDoDonViOutput, khoa: string) => {
	const n = s.nut.find((x) => x.khoa === khoa);
	if (!n) throw new Error(`thieu nut ${khoa}`);
	return n;
};

const CA_SO_DO = new Set<string>(Object.values(KHOA_CA));

describe("dh4-du-lieu", () => {
	test("mỗi đơn vị một nút đúng số liệu, mỗi cặp góp ra ngoài một dây đúng loại", async () => {
		const s = await soDo(QUAN_TRI);
		const maTran: {
			khoa: string;
			cha: string;
			truong: string | null;
			mucTieu: string[];
			soKr: number;
			tinhTrang: { dungNhip: number; chamNhip: number; truot: number };
			chuaGop: number;
			co: Co[];
		}[] = [
			{ khoa: KHOA_CA.A, cha: "goc", truong: "pham-thu-trang", mucTieu: ["sd-a-1", "sd-a-2"], soKr: 2, tinhTrang: { dungNhip: 2, chamNhip: 0, truot: 0 }, chuaGop: 0, co: [] },
			{ khoa: KHOA_CA.A1, cha: KHOA_CA.A, truong: "tran-quoc-bao", mucTieu: ["sd-a1-1", "sd-g"], soKr: 3, tinhTrang: { dungNhip: 2, chamNhip: 0, truot: 1 }, chuaGop: 0, co: ["kr-truot"] },
			{ khoa: KHOA_CA.A2, cha: KHOA_CA.A, truong: "nguyen-thi-lan", mucTieu: ["sd-a2-1"], soKr: 1, tinhTrang: { dungNhip: 1, chamNhip: 0, truot: 0 }, chuaGop: 0, co: [] },
			{ khoa: KHOA_CA.A3, cha: KHOA_CA.A, truong: "do-minh-khoa", mucTieu: ["sd-a3-1"], soKr: 1, tinhTrang: { dungNhip: 1, chamNhip: 0, truot: 0 }, chuaGop: 0, co: [] },
			{ khoa: KHOA_CA.B, cha: "goc", truong: "dang-ngoc-mai", mucTieu: ["sd-b-1"], soKr: 1, tinhTrang: { dungNhip: 1, chamNhip: 0, truot: 0 }, chuaGop: 1, co: ["chua-noi", "muc-tieu-chua-gop"] },
			{ khoa: KHOA_CA.B1, cha: KHOA_CA.B, truong: "pham-thu-trang", mucTieu: ["sd-b1-1"], soKr: 1, tinhTrang: { dungNhip: 1, chamNhip: 0, truot: 0 }, chuaGop: 0, co: [] },
			{ khoa: KHOA_CA.B2, cha: KHOA_CA.B, truong: null, mucTieu: ["sd-b2-1", "sd-b2-2"], soKr: 2, tinhTrang: { dungNhip: 2, chamNhip: 0, truot: 0 }, chuaGop: 1, co: ["chua-truong", "chua-noi", "muc-tieu-chua-gop"] },
			{ khoa: KHOA_CA.B3, cha: KHOA_CA.B, truong: "nguyen-thi-lan", mucTieu: [], soKr: 0, tinhTrang: { dungNhip: 0, chamNhip: 0, truot: 0 }, chuaGop: 0, co: ["chua-okr"] },
			{ khoa: KHOA_CA.X, cha: "goc", truong: "dang-ngoc-mai", mucTieu: ["sd-x-1"], soKr: 2, tinhTrang: { dungNhip: 0, chamNhip: 1, truot: 0 }, chuaGop: 0, co: [] },
		];
		let soAssert = 0;
		for (const h of maTran) {
			const n = nutCua(s, h.khoa);
			const tienDo =
				h.mucTieu.length === 0
					? null
					: (
							await Promise.all(h.mucTieu.map((m) => mucTieu(mtSoDo(m), QUAN_TRI)))
						).reduce((t, m) => t + m.progress, 0) / h.mucTieu.length;
			expect({
				khoa: n.khoa,
				cha: n.cha,
				truong: n.truong?.id ?? null,
				soMucTieu: n.soMucTieu,
				soKr: n.soKr,
				tienDo: n.tienDo,
				tinhTrang: n.tinhTrang,
				chuaGop: n.chuaGop,
				co: [...n.co].sort(),
				canChuY: n.canChuY,
			}).toEqual({
				khoa: h.khoa,
				cha: h.cha,
				truong: h.truong === null ? null : nguoi(h.truong),
				soMucTieu: h.mucTieu.length,
				soKr: h.soKr,
				tienDo,
				tinhTrang: h.tinhTrang,
				chuaGop: h.chuaGop,
				co: [...h.co].sort(),
				canChuY: h.co.length > 0,
			});
			soAssert += 1;
		}
		expect(soAssert).toBe(CA_SO_DO.size);

		const day = s.duong
			.filter((d) => CA_SO_DO.has(d.tu) || CA_SO_DO.has(d.den))
			.map((d) => `${d.tu}->${d.den} ${d.loai} ${d.soMucTieu}`)
			.sort();
		const mong = [
			`goc->${KHOA_CA.A} lien 2`,
			`${KHOA_CA.A}->${KHOA_CA.A1} lien 2`,
			`${KHOA_CA.B}->${KHOA_CA.A2} dut 1`,
			`${KHOA_CA.A}->${KHOA_CA.A3} lien 1`,
			`goc->${KHOA_CA.A3} dut 1`,
			`goc->${KHOA_CA.X} lien 1`,
			`goc->${KHOA_CA.B1} dut 1`,
		].sort();
		for (const d of s.duong) {
			const lech = mong.find(
				(m) => m.startsWith(`${d.tu}->${d.den} `) && !m.includes(` ${d.loai} `),
			);
			if (lech) throw new Error(`duong sai loai: ${d.tu}->${d.den}`);
		}
		for (const k of [KHOA_CA.B, KHOA_CA.B2, KHOA_CA.B3]) {
			if (s.duong.some((d) => d.den === k))
				throw new Error(`duong lo cho don vi chua noi: ${k}`);
		}
		expect(day).toEqual(mong);
		const loai = new Set(day.map((d) => d.split(" ")[1]));
		if (!loai.has("lien") || !loai.has("dut")) throw new Error("thieu loai duong");
	});
});

describe("dh4-chu-y", () => {
	test("năm cờ theo ma trận viết trước, trên đầu vào do hàm đọc thật rút từ CSDL kiểm", async () => {
		const vao = await app
			.get(OkrXemService)
			.docDauVaoSoDo(nguoi(QUAN_TRI), CHU_KY_Q4);
		const s = gopSoDoDonVi(vao);
		const maTran: [string, Co[]][] = [
			["goc", []],
			[KHOA_CA.A, []],
			[KHOA_CA.A1, ["kr-truot"]],
			[KHOA_CA.B, ["chua-noi", "muc-tieu-chua-gop"]],
			[KHOA_CA.B2, ["chua-truong", "chua-noi", "muc-tieu-chua-gop"]],
			[KHOA_CA.B3, ["chua-okr"]],
			[KHOA_CA.X, []],
		];
		let soAssert = 0;
		for (const [khoa, co] of maTran) {
			const n = nutCua(s, khoa);
			for (const c of CO) {
				expect({ khoa, c, bat: n.co.includes(c) }).toEqual({
					khoa,
					c,
					bat: co.includes(c),
				});
				soAssert += 1;
			}
			expect(n.canChuY).toBe(khoa !== "goc" && co.length > 0);
		}
		expect(soAssert).toBe(35);

		const x = vao.mts.find((m) => m.id === mtSoDo("sd-x-1"));
		const k1 = x?.keyResults.find((k) => k.kind !== "moc");
		if (!x || !k1) throw new Error("thieu muc tieu X");
		const neuCamKet = tinhTrang(k1.progress, x.expected, "cam-ket");
		expect(neuCamKet).toBe("truot");
		if (nutCua(s, KHOA_CA.X).co.includes("kr-truot"))
			throw new Error("tinh truot ngoai cam ket");
	});
});

describe("dh4-quyen", () => {
	test("người xem không thấy mục tiêu giới hạn thì sơ đồ không có tên, không đếm, không dây", async () => {
		const ten = (await mucTieu(mtSoDo("sd-g"), CHU_SO_DO)).title;
		const hep = await soDo(NGUOI_XEM_HEP);
		if (JSON.stringify(hep).includes(ten))
			throw new Error("lo ten muc tieu gioi han");
		const a1 = nutCua(hep, KHOA_CA.A1);
		expect(a1.soMucTieu).toBe(1);
		expect(a1.mucTieu.map((m) => m.id)).toEqual([mtSoDo("sd-a1-1")]);
		expect(
			hep.duong.find((d) => d.den === KHOA_CA.A1 && d.tu === KHOA_CA.A)
				?.soMucTieu,
		).toBe(1);

		const tra = await goi(
			app,
			"okr.cayCanChinh",
			"query",
			{ cycleId: CHU_KY_Q4 },
			await cookie(NGUOI_XEM_HEP),
		);
		const cay = cayCanChinhOutput.parse(ok(tra, "cay hep"));
		const idCay = new Set<string>();
		const di = (n: { loai: string; id: string; children: unknown[] }) => {
			if (n.loai === "muc-tieu") idCay.add(n.id);
			for (const c of n.children as (typeof n)[]) di(c);
		};
		for (const r of [...cay.roots, ...cay.chuaCanChinh]) di(r);
		const idSoDo = new Set(hep.nut.flatMap((n) => n.mucTieu.map((m) => m.id)));
		for (const id of idSoDo) expect(idCay.has(id)).toBe(true);

		const day = await soDo(QUAN_TRI);
		expect(JSON.stringify(day).includes(ten)).toBe(true);
	});
});

describe("dh4-ly-do", () => {
	test("dòng góp mang đúng lý do, mức tin, dấu Kara của từng cặp như cạnh của cây căn chỉnh", async () => {
		const s = await soDo(NGUOI_XEM_HEP);
		const tra = await goi(
			app,
			"okr.cayCanChinh",
			"query",
			{ cycleId: CHU_KY_Q4 },
			await cookie(NGUOI_XEM_HEP),
		);
		const cay = cayCanChinhOutput.parse(ok(tra, "cay ly do"));
		const dong = new Map(
			s.nut.flatMap((n) =>
				n.mucTieu.flatMap((m) => m.gop.map((g) => [`${m.id}->${g.dich}`, g] as const)),
			),
		);
		const idSoDo = new Set(s.nut.flatMap((n) => n.mucTieu.map((m) => m.id)));
		const canh = cay.canh.filter((c) => idSoDo.has(c.tu));
		let soCap = 0;
		for (const c of canh) {
			const g = dong.get(`${c.tu}->${c.den}`);
			if (!g) throw new Error(`thieu dong gop: ${c.tu}->${c.den}`);
			if (g.lyDo !== c.lyDo) throw new Error(`ly do sai cho noi: ${c.tu}->${c.den}`);
			expect({ mucTin: g.mucTin, lyDoTuKara: g.lyDoTuKara }).toEqual({
				mucTin: c.mucTin,
				lyDoTuKara: c.lyDoTuKara,
			});
			soCap += 1;
		}
		expect(soCap).toBe(canh.length);
		const m = mtSoDo("sd-a3-1");
		const hai = [...dong.entries()].filter(([k]) => k.startsWith(`${m}->`));
		expect(hai.length).toBe(2);
		expect(new Set(hai.map(([, g]) => g.lyDo))).toEqual(
			new Set([LY_DO_SO_DO.coSoLieu, LY_DO_SO_DO.datCuoc]),
		);
		expect(canh.filter((c) => c.mucTin !== "chua-co-ly-do").length).toBeGreaterThanOrEqual(1);
	});
});
