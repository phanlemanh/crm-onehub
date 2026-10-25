import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import {
	CA_MOI_KR,
	CHA_MOI_KR,
	type DonViMoiKr,
	KR_MOI_KR,
	MOC_MOI_KR,
	type MucTieuMoiKr,
	NGUOI_MOI_KR,
	type NguoiMoiKr,
} from "../scripts/okr-mau/ca-moi-kr";
import {
	type LocMoiKr,
	type MoiKrOutput,
	moiKrOutput,
	TINH_TRANG_KR,
} from "../src/okr/okr-moi-kr.contracts";
import type { KhoiCuaToiOutput } from "../src/okr/okr-xem.contracts";
import { donSanKhep } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	dangChay,
	doc,
	dungSan,
	goi,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	taoNam,
	taoQuy,
} from "./okr-san";

dungSan();

const CHO_MS = 240_000;
const HET_HAN_PHIEN = new Date("2030-01-01T00:00:00Z");

type San = {
	ky: string;
	khoa: Record<DonViMoiKr | "goc", string>;
	nguoi: Record<NguoiMoiKr, string>;
	cookie: Record<NguoiMoiKr, string>;
	kr: Map<string, string>;
};

let san: San;

async function giaHanPhien(): Promise<void> {
	const ids = [
		phien.quan.nguoi,
		phien.thuong.nguoi,
		...(san ? Object.values(san.nguoi) : []),
	];
	await db.session.updateMany({
		where: { userId: { in: ids } },
		data: { expiresAt: HET_HAN_PHIEN },
	});
}

async function taoKy(ten: string, nam: number, tu: string, den: string) {
	const ky = await taoQuy(ten, await taoNam(`${ten}-nam`, nam), tu, den);
	await dangChay(ky);
	return ky;
}

async function gieoDonVi(): Promise<San["khoa"]> {
	const B1 = await bpMoi("mkc-b1");
	const B2 = await bpMoi("mkc-b2");
	const id = {
		B1,
		B2,
		P1: await pbMoi("mkc-p1", B1),
		P2: await pbMoi("mkc-p2", B1),
		P3: await pbMoi("mkc-p3", B2),
	};
	return {
		goc: "goc",
		B1: `bp:${id.B1}`,
		B2: `bp:${id.B2}`,
		P1: `pb:${id.P1}`,
		P2: `pb:${id.P2}`,
		P3: `pb:${id.P3}`,
	};
}

const donViVao = (m: MucTieuMoiKr, s: San) => {
	if (m.donVi === "goc") return { level: "onehub" };
	if (m.donVi === "ca-nhan")
		return { level: "ca-nhan", personUserId: s.nguoi[m.chu] };
	const [loai, id] = s.khoa[m.donVi].split(":");
	return loai === "bp"
		? { level: "bo-phan", divisionId: id }
		: { level: "phong-ban", departmentId: id };
};

const TRUONG_MOI_KR = { B1: "A", B2: "B" } as const;

function nguoiGhi(m: MucTieuMoiKr, s: San): AiHoacCookie {
	if (m.donVi === "goc") return "quan";
	if (m.donVi === "ca-nhan") return s.cookie[m.chu];
	const bp =
		m.donVi in TRUONG_MOI_KR
			? m.donVi
			: CHA_MOI_KR[m.donVi as keyof typeof CHA_MOI_KR];
	return s.cookie[TRUONG_MOI_KR[bp as keyof typeof TRUONG_MOI_KR]];
}

async function gieoMucTieu(
	m: MucTieuMoiKr,
	s: San,
	ky: { chinh: string; khac: string },
): Promise<string> {
	const ai = nguoiGhi(m, s);
	const objectiveId = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId: m.kyKhac ? ky.khac : ky.chinh,
				unit: donViVao(m, s),
				title: `Mọi KR · ${m.ma}`,
				kind: m.loai,
				ownerUserId: s.nguoi[m.chu],
				participantIds: [],
				whyNow: "",
				hienThi: m.gioiHan ? "gioi-han" : "cong-khai",
			},
			ai,
		),
		`tao ${m.ma}`,
	).id;
	for (const k of m.krs) {
		const id = ok<{ id: string }>(
			await goi(
				"okr.createKeyResult",
				{
					objectiveId,
					title: `Mọi KR · ${k.ma}`,
					kind: k.kieu,
					ownerUserId: s.nguoi[k.chu],
					startValue: 0,
					targetValue: k.kieu === "moc" ? 1 : 100,
					currentValue: k.hienTai,
					unit: "",
					dueOn: null,
					weight: 1,
				},
				ai,
			),
			`tao ${k.ma}`,
		).id;
		s.kr.set(k.ma, id);
	}
	if (m.congBo === "som" || m.congBo === "bo")
		ok(await goi("okr.publishObjective", { id: objectiveId }, ai), m.ma);
	if (m.congBo === "bo")
		ok(await goi("okr.dropObjective", { id: objectiveId }, ai), `bo ${m.ma}`);
	return objectiveId;
}

