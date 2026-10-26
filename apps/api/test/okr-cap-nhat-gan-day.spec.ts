import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db, setPrismaLogSink } from "@crm/db";
import type { PhamViBo } from "@crm/validation/okr-tham-so";
import {
	BINH_LUAN_CNG,
	type DonViCng,
	LAN_CNG,
	MOC_CNG,
	MUC_TIEU_CNG,
	type MucTieuCng,
	NGUOI_CNG,
	type NguoiCng,
	THEO_DOI_CNG,
	TRANG_CNG,
	TRUONG_CNG,
} from "../scripts/okr-mau/ca-cap-nhat-gan-day";
import { nguoiDuocNhac, traLoiTu } from "../src/okr/cap-nhat-gan-day";
import {
	type CapNhatGanDayOutput,
	capNhatGanDayOutput,
	type DongCapNhat,
} from "../src/okr/okr-cap-nhat-gan-day.contracts";
import { OKR_XEM } from "../src/okr/okr-xem.config";
import { donSanKhep } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	dangChay,
	datViTri,
	doc,
	dungSan,
	goi,
	goiQuery,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	taoNam,
	taoQuy,
} from "./okr-san";

dungSan();

const CHO_MS = 300_000;
const HET_HAN_PHIEN = new Date("2030-01-01T00:00:00Z");

type San = {
	ky: { chinh: string; khac: string; trang: string };
	don: Record<DonViCng, string>;
	nguoi: Record<NguoiCng, string>;
	cookie: Record<NguoiCng, string>;
	mucTieu: Map<string, string>;
	kr: Map<string, string>;
	lan: Map<string, string>;
	binhLuan: Map<string, string>;
};

let san: San;

async function giaHanPhien(): Promise<void> {
	const ids = [phien.quan.nguoi, ...(san ? Object.values(san.nguoi) : [])];
	await db.session.updateMany({
		where: { userId: { in: ids } },
		data: { expiresAt: HET_HAN_PHIEN },
	});
}

async function luc(iso: string | Date): Promise<void> {
	setSystemTime(new Date(iso));
	await giaHanPhien();
}

async function taoKy(ten: string, nam: number, tu: string, den: string) {
	const ky = await taoQuy(ten, await taoNam(`${ten}-nam`, nam), tu, den);
	await dangChay(ky);
	return ky;
}

const nguoiTaoMucTieu = (m: MucTieuCng): NguoiCng | "quan" => {
	if (m.donVi === "goc") return "quan";
	if (m.donVi === "ca-nhan") return m.chu;
	if (m.donVi === "B1" || m.donVi === "P1" || m.donVi === "P2") return "A";
	return "B";
};

const cookieCua = (ai: NguoiCng | "quan"): AiHoacCookie =>
	ai === "quan" ? "quan" : san.cookie[ai];

function donViVao(m: MucTieuCng) {
	if (m.donVi === "goc") return { level: "onehub" };
	if (m.donVi === "ca-nhan")
		return { level: "ca-nhan", personUserId: san.nguoi[m.chu] };
	return m.donVi.startsWith("B")
		? { level: "bo-phan", divisionId: san.don[m.donVi] }
		: { level: "phong-ban", departmentId: san.don[m.donVi] };
}

async function taoMucTieu(m: MucTieuCng, cycleId: string): Promise<string> {
	const ai = cookieCua(nguoiTaoMucTieu(m));
	const id = ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit: donViVao(m),
				title: `Cập nhật gần đây · ${m.ma}`,
				kind: "cam-ket",
				ownerUserId: san.nguoi[m.chu],
				participantIds: [],
				whyNow: "",
				hienThi: m.gioiHan ? "gioi-han" : "cong-khai",
			},
			ai,
		),
		`tao ${m.ma}`,
	).id;
	for (const k of m.krs)
		san.kr.set(
			k.ma,
			ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: id,
						title: `KR cập nhật · ${k.ma}`,
						kind: k.kieu,
						ownerUserId: san.nguoi[k.chu],
						startValue: 0,
						targetValue: k.kieu === "moc" ? 1 : 100,
						currentValue: 0,
						unit: "",
						dueOn: null,
						weight: 1,
					},
					ai,
				),
				`tao ${k.ma}`,
			).id,
		);
	ok(await goi("okr.publishObjective", { id }, ai), `cong bo ${m.ma}`);
	return id;
}

