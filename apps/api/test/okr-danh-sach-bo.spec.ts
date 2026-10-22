import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	type DanDonVi,
	gopDanhSachBo,
	type HangViecBo,
	viecBoTu,
} from "../src/okr/bo-okr";
import type {
	DanhSachBoOutput,
	HangBo,
	ToanCanhOutput,
	ViecCuaBoOutput,
} from "../src/okr/okr-xem.contracts";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { donSanCanhKr } from "./okr-canh-kr-san";
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
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	truongMoi,
} from "./okr-san";

dungSan();

const GIEO_MS = 120_000;
const DON_MS = 30_000;

type Nguoi = { nguoi: string; cookie: AiHoacCookie };
type MucTieuGieo = {
	id: string;
	ten: string;
	kr: { id: string; ten: string }[];
};

type SanCay = {
	ky: string;
	kyKhac: string;
	X: string;
	Y: string;
	A: string;
	B: string;
	C: string;
	truongX: Nguoi;
	truongY: Nguoi;
	truongA: Nguoi;
	truongB: Nguoi;
	thanhVien: Nguoi;
	quanTri: Nguoi;
	mtB: MucTieuGieo;
	mtBKhac: MucTieuGieo;
};

const idCua = (tra: Awaited<ReturnType<typeof goi>>, nhan: string) =>
	ok<{ id: string }>(tra, nhan).id;

async function mucTieuCongBo(
	cycleId: string,
	unit: Json,
	chu: Nguoi,
	soKr: number,
): Promise<MucTieuGieo> {
	const ten = ma("tbo muc tieu");
	const id = idCua(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ten,
				kind: "cam-ket",
				ownerUserId: chu.nguoi,
				participantIds: [],
				whyNow: "",
			},
			chu.cookie,
		),
		"tao muc tieu",
	);
	const kr: { id: string; ten: string }[] = [];
	for (let i = 0; i < soKr; i += 1) {
		const tenKr = ma("tbo kr");
		kr.push({
			id: idCua(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: id,
						title: tenKr,
						kind: "tang-toi",
						ownerUserId: chu.nguoi,
						startValue: 0,
						targetValue: 100,
						currentValue: 20 * (i + 1),
						unit: "",
						dueOn: null,
						weight: 1,
					},
					chu.cookie,
				),
				"tao kr",
			),
			ten: tenKr,
		});
	}
	ok(await goi("okr.publishObjective", { id }, chu.cookie), "cong bo");
	return { id, ten, kr };
}

async function capNhatThap(keyResultId: string, ai: AiHoacCookie) {
	const { sessionId } = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "tab" }, ai),
		"mo cap nhat",
	);
	ok(
		await goi(
			"okr.guiCapNhat",
			{
				sessionId,
				items: [{ keyResultId, value: 30, confidence: "thap", note: "" }],
			},
			ai,
		),
		"gui cap nhat",
	);
}

const theoDoi = async (objectiveId: string, on: boolean, ai: AiHoacCookie) =>
	ok(await goi("okr.follow", { objectiveId, on }, ai), `follow ${on}`);

