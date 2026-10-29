import { afterAll, describe, expect, setSystemTime, test } from "bun:test";
import {
	type BangChamOutput,
	bangChamOutput,
} from "../src/okr/okr-khep.contracts";
import {
	type DanhSachBoOutput,
	type DanhSachOutput,
	danhSachBoOutput,
	danhSachOutput,
	type HopTuanOutput,
	hopTuanOutput,
	type SoBoOutput,
	soBoOutput,
	sucKhoeOutput,
	toanCanhOutput,
	type ViecCuaBoOutput,
	viecCuaBoOutput,
} from "../src/okr/okr-xem.contracts";
import { donSanCanhKr } from "./okr-canh-kr-san";
import { donSanKhep, sangPha } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	doc,
	dungSan,
	goi,
	type Json,
	kyDangChay,
	ma,
	ok,
	pbMoi,
	phien,
	truongMoi,
} from "./okr-san";

dungSan();

const GIEO_MS = 180_000;

type MucTieu = { id: string; kr: string[] };
type Don = { loai: "goc" } | { loai: "bp" | "pb" | "nguoi"; id: string };

type San = {
	ky: string;
	B: string;
	C: string;
	D: string;
	P1: string;
	P2: string;
	Q: string;
	chuP1a: string;
	mt: Record<
		"G1" | "B1" | "B2" | "P1a" | "P1b" | "P1x" | "P2a" | "C1" | "Q1",
		MucTieu
	>;
	krViec: Set<string>;
};

const idCua = (tra: Awaited<ReturnType<typeof goi>>, nhan: string) =>
	ok<{ id: string }>(tra, nhan).id;

type Chu = { nguoi: string; cookie: AiHoacCookie };

async function mucTieu(
	cycleId: string,
	unit: Json,
	chu: Chu,
	soKr: number,
): Promise<MucTieu> {
	const id = idCua(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("bcd muc tieu"),
				kind: "cam-ket",
				ownerUserId: chu.nguoi,
				participantIds: [],
				whyNow: "",
			},
			chu.cookie,
		),
		"tao muc tieu",
	);
	const kr: string[] = [];
	for (let i = 0; i < soKr; i += 1)
		kr.push(
			idCua(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: id,
						title: ma("bcd kr"),
						kind: "tang-toi",
						ownerUserId: chu.nguoi,
						startValue: 0,
						targetValue: 100,
						currentValue: 10 * (i + 1),
						unit: "",
						dueOn: null,
						weight: 1,
					},
					chu.cookie,
				),
				"tao kr",
			),
		);
	ok(await goi("okr.publishObjective", { id }, chu.cookie), "cong bo");
	return { id, kr };
}

async function ganViec(keyResultId: string, chu: Chu) {
	ok(
		await goi(
			"okr.themViec",
			{
				keyResultId,
				tieuDe: ma("bcd viec"),
				nguoiLamUserId: chu.nguoi,
				hanNgay: null,
			},
			chu.cookie,
		),
		"them viec",
	);
}

async function capNhat(
	keyResultId: string,
	confidence: "cao" | "thap",
	ai: AiHoacCookie,
) {
	const { sessionId } = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "tab" }, ai),
		"mo cap nhat",
	);
	ok(
		await goi(
			"okr.guiCapNhat",
			{ sessionId, items: [{ keyResultId, value: 30, confidence, note: "" }] },
			ai,
		),
		"gui cap nhat",
	);
}

