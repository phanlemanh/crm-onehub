import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { NHAC, type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import {
	DAY_MS,
	donDep,
	gieoKeHoach,
	gieoNguoi,
	moXuong,
	phan,
	vaoXuong,
} from "./support/nhac-gieo";

const LUC_NHAC = new Date("2026-10-10T02:00:00Z");

const HOM_QUA = -1;

const HAN_XA = NHAC.moc[2];

type KetQua = Map<string, ViecNhac[]>;

function tap(kq: KetQua, userId: string): string[] {
	return (kq.get(userId) ?? [])
		.map((m) => `${m.loai}:${m.stepId ?? m.planId}`)
		.sort();
}

function mucCua(
	kq: KetQua,
	userId: string,
	loai: ViecNhac["loai"],
	planId: string,
): ViecNhac | undefined {
	return (kq.get(userId) ?? []).find(
		(m) => m.loai === loai && m.planId === planId,
	);
}

function ngayTu(soNgay: number): Date {
	return new Date(LUC_NHAC.getTime() + soNgay * DAY_MS);
}

async function tinhLucNhac(): Promise<KetQua> {
	setSystemTime(LUC_NHAC);
	return viecCanNhac(db, { now: new Date() });
}

afterEach(() => {
	setSystemTime();
});

async function gieoAc1() {
	await moXuong();
	const A = await gieoNguoi("An");
	const O = await gieoNguoi("Oanh");
	const W = await gieoNguoi("Vy");
	const R = await gieoNguoi("Roi", false);
	const p1 = await gieoKeHoach({
		camTrich: O.id,
		batDau: new Date("2026-09-27T00:00:00+07:00"),
		theoDoi: [W.id],
		imTu: ngayTu(-8),
		buoc: [
			{ nhan: "B1", giao: A.id, han: new Date("2026-10-09T00:00:00Z") },
			{ nhan: "B2", giao: A.id, han: new Date("2026-10-12T00:00:00Z") },
			{ nhan: "B3", giao: A.id, han: new Date("2026-10-20T00:00:00Z") },
			{
				nhan: "B4",
				giao: A.id,
				xong: true,
				han: new Date("2026-10-05T00:00:00Z"),
			},
			{ nhan: "B5", han: new Date("2026-10-25T00:00:00Z") },
		],
	});
	const p2 = await gieoKeHoach({
		camTrich: O.id,
		batDau: new Date("2026-09-20T00:00:00+07:00"),
		dong: true,
		imTu: ngayTu(-8),
		buoc: [{ nhan: "P2B1", giao: A.id, han: new Date("2026-10-01T00:00:00Z") }],
	});
	const p3 = await gieoKeHoach({
		camTrich: R.id,
		batDau: new Date("2026-09-15T00:00:00+07:00"),
		imTu: ngayTu(-9),
		buoc: [{ nhan: "P3B1", han: new Date("2026-10-30T00:00:00Z") }],
	});
	return {
		A,
		O,
		W,
		R,
		P1: p1.plan,
		P2: p2.plan,
		P3: p3.plan,
		B1: phan(p1.buoc, 0),
		B2: phan(p1.buoc, 1),
		B3: phan(p1.buoc, 2),
		B4: phan(p1.buoc, 3),
		B5: phan(p1.buoc, 4),
		P2B1: phan(p2.buoc, 0),
	};
}

describe("dung-nguoi", () => {
	let g: Awaited<ReturnType<typeof gieoAc1>>;

	beforeAll(async () => {
		await donDep();
		g = await gieoAc1();
	});

	afterAll(donDep);

	test("dung-nguoi: A nhan dung qua han B1 va sap han B2", async () => {
		const kq = await tinhLucNhac();
		expect(tap(kq, g.A.id), "A").toEqual(
			[`buoc-qua-han:${g.B1.id}`, `buoc-sap-han:${g.B2.id}`].sort(),
		);
	});

	test("dung-nguoi: O nhan dung im va moc cua P1", async () => {
		const kq = await tinhLucNhac();
		expect(tap(kq, g.O.id), "O").toEqual(
			[`ke-hoach-im:${g.P1.id}`, `moc-ngay:${g.P1.id}`].sort(),
		);
	});

	test("dung-nguoi: W nhan dung im va moc cua P1", async () => {
		const kq = await tinhLucNhac();
		expect(tap(kq, g.W.id), "W").toEqual(
			[`ke-hoach-im:${g.P1.id}`, `moc-ngay:${g.P1.id}`].sort(),
		);
	});

	test("dung-nguoi: khong ai nhan gi ve B3, B4, B5, P2", async () => {
		const kq = await tinhLucNhac();
		const cam = [g.B3.id, g.B4.id, g.B5.id, g.P2.id, g.P2B1.id];
		const moiMa = [...kq.values()]
			.flat()
			.flatMap((m) => [m.planId, m.stepId ?? ""]);
		expect(
			moiMa.filter((x) => cam.includes(x)),
			"khong ai nhan gi ve P2",
		).toEqual([]);
	});

	test("dung-nguoi: R da roi xuong khong co trong ket qua", async () => {
		const kq = await tinhLucNhac();
		expect(kq.has(g.R.id), "R da roi xuong khong nhan").toBe(false);
	});

	test("dung-nguoi: doi chung, R tro lai xuong thi nhan im cua P3", async () => {
		await vaoXuong(g.R.id);
		const kq = await tinhLucNhac();
		expect(tap(kq, g.R.id), "doi chung duong: R tro lai thi nhan P3").toContain(
			`ke-hoach-im:${g.P3.id}`,
		);
	});
});

async function gieoBien() {
	await moXuong();
	const N = await gieoNguoi("Nam");
	const H = await gieoNguoi("Hoa");
	const imDu = ngayTu(-NHAC.imSauNgay);
	const moc = NHAC.moc[1];
	const batDauXa = ngayTu(-HAN_XA);
	const sapHan = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		buoc: [
			{ nhan: "Trong", giao: N.id, han: ngayTu(NHAC.sapHanNgay) },
			{ nhan: "Ngoai", giao: N.id, han: ngayTu(NHAC.sapHanNgay + 1) },
		],
	});
	const imThieu = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		imTu: ngayTu(-(NHAC.imSauNgay - 1)),
		buoc: [{ nhan: "Im thieu", giao: N.id, han: ngayTu(HAN_XA) }],
	});
	const imDung = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		imTu: imDu,
		buoc: [{ nhan: "Im dung", giao: N.id, han: ngayTu(HAN_XA) }],
	});
	const mocTruoc = await gieoKeHoach({
		camTrich: N.id,
		batDau: ngayTu(-(moc - 2)),
		buoc: [{ nhan: "Moc truoc", giao: N.id, han: ngayTu(HAN_XA) }],
	});
	const mocDung = await gieoKeHoach({
		camTrich: N.id,
		batDau: ngayTu(-(moc - 1)),
		buoc: [{ nhan: "Moc dung", giao: N.id, han: ngayTu(HAN_XA) }],
	});
	const mocSau = await gieoKeHoach({
		camTrich: N.id,
		batDau: ngayTu(-moc),
		buoc: [{ nhan: "Moc sau", giao: N.id, han: ngayTu(HAN_XA) }],
	});
	const chuaGiao = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		imTu: imDu,
		buoc: [
			{ nhan: "Tre", giao: H.id, han: ngayTu(HOM_QUA) },
			{ nhan: "Chua ai", han: ngayTu(NHAC.sapHanNgay + 1) },
		],
	});
	const quaHan = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		imTu: imDu,
		buoc: [
			{ nhan: "Tre", giao: H.id, han: ngayTu(HOM_QUA) },
			{ nhan: "Sau", giao: H.id, han: ngayTu(NHAC.sapHanNgay + 1) },
		],
	});
	const buocKe = await gieoKeHoach({
		camTrich: N.id,
		batDau: batDauXa,
		imTu: imDu,
		buoc: [
			{ nhan: "Ke", giao: H.id, han: ngayTu(NHAC.sapHanNgay + 1) },
			{ nhan: "Sau nua", giao: H.id, han: ngayTu(HAN_XA) },
		],
	});
	return {
		N,
		trongSapHan: phan(sapHan.buoc, 0),
		ngoaiSapHan: phan(sapHan.buoc, 1),
		imThieu: imThieu.plan,
		imDung: imDung.plan,
		mocTruoc: mocTruoc.plan,
		mocDung: mocDung.plan,
		mocSau: mocSau.plan,
		chuaGiao: chuaGiao.plan,
		quaHan: quaHan.plan,
		buocKe: buocKe.plan,
	};
}