async function gieo(): Promise<void> {
	setSystemTime(MOC_MOI_KR.tao);
	await giaHanPhien();
	ok(await goi("okr.setProgram", CHUONG_TRINH_RONG), "cau hinh");
	const ky = {
		chinh: await taoKy("mkc-quy", 2026, MOC_MOI_KR.ky.tu, MOC_MOI_KR.ky.den),
		khac: await taoKy(
			"mkc-quy-ke",
			2027,
			MOC_MOI_KR.kyKhac.tu,
			MOC_MOI_KR.kyKhac.den,
		),
	};
	const khoa = await gieoDonVi();
	const nguoi = {} as Record<NguoiMoiKr, string>;
	const cookie = {} as Record<NguoiMoiKr, string>;
	for (const n of NGUOI_MOI_KR) {
		nguoi[n] = await nguoiMoi(`mkc-${n}`);
		cookie[n] = await phienCua(nguoi[n]);
	}
	san = { ky: ky.chinh, khoa, nguoi, cookie, kr: new Map() };
	await giaHanPhien();
	for (const [bp, n] of Object.entries(TRUONG_MOI_KR))
		ok(
			await goi("org.setHead", {
				kind: "division",
				id: khoa[bp as keyof typeof TRUONG_MOI_KR].slice(3),
				userId: nguoi[n],
			}),
			`truong ${bp}`,
		);
	const hoan = new Map<string, string>();
	for (const m of CA_MOI_KR) hoan.set(m.ma, await gieoMucTieu(m, san, ky));
	const s = san;
	const congBoLuc = async (luc: Date, loai: MucTieuMoiKr["congBo"]) => {
		setSystemTime(luc);
		await giaHanPhien();
		for (const m of CA_MOI_KR.filter((x) => x.congBo === loai))
			ok(
				await goi(
					"okr.publishObjective",
					{ id: hoan.get(m.ma) ?? "" },
					nguoiGhi(m, s),
				),
				m.ma,
			);
	};
	await congBoLuc(MOC_MOI_KR.muon, "muon");
	await congBoLuc(MOC_MOI_KR.doc, "luc-doc");
}

beforeAll(gieo, CHO_MS);

afterAll(async () => {
	setSystemTime();
	await donSanKhep();
});

const LOC_RONG: LocMoiKr = { tinhTrang: [], donVi: [], nguoi: [] };

async function moiKr(
	loc: Partial<LocMoiKr> = {},
	ai: AiHoacCookie = "quan",
): Promise<MoiKrOutput> {
	return moiKrOutput.parse(
		await doc("okr.moiKr", ai, {
			cycleId: san.ky,
			loc: { ...LOC_RONG, ...loc },
		}),
	);
}

const maCua = (id: string) =>
	[...san.kr.entries()].find(([, v]) => v === id)?.[0] ?? `la:${id}`;
const tapMa = (o: MoiKrOutput) =>
	o.rows.map((r) => maCua(r.keyResultId)).sort();
const CO_MAT = KR_MOI_KR.filter((k) => k.mong !== "vang");

const khoaCuaKr = (k: (typeof KR_MOI_KR)[number]): string[] => {
	const dv = k.mucTieu.donVi;
	if (dv === "ca-nhan") return [];
	if (dv === "goc") return ["goc"];
	const cha = (CHA_MOI_KR as Partial<Record<DonViMoiKr, DonViMoiKr>>)[dv];
	return cha ? [san.khoa[dv], san.khoa[cha]] : [san.khoa[dv]];
};

function khopTay(
	k: (typeof KR_MOI_KR)[number],
	loc: Partial<LocMoiKr>,
	bo?: "tinhTrang",
): boolean {
	const tt = loc.tinhTrang ?? [];
	const dv = loc.donVi ?? [];
	const ng = loc.nguoi ?? [];
	return (
		k.mong !== "vang" &&
		(bo === "tinhTrang" || tt.length === 0 || tt.some((v) => v === k.mong)) &&
		(dv.length === 0 || khoaCuaKr(k).some((x) => dv.includes(x))) &&
		(ng.length === 0 || ng.includes(san.nguoi[k.chu]))
	);
}