async function gieo(): Promise<San> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const ky = await kyDangChay("bcd");
	const B = await bpMoi("bcd-B");
	const C = await bpMoi("bcd-C");
	const D = await bpMoi("bcd-D");
	const P1 = await pbMoi("bcd-P1", B);
	const P2 = await pbMoi("bcd-P2", B);
	const Q = await pbMoi("bcd-Q", D);
	const tB = await truongMoi("division", B, "bcd-truong-B");
	const tC = await truongMoi("division", C, "bcd-truong-C");
	const tD = await truongMoi("division", D, "bcd-truong-D");
	const chu = await truongMoi("department", P1, "bcd-chu-P1a");
	const chuP1a = chu.nguoi;
	const quan: Chu = { nguoi: phien.quan.nguoi, cookie: "quan" };
	const bp = (id: string) => ({ level: "bo-phan", divisionId: id });
	const pb = (id: string) => ({ level: "phong-ban", departmentId: id });
	const mt = {
		G1: await mucTieu(ky, { level: "onehub" }, quan, 1),
		B1: await mucTieu(ky, bp(B), tB, 2),
		B2: await mucTieu(ky, bp(B), tB, 1),
		P1a: await mucTieu(ky, pb(P1), chu, 1),
		P1b: await mucTieu(ky, pb(P1), tB, 1),
		P1x: await mucTieu(ky, pb(P1), tB, 1),
		P2a: await mucTieu(ky, pb(P2), tB, 1),
		C1: await mucTieu(ky, bp(C), tC, 1),
		Q1: await mucTieu(ky, pb(Q), tD, 1),
	};
	const chuCua = {
		G1: quan,
		B1: tB,
		P1a: chu,
		P1b: tB,
		P2a: tB,
		C1: tC,
	} as const;
	const krViec = new Set<string>();
	for (const k of ["G1", "B1", "P1a", "P1b", "P2a", "C1"] as const) {
		const kr = mt[k].kr[0];
		if (kr === undefined) throw new Error(`bcd: ${k} thieu KR`);
		await ganViec(kr, chuCua[k]);
		krViec.add(kr);
	}
	for (const k of ["P1b", "P2a"] as const) {
		const kr = mt[k].kr[0];
		if (kr) await capNhat(kr, "cao", tB.cookie);
	}
	const krThap = mt.P1a.kr[0];
	if (krThap === undefined) throw new Error("bcd: P1a thieu KR");
	await capNhat(krThap, "thap", chu.cookie);
	for (const k of ["B2", "P1x"] as const)
		ok(await goi("okr.dropObjective", { id: mt[k].id }, tB.cookie), `bo ${k}`);
	return { ky, B, C, D, P1, P2, Q, chuP1a, mt, krViec };
}

let hua: Promise<San> | null = null;
const san = () => {
	hua ??= gieo();
	return hua;
};

const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] };

const docDanhSach = async (s: San, unit: Don): Promise<DanhSachOutput> =>
	danhSachOutput.parse(
		await doc("okr.danhSach", "quan", { cycleId: s.ky, unit, loc: LOC_RONG }),
	);

const docViec = async (s: San, unit: Don): Promise<ViecCuaBoOutput> =>
	viecCuaBoOutput.parse(
		await doc("okr.viecCuaBo", "quan", { cycleId: s.ky, unit }),
	);

const docHop = async (s: San, unit: Don): Promise<HopTuanOutput> =>
	hopTuanOutput.parse(
		await doc("okr.hopTuan", "quan", { cycleId: s.ky, unit }),
	);

const docSo = async (s: San, unit: Don): Promise<SoBoOutput> =>
	soBoOutput.parse(await doc("okr.soBo", "quan", { cycleId: s.ky, unit }));

const docCham = async (s: San, donVi: Don): Promise<BangChamOutput> =>
	bangChamOutput.parse(
		await doc("okr.bangCham", "quan", { cycleId: s.ky, donVi }),
	);

const docDanhSachBo = async (s: San): Promise<DanhSachBoOutput> =>
	danhSachBoOutput.parse(
		await doc("okr.danhSachBo", "quan", { cycleId: s.ky }),
	);

type KhoaMt = keyof San["mt"];

function tenTheoId(s: San): Map<string, KhoaMt> {
	return new Map(
		(Object.keys(s.mt) as KhoaMt[]).map((k) => [s.mt[k].id, k] as const),
	);
}

function tenKrTheoId(s: San): Map<string, KhoaMt> {
	return new Map(
		(Object.keys(s.mt) as KhoaMt[]).flatMap((k) =>
			s.mt[k].kr.map((kr) => [kr, k] as const),
		),
	);
}

const CON_CUA_B: readonly KhoaMt[] = ["P1a", "P1b", "P1x", "P2a"];

function soSanh(
	nhan: string,
	cot: string,
	thay: readonly KhoaMt[],
	mong: readonly KhoaMt[],
): string[] {
	const loi: string[] = [];
	for (const t of thay) {
		if (mong.includes(t)) continue;
		if (t === "P1x" && nhan === "bp:B")
			loi.push(`bcd-bon-the: bp:B lot da bo P1x`);
		else if (nhan === "bp:B" && CON_CUA_B.includes(t))
			loi.push(`bcd-bon-the: bp:B lot phong ban con (${cot} ${t})`);
		else loi.push(`bcd-bon-the: ${nhan} lot don vi khac (${cot} ${t})`);
	}
	for (const m of mong)
		if (!thay.includes(m)) loi.push(`bcd-bon-the: ${nhan} thieu (${cot} ${m})`);
	return loi;
}

const duy = <T>(xs: T[]) => [...new Set(xs)];