describe("bien-nguong", () => {
	let g: Awaited<ReturnType<typeof gieoBien>>;

	beforeAll(async () => {
		await donDep();
		g = await gieoBien();
	});

	afterAll(donDep);

	test("bien-nguong: han trong sapHanNgay la sap han, ngay ke tiep thi khong", async () => {
		const kq = await tinhLucNhac();
		expect(tap(kq, g.N.id), "han dung sapHanNgay la buoc-sap-han").toContain(
			`buoc-sap-han:${g.trongSapHan.id}`,
		);
		expect(
			tap(kq, g.N.id),
			"han sapHanNgay + 1 khong phai buoc-sap-han",
		).not.toContain(`buoc-sap-han:${g.ngoaiSapHan.id}`);
	});

	test("bien-nguong: im imSauNgay - 1 khong, im dung imSauNgay thi co", async () => {
		const kq = await tinhLucNhac();
		expect(
			tap(kq, g.N.id),
			"im imSauNgay - 1 khong phai ke-hoach-im",
		).not.toContain(`ke-hoach-im:${g.imThieu.id}`);
		expect(tap(kq, g.N.id), "im dung imSauNgay la ke-hoach-im").toContain(
			`ke-hoach-im:${g.imDung.id}`,
		);
	});

	test("bien-nguong: ngay thu 13 va 15 khong moc, 14 thi co", async () => {
		const kq = await tinhLucNhac();
		expect(tap(kq, g.N.id), "ngay truoc moc khong co moc-ngay").not.toContain(
			`moc-ngay:${g.mocTruoc.id}`,
		);
		expect(tap(kq, g.N.id), "ngay dung moc la moc-ngay").toContain(
			`moc-ngay:${g.mocDung.id}`,
		);
		expect(tap(kq, g.N.id), "ngay sau moc khong co moc-ngay").not.toContain(
			`moc-ngay:${g.mocSau.id}`,
		);
	});

	test("bien-nguong: goi y con buoc chua giao thi Giao bước", async () => {
		const kq = await tinhLucNhac();
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.chuaGiao.id)?.goiY ?? "",
			"con buoc chua giao thi Giao bước",
		).toStartWith("Giao bước");
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.quaHan.id)?.goiY ?? "",
			"khong con buoc chua giao thi khong Giao bước",
		).not.toStartWith("Giao bước");
	});

	test("bien-nguong: goi y khong con buoc chua giao, co buoc qua han thi quá hạn", async () => {
		const kq = await tinhLucNhac();
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.quaHan.id)?.goiY ?? "",
			"co buoc qua han thi goi y quá hạn",
		).toContain("quá hạn");
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.buocKe.id)?.goiY ?? "",
			"khong buoc qua han thi goi y khong quá hạn",
		).not.toContain("quá hạn");
	});

	test("bien-nguong: goi y con lai thi Bước kế", async () => {
		const kq = await tinhLucNhac();
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.buocKe.id)?.goiY ?? "",
			"con lai thi Bước kế",
		).toStartWith("Bước kế");
		expect(
			mucCua(kq, g.N.id, "ke-hoach-im", g.chuaGiao.id)?.goiY ?? "",
			"con buoc chua giao thi khong Bước kế",
		).not.toStartWith("Bước kế");
	});
});