async function guiLan(
	ai: AiHoacCookie,
	items: {
		keyResultId: string;
		value: number;
		confidence: string;
		note: string;
	}[],
	nhan: string,
): Promise<string[]> {
	const sessionId = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }, ai),
		`mo ${nhan}`,
	).sessionId;
	ok(await goi("okr.guiCapNhat", { sessionId, items }, ai), nhan);
	const dong = await db.okrCheckIn.findMany({
		where: { sessionId },
		select: { id: true, keyResultId: true },
	});
	return items.map(
		(m) => dong.find((d) => d.keyResultId === m.keyResultId)?.id ?? "",
	);
}

async function gieo(): Promise<void> {
	await luc(MOC_CNG.tao);
	ok(await goi("okr.setProgram", CHUONG_TRINH_RONG), "cau hinh");
	const ky = {
		chinh: await taoKy("cng-quy", 2026, MOC_CNG.ky.tu, MOC_CNG.ky.den),
		khac: await taoKy("cng-ke", 2027, MOC_CNG.kyKhac.tu, MOC_CNG.kyKhac.den),
		trang: await taoKy(
			"cng-trang",
			2027,
			MOC_CNG.kyTrang.tu,
			MOC_CNG.kyTrang.den,
		),
	};
	const B1 = await bpMoi("cng-b1");
	const B2 = await bpMoi("cng-b2");
	const don = {
		B1,
		B2,
		P1: await pbMoi("cng-p1", B1),
		P2: await pbMoi("cng-p2", B1),
		P3: await pbMoi("cng-p3", B2),
	};
	const nguoi = {} as Record<NguoiCng, string>;
	const cookie = {} as Record<NguoiCng, string>;
	for (const n of NGUOI_CNG) {
		nguoi[n] = await nguoiMoi(`cng-${n}`);
		cookie[n] = await phienCua(nguoi[n]);
	}
	san = {
		ky,
		don,
		nguoi,
		cookie,
		mucTieu: new Map(),
		kr: new Map(),
		lan: new Map(),
		binhLuan: new Map(),
	};
	await giaHanPhien();
	for (const [dv, n] of Object.entries(TRUONG_CNG)) {
		const kind = dv.startsWith("B") ? "division" : "department";
		const id = don[dv as DonViCng];
		if (kind === "department") ok(await datViTri(nguoi[n], id), `xep ${n}`);
		ok(
			await goi("org.setHead", { kind, id, userId: nguoi[n] }),
			`truong ${dv}`,
		);
	}
	for (const m of MUC_TIEU_CNG)
		san.mucTieu.set(
			m.ma,
			await taoMucTieu(m, m.ky === "chinh" ? ky.chinh : ky.khac),
		);
	for (const f of THEO_DOI_CNG)
		ok(
			await goi(
				"okr.follow",
				{ objectiveId: san.mucTieu.get(f.mucTieu) ?? "", on: true },
				cookie[f.ai],
			),
			`theo doi ${f.mucTieu}`,
		);
	for (const l of LAN_CNG) {
		await luc(l.luc);
		const [id] = await guiLan(
			cookie[l.ai],
			[
				{
					keyResultId: san.kr.get(l.kr) ?? "",
					value: l.giaTri,
					confidence: l.tuTin,
					note: l.ghiChu,
				},
			],
			l.ma,
		);
		san.lan.set(l.ma, id ?? "");
	}
	await luc(MOC_CNG.bo);
	ok(
		await goi(
			"okr.dropObjective",
			{ id: san.mucTieu.get("bo") ?? "" },
			cookie.H,
		),
		"bo",
	);
	for (const c of BINH_LUAN_CNG) {
		await luc(c.luc);
		const tra = ok<{ id: string }>(
			await goi(
				"okr.addComment",
				{
					objectiveId: san.mucTieu.get(c.mucTieu) ?? "",
					keyResultId: c.kr ? san.kr.get(c.kr) : undefined,
					body: `Bình luận ${c.ma}`,
					mentionUserIds: [],
				},
				cookie[c.ai],
			),
			c.ma,
		);
		san.binhLuan.set(c.ma, tra.id);
	}
	await luc(MOC_CNG.doc);
}

