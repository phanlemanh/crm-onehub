import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import {
	LOAI_CAM_XUC,
	type TomTatCamXuc,
	tomTatCamXuc,
} from "@crm/validation/okr-cam-xuc";
import { OKR } from "../src/okr/okr-config";
import { OKR_CAM_XUC } from "../src/okr/okr-xem.config";
import { keoDaiPhien, luc, sangPha } from "./okr-khep-san";
import {
	type AiHoacCookie,
	CHUONG_TRINH_RONG,
	dangChay,
	dungSan,
	goi,
	ma,
	nguoiMoi,
	ok,
	phien,
	phienCua,
	taoNam,
	taoQuy,
} from "./okr-san";

dungSan();

type Lan = { objectiveId: string; krId: string; lanId: string };

async function taoKy(ten: string): Promise<string> {
	const ky = await taoQuy(
		ten,
		await taoNam(`${ten}-nam`, 2026),
		"2026-10-01",
		"2026-12-31",
	);
	await dangChay(ky);
	return ky;
}

async function gieoLan(
	cycleId: string,
	tuy: { gioiHan?: boolean } = {},
): Promise<Lan> {
	const objectiveId = ok<{ id: string }>(
		await goi("okr.createObjective", {
			cycleId,
			unit: { level: "onehub" },
			title: ma("muc tieu cam xuc"),
			kind: "cam-ket",
			ownerUserId: phien.quan.nguoi,
			participantIds: [],
			whyNow: "",
			hienThi: tuy.gioiHan ? "gioi-han" : "cong-khai",
		}),
		"muc tieu",
	).id;
	const krId = ok<{ id: string }>(
		await goi("okr.createKeyResult", {
			objectiveId,
			title: ma("kr cam xuc"),
			kind: "tang-toi",
			ownerUserId: phien.quan.nguoi,
			startValue: 0,
			targetValue: 100,
			currentValue: 0,
			unit: "",
			dueOn: null,
			weight: 1,
		}),
		"kr",
	).id;
	ok(await goi("okr.publishObjective", { id: objectiveId }), "cong bo");
	return { objectiveId, krId, lanId: await guiLan(krId) };
}

async function guiLan(keyResultId: string): Promise<string> {
	const { sessionId } = ok<{ sessionId: string }>(
		await goi("okr.moCapNhat", { entry: "sheet" }),
		"mo phien",
	);
	ok(
		await goi("okr.guiCapNhat", {
			sessionId,
			items: [{ keyResultId, value: 10, confidence: "vua", note: "" }],
		}),
		"gui lan",
	);
	const dong = await db.okrCheckIn.findFirstOrThrow({
		where: { sessionId },
		select: { id: true },
	});
	return dong.id;
}

async function tha(
	checkInId: string,
	loai: string,
	ai: AiHoacCookie = "quan",
): Promise<TomTatCamXuc> {
	return tomTatCamXuc.parse(
		ok(await goi("okr.thaCamXuc", { checkInId, loai }, ai), `tha ${loai}`),
	);
}

const dem = (where: { checkInId: string; userId?: string; loai?: string }) =>
	db.okrCamXuc.count({ where });

const ten = async (userId: string) =>
	(await db.user.findUniqueOrThrow({ where: { id: userId } })).name;

let ky: string;

beforeAll(async () => {
	luc("2026-10-20T03:00:00Z");
	await keoDaiPhien();
	ok(await goi("okr.setProgram", CHUONG_TRINH_RONG), "cau hinh");
	ky = await taoKy("cx-chinh");
});