describe("mkc-nguon", () => {
	test("mkc-nguon: đúng tập KR cả công ty, tình trạng theo ma trận viết trước, cùng vạch với KR của tôi", async () => {
		const o = await moiKr();
		const coMat = new Set(o.rows.map((r) => r.keyResultId));
		expect(
			KR_MOI_KR.map((k) => ({
				ma: k.ma,
				co: coMat.has(san.kr.get(k.ma) ?? ""),
			})),
		).toEqual(KR_MOI_KR.map((k) => ({ ma: k.ma, co: k.mong !== "vang" })));
		expect(tapMa(o)).toEqual(CO_MAT.map((k) => k.ma).sort());
		expect(
			o.rows.map((r) => ({ ma: maCua(r.keyResultId), tt: r.tinhTrang })),
		).toEqual(
			expect.arrayContaining(CO_MAT.map((k) => ({ ma: k.ma, tt: k.mong }))),
		);
		expect(
			o.rows.filter(
				(r) =>
					r.tinhTrang === "truot" &&
					KR_MOI_KR.find((k) => k.ma === maCua(r.keyResultId))?.mucTieu.loai !==
						"cam-ket",
			),
		).toEqual([]);
		expect(o.total).toBe(o.rows.length);
		const khoi = await doc<KhoiCuaToiOutput>("okr.khoiCuaToi", san.cookie.u2, {
			cycleId: san.ky,
			userId: null,
		});
		const cuaU2 = o.rows.filter((r) => r.nguoi.id === san.nguoi.u2);
		const doiChieu = cuaU2.flatMap((r) => {
			const k = khoi.kr.find((x) => x.keyResultId === r.keyResultId);
			return k
				? [
						{
							ma: maCua(r.keyResultId),
							moiKr: { expected: r.expected, tt: r.tinhTrang },
							cuaToi: { expected: k.expected, tt: k.nhip },
						},
					]
				: [];
		});
		expect(doiChieu.length).toBeGreaterThan(0);
		expect(doiChieu.map((d) => ({ ma: d.ma, ...d.moiKr }))).toEqual(
			doiChieu.map((d) => ({ ma: d.ma, ...d.cuaToi })),
		);
		const daSo = new Set(doiChieu.map((d) => d.ma));
		const ngoaiKhoi = await Promise.all(
			cuaU2
				.filter((r) => !daSo.has(maCua(r.keyResultId)))
				.map(async (r) => {
					const mt = await doc<{ expected: number | null }>(
						"okr.objective",
						san.cookie.u2,
						{ id: r.objectiveId },
					);
					return {
						ma: maCua(r.keyResultId),
						moiKr: r.expected,
						mucTieu: r.expected === null ? null : mt.expected,
					};
				}),
		);
		expect(
			[...daSo, ...ngoaiKhoi.map((x) => x.ma)].sort(),
			"mkc-nguon: co KR cua u2 khong duoc doi chieu vach",
		).toEqual(
			CO_MAT.filter((k) => k.chu === "u2")
				.map((k) => k.ma)
				.sort(),
		);
		expect(
			ngoaiKhoi.map((x) => ({ ma: x.ma, expected: x.moiKr })),
			"mkc-nguon: vach KR ngoai khoi cua toi lech vach muc tieu",
		).toEqual(ngoaiKhoi.map((x) => ({ ma: x.ma, expected: x.mucTieu })));
		expect(
			[...daSo, ...ngoaiKhoi.map((x) => x.ma)],
			"mkc-nguon: KR cong bo muon khong duoc doi chieu",
		).toContain("muon-k1");
	});
});