beforeAll(gieo, CHO_MS);

afterAll(async () => {
	setSystemTime();
	await donSanKhep();
});

async function capNhat(
	ai: AiHoacCookie,
	phamVi: PhamViBo = "tat-ca",
	trang = 1,
	cycleId = san.ky.chinh,
): Promise<CapNhatGanDayOutput> {
	return capNhatGanDayOutput.parse(
		await doc("okr.capNhatGanDay", ai, { cycleId, phamVi, trang }),
	);
}

async function moiTrang(
	ai: AiHoacCookie,
	phamVi: PhamViBo = "tat-ca",
	cycleId = san.ky.chinh,
): Promise<DongCapNhat[]> {
	const dau = await capNhat(ai, phamVi, 1, cycleId);
	const so = Math.ceil(dau.total / dau.coTrang);
	const sau = [];
	for (let t = 2; t <= so; t += 1)
		sau.push(...(await capNhat(ai, phamVi, t, cycleId)).rows);
	return [...dau.rows, ...sau];
}

const maLan = (id: string) =>
	[...san.lan.entries()].find(([, v]) => v === id)?.[0] ?? `la:${id}`;
const maCua = (rows: DongCapNhat[]) => rows.map((r) => maLan(r.checkInId));
const LAN_CO = LAN_CNG.filter((l) => l.mong === "co");
const MOI_TRUOC = [...LAN_CO]
	.sort((a, b) => b.luc.localeCompare(a.luc))
	.map((l) => l.ma);
const KIN = ["l-p3g-1", "l-p3g-2"];

describe("cng-nguon", () => {
	test("dong tin gom dung moi lan cap nhat cua chu ky, moi nhat truoc", async () => {
		const rows = await moiTrang("quan");
		expect(maCua(rows).sort()).toEqual(LAN_CO.map((l) => l.ma).sort());
		for (const vang of LAN_CNG.filter((l) => l.mong === "vang"))
			expect(maCua(rows)).not.toContain(vang.ma);
		expect(maCua(rows)).toEqual(MOI_TRUOC);
		const dau = await capNhat("quan");
		expect(dau.total).toBe(LAN_CO.length);
	});

	test("moi dong mang dung nguoi, gia tri, muc tu tin, ghi chu", async () => {
		const rows = await moiTrang("quan");
		for (const l of LAN_CO) {
			const r = rows.find((x) => maLan(x.checkInId) === l.ma);
			expect({ ma: l.ma, gt: r?.giaTri, tt: r?.tuTin, gc: r?.ghiChu }).toEqual({
				ma: l.ma,
				gt: l.giaTri,
				tt: l.tuTin,
				gc: l.ghiChu,
			});
			expect(r?.luc).toBe(new Date(l.luc).toISOString());
		}
		const thay = rows.find((x) => maLan(x.checkInId) === "l-p1a-2");
		expect(thay?.nguoi.id).toBe(san.nguoi.H);
		expect(thay?.thayCho?.id).toBe(san.nguoi.U);
		const tu = rows.find((x) => maLan(x.checkInId) === "l-p1a-1");
		expect(tu?.thayCho).toBeNull();
		const moc = rows.find((x) => maLan(x.checkInId) === "l-p1m");
		expect(moc?.kr.kieu).toBe("moc");
		const b1 = rows.find((x) => maLan(x.checkInId) === "l-b1-2");
		expect(b1?.bo.khoa).toBe(`bp:${san.don.B1}`);
		expect(b1?.mucTieu.id).toBe(san.mucTieu.get("b1"));
	});
});