describe("cx-tha", () => {
	let L1: Lan;
	beforeAll(async () => {
		L1 = await gieoLan(ky);
	});

	test("tha dong-y ghi dung mot hang, mot dong vet, tra tom tat", async () => {
		expect(await dem({ checkInId: L1.lanId })).toBe(0);
		luc("2026-10-20T04:00:00Z");
		const tom = await tha(L1.lanId, "dong-y", "quan");
		expect(
			await dem({
				checkInId: L1.lanId,
				userId: phien.quan.nguoi,
				loai: "dong-y",
			}),
		).toBe(1);
		const vet = await db.okrTrail.findMany({
			where: { objectiveId: L1.objectiveId, action: "tha-cam-xuc" },
		});
		expect(vet.length, "(b) thieu vet tha-cam-xuc").toBe(1);
		expect(vet[0]?.after).toEqual({ checkInId: L1.lanId, loai: "dong-y" });
		expect(tom).toEqual([
			{
				loai: "dong-y",
				so: 1,
				cuaToi: true,
				nguoi: [{ id: phien.quan.nguoi, name: await ten(phien.quan.nguoi) }],
			},
		]);
	});

	test("ba nguoi: tom tat theo thu tu LOAI_CAM_XUC, nguoi cu truoc", async () => {
		luc("2026-10-20T04:05:00Z");
		await tha(L1.lanId, "dong-y", "thuong");
		luc("2026-10-20T04:10:00Z");
		await tha(L1.lanId, "co-len", "okr");
		luc("2026-10-20T04:15:00Z");
		const tom = await tha(L1.lanId, "da-xem", "quan");
		await tha(L1.lanId, "da-xem", "quan");
		const thuTu = LOAI_CAM_XUC.filter((l) => l === "dong-y" || l === "co-len");
		expect(
			tom.map((m) => m.loai).filter((l) => l !== "da-xem"),
			"thu tu loai lech LOAI_CAM_XUC",
		).toEqual([...thuTu]);
		const sau = await tha(L1.lanId, "chuc-mung", "thuong");
		await tha(L1.lanId, "chuc-mung", "thuong");
		expect(sau.find((m) => m.loai === "dong-y")).toEqual({
			loai: "dong-y",
			so: 2,
			cuaToi: true,
			nguoi: [
				{ id: phien.quan.nguoi, name: await ten(phien.quan.nguoi) },
				{ id: phien.thuong.nguoi, name: await ten(phien.thuong.nguoi) },
			],
		});
		expect(sau.find((m) => m.loai === "co-len")).toEqual({
			loai: "co-len",
			so: 1,
			cuaToi: false,
			nguoi: [{ id: phien.okr.nguoi, name: await ten(phien.okr.nguoi) }],
		});
	});

	test("ten cat o tenToiDa, so dem du", async () => {
		const L = await gieoLan(ky);
		const them = OKR_CAM_XUC.tenToiDa + 2;
		for (let i = 0; i < them; i++) {
			luc(`2026-10-20T05:${String(10 + i).padStart(2, "0")}:00Z`);
			const nguoi = await nguoiMoi(`cx-nhieu-${i}`);
			await tha(L.lanId, "chuc-mung", await phienCua(nguoi));
		}
		const tom = await tha(L.lanId, "da-xem", "quan");
		const cm = tom.find((m) => m.loai === "chuc-mung");
		expect(cm?.so).toBe(them);
		expect(cm?.nguoi.length).toBe(OKR_CAM_XUC.tenToiDa);
	});

	test("nguoi da tha roi workspace: ten van con trong tom tat", async () => {
		const L = await gieoLan(ky);
		const x = await nguoiMoi("cx-roi");
		await tha(L.lanId, "dong-y", await phienCua(x));
		await db.member.deleteMany({ where: { userId: x } });
		const tom = await tha(L.lanId, "co-len", "quan");
		expect(tom.find((m) => m.loai === "dong-y")).toEqual({
			loai: "dong-y",
			so: 1,
			cuaToi: false,
			nguoi: [{ id: x, name: await ten(x) }],
		});
	});
});

describe("cx-dao", () => {
	let L: Lan;
	beforeAll(async () => {
		L = await gieoLan(ky);
	});

	test("tha lai cung loai thi go, vet go-cam-xuc, tom tat rong", async () => {
		await tha(L.lanId, "dong-y");
		expect(await dem({ checkInId: L.lanId })).toBe(1);
		const tom = await tha(L.lanId, "dong-y");
		expect(await dem({ checkInId: L.lanId })).toBe(0);
		expect(tom).toEqual([]);
		const vet = await db.okrTrail.findMany({
			where: { objectiveId: L.objectiveId, action: "go-cam-xuc" },
		});
		expect(vet.length).toBe(1);
		expect(vet[0]?.before).toEqual({ checkInId: L.lanId, loai: "dong-y" });
	});

	test("go mot loai khong dung loai khac", async () => {
		await tha(L.lanId, "dong-y");
		await tha(L.lanId, "da-xem");
		expect(
			await dem({ checkInId: L.lanId }),
			"go dong-y xoa luon da-xem",
		).toBe(2);
		const tom = await tha(L.lanId, "dong-y");
		expect(
			tom.map((m) => m.loai),
			"go dong-y xoa luon da-xem",
		).toEqual(["da-xem"]);
		await tha(L.lanId, "da-xem");
	});

	test("hai lan cham dong thoi: toi da mot hang, khong loi ra ngoai", async () => {
		for (let i = 0; i < 20; i++) {
			await db.okrCamXuc.deleteMany({ where: { checkInId: L.lanId } });
			const [a, b] = await Promise.all([
				goi("okr.thaCamXuc", { checkInId: L.lanId, loai: "chuc-mung" }),
				goi("okr.thaCamXuc", { checkInId: L.lanId, loai: "chuc-mung" }),
			]);
			expect([a.status, b.status], `lan ${i}`).toEqual([200, 200]);
			tomTatCamXuc.parse(a.data);
			tomTatCamXuc.parse(b.data);
			expect(
				await dem({ checkInId: L.lanId }),
				`lan ${i}: 2 hang`,
			).toBeLessThan(2);
		}
	});

	test("doi chung: rang buoc unique co that", async () => {
		await db.okrCamXuc.deleteMany({ where: { checkInId: L.lanId } });
		const hang = {
			checkInId: L.lanId,
			userId: phien.quan.nguoi,
			loai: "dong-y",
		};
		await db.okrCamXuc.create({ data: hang });
		let ma = "";
		try {
			await db.okrCamXuc.create({ data: hang });
		} catch (loi) {
			ma = (loi as { code?: string }).code ?? "";
		}
		expect(ma).toBe("P2002");
	});
});