async function gieoCay(): Promise<SanCay> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const ky = await kyDangChay("tbo");
	const kyKhac = await kyDangChay("tbo-khac");
	const X = await bpMoi("tbo-X");
	const Y = await bpMoi("tbo-Y");
	const A = await pbMoi("tbo-A", X);
	const C = await pbMoi("tbo-C", X);
	const B = await pbMoi("tbo-B", Y);
	const truongX = await truongMoi("division", X, "tbo-truong-X");
	const truongY = await truongMoi("division", Y, "tbo-truong-Y");
	const truongA = await truongMoi("department", A, "tbo-truong-A");
	const truongB = await truongMoi("department", B, "tbo-truong-B");
	const tv = await nguoiMoi("tbo-thanh-vien");
	const thanhVien = { nguoi: tv, cookie: await phienCua(tv) };
	const quanTri = { nguoi: phien.quan.nguoi, cookie: "quan" };
	await mucTieuCongBo(ky, { level: "onehub" }, quanTri, 1);
	await mucTieuCongBo(ky, { level: "bo-phan", divisionId: X }, truongX, 1);
	const mtA1 = await mucTieuCongBo(
		ky,
		{ level: "phong-ban", departmentId: A },
		truongA,
		2,
	);
	await mucTieuCongBo(ky, { level: "phong-ban", departmentId: A }, truongA, 1);
	const mtB = await mucTieuCongBo(
		ky,
		{ level: "phong-ban", departmentId: B },
		truongB,
		1,
	);
	const mtBKhac = await mucTieuCongBo(
		kyKhac,
		{ level: "phong-ban", departmentId: B },
		truongB,
		1,
	);
	const krThap = mtA1.kr[0];
	if (krThap === undefined) throw new Error("tbo: thieu KR thap");
	await capNhatThap(krThap.id, truongA.cookie);
	return {
		ky,
		kyKhac,
		X,
		Y,
		A,
		B,
		C,
		truongX,
		truongY,
		truongA,
		truongB,
		thanhVien,
		quanTri,
		mtB,
		mtBKhac,
	};
}

let hua: Promise<SanCay> | null = null;
const sanCay = () => {
	hua ??= gieoCay();
	return hua;
};

type Cap = HangBo["cap"];
type DongMaTran = {
	khoa: string;
	cap: Cap;
	cha: string | null;
	truong: string | null;
	soMucTieu: number;
	tuTinThap: number;
	coTienDo: boolean;
};

const maTranHang = (s: SanCay): DongMaTran[] => [
	{
		khoa: "goc",
		cap: "goc",
		cha: null,
		truong: null,
		soMucTieu: 1,
		tuTinThap: 0,
		coTienDo: true,
	},
	{
		khoa: `bp:${s.X}`,
		cap: "bo-phan",
		cha: "goc",
		truong: s.truongX.nguoi,
		soMucTieu: 1,
		tuTinThap: 1,
		coTienDo: true,
	},
	{
		khoa: `pb:${s.A}`,
		cap: "phong-ban",
		cha: `bp:${s.X}`,
		truong: s.truongA.nguoi,
		soMucTieu: 2,
		tuTinThap: 1,
		coTienDo: true,
	},
	{
		khoa: `pb:${s.C}`,
		cap: "phong-ban",
		cha: `bp:${s.X}`,
		truong: null,
		soMucTieu: 0,
		tuTinThap: 0,
		coTienDo: false,
	},
	{
		khoa: `bp:${s.Y}`,
		cap: "bo-phan",
		cha: "goc",
		truong: s.truongY.nguoi,
		soMucTieu: 0,
		tuTinThap: 0,
		coTienDo: true,
	},
	{
		khoa: `pb:${s.B}`,
		cap: "phong-ban",
		cha: `bp:${s.Y}`,
		truong: s.truongB.nguoi,
		soMucTieu: 1,
		tuTinThap: 0,
		coTienDo: true,
	},
];

type DoiChieu = {
	dem: Record<string, number>;
	toanCanh: ToanCanhOutput;
	truongDb: Map<string, string | null>;
};

async function truongTheoDb(s: SanCay): Promise<Map<string, string | null>> {
	const [bp, pb] = await Promise.all([
		db.division.findMany({
			where: { id: { in: [s.X, s.Y] } },
			select: { id: true, headUserId: true },
		}),
		db.department.findMany({
			where: { id: { in: [s.A, s.B, s.C] } },
			select: { id: true, headUserId: true },
		}),
	]);
	return new Map<string, string | null>([
		["goc", null],
		...bp.map((b): [string, string | null] => [`bp:${b.id}`, b.headUserId]),
		...pb.map((p): [string, string | null] => [`pb:${p.id}`, p.headUserId]),
	]);
}