describe("cng-quyen", () => {
	test("nguoi xem hep khong thay lan cap nhat cua OKR gioi han", async () => {
		const quan = await capNhat("quan");
		const hep = await capNhat(san.cookie.N);
		const rowsHep = await moiTrang(san.cookie.N);
		for (const ma of KIN) expect(maCua(rowsHep)).not.toContain(ma);
		expect(maCua(rowsHep)).toContain("l-p3o");
		expect(quan.total - hep.total).toBe(2);
		const demTatCa = (o: CapNhatGanDayOutput) =>
			o.facetCounts.phamVi.find((p) => p.value === "tat-ca")?.count;
		expect((demTatCa(quan) ?? 0) - (demTatCa(hep) ?? 0)).toBe(2);
		const rowsQuan = await moiTrang("quan");
		for (const ma of KIN) expect(maCua(rowsQuan)).toContain(ma);
	});

	test("chip Dang theo doi khong lo OKR gioi han", async () => {
		const hep = await capNhat(san.cookie.N, "theo-doi");
		expect(maCua(hep.rows)).toEqual(["l-p3o"]);
		const so = hep.facetCounts.phamVi.find((p) => p.value === "theo-doi");
		expect(`theo-doi=${so?.count}`).toBe("theo-doi=1");
	});
});

describe("cng-pham-vi", () => {
	const MA_TRAN: {
		ai: NguoiCng | "quan";
		phamVi: PhamViBo;
		mong: string[];
	}[] = [
		{ ai: "A", phamVi: "toi-dan", mong: ["l-b1-1", "l-b1-2"] },
		{ ai: "A", phamVi: "theo-doi", mong: [] },
		{
			ai: "A",
			phamVi: "tat-ca",
			mong: MOI_TRUOC.filter((m) => !KIN.includes(m)),
		},
		{ ai: "H", phamVi: "toi-dan", mong: ["l-p1a-1", "l-p1a-2", "l-p1m"] },
		{ ai: "H", phamVi: "theo-doi", mong: [] },
		{
			ai: "H",
			phamVi: "tat-ca",
			mong: MOI_TRUOC.filter((m) => !KIN.includes(m)),
		},
		{ ai: "T", phamVi: "toi-dan", mong: ["l-p3o", "l-p3g-1", "l-p3g-2"] },
		{ ai: "T", phamVi: "theo-doi", mong: ["l-p2a", "l-p2b"] },
		{ ai: "T", phamVi: "tat-ca", mong: MOI_TRUOC },
		{ ai: "X", phamVi: "toi-dan", mong: [] },
		{ ai: "X", phamVi: "theo-doi", mong: [] },
		{
			ai: "X",
			phamVi: "tat-ca",
			mong: MOI_TRUOC.filter((m) => !KIN.includes(m)),
		},
		{ ai: "quan", phamVi: "toi-dan", mong: [] },
		{ ai: "quan", phamVi: "theo-doi", mong: [] },
		{ ai: "quan", phamVi: "tat-ca", mong: MOI_TRUOC },
	];

	for (const d of MA_TRAN)
		test(`${d.ai} ${d.phamVi}`, async () => {
			const ai = cookieCua(d.ai);
			const rows = await moiTrang(ai, d.phamVi);
			expect(maCua(rows).sort()).toEqual([...d.mong].sort());
			const dau = await capNhat(ai, d.phamVi);
			const so = dau.facetCounts.phamVi.find((p) => p.value === d.phamVi);
			expect(so?.count).toBe(dau.total);
			expect(dau.total).toBe(d.mong.length);
		});
});