async function gieoNuaDem() {
	await moXuong();
	const E = await gieoNguoi("Em");
	const k = await gieoKeHoach({
		camTrich: E.id,
		batDau: new Date("2026-09-27T00:00:00+07:00"),
		buoc: [
			{ nhan: "Han 10", giao: E.id, han: new Date("2026-10-10T00:00:00Z") },
		],
	});
	return { E, plan: k.plan, buoc: phan(k.buoc, 0) };
}

describe("nua-dem", () => {
	let g: Awaited<ReturnType<typeof gieoNuaDem>>;

	beforeAll(async () => {
		await donDep();
		g = await gieoNuaDem();
	});

	afterAll(donDep);

	test("nua-dem: 00:30 VN ngay 11 thi buoc qua han va ke hoach sang ngay thu 15", async () => {
		setSystemTime(new Date("2026-10-10T17:30:00Z"));
		const kq = await viecCanNhac(db, { now: new Date() });
		expect(tap(kq, g.E.id), "00:30 VN ngay 11 thi da qua han").toContain(
			`buoc-qua-han:${g.buoc.id}`,
		);
		expect(
			mucCua(kq, g.E.id, "moc-ngay", g.plan.id),
			"00:30 VN ngay 11 thi ke hoach ngay thu 15, khong moc",
		).toBeUndefined();
	});

	test("nua-dem: 23:30 VN ngay 10 thi buoc chua qua han va ke hoach ngay thu 14", async () => {
		setSystemTime(new Date("2026-10-10T16:30:00Z"));
		const kq = await viecCanNhac(db, { now: new Date() });
		expect(tap(kq, g.E.id), "23:30 VN ngay 10 thi chua qua han").not.toContain(
			`buoc-qua-han:${g.buoc.id}`,
		);
		expect(
			mucCua(kq, g.E.id, "moc-ngay", g.plan.id)?.soNgay,
			"23:30 VN ngay 10 thi ke hoach ngay thu 14",
		).toBe(NHAC.moc[1]);
	});
});