async function docDoiChieu(s: SanCay, ai: AiHoacCookie): Promise<DoiChieu> {
	const [dem, toanCanh, truongDb] = await Promise.all([
		doc<Record<string, number>>("okr.countByUnit", ai, { cycleId: s.ky }),
		doc<ToanCanhOutput>("okr.toanCanh", ai, { cycleId: s.ky }),
		truongTheoDb(s),
	]);
	return { dem, toanCanh, truongDb };
}

function lechHang(
	maTran: DongMaTran[],
	hang: readonly HangBo[],
	dc: DoiChieu,
): string[] {
	const loi: string[] = [];
	for (const h of hang)
		if (h.don.startsWith("nguoi:"))
			loi.push(`tbo-hang: ${h.don} khong duoc co`);
	for (const d of maTran) {
		const cua = hang.filter((h) => h.don === d.khoa);
		if (cua.length === 0) {
			loi.push(`tbo-hang: ${d.khoa} thieu`);
			continue;
		}
		if (cua.length > 1) loi.push(`tbo-hang: ${d.khoa} lech so-hang`);
		const [h] = cua;
		if (h === undefined) continue;
		const tc = dc.toanCanh.hang.find((x) => x.key === d.khoa);
		const cot: [string, boolean][] = [
			["cap", h.cap === d.cap],
			["cha", h.cha === d.cha],
			["truong", (h.truong?.id ?? null) === d.truong],
			["truong-db", (h.truong?.id ?? null) === dc.truongDb.get(d.khoa)],
			["so-muc-tieu", h.soMucTieu === d.soMucTieu],
			["so-muc-tieu-count-by-unit", h.soMucTieu === (dc.dem[d.khoa] ?? 0)],
			["tien-do-toan-canh", tc !== undefined && h.tienDo === tc.tienDo],
			["co-tien-do", (h.tienDo !== null) === d.coTienDo],
			["tu-tin-thap", h.tuTinThap === d.tuTinThap],
			[
				"tu-tin-thap-toan-canh",
				tc !== undefined && h.tuTinThap === tc.tuTin.thap,
			],
		];
		for (const [ten, dung] of cot)
			if (!dung) loi.push(`tbo-hang: ${d.khoa} lech ${ten}`);
	}
	return loi;
}

async function dauVaoDung(dc: DoiChieu, dan: DanDonVi) {
	const cay = await doc<TreeOutput>("org.tree");
	return {
		cay,
		tenGoc: dc.toanCanh.hang.find((h) => h.key === "goc")?.ten ?? "",
		soMucTieu: dc.dem,
		toanCanh: dc.toanCanh.hang,
		dan,
		theoDoi: new Set<string>(),
	};
}

describe("tbo-hang", () => {
	beforeAll(async () => {
		await sanCay();
	}, GIEO_MS);

	test("tbo-hang: moi don vi cua cay mot hang, so muc tieu bang countByUnit, tien do bang toanCanh, truong bang headUserId", async () => {
		const s = await sanCay();
		const ra = await doc<DanhSachBoOutput>("okr.danhSachBo", s.quanTri.cookie, {
			cycleId: s.ky,
		});
		const dc = await docDoiChieu(s, s.quanTri.cookie);
		expect(lechHang(maTranHang(s), ra.hang, dc)).toEqual([]);
	});

	test("tbo-hang-do: ban dung hang voi mot phong ban bi bo khoi cay thi thieu hang", async () => {
		const s = await sanCay();
		const dc = await docDoiChieu(s, s.quanTri.cookie);
		const vao = await dauVaoDung(dc, {
			boPhan: new Set(),
			phongBan: new Set(),
		});
		expect(lechHang(maTranHang(s), gopDanhSachBo(vao).hang, dc)).toEqual([]);
		const cayThieu = {
			...vao.cay,
			divisions: vao.cay.divisions.map((b) => ({
				...b,
				departments: b.departments.filter((p) => p.id !== s.A),
			})),
		};
		const lech = lechHang(
			maTranHang(s),
			gopDanhSachBo({ ...vao, cay: cayThieu }).hang,
			dc,
		);
		expect(lech).toContain(`tbo-hang: pb:${s.A} thieu`);
	});
});