describe("cng-trang", () => {
	const DEM_DUOC = process.env.PRISMA_LOG_QUERIES === "true";
	const krTrang: string[] = [];
	let tatCaTrang: string[] = [];

	async function themPhien(soPhien: number, krs: string[], tu: number) {
		const them: string[] = [];
		for (let i = 0; i < soPhien; i += 1) {
			await luc(new Date(Date.UTC(2027, 3, 2, 0, tu + i)));
			them.push(
				...(await guiLan(
					san.cookie.A,
					krs.map((k, j) => ({
						keyResultId: k,
						value: i + j,
						confidence: "vua",
						note: "",
					})),
					`trang ${tu + i}`,
				)),
			);
		}
		return them;
	}

	async function mucTieuTrang(departmentId: string, ma: string) {
		const id = ok<{ id: string }>(
			await goi(
				"okr.createObjective",
				{
					cycleId: san.ky.trang,
					unit: { level: "phong-ban", departmentId },
					title: `Trang · ${ma}`,
					kind: "cam-ket",
					ownerUserId: san.nguoi.A,
					participantIds: [],
					whyNow: "",
					hienThi: "cong-khai",
				},
				san.cookie.A,
			),
			`tao trang ${ma}`,
		).id;
		const kr = ok<{ id: string }>(
			await goi(
				"okr.createKeyResult",
				{
					objectiveId: id,
					title: `KR trang · ${ma}`,
					kind: "tang-toi",
					ownerUserId: san.nguoi.A,
					startValue: 0,
					targetValue: 100,
					currentValue: 0,
					unit: "",
					dueOn: null,
					weight: 1,
				},
				san.cookie.A,
			),
			`kr trang ${ma}`,
		).id;
		ok(
			await goi("okr.publishObjective", { id }, san.cookie.A),
			`cong bo trang ${ma}`,
		);
		return kr;
	}

	async function demTruyVan(): Promise<number> {
		let cau = 0;
		setPrismaLogSink((r) => {
			if (r.level === "query") cau += 1;
		});
		const tra = await goiQuery("okr.capNhatGanDay", "quan", {
			cycleId: san.ky.trang,
			phamVi: "tat-ca",
			trang: 1,
		});
		setPrismaLogSink(null);
		expect(tra.status).toBe(200);
		return cau;
	}

	beforeAll(async () => {
		await luc(new Date(Date.UTC(2027, 3, 1, 1)));
		for (const ma of ["t1", "t2", "t3"])
			krTrang.push(await mucTieuTrang(san.don.P1, ma));
		tatCaTrang = await themPhien(TRANG_CNG.soPhien, krTrang, 0);
	}, CHO_MS);

	test("ba trang noi nhau khong trung khong sot", async () => {
		const co = OKR_XEM.capNhatGanDay.coTrang;
		const tong = TRANG_CNG.soPhien * TRANG_CNG.krMoiPhien;
		const so = [1, 2, 3, 4].map((t) =>
			capNhat("quan", "tat-ca", t, san.ky.trang),
		);
		const [t1, t2, t3, t4] = await Promise.all(so);
		expect([t1, t2, t3, t4].map((t) => t?.rows.length)).toEqual([
			co,
			co,
			tong - 2 * co,
			0,
		]);
		expect(t4?.total).toBe(tong);
		const gop = [t1, t2, t3].flatMap(
			(t) => t?.rows.map((r) => r.checkInId) ?? [],
		);
		expect(new Set(gop).size).toBe(tong);
		expect([...gop].sort()).toEqual([...tatCaTrang].sort());
	});

	test.if(DEM_DUOC)(
		"so truy van khong doi khi them lan cap nhat va don vi",
		async () => {
			const truoc = await demTruyVan();
			await luc(new Date(Date.UTC(2027, 3, 3, 1)));
			const them = [...krTrang];
			for (let i = 0; i < TRANG_CNG.themDonVi; i += 1)
				them.push(
					await mucTieuTrang(
						await pbMoi(`cng-them-${i}`, san.don.B1),
						`them-${i}`,
					),
				);
			await themPhien(
				TRANG_CNG.themPhien,
				them.slice(0, TRANG_CNG.themKrMoiPhien),
				100,
			);
			const sau = await demTruyVan();
			expect(`truoc=${truoc} sau=${sau}`).toBe(`truoc=${truoc} sau=${truoc}`);
		},
	);
});

