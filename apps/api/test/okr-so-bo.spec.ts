import { beforeAll, describe, expect, test } from "bun:test";
import type {
	DanhSachOutput,
	SoBoOutput,
	ToanCanhOutput,
} from "../src/okr/okr-xem.contracts";
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

type Nguoi = { nguoi: string; cookie: AiHoacCookie };
type MucTieuGieo = { id: string; kr: string[] };

type San = {
	ky: string;
	X: string;
	A: string;
	U: Nguoi;
	quanTri: Nguoi;
	ngoai: Nguoi;
};

const idCua = (tra: Awaited<ReturnType<typeof goi>>, nhan: string) =>
	ok<{ id: string }>(tra, nhan).id;

async function mucTieu(
	cycleId: string,
	unit: Json,
	chu: Nguoi,
	chuKr: string[],
	congBo: boolean,
): Promise<MucTieuGieo> {
	const id = idCua(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("bco muc tieu"),
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
	for (const [i, nguoiKr] of chuKr.entries())
		kr.push(
			idCua(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: id,
						title: ma("bco kr"),
						kind: "tang-toi",
						ownerUserId: nguoiKr,
						startValue: 0,
						targetValue: 100,
						currentValue: 15 * (i + 1),
						unit: "",
						dueOn: null,
						weight: 1,
					},
					chu.cookie,
				),
				"tao kr",
			),
		);
	if (congBo)
		ok(await goi("okr.publishObjective", { id }, chu.cookie), "cong bo");
	return { id, kr };
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

async function gieo(): Promise<San> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const ky = await kyDangChay("bco");
	const X = await bpMoi("bco-X");
	const A = await pbMoi("bco-A", X);
	const truongX = await truongMoi("division", X, "bco-truong-X");
	const truongA = await truongMoi("department", A, "bco-truong-A");
	const u = await nguoiMoi("bco-U");
	const U = { nguoi: u, cookie: await phienCua(u) };
	const quanTri = { nguoi: phien.quan.nguoi, cookie: "quan" };
	await mucTieu(ky, { level: "onehub" }, quanTri, [quanTri.nguoi], true);
	await mucTieu(
		ky,
		{ level: "bo-phan", divisionId: X },
		truongX,
		[truongX.nguoi],
		true,
	);
	await mucTieu(
		ky,
		{ level: "phong-ban", departmentId: A },
		truongA,
		[truongA.nguoi, truongA.nguoi],
		true,
	);
	await mucTieu(
		ky,
		{ level: "phong-ban", departmentId: A },
		truongA,
		[U.nguoi],
		true,
	);
	const caNhan = await mucTieu(
		ky,
		{ level: "ca-nhan", personUserId: U.nguoi },
		U,
		[U.nguoi, U.nguoi],
		true,
	);
	await mucTieu(
		ky,
		{ level: "ca-nhan", personUserId: U.nguoi },
		U,
		[U.nguoi],
		false,
	);
	const krThap = caNhan.kr[0];
	if (krThap === undefined) throw new Error("bco: thieu KR thap");
	await capNhatThap(krThap, U.cookie);
	const gioiHan = await mucTieu(
		ky,
		{ level: "ca-nhan", personUserId: U.nguoi },
		U,
		[U.nguoi],
		true,
	);
	ok(
		await goi(
			"okr.datHienThi",
			{ objectiveId: gioiHan.id, hienThi: "gioi-han", nguoiXem: [] },
			U.cookie,
		),
		"gioi han",
	);
	const n = await nguoiMoi("bco-ngoai");
	const ngoai = { nguoi: n, cookie: await phienCua(n) };
	return { ky, X, A, U, quanTri, ngoai };
}

let hua: Promise<San> | null = null;
const san = () => {
	hua ??= gieo();
	return hua;
};

type Unit =
	| { loai: "goc" }
	| { loai: "bp"; id: string }
	| { loai: "pb"; id: string }
	| { loai: "nguoi"; id: string };

type TruongSo = "tienDo" | "kyVong" | "soKr" | "daCapNhat" | "thap";

const khoa = (u: Unit) => (u.loai === "goc" ? "goc" : `${u.loai}:${u.id}`);

const giaTri = (so: SoBoOutput, t: TruongSo) =>
	t === "thap" ? so.tuTin.thap : so[t];

const trungBinh = (so: number[]) =>
	so.length === 0
		? null
		: Math.round(so.reduce((a, b) => a + b, 0) / so.length);

type MongDoi = Record<TruongSo, number | null>;

