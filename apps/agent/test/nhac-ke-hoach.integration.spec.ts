import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { NHAC, type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import {
	DAY_MS,
	donDep,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	phan,
	slackGia,
	TIEN_TO,
	vaoXuong,
	xongBuoc,
} from "./support/nhac-gieo";
import {
	dongCo,
	gieoDuongDo,
	gieoGui,
	gieoKhongKenh,
	gieoMuoiHai,
	gieoQuet,
	HAN_XA,
	HOM_QUA,
	hangCua,
	hangNhac,
	type KyDo,
	lienKetCua,
	lucVN,
	MOT_NGAY,
	MUOI_GIO_SANG,
	NGAY_MAI,
	NGAY_NHAC,
	ngayCach,
	PHUT_MS,
	PHUT_SAU,
	PHUT_TRUOC,
	quet,
	TRUNG_VI,
	tenCongTy,
	trungViIm,
	xongDungHan,
} from "./support/nhac-gui-gieo";

const LUC_NHAC = new Date("2026-10-10T02:00:00Z");

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

describe("quet-mot-lan", () => {
	let g: Awaited<ReturnType<typeof gieoQuet>>;

	beforeAll(async () => {
		await donDep();
		g = await gieoQuet();
	});

	afterAll(donDep);

	test("quet-mot-lan: bon lan quet trong hai ngay, doc lai tu DB", async () => {
		expect(
			await quet(lucVN(NGAY_NHAC, PHUT_TRUOC)),
			"truoc gio nhac khong ghi hang nao",
		).toEqual({ loi: null, so: 0 });

		await quet(lucVN(NGAY_NHAC, PHUT_SAU));
		expect(
			(await hangNhac()).map((h) => h.subject).sort(),
			"sau gio nhac dung mot hang cho A va O, khong cho N",
		).toEqual(
			[chuDeNhac(g.A.id, new Date()), chuDeNhac(g.O.id, new Date())].sort(),
		);

		expect(
			await quet(lucVN(NGAY_NHAC, MUOI_GIO_SANG)),
			"quet lai cung ngay khong them hang",
		).toEqual({ loi: null, so: 2 });

		await quet(lucVN(NGAY_MAI, PHUT_SAU));
		expect(
			(await hangNhac())
				.map((h) => h.subject ?? "")
				.filter((s) => s.endsWith(NGAY_MAI))
				.sort(),
			"ngay moi them dung hai hang mang ngay moi",
		).toEqual(
			[chuDeNhac(g.A.id, new Date()), chuDeNhac(g.O.id, new Date())].sort(),
		);

		const khoa = (await hangNhac()).flatMap((h) =>
			parseNhacPayload(h.payload).muc.flatMap((m) => Object.keys(m)),
		);
		expect(
			[...new Set(khoa)].filter(
				(k) => !["loai", "planId", "stepId"].includes(k),
			),
			"payload chi gom loai, planId, stepId",
		).toEqual([]);
	});

	test("quet-mot-lan: hai luot chong nhau van mot hang moi nguoi", async () => {
		await db.agentTask.deleteMany({
			where: {
				kind: LOAI_VIEC_NHAC,
				subject: { startsWith: `user:${TIEN_TO}` },
			},
		});
		const luc = lucVN(NGAY_NHAC, PHUT_SAU);
		setSystemTime(luc);
		const ket = await Promise.allSettled([lenLichNhac(luc), lenLichNhac(luc)]);
		expect(
			{ trangThai: ket.map((k) => k.status), so: (await hangNhac()).length },
			"hai luot chong nhau van mot hang moi nguoi",
		).toEqual({ trangThai: ["fulfilled", "fulfilled"], so: 2 });
	});
});

describe("gui-slack", () => {
	let g: Awaited<ReturnType<typeof gieoGui>>;
	let slack: ReturnType<typeof slackGia>;
	let ketQua: string;

	beforeAll(async () => {
		await donDep();
		g = await gieoGui();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
		slack = slackGia();
		ketQua = await chayNhac(await hangCua(g.A.id), {
			fetcher: slack.fetcher,
			appUrl: "https://crm.test",
		});
	});

	afterAll(donDep);

	function tin(): string {
		return (
			slack.goi.find((c) => c.url.endsWith("chat.postMessage"))?.body.text ?? ""
		);
	}

	test("gui-slack: mot loi mo hoi thoai toi slackUserId cua A", () => {
		expect(
			slack.goi
				.filter((c) => c.url.endsWith("conversations.open"))
				.map((c) => c.body.users),
			"dung mot conversations.open toi A",
		).toEqual(["U-MN3-A"]);
	});

	test("gui-slack: dung mot tin", () => {
		expect(
			slack.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
			"dung mot chat.postMessage",
		).toBe(1);
	});

	test("gui-slack: Quá hạn truoc Sắp hạn truoc Kế hoạch im", () => {
		const t = tin();
		const viTri = ["Quá hạn", "Sắp hạn", "Kế hoạch im"].map((c) =>
			t.indexOf(c),
		);
		expect(
			viTri.every((v, i) => v >= 0 && (i === 0 || v > (viTri[i - 1] ?? 0))),
			"thu tu Quá hạn, Sắp hạn, Kế hoạch im",
		).toBe(true);
	});

	test("gui-slack: moi dong mo dung ke hoach cua no", async () => {
		const t = tin();
		const moiDong = await Promise.all(
			g.keHoach.map(async (k) => {
				const dong = dongCo(t, `${await tenCongTy(k.id)} ·`);
				return dong.map((d) => lienKetCua(d)?.endsWith(`?record=plan:${k.id}`));
			}),
		);
		expect(moiDong, "dong mo dung ke hoach cua no").toEqual(
			g.keHoach.map(() => [true]),
		);
	});

	test("gui-slack: doc lai hang, da gui bon dong", async () => {
		const hang = await hangCua(g.A.id);
		const daGui = parseNhacPayload(hang.payload).daGui ?? [];
		expect(
			{
				ketQua,
				dong: hang.finishedAt !== null,
				outcome: hang.outcome,
				daGui: daGui.map((m) => m.planId).sort(),
			},
			"hang dong voi da-gui:4 va daGui dung bon dong",
		).toEqual({
			ketQua: "da-gui",
			dong: true,
			outcome: "da-gui:4",
			daGui: g.keHoach.map((k) => k.id).sort(),
		});
	});
});

describe("gui-slack tran", () => {
	let g: Awaited<ReturnType<typeof gieoMuoiHai>>;

	beforeEach(async () => {
		await donDep();
		g = await gieoMuoiHai();
		setSystemTime(g.goc);
		await lenLichNhac(g.goc);
	});

	afterAll(donDep);

	test("gui-slack: 12 viec thi 10 dong va dong con lai", async () => {
		const slack = slackGia();
		await chayNhac(await hangCua(g.A.id), {
			fetcher: slack.fetcher,
			appUrl: "https://crm.test",
		});
		const t =
			slack.goi.find((c) => c.url.endsWith("chat.postMessage"))?.body.text ??
			"";
		const hang = await hangCua(g.A.id);
		expect(
			{
				dong: dongCo(t, "record=plan:").length,
				conLai: t.includes("và 2 việc nữa"),
				daGui: parseNhacPayload(hang.payload).daGui?.length,
			},
			"vuot tran thi cat o tran va daGui chi gom dong da gui",
		).toEqual({ dong: NHAC.tran, conLai: true, daGui: NHAC.tran });
	});

	test("gui-slack: thieu APP_URL thi van gui, khong lien ket", async () => {
		const cu = process.env.APP_URL;
		delete process.env.APP_URL;
		const slack = slackGia();
		const ket = await chayNhac(await hangCua(g.A.id), {
			fetcher: slack.fetcher,
		}).finally(() => {
			if (cu !== undefined) process.env.APP_URL = cu;
		});
		const tinGui = slack.goi.filter((c) => c.url.endsWith("chat.postMessage"));
		const t = tinGui[0]?.body.text ?? "";
		expect(
			{
				soTin: tinGui.length,
				lienKet: t.includes("record="),
				undefined: t.includes("undefined"),
				ket,
				outcome: (await hangCua(g.A.id)).outcome?.startsWith("da-gui"),
			},
			"thieu APP_URL thi khong lien ket",
		).toEqual({
			soTin: 1,
			lienKet: false,
			undefined: false,
			ket: "da-gui",
			outcome: true,
		});
	});
});

describe("khong-kenh", () => {
	let g: Awaited<ReturnType<typeof gieoKhongKenh>>;

	beforeEach(async () => {
		await donDep();
		await db.account.deleteMany({ where: { providerId: "slack" } });
		g = await gieoKhongKenh();
	});

	afterAll(donDep);

	async function chay() {
		const slack = slackGia();
		const ket = await chayNhac(await hangCua(g.A.id), {
			fetcher: slack.fetcher,
		}).catch((e: Error) => `nem: ${e.message}`);
		const hang = await hangCua(g.A.id);
		return {
			ket,
			goi: slack.goi.filter((c) => c.url.endsWith("chat.postMessage")).length,
			dong: hang.finishedAt !== null,
			outcome: hang.outcome,
		};
	}

	test("khong-kenh: xuong chua noi Slack thi khong-slack", async () => {
		await khopSlack(g.A.id, "U-MN3-A");
		expect(await chay(), "chua noi Slack thi khong goi Slack").toEqual({
			ket: "khong-slack",
			goi: 0,
			dong: true,
			outcome: "khong-slack",
		});
	});

	test("khong-kenh: khong SlackMemberMatch thi khong-khop", async () => {
		await noiSlack(g.A.id);
		expect(await chay(), "khong khop thi khong goi Slack").toEqual({
			ket: "khong-khop",
			goi: 0,
			dong: true,
			outcome: "khong-khop",
		});
	});

	test("khong-kenh: het viec tu luc ghi hang thi khong-viec", async () => {
		await noiSlack(g.A.id);
		await khopSlack(g.A.id, "U-MN3-A");
		await xongBuoc(g.buoc.id);
		expect(await chay(), "het viec thi khong goi Slack").toEqual({
			ket: "khong-viec",
			goi: 0,
			dong: true,
			outcome: "khong-viec",
		});
	});

	test("khong-kenh: doi chung, co SlackMemberMatch thi da-gui", async () => {
		await noiSlack(g.A.id);
		await khopSlack(g.A.id, "U-MN3-A");
		const kq = await chay();
		expect(
			{ ket: kq.ket, goi: kq.goi, outcome: kq.outcome },
			"doi chung duong: khop Slack thi gui",
		).toEqual({ ket: "da-gui", goi: 1, outcome: "da-gui:1" });
	});
});

const NGOAI = "ngoai-duong-do";

async function gieoNgoai(gui: Date): Promise<void> {
	const chu = await db.user.findFirstOrThrow({
		where: { id: { startsWith: TIEN_TO } },
	});
	const boPhan = await db.department.create({
		data: { name: NGOAI, position: 0 },
	});
	const congTy = await db.company.create({ data: { name: NGOAI } });
	const plan = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId: chu.id,
			startedAt: ngayCach(gui, -HAN_XA),
			targetDays: HAN_XA,
		},
	});
	const buoc = await db.onboardingStep.create({
		data: {
			planId: plan.id,
			label: NGOAI,
			departmentId: boPhan.id,
			dueAt: ngayCach(gui, MOT_NGAY),
			position: 0,
			updatedAt: ngayCach(gui, -HAN_XA),
		},
	});
	await db.agentTask.create({
		data: {
			kind: LOAI_VIEC_NHAC,
			reason: NGOAI,
			subject: `user:${NGOAI}:${NGAY_NHAC}`,
			dueAt: gui,
			createdAt: gui,
			outcome: "da-gui:1",
			payload: {
				muc: [],
				daGui: [{ loai: "buoc-sap-han", planId: plan.id, stepId: buoc.id }],
			},
		},
	});
}