type TenNguoiXem = "truong-pb" | "truong-bp" | "thanh-vien" | "quan-tri";
type TenDon = "A" | "X" | "B" | "goc";
const NGUOI_XEM: TenNguoiXem[] = [
	"truong-pb",
	"truong-bp",
	"thanh-vien",
	"quan-tri",
];
const DON: TenDon[] = ["A", "X", "B", "goc"];

const MA_TRAN_TOI_DAN = {
	"truong-pb": { A: true, X: false, B: false, goc: false },
	"truong-bp": { A: false, X: true, B: false, goc: false },
	"thanh-vien": { A: false, X: false, B: false, goc: false },
	"quan-tri": { A: false, X: false, B: false, goc: false },
} satisfies Record<TenNguoiXem, Record<TenDon, boolean>>;

const nguoiXemCua = (s: SanCay) =>
	({
		"truong-pb": s.truongA,
		"truong-bp": s.truongX,
		"thanh-vien": s.thanhVien,
		"quan-tri": s.quanTri,
	}) satisfies Record<TenNguoiXem, Nguoi>;

const khoaCua = (s: SanCay, d: TenDon): string =>
	d === "goc" ? "goc" : d === "X" ? `bp:${s.X}` : `pb:${d === "A" ? s.A : s.B}`;

function lechCo(
	s: SanCay,
	nguoi: TenNguoiXem,
	hang: readonly HangBo[],
	co: "toiDan" | "dangTheoDoi",
	kyVong: Record<TenDon, boolean>,
): string[] {
	return DON.flatMap((d) => {
		const khoa = khoaCua(s, d);
		const h = hang.find((x) => x.don === khoa);
		return h !== undefined && h[co] === kyVong[d]
			? []
			: [`tbo-co: ${nguoi}/${khoa} ${co} lech`];
	});
}

const KHONG_THEO_DOI = {
	A: false,
	X: false,
	B: false,
	goc: false,
} satisfies Record<TenDon, boolean>;

async function bangCua(s: SanCay, ai: AiHoacCookie, cycleId = s.ky) {
	return (await doc<DanhSachBoOutput>("okr.danhSachBo", ai, { cycleId })).hang;
}