describe("bo-okr-chi-don-vi — bộ chỉ gồm mục tiêu của chính đơn vị", () => {
	afterAll(async () => {
		setSystemTime();
		await donSanKhep();
		await donSanCanhKr();
	}, GIEO_MS);

	test(
		"bcd-bon-the: sáu cột × ba đơn vị chỉ gồm mục tiêu của chính đơn vị",
		async () => {
			const s = await san();
			const ten = tenTheoId(s);
			const tenKr = tenKrTheoId(s);
			const mtCua = (ids: string[]) =>
				duy(ids.flatMap((id) => (ten.get(id) ? [ten.get(id) as KhoaMt] : [])));
			const krCua = (ids: string[]) =>
				duy(
					ids.flatMap((id) => (tenKr.get(id) ? [tenKr.get(id) as KhoaMt] : [])),
				);
			const maTran: {
				nhan: string;
				don: Don;
				rows: KhoaMt[];
				daBo: KhoaMt[];
				viec: KhoaMt[];
				hop: { kr: KhoaMt[]; tongKr: number };
				cham: KhoaMt[];
				so: { soMucTieu: number; soKr: number };
			}[] = [
				{
					nhan: "bp:B",
					don: { loai: "bp", id: s.B },
					rows: ["B1"],
					daBo: ["B2"],
					viec: ["B1"],
					hop: { kr: ["B1"], tongKr: 2 },
					cham: ["B1"],
					so: { soMucTieu: 1, soKr: 2 },
				},
				{
					nhan: "pb:P1",
					don: { loai: "pb", id: s.P1 },
					rows: ["P1a", "P1b"],
					daBo: ["P1x"],
					viec: ["P1a", "P1b"],
					hop: { kr: ["P1a", "P1b"], tongKr: 2 },
					cham: ["P1a", "P1b"],
					so: { soMucTieu: 2, soKr: 2 },
				},
				{
					nhan: "goc",
					don: { loai: "goc" },
					rows: ["G1"],
					daBo: [],
					viec: ["G1"],
					hop: { kr: ["G1"], tongKr: 1 },
					cham: ["G1"],
					so: { soMucTieu: 1, soKr: 1 },
				},
			];
			const loi: string[] = [];
			let soO = 0;
			const doc4 = await Promise.all(
				maTran.map(async (o) => ({
					o,
					ds: await docDanhSach(s, o.don),
					viec: await docViec(s, o.don),
					hop: await docHop(s, o.don),
					so: await docSo(s, o.don),
				})),
			);
			for (const { o, ds, viec, hop, so } of doc4) {
				loi.push(
					...soSanh(
						o.nhan,
						"danhSach",
						mtCua(ds.rows.map((r) => r.id)),
						o.rows,
					),
				);
				loi.push(
					...soSanh(o.nhan, "daBo", mtCua(ds.daBo.map((r) => r.id)), o.daBo),
				);
				loi.push(
					...soSanh(
						o.nhan,
						"viecCuaBo",
						krCua(viec.nhom.map((n) => n.kr.id)),
						o.viec,
					),
				);
				const krHop = [...hop.dangBan, ...hop.conLai].map((d) => d.keyResultId);
				loi.push(...soSanh(o.nhan, "hopTuan", krCua(krHop), o.hop.kr));
				if (hop.tongKr !== o.hop.tongKr)
					loi.push(
						`bcd-bon-the: ${o.nhan} hopTuan tongKr ${hop.tongKr} != ${o.hop.tongKr}`,
					);
				if (so.soMucTieu !== o.so.soMucTieu || so.soKr !== o.so.soKr)
					loi.push(
						`bcd-bon-the: ${o.nhan} soBo ${so.soMucTieu}/${so.soKr} != ${o.so.soMucTieu}/${o.so.soKr}`,
					);
				soO += 5;
			}
			const nguoi = await docDanhSach(s, { loai: "nguoi", id: s.chuP1a });
			loi.push(
				...soSanh(
					"nguoi:chu-P1a",
					"danhSach",
					mtCua(nguoi.rows.map((r) => r.id)),
					["P1a"],
				),
			);
			ok(await sangPha(s.ky, "cham-diem"), "cham diem");
			for (const o of maTran) {
				const cham = await docCham(s, o.don);
				loi.push(
					...soSanh(
						o.nhan,
						"bangCham",
						mtCua(cham.mucTieu.map((m) => m.id)),
						o.cham,
					),
				);
				soO += 1;
			}
			expect(soO).toBe(18);
			expect(loi).toEqual([]);
		},
		GIEO_MS,
	);

	test(
		"bcd-so-rieng: mỗi hàng danh sách Bộ OKR bằng số riêng của bộ",
		async () => {
			const s = await san();
			const [ds, dem] = await Promise.all([
				docDanhSachBo(s),
				doc<Record<string, number>>("okr.countByUnit", "quan", {
					cycleId: s.ky,
				}),
			]);
			const maTran: { nhan: string; don: Don; khoa: string }[] = [
				{ nhan: "goc", don: { loai: "goc" }, khoa: "goc" },
				{ nhan: "bp:B", don: { loai: "bp", id: s.B }, khoa: `bp:${s.B}` },
				{ nhan: "bp:C", don: { loai: "bp", id: s.C }, khoa: `bp:${s.C}` },
				{ nhan: "bp:D", don: { loai: "bp", id: s.D }, khoa: `bp:${s.D}` },
				{ nhan: "pb:P1", don: { loai: "pb", id: s.P1 }, khoa: `pb:${s.P1}` },
				{ nhan: "pb:P2", don: { loai: "pb", id: s.P2 }, khoa: `pb:${s.P2}` },
				{ nhan: "pb:Q", don: { loai: "pb", id: s.Q }, khoa: `pb:${s.Q}` },
			];
			const loi: string[] = [];
			const hangCua = new Map(ds.hang.map((h) => [h.don, h]));
			for (const o of maTran) {
				const h = hangCua.get(o.khoa);
				if (h === undefined) {
					loi.push(`bcd-so-rieng: ${o.nhan} thieu hang`);
					continue;
				}
				const so = await docSo(s, o.don);
				if (h.tienDo !== so.tienDo)
					loi.push(
						`bcd-so-rieng: ${o.nhan} tienDo gop (khac soBo) ${h.tienDo} != ${so.tienDo}`,
					);
				if (h.tuTinThap !== so.tuTin.thap)
					loi.push(
						`bcd-so-rieng: ${o.nhan} tuTinThap ${h.tuTinThap} != ${so.tuTin.thap}`,
					);
				if (h.soMucTieu !== (dem[o.khoa] ?? 0))
					loi.push(
						`bcd-so-rieng: ${o.nhan} soMucTieu ${h.soMucTieu} != ${dem[o.khoa] ?? 0}`,
					);
			}
			expect(loi).toEqual([]);
			const B = hangCua.get(`bp:${s.B}`);
			const D = hangCua.get(`bp:${s.D}`);
			const P1 = hangCua.get(`pb:${s.P1}`);
			expect({
				B: [B?.soMucTieu, B?.tuTinThap],
				D: [D?.soMucTieu, D?.tienDo],
				P1: P1?.tuTinThap,
			}).toEqual({ B: [1, 0], D: [0, null], P1: 1 });
		},
		GIEO_MS,
	);

	test(
		"bcd-toan-canh: Toàn cảnh và Sức khoẻ vẫn cộng dồn bộ phận với phòng ban con",
		async () => {
			const s = await san();
			const [tc, sk, so] = await Promise.all([
				doc("okr.toanCanh", "quan", { cycleId: s.ky }).then((d) =>
					toanCanhOutput.parse(d),
				),
				doc("okr.sucKhoe", "quan", { cycleId: s.ky }).then((d) =>
					sucKhoeOutput.parse(d),
				),
				docSo(s, { loai: "bp", id: s.B }),
			]);
			const B = tc.hang.find((h) => h.key === `bp:${s.B}`);
			const P1 = tc.hang.find((h) => h.key === `pb:${s.P1}`);
			const skB = sk.hang.find((h) => h.key === `bp:${s.B}`);
			const tongKr = (["B1", "P1a", "P1b", "P2a"] as const).reduce(
				(t, k) => t + s.mt[k].kr.length,
				0,
			);
			const loi: string[] = [];
			if (B?.soMucTieu !== 4)
				loi.push(`bcd-toan-canh: bp:B thoi cong don (${B?.soMucTieu} != 4)`);
			if (B?.soKr !== tongKr)
				loi.push(`bcd-toan-canh: bp:B soKr ${B?.soKr} != ${tongKr}`);
			if (skB?.tongKr !== tongKr)
				loi.push(
					`bcd-toan-canh: bp:B sucKhoe tongKr ${skB?.tongKr} != ${tongKr}`,
				);
			if (P1?.soMucTieu !== 2)
				loi.push(`bcd-toan-canh: pb:P1 soMucTieu ${P1?.soMucTieu} != 2`);
			if (so.soMucTieu !== 1)
				loi.push(`bcd-toan-canh: soBo bp:B ${so.soMucTieu} != 1`);
			expect(loi).toEqual([]);
		},
		GIEO_MS,
	);
});