describe("cx-quyen", () => {
	let G: Lan;
	let M: Lan;
	let H: string;
	beforeAll(async () => {
		G = await gieoLan(ky, { gioiHan: true });
		M = await gieoLan(ky);
		await tha(G.lanId, "dong-y", "quan");
		H = await phienCua(phien.thuong.nguoi);
	});

	beforeEach(async () => {
		await keoDaiPhien();
	});

	test("nguoi xem hep tha tren OKR gioi han: cung cau nhu id khong ton tai", async () => {
		const truoc = await dem({ checkInId: G.lanId });
		const tra = await goi(
			"okr.thaCamXuc",
			{ checkInId: G.lanId, loai: "co-len" },
			H,
		);
		const khong = await goi(
			"okr.thaCamXuc",
			{ checkInId: "khong-ton-tai", loai: "co-len" },
			H,
		);
		expect(tra.status, "H tha duoc tren Lg").toBe(404);
		expect(tra.loi).toBe(OKR.thongDiep.khongThayMucTieu);
		expect(khong.status).toBe(404);
		expect(khong.loi).toBe(tra.loi);
		expect(await dem({ checkInId: G.lanId })).toBe(truoc);
	});

	test("doi chung duong: H tha tren muc tieu mo, quan tri thay H", async () => {
		await tha(M.lanId, "da-xem", H);
		const tom = await tha(M.lanId, "dong-y", "quan");
		expect(
			tom.find((m) => m.loai === "da-xem")?.nguoi.map((n) => n.id),
		).toEqual([phien.thuong.nguoi]);
	});

	test("vai chi OKR tha duoc tren muc tieu mo", async () => {
		const tom = await tha(M.lanId, "chuc-mung", "okr");
		expect(tom.find((m) => m.loai === "chuc-mung")?.cuaToi).toBe(true);
	});

	test("muc tieu da bo trong chu ky dang chay: van tha duoc", async () => {
		const B = await gieoLan(ky);
		ok(await goi("okr.dropObjective", { id: B.objectiveId }), "bo");
		const tom = await tha(B.lanId, "co-len", "quan");
		expect(tom.map((m) => m.loai)).toEqual(["co-len"]);
	});

	test("chu ky da an: tu choi, khong hang", async () => {
		const kyAn = await taoKy("cx-an");
		const A = await gieoLan(kyAn);
		ok(await goi("okr.anChuKy", { id: kyAn, lyDo: "Chu kỳ thử ẩn" }), "an");
		const tra = await goi("okr.thaCamXuc", {
			checkInId: A.lanId,
			loai: "dong-y",
		});
		expect(tra.status).toBe(400);
		expect(tra.loi).toBe(OKR.thongDiep.chuKy.kyDaAn);
		expect(await dem({ checkInId: A.lanId })).toBe(0);
	});

	test("cham diem va da dong: tha duoc, cap nhat KR thi bi khoa", async () => {
		const kyPha = await taoKy("cx-pha");
		const P = await gieoLan(kyPha);
		ok(await sangPha(kyPha, "cham-diem"), "cham diem");
		await keoDaiPhien();
		luc("2026-10-20T06:00:00Z");
		const { sessionId } = ok<{ sessionId: string }>(
			await goi("okr.moCapNhat", { entry: "sheet" }),
			"mo phien",
		);
		const khoa = await goi("okr.guiCapNhat", {
			sessionId,
			items: [{ keyResultId: P.krId, value: 20, confidence: "vua", note: "" }],
		});
		expect(khoa.status, "doi chung: cap nhat KR trong ky cham diem").not.toBe(
			200,
		);
		expect((await tha(P.lanId, "dong-y")).map((m) => m.loai)).toEqual([
			"dong-y",
		]);
		ok(await sangPha(kyPha, "da-dong"), "da dong");
		await keoDaiPhien();
		luc("2026-10-20T06:00:00Z");
		expect((await tha(P.lanId, "da-xem")).map((m) => m.loai)).toEqual([
			"dong-y",
			"da-xem",
		]);
	});
});