describe("tbo-co", () => {
	beforeAll(async () => {
		await sanCay();
	}, GIEO_MS);

	test(
		"tbo-co: ma tran 4 nguoi xem x 4 don vi cho toiDan; theo doi muc tieu cua B bat dangTheoDoi cua B, bo theo doi tat",
		async () => {
			const s = await sanCay();
			const xem = nguoiXemCua(s);
			const loi: string[] = [];
			for (const n of NGUOI_XEM) {
				const hang = await bangCua(s, xem[n].cookie);
				loi.push(...lechCo(s, n, hang, "toiDan", MA_TRAN_TOI_DAN[n]));
				loi.push(...lechCo(s, n, hang, "dangTheoDoi", KHONG_THEO_DOI));
			}
			await theoDoi(s.mtB.id, true, s.thanhVien.cookie);
			loi.push(
				...lechCo(
					s,
					"thanh-vien",
					await bangCua(s, s.thanhVien.cookie),
					"dangTheoDoi",
					{ ...KHONG_THEO_DOI, B: true },
				),
			);
			await theoDoi(s.mtB.id, false, s.thanhVien.cookie);
			loi.push(
				...lechCo(
					s,
					"thanh-vien",
					await bangCua(s, s.thanhVien.cookie),
					"dangTheoDoi",
					KHONG_THEO_DOI,
				),
			);
			expect(loi).toEqual([]);
		},
		GIEO_MS,
	);

	test(
		"tbo-co-do: theo doi muc tieu khac chu ky khong bat dangTheoDoi; ban dung bo nhanh truong bo phan thi lech toiDan",
		async () => {
			const s = await sanCay();
			await theoDoi(s.mtBKhac.id, true, s.thanhVien.cookie);
			try {
				const khoaB = `pb:${s.B}`;
				const cuaKyKhac = (await bangCua(s, s.thanhVien.cookie, s.kyKhac)).find(
					(h) => h.don === khoaB,
				);
				expect(
					`tbo-co: theo doi ky khac thay o ky khac ${cuaKyKhac?.dangTheoDoi}`,
				).toBe("tbo-co: theo doi ky khac thay o ky khac true");
				const cuaKyNay = (await bangCua(s, s.thanhVien.cookie)).find(
					(h) => h.don === khoaB,
				);
				expect(
					cuaKyNay?.dangTheoDoi === false
						? []
						: ["tbo-co: theo doi khac chu ky"],
				).toEqual([]);
			} finally {
				await theoDoi(s.mtBKhac.id, false, s.thanhVien.cookie);
			}
			const dc = await docDoiChieu(s, s.truongX.cookie);
			const quyen = await doc<{
				headOf: { divisions: string[]; departments: string[] };
			}>("okr.access", s.truongX.cookie);
			const dan = {
				boPhan: new Set(quyen.headOf.divisions),
				phongBan: new Set(quyen.headOf.departments),
			};
			const vao = await dauVaoDung(dc, dan);
			expect(
				lechCo(
					s,
					"truong-bp",
					gopDanhSachBo(vao).hang,
					"toiDan",
					MA_TRAN_TOI_DAN["truong-bp"],
				),
			).toEqual([]);
			const boNhanh = gopDanhSachBo({
				...vao,
				dan: { ...dan, boPhan: new Set() },
			});
			expect(
				lechCo(
					s,
					"truong-bp",
					boNhanh.hang,
					"toiDan",
					MA_TRAN_TOI_DAN["truong-bp"],
				),
			).toContain(`tbo-co: truong-bp/bp:${s.X} toiDan lech`);
		},
		GIEO_MS,
	);
});

type ViecKyVong = {
	id: string;
	tieuDe: string;
	nguoiLam: string;
	hanNgay: string | null;
	xong: boolean;
};
type NhomKyVong = {
	kr: { id: string; ten: string };
	mucTieu: { id: string; ten: string };
	viec: ViecKyVong[];
};

type SanViec = {
	s: SanCay;
	kyVongA: NhomKyVong[];
	viecB: string;
	viecKyKhac: string;
};

async function themViec(
	keyResultId: string,
	nguoiLam: Nguoi,
	ai: AiHoacCookie,
	hanNgay: string | null,
): Promise<ViecKyVong> {
	const tieuDe = ma("tbo viec");
	const id = idCua(
		await goi(
			"okr.themViec",
			{ keyResultId, tieuDe, nguoiLamUserId: nguoiLam.nguoi, hanNgay },
			ai,
		),
		"them viec",
	);
	return { id, tieuDe, nguoiLam: nguoiLam.nguoi, hanNgay, xong: false };
}