async function donNgoai(): Promise<void> {
	await db.agentTask.deleteMany({
		where: { subject: { startsWith: `user:${NGOAI}:` } },
	});
	await db.onboardingPlan.deleteMany({ where: { company: { name: NGOAI } } });
	await db.company.deleteMany({ where: { name: NGOAI } });
	await db.department.deleteMany({ where: { name: NGOAI } });
}

describe("duong-do", () => {
	let g: Awaited<ReturnType<typeof gieoDuongDo>>;
	let ky: KyDo;

	beforeAll(async () => {
		await donDep();
		g = await gieoDuongDo();
		setSystemTime(ngayCach(g.gui, HOM_QUA));
		await xongBuoc(g.xongTruoc.id);
		setSystemTime(g.gui);
		await lenLichNhac(g.gui);
		await chayNhac(await hangCua(g.A.id), {
			fetcher: slackGia().fetcher,
			appUrl: "https://crm.test",
		});
		setSystemTime(new Date(g.gui.getTime() + MUOI_GIO_SANG * PHUT_MS));
		await xongBuoc(g.sapXong.id);
		ky = { tu: ngayCach(g.gui, HOM_QUA), den: ngayCach(g.gui, MOT_NGAY) };
		await gieoNgoai(g.gui);
	});

	afterAll(async () => {
		await donNgoai();
		await donDep();
	});

	test("duong-do: trung vi ngay im chi tinh ke hoach dang chay", async () => {
		expect(await trungViIm(g.do_), "trung vi chi tinh ke hoach dang chay").toBe(
			TRUNG_VI,
		);
	});

	test("duong-do: mau chi gom buoc sap han trong daGui", async () => {
		expect(
			await xongDungHan(ky.tu, ky.den),
			"xong dung han 1 tren 2, khong tinh buoc bi cat hay xong truoc gui",
		).toEqual({ dung: 1, mau: 2 });
	});

	test("duong-do: doi chung, xong buoc con lai dung han thi dung = 2", async () => {
		setSystemTime(ngayCach(g.gui, MOT_NGAY));
		await xongBuoc(g.sapChua.id);
		expect(
			await xongDungHan(ky.tu, ky.den),
			"doi chung duong: xong ca hai dung han",
		).toEqual({ dung: 2, mau: 2 });
	});
});