function mongDoiNguoi(ds: DanhSachOutput): MongDoi {
	const congBo = ds.rows.filter((m) => m.status !== "nhap");
	return {
		tienDo: trungBinh(congBo.map((m) => m.progress)),
		kyVong: trungBinh(
			congBo.flatMap((m) => (m.expected === null ? [] : [m.expected])),
		),
		soKr: 4,
		daCapNhat: 1,
		thap: 1,
	};
}

function mongDoiDonVi(tc: ToanCanhOutput, k: string): MongDoi | null {
	const h = tc.hang.find((x) => x.key === k);
	if (!h) return null;
	return {
		tienDo: h.tienDo,
		kyVong: h.kyVong,
		soKr: h.soKr,
		daCapNhat: h.daCapNhat,
		thap: h.tuTin.thap,
	};
}

const TRUONG: TruongSo[] = ["tienDo", "kyVong", "soKr", "daCapNhat", "thap"];

function lech(
	maTran: { unit: Unit; mong: MongDoi | null }[],
	soCua: (u: Unit) => SoBoOutput | null,
): string[] {
	const loi: string[] = [];
	for (const { unit, mong } of maTran) {
		const so = soCua(unit);
		for (const t of TRUONG) {
			const thuc = so === null ? null : giaTri(so, t);
			if (mong === null || thuc !== mong[t])
				loi.push(`bco-so-bo: ${khoa(unit)}/${t} lech`);
		}
	}
	return loi;
}

async function docMaTran(s: San) {
	const units: Unit[] = [
		{ loai: "goc" },
		{ loai: "bp", id: s.X },
		{ loai: "pb", id: s.A },
		{ loai: "nguoi", id: s.U.nguoi },
	];
	const [tc, dsNguoi, ...so] = await Promise.all([
		doc<ToanCanhOutput>("okr.toanCanh", s.quanTri.cookie, { cycleId: s.ky }),
		doc<DanhSachOutput>("okr.danhSach", s.quanTri.cookie, {
			cycleId: s.ky,
			unit: { loai: "nguoi", id: s.U.nguoi },
			loc: { phuTrach: [], loai: [], trangThai: [] },
		}),
		...units.map((unit) =>
			doc<SoBoOutput>("okr.soBo", s.quanTri.cookie, { cycleId: s.ky, unit }),
		),
	]);
	const soTheo = new Map(units.map((u, i) => [khoa(u), so[i] ?? null]));
	const maTran = units.map((unit) => ({
		unit,
		mong:
			unit.loai === "nguoi"
				? mongDoiNguoi(dsNguoi)
				: mongDoiDonVi(tc, khoa(unit)),
	}));
	return { tc, maTran, soTheo };
}

describe("bco-so-bo", () => {
	beforeAll(async () => {
		await san();
	}, GIEO_MS);

	test("bco-so-bo: so cua goc, bp, pb bang hang toanCanh; nguoi tinh tren muc tieu cong bo cua bo ca nhan", async () => {
		const { maTran, soTheo } = await docMaTran(await san());
		expect(lech(maTran, (u) => soTheo.get(khoa(u)) ?? null)).toEqual([]);
	});

	test("bco-so-bo-do: ban tra hang toanCanh theo khoa thay vi tinh tren tap cua bo thi bo ca nhan lech", async () => {
		const { tc, maTran } = await docMaTran(await san());
		const traHang = (u: Unit): SoBoOutput | null => {
			const h = tc.hang.find((x) => x.key === khoa(u));
			return h
				? {
						tienDo: h.tienDo,
						kyVong: h.kyVong,
						soMucTieu: h.soMucTieu,
						soKr: h.soKr,
						tuTin: h.tuTin,
						daCapNhat: h.daCapNhat,
					}
				: null;
		};
		const loi = lech(maTran, traHang);
		expect(loi).toContain(
			`bco-so-bo: nguoi:${(await san()).U.nguoi}/soKr lech`,
		);
		expect(loi.every((l) => l.includes("nguoi:"))).toBe(true);
	});

	test("bco-so-bo-do: dem bo ca nhan tren tap cong khai (so-gop) thi bo sot muc tieu gioi han va soKr lech", async () => {
		const s = await san();
		const { maTran, soTheo } = await docMaTran(s);
		const congKhai = await doc<SoBoOutput>("okr.soBo", s.ngoai.cookie, {
			cycleId: s.ky,
			unit: { loai: "nguoi", id: s.U.nguoi },
		});
		const loi = lech(maTran, (u) =>
			u.loai === "nguoi" ? congKhai : (soTheo.get(khoa(u)) ?? null),
		);
		expect(loi).toContain(`bco-so-bo: nguoi:${s.U.nguoi}/soKr lech`);
	});
});