describe("cng-tra-loi", () => {
	test("tien de: hai dau ranh gioi cung mot dong ho ghim", async () => {
		const bl = await db.okrComment.findUnique({
			where: { id: san.binhLuan.get("c-1300") ?? "" },
			select: { createdAt: true },
		});
		expect(bl?.createdAt.toISOString()).toBe("2026-10-20T06:00:00.000Z");
		const lan = await db.okrCheckIn.findUnique({
			where: { id: san.lan.get("l-b1-2") ?? "" },
			select: { session: { select: { submittedAt: true } } },
		});
		expect(lan?.session.submittedAt?.toISOString()).toBe(
			"2026-10-20T05:00:00.000Z",
		);
	});

	test("tra loi chi o lan moi nhat, tu thoi diem lan do", async () => {
		const rows = await moiTrang(san.cookie.A);
		const t2 = rows.find((r) => maLan(r.checkInId) === "l-b1-2");
		const t1 = rows.find((r) => maLan(r.checkInId) === "l-b1-1");
		expect(t2?.moiNhat).toBe(true);
		expect(t1?.moiNhat).toBe(false);
		expect(t2?.traLoi.map((b) => b.id)).toEqual([
			san.binhLuan.get("c-1300") ?? "",
		]);
		expect(t1?.traLoi).toEqual([]);
		expect(t2?.mentionNguoiCapNhat).toBe(san.nguoi.U);
		expect(t1?.mentionNguoiCapNhat).toBeNull();
	});

	test("tra loi moi hien duoi lan moi nhat va o the Trao doi", async () => {
		await luc("2026-10-20T07:00:00Z");
		const tra = ok<{ id: string }>(
			await goi(
				"okr.addComment",
				{
					objectiveId: san.mucTieu.get("b1") ?? "",
					keyResultId: san.kr.get("b1"),
					body: "Trả lời lúc 14 giờ",
					mentionUserIds: [san.nguoi.U],
				},
				san.cookie.A,
			),
			"tra loi 14h",
		);
		await luc(MOC_CNG.doc);
		const rows = await moiTrang(san.cookie.A);
		const t2 = rows.find((r) => maLan(r.checkInId) === "l-b1-2");
		expect(t2?.traLoi.map((b) => b.id)).toEqual([
			san.binhLuan.get("c-1300") ?? "",
			tra.id,
		]);
		const traoDoi = await doc<{
			comments: {
				id: string;
				keyResultId: string | null;
				keyResultTitle: string | null;
			}[];
		}>("okr.comments", san.cookie.A, {
			objectiveId: san.mucTieu.get("b1") ?? "",
		});
		const bl = traoDoi.comments.find((c) => c.id === tra.id);
		expect(bl?.keyResultId).toBe(san.kr.get("b1") ?? "");
		expect(bl?.keyResultTitle).toBe("KR cập nhật · b1");
	});

	test("nguoi tra loi la chinh nguoi cap nhat thi khong nhac", async () => {
		const rows = await moiTrang(san.cookie.U);
		const t2 = rows.find((r) => maLan(r.checkInId) === "l-b1-2");
		expect(t2?.mentionNguoiCapNhat).toBeNull();
	});

	test("phan thuan: ranh gioi va nhac ten", () => {
		const b = (iso: string) => ({ createdAt: new Date(iso) });
		expect(
			traLoiTu(
				[b("2026-10-20T06:00:00Z"), b("2026-10-20T04:00:00Z")],
				new Date("2026-10-20T05:00:00Z"),
			).map((x) => x.createdAt.toISOString()),
		).toEqual(["2026-10-20T06:00:00.000Z"]);
		expect(nguoiDuocNhac("u", "v", new Set(["u"]))).toBe("u");
		expect(nguoiDuocNhac("u", "u", new Set(["u"]))).toBeNull();
		expect(nguoiDuocNhac("u", "v", new Set())).toBeNull();
	});

	test("chu ky da an: tra loi bi tu choi bang cau cua may chu", async () => {
		const truoc = maCua(await moiTrang("quan"));
		ok(
			await goi("okr.anChuKy", {
				id: san.ky.khac,
				lyDo: "Chu kỳ tạo nhầm khi thử dòng tin.",
			}),
			"an ky khac",
		);
		const tra = await goi(
			"okr.addComment",
			{
				objectiveId: san.mucTieu.get("kh") ?? "",
				keyResultId: san.kr.get("kh"),
				body: "Trả lời vào chu kỳ đã ẩn",
				mentionUserIds: [],
			},
			san.cookie.B,
		);
		expect(tra.status).not.toBe(200);
		expect(tra.loi.length).toBeGreaterThan(0);
		expect(maCua(await moiTrang("quan"))).toEqual(truoc);
	});

	test("nguoi cap nhat khong con la thanh vien thi khong nhac", async () => {
		await db.member.deleteMany({ where: { userId: san.nguoi.U } });
		const rows = await moiTrang(san.cookie.A);
		const t2 = rows.find((r) => maLan(r.checkInId) === "l-b1-2");
		expect(t2?.mentionNguoiCapNhat).toBeNull();
	});
});