describe("mkc-quyen", () => {
	test("mkc-quyen: người xem hẹp không thấy và không đếm KR của OKR giới hạn", async () => {
		const quan = await moiKr();
		const hep = await moiKr({}, "thuong");
		const gioiHan = san.kr.get("gioi-han-k1") ?? "";
		const mo = san.kr.get("p1-k1") ?? "";
		const so = (o: MoiKrOutput, v: string) =>
			o.facetCounts.tinhTrang.find((d) => d.value === v)?.count ?? 0;
		const dv = (o: MoiKrOutput, khoa: string) =>
			o.facetCounts.donVi.find((d) => d.value === khoa)?.count ?? 0;
		const ng = (o: MoiKrOutput, id: string) =>
			o.facetCounts.nguoi.find((d) => d.value === id)?.count ?? 0;
		expect({
			quanThay: quan.rows.some((r) => r.keyResultId === gioiHan),
			hepThay: hep.rows.some((r) => r.keyResultId === gioiHan),
			moQuan: quan.rows.some((r) => r.keyResultId === mo),
			moHep: hep.rows.some((r) => r.keyResultId === mo),
			truotLech: so(quan, "truot") - so(hep, "truot"),
			p1Lech: dv(quan, san.khoa.P1) - dv(hep, san.khoa.P1),
			b1Lech: dv(quan, san.khoa.B1) - dv(hep, san.khoa.B1),
			bLech: ng(quan, san.nguoi.B) - ng(hep, san.nguoi.B),
		}).toEqual({
			quanThay: true,
			hepThay: false,
			moQuan: true,
			moHep: true,
			truotLech: 1,
			p1Lech: 1,
			b1Lech: 1,
			bLech: 1,
		});
	});
});

describe("mkc-loc-tinh-trang", () => {
	test("mkc-loc-tinh-trang: lọc theo tình trạng và đếm chip trên tập đã lọc theo đơn vị và người", async () => {
		const MA_TRAN: Partial<LocMoiKr>[] = [
			{ tinhTrang: ["truot"] },
			{ tinhTrang: ["cham-nhip", "truot"] },
			{ tinhTrang: ["moc-chua"] },
			{ tinhTrang: [] },
			{ donVi: [san.khoa.B1], tinhTrang: ["truot"] },
			{ nguoi: [san.nguoi.u2] },
		];
		for (const loc of MA_TRAN) {
			const o = await moiKr(loc);
			expect({ loc, ma: tapMa(o) }).toEqual({
				loc,
				ma: KR_MOI_KR.filter((k) => khopTay(k, loc))
					.map((k) => k.ma)
					.sort(),
			});
			expect({ loc, dem: o.facetCounts.tinhTrang }).toEqual({
				loc,
				dem: TINH_TRANG_KR.map((value) => ({
					value,
					count: KR_MOI_KR.filter(
						(k) => khopTay(k, loc, "tinhTrang") && k.mong === value,
					).length,
				})),
			});
		}
	});
});

describe("mkc-loc-don-vi", () => {
	test("mkc-loc-don-vi: bộ phận gồm phòng ban con, phòng ban chỉ chính nó, OneHub chỉ cấp OneHub", async () => {
		const B1 = ["b1-k1", "p1-k1", "p1-k2", "p2-k1", "moi-k1", "gioi-han-k1"];
		const MA_TRAN: { donVi: DonViMoiKr[] | ["goc"]; mong: string[] }[] = [
			{ donVi: ["B1"], mong: B1 },
			{ donVi: ["P1"], mong: ["p1-k1", "p1-k2", "gioi-han-k1"] },
			{ donVi: ["goc"], mong: ["goc-k1", "moc-k1", "moc-k2"] },
		];
		for (const d of MA_TRAN) {
			const o = await moiKr({ donVi: d.donVi.map((x) => san.khoa[x]) });
			expect({ donVi: d.donVi, ma: tapMa(o) }).toEqual({
				donVi: d.donVi,
				ma: [...d.mong].sort(),
			});
		}
		const hai = await moiKr({ donVi: [san.khoa.B1, san.khoa.P3] });
		expect(tapMa(hai)).toEqual([...B1, "p3-k1", "muon-k1"].sort());
	});
});

describe("mkc-loc-nguoi", () => {
	test("mkc-loc-nguoi: lọc theo người phụ trách KR, không theo chủ mục tiêu", async () => {
		const ten = await db.user.findUniqueOrThrow({
			where: { id: san.nguoi.B },
			select: { name: true },
		});
		const theoB = await moiKr({ nguoi: [san.nguoi.B] });
		const theoA = await moiKr({ nguoi: [san.nguoi.A] });
		expect({ B: tapMa(theoB), A: tapMa(theoA) }).toEqual({
			B: ["p1-k1", "b2-k1", "moi-k1", "gioi-han-k1"].sort(),
			A: ["goc-k1", "p2-k1", "moc-k1", "moc-k2"].sort(),
		});
		expect(
			(await moiKr()).facetCounts.nguoi.find((d) => d.value === san.nguoi.B),
		).toEqual({ value: san.nguoi.B, count: 4, name: ten.name });
	});
});