async function gieoViec(): Promise<SanViec> {
	const s = await sanCay();
	const { truongA, truongB, thanhVien } = s;
	const unitA = { level: "phong-ban", departmentId: s.A };
	const mt1 = await mucTieuCongBo(s.ky, unitA, truongA, 2);
	const mt2 = await mucTieuCongBo(s.ky, unitA, truongA, 1);
	const [k1, k2] = mt1.kr;
	const [k3] = mt2.kr;
	if (k1 === undefined || k2 === undefined || k3 === undefined)
		throw new Error("tbo-viec: thieu KR");
	const v1 = await themViec(k1.id, thanhVien, truongA.cookie, "2026-11-20");
	const v2 = await themViec(k1.id, truongA, truongA.cookie, null);
	const v3 = await themViec(k3.id, truongA, truongA.cookie, null);
	const v4 = await themViec(k3.id, thanhVien, truongA.cookie, "2026-12-05");
	ok(
		await goi("okr.danhDauViec", { id: v3.id, xong: true }, truongA.cookie),
		"danh dau xong",
	);
	const krB = s.mtB.kr[0];
	const krKhac = (await mucTieuCongBo(s.kyKhac, unitA, truongA, 1)).kr[0];
	if (krB === undefined || krKhac === undefined)
		throw new Error("tbo-viec: thieu KR cua B hay ky khac");
	const viecB = (await themViec(krB.id, truongB, truongB.cookie, null)).id;
	const viecKyKhac = (await themViec(krKhac.id, truongA, truongA.cookie, null))
		.id;
	const nhom = (
		kr: { id: string; ten: string },
		mt: MucTieuGieo,
		viec: ViecKyVong[],
	): NhomKyVong => ({ kr, mucTieu: { id: mt.id, ten: mt.ten }, viec });
	return {
		s,
		kyVongA: [
			nhom(k1, mt1, [v1, v2]),
			nhom(k3, mt2, [{ ...v3, xong: true }, v4]),
		],
		viecB,
		viecKyKhac,
	};
}

function lechViec(kyVong: NhomKyVong[], ra: ViecCuaBoOutput): string[] {
	const loi: string[] = [];
	if (ra.nhom.length !== kyVong.length)
		loi.push(`tbo-viec: so nhom ${ra.nhom.length} khac ${kyVong.length}`);
	kyVong.forEach((k, i) => {
		const n = ra.nhom[i];
		if (n === undefined) {
			loi.push(`tbo-viec: thieu nhom ${k.kr.id}`);
			return;
		}
		if (n.kr.id !== k.kr.id || n.kr.ten !== k.kr.ten)
			loi.push(`tbo-viec: nhom ${i} kr lech`);
		if (n.kr.mucTieu.id !== k.mucTieu.id || n.kr.mucTieu.ten !== k.mucTieu.ten)
			loi.push(`tbo-viec: nhom ${i} muc tieu lech`);
		if (n.viec.length !== k.viec.length)
			loi.push(
				`tbo-viec: nhom ${i} so viec ${n.viec.length} khac ${k.viec.length}`,
			);
		k.viec.forEach((v, j) => {
			const r = n.viec[j];
			if (r === undefined) {
				loi.push(`tbo-viec: thieu viec ${v.id}`);
				return;
			}
			const cot: [string, boolean][] = [
				["id", r.id === v.id],
				["loai", r.loai === "viec"],
				["tieu-de", r.tieuDe === v.tieuDe],
				["nguoi-lam", r.nguoiLam?.id === v.nguoiLam],
				["han", r.hanNgay === v.hanNgay],
				["xong", r.xong === v.xong],
			];
			for (const [ten, dung] of cot)
				if (!dung) loi.push(`tbo-viec: viec ${v.id} lech ${ten}`);
		});
	});
	return loi;
}

const idViec = (ra: ViecCuaBoOutput) =>
	ra.nhom.flatMap((n) => n.viec.map((v) => v.id));

describe("tbo-viec", () => {
	let hv: Promise<SanViec> | null = null;
	const sanViec = () => {
		hv ??= gieoViec();
		return hv;
	};

	beforeAll(async () => {
		await sanViec();
	}, GIEO_MS);

	afterAll(donSanCanhKr, DON_MS);

	test("tbo-viec: viec gan KR cua bo nhom theo KR co viec, du tieu de nguoi lam han xong, khong lan bo khac hay ky khac", async () => {
		const { s, kyVongA, viecB, viecKyKhac } = await sanViec();
		const ra = await doc<ViecCuaBoOutput>("okr.viecCuaBo", s.quanTri.cookie, {
			cycleId: s.ky,
			unit: { loai: "pb", id: s.A },
		});
		const loi = lechViec(kyVongA, ra);
		const ids = idViec(ra);
		if (ids.includes(viecB)) loi.push("tbo-viec: lan viec cua B");
		if (ids.includes(viecKyKhac)) loi.push("tbo-viec: lan viec ky khac");
		expect(loi).toEqual([]);
	});

	test("tbo-viec-do: bo khong co viec tra mang rong; viec cua B hien khi goi unit B", async () => {
		const { s, viecB } = await sanViec();
		const rong = await doc<ViecCuaBoOutput>("okr.viecCuaBo", s.quanTri.cookie, {
			cycleId: s.ky,
			unit: { loai: "pb", id: s.C },
		});
		expect(`tbo-viec: rong ${rong.nhom.length} nhom`).toBe(
			"tbo-viec: rong 0 nhom",
		);
		const cuaB = await doc<ViecCuaBoOutput>("okr.viecCuaBo", s.quanTri.cookie, {
			cycleId: s.ky,
			unit: { loai: "pb", id: s.B },
		});
		expect(
			idViec(cuaB).includes(viecB) ? [] : ["tbo-viec: viec cua B khong hien"],
		).toEqual([]);
	});
});

describe("tbo-viec-lien-ket", () => {
	const goc = {
		id: "v1",
		tieuDe: "",
		nguoiLamUserId: null,
		hanNgay: null,
		xongLuc: null,
		campaignId: null,
		planId: null,
		nguoiLam: null,
		campaign: null,
		plan: null,
	};
	const hang: Record<string, HangViecBo> = {
		viec: { ...goc, loai: "viec", tieuDe: "Gọi khách" },
		song: {
			...goc,
			loai: "chien-dich",
			campaignId: "c1",
			campaign: { id: "c1", name: "Chiến dịch Q4", status: "RUNNING" },
		},
		xoa: { ...goc, loai: "chien-dich", campaignId: "c2" },
		keHoachXoa: { ...goc, loai: "ke-hoach", planId: "p2" },
	};
	const ra = (vai: "admin" | "okr") =>
		Object.fromEntries(
			Object.entries(hang).map(([k, h]) => {
				const v = viecBoTu(h, vai);
				return [k, { tieuDe: v.tieuDe, lienKet: v.lienKet }];
			}),
		);

	test("tbo-viec-lien-ket: viec lien ket mang lienKet de man ghi nhan da xoa hay khong co quyen, viec thuong lienKet null", () => {
		expect(ra("admin")).toEqual({
			viec: { tieuDe: "Gọi khách", lienKet: null },
			song: {
				tieuDe: "Chiến dịch Q4",
				lienKet: {
					loai: "chien-dich",
					coQuyen: true,
					id: "c1",
					ten: "Chiến dịch Q4",
					trangThai: "dang-chay",
				},
			},
			xoa: {
				tieuDe: "",
				lienKet: {
					loai: "chien-dich",
					coQuyen: true,
					id: null,
					ten: null,
					trangThai: "da-xoa",
				},
			},
			keHoachXoa: {
				tieuDe: "",
				lienKet: {
					loai: "ke-hoach",
					coQuyen: true,
					id: null,
					ten: null,
					trangThai: "da-xoa",
				},
			},
		});
		expect(ra("okr")).toEqual({
			viec: { tieuDe: "Gọi khách", lienKet: null },
			song: { tieuDe: "", lienKet: { loai: "chien-dich", coQuyen: false } },
			xoa: { tieuDe: "", lienKet: { loai: "chien-dich", coQuyen: false } },
			keHoachXoa: {
				tieuDe: "",
				lienKet: { loai: "ke-hoach", coQuyen: false },
			},
		});
	});
});
